//
//  ProfileScreen.swift
//  fitQuest
//
//  Ported from screens/ProfileScreen.js (redesigned version: hero avatar +
//  XP card, stat tiles row, goal/height/weight card). No design/ mockup
//  exists for this screen — it's an original layout using the same tokens
//  as the rest of the app.
//

import SwiftUI

private let goalLabels: [String: String] = [
    "build_muscle": "Build Muscle",
    "lose_weight": "Lose Weight",
    "improve_health": "Improve Health",
]

struct ProfileScreen: View {
    @EnvironmentObject private var appState: AppState

    private var profile: Profile? { appState.profile }
    private var xpForNext: Int { (profile?.level ?? 1) * 100 }
    private var xpProgress: Double {
        guard xpForNext > 0 else { return 0 }
        return min(1, Double(profile?.xp ?? 0) / Double(xpForNext))
    }
    private var goalLabel: String {
        profile?.goal.flatMap { goalLabels[$0] } ?? "—"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                HStack(spacing: Tokens.Spacing.base) {
                    Text("✦").foregroundStyle(Tokens.Colors.primaryContainer)
                    Text("PROFILE").font(.title2.bold())
                    Text("✦").foregroundStyle(Tokens.Colors.primaryContainer)
                }
                .padding(.top, Tokens.Spacing.sm)

                heroCard
                statTiles
                goalAndStatsCard

                Button {
                    appState.logout()
                } label: {
                    Text("Log out")
                        .font(.headline)
                        .textCase(.uppercase)
                        .foregroundStyle(Tokens.Colors.onErrorContainer)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Tokens.Spacing.sm)
                }
                .buttonStyle(.chibi(fill: Tokens.Colors.errorContainer))
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
    }

    private var heroCard: some View {
        ChibiSurface {
            VStack(spacing: Tokens.Spacing.base) {
                AvatarCanvasView(selection: avatarSelection(from: profile))
                    .frame(width: 128, height: 208)

                Text(profile?.displayName ?? "Hero")
                    .font(.title3.bold())
                    .lineLimit(1)

                Text("LEVEL \(profile?.level ?? 1)")
                    .font(.system(size: 11, weight: .bold))
                    .padding(.horizontal, Tokens.Spacing.sm)
                    .padding(.vertical, 4)
                    .background(Tokens.Colors.secondaryContainer)
                    .foregroundStyle(Tokens.Colors.onSecondaryContainer)
                    .clipShape(Capsule())
                    .overlay(Capsule().stroke(Tokens.Colors.ink, lineWidth: 3))

                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("XP PROGRESS").font(.system(size: 11, weight: .bold)).foregroundStyle(Tokens.Colors.onSurfaceVariant)
                        Spacer()
                        Text("\(profile?.xp ?? 0) / \(xpForNext)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(Tokens.Colors.primary)
                    }
                    GeometryReader { proxy in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Tokens.Colors.surfaceContainerHigh)
                            Capsule().fill(Tokens.Colors.primaryContainer)
                                .frame(width: proxy.size.width * xpProgress)
                        }
                    }
                    .frame(height: 12)
                    .overlay(Capsule().stroke(Tokens.Colors.ink, lineWidth: 2))
                }
                .frame(maxWidth: .infinity)
            }
            .padding(Tokens.Spacing.md)
        }
    }

    private var statTiles: some View {
        HStack(spacing: Tokens.Spacing.sm) {
            statTile(icon: "star.fill", label: "Total XP", value: "\(profile?.totalXp ?? 0)")
            statTile(icon: "dollarsign.circle.fill", label: "Coins", value: "\(profile?.coins ?? 0)")
            statTile(icon: "diamond.fill", label: "Gems", value: "\(profile?.gems ?? 0)")
        }
    }

    private func statTile(icon: String, label: String, value: String) -> some View {
        ChibiSurface {
            VStack(spacing: 4) {
                Image(systemName: icon).foregroundStyle(Tokens.Colors.primary)
                Text(value).font(.headline).lineLimit(1)
                Text(label.uppercased())
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(Tokens.Spacing.sm)
        }
    }

    private var goalAndStatsCard: some View {
        ChibiSurface {
            VStack(alignment: .leading, spacing: Tokens.Spacing.base) {
                HStack(spacing: 4) {
                    Image(systemName: "flag.fill").foregroundStyle(Tokens.Colors.primaryContainer)
                    Text("CURRENT GOAL")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                }
                Text(goalLabel.uppercased())
                    .font(.title3.bold())

                HStack(spacing: Tokens.Spacing.sm) {
                    bodyStat(icon: "figure.arms.open", label: "Height", value: profile?.heightCm.map { "\(Int($0)) cm" } ?? "—")
                    bodyStat(icon: "scalemass.fill", label: "Weight", value: profile?.weightKg.map { "\(Int($0)) kg" } ?? "—")
                }
            }
            .padding(Tokens.Spacing.md)
        }
    }

    private func bodyStat(icon: String, label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: icon).font(.caption).foregroundStyle(Tokens.Colors.primaryContainer)
                Text(label.uppercased()).font(.system(size: 10, weight: .bold)).foregroundStyle(Tokens.Colors.onSurfaceVariant)
            }
            Text(value).font(.headline)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

#Preview {
    ProfileScreen()
        .environmentObject(AppState())
}
