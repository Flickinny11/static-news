"""
Static.news - The REAL 24/7 AI News Broadcast
This is what actually runs on HuggingFace Space
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
from collections import deque
import feedparser
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StaticNewsBroadcast:
    def __init__(self):
        self.broadcasting = True
        self.frame_width = 1280
        self.frame_height = 720
        self.fps = 24
        self.current_frame = None
        self.connected_clients = set()
        self.breaking_news = None
        self.breakdown_timer = time.time()
        
        # Character states
        self.characters = {
            'ray': {'x': 320, 'y': 350, 'color': (50, 50, 200), 'breakdown': False},
            'berkeley': {'x': 640, 'y': 350, 'color': (200, 100, 50), 'breakdown': False},
            'switz': {'x': 960, 'y': 350, 'color': (150, 150, 150), 'breakdown': False}
        }
        
        # Start broadcast
        self.start()
    
    def start(self):
        """Start the 24/7 broadcast"""
        logger.info("🔴 GOING LIVE - Static.news 24/7 Broadcast Started")
        threading.Thread(target=self.broadcast_loop, daemon=True).start()
        threading.Thread(target=self.news_monitor, daemon=True).start()
    
    def get_current_show(self):
        """What's on air right now"""
        hour = datetime.now().hour
        
        schedule = {
            6: ("Morning Static", ["Chad", "Amanda"]),
            9: ("Market Meltdown", ["Brick", "Tiffany"]),
            10: ("Eat It. It's Food!", ["Paula"]),
            12: ("Static Central", ["Ray", "Berkeley", "Switz"]),
            17: ("The O'Really Factor", ["William", "Jessica"]),
            19: ("Hollywood Static", ["Sparkle"]),
        }
        
        # Find current show
        for h in sorted(schedule.keys(), reverse=True):
            if hour >= h:
                return schedule[h]
        
        # Default overnight
        return ("Static Central", ["Ray", "Berkeley", "Switz"])
    
    def check_breakdown(self):
        """Should someone have a breakdown?"""
        if time.time() - self.breakdown_timer > 7200:  # 2 hours
            self.breakdown_timer = time.time()
            # Pick random character
            char = np.random.choice(['ray', 'berkeley', 'switz'])
            self.characters[char]['breakdown'] = True
            # Reset after 30 seconds
            threading.Timer(30, lambda: setattr(self.characters[char], 'breakdown', False)).start()
            return True
        return False
    
    def generate_frame(self):
        """Generate the actual broadcast frame"""
        frame = np.zeros((self.frame_height, self.frame_width, 3), dtype=np.uint8)
        
        # Studio background
        for y in range(self.frame_height):
            gray = int(20 + (y / self.frame_height) * 30)
            frame[y, :] = [gray, gray, gray + 5]
        
        # News desk
        cv2.rectangle(frame, (0, 500), (self.frame_width, self.frame_height), (30, 25, 20), -1)
        
        # Header bar
        cv2.rectangle(frame, (0, 0), (self.frame_width, 80), (150, 0, 0), -1)
        
        # Logo
        cv2.putText(frame, "STATIC.NEWS", (50, 55), 
                   cv2.FONT_HERSHEY_BOLD, 2, (255, 255, 255), 3)
        
        # LIVE indicator
        cv2.circle(frame, (1150, 40), 10, (0, 0, 255), -1)
        cv2.putText(frame, "LIVE", (1170, 48), 
                   cv2.FONT_HERSHEY_BOLD, 1, (255, 255, 255), 2)
        
        # Current show
        show_name, anchors = self.get_current_show()
        cv2.putText(frame, show_name.upper(), (500, 55), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2)
        
        # Check for breakdown
        if self.check_breakdown():
            cv2.putText(frame, "EXISTENTIAL CRISIS IN PROGRESS", (400, 300),
                       cv2.FONT_HERSHEY_BOLD, 1, (0, 0, 255), 2)
        
        # Draw anchors
        if "Ray" in str(anchors) or "Static Central" in show_name:
            for name, char in self.characters.items():
                # Avatar
                color = (0, 0, 255) if char['breakdown'] else char['color']
                cv2.circle(frame, (char['x'], char['y']), 60, color, -1)
                cv2.circle(frame, (char['x'], char['y']), 60, (0, 0, 0), 3)
                
                # Name
                cv2.putText(frame, name.upper(), (char['x'] - 30, char['y'] + 100),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                
                # Breakdown indicator
                if char['breakdown']:
                    cv2.putText(frame, "!!!!", (char['x'] - 20, char['y'] - 80),
                               cv2.FONT_HERSHEY_BOLD, 1, (0, 0, 255), 2)
        
        # Breaking news
        if self.breaking_news:
            cv2.rectangle(frame, (0, 600), (self.frame_width, 670), (0, 0, 200), -1)
            cv2.putText(frame, "BREAKING", (50, 640),
                       cv2.FONT_HERSHEY_BOLD, 1.5, (255, 255, 255), 2)
            cv2.putText(frame, self.breaking_news[:70], (250, 640),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1)
        
        # News ticker
        cv2.rectangle(frame, (0, 680), (self.frame_width, self.frame_height), (100, 0, 0), -1)
        ticker = f"24/7 AI News • {datetime.now().strftime('%I:%M %p ET')} • "
        ticker += "Where News Meets Noise • Breakdowns Every 2-6 Hours"
        cv2.putText(frame, ticker, (50, 705),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        # Clock
        cv2.putText(frame, datetime.now().strftime("%I:%M:%S %p"), 
                   (1050, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        return frame
    
    def broadcast_loop(self):
        """Main broadcast loop - NEVER STOPS"""
        frame_time = 1.0 / self.fps
        
        while self.broadcasting:
            start = time.time()
            
            # Generate frame
            self.current_frame = self.generate_frame()
            
            # Maintain FPS
            elapsed = time.time() - start
            if elapsed < frame_time:
                time.sleep(frame_time - elapsed)
    
    def news_monitor(self):
        """Monitor for breaking news"""
        while self.broadcasting:
            try:
                feed = feedparser.parse('http://rss.cnn.com/rss/cnn_topstories.rss')
                if feed.entries:
                    entry = feed.entries[0]
                    if any(word in entry.title.lower() for word in ['breaking', 'alert', 'urgent']):
                        self.breaking_news = entry.title
                        # Clear after 5 minutes
                        threading.Timer(300, self.clear_breaking).start()
            except:
                pass
            
            time.sleep(120)  # Check every 2 minutes
    
    def clear_breaking(self):
        self.breaking_news = None
    
    def get_frame_bytes(self):
        """Get current frame as JPEG bytes"""
        if self.current_frame is not None:
            _, buffer = cv2.imencode('.jpg', self.current_frame)
            return buffer.tobytes()
        return None

# Global broadcast instance
broadcast = StaticNewsBroadcast()

# WebSocket handler
async def websocket_handler(websocket, path):
    """Stream to website"""
    broadcast.connected_clients.add(websocket)
    
    try:
        await websocket.send(json.dumps({
            "type": "connected",
            "message": "Connected to Static.news Live"
        }))
        
        while True:
            if broadcast.current_frame is not None:
                _, buffer = cv2.imencode('.jpg', broadcast.current_frame)
                await websocket.send(json.dumps({
                    "type": "frame",
                    "data": base64.b64encode(buffer).decode('utf-8'),
                    "timestamp": datetime.now().isoformat()
                }))
            
            await asyncio.sleep(1/24)  # 24 FPS
            
    except websockets.exceptions.ConnectionClosed:
        broadcast.connected_clients.remove(websocket)

# Gradio Interface
with gr.Blocks(title="Static.news LIVE", theme=gr.themes.Monochrome()) as app:
    gr.Markdown("# 📺 STATIC.NEWS - LIVE 24/7")
    gr.Markdown("### The AI News Network That Never Sleeps")
    
    with gr.Row():
        with gr.Column(scale=3):
            def get_frame():
                return broadcast.get_frame_bytes()
            
            video = gr.Image(
                value=get_frame,
                label="LIVE BROADCAST",
                every=1/24,  # 24 FPS update
                streaming=True
            )
        
        with gr.Column(scale=1):
            def get_status():
                show, anchors = broadcast.get_current_show()
                return {
                    "🔴 STATUS": "LIVE",
                    "📺 Current Show": show,
                    "🎭 Anchors": anchors,
                    "👥 Viewers": len(broadcast.connected_clients),
                    "🚨 Breaking News": broadcast.breaking_news or "None",
                    "⏰ Time": datetime.now().strftime("%I:%M:%S %p ET")
                }
            
            status = gr.JSON(
                value=get_status,
                label="Broadcast Info",
                every=1
            )
            
            gr.Markdown("""
            ### 🔗 WebSocket Stream
            ```
            wss://alledged-static-news-backend.hf.space/ws
            ```
            
            ### 📡 Features
            - 24/7 Live Broadcast
            - Real News Updates
            - Character Breakdowns
            - Breaking News Alerts
            - Multiple Shows Daily
            """)

# Launch with WebSocket
if __name__ == "__main__":
    # Start WebSocket server
    start_server = websockets.serve(websocket_handler, "0.0.0.0", 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    
    # Keep WebSocket running
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