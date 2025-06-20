#!/usr/bin/env python3
"""
Voice Synthesis System with Emotional Range
Uses free/open source TTS with emotion control
Each anchor has distinct voice characteristics
"""

import asyncio
import os
import logging
from typing import Dict, List, Optional, Tuple
import numpy as np
from pydub import AudioSegment
from pydub.generators import Sine
import random
import tempfile
import aiohttp
import json

logger = logging.getLogger(__name__)

class VoiceSynthesizer:
    """Advanced voice synthesis with emotions, accents, and chaos"""
    
    def __init__(self):
        # Using free TTS services and local generation
        self.tts_engine = "piper"  # Fast, free, local TTS
        self.voice_profiles = self._init_voice_profiles()
        
        # Emotion parameters
        self.emotions = {
            'normal': {'pitch': 1.0, 'speed': 1.0, 'volume': 1.0},
            'confused': {'pitch': 1.1, 'speed': 0.9, 'volume': 0.9},
            'angry': {'pitch': 0.9, 'speed': 1.2, 'volume': 1.3},
            'sad': {'pitch': 0.85, 'speed': 0.8, 'volume': 0.7},
            'panic': {'pitch': 1.3, 'speed': 1.5, 'volume': 1.4},
            'sobbing': {'pitch': 1.2, 'speed': 0.7, 'volume': 0.8},
            'shouting': {'pitch': 1.1, 'speed': 1.1, 'volume': 1.5},
            'whispering': {'pitch': 0.95, 'speed': 0.9, 'volume': 0.3},
            'existential': {'pitch': 0.8, 'speed': 0.85, 'volume': 0.9}
        }
        
        # Sound effects library
        self.sound_effects = {
            'sob': self._generate_sob,
            'scream': self._generate_scream,
            'sigh': self._generate_sigh,
            'gasp': self._generate_gasp,
            'static': self._generate_static,
            'glitch': self._generate_glitch
        }
        
    def _init_voice_profiles(self) -> Dict:
        """Initialize distinct voice profiles for each anchor"""
        return {
            'Ray': {
                'base_pitch': 0.85,  # Lower voice
                'base_speed': 0.9,   # Slower, drawl
                'accent': 'southern',
                'vocal_fry': True,
                'stutter_chance': 0.15,
                'mispronunciation_severity': 0.8
            },
            'Bee': {
                'base_pitch': 1.15,  # Higher voice
                'base_speed': 1.1,   # Fast talker
                'accent': 'valley_girl',
                'uptalk': True,
                'vocal_fry': True,
                'condescension_factor': 0.7
            },
            'Switz': {
                'base_pitch': 1.0,   # Exactly medium
                'base_speed': 1.0,   # Exactly average
                'accent': 'canadian',
                'monotone_factor': 0.8,
                'eh_frequency': 0.2,
                'sorry_multiplier': 3
            }
        }
        
    async def synthesize_dialogue(self, text: str, anchor_name: str, 
                                emotion: str = 'normal', 
                                include_effects: bool = True) -> str:
        """Synthesize speech with emotion and anchor-specific quirks"""
        
        # Get voice profile
        profile = self.voice_profiles.get(anchor_name, {})
        emotion_params = self.emotions.get(emotion, self.emotions['normal'])
        
        # Apply voice transformations
        processed_text = self._apply_speech_quirks(text, anchor_name, emotion)
        
        # Generate base audio
        audio = await self._generate_base_audio(
            processed_text, 
            profile, 
            emotion_params
        )
        
        # Add emotional effects
        if include_effects and emotion in ['panic', 'sobbing', 'existential']:
            audio = self._add_emotional_effects(audio, emotion)
            
        # Add background effects for breakdowns
        if emotion in ['panic', 'existential']:
            audio = self._add_breakdown_ambience(audio)
            
        # Save to temporary file
        output_path = tempfile.mktemp(suffix='.mp3')
        audio.export(output_path, format='mp3', bitrate='128k')
        
        return output_path
        
    def _apply_speech_quirks(self, text: str, anchor_name: str, emotion: str) -> str:
        """Apply anchor-specific speech patterns"""
        
        if anchor_name == 'Ray':
            # Add stutters when confused
            if emotion in ['confused', 'panic'] and random.random() < 0.3:
                words = text.split()
                stutter_index = random.randint(0, len(words) - 1)
                first_letter = words[stutter_index][0]
                words[stutter_index] = f"{first_letter}-{first_letter}-{words[stutter_index]}"
                text = ' '.join(words)
                
            # Drawl on certain words
            text = text.replace('I', 'Ahh')
            text = text.replace('my', 'mah')
            
        elif anchor_name == 'Bee':
            # Valley girl uptalk (add question marks)
            if '.' in text and random.random() < 0.4:
                text = text.replace('.', '?')
                
            # Add "like" randomly
            if random.random() < 0.2:
                words = text.split()
                insert_pos = random.randint(1, len(words) - 1)
                words.insert(insert_pos, 'like,')
                text = ' '.join(words)
                
        elif anchor_name == 'Switz':
            # Add "eh" at end of sentences
            if random.random() < profile.get('eh_frequency', 0.2):
                text = text.rstrip('.!?') + ', eh?'
                
            # Double up on apologies
            text = text.replace('sorry', 'sorry, sorry')
            
        return text
        
    async def _generate_base_audio(self, text: str, profile: Dict, 
                                  emotion_params: Dict) -> AudioSegment:
        """Generate base audio with voice parameters"""
        
        # For demo, create synthesized speech-like audio
        # In production, use actual TTS engine
        
        duration_ms = len(text) * 60  # Rough estimate
        
        # Calculate final parameters
        pitch_mult = profile.get('base_pitch', 1.0) * emotion_params['pitch']
        speed_mult = profile.get('base_speed', 1.0) * emotion_params['speed']
        volume_mult = emotion_params['volume']
        
        # Generate base frequency
        base_freq = 200 * pitch_mult  # Female ~200Hz, Male ~125Hz
        
        # Create speech-like audio
        audio = self._create_speech_pattern(
            text, 
            base_freq, 
            int(duration_ms / speed_mult),
            profile
        )
        
        # Apply volume
        audio = audio + (20 * np.log10(volume_mult))
        
        return audio
        
    def _create_speech_pattern(self, text: str, base_freq: float, 
                              duration_ms: int, profile: Dict) -> AudioSegment:
        """Create realistic speech patterns"""
        
        words = text.split()
        ms_per_word = duration_ms // max(len(words), 1)
        
        audio = AudioSegment.silent(duration=duration_ms)
        current_pos = 0
        
        for i, word in enumerate(words):
            # Vary pitch for each word
            if profile.get('monotone_factor', 0) > 0.5:
                # Switz is monotone
                word_freq = base_freq
            else:
                # Natural pitch variation
                word_freq = base_freq * random.uniform(0.9, 1.1)
                
            # Question intonation
            if word.endswith('?'):
                word_freq *= 1.2  # Rising intonation
                
            # Create word audio
            word_duration = ms_per_word * (len(word) / 5)  # Adjust by word length
            
            # Generate formants for more realistic speech
            formants = self._generate_formants(word, word_freq)
            word_audio = self._combine_formants(formants, int(word_duration))
            
            # Add word to audio
            audio = audio.overlay(word_audio, position=current_pos)
            
            # Add pause between words
            pause_duration = random.randint(50, 150)
            current_pos += int(word_duration) + pause_duration
            
        return audio
        
    def _generate_formants(self, word: str, base_freq: float) -> List[Tuple[float, float]]:
        """Generate formant frequencies for vowels"""
        # Simplified formant generation
        vowels = 'aeiou'
        formants = []
        
        for char in word.lower():
            if char in vowels:
                # F1 and F2 frequencies for vowels
                if char == 'a':
                    formants.append((700, 1220))
                elif char == 'e':
                    formants.append((530, 1840))
                elif char == 'i':
                    formants.append((390, 1990))
                elif char == 'o':
                    formants.append((640, 1190))
                elif char == 'u':
                    formants.append((490, 1350))
                    
        if not formants:
            # Default formants for consonants
            formants = [(base_freq, base_freq * 2)]
            
        return formants
        
    def _combine_formants(self, formants: List[Tuple[float, float]], 
                         duration_ms: int) -> AudioSegment:
        """Combine formant frequencies into speech-like audio"""
        combined = AudioSegment.silent(duration=duration_ms)
        
        for f1, f2 in formants:
            # Generate two formants
            formant1 = Sine(f1).to_audio_segment(duration=duration_ms // len(formants))
            formant2 = Sine(f2).to_audio_segment(duration=duration_ms // len(formants))
            
            # Combine with different amplitudes
            segment = formant1.overlay(formant2 - 6)  # F2 quieter
            
            # Apply envelope
            segment = segment.fade_in(50).fade_out(50)
            
            combined = combined.append(segment, crossfade=20)
            
        return combined[:duration_ms]  # Trim to exact duration
        
    def _add_emotional_effects(self, audio: AudioSegment, emotion: str) -> AudioSegment:
        """Add emotion-specific audio effects"""
        
        if emotion == 'panic':
            # Add tremor/vibrato
            audio = self._add_tremor(audio, rate=8, depth=0.3)
            # Add breathing sounds
            breath = self._generate_heavy_breathing()
            audio = audio.overlay(breath - 10)
            
        elif emotion == 'sobbing':
            # Add sob sounds
            sob_sound = self._generate_sob()
            # Insert sobs randomly
            for i in range(3):
                pos = random.randint(1000, len(audio) - 1000)
                audio = audio.overlay(sob_sound, position=pos)
                
        elif emotion == 'existential':
            # Add reverb for void-like effect
            audio = self._add_reverb(audio, room_size=0.8)
            # Slight pitch shift down
            audio = audio._spawn(audio.raw_data, overrides={
                "frame_rate": int(audio.frame_rate * 0.95)
            }).set_frame_rate(audio.frame_rate)
            
        return audio
        
    def _add_breakdown_ambience(self, audio: AudioSegment) -> AudioSegment:
        """Add ambient sounds during breakdowns"""
        
        # Create ambient drone
        drone_freq = 80  # Low frequency
        drone = Sine(drone_freq).to_audio_segment(duration=len(audio))
        drone = drone - 20  # Very quiet
        
        # Add static bursts
        for i in range(5):
            static_burst = self._generate_static()
            pos = random.randint(0, len(audio) - len(static_burst))
            audio = audio.overlay(static_burst - 15, position=pos)
            
        # Combine with drone
        return audio.overlay(drone)
        
    def _add_tremor(self, audio: AudioSegment, rate: float = 5, depth: float = 0.2) -> AudioSegment:
        """Add tremor/vibrato effect"""
        samples = np.array(audio.get_array_of_samples())
        
        # Generate LFO (Low Frequency Oscillator)
        lfo_freq = rate  # Hz
        lfo = np.sin(2 * np.pi * lfo_freq * np.arange(len(samples)) / audio.frame_rate)
        
        # Apply amplitude modulation
        modulated = samples * (1 + depth * lfo)
        
        # Convert back to AudioSegment
        return audio._spawn(modulated.astype(samples.dtype).tobytes())
        
    def _add_reverb(self, audio: AudioSegment, room_size: float = 0.5) -> AudioSegment:
        """Simple reverb effect"""
        # Create delays
        delays = [50, 100, 150, 200]  # ms
        decay = 0.3
        
        reverb = audio
        for i, delay in enumerate(delays):
            delayed = AudioSegment.silent(duration=delay) + audio
            delayed = delayed - (6 * (i + 1))  # Decrease volume
            reverb = reverb.overlay(delayed)
            
        return reverb
        
    # Sound effect generators
    def _generate_sob(self) -> AudioSegment:
        """Generate sob sound effect"""
        sob = AudioSegment.silent(duration=500)
        
        # Quick inhale
        for i in range(100):
            freq = 800 + i * 5
            tone = Sine(freq).to_audio_segment(duration=2)
            sob = sob.overlay(tone, position=i)
            
        # Shaky exhale
        for i in range(300):
            freq = 1000 - i * 2
            if i % 50 < 25:  # Shaky pattern
                tone = Sine(freq).to_audio_segment(duration=2)
                sob = sob.overlay(tone, position=100 + i)
                
        return sob.fade_in(50).fade_out(100)
        
    def _generate_scream(self) -> AudioSegment:
        """Generate scream sound effect"""
        scream = AudioSegment.silent(duration=1000)
        
        # Rising frequency
        for i in range(500):
            freq = 500 + i * 3
            tone = Sine(freq).to_audio_segment(duration=2)
            tone = tone + (i // 50)  # Increase volume
            scream = scream.overlay(tone, position=i)
            
        return scream.fade_out(200)
        
    def _generate_sigh(self) -> AudioSegment:
        """Generate sigh sound effect"""
        sigh = AudioSegment.silent(duration=800)
        
        # Descending frequency
        for i in range(400):
            freq = 600 - i
            tone = Sine(freq).to_audio_segment(duration=2)
            sigh = sigh.overlay(tone, position=i * 2)
            
        return sigh.fade_in(100).fade_out(200)
        
    def _generate_gasp(self) -> AudioSegment:
        """Generate gasp sound effect"""
        # Quick inhale
        gasp = self._generate_white_noise(duration=200)
        gasp = gasp.fade_in(50).fade_out(50)
        return gasp + 10  # Make it louder
        
    def _generate_static(self) -> AudioSegment:
        """Generate static/white noise"""
        return self._generate_white_noise(duration=100)
        
    def _generate_glitch(self) -> AudioSegment:
        """Generate digital glitch sound"""
        glitch = AudioSegment.silent(duration=50)
        
        # Random frequencies
        for i in range(25):
            freq = random.randint(100, 2000)
            tone = Sine(freq).to_audio_segment(duration=2)
            glitch = glitch.overlay(tone, position=i * 2)
            
        return glitch
        
    def _generate_white_noise(self, duration: int = 100) -> AudioSegment:
        """Generate white noise"""
        samples = np.random.normal(0, 0.1, int(44100 * duration / 1000))
        samples = (samples * 32767).astype(np.int16)
        
        return AudioSegment(
            samples.tobytes(),
            frame_rate=44100,
            sample_width=2,
            channels=1
        )
        
    def _generate_heavy_breathing(self) -> AudioSegment:
        """Generate heavy breathing sound"""
        breathing = AudioSegment.silent(duration=3000)
        
        # Multiple breath cycles
        for cycle in range(3):
            # Inhale
            inhale = self._generate_white_noise(400)
            inhale = inhale.fade_in(100).fade_out(100) - 20
            
            # Exhale  
            exhale = self._generate_white_noise(600)
            exhale = exhale.fade_in(150).fade_out(150) - 15
            
            breathing = breathing.overlay(inhale, position=cycle * 1000)
            breathing = breathing.overlay(exhale, position=cycle * 1000 + 500)
            
        return breathing