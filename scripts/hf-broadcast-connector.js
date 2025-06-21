// Simple connector for Hugging Face Space broadcast
class HFBroadcastConnector {
    constructor() {
        this.connected = false;
        this.audioFrame = null;
        this.ws = null;
    }

    connect() {
        console.log('🎙️ Connecting to Static.news broadcast server...');
        
        // Method 1: Hidden iframe for audio (most reliable)
        this.connectAudioFrame();
        
        // Method 2: WebSocket for metadata (optional)
        this.connectWebSocket();
    }

    connectAudioFrame() {
        // Create hidden iframe that will autoplay the broadcast
        this.audioFrame = document.createElement('iframe');
        this.audioFrame.src = 'https://alledged-static-news-backend.hf.space?__theme=dark';
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
        
        // Add to page
        document.body.appendChild(this.audioFrame);
        
        // Update status
        this.updateConnectionStatus(true);
        
        console.log('✅ Audio stream connected via iframe');
    }

    connectWebSocket() {
        try {
            // This is optional - the iframe handles audio
            // WebSocket is just for getting metadata about what's playing
            this.ws = new WebSocket('wss://alledged-static-news-backend.hf.space/queue/join');
            
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