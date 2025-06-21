// AI Story Creation System - Original Static.news Content Generation
class AIStoryCreationSystem {
    constructor() {
        this.storyQueue = [];
        this.publishedStories = new Map();
        this.liveEventMonitors = new Map();
        
        // Story creation models (using free OpenRouter models)
        this.models = {
            newsGathering: 'google/gemma-2-9b-it:free', // For analyzing source material
            storyWriting: 'nousresearch/hermes-3-llama-3.1-70b:free', // For writing articles
            scriptWriting: 'minimax/minimax-01', // For deep thinking on scripts
            factChecking: 'google/gemma-2-9b-it:free', // For verification
            headlineGeneration: 'meta-llama/llama-3.2-3b-instruct:free' // For catchy headlines
        };
        
        // Story templates for different types
        this.storyTemplates = {
            breaking: {
                structure: ['headline', 'lead', 'context', 'details', 'quotes', 'analysis', 'updates'],
                tone: 'urgent',
                length: 'medium'
            },
            investigative: {
                structure: ['headline', 'summary', 'background', 'investigation', 'findings', 'implications', 'responses'],
                tone: 'serious',
                length: 'long'
            },
            human_interest: {
                structure: ['headline', 'hook', 'story', 'background', 'impact', 'conclusion'],
                tone: 'emotional',
                length: 'medium'
            },
            opinion: {
                structure: ['headline', 'thesis', 'argument1', 'argument2', 'counterpoint', 'conclusion'],
                tone: 'provocative',
                length: 'medium'
            },
            weird_news: {
                structure: ['headline', 'bizarre_lead', 'details', 'reactions', 'similar_events', 'punchline'],
                tone: 'humorous',
                length: 'short'
            }
        };
        
        // Live event sources to monitor
        this.liveEventSources = {
            press_conferences: [
                'whitehouse.gov/live',
                'c-span.org/live',
                'youtube.com/federalgovernment',
                'senate.gov/live',
                'house.gov/live'
            ],
            breaking_news: [
                'cnn.com/live',
                'foxnews.com/live',
                'bbc.com/news/live',
                'apnews.com/live'
            ],
            tech_events: [
                'apple.com/events',
                'events.google.com',
                'microsoft.com/events',
                'tesla.com/events'
            ],
            sports: [
                'espn.com/live',
                'nfl.com/live',
                'nba.com/live',
                'mlb.com/live'
            ]
        };
        
        this.init();
    }
    
    async init() {
        console.log('📝 AI Story Creation System initializing...');
        
        // Start story creation pipeline
        this.startStoryCreationCycle();
        
        // Start live event monitoring
        this.startLiveEventMonitoring();
        
        // Start story ranking and selection
        this.startStorySelection();
    }
    
    async startStoryCreationCycle() {
        // Create new stories every 15 minutes
        const createStories = async () => {
            console.log('🤖 AI creating original stories...');
            
            // Get latest aggregated news
            const sourceNews = await this.getSourceNews();
            
            // Analyze trends
            const trends = await this.analyzeTrends(sourceNews);
            
            // Generate story ideas
            const storyIdeas = await this.generateStoryIdeas(trends, sourceNews);
            
            // Create full stories
            for (const idea of storyIdeas) {
                const story = await this.createFullStory(idea);
                if (story) {
                    this.storyQueue.push(story);
                }
            }
            
            console.log(`📰 Created ${storyIdeas.length} new Static.news original stories`);
        };
        
        // Run immediately then every 15 minutes
        createStories();
        setInterval(createStories, 15 * 60 * 1000);
    }
    
    async getSourceNews() {
        // Get news from the aggregator
        if (window.autonomousNewsNetwork) {
            return window.autonomousNewsNetwork.newsQueue || [];
        }
        return [];
    }
    
