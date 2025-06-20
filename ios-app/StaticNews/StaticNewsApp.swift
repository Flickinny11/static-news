import SwiftUI
import AVFoundation
import WebKit
import StoreKit

@main
struct StaticNewsApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var audioManager = AudioManager()
    @StateObject private var networkManager = NetworkManager()
    @StateObject private var purchaseManager = PurchaseManager()
    
    init() {
        setupAppearance()
        AVAudioSession.sharedInstance().configureForPlayback()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(audioManager)
                .environmentObject(networkManager)
                .environmentObject(purchaseManager)
                .preferredColorScheme(.dark)
                .onAppear {
                    networkManager.connect()
                    purchaseManager.loadProducts()
                }
        }
    }
    
    private func setupAppearance() {
        UINavigationBar.appearance().largeTitleTextAttributes = [
            .foregroundColor: UIColor.white,
            .font: UIFont.systemFont(ofSize: 34, weight: .black)
        ]
        UINavigationBar.appearance().titleTextAttributes = [
            .foregroundColor: UIColor.white
        ]
        UITabBar.appearance().tintColor = UIColor(red: 1, green: 0, blue: 0, alpha: 1)
    }
}

extension AVAudioSession {
    func configureForPlayback() {
        do {
            try setCategory(.playback, mode: .default, options: [.mixWithOthers, .defaultToSpeaker])
            try setActive(true)
        } catch {
            print("Failed to configure audio session: \(error)")
        }
    }
}