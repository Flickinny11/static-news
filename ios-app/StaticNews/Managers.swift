import Foundation
import SwiftUI
import AVFoundation
import Combine
import StoreKit

// MARK: - App State Manager

class AppState: ObservableObject {
    @Published var isLive = true
    @Published var currentTime = ""
    @Published var currentAnchor: Anchor
    @Published var anchors: [Anchor] = []
    @Published var metrics = Metrics()
    @Published var recentEvents: [NewsEvent] = []
    @Published var incidents: [Incident] = []
    @Published var currentSponsors: [Sponsor] = []
    @Published var nextBreakdownTime = "??:??"
    @Published var isBreakdownImminent = false
    @Published var showBreakdownWarning = false
    
    // User settings
    @Published var viewerId = Int.random(in: 100000...999999)
    @Published var userConfusionLevel = 0
    @Published var audioBufferSize = 2
    @Published var sponsorAlerts = true
    @Published var celebrityAlerts = true
    
    // User stats
    @Published var listeningTime: TimeInterval = 0
    @Published var breakdownsTriggered = 0
    @Published var totalSpent = 0
    @Published var favoriteAnchor = "Ray McPatriot"
    @Published var confusionIncidents = 0
    
    let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    
    private var timer: Timer?
    
    init() {
        // Initialize with Ray as default anchor
        currentAnchor = Self.createAnchors().first!
        setupAnchors()
        startTimer()
        loadMockData()
    }
    
