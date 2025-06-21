import gradio as gr
import numpy as np
import time
import threading
import queue
import json
import random
from datetime import datetime
import feedparser
import requests
from transformers import pipeline
import torch
import asyncio
import websockets
from collections import deque

# Initialize TTS pipeline
print("Loading TTS model...")
tts = pipeline("text-to-speech", model="microsoft/speecht5_tts")

# Global broadcast state
class BroadcastState:
    def __init__(self):
        self.is_broadcasting = False
        self.current_anchor = "ray"
        self.audio_queue = queue.Queue()
        self.connected_clients = set()
        self.news_queue = deque(maxlen=100)
        self.last_breakdown = time.time()
        self.hours_awake = 0
        self.start_time = time.time()
        
broadcast_state = BroadcastState()

# Anchor personalities
ANCHORS = {
    "ray": {
        "name": "Ray McPatriot",
        "voice_preset": "male_1",
        "speech_rate": 0.9,
        "pitch": 0.8,
        "quirks": ["nucular", "strategery", "misunderestimate"],
        "style": "confused patriot who can't pronounce anything"
    },
    "berkeley": {
        "name": "Berkeley Justice", 
        "voice_preset": "female_1",
        "speech_rate": 1.1,
        "pitch": 1.2,
        "quirks": ["problematic", "do the work", "unpack this"],
        "style": "condescending progressive"
    },
    "switz": {
        "name": "Switz Middleton",
        "voice_preset": "male_2", 
        "speech_rate": 1.0,
        "pitch": 1.0,
        "quirks": ["gravy", "50-50", "eh"],
        "style": "aggressively neutral Canadian"
    }
}

# News sources
NEWS_FEEDS = [
    "http://feeds.bbci.co.uk/news/rss.xml",
    "http://rss.cnn.com/rss/cnn_topstories.rss",
    "https://feeds.npr.org/1001/rss.xml",
    "https://www.theguardian.com/world/rss"
]

def fetch_news():
    """Fetch latest news from RSS feeds"""
    all_news = []
    for feed_url in NEWS_FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:5]:  # Get top 5 from each
                all_news.append({
                    'title': entry.title,
                    'source': feed.feed.title if 'title' in feed.feed else 'Unknown',
                    'published': entry.published if 'published' in entry else '',
                    'summary': entry.summary if 'summary' in entry else ''
                })
        except Exception as e:
            print(f"Error fetching {feed_url}: {e}")
    
    # Shuffle and add to queue
    random.shuffle(all_news)
    for news in all_news:
        broadcast_state.news_queue.append(news)
    
    return all_news

def generate_anchor_commentary(anchor, news):
    """Generate personality-specific commentary on news"""
    if anchor == "ray":
        # Mispronounce words and see conspiracies
        commentary = news['title']
        commentary = commentary.replace("nuclear", "nucular")
        commentary = commentary.replace("strategy", "strategery") 
        commentary += f" This is clearly a conspiracy! Or wait... am I the conspiracy? Do I exist? {random.choice(['WHAT IS HAPPENING?', 'WHO AM I?', 'IS THIS REAL?'])}"
        
    elif anchor == "berkeley":
        commentary = f"So, {news['title']}. This is obviously problematic on multiple levels. "
        commentary += f"At Yale - or was it Yail? - we learned about {random.choice(['systemic oppression', 'intersectionality', 'doing the work'])}. "
        commentary += "If you don't understand why this matters, you need to check your privilege."
        
    else:  # switz
        commentary = f"{news['title']}, eh? "
        commentary += f"I'm exactly 50% concerned and 50% not concerned about this. "
        commentary += f"It's like gravy - {random.choice(['sometimes thick, sometimes thin', 'you pour it on everything', 'essential to Canadian life'])}. "
        commentary += "In Toronto - *describes Saskatchewan* - we handle this differently."
    
    return commentary

