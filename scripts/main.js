// Static.news Main JavaScript - Enhanced with Real Data Integration

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeDateTime();
    initializeBreakingNews();
    initializeLiveData();
    initializeIncidents();
    setupEventListeners();
    startLiveUpdates();
});

// Global data store
let liveData = {
    currentShow: null,
    currentSegment: null,
    recentNews: [],
    weatherData: null,
    sportsData: [],
    metrics: {}
};

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

// Enhanced Breaking News with Real Data
function initializeBreakingNews() {
    const breakingText = document.getElementById('breakingText');
    
    async function updateBreakingNews() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/news/latest`);
            const data = await response.json();
            
            if (data.articles && data.articles.length > 0) {
                // Filter for breaking news
                const breakingNews = data.articles.filter(article => article.urgency === 'breaking');
                
                if (breakingNews.length > 0) {
                    const randomBreaking = breakingNews[Math.floor(Math.random() * breakingNews.length)];
                    breakingText.style.opacity = '0';
                    setTimeout(() => {
                        breakingText.textContent = `BREAKING: ${randomBreaking.title}`;
                        breakingText.style.opacity = '1';
                    }, 500);
                } else {
                    // Fallback to regular news as "breaking"
                    const topStory = data.articles[0];
                    breakingText.style.opacity = '0';
                    setTimeout(() => {
                        breakingText.textContent = `LIVE COVERAGE: ${topStory.title}`;
                        breakingText.style.opacity = '1';
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Breaking news update failed:', error);
            // Fallback to static breaking news
            fallbackBreakingNews();
        }
    }
    
    function fallbackBreakingNews() {
        const breakingNews = [
            "Ray McPatriot experiencing severe existential crisis LIVE ON AIR",
            "Berkeley Justice fact-checks own existence, finds insufficient evidence", 
            "Switz Middleton says 'gravy' 147 times in single sentence",
            "URGENT: All three anchors simultaneously question reality"
        ];
        
        const randomNews = breakingNews[Math.floor(Math.random() * breakingNews.length)];
        breakingText.textContent = randomNews;
    }
    
    // Update breaking news every 30 seconds
    updateBreakingNews();
    setInterval(updateBreakingNews, 30000);
}

// Initialize Live Data Integration
async function initializeLiveData() {
    try {
        // Fetch current broadcast info
        const broadcastResponse = await fetch(`${CONFIG.API_URL}/live/current`);
        const broadcastData = await broadcastResponse.json();
        
        if (broadcastData.current_show) {
            liveData.currentShow = broadcastData.current_show;
            liveData.currentSegment = broadcastData.current_segment;
            
            // Update UI with current show
            updateCurrentShowDisplay(broadcastData);
        }
        
        // Fetch latest news
        const newsResponse = await fetch(`${CONFIG.API_URL}/news/latest`);
        const newsData = await newsResponse.json();
        
        if (newsData.articles) {
            liveData.recentNews = newsData.articles;
            updateNewsDisplay(newsData.articles);
        }
        
    } catch (error) {
        console.error('Live data initialization failed:', error);
        // Fall back to mock data
        initializeMockData();
    }
}

function updateCurrentShowDisplay(broadcastData) {
    // Update header show info
    const showNameEl = document.querySelector('.show-name');
    const anchorNameEl = document.getElementById('currentAnchor');
    const segmentTitleEl = document.getElementById('segmentTitle');
    
    if (showNameEl && broadcastData.current_show) {
        showNameEl.textContent = broadcastData.current_show.name;
    }
    
    if (anchorNameEl && broadcastData.current_show) {
        anchorNameEl.textContent = broadcastData.current_show.anchor;
    }
    
    if (segmentTitleEl && broadcastData.current_segment) {
        segmentTitleEl.textContent = broadcastData.current_segment.title || 'Live Coverage';
    }
    
    // Update viewer count if available
    const viewerCountEl = document.querySelector('.viewer-count');
    if (viewerCountEl && broadcastData.live_metrics) {
        viewerCountEl.textContent = `${(broadcastData.live_metrics.viewers / 1000).toFixed(0)}K watching`;
    }
    
    // Update confusion level
    const confusionLevelEl = document.getElementById('confusionLevel');
    if (confusionLevelEl && broadcastData.live_metrics) {
        confusionLevelEl.textContent = `${broadcastData.live_metrics.confusion_level}%`;
    }
}

function updateNewsDisplay(articles) {
    const storiesGrid = document.querySelector('.stories-grid');
    if (!storiesGrid) return;
    
    // Clear existing stories except the first one (template)
    const existingStories = storiesGrid.querySelectorAll('.story-card:not(:first-child)');
    existingStories.forEach(story => story.remove());
    
    // Add new stories from real news
    articles.slice(0, 3).forEach((article, index) => {
        if (index === 0) {
            // Update the featured story
            const featuredStory = storiesGrid.querySelector('.story-card.featured');
            if (featuredStory) {
                updateStoryCard(featuredStory, article, true);
            }
        } else {
            // Create new story cards
            const storyCard = createStoryCard(article, false);
            storiesGrid.appendChild(storyCard);
        }
    });
}

function updateStoryCard(cardElement, article, isFeatured = false) {
    const titleEl = cardElement.querySelector('h3 a');
    const summaryEl = cardElement.querySelector('p');
    const authorEl = cardElement.querySelector('.author');
    const timeEl = cardElement.querySelector('.time');
    const categoryEl = cardElement.querySelector('.story-category');
    
    if (titleEl) titleEl.textContent = article.title;
    if (summaryEl) summaryEl.textContent = article.summary;
    if (authorEl) authorEl.textContent = article.source;
    if (timeEl) {
        const publishedTime = new Date(article.published);
        const now = new Date();
        const diffHours = Math.floor((now - publishedTime) / (1000 * 60 * 60));
        timeEl.textContent = `${diffHours} hours ago`;
    }
    if (categoryEl) categoryEl.textContent = article.category.toUpperCase();
    
    // Update category styling
    const banner = cardElement.querySelector('.story-banner');
    if (banner) {
        banner.className = `story-banner ${article.category}`;
    }
}

function createStoryCard(article, isFeatured = false) {
    const cardElement = document.createElement('article');
    cardElement.className = isFeatured ? 'story-card featured' : 'story-card';
    
    const publishedTime = new Date(article.published);
    const now = new Date();
    const diffHours = Math.floor((now - publishedTime) / (1000 * 60 * 60));
    
    cardElement.innerHTML = `
        <div class="story-banner ${article.category}">
            <div class="story-icon">${getCategoryIcon(article.category)}</div>
            <span class="story-category">${article.category.toUpperCase()}</span>
        </div>
        <div class="story-content">
            <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
            <p>${article.summary}</p>
            <div class="story-meta">
                <span class="author">${article.source}</span>
                <span class="time">${diffHours} hours ago</span>
            </div>
        </div>
    `;
    
    return cardElement;
}

function getCategoryIcon(category) {
    const icons = {
        'politics': '🏛️',
        'business': '💼',
        'technology': '💻',
        'sports': '⚽',
        'weather': '🌤️',
        'international': '🌍',
        'general': '📰'
    };
    return icons[category] || '📰';
}

// Enhanced Live Metrics with Real Data
function initializeMetrics() {
    const metrics = {
        hoursAwake: 147,
        gravyCount: 89,
        swearJar: 234,
        friendshipLevel: 12,
        confusionLevel: 87
    };
    
    async function updateMetrics() {
        try {
            // Fetch real metrics if available
            const response = await fetch(`${CONFIG.API_URL}/metrics`);
            const data = await response.json();
            
            if (data && !data.error) {
                // Update with real data
                metrics.gravyCount = data.gravy_mentions || metrics.gravyCount;
                metrics.swearJar = data.swear_jar_total || metrics.swearJar;
                metrics.hoursAwake = data.hours_without_sleep || metrics.hoursAwake;
            }
        } catch (error) {
            console.error('Metrics update failed:', error);
        }
        
        // Simulate some changes for entertainment
        metrics.hoursAwake += Math.random() < 0.1 ? 1 : 0;
        metrics.gravyCount += Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0;
        metrics.swearJar += Math.random() < 0.2 ? Math.floor(Math.random() * 5) : 0;
        metrics.friendshipLevel = Math.max(0, Math.min(100, 
            metrics.friendshipLevel + (Math.random() - 0.6) * 5));
        metrics.confusionLevel = Math.min(100, 
            metrics.confusionLevel + Math.random() * 3);
        
        // Update DOM
        updateMetricsDisplay(metrics);
    }
    
    function updateMetricsDisplay(metrics) {
        const elements = {
            'hoursAwake': metrics.hoursAwake,
            'gravyCount': metrics.gravyCount,
            'swearJar': `$${metrics.swearJar}`,
            'friendshipLevel': `${Math.floor(metrics.friendshipLevel)}%`,
            'confusionLevel': `${Math.floor(metrics.confusionLevel)}%`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    updateMetrics();
    setInterval(updateMetrics, 5000);
}

// Weather Integration
async function updateWeatherInfo() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/weather/New York`);
        const weatherData = await response.json();
        
        if (weatherData && !weatherData.error) {
            liveData.weatherData = weatherData;
            
            // Update weather display if elements exist
            const weatherElements = document.querySelectorAll('.weather-info');
            weatherElements.forEach(el => {
                el.innerHTML = `
                    <span>${weatherData.city}: ${weatherData.temperature}°F</span>
                    <span>${weatherData.description}</span>
                `;
            });
        }
    } catch (error) {
        console.error('Weather update failed:', error);
    }
}

