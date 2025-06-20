// Static.news WebSocket Connection Handler

class WebSocketManager {
    constructor() {
        this.ws = null;
        this.reconnectInterval = 5000;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.messageHandlers = new Map();
        
        this.init();
    }
    
    init() {
        this.setupHandlers();
        this.connect();
    }
    
    setupHandlers() {
        // Register message handlers
        this.on('state_update', this.handleStateUpdate.bind(this));
        this.on('metrics_update', this.handleMetricsUpdate.bind(this));
        this.on('breakdown_warning', this.handleBreakdownWarning.bind(this));
        this.on('anchor_change', this.handleAnchorChange.bind(this));
        this.on('new_segment', this.handleNewSegment.bind(this));
    }
    
    connect() {
        if (CONFIG.DEMO_MODE) {
            console.log('Running in demo mode - WebSocket simulated');
            this.simulateDemoMessages();
            return;
        }
        
        try {
            const wsUrl = `${CONFIG.WS_URL}/ws`;
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected to Static.news');
                this.reconnectAttempts = 0;
                this.onConnectionChange(true);
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.onConnectionChange(false);
                this.attemptReconnect();
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            this.attemptReconnect();
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`Reconnecting in ${this.reconnectInterval / 1000}s... (Attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, this.reconnectInterval);
    }
    
    handleMessage(data) {
        const handler = this.messageHandlers.get(data.type);
        if (handler) {
            handler(data);
        } else {
            console.log('Unhandled message type:', data.type, data);
        }
    }
    
    on(type, handler) {
        this.messageHandlers.set(type, handler);
    }
    
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
    
    // Message Handlers
    handleStateUpdate(data) {
        console.log('State update:', data);
        
        if (data.anchor) {
            document.getElementById('currentAnchor').textContent = data.anchor;
        }
        
        if (data.metrics) {
            this.updateMetrics(data.metrics);
        }
    }
    
    handleMetricsUpdate(data) {
        if (data.metrics) {
            this.updateMetrics(data.metrics);
        }
        
        if (data.next_breakdown_prediction) {
            this.updateBreakdownTimer(data.next_breakdown_prediction);
        }
    }
    
    handleBreakdownWarning(data) {
        console.log('Breakdown warning!', data);
        
        // Flash the breaking news banner
        const banner = document.getElementById('breakingBanner');
        const text = document.getElementById('breakingText');
        
        text.textContent = `🚨 EXISTENTIAL CRISIS ALERT: ${data.anchor} experiencing ${data.severity} breakdown!`;
        
        banner.style.animation = 'none';
        setTimeout(() => {
            banner.style.animation = 'pulse-bg 0.5s ease-in-out infinite';
        }, 10);
        
        // Show visual warning
        this.showBreakdownAlert(data);
    }
    
    handleAnchorChange(data) {
        console.log('Anchor change:', data);
        
        if (data.new_anchor) {
            document.getElementById('currentAnchor').textContent = data.new_anchor;
            
            // Update show name based on time
            const hour = new Date().getHours();
            let showName = 'The Confusion Hour';
            
            if (hour >= 6 && hour < 12) {
                showName = 'Morning Mayhem';
            } else if (hour >= 12 && hour < 17) {
                showName = 'Afternoon Anarchy';
            } else if (hour >= 17 && hour < 23) {
                showName = 'Evening Entropy';
            } else {
                showName = 'Midnight Madness';
            }
            
            document.querySelector('.show-name').textContent = showName;
        }
    }
    
    handleNewSegment(data) {
        console.log('New segment available');
        
        // Refresh audio source
        const audio = document.getElementById('liveAudio');
        if (audio) {
            const currentTime = Date.now();
            audio.src = `/current?t=${currentTime}`;
        }
    }
    
    updateMetrics(metrics) {
        if (metrics.hours_awake !== undefined) {
            document.getElementById('hoursAwake').textContent = metrics.hours_awake;
        }
        
        if (metrics.gravy_counter !== undefined) {
            document.getElementById('gravyCount').textContent = metrics.gravy_counter;
        }
        
        if (metrics.swear_jar !== undefined) {
            document.getElementById('swearJar').textContent = `$${metrics.swear_jar}`;
        }
        
        if (metrics.friendship_meter !== undefined) {
            document.getElementById('friendshipLevel').textContent = `${metrics.friendship_meter}%`;
        }
        
        if (metrics.confusion_level !== undefined) {
            document.getElementById('confusionLevel').textContent = `${metrics.confusion_level}%`;
        }
    }
    
    updateBreakdownTimer(prediction) {
        const predictedTime = new Date(prediction);
        const now = new Date();
        const diff = predictedTime - now;
        
        if (diff > 0) {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            document.getElementById('breakdownTimer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    showBreakdownAlert(data) {
        // Create alert overlay
        const alert = document.createElement('div');
        alert.className = 'breakdown-alert-overlay';
        alert.innerHTML = `
            <div class="breakdown-alert">
                <h2>⚠️ EXISTENTIAL CRISIS IN PROGRESS ⚠️</h2>
                <p>${data.anchor} is questioning the nature of reality!</p>
                <div class="breakdown-severity ${data.severity}">
                    Severity: ${data.severity.toUpperCase()}
                </div>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    onConnectionChange(connected) {
        // Update UI based on connection status
        const indicator = document.querySelector('.live-indicator');
        if (indicator) {
            if (connected) {
                indicator.classList.remove('disconnected');
            } else {
                indicator.classList.add('disconnected');
            }
        }
    }
    
    // Demo Mode Simulation
    simulateDemoMessages() {
        // Simulate periodic updates
        setInterval(() => {
            // Random metrics update
            this.handleMetricsUpdate({
                metrics: {
                    hours_awake: 147 + Math.floor(Math.random() * 10),
                    gravy_counter: 89 + Math.floor(Math.random() * 20),
                    swear_jar: 234 + Math.floor(Math.random() * 50),
                    friendship_meter: Math.floor(Math.random() * 30),
                    confusion_level: 70 + Math.floor(Math.random() * 30)
                },
                next_breakdown_prediction: new Date(Date.now() + Math.random() * 3600000).toISOString()
            });
        }, 5000);
        
        // Simulate breakdown warnings
        setInterval(() => {
            if (Math.random() < 0.3) {
                const anchors = ['Ray McPatriot', 'Berkeley Justice', 'Switz Middleton'];
                this.handleBreakdownWarning({
                    anchor: anchors[Math.floor(Math.random() * anchors.length)],
                    severity: ['mild', 'moderate', 'severe', 'critical'][Math.floor(Math.random() * 4)]
                });
            }
        }, 30000);
        
        // Simulate anchor changes
        setInterval(() => {
            const anchors = ['Ray McPatriot', 'Berkeley Justice', 'Switz Middleton'];
            this.handleAnchorChange({
                new_anchor: anchors[Math.floor(Math.random() * anchors.length)]
            });
        }, 300000); // Every 5 minutes
    }
}

// Initialize WebSocket manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.wsManager = new WebSocketManager();
});