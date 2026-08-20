//
//  MoodTrackerScreen.swift
//  fitQuest
//
//  Ported from screens/MoodTrackerScreen.js — local-only (no backend model
//  for mood exists yet), so history is in-memory and resets whenever this
//  screen's identity is recreated, matching the RN version exactly.
//

import SwiftUI

private struct Mood: Identifiable {
    let id: Int
    let icon: String
    let label: String
}

private let moods: [Mood] = [
    Mood(id: 0, icon: "face.dashed.fill", label: "Awful"),
    Mood(id: 1, icon: "cloud.rain.fill", label: "Bad"),
    Mood(id: 2, icon: "face.smiling", label: "Okay"),
    Mood(id: 3, icon: "face.smiling.fill", label: "Good"),
    Mood(id: 4, icon: "sun.max.fill", label: "Great"),
]

private struct MoodEntry: Identifiable {
    let id = UUID()
    let mood: Mood
    let note: String
    let date: Date
}

struct MoodTrackerScreen: View {
    @EnvironmentObject private var router: Router

    @State private var selectedMoodID: Int?
    @State private var note = ""
    @State private var history: [MoodEntry] = []

    var body: some View {
        ScrollView {
            VStack(spacing: Tokens.Spacing.md) {
                header

                ChibiSurface {
                    HStack {
                        Text(Self.dateFormatter.string(from: Date())).font(.headline)
                        Spacer()
                        Image(systemName: "calendar")
                    }
                    .padding(Tokens.Spacing.sm)
                }

                ChibiSurface {
                    HStack(spacing: Tokens.Spacing.sm) {
                        ForEach(moods) { mood in
                            Button {
                                selectedMoodID = mood.id
                            } label: {
                                Image(systemName: mood.icon)
                                    .font(.title2)
                                    .foregroundStyle(selectedMoodID == mood.id ? Color(hex: 0x005442) : Tokens.Colors.ink)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, Tokens.Spacing.sm)
                                    .background(selectedMoodID == mood.id ? Tokens.Colors.primaryContainer : Tokens.Colors.surfaceContainer)
                                    .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(Tokens.Spacing.sm)
                }

                VStack(alignment: .leading, spacing: Tokens.Spacing.base) {
                    Text("Daily Diary").font(.headline)
                    ChibiSurface {
                        TextEditor(text: $note)
                            .frame(height: 110)
                            .scrollContentBackground(.hidden)
                            .padding(Tokens.Spacing.xs)
                            .overlay(alignment: .topLeading) {
                                if note.isEmpty {
                                    Text("Write about your adventure today...")
                                        .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                                        .padding(.top, Tokens.Spacing.sm)
                                        .padding(.leading, Tokens.Spacing.base)
                                        .allowsHitTesting(false)
                                }
                            }
                    }

                    Button {
                        saveLog()
                    } label: {
                        Text("Save Log")
                            .font(.headline)
                            .foregroundStyle(Tokens.Colors.onPrimaryContainer)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Tokens.Spacing.sm)
                    }
                    .buttonStyle(.chibi)
                    .disabled(selectedMoodID == nil)
                }

                VStack(alignment: .leading, spacing: Tokens.Spacing.base) {
                    Text("Past entries").font(.headline)
                    if history.isEmpty {
                        Text("No mood logged yet — save one above.")
                            .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                    } else {
                        ForEach(history) { entry in
                            ChibiSurface {
                                HStack(alignment: .top, spacing: Tokens.Spacing.sm) {
                                    Image(systemName: entry.mood.icon).foregroundStyle(Color(hex: 0x006B55))
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(entry.mood.label).font(.headline)
                                        Text(Self.historyFormatter.string(from: entry.date))
                                            .font(.caption)
                                            .foregroundStyle(Tokens.Colors.onSurfaceVariant)
                                        if !entry.note.isEmpty {
                                            Text(entry.note).font(.subheadline)
                                        }
                                    }
                                }
                                .padding(Tokens.Spacing.sm)
                            }
                        }
                    }
                }
            }
            .padding(Tokens.Spacing.md)
        }
        .background(Tokens.Colors.background)
        .navigationBarBackButtonHidden(true)
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
            Text("Mood Tracker").font(.headline)
            Spacer()
            Image(systemName: "gearshape.fill").opacity(0.4)
                .frame(width: 40, height: 40)
        }
    }

    private func saveLog() {
        guard let selectedMoodID, let mood = moods.first(where: { $0.id == selectedMoodID }) else { return }
        history.insert(MoodEntry(mood: mood, note: note, date: Date()), at: 0)
        note = ""
    }

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMMM yyyy"
        return formatter
    }()

    private static let historyFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()
}

#Preview {
    NavigationStack {
        MoodTrackerScreen()
            .environmentObject(Router())
    }
}
