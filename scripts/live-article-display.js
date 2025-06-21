// Live Article Display System - Shows what anchors are discussing in real-time
class LiveArticleDisplay {
    constructor() {
        this.currentArticle = null;
        this.highlightedText = [];
        this.displayContainer = null;
        this.isConnected = false;
    }

    init() {
        // Create the article display UI
        this.createArticleDisplay();
        
        // Listen for broadcast updates
        window.addEventListener('broadcastUpdate', (event) => {
            this.handleBroadcastUpdate(event.detail);
        });
        
        // Connect to WebSocket for real-time updates
        this.connectWebSocket();
    }

    createArticleDisplay() {
        // Find the broadcast media container
        const mediaContainer = document.getElementById('broadcast-media-container');
        if (!mediaContainer) {
            console.warn('Broadcast media container not found');
            return;
        }
        
        this.displayContainer = document.createElement('div');
        this.displayContainer.id = 'live-article-display';
        this.displayContainer.className = 'live-article-display';
        
        // Initial HTML structure
        this.displayContainer.innerHTML = `
            <div class="article-display-header">
                <h3>📰 Currently Discussing</h3>
                <div class="article-status">
                    <span class="status-indicator">●</span>
                    <span class="status-text">Waiting for broadcast...</span>
                </div>
            </div>
            <div class="article-display-content">
                <div class="article-title"></div>
                <div class="article-source"></div>
                <div class="article-text"></div>
                <div class="article-highlights"></div>
            </div>
            <div class="anchor-reaction">
                <div class="reaction-anchor"></div>
                <div class="reaction-text"></div>
            </div>
        `;
        
        // Append to media container
        mediaContainer.appendChild(this.displayContainer);
        
        // Add styles
        this.injectStyles();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .live-article-display {
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid var(--static-red);
                border-radius: 15px;
                padding: 1.5rem;
                margin-top: 2rem;
                position: relative;
                overflow: hidden;
            }
            
            .article-display-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid rgba(255, 0, 0, 0.3);
            }
            
            .article-display-header h3 {
                margin: 0;
                color: var(--static-red);
                font-family: 'Bebas Neue', sans-serif;
                font-size: 1.5rem;
                letter-spacing: 0.1em;
            }
            
            .article-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .status-indicator {
                color: #00ff00;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .article-display-content {
                min-height: 200px;
            }
            
            .article-title {
                font-size: 1.3rem;
                font-weight: 700;
                color: #fff;
                margin-bottom: 0.5rem;
                line-height: 1.3;
            }
            
