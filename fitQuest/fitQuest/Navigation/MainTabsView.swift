//
//  MainTabsView.swift
//  fitQuest
//
//  Mirrors navigation/MainTabs.js's tab set (Home/Quest/Social/Shop/
//  Profile), using SF Symbols in place of Material icons. The hard-shadow
//  tab bar cosmetic from the RN version is deferred to the Phase 5 polish
//  pass.
//

import SwiftUI

struct MainTabsView: View {
    @EnvironmentObject private var router: Router

    var body: some View {
        TabView(selection: $router.selectedTab) {
            HomeScreen()
                .tabItem { Label("Home", systemImage: "house.fill") }
                .tag(MainTab.home)

            QuestHubScreen()
                .tabItem { Label("Quest", systemImage: "gamecontroller.fill") }
                .tag(MainTab.quest)

            SocialScreen()
                .tabItem { Label("Social", systemImage: "person.3.fill") }
                .tag(MainTab.social)

            ShopScreen()
                .tabItem { Label("Shop", systemImage: "bag.fill") }
                .tag(MainTab.shop)

            ProfileScreen()
                .tabItem { Label("Profile", systemImage: "person.crop.circle.fill") }
                .tag(MainTab.profile)
        }
        .tint(Tokens.Colors.onPrimaryContainer)
    }
}
