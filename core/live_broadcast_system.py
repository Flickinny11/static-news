#!/usr/bin/env python3
"""
Live Broadcast System for Static.news
Handles real-time audio/video generation and streaming
"""

import asyncio
import json
import logging
import os
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import threading
import queue
import tempfile
from dataclasses import dataclass

# Audio processing imports
try:
    import gtts
    import pydub
    from pydub import AudioSegment
    from pydub.playback import play
    import io
    HAS_AUDIO = True
except ImportError:
    HAS_AUDIO = False
    logging.warning("Audio libraries not available. Using mock audio.")

from .news_aggregator import NewsAggregator, NewsArticle, WeatherService, SportsService
from .programming_schedule import ProgrammingSchedule, Show, ShowType
# Simplified anchor personality for broadcast system
class AnchorPersonality:
    def __init__(self, name: str):
        self.name = name

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class BroadcastSegment:
    """Individual broadcast segment"""
    content: str
    duration_seconds: int
    segment_type: str  # news, weather, sports, commentary, ad
    anchor: str
    timestamp: datetime
    audio_file: Optional[str] = None
    urgency: str = "normal"

class AudioGenerator:
    """Generates audio content for broadcasts"""
    
    def __init__(self):
        self.voice_settings = {
            'Ray McPatriot': {'speed': 0.9, 'pitch': -20},  # Slower, lower
            'Berkeley Justice': {'speed': 1.1, 'pitch': 10},  # Faster, higher  
            'Switz Middleton': {'speed': 1.0, 'pitch': 0}    # Normal
        }
        self.temp_dir = tempfile.mkdtemp()
    
    async def generate_speech(self, text: str, anchor: str) -> Optional[str]:
        """Generate speech audio for text"""
        if not HAS_AUDIO:
            return self._mock_audio_generation(text, anchor)
        
        try:
            # Use Google TTS as fallback
            voice_map = {
                'Ray McPatriot': 'en-us',
                'Berkeley Justice': 'en-us', 
                'Switz Middleton': 'en-ca'  # Canadian accent
            }
            
            tts = gtts.gTTS(text=text, lang=voice_map.get(anchor, 'en-us'), slow=False)
            
            # Save to temporary file
            audio_file = os.path.join(self.temp_dir, f"{anchor}_{datetime.now().timestamp()}.mp3")
            tts.save(audio_file)
            
            # Apply voice modifications
            audio = AudioSegment.from_mp3(audio_file)
            settings = self.voice_settings.get(anchor, {})
            
            if 'speed' in settings and settings['speed'] != 1.0:
                audio = audio.speedup(playback_speed=settings['speed'])
            
            if 'pitch' in settings and settings['pitch'] != 0:
                # Simple pitch adjustment
                new_sample_rate = int(audio.frame_rate * (1 + settings['pitch'] / 100))
                audio = audio._spawn(audio.raw_data, overrides={"frame_rate": new_sample_rate})
                audio = audio.set_frame_rate(44100)
            
            # Save modified audio
            modified_file = audio_file.replace('.mp3', '_modified.mp3')
            audio.export(modified_file, format="mp3")
            
            return modified_file
            
        except Exception as e:
            logger.error(f"Audio generation failed: {e}")
            return self._mock_audio_generation(text, anchor)
    
    def _mock_audio_generation(self, text: str, anchor: str) -> str:
        """Mock audio generation when libraries unavailable"""
        duration = len(text) * 0.05  # Rough estimate: 50ms per character
        mock_file = f"mock_audio_{anchor}_{datetime.now().timestamp()}.mp3"
        
        # Create a simple mock metadata file
        with open(mock_file + ".meta", 'w') as f:
            json.dump({
                'text': text,
                'anchor': anchor,
                'duration': duration,
                'mock': True
            }, f)
        
        return mock_file
    
    def add_background_music(self, audio_file: str, music_type: str = "news") -> str:
        """Add background music to audio"""
        if not HAS_AUDIO:
            return audio_file
        
        try:
            # Load main audio
            main_audio = AudioSegment.from_mp3(audio_file)
            
            # Create simple background tone (in production, use real music files)
            if music_type == "breaking":
                # Urgent tone
                bg_freq = 440  # A note
                bg_volume = -30  # dB
            elif music_type == "weather":
                # Calm tone
                bg_freq = 330  # E note
                bg_volume = -35
            else:
                # Standard news tone
                bg_freq = 394  # G note
                bg_volume = -35
            
            # Generate background tone
            background = AudioSegment.silent(duration=len(main_audio))
            # In production, load actual music files here
            
            # Mix audio
            mixed = main_audio.overlay(background)
            
            # Save mixed audio
            mixed_file = audio_file.replace('.mp3', '_mixed.mp3')
            mixed.export(mixed_file, format="mp3")
            
            return mixed_file
            
        except Exception as e:
            logger.error(f"Background music failed: {e}")
            return audio_file

