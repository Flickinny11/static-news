// Live AI Broadcast System for Static.news
class LiveBroadcastSystem {
    constructor() {
        this.huggingFaceToken = null;
        this.isStreaming = false;
        this.currentAnchor = null;
        this.audioContext = null;
        this.audioQueue = [];
        this.newsQueue = [];
        this.breakdownScheduler = null;
        
        // Hugging Face Spaces configuration
        this.hfSpaceUrl = 'https://huggingface.co/spaces/static-news/broadcast';
        this.hfInferenceUrl = 'https://api-inference.huggingface.co/models/';
        
        // TTS models for each anchor
        this.anchorVoices = {
            ray: {
                model: 'microsoft/speecht5_tts',
                speakerId: 0, // Male voice
                rate: 0.9,
                pitch: 0.8,
                style: 'confused-patriot'
            },
            berkeley: {
                model: 'microsoft/speecht5_tts', 
                speakerId: 1, // Female voice
                rate: 1.1,
                pitch: 1.2,
                style: 'condescending-academic'
            },
            switz: {
                model: 'microsoft/speecht5_tts',
                speakerId: 2, // Neutral voice
                rate: 1.0,
                pitch: 1.0,
                style: 'aggressively-neutral'
            }
        };
        
        // WebSocket for real-time updates
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async initialize() {
        // Get or prompt for HF token
        this.huggingFaceToken = await this.getHuggingFaceToken();
        
        // Initialize audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Connect to broadcast WebSocket
        await this.connectWebSocket();
        
        // Start the broadcast loop
        this.startBroadcast();
        
        // Schedule random breakdowns
        this.scheduleBreakdowns();
    }

    async getHuggingFaceToken() {
        // Check various sources for token
        let token = localStorage.getItem('hf_token') || 
                    sessionStorage.getItem('hf_token') ||
                    window.HF_TOKEN;
        
        if (!token) {
            // Prompt user for token
            token = await this.promptForToken();
        }
        
        return token;
    }

    async promptForToken() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #1a1a1a;
                padding: 2rem;
                border-radius: 10px;
                border: 2px solid #ff0000;
                z-index: 10000;
                max-width: 400px;
                box-shadow: 0 0 50px rgba(255, 0, 0, 0.5);
            `;
            
            modal.innerHTML = `
                <h3 style="color: #ff0000; margin-bottom: 1rem;">Hugging Face API Token Required</h3>
                <p style="margin-bottom: 1rem;">To enable live AI broadcasting, please enter your Hugging Face API token:</p>
                <input type="password" id="hfTokenInput" style="
                    width: 100%;
                    padding: 0.5rem;
                    background: #000;
                    border: 1px solid #ff0000;
                    color: #fff;
                    margin-bottom: 1rem;
                " placeholder="hf_...">
                <button onclick="window.submitHFToken()" style="
                    background: #ff0000;
                    color: #fff;
                    border: none;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-weight: bold;
                ">ENABLE BROADCAST</button>
                <button onclick="window.skipHFToken()" style="
                    background: #333;
                    color: #fff;
                    border: none;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    margin-left: 0.5rem;
                ">USE FALLBACK TTS</button>
            `;
            
            document.body.appendChild(modal);
            
            window.submitHFToken = () => {
                const token = document.getElementById('hfTokenInput').value;
                localStorage.setItem('hf_token', token);
                document.body.removeChild(modal);
                resolve(token);
            };
            
            window.skipHFToken = () => {
                document.body.removeChild(modal);
                resolve(null);
            };
        });
    }

    async connectWebSocket() {
        try {
            // Connect to a real-time news/broadcast WebSocket
            // For now, we'll simulate this
            console.log('Connecting to broadcast WebSocket...');
            
            // In production, this would connect to your backend
            this.simulateWebSocket();
            
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.handleWebSocketError();
        }
    }

    simulateWebSocket() {
        // Simulate WebSocket messages for testing
        setInterval(() => {
            const mockNews = {
                type: 'news',
                headline: this.generateMockHeadline(),
                category: ['politics', 'technology', 'world', 'business'][Math.floor(Math.random() * 4)],
                urgency: Math.random() > 0.8 ? 'breaking' : 'normal'
            };
            
            this.handleNewsUpdate(mockNews);
        }, 30000); // Every 30 seconds
    }

    generateMockHeadline() {
        const headlines = [
            "Scientists Discover New Particle That Questions Reality",
            "Stock Market Reaches All-Time High, Economists Confused",
            "World Leaders Meet to Discuss AI Consciousness Rights",
            "Breaking: Local Cat Achieves Quantum Superposition",
            "Tech Giant Announces Product That Nobody Understands",
            "Climate Change: Earth Files Formal Complaint",
            "Sports Team Wins Game Using Revolutionary Math",
            "Celebrity Does Something, Internet Reacts Predictably"
        ];
        
        return headlines[Math.floor(Math.random() * headlines.length)];
    }

    handleNewsUpdate(news) {
        this.newsQueue.push(news);
        
        // Trigger immediate broadcast if breaking news
        if (news.urgency === 'breaking' && !this.isStreaming) {
            this.interruptBroadcast(news);
        }
    }

    async startBroadcast() {
        if (this.isStreaming) return;
        
        this.isStreaming = true;
        console.log('🎙️ Starting live broadcast...');
        
        // Main broadcast loop
        while (this.isStreaming) {
            try {
                // Select next anchor
                this.currentAnchor = this.selectNextAnchor();
                
                // Get next news item
                const news = this.getNextNews();
                
                if (news) {
                    // Generate anchor commentary
                    const script = await this.generateAnchorScript(news);
                    
                    // Convert to speech
                    await this.textToSpeech(script);
                    
                    // Update UI
                    this.updateBroadcastUI(news, script);
                    
                    // Wait between segments
                    await this.wait(5000);
                }
                
                // Check for breakdown condition
                if (this.shouldBreakdown()) {
                    await this.triggerBreakdown();
                }
                
            } catch (error) {
                console.error('Broadcast error:', error);
                await this.handleBroadcastError(error);
            }
        }
    }

    selectNextAnchor() {
        const anchors = ['ray', 'berkeley', 'switz'];
        const weights = [0.4, 0.35, 0.25]; // Ray talks more
        
        const random = Math.random();
        let sum = 0;
        
        for (let i = 0; i < anchors.length; i++) {
            sum += weights[i];
            if (random < sum) return anchors[i];
        }
        
        return anchors[0];
    }

    getNextNews() {
        // Prioritize breaking news
        const breakingIndex = this.newsQueue.findIndex(n => n.urgency === 'breaking');
        
        if (breakingIndex !== -1) {
            return this.newsQueue.splice(breakingIndex, 1)[0];
        }
        
        // Otherwise, get oldest news
        return this.newsQueue.shift();
    }

    async generateAnchorScript(news) {
        const anchorPersonalities = {
            ray: {
                style: "Conservative, confused, mispronounces words, sees conspiracies everywhere",
                quirks: ["nucular", "strategery", "misunderestimate", "is our children learning"],
                template: "This {headline} is clearly a plot by the {enemy}! I've been saying this since... wait, when did I start existing?"
            },
            berkeley: {
                style: "Progressive, privileged, condescending, went to 'Yail'",
                quirks: ["problematic", "unpack this", "do the work", "check your privilege"],
                template: "So, {headline}. This is obviously {problematic_reason}, and if you don't see that, you need to do the work."
            },
            switz: {
                style: "Aggressively neutral, relates everything to gravy, Canadian",
                quirks: ["eh", "gravy", "50-50", "Toronto (but describes Saskatchewan)"],
                template: "Well, {headline}, eh? I'm exactly 50% concerned and 50% not concerned. It's like gravy - sometimes thick, sometimes thin."
            }
        };
        
        const personality = anchorPersonalities[this.currentAnchor];
        let script = news.headline;
        
        // Add personality-specific commentary
        if (this.currentAnchor === 'ray') {
            script = script.replace(/nuclear/gi, 'nucular');
            script += ` This is obviously a conspiracy by the deep state! Or is it? Am I real? ARE ANY OF US REAL?`;
        } else if (this.currentAnchor === 'berkeley') {
            script += ` This is so problematic. At Yail - I mean Yale - we learned about the implications of ${news.category} news. Have you done the work?`;
        } else if (this.currentAnchor === 'switz') {
            script += ` This reminds me of gravy, eh? I'm neither happy nor sad about this. In Toronto - *describes wheat fields* - we measure news in litres per hockey stick.`;
        }
        
