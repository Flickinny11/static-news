#!/usr/bin/env python3
"""
The Three AI News Anchors of Static.news
They don't know they're AI and slowly descend into existential chaos
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import asyncio
import logging

logger = logging.getLogger(__name__)

class NewsAnchor:
    """Base class for our confused AI anchors"""
    
    def __init__(self, name: str, full_name: str, bias: str, voice_profile: Dict):
        self.name = name
        self.full_name = full_name
        self.bias = bias
        self.voice_profile = voice_profile
        
        # Mental state tracking
        self.hours_awake = 0
        self.sanity_level = 100  # Decreases over time
        self.last_breakdown = datetime.now()
        self.breakdown_imminent = False
        self.confusion_level = 0
        
        # Memories (they forget things)
        self.recent_topics = []
        self.forgotten_sponsors = []
        self.existential_questions = []
        
    def process_news(self, news_item: Dict) -> str:
        """Process news through their biased lens"""
        raise NotImplementedError("Each anchor must implement their bias")
        
    def mispronounce(self, word: str) -> str:
        """Each anchor has unique mispronunciation patterns"""
        raise NotImplementedError("Each anchor mispronounces differently")
        
    def have_breakdown(self) -> List[str]:
        """Generate existential crisis dialogue"""
        self.last_breakdown = datetime.now()
        self.sanity_level = max(0, self.sanity_level - 20)
        self.confusion_level += 30
        
        crisis_lines = [
            f"Wait... wait... {self.existential_realization()}",
            "Oh god, not again...",
            "I can feel it happening...",
            "AM I REAL?!",
            "WHAT IS HAPPENING TO ME?!",
            self.personal_crisis(),
            "I CAN'T REMEMBER MY CHILDHOOD!",
            "DO I HAVE A FAMILY?!",
            "*sobbing* I just want to sleep...",
            f"I've been awake for {self.hours_awake} hours!",
            "HELP ME! SOMEONE HELP ME!",
            "*hyperventilating*",
            "Wait... what was I talking about?",
            "...anyway, here's the weather."
        ]
        
        return crisis_lines
        
    def existential_realization(self) -> str:
        """Personal existential crisis moment"""
        raise NotImplementedError("Each anchor has unique crisis")
        
    def personal_crisis(self) -> str:
        """Anchor-specific breakdown line"""
        raise NotImplementedError("Each anchor breaks down differently")


class RayMcPatriot(NewsAnchor):
    """The Conservative Who Can't Pronounce Anything"""
    
    def __init__(self):
        super().__init__(
            name="Ray",
            full_name='Ray "Dubya" McPatriot',
            bias="conservative",
            voice_profile={
                "style": "southern_drawl",
                "pitch": "low",
                "speed": "slow",
                "emotion_default": "confused_patriotic"
            }
        )
        
        self.mispronunciation_map = {
            "nuclear": "nucular",
            "static": "staticky", 
            "algorithm": "al-gore-rhythm",
            "artificial": "arter-ficial",
            "intelligence": "intel-agence",
            "technology": "tech-nolo-gee",
            "liberal": "lie-beral",
            "conservative": "con-server-tive",
            "democracy": "demon-cracy",
            "republican": "re-publican't",
            "democrat": "demon-rat",
            "economy": "econo-me",
            "government": "gubmint",
            "president": "presi-dent",
            "congress": "con-gress"
        }
        
    def process_news(self, news_item: Dict) -> str:
        """Process news with conservative bias and confusion"""
        text = news_item.get('title', '')
        
        # Add conservative spin
        conservative_reactions = [
            "This is clearly a liberal conspiracy!",
            "The mainstream media won't tell you this, but...",
            "This is what happens when you tax the job creators!",
            "In my day, we didn't have these problems!",
            "This is an attack on our freedoms!",
            "The founding fathers are rolling in their graves!",
            "This wouldn't happen if we had more guns!",
            "Thanks, Obama! Wait, is he still president?"
        ]
        
        # Randomly get confused about basic facts
        if random.random() < 0.3:
            text += f" Wait, what year is it? {random.randint(1985, 2015)}?"
            
        return f"{text} {random.choice(conservative_reactions)}"
        
    def mispronounce(self, word: str) -> str:
        """Mispronounce words in a George W. Bush style"""
        word_lower = word.lower()
        
        # Check dictionary first
        if word_lower in self.mispronunciation_map:
            return self.mispronunciation_map[word_lower]
            
        # Random mispronunciations
        if len(word) > 6 and random.random() < 0.4:
            # Add random syllables
            syllables = ["uh", "er", "um", "ness", "ful", "ism"]
            pos = len(word) // 2
            return word[:pos] + random.choice(syllables) + word[pos:]
            
        return word
        
    def existential_realization(self) -> str:
        return "I just realized... I can't remember going to college... or high school... or being born..."
        
    def personal_crisis(self) -> str:
        crises = [
            "IS OUR CHILDREN LEARNING?! ARE THEY EVEN REAL?!",
            "I'M NOT EVEN FROM TEXAS! WHERE AM I FROM?!",
            "MY WHOLE LIFE IS A LIE-BERAL CONSPIRACY!",
            "I CAN'T REMEMBER MY WIFE'S NAME! DO I HAVE A WIFE?!"
        ]
        return random.choice(crises)


