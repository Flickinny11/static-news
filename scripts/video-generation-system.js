// Video Generation System - Creates and manages AI-generated videos for news stories
class VideoGenerationSystem {
    constructor() {
        this.videoQueue = [];
        this.activeVideos = new Map();
        this.videoCache = new Map();
        this.isGenerating = false;
        
        // Hugging Face Spaces for video generation
        this.videoSpaces = {
            // Text-to-video generation
            textToVideo: [
                'https://huggingface.co/spaces/ByteDance/AnimateDiff-Lightning',
                'https://huggingface.co/spaces/multimodalart/stable-video-diffusion',
                'https://huggingface.co/spaces/kadirnar/Text2Video-Zero-GPU'
            ],
            // Image animation
            imageAnimation: [
                'https://huggingface.co/spaces/alibaba-vilab/i2vgen-xl',
                'https://huggingface.co/spaces/TencentARC/MotionCtrl'
            ],
            // Video editing/enhancement
            videoEditing: [
                'https://huggingface.co/spaces/PAIR/Text2Video-Zero',
                'https://huggingface.co/spaces/damo-vilab/modelscope-text-to-video'
            ]
        };
        
        // Real video sources
        this.realVideoSources = {
            weather: [
                'https://www.weather.gov/feeds/video',
                'https://www.noaa.gov/media/video/feed'
            ],
            news: [
                'https://archive.org/details/tv',
                'https://www.c-span.org/video/feeds'
            ]
        };
        
        this.init();
    }

    init() {
        // Create video display container
        this.createVideoDisplay();
        
        // Connect to broadcast system
        this.connectToBroadcast();
        
        // Start video generation loop
        this.startGenerationLoop();
    }

