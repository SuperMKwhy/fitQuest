//
//  ArmSwingGameView.swift
//  fitQuest
//
//  Native replacement for game/ArmSwingGame.js's WebView bridge — real
//  camera preview + on-device Vision pose tracking driving the Flappy
//  Bird overlay. Permission/no-camera copy matches the RN version.
//

import SwiftUI
import UIKit

struct ArmSwingGameView: View {
    let onExit: () -> Void
    let onGameOver: (Int) -> Void

    @StateObject private var detector = ArmSwingDetector()
    @StateObject private var game = FlappyBirdGameModel()

    var body: some View {
        Group {
            switch detector.authStatus {
            case .unknown:
                permissionScreen(denied: false)
            case .denied:
                permissionScreen(denied: true)
            case .noCamera:
                messageScreen(
                    icon: "camera.fill",
                    message: "No front camera found on this device."
                )
            case .granted:
                ZStack {
                    CameraPreviewView(session: detector.session)
                        .ignoresSafeArea()
                    FlappyBirdGameView(model: game, onExit: onExit, onRestart: { game.restart() })
                }
            }
        }
        .onAppear {
            detector.checkPermission()
            game.onGameOver = onGameOver
        }
        .onDisappear { detector.stop() }
        .onChange(of: detector.authStatus) { _, status in
            if status == .granted { detector.start() }
        }
        .onChange(of: detector.swingCount) { _, _ in
            game.flap()
        }
        .background(Color.black)
    }

    private func permissionScreen(denied: Bool) -> some View {
        VStack(spacing: Tokens.Spacing.md) {
            Spacer()
            Image(systemName: "camera.fill")
                .font(.system(size: 32))
                .foregroundStyle(.white)
            Text("Camera access is needed to track your arm swing.")
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Tokens.Spacing.lg)

            Button {
                if denied {
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                } else {
                    detector.requestPermission()
                }
            } label: {
                Text(denied ? "Open Settings" : "Grant Camera Access")
                    .font(.headline)
                    .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                    .padding(.horizontal, Tokens.Spacing.lg)
                    .padding(.vertical, Tokens.Spacing.sm)
            }
            .buttonStyle(.chibi)

            Button("Back", action: onExit)
                .foregroundStyle(.white)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black)
    }

    private func messageScreen(icon: String, message: String) -> some View {
        VStack(spacing: Tokens.Spacing.md) {
            Spacer()
            Image(systemName: icon).font(.system(size: 32)).foregroundStyle(.white)
            Text(message).foregroundStyle(.white).multilineTextAlignment(.center)
            Button("Back", action: onExit).foregroundStyle(.white)
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black)
    }
}
