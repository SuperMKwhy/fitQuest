//
//  RouteDestinationView.swift
//  fitQuest
//
//  Central `.navigationDestination(for: Route.self)` switch. Cases not yet
//  built by the current phase show ComingSoonView; later phases replace
//  just their case body with the real screen.
//

import SwiftUI

struct RouteDestinationView: View {
    let route: Route

    var body: some View {
        switch route {
        case .preGameReady(let mode):
            PreGameReadyScreen(mode: mode)
        case .runTracker:
            RunTrackerScreen()
        case .workoutSummary(let distanceM, let elapsedS, let xpEarned, let coinsEarned):
            WorkoutSummaryScreen(distanceM: distanceM, elapsedS: elapsedS, xpEarned: xpEarned, coinsEarned: coinsEarned)
        case .questGame:
            ComingSoonView(title: "Rank Match", phase: "Phase 3")
        case .gameOver:
            ComingSoonView(title: "Game Over", phase: "Phase 3")
        case .aiBuddyChat:
            ComingSoonView(title: "AI Buddy", phase: "Phase 4")
        case .moodTracker:
            ComingSoonView(title: "Mood Tracker", phase: "Phase 4")
        case .healthLog:
            ComingSoonView(title: "Health Log", phase: "Phase 4")
        case .aiFoodScan:
            ComingSoonView(title: "Food Scan", phase: "Phase 4")
        }
    }
}

struct ComingSoonView: View {
    let title: String
    let phase: String

    var body: some View {
        VStack(spacing: Tokens.Spacing.base) {
            Text(title)
                .font(.title2.bold())
            Text("Coming in \(phase)")
                .foregroundStyle(Tokens.Colors.onSurfaceVariant)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Tokens.Colors.background)
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
    }
}
