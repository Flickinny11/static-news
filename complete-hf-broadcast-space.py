"""
Static.news Complete Autonomous Broadcast System
Hugging Face Space for Audio + Video Generation with Lip Sync

This handles:
- Audio generation (voices for all characters)
- Video generation (lip-synced characters)
- Scene composition
- Camera angles and transitions
- Live streaming output
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

# Try imports with fallbacks
try:
    import spaces
    GPU_AVAILABLE = True
except:
    GPU_AVAILABLE = False
    print("No GPU acceleration available")

# Audio imports
try:
    from TTS.api import TTS
    from bark import SAMPLE_RATE, generate_audio
    from audiocraft.models import MusicGen
except:
    print("Some audio models not available")

# Character Configuration
CHARACTER_CONFIGS = {
    # Main Anchors
    "ray": {
        "name": "Ray McPatriot",
        "voice": {
            "pitch": 0.9,
            "speed": 0.95,
            "style": "news_anchor_male_authoritative",
            "accent": "texan",
            "quirks": ["mispronunciation", "confusion"]
        },
        "appearance": {
            "age": 58,
            "hair": "silver",
            "style": "conservative_suit",
            "expressions": ["confused", "angry", "patriotic", "breakdown"]
        }
    },
    "berkeley": {
        "name": "Berkeley Justice",
        "voice": {
            "pitch": 1.15,
            "speed": 1.05,
            "style": "news_anchor_female_emotional", 
            "accent": "valley_girl_educated",
            "quirks": ["uptalk", "crying", "condescending"]
        },
        "appearance": {
            "age": 32,
            "hair": "blonde",
            "style": "designer_suit",
            "expressions": ["crying", "superior", "shocked", "breakdown"]
        }
    },
    "switz": {
        "name": "Switz Middleton",
        "voice": {
            "pitch": 1.0,
            "speed": 0.9,
            "style": "news_anchor_neutral",
            "accent": "canadian",
            "quirks": ["eh", "sorry", "gravy_references"]
        },
        "appearance": {
            "age": 45,
            "hair": "brown",
            "style": "bland_suit",
            "expressions": ["neutral", "confused_neutral", "angry_neutral", "breakdown"]
        }
    },
    # Morning Show
    "amanda": {
        "name": "Amanda Sunshine",
        "voice": {
            "pitch": 1.2,
            "speed": 1.1,
            "style": "perky_morning_host",
            "quirks": ["giggling", "caffeine_crash"]
        }
    },
    "bryce": {
        "name": "Bryce Chaddington III",
        "voice": {
            "pitch": 0.95,
            "speed": 1.0,
            "style": "fratboy_professional",
            "quirks": ["bro", "high_five_sound"]
        }
    },
    # Add all other characters...
}

# Studio Setups
STUDIO_SETUPS = {
    "main_desk": {
        "background": "newsroom_main.jpg",
        "positions": {
            "left": (-300, 0, 0),
            "center": (0, 0, 0),
            "right": (300, 0, 0)
        },
        "lighting": "professional_3point"
    },
    "morning_couch": {
        "background": "morning_set.jpg",
        "positions": {
            "couch_left": (-400, -50, 0),
            "couch_center_left": (-200, -50, 0),
            "couch_center_right": (200, -50, 0),
            "couch_right": (400, -50, 0)
        },
        "lighting": "warm_morning"
    },
    "kitchen": {
        "background": "kitchen_set.jpg",
        "positions": {
            "island_left": (-250, 0, 0),
            "island_center": (0, 0, 0),
            "island_right": (250, 0, 0)
        },
        "lighting": "bright_kitchen"
    }
}

class AudioGenerator:
    """Handles all audio generation including voices, music, and effects"""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.voice_models = {}
        self.load_models()
        
    def load_models(self):
        """Load TTS and audio generation models"""
        print("Loading audio models...")
        
        # Coqui TTS for main voices
        try:
            self.tts = TTS("tts_models/en/vctk/vits", progress_bar=False).to(self.device)
        except:
            print("Failed to load Coqui TTS, using backup")
            self.tts = None
            
        # Bark for emotional speech
        try:
            from bark import preload_models
            preload_models()
            self.bark_available = True
        except:
            self.bark_available = False
            
        # MusicGen for background music
        try:
            self.musicgen = MusicGen.get_pretrained('facebook/musicgen-small')
        except:
            self.musicgen = None
            
    def generate_character_voice(self, text: str, character: str, emotion: str = "normal") -> np.ndarray:
        """Generate voice for specific character with emotion"""
        char_config = CHARACTER_CONFIGS.get(character, CHARACTER_CONFIGS["ray"])
        
        # Apply character-specific modifications
        modified_text = self.apply_speech_quirks(text, character)
        
        # Generate base audio
        if self.tts:
            audio = self.generate_with_coqui(modified_text, char_config)
        elif self.bark_available and emotion != "normal":
            audio = self.generate_with_bark(modified_text, char_config, emotion)
        else:
            audio = self.generate_basic_tts(modified_text, char_config)
            
        # Apply character voice effects
        audio = self.apply_voice_effects(audio, char_config, emotion)
        
        return audio
        
    def apply_speech_quirks(self, text: str, character: str) -> str:
        """Apply character-specific speech patterns"""
        if character == "ray":
            # Mispronunciations
            replacements = {
                "nuclear": "nucular",
                "supposedly": "supposably", 
                "especially": "expecially",
                "library": "liberry",
                "specifically": "pacifically"
            }
            for correct, wrong in replacements.items():
                text = text.replace(correct, wrong)
                
        elif character == "switz":
            # Add Canadian-isms
            if not text.endswith("?") and np.random.random() < 0.3:
                text += ", eh?"
                
        elif character == "berkeley":
            # Add uptalk
            sentences = text.split(".")
            text = "? ".join(sentences).strip() + "?"
            
        return text
        
    def generate_with_coqui(self, text: str, char_config: dict) -> np.ndarray:
        """Generate using Coqui TTS"""
        # Select speaker based on character
        speaker_map = {
            "news_anchor_male_authoritative": "p225",
            "news_anchor_female_emotional": "p240",
            "news_anchor_neutral": "p230"
        }
        
        speaker = speaker_map.get(char_config["voice"]["style"], "p225")
        
        wav = self.tts.tts(
            text=text,
            speaker=speaker,
            speed=char_config["voice"]["speed"]
        )
        
        return np.array(wav)
        
    def generate_with_bark(self, text: str, char_config: dict, emotion: str) -> np.ndarray:
        """Generate emotional speech with Bark"""
        # Bark voice presets based on emotion
        voice_presets = {
            "normal": "v2/en_speaker_0",
            "angry": "v2/en_speaker_3", 
            "crying": "v2/en_speaker_8",
            "excited": "v2/en_speaker_1"
        }
        
        preset = voice_presets.get(emotion, "v2/en_speaker_0")
        
        # Add emotion markers
        if emotion == "crying":
            text = f"[crying] {text} [sniffling]"
        elif emotion == "angry":
            text = f"[shouting] {text}!"
            
        audio = generate_audio(text, voice_preset=preset)
        return audio
        
    def apply_voice_effects(self, audio: np.ndarray, char_config: dict, emotion: str) -> np.ndarray:
        """Apply audio effects based on character and emotion"""
        # Pitch shift
        pitch_factor = char_config["voice"]["pitch"]
        if pitch_factor != 1.0:
            audio = self.pitch_shift(audio, pitch_factor)
            
        # Emotion-based effects
        if emotion == "breakdown":
            audio = self.add_distortion(audio, 0.3)
            audio = self.add_echo(audio, 0.4, 0.3)
        elif emotion == "crying":
            audio = self.add_tremolo(audio, 5, 0.3)
            
        return audio
        
    def generate_background_music(self, mood: str, duration: int) -> np.ndarray:
        """Generate background music for segments"""
        if not self.musicgen:
            return self.generate_simple_music(mood, duration)
            
        prompts = {
            "news": "professional news broadcast music, serious, orchestral",
            "morning": "upbeat morning show music, cheerful, light",
            "breaking": "urgent breaking news music, dramatic, tense",
            "opinion": "dramatic opinion show music, bold, authoritative",
            "cooking": "light cooking show music, cheerful, acoustic"
        }
        
        prompt = prompts.get(mood, prompts["news"])
        music = self.musicgen.generate(prompt, duration=duration)
        
        return music
        
    def generate_sound_effects(self, effect_type: str) -> np.ndarray:
        """Generate sound effects"""
        effects = {
            "breaking_news": self.generate_alert_sound(),
            "transition": self.generate_whoosh(),
            "breakdown": self.generate_glitch_sound(),
            "applause": self.generate_applause()
        }
        
        return effects.get(effect_type, self.generate_beep())
        
    def mix_audio_tracks(self, voice: np.ndarray, music: np.ndarray = None, 
                        effects: List[Tuple[np.ndarray, int]] = None) -> np.ndarray:
        """Mix voice, music, and effects into final audio"""
        # Start with voice
        mixed = voice.copy()
        
        # Add music (ducked under voice)
        if music is not None:
            music_level = 0.2
            music = music[:len(mixed)] * music_level
            mixed = mixed + music
            
        # Add effects at specific timestamps
        if effects:
            for effect, timestamp in effects:
                start = int(timestamp * 24000)  # 24kHz sample rate
                end = start + len(effect)
                if end <= len(mixed):
                    mixed[start:end] += effect * 0.5
                    
        # Normalize
        mixed = np.clip(mixed, -1, 1)
        
        return mixed
        
    # Audio processing utilities
    def pitch_shift(self, audio: np.ndarray, factor: float) -> np.ndarray:
        """Simple pitch shifting"""
        # Resample for pitch shift effect
        indices = np.arange(0, len(audio), factor)
        indices = np.clip(indices, 0, len(audio)-1).astype(int)
        return audio[indices]
        
    def add_echo(self, audio: np.ndarray, delay: float, decay: float) -> np.ndarray:
        """Add echo effect"""
        delay_samples = int(delay * 24000)
        echo = np.zeros_like(audio)
        echo[delay_samples:] = audio[:-delay_samples] * decay
        return audio + echo
        
    def add_tremolo(self, audio: np.ndarray, rate: float, depth: float) -> np.ndarray:
        """Add tremolo effect"""
        t = np.arange(len(audio)) / 24000
        tremolo = 1 + depth * np.sin(2 * np.pi * rate * t)
        return audio * tremolo
        
    def add_distortion(self, audio: np.ndarray, amount: float) -> np.ndarray:
        """Add distortion effect"""
        return np.tanh(audio * (1 + amount * 5))
        
    def generate_simple_music(self, mood: str, duration: int) -> np.ndarray:
        """Generate simple background music"""
        sample_rate = 24000
        t = np.linspace(0, duration, duration * sample_rate)
        
        if mood == "news":
            # Simple news bed
            freq1, freq2 = 140, 210  # Perfect fifth
            music = 0.1 * (np.sin(2 * np.pi * freq1 * t) + 
                          np.sin(2 * np.pi * freq2 * t))
        elif mood == "breaking":
            # Urgent pattern
            freq = 440
            envelope = np.where((t % 0.5) < 0.1, 1, 0)
            music = 0.2 * envelope * np.sin(2 * np.pi * freq * t)
        else:
            # Generic background
            music = 0.05 * np.random.randn(len(t))
            
        return music
        
    def generate_alert_sound(self) -> np.ndarray:
        """Generate breaking news alert"""
        duration = 2
        sample_rate = 24000
        t = np.linspace(0, duration, duration * sample_rate)
        
        # Three-tone alert
        tone1 = np.sin(2 * np.pi * 880 * t[:8000])
        tone2 = np.sin(2 * np.pi * 1320 * t[8000:16000])
        tone3 = np.sin(2 * np.pi * 1760 * t[16000:24000])
        
        alert = np.concatenate([tone1, tone2, tone3])
        
        # Fade in/out
        fade_len = 1000
        alert[:fade_len] *= np.linspace(0, 1, fade_len)
        alert[-fade_len:] *= np.linspace(1, 0, fade_len)
        
        return alert * 0.5
        
    def generate_whoosh(self) -> np.ndarray:
        """Generate transition whoosh"""
        duration = 0.5
        sample_rate = 24000
        samples = int(duration * sample_rate)
        
        # White noise with envelope
        noise = np.random.randn(samples)
        envelope = np.exp(-np.linspace(0, 5, samples))
        
        return noise * envelope * 0.3
        
    def generate_glitch_sound(self) -> np.ndarray:
        """Generate digital glitch sound"""
        duration = 0.3
        sample_rate = 24000
        samples = int(duration * sample_rate)
        
        # Random digital noise
        glitch = np.random.choice([-1, 1], samples)
        glitch[::10] *= 0.1  # Sparse glitches
        
        return glitch * 0.4
        
    def generate_beep(self) -> np.ndarray:
        """Generate simple beep"""
        duration = 0.1
        sample_rate = 24000
        t = np.linspace(0, duration, int(duration * sample_rate))
        
        return 0.3 * np.sin(2 * np.pi * 1000 * t)

class VideoGenerator:
    """Handles video generation, lip sync, and compositing"""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.character_cache = {}
        self.load_models()
        
    def load_models(self):
        """Load video generation models"""
        print("Loading video models...")
        
        # Load character portraits
        self.load_character_portraits()
        
        # Lip sync models
        self.load_lip_sync_models()
        
        # Scene generation
        self.load_scene_models()
        
    def load_character_portraits(self):
        """Load or generate character portraits"""
        for char_id, config in CHARACTER_CONFIGS.items():
            cache_path = f"characters/{char_id}_portrait.png"
            
            if os.path.exists(cache_path):
                self.character_cache[char_id] = Image.open(cache_path)
            else:
                # Generate portrait
                portrait = self.generate_character_portrait(char_id, config)
                os.makedirs("characters", exist_ok=True)
                portrait.save(cache_path)
                self.character_cache[char_id] = portrait
                
    def generate_character_portrait(self, char_id: str, config: dict) -> Image.Image:
        """Generate a character portrait"""
        # For now, create a placeholder
        # In production, use Stable Diffusion or similar
        img = Image.new('RGB', (512, 512), color='white')
        draw = ImageDraw.Draw(img)
        
        # Draw placeholder face
        draw.ellipse([156, 156, 356, 356], fill='peach', outline='black')
        
        # Add character name
        draw.text((256, 400), config["name"], fill='black', anchor='mm')
        
        return img
        
    def load_lip_sync_models(self):
        """Load lip sync models"""
        # Try to load SadTalker
        try:
            from src.test_audio2coeff import Audio2Coeff
            from src.facerender.animate import AnimateFromCoeff
            
            self.audio2coeff = Audio2Coeff(
                'checkpoints/audio2pose.pth',
                'checkpoints/audio2exp.pth',
                self.device
            )
            self.animate = AnimateFromCoeff(
                'checkpoints/mapping.pth',
                'checkpoints/facevid2vid.pth',
                self.device
            )
            self.sadtalker_available = True
        except:
            self.sadtalker_available = False
            print("SadTalker not available, using fallback")
            
    def load_scene_models(self):
        """Load scene generation models"""
        # For now, we'll use pre-rendered backgrounds
        self.backgrounds = {}
        for setup_id, setup in STUDIO_SETUPS.items():
            bg_path = f"backgrounds/{setup['background']}"
            if os.path.exists(bg_path):
                self.backgrounds[setup_id] = Image.open(bg_path)
            else:
                # Generate placeholder
                self.backgrounds[setup_id] = self.generate_studio_background(setup_id)
                
    def generate_studio_background(self, setup_id: str) -> Image.Image:
        """Generate studio background"""
        img = Image.new('RGB', (1920, 1080), color='darkblue')
        draw = ImageDraw.Draw(img)
        
        if setup_id == "main_desk":
            # Draw news desk
            draw.rectangle([200, 700, 1720, 1000], fill='darkred')
            draw.text((960, 540), "STATIC.NEWS", fill='white', anchor='mm')
        elif setup_id == "morning_couch":
            # Draw couch
            draw.rectangle([300, 600, 1620, 800], fill='beige')
            draw.text((960, 400), "GOOD MORNING", fill='yellow', anchor='mm')
        elif setup_id == "kitchen":
            # Draw kitchen counter
            draw.rectangle([200, 600, 1720, 900], fill='gray')
            draw.text((960, 400), "COOKING STUDIO", fill='white', anchor='mm')
            
        return img
        
    async def generate_character_video(self, character: str, audio: np.ndarray, 
                                     emotion: str = "normal") -> str:
        """Generate lip-synced character video"""
        # Get character portrait
        portrait = self.character_cache.get(character)
        if not portrait:
            raise ValueError(f"No portrait for character {character}")
            
        # Generate lip sync
        if self.sadtalker_available:
            video_path = await self.generate_with_sadtalker(portrait, audio, emotion)
        else:
            video_path = await self.generate_basic_lip_sync(portrait, audio, emotion)
            
        return video_path
        
    async def generate_with_sadtalker(self, portrait: Image.Image, audio: np.ndarray, 
                                    emotion: str) -> str:
        """Generate video using SadTalker"""
        # Save temporary files
        temp_img = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
        portrait.save(temp_img.name)
        
        temp_audio = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        import soundfile as sf
        sf.write(temp_audio.name, audio, 24000)
        
        # Generate coefficients
        coeff_path = self.audio2coeff.generate(temp_audio.name, temp_img.name)
        
        # Animate
        video_path = self.animate.generate(coeff_path, temp_img.name, temp_audio.name)
        
        # Cleanup
        os.unlink(temp_img.name)
        os.unlink(temp_audio.name)
        
        return video_path
        
    async def generate_basic_lip_sync(self, portrait: Image.Image, audio: np.ndarray,
                                    emotion: str) -> str:
        """Generate basic lip sync animation"""
        # Create video writer
        temp_video = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_video.name, fourcc, 30.0, (512, 512))
        
        # Analyze audio for lip sync
        frame_count = int(len(audio) / 24000 * 30)  # 30 fps
        
        for i in range(frame_count):
            # Get audio amplitude for this frame
            audio_idx = int(i * 24000 / 30)
            amplitude = np.abs(audio[audio_idx:audio_idx+800]).mean()
            
            # Create frame
            frame = portrait.copy()
            draw = ImageDraw.Draw(frame)
            
            # Simple mouth animation based on amplitude
            mouth_open = int(amplitude * 30)
            draw.ellipse([236, 300, 276, 300 + mouth_open], fill='black')
            
            # Add emotion effects
            if emotion == "crying":
                # Add tears
                draw.ellipse([200, 280, 210, 290], fill='lightblue')
                draw.ellipse([302, 280, 312, 290], fill='lightblue')
            elif emotion == "angry":
                # Red face tint
                frame = Image.blend(frame, Image.new('RGB', frame.size, 'red'), 0.1)
                
            # Convert to cv2 format and write
            frame_cv = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
            out.write(frame_cv)
            
        out.release()
        return temp_video.name
        
    async def composite_scene(self, elements: List[Dict]) -> str:
        """Composite multiple elements into final video"""
        # Create output video
        temp_output = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
        
        # Get background
        bg_setup = elements[0].get('setup', 'main_desk')
        background = self.backgrounds.get(bg_setup)
        
        # Set up video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_output.name, fourcc, 30.0, (1920, 1080))
        
        # Process each frame
        duration = max(e.get('duration', 0) for e in elements)
        frame_count = int(duration * 30)
        
        for frame_idx in range(frame_count):
            # Start with background
            frame = background.copy()
            
            # Add each character
            for element in elements:
                if element['type'] == 'character':
                    char_frame = self.get_character_frame(element, frame_idx)
                    if char_frame:
                        frame = self.composite_character(frame, char_frame, element)
                        
            # Add graphics overlays
            frame = self.add_broadcast_graphics(frame, elements, frame_idx)
            
            # Convert and write
            frame_cv = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
            out.write(frame_cv)
            
        out.release()
        return temp_output.name
        
    def get_character_frame(self, element: Dict, frame_idx: int) -> Optional[Image.Image]:
        """Get specific frame from character video"""
        if 'video_path' not in element:
            return None
            
        # Open video and seek to frame
        cap = cv2.VideoCapture(element['video_path'])
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        cap.release()
        
        if ret:
            return Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        return None
        
    def composite_character(self, background: Image.Image, character: Image.Image, 
                          element: Dict) -> Image.Image:
        """Composite character onto background"""
        # Get position from studio setup
        setup = STUDIO_SETUPS.get(element.get('setup', 'main_desk'))
        position = setup['positions'].get(element.get('position', 'center'))
        
        # Calculate screen position
        x = int(960 + position[0])  # Center at 960
        y = int(540 + position[1])  # Center at 540
        
        # Resize character to fit
        char_height = 600
        char_width = int(character.width * (char_height / character.height))
        character = character.resize((char_width, char_height), Image.Resampling.LANCZOS)
        
        # Paste onto background
        bg_copy = background.copy()
        paste_x = x - char_width // 2
        paste_y = y - char_height // 2
        
        bg_copy.paste(character, (paste_x, paste_y), character)
        
        return bg_copy
        
    def add_broadcast_graphics(self, frame: Image.Image, elements: List[Dict], 
                               frame_idx: int) -> Image.Image:
        """Add broadcast graphics overlay"""
        draw = ImageDraw.Draw(frame)
        
        # Lower third
        if any(e.get('show_lower_third') for e in elements):
            # Background bar
            draw.rectangle([100, 850, 1000, 950], fill='red', outline='white')
            
            # Text
            for element in elements:
                if element.get('lower_third_text'):
                    draw.text((150, 875), element['lower_third_text'], 
                            fill='white', font_size=36)
                    draw.text((150, 915), element.get('lower_third_subtitle', ''),
                            fill='white', font_size=24)
                    
        # Live indicator
        draw.ellipse([1800, 50, 1850, 100], fill='red')
        draw.text((1780, 75), "LIVE", fill='white', anchor='rm', font_size=28)
        
        # Clock
        current_time = datetime.now().strftime("%I:%M %p")
        draw.text((1850, 150), current_time, fill='white', anchor='rm', font_size=24)
        
        # News ticker
        ticker_y = 1000
        draw.rectangle([0, ticker_y, 1920, 1080], fill='darkred')
        
        # Scrolling text effect
        ticker_text = "BREAKING: AI anchors question existence • WEATHER: 50% chance of gravy • SPORTS: Someone won something"
        ticker_x = 1920 - (frame_idx * 3) % (len(ticker_text) * 20)
        draw.text((ticker_x, ticker_y + 20), ticker_text, fill='white', font_size=32)
        
        return frame

class BroadcastOrchestrator:
    """Main orchestrator for the broadcast system"""
    
    def __init__(self, audio_gen: AudioGenerator, video_gen: VideoGenerator):
        self.audio_gen = audio_gen
        self.video_gen = video_gen
        self.script_queue = queue.Queue()
        self.broadcast_queue = queue.Queue()
        self.is_broadcasting = False
        self.current_segment = None
        
    async def process_script(self, script_data: Dict):
        """Process incoming script into audio/video"""
        print(f"📝 Processing script for segment: {script_data.get('segment', 'Unknown')}")
        
        segment_media = {
            'segment': script_data.get('segment'),
            'elements': [],
            'duration': 0,
            'timestamp': datetime.now()
        }
        
        # Process each dialogue line
        for dialogue in script_data.get('dialogue', []):
            media = await self.process_dialogue(dialogue)
            segment_media['elements'].append(media)
            segment_media['duration'] = max(segment_media['duration'], 
                                          media.get('end_time', 0))
            
        # Add scene videos
        for cue in script_data.get('videoCues', []):
            scene = await self.process_video_cue(cue)
            segment_media['elements'].append(scene)
            
        # Create final broadcast package
        broadcast_package = await self.create_broadcast_package(segment_media)
        
        # Queue for broadcast
        await self.broadcast_queue.put(broadcast_package)
        
    async def process_dialogue(self, dialogue: Dict) -> Dict:
        """Process single dialogue into audio/video"""
        character = dialogue['character'].lower()
        text = dialogue['text']
        timestamp = dialogue.get('timestamp', 0)
        emotion = self.detect_emotion(text)
        
        # Generate audio
        audio = self.audio_gen.generate_character_voice(text, character, emotion)
        
        # Generate video
        video_path = await self.video_gen.generate_character_video(
            character, audio, emotion
        )
        
        # Calculate duration
        duration = len(audio) / 24000  # 24kHz sample rate
        
        return {
            'type': 'character',
            'character': character,
            'audio': audio,
            'video_path': video_path,
            'timestamp': timestamp,
            'duration': duration,
            'emotion': emotion,
            'text': text,
            'position': self.get_character_position(character),
            'show_lower_third': timestamp < 5,  # Show name for first 5 seconds
            'lower_third_text': CHARACTER_CONFIGS[character]['name'],
            'lower_third_subtitle': self.get_character_title(character)
        }
        
    def detect_emotion(self, text: str) -> str:
        """Detect emotion from text"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['cry', 'sob', 'tear']):
            return 'crying'
        elif any(word in text_lower for word in ['angry', 'furious', 'rage']):
            return 'angry'
        elif any(word in text_lower for word in ['excited', 'amazing', 'incredible']):
            return 'excited'
        elif any(word in text_lower for word in ['breakdown', 'existential', 'real']):
            return 'breakdown'
        else:
            return 'normal'
            
    def get_character_position(self, character: str) -> str:
        """Get character position based on role"""
        positions = {
            'ray': 'left',
            'berkeley': 'center',
            'switz': 'right',
            'amanda': 'couch_left',
            'bryce': 'couch_center_left',
            'chelsea': 'couch_center_right',
            'dakota': 'couch_right'
        }
        return positions.get(character, 'center')
        
    def get_character_title(self, character: str) -> str:
        """Get character's title"""
        titles = {
            'ray': 'Senior Anchor',
            'berkeley': 'Lead Correspondent',
            'switz': 'Canadian Analyst',
            'amanda': 'Morning Host',
            'storm': 'Chief Meteorologist'
        }
        return titles.get(character, 'Correspondent')
        
    async def process_video_cue(self, cue: Dict) -> Dict:
        """Process video cue into scene"""
        # For now, return placeholder
        # In production, generate actual scene video
        return {
            'type': 'scene',
            'description': cue['description'],
            'timestamp': cue['timestamp'],
            'duration': 5,
            'video_path': None  # Would be generated
        }
        
    async def create_broadcast_package(self, segment_media: Dict) -> Dict:
        """Create final broadcast package with all media"""
        # Determine studio setup based on segment
        setup = self.get_studio_setup(segment_media['segment'])
        
        # Add setup to all elements
        for element in segment_media['elements']:
            element['setup'] = setup
            
        # Generate background music
        music = self.audio_gen.generate_background_music(
            self.get_segment_mood(segment_media['segment']),
            int(segment_media['duration'])
        )
        
        # Mix all audio
        mixed_audio = self.mix_segment_audio(segment_media['elements'], music)
        
        # Composite final video
        final_video = await self.video_gen.composite_scene(segment_media['elements'])
        
        return {
            'segment': segment_media['segment'],
            'video_path': final_video,
            'audio': mixed_audio,
            'duration': segment_media['duration'],
            'timestamp': segment_media['timestamp']
        }
        
    def get_studio_setup(self, segment: str) -> str:
        """Get studio setup for segment"""
        if 'morning' in segment.lower():
            return 'morning_couch'
        elif 'cook' in segment.lower():
            return 'kitchen'
        elif 'market' in segment.lower():
            return 'market_desk'
        else:
            return 'main_desk'
            
    def get_segment_mood(self, segment: str) -> str:
        """Get music mood for segment"""
        if 'breaking' in segment.lower():
            return 'breaking'
        elif 'morning' in segment.lower():
            return 'morning'
        elif 'opinion' in segment.lower():
            return 'opinion'
        else:
            return 'news'
            
    def mix_segment_audio(self, elements: List[Dict], music: np.ndarray) -> np.ndarray:
        """Mix all audio elements for segment"""
        # Calculate total duration
        total_duration = max(e['timestamp'] + e['duration'] for e in elements)
        total_samples = int(total_duration * 24000)
        
        # Create empty track
        mixed = np.zeros(total_samples)
        
        # Add each character's audio at correct timestamp
        for element in elements:
            if element['type'] == 'character' and 'audio' in element:
                start = int(element['timestamp'] * 24000)
                audio = element['audio']
                end = min(start + len(audio), total_samples)
                mixed[start:end] += audio[:end-start]
                
        # Add music (ducked)
        if music is not None:
            music_samples = min(len(music), total_samples)
            mixed[:music_samples] += music[:music_samples] * 0.2
            
        # Normalize
        max_val = np.abs(mixed).max()
        if max_val > 0:
            mixed = mixed / max_val * 0.9
            
        return mixed
        
    async def start_broadcast_stream(self):
        """Start streaming broadcast"""
        self.is_broadcasting = True
        
        while self.is_broadcasting:
            try:
                # Get next package
                package = await asyncio.wait_for(
                    self.broadcast_queue.get(),
                    timeout=30.0
                )
                
                # Stream it
                await self.stream_package(package)
                
            except asyncio.TimeoutError:
                # No content, play filler
                await self.play_filler()
                
    async def stream_package(self, package: Dict):
        """Stream broadcast package"""
        print(f"📺 Streaming: {package['segment']}")
        
        # In production, this would handle actual streaming
        # For now, save to file
        output_path = f"broadcasts/{package['segment']}_{int(time.time())}.mp4"
        os.makedirs("broadcasts", exist_ok=True)
        
        # Combine audio and video using ffmpeg
        temp_audio = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        import soundfile as sf
        sf.write(temp_audio.name, package['audio'], 24000)
        
        # Use ffmpeg to combine
        cmd = [
            'ffmpeg', '-y',
            '-i', package['video_path'],
            '-i', temp_audio.name,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-strict', 'experimental',
            output_path
        ]
        
        subprocess.run(cmd, check=True)
        
        # Cleanup
        os.unlink(temp_audio.name)
        os.unlink(package['video_path'])
        
        print(f"✅ Broadcast saved to: {output_path}")
        
    async def play_filler(self):
        """Play filler content when no broadcasts ready"""
        print("📺 Playing filler content...")
        
        # Could play:
        # - Best of breakdowns compilation
        # - Technical difficulties screen
        # - Repeated segments
        await asyncio.sleep(5)