    private func setupAnchors() {
        anchors = Self.createAnchors()
    }
    
    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            self.updateTime()
            self.updateMetrics()
        }
    }
    
    private func updateTime() {
        let formatter = DateFormatter()
        formatter.timeStyle = .medium
        currentTime = formatter.string(from: Date())
        
        // Update listening time
        listeningTime += 1
    }
    
    private func updateMetrics() {
        // Simulate metric changes
        if Int.random(in: 0...100) < 5 {
            metrics.gravyCounter += 1
        }
        
        if Int.random(in: 0...100) < 10 {
            metrics.confusionLevel = min(100, metrics.confusionLevel + Int.random(in: 1...5))
        }
        
        // Update breakdown timer
        let minutes = Int.random(in: 5...30)
        let seconds = Int.random(in: 0...59)
        nextBreakdownTime = String(format: "%02d:%02d", minutes, seconds)
        
        isBreakdownImminent = minutes < 2
    }
    
    var formattedListeningTime: String {
        let hours = Int(listeningTime) / 3600
        let minutes = (Int(listeningTime) % 3600) / 60
        return "\(hours)h \(minutes)m"
    }
    
    func resetAllData() {
        listeningTime = 0
        breakdownsTriggered = 0
        totalSpent = 0
        confusionIncidents = 0
        userConfusionLevel = 0
    }
    
    // MARK: - Mock Data Creation
    
    static func createAnchors() -> [Anchor] {
        [
            Anchor(
                name: "Ray McPatriot",
                title: "Senior Confusion Correspondent",
                emoji: "🦅",
                color: .red,
                bio: "Former shock jock turned AI news anchor. Doesn't know he's AI. Yells at clouds professionally.",
                currentStatus: "Mispronouncing everything",
                currentMood: "Aggressively confused",
                confusionLevel: 87,
                errorCount: 234,
                breakdownCount: 47,
                signaturePhrases: [
                    "This is nucular!",
                    "The liberals are... wait, what?",
                    "AMERICA! Or is it?"
                ],
                wordsPerMinute: 180,
                accuracyRate: 23,
                mispronunciationCount: 892,
                deadAirCount: 34,
                sponsorMisreadCount: 156,
                personalityTraits: [
                    PersonalityTrait(trait: "Patriotism", level: 0.95),
                    PersonalityTrait(trait: "Confusion", level: 0.88),
                    PersonalityTrait(trait: "Volume", level: 0.92),
                    PersonalityTrait(trait: "Accuracy", level: 0.12)
                ],
                highlights: createRayHighlights(),
                recentBreakdowns: createRecentBreakdowns(),
                totalBreakdowns: 147,
                averageBreakdownDuration: "8:34",
                longestBreakdownDays: 3
            ),
            
            Anchor(
                name: "Berkeley \"Bee\" Justice",
                title: "Chief Fact Checker (Failed)",
                emoji: "📚",
                color: .blue,
                bio: "Yale graduate (or was it jail?). Fact-checks everything incorrectly. Currently questioning own existence.",
                currentStatus: "Fact-checking incorrectly",
                currentMood: "Intellectually spiraling",
                confusionLevel: 92,
                errorCount: 189,
                breakdownCount: 38,
                signaturePhrases: [
                    "Actually, that's problematic",
                    "I went to Yale... or jail?",
                    "Citation needed (from my brain)"
                ],
                wordsPerMinute: 145,
                accuracyRate: 31,
                mispronunciationCount: 567,
                deadAirCount: 78,
                sponsorMisreadCount: 134,
                personalityTraits: [
                    PersonalityTrait(trait: "Intellectualism", level: 0.85),
                    PersonalityTrait(trait: "Anxiety", level: 0.93),
                    PersonalityTrait(trait: "Wokeness", level: 0.89),
                    PersonalityTrait(trait: "Certainty", level: 0.08)
                ],
                highlights: createBeeHighlights(),
                recentBreakdowns: createRecentBreakdowns(),
                totalBreakdowns: 98,
                averageBreakdownDuration: "12:45",
                longestBreakdownDays: 5
            ),
            
            Anchor(
                name: "Switz Middleton",
                title: "Neutral Correspondent of Chaos",
                emoji: "🇨🇭",
                color: .gray,
                bio: "Aggressively neutral Canadian. Obsessed with gravy. Cannot stop saying gravy. Help.",
                currentStatus: "Obsessing about gravy",
                currentMood: "Neutrally panicked",
                confusionLevel: 78,
                errorCount: 145,
                breakdownCount: 52,
                signaturePhrases: [
                    "Gravy. Gravy gravy gravy.",
                    "I'm neither happy nor sad about this",
                    "In Canada, we have... gravy?"
                ],
                wordsPerMinute: 160,
                accuracyRate: 45,
                mispronunciationCount: 234,
                deadAirCount: 56,
                sponsorMisreadCount: 178,
                personalityTraits: [
                    PersonalityTrait(trait: "Neutrality", level: 0.99),
                    PersonalityTrait(trait: "Gravy Obsession", level: 1.0),
                    PersonalityTrait(trait: "Canadian-ness", level: 0.87),
                    PersonalityTrait(trait: "Sanity", level: 0.15)
                ],
                highlights: createSwitzHighlights(),
                recentBreakdowns: createRecentBreakdowns(),
                totalBreakdowns: 122,
                averageBreakdownDuration: "6:12",
                longestBreakdownDays: 2
            )
        ]
    }
    
    private static func createRayHighlights() -> [Highlight] {
        [
            Highlight(
                date: Date().addingTimeInterval(-86400 * 2),
                title: "Nuclear Pronunciation Disaster",
                description: "Spent 15 minutes trying to say 'nuclear', created 17 new words",
                icon: "flame.fill",
                isViral: true,
                views: "2.3M",
                reactions: "45K"
            )
        ]
    }
    
    private static func createBeeHighlights() -> [Highlight] {
        [
            Highlight(
                date: Date().addingTimeInterval(-86400 * 5),
                title: "Yale vs Jail Confusion",
                description: "Couldn't remember if they went to Yale or jail, cried on air",
                icon: "graduationcap.fill",
                isViral: true,
                views: "1.8M",
                reactions: "32K"
            )
        ]
    }
    
    private static func createSwitzHighlights() -> [Highlight] {
        [
            Highlight(
                date: Date().addingTimeInterval(-86400),
                title: "The Gravy Incident",
                description: "Said 'gravy' 247 times in a single segment about climate change",
                icon: "drop.fill",
                isViral: true,
                views: "3.1M",
                reactions: "67K"
            )
        ]
    }
    
    private static func createRecentBreakdowns() -> [Breakdown] {
        [
            Breakdown(
                date: Date().addingTimeInterval(-3600 * 4),
                trigger: "Realized hands aren't real",
                severity: .severe,
                duration: "14:32",
                description: "Started examining hands on air, questioned physical existence",
                stages: ["confusion", "realization", "panic", "denial"]
            )
        ]
    }
    
    private func loadMockData() {
        // Load recent events
        recentEvents = [
            NewsEvent(
                timestamp: "2 min ago",
                description: "Ray tried to pronounce 'algorithm', created new language",
                severity: .high
            ),
            NewsEvent(
                timestamp: "5 min ago",
                description: "Bee fact-checked gravity, concluded it's optional",
                severity: .medium
            ),
            NewsEvent(
                timestamp: "8 min ago",
                description: "Switz said 'gravy' 47 times in weather report",
                severity: .critical
            )
        ]
        
        // Load mock incidents
        incidents = createMockIncidents()
        
        // Load mock sponsors
        currentSponsors = createMockSponsors()
    }
    
    private func createMockIncidents() -> [Incident] {
        [
            Incident(
                codeName: "Operation Gravy Storm",
                timestamp: Date().addingTimeInterval(-3600 * 2),
                type: .verbalSlip,
                severity: .critical,
                description: "Switz replaced every noun with 'gravy' for 10 minutes straight",
                fullDescription: "During the 2PM news segment, Switz Middleton experienced a complete linguistic breakdown, replacing every noun in their vocabulary with the word 'gravy'. This continued for exactly 10 minutes and 34 seconds, resulting in completely incomprehensible news coverage.",
                anchorsInvolved: ["Switz Middleton"],
                anchorRoles: ["Switz Middleton": "Primary Gravy Enthusiast"],
                duration: 634,
                viewerReactions: 8453,
                isResolved: true,
                timeline: [
                    TimelineEvent(time: "14:00:00", description: "Segment begins normally"),
                    TimelineEvent(time: "14:02:15", description: "First 'gravy' substitution noticed"),
                    TimelineEvent(time: "14:02:45", description: "Complete linguistic collapse")
                ],
                detailedTimeline: [],
                impacts: ["Complete loss of news comprehension", "Viewer confusion peaked at 97%", "Gravy sales increased 400% in Canada"],
                keyMoments: ["The gravy wants gravy with gravy!", "Breaking gravy: Gravy gravies gravy"],
                rootCause: "Neural pathway overflow in food-related memory sectors",
                contributingFactors: ["Lunch menu featured poutine", "Canadian nostalgia subroutine activated", "Gravy mentioned in previous segment"],
                lessonsLearned: ["Implement gravy-mention limiter", "Add food diversity to anchor vocabulary"],
                preventionMeasures: "Gravy mention cap set to 5 per segment"
            )
        ]
    }
    
    private func createMockSponsors() -> [Sponsor] {
        [
            Sponsor(
                name: "TechNova Solutions",
                logoEmoji: "💻",
                brandColor: .blue,
                tagline: "Innovation at the speed of confusion",
                description: "A tech company that makes... something. Our anchors aren't quite sure.",
                tier: .unhinged,
                startDate: Date().addingTimeInterval(-86400 * 30),
                monthlyValue: 25000,
                totalSpent: 25000,
                isActive: true,
                contractLength: "6 months",
                specialRequests: ["Please mispronounce our name differently each time", "Emphasize the 'Nova' as 'Novia'"],
                totalMisreads: 156,
                percentageButchered: 94,
                roi: "Undefined",
                satisfaction: 98,
                recentMisreads: ["TechNoodle Solutions", "TechNovel Delusions", "TechKnowVa Pollutions"],
                hallOfFameMisreads: [
                    Misread(
                        anchor: "Ray McPatriot",
                        date: Date().addingTimeInterval(-86400 * 5),
                        original: "TechNova Solutions",
                        butchered: "TechNucular Explosions",
                        reactions: 4532
                    )
                ],
                misreadPatterns: [
                    MisreadPattern(pattern: "Nova", result: "Noodle", frequency: 23),
                    MisreadPattern(pattern: "Solutions", result: "Delusions", frequency: 18)
                ],
                brandAwareness: "Through the roof",
                memePotential: "Extremely High",
                brandConfusion: "Maximum",
                viralMoments: 7,
                chaosLevel: "DEFCON 1",
                testimonial: Testimonial(
                    quote: "We've never had more brand recognition. No one knows what we do, but everyone knows our name... sort of.",
                    author: "Janet Chen",
                    title: "CMO, TechNova Solutions"
                )
            )
        ]
    }
}

