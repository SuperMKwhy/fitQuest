//
//  AuthScreen.swift
//  fitQuest
//
//  Ported from screens/AuthScreen.js — login/register form. No design
//  mockup exists for this screen in the original RN app either; this
//  styling (matching the rest of the design system) is the source of
//  truth.
//

import SwiftUI
import UIKit

private enum AuthMode {
    case login, register
}

struct AuthScreen: View {
    @EnvironmentObject private var appState: AppState

    @State private var mode: AuthMode = .login
    @State private var email = ""
    @State private var password = ""
    @State private var displayName = ""
    @State private var error: String?
    @State private var submitting = false

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                VStack(spacing: Tokens.Spacing.xs) {
                    Text("FitQuest")
                        .font(.system(size: 30, weight: .bold))
                        .foregroundStyle(Tokens.Colors.onBackground)
                    Text(mode == .login ? "Welcome back" : "Create your account")
                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                }
                .padding(.top, Tokens.Spacing.xl)

                ChibiSurface {
                    VStack(spacing: 0) {
                        if mode == .register {
                            field("Display name", text: $displayName, autocapitalize: .words)
                            divider
                        }
                        field("Email", text: $email, keyboard: .emailAddress, autocapitalize: .never)
                        divider
                        secureField("Password", text: $password)
                    }
                }

                if let error {
                    Text(error)
                        .foregroundStyle(Tokens.Colors.error)
                        .font(.footnote)
                }

                Button {
                    Task { await submit() }
                } label: {
                    Text(submitting ? "Please wait…" : (mode == .login ? "Log in" : "Sign up"))
                        .font(.headline)
                        .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Tokens.Spacing.sm)
                }
                .buttonStyle(.chibi)
                .disabled(submitting)

                Button {
                    mode = mode == .login ? .register : .login
                    error = nil
                } label: {
                    Text(mode == .login ? "Don't have an account? Sign up" : "Already have an account? Log in")
                        .font(.footnote)
                        .foregroundStyle(Tokens.Colors.primary)
                }
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
        .scrollDismissesKeyboard(.interactively)
    }

    private var divider: some View {
        Rectangle()
            .fill(Tokens.Colors.outlineVariant)
            .frame(height: 2)
    }

    private func field(
        _ placeholder: String, text: Binding<String>,
        keyboard: UIKeyboardType = .default, autocapitalize: TextInputAutocapitalization = .sentences
    ) -> some View {
        TextField(placeholder, text: text)
            .keyboardType(keyboard)
            .textInputAutocapitalization(autocapitalize)
            .autocorrectionDisabled()
            .padding(Tokens.Spacing.sm)
    }

    private func secureField(_ placeholder: String, text: Binding<String>) -> some View {
        SecureField(placeholder, text: text)
            .padding(Tokens.Spacing.sm)
    }

    private func submit() async {
        error = nil
        submitting = true
        defer { submitting = false }
        do {
            if mode == .login {
                try await appState.login(email: email, password: password)
            } else {
                try await appState.register(email: email, password: password, displayName: displayName)
            }
        } catch {
            self.error = error.localizedDescription
        }
    }
}

#Preview {
    AuthScreen()
        .environmentObject(AppState())
}
