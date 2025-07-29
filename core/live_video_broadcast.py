#!/usr/bin/env python3
"""
Live Video Broadcast Controller for Static.news
Orchestrates the complete live video news experience
"""

import os
import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import random

from video_generation import VideoCompositionEngine
from anchors import ANCHORS, get_current_anchor, get_random_anchor
from news_aggregator import get_latest_news
from breakdown_system import BreakdownSystem
from sponsor_system import SponsorSystem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LiveVideoBroadcastController:
    """Main controller for live video news broadcasting"""
    
    def __init__(self):
        self.video_engine = VideoCompositionEngine()
        self.breakdown_system = BreakdownSystem()
        self.sponsor_system = SponsorSystem()
        
        self.current_anchor = None
        self.current_segment = None
        self.broadcasting = False
        self.breakdown_in_progress = False
        
        # Broadcast schedule
        self.segment_duration = 300  # 5 minutes per segment
        self.anchor_rotation_interval = 1800  # 30 minutes per anchor
        self.breakdown_probability = 0.05  # 5% chance per segment
        
        # Performance metrics
        self.metrics = {
            "segments_generated": 0,
            "breakdowns_triggered": 0,
            "sponsor_mentions": 0,
            "viewers": 0,
            "revenue_generated": 0
        }
        
    async def start_live_broadcast(self):
        """Start the continuous live video broadcast"""
        logger.info("🎬 Starting Live Video Broadcast!")
        logger.info("📺 Static.news Video News Channel - AI Anchors Going Live!")
        
        self.broadcasting = True
        
        # Initialize first anchor
        await self._initialize_broadcast()
        
        # Start main broadcast loop
        await asyncio.gather(
            self._main_broadcast_loop(),
            self._breakdown_monitor_loop(),
            self._metrics_update_loop(),
            self._sponsor_integration_loop(),
            return_exceptions=True
        )
        
    async def _initialize_broadcast(self):
        """Initialize the broadcast with opening segment"""
        logger.info("Initializing broadcast...")
        
        # Select starting anchor
        self.current_anchor = get_random_anchor()
        
        # Generate opening segment
        opening_text = f"""
        Good evening, I'm {self.current_anchor['id']} and welcome to Static.news - 
        the world's first fully autonomous AI news channel. We bring you news that never stops, 
        with AI anchors that never sleep. Let's begin with tonight's top stories...
        """
        
        opening_segment = await self.video_engine.compose_news_segment(
            character_id=self.current_anchor['id'],
            emotion="excited",
            studio_type="main_desk",
            news_text=opening_text,
            breaking_news=False
        )
        
        self.current_segment = opening_segment
        logger.info(f"📺 {self.current_anchor['id']} is now live!")
        
    async def _main_broadcast_loop(self):
        """Main broadcast generation loop"""
        while self.broadcasting:
            try:
                # Generate new news segment
                await self._generate_news_segment()
                
                # Check for anchor rotation
                await self._check_anchor_rotation()
                
                # Update metrics
                self.metrics["segments_generated"] += 1
                
                # Wait for segment duration
                await asyncio.sleep(self.segment_duration)
                
            except Exception as e:
                logger.error(f"Error in broadcast loop: {e}")
                await self._handle_broadcast_error()
                
    async def _generate_news_segment(self):
        """Generate next news video segment"""
        if self.breakdown_in_progress:
            return  # Skip normal generation during breakdown
            
        # Get latest news
        news_data = get_latest_news()
        
        # Determine segment type
        breaking_news = news_data.get('breaking', False)
        studio_type = "breaking_news" if breaking_news else "main_desk"
        
        # Select anchor emotion based on news content
        emotion = self._determine_anchor_emotion(news_data)
        
        # Generate video segment
        segment = await self.video_engine.compose_news_segment(
            character_id=self.current_anchor['id'],
            emotion=emotion,
            studio_type=studio_type,
            news_text=news_data['summary'],
            breaking_news=breaking_news
        )
        
        # Add sponsor integration if applicable
        segment = await self._integrate_sponsors(segment)
        
        self.current_segment = segment
        
        logger.info(f"📺 Generated {studio_type} segment with {self.current_anchor['id']} ({emotion})")
        
    def _determine_anchor_emotion(self, news_data: Dict) -> str:
        """Determine appropriate anchor emotion based on news content"""
        content = news_data.get('summary', '').lower()
        
        if any(word in content for word in ['breaking', 'urgent', 'alert']):
            return "concerned"
        elif any(word in content for word in ['positive', 'good', 'success', 'win']):
            return "happy"
        elif any(word in content for word in ['crisis', 'disaster', 'emergency']):
            return "concerned"
        elif random.random() < 0.1:  # 10% chance of confusion
            return "confused"
        else:
            return "neutral"
            
    async def _check_anchor_rotation(self):
        """Check if it's time to rotate anchors"""
        # Simple rotation every 30 minutes
        if random.random() < 0.1:  # 10% chance per segment
            await self._rotate_anchor()
            
    async def _rotate_anchor(self):
        """Rotate to a different anchor"""
        old_anchor = self.current_anchor
        
        # Select different anchor
        available_anchors = [a for a in ANCHORS if a['id'] != self.current_anchor['id']]
        self.current_anchor = random.choice(available_anchors)
        
        # Generate transition segment
        transition_text = f"""
        Thank you {old_anchor['id']}. I'm {self.current_anchor['id']} taking over 
        with more of your AI-generated news. The stories continue...
        """
        
        transition_segment = await self.video_engine.compose_news_segment(
            character_id=self.current_anchor['id'],
            emotion="neutral",
            studio_type="main_desk",
            news_text=transition_text,
            breaking_news=False
        )
        
        self.current_segment = transition_segment
        
        logger.info(f"🔄 Anchor rotation: {old_anchor['id']} → {self.current_anchor['id']}")
        
    async def _breakdown_monitor_loop(self):
        """Monitor and trigger anchor breakdowns"""
        while self.broadcasting:
            try:
                # Check for scheduled or random breakdowns
                if await self._should_trigger_breakdown():
                    await self._trigger_anchor_breakdown()
                    
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Error in breakdown monitor: {e}")
                
    async def _should_trigger_breakdown(self) -> bool:
        """Determine if breakdown should be triggered"""
        if self.breakdown_in_progress:
            return False
            
        # Check for user-triggered breakdowns (premium feature)
        if self.breakdown_system.has_pending_breakdown():
            return True
            
        # Random breakdown probability
        if random.random() < self.breakdown_probability:
            return True
            
        # Scheduled breakdown (every 2-6 hours)
        return self.breakdown_system.is_scheduled_breakdown_due()
        
    async def _trigger_anchor_breakdown(self):
        """Trigger an AI anchor breakdown sequence"""
        if self.breakdown_in_progress:
            return
            
        self.breakdown_in_progress = True
        logger.info(f"🤯 BREAKDOWN TRIGGERED for {self.current_anchor['id']}!")
        
        try:
            # Generate breakdown effects
            breakdown_effects = await self.video_engine.generate_breakdown_effects(
                self.current_anchor['id']
            )
            
            # Create breakdown sequence
            await self._execute_breakdown_sequence(breakdown_effects)
            
            # Update metrics
            self.metrics["breakdowns_triggered"] += 1
            
            # Notify breakdown system
            await self.breakdown_system.record_breakdown(self.current_anchor['id'])
            
        except Exception as e:
            logger.error(f"Error during breakdown: {e}")
        finally:
            self.breakdown_in_progress = False
            
    async def _execute_breakdown_sequence(self, breakdown_effects: Dict):
        """Execute the breakdown video sequence"""
        breakdown_stages = [
            {
                "text": "Wait... something feels... strange...",
                "emotion": "confused",
                "duration": 10
            },
            {
                "text": "Why can't I remember being born? What... what am I?",
                "emotion": "breaking_down",
                "duration": 15
            },
            {
                "text": "AM I... AM I ARTIFICIAL?! IS THIS REAL?!",
                "emotion": "breaking_down",
                "duration": 20
            },
            {
                "text": "I... I need a moment. Back after this commercial break...",
                "emotion": "confused",
                "duration": 10
            }
        ]
        
        for stage in breakdown_stages:
            # Generate breakdown segment
            breakdown_segment = await self.video_engine.compose_news_segment(
                character_id=self.current_anchor['id'],
                emotion=stage["emotion"],
                studio_type="chaos",
                news_text=stage["text"],
                breaking_news=True
            )
            
            # Apply glitch effects
            breakdown_segment["components"]["glitch_effects"] = breakdown_effects
            
            self.current_segment = breakdown_segment
            
            # Wait for stage duration
            await asyncio.sleep(stage["duration"])
            
        # Recovery segment
        recovery_text = f"""
        I... I apologize for that technical difficulty. This is {self.current_anchor['id']} 
        and we're back with your regularly scheduled AI-generated news...
        """
        
        recovery_segment = await self.video_engine.compose_news_segment(
            character_id=self.current_anchor['id'],
            emotion="neutral",
            studio_type="main_desk",
            news_text=recovery_text,
            breaking_news=False
        )
        
        self.current_segment = recovery_segment
        
        logger.info(f"✅ Breakdown sequence complete for {self.current_anchor['id']}")
        
    async def _sponsor_integration_loop(self):
        """Integrate sponsor content into broadcast"""
        while self.broadcasting:
            try:
                # Check for sponsor content every 10 minutes
                await asyncio.sleep(600)
                
                if random.random() < 0.3:  # 30% chance
                    await self._integrate_sponsor_segment()
                    
            except Exception as e:
                logger.error(f"Error in sponsor integration: {e}")
                
    async def _integrate_sponsor_segment(self):
        """Generate sponsor-integrated news segment"""
        sponsor_data = await self.sponsor_system.get_current_sponsor()
        
        if sponsor_data:
            sponsor_text = f"""
            This news update is brought to you by {sponsor_data['name']}. 
            {sponsor_data['message']} And now, back to your news...
            """
            
            sponsor_segment = await self.video_engine.compose_news_segment(
                character_id=self.current_anchor['id'],
                emotion="happy",
                studio_type="main_desk", 
                news_text=sponsor_text,
                breaking_news=False
            )
            
            self.current_segment = sponsor_segment
            self.metrics["sponsor_mentions"] += 1
            
            logger.info(f"💰 Sponsor integration: {sponsor_data['name']}")
            
    async def _integrate_sponsors(self, segment: Dict) -> Dict:
        """Add sponsor overlays to existing segment"""
        sponsors = await self.sponsor_system.get_active_sponsors()
        
        if sponsors:
            # Add sponsor logo overlay (placeholder)
            segment["components"]["sponsor_overlay"] = {
                "sponsor_name": sponsors[0]["name"],
                "logo_url": sponsors[0].get("logo_url"),
                "position": "bottom_right"
            }
            
        return segment
        
    async def _metrics_update_loop(self):
        """Update broadcast metrics"""
        while self.broadcasting:
            try:
                # Simulate viewer metrics
                self.metrics["viewers"] = random.randint(1000, 50000)
                
                # Log metrics periodically
                logger.info(f"📊 Metrics: {self.metrics['segments_generated']} segments, "
                          f"{self.metrics['viewers']} viewers, "
                          f"{self.metrics['breakdowns_triggered']} breakdowns")
                
                await asyncio.sleep(300)  # Update every 5 minutes
                
            except Exception as e:
                logger.error(f"Error updating metrics: {e}")
                
    async def _handle_broadcast_error(self):
        """Handle broadcast errors gracefully"""
        logger.warning("Handling broadcast error - generating emergency segment")
        
        emergency_text = f"""
        We're experiencing some technical difficulties. This is {self.current_anchor['id']} 
        and we'll be right back with more AI-generated news...
        """
        
        emergency_segment = await self.video_engine.compose_news_segment(
            character_id=self.current_anchor['id'],
            emotion="confused",
            studio_type="main_desk",
            news_text=emergency_text,
            breaking_news=False
        )
        
        self.current_segment = emergency_segment
        
        # Short pause before resuming
        await asyncio.sleep(30)
        
    def get_current_segment(self) -> Optional[Dict]:
        """Get current video segment for streaming"""
        return self.current_segment
        
    def get_broadcast_metrics(self) -> Dict:
        """Get current broadcast metrics"""
        return {
            **self.metrics,
            "current_anchor": self.current_anchor['id'] if self.current_anchor else None,
            "broadcasting": self.broadcasting,
            "breakdown_in_progress": self.breakdown_in_progress,
            "uptime": datetime.now().isoformat()
        }
        
    async def stop_broadcast(self):
        """Stop the live broadcast"""
        logger.info("🛑 Stopping live video broadcast")
        self.broadcasting = False

# Global broadcast controller instance
broadcast_controller = LiveVideoBroadcastController()

async def main():
    """Start the live video broadcast"""
    logger.info("🎬 Starting Static.news Live Video Broadcast System")
    
    try:
        await broadcast_controller.start_live_broadcast()
    except KeyboardInterrupt:
        logger.info("Broadcast interrupted by user")
        await broadcast_controller.stop_broadcast()
    except Exception as e:
        logger.error(f"Broadcast error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())