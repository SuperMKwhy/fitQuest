//
//  HealthLogScreen.swift
//  fitQuest
//
//  Ported from screens/HealthLogScreen.js. The `date` query param must be
//  the ISO instant of the *client's* local midnight for that day (a recent
//  server-side fix — see apps/server's foodLog.ts) — sending a bare
//  YYYY-MM-DD would get reinterpreted as UTC midnight and silently shift
//  "today" by the local UTC offset.
//

import SwiftUI

private let mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"]
private let calorieTarget = 2000
private let waterTarget = 8

struct HealthLogScreen: View {
    @EnvironmentObject private var router: Router

    @State private var selectedDate = Calendar.current.startOfDay(for: Date())
    @State private var foodLog: [FoodLog] = []
    @State private var loading = false
    @State private var error: String?
    @State private var waterCount = 5

    @State private var modalVisible = false
    @State private var activeMealType = "Snack"
    @State private var foodName = ""
    @State private var foodCalories = ""
    @State private var submitting = false

    private var isToday: Bool { Calendar.current.isDateInToday(selectedDate) }

    private var dateLabel: String {
        if isToday { return "Today" }
        if Calendar.current.isDateInYesterday(selectedDate) { return "Yesterday" }
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: selectedDate)
    }

    private var totals: (calories: Int, protein: Double, carbs: Double, fat: Double) {
        foodLog.reduce((0, 0.0, 0.0, 0.0)) { acc, entry in
            (acc.0 + entry.calories, acc.1 + (entry.proteinG ?? 0), acc.2 + (entry.carbsG ?? 0), acc.3 + (entry.fatG ?? 0))
        }
    }

    private func entries(for mealType: String) -> [FoodLog] {
        foodLog.filter { $0.mealType == mealType }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                header

                Button {
                    router.push(.aiFoodScan)
                } label: {
                    HStack {
                        Image(systemName: "camera.fill")
                        Text("Scan food").font(.headline)
                    }
                    .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Tokens.Spacing.sm)
                }
                .buttonStyle(.chibi)

                if let error {
                    ChibiSurface {
                        Text(error).foregroundStyle(Tokens.Colors.error).padding(Tokens.Spacing.sm)
                    }
                }

                dateAndProgressCard

                mealSections

                waterTracker
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
        .navigationBarBackButtonHidden(true)
        .onAppear { Task { await load() } }
        .onChange(of: selectedDate) { _, _ in Task { await load() } }
        .overlay {
            if modalVisible { addFoodModal }
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
            Text("Health Log").font(.headline).foregroundStyle(Tokens.Colors.primary)
            Spacer()
            Image(systemName: "gearshape.fill").opacity(0.4).frame(width: 40, height: 40)
        }
    }

    private var dateAndProgressCard: some View {
        ChibiSurface {
            VStack(spacing: Tokens.Spacing.sm) {
                HStack {
                    Button {
                        selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate) ?? selectedDate
                    } label: {
                        Image(systemName: "chevron.left")
                    }
                    .buttonStyle(.plain)

                    Spacer()
                    Text(dateLabel).font(.headline)
                    Spacer()

                    Button {
                        selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate
                    } label: {
                        Image(systemName: "chevron.right")
                    }
                    .buttonStyle(.plain)
                    .disabled(isToday)
                    .opacity(isToday ? 0.3 : 1)
                }

                if loading {
                    ProgressView()
                } else {
                    VStack(spacing: Tokens.Spacing.xs) {
                        Text("\(totals.calories) / \(calorieTarget) kcal")
                            .font(.title2.bold())
                        GeometryReader { proxy in
                            ZStack(alignment: .leading) {
                                Capsule().fill(Tokens.Colors.surfaceContainerHigh)
                                Capsule().fill(Tokens.Colors.primaryContainer)
                                    .frame(width: proxy.size.width * min(1, Double(totals.calories) / Double(calorieTarget)))
                            }
                        }
                        .frame(height: 10)

                        HStack {
                            macroSummary(label: "PROTEIN", value: totals.protein, color: Tokens.Colors.secondaryContainer)
                            Spacer()
                            macroSummary(label: "CARBS", value: totals.carbs, color: Tokens.Colors.tertiaryContainer)
                            Spacer()
                            macroSummary(label: "FAT", value: totals.fat, color: Tokens.Colors.primary)
                        }
                    }
                }
            }
            .padding(Tokens.Spacing.sm)
        }
    }

    private func macroSummary(label: String, value: Double, color: Color) -> some View {
        VStack(spacing: 2) {
            Text("\(Int(value.rounded()))g").font(.headline).foregroundStyle(color)
            Text(label).font(.system(size: 9, weight: .bold)).foregroundStyle(Tokens.Colors.onSurfaceVariant)
        }
    }

    private var mealSections: some View {
        let populated = mealTypes.filter { !entries(for: $0).isEmpty }
        return VStack(alignment: .leading, spacing: Tokens.Spacing.md) {
            if populated.isEmpty {
                Text(isToday ? "No food logged yet today" : "No food logged yet this day")
                    .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Tokens.Spacing.md)
            } else {
                ForEach(populated, id: \.self) { mealType in
                    mealSection(mealType)
                }
            }

            addFoodButton(mealType: "Snack")
        }
    }

    private func mealSection(_ mealType: String) -> some View {
        let items = entries(for: mealType)
        let kcal = items.reduce(0) { $0 + $1.calories }
        return VStack(alignment: .leading, spacing: Tokens.Spacing.base) {
            HStack {
                Text(mealType).font(.headline)
                Spacer()
                Text("\(kcal) kcal").font(.subheadline).foregroundStyle(Tokens.Colors.onSurfaceVariant)
            }
            ForEach(items) { item in
                ChibiSurface {
                    HStack(spacing: Tokens.Spacing.sm) {
                        Image(systemName: item.source == "scan" ? "camera.fill" : "fork.knife")
                            .foregroundStyle(Tokens.Colors.primary)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.name).font(.subheadline.bold())
                            Text(Self.timeFormatter.string(from: item.loggedAt))
                                .font(.caption2)
                                .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                        }
                        Spacer()
                        Text("\(item.calories) kcal").font(.subheadline)
                    }
                    .padding(Tokens.Spacing.sm)
                }
            }
            addFoodButton(mealType: mealType)
        }
    }

    private func addFoodButton(mealType: String) -> some View {
        Button {
            activeMealType = mealType
            foodName = ""
            foodCalories = ""
            modalVisible = true
        } label: {
            HStack {
                Image(systemName: "plus")
                Text("Add \(mealType.lowercased())")
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Tokens.Spacing.sm)
            .foregroundStyle(Tokens.Colors.onSurfaceVariant)
        }
        .buttonStyle(.plain)
        .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.lg).stroke(style: StrokeStyle(lineWidth: 2, dash: [4])))
    }

    private var waterTracker: some View {
        ChibiSurface {
            VStack(alignment: .leading, spacing: Tokens.Spacing.sm) {
                HStack {
                    Text("Today's Water Intake").font(.headline)
                    Spacer()
                    Text("Goal: \(waterTarget) Cups").font(.caption).foregroundStyle(Tokens.Colors.onSurfaceVariant)
                }
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 8), spacing: Tokens.Spacing.xs) {
                    ForEach(0..<waterTarget, id: \.self) { index in
                        Button {
                            toggleWater(at: index)
                        } label: {
                            Image(systemName: "drop.fill")
                                .foregroundStyle(index < waterCount ? Color(hex: 0x005442) : Color(hex: 0x6C7A74))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, Tokens.Spacing.sm)
                                .background(index < waterCount ? Tokens.Colors.primaryContainer : Tokens.Colors.surfaceContainerLowest)
                                .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.base))
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(Tokens.Spacing.sm)
        }
    }

    /// "Fill to index" semantics (like a star rating), not independent
    /// per-cup toggling: tapping a filled cup truncates down to it, tapping
    /// the next unfilled cup increments by one.
    private func toggleWater(at index: Int) {
        waterCount = index < waterCount ? index : index + 1
    }

    private var addFoodModal: some View {
        ZStack {
            Color.black.opacity(0.5).ignoresSafeArea()
                .onTapGesture { modalVisible = false }

            ChibiSurface {
                VStack(spacing: Tokens.Spacing.md) {
                    Text("Add food · \(activeMealType)").font(.headline)

                    TextField("Food name", text: $foodName)
                        .padding(Tokens.Spacing.sm)
                        .background(Tokens.Colors.surfaceContainer)
                        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.base))

                    TextField("Calories", text: $foodCalories)
                        .keyboardType(.numberPad)
                        .padding(Tokens.Spacing.sm)
                        .background(Tokens.Colors.surfaceContainer)
                        .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.base))

                    HStack(spacing: Tokens.Spacing.sm) {
                        Button {
                            modalVisible = false
                        } label: {
                            Text("Cancel").frame(maxWidth: .infinity).padding(.vertical, Tokens.Spacing.sm)
                        }
                        .buttonStyle(.chibi(fill: Tokens.Colors.surfaceContainer))

                        Button {
                            Task { await submitManualEntry() }
                        } label: {
                            HStack {
                                if submitting { ProgressView() }
                                Text("Add")
                            }
                            .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Tokens.Spacing.sm)
                        }
                        .buttonStyle(.chibi)
                        .disabled(submitting || foodName.trimmingCharacters(in: .whitespaces).isEmpty || Int(foodCalories) == nil)
                    }
                }
                .padding(Tokens.Spacing.md)
            }
            .padding(Tokens.Spacing.xl)
        }
    }

    /// Local-midnight instant for `selectedDate`, formatted as a UTC ISO8601
    /// string — matches what the server now expects (see file header).
    private func localMidnightISOString(for date: Date) -> String {
        let startOfDay = Calendar.current.startOfDay(for: date)
        return ISO8601DateFormatter().string(from: startOfDay)
    }

    /// Combines `selectedDate`'s day with the current wall-clock time —
    /// logging a snack on "Yesterday" still stamps today's clock time onto
    /// yesterday's date, matching the RN version exactly.
    private func loggedAtForManualEntry() -> Date {
        let calendar = Calendar.current
        var dayComponents = calendar.dateComponents([.year, .month, .day], from: selectedDate)
        let timeComponents = calendar.dateComponents([.hour, .minute, .second], from: Date())
        dayComponents.hour = timeComponents.hour
        dayComponents.minute = timeComponents.minute
        dayComponents.second = timeComponents.second
        return calendar.date(from: dayComponents) ?? Date()
    }

    private func load() async {
        loading = true
        error = nil
        defer { loading = false }
        do {
            foodLog = try await APIClient.shared.getFoodLog(date: localMidnightISOString(for: selectedDate))
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func submitManualEntry() async {
        guard let calories = Int(foodCalories), !foodName.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        submitting = true
        defer { submitting = false }
        do {
            _ = try await APIClient.shared.logFood([
                "name": AnyEncodable(foodName),
                "mealType": AnyEncodable(activeMealType),
                "calories": AnyEncodable(calories),
                "source": AnyEncodable("manual"),
                "loggedAt": AnyEncodable(ISO8601DateFormatter().string(from: loggedAtForManualEntry())),
            ])
            modalVisible = false
            await load()
        } catch {
            self.error = error.localizedDescription
        }
    }

    private static let timeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter
    }()
}

#Preview {
    NavigationStack {
        HealthLogScreen()
            .environmentObject(Router())
    }
}
