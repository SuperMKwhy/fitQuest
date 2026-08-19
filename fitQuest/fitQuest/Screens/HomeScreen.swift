//
//  HomeScreen.swift
//  fitQuest
//
//  Ported from screens/HomeScreen.js (redesigned version: hero avatar over
//  a dashboard background, quest cards with a Start pill, decorative
//  Energy meter — there's no stamina mechanic wired up server-side yet).
//

import SwiftUI

struct HomeScreen: View {
    @EnvironmentObject private var appState: AppState
    @EnvironmentObject private var router: Router

    private var profile: Profile? { appState.profile }
    private var xpForNext: Int { (profile?.level ?? 1) * 100 }
    private var xpProgress: Double {
        guard xpForNext > 0 else { return 0 }
        return min(1, Double(profile?.xp ?? 0) / Double(xpForNext))
    }
    private var selection: [AvatarPart: String] { avatarSelection(from: profile) }

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                statusBar
                heroSection
                energyRow

                QuestCard(
                    icon: "list.clipboard.fill", title: "Today's Quest",
                    subtitle: "Complete quests and earn awesome rewards!"
                ) {
                    router.push(.preGameReady(mode: .run))
                }

                QuestCard(
                    icon: "trophy.fill", title: "Rank Match",
                    subtitle: "Compete with players and climb the ranks!"
                ) {
                    router.push(.preGameReady(mode: .questGame))
                }

                HStack(spacing: Tokens.Spacing.sm) {
                    quickLink(icon: "bubble.left.and.bubble.right.fill", label: "AI Buddy") {
                        router.push(.aiBuddyChat)
                    }
                    quickLink(icon: "face.smiling.fill", label: "Mood") {
                        router.push(.moodTracker)
                    }
                    quickLink(icon: "fork.knife.circle.fill", label: "Health Log") {
                        router.push(.healthLog)
                    }
                }
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
    }

    private var statusBar: some View {
        HStack(spacing: Tokens.Spacing.sm) {
            ChibiSurface {
                HStack(spacing: Tokens.Spacing.base) {
                    AvatarCanvasView(selection: selection)
                        .frame(width: 44, height: 44)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 3))

                    VStack(alignment: .leading, spacing: 2) {
                        Text(profile?.displayName ?? "Hero")
                            .font(.headline)
                            .lineLimit(1)
                        Text("LEVEL \(profile?.level ?? 1)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(Tokens.Colors.primaryContainer)

                        GeometryReader { proxy in
                            ZStack(alignment: .leading) {
                                Capsule().fill(Tokens.Colors.surfaceContainerHigh)
                                Capsule().fill(Tokens.Colors.primaryContainer)
                                    .frame(width: proxy.size.width * xpProgress)
                            }
                        }
                        .frame(height: 8)
                        .overlay(Capsule().stroke(Tokens.Colors.ink, lineWidth: 2))
                    }
                }
                .padding(Tokens.Spacing.base)
            }
            .frame(maxWidth: 220)

            currencyPill(icon: "dollarsign.circle.fill", value: profile?.coins ?? 0, color: Tokens.Colors.tertiaryContainer)
            currencyPill(icon: "diamond.fill", value: profile?.gems ?? 0, color: Tokens.Colors.primaryContainer)
        }
    }

    private var heroSection: some View {
        ZStack(alignment: .bottom) {
            Image("Home_DashboardBg")
                .resizable()
                .scaledToFill()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .opacity(0.2)
                .clipped()

            VStack {
                HStack {
                    Text("✦").font(.system(size: 20)).foregroundStyle(Tokens.Colors.tertiaryContainer)
                    Spacer()
                    Text("✦").font(.system(size: 18)).foregroundStyle(Tokens.Colors.primaryContainer)
                }
                HStack {
                    Text("✦").font(.system(size: 16)).foregroundStyle(Tokens.Colors.tertiaryContainer)
                    Spacer()
                    Text("✦").font(.system(size: 18)).foregroundStyle(Tokens.Colors.primaryContainer)
                }
                .padding(.top, Tokens.Spacing.lg)
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(Tokens.Spacing.md)

            VStack {
                HStack {
                    Spacer()
                    dailyRewardBadge
                }
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(Tokens.Spacing.base)

            AvatarCanvasView(selection: selection)
                .frame(width: 160, height: 260)
        }
        .frame(height: 288)
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.xl))
    }

    private var dailyRewardBadge: some View {
        ChibiSurface {
            VStack(spacing: 2) {
                Image(systemName: "gift.fill")
                    .foregroundStyle(Tokens.Colors.tertiaryContainer)
                Text("DAILY\nREWARD")
                    .font(.system(size: 9, weight: .bold))
                    .multilineTextAlignment(.center)
            }
            .padding(Tokens.Spacing.base)
        }
        .overlay(alignment: .topTrailing) {
            Circle()
                .fill(Tokens.Colors.secondary)
                .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 2))
                .overlay(Text("!").font(.system(size: 10, weight: .bold)).foregroundStyle(Tokens.Colors.onSecondary))
                .frame(width: 20, height: 20)
                .offset(x: 6, y: -6)
        }
    }

    /// Decorative — there's no stamina mechanic wired up server-side yet;
    /// this just reads as "ready to play".
    private var energyRow: some View {
        ChibiSurface {
            HStack(spacing: Tokens.Spacing.sm) {
                ZStack {
                    Circle().fill(Tokens.Colors.primaryContainer)
                    Image(systemName: "bolt.fill").foregroundStyle(Tokens.Colors.onPrimaryContainer)
                }
                .frame(width: 40, height: 40)
                .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 3))

                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("ENERGY").font(.system(size: 13, weight: .bold))
                        Spacer()
                        Text("100%").font(.system(size: 11, weight: .bold)).foregroundStyle(Tokens.Colors.primary)
                    }
                    Capsule().fill(Tokens.Colors.primaryContainer)
                        .frame(height: 12)
                        .overlay(Capsule().stroke(Tokens.Colors.ink, lineWidth: 2))
                }
            }
            .padding(Tokens.Spacing.base)
        }
    }

    private func currencyPill(icon: String, value: Int, color: Color) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon).font(.caption).foregroundStyle(color)
            Text("\(value)").font(.system(size: 11, weight: .bold))
        }
        .padding(.horizontal, Tokens.Spacing.sm)
        .padding(.vertical, 6)
        .background(Tokens.Colors.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg))
        .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(Tokens.Colors.ink, lineWidth: 3))
    }

    private func quickLink(icon: String, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            ChibiSurface {
                VStack(spacing: 4) {
                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundStyle(Tokens.Colors.primary)
                    Text(label)
                        .font(.caption2.bold())
                        .foregroundStyle(Tokens.Colors.onBackground)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(Tokens.Spacing.sm)
            }
        }
        .buttonStyle(.plain)
    }
}

