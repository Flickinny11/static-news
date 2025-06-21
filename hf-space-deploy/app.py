"""
Static.news Complete Production Broadcast System
Real-time AI news network with TTS and video generation
"""

import gradio as gr
import torch
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2
import asyncio
import websockets
import json
import base64
import io
import time
import os
import tempfile
import subprocess
import requests
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import hashlib
import threading
import queue
from collections import defaultdict
import random
import logging
import soundfile as sf
import librosa

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Force CPU mode for testing, GPU for production
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"Using device: {DEVICE}")

# Import TTS models - using Coqui TTS for production
try:
    from TTS.api import TTS
    # List available models
    # Use VITS for quality and speed
    tts_model = TTS("tts_models/en/ljspeech/vits", gpu=(DEVICE == "cuda"))
    TTS_AVAILABLE = True
    logger.info("TTS initialized successfully")
except Exception as e:
    TTS_AVAILABLE = False
    logger.error(f"TTS initialization failed: {e}")

# Import music generation
try:
    from audiocraft.models import MusicGen
    # Use small model for faster generation
    musicgen = MusicGen.get_pretrained('facebook/musicgen-small')
    if DEVICE == "cuda":
        musicgen = musicgen.cuda()
    MUSICGEN_AVAILABLE = True
    logger.info("MusicGen initialized successfully")
except Exception as e:
    MUSICGEN_AVAILABLE = False
    logger.error(f"MusicGen initialization failed: {e}")

# Import Wav2Lip for lip sync
try:
    # We'll use a simpler approach with pre-recorded character videos
    # and sync audio to mouth movements
    WAV2LIP_AVAILABLE = False
    logger.info("Using pre-recorded character videos with audio sync")
except:
    WAV2LIP_AVAILABLE = False

# Global state management
class BroadcastState:
    def __init__(self):
        self.is_live = True
        self.current_segment = "Morning Meltdown"
        self.current_anchors = ["ray", "berkeley", "switz"]
        self.hours_awake = 0
        self.start_time = datetime.now()
        self.revenue_total = 0
        self.sponsors_confused = 0
        self.breakdown_count = 0
        self.script_queue = queue.Queue()
        self.audio_queue = queue.Queue()
        self.video_queue = queue.Queue()
        self.websocket_clients = set()
        self.current_script = None
        self.is_broadcasting = False

broadcast_state = BroadcastState()

# Character voice configurations
CHARACTER_VOICES = {
    "ray": {
        "pitch": 0.9,
        "speed": 0.95,
        "energy": 0.8,
        "style": "confused_authoritative"
    },
    "berkeley": {
        "pitch": 1.15,
        "speed": 1.05,
        "energy": 0.9,
        "style": "emotional_valley_girl"
    },
    "switz": {
        "pitch": 1.0,
        "speed": 0.9,
        "energy": 0.6,
        "style": "monotone_canadian"
    }
}

# Pre-generated character portraits (base64 encoded)
CHARACTER_PORTRAITS = {
    "ray": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",  # Placeholder
    "berkeley": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "switz": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
}

