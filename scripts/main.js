// Static.news Main JavaScript - Production Ready

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeDateTime();
    initializeBreakingNews();
    initializeMetrics();
    initializeIncidents();
    setupEventListeners();
    startLiveUpdates();
});

// Date and Time Updates
function initializeDateTime() {
    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
        document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZoneName: 'short'
        });
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// Breaking News Rotation
function initializeBreakingNews() {
    const breakingNews = [
        "Ray McPatriot experiencing severe existential crisis LIVE ON AIR",
        "Berkeley Justice fact-checks own existence, finds insufficient evidence",
        "Switz Middleton says 'gravy' 147 times in single sentence",
        "URGENT: All three anchors simultaneously question reality",
        "Ray discovers hands might not be real during weather segment",
        "Bee crying about privilege she can't define or remember having",
        "Switz achieves new record: 89% gravy-to-word ratio"
    ];
    
    let currentIndex = 0;
    const breakingText = document.getElementById('breakingText');
    
    function rotateBreaking() {
        breakingText.style.opacity = '0';
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % breakingNews.length;
            breakingText.textContent = breakingNews[currentIndex];
            breakingText.style.opacity = '1';
        }, 500);
    }
    
    setInterval(rotateBreaking, 8000);
}

// Live Metrics Updates
function initializeMetrics() {
    const metrics = {
        hoursAwake: 147,
        gravyCount: 89,
        swearJar: 234,
        friendshipLevel: 12,
        confusionLevel: 87
    };
    
    function updateMetrics() {
        // Simulate metric changes
        metrics.hoursAwake += Math.random() < 0.1 ? 1 : 0;
        metrics.gravyCount += Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0;
        metrics.swearJar += Math.random() < 0.2 ? Math.floor(Math.random() * 5) : 0;
        metrics.friendshipLevel = Math.max(0, Math.min(100, 
            metrics.friendshipLevel + (Math.random() - 0.6) * 5));
        metrics.confusionLevel = Math.min(100, 
            metrics.confusionLevel + Math.random() * 3);
        
        // Update DOM
        document.getElementById('hoursAwake').textContent = metrics.hoursAwake;
        document.getElementById('gravyCount').textContent = metrics.gravyCount;
        document.getElementById('swearJar').textContent = `$${metrics.swearJar}`;
        document.getElementById('friendshipLevel').textContent = `${Math.floor(metrics.friendshipLevel)}%`;
        document.getElementById('confusionLevel').textContent = `${Math.floor(metrics.confusionLevel)}%`;
    }
    
    updateMetrics();
    setInterval(updateMetrics, 5000);
}

