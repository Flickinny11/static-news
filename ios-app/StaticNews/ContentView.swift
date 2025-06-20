import SwiftUI
import AVKit

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var audioManager: AudioManager
    @EnvironmentObject var networkManager: NetworkManager
    @EnvironmentObject var purchaseManager: PurchaseManager
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            LiveStreamView()
                .tabItem {
                    Label("Live", systemImage: "dot.radiowaves.left.and.right")
                }
                .tag(0)
            
            AnchorsView()
                .tabItem {
                    Label("Anchors", systemImage: "person.3.fill")
                }
                .tag(1)
            
            IncidentsView()
                .tabItem {
                    Label("Incidents", systemImage: "exclamationmark.triangle.fill")
                }
                .tag(2)
            
            SponsorsView()
                .tabItem {
                    Label("Sponsors", systemImage: "dollarsign.circle.fill")
                }
                .tag(3)
            
            SettingsView()
                .tabItem {
                    Label("More", systemImage: "ellipsis")
                }
                .tag(4)
        }
        .accentColor(.red)
        .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
            networkManager.reconnect()
        }
    }
}

struct LiveStreamView: View {
    @EnvironmentObject var audioManager: AudioManager
    @EnvironmentObject var networkManager: NetworkManager
    @EnvironmentObject var appState: AppState
    @State private var showingBreakdownAlert = false
    @State private var isExpanded = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background with subtle animation
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.05, green: 0.05, blue: 0.05),
                        Color.black
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Live indicator
                        HStack {
                            Circle()
                                .fill(Color.red)
                                .frame(width: 12, height: 12)
                                .overlay(
                                    Circle()
                                        .fill(Color.red)
                                        .scaleEffect(appState.isLive ? 1.5 : 1)
                                        .opacity(appState.isLive ? 0 : 1)
                                        .animation(.easeInOut(duration: 1).repeatForever(autoreverses: false), value: appState.isLive)
                                )
                            
                            Text("LIVE")
                                .font(.system(size: 18, weight: .black))
                                .foregroundColor(.red)
                            
                            Spacer()
                            
                            Text(appState.currentTime)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.gray)
                        }
                        .padding(.horizontal)
                        
                        // Main player card
                        VStack(spacing: 0) {
                            // Waveform visualizer
                            WaveformView(audioLevel: $audioManager.audioLevel)
                                .frame(height: 120)
                                .background(Color.black)
                            
                            // Current anchor info
                            VStack(spacing: 12) {
                                Text("NOW BROADCASTING")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.gray)
                                    .tracking(2)
                                
                                Text(appState.currentAnchor.name)
                                    .font(.system(size: 28, weight: .black))
                                    .foregroundColor(.white)
                                
                                Text(appState.currentAnchor.currentMood)
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(.red)
                                    .italic()
                                
                                // Play/Pause button
                                Button(action: { audioManager.togglePlayback() }) {
                                    ZStack {
                                        Circle()
                                            .fill(Color.red)
                                            .frame(width: 80, height: 80)
                                        
                                        Image(systemName: audioManager.isPlaying ? "pause.fill" : "play.fill")
                                            .font(.system(size: 30))
                                            .foregroundColor(.white)
                                            .offset(x: audioManager.isPlaying ? 0 : 3)
                                    }
                                }
                                .scaleEffect(audioManager.isPlaying ? 1 : 0.95)
                                .animation(.spring(response: 0.3, dampingFraction: 0.6), value: audioManager.isPlaying)
                            }
                            .padding(.vertical, 30)
                            .frame(maxWidth: .infinity)
                            .background(Color(white: 0.05))
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(Color.red.opacity(0.3), lineWidth: 1)
                        )
                        .padding(.horizontal)
                        
                        // Metrics cards
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 15) {
                            MetricCard(
                                title: "CONFUSION LEVEL",
                                value: "\(appState.metrics.confusionLevel)%",
                                icon: "brain.head.profile",
                                color: .orange
                            )
                            
                            MetricCard(
                                title: "GRAVY COUNT",
                                value: "\(appState.metrics.gravyCounter)",
                                icon: "drop.fill",
                                color: .brown
                            )
                            
                            MetricCard(
                                title: "SWEAR JAR",
                                value: "$\(appState.metrics.swearJar)",
                                icon: "dollarsign.circle.fill",
                                color: .green
                            )
                            
                            MetricCard(
                                title: "FRIENDSHIP",
                                value: "\(appState.metrics.friendshipLevel)%",
                                icon: "heart.fill",
                                color: .pink
                            )
                        }
                        .padding(.horizontal)
                        
                        // Breakdown trigger button
                        VStack(spacing: 15) {
                            Text("NEXT BREAKDOWN")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.gray)
                                .tracking(2)
                            
                            Text(appState.nextBreakdownTime)
                                .font(.system(size: 24, weight: .black))
                                .foregroundColor(.red)
                            
                            Button(action: {
                                showingBreakdownAlert = true
                            }) {
                                HStack {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                    Text("TRIGGER BREAKDOWN")
                                    Text("$4.99")
                                        .fontWeight(.black)
                                }
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.horizontal, 30)
                                .padding(.vertical, 15)
                                .background(
                                    LinearGradient(
                                        gradient: Gradient(colors: [Color.red, Color.orange]),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .clipShape(Capsule())
                                .shadow(color: .red.opacity(0.5), radius: 10, x: 0, y: 5)
                            }
                            .scaleEffect(appState.isBreakdownImminent ? 1.05 : 1)
                            .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: appState.isBreakdownImminent)
                        }
                        .padding(.vertical, 30)
                        .frame(maxWidth: .infinity)
                        .background(Color(white: 0.05))
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(Color.red.opacity(0.3), lineWidth: 1)
                        )
                        .padding(.horizontal)
                        
                        // Recent events
                        VStack(alignment: .leading, spacing: 15) {
                            Text("RECENT CHAOS")
                                .font(.system(size: 20, weight: .black))
                                .foregroundColor(.white)
                            
                            ForEach(appState.recentEvents.prefix(5)) { event in
                                EventRow(event: event)
                            }
                        }
                        .padding()
                        .background(Color(white: 0.05))
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .padding(.horizontal)
                    }
                    .padding(.vertical)
                }
                
                // Breakdown warning overlay
                if appState.showBreakdownWarning {
                    BreakdownWarningOverlay()
                        .transition(.scale.combined(with: .opacity))
                }
            }
            .navigationTitle("Static.news")
            .navigationBarTitleDisplayMode(.large)
            .alert("Trigger Existential Crisis?", isPresented: $showingBreakdownAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Pay $4.99") {
                    purchaseManager.purchaseBreakdown()
                }
            } message: {
                Text("This will immediately cause the current anchor to question their entire existence. The effects cannot be undone (for at least 10 minutes).")
            }
        }
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
                Spacer()
            }
            
            Text(title)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(.gray)
                .tracking(1)
            
            Text(value)
                .font(.system(size: 24, weight: .black))
                .foregroundColor(.white)
        }
        .padding()
        .background(Color(white: 0.05))
        .clipShape(RoundedRectangle(cornerRadius: 15))
        .overlay(
            RoundedRectangle(cornerRadius: 15)
                .stroke(color.opacity(0.3), lineWidth: 1)
        )
    }
}

