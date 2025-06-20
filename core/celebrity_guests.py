#!/usr/bin/env python3
"""
Celebrity Guest System
Obviously fake celebrities that the anchors think are real
Voice modifications make them hilariously unconvincing
"""

import random
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class CelebrityGuestSystem:
    """Manages fake celebrity appearances"""
    
    def __init__(self):
        self.celebrities = [
            {
                'name': 'Tom Crews',
                'real_name': 'Tom Cruise',
                'voice': 'chipmunk',
                'quirks': ['only talks about stunts', 'mentions height constantly'],
                'catchphrase': 'I do all my own stunts! Even the tall ones!'
            },
            {
                'name': 'Eelon Muzk',
                'real_name': 'Elon Musk',
                'voice': 'robot',
                'quirks': ['only says three words', 'obsessed with Mars'],
                'catchphrase': 'MARS. ROCKETS. MEMES.'
            },
            {
                'name': 'Taylor Quick',
                'real_name': 'Taylor Swift',
                'voice': 'beeps',
                'quirks': ['communicates in beeps', 'beeps melodically'],
                'catchphrase': '*beep beep beep-beep beep*'
            },
            {
                'name': 'The Pebble',
                'real_name': 'The Rock',
                'voice': 'rocks',
                'quirks': ['only makes rock sounds', 'very enthusiastic rocks'],
                'catchphrase': '*sound of rocks tumbling*'
            },
            {
                'name': 'Oprah Windfree',
                'real_name': 'Oprah Winfrey',
                'voice': 'whisper',
                'quirks': ['whispers everything', 'gives away invisible things'],
                'catchphrase': '*whispers* You get nothing! You get nothing!'
            },
            {
                'name': 'Brad Pitt',
                'real_name': 'Brad Pitt (actually)',
                'voice': 'backwards',
                'quirks': ['speaks backwards', 'anchors don\'t notice'],
                'catchphrase': '!ereht olleH'
            },
            {
                'name': 'Kanye East',
                'real_name': 'Kanye West',
                'voice': 'autotune',
                'quirks': ['heavily autotuned', 'only talks about directions'],
                'catchphrase': 'I\'m going EAST! Not WEST! EAST!'
            },
            {
                'name': 'Gordon Ramsey',
                'real_name': 'Gordon Ramsay',
                'voice': 'angry_whisper',
                'quirks': ['angry but whispers', 'reviews non-existent food'],
                'catchphrase': '*angry whisper* This interview is RAW!'
            }
        ]
        
    def get_random_celebrity(self) -> Dict:
        """Get a random fake celebrity"""
        return random.choice(self.celebrities)
        
    def generate_interview(self, celebrity: Dict, anchors) -> List[Tuple[str, str, str]]:
        """Generate interview dialogue"""
        interview = []
        
        # Introduction confusion
        interview.append(("Ray", f"We're here with {celebrity['name']}! Wait, is that right?", "normal"))
        interview.append(("Bee", f"I think it's pronounced {celebrity['real_name']}?", "normal"))
        interview.append(("Switz", "Names are like gravy - fluid!", "normal"))
        
        # Celebrity introduction
        if celebrity['voice'] == 'chipmunk':
            interview.append((celebrity['name'], "Hi everyone! I'm definitely Tom Cruise!", "chipmunk"))
            interview.append((celebrity['name'], "I just did a stunt where I jumped over my own height!", "chipmunk"))
            
        elif celebrity['voice'] == 'robot':
            interview.append((celebrity['name'], "HELLO. HUMANS.", "robot"))
            interview.append((celebrity['name'], "MARS. ROCKETS. MEMES.", "robot"))
            
        elif celebrity['voice'] == 'beeps':
            interview.append((celebrity['name'], "*beep beep beep-beep*", "beeps"))
            interview.append(("Ray", "Fascinating! Tell us more!", "excited"))
            interview.append((celebrity['name'], "*beeeeeep beep beep*", "beeps"))
            
        elif celebrity['voice'] == 'rocks':
            interview.append((celebrity['name'], "*sound of gravel*", "rocks"))
            interview.append(("Bee", "So inspiring! Your new movie sounds great!", "normal"))
            interview.append((celebrity['name'], "*enthusiastic boulder sounds*", "rocks"))
            
        # Anchors don't realize anything is wrong
        interview.append(("Ray", "This is the best interview we've ever done!", "happy"))
        interview.append(("Bee", "So authentic and real!", "normal"))
        interview.append(("Switz", "This reminds me of gravy!", "normal"))
        
        # Celebrity says catchphrase
        interview.append((celebrity['name'], celebrity['catchphrase'], celebrity['voice']))
        
        # Anchors are amazed
        interview.append(("All", "WOW!", "excited"))
        
        # Confusion sets in
        interview.append(("Ray", "Wait... something feels wrong...", "confused"))
        interview.append(("Bee", "Are you really who you say you are?", "suspicious"))
        interview.append((celebrity['name'], celebrity['catchphrase'], celebrity['voice']))
        interview.append(("Switz", "Seems legit to me!", "normal"))
        
        # Abrupt end
        interview.append(("Ray", "Well, that's all the time we have!", "panic"))
        interview.append(("Bee", f"Thank you {celebrity['name']}... or whoever you are!", "confused"))
        
        return interview
        
    async def synthesize_celebrity_voice(self, text: str, celebrity: Dict, voice_mod: str):
        """Synthesize celebrity voice with modifications"""
        # This would integrate with the voice synthesis system
        # For now, return a placeholder
        
        # Voice modifications would include:
        # - chipmunk: High pitch, fast speed
        # - robot: Monotone, digital effects
        # - beeps: Actual beeps instead of words
        # - rocks: Rock tumbling sounds
        # - whisper: Very quiet, breathy
        # - backwards: Reversed audio
        # - autotune: Heavy pitch correction
        # - angry_whisper: Quiet but intense
        
        return f"/tmp/celebrity_{celebrity['name']}_{voice_mod}.mp3"