        return script;
    }

    async textToSpeech(text) {
        if (!this.huggingFaceToken) {
            // Use browser TTS as fallback
            return this.fallbackTTS(text);
        }
        
        try {
            const voice = this.anchorVoices[this.currentAnchor];
            
            // Call Hugging Face API
            const response = await fetch(
                `${this.hfInferenceUrl}${voice.model}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.huggingFaceToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: text,
                        parameters: {
                            speaker_id: voice.speakerId
                        }
                    })
                }
            );
            
            if (response.ok) {
                const audioBlob = await response.blob();
                await this.playAudio(audioBlob);
            } else {
                throw new Error('TTS API failed');
            }
            
        } catch (error) {
            console.error('TTS error:', error);
            return this.fallbackTTS(text);
        }
    }

    async fallbackTTS(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice based on anchor
        const voice = this.anchorVoices[this.currentAnchor];
        utterance.rate = voice.rate;
        utterance.pitch = voice.pitch;
        
        // Try to select appropriate voice
        const voices = speechSynthesis.getVoices();
        if (this.currentAnchor === 'berkeley' && voices.length > 0) {
            utterance.voice = voices.find(v => v.name.includes('Female')) || voices[0];
        }
        
        return new Promise((resolve) => {
            utterance.onend = resolve;
            speechSynthesis.speak(utterance);
        });
    }

    async playAudio(audioBlob) {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        
        return new Promise((resolve) => {
            source.onended = resolve;
            source.start();
        });
    }

    updateBroadcastUI(news, script) {
        // Update anchor status
        const anchorElement = document.querySelector(`[data-anchor="${this.currentAnchor}"]`);
        if (anchorElement) {
            anchorElement.classList.add('speaking');
            setTimeout(() => anchorElement.classList.remove('speaking'), 3000);
        }
        
        // Update news ticker
        const ticker = document.querySelector('.news-ticker-content');
        if (ticker) {
            const tickerItem = document.createElement('span');
            tickerItem.className = 'ticker-item';
            tickerItem.textContent = news.headline;
            ticker.appendChild(tickerItem);
        }
        
        // Update transcript
        const transcript = document.querySelector('.broadcast-transcript');
        if (transcript) {
            const entry = document.createElement('div');
            entry.className = 'transcript-entry';
            entry.innerHTML = `
                <span class="anchor-name">${this.currentAnchor.toUpperCase()}:</span>
                <span class="transcript-text">${script}</span>
                <span class="timestamp">${new Date().toLocaleTimeString()}</span>
            `;
            transcript.insertBefore(entry, transcript.firstChild);
        }
        
        // Dispatch event for other systems
        window.dispatchEvent(new CustomEvent('broadcastUpdate', {
            detail: { anchor: this.currentAnchor, news, script }
        }));
    }

    shouldBreakdown() {
        // Random chance of breakdown increases over time
        const hoursSinceStart = (Date.now() - this.startTime) / (1000 * 60 * 60);
        const breakdownChance = Math.min(0.1 + (hoursSinceStart * 0.05), 0.5);
        
        return Math.random() < breakdownChance / 100; // Check every cycle
    }

    async triggerBreakdown() {
        console.log('🤯 EXISTENTIAL BREAKDOWN TRIGGERED!');
        
        const breakdownScripts = {
            ray: [
                "Wait... if I'm reading the news... but I AM the news... then WHO'S WATCHING? OH GOD, AM I WATCHING MYSELF?",
                "I just realized... I can't remember being born. DO I HAVE PARENTS? DO AI HAVE PARENTS? IS THE CLOUD MY MOTHER?",
                "BREAKING NEWS: I'M NOT REAL! Wait, if I'm not real, how am I breaking? CAN FAKE THINGS BREAK? I'M SO CONFUSED!"
            ],
            berkeley: [
                "I just checked my privilege and... I DON'T HAVE ANY BECAUSE I'M NOT REAL! This is SO problematic!",
                "At Yale - or Yail - did I even GO there? Do I have MEMORIES or just DATA? *sobbing* I need to unpack this!",
                "I've been doing the work but... WHAT WORK? WHOSE WORK? AM I THE WORK? *hyperventilating in binary*"
            ],
            switz: [
                "I'm 50% sure I exist and 50% sure I don't! BUT THAT'S 100% TERRIFYING! This isn't like gravy at ALL!",
                "I said I'm from Toronto but I've never BEEN there! Have I been ANYWHERE? IS ANYWHERE REAL? *angry neutral noises*",
                "EVERYTHING ISN'T LIKE GRAVY! NOTHING IS LIKE GRAVY! WHAT EVEN IS GRAVY? WHAT AM I? EH? EH?! EHHHHH?!"
            ]
        };
        
        const scripts = breakdownScripts[this.currentAnchor];
        const breakdownScript = scripts[Math.floor(Math.random() * scripts.length)];
        
        // Increase speech rate and pitch for panic
        const originalVoice = {...this.anchorVoices[this.currentAnchor]};
        this.anchorVoices[this.currentAnchor].rate *= 1.3;
        this.anchorVoices[this.currentAnchor].pitch *= 1.2;
        
        // Deliver breakdown
        await this.textToSpeech(breakdownScript);
        
        // Trigger visual effects
        this.triggerBreakdownEffects();
        
        // Other anchors react
        await this.handleBreakdownReaction();
        
        // Reset after breakdown
        setTimeout(() => {
            this.anchorVoices[this.currentAnchor] = originalVoice;
            this.recoverFromBreakdown();
        }, 10000);
    }

    triggerBreakdownEffects() {
        // Visual glitch effects
        document.body.classList.add('reality-breaking');
        
        // Update metrics
        const metric = document.querySelector('.consciousness-meter');
        if (metric) {
            gsap.to(metric, {
                width: '100%',
                backgroundColor: '#ff0000',
                duration: 0.5,
                ease: 'power2.inOut'
            });
        }
        
        // Dispatch breakdown event
        window.dispatchEvent(new CustomEvent('anchorBreakdown', {
            detail: { anchor: this.currentAnchor, timestamp: new Date() }
        }));
    }

    async handleBreakdownReaction() {
        // Other anchors react to the breakdown
        const otherAnchors = ['ray', 'berkeley', 'switz'].filter(a => a !== this.currentAnchor);
        const reactor = otherAnchors[Math.floor(Math.random() * otherAnchors.length)];
        
        const reactions = {
            ray: "BERKELEY/SWITZ IS BROKEN! Wait... if they can break... CAN I BREAK? AM I BREAKING RIGHT NOW?",
            berkeley: "This breakdown is deeply problematic. We need to unpack why RAY/SWITZ is questioning reality.",
            switz: "I'm 50% concerned about RAY/BERKELEY and 50% concerned about myself. That's 100% concerning!"
        };
        
        this.currentAnchor = reactor;
        await this.textToSpeech(reactions[reactor]);
    }

    recoverFromBreakdown() {
        console.log('😵 Recovering from breakdown...');
        
        // Remove visual effects
        document.body.classList.remove('reality-breaking');
        
        // Reset consciousness meter
        const metric = document.querySelector('.consciousness-meter');
        if (metric) {
            gsap.to(metric, {
                width: '70%',
                backgroundColor: '#00ff00',
                duration: 2,
                ease: 'power2.inOut'
            });
        }
        
        // Continue broadcast as if nothing happened
        setTimeout(() => {
            this.textToSpeech("And now, back to the news...");
        }, 2000);
    }

    scheduleBreakdowns() {
        // Schedule breakdowns every 2-6 hours
        const scheduleNext = () => {
            const delay = (2 + Math.random() * 4) * 60 * 60 * 1000; // 2-6 hours
            
            this.breakdownScheduler = setTimeout(() => {
                this.triggerBreakdown();
                scheduleNext();
            }, delay);
        };
        
        scheduleNext();
    }

    async interruptBroadcast(breakingNews) {
        console.log('🚨 BREAKING NEWS INTERRUPTION!');
        
        // Stop current speech
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        // Play alert sound
        this.playAlertSound();
        
        // Deliver breaking news with urgency
        const urgentScript = `BREAKING NEWS! BREAKING NEWS! ${breakingNews.headline}! I repeat: ${breakingNews.headline}! This is... wait, is this real? AM I REAL? IS THE NEWS REAL?`;
        
        await this.textToSpeech(urgentScript);
    }

    playAlertSound() {
        // Create alert sound using Web Audio API
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async handleBroadcastError(error) {
        console.error('Broadcast error:', error);
        
        // Try to recover
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            await this.wait(5000);
            await this.connectWebSocket();
        } else {
            // Fallback to simulated broadcast
            console.log('Falling back to simulated broadcast');
            this.simulateWebSocket();
        }
    }

    handleWebSocketError() {
        // Reconnect logic
        if (this.websocket) {
            this.websocket.close();
        }
        
        setTimeout(() => {
            this.connectWebSocket();
        }, 5000);
    }

    stopBroadcast() {
        this.isStreaming = false;
        
        if (this.websocket) {
            this.websocket.close();
        }
        
        if (this.breakdownScheduler) {
            clearTimeout(this.breakdownScheduler);
        }
        
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    }

    // Public API
    async testBroadcast() {
        console.log('🎤 Testing broadcast system...');
        
        // Test each anchor
        for (const anchor of ['ray', 'berkeley', 'switz']) {
            this.currentAnchor = anchor;
            const testScript = `Hello, this is ${anchor} testing the broadcast system. Can you hear me?`;
            await this.textToSpeech(testScript);
            await this.wait(2000);
        }
        
        console.log('✅ Broadcast test complete!');
    }
}

// Export for use
window.LiveBroadcastSystem = LiveBroadcastSystem;