//
//  RunTrackerModel.swift
//  fitQuest
//
//  Ported from game/RunTracker.native.js — CoreLocation replaces
//  expo-location, MapKit replaces react-native-maps. Every filtering
//  constant and the wall-clock-derived elapsed timer are carried over
//  exactly for parity.
//

import Combine
import CoreLocation
import Foundation

enum LocationPermissionStatus {
    case unknown, granted, denied
}

enum RunState {
    case idle, active, paused
}

@MainActor
final class RunTrackerModel: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var permissionStatus: LocationPermissionStatus = .unknown
    @Published var runState: RunState = .idle
    @Published var route: [CLLocationCoordinate2D] = []
    @Published var distanceM: Double = 0
    @Published var elapsedS: Int = 0
    @Published var currentPosition: CLLocationCoordinate2D?
    @Published var signalWeak = false

    private let manager = CLLocationManager()
    private var lastLocation: CLLocation?
    private var startTime: Date?
    private var pausedAccum: TimeInterval = 0
    private var pauseStartedAt: Date?
    private var lastUpdateAt: Date?
    private var elapsedTimer: Timer?
    private var weakSignalTimer: Timer?

    // Ported 1:1 from RunTracker.native.js.
    private let maxAcceptableAccuracyM: Double = 30
    private let maxPlausibleSpeedMps: Double = 12
    private let minMovementM: Double = 1
    private let weakSignalThresholdS: TimeInterval = 8

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
        manager.distanceFilter = 2
        refreshPermissionStatus()
    }

    func refreshPermissionStatus() {
        switch manager.authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            permissionStatus = .granted
        case .denied, .restricted:
            permissionStatus = .denied
        case .notDetermined:
            permissionStatus = .unknown
        @unknown default:
            permissionStatus = .unknown
        }
    }

    func requestPermission() {
        manager.requestWhenInUseAuthorization()
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in self.refreshPermissionStatus() }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        Task { @MainActor in self.handle(location) }
    }

    private func handle(_ location: CLLocation) {
        guard runState == .active else { return }
        lastUpdateAt = Date()
        signalWeak = false

        // Filter 1: reject inaccurate fixes.
        guard location.horizontalAccuracy >= 0, location.horizontalAccuracy <= maxAcceptableAccuracyM else { return }

        if let last = lastLocation {
            let dt = location.timestamp.timeIntervalSince(last.timestamp)
            let dist = location.distance(from: last)
            let speed = location.speed >= 0 ? location.speed : (dt > 0 ? dist / dt : 0)
            // Filter 2: reject implausible speed jumps.
            guard speed <= maxPlausibleSpeedMps else { return }
            // Filter 3: reject GPS jitter under the minimum movement threshold.
            guard dist >= minMovementM else { return }
            distanceM += dist
        }

        lastLocation = location
        currentPosition = location.coordinate
        route.append(location.coordinate)
    }

    func startRun() {
        route = []
        distanceM = 0
        elapsedS = 0
        lastLocation = nil
        pausedAccum = 0
        startTime = Date()
        runState = .active
        manager.startUpdatingLocation()
        startTimers()
    }

    func pauseRun() {
        guard runState == .active else { return }
        runState = .paused
        pauseStartedAt = Date()
        manager.stopUpdatingLocation()
    }

    func resumeRun() {
        guard runState == .paused else { return }
        if let pauseStartedAt {
            pausedAccum += Date().timeIntervalSince(pauseStartedAt)
        }
        pauseStartedAt = nil
        runState = .active
        manager.startUpdatingLocation()
    }

    @discardableResult
    func stopRun() -> (distanceM: Double, elapsedS: Int) {
        manager.stopUpdatingLocation()
        stopTimers()
        runState = .idle
        return (distanceM, elapsedS)
    }

    private func startTimers() {
        lastUpdateAt = Date()
        elapsedTimer?.invalidate()
        elapsedTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.tickElapsed() }
        }
        weakSignalTimer?.invalidate()
        weakSignalTimer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.checkWeakSignal() }
        }
    }

    private func stopTimers() {
        elapsedTimer?.invalidate()
        elapsedTimer = nil
        weakSignalTimer?.invalidate()
        weakSignalTimer = nil
    }

    /// Derived from wall-clock deltas each tick (not a naive +1/tick counter)
    /// so it stays correct through any brief timer throttling; frozen while
    /// paused since this simply skips recomputation until resumed.
    private func tickElapsed() {
        guard let startTime, runState == .active else { return }
        elapsedS = Int(Date().timeIntervalSince(startTime) - pausedAccum)
    }

    private func checkWeakSignal() {
        guard runState == .active, let lastUpdateAt else { return }
        signalWeak = Date().timeIntervalSince(lastUpdateAt) > weakSignalThresholdS
    }
}
