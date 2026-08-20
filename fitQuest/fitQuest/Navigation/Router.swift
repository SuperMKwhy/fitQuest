//
//  Router.swift
//  fitQuest
//
//  Wraps a NavigationPath with React-Navigation-style push/replace/pop
//  semantics, since several RN screens deliberately use `.replace()` /
//  `.popToTop()` to block back-navigation into transient screens
//  (PreGameReady -> RunTracker/QuestGame, RunTracker -> WorkoutSummary,
//  QuestGame -> GameOver, GameOver "Play Again" -> QuestGame,
//  WorkoutSummary "Done" -> pop to root).
//

import Combine
import SwiftUI

enum MainTab: Int {
    case home, quest, social, shop, profile
}

@MainActor
final class Router: ObservableObject {
    @Published var path = NavigationPath()
    @Published var selectedTab: MainTab = .home

    func push(_ route: Route) {
        path.append(route)
    }

    /// Pops to the tab root and switches tabs — equivalent of
    /// `navigation.navigate('Main', { screen: 'Social' })`.
    func jumpToRoot(tab: MainTab) {
        path = NavigationPath()
        selectedTab = tab
    }

    /// Equivalent of `navigation.replace(...)`: swaps the current top
    /// screen for a new one so back-navigation skips it entirely.
    func replace(with route: Route) {
        if !path.isEmpty {
            path.removeLast()
        }
        path.append(route)
    }

    func pop() {
        if !path.isEmpty {
            path.removeLast()
        }
    }

    /// Equivalent of `navigation.popToTop()`.
    func popToRoot() {
        path = NavigationPath()
    }
}
