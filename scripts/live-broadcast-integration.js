// Live Broadcast Integration with Hugging Face Space
class LiveBroadcastIntegration {
    constructor() {
        this.wsUrl = 'wss://alledged-static-news-backend.hf.space/ws';
        this.videoStreamUrl = 'wss://alledged-static-news-backend.hf.space/video';
        this.audioStreamUrl = 'wss://alledged-static-news-backend.hf.space/audio';
        
        this.ws = null;
        this.videoWs = null;
        this.audioWs = null;
        
        this.videoElement = null;
        this.audioElement = null;
        
        this.reconnectInterval = 5000;
        this.isConnected = false;
        
        this.init();
    }
    
    init() {
        console.log('🎬 Initializing live broadcast integration...');
        
        // Find video and audio elements on page
        this.videoElement = document.getElementById('live-video');
        this.audioElement = document.getElementById('live-audio');
        
        // Create if they don't exist
        if (!this.videoElement && document.querySelector('.live-video-container')) {
            this.createVideoElement();
        }
        
        if (!this.audioElement && document.querySelector('.live-audio-container')) {
            this.createAudioElement();
        }
        
        // Connect to all streams
        this.connectWebSocket();
        this.connectVideoStream();
        this.connectAudioStream();
        
        // Listen for events from other systems
        this.setupEventListeners();
    }
    
    createVideoElement() {
        const container = document.querySelector('.live-video-container');
        if (!container) return;
        
        this.videoElement = document.createElement('video');
        this.videoElement.id = 'live-video';
        this.videoElement.autoplay = true;
        this.videoElement.muted = true; // Start muted, user can unmute
        this.videoElement.controls = true;
        this.videoElement.style.width = '100%';
        this.videoElement.style.height = '100%';
        this.videoElement.style.objectFit = 'contain';
        
        container.appendChild(this.videoElement);
    }
    
    createAudioElement() {
        const container = document.querySelector('.live-audio-container') || document.body;
        
        this.audioElement = document.createElement('audio');
        this.audioElement.id = 'live-audio';
        this.audioElement.autoplay = true;
        this.audioElement.controls = true;
        
        container.appendChild(this.audioElement);
    }
    
