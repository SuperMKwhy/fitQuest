//
//  AvatarCreatorScreen.swift
//  fitQuest
//
//  Ported from screens/AvatarCreatorScreen.js — onboarding step 3 of 3.
//  Layers real character-part PNGs (copied from the RN app's assets) in a
//  fixed z-order, with full undo/redo history over whole selections.
//

import SwiftUI

// AvatarPart, render order, default selection, and asset naming now live in
// Components/Avatar.swift, shared with HomeScreen and ProfileScreen.

struct AvatarCreatorScreen: View {
    @EnvironmentObject private var data: OnboardingData
    @EnvironmentObject private var appState: AppState
    @Binding var path: NavigationPath

    @State private var activePart: AvatarPart = .body
    @State private var selection = defaultAvatarSelection
    @State private var past: [[AvatarPart: String]] = []
    @State private var future: [[AvatarPart: String]] = []
    @State private var submitting = false
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                HStack {
                    headerIconButton("chevron.left") { path.removeLast() }
                    Spacer()
                    VStack(spacing: 2) {
                        Text("Create Your Avatar").font(.headline)
                        Text("✦ Build your legend. Be you. ✦")
                            .font(.caption2)
                            .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                    }
                    Spacer()
                    Color.clear.frame(width: 48, height: 48)
                }

                OnboardingStepper(step: 3)

                canvasSection

                categoryTabs

                swatchRow

                if let error {
                    Text(error).foregroundStyle(Tokens.Colors.error).font(.footnote)
                }

                Button {
                    Task { await finish() }
                } label: {
                    HStack {
                        Text(submitting ? "Saving…" : "Let's go!").font(.headline)
                        if !submitting { Image(systemName: "chevron.right") }
                    }
                    .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Tokens.Spacing.sm)
                }
                .buttonStyle(.chibi)
                .disabled(submitting)

                tipCard
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
        .toolbar(.hidden, for: .navigationBar)
    }

    private var canvasSection: some View {
        ChibiSurface {
            ZStack {
                VStack {
                    HStack {
                        Text("✦").font(.system(size: 20)).foregroundStyle(Tokens.Colors.primaryContainer)
                        Spacer()
                        Text("✦").font(.system(size: 16)).foregroundStyle(Tokens.Colors.tertiaryContainer)
                    }
                    Spacer()
                }
                .padding(Tokens.Spacing.md)

                ZStack {
                    ForEach(avatarRenderOrder, id: \.self) { part in
                        if let option = selection[part] {
                            Image(avatarAssetName(part, option))
                                .resizable()
                                .scaledToFit()
                        }
                    }
                }
                .aspectRatio(260.0 / 505.0, contentMode: .fit)
                .frame(maxWidth: .infinity)
                .padding(.vertical, Tokens.Spacing.md)

                VStack {
                    Spacer()
                    HStack {
                        undoRedoButton("arrow.uturn.backward", enabled: !past.isEmpty, action: undo)
                        Spacer()
                        undoRedoButton("arrow.uturn.forward", enabled: !future.isEmpty, action: redo)
                    }
                }
                .padding(Tokens.Spacing.sm)
            }
            .frame(height: 340)
            .clipped()
        }
    }

    private func undoRedoButton(_ systemName: String, enabled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .frame(width: 36, height: 36)
                .background(Tokens.Colors.surfaceContainerLowest)
                .clipShape(Circle())
                .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 2))
        }
        .buttonStyle(.plain)
        .opacity(enabled ? 1 : 0.4)
        .disabled(!enabled)
    }

    private var categoryTabs: some View {
        ChibiSurface {
            HStack(spacing: 0) {
                ForEach(Array(AvatarPart.allCases.enumerated()), id: \.element) { index, part in
                    Button {
                        activePart = part
                    } label: {
                        VStack(spacing: 2) {
                            Image(systemName: part.icon)
                            Text(part.label).font(.caption2)
                        }
                        .foregroundStyle(activePart == part ? Tokens.Colors.onPrimaryContainer : Tokens.Colors.onSurfaceVariant)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Tokens.Spacing.base)
                        .background(activePart == part ? Tokens.Colors.primaryContainer : Color.clear)
                    }
                    .buttonStyle(.plain)
                    if index != AvatarPart.allCases.count - 1 {
                        Rectangle().fill(Tokens.Colors.ink).frame(width: 3)
                    }
                }
            }
        }
    }

    private var swatchRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Tokens.Spacing.sm) {
                ForEach(activePart.options, id: \.self) { option in
                    let isSelected = selection[activePart] == option
                    Button {
                        select(option, for: activePart)
                    } label: {
                        VStack(spacing: 4) {
                            Image(avatarAssetName(activePart, option))
                                .resizable()
                                .scaledToFit()
                                .frame(width: 56, height: 56)
                                .overlay(
                                    RoundedRectangle(cornerRadius: Tokens.Radius.base)
                                        .stroke(isSelected ? Tokens.Colors.primaryContainer : Tokens.Colors.outlineVariant, lineWidth: isSelected ? 3 : 2)
                                )
                            Text(option.capitalized).font(.caption2)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.vertical, Tokens.Spacing.xs)
        }
    }

    private var tipCard: some View {
        HStack(alignment: .top, spacing: Tokens.Spacing.sm) {
            Image(systemName: "star.fill")
                .foregroundStyle(Tokens.Colors.tertiaryContainer)
            (Text("Tip: ").foregroundColor(Tokens.Colors.onSurface)
                + Text("You can change your avatar later in profile settings!")
                    .fontWeight(.bold).foregroundColor(Tokens.Colors.primary))
            Spacer()
            Text("✦").foregroundStyle(Tokens.Colors.primaryContainer)
        }
        .padding(Tokens.Spacing.sm)
        .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(Tokens.Colors.outlineVariant, lineWidth: 2))
    }

    private func headerIconButton(_ systemName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName).font(.title3)
        }
        .buttonStyle(.plain)
        .frame(width: 48, height: 48)
        .background(Tokens.Colors.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg))
        .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(Tokens.Colors.ink, lineWidth: 3))
    }

    private func select(_ option: String, for part: AvatarPart) {
        guard selection[part] != option else { return }
        past.append(selection)
        future.removeAll()
        selection[part] = option
    }

    private func undo() {
        guard let previous = past.popLast() else { return }
        future.append(selection)
        selection = previous
    }

    private func redo() {
        guard let next = future.popLast() else { return }
        past.append(selection)
        selection = next
    }

    private func finish() async {
        error = nil
        submitting = true
        defer { submitting = false }
        do {
            try await appState.completeOnboarding([
                "goal": AnyEncodable(data.goal),
                "heightCm": AnyEncodable(data.heightCm.rounded()),
                "weightKg": AnyEncodable(data.weightKg.rounded()),
                "skinTone": AnyEncodable(selection[.body] ?? "muscular"),
                "hairStyle": AnyEncodable(selection[.hair] ?? "short"),
            ])
        } catch {
            self.error = error.localizedDescription
        }
    }
}

#Preview {
    NavigationStack {
        AvatarCreatorScreen(path: .constant(NavigationPath()))
            .environmentObject(OnboardingData())
            .environmentObject(AppState())
    }
}