            .article-source {
                font-size: 0.9rem;
                color: var(--static-red);
                margin-bottom: 1rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .article-text {
                font-size: 1rem;
                line-height: 1.6;
                color: #ccc;
                margin-bottom: 1rem;
            }
            
            .article-text .highlighted {
                background: rgba(255, 0, 0, 0.3);
                padding: 2px 4px;
                border-radius: 3px;
                animation: highlight-pulse 1s ease-in-out;
            }
            
            @keyframes highlight-pulse {
                0% { background: rgba(255, 0, 0, 0); }
                50% { background: rgba(255, 0, 0, 0.5); }
                100% { background: rgba(255, 0, 0, 0.3); }
            }
            
            .anchor-reaction {
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid rgba(255, 0, 0, 0.3);
            }
            
            .reaction-anchor {
                font-weight: 700;
                color: var(--static-red);
                text-transform: uppercase;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }
            
            .reaction-text {
                font-style: italic;
                color: #aaa;
                font-size: 0.95rem;
            }
            
            .article-display.freakout {
                animation: freakout-shake 0.5s ease-in-out;
                border-color: #ff0000;
                box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
            }
            
            @keyframes freakout-shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px) rotate(-1deg); }
                75% { transform: translateX(10px) rotate(1deg); }
            }
            
            .media-container {
                margin: 1rem 0;
                border-radius: 10px;
                overflow: hidden;
            }
            
            .media-container img,
            .media-container video {
                width: 100%;
                height: auto;
                display: block;
            }
            
            .related-links {
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid rgba(255, 0, 0, 0.2);
            }
            
            .related-links h4 {
                font-size: 0.9rem;
                color: var(--static-red);
                margin-bottom: 0.5rem;
                text-transform: uppercase;
            }
            
            .related-links a {
                display: block;
                color: #aaa;
                text-decoration: none;
                padding: 0.3rem 0;
                font-size: 0.9rem;
                transition: color 0.3s ease;
            }
            
            .related-links a:hover {
                color: var(--static-red);
            }
        `;
        
        document.head.appendChild(style);
    }

    connectWebSocket() {
        const wsUrl = 'wss://alledged-static-news-backend.hf.space/ws';
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('📡 Connected to article feed');
                this.updateStatus('Connected', true);
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleBroadcastUpdate(data);
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };
            
            this.ws.onclose = () => {
                console.log('📡 Disconnected from article feed');
                this.updateStatus('Reconnecting...', false);
                // Reconnect after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }

    handleBroadcastUpdate(data) {
        if (data.article) {
            this.displayArticle(data.article);
        }
        
        if (data.text && data.anchor) {
            this.updateAnchorReaction(data.anchor, data.text);
        }
        
        if (data.is_freakout) {
            this.triggerFreakoutEffect();
        }
        
        if (data.segment) {
            this.updateSegmentInfo(data.segment);
        }
    }

    displayArticle(article) {
        this.currentArticle = article;
        
        const titleEl = this.displayContainer.querySelector('.article-title');
        const sourceEl = this.displayContainer.querySelector('.article-source');
        const textEl = this.displayContainer.querySelector('.article-text');
        
        // Update article content
        titleEl.textContent = article.title || 'Breaking News';
        sourceEl.textContent = `SOURCE: ${article.source || 'Unknown'} | ${article.category || 'General'}`;
        
        // Display article text with potential for highlighting
        const description = article.description || article.content || '';
        textEl.innerHTML = this.formatArticleText(description);
        
        // Load media if available
        if (article.media) {
            this.loadArticleMedia(article.media);
        }
        
        // Add related links if available
        if (article.links) {
            this.displayRelatedLinks(article.links);
        }
        
        // Animate the update
        gsap.from(this.displayContainer.querySelector('.article-display-content'), {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: 'power2.out'
        });
    }

    formatArticleText(text) {
        // Truncate if too long
        let displayText = text.length > 300 ? text.substring(0, 300) + '...' : text;
        
        // Highlight random phrases to simulate anchor focus
        const words = displayText.split(' ');
        const highlightCount = Math.min(3, Math.floor(words.length / 20));
        
        for (let i = 0; i < highlightCount; i++) {
            const randomIndex = Math.floor(Math.random() * (words.length - 3));
            const phraseLength = Math.floor(Math.random() * 3) + 2;
            
            for (let j = 0; j < phraseLength && randomIndex + j < words.length; j++) {
                words[randomIndex + j] = `<span class="highlighted">${words[randomIndex + j]}</span>`;
            }
        }
        
        return words.join(' ');
    }

    updateAnchorReaction(anchor, text) {
        const anchorEl = this.displayContainer.querySelector('.reaction-anchor');
        const textEl = this.displayContainer.querySelector('.reaction-text');
        
        // Get anchor info
        const anchorNames = {
            'ray': 'RAY MCPATRIOT',
            'berkeley': 'BERKELEY JUSTICE',
            'switz': 'SWITZ MIDDLETON'
        };
        
        anchorEl.textContent = `${anchorNames[anchor] || anchor.toUpperCase()} SAYS:`;
        
        // Show a snippet of what they're saying
        const snippet = text.length > 150 ? text.substring(0, 150) + '...' : text;
        textEl.textContent = `"${snippet}"`;
        
        // Add anchor-specific styling
        anchorEl.className = `reaction-anchor anchor-${anchor}`;
    }

    triggerFreakoutEffect() {
        this.displayContainer.classList.add('freakout');
        
        // Add glitch effect to text
        const textElements = this.displayContainer.querySelectorAll('.article-text, .article-title');
        textElements.forEach(el => {
            el.style.animation = 'glitch 0.3s ease-in-out';
        });
        
        setTimeout(() => {
            this.displayContainer.classList.remove('freakout');
            textElements.forEach(el => {
                el.style.animation = '';
            });
        }, 5000);
    }

    updateSegmentInfo(segment) {
        const header = this.displayContainer.querySelector('.article-display-header h3');
        header.innerHTML = `📰 ${segment} - Currently Discussing`;
    }

    updateStatus(text, isConnected) {
        const statusText = this.displayContainer.querySelector('.status-text');
        const statusIndicator = this.displayContainer.querySelector('.status-indicator');
        
        statusText.textContent = text;
        statusIndicator.style.color = isConnected ? '#00ff00' : '#ff0000';
        this.isConnected = isConnected;
    }

    loadArticleMedia(mediaUrl) {
        // Create media container
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';
        
        // Determine media type
        if (mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
            const img = document.createElement('img');
            img.src = mediaUrl;
            img.alt = 'Article image';
            mediaContainer.appendChild(img);
        } else if (mediaUrl.match(/\.(mp4|webm)$/i)) {
            const video = document.createElement('video');
            video.src = mediaUrl;
            video.controls = true;
            video.muted = true;
            video.autoplay = true;
            mediaContainer.appendChild(video);
        }
        
        // Insert after article text
        const textEl = this.displayContainer.querySelector('.article-text');
        textEl.parentNode.insertBefore(mediaContainer, textEl.nextSibling);
    }

    displayRelatedLinks(links) {
        const container = document.createElement('div');
        container.className = 'related-links';
        container.innerHTML = '<h4>Related Stories</h4>';
        
        links.slice(0, 3).forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.title;
            a.target = '_blank';
            container.appendChild(a);
        });
        
        const contentEl = this.displayContainer.querySelector('.article-display-content');
        contentEl.appendChild(container);
    }
}

// Auto-initialize on live page
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('live')) {
        window.liveArticleDisplay = new LiveArticleDisplay();
        window.liveArticleDisplay.init();
    }
});

// Export
window.LiveArticleDisplay = LiveArticleDisplay;