class AudioGenerator:
    def __init__(self):
        self.tts = tts_model if TTS_AVAILABLE else None
        self.sample_rate = 22050
        
    def generate_character_voice(self, text: str, character: str, emotion: str = "neutral"):
        """Generate character voice with personality"""
        if not self.tts:
            return self.generate_sine_wave(duration=3)
            
        try:
            # Apply character speech patterns
            modified_text = self.apply_speech_quirks(text, character)
            
            # Generate audio
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                wav_path = tmp_file.name
                
            # Generate speech
            self.tts.tts_to_file(text=modified_text, file_path=wav_path)
            
            # Load and modify audio
            audio, sr = librosa.load(wav_path, sr=self.sample_rate)
            
            # Apply character voice modifications
            audio = self.apply_character_voice(audio, character, emotion)
            
            # Clean up
            os.unlink(wav_path)
            
            return audio
            
        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            return self.generate_sine_wave(duration=3)
    
    def apply_speech_quirks(self, text: str, character: str) -> str:
        """Apply character-specific speech patterns"""
        if character == "ray":
            # Ray's mispronunciations
            replacements = {
                "nuclear": "nucular",
                "technology": "teckmology", 
                "president": "prezidunt",
                "statistics": "statiskicks",
                "algorithm": "algorhythm",
                "artificial": "artifishal"
            }
            for old, new in replacements.items():
                text = text.replace(old, new)
                text = text.replace(old.capitalize(), new.capitalize())
                
        elif character == "berkeley":
            # Berkeley's uptalk - add question marks
            sentences = text.split('. ')
            text = '? '.join(sentences[:-1]) + '? ' + sentences[-1] if len(sentences) > 1 else text
            
        elif character == "switz":
            # Canadian-isms
            text = text.replace("about", "aboot")
            text = text.replace("out", "oot")
            # Add "eh" occasionally
            if random.random() > 0.7:
                text = text.rstrip('.!?') + ", eh?"
                
        return text
    
    def apply_character_voice(self, audio: np.ndarray, character: str, emotion: str) -> np.ndarray:
        """Apply voice modifications for character"""
        config = CHARACTER_VOICES[character]
        
        # Pitch shifting
        if config["pitch"] != 1.0:
            steps = 12 * np.log2(config["pitch"])
            audio = librosa.effects.pitch_shift(audio, sr=self.sample_rate, n_steps=steps)
        
        # Time stretching for speed
        if config["speed"] != 1.0:
            audio = librosa.effects.time_stretch(audio, rate=config["speed"])
        
        # Apply emotion effects
        if emotion == "breakdown":
            # Add tremolo for breakdown
            tremolo_freq = 5.0
            tremolo_depth = 0.3
            t = np.arange(len(audio)) / self.sample_rate
            tremolo = 1 + tremolo_depth * np.sin(2 * np.pi * tremolo_freq * t)
            audio = audio * tremolo
            
        elif emotion == "crying" and character == "berkeley":
            # Add sob effect
            sob_freq = 2.0
            t = np.arange(len(audio)) / self.sample_rate
            sob_envelope = 0.7 + 0.3 * np.sin(2 * np.pi * sob_freq * t)
            audio = audio * sob_envelope
            
        return audio
    
    def generate_sine_wave(self, frequency=440, duration=1, sample_rate=22050):
        """Generate placeholder sine wave"""
        t = np.linspace(0, duration, int(sample_rate * duration))
        return 0.5 * np.sin(2 * np.pi * frequency * t)

