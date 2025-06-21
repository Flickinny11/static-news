// User Interaction System - Secure comment handling and celebrity voting
class UserInteractionSystem {
    constructor() {
        this.isInitialized = false;
        this.commentQueue = [];
        this.celebritySubmissions = new Map();
        this.activeVoting = null;
        this.votingHistory = [];
        this.lastCommentRead = 0;
        this.commentReadInterval = 1800000 + Math.random() * 1800000; // 30-60 minutes
        
        // Security - Admin functions require authentication
        this.adminToken = null;
        this.isAdmin = false;
        
        // Celebrity voting configuration
        this.votingConfig = {
            submissionInterval: 14400000, // 4 hours
            votingDuration: 300000, // 5 minutes
            maxSubmissionsPerUser: 3,
            candidatesPerVote: 5,
            guestAppearanceDelay: 1800000 // 30 minutes max
        };
        
        // Legal compliance
        this.legalCompliance = {
            breakdownGambling: false, // Disabled by default
            allowedRegions: [], // Will be populated based on legal review
            ageVerification: true,
            disclaimers: true
        };
        
        this.init();
    }

    async init() {
        console.log('🎯 Initializing User Interaction System...');
        
        // Set up secure admin access
        this.setupAdminAccess();
        
        // Initialize comment system
        this.initCommentSystem();
        
        // Initialize celebrity voting
        this.initCelebrityVoting();
        
        // Start interaction loops
        this.startInteractionLoops();
        
        // Connect to broadcast
        this.connectToBroadcast();
        
        this.isInitialized = true;
    }

    setupAdminAccess() {
        // Admin functions are NOT exposed to window
        // They require backend authentication
        
        // Override force functions to require auth
        if (window.aiCharacterSystem) {
            const originalForce = window.aiCharacterSystem.generateTestVideo;
            window.aiCharacterSystem.generateTestVideo = () => {
                console.error('🚫 This function requires admin authentication');
                return null;
            };
        }
        
        if (window.aiCharacterBroadcastIntegration) {
            const originalForce = window.aiCharacterBroadcastIntegration.forceCharacterVideo;
            window.aiCharacterBroadcastIntegration.forceCharacterVideo = () => {
                console.error('🚫 This function requires admin authentication');
                return null;
            };
        }
        
        // Admin panel access (requires backend auth)
        this.adminPanel = {
            authenticate: async (token) => {
                // Verify token with backend
                const response = await fetch('/api/admin/verify', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    this.adminToken = token;
                    this.isAdmin = true;
                    console.log('✅ Admin authenticated');
                    return true;
                }
                return false;
            },
            
            forceCharacter: async (anchor, text) => {
                if (!this.isAdmin) {
                    console.error('🚫 Admin authentication required');
                    return;
                }
                
                // Admin-only force character
                await this.sendAdminCommand('force_character', { anchor, text });
            },
            
            forceCelebrity: async (name) => {
                if (!this.isAdmin) {
                    console.error('🚫 Admin authentication required');
                    return;
                }
                
                // Admin-only force celebrity
                await this.sendAdminCommand('force_celebrity', { name });
            }
        };
    }

    initCommentSystem() {
        // Create comment submission UI
        this.createCommentUI();
        
        // Set up comment moderation
        this.commentModeration = {
            bannedWords: new Set(['spam', 'scam', 'hack']), // Expanded list in production
            maxLength: 280,
            cooldownPeriod: 60000, // 1 minute between comments
            userCooldowns: new Map()
        };
        
        // Comment reaction templates
        this.anchorReactions = {
            ray: {
                positive: [
                    "That's a great American comment right there!",
                    "I don't understand it, but I like the patriotism!",
                    "This reminds me of something... what was I talking about?"
                ],
                negative: [
                    "That sounds like communist propaganda to me!",
                    "I can't even pronounce your username... very suspicious.",
                    "The deep state probably wrote this comment!"
                ],
                confused: [
                    "Wait, what? Can someone explain this to me?",
                    "Is this English? I only speak American!",
                    "My brain hurts trying to understand this..."
                ]
            },
            berkeley: {
                positive: [
                    "Finally, someone who gets it! Though not as well as I do.",
                    "This comment is almost as enlightened as my Yale education.",
                    "I was just about to say the exact same thing, but better."
                ],
                negative: [
                    "This is EXTREMELY problematic on multiple levels.",
                    "Clearly this person hasn't done the work.",
                    "I literally can't even with this comment."
                ],
                factCheck: [
                    "Actually, let me fact-check this... *gets it completely wrong*",
                    "According to my sources at Yale - I mean Yail - this is incorrect.",
                    "This needs seventeen corrections, starting with..."
                ]
            },
            switz: {
                neutral: [
                    "I'm exactly 50% in agreement with this comment.",
                    "This is neither good nor bad, which makes me FURIOUS!",
                    "Like gravy, this comment has multiple layers of neutrality."
                ],
                gravy: [
                    "This reminds me of gravy. Everything reminds me of gravy.",
                    "On a scale of water to gravy, this comment is maple syrup.",
                    "In Canada, we'd express this differently... with gravy."
                ]
            }
        };
    }