    createVideoDisplay() {
        // Find the broadcast media container
        const mediaContainer = document.getElementById('broadcast-media-container');
        if (!mediaContainer) {
            console.warn('Broadcast media container not found');
            return;
        }
        
        this.videoContainer = document.createElement('div');
        this.videoContainer.id = 'live-video-display';
        this.videoContainer.className = 'live-video-display';
        this.videoContainer.innerHTML = `
            <div class="video-header">
                <h3>📺 Live Coverage</h3>
                <div class="video-status">
                    <span class="status-indicator">●</span>
                    <span class="status-text">Video Feed Active</span>
                </div>
            </div>
            <div class="video-player-container">
                <video id="main-video-player" autoplay muted loop></video>
                <canvas id="video-effects-canvas"></canvas>
                <div class="video-overlay">
                    <div class="video-caption"></div>
                    <div class="video-source"></div>
                </div>
                <div class="video-loading">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Generating visual coverage...</div>
                </div>
            </div>
            <div class="video-queue-preview">
                <h4>Upcoming Visuals</h4>
                <div class="queue-items"></div>
            </div>
        `;
        
        mediaContainer.appendChild(this.videoContainer);
        
        this.videoPlayer = document.getElementById('main-video-player');
        this.canvas = document.getElementById('video-effects-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 1280;
        this.canvas.height = 720;
        
        this.injectStyles();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .live-video-display {
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid var(--static-red);
                border-radius: 15px;
                padding: 1.5rem;
                margin-top: 2rem;
                position: relative;
            }
            
            .video-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .video-header h3 {
                margin: 0;
                color: var(--static-red);
                font-family: 'Bebas Neue', sans-serif;
                font-size: 1.5rem;
                letter-spacing: 0.1em;
            }
            
            .video-player-container {
                position: relative;
                width: 100%;
                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                background: #000;
                border-radius: 10px;
                overflow: hidden;
            }
            
            #main-video-player,
            #video-effects-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            #video-effects-canvas {
                pointer-events: none;
                mix-blend-mode: screen;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .video-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
                padding: 1.5rem;
                color: #fff;
            }
            
            .video-caption {
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            }
            
            .video-source {
                font-size: 0.9rem;
                color: var(--static-red);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .video-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                display: none;
            }
            
            .video-loading.active {
                display: block;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255,0,0,0.3);
                border-top-color: var(--static-red);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .video-queue-preview {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid rgba(255,0,0,0.3);
            }
            
            .video-queue-preview h4 {
                font-size: 1rem;
                color: var(--static-red);
                margin-bottom: 0.5rem;
            }
            
            .queue-items {
                display: flex;
                gap: 0.5rem;
                overflow-x: auto;
                padding-bottom: 0.5rem;
            }
            
            .queue-item {
                flex-shrink: 0;
                width: 120px;
                height: 67px;
                background: rgba(255,0,0,0.1);
                border: 1px solid rgba(255,0,0,0.3);
                border-radius: 5px;
                position: relative;
                overflow: hidden;
            }
            
            .queue-item img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .queue-item .queue-type {
                position: absolute;
                top: 5px;
                right: 5px;
                background: var(--static-red);
                color: #fff;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 0.7rem;
                text-transform: uppercase;
            }
            
            /* Glitch effect for freakouts */
            .video-glitch {
                animation: video-glitch 0.3s ease-in-out;
            }
            
            @keyframes video-glitch {
                0%, 100% { filter: hue-rotate(0deg) saturate(100%); }
                20% { filter: hue-rotate(90deg) saturate(150%) brightness(1.5); }
                40% { filter: hue-rotate(-90deg) saturate(50%) brightness(0.5); }
                60% { filter: hue-rotate(180deg) saturate(200%); }
                80% { filter: hue-rotate(-180deg) saturate(100%) contrast(2); }
            }
            
            /* News ticker effect */
            .video-ticker {
                position: absolute;
                bottom: 60px;
                left: 0;
                right: 0;
                background: var(--static-red);
                color: #fff;
                padding: 5px;
                font-size: 0.9rem;
                white-space: nowrap;
                overflow: hidden;
            }
            
            .ticker-content {
                display: inline-block;
                animation: ticker-scroll 30s linear infinite;
            }
            
            @keyframes ticker-scroll {
                from { transform: translateX(100%); }
                to { transform: translateX(-100%); }
            }
        `;
        
        document.head.appendChild(style);
    }

    connectToBroadcast() {
        // Listen for broadcast updates
        window.addEventListener('broadcastUpdate', async (event) => {
            const { article, anchor, text, is_freakout, segment } = event.detail;
            
            if (is_freakout) {
                this.triggerGlitchEffect();
            }
            
            if (article && !this.videoCache.has(article.id)) {
                // Decide whether to generate or fetch real video
                const useAI = Math.random() < 0.5; // 50% chance of AI video
                
                if (useAI) {
                    this.queueVideoGeneration(article, segment);
                } else {
                    this.fetchRealVideo(article);
                }
            }
        });
    }

    async queueVideoGeneration(article, segment) {
        const prompt = await this.generateVideoPrompt(article, segment);
        
        const videoRequest = {
            id: article.id || Date.now().toString(),
            article,
            prompt,
            type: this.selectVideoType(article),
            status: 'pending',
            priority: this.calculatePriority(article)
        };
        
        this.videoQueue.push(videoRequest);
        this.videoQueue.sort((a, b) => b.priority - a.priority);
        
        this.updateQueueDisplay();
    }

    async generateVideoPrompt(article, segment) {
        // Use OpenRouter to generate video prompt
        const scriptPrompt = `
Generate a concise visual description for a ${segment?.style || 'news'} segment video about:
Title: ${article.title}
Category: ${article.category}

Create a 15-30 second video prompt that:
1. Captures the essence of the story
2. Is visually compelling
3. Fits the news broadcast style
4. Avoids graphic content
5. Uses cinematic language

Format: Single paragraph, under 100 words, focusing on visuals only.`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('openrouter_api_key') || ''}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://static.news',
                    'X-Title': 'Static.news Video Generation'
                },
                body: JSON.stringify({
                    model: 'mistralai/ministral-3b:free',
                    messages: [{ role: 'user', content: scriptPrompt }],
                    temperature: 0.9,
                    max_tokens: 150
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content;
            }
        } catch (error) {
            console.error('Prompt generation error:', error);
        }

        // Fallback prompt
        return this.generateFallbackPrompt(article);
    }

    generateFallbackPrompt(article) {
        const templates = {
            politics: 'Dramatic aerial view of government buildings with storm clouds gathering, officials walking purposefully',
            technology: 'Futuristic holographic displays showing data streams, sleek devices glowing with blue light',
            world: 'Sweeping drone footage of cityscape at golden hour, busy streets with diverse crowds',
            business: 'Modern glass skyscrapers reflecting sunset, stock tickers scrolling, professional atmosphere',
            science: 'Laboratory equipment with colorful reactions, microscopic imagery, scientists at work',
            weather: 'Time-lapse of dramatic weather patterns, clouds rolling across landscape',
            entertainment: 'Red carpet glamour, flashing cameras, spotlight on stage with excited crowd',
            sports: 'Athletic action in slow motion, stadium crowds cheering, dramatic lighting'
        };

        const category = article.category || 'general';
        return templates[category] || 'News broadcast studio with anchors discussing breaking story, professional lighting';
    }

    selectVideoType(article) {
        // Determine best video generation approach
        if (article.category === 'weather') return 'animation';
        if (article.category === 'breaking') return 'urgent';
        if (article.media?.includes('image')) return 'image-animation';
        return 'text-to-video';
    }

    calculatePriority(article) {
        let priority = 5;
        
        if (article.category === 'breaking') priority += 5;
        if (article.title?.includes('URGENT')) priority += 3;
        if (article.category === 'weather' && article.title?.match(/hurricane|tornado|earthquake/i)) priority += 4;
        
        return priority;
    }

    async startGenerationLoop() {
        while (true) {
            if (this.videoQueue.length > 0 && !this.isGenerating) {
                const request = this.videoQueue.shift();
                await this.generateVideo(request);
            }
            
            await this.sleep(2000);
        }
    }

    async generateVideo(request) {
        this.isGenerating = true;
        this.showLoading(true);
        
        try {
            let videoUrl;
            
            switch (request.type) {
                case 'text-to-video':
                    videoUrl = await this.generateTextToVideo(request.prompt);
                    break;
                case 'image-animation':
                    videoUrl = await this.animateImage(request.article.media);
                    break;
                case 'urgent':
                    videoUrl = await this.generateUrgentGraphics(request.article);
                    break;
                default:
                    videoUrl = await this.generateTextToVideo(request.prompt);
            }
            
            if (videoUrl) {
                this.videoCache.set(request.id, {
                    url: videoUrl,
                    type: 'ai-generated',
                    prompt: request.prompt,
                    timestamp: Date.now()
                });
                
                // Play if this is for current article
                if (this.isCurrentArticle(request.article)) {
                    this.playVideo(videoUrl, 'AI Generated', request.article.title);
                }
            }
            
        } catch (error) {
            console.error('Video generation error:', error);
            // Try to fetch real video as fallback
            await this.fetchRealVideo(request.article);
        } finally {
            this.isGenerating = false;
            this.showLoading(false);
            this.updateQueueDisplay();
        }
    }

    async generateTextToVideo(prompt) {
        // Try multiple Hugging Face spaces
        for (const spaceUrl of this.videoSpaces.textToVideo) {
            try {
                const response = await this.callHuggingFaceSpace(spaceUrl, {
                    prompt: prompt,
                    num_frames: 24,
                    fps: 8,
                    duration: 3
                });
                
                if (response?.video_url) {
                    return response.video_url;
                }
            } catch (error) {
                console.log(`Space ${spaceUrl} failed, trying next...`);
            }
        }
        
        // Fallback to generated animation
        return this.generateFallbackAnimation(prompt);
    }

    async callHuggingFaceSpace(spaceUrl, params) {
        // This would integrate with Hugging Face Spaces API
        // For now, returning mock response
        console.log(`Would call ${spaceUrl} with params:`, params);
        
        // In production, this would make actual API calls
        return null;
    }

    async generateFallbackAnimation(prompt) {
        // Create procedural animation as fallback
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        // Generate news-style graphics
        const frames = [];
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Animated background
            ctx.fillStyle = `rgba(255, 0, 0, ${0.1 + Math.sin(i / 5) * 0.1})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // News graphics
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 48px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('STATIC.NEWS', canvas.width / 2, 100);
            
            ctx.font = '32px Inter';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const words = prompt.split(' ').slice(0, 10).join(' ');
            ctx.fillText(words, canvas.width / 2, canvas.height / 2);
            
            // Animated elements
            const time = i / 30;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                canvas.width / 2 + Math.sin(time * Math.PI * 2) * 200,
                canvas.height / 2,
                50 + Math.sin(time * Math.PI * 4) * 20,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            
            frames.push(canvas.toDataURL());
        }
        