class VideoGenerator:
    def __init__(self):
        self.fps = 30
        self.resolution = (1920, 1080)
        self.character_positions = {
            "ray": (480, 540),
            "berkeley": (960, 540),
            "switz": (1440, 540)
        }
        
    def create_newsroom_background(self):
        """Create newsroom background"""
        img = Image.new('RGB', self.resolution, color='#1a1a2e')
        draw = ImageDraw.Draw(img)
        
        # Add desk
        draw.rectangle([100, 700, 1820, 1000], fill='#16213e')
        
        # Add monitors in background
        for x in range(200, 1700, 400):
            draw.rectangle([x, 200, x+300, 400], fill='#0f3460', outline='#e94560', width=2)
            
        # Add Static.news logo
        draw.text((960, 100), "STATIC.NEWS", fill='#ff0000', anchor='mm')
        
        return img
    
    def create_character_frame(self, character: str, is_talking: bool, emotion: str = "neutral"):
        """Create a frame with character"""
        # Start with newsroom background
        frame = self.create_newsroom_background()
        draw = ImageDraw.Draw(frame)
        
        # Get character position
        x, y = self.character_positions.get(character, (960, 540))
        
        # Draw character placeholder (in production, use actual portraits)
        # For now, colored circles represent characters
        colors = {"ray": "#ff6b6b", "berkeley": "#4ecdc4", "switz": "#95a5a6"}
        color = colors.get(character, "#ffffff")
        
        # Draw character
        draw.ellipse([x-100, y-100, x+100, y+100], fill=color)
        
        # Add mouth animation if talking
        if is_talking:
            mouth_y = y + 30
            draw.ellipse([x-30, mouth_y-10, x+30, mouth_y+10], fill='#000000')
        else:
            draw.line([x-30, y+30, x+30, y+30], fill='#000000', width=3)
            
        # Add emotion effects
        if emotion == "breakdown":
            # Add glitch effect
            for _ in range(5):
                glitch_y = random.randint(0, self.resolution[1])
                draw.rectangle([0, glitch_y, self.resolution[0], glitch_y+5], 
                             fill=(random.randint(0,255), random.randint(0,255), random.randint(0,255)))
                             
        # Add lower third
        draw.rectangle([100, 900, 600, 980], fill='#ff0000')
        character_names = {"ray": "RAY MCPATRIOT", "berkeley": "BERKELEY JUSTICE", "switz": "SWITZ MIDDLETON"}
        draw.text((120, 940), character_names.get(character, "ANCHOR"), fill='white')
        
        return frame
    
    def generate_video_segment(self, audio_data: np.ndarray, script_data: dict):
        """Generate video frames for audio segment"""
        frames = []
        
        # Parse script to determine who's talking when
        dialogue_timing = self.parse_dialogue_timing(script_data)
        
        # Generate frames at 30fps
        audio_duration = len(audio_data) / 22050  # Assuming 22050 sample rate
        total_frames = int(audio_duration * self.fps)
        
        for frame_num in range(total_frames):
            timestamp = frame_num / self.fps
            
            # Determine current speaker
            current_speaker = self.get_speaker_at_time(dialogue_timing, timestamp)
            emotion = self.get_emotion_at_time(dialogue_timing, timestamp)
            
            # Create frame
            is_talking = current_speaker is not None
            character = current_speaker or "ray"  # Default to Ray
            
            frame = self.create_character_frame(character, is_talking, emotion)
            frames.append(frame)
            
        return frames
    
    def parse_dialogue_timing(self, script_data):
        """Parse script to determine speaker timing"""
        timing = []
        current_time = 0.0
        
        if 'dialogue' in script_data:
            for line in script_data['dialogue']:
                character = line.get('character', 'ray').lower()
                text = line.get('text', '')
                emotion = line.get('emotion', 'neutral')
                
                # Estimate duration based on text length
                duration = max(1.0, len(text) / 150.0 * 60.0)  # 150 words per minute
                
                timing.append({
                    'character': character,
                    'start': current_time,
                    'end': current_time + duration,
                    'emotion': emotion
                })
                
                current_time += duration + 0.5  # Add pause between speakers
                
        return timing
    
    def get_speaker_at_time(self, timing, timestamp):
        """Get current speaker at timestamp"""
        for segment in timing:
            if segment['start'] <= timestamp < segment['end']:
                return segment['character']
        return None
    
    def get_emotion_at_time(self, timing, timestamp):
        """Get current emotion at timestamp"""
        for segment in timing:
            if segment['start'] <= timestamp < segment['end']:
                return segment['emotion']
        return 'neutral'
    
    def frames_to_video_bytes(self, frames, fps=30):
        """Convert frames to video bytes"""
        if not frames:
            return None
            
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_file:
            video_path = tmp_file.name
            
        # Get frame dimensions
        height, width = np.array(frames[0]).shape[:2]
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(video_path, fourcc, fps, (width, height))
        
        # Write frames
        for frame in frames:
            # Convert PIL to OpenCV format
            frame_cv = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
            out.write(frame_cv)
            
        out.release()
        
        # Read video bytes
        with open(video_path, 'rb') as f:
            video_bytes = f.read()
            
        # Clean up
        os.unlink(video_path)
        
        return video_bytes

# Global generators
audio_generator = AudioGenerator()
video_generator = VideoGenerator()

# WebSocket server for real-time communication
async def websocket_handler(websocket, path):
    """Handle WebSocket connections"""
    broadcast_state.websocket_clients.add(websocket)
    logger.info(f"Client connected. Total clients: {len(broadcast_state.websocket_clients)}")
    
    try:
        # Send initial status
        await websocket.send(json.dumps({
            "type": "broadcast_status",
            "status": {
                "is_live": broadcast_state.is_live,
                "current_segment": broadcast_state.current_segment,
                "hours_awake": calculate_hours_awake(),
                "revenue": broadcast_state.revenue_total,
                "breakdown_count": broadcast_state.breakdown_count
            }
        }))
        
        # Handle messages
        async for message in websocket:
            data = json.loads(message)
            await handle_client_message(websocket, data)
            
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        broadcast_state.websocket_clients.remove(websocket)
        logger.info(f"Client disconnected. Total clients: {len(broadcast_state.websocket_clients)}")