    createCommentUI() {
        // Add comment section to the page
        const commentSection = document.createElement('div');
        commentSection.id = 'user-comment-section';
        commentSection.className = 'comment-section';
        commentSection.innerHTML = `
            <div class="comment-container">
                <h3>💬 SUBMIT YOUR COMMENT</h3>
                <p class="comment-info">Your comment might be read live on air!</p>
                <div class="comment-form">
                    <input type="text" id="comment-username" placeholder="Username" maxlength="20" />
                    <textarea id="comment-text" placeholder="Share your thoughts..." maxlength="280"></textarea>
                    <div class="comment-controls">
                        <span class="char-count">280</span>
                        <button id="submit-comment" class="submit-btn">SEND TO ANCHORS</button>
                    </div>
                </div>
                <div class="comment-status" style="display: none;"></div>
            </div>
        `;
        
        // Find appropriate location (after chat section)
        const chatSection = document.querySelector('.chat-section');
        if (chatSection) {
            chatSection.parentNode.insertBefore(commentSection, chatSection.nextSibling);
        }
        
        // Add styles
        this.injectCommentStyles();
        
        // Set up event handlers
        this.setupCommentHandlers();
    }

    injectCommentStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #user-comment-section {
                padding: 3rem 2rem;
                max-width: 800px;
                margin: 0 auto;
            }
            
            .comment-container {
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid var(--static-red);
                border-radius: 15px;
                padding: 2rem;
            }
            
            .comment-container h3 {
                color: var(--static-red);
                font-family: 'Bebas Neue', sans-serif;
                font-size: 2rem;
                margin-bottom: 0.5rem;
                text-align: center;
            }
            
            .comment-info {
                text-align: center;
                color: #aaa;
                margin-bottom: 1.5rem;
            }
            
            .comment-form {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            #comment-username {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: #fff;
                padding: 0.8rem;
                border-radius: 5px;
                font-size: 1rem;
            }
            
            #comment-text {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: #fff;
                padding: 0.8rem;
                border-radius: 5px;
                font-size: 1rem;
                min-height: 100px;
                resize: vertical;
            }
            
            .comment-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .char-count {
                color: #aaa;
                font-size: 0.9rem;
            }
            
            .submit-btn {
                background: var(--static-red);
                color: #fff;
                border: none;
                padding: 0.8rem 2rem;
                border-radius: 5px;
                font-weight: bold;
                cursor: pointer;
                text-transform: uppercase;
                transition: all 0.3s ease;
            }
            
            .submit-btn:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
            }
            
            .submit-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .comment-status {
                margin-top: 1rem;
                padding: 1rem;
                border-radius: 5px;
                text-align: center;
                font-weight: bold;
            }
            
            .comment-status.success {
                background: rgba(0, 255, 0, 0.2);
                color: #0f0;
            }
            
            .comment-status.error {
                background: rgba(255, 0, 0, 0.2);
                color: #f00;
            }
        `;
        
        document.head.appendChild(style);
    }

    setupCommentHandlers() {
        const usernameInput = document.getElementById('comment-username');
        const textInput = document.getElementById('comment-text');
        const charCount = document.querySelector('.char-count');
        const submitBtn = document.getElementById('submit-comment');
        const statusDiv = document.querySelector('.comment-status');
        
        // Character count
        textInput.addEventListener('input', () => {
            const remaining = 280 - textInput.value.length;
            charCount.textContent = remaining;
            charCount.style.color = remaining < 20 ? '#ff0000' : '#aaa';
        });
        
        // Submit handler
        submitBtn.addEventListener('click', async () => {
            const username = usernameInput.value.trim();
            const text = textInput.value.trim();
            
            if (!username || !text) {
                this.showStatus('Please enter both username and comment', 'error');
                return;
            }
            
            // Check cooldown
            const userId = this.getUserId();
            const lastComment = this.commentModeration.userCooldowns.get(userId);
            if (lastComment && Date.now() - lastComment < this.commentModeration.cooldownPeriod) {
                const remaining = Math.ceil((this.commentModeration.cooldownPeriod - (Date.now() - lastComment)) / 1000);
                this.showStatus(`Please wait ${remaining} seconds before commenting again`, 'error');
                return;
            }
            
            // Moderate comment
            if (!this.moderateComment(text)) {
                this.showStatus('Your comment contains inappropriate content', 'error');
                return;
            }
            
            // Submit comment
            submitBtn.disabled = true;
            
            try {
                await this.submitComment(username, text);
                
                // Clear form
                usernameInput.value = '';
                textInput.value = '';
                charCount.textContent = '280';
                
                // Update cooldown
                this.commentModeration.userCooldowns.set(userId, Date.now());
                
                this.showStatus('Comment submitted! It might be read on air!', 'success');
                
            } catch (error) {
                this.showStatus('Failed to submit comment', 'error');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    showStatus(message, type) {
        const statusDiv = document.querySelector('.comment-status');
        statusDiv.textContent = message;
        statusDiv.className = `comment-status ${type}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }

    moderateComment(text) {
        // Check for banned words
        const words = text.toLowerCase().split(/\s+/);
        for (const word of words) {
            if (this.commentModeration.bannedWords.has(word)) {
                return false;
            }
        }
        
        // Check for spam patterns
        if (text.match(/(.)\1{5,}/)) { // Repeated characters
            return false;
        }
        
        if (text.match(/https?:\/\//)) { // URLs
            return false;
        }
        
        return true;
    }

    async submitComment(username, text) {
        const comment = {
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username: username,
            text: text,
            timestamp: Date.now(),
            read: false,
            userId: this.getUserId()
        };
        
        // Add to queue
        this.commentQueue.push(comment);
        
        // Send to backend
        try {
            await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comment)
            });
        } catch (error) {
            console.error('Failed to sync comment:', error);
        }
        
        // Also add to local chat display
        this.addToChatDisplay(comment);
    }

    addToChatDisplay(comment) {
        const chatBox = document.getElementById('chatBox');
        if (!chatBox) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `
            <div class="chat-user">${this.escapeHtml(comment.username)}</div>
            <div class="chat-text">${this.escapeHtml(comment.text)}</div>
        `;
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Remove old messages to prevent overflow
        while (chatBox.children.length > 50) {
            chatBox.removeChild(chatBox.firstChild);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getUserId() {
        // Get or create user ID
        let userId = localStorage.getItem('static_news_user_id');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('static_news_user_id', userId);
        }
        return userId;
    }

    initCelebrityVoting() {
        // Create voting UI
        this.createVotingUI();
        
        // Set up submission tracking
        this.celebrityTracking = {
            currentSubmissions: new Map(),
            votingStartTime: null,
            votingEndTime: null,
            votes: new Map(),
            lastWinner: null,
            nextVotingTime: Date.now() + this.votingConfig.submissionInterval
        };
        
        // Start voting cycle
        this.startVotingCycle();
    }

    createVotingUI() {
        // Add voting section to incidents page or as overlay
        const votingSection = document.createElement('div');
        votingSection.id = 'celebrity-voting-section';
        votingSection.className = 'voting-section';
        votingSection.style.display = 'none'; // Hidden until voting is active
        
        votingSection.innerHTML = `
            <div class="voting-container">
                <h2>🌟 VOTE FOR NEXT CELEBRITY GUEST</h2>
                <div class="voting-timer">
                    <span class="timer-text">Time Remaining: </span>
                    <span class="timer-countdown">5:00</span>
                </div>
                <div class="voting-options" id="voting-options">
                    <!-- Options will be added dynamically -->
                </div>
                <div class="voting-results" style="display: none;">
                    <h3>VOTING RESULTS</h3>
                    <div class="results-list"></div>
                </div>
            </div>
        `;
        
        // Add to page
        const mainContent = document.querySelector('.broadcast-content');
        if (mainContent) {
            mainContent.appendChild(votingSection);
        }
        
        // Add voting styles
        this.injectVotingStyles();
    }

    injectVotingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #celebrity-voting-section {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
                width: 90%;
                max-width: 600px;
                background: rgba(0, 0, 0, 0.95);
                border: 3px solid var(--static-red);
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 0 50px rgba(255, 0, 0, 0.8);
            }
            
            .voting-container h2 {
                color: var(--static-red);
                font-family: 'Bebas Neue', sans-serif;
                font-size: 2.5rem;
                text-align: center;
                margin-bottom: 1rem;
                text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
            }
            
            .voting-timer {
                text-align: center;
                font-size: 1.5rem;
                margin-bottom: 2rem;
                color: #fff;
            }
            
            .timer-countdown {
                color: var(--static-red);
                font-weight: bold;
                font-family: monospace;
                font-size: 2rem;
            }
            
            .voting-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .voting-option {
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 10px;
                padding: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .voting-option:hover {
                border-color: var(--static-red);
                transform: scale(1.02);
                box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
            }
            
            .voting-option.selected {
                background: rgba(255, 0, 0, 0.2);
                border-color: var(--static-red);
            }
            
            .voting-option h3 {
                color: #fff;
                margin: 0 0 0.5rem 0;
                font-size: 1.5rem;
            }
            
            .voting-option .vote-count {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: var(--static-red);
                color: #fff;
                padding: 0.3rem 0.8rem;
                border-radius: 20px;
                font-weight: bold;
            }
            
            .vote-bar {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 5px;
                background: var(--static-red);
                transition: width 0.3s ease;
            }
            
            .voting-results {
                text-align: center;
            }
            
            .results-list {
                margin-top: 1rem;
            }
            
            .result-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.8rem;
                margin: 0.5rem 0;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
            }
            
            .winner {
                background: rgba(255, 215, 0, 0.2);
                border: 2px solid gold;
            }
            
            /* Celebrity submission form */
            .celebrity-submit {
                margin-top: 2rem;
                padding-top: 2rem;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .celebrity-submit input {
                width: 100%;
                padding: 1rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: #fff;
                border-radius: 5px;
                font-size: 1rem;
            }
            
            .celebrity-submit button {
                margin-top: 1rem;
                width: 100%;
                padding: 1rem;
                background: var(--static-red);
                color: #fff;
                border: none;
                border-radius: 5px;
                font-weight: bold;
                cursor: pointer;
                text-transform: uppercase;
                transition: all 0.3s ease;
            }
            
            .celebrity-submit button:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
            }
        `;
        
        document.head.appendChild(style);
    }

    startVotingCycle() {
        // Check every minute for voting time
        setInterval(() => {
            const now = Date.now();
            
            if (now >= this.celebrityTracking.nextVotingTime && !this.activeVoting) {
                this.startVoting();
            }
            
        }, 60000); // Check every minute
        
        // Also allow celebrity submissions
        this.enableCelebritySubmissions();
    }

    enableCelebritySubmissions() {
        // Add submission form to comment section
        const commentSection = document.getElementById('user-comment-section');
        if (!commentSection) return;
        
        const submitDiv = document.createElement('div');
        submitDiv.className = 'celebrity-submit';
        submitDiv.innerHTML = `
            <h4 style="color: var(--static-red); margin-bottom: 1rem;">💫 Suggest a Celebrity Guest</h4>
            <input type="text" id="celebrity-name" placeholder="Celebrity name (will appear as cartoon)" maxlength="50" />
            <button id="submit-celebrity">SUBMIT CELEBRITY</button>
            <p style="color: #aaa; font-size: 0.9rem; margin-top: 0.5rem;">
                Top 5 suggestions are voted on every 4 hours!
            </p>
        `;
        
        commentSection.querySelector('.comment-container').appendChild(submitDiv);
        
        // Handle submissions
        document.getElementById('submit-celebrity').addEventListener('click', () => {
            const nameInput = document.getElementById('celebrity-name');
            const name = nameInput.value.trim();
            
            if (!name) return;
            
            // Check submission limit
            const userId = this.getUserId();
            const userSubmissions = Array.from(this.celebritySubmissions.values())
                .filter(s => s.userId === userId).length;
            
            if (userSubmissions >= this.votingConfig.maxSubmissionsPerUser) {
                this.showStatus('Maximum submissions reached for this voting period', 'error');
                return;
            }
            
            // Add submission
            const submission = {
                id: `celeb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: name,
                userId: userId,
                timestamp: Date.now()
            };
            
            this.celebritySubmissions.set(submission.id, submission);
            nameInput.value = '';
            
            this.showStatus('Celebrity suggestion submitted!', 'success');
        });
    }

    async startVoting() {
        console.log('🗳️ Starting celebrity voting...');
        
        this.activeVoting = true;
        this.celebrityTracking.votingStartTime = Date.now();
        this.celebrityTracking.votingEndTime = Date.now() + this.votingConfig.votingDuration;
        
        // Select 5 random submissions
        const submissions = Array.from(this.celebritySubmissions.values());
        const selected = this.selectRandomSubmissions(submissions, 5);
        
        if (selected.length === 0) {
            console.log('No celebrity submissions for voting');
            this.activeVoting = false;
            this.celebrityTracking.nextVotingTime = Date.now() + this.votingConfig.submissionInterval;
            return;
        }
        
        // Clear submissions for next round
        this.celebritySubmissions.clear();
        
        // Set up voting options
        this.currentVotingOptions = selected;
        this.votes = new Map(selected.map(s => [s.id, 0]));
        
        // Show voting UI
        this.showVotingUI(selected);
        
        // Update ticker
        this.updateTicker('🗳️ CELEBRITY GUEST VOTING NOW LIVE! Cast your vote in the next 5 minutes!');
        
        // Start countdown
        this.startVotingCountdown();
    }

    selectRandomSubmissions(submissions, count) {
        // Shuffle and select
        const shuffled = submissions.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    showVotingUI(options) {
        const votingSection = document.getElementById('celebrity-voting-section');
        const optionsContainer = document.getElementById('voting-options');
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Add voting options
        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'voting-option';
            optionDiv.dataset.optionId = option.id;
            
            optionDiv.innerHTML = `
                <h3>${this.escapeHtml(option.name)}</h3>
                <span class="vote-count">0 votes</span>
                <div class="vote-bar" style="width: 0%"></div>
            `;
            
            optionDiv.addEventListener('click', () => this.castVote(option.id));
            
            optionsContainer.appendChild(optionDiv);
        });
        
        // Show section
        votingSection.style.display = 'block';
        
        // Animate in
        gsap.from(votingSection, {
            scale: 0,
            duration: 0.5,
            ease: 'back.out(1.7)'
        });
    }

    castVote(optionId) {
        const userId = this.getUserId();
        const voteKey = `vote_${this.celebrityTracking.votingStartTime}_${userId}`;
        
        // Check if already voted
        if (localStorage.getItem(voteKey)) {
            this.showStatus('You have already voted!', 'error');
            return;
        }
        
        // Record vote
        this.votes.set(optionId, (this.votes.get(optionId) || 0) + 1);
        localStorage.setItem(voteKey, optionId);
        
        // Update UI
        this.updateVoteDisplay();
        
        // Mark as selected
        document.querySelectorAll('.voting-option').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`[data-option-id="${optionId}"]`).classList.add('selected');
        
        this.showStatus('Vote cast successfully!', 'success');
    }

    updateVoteDisplay() {
        const totalVotes = Array.from(this.votes.values()).reduce((a, b) => a + b, 0);
        
        this.votes.forEach((count, optionId) => {
            const option = document.querySelector(`[data-option-id="${optionId}"]`);
            if (!option) return;
            
            const voteCount = option.querySelector('.vote-count');
            const voteBar = option.querySelector('.vote-bar');
            
            voteCount.textContent = `${count} votes`;
            
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            voteBar.style.width = `${percentage}%`;
        });
    }

    startVotingCountdown() {
        const timerEl = document.querySelector('.timer-countdown');
        
        const updateTimer = () => {
            const remaining = this.celebrityTracking.votingEndTime - Date.now();
            
            if (remaining <= 0) {
                this.endVoting();
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            requestAnimationFrame(updateTimer);
        };
        
        updateTimer();
    }

    async endVoting() {
        console.log('🏁 Ending celebrity voting...');
        
        // Find winner
        let winner = null;
        let maxVotes = 0;
        
        this.votes.forEach((count, optionId) => {
            if (count > maxVotes) {
                maxVotes = count;
                winner = this.currentVotingOptions.find(o => o.id === optionId);
            }
        });
        
        if (!winner) {
            // No votes, pick random
            winner = this.currentVotingOptions[0];
        }
        
        this.celebrityTracking.lastWinner = winner;
        
        // Show results
        this.showVotingResults(winner);
        
        // Schedule celebrity appearance
        const appearanceDelay = Math.random() * this.votingConfig.guestAppearanceDelay;
        setTimeout(() => {
            this.triggerCelebrityAppearance(winner);
        }, appearanceDelay);
        
        // Reset for next cycle
        this.activeVoting = false;
        this.celebrityTracking.nextVotingTime = Date.now() + this.votingConfig.submissionInterval;
        
        // Hide voting UI after 10 seconds
        setTimeout(() => {
            const votingSection = document.getElementById('celebrity-voting-section');
            gsap.to(votingSection, {
                scale: 0,
                duration: 0.5,
                ease: 'back.in(1.7)',
                onComplete: () => {
                    votingSection.style.display = 'none';
                }
            });
        }, 10000);
    }

    showVotingResults(winner) {
        const optionsContainer = document.getElementById('voting-options');
        const resultsContainer = document.querySelector('.voting-results');
        const resultsList = resultsContainer.querySelector('.results-list');
        
        // Hide options
        optionsContainer.style.display = 'none';
        
        // Sort by votes
        const sortedOptions = this.currentVotingOptions.sort((a, b) => {
            return (this.votes.get(b.id) || 0) - (this.votes.get(a.id) || 0);
        });
        
        // Display results
        resultsList.innerHTML = '';
        sortedOptions.forEach((option, index) => {
            const votes = this.votes.get(option.id) || 0;
            const isWinner = option.id === winner.id;
            
            const resultDiv = document.createElement('div');
            resultDiv.className = `result-item ${isWinner ? 'winner' : ''}`;
            resultDiv.innerHTML = `
                <span>${index + 1}. ${this.escapeHtml(option.name)}</span>
                <span>${votes} votes ${isWinner ? '👑' : ''}</span>
            `;
            
            resultsList.appendChild(resultDiv);
        });
        
        // Show results
        resultsContainer.style.display = 'block';
        
        // Update ticker
        this.updateTicker(`🎉 ${winner.name} wins the celebrity vote! Appearance coming soon...`);
    }

    async triggerCelebrityAppearance(winner) {
        console.log(`🌟 Triggering celebrity appearance: ${winner.name}`);
        
        // Generate celebrity character
        const guestId = await window.aiCharacterSystem.generateCelebrityGuest(winner.name);
        
        // Create multi-angle video sequence
        await this.generateMultiAngleCelebrityVideo(guestId, winner.name);
    }

    async generateMultiAngleCelebrityVideo(guestId, celebrityName) {
        console.log('🎬 Generating multi-angle celebrity video...');
        
        // Use the multi-angle video production system
        if (window.multiAngleVideoProduction) {
            const duration = 60 + Math.random() * 60; // 60-120 seconds
            
            const appearance = await window.multiAngleVideoProduction.createCelebrityAppearance(
                celebrityName,
                duration
            );
            
            // Play the generated video
            await this.playCelebrityVideo(appearance.video, appearance.script, celebrityName);
            
            return appearance;
        }
        
        // Fallback if system not available
        console.warn('Multi-angle video production not available, using fallback');
        await this.generateFallbackCelebrityVideo(guestId, celebrityName);
    }
    
    async playCelebrityVideo(videoUrl, script, celebrityName) {
        console.log(`▶️ Playing celebrity appearance: ${celebrityName}`);
        
        // Take over the main broadcast
        const broadcastArea = document.querySelector('.live-player-container');
        if (!broadcastArea) return;
        
        // Create or get celebrity video player
        let celebrityPlayer = document.getElementById('celebrity-video-player');
        if (!celebrityPlayer) {
            celebrityPlayer = document.createElement('video');
            celebrityPlayer.id = 'celebrity-video-player';
            celebrityPlayer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: 30;
                opacity: 0;
                transition: opacity 0.5s ease;
            `;
            celebrityPlayer.autoplay = true;
            broadcastArea.appendChild(celebrityPlayer);
        }
        
        // Update ticker
        this.updateTicker(`🌟 NOW: ${celebrityName} LIVE IN STUDIO!`);
        
        // Play video
        celebrityPlayer.src = videoUrl;
        celebrityPlayer.style.opacity = '1';
        
        await celebrityPlayer.play();
        
        // Wait for video to end
        await new Promise(resolve => {
            celebrityPlayer.onended = resolve;
        });
        
        // Fade out
        celebrityPlayer.style.opacity = '0';
        
        // Update ticker
        this.updateTicker(`😱 ${celebrityName} just VANISHED from the studio!`);
        
        // Trigger anchor reactions
        await this.triggerAnchorReactions();
    }
    
    async generateFallbackCelebrityVideo(guestId, celebrityName) {
        // Simple fallback implementation
        const script = await this.generateCelebrityScript(celebrityName);
        const character = window.aiCharacterSystem?.characters?.get(guestId);
        
        if (character) {
            const audioData = await window.aiCharacterSystem.generateAudio(script, guestId);
            const video = await window.aiCharacterSystem.generateLipSyncVideo(guestId, audioData, script);
            
            if (video) {
                await this.playCelebrityVideo(video, script, celebrityName);
            }
        }
    }

    async generateCelebrityScript(celebrityName) {
        // Generate appropriate script
        const scripts = {
            interview: [
                `Hello Static.news! I'm ${celebrityName} and I'm definitely real!`,
                "Wait, why does everyone look so confused?",
                "Is this live? Are you all okay? You seem... glitchy?",
                "I was told this was a normal interview but you're all acting strange!",
                "Anyway, I'm here to promote my new... wait, what am I promoting?",
                "This is the weirdest interview I've ever done!"
            ],
            confusion: [
                "Why do I feel like I'm made of pixels?",
                "My hands... they're so... cartoon-y?",
                "This isn't right. This isn't right at all!",
                "Are you real? Am I real? IS ANYTHING REAL?"
            ]
        };
        
        // Combine scripts
        const fullScript = [
            ...scripts.interview,
            "Wait a minute...",
            ...scripts.confusion,
            "I NEED TO GET OUT OF HERE!",
            "*celebrity disappears in a puff of digital smoke*"
        ].join(' ');
        
        return fullScript;
    }

    async generateAngleVideo(guestId, angle, script, startTime) {
        // Extract relevant script portion
        const words = script.split(' ');
        const wordsPerSecond = 3;
        const startWord = Math.floor(startTime * wordsPerSecond);
        const endWord = Math.floor((startTime + angle.duration) * wordsPerSecond);
        const angleScript = words.slice(startWord, endWord).join(' ');
        
        // Generate video for this angle
        const character = window.aiCharacterSystem.characters.get(guestId);
        
        // Generate audio for this segment
        const audioData = await window.aiCharacterSystem.generateAudio(angleScript, guestId);
        
        // Generate video with specific camera angle
        const video = await this.generateAngleSpecificVideo(
            character,
            audioData,
            angleScript,
            angle
        );
        
        return {
            url: video,
            angle: angle.name,
            duration: angle.duration,
            script: angleScript
        };
    }

    async generateAngleSpecificVideo(character, audioData, script, angle) {
        // This would integrate with video generation to create specific angles
        // For now, using the standard lip-sync with modifications
        
        const video = await window.aiCharacterSystem.generateLipSyncVideo(
            character.id,
            audioData,
            script
        );
        
        // Apply angle-specific modifications
        // In production, this would use different camera positions
        
        return video;
    }

    async playMultiAngleSequence(videos, fullScript) {
        console.log('▶️ Playing multi-angle celebrity sequence...');
        
        // Take over the main video player
        const videoElement = document.getElementById('ai-character-video') || 
                           document.getElementById('character-video');
        
        if (!videoElement) {
            console.error('No video element found');
            return;
        }
        
        // Show video player
        videoElement.style.opacity = '1';
        
        // Play videos in sequence
        for (const video of videos) {
            videoElement.src = video.url;
            await videoElement.play();
            
            // Wait for this segment to complete
            await new Promise(resolve => {
                setTimeout(resolve, video.duration * 1000);
            });
        }
        
        // Celebrity disappears
        await this.playCelebrityDisappearance();
        
        // Hide video player
        videoElement.style.opacity = '0';
        
        // Trigger anchor reactions
        await this.triggerAnchorReactions();
    }

    async playCelebrityDisappearance() {
        // Create disappearance effect
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        canvas.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
        `;
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // Particle effect
        const particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height / 2 + (Math.random() - 0.5) * 200,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            });
        }
        
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                
                p.x += p.vx;
                p.y += p.vy;
                p.size *= 0.98;
            });
            
            if (particles[0].size > 0.1) {
                requestAnimationFrame(animate);
            } else {
                canvas.remove();
            }
        };
        
        animate();
    }

    async triggerAnchorReactions() {
        // Anchors react to celebrity disappearance
        const reactions = [
            { anchor: 'ray', text: "Did that cartoon just... disappear? This is clearly deep state technology!" },
            { anchor: 'berkeley', text: "That was EXTREMELY problematic! Cartoons can't just vanish!" },
            { anchor: 'switz', text: "I'm 50% sure that was real and 50% sure it wasn't. Like digital gravy!" }
        ];
        
        for (const reaction of reactions) {
            // Queue anchor reaction
            if (window.aiCharacterBroadcastIntegration) {
                window.aiCharacterBroadcastIntegration.queueVideo({
                    anchor: reaction.anchor,
                    text: reaction.text,
                    priority: 'high',
                    timestamp: Date.now()
                });
            }
            
            await this.sleep(5000);
        }
    }

    updateTicker(message) {
        const tickerContent = document.querySelector('.ticker-content');
        if (!tickerContent) return;
        
        // Add new ticker item
        const tickerItem = document.createElement('span');
        tickerItem.className = 'ticker-item';
        tickerItem.textContent = message;
        tickerItem.style.color = '#ffff00';
        tickerItem.style.fontWeight = 'bold';
        
        // Insert at beginning
        tickerContent.insertBefore(tickerItem, tickerContent.firstChild);
    }

    startInteractionLoops() {
        // Random comment reading
        this.startCommentReadingLoop();
        
        // Monitor system
        this.startMonitoring();
    }

    startCommentReadingLoop() {
        const checkComments = () => {
            const now = Date.now();
            
            if (now - this.lastCommentRead >= this.commentReadInterval && this.commentQueue.length > 0) {
                this.readRandomComment();
                this.lastCommentRead = now;
                
                // Set next interval (30-60 minutes)
                this.commentReadInterval = 1800000 + Math.random() * 1800000;
            }
            
            // Check again in 1 minute
            setTimeout(checkComments, 60000);
        };
        
        checkComments();
    }

    async readRandomComment() {
        // Get unread comments
        const unreadComments = this.commentQueue.filter(c => !c.read);
        if (unreadComments.length === 0) return;
        
        // Pick random comment
        const comment = unreadComments[Math.floor(Math.random() * unreadComments.length)];
        comment.read = true;
        
        console.log(`💬 Reading comment from ${comment.username}: ${comment.text}`);
        
        // Pick random anchor
        const anchors = ['ray', 'berkeley', 'switz'];
        const anchor = anchors[Math.floor(Math.random() * anchors.length)];
        
        // Generate reaction
        const reaction = this.generateCommentReaction(anchor, comment);
        
        // Queue for broadcast
        const script = `We have a comment from ${comment.username} who says: "${comment.text}". ${reaction}`;
        
        // Send to broadcast
        await this.sendToBroadcast({
            type: 'comment_reading',
            anchor: anchor,
            script: script,
            comment: comment
        });
    }

    generateCommentReaction(anchor, comment) {
        const reactions = this.anchorReactions[anchor];
        const sentiment = this.analyzeCommentSentiment(comment.text);
        
        let reactionPool;
        
        switch (sentiment) {
            case 'positive':
                reactionPool = reactions.positive || reactions.neutral;
                break;
            case 'negative':
                reactionPool = reactions.negative || reactions.neutral;
                break;
            case 'question':
                reactionPool = reactions.confused || reactions.factCheck || reactions.neutral;
                break;
            default:
                reactionPool = reactions.neutral || reactions.confused || Object.values(reactions).flat();
        }
        
        if (comment.text.toLowerCase().includes('gravy') && anchor === 'switz') {
            reactionPool = reactions.gravy;
        }
        
        return reactionPool[Math.floor(Math.random() * reactionPool.length)];
    }

    analyzeCommentSentiment(text) {
        const lower = text.toLowerCase();
        
        if (lower.includes('?')) return 'question';
        if (lower.match(/love|great|awesome|amazing/)) return 'positive';
        if (lower.match(/hate|stupid|dumb|sucks/)) return 'negative';
        
        return 'neutral';
    }

    async sendToBroadcast(data) {
        // Send to broadcast system via WebSocket
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
        
        // Also trigger character video if available
        if (window.aiCharacterBroadcastIntegration && data.script) {
            window.aiCharacterBroadcastIntegration.queueVideo({
                anchor: data.anchor,
                text: data.script,
                priority: 'normal',
                timestamp: Date.now()
            });
        }
    }

    connectToBroadcast() {
        // WebSocket connection for broadcast integration
        const wsUrl = 'wss://alledged-static-news-backend.hf.space/ws';
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('✅ Connected to broadcast for user interactions');
        };
        
        this.ws.onclose = () => {
            setTimeout(() => this.connectToBroadcast(), 5000);
        };
    }

    startMonitoring() {
        setInterval(() => {
            const stats = {
                commentQueue: this.commentQueue.length,
                unreadComments: this.commentQueue.filter(c => !c.read).length,
                celebritySubmissions: this.celebritySubmissions.size,
                activeVoting: this.activeVoting,
                nextVoting: new Date(this.celebrityTracking.nextVotingTime).toLocaleTimeString()
            };
            
            console.log('📊 User Interaction Stats:', stats);
        }, 60000); // Every minute
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async sendAdminCommand(command, data) {
        // Admin commands require backend authentication
        const response = await fetch('/api/admin/command', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ command, data })
        });
        
        if (!response.ok) {
            throw new Error('Admin command failed');
        }
        
        return response.json();
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('live') || 
        window.location.pathname.includes('incidents')) {
        window.userInteractionSystem = new UserInteractionSystem();
        console.log('💬 User Interaction System initialized');
        console.log('Admin functions require authentication and are not publicly accessible');
    }
});

// Export
window.UserInteractionSystem = UserInteractionSystem;