/**
 * Static.news Website Integration
 * Connects to HuggingFace Space broadcast system
 */

class StaticNewsLiveStream {
    constructor() {
        this.wsUrl = 'wss://alledged-static-news-backend.hf.space/ws';
        this.videoElement = null;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectDelay = 1000;
        
        // Media source for streaming
        this.mediaSource = null;
        this.sourceBuffer = null;
        this.videoQueue = [];
        
        this.init();
    }
    
    init() {
        // Create video element
        this.videoElement = document.getElementById('live-broadcast-video');
        if (!this.videoElement) {
            console.error('Video element not found');
            return;
        }
        
        // Set up MediaSource for streaming
        if ('MediaSource' in window) {
            this.setupMediaSource();
        } else {
            console.error('MediaSource not supported');
            this.fallbackToHLS();
        }
        
        // Connect to WebSocket
        this.connect();
        
        // Set up UI elements
        this.setupUI();
    }
    
    setupMediaSource() {
        this.mediaSource = new MediaSource();
        this.videoElement.src = URL.createObjectURL(this.mediaSource);
        
        this.mediaSource.addEventListener('sourceopen', () => {
            this.sourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
            this.sourceBuffer.mode = 'sequence';
            
            this.sourceBuffer.addEventListener('updateend', () => {
                this.processVideoQueue();
            });
        });
    }
    
    connect() {
        console.log('Connecting to Static.news broadcast...');
        
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
            console.log('Connected to broadcast system');
            this.reconnectAttempts = 0;
            this.updateStatus('connected');
            
            // Request video stream
            this.ws.send(JSON.stringify({
                type: 'get_stream',
                quality: '540p',
                format: 'mp4'
            }));
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleBroadcastData(data);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateStatus('error');
        };
        
