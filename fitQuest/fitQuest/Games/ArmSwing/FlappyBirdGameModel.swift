//
//  FlappyBirdGameModel.swift
//  fitQuest
//
//  Ported from game/FlappyBirdGame.js's impulse-mode game loop (the
//  Face Tracker / Push-Up Tracker "controlled" modes aren't ported — only
//  the arm-swing control scheme is actually wired to gameplay in the RN
//  app today). Every physics constant is carried over exactly. The debug
//  gravity slider from the RN version (a dev leftover) is dropped.
//

import Combine
import Foundation
import SwiftUI

struct Pipe: Identifiable {
    let id = UUID()
    var x: CGFloat
    let gapY: CGFloat
    var passed = false
}

enum FlappyBirdState {
    case ready, playing, gameOver
}

@MainActor
final class FlappyBirdGameModel: ObservableObject {
    // Ported 1:1 from FlappyBirdGame.js.
    static let birdX: CGFloat = 70
    static let birdSize: CGFloat = 34
    static let pipeWidth: CGFloat = 64
    static let pipeGap: CGFloat = 210
    private static let gravity: CGFloat = 1500
    private static let flapVelocity: CGFloat = -480
    private static let pipeSpeed: CGFloat = 140
    private static let pipeInterval: CGFloat = 260
    static let groundHeight: CGFloat = 40
    private static let maxDeltaTime: TimeInterval = 0.05

    @Published private(set) var birdY: CGFloat = 0
    @Published private(set) var pipes: [Pipe] = []
    @Published private(set) var score = 0
    @Published private(set) var state: FlappyBirdState = .ready

    private var velocity: CGFloat = 0
    private var canvasSize: CGSize = .zero
    private var lastFrameDate: Date?
    var onGameOver: ((Int) -> Void)?

    func configure(size: CGSize) {
        canvasSize = size
        birdY = size.height / 2 - Self.birdSize / 2
    }

    func flap() {
        switch state {
        case .ready:
            state = .playing
            velocity = Self.flapVelocity
        case .playing:
            velocity = Self.flapVelocity
        case .gameOver:
            break
        }
    }

    func restart() {
        pipes = []
        score = 0
        velocity = 0
        state = .ready
        lastFrameDate = nil
        birdY = canvasSize.height / 2 - Self.birdSize / 2
    }

    /// Called every frame from a `TimelineView(.animation)`.
    func tick(now: Date) {
        defer { lastFrameDate = now }
        guard state == .playing, canvasSize != .zero else { return }
        guard let lastFrameDate else { return }
        let dt = min(now.timeIntervalSince(lastFrameDate), Self.maxDeltaTime)
        guard dt > 0 else { return }

        velocity += Self.gravity * CGFloat(dt)
        birdY += velocity * CGFloat(dt)

        movePipes(dt: CGFloat(dt))
        spawnPipeIfNeeded()
        removeOffscreenPipes()
        updateScore()
        checkCollisions()
    }

    private func movePipes(dt: CGFloat) {
        for index in pipes.indices {
            pipes[index].x -= Self.pipeSpeed * dt
        }
    }

    private func spawnPipeIfNeeded() {
        guard pipes.last.map({ $0.x < canvasSize.width - Self.pipeInterval }) ?? true else { return }
        let minGapY: CGFloat = 90
        let maxGapY = canvasSize.height - Self.groundHeight - 180
        guard maxGapY > minGapY else { return }
        let gapY = minGapY + CGFloat.random(in: 0..<1) * (maxGapY - minGapY)
        pipes.append(Pipe(x: canvasSize.width, gapY: gapY))
    }

    private func removeOffscreenPipes() {
        pipes.removeAll { $0.x + Self.pipeWidth < 0 }
    }

    private func updateScore() {
        var gained = 0
        for index in pipes.indices where !pipes[index].passed {
            if pipes[index].x + Self.pipeWidth < Self.birdX {
                pipes[index].passed = true
                gained += 1
            }
        }
        if gained > 0 { score += gained }
    }

    private func checkCollisions() {
        let birdTop = birdY
        let birdBottom = birdY + Self.birdSize

        if birdTop < 0 || birdBottom > canvasSize.height - Self.groundHeight {
            endGame()
            return
        }

        for pipe in pipes {
            let birdLeft = Self.birdX
            let birdRight = Self.birdX + Self.birdSize
            let overlapsX = pipe.x < birdRight && pipe.x + Self.pipeWidth > birdLeft
            guard overlapsX else { continue }
            if birdTop < pipe.gapY || birdBottom > pipe.gapY + Self.pipeGap {
                endGame()
                return
            }
        }
    }

    private func endGame() {
        guard state == .playing else { return }
        state = .gameOver
        onGameOver?(score)
    }
}
