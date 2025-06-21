// Hugging Face Broadcast Connector - Production Version
class HFBroadcastConnector {
    constructor() {
        // Connection state
        this.connected = false;
        this.ws = null;
        this.audioFrame = null;
        this.videoElement = null;
        this.audioElement = null;
        
        // Hugging Face Space endpoints
        this.spaceUrl = 'https://alledged-static-news-backend.hf.space';
        this.wsUrl = 'wss://alledged-static-news-backend.hf.space/queue/join';
        
        // Stream state
        this.isPlaying = false;
        this.currentSegment = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        
        // Initialize connection
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing HF Broadcast Connector...');
        
        // Create media elements
        this.createMediaElements();
        
        // Connect to broadcast
        await this.connect();
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    createMediaElements() {
        // Find or create video element
        this.videoElement = document.getElementById('live-video');
        if (!this.videoElement) {
            const container = document.querySelector('.live-video-container');
            if (container) {
                this.videoElement = document.createElement('video');
                this.videoElement.id = 'live-video';
                this.videoElement.autoplay = true;
                this.videoElement.muted = true;
                this.videoElement.controls = true;
                this.videoElement.style.width = '100%';
                this.videoElement.style.height = '100%';
                container.appendChild(this.videoElement);
            }
        }
        
        // Find or create audio element
        this.audioElement = document.getElementById('live-audio');
        if (!this.audioElement) {
            this.audioElement = document.createElement('audio');
            this.audioElement.id = 'live-audio';
            this.audioElement.autoplay = true;
            this.audioElement.controls = true;
            document.body.appendChild(this.audioElement);
        }
    }
    
    async connect() {
        console.log('🎙️ Connecting to Static.news broadcast server...');
        
        // Method 1: Direct HF Space embedding
        this.connectDirectStream();
        
        // Method 2: WebSocket for real-time data
        this.connectWebSocket();
        
        // Method 3: Iframe fallback for compatibility
        this.connectAudioFrame();
    }
    
    connectDirectStream() {
        // Connect video stream
        if (this.videoElement) {
            this.videoElement.src = `${this.spaceUrl}/stream/video`;
            this.videoElement.play().catch(e => {
                console.warn('Video autoplay blocked:', e);
                this.showPlayButton();
            });
        }
        
        // Connect audio stream
        if (this.audioElement) {
            this.audioElement.src = `${this.spaceUrl}/stream/audio`;
            this.audioElement.play().catch(e => {
                console.warn('Audio autoplay blocked:', e);
            });
        }
    }

    connectAudioFrame() {
        // Create hidden iframe as fallback
        if (!this.audioFrame) {
            this.audioFrame = document.createElement('iframe');
            this.audioFrame.src = `${this.spaceUrl}?__theme=dark&autoplay=1`;
            this.audioFrame.style.cssText = `
                position: fixed;
                bottom: -100px;
                left: -100px;
                width: 1px;
                height: 1px;
                opacity: 0;
                pointer-events: none;
                z-index: -9999;
            `;
            this.audioFrame.allow = 'autoplay';
            this.audioFrame.setAttribute('aria-hidden', 'true');
            
            document.body.appendChild(this.audioFrame);
        }
    }

    connectWebSocket() {
        try {
            this.ws = new WebSocket(this.wsUrl);
            
            this.ws.onopen = () => {
                console.log('📊 Metadata stream connected');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleBroadcastData(data);
                } catch (e) {
                    // Ignore parse errors
                }
            };
            
            this.ws.onerror = () => {
                console.log('📊 Metadata stream unavailable (audio still working)');
            };
            
        } catch (error) {
            console.log('WebSocket not supported, using audio-only mode');
        }
    }

    handleBroadcastData(data) {
        // Update UI based on broadcast metadata
        if (data.anchor) {
            this.updateAnchorDisplay(data.anchor);
        }
        
        if (data.isBreakdown) {
            this.triggerBreakdownEffects();
        }
        
        // Dispatch event for other systems
        window.dispatchEvent(new CustomEvent('broadcastUpdate', { detail: data }));
    }

    updateConnectionStatus(connected) {
        this.connected = connected;
        
        // Update any status indicators
        const statusElements = document.querySelectorAll('.broadcast-status, .connection-status');
        statusElements.forEach(el => {
            if (connected) {
                el.textContent = '🔴 LIVE';
                el.classList.add('live');
                el.classList.remove('offline');
            } else {
                el.textContent = '⚫ OFFLINE';
                el.classList.add('offline');
                el.classList.remove('live');
            }
        });
        
        // Update the live player status
        const livePlayer = document.querySelector('.live-player-status');
        if (livePlayer) {
            livePlayer.innerHTML = connected ? 
                '<span style="color: #00ff00;">● Connected to Live Broadcast</span>' :
                '<span style="color: #ff0000;">● Connecting...</span>';
        }
    }

    updateAnchorDisplay(anchorId) {
        // Highlight current speaking anchor
        document.querySelectorAll('[data-anchor]').forEach(el => {
            el.classList.remove('speaking');
        });
        
        const currentAnchor = document.querySelector(`[data-anchor="${anchorId}"]`);
        if (currentAnchor) {
            currentAnchor.classList.add('speaking');
        }
    }

    triggerBreakdownEffects() {
        // Add visual glitch effects during breakdowns
        document.body.classList.add('reality-breaking');
        
        // Flash the screen
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 0, 0, 0.5);
            z-index: 9999;
            pointer-events: none;
            animation: flash 0.5s ease-out;
        `;
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
            document.body.classList.remove('reality-breaking');
        }, 5000);
    }

    disconnect() {
        if (this.audioFrame) {
            this.audioFrame.remove();
            this.audioFrame = null;
        }
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        this.updateConnectionStatus(false);
    }

    // Utility method to check if broadcast is working
    async testConnection() {
        try {
            const response = await fetch('https://alledged-static-news-backend.hf.space/api/health');
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Auto-initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Only initialize on live page
    if (window.location.pathname.includes('live')) {
        window.hfBroadcast = new HFBroadcastConnector();
        window.hfBroadcast.connect();
    }
});

// Export for manual use
window.HFBroadcastConnector = HFBroadcastConnector;