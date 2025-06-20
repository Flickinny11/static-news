#!/usr/bin/env python3
"""
Jingle Generator
Creates news-style jingles and theme songs for segments
Professional sound, chaotic execution
"""

import random
from pydub import AudioSegment
from pydub.generators import Sine, Square, Sawtooth
import numpy as np
import tempfile
import logging

logger = logging.getLogger(__name__)

class JingleGenerator:
    """Generates professional-sounding news jingles"""
    
    def __init__(self):
        # Musical keys for different moods
        self.keys = {
            'serious': [261.63, 329.63, 392.00, 523.25],  # C major
            'urgent': [293.66, 369.99, 440.00, 587.33],   # D minor  
            'happy': [329.63, 415.30, 493.88, 659.25],    # E major
            'chaos': [277.18, 311.13, 415.30, 554.37],    # C# diminished
            'breakdown': [246.94, 293.66, 349.23, 415.30] # B minor
        }
        
        # Segment types and their musical characteristics
        self.segment_music = {
            'news': {'tempo': 120, 'key': 'serious', 'style': 'orchestral'},
            'breaking': {'tempo': 140, 'key': 'urgent', 'style': 'dramatic'},
            'sponsor': {'tempo': 100, 'key': 'happy', 'style': 'corporate'},
            'celebrity': {'tempo': 110, 'key': 'happy', 'style': 'fanfare'},
            'breakdown': {'tempo': 80, 'key': 'breakdown', 'style': 'ominous'},
            'recovery': {'tempo': 90, 'key': 'serious', 'style': 'hopeful'},
            'weather': {'tempo': 95, 'key': 'happy', 'style': 'light'}
        }
        
    async def generate_segment_jingle(self, segment_type: str) -> str:
        """Generate a jingle for a segment"""
        music_params = self.segment_music.get(segment_type, self.segment_music['news'])
        
        # Create base rhythm
        jingle = self._create_rhythm_track(
            tempo=music_params['tempo'],
            duration_ms=3000  # 3 second jingle
        )
        
        # Add melodic elements
        melody = self._create_melody(
            key=self.keys[music_params['key']],
            style=music_params['style'],
            duration_ms=3000
        )
        
        # Combine tracks
        jingle = jingle.overlay(melody)
        
        # Add news-style elements
        if segment_type == 'news':
            jingle = self._add_news_swoosh(jingle)
        elif segment_type == 'breaking':
            jingle = self._add_urgent_beeps(jingle)
        elif segment_type == 'breakdown':
            jingle = self._add_glitch_effects(jingle)
            
        # Add final flourish
        jingle = self._add_ending_sting(jingle, music_params['key'])
        
        # Export
        output_path = tempfile.mktemp(suffix='.mp3')
        jingle.export(output_path, format='mp3', bitrate='192k')
        
        return output_path
        
    def _create_rhythm_track(self, tempo: int, duration_ms: int) -> AudioSegment:
        """Create rhythmic percussion track"""
        track = AudioSegment.silent(duration=duration_ms)
        
        # Calculate beat timing
        beat_interval = 60000 / tempo  # ms per beat
        
        # Create kick drum pattern
        kick = self._generate_kick_drum()
        for i in range(int(duration_ms / beat_interval)):
            if i % 4 == 0:  # On the beat
                track = track.overlay(kick, position=int(i * beat_interval))
                
        # Add hi-hats
        hihat = self._generate_hihat()
        for i in range(int(duration_ms / (beat_interval / 2))):
            if i % 2 == 1:  # Off-beats
                track = track.overlay(hihat - 10, position=int(i * beat_interval / 2))
                
        return track
        
    def _create_melody(self, key: list, style: str, duration_ms: int) -> AudioSegment:
        """Create melodic line"""
        melody = AudioSegment.silent(duration=duration_ms)
        
        if style == 'orchestral':
            # News-style ascending melody
            for i, freq in enumerate(key):
                note_duration = 200
                note = self._generate_orchestral_note(freq, note_duration)
                melody = melody.overlay(note, position=i * 150)
                
            # Add harmonies
            for i, freq in enumerate(key[1:]):
                harmony = self._generate_orchestral_note(freq * 1.5, 150)
                melody = melody.overlay(harmony - 6, position=500 + i * 150)
                
        elif style == 'dramatic':
            # Urgent news melody
            pattern = [0, 2, 1, 3, 2, 0]  # Index into key
            for i, idx in enumerate(pattern):
                note = Sine(key[idx]).to_audio_segment(duration=100)
                note = note.fade_in(10).fade_out(50)
                melody = melody.overlay(note + 3, position=i * 120)
                
        elif style == 'corporate':
            # Cheesy corporate melody
            for i in range(4):
                chord = self._generate_major_chord(key[0] * (1 + i * 0.1), 500)
                melody = melody.overlay(chord, position=i * 600)
                
        elif style == 'ominous':
            # Breakdown approaching
            for i in range(duration_ms // 500):
                freq = key[0] * (1 - i * 0.05)  # Descending pitch
                note = Sawtooth(freq).to_audio_segment(duration=400)
                note = note.fade_in(100).fade_out(100) - 10
                melody = melody.overlay(note, position=i * 450)
                
        return melody
        
    def _generate_kick_drum(self) -> AudioSegment:
        """Generate kick drum sound"""
        # Start with low sine wave
        kick = Sine(60).to_audio_segment(duration=100)
        
        # Add click
        click = Sine(1000).to_audio_segment(duration=5)
        kick = click.append(kick, crossfade=0)
        
        # Shape envelope
        kick = kick.fade_in(1).fade_out(50)
        
        # Add punch
        kick = kick + 6
        
        return kick
        
    def _generate_hihat(self) -> AudioSegment:
        """Generate hi-hat sound"""
        # White noise burst
        noise_samples = np.random.normal(0, 0.1, int(44100 * 0.05))
        hihat = AudioSegment(
            noise_samples.tobytes(),
            frame_rate=44100,
            sample_width=2,
            channels=1
        )
        
        # High-pass filter effect (simplified)
        hihat = hihat.high_pass_filter(8000)
        
        # Shape
        hihat = hihat.fade_in(1).fade_out(20)
        
        return hihat
        
    def _generate_orchestral_note(self, freq: float, duration: int) -> AudioSegment:
        """Generate orchestral-style note"""
        # Combine multiple waveforms for richness
        fundamental = Sine(freq).to_audio_segment(duration=duration)
        second_harmonic = Sine(freq * 2).to_audio_segment(duration=duration) - 12
        third_harmonic = Sine(freq * 3).to_audio_segment(duration=duration) - 18
        
        # Combine
        note = fundamental.overlay(second_harmonic).overlay(third_harmonic)
        
        # ADSR envelope
        attack = 50
        decay = 100
        sustain_level = -3
        release = duration - attack - decay
        
        note = note.fade_in(attack)
        note = note[:attack] + (note[attack:attack+decay] + sustain_level) + note[attack+decay:].fade_out(release)
        
        return note
        
    def _generate_major_chord(self, root_freq: float, duration: int) -> AudioSegment:
        """Generate major chord"""
        root = Sine(root_freq).to_audio_segment(duration=duration)
        third = Sine(root_freq * 1.25).to_audio_segment(duration=duration) - 3
        fifth = Sine(root_freq * 1.5).to_audio_segment(duration=duration) - 3
        
        chord = root.overlay(third).overlay(fifth)
        chord = chord.fade_in(50).fade_out(100)
        
        return chord
        
    def _add_news_swoosh(self, jingle: AudioSegment) -> AudioSegment:
        """Add classic news swoosh sound"""
        # Rising white noise
        swoosh_duration = 500
        swoosh = AudioSegment.silent(duration=swoosh_duration)
        
        for i in range(swoosh_duration // 10):
            freq = 200 + i * 50
            tone = Sine(freq).to_audio_segment(duration=20)
            swoosh = swoosh.overlay(tone.fade_in(5).fade_out(15), position=i * 10)
            
        # Add filtered noise
        noise = self._generate_white_noise(swoosh_duration)
        noise = noise.fade_in(200).fade_out(100) - 20
        swoosh = swoosh.overlay(noise)
        
        # Add to beginning
        return swoosh.append(jingle, crossfade=100)
        
    def _add_urgent_beeps(self, jingle: AudioSegment) -> AudioSegment:
        """Add urgent news beeps"""
        beep_freq = 880  # A5
        
        for i in range(3):
            beep = Sine(beep_freq).to_audio_segment(duration=100)
            beep = beep.fade_in(5).fade_out(5) + 3
            jingle = jingle.overlay(beep, position=i * 200)
            
        return jingle
        
    def _add_glitch_effects(self, jingle: AudioSegment) -> AudioSegment:
        """Add glitch effects for breakdowns"""
        glitched = jingle
        
        # Random cuts
        for i in range(5):
            cut_pos = random.randint(500, len(jingle) - 500)
            cut_duration = random.randint(50, 200)
            
            # Insert silence or repeat
            if random.random() < 0.5:
                # Silence
                glitched = glitched[:cut_pos] + AudioSegment.silent(duration=cut_duration) + glitched[cut_pos:]
            else:
                # Repeat
                segment = glitched[cut_pos:cut_pos+cut_duration]
                glitched = glitched[:cut_pos] + segment + segment + glitched[cut_pos:]
                
        # Bit crushing effect (simplified)
        glitched = glitched + random.randint(-10, 10)
        
        return glitched
        
    def _add_ending_sting(self, jingle: AudioSegment, key: str) -> AudioSegment:
        """Add final sting to jingle"""
        key_notes = self.keys[key]
        
        # Create dramatic ending
        sting = AudioSegment.silent(duration=500)
        
        # All notes at once (chord)
        for freq in key_notes:
            note = Sine(freq).to_audio_segment(duration=300)
            note = note.fade_in(10).fade_out(200)
            sting = sting.overlay(note)
            
        # Add low boom
        boom = Sine(key_notes[0] / 2).to_audio_segment(duration=500)
        boom = boom.fade_in(10).fade_out(400) + 6
        sting = sting.overlay(boom)
        
        # Append to jingle
        return jingle.append(sting, crossfade=50)
        
    def _generate_white_noise(self, duration_ms: int) -> AudioSegment:
        """Generate white noise"""
        samples = np.random.normal(0, 0.1, int(44100 * duration_ms / 1000))
        samples = (samples * 32767).astype(np.int16)
        
        return AudioSegment(
            samples.tobytes(),
            frame_rate=44100,
            sample_width=2,
            channels=1
        )
        
    async def generate_breakdown_warning(self) -> str:
        """Generate ominous breakdown warning sound"""
        warning = AudioSegment.silent(duration=2000)
        
        # Descending tones
        base_freq = 440
        for i in range(10):
            freq = base_freq * (1 - i * 0.05)
            tone = Sine(freq).to_audio_segment(duration=200)
            tone = tone.fade_in(50).fade_out(50)
            
            # Add distortion
            if i > 5:
                tone = tone + 10  # Overdrive
                
            warning = warning.overlay(tone, position=i * 180)
            
        # Add heartbeat
        heartbeat = self._generate_kick_drum() + 10
        warning = warning.overlay(heartbeat, position=500)
        warning = warning.overlay(heartbeat, position=700)
        warning = warning.overlay(heartbeat, position=1200)
        warning = warning.overlay(heartbeat, position=1400)
        
        # Add static
        static = self._generate_white_noise(2000) - 20
        warning = warning.overlay(static.fade_in(1000))
        
        # Export
        output_path = tempfile.mktemp(suffix='.mp3')
        warning.export(output_path, format='mp3', bitrate='192k')
        
        return output_path