//
//  AppState.swift
//  fitQuest
//
//  Replaces apps/mobile/src/state/useAppStore.js — the single global store
//  driving RootView's state machine, backed by Keychain instead of
//  expo-secure-store.
//

import Combine
import Foundation

enum AppStatus: Equatable {
    case loading
    case signedOut
    case onboarding
    case ready
}

@MainActor
final class AppState: ObservableObject {
    private static let tokenKey = "fitquest_token"

    @Published private(set) var status: AppStatus = .loading
    @Published private(set) var profile: Profile?
    @Published var error: String?

    private let api = APIClient.shared

    /// Called once on app launch (mirrors LoadingScreen's `useEffect`).
    func bootstrap() async {
        guard let token = KeychainStore.get(Self.tokenKey) else {
            status = .signedOut
            return
        }
        api.setAuthToken(token)
        do {
            let profile = try await api.getMe()
            self.profile = profile
            status = profile.onboardingCompletedAt != nil ? .ready : .onboarding
        } catch {
            // Token expired/invalid — fall back to signed-out rather than getting stuck.
            KeychainStore.delete(Self.tokenKey)
            api.setAuthToken(nil)
            status = .signedOut
        }
    }

    func register(email: String, password: String, displayName: String) async throws {
        error = nil
        let response = try await api.register(email: email, password: password, displayName: displayName)
        KeychainStore.set(response.token, for: Self.tokenKey)
        api.setAuthToken(response.token)
        profile = response.profile
        status = .onboarding
    }

    func login(email: String, password: String) async throws {
        error = nil
        let response = try await api.login(email: email, password: password)
        KeychainStore.set(response.token, for: Self.tokenKey)
        api.setAuthToken(response.token)
        profile = response.profile
        status = response.profile.onboardingCompletedAt != nil ? .ready : .onboarding
    }

    func logout() {
        KeychainStore.delete(Self.tokenKey)
        api.setAuthToken(nil)
        profile = nil
        status = .signedOut
    }

    @discardableResult
    func updateProfile(_ fields: [String: AnyEncodable]) async throws -> Profile {
        let profile = try await api.updateMe(fields)
        self.profile = profile
        return profile
    }

    @discardableResult
    func completeOnboarding(_ fields: [String: AnyEncodable]) async throws -> Profile {
        var body = fields
        body["completeOnboarding"] = AnyEncodable(true)
        let profile = try await api.updateMe(body)
        self.profile = profile
        status = .ready
        return profile
    }

    /// Returns the recorded activity (server-computed xpEarned/coinsEarned).
    func submitActivity(
        type: String, distanceM: Double? = nil, durationS: Int, caloriesKcal: Int? = nil, score: Int? = nil
    ) async throws -> Activity {
        let response = try await api.submitActivity(
            type: type, distanceM: distanceM, durationS: durationS, caloriesKcal: caloriesKcal, score: score
        )
        profile = response.profile
        return response.activity
    }
}
