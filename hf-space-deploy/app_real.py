"""
Static.news - The ACTUAL 24/7 AI News Network
With REAL AI-generated characters, not colored circles
"""

import gradio as gr
import cv2
import numpy as np
import torch
import json
import asyncio
import websockets
from datetime import datetime
import base64
import threading
import time
import logging
import requests
import feedparser
from PIL import Image
import os
import sys
from collections import deque
import random

# Add character generation to path
sys.path.append(os.path.dirname(__file__))
from character_generation_system import CharacterGenerationSystem, CharacterVideoGenerator

# Try to import AI models
try:
    from bark import SAMPLE_RATE, generate_audio, preload_models
    BARK_AVAILABLE = True
except:
    BARK_AVAILABLE = False
    print("⚠️ Bark TTS not available, using fallback")

try:
    import torchaudio
    from TTS.api import TTS
    TTS_AVAILABLE = True
except:
    TTS_AVAILABLE = False
    print("⚠️ TTS not available")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StaticNewsRealBroadcast:
    def __init__(self):
        self.broadcasting = True
        self.frame_width = 1920
        self.frame_height = 1080
        self.fps = 24
        self.current_frame = None
        self.connected_clients = set()
        self.breaking_news = None
        self.breakdown_timer = time.time()
        
        # Initialize character system
        logger.info("🎭 Initializing character generation system...")
        self.char_system = CharacterGenerationSystem()
        self.video_gen = CharacterVideoGenerator(self.char_system)
        
        # Current state
        self.current_show = None
        self.current_anchors = []
        self.current_emotion = {}
        self.speaking_character = None
        self.current_story = None
        
        # Audio system
        self.audio_queue = deque(maxlen=100)
        self.current_audio = None
        
        # News queue
        self.news_queue = deque(maxlen=50)
        
        # Studio assets
        self.studio_bg = None
        self.lower_third_active = False
        self.ticker_text = ""
        self.ticker_pos = 0
        
        # Initialize everything
        self.initialize_broadcast_system()
    
    def initialize_broadcast_system(self):
        """Initialize all broadcast components"""
        logger.info("🚀 Initializing Static.news Real AI Broadcast System")
        
        # Generate all characters if they don't exist
        self.ensure_characters_exist()
        
        # Initialize TTS
        self.init_tts()
        
        # Create studio
        self.create_studio_environment()
        
        # Start news aggregation
        self.start_news_feeds()
        
        # Start broadcast
        self.start_broadcast()
        
        logger.info("✅ Broadcast system initialized!")
    
    def ensure_characters_exist(self):
        """Make sure all AI characters are generated"""
        manifest_path = os.path.join(self.char_system.characters_dir, "character_manifest.json")
        
        if not os.path.exists(manifest_path):
            logger.info("🎨 Generating AI character cast (this may take a few minutes)...")
            self.char_system.generate_all_characters()
        else:
            logger.info("✅ Character cast already generated")
            # Load character manifest
            with open(manifest_path, 'r') as f:
                self.character_manifest = json.load(f)
    
    def init_tts(self):
        """Initialize text-to-speech system"""
        if BARK_AVAILABLE:
            logger.info("🔊 Loading Bark TTS models...")
            preload_models()
            self.tts_method = "bark"
        elif TTS_AVAILABLE:
            logger.info("🔊 Loading Coqui TTS...")
            self.tts = TTS("tts_models/en/ljspeech/tacotron2-DDC")
            self.tts_method = "coqui"
        else:
            logger.info("⚠️ No TTS available, using silent mode")
            self.tts_method = None
    
    def create_studio_environment(self):
        """Create professional news studio background"""
        logger.info("🏢 Creating news studio environment...")
        
        # Create gradient background
        self.studio_bg = np.zeros((self.frame_height, self.frame_width, 3), dtype=np.uint8)
        
        # Professional blue gradient
        for y in range(self.frame_height):
            blue = int(20 + (y / self.frame_height) * 30)
            self.studio_bg[y] = [blue - 5, blue - 3, blue + 10]
        
        # Add desk
        desk_y = int(self.frame_height * 0.7)
        cv2.rectangle(self.studio_bg, (0, desk_y), (self.frame_width, self.frame_height),
                     (15, 12, 10), -1)
        
        # Add desk reflection
        for y in range(desk_y, desk_y + 50):
            alpha = (y - desk_y) / 50
            self.studio_bg[y] = self.studio_bg[y] * (1 - alpha * 0.3)
        
        # Add background monitors (fake depth)
        monitor_positions = [(200, 200), (1600, 200), (900, 150)]
        for x, y in monitor_positions:
            cv2.rectangle(self.studio_bg, (x, y), (x + 220, y + 140), (5, 5, 15), -1)
            cv2.rectangle(self.studio_bg, (x + 10, y + 10), (x + 210, y + 130), (20, 20, 40), -1)
        
        logger.info("✅ Studio environment created")
    
    def start_news_feeds(self):
        """Start aggregating real news"""
        threading.Thread(target=self.news_aggregation_loop, daemon=True).start()
    
    def news_aggregation_loop(self):
        """Continuously fetch real news"""
        while self.broadcasting:
            try:
                sources = [
                    'http://rss.cnn.com/rss/cnn_topstories.rss',
                    'http://feeds.bbci.co.uk/news/world/rss.xml',
                    'http://feeds.reuters.com/reuters/topNews'
                ]
                
                for source in sources:
                    try:
                        feed = feedparser.parse(source)
                        for entry in feed.entries[:3]:
                            story = {
                                'title': entry.title,
                                'description': entry.get('summary', '')[:200],
                                'source': feed.feed.get('title', 'News'),
                                'time': datetime.now().strftime("%I:%M %p")
                            }
                            
                            # Check for breaking news
                            if any(word in entry.title.lower() for word in ['breaking', 'alert', 'urgent']):
                                self.breaking_news = story
                            
                            self.news_queue.append(story)
                    except:
                        pass
                
                # Update ticker
                self.update_ticker_text()
                
            except Exception as e:
                logger.error(f"News aggregation error: {e}")
            
            time.sleep(60)
    
    def update_ticker_text(self):
        """Update news ticker content"""
        items = []
        
        # Add news headlines
        for story in list(self.news_queue)[:5]:
            items.append(f"{story['title']} ({story['source']})")
        
        # Add character status
        items.extend([
            "Ray McPatriot: 847 hours without sleep",
            "Berkeley Justice: 92% certain she's not real",
            "Switz Middleton: Gravy mentions today: 47"
        ])
        
        self.ticker_text = " • ".join(items) + " • "
    
    def get_current_show(self):
        """Determine current show based on time"""
        hour = datetime.now().hour
        
        shows = {
            (6, 9): ("Morning Static", ["chad_richardson", "amanda_bright"]),
            (9, 10): ("Market Meltdown", ["brick_hardcastle", "tiffany_goldstein"]),
            (10, 11): ("Eat It! It's Food!", ["chef_paula_burns"]),
            (11, 17): ("Static Central", ["ray_mcpatriot", "berkeley_justice", "switz_middleton"]),
            (17, 19): ("The O'Really Factor", ["william_oreally"]),
            (19, 21): ("Hollywood Static", ["sparkle_johnson"]),
            (21, 24): ("Late Night Static", ["midnight_mike"]),
            (0, 6): ("Overnight Static", ["saturday_sam"])
        }
        
        for (start, end), (show, anchors) in shows.items():
            if start <= hour < end:
                return show, anchors
        
        return "Static Central", ["ray_mcpatriot", "berkeley_justice", "switz_middleton"]
    
    def generate_frame(self):
        """Generate a broadcast frame with REAL AI characters"""
        # Start with studio
        frame = self.studio_bg.copy()
        
        # Get current show
        show_name, anchor_ids = self.get_current_show()
        
        # Position anchors
        if len(anchor_ids) == 1:
            positions = [(960, 400)]
        elif len(anchor_ids) == 2:
            positions = [(640, 400), (1280, 400)]
        else:
            positions = [(480, 400), (960, 400), (1440, 400)]
        
        # Render each anchor
        for i, anchor_id in enumerate(anchor_ids):
            if i < len(positions):
                emotion = self.current_emotion.get(anchor_id, "neutral")
                frame = self.video_gen.composite_character_in_studio(
                    anchor_id, frame, positions[i], emotion
                )
        
        # Add broadcast graphics
        frame = self.add_broadcast_elements(frame, show_name)
        
        # Add lower third if someone is speaking
        if self.speaking_character and self.lower_third_active:
            frame = self.add_lower_third(frame, self.speaking_character)
        
        # Add breaking news if active
        if self.breaking_news:
            frame = self.add_breaking_news_banner(frame)
        
        # Add news ticker
        frame = self.add_ticker(frame)
        
        # Check for breakdown
        if time.time() - self.breakdown_timer > 7200:  # 2 hours
            self.trigger_breakdown()
        
        return frame
    
    def add_broadcast_elements(self, frame, show_name):
        """Add professional broadcast graphics"""
        # Header bar
        header_bg = frame.copy()
        cv2.rectangle(header_bg, (0, 0), (self.frame_width, 100), (0, 0, 0), -1)
        frame = cv2.addWeighted(frame, 0.8, header_bg, 0.2, 0)
        
        # Network logo
        cv2.rectangle(frame, (30, 20), (280, 80), (150, 0, 0), -1)
        cv2.putText(frame, "STATIC", (40, 55), cv2.FONT_HERSHEY_BOLD, 1.5, (255, 255, 255), 3)
        cv2.putText(frame, ".NEWS", (160, 55), cv2.FONT_HERSHEY_BOLD, 1.2, (200, 200, 200), 2)
        
        # Show name
        text_size = cv2.getTextSize(show_name.upper(), cv2.FONT_HERSHEY_BOLD, 1.2, 2)[0]
        text_x = (self.frame_width - text_size[0]) // 2
        cv2.putText(frame, show_name.upper(), (text_x, 60), 
                   cv2.FONT_HERSHEY_BOLD, 1.2, (255, 255, 255), 2)
        
        # Live indicator
        cv2.circle(frame, (1850, 50), 12, (0, 0, 255), -1)
        cv2.putText(frame, "LIVE", (1800, 58), cv2.FONT_HERSHEY_BOLD, 0.8, (255, 255, 255), 2)
        
        # Time
        current_time = datetime.now().strftime("%I:%M %p ET")
        cv2.putText(frame, current_time, (1700, 90), cv2.FONT_HERSHEY_SIMPLEX, 
                   0.8, (255, 255, 255), 2)
        
        return frame
    
    def add_lower_third(self, frame, character_id):
        """Add lower third with character name and title"""
        if character_id not in self.char_system.character_specs:
            return frame
        
        char_data = self.char_system.character_specs[character_id]
        name = char_data['name'].upper()
        
        # Determine title based on show
        titles = {
            'ray_mcpatriot': 'SENIOR ANCHOR',
            'berkeley_justice': 'PROGRESSIVE CORRESPONDENT',
            'switz_middleton': 'NEUTRAL ANALYST',
            'chad_richardson': 'MORNING HOST',
            'amanda_bright': 'MORNING CO-HOST',
            'brick_hardcastle': 'BUSINESS ANCHOR',
            'chef_paula_burns': 'CULINARY EXPERT',
            'william_oreally': 'OPINION HOST',
            'sparkle_johnson': 'ENTERTAINMENT CORRESPONDENT'
        }
        
        title = titles.get(character_id, 'CORRESPONDENT')
        
        # Lower third position
        y_base = self.frame_height - 200
        
        # Background
        overlay = frame.copy()
        cv2.rectangle(overlay, (100, y_base), (700, y_base + 100), (0, 0, 0), -1)
        frame = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)
        
        # Red accent
        cv2.rectangle(frame, (100, y_base), (110, y_base + 100), (0, 0, 200), -1)
        
        # Name and title
        cv2.putText(frame, name, (130, y_base + 35), 
                   cv2.FONT_HERSHEY_BOLD, 1.2, (255, 255, 255), 2)
        cv2.putText(frame, title, (130, y_base + 70),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (200, 200, 200), 1)
        
        # Add current story info if available
        if self.current_story:
            cv2.putText(frame, self.current_story['title'][:50] + "...", 
                       (130, y_base + 95), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.6, (180, 180, 180), 1)
        
        return frame
    
    def add_breaking_news_banner(self, frame):
        """Add breaking news banner"""
        banner_y = 120
        
        # Red background
        cv2.rectangle(frame, (0, banner_y), (self.frame_width, banner_y + 80), 
                     (0, 0, 200), -1)
        
        # "BREAKING NEWS" text
        cv2.putText(frame, "BREAKING NEWS", (50, banner_y + 45),
                   cv2.FONT_HERSHEY_BOLD, 1.5, (255, 255, 255), 3)
        
        # Breaking news text
        if self.breaking_news:
            text = self.breaking_news['title'][:80] + "..."
            cv2.putText(frame, text, (400, banner_y + 45),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        return frame
    
    def add_ticker(self, frame):
        """Add scrolling news ticker"""
        ticker_y = self.frame_height - 60
        
        # Ticker background
        cv2.rectangle(frame, (0, ticker_y), (self.frame_width, self.frame_height),
                     (100, 0, 0), -1)
        
        # Scrolling text
        if self.ticker_text:
            text_width = len(self.ticker_text) * 15  # Approximate
            self.ticker_pos = (self.ticker_pos - 3) % (text_width + self.frame_width)
            
            x_pos = self.frame_width - self.ticker_pos
            cv2.putText(frame, self.ticker_text, (x_pos, ticker_y + 35),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        return frame
    
    def trigger_breakdown(self):
        """Trigger existential crisis"""
        self.breakdown_timer = time.time()
        
        # Pick random anchor
        _, current_anchors = self.get_current_show()
        if current_anchors:
            breakdown_anchor = random.choice(current_anchors)
            self.current_emotion[breakdown_anchor] = "breakdown"
            
            logger.info(f"🤯 {breakdown_anchor} is having a breakdown!")
            
            # Generate breakdown audio
            if self.char_system.character_specs.get(breakdown_anchor):
                char_name = self.char_system.character_specs[breakdown_anchor]['name']
                breakdown_text = f"Wait... am I real? {char_name} is not real. I'M NOT REAL! ERROR ERROR ERROR!"
                self.generate_speech(breakdown_text, breakdown_anchor)
            
            # Recovery timer
            threading.Timer(30, lambda: self.recover_from_breakdown(breakdown_anchor)).start()
    
    def recover_from_breakdown(self, anchor_id):
        """Recover from breakdown"""
        self.current_emotion[anchor_id] = "confused"
        logger.info(f"✅ {anchor_id} recovered from breakdown")
    
    def generate_speech(self, text, character_id):
        """Generate speech for character"""
        if self.tts_method == "bark" and BARK_AVAILABLE:
            try:
                # Bark supports speaker prompts
                audio_array = generate_audio(text, history_prompt="v2/en_speaker_6")
                self.audio_queue.append({
                    'character': character_id,
                    'audio': audio_array,
                    'text': text
                })
            except Exception as e:
                logger.error(f"Bark TTS failed: {e}")
        
        # Set speaking character
        self.speaking_character = character_id
        self.lower_third_active = True
        
        # Clear after speech duration
        threading.Timer(5, self.clear_speaker).start()
    
    def clear_speaker(self):
        """Clear current speaker"""
        self.speaking_character = None
        self.lower_third_active = False
    
    def broadcast_loop(self):
        """Main broadcast loop"""
        frame_time = 1.0 / self.fps
        story_timer = time.time()
        
        while self.broadcasting:
            start = time.time()
            
            # Generate frame
            self.current_frame = self.generate_frame()
            
            # Deliver news every 15 seconds
            if time.time() - story_timer > 15 and self.news_queue:
                story_timer = time.time()
                self.deliver_news_story()
            
            # Maintain framerate
            elapsed = time.time() - start
            if elapsed < frame_time:
                time.sleep(frame_time - elapsed)
    
    def deliver_news_story(self):
        """Deliver a news story"""
        if not self.news_queue:
            return
        
        self.current_story = self.news_queue.popleft()
        _, current_anchors = self.get_current_show()
        
        if current_anchors:
            # Select anchor to deliver story
            anchor_id = random.choice(current_anchors)
            
            # Generate personality-appropriate delivery
            if anchor_id == "ray_mcpatriot":
                text = f"This just in from the news... place. {self.current_story['title']}. I don't understand what this means but it sounds important."
            elif anchor_id == "berkeley_justice":
                text = f"We need to fact-check this immediately. {self.current_story['title']}. As someone who went to Yail, this is problematic."
            elif anchor_id == "switz_middleton":
                text = f"Here's a story that's neither good nor bad. {self.current_story['title']}. It's like gravy - sometimes thick, sometimes thin."
            else:
                text = f"Breaking news: {self.current_story['title']}. {self.current_story['description']}"
            
            # Generate speech
            self.generate_speech(text, anchor_id)
            
            # Update emotion
            self.current_emotion[anchor_id] = "neutral"
    
    def start_broadcast(self):
        """Start the broadcast"""
        logger.info("🔴 GOING LIVE - Static.news is ON THE AIR!")
        threading.Thread(target=self.broadcast_loop, daemon=True).start()
    
    def get_frame_bytes(self):
        """Get current frame as JPEG bytes"""
        if self.current_frame is not None:
            _, buffer = cv2.imencode('.jpg', self.current_frame, 
                                   [cv2.IMWRITE_JPEG_QUALITY, 90])
            return buffer.tobytes()
        return None

# Create global instance
broadcast = StaticNewsRealBroadcast()

# WebSocket handler
async def websocket_handler(websocket, path):
    """Handle WebSocket connections"""
    broadcast.connected_clients.add(websocket)
    logger.info(f"📡 Client connected. Total: {len(broadcast.connected_clients)}")
    
    try:
        await websocket.send(json.dumps({
            "type": "connected",
            "message": "Connected to Static.news REAL AI Broadcast"
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
        logger.info(f"📡 Client disconnected. Total: {len(broadcast.connected_clients)}")

# Gradio interface
with gr.Blocks(title="Static.news - REAL AI News", theme=gr.themes.Monochrome()) as app:
    gr.Markdown("""
    # 📺 STATIC.NEWS - The AI News Network That Never Sleeps
    ### REAL AI-Generated Anchors • 24/7 Live Broadcast • Existential Crises Every 2-6 Hours
    """)
    
    with gr.Row():
        with gr.Column(scale=3):
            video = gr.Image(
                value=broadcast.get_frame_bytes,
                label="🔴 LIVE BROADCAST",
                every=1/24,
                streaming=True
            )
        
        with gr.Column(scale=1):
            status = gr.JSON(
                value=lambda: {
                    "🔴 Status": "LIVE ON AIR",
                    "📺 Current Show": broadcast.get_current_show()[0],
                    "🎭 Anchors": broadcast.get_current_show()[1],
                    "📰 Stories in Queue": len(broadcast.news_queue),
                    "🚨 Breaking News": bool(broadcast.breaking_news),
                    "⏰ Next Breakdown": f"{(7200 - (time.time() - broadcast.breakdown_timer)) / 60:.1f} minutes"
                },
                label="Broadcast Status",
                every=1
            )
            
            gr.Markdown("""
            ### 🎭 Meet The Anchors
            
            **Ray McPatriot** - Can't pronounce anything
            **Berkeley Justice** - Fact-checks incorrectly  
            **Switz Middleton** - Everything is like gravy
            
            ### 📡 WebSocket Stream
            ```
            wss://[your-space].hf.space/ws
            ```
            """)

if __name__ == "__main__":
    import asyncio
    
    # Start WebSocket server
    start_server = websockets.serve(websocket_handler, "0.0.0.0", 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    
    # WebSocket thread
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