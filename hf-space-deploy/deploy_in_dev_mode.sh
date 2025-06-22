#!/bin/bash
# Run this script from inside the HuggingFace Space Dev Mode container

echo "🚀 Deploying REAL AI Broadcast System in Dev Mode"
echo "================================================"

# Check if we're in the right place
if [ ! -f "app.py" ]; then
    echo "❌ Error: Not in the HF Space directory"
    echo "Please run this from /home/user/app in the dev container"
    exit 1
fi

# Backup current files
echo "📦 Backing up current files..."
cp app.py app_backup.py 2>/dev/null
cp requirements.txt requirements_backup.txt 2>/dev/null

# Create the REAL broadcast system files
echo "📝 Creating new broadcast system..."

# Create the updated requirements.txt with minimal dependencies for testing
cat > requirements.txt << 'EOF'
# Core requirements
gradio==4.16.0
opencv-python-headless==4.8.1.78
numpy==1.24.3
websockets==12.0
feedparser==6.0.10
requests==2.31.0
Pillow==10.1.0

# For initial testing, we'll add AI models incrementally
torch==2.1.0
torchvision==0.16.0
transformers==4.35.0

# Basic TTS for testing
TTS==0.21.0
EOF

# Copy the REAL app.py content
# Since I can't directly copy from your local machine, here's what to do:
echo ""
echo "📋 MANUAL STEP REQUIRED:"
echo "========================"
echo "You need to copy the content of app_final.py to app.py"
echo ""
echo "Option 1: From your local machine:"
echo "  1. Copy content of /Volumes/Logan T7 Touch/static.news/hf-space-deploy/app_final.py"
echo "  2. Paste it into app.py in the dev container"
echo ""
echo "Option 2: Use wget if you have it hosted somewhere:"
echo "  wget -O app.py [URL_TO_YOUR_APP_FINAL_PY]"
echo ""
echo "Option 3: Use cat to create it:"
echo "  cat > app.py << 'EOF'"
echo "  [Paste the content]"
echo "  EOF"
echo ""

# Create a simple test version for now
cat > app_simple_test.py << 'EOF'
"""
Static.news - Test Version for Dev Mode
"""

import gradio as gr
import cv2
import numpy as np
import json
import asyncio
import websockets
from datetime import datetime
import base64
import threading
import time
import logging
import feedparser

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StaticNewsTestBroadcast:
    def __init__(self):
        self.broadcasting = True
        self.frame_width = 1280
        self.frame_height = 720
        self.fps = 24
        self.current_frame = None
        self.connected_clients = set()
        self.news_queue = []
        
        logger.info("🚀 Starting Static.news Test Broadcast")
        self.start()
    
    def start(self):
        threading.Thread(target=self.broadcast_loop, daemon=True).start()
        threading.Thread(target=self.news_loop, daemon=True).start()
    
    def news_loop(self):
        """Fetch real news"""
        while self.broadcasting:
            try:
                feed = feedparser.parse('http://rss.cnn.com/rss/cnn_topstories.rss')
                self.news_queue = [entry.title for entry in feed.entries[:5]]
            except:
                self.news_queue = ["Test news story"]
            time.sleep(60)
    
    def generate_frame(self):
        """Generate test frame with news"""
        frame = np.zeros((self.frame_height, self.frame_width, 3), dtype=np.uint8)
        
        # Background
        for y in range(self.frame_height):
            blue = int(20 + (y / self.frame_height) * 30)
            frame[y] = [blue - 5, blue, blue + 10]
        
        # Header
        cv2.rectangle(frame, (0, 0), (self.frame_width, 80), (150, 0, 0), -1)
        cv2.putText(frame, "STATIC.NEWS", (50, 55), 
                   cv2.FONT_HERSHEY_BOLD, 2, (255, 255, 255), 3)
        
        # LIVE indicator
        cv2.circle(frame, (1150, 40), 10, (0, 0, 255), -1)
        cv2.putText(frame, "LIVE", (1170, 48), 
                   cv2.FONT_HERSHEY_BOLD, 1, (255, 255, 255), 2)
        
        # Show we're in dev mode
        cv2.putText(frame, "DEV MODE - REAL SYSTEM DEPLOYING", (300, 300),
                   cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 0), 2)
        
        # Show news
        if self.news_queue:
            cv2.putText(frame, self.news_queue[0][:80], (50, 500),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        # Time
        cv2.putText(frame, datetime.now().strftime("%I:%M:%S %p"), 
                   (1050, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        return frame
    
    def broadcast_loop(self):
        frame_time = 1.0 / self.fps
        while self.broadcasting:
            start = time.time()
            self.current_frame = self.generate_frame()
            elapsed = time.time() - start
            if elapsed < frame_time:
                time.sleep(frame_time - elapsed)
    
    def get_frame_bytes(self):
        if self.current_frame is not None:
            _, buffer = cv2.imencode('.jpg', self.current_frame)
            return buffer.tobytes()
        return None

# Create broadcast
broadcast = StaticNewsTestBroadcast()

# WebSocket handler
async def websocket_handler(websocket, path):
    broadcast.connected_clients.add(websocket)
    logger.info(f"Client connected. Total: {len(broadcast.connected_clients)}")
    
    try:
        await websocket.send(json.dumps({
            "type": "connected",
            "message": "Connected to Static.news Dev Mode"
        }))
        
        while True:
            if broadcast.current_frame is not None:
                _, buffer = cv2.imencode('.jpg', broadcast.current_frame)
                await websocket.send(json.dumps({
                    "type": "frame",
                    "data": base64.b64encode(buffer).decode('utf-8'),
                    "timestamp": datetime.now().isoformat()
                }))
            
            await asyncio.sleep(1/24)
            
    except websockets.exceptions.ConnectionClosed:
        broadcast.connected_clients.remove(websocket)

# Gradio interface
with gr.Blocks(title="Static.news DEV", theme=gr.themes.Monochrome()) as app:
    gr.Markdown("# 📺 STATIC.NEWS - Dev Mode Test")
    gr.Markdown("### Real broadcast system is being deployed...")
    
    video = gr.Image(
        value=broadcast.get_frame_bytes,
        label="🔴 LIVE TEST",
        every=1/24,
        streaming=True
    )
    
    gr.Markdown("""
    ✅ WebSocket working  
    ✅ News aggregation working  
    ⏳ AI models loading...
    """)

if __name__ == "__main__":
    # Start WebSocket
    start_server = websockets.serve(websocket_handler, "0.0.0.0", 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    
    ws_thread = threading.Thread(
        target=asyncio.get_event_loop().run_forever,
        daemon=True
    )
    ws_thread.start()
    
    # Launch Gradio
    app.queue().launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )
EOF

echo "✅ Created app_simple_test.py for testing"

# Now commit and push
echo ""
echo "📤 To deploy in dev mode:"
echo "========================"
echo "1. First test with simple version:"
echo "   cp app_simple_test.py app.py"
echo "   git add -A"
echo "   git commit -m 'Deploy test broadcast system'"
echo "   git push"
echo ""
echo "2. Then deploy the REAL system:"
echo "   [Copy your app_final.py content to app.py]"
echo "   git add -A" 
echo "   git commit -m 'Deploy REAL AI broadcast system'"
echo "   git push"
echo ""
echo "3. The Space will rebuild automatically"
echo ""
echo "🔗 WebSocket will be at: wss://alledged-static-news-backend.hf.space/ws"