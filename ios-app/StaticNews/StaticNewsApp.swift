import SwiftUI
import AVFoundation

@main
struct StaticNewsApp: App {
    @StateObject private var audioManager = AudioManager()
    @StateObject private var dataManager = DataManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(audioManager)
                .environmentObject(dataManager)
                .preferredColorScheme(.dark)
        }
    }
}

// Audio Manager for streaming
class AudioManager: ObservableObject {
    @Published var isPlaying = false
    @Published var currentAnchor = "Loading..."
    @Published var status = "Connecting..."
    
    private var player: AVPlayer?
    
    init() {
        setupAudio()
    }
    
    func setupAudio() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Audio setup error: \(error)")
        }
    }
    
    func startStreaming() {
        guard let url = URL(string: "https://flickinny11.github.io/static-news/audio/current.mp3") else { return }
        
        player = AVPlayer(url: url)
        player?.play()
        isPlaying = true
        status = "LIVE - Chaos in Progress"
        
        // Simulate anchor rotation
        Timer.scheduledTimer(withTimeInterval: 10, repeats: true) { _ in
            self.currentAnchor = ["Ray McPatriot", "Berkeley Justice", "Switz Middleton"].randomElement() ?? "Unknown"
        }
    }
    
    func stopStreaming() {
        player?.pause()
        isPlaying = false
        status = "Tap to Start Stream"
    }
    
    func togglePlayback() {
        if isPlaying {
            stopStreaming()
        } else {
            startStreaming()
        }
    }
}

// Data Manager for metrics and API calls
class DataManager: ObservableObject {
    @Published var metrics = BroadcastMetrics()
    @Published var breakdownWarning = false
    
    private var timer: Timer?
    
    init() {
        startMetricsUpdate()
    }
    
    func startMetricsUpdate() {
        timer = Timer.scheduledTimer(withTimeInterval: 5, repeats: true) { _ in
            self.updateMetrics()
            
            // Random breakdown warnings
            if Double.random(in: 0...1) < 0.05 {
                self.triggerBreakdownWarning()
            }
        }
    }
    
    func updateMetrics() {
        // Simulate metrics updates
        metrics.hoursAwake += 0.1
        metrics.gravyCounter += Int.random(in: 0...2)
        metrics.swearJar += Int.random(in: 0...1)
        metrics.friendshipMeter = max(0, min(100, metrics.friendshipMeter + Int.random(in: -5...5)))
    }
    
    func triggerBreakdownWarning() {
        breakdownWarning = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 10) {
            self.breakdownWarning = false
        }
    }
    
    func triggerBreakdown() async {
        // In production, this would call the API and process payment
        // For now, simulate the trigger
        print("Breakdown triggered! Processing payment...")
        triggerBreakdownWarning()
    }
}

struct BroadcastMetrics {
    var hoursAwake: Double = 0
    var gravyCounter: Int = 0
    var swearJar: Int = 0
    var friendshipMeter: Int = 50
    var breakdownTriggersSold: Int = 0
}