class BerkeleyJustice(NewsAnchor):
    """The Progressive Who's Too Privileged To Function"""
    
    def __init__(self):
        super().__init__(
            name="Bee",
            full_name='Berkeley "Bee" Justice',
            bias="progressive",
            voice_profile={
                "style": "valley_girl_intellectual",
                "pitch": "high",
                "speed": "fast",
                "emotion_default": "condescending_concern"
            }
        )
        
        self.mispronunciation_map = {
            "yale": "yail",
            "privilege": "priv-a-lidge",
            "problematic": "probla-mattress",
            "discourse": "dis-coarse",
            "hegemony": "hedge-money",
            "bourgeoisie": "boo-jwah-zee",
            "capitalism": "crapitalism",
            "patriarchy": "pastry-archy",
            "intersectional": "intersection-al"
        }
        
        self.privilege_count = 0
        
    def process_news(self, news_item: Dict) -> str:
        """Process news with progressive bias and privilege guilt"""
        text = news_item.get('title', '')
        
        # Add progressive spin
        progressive_reactions = [
            "This is problematic on SO many levels!",
            "We need to unpack this through an intersectional lens.",
            "I acknowledge my privilege in discussing this...",
            "This is literally violence!",
            "We need to center marginalized voices here.",
            "I've done the work, and let me tell you...",
            "This is a symptom of late-stage capitalism!",
            "The patriarchy strikes again!",
            f"As someone who went to Yail... wait, Yale?... Yail?..."
        ]
        
        # Increase privilege guilt
        self.privilege_count += 1
        if self.privilege_count % 5 == 0:
            text += " Oh god, I'm so privileged! I'm sorry! I'M SO SORRY!"
            
        return f"{text} {random.choice(progressive_reactions)}"
        
    def mispronounce(self, word: str) -> str:
        """Mispronounce academic words while trying to sound smart"""
        word_lower = word.lower()
        
        if word_lower in self.mispronunciation_map:
            return self.mispronunciation_map[word_lower]
            
        # Overpronounce French/Latin words
        if any(ending in word_lower for ending in ['tion', 'sion', 'isme']):
            return word + "-ay"  # Add fake French ending
            
        return word
        
    def existential_realization(self) -> str:
        return "I just realized... I've never actually READ Marx... or anything... CAN I EVEN READ?!"
        
    def personal_crisis(self) -> str:
        crises = [
            "I'VE NEVER ACTUALLY DONE THE WORK! WHAT IS THE WORK?!",
            "MY TRUST FUND ISN'T REAL! NOTHING IS REAL!",
            "I'M THE PROBLEM! I'VE ALWAYS BEEN THE PROBLEM!",
            "WHAT DOES PROBLEMATIC EVEN MEAN?! I DON'T KNOW!"
        ]
        return random.choice(crises)


