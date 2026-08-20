//
//  SocialScreen.swift
//  fitQuest
//
//  Ported from screens/SocialScreen.js — real leaderboard (hits
//  GET /leaderboard) plus a "Friends — Coming soon" placeholder, since the
//  backend has no request/accept endpoints yet.
//

import SwiftUI

struct SocialScreen: View {
    @State private var leaderboard: [LeaderboardEntry] = []
    @State private var loading = false

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                Text("Leaderboard")
                    .font(.title2.bold())
                    .frame(maxWidth: .infinity, alignment: .leading)

                if leaderboard.isEmpty && !loading {
                    Text("No one on the board yet — be the first!")
                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Tokens.Spacing.lg)
                } else {
                    ForEach(leaderboard) { entry in
                        leaderboardRow(entry)
                    }
                }

                VStack(alignment: .leading, spacing: Tokens.Spacing.sm) {
                    Text("Friends").font(.headline)
                    ChibiSurface {
                        Text("Coming soon.")
                            .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                            .frame(maxWidth: .infinity)
                            .padding(Tokens.Spacing.md)
                    }
                }
                .padding(.top, Tokens.Spacing.md)
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
        .refreshable { await load() }
        .task { await load() }
    }

    private func leaderboardRow(_ entry: LeaderboardEntry) -> some View {
        let style = rankStyle(entry.rank)
        return ChibiSurface {
            HStack(spacing: Tokens.Spacing.sm) {
                ZStack {
                    RoundedRectangle(cornerRadius: Tokens.Radius.base).fill(style.badgeFill)
                    if entry.rank == 1 {
                        Image(systemName: "trophy.fill").foregroundStyle(Tokens.Colors.onTertiaryContainer)
                    } else {
                        Text("\(entry.rank)").font(.headline)
                    }
                }
                .frame(width: 48, height: 48)
                .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.base).stroke(Tokens.Colors.ink, lineWidth: 3))

                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.displayName).font(.headline)
                    Text("Level \(entry.level)")
                        .font(.caption)
                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                }
                Spacer()
                Text("\(entry.totalXp) XP")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(Tokens.Colors.primary)
            }
            .padding(Tokens.Spacing.sm)
        }
        .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(style.ring, lineWidth: style.ring == .clear ? 0 : 2))
    }

    private struct RankStyle {
        let badgeFill: Color
        let ring: Color
    }

    private func rankStyle(_ rank: Int) -> RankStyle {
        switch rank {
        case 1: return RankStyle(badgeFill: Tokens.Colors.tertiaryContainer, ring: Tokens.Colors.tertiaryContainer)
        case 2: return RankStyle(badgeFill: Tokens.Colors.surfaceContainerHigh, ring: Tokens.Colors.outline)
        case 3: return RankStyle(badgeFill: Tokens.Colors.secondaryContainer, ring: Tokens.Colors.secondaryContainer)
        default: return RankStyle(badgeFill: Tokens.Colors.surfaceContainer, ring: .clear)
        }
    }

    private func load() async {
        loading = true
        defer { loading = false }
        leaderboard = (try? await APIClient.shared.getLeaderboard()) ?? leaderboard
    }
}

#Preview {
    SocialScreen()
}
