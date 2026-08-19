//
//  OnboardingGoalScreen.swift
//  fitQuest
//
//  Ported from screens/OnboardingGoalScreen.js — onboarding step 1 of 3.
//

import SwiftUI

private struct GoalOption: Identifiable {
    let id: String
    let icon: String
    let title: String
    let subtitle: String
    let sparkleColor: Color
}

private let goalOptions: [GoalOption] = [
    GoalOption(
        id: "build_muscle", icon: "figure.strengthtraining.traditional",
        title: "Build Muscle", subtitle: "I want to get stronger and build muscle.",
        sparkleColor: Tokens.Colors.tertiaryContainer
    ),
    GoalOption(
        id: "lose_weight", icon: "scalemass.fill",
        title: "Lose Weight", subtitle: "I want to lose weight and feel lighter.",
        sparkleColor: Tokens.Colors.primaryContainer
    ),
    GoalOption(
        id: "improve_health", icon: "heart.fill",
        title: "Improve Health", subtitle: "I want to feel better and be healthier.",
        sparkleColor: Tokens.Colors.secondaryContainer
    ),
]

struct OnboardingGoalScreen: View {
    @EnvironmentObject private var data: OnboardingData
    @Binding var path: NavigationPath

    private var selectedIndex: Int {
        goalOptions.firstIndex { $0.id == data.goal } ?? 0
    }

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                HStack {
                    // No prior screen exists to go back to from onboarding's
                    // first step — matches RN's actual no-op `goBack()` here.
                    headerIconButton("chevron.left") {}
                    Spacer()
                    OnboardingStepper(step: 1)
                    Spacer()
                    headerIconButton("chevron.right") { continueOnward() }
                }

                VStack(spacing: Tokens.Spacing.xs) {
                    Text("✦ What's your main goal? ✦")
                        .font(.title2.weight(.bold))
                        .textCase(.uppercase)
                        .multilineTextAlignment(.center)
                    Text("Choose the goal that motivates you the most!")
                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                        .multilineTextAlignment(.center)
                }

                ChibiSurface {
                    VStack(spacing: Tokens.Spacing.sm) {
                        Image(systemName: goalOptions[selectedIndex].icon)
                            .font(.system(size: 72))
                            .foregroundStyle(Tokens.Colors.primary)
                            .frame(maxWidth: .infinity)
                            .aspectRatio(4.0 / 3.0, contentMode: .fit)
                            .background(Tokens.Colors.primaryContainer.opacity(0.2))

                        HStack(spacing: 6) {
                            ForEach(goalOptions.indices, id: \.self) { i in
                                Circle()
                                    .fill(i == selectedIndex ? Tokens.Colors.primary : Tokens.Colors.surfaceContainerHighest)
                                    .frame(width: 6, height: 6)
                            }
                        }
                    }
                    .padding(Tokens.Spacing.sm)
                }

                VStack(spacing: Tokens.Spacing.base) {
                    ForEach(goalOptions) { option in
                        goalRow(option)
                    }
                }

                mascotTip

                Button {
                    continueOnward()
                } label: {
                    Text("Continue")
                        .font(.headline)
                        .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Tokens.Spacing.sm)
                }
                .buttonStyle(.chibi)
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
        .toolbar(.hidden, for: .navigationBar)
    }

    private func goalRow(_ option: GoalOption) -> some View {
        Button {
            data.goal = option.id
        } label: {
            HStack(spacing: Tokens.Spacing.sm) {
                Image(systemName: option.icon)
                    .foregroundStyle(option.sparkleColor)
                    .font(.title3)
                VStack(alignment: .leading, spacing: 2) {
                    Text(option.title).font(.headline)
                    Text(option.subtitle)
                        .font(.footnote)
                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                }
                Spacer()
            }
            .padding(Tokens.Spacing.sm)
        }
        .buttonStyle(.plain)
        .background(data.goal == option.id ? Tokens.Colors.surfaceContainer : Tokens.Colors.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg))
        .overlay(
            RoundedRectangle(cornerRadius: Tokens.Radius.lg)
                .stroke(Tokens.Colors.ink, lineWidth: 3)
        )
    }

    private var mascotTip: some View {
        HStack(alignment: .top, spacing: Tokens.Spacing.sm) {
            Image("Onboarding_GoalMascot")
                .resizable()
                .scaledToFill()
                .frame(width: 56, height: 56)
                .clipShape(Circle())

            ChibiSurface {
                (Text("There's ").foregroundColor(Tokens.Colors.onSurface)
                    + Text("no wrong answer!").fontWeight(.bold).foregroundColor(Tokens.Colors.primary)
                    + Text(" You can always adjust your goals later. ❤️").foregroundColor(Tokens.Colors.onSurface))
                    .padding(Tokens.Spacing.sm)
            }
        }
    }

    private func headerIconButton(_ systemName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.title3)
        }
        .buttonStyle(.plain)
        .frame(width: 48, height: 48)
        .background(Tokens.Colors.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg))
        .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(Tokens.Colors.ink, lineWidth: 3))
    }

    private func continueOnward() {
        path.append(OnboardingStep.stats)
    }
}

#Preview {
    OnboardingGoalScreen(path: .constant(NavigationPath()))
        .environmentObject(OnboardingData())
}
