/**
 * Test WebSocket Connection to HuggingFace Space
 * Run this in browser console to test connection
 */

function testWebSocketConnection() {
    console.log('🔍 Testing WebSocket connections to HuggingFace Space...');
    
    const possibleUrls = [
        'wss://alledged-static-news-backend.hf.space/ws',
        'wss://alledged-static-news-backend.hf.space:8765/ws',
        'wss://alledged-static-news-backend.hf.space/queue/join',
        'wss://alledged-static-news-backend.hf.space/',
        'ws://alledged-static-news-backend.hf.space:8765',
        'wss://alledged-static-news-backend.hf.space/run/predict'
    ];
    
    possibleUrls.forEach((url, index) => {
        try {
            const ws = new WebSocket(url);
            
            ws.onopen = () => {
                console.log(`✅ SUCCESS: Connected to ${url}`);
                ws.send(JSON.stringify({ type: 'start_stream', quality: '720p' }));
            };
            
            ws.onmessage = (event) => {
                console.log(`📨 Message from ${url}:`, event.data.substring(0, 100) + '...');
            };
            
            ws.onerror = (error) => {
                console.error(`❌ ERROR on ${url}:`, error);
            };
            
            ws.onclose = (event) => {
                console.log(`🔌 Closed ${url} - Code: ${event.code}, Reason: ${event.reason}`);
            };
            
            // Auto close after 10 seconds
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            }, 10000);
            
        } catch (error) {
            console.error(`❌ Failed to create WebSocket for ${url}:`, error);
        }
    });
}

// Instructions for use
console.log(`
📡 WebSocket Connection Tester for Static.news
========================================
To test the connection, run: testWebSocketConnection()

This will try multiple possible WebSocket URLs and show which one works.
The correct URL should be used in live-stream-connector.js

Current HuggingFace Space: https://alledged-static-news-backend.hf.space
`);

// Export for use
window.testWebSocketConnection = testWebSocketConnection;