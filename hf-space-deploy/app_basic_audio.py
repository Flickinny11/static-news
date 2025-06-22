import gradio as gr
import json
import requests
import time
from datetime import datetime
import threading
import queue
import numpy as np
from TTS.api import TTS
import torch
import os

# Initialize Coqui TTS
device = "cuda" if torch.cuda.is_available() else "cpu"
tts = TTS("tts_models/en/ljspeech/tacotron2-DDC").to(device)

# Load configurations
with open('news_config.json', 'r') as f:
    news_config = json.load(f)

with open('characters_config.json', 'r') as f:
    characters = json.load(f)['characters']

# Character voices (using different speeds/pitches for variety)
character_voices = {
    "Ray McPatriot": {"speed": 0.9, "pitch": 0.8},
    "Berkeley Justice": {"speed": 1.1, "pitch": 1.2},
    "Switz Middleton": {"speed": 1.0, "pitch": 1.0}
}

class NewsAnchorSystem:
    def __init__(self):
        self.current_anchor_idx = 0
        self.anchors = list(characters.keys())
        self.news_queue = queue.Queue()
        self.audio_queue = queue.Queue()
        self.is_running = False
        
    def fetch_news(self):
        """Fetch news from NewsAPI"""
        try:
            api_key = news_config.get('newsapi_key', '')
            if not api_key:
                return self.get_mock_news()
                
            url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={api_key}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                articles = response.json().get('articles', [])[:5]
                return articles
            else:
                return self.get_mock_news()
        except:
            return self.get_mock_news()
    
    def get_mock_news(self):
        """Return mock news for testing"""
        return [
            {
                "title": "Breaking: AI News Anchors Take Over Broadcasting",
                "description": "In a shocking turn of events, AI personalities have started their own 24/7 news network.",
                "source": {"name": "Tech Today"}
            },
            {
                "title": "Markets React to Federal Reserve Decision",
                "description": "Stock markets showed mixed reactions to the latest Fed announcement on interest rates.",
                "source": {"name": "Financial Times"}
            }
        ]
    
    def generate_anchor_commentary(self, anchor_name, article):
        """Generate character-specific commentary"""
        character = characters[anchor_name]
        personality = character['personality']
        
        if anchor_name == "Ray McPatriot":
            return f"Folks, let me tell you about this story. {article['title']}. " \
                   f"Now, I may not pronounce it right, but this sounds like another conspiracy to me. " \
                   f"The liberal media won't tell you this, but I will!"
                   
        elif anchor_name == "Berkeley Justice":
            return f"So, like, this is super problematic on multiple levels. {article['title']}. " \
                   f"I mean, I went to Yale, well, Yail, and we learned about this. " \
                   f"Let me fact-check this for you, even though I'll probably get it wrong."
                   
        else:  # Switz
            return f"Well, eh, this story reminds me of gravy, somehow. {article['title']}. " \
                   f"In Canada, we're exactly 50 percent happy and 50 percent sad about this. " \
                   f"It's like when you pour gravy at exactly room temperature, you know?"
    
    def generate_audio(self, text, anchor_name):
        """Generate TTS audio for the given text"""
        try:
            voice_settings = character_voices.get(anchor_name, {})
            
            # Generate audio with Coqui TTS
            wav = tts.tts(
                text=text,
                speaker=tts.speakers[0] if hasattr(tts, 'speakers') else None,
                language=tts.languages[0] if hasattr(tts, 'languages') else None
            )
            
            # Adjust speed/pitch if needed (simplified for now)
            # In production, you'd use librosa or similar for pitch shifting
            
            return np.array(wav)
        except Exception as e:
            print(f"TTS Error: {e}")
            # Return silence if TTS fails
            return np.zeros(22050 * 2)  # 2 seconds of silence
    
    def broadcast_loop(self):
        """Main broadcast loop"""
        while self.is_running:
            try:
                # Fetch news every 5 minutes
                news_articles = self.fetch_news()
                
                for article in news_articles:
                    if not self.is_running:
                        break
                        
                    # Rotate through anchors
                    anchor_name = self.anchors[self.current_anchor_idx]
                    self.current_anchor_idx = (self.current_anchor_idx + 1) % len(self.anchors)
                    
                    # Generate commentary
                    commentary = self.generate_anchor_commentary(anchor_name, article)
                    
                    # Generate audio
                    audio = self.generate_audio(commentary, anchor_name)
                    
                    # Add to audio queue
                    self.audio_queue.put({
                        "anchor": anchor_name,
                        "text": commentary,
                        "audio": audio,
                        "article": article
                    })
                    
                    # Wait between articles
                    time.sleep(10)
                
                # Wait before next news cycle
                time.sleep(60)
                
            except Exception as e:
                print(f"Broadcast error: {e}")
                time.sleep(5)
    
    def start(self):
        """Start the broadcast system"""
        self.is_running = True
        self.broadcast_thread = threading.Thread(target=self.broadcast_loop)
        self.broadcast_thread.start()
    
    def stop(self):
        """Stop the broadcast system"""
        self.is_running = False
        if hasattr(self, 'broadcast_thread'):
            self.broadcast_thread.join()

# Initialize the system
anchor_system = NewsAnchorSystem()

def get_next_audio():
    """Get the next audio segment from the queue"""
    try:
        if not anchor_system.audio_queue.empty():
            data = anchor_system.audio_queue.get()
            return (
                22050,  # Sample rate
                data["audio"],
                data["anchor"],
                data["text"],
                data["article"]["title"]
            )
        else:
            return None, None, "No audio available", "Waiting for news...", ""
    except:
        return None, None, "Error", "System error", ""

# Create Gradio interface
with gr.Blocks(title="Static.news - AI News Network") as app:
    gr.Markdown("# 🎭 Static.news - Where News Meets Noise")
    gr.Markdown("## 24/7 AI News Anchors Broadcasting Live!")
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### Current Anchor")
            current_anchor = gr.Textbox(label="Speaking Now", value="Starting...")
            current_news = gr.Textbox(label="Current Story", value="Loading news...")
            
        with gr.Column(scale=2):
            gr.Markdown("### Live Audio Broadcast")
            audio_output = gr.Audio(label="Live Broadcast", streaming=True)
            transcript = gr.Textbox(label="Transcript", lines=5)
    
    with gr.Row():
        start_btn = gr.Button("Start Broadcast", variant="primary")
        stop_btn = gr.Button("Stop Broadcast", variant="stop")
        next_btn = gr.Button("Next Story")
    
    def start_broadcast():
        anchor_system.start()
        return "Broadcasting started!"
    
    def stop_broadcast():
        anchor_system.stop()
        return "Broadcasting stopped!"
    
    def update_display():
        result = get_next_audio()
        if result[0] is not None:
            return result[1], result[2], result[4], result[3]
        return None, result[2], result[3], result[4]
    
    start_btn.click(
        fn=start_broadcast,
        outputs=[current_anchor]
    )
    
    stop_btn.click(
        fn=stop_broadcast,
        outputs=[current_anchor]
    )
    
    next_btn.click(
        fn=update_display,
        outputs=[audio_output, current_anchor, current_news, transcript]
    )
    
    # Auto-update every 5 seconds
    app.load(
        fn=update_display,
        outputs=[audio_output, current_anchor, current_news, transcript],
        every=5
    )

if __name__ == "__main__":
    # Start the broadcast system automatically
    anchor_system.start()
    
    # Launch the app
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True
    )