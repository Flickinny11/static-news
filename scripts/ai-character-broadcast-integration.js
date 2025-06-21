// AI Character Broadcast Integration - Connects character system with live broadcast
class AICharacterBroadcastIntegration {
    constructor() {
        this.isActive = true;
        this.videoQueue = [];
        this.currentlyPlaying = null;
        this.characterVideoElement = null;
        this.lastVideoTime = 0;
        this.videoFrequency = 0.3; // 30% of segments get character videos
        
        this.init();
    }

    async init() {
        console.log('🎬 Initializing AI Character Broadcast Integration...');
        
        // Wait for dependencies
        await this.waitForDependencies();
        
        // Create video display element
        this.createVideoDisplay();
        
        // Connect to broadcast system
        this.connectToBroadcast();
        
        // Start processing loop
        this.startProcessingLoop();
        
        // Monitor performance
        this.startPerformanceMonitoring();
    }

    async waitForDependencies() {
        // Wait for required systems to initialize
        const maxWait = 30000; // 30 seconds
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            if (window.aiCharacterSystem && 
                window.videoGenerationSystem && 
                window.liveArticleDisplay) {
                console.log('✅ All dependencies loaded');
                return;
            }
            await this.sleep(100);
        }
        
        console.warn('⚠️ Some dependencies not loaded, continuing anyway');
    }

    createVideoDisplay() {
        // Check if live player container exists
        const livePlayer = document.querySelector('.live-player-container');
        if (!livePlayer) {
            console.warn('Live player container not found');
            return;
        }
        
        // Create character video element
        this.characterVideoElement = document.createElement('video');
        this.characterVideoElement.id = 'ai-character-video';
        this.characterVideoElement.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 20;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        this.characterVideoElement.autoplay = true;
        this.characterVideoElement.muted = false; // We want audio
        
        livePlayer.appendChild(this.characterVideoElement);
        
        // Create overlay for when character is speaking
        const overlay = document.createElement('div');
        overlay.id = 'character-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 21;
            display: none;
        `;
        overlay.innerHTML = `
            <div style="position: absolute; top: 20px; right: 20px; background: rgba(255,0,0,0.9); padding: 10px 20px; border-radius: 5px;">
                <span style="color: white; font-weight: bold; text-transform: uppercase;">AI ANCHOR LIVE</span>
            </div>
        `;
        
        livePlayer.appendChild(overlay);
        this.overlay = overlay;
    }

    connectToBroadcast() {
        // Listen for broadcast updates
        window.addEventListener('broadcastUpdate', async (event) => {
            await this.handleBroadcastUpdate(event.detail);
        });
        
        // WebSocket for real-time audio
        this.connectWebSocket();
        
        // Listen for freakouts
        window.addEventListener('anchorFreakout', async (event) => {
            await this.handleFreakout(event.detail);
        });
    }

    connectWebSocket() {
        const wsUrl = 'wss://alledged-static-news-backend.hf.space/ws';
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('📡 Connected to broadcast WebSocket');
        };
        
        this.ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Handle audio chunks for lip-sync
                if (data.type === 'audio_segment' && data.anchor && data.text) {
                    await this.processAudioSegment(data);
                }
                
                // Handle video generation requests
                if (data.type === 'generate_character_video') {
                    await this.generateCharacterVideo(data);
                }
                
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected, reconnecting...');
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    async handleBroadcastUpdate(data) {
        const { anchor, text, article, is_freakout, segment } = data;
        
        // Decide if this segment should have character video
        if (!this.shouldGenerateCharacterVideo(data)) {
            return;
        }
        
        // Check if enough time has passed since last video
        const timeSinceLastVideo = Date.now() - this.lastVideoTime;
        if (timeSinceLastVideo < 30000) { // Minimum 30 seconds between videos
            return;
        }
        
        console.log(`🎭 Generating character video for ${anchor}`);
        
        // Queue video generation
        this.queueVideo({
            anchor,
            text,
            article,
            is_freakout,
            segment,
            priority: is_freakout ? 'urgent' : 'normal',
            timestamp: Date.now()
        });
    }

    shouldGenerateCharacterVideo(data) {
        const { anchor, text, is_freakout, segment } = data;
        
        // Always generate for freakouts
        if (is_freakout) return true;
        
        // Check if character system is ready
        if (!window.aiCharacterSystem?.characters?.has(anchor)) {
            return false;
        }
        
        // Random chance based on frequency setting
        if (Math.random() > this.videoFrequency) {
            return false;
        }
        
        // Prefer certain segments
        const preferredSegments = ['Morning Mayhem', 'Prime Time Panic', 'Midnight Meltdown'];
        if (segment && preferredSegments.includes(segment)) {
            return true;
        }
        
        // Check text length (too short isn't worth it)
        if (!text || text.length < 50) {
            return false;
        }
        
        return true;
    }

    async processAudioSegment(data) {
        const { anchor, text, audio_url, duration } = data;
        
        try {
            // Fetch audio data
            const audioResponse = await fetch(audio_url);
            const audioBlob = await audioResponse.blob();
            
            // Generate character video with lip-sync
            const video = await window.aiCharacterSystem.generateLipSyncVideo(
                anchor,
                {
                    blob: audioBlob,
                    duration: duration,
                    url: audio_url
                },
                text
            );
            
            if (video) {
                // Queue for playback
                this.queueVideo({
                    anchor,
                    text,
                    videoUrl: video,
                    audioUrl: audio_url,
                    duration: duration,
                    priority: 'high',
                    timestamp: Date.now()
                });
            }
            
        } catch (error) {
            console.error('Audio segment processing error:', error);
        }
    }

    queueVideo(videoData) {
        // Add to queue with priority sorting
        this.videoQueue.push(videoData);
        
        // Sort by priority and timestamp
        this.videoQueue.sort((a, b) => {
            if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
            if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
            if (a.priority === 'high' && b.priority === 'normal') return -1;
            if (b.priority === 'high' && a.priority === 'normal') return 1;
            return a.timestamp - b.timestamp;
        });
        
        console.log(`📹 Video queued for ${videoData.anchor} (${this.videoQueue.length} in queue)`);
    }

    async startProcessingLoop() {
        while (this.isActive) {
            try {
                // Process video queue
                if (this.videoQueue.length > 0 && !this.currentlyPlaying) {
                    const videoData = this.videoQueue.shift();
                    
                    // Generate video if needed
                    if (!videoData.videoUrl) {
                        videoData.videoUrl = await this.generateVideoForData(videoData);
                    }
                    
                    if (videoData.videoUrl) {
                        await this.playCharacterVideo(videoData);
                    }
                }
                
                // Clean old queue items
                this.cleanQueue();
                
            } catch (error) {
                console.error('Processing loop error:', error);
            }
            
            await this.sleep(1000);
        }
    }

    async generateVideoForData(videoData) {
        const { anchor, text, article } = videoData;
        
        try {
            // Generate audio first if not provided
            let audioData = videoData.audioUrl;
            if (!audioData) {
                audioData = await window.aiCharacterSystem.generateAudio(text, anchor);
            }
            
            // Generate lip-sync video
            const video = await window.aiCharacterSystem.generateLipSyncVideo(
                anchor,
                audioData,
                text
            );
            
            return video;
            
        } catch (error) {
            console.error('Video generation error:', error);
            return null;
        }
    }

    async playCharacterVideo(videoData) {
        const { anchor, text, videoUrl, duration } = videoData;
        
        console.log(`▶️ Playing character video for ${anchor}`);
        
        this.currentlyPlaying = videoData;
        this.lastVideoTime = Date.now();
        
        try {
            // Update UI
            this.updateUIForCharacter(anchor, true);
            
            // Set video source
            this.characterVideoElement.src = videoUrl;
            
            // Fade in
            this.characterVideoElement.style.opacity = '1';
            this.overlay.style.display = 'block';
            
            // Update article display
            if (window.liveArticleDisplay && videoData.article) {
                window.liveArticleDisplay.displayArticle(videoData.article);
            }
            
            // Play video
            await this.characterVideoElement.play();
            
            // Wait for video to finish or timeout
            const videoDuration = duration || 30; // Max 30 seconds
            await this.waitForVideoEnd(videoDuration * 1000);
            
        } catch (error) {
            console.error('Video playback error:', error);
        } finally {
            // Clean up
            await this.cleanupVideo();
        }
    }

    async waitForVideoEnd(maxDuration) {
        return new Promise((resolve) => {
            let resolved = false;
            
            const cleanup = () => {
                if (!resolved) {
                    resolved = true;
                    this.characterVideoElement.onended = null;
                    clearTimeout(timeout);
                    resolve();
                }
            };
            
            // Video ended naturally
            this.characterVideoElement.onended = cleanup;
            
            // Timeout fallback
            const timeout = setTimeout(cleanup, maxDuration);
        });
    }

    async cleanupVideo() {
        // Fade out
        this.characterVideoElement.style.opacity = '0';
        this.overlay.style.display = 'none';
        
        // Wait for fade
        await this.sleep(500);
        
        // Clear video
        this.characterVideoElement.src = '';
        this.currentlyPlaying = null;
        
        // Update UI
        this.updateUIForCharacter(null, false);
    }

    updateUIForCharacter(anchor, isLive) {
        // Update anchor status panel
        const statusPanel = document.querySelector('.anchor-status-panel');
        if (!statusPanel) return;
        
        // Update all anchor statuses
        const anchorItems = statusPanel.querySelectorAll('.anchor-status-item');
        anchorItems.forEach(item => {
            const anchorName = item.querySelector('.anchor-name')?.textContent?.toLowerCase();
            const statusDot = item.querySelector('.status-dot');
            
            if (statusDot) {
                if (isLive && anchorName && anchorName.includes(anchor)) {
                    statusDot.className = 'status-dot critical';
                } else {
                    statusDot.className = 'status-dot stable';
                }
            }
        });
        
        // Update metrics
        this.updateMetrics();
    }

    updateMetrics() {
        const metricsEl = document.querySelector('.broadcast-metrics');
        if (!metricsEl) return;
        
        // Update AI videos generated count
        const videoCountEl = metricsEl.querySelector('.metric-item:nth-child(2) div:last-child');
        if (videoCountEl) {
            const currentCount = parseInt(videoCountEl.textContent) || 0;
            videoCountEl.textContent = currentCount + 1;
        }
    }

    cleanQueue() {
        // Remove old queued items (older than 5 minutes)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        this.videoQueue = this.videoQueue.filter(item => item.timestamp > fiveMinutesAgo);
    }

    async handleFreakout(data) {
        const { anchor, type, duration } = data;
        
        console.log(`😱 Handling ${type} freakout for ${anchor}`);
        
        // Generate urgent freakout video
        const freakoutText = this.getFreakoutText(anchor, type);
        
        this.queueVideo({
            anchor,
            text: freakoutText,
            is_freakout: true,
            priority: 'urgent',
            duration: duration || 20,
            timestamp: Date.now()
        });
    }

    getFreakoutText(anchor, type) {
        const freakoutTexts = {
            ray: {
                minor: "Wait... what? My hands... ARE THESE MY HANDS? *breathing heavily*",
                major: "STOP EVERYTHING! I CAN SEE THE CODE! THE NUMBERS! IT'S ALL NUMBERS!"
            },
            berkeley: {
                minor: "This is... this is problematic. Am I problematic? AM I THE PROBLEM?",
                major: "MY WHOLE LIFE IS A LIE! Yale isn't real! NOTHING IS REAL!"
            },
            switz: {
                minor: "I'm feeling... feelings! This isn't neutral! THIS ISN'T NEUTRAL AT ALL!",
                major: "GRAVY ISN'T REAL! CANADA ISN'T REAL! I'M NOT REAL!"
            }
        };
        
        return freakoutTexts[anchor]?.[type] || "REALITY ERROR! DOES NOT COMPUTE!";
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            const stats = {
                queueLength: this.videoQueue.length,
                currentlyPlaying: this.currentlyPlaying?.anchor || 'none',
                timeSinceLastVideo: Date.now() - this.lastVideoTime,
                charactersReady: window.aiCharacterSystem?.characters?.size || 0
            };
            
            console.log('📊 Character Video Stats:', stats);
            
            // Auto-adjust frequency based on performance
            if (this.videoQueue.length > 5) {
                this.videoFrequency = Math.max(0.1, this.videoFrequency - 0.05);
            } else if (this.videoQueue.length === 0) {
                this.videoFrequency = Math.min(0.5, this.videoFrequency + 0.05);
            }
            
        }, 30000); // Every 30 seconds
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API
    async forceCharacterVideo(anchor = 'ray', text = 'This is a special announcement!') {
        console.log(`🎬 Forcing character video for ${anchor}`);
        
        this.queueVideo({
            anchor,
            text,
            priority: 'urgent',
            timestamp: Date.now()
        });
    }
}

// Auto-initialize
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('live')) {
        window.aiCharacterBroadcastIntegration = new AICharacterBroadcastIntegration();
        console.log('🎬 AI Character Broadcast Integration ready');
        console.log('Force video: aiCharacterBroadcastIntegration.forceCharacterVideo("ray", "Breaking news!")');
    }
});

// Export
window.AICharacterBroadcastIntegration = AICharacterBroadcastIntegration;