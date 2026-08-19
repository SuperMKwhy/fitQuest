//
//  WorkoutSummaryScreen.swift
//  fitQuest
//
//  Ported from screens/WorkoutSummaryScreen.js — post-run recap. "Done"
//  pops the entire run/summary stack back to the tab root, matching the
//  RN version's `popToTop()`.
//

import SwiftUI

struct WorkoutSummaryScreen: View {
    let distanceM: Double
    let elapsedS: Int
    let xpEarned: Int
    let coinsEarned: Int

    @EnvironmentObject private var router: Router

    private var km: String { String(format: "%.2f", distanceM / 1000) }
    private var duration: String { RunFormatting.duration(elapsedS) }
    private var pace: String { RunFormatting.pace(distanceM: distanceM, elapsedS: elapsedS) }

    private var shareMessage: String {
        "I just ran \(km) km in \(duration) (\(pace)/km) on FitQuest and earned +\(xpEarned) XP and +\(coinsEarned) coins!"
    }

    var body: some View {
        VStack(spacing: Tokens.Spacing.md) {
            Text("WORKOUT SUMMARY")
                .font(.title2.bold())
                .padding(.top, Tokens.Spacing.xl)

            ChibiSurface {
                VStack(spacing: Tokens.Spacing.md) {
                    HStack {
                        Spacer()
                        ShareLink(item: shareMessage) {
                            Image(systemName: "square.and.arrow.up")
                                .frame(width: 32, height: 32)
                                .background(Circle().fill(Tokens.Colors.primaryContainer))
                                .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 2))
                        }
                    }

                    HStack(spacing: Tokens.Spacing.md) {
                        summaryStat(label: "DISTANCE", value: "\(km) km")
                        summaryStat(label: "TIME", value: duration)
                        summaryStat(label: "PACE", value: "\(pace) /km")
                    }

                    HStack(spacing: Tokens.Spacing.lg) {
                        Text("+\(xpEarned) XP")
                            .font(.headline)
                            .foregroundStyle(Tokens.Colors.primary)
                        Text("+\(coinsEarned) coins")
                            .font(.headline)
                            .foregroundStyle(Tokens.Colors.tertiary)
                    }
                }
                .padding(Tokens.Spacing.md)
            }

            Spacer()

            Button {
                router.popToRoot()
            } label: {
                Text("Done")
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

    private func summaryStat(label: String, value: String) -> some View {
        VStack(spacing: 4) {
            Text(value).font(.title3.bold())
            Text(label).font(.system(size: 10, weight: .bold)).foregroundStyle(Tokens.Colors.onSurfaceVariant)
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    NavigationStack {
        WorkoutSummaryScreen(distanceM: 3210, elapsedS: 1425, xpEarned: 84, coinsEarned: 48)
            .environmentObject(Router())
    }
}