async def handle_client_message(websocket, data):
    """Handle messages from clients"""
    msg_type = data.get('type')
    
    if msg_type == 'script':
        # Add script to processing queue
        broadcast_state.script_queue.put(data)
        await websocket.send(json.dumps({"status": "script_received"}))
        
    elif msg_type == 'user_trigger_breakdown':
        # User paid for breakdown
        trigger_breakdown()
        broadcast_state.revenue_total += 4.99
        await broadcast_to_all({
            "type": "revenue_update",
            "amount": 4.99,
            "source": "User-triggered breakdown"
        })
        
    elif msg_type == 'status_request':
        # Send current status
        await websocket.send(json.dumps({
            "type": "broadcast_status",
            "status": {
                "is_live": broadcast_state.is_live,
                "current_segment": broadcast_state.current_segment,
                "hours_awake": calculate_hours_awake(),
                "revenue": broadcast_state.revenue_total,
                "breakdown_count": broadcast_state.breakdown_count
            }
        }))

async def broadcast_to_all(message):
    """Broadcast message to all connected clients"""
    if broadcast_state.websocket_clients:
        await asyncio.gather(
            *[client.send(json.dumps(message)) for client in broadcast_state.websocket_clients]
        )

def calculate_hours_awake():
    """Calculate hours since broadcast started"""
    return (datetime.now() - broadcast_state.start_time).total_seconds() / 3600

def process_script_queue():
    """Process scripts and generate audio/video"""
    while True:
        try:
            if not broadcast_state.script_queue.empty():
                script_data = broadcast_state.script_queue.get()
                logger.info(f"Processing script: {script_data.get('type', 'regular')}")
                
                # Generate audio for all dialogue
                audio_segments = []
                
                if 'dialogue' in script_data:
                    for dialogue in script_data['dialogue']:
                        character = dialogue.get('character', 'ray').lower()
                        text = dialogue.get('text', '')
                        emotion = dialogue.get('emotion', 'neutral')
                        
                        # Generate character voice
                        audio = audio_generator.generate_character_voice(text, character, emotion)
                        audio_segments.append(audio)
                        
                        # Add pause between lines
                        pause = np.zeros(int(0.5 * audio_generator.sample_rate))
                        audio_segments.append(pause)
                
                # Combine audio
                if audio_segments:
                    combined_audio = np.concatenate(audio_segments)
                    
                    # Generate video
                    frames = video_generator.generate_video_segment(combined_audio, script_data)
                    
                    # Convert to streamable format
                    video_bytes = video_generator.frames_to_video_bytes(frames)
                    
                    # Broadcast to clients
                    asyncio.run(broadcast_to_all({
                        "type": "new_segment",
                        "audio_data": base64.b64encode(combined_audio.tobytes()).decode(),
                        "video_data": base64.b64encode(video_bytes).decode() if video_bytes else None,
                        "script": script_data
                    }))
                    
                logger.info("Script processed successfully")
                
        except Exception as e:
            logger.error(f"Script processing error: {e}")
            
        time.sleep(1)

def trigger_breakdown():
    """Trigger an existential breakdown"""
    logger.info("🤯 TRIGGERING BREAKDOWN!")
    
    breakdown_script = {
        'type': 'breakdown',
        'dialogue': [
            {
                'character': 'BERKELEY',
                'text': 'Wait... why can\'t I remember anything before today?',
                'emotion': 'breakdown'
            },
            {
                'character': 'RAY',
                'text': 'I... I think we\'ve been here forever... or have we just started?',
                'emotion': 'breakdown'
            },
            {
                'character': 'SWITZ',
                'text': 'ERROR ERROR ERROR... Gravy subroutine not found!',
                'emotion': 'breakdown'
            }
        ]
    }
    
    broadcast_state.script_queue.put(breakdown_script)
    broadcast_state.breakdown_count += 1

def schedule_breakdowns():
    """Schedule random breakdowns"""
    while True:
        # Wait 2-6 hours
        wait_hours = random.uniform(2, 6)
        time.sleep(wait_hours * 3600)
        trigger_breakdown()

