//
//  FlappyBirdGameView.swift
//  fitQuest
//
//  Canvas-rendered overlay for FlappyBirdGameModel — pipes, bird, ground,
//  score badge, and the ready/game-over overlays, ported from
//  FlappyBirdGame.js's render output.
//

import SwiftUI

struct FlappyBirdGameView: View {
    @ObservedObject var model: FlappyBirdGameModel
    let onExit: () -> Void
    let onRestart: () -> Void

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                TimelineView(.animation) { timeline in
                    Canvas { context, size in
                        drawPipes(context: context, size: size)
                        drawGround(context: context, size: size)
                        drawBird(context: context)
                    }
                    .onChange(of: timeline.date) { _, newDate in
                        model.tick(now: newDate)
                    }
                }

                VStack {
                    HStack {
                        Spacer()
                        scoreBadge
                        Spacer()
                    }
                    .overlay(alignment: .trailing) { exitButton }
                    .padding(.top, Tokens.Spacing.md)
                    Spacer()
                }

                if model.state == .ready {
                    overlayCard(title: "Arm Swing 🐦", message: "Swing your arm up in view of the camera to flap!")
                } else if model.state == .gameOver {
                    VStack(spacing: Tokens.Spacing.base) {
                        Text("Game Over").font(.largeTitle.bold()).foregroundStyle(.white)
                        Text("Score: \(model.score)").font(.title2).foregroundStyle(.white)
                        Button("Swing to restart", action: onRestart)
                            .font(.headline)
                            .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                            .padding(.horizontal, Tokens.Spacing.md)
                            .padding(.vertical, Tokens.Spacing.sm)
                            .buttonStyle(.chibi)
                    }
                    .padding(Tokens.Spacing.lg)
                    .background(.black.opacity(0.5))
                    .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.xl))
                }
            }
            .onAppear { model.configure(size: proxy.size) }
            .onChange(of: proxy.size) { _, newSize in model.configure(size: newSize) }
        }
        .ignoresSafeArea()
    }

    private var scoreBadge: some View {
        Text("\(model.score)")
            .font(.system(size: 28, weight: .bold))
            .foregroundStyle(.white)
            .padding(.horizontal, Tokens.Spacing.md)
            .padding(.vertical, Tokens.Spacing.base)
            .background(.black.opacity(0.35))
            .clipShape(Capsule())
    }

    private var exitButton: some View {
        Button(action: onExit) {
            Image(systemName: "xmark")
                .foregroundStyle(.white)
                .frame(width: 36, height: 36)
                .background(Circle().fill(.black.opacity(0.35)))
        }
        .padding(.trailing, Tokens.Spacing.md)
    }

    private func overlayCard(title: String, message: String) -> some View {
        VStack(spacing: Tokens.Spacing.base) {
            Text(title).font(.largeTitle.bold()).foregroundStyle(.white)
            Text(message)
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Tokens.Spacing.lg)
        }
        .padding(Tokens.Spacing.lg)
        .background(.black.opacity(0.5))
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.xl))
    }

    private func drawPipes(context: GraphicsContext, size: CGSize) {
        for pipe in model.pipes {
            let topRect = CGRect(x: pipe.x, y: 0, width: FlappyBirdGameModel.pipeWidth, height: pipe.gapY)
            let bottomY = pipe.gapY + FlappyBirdGameModel.pipeGap
            let bottomRect = CGRect(
                x: pipe.x, y: bottomY, width: FlappyBirdGameModel.pipeWidth,
                height: size.height - FlappyBirdGameModel.groundHeight - bottomY
            )
            for rect in [topRect, bottomRect] {
                let path = Path(rect)
                context.fill(path, with: .color(Color(hex: 0x3EC46D)))
                context.stroke(path, with: .color(Color(hex: 0x2A9950)), lineWidth: 3)
            }
        }
    }

    private func drawGround(context: GraphicsContext, size: CGSize) {
        let rect = CGRect(x: 0, y: size.height - FlappyBirdGameModel.groundHeight, width: size.width, height: FlappyBirdGameModel.groundHeight)
        context.fill(Path(rect), with: .color(Color(hex: 0x8B5A2B)))
    }

    private func drawBird(context: GraphicsContext) {
        let rect = CGRect(x: FlappyBirdGameModel.birdX, y: model.birdY, width: FlappyBirdGameModel.birdSize, height: FlappyBirdGameModel.birdSize)
        context.draw(Text("🐦").font(.system(size: FlappyBirdGameModel.birdSize)), in: rect)
    }
}
