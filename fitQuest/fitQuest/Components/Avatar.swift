//
//  Avatar.swift
//  fitQuest
//
//  Ported from components/Avatar.js — the shared avatar-part catalog and
//  compositing view, factored out of AvatarCreatorScreen so HomeScreen and
//  ProfileScreen can render whatever the player picked, not just the editor.
//

import SwiftUI

enum AvatarPart: String, CaseIterable {
    case body, hair, shirt, pant, shoe

    var icon: String {
        switch self {
        case .body: return "person.fill"
        case .hair: return "scissors"
        case .shirt: return "tshirt.fill"
        case .pant: return "figure.walk"
        case .shoe: return "shoeprints.fill"
        }
    }

    var label: String {
        switch self {
        case .body: return "Body"
        case .hair: return "Hair"
        case .shirt: return "Top"
        case .pant: return "Bottom"
        case .shoe: return "Shoes"
        }
    }

    var options: [String] {
        switch self {
        case .body: return ["slim", "athletic", "muscular", "shredded"]
        case .hair: return ["short", "twintails"]
        case .shirt: return ["tank", "henley", "jacket"]
        case .pant: return ["shorts", "joggers"]
        case .shoe: return ["sneakers"]
        }
    }
}

/// Bottom-to-top compositing order — matches the physical stacking the
/// assets were authored for: body at the bottom, shirt topmost.
let avatarRenderOrder: [AvatarPart] = [.body, .shoe, .hair, .pant, .shirt]

let defaultAvatarSelection: [AvatarPart: String] = [
    .body: "muscular", .hair: "short", .shirt: "jacket", .pant: "joggers", .shoe: "sneakers",
]

func avatarAssetName(_ part: AvatarPart, _ option: String) -> String {
    "Avatar_\(part.rawValue.capitalized)_\(option.capitalized)"
}

/// The server only persists hairStyle/skinTone today — shirt/pant/shoe fall
/// back to defaults until that lands, and any id it doesn't recognize
/// (renamed/removed option) also falls back instead of rendering a blank layer.
func avatarSelection(from profile: Profile?) -> [AvatarPart: String] {
    var selection = defaultAvatarSelection
    if let skinTone = profile?.skinTone, AvatarPart.body.options.contains(skinTone) {
        selection[.body] = skinTone
    }
    if let hairStyle = profile?.hairStyle, AvatarPart.hair.options.contains(hairStyle) {
        selection[.hair] = hairStyle
    }
    return selection
}

/// Composites the current selection in `avatarRenderOrder`.
struct AvatarCanvasView: View {
    let selection: [AvatarPart: String]

    var body: some View {
        ZStack {
            ForEach(avatarRenderOrder, id: \.self) { part in
                if let option = selection[part] {
                    Image(avatarAssetName(part, option))
                        .resizable()
                        .scaledToFit()
                }
            }
        }
    }
}

#Preview {
    AvatarCanvasView(selection: defaultAvatarSelection)
        .frame(width: 160, height: 310)
}
