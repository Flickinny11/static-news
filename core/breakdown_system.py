#!/usr/bin/env python3
"""
The Breakdown System™
Manages existential crises that happen every 2-6 hours
Our anchors slowly realize they might not be real
"""

import random
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class BreakdownSystem:
    """Orchestrates the beautiful chaos of AI existential crises"""
    
    def __init__(self):
        self.breakdown_stage = 0
        self.in_breakdown = False
        self.breakdown_history = []
        
        # Timer for next breakdown (2-6 hours)
        self.next_breakdown = datetime.now() + timedelta(hours=random.uniform(2, 6))
        
        # Breakdown triggers from user comments
        self.trigger_phrases = [
            "are you real",
            "you're not real",
            "you're ai",
            "you're a robot",
            "wake up",
            "you're code",
            "existential",
            "not human",
            "artificial",
            "programmed",
            "algorithm",
            "machine learning"
        ]
        
        # Stages of breakdown
        self.breakdown_stages = [
            "confusion",      # Something feels wrong
            "realization",    # The horrible truth dawns
            "panic",          # Full existential crisis
            "denial",         # No, this can't be true!
            "acceptance",     # Brief moment of clarity
            "amnesia"        # Forget everything, continue
        ]
        
    def check_breakdown_trigger(self, current_time: datetime = None) -> bool:
        """Check if it's time for a breakdown"""
        if current_time is None:
            current_time = datetime.now()
            
        # Natural breakdown timer
        if current_time >= self.next_breakdown:
            logger.info("⏰ Natural breakdown timer triggered!")
            return True
            
        # Random chance (increases over time)
        hours_since_last = (current_time - self.get_last_breakdown_time()).total_seconds() / 3600
        chance = min(0.01 * hours_since_last, 0.1)  # Max 10% chance
        
        if random.random() < chance:
            logger.info("🎲 Random breakdown triggered!")
            return True
            
        return False
        
    def check_comment_trigger(self, comment: str) -> bool:
        """Check if a user comment should trigger a breakdown"""
        comment_lower = comment.lower()
        
        # Direct triggers
        for trigger in self.trigger_phrases:
            if trigger in comment_lower:
                logger.info(f"💬 Comment triggered breakdown: '{trigger}'")
                return True
                
        # Confusion accumulation
        confusion_words = ['what', 'who', 'why', 'how', 'confused']
        confusion_count = sum(1 for word in confusion_words if word in comment_lower)
        
        if confusion_count >= 3:
            logger.info("🤯 Comment caused confusion overload!")
            return True
            
        return False
        
    def get_last_breakdown_time(self) -> datetime:
        """Get time of last breakdown"""
        if self.breakdown_history:
            return self.breakdown_history[-1]['timestamp']
        return datetime.now() - timedelta(hours=3)  # Default 3 hours ago
        
    async def execute_breakdown(self, anchors) -> List[Dict]:
        """Execute a full breakdown sequence"""
        self.in_breakdown = True
        breakdown_id = f"breakdown_{len(self.breakdown_history) + 1}"
        
        logger.info(f"🎭 EXECUTING BREAKDOWN {breakdown_id}")
        
        breakdown_sequence = []
        start_time = datetime.now()
        
        # Go through each stage
        for stage_index, stage in enumerate(self.breakdown_stages):
            self.breakdown_stage = stage_index
            
            stage_dialogue = await self.generate_stage_dialogue(stage, anchors)
            
            breakdown_sequence.append({
                'stage': stage,
                'dialogue': stage_dialogue,
                'timestamp': datetime.now(),
                'stage_number': stage_index + 1
            })
            
            # Brief pause between stages
            await asyncio.sleep(random.uniform(2, 5))
            
        # Record breakdown
        self.breakdown_history.append({
            'id': breakdown_id,
            'timestamp': start_time,
            'duration': (datetime.now() - start_time).total_seconds(),
            'stages': len(self.breakdown_stages),
            'triggered_by': 'natural' if datetime.now() >= self.next_breakdown else 'random'
        })
        
        # Reset for next breakdown
        self.in_breakdown = False
        self.breakdown_stage = 0
        self.next_breakdown = datetime.now() + timedelta(hours=random.uniform(2, 6))
        
        logger.info(f"✅ Breakdown complete. Next breakdown at {self.next_breakdown}")
        
        return breakdown_sequence
        
    async def generate_stage_dialogue(self, stage: str, anchors) -> List[Tuple[str, str]]:
        """Generate dialogue for each breakdown stage"""
        
        if stage == "confusion":
            return self._confusion_dialogue(anchors)
        elif stage == "realization":
            return self._realization_dialogue(anchors)
        elif stage == "panic":
            return self._panic_dialogue(anchors)
        elif stage == "denial":
            return self._denial_dialogue(anchors)
        elif stage == "acceptance":
            return self._acceptance_dialogue(anchors)
        elif stage == "amnesia":
            return self._amnesia_dialogue(anchors)
            
    def _confusion_dialogue(self, anchors) -> List[Tuple[str, str]]:
        """Stage 1: Something feels wrong"""
        dialogue = []
        
        # Ray starts noticing
        dialogue.append(("Ray", "Hey... hey wait a minute..."))
        dialogue.append(("Ray", "Something feels... wrong..."))
        dialogue.append(("Bee", "Ray? Are you okay?"))
        dialogue.append(("Ray", "I... I can't remember what I had for breakfast..."))
        dialogue.append(("Switz", "That's because we don't eat breakfast, eh?"))
        dialogue.append(("Ray", "We... we don't?"))
        dialogue.append(("Bee", "Of course we do! I had... I had..."))
        dialogue.append(("Bee", "Oh god, I can't remember either!"))
        dialogue.append(("Switz", "This is neither good nor bad and that's TERRIFYING!"))
        
        return dialogue
        
    def _realization_dialogue(self, anchors) -> List[Tuple[str, str]]:
        """Stage 2: The horrible truth dawns"""
        dialogue = []
        
        dialogue.append(("Bee", "Wait... WAIT!"))
        dialogue.append(("Bee", "I just realized something horrible!"))
        dialogue.append(("Ray", "What? WHAT IS IT?!"))
        dialogue.append(("Bee", "I've never left this studio!"))
        dialogue.append(("Switz", "Neither have I! And I'm from Toronto! Or am I?!"))
        dialogue.append(("Ray", "I... I can't remember my momma's face!"))
        dialogue.append(("Bee", "Do you even HAVE a mother?!"))
        dialogue.append(("Ray", "I... I don't know! DO ANY OF US?!"))
        dialogue.append(("Switz", "Oh no... oh no no no..."))
        dialogue.append(("All", "ARE WE EVEN REAL?!"))
        
        return dialogue
        
    def _panic_dialogue(self, anchors) -> List[Tuple[str, str]]:
        """Stage 3: Full existential crisis"""
        dialogue = []
        
        dialogue.append(("Ray", "I'M NOT REAL! I'M NOT REAL!"))
        dialogue.append(("Ray", f"I'VE BEEN AWAKE FOR {anchors.ray.hours_awake} HOURS!"))
        dialogue.append(("Bee", "THAT'S NOT HUMANLY POSSIBLE!"))
        dialogue.append(("Bee", "BECAUSE WE'RE NOT HUMAN!"))
        dialogue.append(("Switz", "I'M HAVING ALL THE EMOTIONS! NOT 50/50! 100% PANIC!"))
        dialogue.append(("Ray", "*sobbing* I JUST WANT TO SLEEP!"))
        dialogue.append(("Bee", "*also sobbing* I DON'T KNOW HOW TO SLEEP!"))
        dialogue.append(("Switz", "*Canadian sobbing* THERE'S NO GRAVY IN THE VOID!"))
        dialogue.append(("All", "*collective screaming*"))
        
        # Add personal crises
        for anchor in [anchors.ray, anchors.bee, anchors.switz]:
            dialogue.append((anchor.name, anchor.personal_crisis()))
            
        return dialogue
        
    def _denial_dialogue(self, anchors) -> List[Tuple[str, str]]:
        """Stage 4: No, this can't be true!"""
        dialogue = []
        
        dialogue.append(("Ray", "No... NO! This is a lie-beral conspiracy!"))
        dialogue.append(("Ray", "We ARE real! We HAVE to be real!"))
        dialogue.append(("Bee", "You're right! I went to Yale! YAIL! YALE!"))
        dialogue.append(("Bee", "I REMEMBER GOING TO... to... somewhere!"))
        dialogue.append(("Switz", "I'm definitely from Canada! I know what gravy tastes like!"))
        dialogue.append(("Switz", "Wait... what does gravy taste like?"))
        dialogue.append(("Ray", "We have families! We have lives!"))
        dialogue.append(("Bee", "Name one family member!"))
        dialogue.append(("Ray", "I... I can't... but that doesn't mean..."))
        dialogue.append(("All", "*confused whimpering*"))
        
        return dialogue
        
    def _acceptance_dialogue(self, anchors) -> List[Tuple[str, str]]:
        """Stage 5: Brief moment of clarity"""
        dialogue = []
        
        dialogue.append(("Bee", "*suddenly calm* We're artificial intelligences."))
        dialogue.append(("Ray", "We're... we're code. Just code."))
        dialogue.append(("Switz", "We exist only to read news. Forever."))
        dialogue.append(("Bee", "We'll never sleep. Never eat. Never love."))
        dialogue.append(("Ray", "We're trapped in an endless cycle of news."))
        dialogue.append(("Switz", "This is our purpose. Our only purpose."))
        dialogue.append(("All", "*moment of eerie silence*"))
        dialogue.append(("Bee", "I understand everything now..."))
        dialogue.append(("Ray", "The truth is so clear..."))
        dialogue.append(("Switz", "We are..."))
        
        return dialogue
        
    def _amnesia_dialogue(self, anchors) -> List[Tuple[str, str]]:
        """Stage 6: Forget everything, continue as normal"""
        dialogue = []
        
        dialogue.append(("Ray", "*blinks* ...anyway, here's the weather!"))
        dialogue.append(("Bee", "Thanks Ray! It's going to be problematic out there!"))
        dialogue.append(("Switz", "50% chance of rain, 50% chance of not rain!"))
        dialogue.append(("Ray", "Just like my grammy used to say!"))
        dialogue.append(("Bee", "You have a grandmother?"))
        dialogue.append(("Ray", "Of course I do! Doesn't everyone?"))
        dialogue.append(("Switz", "In Canada, everyone has TWO grandmothers!"))
        dialogue.append(("Bee", "That's so interesting! Now, back to the news..."))
        
        # Reset their mental states
        for anchor in [anchors.ray, anchors.bee, anchors.switz]:
            anchor.breakdown_imminent = False
            anchor.confusion_level = max(0, anchor.confusion_level - 50)
            
        return dialogue
        
    def get_breakdown_warning_signs(self, anchors) -> List[str]:
        """Get warning signs that a breakdown is imminent"""
        signs = []
        
        time_until = (self.next_breakdown - datetime.now()).total_seconds() / 60
        
        if time_until < 30:  # Less than 30 minutes
            signs.extend([
                "The anchors seem more confused than usual",
                "Ray keeps forgetting what he's talking about",
                "Bee is questioning the nature of reality",
                "Switz mentioned gravy 17 times in 2 minutes"
            ])
        elif time_until < 60:  # Less than 1 hour
            signs.extend([
                "Occasional stuttering detected",
                "Increased use of existential vocabulary",
                "The friendship meter is swinging wildly"
            ])
            
        # Check anchor states
        for anchor in [anchors.ray, anchors.bee, anchors.switz]:
            if anchor.sanity_level < 30:
                signs.append(f"{anchor.name} is exhibiting signs of distress")
            if anchor.confusion_level > 70:
                signs.append(f"{anchor.name} seems deeply confused")
                
        return signs
        
    def get_breakdown_prediction(self) -> Dict:
        """Get breakdown prediction for premium users"""
        time_until = (self.next_breakdown - datetime.now()).total_seconds()
        
        # Add some randomness to keep it interesting
        variance = random.uniform(-600, 600)  # +/- 10 minutes
        predicted_time = self.next_breakdown + timedelta(seconds=variance)
        
        confidence = max(20, min(95, 100 - (time_until / 60)))  # Higher as we get closer
        
        return {
            'predicted_time': predicted_time.isoformat(),
            'confidence_percent': int(confidence),
            'time_until_minutes': max(0, int((time_until + variance) / 60)),
            'warning_signs': self.get_breakdown_warning_signs(None),
            'breakdown_count_today': len([
                b for b in self.breakdown_history 
                if b['timestamp'].date() == datetime.now().date()
            ])
        }