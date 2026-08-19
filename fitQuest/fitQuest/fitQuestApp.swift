//
//  fitQuestApp.swift
//  fitQuest
//
//  Created by Mangkorn Chunvijitra on 20/8/2569 BE.
//

import SwiftUI

@main
struct fitQuestApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}
