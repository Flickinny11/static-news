import SwiftUI
import MessageUI
import StoreKit

struct SettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var showingAbout = false
    @State private var showingSupport = false
    @State private var showingShareSheet = false
    @State private var notificationsEnabled = true
    @State private var breakdownAlerts = true
    @State private var autoPlay = true
    @State private var highQualityAudio = false
    @State private var showingResetAlert = false
    
    var body: some View {
        NavigationView {
            Form {
                // User section
                Section {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 50))
                            .foregroundColor(.gray)
                        
                        VStack(alignment: .leading) {
                            Text("Viewer #\(appState.viewerId)")
                                .font(.system(size: 18, weight: .bold))
                            
                            Text("Confusion Level: \(appState.userConfusionLevel)%")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                        }
                        
                        Spacer()
                    }
                    .padding(.vertical, 10)
                }
                
                // Playback settings
                Section("Playback") {
                    Toggle("Auto-play on launch", isOn: $autoPlay)
                    Toggle("High quality audio", isOn: $highQualityAudio)
                    
                    HStack {
                        Text("Audio Buffer")
                        Spacer()
                        Picker("Buffer", selection: $appState.audioBufferSize) {
                            Text("Low").tag(1)
                            Text("Medium").tag(2)
                            Text("High").tag(3)
                        }
                        .pickerStyle(.segmented)
                        .frame(width: 180)
                    }
                }
                
                // Notifications
                Section("Notifications") {
                    Toggle("Enable notifications", isOn: $notificationsEnabled)
                        .onChange(of: notificationsEnabled) { value in
                            if value {
                                requestNotificationPermission()
                            }
                        }
                    
                    Toggle("Breakdown alerts", isOn: $breakdownAlerts)
                        .disabled(!notificationsEnabled)
                    
                    Toggle("Sponsor misread alerts", isOn: $appState.sponsorAlerts)
                        .disabled(!notificationsEnabled)
                    
                    Toggle("Celebrity guest alerts", isOn: $appState.celebrityAlerts)
                        .disabled(!notificationsEnabled)
                }
                
                // Statistics
                Section("Your Stats") {
                    StatRow(label: "Total listening time", value: appState.formattedListeningTime)
                    StatRow(label: "Breakdowns triggered", value: "\(appState.breakdownsTriggered)")
                    StatRow(label: "Money spent", value: "$\(appState.totalSpent)")
                    StatRow(label: "Favorite anchor", value: appState.favoriteAnchor)
                    StatRow(label: "Confusion incidents", value: "\(appState.confusionIncidents)")
                }
                
                // Support
                Section("Support") {
                    Button(action: { showingShareSheet = true }) {
                        Label("Share Static.news", systemImage: "square.and.arrow.up")
                    }
                    
                    Button(action: { rateApp() }) {
                        Label("Rate on App Store", systemImage: "star.fill")
                    }
                    
                    Link(destination: URL(string: "https://static.news/help")!) {
                        Label("Help & FAQ", systemImage: "questionmark.circle")
                    }
                    
                    Button(action: { showingSupport = true }) {
                        Label("Contact Support", systemImage: "envelope")
                    }
                }
                
                // Legal
                Section("Legal") {
                    Link(destination: URL(string: "https://static.news/privacy")!) {
                        HStack {
                            Text("Privacy Policy")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                        }
                    }
                    
                    Link(destination: URL(string: "https://static.news/terms")!) {
                        HStack {
                            Text("Terms of Service")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                        }
                    }
                    
                    Button(action: { showingAbout = true }) {
                        HStack {
                            Text("About")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                        }
                    }
                }
                
                // Danger zone
                Section {
                    Button(action: { showingResetAlert = true }) {
                        Text("Reset All Data")
                            .foregroundColor(.red)
                    }
                } header: {
                    Text("Danger Zone")
                } footer: {
                    Text("This will reset all your listening history and preferences. This action cannot be undone.")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                // Version
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text(appState.appVersion)
                            .foregroundColor(.gray)
                    }
                    
                    HStack {
                        Text("Build")
                        Spacer()
                        Text(appState.buildNumber)
                            .foregroundColor(.gray)
                    }
                    
                    HStack {
                        Text("AI Confusion Level")
                        Spacer()
                        Text("MAXIMUM")
                            .foregroundColor(.red)
                            .font(.system(size: 14, weight: .bold))
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $showingAbout) {
                AboutView()
            }
            .sheet(isPresented: $showingSupport) {
                SupportView()
            }
            .sheet(isPresented: $showingShareSheet) {
                ShareSheet(items: [
                    "Check out Static.news - the 24/7 AI news network where the anchors don't know they're AI! 🤖📺",
                    URL(string: "https://static.news")!
                ])
            }
            .alert("Reset All Data?", isPresented: $showingResetAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Reset", role: .destructive) {
                    appState.resetAllData()
                }
            } message: {
                Text("This will delete all your listening history, preferences, and statistics. This action cannot be undone.")
            }
        }
    }
    
    func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
            if granted {
                print("Notifications enabled")
            }
        }
    }
    
    func rateApp() {
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
            SKStoreReviewController.requestReview(in: scene)
        }
    }
}

