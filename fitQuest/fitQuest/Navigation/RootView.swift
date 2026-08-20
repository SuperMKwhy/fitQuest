//
//  RootView.swift
//  fitQuest
//
//  Mirrors RootNavigator.js's state machine: Loading -> Auth -> Onboarding
//  -> Main, switching purely on AppState.status.
//

import SwiftUI

struct RootView: View {
    @EnvironmentObject private var appState: AppState
    @StateObject private var router = Router()

    var body: some View {
        Group {
            switch appState.status {
            case .loading:
                LoadingScreen()
            case .signedOut:
                AuthScreen()
            case .onboarding:
                OnboardingFlowView()
            case .ready:
                NavigationStack(path: $router.path) {
                    MainTabsView()
                        .navigationDestination(for: Route.self) { route in
                            RouteDestinationView(route: route)
                        }
                }
                .environmentObject(router)
            }
        }
        .task {
            await appState.bootstrap()
        }
        .onChange(of: appState.status) { oldStatus, newStatus in
            // Router persists for RootView's lifetime (unlike the RN version,
            // where the whole Stack.Group remounts on status change) — reset
            // it on logout so a later login doesn't resume a stale tab/path.
            if oldStatus == .ready, newStatus != .ready {
                router.jumpToRoot(tab: .home)
            }
        }
    }
}