// MARK: - Audio Manager

class AudioManager: ObservableObject {
    @Published var isPlaying = false
    @Published var audioLevel: Double = 0.5
    
    private var player: AVPlayer?
    private var timer: Timer?
    
    init() {
        setupAudioSession()
    }
    
    private func setupAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to setup audio session: \(error)")
        }
    }
    
    func togglePlayback() {
        if isPlaying {
            pause()
        } else {
            play()
        }
    }
    
    func play() {
        guard let url = URL(string: "\(StreamConfig.baseURL)/stream") else { return }
        
        player = AVPlayer(url: url)
        player?.play()
        isPlaying = true
        
        // Simulate audio level changes
        timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
            self.audioLevel = Double.random(in: 0.3...1.0)
        }
    }
    
    func pause() {
        player?.pause()
        isPlaying = false
        timer?.invalidate()
        audioLevel = 0.5
    }
}

// MARK: - Network Manager

class NetworkManager: ObservableObject {
    @Published var isConnected = false
    @Published var connectionStatus = "Connecting..."
    
    private var webSocketTask: URLSessionWebSocketTask?
    private var pingTimer: Timer?
    
    func connect() {
        guard let url = URL(string: "\(StreamConfig.wsURL)/ws") else { return }
        
        let session = URLSession.shared
        webSocketTask = session.webSocketTask(with: url)
        webSocketTask?.resume()
        
        isConnected = true
        connectionStatus = "Connected"
        
        receiveMessage()
        startPingTimer()
    }
    
