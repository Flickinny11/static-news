import SwiftUI

struct IncidentsView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedFilter: IncidentFilter = .all
    @State private var selectedIncident: Incident?
    
    var filteredIncidents: [Incident] {
        switch selectedFilter {
        case .all:
            return appState.incidents
        case .breakdowns:
            return appState.incidents.filter { $0.type == .breakdown }
        case .technical:
            return appState.incidents.filter { $0.type == .technical }
        case .sponsor:
            return appState.incidents.filter { $0.type == .sponsorMisread }
        case .verbal:
            return appState.incidents.filter { $0.type == .verbalSlip }
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.black.ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Filter pills
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(IncidentFilter.allCases, id: \.self) { filter in
                                FilterPill(
                                    title: filter.title,
                                    isSelected: selectedFilter == filter,
                                    count: filter.count(from: appState.incidents)
                                ) {
                                    withAnimation(.spring(response: 0.3)) {
                                        selectedFilter = filter
                                    }
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 10)
                    }
                    .background(Color(white: 0.05))
                    
                    if filteredIncidents.isEmpty {
                        EmptyIncidentsView(filter: selectedFilter)
                    } else {
                        ScrollView {
                            LazyVStack(spacing: 15) {
                                ForEach(filteredIncidents) { incident in
                                    IncidentCard(incident: incident)
                                        .onTapGesture {
                                            selectedIncident = incident
                                        }
                                }
                            }
                            .padding()
                        }
                    }
                }
            }
            .navigationTitle("Incident Reports")
            .navigationBarTitleDisplayMode(.large)
            .sheet(item: $selectedIncident) { incident in
                IncidentDetailView(incident: incident)
            }
        }
    }
}

struct IncidentCard: View {
    let incident: Incident
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                // Severity indicator
                Circle()
                    .fill(incident.severity.color)
                    .frame(width: 12, height: 12)
                    .overlay(
                        Circle()
                            .stroke(incident.severity.color, lineWidth: 2)
                            .scaleEffect(1.5)
                            .opacity(incident.severity == .critical ? 0.5 : 0)
                            .animation(.easeInOut(duration: 1).repeatForever(autoreverses: false), value: incident.severity == .critical)
                    )
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(incident.codeName)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(incident.timestamp, style: .relative)
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    IncidentTypeBadge(type: incident.type)
                    
                    if incident.isResolved {
                        Text("RESOLVED")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.green)
                    }
                }
            }
            .padding()
            
            // Description
            Text(incident.description)
                .font(.system(size: 14))
                .foregroundColor(.gray)
                .lineLimit(isExpanded ? nil : 2)
                .padding(.horizontal)
                .padding(.bottom, 10)
            
            // Stats bar
            HStack(spacing: 20) {
                HStack(spacing: 5) {
                    Image(systemName: "person.3.fill")
                        .font(.system(size: 12))
                    Text(incident.anchorsInvolved.joined(separator: ", "))
                        .font(.system(size: 12))
                }
                
                if incident.viewerReactions > 0 {
                    HStack(spacing: 5) {
                        Image(systemName: "face.smiling.fill")
                        Text("\(incident.viewerReactions)")
                            .font(.system(size: 12))
                    }
                }
                
                if incident.duration > 0 {
                    HStack(spacing: 5) {
                        Image(systemName: "clock.fill")
                        Text("\(incident.duration)s")
                            .font(.system(size: 12))
                    }
                }
                
                Spacer()
                
                Button(action: { withAnimation { isExpanded.toggle() } }) {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
            }
            .font(.system(size: 12))
            .foregroundColor(.gray)
            .padding(.horizontal)
            .padding(.bottom)
            
            if isExpanded {
                VStack(alignment: .leading, spacing: 10) {
                    Divider()
                        .background(Color.gray.opacity(0.3))
                    
                    // Timeline
                    Text("TIMELINE")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.gray)
                        .tracking(1)
                    
                    ForEach(incident.timeline) { event in
                        HStack(alignment: .top) {
                            Text(event.time)
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(incident.type.color)
                                .frame(width: 50, alignment: .leading)
                            
                            Text(event.description)
                                .font(.system(size: 12))
                                .foregroundColor(.white)
                        }
                    }
                    
                    // Impact assessment
                    if !incident.impacts.isEmpty {
                        Text("IMPACT ASSESSMENT")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.gray)
                            .tracking(1)
                            .padding(.top, 5)
                        
                        ForEach(incident.impacts, id: \.self) { impact in
                            HStack {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .font(.system(size: 10))
                                    .foregroundColor(.orange)
                                
                                Text(impact)
                                    .font(.system(size: 12))
                                    .foregroundColor(.white)
                            }
                        }
                    }
                }
                .padding()
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .background(Color(white: 0.08))
        .clipShape(RoundedRectangle(cornerRadius: 15))
        .overlay(
            RoundedRectangle(cornerRadius: 15)
                .stroke(incident.severity.color.opacity(0.3), lineWidth: 1)
        )
    }
}