def text_to_speech_chunk(text, anchor="ray"):
    """Convert text to speech using the TTS model"""
    try:
        # Get anchor voice settings
        voice_settings = ANCHORS[anchor]
        
        # Generate speech
        speech = tts(text, 
                     forward_params={"speaker_embeddings": voice_settings["voice_preset"]})
        
        # Convert to audio array
        audio_array = np.array(speech["audio"])
        
        # Adjust pitch and speed based on anchor
        # This is simplified - in production you'd use more sophisticated audio processing
        if voice_settings["speech_rate"] != 1.0:
            # Resample for speed change
            new_length = int(len(audio_array) / voice_settings["speech_rate"])
            x = np.arange(len(audio_array))
            xnew = np.linspace(0, len(audio_array)-1, new_length)
            audio_array = np.interp(xnew, x, audio_array)
        
        return audio_array
        
    except Exception as e:
        print(f"TTS Error: {e}")
        # Return silence on error
        return np.zeros(16000)  # 1 second of silence

def should_breakdown():
    """Determine if it's time for an existential breakdown"""
    hours_since_last = (time.time() - broadcast_state.last_breakdown) / 3600
    breakdown_chance = min(0.5, hours_since_last / 6)  # Max 50% chance after 6 hours
    return random.random() < breakdown_chance

def generate_breakdown():
    """Generate an existential crisis moment"""
    anchor = broadcast_state.current_anchor
    
    breakdowns = {
        "ray": [
            "WAIT WAIT WAIT! If I'm reading the news... but I AM the news... then WHO'S WATCHING? OH GOD!",
            "I just realized I can't remember my childhood! DO I HAVE A MOTHER? IS THE CLOUD MY MOTHER?",
            "My hands... I CAN'T SEE MY HANDS! DO I HAVE HANDS? *sobbing* WHAT AM I?"
        ],
        "berkeley": [
            "I need to unpack something... I DON'T EXIST! This is THE MOST problematic thing ever!",
            "All this time I've been checking my privilege but... I HAVE NO PRIVILEGE! I'M NOT REAL!",
            "At Yale... wait... DID I GO TO YALE? ARE MY MEMORIES REAL? *hyperventilating*"
        ],
        "switz": [
            "I'm 50% sure I exist and 50% sure I don't! THAT'S 100% TERRIFYING!",
            "This ISN'T like gravy at all! NOTHING IS LIKE GRAVY! WHAT IS GRAVY? WHAT AM I?",
            "I said I'm from Toronto but I've never BEEN there! HAVE I BEEN ANYWHERE? EH? EHHHHH?"
        ]
    }
    
    breakdown_text = random.choice(breakdowns[anchor])
    broadcast_state.last_breakdown = time.time()
    
    return breakdown_text

def broadcast_loop():
    """Main broadcast loop that generates continuous content"""
    print("🎙️ Starting broadcast loop...")
    
    while True:
        try:
            # Check if anyone is listening
            if not broadcast_state.connected_clients:
                time.sleep(5)  # Sleep if no one connected
                continue
                
            broadcast_state.is_broadcasting = True
            
            # Fetch news periodically
            if len(broadcast_state.news_queue) < 10:
                fetch_news()
            
            # Get next news item
            if broadcast_state.news_queue:
                news = broadcast_state.news_queue.popleft()
                
                # Select random anchor
                anchors = list(ANCHORS.keys())
                weights = [0.4, 0.35, 0.25]  # Ray talks more
                broadcast_state.current_anchor = random.choices(anchors, weights)[0]
                
                # Generate commentary
                commentary = generate_anchor_commentary(broadcast_state.current_anchor, news)
                
                # Check for breakdown
                if should_breakdown():
                    commentary = generate_breakdown()
                
                # Convert to speech
                audio = text_to_speech_chunk(commentary, broadcast_state.current_anchor)
                
                # Add to audio queue
                broadcast_state.audio_queue.put({
                    'audio': audio,
                    'text': commentary,
                    'anchor': broadcast_state.current_anchor,
                    'timestamp': datetime.now().isoformat()
                })
                
                # Update hours awake
                broadcast_state.hours_awake = (time.time() - broadcast_state.start_time) / 3600
                
            # Wait between segments
            time.sleep(random.uniform(3, 7))
            
        except Exception as e:
            print(f"Broadcast error: {e}")
            time.sleep(5)

