//
//  QuestHubScreen.swift
//  fitQuest
//
//  Ported from screens/QuestHubScreen.js.
//

import SwiftUI

struct QuestHubScreen: View {
    @EnvironmentObject private var router: Router

    var body: some View {
        VStack(spacing: Tokens.Spacing.base) {
            Text("Quests")
                .font(.title.bold())
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.bottom, Tokens.Spacing.sm)

            Button {
                router.push(.preGameReady(mode: .run))
            } label: {
                VStack(alignment: .leading, spacing: 4) {
                    Text("🗡️ Today's Quest").font(.title3.bold())
                    Text("Track a run with live GPS, distance, and pace")
                        .font(.subheadline)
                }
                .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(Tokens.Spacing.sm)
            }
            .buttonStyle(.chibi)

            Button {
                router.push(.preGameReady(mode: .questGame))
            } label: {
                VStack(alignment: .leading, spacing: 4) {
                    Text("🏆 Rank Match").font(.title3.bold())
                    Text("Arm-swing arcade — compete for XP on the leaderboard")
                        .font(.subheadline)
                }
                .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(Tokens.Spacing.sm)
            }
            .buttonStyle(.chibi)

            Spacer()
        }
        .padding(Tokens.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(Tokens.Colors.background)
    }
}

#Preview {
    QuestHubScreen()
        .environmentObject(Router())
}
