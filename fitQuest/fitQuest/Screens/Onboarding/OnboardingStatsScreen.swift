//
//  OnboardingStatsScreen.swift
//  fitQuest
//
//  Ported from screens/OnboardingStatsScreen.js — onboarding step 2 of 3.
//  Canonical storage is always heightCm/weightKg; display converts on the
//  fly per the selected unit, and typing in the non-canonical unit
//  converts back to canonical on every keystroke (same round-trip
//  precision behavior as the RN version).
//

import SwiftUI

private enum HeightUnit: String, CaseIterable { case cm, ft }
private enum WeightUnit: String, CaseIterable { case kg, lb }

private let cmPerFt = 30.48
private let kgPerLb = 0.453592

struct OnboardingStatsScreen: View {
    @EnvironmentObject private var data: OnboardingData
    @Binding var path: NavigationPath

    @State private var heightUnit: HeightUnit = .cm
    @State private var weightUnit: WeightUnit = .kg

    private var bmi: Double? {
        guard data.heightCm > 0, data.weightKg > 0 else { return nil }
        let heightM = data.heightCm / 100
        let value = data.weightKg / (heightM * heightM)
        return value.isFinite ? value : nil
    }

    private var bmiCategory: String {
        guard let bmi else { return "Get a personalized plan!" }
        switch bmi {
        case ..<18.5: return "Underweight range"
        case ..<25: return "Healthy range"
        case ..<30: return "Overweight range"
        default: return "High range"
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                HStack {
                    headerIconButton("chevron.left") { path.removeLast() }
                    Spacer()
                    OnboardingStepper(step: 2)
                    Spacer()
                    Color.clear.frame(width: 48, height: 48)
                }

                VStack(spacing: Tokens.Spacing.xs) {
                    Text("Your Stats")
                        .font(.title2.weight(.bold))
                        .textCase(.uppercase)
                    Text("Let's get to know you better!")
                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                }

                HStack(alignment: .top, spacing: Tokens.Spacing.sm) {
                    Image("Onboarding_StatsTrainer")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 110)

                    VStack(spacing: Tokens.Spacing.sm) {
                        statField(
                            icon: "figure.arms.open", label: "Height",
                            value: heightDisplayBinding, unit: $heightUnit
                        )
                        statField(
                            icon: "scalemass", label: "Weight",
                            value: weightDisplayBinding, unit: $weightUnit
                        )
                    }
                }

                ChibiSurface {
                    VStack(alignment: .leading, spacing: Tokens.Spacing.sm) {
                        HStack {
                            Image(systemName: "function")
                                .padding(6)
                                .background(Circle().fill(Tokens.Colors.primaryContainer))
                            Text("We'll do the math for you!")
                                .font(.headline)
                        }
                        HStack {
                            Text(bmi.map { String(format: "%.1f", $0) } ?? "- - . -")
                                .font(.title3.bold())
                                .padding(.horizontal, Tokens.Spacing.sm)
                                .padding(.vertical, 4)
                                .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.base).stroke(Tokens.Colors.ink, lineWidth: 2))
                            Image(systemName: "arrow.right")
                            Text(bmiCategory)
                                .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                        }
                    }
                    .padding(Tokens.Spacing.sm)
                }

                VStack(spacing: Tokens.Spacing.base) {
                    Button {
                        path.append(OnboardingStep.avatar)
                    } label: {
                        HStack {
                            Text("Continue").font(.headline)
                            Image(systemName: "chevron.right")
                        }
                        .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Tokens.Spacing.sm)
                    }
                    .buttonStyle(.chibi)

                    Text("✦ You can change this later ✦")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                }
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
        .toolbar(.hidden, for: .navigationBar)
    }

    private var heightDisplayBinding: Binding<String> {
        Binding(
            get: {
                switch heightUnit {
                case .cm: return String(format: "%.0f", data.heightCm)
                case .ft: return String(format: "%.1f", data.heightCm / cmPerFt)
                }
            },
            set: { newValue in
                guard let parsed = Double(newValue) else { return }
                data.heightCm = heightUnit == .cm ? parsed : parsed * cmPerFt
            }
        )
    }

    private var weightDisplayBinding: Binding<String> {
        Binding(
            get: {
                switch weightUnit {
                case .kg: return String(format: "%.0f", data.weightKg)
                case .lb: return String(format: "%.0f", data.weightKg / kgPerLb)
                }
            },
            set: { newValue in
                guard let parsed = Double(newValue) else { return }
                data.weightKg = weightUnit == .kg ? parsed : parsed * kgPerLb
            }
        )
    }

    private func statField<Unit: RawRepresentable & CaseIterable & Hashable>(
        icon: String, label: String, value: Binding<String>, unit: Binding<Unit>
    ) -> some View where Unit.RawValue == String, Unit.AllCases: RandomAccessCollection {
        ChibiSurface {
            VStack(alignment: .leading, spacing: Tokens.Spacing.xs) {
                HStack(spacing: 4) {
                    Image(systemName: icon)
                    Text(label).font(.caption.bold())
                }
                .foregroundStyle(Tokens.Colors.onSurfaceVariant)

                TextField("0", text: value)
                    .keyboardType(.decimalPad)
                    .font(.title3.bold())

                HStack(spacing: 0) {
                    ForEach(Array(Unit.allCases), id: \.self) { option in
                        Button {
                            unit.wrappedValue = option
                        } label: {
                            Circle()
                                .fill(unit.wrappedValue == option ? Tokens.Colors.primaryContainer : Tokens.Colors.surfaceContainerLowest)
                                .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 2))
                                .overlay(Text(option.rawValue).font(.system(size: 9, weight: .bold)))
                                .frame(width: 24, height: 24)
                        }
                        .buttonStyle(.plain)
                        .padding(2)
                    }
                }
                .padding(2)
                .background(Tokens.Colors.surfaceContainer)
                .clipShape(Capsule())
                .overlay(Capsule().stroke(Tokens.Colors.ink, lineWidth: 3))
            }
            .padding(Tokens.Spacing.sm)
        }
    }

    private func headerIconButton(_ systemName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.title3)
        }
        .buttonStyle(.plain)
        .frame(width: 48, height: 48)
        .background(Tokens.Colors.surfaceContainerLowest)
        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg))
        .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(Tokens.Colors.ink, lineWidth: 3))
    }
}

#Preview {
    NavigationStack {
        OnboardingStatsScreen(path: .constant(NavigationPath()))
            .environmentObject(OnboardingData())
    }
}
