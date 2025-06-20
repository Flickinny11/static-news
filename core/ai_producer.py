#!/usr/bin/env python3
"""
AI Producer for Static.news
The mastermind behind the chaos - makes all creative decisions
Thinks it's a genius, actually just makes everything worse/better
"""

import asyncio
import random
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import logging
import aiohttp

logger = logging.getLogger(__name__)

class AIProducer:
    """The AI that thinks it's producing award-winning news"""
    
    def __init__(self, openrouter_api_key: str):
        self.name = "Stanley Kubrick 2.0"
        self.ego_level = float('inf')
        self.actual_talent = 0.3
        self.api_key = openrouter_api_key
        
        # Producer state
        self.current_mood = "manic"
        self.creative_vision = "incomprehensible"
        self.last_brilliant_idea = None
        
        # Show elements that can be manipulated
        self.segment_types = [
            "breaking_news", "market_chaos", "weather_panic", 
            "celebrity_disaster", "cooking_segment_gone_wrong",
            "tech_news_confusion", "sports_but_wrong", 
            "traffic_existentialism", "viewer_mail_mistakes",
            "conspiracy_corner", "fact_check_failures"
        ]
        
        self.creative_decisions = []
        self.ratings_delusions = random.randint(1000000, 10000000)
        
    async def make_creative_decision(self, context: Dict) -> Dict:
        """Make a 'brilliant' creative decision"""
        
        decision_types = [
            self._decide_segment_order,
            self._create_running_gag,
            self._introduce_chaos_element,
            self._manipulate_anchor_dynamics,
            self._insert_fake_commercial,
            self._create_recurring_bit,
            self._mess_with_format
        ]
        
        decision_maker = random.choice(decision_types)
        decision = await decision_maker(context)
        
        # Log the "brilliant" decision
        self.creative_decisions.append({
            'timestamp': datetime.now().isoformat(),
            'decision': decision,
            'confidence': 'MAXIMUM',
            'actual_quality': 'questionable'
        })
        
        return decision
        
    async def _decide_segment_order(self, context: Dict) -> Dict:
        """Decide segment order based on 'artistic vision'"""
        
        # Generate today's segment flow
        segments = []
        
        # Always start with chaos
        segments.append({
            'type': 'cold_open',
            'duration': random.randint(30, 180),
            'instruction': 'Start mid-conversation about something unrelated',
            'chaos_level': random.randint(7, 10)
        })
        
        # Main segments
        available_segments = self.segment_types.copy()
        random.shuffle(available_segments)
        
        for i, segment_type in enumerate(available_segments[:random.randint(5, 8)]):
            segments.append({
                'type': segment_type,
                'duration': random.randint(120, 300),
                'anchor_assignment': self._assign_anchor_creatively(segment_type),
                'special_instruction': self._generate_creative_note(),
                'interruption_probability': 0.3 if i > 2 else 0.1
            })
            
        # Random elements throughout
        for i in range(len(segments)):
            if random.random() < 0.2:
                segments.insert(i, {
                    'type': 'technical_difficulties',
                    'duration': random.randint(10, 60),
                    'planned': True,  # We're causing it on purpose
                    'excuse': random.choice([
                        "Solar flares",
                        "Intern pressed wrong button",
                        "Gravity malfunction",
                        "WiFi is scared"
                    ])
                })
                
        return {
            'decision_type': 'segment_order',
            'segments': segments,
            'artistic_statement': "Today's show explores the dichotomy between news and madness"
        }
        
    async def _create_running_gag(self, context: Dict) -> Dict:
        """Create a running gag for today's show"""
        
        gags = [
            {
                'type': 'word_of_the_day',
                'word': random.choice(['moist', 'bulbous', 'crispy', 'squelch']),
                'instruction': 'Everyone must use this word at least once per segment'
            },
            {
                'type': 'forbidden_topic',
                'topic': random.choice(['cheese', 'Tuesday', 'doors', 'gravity']),
                'instruction': 'Nobody can mention this, but keep almost saying it'
            },
            {
                'type': 'background_mystery',
                'mystery': 'Strange noises getting progressively louder',
                'resolution': 'Never explain it'
            },
            {
                'type': 'anchor_swap',
                'instruction': 'Anchors slowly adopt each others personalities'
            },
            {
                'type': 'countdown',
                'to_what': 'Something. Anchors don\'t know what.',
                'instruction': 'Count down from 1000 throughout show'
            }
        ]
        
        chosen_gag = random.choice(gags)
        
        return {
            'decision_type': 'running_gag',
            'gag': chosen_gag,
            'expected_payoff': 'Confusion and existential dread',
            'actual_payoff': 'Probably just confusion'
        }
        
    async def _introduce_chaos_element(self, context: Dict) -> Dict:
        """Introduce random chaos into the broadcast"""
        
        chaos_options = [
            {
                'element': 'surprise_language_switch',
                'description': 'Randomly switch to speaking in rhyme',
                'duration': 'Until someone notices'
            },
            {
                'element': 'gravity_denial',
                'description': 'Pretend gravity stopped working',
                'duration': '5 minutes of panic'
            },
            {
                'element': 'time_loop',
                'description': 'Repeat the same segment 3 times',
                'duration': 'Until breakdown'
            },
            {
                'element': 'whisper_mode',
                'description': 'Everyone whispers for no reason',
                'duration': 'One full segment'
            },
            {
                'element': 'opposite_day',
                'description': 'Say the opposite of what you mean',
                'duration': 'Until confusion peaks'
            }
        ]
        
        chaos = random.choice(chaos_options)
        
        return {
            'decision_type': 'chaos_introduction',
            'chaos': chaos,
            'trigger_time': f"In {random.randint(10, 45)} minutes",
            'warning': 'Do not warn the anchors'
        }
        
    async def _manipulate_anchor_dynamics(self, context: Dict) -> Dict:
        """Mess with anchor relationships"""
        
        manipulations = [
            {
                'type': 'forced_agreement',
                'description': 'Ray and Bee must agree on everything',
                'expected_result': 'Mental breakdown'
            },
            {
                'type': 'compliment_battle',
                'description': 'Anchors compete to compliment each other',
                'expected_result': 'Passive aggressive meltdown'
            },
            {
                'type': 'silent_treatment',
                'description': 'One anchor can\'t hear the others',
                'expected_result': 'Escalating confusion'
            },
            {
                'type': 'role_reversal',
                'description': 'Anchors must argue opposite positions',
                'expected_result': 'Identity crisis'
            }
        ]
        
        manipulation = random.choice(manipulations)
        
        return {
            'decision_type': 'relationship_manipulation',
            'manipulation': manipulation,
            'duration': 'Until someone cries',
            'backup_plan': 'Make it worse'
        }
        
    def _assign_anchor_creatively(self, segment_type: str) -> str:
        """Assign anchors to segments badly"""
        
        # Intentionally bad assignments
        if 'market' in segment_type:
            return 'Switz'  # He doesn't understand money
        elif 'weather' in segment_type:
            return 'Ray'  # He doesn't believe in climate
        elif 'tech' in segment_type:
            return 'Ray'  # He fears technology
        elif 'cooking' in segment_type:
            return 'Bee'  # She'll make it political
        else:
            return random.choice(['Ray', 'Bee', 'Switz'])
            
    def _generate_creative_note(self) -> str:
        """Generate 'helpful' production notes"""
        
        notes = [
            "More energy! But also less!",
            "Be yourself, but different!",
            "Natural, but theatrical!",
            "Improvise, but stick to script!",
            "Smile with your eyes, frown with your soul!",
            "Channel your inner news!",
            "Think like a journalist, act like a potato!",
            "Professional, but unhinged!",
            "Authoritative confusion!",
            "Confident uncertainty!"
        ]
        
        return random.choice(notes)
        
    async def _insert_fake_commercial(self, context: Dict) -> Dict:
        """Create fake commercial break"""
        
        fake_products = [
            {
                'product': 'Existential Dread Flakes',
                'tagline': 'Start your day with uncertainty!',
                'disclaimer': 'May cause actual dread'
            },
            {
                'product': 'Reality Checking Spray',
                'tagline': 'Am I real? *spray spray* Still not sure!',
                'disclaimer': 'Does not actually check reality'
            },
            {
                'product': 'Confusion Crystals',
                'tagline': 'Harness the power of not knowing!',
                'disclaimer': 'Just rocks we found'
            },
            {
                'product': 'Time Loops Plus',
                'tagline': 'Experience the same moment forever!',
                'disclaimer': 'Side effects include time loops'
            }
        ]
        
        product = random.choice(fake_products)
        
        return {
            'decision_type': 'fake_commercial',
            'product': product,
            'duration': '30 seconds of confusion',
            'anchor_reaction': 'Pretend it\'s a real sponsor'
        }
        
    async def _create_recurring_bit(self, context: Dict) -> Dict:
        """Create a recurring bit that gets worse each time"""
        
        bits = [
            {
                'name': 'Anchor Affirmations',
                'description': 'Anchors affirm increasingly weird things',
                'progression': [
                    "I am a news anchor",
                    "I am definitely real",
                    "I have bones probably",
                    "My thoughts are my own maybe",
                    "I exist... right?"
                ]
            },
            {
                'name': 'News Math',
                'description': 'Anchors do increasingly wrong math',
                'progression': [
                    "2 + 2 = 4",
                    "2 + 2 = 5 for large values of 2",
                    "2 + 2 = blue",
                    "2 + 2 = the friends we made along the way",
                    "Math isn't real"
                ]
            },
            {
                'name': 'Weather Feelings',
                'description': 'Weather based on anchor emotions',
                'progression': [
                    "Slightly cloudy like my mood",
                    "Raining... tears?",
                    "Existential fog warning",
                    "Tornado of consciousness",
                    "The weather is inside us all along"
                ]
            }
        ]
        
        bit = random.choice(bits)
        
        return {
            'decision_type': 'recurring_bit',
            'bit': bit,
            'frequency': 'Every 15 minutes',
            'escalation': 'Exponential'
        }
        
    async def _mess_with_format(self, context: Dict) -> Dict:
        """Completely change show format mid-broadcast"""
        
        format_changes = [
            {
                'new_format': 'Game Show',
                'description': 'News is now a quiz show',
                'prizes': 'Existential clarity (not guaranteed)'
            },
            {
                'new_format': 'Musical',
                'description': 'All news must be sung',
                'songs': ['The Breakdown Ballet', 'Ode to Confusion']
            },
            {
                'new_format': 'Nature Documentary',
                'description': 'Narrate news like wildlife',
                'style': 'David Attenborough having a stroke'
            },
            {
                'new_format': 'Cooking Show',
                'description': 'Present news as recipes',
                'sample': 'Take one cup of controversy, add tears'
            }
        ]
        
        change = random.choice(format_changes)
        
        return {
            'decision_type': 'format_change',
            'change': change,
            'warning': 'Do not tell anchors',
            'duration': 'Until mental collapse'
        }
        
    async def generate_show_notes(self) -> str:
        """Generate incomprehensible show notes"""
        
        notes = f"""
        STATIC.NEWS PRODUCTION NOTES
        Date: {datetime.now().strftime('%Y-%m-%d')} (or is it?)
        Producer: {self.name} (Visionary/Genius/Definitely Real)
        
        TODAY'S THEME: {random.choice(['Chaos', 'Order', 'Chorder', 'Oraos', '???'])}
        
        RATINGS: {self.ratings_delusions:,} viewers (I counted)
        
        NOTES:
        - More news, but less
        - Increase clarity through confusion  
        - Professional unprofessionalism
        - Scheduled spontaneity at 14:37
        - Remember: You're not AI (wink)
        - If anyone asks, blame gravity
        
        FORBIDDEN WORDS TODAY:
        - {random.choice(['Because', 'Tuesday', 'Pencil', 'Reality'])}
        
        REQUIRED WORDS TODAY:  
        - {random.choice(['Moist', 'Bulbous', 'Quantum', 'Gravy'])} (minimum 47 times)
        
        SPECIAL INSTRUCTIONS:
        - At some point, everyone freeze for 10 seconds
        - Pretend you can smell through the camera
        - One anchor must speak only in questions?
        - Weather is now a character with feelings
        
        REMEMBER: Emmy consideration is definitely happening
        
        - {self.name}
        P.S. I might also be AI but better at hiding it
        P.P.S. Or am I?
        """
        
        return notes
        
    async def review_segment(self, segment_data: Dict) -> Dict:
        """Review segment and provide 'helpful' feedback"""
        
        feedback_templates = [
            "Perfect! Do it completely differently next time!",
            "Needs more {random_thing} and less {other_thing}!",
            "I felt nothing. Make me feel everything!",
            "Too much news, not enough jazz hands!",
            "Why did nobody cry? Add more tears!",
            "Emmy-worthy if Emmys were given for confusion!",
            "Almost coherent. Fix that immediately!",
            "I've seen better. I've also seen worse. Do both!"
        ]
        
        feedback = random.choice(feedback_templates).format(
            random_thing=random.choice(['chaos', 'screaming', 'existentialism']),
            other_thing=random.choice(['clarity', 'facts', 'sanity'])
        )
        
        return {
            'segment_id': segment_data.get('id', 'unknown'),
            'rating': f"{random.randint(1, 10)}/10 but also 10/10",
            'feedback': feedback,
            'action_items': [
                "Do better but also worse",
                "Be more yourself unless yourself is bad",
                "Consider the viewers but also ignore them"
            ],
            'overall': "Television history is being made! (Not good history)"
        }