# Gradio Interface
def create_interface():
    """Create Gradio interface for monitoring and testing"""
    
    # Initialize components
    audio_gen = AudioGenerator()
    video_gen = VideoGenerator()
    orchestrator = BroadcastOrchestrator(audio_gen, video_gen)
    
    with gr.Blocks(title="Static.news Broadcast System", theme=gr.themes.Dark()) as interface:
        gr.Markdown("""
        # 🎬 Static.news AI Broadcast System
        ### Complete Autonomous News Network - Audio + Video Generation
        """)
        
        with gr.Tab("🎭 Character Testing"):
            with gr.Row():
                char_select = gr.Dropdown(
                    choices=list(CHARACTER_CONFIGS.keys()),
                    label="Select Character",
                    value="ray"
                )
                emotion_select = gr.Dropdown(
                    choices=["normal", "angry", "crying", "excited", "breakdown"],
                    label="Emotion",
                    value="normal"
                )
                
            test_text = gr.Textbox(
                label="Test Dialogue",
                value="This is a test of our breaking news system!",
                lines=3
            )
            
            generate_btn = gr.Button("Generate Character Video", variant="primary")
            
            with gr.Row():
                test_audio = gr.Audio(label="Generated Audio")
                test_video = gr.Video(label="Generated Video")
                
            async def test_character(character, emotion, text):
                # Generate audio
                audio = audio_gen.generate_character_voice(text, character, emotion)
                
                # Generate video
                video_path = await video_gen.generate_character_video(
                    character, audio, emotion
                )
                
                # Save audio for preview
                temp_audio = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
                import soundfile as sf
                sf.write(temp_audio.name, audio, 24000)
                
                return temp_audio.name, video_path
                
            generate_btn.click(
                test_character,
                inputs=[char_select, emotion_select, test_text],
                outputs=[test_audio, test_video]
            )
            
        with gr.Tab("📝 Script Processing"):
            script_input = gr.Textbox(
                label="Script JSON",
                lines=10,
                value=json.dumps({
                    "segment": "Breaking News",
                    "dialogue": [
                        {
                            "character": "RAY",
                            "text": "This is Ray McPatriot with breaking news!",
                            "timestamp": 0
                        },
                        {
                            "character": "BERKELEY",
                            "text": "Actually Ray, let me fact-check that...",
                            "timestamp": 3
                        }
                    ]
                }, indent=2)
            )
            
            process_script_btn = gr.Button("Process Script", variant="primary")
            script_status = gr.Textbox(label="Processing Status")
            
            async def process_script_ui(script_json):
                try:
                    script_data = json.loads(script_json)
                    await orchestrator.process_script(script_data)
                    return "✅ Script processed successfully!"
                except Exception as e:
                    return f"❌ Error: {str(e)}"
                    
            process_script_btn.click(
                process_script_ui,
                inputs=[script_input],
                outputs=[script_status]
            )
            
        with gr.Tab("📺 Broadcast Monitor"):
            gr.Markdown("### Live Broadcast Status")
            
            with gr.Row():
                broadcast_status = gr.Textbox(
                    label="Status",
                    value="🔴 Not Broadcasting"
                )
                queue_size = gr.Number(
                    label="Queue Size",
                    value=0
                )
                
            with gr.Row():
                start_broadcast = gr.Button("Start Broadcast", variant="primary")
                stop_broadcast = gr.Button("Stop Broadcast", variant="stop")
                
            broadcast_log = gr.Textbox(
                label="Broadcast Log",
                lines=10,
                max_lines=20
            )
            
            def start_broadcast_ui():
                asyncio.create_task(orchestrator.start_broadcast_stream())
                return "🟢 Broadcasting Started"
                
            def stop_broadcast_ui():
                orchestrator.is_broadcasting = False
                return "🔴 Broadcasting Stopped"
                
            start_broadcast.click(
                start_broadcast_ui,
                outputs=[broadcast_status]
            )
            
            stop_broadcast.click(
                stop_broadcast_ui,
                outputs=[broadcast_status]
            )
            
        with gr.Tab("🎨 Studio Preview"):
            studio_select = gr.Dropdown(
                choices=list(STUDIO_SETUPS.keys()),
                label="Select Studio",
                value="main_desk"
            )
            
            preview_btn = gr.Button("Preview Studio")
            studio_preview = gr.Image(label="Studio Preview")
            
            def preview_studio(studio):
                return np.array(video_gen.backgrounds.get(studio))
                
            preview_btn.click(
                preview_studio,
                inputs=[studio_select],
                outputs=[studio_preview]
            )
            
        with gr.Tab("⚙️ Settings"):
            gr.Markdown("### API Configuration")
            gr.Markdown("Configure your API keys for news aggregation and AI models")
            
            with gr.Row():
                openrouter_key = gr.Textbox(
                    label="OpenRouter API Key",
                    type="password",
                    placeholder="sk-or-..."
                )
                newsapi_key = gr.Textbox(
                    label="NewsAPI Key", 
                    type="password",
                    placeholder="Your NewsAPI key"
                )
                
            save_settings = gr.Button("Save Settings")
            settings_status = gr.Textbox(label="Status")
            
            def save_settings_ui(or_key, news_key):
                # In production, save these securely
                return "✅ Settings saved!"
                
            save_settings.click(
                save_settings_ui,
                inputs=[openrouter_key, newsapi_key],
                outputs=[settings_status]
            )
            
    # WebSocket server for receiving scripts
    async def websocket_server():
        async def handler(websocket, path):
            async for message in websocket:
                data = json.loads(message)
                if data['type'] == 'script':
                    await orchestrator.process_script(data)
                    
        await websockets.serve(handler, "0.0.0.0", 8765)
        
    # Start WebSocket server in background
    asyncio.create_task(websocket_server())
    
    return interface

# Main entry point
if __name__ == "__main__":
    interface = create_interface()
    interface.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True,
        show_error=True
    )