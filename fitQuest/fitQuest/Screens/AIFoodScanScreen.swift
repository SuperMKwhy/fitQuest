//
//  AIFoodScanScreen.swift
//  fitQuest
//
//  Ported from screens/AIFoodScanScreen.js — camera-based food scanning via
//  the server's Gemini-vision endpoint. `macroPercents` is intentionally
//  not fixed to sum to exactly 100 (independent rounding, same as the RN
//  version). `mealType` is hardcoded to "Snack" regardless of time of day,
//  matching the RN version's known quirk rather than silently "fixing" it.
//

import SwiftUI
import UIKit

private enum ScanStatus {
    case idle, scanning, result, logging
}

struct AIFoodScanScreen: View {
    @EnvironmentObject private var router: Router

    @State private var status: ScanStatus = .idle
    @State private var photo: UIImage?
    @State private var result: FoodAnalysis?
    @State private var error: String?
    @State private var showCamera = false

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                header

                Text("Take a Photo!").font(.title3.bold())

                photoFrame

                if let error {
                    Text(error).foregroundStyle(Tokens.Colors.error).font(.footnote)
                }

                if let result, status == .result || status == .logging {
                    resultCard(result)
                }
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
        .navigationBarBackButtonHidden(true)
        .fullScreenCover(isPresented: $showCamera) {
            CameraImagePicker { image in
                photo = image
                Task { await scan(image) }
            }
            .ignoresSafeArea()
        }
    }

    private var header: some View {
        HStack {
            Button { router.pop() } label: {
                Image(systemName: "chevron.left")
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(Tokens.Colors.surfaceContainerLowest))
                    .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 2))
            }
            .buttonStyle(.plain)
            Spacer()
            Text("Calories Tracker").font(.headline).foregroundStyle(Tokens.Colors.primary)
            Spacer()
            Image(systemName: "gearshape.fill").opacity(0.4).frame(width: 40, height: 40)
        }
    }

    private var photoFrame: some View {
        ZStack {
            RoundedRectangle(cornerRadius: Tokens.Radius.lg)
                .stroke(Tokens.Colors.outlineVariant, lineWidth: 2)
                .background(Tokens.Colors.surfaceContainer.clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg)))

            if let photo {
                Image(uiImage: photo)
                    .resizable()
                    .scaledToFill()
                    .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg))
            } else {
                Image(systemName: "fork.knife")
                    .font(.system(size: 48))
                    .foregroundStyle(Tokens.Colors.onSurfaceVariant)
            }

            if status == .scanning {
                RoundedRectangle(cornerRadius: Tokens.Radius.lg)
                    .fill(Tokens.Colors.ink.opacity(0.3))
                VStack(spacing: Tokens.Spacing.base) {
                    ProgressView().tint(.white)
                    Text("Scanning…").foregroundStyle(.white)
                }
            }

            VStack {
                Spacer()
                shutterButton
                    .padding(.bottom, Tokens.Spacing.md)
            }
        }
        .aspectRatio(4.0 / 5.0, contentMode: .fit)
        .clipped()
    }

    private var shutterButton: some View {
        Button {
            showCamera = true
        } label: {
            Circle()
                .fill(Tokens.Colors.error)
                .frame(width: 48, height: 48)
                .overlay(Circle().stroke(Tokens.Colors.tertiaryContainer, lineWidth: 4).frame(width: 64, height: 64))
        }
        .buttonStyle(.plain)
        .opacity(status == .scanning ? 0.5 : 1)
        .disabled(status == .scanning)
    }

    private func resultCard(_ result: FoodAnalysis) -> some View {
        let macros = macroPercents(protein: result.proteinG, carbs: result.carbsG, fat: result.fatG)
        return ChibiSurface {
            VStack(alignment: .leading, spacing: Tokens.Spacing.sm) {
                HStack {
                    Image(systemName: "fork.knife").foregroundStyle(Tokens.Colors.primary)
                    Text(result.name).font(.headline)
                }

                HStack(spacing: Tokens.Spacing.sm) {
                    pill("Total \(result.calories) kcal", fill: Tokens.Colors.secondaryContainer)
                    pill("\(Int(result.confidencePercent.rounded()))% confidence", fill: Tokens.Colors.tertiaryContainer)
                }

                HStack(spacing: 2) {
                    Text("Protein \(macros.protein)%").font(.caption2)
                    Spacer()
                    Text("Carbs \(macros.carbs)%").font(.caption2)
                    Spacer()
                    Text("Fat \(macros.fat)%").font(.caption2)
                }
                GeometryReader { proxy in
                    HStack(spacing: 0) {
                        Rectangle().fill(Tokens.Colors.primary).frame(width: proxy.size.width * CGFloat(macros.protein) / 100)
                        Rectangle().fill(Tokens.Colors.tertiaryContainer).frame(width: proxy.size.width * CGFloat(macros.carbs) / 100)
                        Rectangle().fill(Tokens.Colors.secondaryContainer).frame(width: proxy.size.width * CGFloat(macros.fat) / 100)
                    }
                }
                .frame(height: 10)
                .clipShape(Capsule())
                HStack {
                    Text("\(Int(result.proteinG))g").font(.caption2)
                    Spacer()
                    Text("\(Int(result.carbsG))g").font(.caption2)
                    Spacer()
                    Text("\(Int(result.fatG))g").font(.caption2)
                }

                HStack(spacing: Tokens.Spacing.sm) {
                    Button {
                        Task { await logIt(result) }
                    } label: {
                        HStack {
                            if status == .logging { ProgressView().tint(Tokens.Colors.onPrimaryContainer) }
                            Image(systemName: "checkmark.circle.fill")
                            Text("Log it")
                        }
                        .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Tokens.Spacing.sm)
                    }
                    .buttonStyle(.chibi)
                    .disabled(status == .logging)

                    Button {
                        photo = nil
                        self.result = nil
                        status = .idle
                    } label: {
                        HStack {
                            Image(systemName: "camera.fill")
                            Text("Retake")
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Tokens.Spacing.sm)
                    }
                    .buttonStyle(.plain)
                    .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(style: StrokeStyle(lineWidth: 2, dash: [4])))
                }
            }
            .padding(Tokens.Spacing.md)
        }
    }

    private func pill(_ text: String, fill: Color) -> some View {
        Text(text)
            .font(.system(size: 11, weight: .bold))
            .padding(.horizontal, Tokens.Spacing.sm)
            .padding(.vertical, 4)
            .background(fill)
            .clipShape(Capsule())
    }

    private func macroPercents(protein: Double, carbs: Double, fat: Double) -> (protein: Int, carbs: Int, fat: Int) {
        let total = protein + carbs + fat
        guard total > 0 else { return (0, 0, 0) }
        return (
            Int((protein / total * 100).rounded()),
            Int((carbs / total * 100).rounded()),
            Int((fat / total * 100).rounded())
        )
    }

    private func scan(_ image: UIImage) async {
        error = nil
        status = .scanning
        guard let data = image.jpegData(compressionQuality: 0.5) else {
            error = "Couldn't process that photo."
            status = .idle
            return
        }
        let base64 = data.base64EncodedString()
        do {
            result = try await APIClient.shared.scanFood(imageBase64: base64, mimeType: "image/jpeg")
            status = .result
        } catch {
            self.error = error.localizedDescription
            status = .idle
        }
    }

    private func logIt(_ result: FoodAnalysis) async {
        status = .logging
        do {
            _ = try await APIClient.shared.logFood([
                "name": AnyEncodable(result.name),
                "mealType": AnyEncodable("Snack"),
                "calories": AnyEncodable(result.calories),
                "proteinG": AnyEncodable(result.proteinG),
                "carbsG": AnyEncodable(result.carbsG),
                "fatG": AnyEncodable(result.fatG),
                "source": AnyEncodable("scan"),
                "confidence": AnyEncodable(result.confidencePercent),
            ])
            // AIFoodScanScreen is only ever reached by pushing from an
            // already-open HealthLogScreen — pop back to it (matching the
            // RN version's `navigate('HealthLog')`, which jumps to the
            // already-in-stack screen rather than pushing a duplicate) so
            // its `.onAppear` refetch picks up the newly logged entry.
            router.pop()
        } catch {
            self.error = error.localizedDescription
            status = .result
        }
    }
}

#Preview {
    NavigationStack {
        AIFoodScanScreen()
            .environmentObject(Router())
    }
}