class ContentGenerator:
    """Generates broadcast content from news and schedule"""
    
    def __init__(self):
        self.news_aggregator = NewsAggregator()
        self.weather_service = WeatherService()
        self.sports_service = SportsService()
        self.anchor_personalities = {
            'Ray McPatriot': AnchorPersonality('Ray McPatriot'),
            'Berkeley Justice': AnchorPersonality('Berkeley Justice'),
            'Switz Middleton': AnchorPersonality('Switz Middleton')
        }
    
    async def generate_news_segment(self, anchor: str, duration_minutes: int = 5) -> BroadcastSegment:
        """Generate a news segment"""
        # Get recent news
        articles = await self.news_aggregator.fetch_all_news()
        top_articles = articles[:3]  # Top 3 stories
        
        # Generate anchor introduction
        intro = self._generate_news_intro(anchor, top_articles)
        
        # Generate story summaries with anchor personality
        content_parts = [intro]
        
        for i, article in enumerate(top_articles):
            story_summary = self._generate_story_summary(article, anchor)
            anchor_take = self._generate_anchor_commentary(article, anchor)
            
            content_parts.extend([
                f"\nOur {['top', 'second', 'third'][i]} story tonight...",
                story_summary,
                anchor_take
            ])
        
        # Add transitions and outros
        outro = self._generate_news_outro(anchor)
        content_parts.append(outro)
        
        full_content = " ".join(content_parts)
        estimated_duration = len(full_content) * 0.5  # Rough estimate: 2 characters per second
        
        return BroadcastSegment(
            content=full_content,
            duration_seconds=int(estimated_duration),
            segment_type="news",
            anchor=anchor,
            timestamp=datetime.now()
        )
    
    async def generate_weather_segment(self, anchor: str = "Switz Middleton") -> BroadcastSegment:
        """Generate weather segment"""
        cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]
        weather_data = []
        
        for city in cities[:3]:  # Get weather for 3 cities
            weather = await self.weather_service.get_current_weather(city)
            weather_data.append(weather)
        
        content_parts = [
            f"Now let's check on the weather. I'm {anchor}, and somehow everything reminds me of gravy."
        ]
        
        for weather in weather_data:
            if anchor == "Switz Middleton":
                weather_text = f"In {weather['city']}, it's {weather['temperature']} degrees with {weather['description']}. "
                weather_text += f"That's like... {weather['temperature']} degrees of gravy warmth. "
                weather_text += f"Wind speeds at {weather['wind_speed']} mph - perfect for gravy boat sailing."
            else:
                weather_text = f"In {weather['city']}, {weather['temperature']} degrees, {weather['description']}. "
                weather_text += f"Feels like {weather['feels_like']} degrees with {weather['humidity']}% humidity."
            
            content_parts.append(weather_text)
        
        content_parts.append("And that's your weather update. Stay warm, stay dry, and stay... gravylicious?")
        
        full_content = " ".join(content_parts)
        
        return BroadcastSegment(
            content=full_content,
            duration_seconds=90,  # Weather segments typically 90 seconds
            segment_type="weather",
            anchor=anchor,
            timestamp=datetime.now()
        )
    
    async def generate_sports_segment(self, anchor: str = "Ray McPatriot") -> BroadcastSegment:
        """Generate sports segment"""
        scores = await self.sports_service.get_latest_scores()
        
        content_parts = [
            f"Time for sports! This is {anchor}, and I think I understand what's happening in these games."
        ]
        
        for game in scores:
            if anchor == "Ray McPatriot":
                game_text = f"In {game['sport']}, the {game['home_team']} "
                if game['home_score'] > game['away_score']:
                    game_text += f"defeated the {game['away_team']} {game['home_score']} to {game['away_score']}. "
                    game_text += "That's what I call American victory! Even if one team isn't American! "
                else:
                    game_text += f"lost to the {game['away_team']} {game['away_score']} to {game['home_score']}. "
                    game_text += "Sometimes freedom means losing gracefully! Or something! "
            else:
                game_text = f"{game['away_team']} vs {game['home_team']}: {game['away_score']}-{game['home_score']}, {game['status']}. "
            
            content_parts.append(game_text)
        
        content_parts.append("And that's sports! I may not understand the rules, but I understand PASSION!")
        
        full_content = " ".join(content_parts)
        
        return BroadcastSegment(
            content=full_content,
            duration_seconds=60,  # Sports segments typically 60 seconds
            segment_type="sports", 
            anchor=anchor,
            timestamp=datetime.now()
        )
    
    async def generate_breaking_news(self, article: NewsArticle, anchor: str) -> BroadcastSegment:
        """Generate breaking news segment"""
        content_parts = [
            "We interrupt our regular programming for this breaking news alert.",
            f"This is {anchor} with urgent information."
        ]
        
        # Breaking news summary
        breaking_summary = f"We're receiving reports that {article.summary}"
        
        # Anchor reaction based on personality
        if anchor == "Ray McPatriot":
            reaction = "This is either very good or very bad for America! I'm not sure which!"
        elif anchor == "Berkeley Justice":
            reaction = "According to my analysis, this raises serious questions about systemic issues."
        else:  # Switz
            reaction = "This is like gravy - complex and I'm 50% concerned about it."
        
        content_parts.extend([breaking_summary, reaction])
        content_parts.append("We'll continue to monitor this story and bring you updates as they develop.")
        
        full_content = " ".join(content_parts)
        
        return BroadcastSegment(
            content=full_content,
            duration_seconds=120,  # Breaking news: 2 minutes
            segment_type="breaking_news",
            anchor=anchor,
            timestamp=datetime.now(),
            urgency="breaking"
        )
    
    def _generate_news_intro(self, anchor: str, articles: List[NewsArticle]) -> str:
        """Generate news segment introduction"""
        current_time = datetime.now()
        
        intros = {
            'Ray McPatriot': [
                f"Good evening, I'm Ray McPatriot, and it's {current_time.strftime('%I:%M %p')} on this patriotic evening.",
                "Tonight, the news is confusing, but my commitment to America is not!",
                "Let's dive into today's stories, which I will definitely understand correctly."
            ],
            'Berkeley Justice': [
                f"Good evening. Berkeley Justice here at {current_time.strftime('%I:%M %p')}.",
                "Tonight we examine the stories that matter, through the lens of rigorous fact-checking.",
                "Our top stories tonight require careful analysis and proper citations."
            ],
            'Switz Middleton': [
                f"Evening everyone. It's {current_time.strftime('%I:%M %p')}, and I'm Switz Middleton.",
                "Tonight's news is like a bowl of gravy - thick, complex, and somehow Canadian.",
                "Let's neutrally examine these stories that may or may not be important."
            ]
        }
        
        return " ".join(intros.get(anchor, ["Good evening, and welcome to the news."]))
    
    def _generate_story_summary(self, article: NewsArticle, anchor: str) -> str:
        """Generate story summary with anchor personality"""
        base_summary = f"{article.title}. {article.summary}"
        
        # Add anchor-specific modifications
        if anchor == "Ray McPatriot":
            # Add patriotic confusion
            base_summary += " This definitely affects America somehow!"
        elif anchor == "Berkeley Justice":
            # Add fact-checking uncertainty
            base_summary += " According to my research... which I definitely did correctly."
        else:  # Switz
            # Add gravy references
            base_summary += " This situation is like gravy in many ways."
        
        return base_summary
    
    def _generate_anchor_commentary(self, article: NewsArticle, anchor: str) -> str:
        """Generate anchor commentary on story"""
        commentaries = {
            'Ray McPatriot': [
                "This is why I love/hate this country!",
                "The founding fathers probably had opinions about this!",
                "This reminds me of something patriotic!",
                "Is this good for America? I think it might be!"
            ],
            'Berkeley Justice': [
                "This story requires deeper investigation into systemic causes.",
                "The data suggests a pattern that warrants academic examination.",
                "This intersects with multiple social justice frameworks.",
                "My Yale education definitely prepared me to analyze this."
            ],
            'Switz Middleton': [
                "This is 50% concerning and 50% not concerning.",
                "In Canada, we would handle this with more gravy.",
                "I'm neutrally observing this situation with mild interest.",
                "This reminds me of something gravy-related."
            ]
        }
        
        options = commentaries.get(anchor, ["Interesting development."])
        return random.choice(options)
    
    def _generate_news_outro(self, anchor: str) -> str:
        """Generate news segment conclusion"""
        outros = {
            'Ray McPatriot': "That's tonight's news! Stay patriotic, stay confused, and we'll see you next hour!",
            'Berkeley Justice': "That concludes our fact-checked analysis. Remember to question everything, including this broadcast.",
            'Switz Middleton': "And that's the news, served with a side of gravy. Stay neutral, everyone."
        }
        
        return outros.get(anchor, "Thank you for watching. We'll be right back.")

