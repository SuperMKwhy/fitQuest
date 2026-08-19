//
//  DesignTokens.swift
//  fitQuest
//
//  Ported 1:1 from the RN app's apps/mobile/src/theme/tokens.js — single
//  source of truth for the color/spacing/radius scale used everywhere.
//

import SwiftUI

enum Tokens {
    enum Colors {
        static let primary = Color(hex: 0x006B55)
        static let onPrimary = Color(hex: 0xFFFFFF)
        static let primaryContainer = Color(hex: 0x3ECFAA)
        static let onPrimaryContainer = Color(hex: 0x005442)

        static let secondary = Color(hex: 0xAE2F34)
        static let onSecondary = Color(hex: 0xFFFFFF)
        static let secondaryContainer = Color(hex: 0xFF6B6B)
        static let onSecondaryContainer = Color(hex: 0x6D0010)

        static let tertiary = Color(hex: 0x765B00)
        static let onTertiary = Color(hex: 0xFFFFFF)
        static let tertiaryContainer = Color(hex: 0xE0B331)
        static let onTertiaryContainer = Color(hex: 0x5C4600)

        static let error = Color(hex: 0xBA1A1A)
        static let onError = Color(hex: 0xFFFFFF)
        static let errorContainer = Color(hex: 0xFFDAD6)
        static let onErrorContainer = Color(hex: 0x93000A)

        static let background = Color(hex: 0xFCF9F8)
        static let onBackground = Color(hex: 0x1C1B1B)
        static let surface = Color(hex: 0xFCF9F8)
        static let onSurface = Color(hex: 0x1C1B1B)
        static let onSurfaceVariant = Color(hex: 0x3C4A44)
        static let outline = Color(hex: 0x6C7A74)
        static let outlineVariant = Color(hex: 0xBBCAC3)

        static let surfaceContainerLowest = Color(hex: 0xFFFFFF)
        static let surfaceContainerLow = Color(hex: 0xF6F3F2)
        static let surfaceContainer = Color(hex: 0xF0EDED)
        static let surfaceContainerHigh = Color(hex: 0xEAE7E7)
        static let surfaceContainerHighest = Color(hex: 0xE5E2E1)

        static let inverseSurface = Color(hex: 0x313030)
        static let inverseOnSurface = Color(hex: 0xF3F0EF)
        static let inversePrimary = Color(hex: 0x50DDB7)

        /// The one canonical near-black used by every hard-border/hard-shadow component.
        static let ink = Color(hex: 0x1C1B1B)
    }

    enum Radius {
        static let base: CGFloat = 4
        static let lg: CGFloat = 8
        static let xl: CGFloat = 12
        static let full: CGFloat = 9999
    }

    enum Spacing {
        static let xs: CGFloat = 4
        static let base: CGFloat = 8
        static let sm: CGFloat = 12
        static let md: CGFloat = 24
        static let lg: CGFloat = 40
        static let xl: CGFloat = 64
    }

    /// The flat, non-blurred "brutalist" offset used by every card/button border.
    static let hardShadowOffset: CGFloat = 4
}

extension Color {
    init(hex: UInt32) {
        let r = Double((hex >> 16) & 0xFF) / 255
        let g = Double((hex >> 8) & 0xFF) / 255
        let b = Double(hex & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
