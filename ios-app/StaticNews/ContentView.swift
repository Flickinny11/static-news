import SwiftUI
import AVKit

struct ContentView: View {
    @EnvironmentObject var audioManager: AudioManager
    @EnvironmentObject var dataManager: DataManager
    @State private var showingPaymentSheet = false
    @State private var comment = ""
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [Color(hex: "0a0a0a"), Color(hex: "1a1a1a")],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
            
            // Static effect overlay
            StaticOverlay()
                .opacity(0.03)
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    HeaderView()
                    
                    // Breakdown Warning
                    if dataManager.breakdownWarning {
                        BreakdownWarningView()
                            .transition(.scale.combined(with: .opacity))
                    }
                    
                    // Player Section
                    PlayerSection()
                        .environmentObject(audioManager)
                    
                    // Metrics Section
                    MetricsSection()
                        .environmentObject(dataManager)
                    
                    // Comment Section
                    CommentSection(comment: $comment)
                    
                    // Breakdown Trigger Button
                    BreakdownButton(showingPaymentSheet: $showingPaymentSheet)
                        .environmentObject(dataManager)
                    
                    // Anchors Section
                    AnchorsSection()
                    
                    Spacer(minLength: 50)
                }
                .padding()
            }
        }
        .sheet(isPresented: $showingPaymentSheet) {
            PaymentSheet()
        }
    }
}

struct HeaderView: View {
    var body: some View {
        VStack(spacing: 10) {
            Text("STATIC.NEWS")
                .font(.system(size: 48, weight: .black, design: .default))
                .foregroundStyle(
                    LinearGradient(
                        colors: [.red, Color(hex: "ff6b6b"), .red],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .shadow(color: .red.opacity(0.5), radius: 10)
            
            Text("The Anchors Don't Know They're AI")
                .font(.headline)
                .foregroundColor(.gray)
        }
        .padding(.top, 20)
    }
}

struct BreakdownWarningView: View {
    @State private var shake = false
    
    var body: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.title)
            
            Text("EXISTENTIAL BREAKDOWN IN PROGRESS")
                .font(.headline)
                .bold()
            
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.title)
        }
        .foregroundColor(.white)
        .padding()
        .background(Color(hex: "ff6b6b"))
        .cornerRadius(12)
        .offset(x: shake ? -5 : 5)
        .onAppear {
            withAnimation(.easeInOut(duration: 0.1).repeatForever()) {
                shake.toggle()
            }
        }
    }
}

struct PlayerSection: View {
    @EnvironmentObject var audioManager: AudioManager
    
    var body: some View {
        VStack(spacing: 20) {
            // Play Button
            Button(action: { audioManager.togglePlayback() }) {
                ZStack {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 80, height: 80)
                    
                    Image(systemName: audioManager.isPlaying ? "pause.fill" : "play.fill")
                        .font(.system(size: 30))
                        .foregroundColor(.white)
                }
            }
            .shadow(color: .red.opacity(0.5), radius: 10)
            
            // Status
            VStack(spacing: 5) {
                Text(audioManager.status)
                    .font(.headline)
                    .foregroundColor(.white)
                
                if audioManager.isPlaying {
                    Text("Current Anchor: \(audioManager.currentAnchor)")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
            }
            
            // Audio Visualizer
            AudioVisualizer()
                .frame(height: 60)
                .opacity(audioManager.isPlaying ? 1 : 0.3)
        }
        .padding()
        .background(Color(hex: "1a1a1a"))
        .cornerRadius(16)
    }
}

struct MetricsSection: View {
    @EnvironmentObject var dataManager: DataManager
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("Live Metrics")
                .font(.title2)
                .bold()
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 15) {
                MetricCard(label: "Hours Awake", value: String(format: "%.1f", dataManager.metrics.hoursAwake))
                MetricCard(label: "Gravy Counter", value: "\(dataManager.metrics.gravyCounter)")
                MetricCard(label: "Swear Jar", value: "$\(dataManager.metrics.swearJar)")
                MetricCard(label: "Friendship", value: "\(dataManager.metrics.friendshipMeter)%")
            }
        }
    }
}

