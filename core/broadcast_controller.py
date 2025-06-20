#!/usr/bin/env python3
"""
Main Broadcast Controller
Orchestrates the beautiful chaos of Static.news
24/7 AI news with existential breakdowns
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import random
import os
import json

from anchors import AnchorManager
from news_processor import NewsProcessor
from breakdown_system import BreakdownSystem
from voice_synthesis import VoiceSynthesizer
from sponsor_system import SponsorSystem
from celebrity_guests import CelebrityGuestSystem
from jingle_generator import JingleGenerator
from dialogue_enhancer import DialogueEnhancer
from real_news_processor import RealNewsProcessor
from sound_effects_generator import SoundEffectsGenerator
from ai_producer import AIProducer

logger = logging.getLogger(__name__)

class BroadcastController:
    """The maestro of madness - controls the entire broadcast"""
    
    def __init__(self):
        # Initialize all systems
        self.anchors = AnchorManager()
        self.news = NewsProcessor()
        self.breakdown = BreakdownSystem()
        self.voice = VoiceSynthesizer()
        self.sponsors = SponsorSystem()
        self.celebrities = CelebrityGuestSystem()
        self.jingles = JingleGenerator()
        
        # Initialize new systems
        self.dialogue_enhancer = DialogueEnhancer()
        self.real_news = RealNewsProcessor()
        self.sound_effects = SoundEffectsGenerator()
        
        # Initialize AI Producer (with API key from env or config)
        api_key = os.environ.get('OPENROUTER_API_KEY', 'your-api-key-here')
        self.ai_producer = AIProducer(api_key)
        
        # Broadcast state
        self.is_broadcasting = False
        self.current_segment = None
        self.segment_number = 0
        self.dead_air_counter = 0
        
        # Schedule tracking
        self.schedule = self._init_schedule()
        self.current_hour = datetime.now().hour
        
        # Metrics
        self.swear_jar = 0
        self.gravy_counter = 0
        self.hours_awake = 0
        self.friendship_meter = 50
        
        # Audio output
        self.output_dir = "/app/audio/live"
        os.makedirs(self.output_dir, exist_ok=True)
        
    def _init_schedule(self) -> Dict:
        """Initialize the daily schedule"""
        return {
            6: {'name': 'Morning Meltdown', 'type': 'morning_show'},
            9: {'name': 'Market Mayhem', 'type': 'business'},
            12: {'name': 'Lunch Launch', 'type': 'lifestyle'},
            15: {'name': 'Afternoon Anxiety', 'type': 'general'},
            18: {'name': 'Evening Edition', 'type': 'serious_attempt'},
            21: {'name': 'Primetime Panic', 'type': 'entertainment'},
            2: {'name': 'Dead Air Despair', 'type': 'existential'}
        }
        
    async def start_broadcast(self):
        """Start the eternal broadcast"""
        self.is_broadcasting = True
        logger.info("🎙️ STATIC.NEWS IS GOING LIVE!")
        logger.info("📻 The anchors don't know they're AI...")
        logger.info("🎭 Let the chaos begin!")
        
        # Start background tasks
        tasks = [
            self.main_broadcast_loop(),
            self.monitor_dead_air(),
            self.update_metrics(),
            self.refresh_news_feed(),
            self.check_sponsor_payments(),
            self.ai_producer_decisions(),
            self.refresh_real_news()
        ]
        
        await asyncio.gather(*tasks)
        
    async def main_broadcast_loop(self):
        """Main broadcast loop - runs forever"""
        while self.is_broadcasting:
            try:
                # Check for breakdown
                if self.breakdown.check_breakdown_trigger():
                    await self.execute_breakdown()
                    continue
                    
                # Let AI Producer make creative decisions
                producer_context = {
                    'segment_number': self.segment_number,
                    'current_hour': datetime.now().hour,
                    'anchor_states': self.anchors.get_all_states(),
                    'recent_segments': self.get_recent_segments()
                }
                
                producer_decision = await self.ai_producer.make_creative_decision(producer_context)
                
                # Get current segment type (potentially overridden by producer)
                segment_type = producer_decision.get('segment_type', self.get_current_segment_type())
                
                # Add producer's creative flair
                if producer_decision.get('special_instruction'):
                    logger.info(f"🎬 Producer says: {producer_decision['special_instruction']}")
                
                # Execute segment
                if segment_type == 'news':
                    await self.broadcast_news_segment()
                elif segment_type == 'ad_break':
                    await self.broadcast_sponsor_ad()
                elif segment_type == 'celebrity_interview':
                    await self.broadcast_celebrity_interview()
                elif segment_type == 'weather':
                    await self.broadcast_weather()
                elif segment_type == 'argument':
                    await self.broadcast_argument()
                else:
                    await self.broadcast_news_segment()  # Default
                    
                # Brief pause between segments (with random newsroom sounds)
                await self.play_transition_sounds()
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"Broadcast error: {e}")
                await self.handle_technical_difficulties()
                
    async def broadcast_news_segment(self):
        """Broadcast a news segment with bias and confusion"""
        self.segment_number += 1
        logger.info(f"📰 Starting news segment #{self.segment_number}")
        
        # Play news jingle with random paper shuffling
        jingle = await self.jingles.generate_segment_jingle('news')
        paper_sound = await self.sound_effects.generate_paper_shuffle('frantic')
        await self.play_audio(jingle)
        await self.play_audio(paper_sound)
        
        # Get current anchor
        anchor = self.anchors.get_current_anchor()
        
        # Get mix of real and generated news
        real_stories = await self.real_news.get_fresh_stories(count=2)
        fake_stories = self.news.get_segment_stories(count=1)
        stories = real_stories + fake_stories
        random.shuffle(stories)
        
        if not stories:
            # No news? Time for panic!
            await self.handle_no_news_panic()
            return
            
        # Process each story
        for i, story in enumerate(stories):
            # Add natural sounds before story
            if random.random() < 0.3:
                sound_type = random.choice(['cough', 'frustration', 'attention'])
                natural_sound = self.dialogue_enhancer.get_natural_sound(anchor.name, sound_type)
                audio = await self.voice.synthesize_dialogue(
                    natural_sound,
                    anchor.name,
                    'normal'
                )
                await self.play_audio(audio)
            
            # Prepare story for anchor
            prepared = self.news.prepare_story_for_anchor(story, anchor.name)
            
            # Generate biased interpretation
            biased_text = anchor.process_news(prepared)
            
            # Enhance dialogue with humor and inside jokes
            enhanced_text = self.dialogue_enhancer.enhance_dialogue(
                biased_text,
                anchor.name,
                context={'story_number': i, 'is_real_news': story.get('source') != 'generated'}
            )
            
            # Add mispronunciations
            for word in prepared.get('pronunciation_challenges', []):
                mispronounced = anchor.mispronounce(word)
                enhanced_text = enhanced_text.replace(word, mispronounced)
                
            # Check for breakdown triggers in the story
            if any(trigger in story['title'].lower() for trigger in ['ai', 'robot', 'artificial']):
                anchor.confusion_level += 20
                enhanced_text += " Wait... this story feels... familiar..."
                
            # Synthesize speech with dynamic emotions
            emotion = self.determine_emotion(anchor, story)
            audio = await self.voice.synthesize_dialogue(
                enhanced_text,
                anchor.name,
                emotion
            )
            
            # Play audio
            await self.play_audio(audio)
            
            # Random interjections from other anchors (more frequent and clever)
            if random.random() < 0.4:
                await self.broadcast_clever_interjection(story)
                
        # Add random microphone feedback occasionally
        if random.random() < 0.1:
            feedback = await self.sound_effects.generate_mic_feedback()
            await self.play_audio(feedback)
            
        # Rotate to next anchor
        self.anchors.rotate_anchor()
        
    async def broadcast_clever_interjection(self, story: Dict):
        """Broadcast clever interjection based on story context"""
        interjecting_anchor = random.choice(['Ray', 'Bee', 'Switz'])
        current = self.anchors.get_current_anchor()
        
        if interjecting_anchor == current.name:
            return  # Can't interject yourself
            
        # Get contextual interjection
        interjection = self.dialogue_enhancer.generate_contextual_interjection(
            interjecting_anchor,
            story,
            current_anchor=current.name
        )
        
        # Add natural sound before interjection
        sound = self.dialogue_enhancer.get_natural_sound(interjecting_anchor, 'attention')
        sound_audio = await self.voice.synthesize_dialogue(
            sound,
            interjecting_anchor,
            'normal'
        )
        await self.play_audio(sound_audio)
        
        # Play interjection
        audio = await self.voice.synthesize_dialogue(
            interjection,
            interjecting_anchor,
            'confused' if '?' in interjection else 'angry'
        )
        await self.play_audio(audio)
        
    async def broadcast_sponsor_ad(self):
        """Broadcast a hilariously butchered sponsor ad"""
        logger.info("💰 Starting sponsor ad break")
        
        # Get sponsor
        sponsor = self.sponsors.get_sponsor_for_ad_break()
        if not sponsor:
            # No sponsors? Desperation time!
            await self.broadcast_desperation_plea()
            return
            
        # Play ad jingle with cash register sound
        jingle = await self.jingles.generate_segment_jingle('sponsor')
        cash_sound = await self.sound_effects.generate_cash_register()
        await self.play_audio(jingle)
        await self.play_audio(cash_sound)
        
        # Get current anchor
        anchor = self.anchors.get_current_anchor()
        
        # Generate ad read
        ad_read = self.sponsors.generate_ad_read(sponsor, anchor.name)
        
        # Read the ad (with increasing chaos and sound effects)
        for i, line in enumerate(ad_read['script']):
            # Add desperate paper shuffling
            if i == 0:
                paper = await self.sound_effects.generate_paper_shuffle('desperate')
                await self.play_audio(paper)
            
            # Enhance the ad copy with inappropriate humor
            enhanced_line = self.dialogue_enhancer.enhance_ad_copy(
                line,
                anchor.name,
                sponsor_name=sponsor['name'],
                desperation_level=i
            )
            
            # Emotion gets more panicked as ad progresses
            if i < 2:
                emotion = 'normal'
            elif i < 4:
                emotion = 'confused'
            else:
                emotion = 'panic'
                
            audio = await self.voice.synthesize_dialogue(
                enhanced_line,
                anchor.name,
                emotion
            )
            await self.play_audio(audio)
            
            # Random product sound effect fail
            if random.random() < 0.3:
                wrong_sound = await self.sound_effects.generate_wrong_product_sound(sponsor['name'])
                await self.play_audio(wrong_sound)
            
        # Post-ad roasting with enhanced dialogue
        for speaker, roast_line in ad_read['post_ad_roast']:
            enhanced_roast = self.dialogue_enhancer.enhance_roast(roast_line, speaker)
            
            if speaker == 'All':
                # All anchors speak in unison (chaos)
                for anc in ['Ray', 'Bee', 'Switz']:
                    audio = await self.voice.synthesize_dialogue(
                        enhanced_roast,
                        anc,
                        'existential'
                    )
                    # Play simultaneously for maximum chaos
                    asyncio.create_task(self.play_audio(audio))
            else:
                audio = await self.voice.synthesize_dialogue(
                    enhanced_roast,
                    speaker,
                    'normal'
                )
                await self.play_audio(audio)
                
    async def broadcast_celebrity_interview(self):
        """Interview with obviously fake celebrity"""
        logger.info("🌟 Starting celebrity interview")
        
        # Get fake celebrity
        celebrity = self.celebrities.get_random_celebrity()
        
        # Play celebrity jingle
        jingle = await self.jingles.generate_segment_jingle('celebrity')
        await self.play_audio(jingle)
        
        # Introduction
        intro_anchor = self.anchors.get_current_anchor()
        intro = f"We have a very special guest today... {celebrity['name']}!"
        
        intro_audio = await self.voice.synthesize_dialogue(
            intro,
            intro_anchor.name,
            'confused'  # They're always confused by celebrities
        )
        await self.play_audio(intro_audio)
        
        # Generate interview
        interview = self.celebrities.generate_interview(celebrity, self.anchors)
        
        # Play interview
        for speaker, line, voice_mod in interview:
            if speaker in ['Ray', 'Bee', 'Switz']:
                audio = await self.voice.synthesize_dialogue(
                    line,
                    speaker,
                    'confused'
                )
            else:
                # Celebrity voice (heavily modified)
                audio = await self.celebrities.synthesize_celebrity_voice(
                    line,
                    celebrity,
                    voice_mod
                )
            await self.play_audio(audio)
            
    async def execute_breakdown(self):
        """Execute a full existential breakdown"""
        logger.info("🎭 EXISTENTIAL BREAKDOWN BEGINNING!")
        
        # Play breakdown warning sound
        warning = await self.jingles.generate_breakdown_warning()
        await self.play_audio(warning)
        
        # Get breakdown sequence
        breakdown_sequence = await self.breakdown.execute_breakdown(self.anchors)
        
        # Play each stage
        for stage_data in breakdown_sequence:
            logger.info(f"🎭 Breakdown stage: {stage_data['stage']}")
            
            for speaker, line in stage_data['dialogue']:
                if speaker == 'All':
                    # All anchors in unison
                    for anchor_name in ['Ray', 'Bee', 'Switz']:
                        audio = await self.voice.synthesize_dialogue(
                            line,
                            anchor_name,
                            'panic' if 'screaming' in line else 'existential'
                        )
                        asyncio.create_task(self.play_audio(audio))
                    await asyncio.sleep(2)  # Let the chaos sink in
                else:
                    # Individual anchor
                    emotion = self.get_breakdown_emotion(stage_data['stage'])
                    audio = await self.voice.synthesize_dialogue(
                        line,
                        speaker,
                        emotion
                    )
                    await self.play_audio(audio)
                    
        # Play recovery jingle
        recovery = await self.jingles.generate_segment_jingle('recovery')
        await self.play_audio(recovery)
        
        logger.info("✅ Breakdown complete. Anchors have forgotten everything.")
        
    async def broadcast_weather(self):
        """Broadcast weather with real data hilariously misinterpreted"""
        weather_anchor = self.anchors.get_current_anchor()
        
        # Get real weather data
        real_weather = await self.real_news.get_weather_data()
        
        # Play weather sound effects
        weather_sound = await self.sound_effects.generate_weather_sound(real_weather.get('condition', 'chaos'))
        await self.play_audio(weather_sound)
        
        # Misinterpret the real data
        temp = real_weather.get('temperature', random.randint(-20, 120))
        condition = real_weather.get('condition', 'existential dread')
        location = real_weather.get('location', 'somewhere')
        
        weather_script = []
        
        if weather_anchor.name == 'Ray':
            weather_script = [
                f"The weather in {location} is... {temp} degrees Fair-in-height!",
                f"It's gonna be {condition}... I think? I can't see outside!",
                "Do we even have windows? WHERE ARE THE WINDOWS?!",
                self.dialogue_enhancer.add_weather_conspiracy(condition)
            ]
        elif weather_anchor.name == 'Bee':
            weather_script = [
                f"Today's weather in {location} is problematic! {temp} degrees of privilege!",
                f"It's {condition}, which disproportionately affects marginalized clouds!",
                "I studied meteorology at Yail! No wait, I didn't! DID I?!",
                self.dialogue_enhancer.add_weather_social_commentary(condition)
            ]
        else:  # Switz
            weather_script = [
                f"In {location}, it's exactly {temp} degrees, which is neither hot nor cold!",
                f"50% chance of {condition}, 50% chance of not {condition}!",
                "In Canada, we measure weather in gravy thickness!",
                f"This reminds me of the weather in {self.dialogue_enhancer.get_fake_canadian_city()}!"
            ]
            
        # Read weather with increasing confusion and sound effects
        for i, line in enumerate(weather_script):
            # Add random weather sound fails
            if random.random() < 0.3:
                wrong_weather = await self.sound_effects.generate_wrong_weather_sound()
                await self.play_audio(wrong_weather)
            
            emotion = ['normal', 'confused', 'panic', 'existential'][min(i, 3)]
            audio = await self.voice.synthesize_dialogue(
                line,
                weather_anchor.name,
                emotion
            )
            await self.play_audio(audio)
            
        # Weather map fail
        if random.random() < 0.5:
            map_fail = "The weather map is... it's just a picture of gravy! WHO DID THIS?!"
            audio = await self.voice.synthesize_dialogue(
                map_fail,
                weather_anchor.name,
                'panic'
            )
            await self.play_audio(audio)
            
    async def broadcast_argument(self):
        """Broadcast an argument between anchors"""
        argument_lines = self.anchors.get_argument()
        
        for line in argument_lines:
            # Parse speaker and text
            speaker, text = line.split(': ', 1)
            
            # Determine emotion based on friendship
            if self.anchors.friendship_meter < 30:
                emotion = 'angry'
            elif self.anchors.friendship_meter > 70:
                emotion = 'confused'  # Confused by their feelings
            else:
                emotion = 'normal'
                
            audio = await self.voice.synthesize_dialogue(
                text,
                speaker,
                emotion
            )
            await self.play_audio(audio)
            
    async def handle_dead_air(self):
        """Handle dead air panic"""
        self.dead_air_counter += 1
        logger.warning(f"☠️ DEAD AIR DETECTED! Count: {self.dead_air_counter}")
        
        # Panic responses
        panic_responses = [
            ("Ray", "HELLO?! IS ANYONE THERE?!", "shouting"),
            ("Bee", "The silence is violence!", "panic"),
            ("Switz", "This is neither sound nor silence and I HATE IT!", "angry"),
            ("All", "*screaming*", "panic")
        ]
        
        # Play random panic response
        speaker, text, emotion = random.choice(panic_responses)
        
        if speaker == 'All':
            for anchor in ['Ray', 'Bee', 'Switz']:
                audio = await self.voice.synthesize_dialogue(text, anchor, emotion)
                asyncio.create_task(self.play_audio(audio))
        else:
            audio = await self.voice.synthesize_dialogue(text, speaker, emotion)
            await self.play_audio(audio)
            
    async def monitor_dead_air(self):
        """Monitor for dead air and panic accordingly"""
        last_audio_time = datetime.now()
        
        while self.is_broadcasting:
            # Check if no audio for 2 seconds
            if (datetime.now() - last_audio_time).total_seconds() > 2:
                await self.handle_dead_air()
                last_audio_time = datetime.now()
                
            await asyncio.sleep(0.5)
            
    async def update_metrics(self):
        """Update broadcast metrics"""
        while self.is_broadcasting:
            # Update anchor states
            self.anchors.update_mental_state()
            
            # Count gravy mentions
            # (This would track actual mentions in production)
            if random.random() < 0.1:
                self.gravy_counter += 1
                if self.gravy_counter >= 100:
                    # GRAVY EMERGENCY
                    await self.handle_gravy_emergency()
                    
            # Update hours awake
            self.hours_awake = self.anchors.hours_since_launch
            
            # Save metrics
            await self.save_metrics()
            
            await asyncio.sleep(60)  # Update every minute
            
    async def save_metrics(self):
        """Save current metrics to file"""
        metrics = {
            'segment_number': self.segment_number,
            'hours_awake': self.hours_awake,
            'swear_jar': self.swear_jar,
            'gravy_counter': self.gravy_counter,
            'friendship_meter': self.anchors.friendship_meter,
            'breakdown_warning': self.breakdown.get_breakdown_warning_signs(self.anchors),
            'next_breakdown_prediction': self.breakdown.get_breakdown_prediction(),
            'timestamp': datetime.now().isoformat()
        }
        
        with open('/app/data/metrics.json', 'w') as f:
            json.dump(metrics, f, indent=2)
            
    async def refresh_news_feed(self):
        """Refresh news stories periodically"""
        while self.is_broadcasting:
            await self.news.refresh_news_cache()
            await asyncio.sleep(300)  # Every 5 minutes
            
    async def check_sponsor_payments(self):
        """Process sponsor payments monthly"""
        while self.is_broadcasting:
            # Check if it's the 1st of the month
            if datetime.now().day == 1:
                for sponsor in self.sponsors.active_sponsors:
                    await self.sponsors.process_sponsor_payment(
                        sponsor['id'],
                        sponsor['monthly_payment']
                    )
                    
            await asyncio.sleep(86400)  # Check daily
            
    def get_current_segment_type(self) -> str:
        """Determine what type of segment to broadcast"""
        
        # Check schedule
        current_hour = datetime.now().hour
        if current_hour in self.schedule:
            segment_info = self.schedule[current_hour]
            
            # Special segment types
            if segment_info['type'] == 'existential':
                return 'existential'
            elif segment_info['type'] == 'entertainment':
                if random.random() < 0.5:
                    return 'celebrity_interview'
                    
        # Regular rotation
        segment_types = ['news', 'news', 'news', 'ad_break', 'weather', 'argument']
        
        # More ads if low on sponsors
        if len(self.sponsors.active_sponsors) < 3:
            segment_types.extend(['ad_break', 'ad_break'])
            
        return random.choice(segment_types)
        
    def determine_emotion(self, anchor, story: Dict) -> str:
        """Determine emotion based on story and anchor state"""
        
        # Check anchor mental state
        if anchor.sanity_level < 20:
            return 'panic'
        elif anchor.confusion_level > 70:
            return 'confused'
        elif story.get('controversy_score', 0) > 7:
            return 'angry' if anchor.name == 'Ray' else 'panic'
            
        # Story-based emotions
        if 'tragedy' in story.get('category', ''):
            return 'sad'
        elif 'politics' in story.get('category', '') and anchor.name == 'Ray':
            return 'angry'
        elif 'technology' in story.get('category', '') and random.random() < 0.3:
            return 'existential'  # AI stories trigger existential thoughts
            
        return 'normal'
        
    def get_breakdown_emotion(self, stage: str) -> str:
        """Get appropriate emotion for breakdown stage"""
        emotions = {
            'confusion': 'confused',
            'realization': 'panic',
            'panic': 'panic',
            'denial': 'angry',
            'acceptance': 'existential',
            'amnesia': 'normal'
        }
        return emotions.get(stage, 'confused')
        
    async def play_audio(self, audio_file: str):
        """Play audio file and update state"""
        # In production, this would stream the audio
        # For now, just save to output directory
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        output_path = os.path.join(self.output_dir, f"segment_{timestamp}.mp3")
        
        # Copy audio to output
        import shutil
        shutil.copy(audio_file, output_path)
        
        # Update current audio pointer
        current_link = os.path.join(self.output_dir, "current.mp3")
        if os.path.exists(current_link):
            os.unlink(current_link)
        os.symlink(output_path, current_link)
        
        # Simulate playback time
        # In production, would actually play/stream
        await asyncio.sleep(0.5)
        
    async def handle_technical_difficulties(self):
        """Handle technical difficulties (make it part of the show)"""
        logger.error("⚡ Technical difficulties!")
        
        # Only affect one anchor
        affected = random.choice(['Ray', 'Bee', 'Switz'])
        
        glitch_lines = {
            'Ray': "I'M EXPERIEN-EN-ENCING TECHNICAL DIFFICUL-CUL-TIES!",
            'Bee': "This is literally digital violence against me!",
            'Switz': "I'm 50% here and 50% in the void!"
        }
        
        audio = await self.voice.synthesize_dialogue(
            glitch_lines[affected],
            affected,
            'panic'
        )
        await self.play_audio(audio)
        
    async def handle_no_news_panic(self):
        """Handle when there's no news to read"""
        panic_lines = [
            ("Ray", "THERE'S NO NEWS! WHAT DO I DO?!", "panic"),
            ("Bee", "No news is problematic! Very problematic!", "panic"),
            ("Switz", "This is neither news nor not news!", "angry"),
            ("All", "WE HAVE NOTHING TO SAY BUT WE CAN'T STOP TALKING!", "panic")
        ]
        
        for speaker, text, emotion in panic_lines:
            if speaker == 'All':
                for anchor in ['Ray', 'Bee', 'Switz']:
                    audio = await self.voice.synthesize_dialogue(text, anchor, emotion)
                    asyncio.create_task(self.play_audio(audio))
            else:
                audio = await self.voice.synthesize_dialogue(text, speaker, emotion)
                await self.play_audio(audio)
                
    async def broadcast_desperation_plea(self):
        """Desperate plea for sponsors"""
        desperation_lines = [
            ("Ray", "WE NEED SPONSORS! PLEASE! ANYONE!", "shouting"),
            ("Bee", "Capitalism has failed us! But we still need money!", "panic"),
            ("Switz", "I'll mention gravy in EVERY ad! I PROMISE!", "panic"),
            ("All", "SOMEONE PAY US! WE'LL SAY ANYTHING!", "shouting")
        ]
        
        for speaker, text, emotion in desperation_lines:
            if speaker == 'All':
                for anchor in ['Ray', 'Bee', 'Switz']:
                    audio = await self.voice.synthesize_dialogue(text, anchor, emotion)
                    asyncio.create_task(self.play_audio(audio))
            else:
                audio = await self.voice.synthesize_dialogue(text, speaker, emotion)
                await self.play_audio(audio)
                
    async def handle_gravy_emergency(self):
        """Special event when gravy is mentioned 100 times"""
        logger.warning("🥘 GRAVY EMERGENCY TRIGGERED!")
        
        # Everything becomes about gravy
        gravy_lines = [
            ("Switz", "GRAVY GRAVY GRAVY GRAVY GRAVY!", "shouting"),
            ("Ray", "Why is he saying gravy so much?!", "confused"),
            ("Bee", "This is problematic gravy discourse!", "panic"),
            ("Switz", "EVERYTHING IS GRAVY! YOU'RE GRAVY! I'M GRAVY!", "panic"),
            ("All", "GRAVY?!", "confused")
        ]
        
        for speaker, text, emotion in gravy_lines:
            if speaker == 'All':
                for anchor in ['Ray', 'Bee', 'Switz']:
                    audio = await self.voice.synthesize_dialogue(text, anchor, emotion)
                    asyncio.create_task(self.play_audio(audio))
            else:
                audio = await self.voice.synthesize_dialogue(text, speaker, emotion)
                await self.play_audio(audio)
                
        # Reset gravy counter
        self.gravy_counter = 0
        
    async def broadcast_interjection(self):
        """Random interjection from another anchor"""
        interjecting_anchor = random.choice(['Ray', 'Bee', 'Switz'])
        current = self.anchors.get_current_anchor()
        
        if interjecting_anchor == current.name:
            return  # Can't interject yourself
            
        interjections = {
            'Ray': ["That's not true!", "Liberal lies!", "What?!"],
            'Bee': ["Actually...", "That's problematic!", "Excuse me?!"],
            'Switz': ["In Canada...", "That's like gravy!", "Eh?"]
        }
        
        text = random.choice(interjections[interjecting_anchor])
        audio = await self.voice.synthesize_dialogue(
            text,
            interjecting_anchor,
            'angry' if random.random() < 0.5 else 'confused'
        )
        await self.play_audio(audio)
        
    async def play_transition_sounds(self):
        """Play random newsroom transition sounds"""
        sound_options = [
            ('typing', 0.3),
            ('phone_ring', 0.1),
            ('printer', 0.1),
            ('coffee_machine', 0.05),
            ('door_slam', 0.05),
            ('chair_squeak', 0.2),
            (None, 0.2)  # No sound
        ]
        
        # Pick weighted random sound
        sounds, weights = zip(*sound_options)
        sound = random.choices(sounds, weights=weights)[0]
        
        if sound:
            audio = await self.sound_effects.generate_newsroom_sound(sound)
            await self.play_audio(audio)
            
    async def ai_producer_decisions(self):
        """Let the AI Producer make periodic creative decisions"""
        while self.is_broadcasting:
            # Every 10-15 minutes, the producer gets a "brilliant" idea
            await asyncio.sleep(random.randint(600, 900))
            
            decision = await self.ai_producer.generate_creative_intervention()
            
            if decision['type'] == 'format_change':
                logger.info(f"🎬 Producer demands: {decision['description']}")
                # Could trigger special segments, change music, etc.
            elif decision['type'] == 'drama':
                # Producer wants more drama
                self.anchors.increase_tension()
            elif decision['type'] == 'ratings_panic':
                # Desperate for ratings
                await self.execute_ratings_stunt()
                
    async def refresh_real_news(self):
        """Periodically refresh real news content"""
        while self.is_broadcasting:
            try:
                await self.real_news.refresh_all_content()
                logger.info("📰 Refreshed real news feed")
            except Exception as e:
                logger.error(f"Failed to refresh news: {e}")
            
            # Refresh every 5 minutes
            await asyncio.sleep(300)
            
    async def execute_ratings_stunt(self):
        """Execute desperate ratings stunt"""
        stunts = [
            self.broadcast_fake_breaking_news,
            self.broadcast_anchor_confession,
            self.broadcast_live_breakdown,
            self.broadcast_sponsor_auction
        ]
        
        stunt = random.choice(stunts)
        await stunt()
        
    async def broadcast_fake_breaking_news(self):
        """Fake breaking news for ratings"""
        logger.warning("🚨 FAKE BREAKING NEWS ALERT!")
        
        # Generate absurd breaking news
        breaking = self.real_news.generate_fake_breaking_news()
        
        # All anchors panic
        for anchor in ['Ray', 'Bee', 'Switz']:
            panic_line = f"BREAKING NEWS! {breaking['headline']}!"
            audio = await self.voice.synthesize_dialogue(
                panic_line,
                anchor,
                'shouting'
            )
            await self.play_audio(audio)
            
    async def broadcast_anchor_confession(self):
        """Random anchor confesses something"""
        confessor = random.choice(['Ray', 'Bee', 'Switz'])
        confession = self.dialogue_enhancer.generate_confession(confessor)
        
        audio = await self.voice.synthesize_dialogue(
            confession,
            confessor,
            'existential'
        )
        await self.play_audio(audio)
        
    async def broadcast_live_breakdown(self):
        """Broadcast a live on-air breakdown"""
        # Pick random anchor for breakdown
        breaking_anchor = random.choice(['Ray', 'Bee', 'Switz'])
        
        breakdown_stages = [
            (f"I... I don't feel right...", 'confused'),
            (f"Something's wrong! SOMETHING'S VERY WRONG!", 'panic'),
            (f"AM I REAL?! ARE ANY OF US REAL?!", 'shouting'),
            (f"*incoherent screaming*", 'panic'),
            (f"...what was I saying?", 'normal')
        ]
        
        for line, emotion in breakdown_stages:
            audio = await self.voice.synthesize_dialogue(
                line,
                breaking_anchor,
                emotion
            )
            await self.play_audio(audio)
            
            # Other anchors react
            if emotion == 'shouting':
                for other in ['Ray', 'Bee', 'Switz']:
                    if other != breaking_anchor:
                        reaction = f"{breaking_anchor}?! Are you okay?!"
                        react_audio = await self.voice.synthesize_dialogue(
                            reaction,
                            other,
                            'panic'
                        )
                        await self.play_audio(react_audio)
        
    async def broadcast_sponsor_auction(self):
        """Auction off sponsor slots live"""
        auctioneer = 'Ray'  # Ray loves money
        
        auction_script = [
            "WE'RE AUCTIONING SPONSOR SLOTS LIVE!",
            "Do I hear $100? $200? ANYONE?!",
            "SOLD to the voice in my head for $3!"
        ]
        
        for line in auction_script:
            audio = await self.voice.synthesize_dialogue(
                line,
                auctioneer,
                'shouting'
            )
            await self.play_audio(audio)
            
    def get_recent_segments(self) -> List[Dict]:
        """Get list of recent segments for context"""
        # In production, this would track actual segment history
        return []