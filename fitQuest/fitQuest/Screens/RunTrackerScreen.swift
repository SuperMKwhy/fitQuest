//
//  RunTrackerScreen.swift
//  fitQuest
//
//  Ported from screens/RunTrackerScreen.js + game/RunTracker.native.js.
//  Submits the finished run with the same backend-unreachable tolerance as
//  the RN version: a failed submit still proceeds to WorkoutSummary with
//  zeroed XP/coins rather than blocking the user.
//

import CoreLocation
import MapKit
import SwiftUI
import UIKit

struct RunTrackerScreen: View {
    @EnvironmentObject private var router: Router
    @EnvironmentObject private var appState: AppState
    @Environment(\.scenePhase) private var scenePhase

    @StateObject private var model = RunTrackerModel()
    @State private var cameraPosition = MapCameraPosition.automatic
    @State private var showExitConfirm = false

    var body: some View {
        Group {
            switch model.permissionStatus {
            case .unknown, .denied:
                permissionScreen
            case .granted:
                if model.runState == .idle {
                    idleScreen
                } else {
                    activeScreen
                }
            }
        }
        .background(Tokens.Colors.background)
        .navigationBarBackButtonHidden(true)
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase != .active, model.runState == .active {
                model.pauseRun()
            }
        }
        .alert("End run?", isPresented: $showExitConfirm) {
            Button("Keep running", role: .cancel) {}
            Button("End run", role: .destructive) {
                _ = model.stopRun()
                router.pop()
            }
        } message: {
            Text("Your current run in progress will be discarded.")
        }
    }

    private func requestExit() {
        if model.runState == .idle {
            router.pop()
        } else {
            showExitConfirm = true
        }
    }

    // MARK: - Permission

    private var permissionScreen: some View {
        let denied = model.permissionStatus == .denied
        return centeredState(
            icon: "location.fill",
            title: "Location access needed",
            message: denied
                ? "Location access was denied. Enable it in Settings to track your run."
                : "We need your location to draw your route on the map and measure distance.",
            primaryLabel: denied ? "Open Settings" : "Allow Location",
            primaryAction: {
                if denied {
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }
                } else {
                    model.requestPermission()
                }
            }
        )
    }

    // MARK: - Idle

    private var idleScreen: some View {
        centeredState(
            icon: "figure.run",
            title: "Ready to run?",
            message: "We'll track your route live on the map and measure your distance, pace, and time.",
            primaryLabel: "Start Run",
            primaryIcon: "play.fill",
            primaryAction: { model.startRun() }
        )
    }

    private func centeredState(
        icon: String, title: String, message: String,
        primaryLabel: String, primaryIcon: String? = nil, primaryAction: @escaping () -> Void
    ) -> some View {
        VStack(spacing: Tokens.Spacing.md) {
            Spacer()
            ZStack {
                Circle().fill(Tokens.Colors.primaryContainer)
                Image(systemName: icon).font(.system(size: 32)).foregroundStyle(Tokens.Colors.onPrimaryContainer)
            }
            .frame(width: 88, height: 88)
            .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 3))

            Text(title).font(.title2.bold()).multilineTextAlignment(.center)
            Text(message)
                .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Tokens.Spacing.lg)

            Button {
                primaryAction()
            } label: {
                HStack {
                    if let primaryIcon { Image(systemName: primaryIcon) }
                    Text(primaryLabel).font(.headline)
                }
                .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                .padding(.horizontal, Tokens.Spacing.lg)
                .padding(.vertical, Tokens.Spacing.sm)
            }
            .buttonStyle(.chibi)

            Button("Back") { requestExit() }
                .foregroundStyle(Tokens.Colors.onSurfaceVariant)
            Spacer()
        }
        .padding(Tokens.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Active / paused

    private var activeScreen: some View {
        ZStack(alignment: .top) {
            Map(position: $cameraPosition) {
                if model.route.count > 1 {
                    MapPolyline(coordinates: model.route)
                        .stroke(Tokens.Colors.primary, lineWidth: 4)
                }
                if let position = model.currentPosition {
                    Annotation("", coordinate: position) {
                        Circle()
                            .fill(Tokens.Colors.primaryContainer)
                            .frame(width: 18, height: 18)
                            .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 3))
                    }
                }
            }
            .ignoresSafeArea(edges: .top)
            .onChange(of: model.route.count) { _, _ in
                guard let position = model.currentPosition else { return }
                withAnimation(.easeInOut(duration: 0.5)) {
                    cameraPosition = .region(MKCoordinateRegion(center: position, latitudinalMeters: 400, longitudinalMeters: 400))
                }
            }

            HStack {
                Spacer()
                Button {
                    requestExit()
                } label: {
                    Image(systemName: "xmark")
                        .frame(width: 36, height: 36)
                        .background(Circle().fill(Tokens.Colors.surfaceContainerLowest.opacity(0.9)))
                        .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 2))
                }
                .padding()
            }

            if model.signalWeak {
                VStack {
                    HStack {
                        HStack(spacing: 4) {
                            Image(systemName: "exclamationmark.triangle.fill")
                            Text("Weak GPS signal").font(.caption.bold())
                        }
                        .padding(.horizontal, Tokens.Spacing.sm)
                        .padding(.vertical, 6)
                        .background(Tokens.Colors.errorContainer)
                        .foregroundStyle(Tokens.Colors.onErrorContainer)
                        .clipShape(Capsule())
                        Spacer()
                    }
                    .padding()
                    Spacer()
                }
            }

            VStack {
                Spacer()
                statsSheet
            }
        }
    }

    private var statsSheet: some View {
        VStack(spacing: Tokens.Spacing.md) {
            HStack(spacing: 0) {
                statBlock(label: "KM", value: String(format: "%.2f", model.distanceM / 1000), icon: "ruler")
                Divider().frame(height: 40)
                statBlock(label: "DURATION", value: RunFormatting.duration(model.elapsedS), icon: "clock")
                Divider().frame(height: 40)
                statBlock(label: "MIN/KM", value: RunFormatting.pace(distanceM: model.distanceM, elapsedS: model.elapsedS), icon: "speedometer")
            }

            HStack(spacing: Tokens.Spacing.sm) {
                Button {
                    if model.runState == .active { model.pauseRun() } else { model.resumeRun() }
                } label: {
                    Image(systemName: model.runState == .active ? "pause.fill" : "play.fill")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Tokens.Spacing.sm)
                }
                .buttonStyle(.chibi(fill: model.runState == .active ? Tokens.Colors.surfaceContainer : Tokens.Colors.primaryContainer))

                Button {
                    finishRun()
                } label: {
                    HStack {
                        Image(systemName: "stop.fill")
                        Text("Stop").font(.headline)
                    }
                    .foregroundStyle(Tokens.Colors.onSecondaryContainer)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Tokens.Spacing.sm)
                }
                .buttonStyle(.chibi(fill: Tokens.Colors.secondaryContainer))
            }
        }
        .padding(Tokens.Spacing.md)
        .background(Tokens.Colors.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.xl))
        .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.xl).stroke(Tokens.Colors.ink, lineWidth: 3))
        .padding(Tokens.Spacing.sm)
    }

    private func statBlock(label: String, value: String, icon: String) -> some View {
        VStack(spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: icon).font(.caption2)
                Text(label).font(.system(size: 10, weight: .bold))
            }
            .foregroundStyle(Tokens.Colors.onSurfaceVariant)
            Text(value).font(.title3.bold())
        }
        .frame(maxWidth: .infinity)
    }

    private func finishRun() {
        let result = model.stopRun()
        Task {
            var xpEarned = 0
            var coinsEarned = 0
            do {
                let activity = try await appState.submitActivity(
                    type: "run", distanceM: result.distanceM, durationS: result.elapsedS
                )
                xpEarned = activity.xpEarned
                coinsEarned = activity.coinsEarned
            } catch {
                // Backend unreachable — proceed with zeroed rewards rather than blocking the user.
            }
            router.replace(with: .workoutSummary(
                distanceM: result.distanceM, elapsedS: result.elapsedS, xpEarned: xpEarned, coinsEarned: coinsEarned
            ))
        }
    }
}

#Preview {
    NavigationStack {
        RunTrackerScreen()
            .environmentObject(Router())
            .environmentObject(AppState())
    }
}
