//
//  ArmSwingDetector.swift
//  fitQuest
//
//  Native replacement for the RN app's WebView+MediaPipe arm-swing
//  pipeline (game/ArmSwingGame.web.js's ArmTracker mode) — Apple's Vision
//  framework runs fully on-device, no WebView/CDN-script bridge needed.
//  Every smoothing/threshold constant is carried over exactly.
//
//  Coordinate note: Vision's normalized point space has its origin at the
//  BOTTOM-LEFT with Y increasing upward — the opposite of the RN version's
//  image-coordinate Y (origin top-left, Y increasing downward). "Raised"
//  there meant wrist-Y *smaller* than shoulder-Y; here it means wrist-Y
//  *larger* than shoulder-Y. The reset condition is flipped the same way.
//

import AVFoundation
import Combine
import CoreGraphics
import Foundation
import Vision

enum CameraAuthStatus {
    case unknown, granted, denied, noCamera
}

private struct PoseJointReading: Sendable {
    let shoulderMidY: CGFloat
    let wristY: CGFloat
}

private enum SwingZone {
    case low, high
}

@MainActor
final class ArmSwingDetector: NSObject, ObservableObject {
    @Published private(set) var authStatus: CameraAuthStatus = .unknown
    @Published private(set) var swingCount = 0

    let session = AVCaptureSession()
    private let videoOutput = AVCaptureVideoDataOutput()
    private let processingQueue = DispatchQueue(label: "com.fitquest.arm-swing-pose")

    // Mutated only from `captureOutput`, which AVFoundation guarantees is
    // called serially on `processingQueue` — safe despite being outside
    // actor isolation.
    nonisolated(unsafe) private var frameCounter = 0
    private nonisolated let analyzeEveryNFrames = 2
    private nonisolated let minVisibility: Float = 0.5

    private var smoothedShoulderY: CGFloat?
    private var smoothedWristY: CGFloat?
    private var armZone: SwingZone = .low
    private var lastSwingAt: Date?

    private let armRaiseMargin: CGFloat = 0.06
    private let swingCooldown: TimeInterval = 0.35

    func checkPermission() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            authStatus = .granted
            configureSessionIfNeeded()
        case .notDetermined:
            authStatus = .unknown
        default:
            authStatus = .denied
        }
    }

    func requestPermission() {
        AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
            Task { @MainActor in
                guard let self else { return }
                if granted {
                    self.authStatus = .granted
                    self.configureSessionIfNeeded()
                } else {
                    self.authStatus = .denied
                }
            }
        }
    }

    private func configureSessionIfNeeded() {
        guard session.inputs.isEmpty else { return }
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front) else {
            authStatus = .noCamera
            return
        }

        session.beginConfiguration()
        session.sessionPreset = .medium

        if let input = try? AVCaptureDeviceInput(device: device), session.canAddInput(input) {
            session.addInput(input)
        }

        videoOutput.setSampleBufferDelegate(self, queue: processingQueue)
        videoOutput.alwaysDiscardsLateVideoFrames = true
        if session.canAddOutput(videoOutput) {
            session.addOutput(videoOutput)
        }

        if let connection = videoOutput.connection(with: .video) {
            if connection.isVideoRotationAngleSupported(90) {
                connection.videoRotationAngle = 90
            }
            if connection.isVideoMirroringSupported {
                connection.isVideoMirrored = true
            }
        }

        session.commitConfiguration()
    }

    func start() {
        guard authStatus == .granted, !session.isRunning else { return }
        let session = session
        processingQueue.async { session.startRunning() }
    }

    func stop() {
        guard session.isRunning else { return }
        let session = session
        processingQueue.async { session.stopRunning() }
    }

    private func applyReading(_ reading: PoseJointReading) {
        if let prevShoulderY = smoothedShoulderY {
            smoothedShoulderY = prevShoulderY * 0.8 + reading.shoulderMidY * 0.2
        } else {
            smoothedShoulderY = reading.shoulderMidY
        }
        if let prevWristY = smoothedWristY {
            smoothedWristY = prevWristY * 0.6 + reading.wristY * 0.4
        } else {
            smoothedWristY = reading.wristY
        }

        guard let shoulderY = smoothedShoulderY, let wristY = smoothedWristY else { return }

        let isRaised = wristY > shoulderY + armRaiseMargin
        let now = Date()
        if armZone == .low, isRaised {
            let cooledDown = lastSwingAt.map { now.timeIntervalSince($0) > swingCooldown } ?? true
            if cooledDown {
                swingCount += 1
                lastSwingAt = now
            }
            armZone = .high
        } else if armZone == .high, wristY < shoulderY {
            armZone = .low
        }
    }
}

extension ArmSwingDetector: AVCaptureVideoDataOutputSampleBufferDelegate {
    nonisolated func captureOutput(
        _ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection
    ) {
        frameCounter += 1
        guard frameCounter % analyzeEveryNFrames == 0 else { return }
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        guard let reading = Self.extractJoints(from: pixelBuffer, minVisibility: minVisibility) else { return }

        Task { @MainActor [weak self] in
            self?.applyReading(reading)
        }
    }

    private nonisolated static func extractJoints(from pixelBuffer: CVPixelBuffer, minVisibility: Float) -> PoseJointReading? {
        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .up, options: [:])
        let request = VNDetectHumanBodyPoseRequest()
        do {
            try handler.perform([request])
            guard let observation = request.results?.first else { return nil }
            let points = try observation.recognizedPoints(.all)

            guard let leftShoulder = points[.leftShoulder], leftShoulder.confidence > minVisibility,
                  let rightShoulder = points[.rightShoulder], rightShoulder.confidence > minVisibility
            else { return nil }
            let shoulderMidY = (leftShoulder.location.y + rightShoulder.location.y) / 2

            // Whichever wrist is visible and higher (larger Y in Vision's
            // bottom-left-origin space) is the one tracked.
            var bestWristY: CGFloat?
            if let left = points[.leftWrist], left.confidence > minVisibility {
                bestWristY = left.location.y
            }
            if let right = points[.rightWrist], right.confidence > minVisibility {
                bestWristY = max(bestWristY ?? right.location.y, right.location.y)
            }
            guard let wristY = bestWristY else { return nil }

            return PoseJointReading(shoulderMidY: shoulderMidY, wristY: wristY)
        } catch {
            return nil
        }
    }
}