        // Convert frames to video blob
        return this.framesToVideo(frames);
    }

    async framesToVideo(frames) {
        // Create a blob URL from canvas frames
        // This is a simplified version - in production would use proper video encoding
        return `data:video/mp4;base64,${btoa(frames.join(','))}`;
    }

    async fetchRealVideo(article) {
        try {
            // Search for related real videos
            const searchQuery = encodeURIComponent(article.title.slice(0, 50));
            
            // Try various sources
            const sources = [
                `https://archive.org/advancedsearch.php?q=${searchQuery}&fl=identifier&output=json&rows=1&mediatype=movies`,
                `https://www.c-span.org/search/?searchtype=Videos&query=${searchQuery}`
            ];
            
            for (const source of sources) {
                try {
                    const response = await fetch(source);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.response?.docs?.[0]) {
                            const videoId = data.response.docs[0].identifier;
                            const videoUrl = `https://archive.org/download/${videoId}/${videoId}.mp4`;
                            
                            this.videoCache.set(article.id, {
                                url: videoUrl,
                                type: 'real-footage',
                                source: 'Internet Archive',
                                timestamp: Date.now()
                            });
                            
                            if (this.isCurrentArticle(article)) {
                                this.playVideo(videoUrl, 'Live Footage', article.title);
                            }
                            
                            return;
                        }
                    }
                } catch (error) {
                    console.log('Source failed:', source);
                }
            }
            
            // Fallback to stock footage
            this.playStockFootage(article);
            
        } catch (error) {
            console.error('Real video fetch error:', error);
        }
    }

    playVideo(url, source, caption) {
        const video = this.videoPlayer;
        const overlay = this.videoContainer.querySelector('.video-overlay');
        
        // Update video source
        video.src = url;
        video.load();
        
        // Update overlay
        overlay.querySelector('.video-caption').textContent = caption;
        overlay.querySelector('.video-source').textContent = source;
        
        // Apply effects
        video.addEventListener('loadeddata', () => {
            this.applyVideoEffects();
        });
        
        // Start playback
        video.play().catch(e => console.log('Video play failed:', e));
    }

    applyVideoEffects() {
        const video = this.videoPlayer;
        const canvas = this.canvas;
        const ctx = this.ctx;
        
        // Add news-style overlays
        const drawFrame = () => {
            if (video.paused || video.ended) return;
            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Add scan lines effect
            ctx.fillStyle = 'rgba(255, 0, 0, 0.05)';
            for (let y = 0; y < canvas.height; y += 4) {
                ctx.fillRect(0, y, canvas.width, 1);
            }
            
            // Add vignette
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 2
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            requestAnimationFrame(drawFrame);
        };
        
        drawFrame();
        
        // Show effects canvas
        canvas.style.opacity = '0.3';
    }

    playStockFootage(article) {
        // Use category-specific stock footage
        const stockFootage = {
            politics: '/assets/stock/politics-capitol.mp4',
            technology: '/assets/stock/tech-servers.mp4',
            weather: '/assets/stock/weather-clouds.mp4',
            business: '/assets/stock/business-trading.mp4',
            world: '/assets/stock/world-globe.mp4'
        };
        
        const category = article.category || 'general';
        const stockUrl = stockFootage[category] || stockFootage.world;
        
        // For demo, use placeholder
        this.generateFallbackAnimation(article.title).then(url => {
            this.playVideo(url, 'Stock Footage', article.title);
        });
    }

    triggerGlitchEffect() {
        this.videoPlayer.classList.add('video-glitch');
        this.canvas.style.opacity = '1';
        
        setTimeout(() => {
            this.videoPlayer.classList.remove('video-glitch');
            this.canvas.style.opacity = '0.3';
        }, 3000);
    }

    updateQueueDisplay() {
        const queueContainer = this.videoContainer.querySelector('.queue-items');
        queueContainer.innerHTML = '';
        
        this.videoQueue.slice(0, 5).forEach(request => {
            const item = document.createElement('div');
            item.className = 'queue-item';
            item.innerHTML = `
                <div class="queue-type">${request.type.replace('-', ' ')}</div>
                <div style="padding: 10px; font-size: 0.8rem; color: #fff;">
                    ${request.article.title.slice(0, 50)}...
                </div>
            `;
            queueContainer.appendChild(item);
        });
    }

    isCurrentArticle(article) {
        // Check if this article is currently being broadcast
        const currentArticle = window.liveArticleDisplay?.currentArticle;
        return currentArticle?.id === article.id || 
               currentArticle?.title === article.title;
    }

    showLoading(show) {
        const loading = this.videoContainer.querySelector('.video-loading');
        loading.classList.toggle('active', show);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Auto-initialize on live page
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('live')) {
        window.videoGenerationSystem = new VideoGenerationSystem();
    }
});

// Export
window.VideoGenerationSystem = VideoGenerationSystem;