//
//  OnboardingFlowView.swift
//  fitQuest
//
//  Local NavigationStack for the 3-step onboarding flow (Goal -> Stats ->
//  Avatar), threading the equivalent of RN's route params forward through
//  a shared observable object instead.
//

import Combine
import SwiftUI

@MainActor
final class OnboardingData: ObservableObject {
    @Published var goal: String = "build_muscle"
    @Published var heightCm: Double = 165
    @Published var weightKg: Double = 60
}

enum OnboardingStep: Hashable {
    case stats
    case avatar
}

struct OnboardingFlowView: View {
    @StateObject private var data = OnboardingData()
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            OnboardingGoalScreen(path: $path)
                .environmentObject(data)
                .navigationDestination(for: OnboardingStep.self) { step in
                    switch step {
                    case .stats:
                        OnboardingStatsScreen(path: $path)
                            .environmentObject(data)
                    case .avatar:
                        AvatarCreatorScreen(path: $path)
                            .environmentObject(data)
                    }
                }
        }
    }
}

