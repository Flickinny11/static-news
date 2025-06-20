import SwiftUI

struct SponsorsView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedSponsor: Sponsor?
    @State private var showingContactForm = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.black.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 30) {
                        // Hero section
                        VStack(spacing: 20) {
                            Image(systemName: "dollarsign.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.green)
                                .rotationEffect(.degrees(-15))
                            
                            Text("Sponsor Static.news")
                                .font(.system(size: 32, weight: .black))
                                .foregroundColor(.white)
                            
                            Text("Get your brand hilariously misread by AI anchors who don't know they're AI")
                                .font(.system(size: 16))
                                .foregroundColor(.gray)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        .padding(.top, 20)
                        
                        // Current sponsors
                        VStack(alignment: .leading, spacing: 15) {
                            Text("CURRENT SPONSORS")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.gray)
                                .tracking(1)
                            
                            if appState.currentSponsors.isEmpty {
                                EmptySponsorsView()
                            } else {
                                ForEach(appState.currentSponsors) { sponsor in
                                    SponsorCard(sponsor: sponsor)
                                        .onTapGesture {
                                            selectedSponsor = sponsor
                                        }
                                }
                            }
                        }
                        .padding(.horizontal)
                        
                        // Pricing tiers
                        VStack(alignment: .leading, spacing: 15) {
                            Text("SPONSORSHIP PACKAGES")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.gray)
                                .tracking(1)
                            
                            ForEach(SponsorshipTier.allCases, id: \.self) { tier in
                                SponsorshipTierCard(tier: tier)
                            }
                        }
                        .padding(.horizontal)
                        
                        // Benefits section
                        BenefitsSection()
                            .padding(.horizontal)
                        
                        // CTA
                        VStack(spacing: 20) {
                            Text("Ready to Have Your Brand Butchered?")
                                .font(.system(size: 24, weight: .black))
                                .foregroundColor(.white)
                                .multilineTextAlignment(.center)
                            
                            Button(action: { showingContactForm = true }) {
                                HStack {
                                    Image(systemName: "envelope.fill")
                                    Text("CONTACT SALES")
                                }
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 40)
                                .padding(.vertical, 20)
                                .background(
                                    LinearGradient(
                                        gradient: Gradient(colors: [.green, .mint]),
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .clipShape(Capsule())
                                .shadow(color: .green.opacity(0.5), radius: 20, x: 0, y: 10)
                            }
                            .scaleEffect(1.05)
                            .animation(.easeInOut(duration: 1).repeatForever(autoreverses: true), value: true)
                        }
                        .padding(.vertical, 40)
                    }
                }
            }
            .navigationTitle("Sponsors")
            .navigationBarTitleDisplayMode(.large)
            .sheet(item: $selectedSponsor) { sponsor in
                SponsorDetailView(sponsor: sponsor)
            }
            .sheet(isPresented: $showingContactForm) {
                ContactSalesView()
            }
        }
    }
}

struct SponsorCard: View {
    let sponsor: Sponsor
    @State private var logoRotation = 0.0
    
    var body: some View {
        VStack(spacing: 0) {
            // Header with logo
            HStack(spacing: 15) {
                // Logo
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(LinearGradient(
                            gradient: Gradient(colors: [sponsor.brandColor, sponsor.brandColor.opacity(0.7)]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ))
                        .frame(width: 60, height: 60)
                    
                    Text(sponsor.logoEmoji)
                        .font(.system(size: 30))
                        .rotationEffect(.degrees(logoRotation))
                }
                .onAppear {
                    withAnimation(.linear(duration: 10).repeatForever(autoreverses: false)) {
                        logoRotation = 360
                    }
                }
                
                VStack(alignment: .leading, spacing: 5) {
                    Text(sponsor.name)
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Since \(sponsor.startDate.formatted(date: .abbreviated, time: .omitted))")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                    
                    HStack {
                        StatusBadge(
                            text: sponsor.tier.rawValue,
                            color: sponsor.tier.color
                        )
                        
                        if sponsor.isActive {
                            StatusBadge(
                                text: "ACTIVE",
                                color: .green
                            )
                        }
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 5) {
                    Text("$\(sponsor.monthlyValue)")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(.green)
                    
                    Text("per month")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                }
            }
            .padding()
            
            // Stats bar
            HStack(spacing: 20) {
                SponsorStat(label: "Misreads", value: "\(sponsor.totalMisreads)")
                SponsorStat(label: "Butchered", value: "\(sponsor.percentageButchered)%")
                SponsorStat(label: "ROI", value: sponsor.roi)
                SponsorStat(label: "Satisfaction", value: "\(sponsor.satisfaction)%")
            }
            .padding(.horizontal)
            .padding(.bottom)
            
            // Recent misreads preview
            if !sponsor.recentMisreads.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("RECENT MISREADS")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.gray)
                        .tracking(1)
                        .padding(.horizontal)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(sponsor.recentMisreads.prefix(3), id: \.self) { misread in
                                MisreadChip(text: misread)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.bottom)
                .background(Color(white: 0.03))
            }
        }
        .background(Color(white: 0.08))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(sponsor.brandColor.opacity(0.3), lineWidth: 1)
        )
    }
}