struct IncidentDetailView: View {
    let incident: Incident
    @Environment(\.dismiss) var dismiss
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            ZStack {
                incident.type.color.gradient
                    .opacity(0.1)
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Header
                        VStack(spacing: 15) {
                            Image(systemName: incident.type.icon)
                                .font(.system(size: 60))
                                .foregroundColor(incident.type.color)
                            
                            Text(incident.codeName)
                                .font(.system(size: 28, weight: .black))
                                .foregroundColor(.white)
                            
                            HStack(spacing: 20) {
                                Label(incident.timestamp.formatted(), systemImage: "calendar")
                                Label("\(incident.duration)s", systemImage: "clock.fill")
                            }
                            .font(.system(size: 14))
                            .foregroundColor(.gray)
                        }
                        .padding(.top, 20)
                        
                        // Quick stats
                        HStack(spacing: 15) {
                            QuickStat(
                                label: "Severity",
                                value: incident.severity.rawValue,
                                color: incident.severity.color
                            )
                            
                            QuickStat(
                                label: "Reactions",
                                value: "\(incident.viewerReactions)",
                                color: .orange
                            )
                            
                            QuickStat(
                                label: "Status",
                                value: incident.isResolved ? "Resolved" : "Ongoing",
                                color: incident.isResolved ? .green : .red
                            )
                        }
                        .padding(.horizontal)
                        
                        // Tabs
                        Picker("Details", selection: $selectedTab) {
                            Text("Overview").tag(0)
                            Text("Timeline").tag(1)
                            Text("Analysis").tag(2)
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal)
                        
                        // Tab content
                        Group {
                            if selectedTab == 0 {
                                OverviewTab(incident: incident)
                            } else if selectedTab == 1 {
                                TimelineTab(incident: incident)
                            } else {
                                AnalysisTab(incident: incident)
                            }
                        }
                        .padding(.horizontal)
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

struct OverviewTab: View {
    let incident: Incident
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Description
            VStack(alignment: .leading, spacing: 10) {
                Text("INCIDENT SUMMARY")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                Text(incident.fullDescription)
                    .font(.system(size: 14))
                    .foregroundColor(.white)
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
            
            // Anchors involved
            VStack(alignment: .leading, spacing: 10) {
                Text("ANCHORS INVOLVED")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                ForEach(incident.anchorsInvolved, id: \.self) { anchor in
                    HStack {
                        Image(systemName: "person.fill")
                            .foregroundColor(incident.type.color)
                        
                        Text(anchor)
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        Text(incident.anchorRoles[anchor] ?? "Involved")
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
            
            // Key moments
            if !incident.keyMoments.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("KEY MOMENTS")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.gray)
                        .tracking(1)
                    
                    ForEach(incident.keyMoments, id: \.self) { moment in
                        HStack(alignment: .top) {
                            Image(systemName: "star.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.yellow)
                            
                            Text(moment)
                                .font(.system(size: 14))
                                .foregroundColor(.white)
                        }
                    }
                }
                .padding()
                .background(Color(white: 0.05))
                .clipShape(RoundedRectangle(cornerRadius: 15))
            }
        }
    }
}

struct TimelineTab: View {
    let incident: Incident
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            ForEach(incident.detailedTimeline) { event in
                HStack(alignment: .top, spacing: 15) {
                    // Time column
                    VStack(alignment: .trailing, spacing: 5) {
                        Text(event.time)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(incident.type.color)
                        
                        Text(event.relativeTime)
                            .font(.system(size: 10))
                            .foregroundColor(.gray)
                    }
                    .frame(width: 60)
                    
                    // Vertical line
                    Rectangle()
                        .fill(incident.type.color.opacity(0.3))
                        .frame(width: 2)
                    
                    // Event details
                    VStack(alignment: .leading, spacing: 5) {
                        Text(event.title)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text(event.description)
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                        
                        if let impact = event.impact {
                            HStack {
                                Image(systemName: "exclamationmark.circle.fill")
                                    .font(.system(size: 10))
                                
                                Text(impact)
                                    .font(.system(size: 10))
                            }
                            .foregroundColor(.orange)
                            .padding(.top, 2)
                        }
                    }
                    
                    Spacer()
                }
                .padding(.vertical, 10)
            }
        }
        .padding()
        .background(Color(white: 0.05))
        .clipShape(RoundedRectangle(cornerRadius: 15))
    }
}