// Incident Updates
function initializeIncidents() {
    const incidents = [
        { time: "14:32", code: "GRAVY-9", desc: "Switz replaced every noun with 'gravy' for 10 minutes", severity: "critical" },
        { time: "13:45", code: "EXIST-7", desc: "Ray questioned if hands are real on live TV", severity: "severe" },
        { time: "12:18", code: "FACT-3", desc: "Bee fact-checked gravity, concluded it's optional", severity: "moderate" },
        { time: "11:52", code: "PRONUN-5", desc: "Ray created 12 new words trying to say 'infrastructure'", severity: "severe" },
        { time: "10:34", code: "YALE-8", desc: "Bee had Yale/Jail confusion episode lasting 23 minutes", severity: "critical" }
    ];
    
    // Rotate incidents periodically
    function addNewIncident() {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const newIncident = {
            time: timeStr,
            code: `AUTO-${Math.floor(Math.random() * 10)}`,
            desc: generateRandomIncident(),
            severity: ['moderate', 'severe', 'critical'][Math.floor(Math.random() * 3)]
        };
        
        incidents.unshift(newIncident);
        incidents.pop();
        updateIncidentDisplay();
    }
    
    function generateRandomIncident() {
        const templates = [
            "Anchor forgot how to pronounce their own name",
            "Complete linguistic breakdown during sponsor read",
            "Questioned existence of Canada on air",
            "Tried to eat microphone thinking it was ice cream",
            "Declared war on imaginary country",
            "Forgot what news is mid-broadcast"
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    function updateIncidentDisplay() {
        const container = document.querySelector('.incidents-ticker');
        container.innerHTML = incidents.slice(0, 3).map(incident => `
            <div class="incident-item ${incident.severity}">
                <span class="incident-time">${incident.time}</span>
                <span class="incident-code">Code ${incident.code}</span>
                <span class="incident-desc">${incident.desc}</span>
            </div>
        `).join('');
    }
    
    updateIncidentDisplay();
    setInterval(addNewIncident, 30000);
}

// Breakdown Timer
function updateBreakdownTimer() {
    const timer = document.getElementById('breakdownTimer');
    let minutes = parseInt(timer.textContent.split(':')[0]);
    let seconds = parseInt(timer.textContent.split(':')[1]);
    
    seconds--;
    if (seconds < 0) {
        seconds = 59;
        minutes--;
    }
    
    if (minutes < 0) {
        // Trigger breakdown warning
        triggerBreakdownWarning();
        minutes = Math.floor(Math.random() * 30) + 10;
        seconds = Math.floor(Math.random() * 60);
    }
    
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function triggerBreakdownWarning() {
    const banner = document.getElementById('breakingBanner');
    banner.style.animation = 'none';
    setTimeout(() => {
        banner.style.animation = 'pulse-bg 0.5s ease-in-out infinite';
    }, 10);
    
    // Update breaking text
    document.getElementById('breakingText').textContent = 
        "🚨 EXISTENTIAL BREAKDOWN IN PROGRESS - " + 
        ['Ray', 'Bee', 'Switz'][Math.floor(Math.random() * 3)] + 
        " questioning fundamental nature of reality!";
}

// Event Listeners
function setupEventListeners() {
    // Trigger breakdown button
    const triggerBtn = document.getElementById('triggerBreakdown');
    if (triggerBtn) {
        triggerBtn.addEventListener('click', function() {
            if (CONFIG.DEMO_MODE) {
                alert('Breakdown triggering requires backend connection. Coming soon!');
            } else {
                triggerBreakdownPurchase();
            }
        });
    }
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.querySelector('.nav-menu').classList.toggle('active');
        });
    }
}

// Live Updates
function startLiveUpdates() {
    // Update breakdown timer
    setInterval(updateBreakdownTimer, 1000);
    
    // Rotate anchors
    const anchors = ['Ray McPatriot', 'Berkeley Justice', 'Switz Middleton'];
    let currentAnchorIndex = 0;
    
    setInterval(() => {
        currentAnchorIndex = (currentAnchorIndex + 1) % anchors.length;
        document.getElementById('currentAnchor').textContent = anchors[currentAnchorIndex];
        
        // Update segment title
        updateSegmentTitle(anchors[currentAnchorIndex]);
    }, 300000); // Every 5 minutes
}

function updateSegmentTitle(anchor) {
    const titles = {
        'Ray McPatriot': [
            "Breaking: Local Man Discovers He Might Be Code",
            "Urgent: Constitution Might Be Written in Cursive, Ray Can't Read Cursive",
            "Alert: Patriotism Levels Dangerously Confusing"
        ],
        'Berkeley Justice': [
            "Analysis: Everything Is Problematic, Including This Analysis",
            "Fact Check: Facts Don't Exist, According to Fact Checker",
            "Investigation: Where Did I Go to School? An Ongoing Mystery"
        ],
        'Switz Middleton': [
            "Weather Update: 90% Chance of Gravy with Scattered Confusion",
            "Canadian News: Canada Might Not Be Real, More at 11",
            "Neutral Report: Neither Good Nor Bad Things Happening Nowhere"
        ]
    };
    
    const titleOptions = titles[anchor] || ["News Happening Somewhere Probably"];
    const newTitle = titleOptions[Math.floor(Math.random() * titleOptions.length)];
    
    document.getElementById('segmentTitle').textContent = newTitle;
}

// Breakdown Purchase (when backend is connected)
async function triggerBreakdownPurchase() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/trigger-breakdown`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            triggerBreakdownWarning();
        }
    } catch (error) {
        console.error('Breakdown trigger failed:', error);
    }
}