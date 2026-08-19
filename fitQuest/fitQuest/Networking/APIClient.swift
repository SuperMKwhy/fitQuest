//
//  APIClient.swift
//  fitQuest
//
//  Thin URLSession client mirroring apps/mobile/src/api/client.js 1:1.
//  The server is untouched — this just speaks its existing REST contract.
//

import Foundation

struct APIError: Error, LocalizedError {
    let message: String
    var errorDescription: String? { message }
}

/// Wire shape `{ "error": "..." }` used by every server error response.
private struct ServerErrorBody: Decodable {
    let error: String
}

final class APIClient {
    static let shared = APIClient()

    /// iOS Simulator can reach the host's `localhost` directly — a physical
    /// device would need the machine's LAN IP instead (not needed yet).
    /// Port 3000 is taken by another project on this machine, so this
    /// project's server runs on 3001 instead (see server/.env's PORT).
    var baseURL = URL(string: "http://localhost:3001")!

    private var authToken: String?

    private lazy var decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let string = try container.decode(String.self)
            let withFractional = ISO8601DateFormatter()
            withFractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = withFractional.date(from: string) { return date }
            let plain = ISO8601DateFormatter()
            plain.formatOptions = [.withInternetDateTime]
            if let date = plain.date(from: string) { return date }
            throw DecodingError.dataCorruptedError(
                in: container, debugDescription: "Invalid ISO8601 date: \(string)"
            )
        }
        return decoder
    }()

    private lazy var encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }()

    private init() {}

    func setAuthToken(_ token: String?) {
        authToken = token
    }

    // MARK: - Core request

    private func request<Response: Decodable>(
        _ path: String,
        method: String = "GET",
        body: (any Encodable)? = nil,
        auth: Bool = true,
        query: [URLQueryItem]? = nil
    ) async throws -> Response {
        var components = URLComponents(url: baseURL.appendingPathComponent(path), resolvingAgainstBaseURL: false)!
        components.queryItems = query
        var urlRequest = URLRequest(url: components.url!)
        urlRequest.httpMethod = method
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if auth, let authToken {
            urlRequest.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            urlRequest.httpBody = try encoder.encode(body)
        }

        let (data, response) = try await URLSession.shared.data(for: urlRequest)
        guard let http = response as? HTTPURLResponse else {
            throw APIError(message: "No response from server")
        }
        guard (200...299).contains(http.statusCode) else {
            if let errorBody = try? decoder.decode(ServerErrorBody.self, from: data) {
                throw APIError(message: errorBody.error)
            }
            throw APIError(message: "Request to \(path) failed (\(http.statusCode))")
        }
        return try decoder.decode(Response.self, from: data)
    }

    // MARK: - Auth

    func register(email: String, password: String, displayName: String) async throws -> AuthResponse {
        try await request(
            "/auth/register", method: "POST",
            body: ["email": email, "password": password, "displayName": displayName],
            auth: false
        )
    }

    func login(email: String, password: String) async throws -> AuthResponse {
        try await request(
            "/auth/login", method: "POST",
            body: ["email": email, "password": password],
            auth: false
        )
    }

    func getMe() async throws -> Profile {
        try await request("/me")
    }

    func updateMe(_ fields: [String: AnyEncodable]) async throws -> Profile {
        try await request("/me", method: "PATCH", body: fields)
    }

    // MARK: - Activities

    func submitActivity(
        type: String, distanceM: Double?, durationS: Int, caloriesKcal: Int?, score: Int?
    ) async throws -> ActivitySubmitResponse {
        var body: [String: AnyEncodable] = [
            "type": AnyEncodable(type),
            "durationS": AnyEncodable(durationS),
        ]
        if let distanceM { body["distanceM"] = AnyEncodable(distanceM) }
        if let caloriesKcal { body["caloriesKcal"] = AnyEncodable(caloriesKcal) }
        if let score { body["score"] = AnyEncodable(score) }
        return try await request("/activities", method: "POST", body: body)
    }

    func getMyActivities() async throws -> [Activity] {
        try await request("/activities/me")
    }

    // MARK: - Social / shop

    func getLeaderboard() async throws -> [LeaderboardEntry] {
        try await request("/leaderboard")
    }

    func getShopItems() async throws -> [ShopItem] {
        try await request("/shop/items")
    }

    func getFriends() async throws -> [Friend] {
        try await request("/friends")
    }

    // MARK: - AI Buddy / food scan

    func sendBuddyMessage(_ message: String, history: [AIBuddyTurn]) async throws -> AIBuddyReply {
        try await request(
            "/ai-buddy/chat", method: "POST",
            body: ["message": AnyEncodable(message), "history": AnyEncodable(history)]
        )
    }

    func scanFood(imageBase64: String, mimeType: String) async throws -> FoodAnalysis {
        try await request(
            "/food-scan", method: "POST",
            body: ["imageBase64": imageBase64, "mimeType": mimeType]
        )
    }

    func getFoodLog(date: String) async throws -> [FoodLog] {
        try await request("/food-log", query: [URLQueryItem(name: "date", value: date)])
    }

    func logFood(_ entry: [String: AnyEncodable]) async throws -> FoodLog {
        try await request("/food-log", method: "POST", body: entry)
    }
}

/// Type-erased Encodable wrapper so heterogeneous JSON bodies (mixed
/// String/Int/Double/nested-array fields) can be built as plain dictionaries.
struct AnyEncodable: Encodable {
    private let encodeClosure: (Encoder) throws -> Void

    init<T: Encodable>(_ wrapped: T) {
        encodeClosure = { try wrapped.encode(to: $0) }
    }

    func encode(to encoder: Encoder) throws {
        try encodeClosure(encoder)
    }
}

// Note: `[String: AnyEncodable]` already conforms to `Encodable` via the
// standard library's conditional `Dictionary` conformance (Key & Value both
// Encodable), which special-cases String keys to encode as a JSON object —
// no extra conformance needed here.
