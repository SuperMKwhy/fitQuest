//
//  ShopScreen.swift
//  fitQuest
//
//  Ported from screens/ShopScreen.js — browse-only cosmetic shop; no
//  purchase endpoint exists on the backend yet, so items are read-only.
//

import SwiftUI

/// Maps the server's MaterialIcons `iconKey` strings to SF Symbols.
/// Falls back to a generic clothing icon (matches the RN default).
private func shopIconSymbol(for iconKey: String) -> String {
    switch iconKey {
    case "checkroom": return "tshirt.fill"
    case "content-cut": return "scissors"
    case "directions-run": return "shoeprints.fill"
    case "pets": return "pawprint.fill"
    case "diamond-stone": return "diamond.fill"
    default: return "tshirt.fill"
    }
}

struct ShopScreen: View {
    @EnvironmentObject private var appState: AppState

    @State private var items: [ShopItem] = []
    @State private var activeCategory = "all"

    private var categories: [String] {
        var seen = ["all"]
        for item in items where !seen.contains(item.category) {
            seen.append(item.category)
        }
        return seen
    }

    private var filteredItems: [ShopItem] {
        activeCategory == "all" ? items : items.filter { $0.category == activeCategory }
    }

    private let columns = [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                HStack {
                    Text("Shop").font(.title2.bold())
                    Spacer()
                    currencyPill(icon: "dollarsign.circle.fill", value: appState.profile?.coins ?? 0, color: Tokens.Colors.tertiaryContainer)
                    currencyPill(icon: "diamond.fill", value: appState.profile?.gems ?? 0, color: Tokens.Colors.primaryContainer)
                }

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Tokens.Spacing.sm) {
                        ForEach(categories, id: \.self) { category in
                            Button {
                                activeCategory = category
                            } label: {
                                Text(category.capitalized)
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                                    .padding(.horizontal, Tokens.Spacing.sm)
                                    .padding(.vertical, Tokens.Spacing.base)
                            }
                            .buttonStyle(.chibi(fill: activeCategory == category ? Tokens.Colors.primaryContainer : Tokens.Colors.surfaceContainerLowest))
                        }
                    }
                }

                if filteredItems.isEmpty {
                    Text("Nothing in stock yet.")
                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                        .padding(.vertical, Tokens.Spacing.lg)
                } else {
                    LazyVGrid(columns: columns, spacing: Tokens.Spacing.sm) {
                        ForEach(filteredItems) { item in
                            shopCard(item)
                        }
                    }
                }
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
        .task {
            items = (try? await APIClient.shared.getShopItems()) ?? []
        }
    }

    private func shopCard(_ item: ShopItem) -> some View {
        ChibiSurface {
            VStack(spacing: Tokens.Spacing.xs) {
                Image(systemName: shopIconSymbol(for: item.iconKey))
                    .font(.title2)
                    .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Tokens.Spacing.sm)

                Text(item.name)
                    .font(.caption.bold())
                    .lineLimit(1)

                if let gems = item.priceGems {
                    priceTag(icon: "diamond.fill", value: "\(gems)", color: Tokens.Colors.primaryContainer)
                } else if let coins = item.priceCoins {
                    priceTag(icon: "dollarsign.circle.fill", value: "\(coins)", color: Tokens.Colors.tertiaryContainer)
                } else {
                    Text("Owned")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                }
            }
            .padding(Tokens.Spacing.sm)
        }
    }

    private func priceTag(icon: String, value: String, color: Color) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon).font(.caption2).foregroundStyle(color)
            Text(value).font(.system(size: 11, weight: .bold))
        }
    }

    private func currencyPill(icon: String, value: Int, color: Color) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon).font(.caption).foregroundStyle(color)
            Text("\(value)").font(.system(size: 11, weight: .bold))
        }
        .padding(.horizontal, Tokens.Spacing.sm)
        .padding(.vertical, 6)
        .background(Tokens.Colors.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg))
        .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(Tokens.Colors.ink, lineWidth: 3))
    }
}

#Preview {
    ShopScreen()
        .environmentObject(AppState())
}