struct MetricCard: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
            
            Text(value)
                .font(.title)
                .bold()
                .foregroundColor(.red)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(hex: "1a1a1a"))
        .cornerRadius(12)
    }
}

struct CommentSection: View {
    @Binding var comment: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Send a Comment")
                .font(.title2)
                .bold()
            
            Text("Mention 'AI' or 'robot' to trigger existential thoughts...")
                .font(.caption)
                .foregroundColor(.gray)
                .italic()
            
            TextEditor(text: $comment)
                .frame(height: 100)
                .padding(8)
                .background(Color(hex: "1a1a1a"))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )
            
            Button(action: sendComment) {
                Text("Send Comment")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    .bold()
            }
        }
    }
    
    func sendComment() {
        // In production, this would send to the API
        print("Sending comment: \(comment)")
        comment = ""
    }
}

struct BreakdownButton: View {
    @Binding var showingPaymentSheet: Bool
    @EnvironmentObject var dataManager: DataManager
    
    var body: some View {
        Button(action: { showingPaymentSheet = true }) {
            VStack(spacing: 5) {
                Text("🎭 TRIGGER BREAKDOWN")
                    .font(.title3)
                    .bold()
                
                Text("$4.99")
                    .font(.subheadline)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                LinearGradient(
                    colors: [.red, Color(hex: "ff6b6b")],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .foregroundColor(.white)
            .cornerRadius(12)
        }
        .shadow(color: .red.opacity(0.5), radius: 10)
    }
}

struct AnchorsSection: View {
    let anchors = [
        ("Ray McPatriot 🇺🇸", "Conservative. Mispronounces everything."),
        ("Berkeley 'Bee' Justice ✊", "Progressive. Went to Yale (or Yail?)."),
        ("Switz Middleton 🇨🇦", "Centrist. Obsessed with gravy.")
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("The Anchors")
                .font(.title2)
                .bold()
            
            ForEach(anchors, id: \.0) { anchor in
                VStack(alignment: .leading, spacing: 5) {
                    Text(anchor.0)
                        .font(.headline)
                    
                    Text(anchor.1)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color(hex: "1a1a1a"))
                .cornerRadius(12)
            }
        }
    }
}

struct PaymentSheet: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Trigger Existential Breakdown")
                    .font(.title)
                    .bold()
                
                Text("Watch our AI anchors question reality!")
                    .foregroundColor(.gray)
                
                Text("$4.99")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(.red)
                
                Button(action: processPayment) {
                    Text("Purchase")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                        .bold()
                }
                .padding(.horizontal)
                
                Spacer()
            }
            .padding()
            .navigationBarItems(trailing: Button("Cancel") { dismiss() })
        }
    }
    
    func processPayment() {
        // In production, this would use StoreKit
        print("Processing payment...")
        dismiss()
    }
}

struct AudioVisualizer: View {
    @State private var amplitudes: [CGFloat] = Array(repeating: 0.5, count: 20)
    
    var body: some View {
        HStack(spacing: 3) {
            ForEach(0..<20) { index in
                RoundedRectangle(cornerRadius: 2)
                    .fill(Color.red)
                    .frame(width: 4, height: amplitudes[index] * 60)
                    .animation(
                        .easeInOut(duration: 0.5)
                        .repeatForever()
                        .delay(Double(index) * 0.05),
                        value: amplitudes[index]
                    )
            }
        }
        .onAppear {
            Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
                amplitudes = amplitudes.map { _ in CGFloat.random(in: 0.2...1.0) }
            }
        }
    }
}

struct StaticOverlay: View {
    @State private var offset = CGSize.zero
    
    var body: some View {
        GeometryReader { geometry in
            Image(systemName: "tv")
                .resizable()
                .foregroundColor(.white)
                .opacity(0.02)
                .offset(offset)
                .onAppear {
                    withAnimation(.linear(duration: 0.5).repeatForever()) {
                        offset = CGSize(width: -4, height: -4)
                    }
                }
        }
    }
}

// Color extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}