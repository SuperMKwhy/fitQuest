//
//  PreGameReadyScreen.swift
//  fitQuest
//
//  Ported from screens/PreGameReadyScreen.js — shared 3-2-1-Ready countdown
//  before either activity type starts. The countdown auto-advances every
//  800ms (not 1000ms); once it hits 0 the screen waits for a manual
//  "START!" tap rather than auto-launching.
//

import SwiftUI

struct PreGameReadyScreen: View {
    let mode: GameMode
    @EnvironmentObject private var router: Router

    @State private var count = 3

    private var title: String {
        switch mode {
        case .run: return "TODAY'S QUEST"
        case .questGame: return "RANK MATCH"
        }
    }

    var body: some View {
        VStack(spacing: Tokens.Spacing.lg) {
            Text(title)
                .font(.system(size: 13, weight: .bold))
                .tracking(3)
                .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                .padding(.top, Tokens.Spacing.xl)

            ZStack {
                GridOverlay()
                    .opacity(0.3)

                if count > 0 {
                    ZStack {
                        Text("\(count)")
                            .font(.system(size: 120, weight: .bold))
                            .foregroundStyle(Tokens.Colors.ink)
                            .offset(x: 6, y: 6)
                        Text("\(count)")
                            .font(.system(size: 120, weight: .bold))
                            .foregroundStyle(Tokens.Colors.secondaryContainer)
                    }
                } else {
                    VStack(spacing: Tokens.Spacing.md) {
                        Text("Ready?")
                            .font(.system(size: 32, weight: .bold))
                        Button {
                            router.replace(with: mode == .run ? .runTracker : .questGame)
                        } label: {
                            Text("START!")
                                .font(.title.bold())
                                .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                                .padding(.horizontal, Tokens.Spacing.lg)
                                .padding(.vertical, Tokens.Spacing.sm)
                        }
                        .buttonStyle(.chibi)
                    }
                }
            }
            .frame(maxHeight: 384)
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            Button("Cancel") {
                router.pop()
            }
            .foregroundStyle(Tokens.Colors.onSurfaceVariant)
            .padding(.bottom, Tokens.Spacing.xl)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Tokens.Colors.background)
        .navigationBarBackButtonHidden(true)
        .task {
            while count > 0 {
                try? await Task.sleep(nanoseconds: 800_000_000)
                count -= 1
            }
        }
    }
}

/// Decorative hairline grid behind the countdown number.
private struct GridOverlay: View {
    var body: some View {
        Canvas { context, size in
            let columns = 6
            let rows = 8
            for i in 1..<columns {
                let x = size.width * CGFloat(i) / CGFloat(columns)
                context.stroke(Path { $0.move(to: CGPoint(x: x, y: 0)); $0.addLine(to: CGPoint(x: x, y: size.height)) }, with: .color(Tokens.Colors.outline), lineWidth: 1)
            }
            for i in 1..<rows {
                let y = size.height * CGFloat(i) / CGFloat(rows)
                context.stroke(Path { $0.move(to: CGPoint(x: 0, y: y)); $0.addLine(to: CGPoint(x: size.width, y: y)) }, with: .color(Tokens.Colors.outline), lineWidth: 1)
            }
        }
        .allowsHitTesting(false)
    }
}

#Preview {
    NavigationStack {
        PreGameReadyScreen(mode: .run)
            .environmentObject(Router())
    }
}
