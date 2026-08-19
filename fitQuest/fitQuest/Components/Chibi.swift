//
//  Chibi.swift
//  fitQuest
//
//  Ported from apps/mobile/src/components/Chibi.js: the "brutalist chibi"
//  hard-shadow visual language used on nearly every screen. RN's shadow
//  props are always blurred, so both here and there this is faked with a
//  second solid ink-colored layer offset by Tokens.hardShadowOffset.
//

import SwiftUI

/// A bordered card with a flat offset "shadow" — equivalent of `ChibiSurface`.
struct ChibiSurface<Content: View>: View {
    var cornerRadius: CGFloat = Tokens.Radius.lg
    var fill: Color = Tokens.Colors.surfaceContainerLowest
    @ViewBuilder var content: () -> Content

    var body: some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: cornerRadius)
                .fill(Tokens.Colors.ink)
                .offset(x: Tokens.hardShadowOffset, y: Tokens.hardShadowOffset)

            content()
                .background(fill)
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
                .overlay(
                    RoundedRectangle(cornerRadius: cornerRadius)
                        .stroke(Tokens.Colors.ink, lineWidth: 3)
                )
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}

/// The offset-on-press hard-shadow button style — equivalent of `ChibiButton`.
/// No animation/easing: the content instantly snaps onto the shadow layer
/// while pressed, matching the RN version's render-prop press swap.
struct ChibiButtonStyle: ButtonStyle {
    var fill: Color = Tokens.Colors.primaryContainer
    var cornerRadius: CGFloat = Tokens.Radius.lg

    func makeBody(configuration: Configuration) -> some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: cornerRadius)
                .fill(Tokens.Colors.ink)
                .offset(x: Tokens.hardShadowOffset, y: Tokens.hardShadowOffset)

            configuration.label
                .background(fill)
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
                .overlay(
                    RoundedRectangle(cornerRadius: cornerRadius)
                        .stroke(Tokens.Colors.ink, lineWidth: 3)
                )
                .offset(
                    x: configuration.isPressed ? Tokens.hardShadowOffset : 0,
                    y: configuration.isPressed ? Tokens.hardShadowOffset : 0
                )
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}

extension ButtonStyle where Self == ChibiButtonStyle {
    static var chibi: ChibiButtonStyle { ChibiButtonStyle() }
    static func chibi(fill: Color) -> ChibiButtonStyle { ChibiButtonStyle(fill: fill) }
}