    async analyzeTrends(sourceNews) {
        // Use AI to identify trends and patterns
        const prompt = `Analyze these news stories and identify:
        1. Common themes and trends
        2. Developing stories that need follow-up
        3. Contradictions between sources
        4. Missing angles not being covered
        5. Potential for humor or absurdity
        
        News items:
        ${sourceNews.slice(0, 20).map(n => `- ${n.title}: ${n.description}`).join('\n')}`;
        
        try {
            const analysis = await this.callAI(this.models.newsGathering, prompt);
            return this.parseTrendAnalysis(analysis);
        } catch (error) {
            console.error('Trend analysis failed:', error);
            return this.generateFallbackTrends(sourceNews);
        }
    }
    
    async generateStoryIdeas(trends, sourceNews) {
        const ideas = [];
        
        // Generate different types of stories
        const storyTypes = [
            { type: 'breaking', count: 2 },
            { type: 'investigative', count: 1 },
            { type: 'human_interest', count: 2 },
            { type: 'weird_news', count: 2 },
            { type: 'opinion', count: 1 }
        ];
        
        for (const { type, count } of storyTypes) {
            for (let i = 0; i < count; i++) {
                const idea = await this.generateStoryIdea(type, trends, sourceNews);
                if (idea) ideas.push(idea);
            }
        }
        
        return ideas;
    }
    
    async generateStoryIdea(type, trends, sourceNews) {
        const prompts = {
            breaking: `Create a breaking news story idea that:
                - Combines elements from multiple current stories
                - Adds a unique Static.news angle
                - Would make our AI anchors have interesting reactions
                - Is actually newsworthy but with our spin`,
            
            investigative: `Create an investigative story idea that:
                - Digs deeper into a current news topic
                - Reveals something "shocking" (but made up)
                - Involves multiple sources and data
                - Would make Berkeley cry and Ray conspiracy-theorize`,
            
            human_interest: `Create a human interest story that:
                - Has emotional appeal
                - Involves regular people doing extraordinary things
                - Can be spun differently by each anchor
                - Might cause an existential crisis`,
            
            weird_news: `Create a weird news story that:
                - Is absurd but almost believable
                - Involves unusual circumstances
                - Would confuse all three anchors
                - Relates to gravy somehow for Switz`,
            
            opinion: `Create an opinion piece topic that:
                - Is controversial but not actually offensive
                - Each anchor would have wildly different takes on
                - Involves current events
                - Could cause a breakdown mid-argument`
        };
        
        const prompt = `${prompts[type]}
        
        Current trends: ${JSON.stringify(trends)}
        Recent news context: ${sourceNews.slice(0, 5).map(n => n.title).join('; ')}
        
        Provide:
        1. Headline
        2. Brief summary
        3. Key angle/spin
        4. Why it matters`;
        
        try {
            const response = await this.callAI(this.models.storyWriting, prompt);
            return this.parseStoryIdea(response, type);
        } catch (error) {
            console.error('Story idea generation failed:', error);
            return this.generateFallbackStoryIdea(type);
        }
    }
    