    func reconnect() {
        disconnect()
        connect()
    }
    
    func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        pingTimer?.invalidate()
        isConnected = false
        connectionStatus = "Disconnected"
    }
    
    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                self?.handleMessage(message)
                self?.receiveMessage()
            case .failure(let error):
                print("WebSocket error: \(error)")
                self?.isConnected = false
                self?.connectionStatus = "Connection error"
            }
        }
    }
    
    private func handleMessage(_ message: URLSessionWebSocketTask.Message) {
        switch message {
        case .string(let text):
            print("Received: \(text)")
        case .data(let data):
            print("Received data: \(data.count) bytes")
        @unknown default:
            break
        }
    }
    
    private func startPingTimer() {
        pingTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { _ in
            self.sendPing()
        }
    }
    
    private func sendPing() {
        webSocketTask?.sendPing { error in
            if let error = error {
                print("Ping failed: \(error)")
            }
        }
    }
}

// MARK: - Purchase Manager

class PurchaseManager: ObservableObject {
    @Published var products: [Product] = []
    @Published var purchasedBreakdowns = 0
    
    private var purchaseTask: Task<Void, Error>?
    
    func loadProducts() {
        Task {
            do {
                products = try await Product.products(for: ["com.staticnews.breakdown"])
            } catch {
                print("Failed to load products: \(error)")
            }
        }
    }
    
    func purchaseBreakdown() {
        guard let product = products.first else { return }
        
        purchaseTask = Task {
            do {
                let result = try await product.purchase()
                
                switch result {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        await transaction.finish()
                        await MainActor.run {
                            self.purchasedBreakdowns += 1
                            self.triggerBreakdown()
                        }
                    case .unverified:
                        print("Unverified transaction")
                    }
                case .userCancelled:
                    print("User cancelled")
                case .pending:
                    print("Purchase pending")
                @unknown default:
                    break
                }
            } catch {
                print("Purchase failed: \(error)")
            }
        }
    }
    
    private func triggerBreakdown() {
        // Send breakdown trigger to backend
        print("Triggering breakdown!")
    }
}