//
//  LoadingScreen.swift
//  fitQuest
//
//  Ported from screens/LoadingScreen.js. RootView drives the actual
//  `bootstrap()` call; this is purely presentational while status is
//  `.loading`.
//

import SwiftUI

struct LoadingScreen: View {
    var body: some View {
        VStack(spacing: Tokens.Spacing.md) {
            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: Tokens.Radius.xl * 2)
                    .fill(Tokens.Colors.ink)
                    .offset(x: 8, y: 8)

                RoundedRectangle(cornerRadius: Tokens.Radius.xl * 2)
                    .fill(Tokens.Colors.surfaceContainerLowest)
                    .overlay(
                        RoundedRectangle(cornerRadius: Tokens.Radius.xl * 2)
                            .stroke(Tokens.Colors.ink, lineWidth: 4)
                    )
                    .overlay(
                        // Stand-in for a missing logo image asset — matches the RN version.
                        Text("🏋️")
                            .font(.system(size: 96))
                    )
            }
            .frame(width: 224, height: 224)

            VStack(spacing: Tokens.Spacing.base) {
                Text("FitQuest")
                    .font(.title2.bold())
                    .foregroundStyle(Tokens.Colors.onBackground)

                Text("✦ LOADING... ✦")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(2)
                    .foregroundStyle(Tokens.Colors.primaryContainer)

                ProgressView()
                    .tint(Tokens.Colors.primary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Tokens.Colors.background)
    }
}

#Preview {
    LoadingScreen()
}