        this.ws.onclose = () => {
            console.log('Disconnected from broadcast');
            this.updateStatus('disconnected');
            this.attemptReconnect();
        };
    }
    
    handleBroadcastData(data) {
        switch(data.type) {
            case 'video_frame':
                this.handleVideoFrame(data);
                break;
            case 'audio_chunk':
                this.handleAudioChunk(data);
                break;
            case 'metadata':
                this.updateMetadata(data);
                break;
            case 'breakdown_alert':
                this.handleBreakdownAlert(data);
                break;
            case 'segment_change':
                this.handleSegmentChange(data);
                break;
        }
    }
    
    handleVideoFrame(data) {
        // Convert hex to ArrayBuffer
        const videoData = this.hexToArrayBuffer(data.data);
        
        if (this.sourceBuffer && !this.sourceBuffer.updating) {
            try {
                this.sourceBuffer.appendBuffer(videoData);
            } catch (e) {
                console.error('Error appending video data:', e);
                this.videoQueue.push(videoData);
            }
        } else {
            this.videoQueue.push(videoData);
        }
        
        // Update current info
        if (data.current_speaker) {
            this.updateCurrentSpeaker(data.current_speaker);
        }
        
        if (data.ticker_text) {
            this.updateTicker(data.ticker_text);
        }
    }
    
    processVideoQueue() {
        if (this.videoQueue.length > 0 && this.sourceBuffer && !this.sourceBuffer.updating) {
            const videoData = this.videoQueue.shift();
            try {
                this.sourceBuffer.appendBuffer(videoData);
            } catch (e) {
                console.error('Error processing video queue:', e);
            }
        }
    }
    
    updateMetadata(data) {
        // Update show info
        document.querySelector('.current-show').textContent = data.show || 'Static Central';
        document.querySelector('.current-segment').textContent = data.segment || 'News Update';
        
        // Update anchors
        if (data.anchors) {
            const anchorList = document.querySelector('.anchor-list');
            anchorList.innerHTML = data.anchors.map(anchor => 
                `<div class="anchor-badge ${anchor.active ? 'active' : ''}">${anchor.name}</div>`
            ).join('');
        }
    }
    
    handleBreakdownAlert(data) {
        // Show breakdown notification
        const alert = document.createElement('div');
        alert.className = 'breakdown-alert';
        alert.innerHTML = `
            <h3>🚨 EXISTENTIAL CRISIS IN PROGRESS 🚨</h3>
            <p>${data.character} is having a breakdown!</p>
            <p>"${data.quote}"</p>
        `;
        
        document.body.appendChild(alert);
        
        // Trigger visual effects
        this.triggerBreakdownEffects();
        
        // Remove after 10 seconds
        setTimeout(() => {
            alert.remove();
        }, 10000);
    }
    
    triggerBreakdownEffects() {
        // Add glitch effect to video
        this.videoElement.classList.add('glitch-effect');
        
        // Screen shake
        document.body.classList.add('screen-shake');
        
        // Remove effects after 5 seconds
        setTimeout(() => {
            this.videoElement.classList.remove('glitch-effect');
            document.body.classList.remove('screen-shake');
        }, 5000);
    }
    
    handleSegmentChange(data) {
        // Show transition animation
        const transition = document.createElement('div');
        transition.className = 'segment-transition';
        transition.innerHTML = `
            <img src="/assets/static-news-logo.png" class="spinning-logo">
            <h2>${data.next_segment}</h2>
        `;
        
        document.body.appendChild(transition);
        
        // Play transition sound if available
        if (data.transition_audio) {
            const audio = new Audio(data.transition_audio);
            audio.play();
        }
        
        // Remove after animation
        setTimeout(() => {
            transition.remove();
        }, 3000);
    }
    
    updateCurrentSpeaker(speaker) {
        // Highlight current speaker
        document.querySelectorAll('.anchor-badge').forEach(badge => {
            badge.classList.toggle('speaking', badge.textContent.toLowerCase().includes(speaker));
        });
    }
    
    updateTicker(text) {
        const ticker = document.querySelector('.news-ticker-content');
        if (ticker) {
            ticker.textContent = text;
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            this.updateStatus('failed');
            this.showReconnectButton();
        }
    }
    
    updateStatus(status) {
        const statusElement = document.querySelector('.broadcast-status');
        if (statusElement) {
            statusElement.className = `broadcast-status ${status}`;
            statusElement.textContent = status.toUpperCase();
        }
        
        // Update LIVE indicator
        const liveIndicator = document.querySelector('.live-indicator');
        if (liveIndicator) {
            liveIndicator.classList.toggle('active', status === 'connected');
        }
    }
    
    setupUI() {
        // Volume control
        const volumeSlider = document.querySelector('#volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.videoElement.volume = e.target.value / 100;
            });
        }
        
        // Quality selector
        const qualitySelector = document.querySelector('#quality-selector');
        if (qualitySelector) {
            qualitySelector.addEventListener('change', (e) => {
                this.changeQuality(e.target.value);
            });
        }
        
        // Fullscreen button
        const fullscreenBtn = document.querySelector('#fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Breakdown trigger button (premium feature)
        const breakdownBtn = document.querySelector('#trigger-breakdown');
        if (breakdownBtn) {
            breakdownBtn.addEventListener('click', () => {
                this.triggerBreakdown();
            });
        }
    }
    
    changeQuality(quality) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'change_quality',
                quality: quality
            }));
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.videoElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    triggerBreakdown() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'trigger_breakdown',
                character: 'random'
            }));
        }
    }
    
    fallbackToHLS() {
        // Fallback to HLS streaming if MediaSource not supported
        console.log('Using HLS fallback');
        
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource('https://alledged-static-news-backend.hf.space/stream.m3u8');
            hls.attachMedia(this.videoElement);
        } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            this.videoElement.src = 'https://alledged-static-news-backend.hf.space/stream.m3u8';
        }
    }
    
    showReconnectButton() {
        const btn = document.createElement('button');
        btn.className = 'reconnect-button';
        btn.textContent = 'Reconnect to Broadcast';
        btn.onclick = () => {
            this.reconnectAttempts = 0;
            this.connect();
            btn.remove();
        };
        
        document.querySelector('.video-container').appendChild(btn);
    }
    
    hexToArrayBuffer(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes.buffer;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.staticNewsStream = new StaticNewsLiveStream();
});

// CSS for effects
const style = document.createElement('style');
style.textContent = `
.glitch-effect {
    animation: glitch 0.3s infinite;
}

@keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
}

.screen-shake {
    animation: shake 0.5s;
}

@keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
}

.breakdown-alert {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 2rem;
    border-radius: 10px;
    z-index: 9999;
    text-align: center;
    animation: pulse 0.5s infinite;
}

.segment-transition {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9998;
}

.spinning-logo {
    animation: spin 3s linear infinite;
    width: 200px;
    height: 200px;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);