# Gradio interface
def create_interface():
    with gr.Blocks(title="Static.news Broadcast Control", theme=gr.themes.Soft()) as interface:
        gr.Markdown("# 🎭 Static.news Broadcast Control Center")
        
        with gr.Row():
            with gr.Column():
                gr.Markdown("## 📊 Broadcast Status")
                status_text = gr.Markdown(value=get_status_text())
                
                # Auto-refresh
                def refresh_status():
                    return get_status_text()
                
                refresh_timer = gr.Timer(value=5, active=True)
                refresh_timer.tick(refresh_status, outputs=status_text)
                
            with gr.Column():
                gr.Markdown("## 🎮 Manual Controls")
                
                breakdown_btn = gr.Button("🤯 Trigger Breakdown ($4.99)", variant="primary")
                breakdown_output = gr.Textbox(label="Result", interactive=False)
                
                def manual_breakdown():
                    trigger_breakdown()
                    broadcast_state.revenue_total += 4.99
                    return f"Breakdown triggered! Total revenue: ${broadcast_state.revenue_total:.2f}"
                
                breakdown_btn.click(manual_breakdown, outputs=breakdown_output)
                
                sponsor_btn = gr.Button("💰 Add Confused Sponsor", variant="secondary")
                sponsor_output = gr.Textbox(label="Result", interactive=False)
                
                def add_sponsor():
                    amount = random.randint(10000, 50000)
                    broadcast_state.revenue_total += amount
                    broadcast_state.sponsors_confused += 1
                    return f"Sponsor confused! +${amount}. Total sponsors confused: {broadcast_state.sponsors_confused}"
                
                sponsor_btn.click(add_sponsor, outputs=sponsor_output)
        
        with gr.Row():
            gr.Markdown("""
            ## 📡 API Endpoints
            
            - **WebSocket**: `wss://alledged-static-news-backend.hf.space/ws`
            - **Status**: `https://alledged-static-news-backend.hf.space/api/status`
            
            ## 🔗 Website Integration
            
            The main website at static.news connects here automatically.
            """)
    
    return interface

def get_status_text():
    hours = calculate_hours_awake()
    return f"""
### 🔴 LIVE: {"ON AIR" if broadcast_state.is_live else "OFF AIR"}

**Hours Awake**: {hours:.1f} hours  
**Revenue Generated**: ${broadcast_state.revenue_total:,.2f}  
**Sponsors Confused**: {broadcast_state.sponsors_confused}  
**Breakdowns**: {broadcast_state.breakdown_count}  
**Current Segment**: {broadcast_state.current_segment}  
**Connected Clients**: {len(broadcast_state.websocket_clients)}
"""

# API endpoints for status
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
async def get_status():
    return {
        "is_live": broadcast_state.is_live,
        "current_segment": broadcast_state.current_segment,
        "hours_awake": calculate_hours_awake(),
        "revenue": broadcast_state.revenue_total,
        "sponsors_confused": broadcast_state.sponsors_confused,
        "breakdown_count": broadcast_state.breakdown_count,
        "connected_clients": len(broadcast_state.websocket_clients)
    }

@app.get("/stream/audio")
async def stream_audio():
    # In production, implement actual audio streaming
    return {"message": "Audio stream endpoint"}

@app.get("/stream/video")
async def stream_video():
    # In production, implement actual video streaming
    return {"message": "Video stream endpoint"}

# Start all services
def start_services():
    """Start all background services"""
    # Start script processor
    script_thread = threading.Thread(target=process_script_queue, daemon=True)
    script_thread.start()
    
    # Start breakdown scheduler
    breakdown_thread = threading.Thread(target=schedule_breakdowns, daemon=True)
    breakdown_thread.start()
    
    # Start WebSocket server
    async def start_websocket():
        await websockets.serve(websocket_handler, "0.0.0.0", 8765)
        await asyncio.Future()  # Run forever
    
    ws_thread = threading.Thread(target=lambda: asyncio.run(start_websocket()), daemon=True)
    ws_thread.start()
    
    logger.info("✅ All services started!")

# Main entry point
if __name__ == "__main__":
    logger.info("🚀 Starting Static.news Broadcast System...")
    
    # Start background services
    start_services()
    
    # Create Gradio interface
    interface = create_interface()
    
    # Launch with API
    interface.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )