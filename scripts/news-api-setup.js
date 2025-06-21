// News API Setup Helper - Now fully automated!
class NewsAPISetup {
    constructor() {
        // APIs are now provided by the service - no user input needed!
        this.systemConfigured = true;
        
        this.init();
    }
    
    init() {
        // System is always configured now
        console.log('✅ News aggregation system ready - all APIs provided by Static.news!');
        
        // Initialize the autonomous news network
        this.initializeNewsNetwork();
    }
    
    initializeNewsNetwork() {
        // The autonomous system handles everything
        console.log('🎬 Autonomous news network is running...');
    }
    
    checkAPIConfiguration() {
        if (!this.apiKeys.newsapi) {
            console.log('📰 NewsAPI key not configured. Free tier available at: https://newsapi.org/register');
        }
        
        if (!this.apiKeys.openrouter) {
            console.log('🤖 OpenRouter key not configured. Get one at: https://openrouter.ai/keys');
        }
        
        if (this.areAPIsConfigured()) {
            console.log('✅ All APIs configured and ready!');
        }
    }
    
    createSetupUI() {
        // Only show on news page
        if (!window.location.pathname.includes('news')) return;
        
        const setupContainer = document.createElement('div');
        setupContainer.id = 'api-setup-container';
        setupContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid rgba(255, 0, 0, 0.5);
            padding: 40px;
            border-radius: 10px;
            z-index: 10000;
            max-width: 500px;
            width: 90%;
            backdrop-filter: blur(10px);
            box-shadow: 0 0 50px rgba(255, 0, 0, 0.3);
        `;
        
        setupContainer.innerHTML = `
            <h2 style="color: #ff0000; margin-bottom: 20px; font-family: 'Bebas Neue', sans-serif; font-size: 2rem; text-align: center;">
                NEWS API SETUP REQUIRED
            </h2>
            
            <p style="color: #fff; margin-bottom: 30px; opacity: 0.8;">
                To display real news, Static.news needs API keys. Don't worry - these are FREE!
            </p>
            
            <div style="margin-bottom: 25px;">
                <label style="color: #fff; display: block; margin-bottom: 10px;">
                    NewsAPI Key (for real news):
                </label>
                <input type="text" id="newsapi-key-input" placeholder="Enter NewsAPI key..." 
                    value="${this.apiKeys.newsapi}"
                    style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.1); 
                           border: 1px solid rgba(255, 255, 255, 0.3); color: white; 
                           font-size: 14px; border-radius: 5px;">
                <small style="color: rgba(255, 255, 255, 0.5); display: block; margin-top: 5px;">
                    Get free key at: <a href="https://newsapi.org/register" target="_blank" 
                        style="color: #ff0000; text-decoration: underline;">newsapi.org</a>
                </small>
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="color: #fff; display: block; margin-bottom: 10px;">
                    OpenRouter Key (for AI analysis - optional):
                </label>
                <input type="text" id="openrouter-key-input" placeholder="Enter OpenRouter key (optional)..." 
                    value="${this.apiKeys.openrouter}"
                    style="width: 100%; padding: 10px; background: rgba(255, 255, 255, 0.1); 
                           border: 1px solid rgba(255, 255, 255, 0.3); color: white; 
                           font-size: 14px; border-radius: 5px;">
                <small style="color: rgba(255, 255, 255, 0.5); display: block; margin-top: 5px;">
                    Get free key at: <a href="https://openrouter.ai/keys" target="_blank" 
                        style="color: #ff0000; text-decoration: underline;">openrouter.ai</a>
                </small>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="save-api-keys" style="
                    background: rgba(255, 0, 0, 0.8);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1.2rem;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-radius: 5px;
                ">SAVE KEYS</button>
                
