// Backend Connection Test & Verification

class BackendTester {
    constructor() {
        this.results = {
            api: false,
            websocket: false,
            stream: false,
            endpoints: {}
        };
    }
    
    async runTests() {
        console.log('🔍 Testing Static.news Backend Connection...');
        
        // Test API endpoints
        await this.testAPI();
        
        // Test WebSocket
        await this.testWebSocket();
        
        // Test Audio Stream
        await this.testStream();
        
        // Display results
        this.displayResults();
    }
    
    async testAPI() {
        const endpoints = [
            { name: 'Status', url: '/api/status' },
            { name: 'Dialogue', url: '/api/dialogue' }
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${CONFIG.API_URL}${endpoint.url}`);
                this.results.endpoints[endpoint.name] = {
                    status: response.status,
                    ok: response.ok,
                    data: response.ok ? await response.json() : null
                };
                
                if (response.ok) {
                    console.log(`✅ ${endpoint.name}: Connected`);
                } else {
                    console.log(`❌ ${endpoint.name}: Failed (${response.status})`);
                }
            } catch (error) {
                console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
                this.results.endpoints[endpoint.name] = {
                    status: 0,
                    ok: false,
                    error: error.message
                };
            }
        }
        
        this.results.api = Object.values(this.results.endpoints).some(e => e.ok);
    }
    
    async testWebSocket() {
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket(`${CONFIG.WS_URL}/ws`);
                
                ws.onopen = () => {
                    console.log('✅ WebSocket: Connected');
                    this.results.websocket = true;
                    ws.close();
                    resolve();
                };
                
                ws.onerror = (error) => {
                    console.log('❌ WebSocket: Connection failed');
                    this.results.websocket = false;
                    resolve();
                };
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    if (ws.readyState !== WebSocket.OPEN) {
                        console.log('❌ WebSocket: Connection timeout');
                        this.results.websocket = false;
                        ws.close();
                        resolve();
                    }
                }, 5000);
            } catch (error) {
                console.log('❌ WebSocket: Error - ' + error.message);
                this.results.websocket = false;
                resolve();
            }
        });
    }
    
    async testStream() {
        try {
            const audio = new Audio(`${CONFIG.API_URL}/stream`);
            
            audio.addEventListener('loadstart', () => {
                console.log('✅ Audio Stream: Available');
                this.results.stream = true;
            });
            
            audio.addEventListener('error', () => {
                console.log('❌ Audio Stream: Failed to load');
                this.results.stream = false;
            });
            
            // Try to load
            audio.load();
            
            // Clean up after test
            setTimeout(() => {
                audio.pause();
                audio.src = '';
            }, 2000);
        } catch (error) {
            console.log('❌ Audio Stream: Error - ' + error.message);
            this.results.stream = false;
        }
    }
    
    displayResults() {
        const allPassed = this.results.api && this.results.websocket && this.results.stream;
        
        console.log('\n📊 Backend Test Results:');
        console.log('========================');
        console.log(`API Endpoints: ${this.results.api ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`WebSocket: ${this.results.websocket ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Audio Stream: ${this.results.stream ? '✅ PASS' : '❌ FAIL'}`);
        console.log('========================');
        
        if (allPassed) {
            console.log('🎉 All tests passed! Backend is fully operational.');
        } else {
            console.log('⚠️  Some tests failed. Check backend deployment.');
            
            // If all tests fail, suggest fallback to demo mode
            if (!this.results.api && !this.results.websocket && !this.results.stream) {
                console.log('\n💡 Switching to demo mode...');
                window.CONFIG.DEMO_MODE = true;
            }
        }
        
        // Display backend info
        if (this.results.endpoints.Status?.data) {
            console.log('\n📡 Backend Status:');
            console.log(this.results.endpoints.Status.data);
        }
    }
}

// Run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (!CONFIG.DEMO_MODE) {
        const tester = new BackendTester();
        tester.runTests();
    }
});