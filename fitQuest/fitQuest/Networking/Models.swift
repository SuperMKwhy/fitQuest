//
//  Models.swift
//  fitQuest
//
//  Codable mirrors of apps/server's Prisma schema / route responses.
//  JSON keys are camelCase 1:1 with the Prisma field names; DateTime
//  fields serialize as ISO 8601 strings (see JSONDecoder+FitQuest.swift).
//

import Foundation

struct Profile: Codable, Equatable {
    let id: String
    let userId: String
    var displayName: String
    var goal: String?
    var heightCm: Double?
    var weightKg: Double?
    var hairStyle: String
    var skinTone: String
    var level: Int
    var xp: Int
    var totalXp: Int
    var coins: Int
    var gems: Int
    var onboardingCompletedAt: Date?
    let createdAt: Date
    let updatedAt: Date
}

struct Activity: Codable, Equatable, Identifiable {
    let id: String
    let userId: String
    /// "run" | "quest_game"
    let type: String
    let distanceM: Double?
    let durationS: Int
    let caloriesKcal: Int?
    let score: Int?
    let xpEarned: Int
    let coinsEarned: Int
    let createdAt: Date
}

struct LeaderboardEntry: Codable, Equatable, Identifiable {
    let rank: Int
    let userId: String
    let displayName: String
    let level: Int
    let totalXp: Int

    var id: String { userId }
}

struct ShopItem: Codable, Equatable, Identifiable {
    let id: String
    let name: String
    /// "hair" | "shirt" | "pants" | "shoes" | "pet" | "accessory"
    let category: String
    let priceCoins: Int?
    let priceGems: Int?
    let iconKey: String
}

struct Friend: Codable, Equatable, Identifiable {
    let userId: String
    let displayName: String
    let level: Int

    var id: String { userId }
}

struct FoodLog: Codable, Equatable, Identifiable {
    let id: String
    let userId: String
    var name: String
    /// "Breakfast" | "Lunch" | "Dinner" | "Snack"
    var mealType: String
    var calories: Int
    var proteinG: Double?
    var carbsG: Double?
    var fatG: Double?
    /// "manual" | "scan"
    var source: String
    var confidence: Double?
    var loggedAt: Date
    let createdAt: Date
}

/// Response shape of POST /food-scan (Gemini vision analysis, not persisted).
struct FoodAnalysis: Codable, Equatable {
    let name: String
    let calories: Int
    let proteinG: Double
    let carbsG: Double
    let fatG: Double
    let confidencePercent: Double
}

struct AuthResponse: Codable {
    let token: String
    let profile: Profile
}

struct ActivitySubmitResponse: Codable {
    let activity: Activity
    let profile: Profile
}

struct AIBuddyTurn: Codable {
    /// "user" | "ai"
    let sender: String
    let text: String
}

struct AIBuddyReply: Codable {
    let reply: String
}
