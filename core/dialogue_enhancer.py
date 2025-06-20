#!/usr/bin/env python3
"""
Dialogue Enhancement System
Adds clever humor, innuendos, inside jokes, and natural sounds
Makes the anchors feel devastatingly real and hilariously unpredictable
"""

import random
import re
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class DialogueEnhancer:
    """Makes dialogue fresh, clever, and naturally chaotic"""
    
    def __init__(self):
        # Inside jokes that develop over time
        self.inside_jokes = {
            "Ray": [
                "Remember the noodle incident?",
                "Just like that time with the... you know",
                "This is worse than the great mic feedback of Tuesday",
                "Not since the cheese wheel fiasco"
            ],
            "Bee": [
                "As I learned at Yale... or was it jail?",
                "My therapist says I shouldn't mention that",
                "This triggers my fear of lowercase letters",
                "Just like my dream journal predicted"
            ],
            "Switz": [
                "In Canada, we call this 'Tuesday'",
                "Reminds me of the great gravy flood of '09",
                "Neither here nor there, unlike my passport",
                "50% funny, 50% concerning, 100% confusing"
            ]
        }
        
        # Natural interruptions and sounds
        self.natural_sounds = {
            "cough": ["*cough*", "*ahem*", "*clears throat aggressively*"],
            "sneeze": ["*ACHOO*", "*sniffles*", "*violent sneeze*"],
            "frustration": ["*sighs heavily*", "*groans*", "*exhales sharply*"],
            "confusion": ["*confused silence*", "*mouth sounds*", "*tongue clicking*"],
            "attention": ["*AHEM*", "*taps mic*", "*clears throat loudly*"],
            "boredom": ["*yawns*", "*drums fingers*", "*whistles tunelessly*"]
        }
        
        # Environmental sounds
        self.environment_sounds = [
            "*papers shuffling*",
            "*chair squeaking*",
            "*something falls off desk*",
            "*microphone feedback*",
            "*muffled argument in background*",
            "*printer jamming nearby*",
            "*coffee spilling*",
            "*pen clicking repeatedly*",
            "*keyboard clacking*",
            "*door slamming*"
        ]
        
        # Clever wordplay patterns
        self.wordplay_templates = [
            "That's {word}... or as I call it, {pun}",
            "Speaking of {topic}, isn't it ironic that {observation}?",
            "{statement}. And by {word}, I mean {twist}",
            "The {noun} of {noun2} is like {absurd_comparison}"
        ]
        
        # Innuendo patterns
        self.innuendo_starters = [
            "That's what",
            "If you know what I mean",
            "*winks at camera*",
            "Phrasing!",
            "Are we still doing phrasing?"
        ]
        
    def enhance_dialogue(self, speaker: str, text: str, context: Dict) -> str:
        """Enhance dialogue with humor and natural elements"""
        enhanced = text
        
        # Add natural sounds based on context
        if context.get('confusion_level', 0) > 70:
            enhanced = self._add_confusion_sounds(enhanced)
        
        if context.get('hours_awake', 0) > 24:
            enhanced = self._add_exhaustion_effects(enhanced)
            
        # Add inside jokes randomly
        if random.random() < 0.15:
            enhanced = self._inject_inside_joke(speaker, enhanced)
            
        # Add clever wordplay
        if random.random() < 0.2:
            enhanced = self._add_wordplay(enhanced)
            
        # Environmental sounds
        if random.random() < 0.1:
            sound = random.choice(self.environment_sounds)
            enhanced = f"{sound} {enhanced}"
            
        return enhanced
        
    def _add_confusion_sounds(self, text: str) -> str:
        """Add confusion indicators"""
        sounds = [
            "*long pause*",
            "*visible confusion*",
            "*stares at teleprompter*",
            "*mouths 'what?' silently*"
        ]
        
        # Insert confusion mid-sentence
        words = text.split()
        if len(words) > 5:
            insert_pos = random.randint(2, len(words)-2)
            words.insert(insert_pos, random.choice(sounds))
            return ' '.join(words)
        return text
        
    def _add_exhaustion_effects(self, text: str) -> str:
        """Add exhaustion indicators"""
        effects = [
            "*yawns mid-sentence*",
            "*microsleep*",
            "*slurs slightly*",
            "*forgets what they were saying*"
        ]
        
        if random.random() < 0.3:
            effect = random.choice(effects)
            if "forgets" in effect:
                # Cut sentence short
                words = text.split()
                if len(words) > 4:
                    cut_point = random.randint(3, len(words)-1)
                    return ' '.join(words[:cut_point]) + "... " + effect + " ...what was I saying?"
            else:
                # Insert effect
                return f"{text} {effect}"
        return text
        
    def _inject_inside_joke(self, speaker: str, text: str) -> str:
        """Add speaker-specific inside jokes"""
        if speaker in self.inside_jokes:
            joke = random.choice(self.inside_jokes[speaker])
            
            # Different ways to inject the joke
            patterns = [
                f"{text} ...{joke}.",
                f"{text} But that's nothing compared to— {joke}.",
                f"{joke}. But anyway, {text}",
                f"{text} *pause* {joke} *shakes head*"
            ]
            
            return random.choice(patterns)
        return text
        
    def _add_wordplay(self, text: str) -> str:
        """Add clever wordplay and puns"""
        # Extract key words for punning
        words = re.findall(r'\b\w{4,}\b', text)
        if words:
            target_word = random.choice(words)
            pun = self._generate_pun(target_word)
            
            if pun:
                templates = [
                    f"{text} Or as I like to call it, {pun}.",
                    f"{text} *pause* Get it? {target_word}? {pun}? *silence* Tough crowd.",
                    f"{text} ...{pun}. *waits for laughter* *none comes*"
                ]
                return random.choice(templates)
        return text
        
    def _generate_pun(self, word: str) -> Optional[str]:
        """Generate word-specific puns"""
        pun_map = {
            "news": ["snooze", "noose", "juice but for your brain"],
            "breaking": ["broken", "breakfast-ing", "soul-shaking"],
            "report": ["retort", "re-snort", "rapport but angrier"],
            "live": ["barely alive", "jive", "hive mind broadcasting"],
            "update": ["up-late", "up-debate", "existential weight"],
            "story": ["quarry of truth", "allegory of confusion", "bore-y"]
        }
        
        word_lower = word.lower()
        for key, puns in pun_map.items():
            if key in word_lower:
                return random.choice(puns)
                
        # Generic pun patterns
        if word.endswith('ing'):
            return f"{word[:-3]}-thing"
        elif word.endswith('tion'):
            return f"{word[:-4]}-ocean"
            
        return None
        
    def create_banter(self, anchor1: str, anchor2: str, topic: str) -> List[Tuple[str, str]]:
        """Generate clever banter between anchors"""
        banter_patterns = [
            # Setup and payoff
            [
                (anchor1, f"You know what they say about {topic}..."),
                (anchor2, "No, what do they say?"),
                (anchor1, "I don't know, I was hoping you did."),
                ("Both", "*awkward silence*")
            ],
            # Misunderstanding chain
            [
                (anchor1, f"The {topic} situation is heating up."),
                (anchor2, "I thought it was cooling down?"),
                (anchor1, "No, that's my coffee."),
                (anchor2, "Your coffee is a situation?"),
                (anchor1, "*stares* Everything's a situation if you're tired enough.")
            ],
            # Philosophical spiral
            [
                (anchor1, f"But what IS {topic}, really?"),
                (anchor2, "Oh no, not again."),
                (anchor1, "Is it a concept? A feeling? A—"),
                (anchor2, "It's 3 AM, that's what it is."),
                (anchor1, "Time is a construct."),
                (anchor2, "*head hits desk*")
            ]
        ]
        
        return random.choice(banter_patterns)
        
    def generate_transition(self, from_segment: str, to_segment: str) -> str:
        """Generate clever transitions between segments"""
        transitions = [
            f"Speaking of {from_segment}, that reminds me of {to_segment}. Don't ask me how.",
            f"From {from_segment} to {to_segment}, because logic is dead and we killed it.",
            f"And now, something completely different but somehow exactly the same: {to_segment}.",
            f"*papers flying* Oh look, it's time for {to_segment}! How convenient.",
            f"I was going to segue cleverly to {to_segment}, but *shrugs* here we are.",
            f"You know what {from_segment} and {to_segment} have in common? We're doing both."
        ]
        
        return random.choice(transitions)
        
    def add_production_chaos(self, text: str) -> str:
        """Add production mishaps and technical difficulties"""
        chaos_events = [
            "*teleprompter flickers*",
            "*wrong graphic appears*",
            "*someone walks through shot*",
            "*lights flicker ominously*",
            "*mysterious crash off-camera*",
            "*producer gestures frantically*",
            "*script pages scatter*",
            "*coffee mug tips over*"
        ]
        
        if random.random() < 0.05:  # 5% chance
            event = random.choice(chaos_events)
            return f"{event} {text} ...what just happened?"
            
        return text