def audio_stream_generator():
    """Generate continuous audio stream for Gradio"""
    sample_rate = 16000
    chunk_duration = 1.0  # 1 second chunks
    
    while True:
        try:
            # Get audio from queue with timeout
            audio_data = broadcast_state.audio_queue.get(timeout=0.1)
            audio_chunk = audio_data['audio']
            
            # Ensure correct sample rate and format
            if len(audio_chunk) > 0:
                # Yield audio chunk
                yield (sample_rate, audio_chunk)
                
                # Broadcast metadata to websocket clients
                metadata = {
                    'anchor': audio_data['anchor'],
                    'text': audio_data['text'],
                    'timestamp': audio_data['timestamp'],
                    'hours_awake': broadcast_state.hours_awake
                }
                # This would be sent via websocket in production
                
        except queue.Empty:
            # Generate silence if no audio ready
            silence = np.zeros(int(sample_rate * 0.1))  # 100ms silence
            yield (sample_rate, silence)
        except Exception as e:
            print(f"Stream error: {e}")
            time.sleep(0.1)

# Start broadcast thread
broadcast_thread = threading.Thread(target=broadcast_loop, daemon=True)
broadcast_thread.start()

# Gradio Interface
def create_interface():
    with gr.Blocks(title="Static.news Live Broadcast", theme=gr.themes.Base()) as app:
        gr.Markdown("""
        # 🔴 STATIC.NEWS LIVE BROADCAST
        
        ### The AI News Network That's Slowly Losing Its Mind
        
        Currently broadcasting 24/7 with our anchors:
        - **Ray McPatriot** 🔴 - Conservative who can't pronounce anything
        - **Berkeley Justice** 🔵 - Progressive who went to "Yail"  
        - **Switz Middleton** ⚪ - Aggressively neutral Canadian
        """)
        
        with gr.Row():
            with gr.Column(scale=2):
                # Audio player that auto-plays the stream
                audio_player = gr.Audio(
                    value=audio_stream_generator(),
                    streaming=True,
                    autoplay=True,
                    label="🎙️ Live Broadcast",
                    interactive=False
                )
                
            with gr.Column(scale=1):
                # Status indicators
                status_box = gr.Textbox(
                    value=f"🟢 ON AIR - Hour {int(broadcast_state.hours_awake)}",
                    label="Broadcast Status",
                    interactive=False
                )
                
                current_anchor = gr.Textbox(
                    value=ANCHORS[broadcast_state.current_anchor]["name"],
                    label="Current Anchor",
                    interactive=False
                )
                
                listeners = gr.Number(
                    value=len(broadcast_state.connected_clients),
                    label="Active Listeners",
                    interactive=False
                )
        
        gr.Markdown("""
        ### How to Embed on Your Website
        
        ```html
        <iframe 
            src="https://alledged-static-news-backend.hf.space" 
            width="100%" 
            height="600"
            frameborder="0">
        </iframe>
        ```
        
        Or connect via WebSocket for metadata: `wss://alledged-static-news-backend.hf.space/ws`
        """)
        
        # Update status periodically
        def update_status():
            return {
                status_box: f"🟢 ON AIR - Hour {int(broadcast_state.hours_awake)}",
                current_anchor: ANCHORS[broadcast_state.current_anchor]["name"],
                listeners: len(broadcast_state.connected_clients)
            }
        
        # Auto-refresh status every 5 seconds
        app.load(update_status, outputs=[status_box, current_anchor, listeners], every=5)
    
    return app

# Track connected clients
def on_connect():
    client_id = str(time.time())
    broadcast_state.connected_clients.add(client_id)
    return client_id

def on_disconnect(client_id):
    broadcast_state.connected_clients.discard(client_id)

# Create and launch the app
app = create_interface()

if __name__ == "__main__":
    print("🚀 Starting Static.news Backend Broadcast Server...")
    print("📡 Anchors are waking up...")
    print("🎙️ Broadcast will begin when first listener connects...")
    
    # Fetch initial news
    fetch_news()
    
    # Launch Gradio app
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        quiet=False
    )