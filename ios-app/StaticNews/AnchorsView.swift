import SwiftUI

struct AnchorsView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedAnchor: Anchor?
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    ForEach(appState.anchors) { anchor in
                        AnchorCard(anchor: anchor)
                            .onTapGesture {
                                selectedAnchor = anchor
                            }
                    }
                }
                .padding()
            }
            .background(Color.black.ignoresSafeArea())
            .navigationTitle("Our Anchors")
            .navigationBarTitleDisplayMode(.large)
            .sheet(item: $selectedAnchor) { anchor in
                AnchorDetailView(anchor: anchor)
            }
        }
    }
}

struct AnchorCard: View {
    let anchor: Anchor
    @State private var isAnimating = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header with avatar and status
            HStack(spacing: 15) {
                // Animated avatar
                ZStack {
                    Circle()
                        .fill(anchor.color.gradient)
                        .frame(width: 80, height: 80)
                    
                    Text(anchor.emoji)
                        .font(.system(size: 40))
                        .rotationEffect(.degrees(isAnimating ? 5 : -5))
                        .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: isAnimating)
                }
                
                VStack(alignment: .leading, spacing: 5) {
                    Text(anchor.name)
                        .font(.system(size: 24, weight: .black))
                        .foregroundColor(.white)
                    
                    Text(anchor.title)
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                    
                    HStack {
                        StatusBadge(
                            text: anchor.currentStatus,
                            color: anchor.statusColor
                        )
                        
                        if anchor.isHavingBreakdown {
                            StatusBadge(
                                text: "BREAKING DOWN",
                                color: .red
                            )
                        }
                    }
                }
                
                Spacer()
            }
            .padding()
            
            // Stats
            HStack(spacing: 20) {
                StatItem(label: "Confusion", value: "\(anchor.confusionLevel)%", icon: "brain")
                StatItem(label: "Errors", value: "\(anchor.errorCount)", icon: "xmark.circle")
                StatItem(label: "Breakdowns", value: "\(anchor.breakdownCount)", icon: "exclamationmark.triangle")
            }
            .padding(.horizontal)
            .padding(.bottom)
            
            // Signature phrases
            VStack(alignment: .leading, spacing: 8) {
                Text("SIGNATURE PHRASES")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                ForEach(anchor.signaturePhrases.prefix(3), id: \.self) { phrase in
                    HStack {
                        Image(systemName: "quote.bubble.fill")
                            .font(.system(size: 12))
                            .foregroundColor(anchor.color)
                        
                        Text(phrase)
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                            .italic()
                    }
                }
            }
            .padding()
            .background(Color(white: 0.05))
        }
        .background(Color(white: 0.08))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(anchor.color.opacity(0.3), lineWidth: 1)
        )
        .shadow(color: anchor.color.opacity(0.2), radius: 10, x: 0, y: 5)
        .onAppear {
            isAnimating = true
        }
    }
}

