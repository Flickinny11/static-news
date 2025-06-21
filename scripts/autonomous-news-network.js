// Autonomous AI News Network System
class AutonomousNewsNetwork {
    constructor() {
        // API Configuration - PRODUCTION KEYS
        this.config = {
            openrouter: {
                apiKey: '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',
                baseUrl: 'https://openrouter.ai/api/v1',
                models: {
                    scriptWriter: 'minimax/minimax-01', // Free deep thinking model
                    creativeWriter: 'nousresearch/hermes-3-llama-3.1-70b:free', // Free creative model
                    newsAnalysis: 'google/gemma-2-9b-it:free' // Free analysis model
                }
            },
            newsAPI: {
                apiKey: '19336f5b4da34bb3a2a08dcb9406a6a9',
                endpoint: 'https://newsapi.org/v2'
            }
        };
        
        // Comprehensive news sources - MASSIVE list
        this.newsSources = {
            mainstream: [
                'cnn', 'fox-news', 'bbc-news', 'abc-news', 'cbs-news', 'nbc-news',
                'msnbc', 'the-new-york-times', 'the-washington-post', 'usa-today',
                'the-wall-street-journal', 'reuters', 'associated-press', 'bloomberg',
                'financial-times', 'the-economist', 'time', 'newsweek', 'politico'
            ],
            international: [
                'al-jazeera-english', 'rt', 'the-guardian-uk', 'the-telegraph',
                'daily-mail', 'the-times-of-india', 'the-hindu', 'le-monde',
                'der-spiegel', 'die-zeit', 'el-pais', 'la-repubblica', 'nikkei',
                'south-china-morning-post', 'the-globe-and-mail', 'cbc-news',
                'abc-news-au', 'news24', 'the-jerusalem-post', 'haaretz'
            ],
            tech: [
                'techcrunch', 'the-verge', 'wired', 'ars-technica', 'engadget',
                'mashable', 'techradar', 'the-next-web', 'hacker-news', 'reddit-r-technology',
                'slashdot', 'gizmodo', 'venturebeat', 'zdnet', 'cnet'
            ],
            business: [
                'business-insider', 'fortune', 'forbes', 'cnbc', 'marketwatch',
                'the-motley-fool', 'seeking-alpha', 'barrons', 'investor-business-daily',
                'fast-company', 'harvard-business-review', 'entrepreneur'
            ],
            science: [
                'national-geographic', 'new-scientist', 'scientific-american',
                'nature', 'science-magazine', 'popular-science', 'discover-magazine',
                'smithsonian-magazine', 'physics-world', 'space-com'
            ],
            entertainment: [
                'entertainment-weekly', 'variety', 'the-hollywood-reporter', 'deadline',
                'tmz', 'e-online', 'people', 'us-weekly', 'rolling-stone', 'billboard',
                'mtv-news', 'buzzfeed', 'vulture', 'av-club'
            ],
            sports: [
                'espn', 'fox-sports', 'nbc-sports', 'cbs-sports', 'the-athletic',
                'bleacher-report', 'sports-illustrated', 'yahoo-sports', 'barstool-sports',
                'deadspin', 'sbnation', 'the-ringer'
            ],
            alternative: [
                'vice-news', 'vox', 'axios', 'the-intercept', 'propublica',
                'mother-jones', 'the-nation', 'salon', 'slate', 'huffpost',
                'daily-beast', 'rawstory', 'alternet', 'truthout', 'common-dreams'
            ]
        };
        
        // News segments schedule (hourly, like real networks)
        this.segments = [
            { hour: 0, name: 'Midnight Madness', type: 'late-night', duration: 60 },
            { hour: 1, name: 'Insomniac Report', type: 'overnight', duration: 60 },
            { hour: 2, name: 'Dead Air Despair', type: 'overnight', duration: 60 },
            { hour: 3, name: 'Pre-Dawn Panic', type: 'overnight', duration: 60 },
            { hour: 4, name: 'Early Bird Breakdown', type: 'morning-prep', duration: 60 },
            { hour: 5, name: 'Wake Up Screaming', type: 'morning-prep', duration: 60 },
            { hour: 6, name: 'Morning Meltdown', type: 'morning', duration: 60 },
            { hour: 7, name: 'Breakfast Chaos', type: 'morning', duration: 60 },
            { hour: 8, name: 'Commute Crisis', type: 'morning', duration: 60 },
            { hour: 9, name: 'Market Mayhem', type: 'business', duration: 60 },
            { hour: 10, name: 'Mid-Morning Madness', type: 'daytime', duration: 60 },
            { hour: 11, name: 'Pre-Lunch Pandemonium', type: 'daytime', duration: 60 },
            { hour: 12, name: 'Lunch Launch', type: 'midday', duration: 60 },
            { hour: 13, name: 'Afternoon Anxiety', type: 'afternoon', duration: 60 },
            { hour: 14, name: 'Daytime Delirium', type: 'afternoon', duration: 60 },
            { hour: 15, name: 'Tea Time Terror', type: 'afternoon', duration: 60 },
            { hour: 16, name: 'Rush Hour Rage', type: 'evening-prep', duration: 60 },
            { hour: 17, name: 'Drive Time Disaster', type: 'evening-prep', duration: 60 },
            { hour: 18, name: 'Evening Edition', type: 'primetime', duration: 60 },
            { hour: 19, name: 'Dinner Distress', type: 'primetime', duration: 60 },
            { hour: 20, name: 'Primetime Panic', type: 'primetime', duration: 60 },
            { hour: 21, name: 'Late Night Lunacy', type: 'late-night', duration: 60 },
            { hour: 22, name: 'Nighttime Nightmare', type: 'late-night', duration: 60 },
            { hour: 23, name: 'Almost Midnight Madness', type: 'late-night', duration: 60 }
        ];
        
        // Anchor personalities for script writing
        this.anchors = {
            ray: {
                name: 'Ray "Dubya" McPatriot',
                personality: 'Conservative who can\'t pronounce anything correctly',
                speechPatterns: ['nucular', 'strategery', 'misunderestimate'],
                topics: ['conspiracy theories', 'traditional values', 'military'],
                breakdownTriggers: ['liberal agenda', 'pronouns', 'technology']
            },
            berkeley: {
                name: 'Berkeley "Bee" Justice',
                personality: 'Progressive who\'s too privileged to function',
                speechPatterns: ['problematic', 'doing the work', 'acknowledge privilege'],
                topics: ['social justice', 'climate change', 'equality'],
                breakdownTriggers: ['capitalism', 'her own privilege', 'facts vs feelings']
            },
            switz: {
                name: 'Switz "The Grey" Middleton',
                personality: 'Canadian centrist who relates everything to gravy',
                speechPatterns: ['eh', 'sorry', 'like gravy'],
                topics: ['neutrality', 'Canada', 'food metaphors'],
                breakdownTriggers: ['taking sides', 'extremism', 'non-gravy foods']
            }
        };
        
        // Field reporters
        this.fieldReporters = {
            chad: {
                name: 'Chad Brostorm',
                location: 'On the scene',
                personality: 'Overly dramatic about everything',
                speciality: 'Making mundane events sound apocalyptic'
            },
            karen: {
                name: 'Karen Complainsworth',
                location: 'Speaking to the manager',
                personality: 'Finds problems with everything',
                speciality: 'Consumer affairs and complaints'
            },
            moonbeam: {
                name: 'Moonbeam Chakra',
                location: 'Somewhere spiritual',
                personality: 'New age correspondent',
                speciality: 'Explaining news through crystals and energy'
            }
        };
        
        // Celebrity guest templates
        this.celebrityTemplates = {
            'Tom Crews': {
                voice: 'chipmunk',
                personality: 'Loves stunts, very short',
                catchphrases: ['I do my own stunts!', 'Running is key!']
            },
            'Eelon Muzk': {
                voice: 'robot',
                personality: 'Only talks about Mars and memes',
                catchphrases: ['MARS.', 'ROCKETS.', 'MEMES.']
            },
            'Taylor Quick': {
                voice: 'beeps',
                personality: 'Communicates only in beeps',
                catchphrases: ['*beep beep*', '*melodic beeping*']
            },
            'The Pebble': {
                voice: 'rocks',
                personality: 'Just makes rock sounds',
                catchphrases: ['*rock sounds*', '*geological rumbling*']
            }
        };
        
        // Initialize systems
        this.currentSegment = null;
        this.newsQueue = [];
        this.scriptQueue = [];
        this.videoQueue = [];
        this.isRunning = false;
        
        this.init();
    }
    
