//
//  GameOverScreen.swift
//  fitQuest
//
//  Ported from screens/GameOverScreen.js — post-Rank-Match results.
//

import SwiftUI

struct GameOverScreen: View {
    let score: Int
    let xpEarned: Int
    let coinsEarned: Int

    @EnvironmentObject private var router: Router

    var body: some View {
        VStack(spacing: Tokens.Spacing.lg) {
            Spacer()

            HStack(spacing: Tokens.Spacing.sm) {
                Image(systemName: "star.fill").foregroundStyle(Tokens.Colors.secondary)
                ZStack {
                    Text("Game Over").font(.system(size: 30, weight: .bold)).foregroundStyle(Tokens.Colors.ink).offset(x: 3, y: 3)
                    Text("Game Over").font(.system(size: 30, weight: .bold)).foregroundStyle(Tokens.Colors.secondaryContainer)
                }
                Image(systemName: "star.fill").foregroundStyle(Tokens.Colors.secondary)
            }

            ChibiSurface {
                VStack(spacing: 0) {
                    statRow(icon: "star.fill", color: Tokens.Colors.onTertiaryContainer, label: "Score", value: "\(score) pts")
                    dashedDivider
                    statRow(icon: "bolt.fill", color: Tokens.Colors.primary, label: "XP", value: "+\(xpEarned)")
                    dashedDivider
                    statRow(icon: "dollarsign.circle.fill", color: Tokens.Colors.tertiary, label: "Coins", value: "+\(coinsEarned)")
                }
                .padding(Tokens.Spacing.md)
            }

            Spacer()

            Button {
                router.replace(with: .questGame)
            } label: {
                Text("Play Again")
                    .font(.headline)
                    .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Tokens.Spacing.sm)
            }
            .buttonStyle(.chibi)

            Button {
                router.jumpToRoot(tab: .social)
            } label: {
                Text("View Rank")
                    .font(.headline)
                    .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Tokens.Spacing.sm)
            }
            .buttonStyle(.chibi)
        }
        .padding(Tokens.Spacing.md)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Tokens.Colors.background)
        .navigationBarBackButtonHidden(true)
    }

    private var dashedDivider: some View {
        Rectangle()
            .fill(Tokens.Colors.outlineVariant)
            .frame(height: 1)
    }

    private func statRow(icon: String, color: Color, label: String, value: String) -> some View {
        HStack {
            HStack(spacing: Tokens.Spacing.xs) {
                Image(systemName: icon).foregroundStyle(color)
                Text(label).foregroundStyle(Tokens.Colors.onSurfaceVariant)
            }
            Spacer()
            Text(value).font(.headline)
        }
        .padding(.vertical, Tokens.Spacing.sm)
    }
}

#Preview {
    NavigationStack {
        GameOverScreen(score: 12, xpEarned: 24, coinsEarned: 18)
            .environmentObject(Router())
    }
}
