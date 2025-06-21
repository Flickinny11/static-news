// Broadcast Video Integration - Coordinates AI video generation with live broadcast
class BroadcastVideoIntegration {
    constructor() {
        this.currentVideo = null;
        this.videoHistory = [];
        this.huggingFaceSpaces = {
            // Production-ready HF Spaces for video generation
            textToVideo: [
                {
                    url: 'hf.space/ByteDance/AnimateDiff-Lightning',
                    model: 'animatediff',
                    maxDuration: 3,
                    style: 'photorealistic'
                },
                {
                    url: 'hf.space/multimodalart/stable-video-diffusion', 
                    model: 'svd',
                    maxDuration: 4,
                    style: 'cinematic'
                }
            ],
            imageAnimation: [
                {
                    url: 'hf.space/alibaba-vilab/i2vgen-xl',
                    model: 'i2vgen',
                    style: 'smooth_motion'
                }
            ]
        };
        
        this.init();
    }

    init() {
        // Connect to broadcast WebSocket
        this.connectToBroadcast();
        
        // Set up video request handler
        this.setupVideoRequestHandler();
        
        // Monitor performance
        this.startPerformanceMonitoring();
    }

    connectToBroadcast() {
        // Listen for video generation requests from the broadcast system
        window.addEventListener('message', (event) => {
            if (event.data.type === 'generate_video') {
                this.handleVideoRequest(event.data);
            }
        });

        // WebSocket connection for real-time coordination
        const ws = new WebSocket('wss://alledged-static-news-backend.hf.space/ws');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'generate_video') {
                this.handleVideoRequest(data);
            }
        };
    }

    async handleVideoRequest(request) {
        const { article, prompt, priority, segment, style } = request;
        
        console.log(`📹 Video generation requested for: ${article.title}`);
        console.log(`Prompt: ${prompt}`);
        console.log(`Priority: ${priority}, Style: ${style}`);
        
        try {
            // Select best HF Space based on requirements
            const space = this.selectBestSpace(style, priority);
            
            // Generate video
            const videoUrl = await this.generateVideoWithSpace(space, prompt, article);
            
            if (videoUrl) {
                // Display video in sync with broadcast
                this.displayVideo(videoUrl, article);
                
                // Cache for future use
                this.cacheVideo(article.id, videoUrl, prompt);
                
                // Update metrics
                this.updateMetrics('generated');
            } else {
                // Fallback to stock or procedural video
                await this.handleVideoFallback(article, style);
            }
            
        } catch (error) {
            console.error('Video generation error:', error);
            await this.handleVideoFallback(article, style);
        }
    }

    selectBestSpace(style, priority) {
        // Intelligent space selection based on requirements
        const spaces = [...this.huggingFaceSpaces.textToVideo];
        
        if (style === 'urgent' || priority === 'high') {
            // Prefer faster models for breaking news
            return spaces.find(s => s.model === 'animatediff') || spaces[0];
        }
        
        if (style === 'cinematic' || style === 'professional') {
            // Prefer higher quality for feature segments
            return spaces.find(s => s.model === 'svd') || spaces[0];
        }
        
        // Default to first available
        return spaces[0];
    }

    async generateVideoWithSpace(space, prompt, article) {
        console.log(`🎬 Generating with ${space.model}...`);
        
        // This would make actual API calls to HF Spaces
        // For demo, simulating the process
        const mockVideoGeneration = new Promise((resolve) => {
            setTimeout(() => {
                // In production, this would return actual video URL
                const mockUrl = this.createProceduralVideo(prompt, article);
                resolve(mockUrl);
            }, 3000);
        });
        
        return await mockVideoGeneration;
    }

    createProceduralVideo(prompt, article) {
        // Create canvas-based video as fallback
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        // Generate news-style graphics
        const frames = [];
        const frameCount = 90; // 3 seconds at 30fps
        
        for (let i = 0; i < frameCount; i++) {
            // Clear frame
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Animated background
            const time = i / frameCount;
            
            // News graphics overlay
            ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height * 0.2);
            ctx.fillRect(0, canvas.height * 0.8, canvas.width, canvas.height * 0.2);
            
            // Breaking news banner
            if (article.category === 'breaking') {
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(0, 100, canvas.width, 100);
                
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 48px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('BREAKING NEWS', canvas.width / 2, 165);
            }
            
            // Title animation
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 64px Inter';
            ctx.textAlign = 'center';
            
            // Typewriter effect
            const titleLength = Math.floor(article.title.length * time);
            const displayTitle = article.title.substring(0, titleLength);
            
            // Word wrap
            const words = displayTitle.split(' ');
            let line = '';
            let y = canvas.height / 2;
            
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > canvas.width * 0.8 && n > 0) {
                    ctx.fillText(line, canvas.width / 2, y);
                    line = words[n] + ' ';
                    y += 80;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, canvas.width / 2, y);
            
            // Category badge
            ctx.fillStyle = this.getCategoryColor(article.category);
            ctx.fillRect(50, 50, 200, 40);
            
            ctx.fillStyle = '#fff';
            ctx.font = '24px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(article.category.toUpperCase(), 60, 78);
            
            // Animated elements
            this.drawAnimatedElements(ctx, time, article);
            
            // Convert to data URL
            frames.push(canvas.toDataURL('image/webp', 0.8));
        }
        
        // Create video blob from frames
        return this.framesToVideoBlob(frames);
    }

    getCategoryColor(category) {
        const colors = {
            breaking: '#ff0000',
            politics: '#0066cc',
            technology: '#00ccff',
            business: '#00cc00',
            entertainment: '#ff00ff',
            sports: '#ff9900',
            weather: '#0099ff',
            science: '#9900ff'
        };
        return colors[category] || '#666666';
    }

    drawAnimatedElements(ctx, time, article) {
        // Add category-specific animations
        switch (article.category) {
            case 'weather':
                // Animated weather icons
                this.drawWeatherAnimation(ctx, time);
                break;
            case 'technology':
                // Tech grid animation
                this.drawTechAnimation(ctx, time);
                break;
            case 'business':
                // Stock ticker animation
                this.drawBusinessAnimation(ctx, time);
                break;
            default:
                // Generic news animation
                this.drawNewsAnimation(ctx, time);
        }
    }

    drawWeatherAnimation(ctx, time) {
        // Animated clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 5; i++) {
            const x = (time * 200 + i * 300) % (ctx.canvas.width + 200) - 100;
            const y = 200 + Math.sin(time * Math.PI * 2 + i) * 50;
            
            // Cloud shape
            ctx.beginPath();
            ctx.arc(x, y, 60, 0, Math.PI * 2);
            ctx.arc(x + 40, y, 50, 0, Math.PI * 2);
            ctx.arc(x - 40, y, 50, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawTechAnimation(ctx, time) {
        // Grid of animated tech elements
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        
        const gridSize = 100;
        for (let x = 0; x < ctx.canvas.width; x += gridSize) {
            for (let y = 0; y < ctx.canvas.height; y += gridSize) {
                if (Math.random() < 0.1) {
                    ctx.beginPath();
                    ctx.rect(x, y, gridSize, gridSize);
                    ctx.stroke();
                    
                    // Random tech symbols
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
                    ctx.font = '48px monospace';
                    ctx.textAlign = 'center';
                    const symbols = ['0', '1', '<', '>', '{', '}'];
                    ctx.fillText(
                        symbols[Math.floor(Math.random() * symbols.length)],
                        x + gridSize / 2,
                        y + gridSize / 2
                    );
                }
            }
        }
    }

    drawBusinessAnimation(ctx, time) {
        // Stock ticker
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.font = '32px monospace';
        
        const stocks = ['TECH +2.3%', 'AI +5.7%', 'NEWS -1.2%', 'STATIC +999%'];
        const tickerY = ctx.canvas.height - 100;
        
        stocks.forEach((stock, i) => {
            const x = (time * 500 + i * 300) % (ctx.canvas.width + 300) - 150;
            ctx.fillText(stock, x, tickerY);
        });
        
        // Graph animation
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let x = 0; x < ctx.canvas.width; x += 20) {
            const y = ctx.canvas.height / 2 + Math.sin((x + time * 1000) / 100) * 100;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    drawNewsAnimation(ctx, time) {
        // Generic news broadcast elements
        const t = time * Math.PI * 2;
        
        // Rotating globe
        ctx.save();
        ctx.translate(ctx.canvas.width - 150, 150);
        ctx.rotate(t);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        
        // Globe outline
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.stroke();
        
        // Continents (simplified)
        ctx.beginPath();
        ctx.ellipse(0, 0, 60, 80, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
        
        // News ticker at bottom
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, ctx.canvas.height - 60, ctx.canvas.width, 60);
        
        ctx.fillStyle = '#fff';
        ctx.font = '28px Inter';
        ctx.textAlign = 'left';
        const tickerText = 'LIVE FROM STATIC.NEWS STUDIOS • AI ANCHORS DELIVERING REAL NEWS 24/7 • ';
        const tickerX = -(time * 300) % (ctx.measureText(tickerText).width + 100);
        ctx.fillText(tickerText + tickerText, tickerX, ctx.canvas.height - 20);
    }

    framesToVideoBlob(frames) {
        // Convert frames to video
        // In production, this would use proper video encoding
        // For now, returning a data URL that simulates video
        return `data:video/webm;base64,${btoa(frames.slice(0, 10).join(','))}`;
    }

    async handleVideoFallback(article, style) {
        console.log('📺 Using fallback video generation...');
        
        // Try to find relevant stock footage
        const stockVideo = await this.findStockFootage(article);
        
        if (stockVideo) {
            this.displayVideo(stockVideo, article);
            this.updateMetrics('stock');
        } else {
            // Generate procedural video
            const proceduralVideo = this.createProceduralVideo(
                `News coverage of ${article.title}`,
                article
            );
            this.displayVideo(proceduralVideo, article);
            this.updateMetrics('procedural');
        }
    }

    async findStockFootage(article) {
        // Search for relevant stock footage
        // This would integrate with stock video APIs
        const stockSources = {
            weather: [
                'https://static.videezy.com/system/resources/previews/000/044/582/original/dark-clouds-time-lapse.mp4',
                'https://static.videezy.com/system/resources/previews/000/043/099/original/4k-rain-drops.mp4'
            ],
            technology: [
                'https://static.videezy.com/system/resources/previews/000/042/234/original/digital-technology.mp4'
            ],
            business: [
                'https://static.videezy.com/system/resources/previews/000/035/441/original/stock-market.mp4'
            ]
        };
        
        const categoryVideos = stockSources[article.category];
        if (categoryVideos && categoryVideos.length > 0) {
            return categoryVideos[Math.floor(Math.random() * categoryVideos.length)];
        }
        
        return null;
    }

    displayVideo(videoUrl, article) {
        // Sync video display with broadcast
        if (window.videoGenerationSystem) {
            window.videoGenerationSystem.playVideo(
                videoUrl,
                'AI Generated',
                article.title
            );
        }
        
        // Track current video
        this.currentVideo = {
            url: videoUrl,
            article: article,
            timestamp: Date.now()
        };
        
        // Add to history
        this.videoHistory.push(this.currentVideo);
    }

    cacheVideo(articleId, videoUrl, prompt) {
        // Cache for reuse
        const cacheKey = `video_${articleId}`;
        const cacheData = {
            url: videoUrl,
            prompt: prompt,
            generated: Date.now()
        };
        
        try {
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Video cache full, clearing old entries...');
            this.clearOldCache();
        }
    }

    clearOldCache() {
        // Remove videos older than 24 hours
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('video_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.generated < oneDayAgo) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    localStorage.removeItem(key);
                }
            }
        }
    }

    updateMetrics(type) {
        // Update display metrics
        const metricsEl = document.querySelector('.broadcast-metrics');
        if (metricsEl) {
            const aiVideoCount = metricsEl.querySelector('.metric-item:nth-child(2) div:last-child');
            if (aiVideoCount && type === 'generated') {
                const currentCount = parseInt(aiVideoCount.textContent) || 0;
                aiVideoCount.textContent = currentCount + 1;
            }
        }
        
        // Emit event for analytics
        window.dispatchEvent(new CustomEvent('videoGenerated', {
            detail: { type, timestamp: Date.now() }
        }));
    }

    startPerformanceMonitoring() {
        // Monitor video generation performance
        setInterval(() => {
            const stats = {
                queueLength: window.videoGenerationSystem?.videoQueue?.length || 0,
                cachedVideos: this.countCachedVideos(),
                historyLength: this.videoHistory.length,
                currentVideo: this.currentVideo?.article?.title || 'None'
            };
            
            console.log('📊 Video System Stats:', stats);
        }, 30000); // Every 30 seconds
    }

    countCachedVideos() {
        let count = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('video_')) {
                count++;
            }
        }
        return count;
    }

    setupVideoRequestHandler() {
        // Handle manual video generation requests
        window.generateVideoForCurrentStory = async () => {
            const currentArticle = window.liveArticleDisplay?.currentArticle;
            if (currentArticle) {
                const request = {
                    article: currentArticle,
                    prompt: `Breaking news coverage of ${currentArticle.title}`,
                    priority: 'high',
                    style: 'urgent'
                };
                await this.handleVideoRequest(request);
            } else {
                console.log('No current article to generate video for');
            }
        };
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('live')) {
        window.broadcastVideoIntegration = new BroadcastVideoIntegration();
        console.log('🎬 Broadcast Video Integration initialized');
        console.log('Use window.generateVideoForCurrentStory() to manually trigger video generation');
    }
});

// Export
window.BroadcastVideoIntegration = BroadcastVideoIntegration;