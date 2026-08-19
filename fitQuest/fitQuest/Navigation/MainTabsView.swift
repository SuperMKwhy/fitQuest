//
//  MainTabsView.swift
//  fitQuest
//
//  Mirrors navigation/MainTabs.js's tab set (Home/Quest/Social/Shop/
//  Profile), using SF Symbols in place of Material icons. Social/Shop stay
//  placeholders until Phase 4; the hard-shadow tab bar cosmetic from the RN
//  version is deferred to the Phase 5 polish pass.
//

import SwiftUI

struct MainTabsView: View {
    var body: some View {
        TabView {
            HomeScreen()
                .tabItem { Label("Home", systemImage: "house.fill") }

            QuestHubScreen()
                .tabItem { Label("Quest", systemImage: "gamecontroller.fill") }

            PlaceholderScreen(title: "Social")
                .tabItem { Label("Social", systemImage: "person.3.fill") }

            PlaceholderScreen(title: "Shop")
                .tabItem { Label("Shop", systemImage: "bag.fill") }

            ProfileScreen()
                .tabItem { Label("Profile", systemImage: "person.crop.circle.fill") }
        }
        .tint(Tokens.Colors.onPrimaryContainer)
    }
}

private struct PlaceholderScreen: View {
    let title: String

    var body: some View {
        Text("\(title) — coming in a later phase")
            .foregroundStyle(Tokens.Colors.onSurfaceVariant)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Tokens.Colors.background)
    }
}
