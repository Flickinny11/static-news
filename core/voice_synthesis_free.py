#!/usr/bin/env python3
"""
Free Voice Synthesis using Piper TTS
No API costs - runs locally with downloaded models
"""

import os
import asyncio
import subprocess
import tempfile
import logging
from typing import Dict, Optional
import aiohttp
import json

logger = logging.getLogger(__name__)

class FreeVoiceSynthesizer:
    """Free voice synthesis using Piper TTS"""
    
    def __init__(self):
        self.models_dir = "/app/voice_models"
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Voice configurations for each anchor
        self.voice_configs = {
            "Ray": {
                "model": "en_US-joe-medium",
                "speed": 1.1,  # Slightly fast (excited)
                "pitch_shift": 2  # Slightly higher
            },
            "Bee": {
                "model": "en_US-amy-medium", 
                "speed": 0.95,  # Slightly slow (condescending)
                "pitch_shift": 0
            },
            "Switz": {
                "model": "en_US-danny-low",
                "speed": 1.0,  # Perfectly neutral
                "pitch_shift": -1  # Slightly lower
            }
        }
        
        # Emotion modifiers
        self.emotion_modifiers = {
            "normal": {"speed": 1.0, "pitch": 0},
            "excited": {"speed": 1.2, "pitch": 2},
            "confused": {"speed": 0.8, "pitch": -1},
            "panic": {"speed": 1.4, "pitch": 4},
            "sad": {"speed": 0.7, "pitch": -3},
            "angry": {"speed": 1.1, "pitch": 1},
            "existential": {"speed": 0.6, "pitch": -2}
        }
        
    async def initialize(self):
        """Download Piper and voice models if needed"""
        # Check if Piper is installed
        if not os.path.exists("/app/piper/piper"):
            await self._download_piper()
            
        # Download voice models
        for anchor, config in self.voice_configs.items():
            model_name = config["model"]
            if not os.path.exists(f"{self.models_dir}/{model_name}.onnx"):
                await self._download_voice_model(model_name)
                
    async def _download_piper(self):
        """Download Piper TTS binary"""
        logger.info("Downloading Piper TTS...")
        
        # Download Piper release
        piper_url = "https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(piper_url) as response:
                data = await response.read()
                
        # Extract
        os.makedirs("/app/piper", exist_ok=True)
        with open("/tmp/piper.tar.gz", "wb") as f:
            f.write(data)
            
        subprocess.run(["tar", "-xzf", "/tmp/piper.tar.gz", "-C", "/app/piper"])
        subprocess.run(["chmod", "+x", "/app/piper/piper"])
        
        logger.info("Piper TTS installed!")
        
    async def _download_voice_model(self, model_name: str):
        """Download a voice model"""
        logger.info(f"Downloading voice model: {model_name}")
        
        base_url = f"https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/{model_name}/"
        
        async with aiohttp.ClientSession() as session:
            # Download .onnx file
            async with session.get(f"{base_url}{model_name}.onnx") as response:
                model_data = await response.read()
                with open(f"{self.models_dir}/{model_name}.onnx", "wb") as f:
                    f.write(model_data)
                    
            # Download .json config
            async with session.get(f"{base_url}{model_name}.onnx.json") as response:
                config_data = await response.read()
                with open(f"{self.models_dir}/{model_name}.onnx.json", "wb") as f:
                    f.write(config_data)
                    
        logger.info(f"Voice model {model_name} downloaded!")
        
    async def synthesize_speech(
        self, 
        text: str, 
        anchor: str, 
        emotion: str = "normal"
    ) -> str:
        """Synthesize speech with emotion"""
        
        # Get voice config
        voice_config = self.voice_configs.get(anchor, self.voice_configs["Ray"])
        model_path = f"{self.models_dir}/{voice_config['model']}.onnx"
        
        # Apply emotion modifiers
        emotion_mod = self.emotion_modifiers.get(emotion, self.emotion_modifiers["normal"])
        speed = voice_config["speed"] * emotion_mod["speed"]
        
        # Create output file
        output_file = tempfile.mktemp(suffix=".wav")
        
        # Run Piper
        cmd = [
            "/app/piper/piper",
            "--model", model_path,
            "--output_file", output_file,
            "--length_scale", str(1.0 / speed)  # Inverse for speed
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        # Send text
        stdout, stderr = await process.communicate(input=text.encode())
        
        if process.returncode != 0:
            logger.error(f"Piper error: {stderr.decode()}")
            # Fallback to basic generation
            return await self._generate_fallback_audio(text)
            
        # Apply effects based on emotion
        if emotion in ["panic", "angry", "existential"]:
            output_file = await self._apply_audio_effects(output_file, emotion)
            
        # Convert to MP3 for smaller size
        mp3_file = tempfile.mktemp(suffix=".mp3")
        subprocess.run([
            "ffmpeg", "-i", output_file, 
            "-codec:a", "libmp3lame", 
            "-b:a", "64k",  # Low bitrate to save bandwidth
            mp3_file
        ], capture_output=True)
        
        os.unlink(output_file)
        return mp3_file
        
    async def _apply_audio_effects(self, audio_file: str, emotion: str) -> str:
        """Apply emotion-based audio effects"""
        output_file = tempfile.mktemp(suffix=".wav")
        
        if emotion == "panic":
            # Add tremolo effect
            subprocess.run([
                "sox", audio_file, output_file,
                "tremolo", "6", "80"  # Fast tremolo
            ])
        elif emotion == "angry":
            # Add distortion
            subprocess.run([
                "sox", audio_file, output_file,
                "overdrive", "10", "10"
            ])
        elif emotion == "existential":
            # Add reverb and echo
            subprocess.run([
                "sox", audio_file, output_file,
                "reverb", "80", "echo", "0.8", "0.9", "40", "0.4"
            ])
        else:
            return audio_file
            
        os.unlink(audio_file)
        return output_file
        
    async def _generate_fallback_audio(self, text: str) -> str:
        """Generate basic audio if Piper fails"""
        # Use system TTS as fallback
        output_file = tempfile.mktemp(suffix=".mp3")
        
        # macOS
        if os.path.exists("/usr/bin/say"):
            wav_file = tempfile.mktemp(suffix=".wav")
            subprocess.run([
                "say", "-o", wav_file, "--data-format=LEF32@22050", text
            ])
            subprocess.run([
                "ffmpeg", "-i", wav_file, "-codec:a", "libmp3lame", "-b:a", "64k", output_file
            ])
            os.unlink(wav_file)
        # Linux espeak
        elif os.path.exists("/usr/bin/espeak"):
            subprocess.run([
                "espeak", "-w", output_file, text
            ])
        else:
            # Create silence as last resort
            subprocess.run([
                "ffmpeg", "-f", "lavfi", "-i", "anullsrc=r=22050:cl=mono", 
                "-t", "2", "-codec:a", "libmp3lame", "-b:a", "64k", output_file
            ])
            
        return output_file