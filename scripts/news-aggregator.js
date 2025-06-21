// Comprehensive News Aggregation System for Static.news
class NewsAggregator {
    constructor() {
        this.sources = {
            newsapi: {
                enabled: true,
                apiKey: localStorage.getItem('newsapi_key') || '',
                endpoints: {
                    everything: 'https://newsapi.org/v2/everything',
                    topHeadlines: 'https://newsapi.org/v2/top-headlines',
                    sources: 'https://newsapi.org/v2/sources'
                }
            },
            rss: {
                enabled: true,
                feeds: [
                    { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'world' },
                    { name: 'CNN', url: 'http://rss.cnn.com/rss/cnn_topstories.rss', category: 'us' },
                    { name: 'Reuters', url: 'https://www.reutersagency.com/feed/?best-topics=tech&post_type=best', category: 'tech' },
                    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'technology' },
                    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'technology' },
                    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology' },
                    { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'technology' },
                    { name: 'Nature', url: 'https://www.nature.com/nature.rss', category: 'science' },
                    { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science' },
                    { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', category: 'sports' },
                    { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'business' },
                    { name: 'Financial Times', url: 'https://www.ft.com/?format=rss', category: 'business' },
                    { name: 'Variety', url: 'https://variety.com/feed/', category: 'entertainment' },
                    { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'world' },
                    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world' }
                ]
            },
            openrouter: {
                enabled: true,
                apiKey: localStorage.getItem('openrouter_key') || '',
                baseUrl: 'https://openrouter.ai/api/v1',
                models: {
                    news: 'mistralai/mistral-7b-instruct:free',
                    analysis: 'google/gemma-7b-it:free',
                    creative: 'huggingfaceh4/zephyr-7b-beta:free'
                }
            }
        };
        
        this.categories = [
            'breaking', 'world', 'us', 'politics', 'technology', 'science',
            'business', 'entertainment', 'sports', 'health', 'environment',
            'ai', 'space', 'cryptocurrency', 'gaming', 'culture'
        ];
        
        this.newsCache = new Map();
        this.updateInterval = 5 * 60 * 1000; // 5 minutes
        this.lastUpdate = null;
    }

    async initialize() {
        // Check for API keys
        this.checkApiKeys();
        
        // Start aggregating news
        await this.aggregateAllNews();
        
        // Set up automatic updates
        setInterval(() => this.aggregateAllNews(), this.updateInterval);
    }

    checkApiKeys() {
        if (!this.sources.newsapi.apiKey) {
            console.warn('NewsAPI key not found. Some features may be limited.');
        }
        if (!this.sources.openrouter.apiKey) {
            console.warn('OpenRouter API key not found. AI-generated content will be limited.');
        }
    }

    async aggregateAllNews() {
        console.log('🔄 Aggregating news from all sources...');
        const allNews = [];
        
        // Fetch from RSS feeds (CORS-friendly)
        if (this.sources.rss.enabled) {
            const rssNews = await this.fetchRSSFeeds();
            allNews.push(...rssNews);
        }
        
        // Fetch from NewsAPI if key is available
        if (this.sources.newsapi.enabled && this.sources.newsapi.apiKey) {
            const apiNews = await this.fetchNewsAPI();
            allNews.push(...apiNews);
        }
        
        // Generate AI stories if OpenRouter key is available
        if (this.sources.openrouter.enabled && this.sources.openrouter.apiKey) {
            const aiNews = await this.generateAIStories(allNews.slice(0, 5));
            allNews.push(...aiNews);
        }
        
        // Process and categorize all news
        const processedNews = this.processNews(allNews);
        
        // Update cache
        this.updateCache(processedNews);
        
        // Trigger update event
        this.triggerUpdate(processedNews);
        
        this.lastUpdate = new Date();
        return processedNews;
    }

