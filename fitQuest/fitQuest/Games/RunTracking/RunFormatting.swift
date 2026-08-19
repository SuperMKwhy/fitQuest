//
//  RunFormatting.swift
//  fitQuest
//
//  Consolidates RunTracker.native.js's formatDuration/formatPace (used for
//  the live run) and WorkoutSummaryScreen.js's near-duplicate versions
//  (which lacked the hour branch) into one shared implementation.
//

import Foundation

enum RunFormatting {
    static func duration(_ totalSeconds: Int) -> String {
        let h = totalSeconds / 3600
        let m = (totalSeconds % 3600) / 60
        let s = totalSeconds % 60
        if h > 0 {
            return String(format: "%d:%02d:%02d", h, m, s)
        }
        return String(format: "%d:%02d", m, s)
    }

    /// minutes-per-km pace; "--:--" until there's enough distance to be meaningful.
    static func pace(distanceM: Double, elapsedS: Int) -> String {
        guard distanceM >= 10 else { return "--:--" }
        let minPerKm = (Double(elapsedS) / 60) / (distanceM / 1000)
        guard minPerKm.isFinite, minPerKm >= 0 else { return "--:--" }
        let m = Int(minPerKm)
        let s = Int((minPerKm - Double(m)) * 60)
        return String(format: "%d:%02d", m, s)
    }
}