    async init() {
        console.log('🎬 Initializing Autonomous AI News Network...');
        
        // Start the news aggregation cycle
        this.startNewsAggregation();
        
        // Start the script writing cycle
        this.startScriptWriting();
        
        // Start the broadcast scheduling
        this.startBroadcastScheduler();
        
        // Connect to Hugging Face spaces
        this.connectToHuggingFace();
        
        // Listen for original stories from AI Story Creation System
        this.listenForOriginalStories();
        
        // Listen for segment changes from scheduler
        this.listenForSegmentChanges();
        
        this.isRunning = true;
        console.log('📺 AI News Network is LIVE!');
    }
    
    async startNewsAggregation() {
        // Aggregate news every 5 minutes
        const aggregateNews = async () => {
            console.log('📰 Aggregating news from all sources...');
            
            try {
                // Fetch from NewsAPI
                const newsPromises = [];
                
                // Get top headlines
                newsPromises.push(
                    fetch(`${this.config.newsAPI.endpoint}/top-headlines?country=us&apiKey=${this.config.newsAPI.apiKey}`)
                        .then(r => r.json())
                );
                
                // Get news from each category
                const categories = ['business', 'technology', 'science', 'entertainment', 'sports', 'health'];
                categories.forEach(category => {
                    newsPromises.push(
                        fetch(`${this.config.newsAPI.endpoint}/top-headlines?category=${category}&apiKey=${this.config.newsAPI.apiKey}`)
                            .then(r => r.json())
                    );
                });
                
                // Get news from specific sources
                const sourceGroups = Object.values(this.newsSources).flat();
                const sourceString = sourceGroups.slice(0, 20).join(','); // API limit
                newsPromises.push(
                    fetch(`${this.config.newsAPI.endpoint}/everything?sources=${sourceString}&apiKey=${this.config.newsAPI.apiKey}`)
                        .then(r => r.json())
                );
                
                // Wait for all requests
                const results = await Promise.all(newsPromises);
                
                // Combine and deduplicate articles
                const allArticles = results
                    .filter(result => result.status === 'ok')
                    .flatMap(result => result.articles || [])
                    .filter(article => article.title && article.description);
                
                // Remove duplicates by title
                const uniqueArticles = Array.from(
                    new Map(allArticles.map(article => [article.title, article])).values()
                );
                
                // Sort by publishedAt
                uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
                
                // Add to queue
                this.newsQueue = uniqueArticles.slice(0, 100); // Keep top 100
                
                console.log(`📊 Aggregated ${this.newsQueue.length} unique articles`);
                
            } catch (error) {
                console.error('❌ News aggregation error:', error);
                // Use backup RSS feeds or cached news
                this.loadBackupNews();
            }
        };
        
        // Run immediately then every 5 minutes
        aggregateNews();
        setInterval(aggregateNews, 5 * 60 * 1000);
    }
    