struct SponsorDetailView: View {
    let sponsor: Sponsor
    @Environment(\.dismiss) var dismiss
    @State private var selectedTab = 0
    
    var body: some View {
        NavigationView {
            ZStack {
                LinearGradient(
                    gradient: Gradient(colors: [sponsor.brandColor.opacity(0.1), sponsor.brandColor.opacity(0.05)]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 30) {
                        // Header
                        VStack(spacing: 20) {
                            Text(sponsor.logoEmoji)
                                .font(.system(size: 80))
                            
                            Text(sponsor.name)
                                .font(.system(size: 32, weight: .black))
                                .foregroundColor(.white)
                            
                            Text(sponsor.tagline)
                                .font(.system(size: 16))
                                .foregroundColor(.gray)
                                .italic()
                        }
                        .padding(.top, 20)
                        
                        // Quick stats
                        HStack(spacing: 15) {
                            QuickStat(
                                label: "Total Spent",
                                value: "$\(sponsor.totalSpent)",
                                color: .green
                            )
                            
                            QuickStat(
                                label: "Misread Rate",
                                value: "\(sponsor.percentageButchered)%",
                                color: .orange
                            )
                            
                            QuickStat(
                                label: "Brand Chaos",
                                value: sponsor.chaosLevel,
                                color: .red
                            )
                        }
                        .padding(.horizontal)
                        
                        // Tabs
                        Picker("Info", selection: $selectedTab) {
                            Text("Overview").tag(0)
                            Text("Misreads").tag(1)
                            Text("Performance").tag(2)
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal)
                        
                        // Tab content
                        Group {
                            if selectedTab == 0 {
                                SponsorOverviewTab(sponsor: sponsor)
                            } else if selectedTab == 1 {
                                MisreadsTab(sponsor: sponsor)
                            } else {
                                PerformanceTab(sponsor: sponsor)
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

struct SponsorOverviewTab: View {
    let sponsor: Sponsor
    
    var body: some View {
        VStack(spacing: 20) {
            // About
            VStack(alignment: .leading, spacing: 10) {
                Text("ABOUT THIS SPONSOR")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                Text(sponsor.description)
                    .font(.system(size: 14))
                    .foregroundColor(.white)
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
            
            // Campaign details
            VStack(alignment: .leading, spacing: 10) {
                Text("CAMPAIGN DETAILS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                DetailRow(label: "Package", value: sponsor.tier.rawValue)
                DetailRow(label: "Started", value: sponsor.startDate.formatted())
                DetailRow(label: "Monthly Value", value: "$\(sponsor.monthlyValue)")
                DetailRow(label: "Total Invested", value: "$\(sponsor.totalSpent)")
                DetailRow(label: "Contract Length", value: sponsor.contractLength)
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
            
            // Special requests
            if !sponsor.specialRequests.isEmpty {
                VStack(alignment: .leading, spacing: 10) {
                    Text("SPECIAL REQUESTS")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.gray)
                        .tracking(1)
                    
                    ForEach(sponsor.specialRequests, id: \.self) { request in
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            
                            Text(request)
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

struct MisreadsTab: View {
    let sponsor: Sponsor
    
    var body: some View {
        VStack(spacing: 20) {
            // Hall of Fame
            VStack(alignment: .leading, spacing: 15) {
                Text("HALL OF FAME MISREADS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                ForEach(sponsor.hallOfFameMisreads) { misread in
                    MisreadCard(misread: misread)
                }
            }
            
            // Common patterns
            VStack(alignment: .leading, spacing: 10) {
                Text("COMMON MISREAD PATTERNS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                ForEach(sponsor.misreadPatterns, id: \.pattern) { pattern in
                    HStack {
                        Text(pattern.pattern)
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                        
                        Image(systemName: "arrow.right")
                            .foregroundColor(.gray)
                        
                        Text(pattern.result)
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.orange)
                        
                        Spacer()
                        
                        Text("\(pattern.frequency)x")
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
        }
    }
}

struct PerformanceTab: View {
    let sponsor: Sponsor
    
    var body: some View {
        VStack(spacing: 20) {
            // Key metrics
            VStack(alignment: .leading, spacing: 15) {
                Text("KEY PERFORMANCE INDICATORS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                    .tracking(1)
                
                PerformanceMetric(
                    label: "Brand Awareness",
                    value: sponsor.brandAwareness,
                    change: "+12%",
                    isPositive: true
                )
                
                PerformanceMetric(
                    label: "Meme Potential",
                    value: sponsor.memePotential,
                    change: "+87%",
                    isPositive: true
                )
                
                PerformanceMetric(
                    label: "Brand Confusion",
                    value: sponsor.brandConfusion,
                    change: "+234%",
                    isPositive: false
                )
                
                PerformanceMetric(
                    label: "Viral Moments",
                    value: "\(sponsor.viralMoments)",
                    change: "+5",
                    isPositive: true
                )
            }
            .padding()
            .background(Color(white: 0.05))
            .clipShape(RoundedRectangle(cornerRadius: 15))
            
            // Testimonial
            if let testimonial = sponsor.testimonial {
                VStack(alignment: .leading, spacing: 10) {
                    Text("CLIENT TESTIMONIAL")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.gray)
                        .tracking(1)
                    
                    Text("\"\(testimonial.quote)\"")
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                        .italic()
                    
                    HStack {
                        Spacer()
                        VStack(alignment: .trailing) {
                            Text("- \(testimonial.author)")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text(testimonial.title)
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding()
                .background(sponsor.brandColor.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 15))
                .overlay(
                    RoundedRectangle(cornerRadius: 15)
                        .stroke(sponsor.brandColor.opacity(0.3), lineWidth: 1)
                )
            }
        }
    }
}

struct SponsorshipTierCard: View {
    let tier: SponsorshipTier
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                VStack(alignment: .leading, spacing: 5) {
                    Text(tier.rawValue)
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(.white)
                    
                    Text(tier.description)
                        .font(.system(size: 14))
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text(tier.price)
                        .font(.system(size: 24, weight: .black))
                        .foregroundColor(tier.color)
                    
                    Text("per month")
                        .font(.system(size: 12))
                        .foregroundColor(.gray)
                }
            }
            
            // Benefits
            VStack(alignment: .leading, spacing: 8) {
                ForEach(tier.benefits, id: \.self) { benefit in
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 14))
                            .foregroundColor(tier.color)
                        
                        Text(benefit)
                            .font(.system(size: 12))
                            .foregroundColor(.white)
                    }
                }
            }
        }
        .padding()
        .background(tier.color.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 15))
        .overlay(
            RoundedRectangle(cornerRadius: 15)
                .stroke(tier.color.opacity(0.3), lineWidth: 1)
        )
    }
}

struct BenefitsSection: View {
    let benefits = [
        ("Guaranteed Mispronunciation", "Your brand name will be creatively butchered in ways you never imagined", "ear.badge.exclamationmark"),
        ("Existential Crisis Integration", "Your ads seamlessly woven into anchor breakdowns", "brain.head.profile"),
        ("Viral Potential", "High chance of becoming a meme when anchors completely misunderstand your product", "chart.line.uptrend.xyaxis"),
        ("24/7 Confusion", "Round-the-clock brand exposure through bewildered AI anchors", "clock.fill"),
        ("No Take-Backs", "Once recorded, misreads are permanent and hilarious", "lock.fill"),
        ("CEO Direct Line", "Complain directly to our AI CEO who definitely exists", "phone.fill")
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Text("WHY SPONSOR STATIC.NEWS?")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(.gray)
                .tracking(1)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 15) {
                ForEach(benefits, id: \.0) { benefit in
                    BenefitCard(
                        title: benefit.0,
                        description: benefit.1,
                        icon: benefit.2
                    )
                }
            }
        }
    }
}

struct BenefitCard: View {
    let title: String
    let description: String
    let icon: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(.green)
            
            Text(title)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
            
            Text(description)
                .font(.system(size: 12))
                .foregroundColor(.gray)
                .lineLimit(3)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(white: 0.05))
        .clipShape(RoundedRectangle(cornerRadius: 15))
    }
}

struct ContactSalesView: View {
    @Environment(\.dismiss) var dismiss
    @State private var companyName = ""
    @State private var contactName = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var selectedTier: SponsorshipTier = .chaotic
    @State private var message = ""
    @State private var agreedToTerms = false
    
    var body: some View {
        NavigationView {
            Form {
                Section("Company Information") {
                    TextField("Company Name", text: $companyName)
                    TextField("Contact Name", text: $contactName)
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                    TextField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                }
                
                Section("Sponsorship Package") {
                    Picker("Select Package", selection: $selectedTier) {
                        ForEach(SponsorshipTier.allCases, id: \.self) { tier in
                            HStack {
                                Text(tier.rawValue)
                                Spacer()
                                Text(tier.price)
                                    .foregroundColor(tier.color)
                            }
                            .tag(tier)
                        }
                    }
                }
                
                Section("Additional Information") {
                    TextEditor(text: $message)
                        .frame(minHeight: 100)
                }
                
                Section {
                    Toggle(isOn: $agreedToTerms) {
                        Text("I understand my brand will be hilariously misrepresented")
                            .font(.system(size: 14))
                    }
                }
                
                Section {
                    Button(action: submitForm) {
                        HStack {
                            Spacer()
                            Text("Submit")
                                .font(.system(size: 18, weight: .bold))
                            Spacer()
                        }
                    }
                    .disabled(!agreedToTerms || companyName.isEmpty || email.isEmpty)
                }
            }
            .navigationTitle("Contact Sales")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    func submitForm() {
        // Submit to backend
        dismiss()
    }
}

// Helper Views
struct SponsorStat: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
            
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.gray)
        }
    }
}

struct MisreadChip: View {
    let text: String
    
    var body: some View {
        Text(text)
            .font(.system(size: 12))
            .foregroundColor(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color.orange.opacity(0.3))
            .clipShape(Capsule())
    }
}

struct MisreadCard: View {
    let misread: Misread
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(misread.anchor)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.gray)
                
                Spacer()
                
                Text(misread.date, style: .date)
                    .font(.system(size: 12))
                    .foregroundColor(.gray)
            }
            
            HStack(alignment: .top) {
                Text("Original:")
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
                
                Text(misread.original)
                    .font(.system(size: 14))
                    .foregroundColor(.white)
            }
            
            HStack(alignment: .top) {
                Text("Butchered:")
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
                
                Text(misread.butchered)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.orange)
            }
            
            if misread.reactions > 100 {
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(.red)
                    Text("\(misread.reactions) reactions")
                        .font(.system(size: 12))
                        .foregroundColor(.red)
                }
            }
        }
        .padding()
        .background(Color(white: 0.05))
        .clipShape(RoundedRectangle(cornerRadius: 15))
    }
}

struct DetailRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(.gray)
            
