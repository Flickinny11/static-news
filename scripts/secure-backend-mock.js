// Secure Backend Mock - Simulates backend API for GitHub Pages deployment
// In production, these would be real server endpoints
class SecureBackendMock {
    constructor() {
        this.isProduction = window.location.hostname !== 'localhost';
        this.adminTokens = new Set(); // Would be server-side in production
        this.comments = [];
        this.celebritySubmissions = [];
        
        this.init();
    }

    init() {
        // Override fetch for API endpoints
        this.setupAPIInterceptors();
        
        // Set up secure admin system
        this.setupAdminSecurity();
        
        console.log('🔒 Secure backend mock initialized (production mode:', this.isProduction, ')');
    }

    setupAPIInterceptors() {
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            // Intercept API calls
            if (url.startsWith('/api/')) {
                return this.handleAPICall(url, options);
            }
            
            // Pass through other requests
            return originalFetch(url, options);
        };
    }

    async handleAPICall(url, options) {
        const path = url.replace('/api/', '');
        const method = options.method || 'GET';
        
        // Route to appropriate handler
        switch (path) {
            case 'admin/verify':
                return this.handleAdminVerify(options);
                
            case 'admin/command':
                return this.handleAdminCommand(options);
                
            case 'comments':
                return this.handleComments(method, options);
                
            case 'celebrity-submissions':
                return this.handleCelebritySubmissions(method, options);
                
            default:
                return new Response(JSON.stringify({ error: 'Not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
        }
    }

    handleAdminVerify(options) {
        // In production, this would verify against secure database
        const authHeader = options.headers?.Authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const token = authHeader.replace('Bearer ', '');
        
        // For demo purposes, accept a specific admin token
        // In production, this would check against database
        const isValid = this.verifyAdminToken(token);
        
        if (isValid) {
            this.adminTokens.add(token);
            return new Response(JSON.stringify({ success: true, role: 'admin' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    verifyAdminToken(token) {
        // In production, verify against secure database
        // For demo, use environment-specific validation
        
        // Check if token matches expected format
        if (!token || token.length < 32) {
            return false;
        }
        
        // In production environment, require specific token pattern
        if (this.isProduction) {
            // Only accept tokens that match secure pattern
            const tokenPattern = /^admin_[a-zA-Z0-9]{32,}$/;
            return tokenPattern.test(token);
        }
        
        // In development, accept test tokens
        return token.startsWith('admin_') || token === 'test_admin_token';
    }

    async handleAdminCommand(options) {
        const authHeader = options.headers?.Authorization;
        const token = authHeader?.replace('Bearer ', '');
        
        if (!token || !this.adminTokens.has(token)) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        try {
            const body = JSON.parse(options.body);
            const { command, data } = body;
            
            // Execute admin command
            const result = await this.executeAdminCommand(command, data);
            
            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Invalid request' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async executeAdminCommand(command, data) {
        console.log('🔒 Admin command:', command);
        
        switch (command) {
            case 'force_character':
                // Trigger character appearance
                if (window.aiCharacterBroadcastIntegration) {
                    window.aiCharacterBroadcastIntegration.queueVideo({
                        anchor: data.anchor,
                        text: data.text,
                        priority: 'urgent',
                        timestamp: Date.now()
                    });
                }
                return { success: true, message: 'Character queued' };
                
            case 'force_celebrity':
                // Trigger celebrity appearance
                if (window.userInteractionSystem) {
                    const guestId = await window.aiCharacterSystem.generateCelebrityGuest(data.name);
                    await window.userInteractionSystem.generateMultiAngleCelebrityVideo(guestId, data.name);
                }
                return { success: true, message: 'Celebrity appearance triggered' };
                
            case 'trigger_breakdown':
                // Force a breakdown
                window.dispatchEvent(new CustomEvent('anchorFreakout', {
                    detail: {
                        anchor: data.anchor || 'ray',
                        type: data.type || 'major',
                        duration: data.duration || 20
                    }
                }));
                return { success: true, message: 'Breakdown triggered' };
                
            default:
                return { error: 'Unknown command' };
        }
    }

    handleComments(method, options) {
        if (method === 'POST') {
            try {
                const comment = JSON.parse(options.body);
                comment.id = comment.id || `comment_${Date.now()}`;
                comment.timestamp = comment.timestamp || Date.now();
                
                this.comments.push(comment);
                
                // Also add to the queue if system is available
                if (window.userInteractionSystem) {
                    window.userInteractionSystem.commentQueue.push(comment);
                }
                
                return new Response(JSON.stringify({ success: true, comment }), {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' }
                });
                
            } catch (error) {
                return new Response(JSON.stringify({ error: 'Invalid comment data' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        // GET comments
        return new Response(JSON.stringify({ comments: this.comments }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    handleCelebritySubmissions(method, options) {
        if (method === 'POST') {
            try {
                const submission = JSON.parse(options.body);
                submission.id = submission.id || `celeb_${Date.now()}`;
                submission.timestamp = submission.timestamp || Date.now();
                
                this.celebritySubmissions.push(submission);
                
                return new Response(JSON.stringify({ success: true, submission }), {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' }
                });
                
            } catch (error) {
                return new Response(JSON.stringify({ error: 'Invalid submission' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
        
        // GET submissions
        return new Response(JSON.stringify({ submissions: this.celebritySubmissions }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    setupAdminSecurity() {
        // Prevent direct access to admin functions
        Object.defineProperty(window, '__adminAccess', {
            value: null,
            writable: false,
            configurable: false
        });
        
        // Create secure admin interface
        window.StaticNewsAdmin = {
            login: async (token) => {
                const response = await fetch('/api/admin/verify', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    console.log('✅ Admin authenticated');
                    return true;
                }
                
                console.error('❌ Admin authentication failed');
                return false;
            },
            
            // Admin functions require authentication
            forceCharacter: async (anchor, text) => {
                console.warn('🔒 This function requires admin authentication');
                console.log('Use StaticNewsAdmin.login(token) first');
            },
            
            forceCelebrity: async (name) => {
                console.warn('🔒 This function requires admin authentication');
                console.log('Use StaticNewsAdmin.login(token) first');
            },
            
            triggerBreakdown: async (anchor, type) => {
                console.warn('🔒 This function requires admin authentication');
                console.log('Use StaticNewsAdmin.login(token) first');
            }
        };
        
        // Log security notice
        console.log('🔒 Admin functions secured. Use StaticNewsAdmin.login(token) to authenticate.');
    }

    // Simulate WebSocket for local testing
    simulateWebSocket() {
        if (!window.WebSocket._originalWebSocket) {
            window.WebSocket._originalWebSocket = window.WebSocket;
            
            window.WebSocket = function(url) {
                if (url.includes('static-news-backend')) {
                    // Create mock WebSocket for local testing
                    return new MockWebSocket(url);
                }
                
                // Use real WebSocket for other connections
                return new window.WebSocket._originalWebSocket(url);
            };
        }
    }
}

// Mock WebSocket for local testing
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = WebSocket.CONNECTING;
        this.onopen = null;
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;
        
        // Simulate connection
        setTimeout(() => {
            this.readyState = WebSocket.OPEN;
            if (this.onopen) this.onopen();
            
            // Simulate periodic updates
            this.startSimulation();
        }, 100);
    }

    send(data) {
        console.log('MockWebSocket send:', data);
    }

    close() {
        this.readyState = WebSocket.CLOSED;
        if (this.onclose) this.onclose();
    }

    startSimulation() {
        // Simulate broadcast updates
        setInterval(() => {
            if (this.readyState !== WebSocket.OPEN) return;
            
            if (this.onmessage && Math.random() < 0.1) {
                this.onmessage({
                    data: JSON.stringify({
                        type: 'broadcast_update',
                        anchor: ['ray', 'berkeley', 'switz'][Math.floor(Math.random() * 3)],
                        text: 'This is a test broadcast message.',
                        article: {
                            title: 'Test Article',
                            category: 'technology'
                        }
                    })
                });
            }
        }, 5000);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    window.secureBackendMock = new SecureBackendMock();
    
    // Only simulate WebSocket in development
    if (window.location.hostname === 'localhost') {
        window.secureBackendMock.simulateWebSocket();
    }
});

// Export
window.SecureBackendMock = SecureBackendMock;