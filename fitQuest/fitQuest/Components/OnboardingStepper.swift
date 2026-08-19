//
//  OnboardingStepper.swift
//  fitQuest
//
//  Ported from components/OnboardingStepper.js. Dot comparisons are
//  intentionally exact-ported from the RN version (dot `i < step` gets a
//  checkmark, `i == step` is filled-no-check, `i > step` is hollow) even
//  though `step` isn't literally a 0-based "completed count" — this is
//  the RN app's actual behavior, not a bug to silently fix.
//

import SwiftUI

struct OnboardingStepper: View {
    let step: Int
    var totalSteps: Int = 3

    var body: some View {
        VStack(spacing: Tokens.Spacing.base) {
            HStack(spacing: 0) {
                ForEach(0..<totalSteps, id: \.self) { index in
                    dot(for: index)
                    if index != totalSteps - 1 {
                        Rectangle()
                            .fill(index < step ? Tokens.Colors.primaryContainer : Tokens.Colors.outlineVariant)
                            .frame(height: 3)
                    }
                }
            }
            .frame(maxWidth: 200)

            HStack(spacing: 4) {
                Text("✦").foregroundStyle(Tokens.Colors.primaryContainer)
                Text("STEP \(step) OF \(totalSteps)")
                Text("✦").foregroundStyle(Tokens.Colors.primaryContainer)
            }
            .font(.system(size: 10, weight: .bold))
            .tracking(1.5)
            .foregroundStyle(Tokens.Colors.onSurfaceVariant)
        }
    }

    @ViewBuilder
    private func dot(for index: Int) -> some View {
        ZStack {
            Circle()
                .fill(index <= step ? Tokens.Colors.primaryContainer : Tokens.Colors.surfaceContainerLowest)
                .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 3))
            if index < step {
                Image(systemName: "checkmark")
                    .font(.system(size: 8, weight: .bold))
                    .foregroundStyle(Tokens.Colors.onPrimaryContainer)
            }
        }
        .frame(width: 16, height: 16)
    }
}

#Preview {
    VStack(spacing: 24) {
        OnboardingStepper(step: 1)
        OnboardingStepper(step: 2)
        OnboardingStepper(step: 3)
    }
    .padding()
}
