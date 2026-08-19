//
//  Route.swift
//  fitQuest
//
//  Sibling destinations pushed on top of MainTabsView, mirroring
//  RootNavigator.js's `status === 'ready'` Stack.Group — pushing one of
//  these covers the tab bar, exactly like the RN stack.
//

import Foundation

enum GameMode: String, Hashable {
    case run
    case questGame = "quest_game"
}

enum Route: Hashable {
    case preGameReady(mode: GameMode)
    case runTracker
    case workoutSummary(distanceM: Double, elapsedS: Int, xpEarned: Int, coinsEarned: Int)
    case questGame
    case gameOver(score: Int, xpEarned: Int, coinsEarned: Int)
    case aiBuddyChat
    case moodTracker
    case healthLog
    case aiFoodScan
}
