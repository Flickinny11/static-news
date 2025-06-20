import Foundation
import SwiftUI

// MARK: - Main Models

struct Anchor: Identifiable {
    let id = UUID()
    let name: String
    let title: String
    let emoji: String
    let color: Color
    let bio: String
    var currentStatus: String
    var currentMood: String
    var isHavingBreakdown: Bool = false
    var confusionLevel: Int
    var errorCount: Int
    var breakdownCount: Int
    var signaturePhrases: [String]
    var wordsPerMinute: Int
    var accuracyRate: Int
    var mispronunciationCount: Int
    var deadAirCount: Int
    var sponsorMisreadCount: Int
    var personalityTraits: [PersonalityTrait]
    var highlights: [Highlight]
    var recentBreakdowns: [Breakdown]
    var totalBreakdowns: Int
    var averageBreakdownDuration: String
    var longestBreakdownDays: Int
    
    var statusColor: Color {
        if isHavingBreakdown { return .red }
        if confusionLevel > 80 { return .orange }
        return .green
    }
}

struct PersonalityTrait {
    let trait: String
    let level: Double
}

struct Highlight: Identifiable {
    let id = UUID()
    let date: Date
    let title: String
    let description: String
    let icon: String
    let isViral: Bool
    let views: String
    let reactions: String
}

struct Breakdown: Identifiable {
    let id = UUID()
    let date: Date
    let trigger: String
    let severity: BreakdownSeverity
    let duration: String
    let description: String
    let stages: [String]
}

enum BreakdownSeverity: String {
    case mild = "Mild"
    case moderate = "Moderate"
    case severe = "Severe"
    case critical = "CRITICAL"
    
    var color: Color {
        switch self {
        case .mild: return .yellow
        case .moderate: return .orange
        case .severe: return .red
        case .critical: return .purple
        }
    }
}

// MARK: - News & Events

struct NewsEvent: Identifiable {
    let id = UUID()
    let timestamp: String
    let description: String
    let severity: EventSeverity
}

enum EventSeverity {
    case low, medium, high, critical
    
    var color: Color {
        switch self {
        case .low: return .green
        case .medium: return .yellow
        case .high: return .orange
        case .critical: return .red
        }
    }
}

// MARK: - Incidents

struct Incident: Identifiable {
    let id = UUID()
    let codeName: String
    let timestamp: Date
    let type: IncidentType
    let severity: IncidentSeverity
    let description: String
    let fullDescription: String
    let anchorsInvolved: [String]
    let anchorRoles: [String: String]
    let duration: Int
    let viewerReactions: Int
    let isResolved: Bool
    let timeline: [TimelineEvent]
    let detailedTimeline: [DetailedTimelineEvent]
    let impacts: [String]
    let keyMoments: [String]
    let rootCause: String
    let contributingFactors: [String]
    let lessonsLearned: [String]
    let preventionMeasures: String
}

struct TimelineEvent: Identifiable {
    let id = UUID()
    let time: String
    let description: String
}

struct DetailedTimelineEvent: Identifiable {
    let id = UUID()
    let time: String
    let relativeTime: String
    let title: String
    let description: String
    let impact: String?
}

enum IncidentType: String {
    case breakdown = "Breakdown"
    case technical = "Technical"
    case sponsorMisread = "Sponsor"
    case verbalSlip = "Verbal"
    
    var icon: String {
        switch self {
        case .breakdown: return "brain.head.profile"
        case .technical: return "exclamationmark.triangle"
        case .sponsorMisread: return "dollarsign.circle"
        case .verbalSlip: return "bubble.left.and.exclamationmark.bubble.right"
        }
    }
    
    var color: Color {
        switch self {
        case .breakdown: return .red
        case .technical: return .orange
        case .sponsorMisread: return .green
        case .verbalSlip: return .purple
        }
    }
}

enum IncidentSeverity: String {
    case low = "Low"
    case medium = "Medium"
    case high = "High"
    case critical = "Critical"
    
    var color: Color {
        switch self {
        case .low: return .green
        case .medium: return .yellow
        case .high: return .orange
        case .critical: return .red
        }
    }
}

// MARK: - Sponsors

struct Sponsor: Identifiable {
    let id = UUID()
    let name: String
    let logoEmoji: String
    let brandColor: Color
    let tagline: String
    let description: String
    let tier: SponsorshipTier
    let startDate: Date
    let monthlyValue: Int
    let totalSpent: Int
    let isActive: Bool
    let contractLength: String
    let specialRequests: [String]
    
    // Performance metrics
    let totalMisreads: Int
    let percentageButchered: Int
    let roi: String
    let satisfaction: Int
    let recentMisreads: [String]
    let hallOfFameMisreads: [Misread]
    let misreadPatterns: [MisreadPattern]
    
    // Analytics
    let brandAwareness: String
    let memePotential: String
    let brandConfusion: String
    let viralMoments: Int
    let chaosLevel: String
    
    let testimonial: Testimonial?
}

struct Misread: Identifiable {
    let id = UUID()
    let anchor: String
    let date: Date
    let original: String
    let butchered: String
    let reactions: Int
}

struct MisreadPattern {
    let pattern: String
    let result: String
    let frequency: Int
}

struct Testimonial {
    let quote: String
    let author: String
    let title: String
}

// MARK: - App State Models

struct Metrics {
    var confusionLevel: Int = 75
    var gravyCounter: Int = 0
    var swearJar: Int = 0
    var friendshipLevel: Int = 50
    var hoursAwake: Int = 0
}

// MARK: - Configuration

struct StreamConfig {
    static let baseURL = "https://static.news"
    static let wsURL = "wss://static.news"
    static let apiURL = "https://api.static.news"
}