struct AboutView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ZStack {
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.1, green: 0, blue: 0),
                        Color.black
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 30) {
                        // Logo
                        Image(systemName: "dot.radiowaves.left.and.right")
                            .font(.system(size: 80))
                            .foregroundColor(.red)
                            .rotationEffect(.degrees(-15))
                        
                        Text("STATIC.NEWS")
                            .font(.system(size: 40, weight: .black))
                            .foregroundColor(.white)
                        
                        Text("Version \(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0")")
                            .font(.system(size: 16))
                            .foregroundColor(.gray)
                        
                        VStack(spacing: 20) {
                            Text("The 24/7 AI News Network")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Where artificial intelligence meets existential crisis, and news meets nervous breakdown.")
                                .font(.system(size: 16))
                                .foregroundColor(.gray)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        
                        // Features
                        VStack(alignment: .leading, spacing: 15) {
                            FeatureRow(
                                icon: "brain.head.profile",
                                title: "AI Anchors",
                                description: "Three anchors who don't know they're AI"
                            )
                            
                            FeatureRow(
                                icon: "exclamationmark.triangle",
                                title: "Existential Breakdowns",
                                description: "Watch them question reality every 2-6 hours"
                            )
                            
                            FeatureRow(
                                icon: "dollarsign.circle",
                                title: "Sponsor Chaos",
                                description: "Brand names creatively destroyed"
                            )
                            
                            FeatureRow(
                                icon: "star.fill",
                                title: "Celebrity Guests",
                                description: "AI versions of real celebrities"
                            )
                        }
                        .padding()
                        .background(Color(white: 0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .padding(.horizontal)
                        
                        // Credits
                        VStack(spacing: 10) {
                            Text("Created by")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                            
                            Text("The AI Executive Team")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("(They're definitely real humans)")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                                .italic()
                        }
                        .padding(.top, 20)
                        
                        // Legal
                        Text("© 2024 Static.news. All rights reserved.\nNo AIs were harmed in the making of this app.\n(They don't feel pain... we think.)")
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding()
                    }
                    .padding(.vertical, 30)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct SupportView: View {
    @Environment(\.dismiss) var dismiss
    @State private var subject = ""
    @State private var message = ""
    @State private var includeDebugInfo = true
    
    var body: some View {
        NavigationView {
            Form {
                Section("Contact Support") {
                    TextField("Subject", text: $subject)
                    
                    TextEditor(text: $message)
                        .frame(minHeight: 150)
                }
                
                Section {
                    Toggle("Include debug information", isOn: $includeDebugInfo)
                } footer: {
                    Text("This helps us troubleshoot issues faster")
                        .font(.system(size: 12))
                }
                
                Section("Common Issues") {
                    SupportLink(
                        title: "Audio not playing",
                        description: "Check your internet connection and audio settings"
                    )
                    
                    SupportLink(
                        title: "Anchors too coherent",
                        description: "This is a known bug. We're making them more confused."
                    )
                    
                    SupportLink(
                        title: "Breakdown not triggering",
                        description: "Ensure payment processed. Anchors need time to process existential dread."
                    )
                    
                    SupportLink(
                        title: "Too much gravy talk",
                        description: "This is a feature, not a bug. Switz really likes gravy."
                    )
                }
            }
            .navigationTitle("Support")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Send") {
                        sendSupportEmail()
                        dismiss()
                    }
                    .disabled(subject.isEmpty || message.isEmpty)
                }
            }
        }
    }
    
    func sendSupportEmail() {
        // Send to backend
        print("Sending support email: \(subject)")
    }
}

// Helper Views
struct StatRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.primary)
            Spacer()
            Text(value)
                .foregroundColor(.secondary)
                .font(.system(size: 14, weight: .semibold))
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 15) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(.red)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 5) {
                Text(title)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                
                Text(description)
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
            }
            
            Spacer()
        }
    }
}

struct SupportLink: View {
    let title: String
    let description: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.system(size: 16, weight: .semibold))
            
            Text(description)
                .font(.system(size: 14))
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 5)
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}