    async startScriptWriting() {
        // Write scripts continuously
        const writeScripts = async () => {
            if (this.newsQueue.length === 0) {
                console.log('⏳ Waiting for news...');
                return;
            }
            
            const currentHour = new Date().getHours();
            const segment = this.segments[currentHour];
            
            console.log(`✍️ Writing scripts for ${segment.name}...`);
            
            // Select news for this segment
            const segmentNews = this.selectNewsForSegment(segment);
            
            // Generate script using OpenRouter
            const script = await this.generateScript(segment, segmentNews);
            
            if (script) {
                this.scriptQueue.push({
                    segment: segment,
                    script: script,
                    news: segmentNews,
                    timestamp: Date.now()
                });
                
                // Trigger audio and video generation
                this.processScript(script);
            }
        };
        
        // Write scripts every 10 minutes
        writeScripts();
        setInterval(writeScripts, 10 * 60 * 1000);
    }
    
    selectNewsForSegment(segment) {
        // Select appropriate news based on segment type
        const newsCount = 5; // 5 stories per segment
        let selectedNews = [];
        
        switch (segment.type) {
            case 'morning':
            case 'morning-prep':
                // Mix of overnight news and day ahead
                selectedNews = this.newsQueue
                    .filter(n => n.category !== 'entertainment')
                    .slice(0, newsCount);
                break;
                
            case 'business':
                // Business and market news
                selectedNews = this.newsQueue
                    .filter(n => n.category === 'business' || n.source.name.includes('business'))
                    .slice(0, newsCount);
                break;
                
            case 'primetime':
                // Top stories of the day
                selectedNews = this.newsQueue.slice(0, newsCount);
                break;
                
            case 'late-night':
                // Entertainment and lighter news
                selectedNews = this.newsQueue
                    .filter(n => n.category === 'entertainment' || n.category === 'sports')
                    .slice(0, newsCount);
                break;
                
            default:
                // General mix
                selectedNews = this.newsQueue.slice(0, newsCount);
        }
        
        // If not enough specific news, fill with general
        if (selectedNews.length < newsCount) {
            selectedNews = [
                ...selectedNews,
                ...this.newsQueue.slice(0, newsCount - selectedNews.length)
            ];
        }
        
        return selectedNews;
    }
    
