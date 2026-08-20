//
//  RouteDestinationView.swift
//  fitQuest
//
//  Central `.navigationDestination(for: Route.self)` switch.
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
            QuestGameScreen()
        case .gameOver(let score, let xpEarned, let coinsEarned):
            GameOverScreen(score: score, xpEarned: xpEarned, coinsEarned: coinsEarned)
        case .aiBuddyChat:
            AIBuddyChatScreen()
        case .moodTracker:
            MoodTrackerScreen()
        case .healthLog:
            HealthLogScreen()
        case .aiFoodScan:
            AIFoodScanScreen()
        }
    }
}
