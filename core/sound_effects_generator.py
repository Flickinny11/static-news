#!/usr/bin/env python3
"""
Sound Effects Generator
Creates realistic newsroom sounds and anchor noises
Makes the broadcast feel chaotically alive
"""

import numpy as np
from pydub import AudioSegment
from pydub.generators import WhiteNoise, Sine
import random
import tempfile
import logging

logger = logging.getLogger(__name__)

class SoundEffectsGenerator:
    """Generates newsroom chaos sounds"""
    
    def __init__(self):
        self.sample_rate = 44100
        self.effects_cache = {}
        
    async def generate_paper_shuffle(self, intensity: str = "normal") -> str:
        """Generate paper shuffling sounds"""
        duration_map = {
            "quick": 500,
            "normal": 1000,
            "frantic": 2000,
            "desperate": 3000
        }
        
        duration = duration_map.get(intensity, 1000)
        
        # Create rustling sound with filtered noise
        rustling = WhiteNoise().to_audio_segment(duration=duration)
        
        # Apply envelope for realistic paper sound
        # Quick attacks and decays
        for i in range(0, duration, 100):
            if random.random() < 0.7:
                # Create a "crinkle"
                rustling = rustling.fade_in(10).fade_out(50)
                
        # High-pass filter to make it more paper-like
        rustling = rustling.high_pass_filter(2000)
        rustling = rustling - 15  # Reduce volume
        
        # Add some random paper "flips"
        for _ in range(random.randint(1, 4)):
            flip_pos = random.randint(0, duration - 100)
            flip = self._generate_paper_flip()
            rustling = rustling.overlay(flip, position=flip_pos)
            
        output_path = tempfile.mktemp(suffix='.mp3')
        rustling.export(output_path, format='mp3')
        return output_path
        
    def _generate_paper_flip(self) -> AudioSegment:
        """Single paper flip sound"""
        # Quick whoosh
        flip_duration = 50
        
        # Descending frequency sweep
        samples = []
        for i in range(int(flip_duration * 44.1)):
            freq = 4000 - (i * 60)  # Rapid frequency descent
            sample = np.sin(2 * np.pi * freq * i / 44100) * 0.3
            samples.append(sample)
            
        flip = AudioSegment(
            np.array(samples).tobytes(),
            frame_rate=44100,
            sample_width=2,
            channels=1
        )
        
        return flip.fade_in(5).fade_out(20)
        
    async def generate_chair_squeak(self, squeak_type: str = "normal") -> str:
        """Generate chair squeaking sounds"""
        squeaks = {
            "subtle": {"freq": 800, "duration": 200, "wobble": 10},
            "normal": {"freq": 1200, "duration": 400, "wobble": 30},
            "dramatic": {"freq": 2000, "duration": 800, "wobble": 50},
            "dying_whale": {"freq": 400, "duration": 1500, "wobble": 100}
        }
        
        params = squeaks.get(squeak_type, squeaks["normal"])
        
        # Generate squeaky sound with frequency modulation
        samples = []
        for i in range(int(params["duration"] * 44.1)):
            # Add wobble to frequency
            freq = params["freq"] + np.sin(i * 0.01) * params["wobble"]
            sample = np.sin(2 * np.pi * freq * i / 44100)
            
            # Add harmonics for realism
            sample += np.sin(2 * np.pi * freq * 2 * i / 44100) * 0.3
            sample += np.sin(2 * np.pi * freq * 3 * i / 44100) * 0.1
            
            samples.append(sample * 0.5)
            
        squeak = AudioSegment(
            np.array(samples).tobytes(),
            frame_rate=44100,
            sample_width=2,
            channels=1
        )
        
        # Add envelope
        squeak = squeak.fade_in(50).fade_out(100)
        
        output_path = tempfile.mktemp(suffix='.mp3')
        squeak.export(output_path, format='mp3')
        return output_path
        
    async def generate_desk_head_bang(self, intensity: int = 1) -> str:
        """Generate head hitting desk sound"""
        # Thud sound - low frequency impact
        thud_freq = 80 - (intensity * 10)  # Lower freq for harder hits
        duration = 150 + (intensity * 50)
        
        # Create impact
        thud = Sine(thud_freq).to_audio_segment(duration=duration)
        
        # Add higher frequency "thwack"
        thwack = Sine(200).to_audio_segment(duration=50)
        thud = thud.overlay(thwack)
        
        # Add some noise for texture
        impact_noise = WhiteNoise().to_audio_segment(duration=30)
        impact_noise = impact_noise.low_pass_filter(500) - 20
        thud = thud.overlay(impact_noise)
        
        # Envelope shaping
        thud = thud.fade_in(5).fade_out(duration - 10)
        
        # Add desk rattle based on intensity
        if intensity > 2:
            rattle = await self.generate_desk_rattle()
            thud = thud.append(AudioSegment.from_file(rattle), crossfade=20)
            
        output_path = tempfile.mktemp(suffix='.mp3')
        thud.export(output_path, format='mp3')
        return output_path
        
    async def generate_desk_rattle(self) -> str:
        """Things rattling on desk after impact"""
        rattle_duration = 800
        rattle = AudioSegment.silent(duration=rattle_duration)
        
        # Multiple objects rattling
        for i in range(random.randint(3, 6)):
            # Each object has different frequency
            freq = random.randint(1000, 4000)
            object_rattle = Sine(freq).to_audio_segment(duration=50)
            
            # Decreasing amplitude over time
            for j in range(5):
                pos = i * 100 + j * 120
                if pos < rattle_duration - 50:
                    volume = -j * 3
                    rattle = rattle.overlay(object_rattle + volume, position=pos)
                    
        output_path = tempfile.mktemp(suffix='.mp3')
        rattle.export(output_path, format='mp3')
        return output_path
        
    async def generate_mouth_sounds(self, sound_type: str) -> str:
        """Generate various mouth/tongue sounds"""
        if sound_type == "tongue_click":
            return await self._generate_tongue_click()
        elif sound_type == "lip_pop":
            return await self._generate_lip_pop()
        elif sound_type == "raspberry":
            return await self._generate_raspberry()
        elif sound_type == "whistle":
            return await self._generate_bad_whistle()
        else:
            return await self._generate_random_mouth_sound()
            
    async def _generate_tongue_click(self) -> str:
        """Tongue clicking sound"""
        # Short, sharp click
        click = WhiteNoise().to_audio_segment(duration=10)
        click = click.high_pass_filter(4000) + 10
        click = click.fade_out(8)
        
        output_path = tempfile.mktemp(suffix='.mp3')
        click.export(output_path, format='mp3')
        return output_path
        
    async def _generate_lip_pop(self) -> str:
        """Lip popping sound"""
        # Low frequency pop
        pop = Sine(150).to_audio_segment(duration=30)
        pop = pop.fade_in(5).fade_out(20) + 5
        
        # Add click at start
        click = WhiteNoise().to_audio_segment(duration=5)
        pop = click.append(pop, crossfade=2)
        
        output_path = tempfile.mktemp(suffix='.mp3')
        pop.export(output_path, format='mp3')
        return output_path
        
    async def _generate_raspberry(self) -> str:
        """Raspberry/motorboat sound"""
        duration = random.randint(500, 1500)
        
        # Oscillating low frequency
        samples = []
        for i in range(int(duration * 44.1)):
            # Rapid oscillation
            freq = 80 + np.sin(i * 0.2) * 30
            sample = np.sin(2 * np.pi * freq * i / 44100)
            
            # Add noise for texture
            sample += np.random.normal(0, 0.1)
            samples.append(sample * 0.5)
            
        raspberry = AudioSegment(
            np.array(samples).tobytes(),
            frame_rate=44100,
            sample_width=2,
            channels=1
        )
        
        output_path = tempfile.mktemp(suffix='.mp3')
        raspberry.export(output_path, format='mp3')
        return output_path
        
    async def _generate_bad_whistle(self) -> str:
        """Failed attempt at whistling"""
        duration = random.randint(1000, 2000)
        
        samples = []
        for i in range(int(duration * 44.1)):
            # Unstable frequency
            target_freq = random.choice([800, 1000, 1200])
            freq = target_freq + random.randint(-100, 100)
            
            # Breathy whistle
            sample = np.sin(2 * np.pi * freq * i / 44100) * 0.3
            sample += np.random.normal(0, 0.05)  # Breathiness
            
            samples.append(sample)
            
        whistle = AudioSegment(
            np.array(samples).tobytes(),
            frame_rate=44100,
            sample_width=2,
            channels=1
        )
        
        # Random stops and starts
        for _ in range(random.randint(1, 3)):
            cut_pos = random.randint(200, duration - 200)
            whistle = whistle[:cut_pos] + AudioSegment.silent(duration=100) + whistle[cut_pos:]
            
        output_path = tempfile.mktemp(suffix='.mp3')
        whistle.export(output_path, format='mp3')
        return output_path
        
    async def generate_microphone_feedback(self, severity: str = "mild") -> str:
        """Generate mic feedback screech"""
        severity_params = {
            "mild": {"freq": 3000, "duration": 500, "volume": -10},
            "moderate": {"freq": 4000, "duration": 1000, "volume": -5},
            "severe": {"freq": 5000, "duration": 1500, "volume": 0},
            "apocalyptic": {"freq": 6000, "duration": 2000, "volume": 5}
        }
        
        params = severity_params.get(severity, severity_params["mild"])
        
        # Generate feedback
        feedback = Sine(params["freq"]).to_audio_segment(duration=params["duration"])
        
        # Add harmonics
        feedback = feedback.overlay(
            Sine(params["freq"] * 1.5).to_audio_segment(duration=params["duration"]) - 6
        )
        
        # Envelope - quick attack, sustain, then fade
        feedback = feedback.fade_in(50).fade_out(params["duration"] // 3)
        feedback = feedback + params["volume"]
        
        output_path = tempfile.mktemp(suffix='.mp3')
        feedback.export(output_path, format='mp3')
        return output_path
        
    async def generate_coffee_spill(self) -> str:
        """Generate coffee spilling sound"""
        # Initial splash
        splash = WhiteNoise().to_audio_segment(duration=200)
        splash = splash.low_pass_filter(1000).fade_in(10).fade_out(100)
        
        # Dripping
        drip_sound = AudioSegment.silent(duration=1500)
        for i in range(5):
            drip = Sine(400 - i * 50).to_audio_segment(duration=50)
            drip = drip.fade_in(10).fade_out(30) - 10
            drip_sound = drip_sound.overlay(drip, position=300 + i * 250)
            
        # Combine
        spill = splash.append(drip_sound, crossfade=50)
        
        output_path = tempfile.mktemp(suffix='.mp3')
        spill.export(output_path, format='mp3')
        return output_path
        
    async def generate_pen_clicking(self, click_count: int = None) -> str:
        """Annoying pen clicking"""
        if click_count is None:
            click_count = random.randint(3, 15)
            
        pen_clicks = AudioSegment.silent(duration=click_count * 200)
        
        for i in range(click_count):
            # Each click
            click = Sine(2000).to_audio_segment(duration=20)
            click = click.fade_in(2).fade_out(10) + 5
            
            # Random timing for realism
            position = i * 200 + random.randint(-50, 50)
            if position >= 0:
                pen_clicks = pen_clicks.overlay(click, position=position)
                
        output_path = tempfile.mktemp(suffix='.mp3')
        pen_clicks.export(output_path, format='mp3')
        return output_path
        
    async def generate_typing(self, duration: int = 3000, speed: str = "normal") -> str:
        """Keyboard typing sounds"""
        speed_map = {
            "hunt_and_peck": 500,
            "normal": 200,
            "fast": 100,
            "panic": 50
        }
        
        interval = speed_map.get(speed, 200)
        
        typing = AudioSegment.silent(duration=duration)
        
        for i in range(0, duration, interval):
            # Each keystroke
            key_freq = random.randint(800, 1200)
            keystroke = Sine(key_freq).to_audio_segment(duration=30)
            keystroke = keystroke.fade_in(2).fade_out(20) - 5
            
            # Add mechanical click
            click = WhiteNoise().to_audio_segment(duration=5)
            click = click.high_pass_filter(3000) - 10
            keystroke = click.append(keystroke, crossfade=2)
            
            # Random timing variation
            pos = i + random.randint(-20, 20)
            if 0 <= pos <= duration - 30:
                typing = typing.overlay(keystroke, position=pos)
                
        output_path = tempfile.mktemp(suffix='.mp3')
        typing.export(output_path, format='mp3')
        return output_path