struct AnchorDetailView: View {
    let anchor: Anchor
    @Environment(\.dismiss) var dismiss
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            ZStack {
                anchor.color.gradient
                    .opacity(0.1)
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 30) {
                        // Hero section
                        VStack(spacing: 20) {
                            Text(anchor.emoji)
                                .font(.system(size: 100))
                            
                            Text(anchor.name)
                                .font(.system(size: 36, weight: .black))
                                .foregroundColor(.white)
                            
                            Text(anchor.bio)
                                .font(.system(size: 16))
                                .foregroundColor(.gray)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        .padding(.top, 30)
                        
                        // Tabs
                        Picker("Info", selection: $selectedTab) {
                            Text("Stats").tag(0)
                            Text("Highlights").tag(1)
                            Text("Breakdowns").tag(2)
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal)
                        
                        // Tab content
                        if selectedTab == 0 {
                            StatsView(anchor: anchor)
                        } else if selectedTab == 1 {
                            HighlightsView(anchor: anchor)
                        } else {
                            BreakdownHistoryView(anchor: anchor)
                        }
                    }
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

struct StatsView: View {
    let anchor: Anchor
    
    var body: some View {
        VStack(spacing: 20) {
            // Performance metrics
            VStack(alignment: .leading, spacing: 15) {
                Text("PERFORMANCE METRICS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                MetricRow(label: "Words per minute", value: "\(anchor.wordsPerMinute)")
                MetricRow(label: "Accuracy rate", value: "\(anchor.accuracyRate)%")
                MetricRow(label: "Mispronunciations", value: "\(anchor.mispronunciationCount)")
                MetricRow(label: "Dead air incidents", value: "\(anchor.deadAirCount)")
                MetricRow(label: "Sponsor misreads", value: "\(anchor.sponsorMisreadCount)")
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
            
            // Personality traits
            VStack(alignment: .leading, spacing: 15) {
                Text("PERSONALITY ANALYSIS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                ForEach(anchor.personalityTraits, id: \.trait) { trait in
                    HStack {
                        Text(trait.trait)
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        ProgressView(value: trait.level)
                            .progressViewStyle(LinearProgressViewStyle(tint: anchor.color))
                            .frame(width: 100)
                        
                        Text("\(Int(trait.level * 100))%")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(anchor.color)
                            .frame(width: 40, alignment: .trailing)
                    }
                }
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
        }
        .padding(.horizontal)
    }
}

struct HighlightsView: View {
    let anchor: Anchor
    
    var body: some View {
        VStack(spacing: 15) {
            ForEach(anchor.highlights) { highlight in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Image(systemName: highlight.icon)
                            .foregroundColor(anchor.color)
                        
                        Text(highlight.date, style: .date)
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                        
                        Spacer()
                        
                        if highlight.isViral {
                            StatusBadge(text: "VIRAL", color: .orange)
                        }
                    }
                    
                    Text(highlight.title)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(highlight.description)
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                    
                    HStack {
                        Label("\(highlight.views)", systemImage: "eye.fill")
                        Label("\(highlight.reactions)", systemImage: "face.smiling.fill")
                    }
                    .font(.system(size: 12))
                    .foregroundColor(anchor.color)
                }
                .padding()
                .background(Color(white: 0.05))
                .clipShape(RoundedRectangle(cornerRadius: 15))
            }
        }
        .padding(.horizontal)
    }
}

struct BreakdownHistoryView: View {
    let anchor: Anchor
    
    var body: some View {
        VStack(spacing: 15) {
            // Breakdown stats
            HStack(spacing: 20) {
                VStack {
                    Text("\(anchor.totalBreakdowns)")
                        .font(.system(size: 36, weight: .black))
                        .foregroundColor(.red)
                    Text("Total")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                VStack {
                    Text(anchor.averageBreakdownDuration)
                        .font(.system(size: 36, weight: .black))
                        .foregroundColor(.orange)
                    Text("Avg Duration")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                VStack {
                    Text("\(anchor.longestBreakdownDays)d")
                        .font(.system(size: 36, weight: .black))
                        .foregroundColor(.yellow)
                    Text("Longest")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
            
            // Recent breakdowns
            ForEach(anchor.recentBreakdowns) { breakdown in
                BreakdownRow(breakdown: breakdown, anchorColor: anchor.color)
            }
        }
        .padding(.horizontal)
    }
}

struct BreakdownRow: View {
    let breakdown: Breakdown
    let anchorColor: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading) {
                    Text(breakdown.trigger)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(breakdown.date, style: .relative)
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text(breakdown.severity.rawValue)
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(breakdown.severity.color)
                    
                    Text(breakdown.duration)
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
            }
            
            Text(breakdown.description)
                .font(.system(size: 14))
                .foregroundColor(.gray)
                .italic()
            
            // Stages
            HStack(spacing: 5) {
                ForEach(breakdown.stages, id: \.self) { stage in
                    Text(stage)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(anchorColor.opacity(0.3))
                        .clipShape(Capsule())
                }
            }
        }
        .padding()
        .background(Color(white: 0.05))
        .clipShape(RoundedRectangle(cornerRadius: 15))
    }
}

struct StatusBadge: View {
    let text: String
    let color: Color
    
    var body: some View {
        Text(text)
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(.white)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color)
            .clipShape(Capsule())
    }
}

struct StatItem: View {
    let label: String
    let value: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(.gray)
            
            Text(value)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.white)
            
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.gray)
        }
    }
}

struct MetricRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(.gray)
            
            Spacer()
            
            Text(value)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
        }
    }
}