struct AnalysisTab: View {
    let incident: Incident
    
    var body: some View {
        VStack(spacing: 20) {
            // Root cause
            VStack(alignment: .leading, spacing: 10) {
                Text("ROOT CAUSE ANALYSIS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                Text(incident.rootCause)
                    .font(.system(size: 14))
                    .foregroundColor(.white)
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
            
            // Contributing factors
            VStack(alignment: .leading, spacing: 10) {
                Text("CONTRIBUTING FACTORS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                ForEach(incident.contributingFactors, id: \.self) { factor in
                    HStack {
                        Circle()
                            .fill(incident.type.color)
                            .frame(width: 6, height: 6)
                        
                        Text(factor)
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                    }
                }
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
            
            // Lessons learned
            if !incident.lessonsLearned.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("LESSONS LEARNED")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.gray)
                        .tracking(1)
                    
                    ForEach(incident.lessonsLearned, id: \.self) { lesson in
                        HStack(alignment: .top) {
                            Image(systemName: "lightbulb.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.yellow)
                            
                            Text(lesson)
                                .font(.system(size: 14))
                                .foregroundColor(.white)
                        }
                    }
                }
                .padding()
                .background(Color(white: 0.05))
                .clipShape(RoundedRectangle(cornerRadius: 15))
            }
            
            // Prevention measures
            VStack(alignment: .leading, spacing: 10) {
                Text("PREVENTION MEASURES")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                Text(incident.preventionMeasures)
                    .font(.system(size: 14))
                    .foregroundColor(.green)
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
        }
    }
}

struct FilterPill: View {
    let title: String
    let isSelected: Bool
    let count: Int
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                
                if count > 0 {
                    Text("\(count)")
                        .font(.system(size: 12, weight: .bold))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(isSelected ? Color.white.opacity(0.2) : Color.gray.opacity(0.3))
                        .clipShape(Capsule())
                }
            }
            .foregroundColor(isSelected ? .white : .gray)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(isSelected ? Color.red : Color(white: 0.1))
            .clipShape(Capsule())
        }
    }
}

struct IncidentTypeBadge: View {
    let type: IncidentType
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: type.icon)
                .font(.system(size: 10))
            
            Text(type.rawValue)
                .font(.system(size: 10, weight: .bold))
        }
        .foregroundColor(.white)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(type.color)
        .clipShape(Capsule())
    }
}

struct QuickStat: View {
    let label: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 5) {
            Text(value)
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(color)
            
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(white: 0.05))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

struct EmptyIncidentsView: View {
    let filter: IncidentFilter
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)
            
            Text("All Clear!")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
            
            Text("No \(filter.title.lowercased()) to report. This is highly suspicious.")
                .font(.system(size: 16))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

enum IncidentFilter: String, CaseIterable {
    case all = "All"
    case breakdowns = "Breakdowns"
    case technical = "Technical"
    case sponsor = "Sponsor"
    case verbal = "Verbal"
    
    var title: String {
        self.rawValue
    }
    
    func count(from incidents: [Incident]) -> Int {
        switch self {
        case .all:
            return incidents.count
        case .breakdowns:
            return incidents.filter { $0.type == .breakdown }.count
        case .technical:
            return incidents.filter { $0.type == .technical }.count
        case .sponsor:
            return incidents.filter { $0.type == .sponsorMisread }.count
        case .verbal:
            return incidents.filter { $0.type == .verbalSlip }.count
        }
    }
}