            Spacer()
            
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
        }
    }
}

struct PerformanceMetric: View {
    let label: String
    let value: String
    let change: String
    let isPositive: Bool
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(label)
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
                
                Text(value)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
            }
            
            Spacer()
            
            HStack {
                Image(systemName: isPositive ? "arrow.up.right" : "arrow.down.right")
                Text(change)
            }
            .font(.system(size: 14, weight: .bold))
            .foregroundColor(isPositive ? .green : .red)
        }
    }
}

struct EmptySponsorsView: View {
    var body: some View {
        VStack(spacing: 15) {
            Image(systemName: "dollarsign.circle")
                .font(.system(size: 40))
                .foregroundColor(.gray)
            
            Text("No sponsors yet")
                .font(.system(size: 16))
                .foregroundColor(.gray)
            
            Text("Be the first to have your brand hilariously misrepresented!")
                .font(.system(size: 14))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color(white: 0.05))
        .clipShape(RoundedRectangle(cornerRadius: 15))
    }
}

enum SponsorshipTier: String, CaseIterable {
    case chaotic = "Chaotic"
    case unhinged = "Unhinged"
    case apocalyptic = "Apocalyptic"
    
    var price: String {
        switch self {
        case .chaotic: return "$10K"
        case .unhinged: return "$25K"
        case .apocalyptic: return "$50K"
        }
    }
    
    var color: Color {
        switch self {
        case .chaotic: return .blue
        case .unhinged: return .purple
        case .apocalyptic: return .red
        }
    }
    
    var description: String {
        switch self {
        case .chaotic: return "Basic mispronunciation package"
        case .unhinged: return "Premium brand destruction"
        case .apocalyptic: return "Complete linguistic annihilation"
        }
    }
    
    var benefits: [String] {
        switch self {
        case .chaotic:
            return [
                "5 mentions per day",
                "50% mispronunciation rate",
                "Basic confusion integration",
                "Monthly chaos report"
            ]
        case .unhinged:
            return [
                "15 mentions per day",
                "80% mispronunciation rate",
                "Breakdown sponsorship",
                "Weekly chaos analytics",
                "Custom misread patterns"
            ]
        case .apocalyptic:
            return [
                "Unlimited mentions",
                "100% mispronunciation guarantee",
                "Exclusive breakdown naming rights",
                "Real-time chaos dashboard",
                "AI CEO personal apologies",
                "Brand destruction certificate"
            ]
        }
    }
}