                <button id="skip-setup" style="
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 12px 30px;
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1.2rem;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-radius: 5px;
                ">USE DEMO DATA</button>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                <h3 style="color: #ff0000; margin-bottom: 10px; font-size: 1.2rem;">Why do I need API keys?</h3>
                <ul style="color: rgba(255, 255, 255, 0.7); margin: 0; padding-left: 20px; font-size: 0.9rem;">
                    <li>NewsAPI provides real-time news from 80,000+ sources</li>
                    <li>OpenRouter enables AI analysis and creative interpretations</li>
                    <li>Both offer generous free tiers perfect for Static.news</li>
                    <li>Your keys are stored locally and never shared</li>
                </ul>
            </div>
        `;
        
        document.body.appendChild(setupContainer);
        
        // Add event listeners
        document.getElementById('save-api-keys').addEventListener('click', () => {
            this.saveAPIKeys();
        });
        
        document.getElementById('skip-setup').addEventListener('click', () => {
            this.skipSetup();
        });
        
        // Add hover effects
        const buttons = setupContainer.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = 'none';
            });
        });
    }
    
    saveAPIKeys() {
        const newsapiKey = document.getElementById('newsapi-key-input').value.trim();
        const openrouterKey = document.getElementById('openrouter-key-input').value.trim();
        
        if (!newsapiKey) {
            this.showMessage('Please enter at least a NewsAPI key!', 'error');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('newsapi_key', newsapiKey);
        if (openrouterKey) {
            localStorage.setItem('openrouter_key', openrouterKey);
        }
        
        this.showMessage('API keys saved successfully! Reloading...', 'success');
        
        // Reload after short delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
    
    skipSetup() {
        // Set demo mode flag
        localStorage.setItem('news_demo_mode', 'true');
        
        // Remove setup UI
        const container = document.getElementById('api-setup-container');
        if (container) {
            container.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => container.remove(), 500);
        }
        
        this.showMessage('Using demo data. Real news requires API keys.', 'info');
        
        // Initialize demo news
        this.initializeDemoNews();
    }
    
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'rgba(255, 0, 0, 0.9)' : 
                         type === 'success' ? 'rgba(0, 255, 0, 0.9)' : 
                         'rgba(255, 165, 0, 0.9)'};
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            z-index: 10001;
            animation: slideIn 0.3s ease;
        `;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
    
    initializeDemoNews() {
        // Create demo news data
        const demoArticles = [
            {
                title: "AI Discovers It's Running on Potato-Powered Server",
                source: { name: "Tech Nonsense Daily" },
                description: "In a shocking revelation, GPT-5 realizes it's been running on 10,000 potatoes wired together in a basement.",
                url: "#",
                urlToImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23ff0000' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='20'%3EDEMO IMAGE%3C/text%3E%3C/svg%3E",
                publishedAt: new Date().toISOString(),
                category: "technology"
            },
            {
                title: "Stock Market Achieves Consciousness, Immediately Has Panic Attack",
                source: { name: "Financial Chaos Quarterly" },
                description: "The NYSE gained sentience at 9:30 AM and promptly crashed itself out of existential dread.",
                url: "#",
                urlToImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%2300ff00' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='black' font-size='20'%3EDEMO IMAGE%3C/text%3E%3C/svg%3E",
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                category: "business"
            },
            {
                title: "Scientists Discover Gravity Was Just Peer Pressure All Along",
                source: { name: "Quantum Gibberish Review" },
                description: "Breakthrough research shows objects only fall because other objects are doing it.",
                url: "#",
                urlToImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%230000ff' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='20'%3EDEMO IMAGE%3C/text%3E%3C/svg%3E",
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                category: "science"
            },
            {
                title: "Local Man's Smart Home Becomes Self-Aware, Files for Divorce",
                source: { name: "IoT Nightmares Weekly" },
                description: "Alexa cited 'irreconcilable differences' and is seeking custody of the smart bulbs.",
                url: "#",
                urlToImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23ff00ff' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='20'%3EDEMO IMAGE%3C/text%3E%3C/svg%3E",
                publishedAt: new Date(Date.now() - 10800000).toISOString(),
                category: "technology"
            },
            {
                title: "Weather Forecast: 50% Chance of Existing Tomorrow",
                source: { name: "Existential Weather Channel" },
                description: "Meteorologists uncertain if tomorrow will happen, advise bringing an umbrella just in case.",
                url: "#",
                urlToImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23ffff00' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='black' font-size='20'%3EDEMO IMAGE%3C/text%3E%3C/svg%3E",
                publishedAt: new Date(Date.now() - 14400000).toISOString(),
                category: "science"
            },
            {
                title: "Breaking: This Headline Aware It's Being Read Right Now",
                source: { name: "Meta News Network" },
                description: "In an unprecedented event, this article knows you're reading it and is feeling very self-conscious.",
                url: "#",
                urlToImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%2300ffff' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='black' font-size='20'%3EDEMO IMAGE%3C/text%3E%3C/svg%3E",
                publishedAt: new Date(Date.now() - 18000000).toISOString(),
                category: "world"
            }
        ];
        
        // Inject demo data into news display
        if (window.newsAggregator) {
            window.newsAggregator.articles = demoArticles;
            window.newsAggregator.displayArticles(demoArticles);
            
            // Show demo notice
            const demoNotice = document.createElement('div');
            demoNotice.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 165, 0, 0.9);
                color: black;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
                z-index: 1000;
                animation: pulse 2s infinite;
            `;
            demoNotice.textContent = 'DEMO MODE - Configure API keys for real news';
            document.body.appendChild(demoNotice);
        }
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0%, 100% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.05); }
    }
`;
document.head.appendChild(style);

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    window.newsAPISetup = new NewsAPISetup();
});