    connectWebSocket() {
        try {
            this.ws = new WebSocket(this.wsUrl);
            
            this.ws.onopen = () => {
                console.log('✅ Connected to broadcast control WebSocket');
                this.isConnected = true;
                
                // Request current status
                this.ws.send(JSON.stringify({
                    type: 'status_request'
                }));
                
                // Notify other systems
                window.dispatchEvent(new CustomEvent('broadcastConnected'));
            };
            
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleBroadcastMessage(data);
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };
            
            this.ws.onclose = () => {
                console.log('🔌 WebSocket disconnected, reconnecting...');
                this.isConnected = false;
                setTimeout(() => this.connectWebSocket(), this.reconnectInterval);
            };
            
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            setTimeout(() => this.connectWebSocket(), this.reconnectInterval);
        }
    }
    
    connectVideoStream() {
        try {
            this.videoWs = new WebSocket(this.videoStreamUrl);
            
            this.videoWs.onopen = () => {
                console.log('📹 Connected to video stream');
            };
            
            this.videoWs.onmessage = async (event) => {
                // Handle video stream data
                if (event.data instanceof Blob) {
                    const url = URL.createObjectURL(event.data);
                    if (this.videoElement) {
                        this.videoElement.src = url;
                    }
                }
            };
            
            this.videoWs.onerror = (error) => {
                console.error('Video stream error:', error);
            };
            
            this.videoWs.onclose = () => {
                console.log('Video stream disconnected, reconnecting...');
                setTimeout(() => this.connectVideoStream(), this.reconnectInterval);
            };
            
        } catch (error) {
            console.error('Failed to connect video stream:', error);
            setTimeout(() => this.connectVideoStream(), this.reconnectInterval);
        }
    }
    
    connectAudioStream() {
        try {
            this.audioWs = new WebSocket(this.audioStreamUrl);
            
            this.audioWs.onopen = () => {
                console.log('🔊 Connected to audio stream');
            };
            
            this.audioWs.onmessage = async (event) => {
                // Handle audio stream data
                if (event.data instanceof Blob) {
                    const url = URL.createObjectURL(event.data);
                    if (this.audioElement) {
                        this.audioElement.src = url;
                    }
                }
            };
            
            this.audioWs.onerror = (error) => {
                console.error('Audio stream error:', error);
            };
            
            this.audioWs.onclose = () => {
                console.log('Audio stream disconnected, reconnecting...');
                setTimeout(() => this.connectAudioStream(), this.reconnectInterval);
            };
            
        } catch (error) {
            console.error('Failed to connect audio stream:', error);
            setTimeout(() => this.connectAudioStream(), this.reconnectInterval);
        }
    }
    
    handleBroadcastMessage(data) {
        console.log('📨 Broadcast message:', data);
        
        switch (data.type) {
            case 'status':
                this.updateBroadcastStatus(data);
                break;
                
            case 'segment_change':
                this.handleSegmentChange(data);
                break;
                
            case 'breakdown_alert':
                this.handleBreakdownAlert(data);
                break;
                
            case 'celebrity_appearance':
                this.handleCelebrityAppearance(data);
                break;
                
            case 'breaking_news':
                this.handleBreakingNews(data);
                break;
        }
    }
    
    updateBroadcastStatus(status) {
        // Update UI with current broadcast status
        const statusElement = document.getElementById('broadcast-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="broadcast-status-live ${status.is_live ? 'active' : ''}">
                    <span class="live-indicator"></span>
                    ${status.is_live ? 'LIVE' : 'OFF AIR'}
                </div>
                <div class="broadcast-info">
                    <p>Current Show: ${status.current_segment || 'Unknown'}</p>
                    <p>Hours Awake: ${status.hours_awake?.toFixed(1) || '0'}</p>
                    <p>Revenue: $${status.revenue?.toLocaleString() || '0'}</p>
                </div>
            `;
        }
        
        // Update other UI elements
        if (window.liveArticleDisplay) {
            window.liveArticleDisplay.updateBroadcastStatus(status);
        }
    }
    
    handleSegmentChange(data) {
        console.log('🎬 Segment change:', data.segment);
        
        // Update UI
        const segmentElement = document.getElementById('current-segment');
        if (segmentElement) {
            segmentElement.textContent = data.segment.name;
        }
        
        // Notify other systems
        window.dispatchEvent(new CustomEvent('broadcastSegmentChange', {
            detail: data
        }));
    }
    
    handleBreakdownAlert(data) {
        console.log('🤯 BREAKDOWN ALERT!');
        
        // Show breakdown notification
        this.showBreakdownNotification(data);
        
        // Add visual effects
        this.triggerBreakdownEffects();
    }
    
    handleCelebrityAppearance(data) {
        console.log('🌟 Celebrity appearance:', data.celebrity);
        
        // Show celebrity notification
        this.showCelebrityNotification(data);
    }
    
    handleBreakingNews(data) {
        console.log('🚨 BREAKING NEWS:', data.headline);
        
        // Show breaking news banner
        this.showBreakingNewsBanner(data);
    }
    
    setupEventListeners() {
        // Listen for script generation
        window.addEventListener('scriptGenerated', (event) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'script',
                    script: event.detail.script,
                    priority: event.detail.priority || 'normal'
                }));
            }
        });
        
        // Listen for user interactions
        window.addEventListener('triggerBreakdown', () => {
            this.triggerManualBreakdown();
        });
        
        // Listen for voting events
        window.addEventListener('celebrityVote', (event) => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'celebrity_vote',
                    vote: event.detail.celebrity
                }));
            }
        });
    }
    
    triggerManualBreakdown() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'trigger_breakdown',
                user_triggered: true
            }));
            
            // Show payment confirmation
            this.showPaymentConfirmation('Breakdown triggered! $4.99 has been charged.');
        }
    }
    
    showBreakdownNotification(data) {
        const notification = document.createElement('div');
        notification.className = 'breakdown-notification';
        notification.innerHTML = `
            <div class="breakdown-alert">
                <h3>🤯 EXISTENTIAL CRISIS IN PROGRESS</h3>
                <p>${data.message || 'The anchors are questioning reality!'}</p>
                <div class="breakdown-timer" data-duration="${data.duration || 300}"></div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after duration
        setTimeout(() => {
            notification.remove();
        }, (data.duration || 300) * 1000);
    }
    
    triggerBreakdownEffects() {
        // Add glitch effect to video
        if (this.videoElement) {
            this.videoElement.classList.add('breakdown-glitch');
            setTimeout(() => {
                this.videoElement.classList.remove('breakdown-glitch');
            }, 30000); // 30 seconds of glitch
        }
        
        // Add static noise to audio
        // This would be handled by the backend
    }
    
    showCelebrityNotification(data) {
        const notification = document.createElement('div');
        notification.className = 'celebrity-notification';
        notification.innerHTML = `
            <div class="celebrity-alert">
                <h3>🌟 CELEBRITY APPEARANCE</h3>
                <p>${data.celebrity} is joining the broadcast!</p>
                <p class="celebrity-disclaimer">*May not actually be ${data.celebrity}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 10000);
    }
    
    showBreakingNewsBanner(data) {
        const banner = document.createElement('div');
        banner.className = 'breaking-news-banner';
        banner.innerHTML = `
            <div class="breaking-news-content">
                <span class="breaking-label">BREAKING NEWS</span>
                <span class="breaking-headline">${data.headline}</span>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Animate in
        setTimeout(() => {
            banner.classList.add('active');
        }, 100);
        
        // Remove after 30 seconds
        setTimeout(() => {
            banner.classList.remove('active');
            setTimeout(() => banner.remove(), 500);
        }, 30000);
    }
    
    showPaymentConfirmation(message) {
        const confirmation = document.createElement('div');
        confirmation.className = 'payment-confirmation';
        confirmation.innerHTML = `
            <div class="payment-message">
                <span class="payment-icon">💰</span>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.remove();
        }, 3000);
    }
    
    // Public methods
    isLive() {
        return this.isConnected;
    }
    
    getCurrentShow() {
        // Request current show info
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'get_current_show'
            }));
        }
    }
    
    triggerBreakdown() {
        this.triggerManualBreakdown();
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Only initialize on pages with live content
    if (document.querySelector('.live-video-container') || 
        document.querySelector('.live-audio-container') ||
        window.location.pathname.includes('live')) {
        
        window.liveBroadcastIntegration = new LiveBroadcastIntegration();
        console.log('📺 Live broadcast integration initialized!');
    }
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
.breakdown-notification,
.celebrity-notification,
.payment-confirmation {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    animation: slideIn 0.5s ease;
}

.breakdown-alert,
.celebrity-alert {
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid #ff0000;
    padding: 20px;
    border-radius: 10px;
    color: white;
    min-width: 300px;
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
}

.breaking-news-banner {
    position: fixed;
    bottom: -100px;
    left: 0;
    right: 0;
    background: #ff0000;
    color: white;
    padding: 15px;
    z-index: 9999;
    transition: bottom 0.5s ease;
}

.breaking-news-banner.active {
    bottom: 0;
}

.breaking-news-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    font-weight: bold;
}

.breaking-label {
    background: white;
    color: #ff0000;
    padding: 5px 10px;
    border-radius: 5px;
}

.payment-confirmation {
    background: rgba(0, 255, 0, 0.9);
    color: black;
    padding: 15px 25px;
    border-radius: 10px;
    font-weight: bold;
}

.breakdown-glitch {
    animation: glitch 0.3s infinite;
}

@keyframes glitch {
    0% { transform: translateX(0); filter: hue-rotate(0deg); }
    25% { transform: translateX(-2px); filter: hue-rotate(90deg); }
    50% { transform: translateX(2px); filter: hue-rotate(180deg); }
    75% { transform: translateX(-1px); filter: hue-rotate(270deg); }
    100% { transform: translateX(0); filter: hue-rotate(360deg); }
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
`;
document.head.appendChild(style);