class LiveBroadcastSystem:
    """Main live broadcast system coordinator"""
    
    def __init__(self):
        self.programming_schedule = ProgrammingSchedule()
        self.content_generator = ContentGenerator()
        self.audio_generator = AudioGenerator()
        self.broadcast_queue = queue.Queue()
        self.is_broadcasting = False
        self.current_segment = None
        self.breaking_news_override = False
        
    async def start_broadcast(self):
        """Start the live broadcast system"""
        self.is_broadcasting = True
        logger.info("Live broadcast system started")
        
        # Start the main broadcast loop
        await self._broadcast_loop()
    
    async def _broadcast_loop(self):
        """Main broadcast loop"""
        while self.is_broadcasting:
            try:
                # Check for breaking news
                if self.breaking_news_override:
                    await self._handle_breaking_news()
                    continue
                
                # Get current show from schedule
                current_show, slot = self.programming_schedule.get_current_show()
                
                # Generate content for current show
                segment = await self._generate_show_content(current_show)
                
                # Generate audio for segment
                if segment:
                    audio_file = await self.audio_generator.generate_speech(
                        segment.content, segment.anchor
                    )
                    segment.audio_file = audio_file
                    
                    # Broadcast the segment
                    await self._broadcast_segment(segment)
                
                # Wait before next segment (typically 5-15 minutes)
                await asyncio.sleep(300)  # 5 minutes between segments
                
            except Exception as e:
                logger.error(f"Broadcast loop error: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying
    
    async def _generate_show_content(self, show: Show) -> Optional[BroadcastSegment]:
        """Generate content based on current show"""
        try:
            if show.show_type == ShowType.MORNING_SHOW:
                return await self.content_generator.generate_news_segment(show.anchor, 10)
            elif show.show_type == ShowType.NEWS_HOUR:
                return await self.content_generator.generate_news_segment(show.anchor, 5)
            elif show.show_type == ShowType.WEATHER:
                return await self.content_generator.generate_weather_segment(show.anchor)
            elif show.show_type == ShowType.SPORTS:
                return await self.content_generator.generate_sports_segment(show.anchor)
            elif show.show_type == ShowType.EVENING_NEWS:
                return await self.content_generator.generate_news_segment(show.anchor, 8)
            else:
                # Default to news segment
                return await self.content_generator.generate_news_segment(show.anchor, 5)
                
        except Exception as e:
            logger.error(f"Content generation error: {e}")
            return None
    
    async def _broadcast_segment(self, segment: BroadcastSegment):
        """Broadcast a segment"""
        self.current_segment = segment
        
        logger.info(f"Broadcasting: {segment.segment_type} with {segment.anchor}")
        logger.info(f"Content preview: {segment.content[:100]}...")
        
        # In production, this would stream to audio endpoints
        # For now, just log the broadcast
        
        # Add to broadcast queue for frontend consumption
        self.broadcast_queue.put({
            'type': segment.segment_type,
            'anchor': segment.anchor,
            'content': segment.content,
            'timestamp': segment.timestamp.isoformat(),
            'duration': segment.duration_seconds,
            'audio_file': segment.audio_file,
            'urgency': segment.urgency
        })
    
    async def _handle_breaking_news(self):
        """Handle breaking news override"""
        # Get breaking news
        breaking_articles = await self.content_generator.news_aggregator.get_breaking_news()
        
        if breaking_articles:
            # Choose available anchor
            available_anchors = ['Ray McPatriot', 'Berkeley Justice', 'Switz Middleton']
            anchor = random.choice(available_anchors)
            
            # Generate breaking news segment
            segment = await self.content_generator.generate_breaking_news(
                breaking_articles[0], anchor
            )
            
            # Generate audio and broadcast
            audio_file = await self.audio_generator.generate_speech(
                segment.content, segment.anchor
            )
            segment.audio_file = audio_file
            
            await self._broadcast_segment(segment)
        
        # Clear breaking news override
        self.breaking_news_override = False
    
    def trigger_breaking_news(self):
        """Trigger breaking news override"""
        self.breaking_news_override = True
        logger.info("Breaking news override triggered")
    
    def get_current_broadcast_info(self) -> Dict[str, Any]:
        """Get current broadcast information"""
        current_show, slot = self.programming_schedule.get_current_show()
        
        return {
            'current_show': {
                'name': current_show.name,
                'anchor': current_show.anchor,
                'description': current_show.description,
                'start_time': slot.start_time.strftime('%H:%M'),
                'end_time': slot.end_time.strftime('%H:%M')
            },
            'current_segment': {
                'type': self.current_segment.segment_type if self.current_segment else 'transition',
                'anchor': self.current_segment.anchor if self.current_segment else 'none',
                'duration_remaining': 0  # Would calculate based on start time
            } if self.current_segment else None,
            'breaking_news_active': self.breaking_news_override,
            'is_live': self.is_broadcasting,
            'last_updated': datetime.now().isoformat()
        }
    
    def stop_broadcast(self):
        """Stop the broadcast system"""
        self.is_broadcasting = False
        logger.info("Live broadcast system stopped")

# Global broadcast system instance
live_broadcast_system = LiveBroadcastSystem()

if __name__ == "__main__":
    # Test the broadcast system
    async def test_broadcast():
        system = LiveBroadcastSystem()
        
        # Generate a test news segment
        segment = await system.content_generator.generate_news_segment("Ray McPatriot")
        print(f"Generated segment: {segment.content[:200]}...")
        
        # Generate audio (will be mock if libraries not available)
        audio_file = await system.audio_generator.generate_speech(
            "This is a test broadcast from Static.news!", "Ray McPatriot"
        )
        print(f"Generated audio: {audio_file}")
        
        # Get current broadcast info
        info = system.get_current_broadcast_info()
        print(f"Current show: {info['current_show']['name']}")
    
    asyncio.run(test_broadcast())