/// A quest CTA row: icon badge, title/subtitle, and a "Start" pill with chevron.
private struct QuestCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Tokens.Spacing.sm) {
                ZStack {
                    RoundedRectangle(cornerRadius: Tokens.Radius.lg).fill(Tokens.Colors.surfaceContainerLowest)
                    Image(systemName: icon).foregroundStyle(Tokens.Colors.onBackground)
                }
                .frame(width: 48, height: 48)
                .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(Tokens.Colors.ink, lineWidth: 3))

                VStack(alignment: .leading, spacing: 2) {
                    Text(title.uppercased()).font(.headline)
                    Text(subtitle).font(.system(size: 13)).lineLimit(2)
                }
                .foregroundStyle(Tokens.Colors.onPrimaryContainer)

                Spacer()

                HStack(spacing: 4) {
                    Text("START")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(Tokens.Colors.onTertiaryContainer)
                        .padding(.horizontal, Tokens.Spacing.sm)
                        .padding(.vertical, 6)
                        .background(Tokens.Colors.tertiaryContainer)
                        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg))
                        .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(Tokens.Colors.ink, lineWidth: 3))
                    Image(systemName: "chevron.right").foregroundStyle(Tokens.Colors.onPrimaryContainer)
                }
            }
            .padding(Tokens.Spacing.sm)
        }
        .buttonStyle(.chibi)
    }
}

#Preview {
    HomeScreen()
        .environmentObject(AppState())
        .environmentObject(Router())
}
