//
//  QuestGameScreen.swift
//  fitQuest
//
//  Ported from screens/QuestGameScreen.js — thin wrapper around the
//  arm-swing game, tracking duration and submitting the "quest_game"
//  activity with the same backend-unreachable tolerance as the run flow.
//

import SwiftUI

struct QuestGameScreen: View {
    @EnvironmentObject private var router: Router
    @EnvironmentObject private var appState: AppState

    @State private var startedAt = Date()

    var body: some View {
        ArmSwingGameView(
            onExit: { router.pop() },
            onGameOver: { score in
                Task { await finish(score: score) }
            }
        )
        .navigationBarBackButtonHidden(true)
        .onAppear { startedAt = Date() }
    }

    private func finish(score: Int) async {
        let durationS = max(0, Int(Date().timeIntervalSince(startedAt)))
        var xpEarned = 0
        var coinsEarned = 0
        do {
            let activity = try await appState.submitActivity(type: "quest_game", durationS: durationS, score: score)
            xpEarned = activity.xpEarned
            coinsEarned = activity.coinsEarned
        } catch {
            // Backend unreachable — proceed with zeroed rewards rather than blocking the user.
        }
        router.replace(with: .gameOver(score: score, xpEarned: xpEarned, coinsEarned: coinsEarned))
    }
}

#Preview {
    NavigationStack {
        QuestGameScreen()
            .environmentObject(Router())
            .environmentObject(AppState())
    }
}
