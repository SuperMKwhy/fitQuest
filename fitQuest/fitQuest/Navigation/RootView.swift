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
    }
}