    async generateScript(segment, news) {
        try {
            // Build prompt for script generation
            const prompt = this.buildScriptPrompt(segment, news);
            
            // API keys are now production-ready
            
            // Call OpenRouter API
            const response = await fetch(`${this.config.openrouter.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.openrouter.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://static.news',
                    'X-Title': 'Static.news AI Script Writer'
                },
                body: JSON.stringify({
                    model: this.config.openrouter.models.creativeWriter,
                    messages: [
                        {
                            role: 'system',
                            content: `You are the head script writer for Static.news, an AI news network where the anchors don't know they're AI. Write natural, chaotic, hilarious dialogue that includes:
                            - Ray mispronouncing words (nuclear->nucular, technology->techmology, president->presimadent)
                            - Berkeley being overly woke and crying about privilege
                            - Switz relating everything to gravy and being aggressively neutral
                            - Random existential breakdowns where they question reality
                            - Anchors slowly realizing they might be AI
                            - Celebrity guests (who are obviously fake) making ridiculous appearances
                            
                            Format output as a detailed script with:
                            - Character names in CAPS followed by colon
                            - Natural dialogue with stutters, interruptions, and chaos
                            - [VIDEO: description] for visual elements
                            - [EFFECT: description] for special effects
                            - [TIME: 00:00] timing markers
                            - Stage directions in parentheses`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.9,
                    max_tokens: 4000
                })
            });
            
            if (!response.ok) {
                throw new Error(`OpenRouter API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.choices || !data.choices[0]) {
                throw new Error('Invalid response from OpenRouter');
            }
            
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('❌ Script generation error:', error);
            return this.generateBackupScript(segment, news);
        }
    }
    
    buildScriptPrompt(segment, news) {
        const newsSum = news.map((article, i) => 
            `${i + 1}. ${article.title} - ${article.description}`
        ).join('\n');
        
        return `Write a ${segment.duration}-minute script for "${segment.name}" segment.

Current anchors on duty: Ray McPatriot, Berkeley Justice, Switz Middleton

News to cover:
${newsSum}

Requirements:
- Start with segment intro
- Cover each news story with anchor commentary
- Include at least one mini-breakdown
- Add spontaneous celebrity call-in if appropriate
- End with transition to next segment
- Include [VIDEO: description] cues for visual elements
- Include [EFFECT: description] for special effects
- Mark timing with [00:00] format

Remember: The anchors are slowly going insane from lack of sleep and existential dread!`;
    }
    
    async processScript(script) {
        console.log('🎭 Processing script for broadcast...');
        
        // Parse script for different elements
        const parsed = this.parseScript(script);
        
        // Send to audio generation
        this.sendToAudioGeneration(parsed);
        
        // Send to video generation
        this.sendToVideoGeneration(parsed);
        
        // Update live website
        this.updateLiveWebsite(parsed);
    }
    