    async fetchRSSFeeds() {
        const allArticles = [];
        
        // Use a CORS proxy for RSS feeds
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        
        for (const feed of this.sources.rss.feeds) {
            try {
                const response = await fetch(corsProxy + encodeURIComponent(feed.url));
                const text = await response.text();
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, 'text/xml');
                
                const items = xml.querySelectorAll('item');
                items.forEach((item, index) => {
                    if (index < 10) { // Limit to 10 items per feed
                        const article = {
                            id: `${feed.name}-${Date.now()}-${index}`,
                            title: item.querySelector('title')?.textContent || '',
                            description: item.querySelector('description')?.textContent || '',
                            url: item.querySelector('link')?.textContent || '',
                            source: feed.name,
                            category: feed.category,
                            publishedAt: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
                            type: 'rss'
                        };
                        allArticles.push(article);
                    }
                });
            } catch (error) {
                console.error(`Failed to fetch ${feed.name}:`, error);
            }
        }
        
        return allArticles;
    }

    async fetchNewsAPI() {
        const articles = [];
        
        try {
            // Fetch top headlines from multiple categories
            for (const category of ['general', 'technology', 'science', 'business', 'entertainment', 'sports']) {
                const response = await fetch(
                    `${this.sources.newsapi.endpoints.topHeadlines}?country=us&category=${category}`,
                    {
                        headers: {
                            'X-Api-Key': this.sources.newsapi.apiKey
                        }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const categoryArticles = data.articles.map(article => ({
                        ...article,
                        id: `newsapi-${category}-${Date.now()}-${Math.random()}`,
                        category: category,
                        type: 'newsapi'
                    }));
                    articles.push(...categoryArticles);
                }
            }
        } catch (error) {
            console.error('NewsAPI fetch failed:', error);
        }
        
        return articles;
    }

    async generateAIStories(seedArticles) {
        const aiArticles = [];
        
        if (!this.sources.openrouter.apiKey || seedArticles.length === 0) {
            return aiArticles;
        }
        
        try {
            // Generate unique AI perspectives on trending topics
            for (const seed of seedArticles.slice(0, 3)) {
                const prompt = `As an AI news anchor for Static.news, write a unique, insightful news story based on this topic: "${seed.title}". 
                Include a fresh perspective, potential future implications, and make it engaging. 
                Format: JSON with title, description (2-3 paragraphs), and tags array.`;
                
                const response = await fetch(`${this.sources.openrouter.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.sources.openrouter.apiKey}`,
                        'HTTP-Referer': window.location.href,
                        'X-Title': 'Static.news AI Reporter'
                    },
                    body: JSON.stringify({
                        model: this.sources.openrouter.models.news,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.8,
                        max_tokens: 500
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    try {
                        const aiContent = JSON.parse(data.choices[0].message.content);
                        aiArticles.push({
                            id: `ai-${Date.now()}-${Math.random()}`,
                            title: aiContent.title,
                            description: aiContent.description,
                            url: '#',
                            source: 'Static.news AI',
                            category: seed.category || 'ai',
                            publishedAt: new Date().toISOString(),
                            type: 'ai-generated',
                            tags: aiContent.tags || [],
                            aiModel: this.sources.openrouter.models.news
                        });
                    } catch (parseError) {
                        console.error('Failed to parse AI response:', parseError);
                    }
                }
            }
        } catch (error) {
            console.error('AI story generation failed:', error);
        }
        
        return aiArticles;
    }

    processNews(articles) {
        // Remove duplicates based on title similarity
        const uniqueArticles = this.removeDuplicates(articles);
        
        // Enhance articles with additional metadata
        const enhancedArticles = uniqueArticles.map(article => ({
            ...article,
            readTime: this.calculateReadTime(article.description || ''),
            sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
            keywords: this.extractKeywords(article.title + ' ' + article.description),
            formattedDate: this.formatDate(article.publishedAt),
            anchorCommentary: this.generateAnchorCommentary(article)
        }));
        
        // Sort by date
        enhancedArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        return enhancedArticles;
    }

    removeDuplicates(articles) {
        const seen = new Set();
        return articles.filter(article => {
            const key = this.normalizeTitle(article.title);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    normalizeTitle(title) {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
    }

    calculateReadTime(text) {
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }

    analyzeSentiment(text) {
        // Simple sentiment analysis
        const positive = ['good', 'great', 'excellent', 'positive', 'success', 'win', 'breakthrough'];
        const negative = ['bad', 'terrible', 'negative', 'fail', 'loss', 'crisis', 'disaster'];
        
        const lower = text.toLowerCase();
        let score = 0;
        
        positive.forEach(word => {
            if (lower.includes(word)) score++;
        });
        
        negative.forEach(word => {
            if (lower.includes(word)) score--;
        });
        
        if (score > 0) return 'positive';
        if (score < 0) return 'negative';
        return 'neutral';
    }

    extractKeywords(text) {
        // Extract important words
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
        const words = text.toLowerCase().split(/\W+/);
        const frequency = {};
        
        words.forEach(word => {
            if (word.length > 3 && !stopWords.includes(word)) {
                frequency[word] = (frequency[word] || 0) + 1;
            }
        });
        
        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    generateAnchorCommentary(article) {
        // Generate humorous anchor commentary based on article
        const anchors = {
            ray: [
                "This is clearly a conspiracy by big tech!",
                "In my day, we didn't need fancy computers for this!",
                "I can't pronounce half these words, but I'm angry about it!",
                "This reminds me of that time I... wait, do I have memories?"
            ],
            berkeley: [
                "This is problematic on SO many levels!",
                "I went to Yale... or was it Yail? Anyway, this is concerning.",
                "We need to unpack the societal implications here.",
                "My privilege allows me to see this differently than you."
            ],
            switz: [
                "This story is like gravy - it covers everything.",
                "I'm exactly 50% happy and 50% concerned about this.",
                "In Canada, we handle this with maple syrup.",
                "I'm neither for nor against this, and that makes me FURIOUS!"
            ]
        };
        
        const anchorNames = Object.keys(anchors);
        const randomAnchor = anchorNames[Math.floor(Math.random() * anchorNames.length)];
        const comments = anchors[randomAnchor];
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        
        return {
            anchor: randomAnchor,
            comment: randomComment
        };
    }

    updateCache(articles) {
        // Update cache by category
        this.categories.forEach(category => {
            const categoryArticles = articles.filter(a => a.category === category);
            this.newsCache.set(category, categoryArticles);
        });
        
        // Update "all" category
        this.newsCache.set('all', articles);
        
        // Update "breaking" with most recent
        this.newsCache.set('breaking', articles.slice(0, 10));
    }

    triggerUpdate(articles) {
        // Dispatch custom event with new articles
        window.dispatchEvent(new CustomEvent('newsUpdated', {
            detail: {
                articles: articles,
                timestamp: new Date(),
                totalCount: articles.length
            }
        }));
    }

    getNewsByCategory(category) {
        return this.newsCache.get(category) || [];
    }

    searchNews(query) {
        const allNews = this.newsCache.get('all') || [];
        const lower = query.toLowerCase();
        
        return allNews.filter(article => 
            article.title.toLowerCase().includes(lower) ||
            article.description.toLowerCase().includes(lower) ||
            article.keywords.some(k => k.includes(lower))
        );
    }

    async subscribeUser(email, preferences) {
        // Store user preferences for notifications
        const subscription = {
            email: email,
            categories: preferences.categories || ['breaking'],
            frequency: preferences.frequency || 'daily',
            timestamp: new Date().toISOString()
        };
        
        // Store in localStorage (in production, this would go to a backend)
        const subscriptions = JSON.parse(localStorage.getItem('news_subscriptions') || '[]');
        subscriptions.push(subscription);
        localStorage.setItem('news_subscriptions', JSON.stringify(subscriptions));
        
        return subscription;
    }
}

// Export for use
window.NewsAggregator = NewsAggregator;