struct EventRow: View {
    let event: NewsEvent
    
    var body: some View {
        HStack {
            Circle()
                .fill(event.severity.color)
                .frame(width: 8, height: 8)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(event.timestamp)
                    .font(.system(size: 12))
                    .foregroundColor(.gray)
                
                Text(event.description)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white)
            }
            
            Spacer()
        }
        .padding(.vertical, 8)
    }
}

struct WaveformView: View {
    @Binding var audioLevel: Double
    @State private var bars: [CGFloat] = Array(repeating: 0.5, count: 50)
    let timer = Timer.publish(every: 0.05, on: .main, in: .common).autoconnect()
    
    var body: some View {
        GeometryReader { geometry in
            HStack(spacing: 2) {
                ForEach(0..<50, id: \.self) { index in
                    RoundedRectangle(cornerRadius: 2)
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [Color.red, Color.orange]),
                                startPoint: .bottom,
                                endPoint: .top
                            )
                        )
                        .frame(width: (geometry.size.width - 100) / 50, height: bars[index] * geometry.size.height)
                        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: bars[index])
                }
            }
            .frame(maxHeight: .infinity, alignment: .bottom)
        }
        .onReceive(timer) { _ in
            withAnimation {
                for i in 0..<bars.count {
                    bars[i] = CGFloat.random(in: 0.2...1.0) * CGFloat(audioLevel)
                }
            }
        }
    }
}

struct BreakdownWarningOverlay: View {
    @State private var scale: CGFloat = 0.8
    @State private var opacity: Double = 0
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.8)
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.red)
                
                Text("EXISTENTIAL CRISIS")
                    .font(.system(size: 32, weight: .black))
                    .foregroundColor(.white)
                
                Text("IMMINENT")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.red)
                    .tracking(3)
            }
            .scaleEffect(scale)
            .opacity(opacity)
        }
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                scale = 1.0
                opacity = 1.0
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                withAnimation(.easeOut(duration: 0.3)) {
                    scale = 1.2
                    opacity = 0
                }
            }
        }
    }
}