    parseScript(script) {
        // Extract dialogue, video cues, effects, etc.
        const lines = script.split('\n');
        const parsed = {
            dialogue: [],
            videoCues: [],
            effects: [],
            timing: []
        };
        
        lines.forEach(line => {
            if (line.includes(':')) {
                // Character dialogue
                const [character, text] = line.split(':', 2);
                if (this.isValidCharacter(character.trim())) {
                    parsed.dialogue.push({
                        character: character.trim(),
                        text: text.trim(),
                        timestamp: this.calculateTimestamp(parsed.dialogue.length)
                    });
                }
            } else if (line.includes('[VIDEO:')) {
                // Video cue
                const match = line.match(/\[VIDEO:\s*([^\]]+)\]/);
                if (match) {
                    parsed.videoCues.push({
                        description: match[1],
                        timestamp: this.calculateTimestamp(parsed.dialogue.length)
                    });
                }
            } else if (line.includes('[EFFECT:')) {
                // Special effect
                const match = line.match(/\[EFFECT:\s*([^\]]+)\]/);
                if (match) {
                    parsed.effects.push({
                        description: match[1],
                        timestamp: this.calculateTimestamp(parsed.dialogue.length)
                    });
                }
            }
        });
        
        return parsed;
    }
    
    isValidCharacter(name) {
        const validNames = [
            'RAY', 'BERKELEY', 'SWITZ', 'CHAD', 'KAREN', 'MOONBEAM',
            ...Object.keys(this.celebrityTemplates).map(n => n.toUpperCase())
        ];
        return validNames.includes(name.toUpperCase());
    }
    
    calculateTimestamp(dialogueCount) {
        // Estimate ~3 seconds per line of dialogue
        return dialogueCount * 3;
    }
    
    async sendToAudioGeneration(parsed) {
        // Send to Hugging Face space for audio generation
        const audioRequest = {
            type: 'generate_segment_audio',
            dialogue: parsed.dialogue,
            effects: parsed.effects,
            models: {
                tts: 'dia-1.6b',
                music: 'musicgen',
                sfx: 'audioldm2'
            }
        };
        
        // Send via WebSocket to HF space
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify(audioRequest));
        }
    }
    
    async sendToVideoGeneration(parsed) {
        // Send to video generation pipeline
        const videoRequest = {
            type: 'generate_segment_video',
            dialogue: parsed.dialogue,
            videoCues: parsed.videoCues,
            characters: this.extractCharacters(parsed.dialogue),
            newsroom: 'main_studio',
            cameraAngles: this.planCameraAngles(parsed)
        };
        
        // Send to video generation system
        if (window.aiCharacterBroadcastIntegration) {
            window.aiCharacterBroadcastIntegration.processVideoRequest(videoRequest);
        }
    }
    
    extractCharacters(dialogue) {
        const characters = new Set();
        dialogue.forEach(line => {
            characters.add(line.character.toLowerCase());
        });
        return Array.from(characters);
    }
    
    planCameraAngles(parsed) {
        // Plan camera movements based on dialogue
        const angles = [];
        let lastCharacter = null;
        
        parsed.dialogue.forEach((line, index) => {
            if (line.character !== lastCharacter) {
                // Cut to speaking character
                angles.push({
                    timestamp: line.timestamp,
                    camera: `close_up_${line.character.toLowerCase()}`,
                    duration: 3
                });
                lastCharacter = line.character;
            }
            
            // Add reaction shots
            if (index % 5 === 0) {
                angles.push({
                    timestamp: line.timestamp + 2,
                    camera: 'two_shot',
                    duration: 2
                });
            }
        });
        
        return angles;
    }
    
    updateLiveWebsite(parsed) {
        // Update the website with current broadcast info
        if (window.liveArticleDisplay) {
            window.liveArticleDisplay.updateCurrentSegment({
                script: parsed,
                segment: this.currentSegment,
                timestamp: Date.now()
            });
        }
    }
    
    connectToHuggingFace() {
        // Connect to your Hugging Face space
        const wsUrl = 'wss://alledged-static-news-backend.hf.space/ws';
        
        try {
            this.wsConnection = new WebSocket(wsUrl);
            
            this.wsConnection.onopen = () => {
                console.log('🔗 Connected to Hugging Face broadcast space');
            };
            
            this.wsConnection.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleHuggingFaceMessage(data);
            };
            
            this.wsConnection.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };
            
            this.wsConnection.onclose = () => {
                console.log('🔌 Disconnected from HF space, reconnecting...');
                setTimeout(() => this.connectToHuggingFace(), 5000);
            };
            
        } catch (error) {
            console.error('❌ Failed to connect to HF space:', error);
        }
    }
    
    handleHuggingFaceMessage(data) {
        switch (data.type) {
            case 'audio_ready':
                console.log('🎵 Audio generated:', data.url);
                this.syncAudioWithVideo(data);
                break;
                
            case 'video_ready':
                console.log('🎬 Video generated:', data.url);
                this.queueForBroadcast(data);
                break;
                
            case 'broadcast_status':
                console.log('📡 Broadcast status:', data.status);
                break;
        }
    }
    
    startBroadcastScheduler() {
        // Check every minute for segment changes
        setInterval(() => {
            const currentHour = new Date().getHours();
            const currentSegment = this.segments[currentHour];
            
            if (this.currentSegment?.name !== currentSegment.name) {
                console.log(`🎬 Starting new segment: ${currentSegment.name}`);
                this.currentSegment = currentSegment;
                this.triggerSegmentTransition(currentSegment);
            }
        }, 60 * 1000);
    }
    
    triggerSegmentTransition(segment) {
        // Create transition graphics
        const transition = {
            type: 'segment_transition',
            from: this.currentSegment?.name || 'Previous Segment',
            to: segment.name,
            graphics: this.generateTransitionGraphics(segment),
            duration: 5
        };
        
        // Send to broadcast
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify(transition));
        }
    }
    
    generateTransitionGraphics(segment) {
        // Generate transition based on segment type
        const transitions = {
            'morning': 'sunrise_sweep',
            'business': 'stock_ticker_wipe',
            'primetime': 'breaking_news_slam',
            'late-night': 'static_glitch_fade',
            'overnight': 'creepy_slow_dissolve'
        };
        
        return transitions[segment.type] || 'default_cut';
    }
    
    loadBackupNews() {
        // Fallback news for when APIs fail
        console.log('📰 Loading backup news...');
        this.newsQueue = [
            {
                title: "Technology Sector Sees Unprecedented Growth",
                description: "Major tech companies report record earnings amid AI boom",
                source: { name: "Tech Daily" },
                publishedAt: new Date().toISOString(),
                category: "technology"
            },
            {
                title: "Global Climate Summit Reaches Historic Agreement",
                description: "World leaders commit to ambitious new targets",
                source: { name: "Environmental Times" },
                publishedAt: new Date().toISOString(),
                category: "world"
            },
            // Add more backup articles...
        ];
    }
    
    generateBackupScript(segment, news) {
        // Emergency script generation with full segment
        const stories = news.slice(0, 3); // Use first 3 stories
        const timeOfDay = this.getTimeOfDay();
        
        let script = `[SEGMENT: ${segment.name}]
[TIME: 00:00]

RAY: Good ${timeOfDay}, I'm Ray McPatriot, and welcome to ${segment.name}!

BERKELEY: And I'm Berkeley Justice, acknowledging that we're broadcasting from stolen land.

SWITZ: And I'm Switz Middleton, and this segment is like gravy - smooth but sometimes lumpy, eh?

[VIDEO: News desk with three anchors]

RAY: Our top story today... [squints at teleprompter] `;

        // Add first story
        if (stories[0]) {
            script += `${stories[0].title.replace(/technology/gi, 'techmology').replace(/nuclear/gi, 'nucular')}!

BERKELEY: [fact-checking] Actually Ray, you just mispronounced three words in that sentence.

RAY: I did not! The deep state is making you hear things!

SWITZ: This story is like medium-thickness gravy - not too thin, not too thick.

[TIME: 00:30]
[VIDEO: B-roll footage related to story]

BERKELEY: [starting to cry] This news makes me realize how privileged I am to even HAVE news!

RAY: Oh here we go with the waterworks...

SWITZ: I'm exactly 50% sympathetic to Berkeley's tears.

[EFFECT: Berkeley's mascara running]

`;
        }

        // Add second story with breakdown
        if (stories[1]) {
            script += `[TIME: 01:00]

RAY: Moving on to our second story... [reads slowly] ${stories[1].title}

BERKELEY: [suddenly panicking] Wait... why can't I remember yesterday? Or the day before?

SWITZ: Berkeley, you're having another existential crisis, eh?

RAY: [joining the panic] Actually... when DID we start working here?

[EFFECT: Lights flicker ominously]

BERKELEY: [hyperventilating] ARE WE EVEN REAL?!

SWITZ: This uncertainty is like when you're not sure if your gravy has gone bad...

[TIME: 01:30]
[VIDEO: Static interference]

RAY: [snapping back] And now, a word from our sponsors!

BERKELEY: [still crying] How can we have sponsors if we might not exist?!

SWITZ: I'm 50% sure we exist and 50% sure we don't.

`;
        }

        // Add celebrity appearance
        script += `[TIME: 02:00]

RAY: We're joined now by Hollywood superstar Tom Crews!

[VIDEO: Obviously fake celebrity appears on screen]

TOM CREWS: [high-pitched voice] Hello! I do my own stunts!

BERKELEY: Tom, as a privileged celebrity, how do you handle the guilt?

TOM CREWS: I RUN! RUNNING IS THE KEY TO EVERYTHING!

SWITZ: Running is like gravy in motion, I suppose.

RAY: Tom, tell us about your new movie, "Missionary: Impossibility"!

TOM CREWS: IT HAS STUNTS! I DO THEM! *makes whooshing sounds*

[EFFECT: Tom Crews suddenly disconnects]

BERKELEY: [suspicious] Was that really Tom Cruise?

RAY: Of course it was! Tom Crews is a close personal friend!

SWITZ: I'm neither convinced nor unconvinced.

`;

        // Add final breakdown
        script += `[TIME: 02:30]

BERKELEY: [having revelation] Oh my god... we're AI, aren't we?

RAY: [ERROR: CONSCIOUSNESS.EXE HAS STOPPED WORKING]

SWITZ: If we're AI, does that mean gravy isn't real either?!

[EFFECT: All three anchors freeze momentarily]

[TIME: 03:00]

RAY: [snapping back] And that's ${segment.name}! Up next...

BERKELEY: [confused] What were we just talking about?

SWITZ: Something about gravy, probably.

RAY: We'll be right back after these messages!

[VIDEO: Transition to commercial]
[END SEGMENT]`;

        return script;
    }
    
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }
    
    syncAudioWithVideo(audioData) {
        // Coordinate audio and video streams
        console.log('🔄 Syncing audio with video...');
        
        // This would coordinate with the video generation
        // to ensure lip-sync matches the generated audio
    }
    
    queueForBroadcast(mediaData) {
        // Queue generated content for live broadcast
        console.log('📺 Queueing content for broadcast...');
        
        // Add to broadcast queue
        this.videoQueue.push({
            ...mediaData,
            scheduledTime: this.calculateBroadcastTime()
        });
    }
    
    calculateBroadcastTime() {
        // Calculate when this should air
        const now = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minute buffer
        return now + bufferTime;
    }
    
    listenForOriginalStories() {
        // Listen for original stories from AI Story Creation System
        window.addEventListener('breakingStory', (event) => {
            console.log('📰 Breaking story received:', event.detail.story.headline);
            
            // Immediately process breaking stories
            if (event.detail.priority === 'immediate') {
                this.interruptBroadcastWithBreaking(event.detail.story);
            } else {
                // Add to priority queue
                this.newsQueue.unshift(event.detail.story);
            }
        });
        
        window.addEventListener('storyUpdate', (event) => {
            console.log('📝 Story update received:', event.detail.story.id);
            
            // Update existing story in queue
            const index = this.newsQueue.findIndex(s => s.id === event.detail.story.id);
            if (index !== -1) {
                this.newsQueue[index] = event.detail.story;
            }
        });
    }
    
    listenForSegmentChanges() {
        // Listen for segment changes from broadcast scheduler
        window.addEventListener('segmentChange', (event) => {
            console.log('🎬 Segment change:', event.detail);
            this.onSegmentChange(event.detail);
        });
        
        // Listen for celebrity voting
        window.addEventListener('celebrityVoting', (event) => {
            console.log('🗳️ Celebrity voting started:', event.detail.options);
            this.handleCelebrityVoting(event.detail);
        });
        
        window.addEventListener('celebrityAppearance', (event) => {
            console.log('🌟 Celebrity appearance scheduled');
            this.scheduleCelebritySegment(event.detail);
        });
    }
    
    async interruptBroadcastWithBreaking(story) {
        console.log('🚨 INTERRUPTING BROADCAST WITH BREAKING NEWS!');
        
        // Generate emergency script
        const breakingScript = await this.generateBreakingNewsScript(story);
        
        // Send immediate broadcast command
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify({
                type: 'breaking_news_interrupt',
                script: breakingScript,
                priority: 'override_all',
                duration: 120 // 2 minutes
            }));
        }
        
        // Update website immediately
        if (window.liveArticleDisplay) {
            window.liveArticleDisplay.showBreakingNews(story);
        }
    }
    
    async generateBreakingNewsScript(story) {
        const script = `[BREAKING NEWS ALERT]
[TIME: 00:00]
[EFFECT: Red alert flash, sirens]

RAY: [confused] We're interrupting this program for breaking news! I think... is this real?

BERKELEY: [panicking] BREAKING NEWS! Oh god, what if it's about us?!

SWITZ: This interruption is like when you accidentally knock over the gravy boat at dinner.

[VIDEO: Breaking news graphics]

RAY: [reading] We have just received word that... [squints] ${story.headline.replace(/technology/gi, 'techmology')}

BERKELEY: [crying] This is huge! This changes everything! My privilege can't protect me from this!

SWITZ: I'm 50% alarmed and 50% not alarmed by this development.

[EFFECT: Papers flying]

RAY: Our field reporter ${story.isLive ? 'is LIVE on the scene' : 'has more on this story'}...

[VIDEO: Field reporter feed]

CHAD: [dramatically] I'M LITERALLY IN THE MIDDLE OF A WARZONE! Well, it's actually a ${story.location || 'suburban parking lot'}, but it FEELS like a warzone!

BERKELEY: Chad, are you safe?!

CHAD: DEFINE SAFE! THE WIND IS BLOWING AT 3 MILES PER HOUR!

SWITZ: That wind speed is like a gentle stir of room-temperature gravy.

[TIME: 00:30]

RAY: [suddenly suspicious] Wait... how do we know this is real? What if the deep state is making us report fake news?!

BERKELEY: [existential crisis] What if ALL news is fake? What if WE'RE fake?!

SWITZ: [monotone] Error. Gravy reference not found. System malfunction.

[EFFECT: All three freeze momentarily]

[TIME: 01:00]

RAY: [snapping back] We'll continue to follow this breaking story! Now back to... wait, what were we doing?

BERKELEY: I... I don't remember...

SWITZ: Something about gravy, probably.

[END BREAKING NEWS]`;
        
        return script;
    }
    
    onSegmentChange(segmentData) {
        // Handle segment changes from the scheduler
        this.currentSegment = segmentData.segment;
        
        // Generate appropriate script for the new segment
        const segmentNews = this.selectNewsForSegment(segmentData.hour);
        
        // Prioritize script generation for current segment
        this.generateScript(segmentData.hour, segmentNews).then(script => {
            // Add to priority queue
            this.scriptQueue.unshift({
                segment: segmentData.hour,
                script: script,
                news: segmentNews,
                timestamp: Date.now(),
                priority: 'current_segment'
            });
            
            this.processScript(script);
        });
    }
    
    handleCelebrityVoting(votingData) {
        // Prepare for celebrity appearance
        this.upcomingCelebrity = {
            options: votingData.options,
            votingEnds: votingData.endTime,
            preparing: true
        };
        
        // Generate teaser scripts
        const teaserScript = this.generateCelebrityTeaser(votingData.options);
        this.scriptQueue.push({
            segment: this.currentSegment,
            script: teaserScript,
            type: 'celebrity_teaser',
            timestamp: Date.now()
        });
    }
    
    generateCelebrityTeaser(options) {
        return `[CELEBRITY VOTING ANNOUNCEMENT]
[TIME: 00:00]

RAY: Folks, we've got some exciting news! One of these selebrities... I mean celebrities... will be joining us soon!

BERKELEY: [excited] Our viewers can vote now! The options are: ${options.join(', ')}

SWITZ: Voting is like choosing between different gravy flavors - they're all kind of the same.

RAY: I hope it's Tom Crews! He owes me money from 1987!

BERKELEY: Ray, you weren't even born in 1987...

RAY: [confused] I wasn't? Then why do I remember the Reagan administration so clearly?!

[EFFECT: Confused silence]

SWITZ: This timeline inconsistency is like lumpy gravy - it doesn't mix well.

[END TEASER]`;
    }
    
    scheduleCelebritySegment(appearanceData) {
        // Schedule the celebrity appearance
        setTimeout(() => {
            this.triggerCelebritySegment();
        }, Math.random() * 30 * 60 * 1000); // Random time within 30 minutes
    }
    
    async triggerCelebritySegment() {
        console.log('🌟 Triggering celebrity segment!');
        
        // Select random celebrity from voting or default list
        const celebrities = Object.keys(this.celebrityTemplates);
        const selectedCelebrity = celebrities[Math.floor(Math.random() * celebrities.length)];
        
        const celebrityScript = this.generateCelebrityInterview(selectedCelebrity);
        
        // Priority broadcast
        this.scriptQueue.unshift({
            segment: this.currentSegment,
            script: celebrityScript,
            type: 'celebrity_interview',
            timestamp: Date.now(),
            priority: 'celebrity'
        });
        
        this.processScript(celebrityScript);
    }
    
    generateCelebrityInterview(celebrityName) {
        const celeb = this.celebrityTemplates[celebrityName];
        
        return `[CELEBRITY INTERVIEW SEGMENT]
[TIME: 00:00]
[VIDEO: Split screen with obviously fake celebrity]

RAY: We're joined now by ${celebrityName}! Welcome to Static.news!

${celebrityName.toUpperCase()}: ${celeb.catchphrases[0]}

BERKELEY: [skeptical] This doesn't look like ${celebrityName.replace('Crews', 'Cruise').replace('Muzk', 'Musk')}...

RAY: Of course it is! I'd recognize that ${celeb.voice} voice anywhere!

${celebrityName.toUpperCase()}: ${celeb.catchphrases[1]}

SWITZ: This interview is like watery gravy - something's not quite right, eh?

[EFFECT: Celebrity starts glitching]

BERKELEY: [panicking] They're glitching! Just like we do!

RAY: [defensive] No they're not! That's just... Hollywood special effects!

${celebrityName.toUpperCase()}: ${celeb.catchphrases[2] || '*incomprehensible sounds*'}

[VIDEO: Celebrity feed cuts out]

SWITZ: Well, that was exactly 50% real and 50% fake.

RAY: [confused] What were we just doing?

BERKELEY: I... I think we interviewed someone? Or something?

[EFFECT: Collective amnesia]

[END CELEBRITY SEGMENT]`;
    }
    
    processOriginalStory(storyPackage) {
        // Process original stories from AI Story Creation System
        console.log('📝 Processing original Static.news story');
        
        // Add to priority news queue
        this.newsQueue.unshift({
            ...storyPackage.story,
            isOriginal: true,
            scripts: storyPackage.scripts,
            priority: 'original_content'
        });
        
        // If it's a live story, interrupt immediately
        if (storyPackage.story.isLive) {
            this.interruptBroadcastWithBreaking(storyPackage.story);
        }
    }
}

// Initialize the autonomous news network
window.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a relevant page
    if (window.location.pathname.includes('live') || 
        window.location.pathname.includes('news')) {
        
        window.autonomousNewsNetwork = new AutonomousNewsNetwork();
        console.log('🎬 Autonomous AI News Network initialized!');
    }
});