// Enhanced Schedule Integration
async function updateScheduleDisplay() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/schedule`);
        const scheduleData = await response.json();
        
        if (scheduleData && scheduleData.upcoming_shows) {
            // Update upcoming shows display
            const upcomingContainer = document.querySelector('.upcoming-shows');
            if (upcomingContainer) {
                upcomingContainer.innerHTML = scheduleData.upcoming_shows.slice(0, 3).map(show => `
                    <div class="upcoming-show">
                        <span class="show-time">${show.start_time}</span>
                        <span class="show-name">${show.name}</span>
                        <span class="show-anchor">${show.anchor}</span>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Schedule update failed:', error);
    }
}

// Initialize mock data fallback
function initializeMockData() {
    console.log('Falling back to mock data');
    // Keep existing mock functionality as fallback
    const mockMetrics = {
        hoursAwake: 147,
        gravyCount: 89,
        swearJar: 234,
        friendshipLevel: 12,
        confusionLevel: 87
    };
    
    updateMetricsDisplay(mockMetrics);
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
    
    // Update weather info every 10 minutes
    updateWeatherInfo();
    setInterval(updateWeatherInfo, 600000);
    
    // Update schedule display every 5 minutes
    updateScheduleDisplay();
    setInterval(updateScheduleDisplay, 300000);
    
    // Refresh live data every 30 seconds
    setInterval(initializeLiveData, 30000);
    
    // Rotate anchors based on actual schedule
    const anchors = ['Ray McPatriot', 'Berkeley Justice', 'Switz Middleton'];
    let currentAnchorIndex = 0;
    
    setInterval(async () => {
        try {
            // Get current show info to determine actual anchor
            const response = await fetch(`${CONFIG.API_URL}/live/current`);
            const data = await response.json();
            
            if (data.current_show && data.current_show.anchor) {
                document.getElementById('currentAnchor').textContent = data.current_show.anchor;
                updateSegmentTitle(data.current_show.anchor);
            }
        } catch (error) {
            // Fallback to rotating anchors
            currentAnchorIndex = (currentAnchorIndex + 1) % anchors.length;
            document.getElementById('currentAnchor').textContent = anchors[currentAnchorIndex];
            updateSegmentTitle(anchors[currentAnchorIndex]);
        }
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