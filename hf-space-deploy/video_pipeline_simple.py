"""
Simplified Video Pipeline for Static.news
Uses free HuggingFace models for real-time generation
"""

import asyncio
import numpy as np
import cv2
import torch
from typing import Dict, List, Optional, Tuple
import json
import base64
from io import BytesIO
from PIL import Image
import aiohttp

class StaticNewsVideoGenerator:
    """Lightweight video generator using free HF models"""
    
    def __init__(self):
        self.width = 1280  # Reduced for performance
        self.height = 720
        self.fps = 24  # Reduced for real-time
        
        # Character positions
        self.character_positions = {
            'ray': {'x': 213, 'y': 360},
            'berkeley': {'x': 640, 'y': 360},
            'switz': {'x': 1067, 'y': 360}
        }
        
        # Pre-generated character images (base64 encoded)
        # In production, these would be generated once and stored
        self.character_portraits = self._generate_simple_portraits()
        
    def _generate_simple_portraits(self) -> Dict[str, np.ndarray]:
        """Generate simple but distinctive character portraits"""
        portraits = {}
        
        # Ray - Red theme, confused look
        ray_img = np.zeros((400, 300, 4), dtype=np.uint8)
        cv2.circle(ray_img, (150, 150), 100, (50, 50, 200, 255), -1)  # Red head
        cv2.ellipse(ray_img, (120, 130), (10, 5), 0, 0, 180, (0, 0, 0, 255), -1)  # Left eye
        cv2.ellipse(ray_img, (180, 130), (10, 5), 0, 0, 180, (0, 0, 0, 255), -1)  # Right eye
        cv2.ellipse(ray_img, (150, 180), (30, 15), 0, 0, 180, (0, 0, 0, 255), 2)  # Confused mouth
        # Add messy hair
        for angle in range(-60, 61, 20):
            end_x = 150 + int(120 * np.cos(np.radians(angle)))
            end_y = 50 + int(60 * np.sin(np.radians(angle)))
            cv2.line(ray_img, (150, 50), (end_x, end_y), (80, 40, 20, 255), 4)
        portraits['ray'] = ray_img
        
        # Berkeley - Blue theme, concerned look
        berkeley_img = np.zeros((400, 300, 4), dtype=np.uint8)
        cv2.circle(berkeley_img, (150, 150), 100, (200, 100, 50, 255), -1)  # Blue head
        # Glasses
        cv2.rectangle(berkeley_img, (100, 120), (140, 150), (0, 0, 0, 255), 3)
        cv2.rectangle(berkeley_img, (160, 120), (200, 150), (0, 0, 0, 255), 3)
        cv2.line(berkeley_img, (140, 135), (160, 135), (0, 0, 0, 255), 3)
        # Concerned eyebrows
        cv2.line(berkeley_img, (110, 110), (130, 100), (0, 0, 0, 255), 3)
        cv2.line(berkeley_img, (170, 100), (190, 110), (0, 0, 0, 255), 3)
        # Perfect bob hair
        cv2.ellipse(berkeley_img, (150, 100), (110, 80), 0, 180, 360, (40, 20, 10, 255), -1)
        portraits['berkeley'] = berkeley_img
        
        # Switz - Gray theme, neutral look
        switz_img = np.zeros((400, 300, 4), dtype=np.uint8)
        cv2.circle(switz_img, (150, 150), 100, (150, 150, 150, 255), -1)  # Gray head
        cv2.circle(switz_img, (120, 130), 8, (0, 0, 0, 255), -1)  # Left eye
        cv2.circle(switz_img, (180, 130), 8, (0, 0, 0, 255), -1)  # Right eye
        cv2.line(switz_img, (120, 180), (180, 180), (0, 0, 0, 255), 2)  # Neutral mouth
        # Hockey flow hair
        cv2.ellipse(switz_img, (150, 80), (100, 60), 0, 180, 360, (100, 60, 40, 255), -1)
        # Maple leaf pin
        cv2.circle(switz_img, (100, 150), 15, (255, 0, 0, 255), -1)
        portraits['switz'] = switz_img
        
        return portraits
    
    def create_newsroom_background(self) -> np.ndarray:
        """Create a simple newsroom background"""
        # Create gradient background
        bg = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        for y in range(self.height):
            intensity = int(30 + (y / self.height) * 40)
            bg[y, :] = [intensity, intensity, intensity + 10]
        
        # News desk
        cv2.rectangle(bg, (0, 500), (self.width, self.height), (40, 35, 30), -1)
        
        # News ticker area
        cv2.rectangle(bg, (0, 650), (self.width, 720), (20, 20, 30), -1)
        
        # Logo
        cv2.putText(bg, "STATIC.NEWS", (50, 60), cv2.FONT_HERSHEY_BOLD, 2, (255, 255, 255), 3)
        
        # LIVE indicator
        cv2.rectangle(bg, (1100, 40), (1230, 90), (0, 0, 200), -1)
        cv2.putText(bg, "LIVE", (1125, 72), cv2.FONT_HERSHEY_BOLD, 1, (255, 255, 255), 2)
        
        return bg
    
    def animate_mouth(self, portrait: np.ndarray, amplitude: float) -> np.ndarray:
        """Simple mouth animation based on audio amplitude"""
        animated = portrait.copy()
        
        # Find approximate mouth position (bottom third of face)
        h, w = portrait.shape[:2]
        mouth_y = int(h * 0.65)
        mouth_x = w // 2
        
        if amplitude > 0.1:
            # Open mouth
            mouth_height = int(10 + amplitude * 20)
            cv2.ellipse(animated, (mouth_x, mouth_y), (25, mouth_height), 
                       0, 0, 180, (0, 0, 0, 255), -1)
        
        return animated
    
    def composite_frame(self, background: np.ndarray, characters: Dict[str, Dict],
                       audio_amplitudes: Dict[str, float]) -> np.ndarray:
        """Composite characters onto background"""
        frame = background.copy()
        
        for char_name, char_data in characters.items():
            if char_name in self.character_portraits:
                # Get character portrait
                portrait = self.character_portraits[char_name]
                
                # Animate mouth if speaking
                amplitude = audio_amplitudes.get(char_name, 0.0)
                animated_portrait = self.animate_mouth(portrait, amplitude)
                
                # Get position
                pos = self.character_positions.get(char_name, {'x': 640, 'y': 360})
                
                # Overlay character (handle alpha channel)
                y1 = pos['y'] - 200
                y2 = pos['y'] + 200
                x1 = pos['x'] - 150
                x2 = pos['x'] + 150
                
                # Ensure within bounds
                y1 = max(0, y1)
                y2 = min(self.height, y2)
                x1 = max(0, x1)
                x2 = min(self.width, x2)
                
                # Simple overlay (in production, use proper alpha blending)
                roi = frame[y1:y2, x1:x2]
                portrait_resized = cv2.resize(animated_portrait[:, :, :3], 
                                            (x2-x1, y2-y1))
                
                # Blend with background
                alpha = 0.9
                frame[y1:y2, x1:x2] = cv2.addWeighted(roi, 1-alpha, 
                                                      portrait_resized, alpha, 0)
        
        return frame
    
    def add_lower_third(self, frame: np.ndarray, name: str, title: str) -> np.ndarray:
        """Add lower third graphics"""
        # Semi-transparent background
        overlay = frame.copy()
        cv2.rectangle(overlay, (100, 550), (600, 640), (0, 0, 0), -1)
        frame = cv2.addWeighted(frame, 0.7, overlay, 0.3, 0)
        
        # Text
        cv2.putText(frame, name.upper(), (120, 590), 
                   cv2.FONT_HERSHEY_BOLD, 1, (255, 255, 255), 2)
        cv2.putText(frame, title, (120, 620), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 1)
        
        return frame
    
    def add_news_ticker(self, frame: np.ndarray, text: str, offset: int) -> np.ndarray:
        """Add scrolling news ticker"""
        ticker_text = f"BREAKING: {text}"
        text_x = self.width - offset
        
        cv2.putText(frame, ticker_text, (text_x, 690), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        return frame
    
    async def generate_video_frame(self, script_data: Dict, 
                                 audio_data: Optional[Dict] = None) -> bytes:
        """Generate a single video frame"""
        # Create background
        frame = self.create_newsroom_background()
        
        # Get speaking character and amplitude
        speaker = script_data.get('speaker', 'ray')
        audio_amplitudes = {}
        
        if audio_data:
            audio_amplitudes[speaker] = audio_data.get('amplitude', 0.0)
        
        # Composite characters
        active_characters = {
            'ray': {'active': True},
            'berkeley': {'active': True},
            'switz': {'active': True}
        }
        
        frame = self.composite_frame(frame, active_characters, audio_amplitudes)
        
        # Add lower third if needed
        if script_data.get('show_lower_third'):
            char_name = self._get_character_name(speaker)
            char_title = self._get_character_title(speaker)
            frame = self.add_lower_third(frame, char_name, char_title)
        
        # Add news ticker
        if script_data.get('ticker_text'):
            ticker_offset = script_data.get('ticker_offset', 0)
            frame = self.add_news_ticker(frame, script_data['ticker_text'], ticker_offset)
        
        # Add breaking news banner if needed
        if script_data.get('breaking_news'):
            cv2.rectangle(frame, (0, 150), (self.width, 220), (0, 0, 180), -1)
            cv2.putText(frame, "BREAKING NEWS", (self.width//2 - 150, 195), 
                       cv2.FONT_HERSHEY_BOLD, 1.5, (255, 255, 255), 2)
        
        # Encode frame
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        return buffer.tobytes()
    
    def _get_character_name(self, speaker: str) -> str:
        """Get character display name"""
        names = {
            'ray': 'Ray McPatriot',
            'berkeley': 'Berkeley Justice',
            'switz': 'Switz Middleton'
        }
        return names.get(speaker, speaker.title())
    
    def _get_character_title(self, speaker: str) -> str:
        """Get character title"""
        titles = {
            'ray': 'Conservative Anchor',
            'berkeley': 'Progressive Correspondent',
            'switz': 'Centrist Analyst'
        }
        return titles.get(speaker, 'News Anchor')

# Integration with HuggingFace models
class HFModelIntegration:
    """Integration with free HuggingFace models"""
    
    def __init__(self):
        self.dia_endpoint = "https://nari-labs-dia-1-6b.hf.space/api/predict"
        self.wav2lip_endpoint = "https://manavisrani07-gradio-lipsync-wav2lip.hf.space/api/predict"
        
    async def generate_speech(self, text: str, speaker: str) -> bytes:
        """Generate speech using Dia 1.6B or fallback TTS"""
        # For now, return placeholder
        # In production, would call Dia 1.6B API
        return b"audio_placeholder"
    
    async def generate_lipsync(self, video_frame: bytes, audio: bytes) -> bytes:
        """Generate lip-synced video frame"""
        # For now, return original frame
        # In production, would call Wav2Lip API
        return video_frame

# Main broadcast manager
class BroadcastManager:
    """Manages the live broadcast"""
    
    def __init__(self):
        self.video_gen = StaticNewsVideoGenerator()
        self.hf_models = HFModelIntegration()
        self.frame_buffer = asyncio.Queue(maxsize=30)
        
    async def process_script(self, script_line: Dict):
        """Process a script line into video"""
        # Generate speech
        audio = await self.hf_models.generate_speech(
            script_line['text'], 
            script_line['speaker']
        )
        
        # Calculate audio amplitude (simplified)
        amplitude = np.random.random() * 0.5 + 0.3 if script_line.get('text') else 0.0
        
        # Generate video frame
        frame_data = await self.video_gen.generate_video_frame(
            script_line,
            {'amplitude': amplitude}
        )
        
        # Add to buffer
        await self.frame_buffer.put(frame_data)
    
    async def stream_frames(self):
        """Stream frames to WebSocket clients"""
        while True:
            if not self.frame_buffer.empty():
                frame = await self.frame_buffer.get()
                yield frame
            else:
                # Generate idle frame
                idle_frame = await self.video_gen.generate_video_frame(
                    {'speaker': 'none', 'ticker_text': 'Static.news - Where News Meets Noise'},
                    {'amplitude': 0.0}
                )
                yield idle_frame
            
            await asyncio.sleep(1/24)  # 24 FPS