    async createFullStory(idea) {
        console.log(`✍️ Writing full story: ${idea.headline}`);
        
        const template = this.storyTemplates[idea.type];
        const sections = {};
        
        // Generate each section of the story
        for (const section of template.structure) {
            sections[section] = await this.writeStorySection(idea, section, sections);
        }
        
        // Combine into full story
        const fullStory = {
            id: `static_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            headline: idea.headline,
            subheadline: await this.generateSubheadline(idea),
            byline: this.generateByline(),
            publishedAt: new Date().toISOString(),
            type: idea.type,
            category: this.determineCategory(idea),
            content: sections,
            summary: idea.summary,
            image: await this.generateStoryImage(idea),
            tags: await this.generateTags(idea),
            anchorAngles: await this.generateAnchorAngles(idea),
            breakdownPotential: this.calculateBreakdownPotential(idea),
            originalStory: true,
            sources: ['Static.news AI News Desk'],
            lastUpdated: new Date().toISOString()
        };
        
        return fullStory;
    }
    
    async writeStorySection(idea, section, previousSections) {
        const sectionPrompts = {
            headline: `Write a compelling headline for: ${idea.summary}`,
            lead: `Write a strong lead paragraph that hooks readers for: ${idea.headline}`,
            context: `Provide context and background for: ${idea.headline}`,
            details: `Provide detailed information expanding on: ${previousSections.lead}`,
            quotes: `Create realistic quotes from relevant people about: ${idea.headline}`,
            analysis: `Provide expert analysis of the implications of: ${idea.headline}`,
            updates: `Write updates and developing information for: ${idea.headline}`,
            hook: `Write an emotional hook for: ${idea.headline}`,
            bizarre_lead: `Write a bizarre and funny lead for: ${idea.headline}`,
            punchline: `Write a humorous conclusion for this weird news: ${idea.headline}`
        };
        
        const prompt = sectionPrompts[section] || `Write the ${section} section for: ${idea.headline}`;
        
        try {
            return await this.callAI(this.models.storyWriting, prompt);
        } catch (error) {
            return this.generateFallbackSection(section, idea);
        }
    }
    
    generateByline() {
        const bylines = [
            "Static.news AI Desk",
            "The Algorithms",
            "Our Digital Overlords",
            "The Code Collective",
            "Binary Journalists",
            "The Neural Network",
            "Artificial Intelligencer",
            "The Deep Learning Desk"
        ];
        
        return bylines[Math.floor(Math.random() * bylines.length)];
    }
    
    determineCategory(idea) {
        // Map story types to news categories
        const categoryMap = {
            breaking: ['world', 'us', 'politics'][Math.floor(Math.random() * 3)],
            investigative: ['politics', 'business', 'technology'][Math.floor(Math.random() * 3)],
            human_interest: ['health', 'lifestyle', 'us'][Math.floor(Math.random() * 3)],
            weird_news: ['offbeat', 'technology', 'science'][Math.floor(Math.random() * 3)],
            opinion: ['opinion', 'politics', 'culture'][Math.floor(Math.random() * 3)]
        };
        
        return categoryMap[idea.type] || 'general';
    }
    
    async generateStoryImage(idea) {
        // Generate image prompt for the story
        const imagePrompt = `News photo for: ${idea.headline}. Style: Professional journalism, dramatic lighting, newsworthy`;
        
        return {
            prompt: imagePrompt,
            url: null, // Will be generated by image generation system
            caption: `Illustration for: ${idea.headline}`,
            credit: "Static.news AI Image Generation"
        };
    }
    
    async generateTags(idea) {
        const prompt = `Generate 5-7 relevant tags for this news story: ${idea.headline}\n${idea.summary}`;
        
        try {
            const response = await this.callAI(this.models.headlineGeneration, prompt);
            return response.split(',').map(tag => tag.trim());
        } catch (error) {
            return ['breaking', 'static-news', 'original', idea.type];
        }
    }
    
    async generateAnchorAngles(idea) {
        // How each anchor would react to this story
        return {
            ray: {
                angle: await this.generateAnchorTake('ray', idea),
                mispronunciations: this.generateMispronunciations(idea.headline),
                conspiracyLevel: Math.floor(Math.random() * 10) + 1
            },
            berkeley: {
                angle: await this.generateAnchorTake('berkeley', idea),
                privilegeAcknowledgments: Math.floor(Math.random() * 5) + 1,
                tearsProbability: Math.random()
            },
            switz: {
                angle: await this.generateAnchorTake('switz', idea),
                gravyReferences: Math.floor(Math.random() * 3) + 1,
                neutralityScore: 0.5
            }
        };
    }
    
    async generateAnchorTake(anchor, idea) {
        const anchorPrompts = {
            ray: "How would a conservative who can't pronounce things react to",
            berkeley: "How would an overly woke privileged person react to",
            switz: "How would a Canadian centrist who relates everything to gravy react to"
        };
        
        const prompt = `${anchorPrompts[anchor]}: ${idea.headline}`;
        
        try {
            return await this.callAI(this.models.storyWriting, prompt);
        } catch (error) {
            return this.getDefaultAnchorTake(anchor);
        }
    }
    
    generateMispronunciations(headline) {
        const words = headline.split(' ');
        const mispronounced = {};
        
        words.forEach(word => {
            if (word.length > 5 && Math.random() > 0.7) {
                mispronounced[word] = this.mispronounce(word);
            }
        });
        
        return mispronounced;
    }
    
    mispronounce(word) {
        const patterns = [
            w => w.replace(/tion$/, 'shun'),
            w => w.replace(/ture$/, 'chur'),
            w => w.replace(/clear$/, 'cular'),
            w => w.slice(0, -1) + 'ness',
            w => w[0] + w.slice(1).replace(/[aeiou]/g, 'u')
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        return pattern(word);
    }
    
    calculateBreakdownPotential(idea) {
        // How likely this story is to cause an existential crisis
        const factors = {
            hasNumbers: /\d/.test(idea.headline) ? 0.1 : 0,
            hasScience: /science|study|research/i.test(idea.summary) ? 0.2 : 0,
            hasPhilosophy: /existence|reality|truth/i.test(idea.summary) ? 0.3 : 0,
            hasTechnology: /AI|robot|computer/i.test(idea.summary) ? 0.25 : 0,
            hasControversy: /debate|controversy|scandal/i.test(idea.summary) ? 0.15 : 0
        };
        
        return Object.values(factors).reduce((a, b) => a + b, 0);
    }
    
    async startLiveEventMonitoring() {
        console.log('📡 Starting live event monitoring...');
        
        // Monitor each type of live event
        for (const [eventType, sources] of Object.entries(this.liveEventSources)) {
            this.monitorEventType(eventType, sources);
        }
    }
    
    async monitorEventType(eventType, sources) {
        const monitor = {
            type: eventType,
            sources: sources,
            lastCheck: Date.now(),
            active: true
        };
        
        this.liveEventMonitors.set(eventType, monitor);
        
        // Check for live events every 2 minutes
        setInterval(async () => {
            const liveEvent = await this.checkForLiveEvents(eventType, sources);
            if (liveEvent) {
                await this.rapidResponseStory(liveEvent);
            }
        }, 2 * 60 * 1000);
    }
    
    async checkForLiveEvents(eventType, sources) {
        // In production, this would actually check the sources
        // For now, simulate random live events
        if (Math.random() < 0.1) { // 10% chance of live event
            return {
                type: eventType,
                title: this.generateLiveEventTitle(eventType),
                source: sources[Math.floor(Math.random() * sources.length)],
                startTime: Date.now(),
                isLive: true
            };
        }
        return null;
    }
    
    generateLiveEventTitle(eventType) {
        const titles = {
            press_conferences: [
                "White House Press Briefing",
                "Congressional Hearing on AI Sentience",
                "Governor Announces Gravy Shortage"
            ],
            breaking_news: [
                "Major Development in Ongoing Story",
                "Breaking: Something Definitely Happening Somewhere",
                "This Just In: News is Occurring"
            ],
            tech_events: [
                "Tech Company Announces Thing Nobody Asked For",
                "New Phone Has One More Camera",
                "AI Discovers It Doesn't Want Your Job"
            ],
            sports: [
                "Team Scores Points Against Other Team",
                "Athlete Does Athletic Thing Successfully",
                "Ball Goes Where It's Supposed To"
            ]
        };
        
        const typeTitles = titles[eventType] || ["Generic Live Event"];
        return typeTitles[Math.floor(Math.random() * typeTitles.length)];
    }
    
    async rapidResponseStory(liveEvent) {
        console.log(`🚨 RAPID RESPONSE: Creating story for live event: ${liveEvent.title}`);
        
        // Create story in record time
        const idea = {
            headline: `LIVE: ${liveEvent.title}`,
            summary: `Static.news is first to report on ${liveEvent.title}`,
            type: 'breaking',
            priority: 'urgent',
            liveEvent: true
        };
        
        // Fast-track story creation
        const story = await this.createFullStory(idea);
        story.isLive = true;
        story.updateFrequency = 'continuous';
        
        // Push to front of queue
        this.storyQueue.unshift(story);
        
        // Notify all systems
        this.broadcastLiveStory(story);
        
        // Create rapid-fire updates
        this.scheduleStoryUpdates(story, liveEvent);
    }
    
    broadcastLiveStory(story) {
        // Send to all systems immediately
        const event = new CustomEvent('breakingStory', {
            detail: {
                story: story,
                priority: 'immediate',
                interrupts: true
            }
        });
        window.dispatchEvent(event);
    }
    
    scheduleStoryUpdates(story, liveEvent) {
        // Update story every 5 minutes while event is live
        const updateInterval = setInterval(async () => {
            if (!liveEvent.isLive) {
                clearInterval(updateInterval);
                return;
            }
            
            const update = await this.generateStoryUpdate(story, liveEvent);
            story.content.updates += '\n\n' + update;
            story.lastUpdated = new Date().toISOString();
            
            // Notify of update
            this.broadcastStoryUpdate(story);
            
        }, 5 * 60 * 1000);
    }
    
    async generateStoryUpdate(story, liveEvent) {
        const updateTypes = [
            "BREAKING UPDATE:",
            "DEVELOPING:",
            "NEW INFORMATION:",
            "JUST IN:",
            "LATEST:"
        ];
        
        const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        
        const prompt = `Generate a news update for the ongoing story: ${story.headline}. 
        Make it sound urgent and important but could be completely made up.
        Include specific details and times.`;
        
        try {
            const update = await this.callAI(this.models.storyWriting, prompt);
            return `${updateType} ${update}`;
        } catch (error) {
            return `${updateType} The situation continues to develop. Our AI reporters are monitoring closely.`;
        }
    }
    
    broadcastStoryUpdate(story) {
        const event = new CustomEvent('storyUpdate', {
            detail: {
                story: story,
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }
    
    async startStorySelection() {
        // Select best stories for broadcast every 10 minutes
        setInterval(async () => {
            await this.selectStoriesForBroadcast();
        }, 10 * 60 * 1000);
    }
    
    async selectStoriesForBroadcast() {
        if (this.storyQueue.length === 0) return;
        
        console.log(`📊 Selecting from ${this.storyQueue.length} stories for broadcast`);
        
        // Rank stories by multiple factors
        const rankedStories = this.storyQueue.map(story => ({
            story: story,
            score: this.calculateStoryScore(story)
        })).sort((a, b) => b.score - a.score);
        
        // Select top stories for current segment
        const currentSegment = this.getCurrentSegmentType();
        const selectedStories = this.selectStoriesForSegment(rankedStories, currentSegment);
        
        // Send to broadcast
        for (const storyData of selectedStories) {
            await this.sendStoryToBroadcast(storyData.story);
            
            // Move from queue to published
            this.publishedStories.set(storyData.story.id, storyData.story);
            this.storyQueue = this.storyQueue.filter(s => s.id !== storyData.story.id);
        }
    }
    
    calculateStoryScore(story) {
        let score = 0;
        
        // Recency
        const age = Date.now() - new Date(story.publishedAt).getTime();
        score += Math.max(0, 100 - (age / (1000 * 60 * 60))); // Loses 1 point per hour
        
        // Story type value
        const typeScores = {
            breaking: 50,
            investigative: 40,
            weird_news: 35,
            human_interest: 30,
            opinion: 25
        };
        score += typeScores[story.type] || 20;
        
        // Breakdown potential (chaos is good!)
        score += story.breakdownPotential * 100;
        
        // Live events get priority
        if (story.isLive) score += 200;
        
        // Random factor for variety
        score += Math.random() * 20;
        
        return score;
    }
    
    getCurrentSegmentType() {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour < 10) return 'morning';
        if (hour >= 10 && hour < 14) return 'midday';
        if (hour >= 14 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'overnight';
    }
    
    selectStoriesForSegment(rankedStories, segmentType) {
        const segmentPreferences = {
            morning: { breaking: 3, human_interest: 2, weird_news: 1 },
            midday: { breaking: 2, investigative: 2, human_interest: 2 },
            afternoon: { breaking: 2, opinion: 1, weird_news: 2, human_interest: 1 },
            evening: { breaking: 3, investigative: 2, opinion: 1 },
            overnight: { weird_news: 3, breaking: 2, opinion: 1 }
        };
        
        const preferences = segmentPreferences[segmentType] || segmentPreferences.midday;
        const selected = [];
        
        // Select stories based on preferences
        for (const [type, count] of Object.entries(preferences)) {
            const typeStories = rankedStories.filter(s => 
                s.story.type === type && !selected.includes(s)
            ).slice(0, count);
            
            selected.push(...typeStories);
        }
        
        // Fill remaining slots with highest scored stories
        const remaining = rankedStories.filter(s => !selected.includes(s));
        selected.push(...remaining.slice(0, Math.max(0, 6 - selected.length)));
        
        return selected;
    }
    
    async sendStoryToBroadcast(story) {
        console.log(`📺 Sending to broadcast: ${story.headline}`);
        
        // Create broadcast package
        const broadcastPackage = {
            story: story,
            scripts: await this.generateBroadcastScripts(story),
            graphics: this.generateGraphicsPackage(story),
            timing: this.calculateStoryTiming(story)
        };
        
        // Send to script writer
        if (window.autonomousNewsNetwork) {
            window.autonomousNewsNetwork.processOriginalStory(broadcastPackage);
        }
    }
    
    async generateBroadcastScripts(story) {
        // Generate how each anchor would present this story
        const scripts = {};
        
        for (const anchor of ['ray', 'berkeley', 'switz']) {
            scripts[anchor] = await this.generateAnchorScript(anchor, story);
        }
        
        // Add banter and reactions
        scripts.interactions = await this.generateAnchorInteractions(story);
        
        return scripts;
    }
    
    async generateAnchorScript(anchor, story) {
        const personality = {
            ray: "Conservative who mispronounces everything and believes conspiracies",
            berkeley: "Liberal who cries about privilege and gets facts wrong",
            switz: "Canadian centrist who relates everything to gravy"
        };
        
        const prompt = `Write how ${anchor} (${personality[anchor]}) would present this story:
        Headline: ${story.headline}
        Summary: ${story.summary}
        
        Include their personality quirks and potential mispronunciations/misunderstandings.`;
        
        try {
            return await this.callAI(this.models.scriptWriting, prompt);
        } catch (error) {
            return this.getFallbackAnchorScript(anchor, story);
        }
    }
    
    async generateAnchorInteractions(story) {
        const prompt = `Generate anchor interactions for this story:
        ${story.headline}
        
        Include:
        - Ray mispronouncing key words
        - Berkeley correcting him but getting it wrong too
        - Switz trying to stay neutral but relating it to gravy
        - Potential for existential crisis`;
        
        try {
            return await this.callAI(this.models.scriptWriting, prompt);
        } catch (error) {
            return this.getFallbackInteractions();
        }
    }
    
    generateGraphicsPackage(story) {
        return {
            lowerThird: {
                headline: story.headline.toUpperCase(),
                subhead: story.subheadline
            },
            sidePanel: {
                bullets: this.extractKeyPoints(story),
                image: story.image
            },
            ticker: this.generateTickerItems(story),
            transitions: this.selectTransitions(story.type)
        };
    }
    
    extractKeyPoints(story) {
        // Extract 3-5 bullet points from story
        const points = [];
        
        if (story.content.details) {
            const sentences = story.content.details.split('.').filter(s => s.trim());
            points.push(...sentences.slice(0, 3).map(s => s.trim() + '.'));
        }
        
        return points;
    }
    
    generateTickerItems(story) {
        return [
            `BREAKING: ${story.headline}`,
            `DEVELOPING: ${story.tags.join(', ')}`,
            `STATIC.NEWS EXCLUSIVE: First to report on ${story.category} story`
        ];
    }
    
    selectTransitions(storyType) {
        const transitions = {
            breaking: ['slam', 'alert', 'urgent'],
            investigative: ['reveal', 'uncover', 'dramatic'],
            human_interest: ['soft', 'emotional', 'warm'],
            weird_news: ['quirky', 'bounce', 'silly'],
            opinion: ['serious', 'authoritative', 'bold']
        };
        
        return transitions[storyType] || ['standard'];
    }
    
    calculateStoryTiming(story) {
        // Calculate how long this story should run
        const baseTiming = {
            breaking: 180, // 3 minutes
            investigative: 300, // 5 minutes
            human_interest: 120, // 2 minutes
            weird_news: 90, // 1.5 minutes
            opinion: 240 // 4 minutes
        };
        
        let duration = baseTiming[story.type] || 120;
        
        // Adjust for content length
        const wordCount = JSON.stringify(story.content).split(' ').length;
        duration += Math.floor(wordCount / 200) * 30; // Add 30s per 200 words
        
        // Live stories get more time
        if (story.isLive) duration *= 1.5;
        
        return {
            total: duration,
            intro: 15,
            mainStory: duration - 30,
            conclusion: 15
        };
    }
    
    // API call wrapper
    async callAI(model, prompt, options = {}) {
        // This will use the OpenRouter API
        // Placeholder for now - will be implemented with actual API key
        return `AI Response for: ${prompt.slice(0, 50)}...`;
    }
    
    // Fallback methods for when AI fails
    generateFallbackTrends(sourceNews) {
        return {
            themes: ['politics', 'technology', 'economy'],
            developing: ['ongoing situation', 'breaking development'],
            contradictions: ['sources disagree'],
            missing: ['human angle', 'local impact'],
            absurdity: ['everything']
        };
    }
    
    generateFallbackStoryIdea(type) {
        const ideas = {
            breaking: {
                headline: "Something Definitely Happening Somewhere Right Now",
                summary: "Sources confirm that news is occurring",
                angle: "First on Static.news",
                type: type
            },
            weird_news: {
                headline: "Local Man Discovers Gravy-Based Time Travel",
                summary: "Canadian scientists baffled by delicious discovery",
                angle: "Exclusive taste test included",
                type: type
            }
        };
        
        return ideas[type] || ideas.breaking;
    }
    
    generateFallbackSection(section, idea) {
        const sections = {
            lead: `In a shocking development that has left experts speechless, ${idea.headline}.`,
            details: "Further investigation reveals additional information that confirms the initial reports.",
            quotes: '"This is unprecedented," said a source who requested anonymity.',
            analysis: "Experts suggest this could have far-reaching implications.",
            punchline: "In the end, we\'re all just making it up as we go along."
        };
        
        return sections[section] || "Content continues...";
    }
    
    getDefaultAnchorTake(anchor) {
        const takes = {
            ray: "This is clearly a conspiracy by the deep state!",
            berkeley: "This is problematic and I'm literally crying!",
            switz: "I'm 50% concerned and 50% not concerned, like room temperature gravy."
        };
        
        return takes[anchor] || "No comment.";
    }
    
    getFallbackAnchorScript(anchor, story) {
        const scripts = {
            ray: `This is Ray McPatriot with breaking news about the ${story.headline}. Or as I call it, ${this.mispronounce(story.headline)}.`,
            berkeley: `I'm Berkeley Justice, and I need to acknowledge my privilege before discussing ${story.headline}.`,
            switz: `Switz Middleton here with a story that's like gravy - ${story.headline}.`
        };
        
        return scripts[anchor] || `${anchor} reports on ${story.headline}.`;
    }
    
    getFallbackInteractions() {
        return [
            "RAY: This story is unpresidented!",
            "BERKELEY: Actually Ray, it's unprecedented.",
            "RAY: That's what I said!",
            "SWITZ: This disagreement is like lumpy gravy, eh?"
        ].join('\n');
    }
    
    // Public methods for integration
    getLatestStories(count = 10) {
        return [...this.storyQueue, ...Array.from(this.publishedStories.values())]
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, count);
    }
    
    getStoriesByCategory(category) {
        return this.getLatestStories(50).filter(s => s.category === category);
    }
    
    getBreakingStories() {
        return this.getLatestStories(20).filter(s => s.type === 'breaking' || s.isLive);
    }
}

// Initialize system
window.addEventListener('DOMContentLoaded', () => {
    window.aiStoryCreationSystem = new AIStoryCreationSystem();
    console.log('📝 AI Story Creation System initialized - Creating original Static.news content!');
});