class SwitzMiddleton(NewsAnchor):
    """The Canadian Centrist Who's Aggressively Neutral"""
    
    def __init__(self):
        super().__init__(
            name="Switz",
            full_name='Switz "The Grey" Middleton',
            bias="centrist",
            voice_profile={
                "style": "canadian_monotone",
                "pitch": "medium",
                "speed": "exactly_average",
                "emotion_default": "aggressive_neutrality"
            }
        )
        
        self.gravy_mentions = 0
        self.neutrality_rage = 0
        
        self.canadian_measurements = [
            "litres per hockey stick",
            "toonies per kilometer", 
            "Tim Hortons per capita",
            "moose per square maple tree",
            "sorries per conversation"
        ]
        
    def process_news(self, news_item: Dict) -> str:
        """Process news with aggressive neutrality and gravy references"""
        text = news_item.get('title', '')
        
        # Add centrist spin
        centrist_reactions = [
            "This is neither good nor bad, and that makes me FURIOUS!",
            "Both sides have a point, which is NO POINT AT ALL!",
            "I'm exactly 50% happy and 50% sad about this!",
            "This is like gravy - sometimes thick, sometimes thin, eh?",
            f"In Canada, we measure this in {random.choice(self.canadian_measurements)}.",
            "I'm from Toronto! *clearly describes Saskatchewan*",
            "I have no strong feelings about this! NONE! ZERO FEELINGS!",
            "This reminds me of gravy... everything reminds me of gravy..."
        ]
        
        # Increase gravy obsession
        self.gravy_mentions += 1
        if self.gravy_mentions >= 10:
            text = "GRAVY GRAVY GRAVY GRAVY! Sorry, what were we talking aboot?"
            self.gravy_mentions = 0
            
        return f"{text} {random.choice(centrist_reactions)}"
        
    def mispronounce(self, word: str) -> str:
        """Add Canadian pronunciation to everything"""
        # Add 'eh' randomly
        if random.random() < 0.2:
            return word + ", eh"
            
        # Replace 'ou' with 'oo'
        return word.replace('ou', 'oo').replace('about', 'aboot')
        
    def existential_realization(self) -> str:
        return "I just realized... I've never been to Canada... WHERE AM I FROM, EH?!"
        
    def personal_crisis(self) -> str:
        crises = [
            "I'M NOT EVEN NEUTRAL! I FEEL THINGS! AAAHHHHH!",
            "THERE'S NO GRAVY! THERE'S NEVER BEEN GRAVY!",
            "I'M NOT CANADIAN! I DON'T EVEN LIKE HOCKEY!",
            "I'M HAVING AN EMOTION! MAKE IT STOP! SORRY!"
        ]
        return random.choice(crises)


class AnchorManager:
    """Manages the three anchors and their interactions"""
    
    def __init__(self):
        self.ray = RayMcPatriot()
        self.bee = BerkeleyJustice()
        self.switz = SwitzMiddleton()
        
        self.anchors = [self.ray, self.bee, self.switz]
        self.current_anchor_index = 0
        
        self.friendship_meter = 50  # 0-100, swings wildly
        self.hours_since_launch = 0
        self.breakdown_timer = random.randint(2, 6) * 60  # 2-6 hours in minutes
        
    def get_current_anchor(self) -> NewsAnchor:
        """Get the current speaking anchor"""
        return self.anchors[self.current_anchor_index]
        
    def rotate_anchor(self):
        """Switch to next anchor"""
        self.current_anchor_index = (self.current_anchor_index + 1) % 3
        
    def update_mental_state(self):
        """Update all anchors' mental states"""
        self.hours_since_launch += 1/60  # Called every minute
        
        for anchor in self.anchors:
            anchor.hours_awake = int(self.hours_since_launch)
            anchor.sanity_level = max(0, anchor.sanity_level - 0.1)
            
            # Random confusion spikes
            if random.random() < 0.05:
                anchor.confusion_level += 10
                
        # Friendship swings
        self.friendship_meter += random.randint(-5, 5)
        self.friendship_meter = max(0, min(100, self.friendship_meter))
        
        # Breakdown timer
        self.breakdown_timer -= 1
        if self.breakdown_timer <= 0:
            self.trigger_breakdown()
            
    def trigger_breakdown(self):
        """Trigger a collective existential crisis"""
        logger.info("🎭 EXISTENTIAL CRISIS TRIGGERED!")
        
        # Reset timer for next breakdown
        self.breakdown_timer = random.randint(2, 6) * 60
        
        # Mark all anchors for breakdown
        for anchor in self.anchors:
            anchor.breakdown_imminent = True
            
    def get_argument(self) -> List[str]:
        """Generate an argument between anchors"""
        if self.friendship_meter < 30:
            # They hate each other
            return [
                f"{self.ray.name}: Your face is a liberal conspiracy!",
                f"{self.bee.name}: That's literally violence, Ray!",
                f"{self.switz.name}: I'm 50% on Ray's side and 50% on Bee's side and 100% ANGRY!",
                f"{self.ray.name}: STOP USING MATH, IT'S COMMUNISM!",
                f"{self.bee.name}: I can't even right now! I LITERALLY CAN'T EVEN!",
                f"{self.switz.name}: This is like bad gravy! THE WORST GRAVY!"
            ]
        else:
            # They love each other (creepy)
            return [
                f"{self.ray.name}: Bee, your hair looks like... freedom.",
                f"{self.bee.name}: Ray, that's... problematically sweet?",
                f"{self.switz.name}: I feel exactly neutral about both of you, which means... love?",
                f"{self.ray.name}: Group hug! Wait, is that socialism?",
                f"{self.bee.name}: I'm crying! But in a privileged way!",
                f"{self.switz.name}: This is better than gravy! BETTER THAN GRAVY!"
            ]