/**
 * Live Stream Connector for Static.news
 * Connects to the ACTUAL 24/7 broadcast from HuggingFace Space
 */

class LiveStreamConnector {
    constructor() {
        this.ws = null;
        this.videoElement = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 100; // Keep trying
        
        this.init();
    }
    
    init() {
        console.log('🔴 Initializing Static.news Live Stream Connection');
        
        // Find or create video element
        this.videoElement = document.getElementById('live-broadcast-video');
        if (!this.videoElement) {
            // Create video container if it doesn't exist
            const container = document.querySelector('.broadcast-container') || 
                           document.querySelector('#live-video') ||
                           document.querySelector('.video-container');
            
            if (container) {
                this.videoElement = document.createElement('canvas');
                this.videoElement.id = 'live-broadcast-video';
                this.videoElement.width = 1280;
                this.videoElement.height = 720;
                this.videoElement.style.width = '100%';
                this.videoElement.style.height = 'auto';
                container.appendChild(this.videoElement);
            }
        }
        
        // Get canvas context
        if (this.videoElement && this.videoElement.tagName === 'CANVAS') {
            this.ctx = this.videoElement.getContext('2d');
        }
        
        // Connect to broadcast
        this.connect();
        
        // Update UI
        this.updateUI();
    }
    
    connect() {
        const wsUrl = 'wss://alledged-static-news-backend.hf.space/ws';
        console.log(`📡 Connecting to: ${wsUrl}`);
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('✅ Connected to Static.news Live Broadcast!');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateStatus('LIVE');
                
                // Request stream
                this.ws.send(JSON.stringify({
                    type: 'start_stream',
                    quality: '720p'
                }));
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (e) {
                    console.error('Parse error:', e);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.updateStatus('ERROR');
            };
            
            this.ws.onclose = () => {
                console.log('📡 Disconnected from broadcast');
                this.isConnected = false;
                this.updateStatus('RECONNECTING...');
                this.attemptReconnect();
            };
            
        } catch (error) {
            console.error('❌ Connection failed:', error);
            this.attemptReconnect();
        }
    }
    
    handleMessage(data) {
        switch(data.type) {
            case 'connected':
                console.log('🎥 Stream connected:', data.message);
                break;
                
            case 'frame':
                this.displayFrame(data.data);
                break;
                
            case 'status':
                this.updateBroadcastInfo(data);
                break;
                
            case 'breaking_news':
                this.showBreakingNews(data);
                break;
                
            case 'breakdown':
                this.showBreakdown(data);
                break;
        }
    }
    
    displayFrame(frameData) {
        if (!this.ctx) return;
        
        // Create image from base64 data
        const img = new Image();
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0, this.videoElement.width, this.videoElement.height);
        };
        img.src = 'data:image/jpeg;base64,' + frameData;
    }
    
    updateStatus(status) {
        // Update all status indicators
        const statusElements = document.querySelectorAll('.broadcast-status, .live-status, #stream-status');
        statusElements.forEach(el => {
            el.textContent = status;
            el.className = el.className.replace(/status-\w+/g, '') + ' status-' + status.toLowerCase();
        });
        
        // Update LIVE indicator
        const liveIndicator = document.querySelector('.live-indicator, .live-dot');
        if (liveIndicator) {
            if (status === 'LIVE') {
                liveIndicator.classList.add('active', 'pulsing');
            } else {
                liveIndicator.classList.remove('active', 'pulsing');
            }
        }
    }
    
    updateBroadcastInfo(data) {
        // Update show name
        const showElement = document.querySelector('.current-show, #current-show');
        if (showElement) {
            showElement.textContent = data.show || 'Static Central';
        }
        
        // Update anchors
        const anchorsElement = document.querySelector('.current-anchors, #current-anchors');
        if (anchorsElement && data.anchors) {
            anchorsElement.textContent = data.anchors.join(', ');
        }
        
        // Update time
        const timeElement = document.querySelector('.broadcast-time, #broadcast-time');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString();
        }
    }
    
    showBreakingNews(data) {
        console.log('🚨 BREAKING NEWS:', data.headline);
        
        // Create breaking news banner if it doesn't exist
        let banner = document.getElementById('breaking-news-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'breaking-news-banner';
            banner.className = 'breaking-news-banner';
            banner.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 0;
                right: 0;
                background: #ff0000;
                color: white;
                padding: 20px;
                font-size: 1.2em;
                font-weight: bold;
                z-index: 9999;
                animation: slideIn 0.5s ease-out;
            `;
            document.body.appendChild(banner);
        }
        
        banner.innerHTML = `
            <span style="background: white; color: red; padding: 5px 10px; margin-right: 10px;">BREAKING</span>
            ${data.headline}
        `;
        
        // Auto-hide after 30 seconds
        setTimeout(() => {
            banner.style.animation = 'slideOut 0.5s ease-out';
            setTimeout(() => banner.remove(), 500);
        }, 30000);
    }
    
    showBreakdown(data) {
        console.log('🤯 CHARACTER BREAKDOWN:', data);
        
        // Add screen shake effect
        document.body.style.animation = 'shake 0.5s';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
        
        // Show breakdown notification
        const notification = document.createElement('div');
        notification.className = 'breakdown-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 40px;
            border-radius: 10px;
            font-size: 1.5em;
            z-index: 10000;
            animation: pulse 0.5s infinite;
        `;
        notification.innerHTML = `
            <h2>EXISTENTIAL CRISIS IN PROGRESS</h2>
            <p>${data.character} is having a breakdown!</p>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 10 seconds
        setTimeout(() => notification.remove(), 10000);
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            setTimeout(() => {
                this.connect();
            }, Math.min(this.reconnectAttempts * 1000, 10000)); // Max 10 second delay
        }
    }
    
    updateUI() {
        // Add necessary styles
        if (!document.getElementById('live-stream-styles')) {
            const style = document.createElement('style');
            style.id = 'live-stream-styles';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                
                @keyframes slideIn {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                
                @keyframes slideOut {
                    from { transform: translateY(0); }
                    to { transform: translateY(100%); }
                }
                
                .status-live { color: #00ff00; }
                .status-error { color: #ff0000; }
                .status-reconnecting { color: #ffff00; }
                
                .live-indicator.active {
                    background: #ff0000;
                    animation: pulse 1s infinite;
                }
                
                #live-broadcast-video {
                    background: #000;
                    max-width: 100%;
                    height: auto;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.liveStream = new LiveStreamConnector();
    });
} else {
    window.liveStream = new LiveStreamConnector();
}

// Make it globally available
window.LiveStreamConnector = LiveStreamConnector;