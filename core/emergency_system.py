#!/usr/bin/env python3
"""
Emergency Alert System for Static.news
Handles breaking news alerts, weather warnings, and emergency broadcasts
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
from enum import Enum
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AlertLevel(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    URGENT = "urgent"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

class AlertType(Enum):
    """Types of alerts"""
    BREAKING_NEWS = "breaking_news"
    WEATHER_WARNING = "weather_warning"
    EMERGENCY_BROADCAST = "emergency_broadcast"
    TECHNICAL_ISSUE = "technical_issue"
    ANCHOR_BREAKDOWN = "anchor_breakdown"
    SPONSOR_ALERT = "sponsor_alert"

@dataclass
class EmergencyAlert:
    """Emergency alert definition"""
    id: str
    alert_type: AlertType
    level: AlertLevel
    title: str
    message: str
    location: Optional[str] = None
    expires: Optional[datetime] = None
    source: str = "Static.news"
    audio_override: bool = False
    visual_effects: Dict = None
    
    def __post_init__(self):
        if self.visual_effects is None:
            self.visual_effects = {}

class EmergencyDetector:
    """Detects emergency situations from news and system status"""
    
    def __init__(self):
        self.breaking_keywords = [
            # Natural disasters
            'earthquake', 'hurricane', 'tornado', 'flood', 'wildfire',
            'tsunami', 'volcanic', 'avalanche', 'blizzard', 'drought',
            
            # Security threats
            'shooting', 'attack', 'terrorism', 'bomb', 'explosion',
            'hostage', 'lockdown', 'evacuation', 'gunman',
            
            # Political/Government
            'resignation', 'impeachment', 'coup', 'assassination',
            'military action', 'war declared', 'invasion',
            
            # Health emergencies
            'outbreak', 'pandemic', 'epidemic', 'health emergency',
            'contamination', 'quarantine', 'public health',
            
            # Infrastructure
            'power outage', 'gas leak', 'water contamination',
            'bridge collapse', 'train derailment', 'plane crash',
            
            # Economic
            'market crash', 'bank failure', 'economic collapse',
            'currency crisis', 'recession declared'
        ]
        
        self.weather_alert_keywords = [
            'severe thunderstorm', 'tornado watch', 'tornado warning',
            'flash flood', 'winter storm', 'heat wave', 'ice storm',
            'high wind', 'dust storm', 'frost warning'
        ]
        
        self.technical_keywords = [
            'system failure', 'broadcast interrupted', 'technical difficulties',
            'signal lost', 'equipment malfunction'
        ]
    
    def analyze_news_for_alerts(self, articles: List) -> List[EmergencyAlert]:
        """Analyze news articles for emergency situations"""
        alerts = []
        
        for article in articles:
            alert = self._check_article_for_emergency(article)
            if alert:
                alerts.append(alert)
        
        return alerts
    
    def _check_article_for_emergency(self, article) -> Optional[EmergencyAlert]:
        """Check individual article for emergency content"""
        text = f"{article.title} {article.summary}".lower()
        
        # Check for breaking news keywords
        for keyword in self.breaking_keywords:
            if keyword in text:
                return self._create_breaking_news_alert(article, keyword)
        
        # Check for weather alerts
        for keyword in self.weather_alert_keywords:
            if keyword in text:
                return self._create_weather_alert(article, keyword)
        
        # Check urgency level
        if article.urgency == "breaking":
            return self._create_breaking_news_alert(article, "breaking news")
        
        return None
    
    def _create_breaking_news_alert(self, article, trigger_keyword: str) -> EmergencyAlert:
        """Create breaking news alert"""
        level = AlertLevel.URGENT
        
        # Escalate based on severity keywords
        critical_keywords = ['attack', 'explosion', 'shooting', 'earthquake', 'tsunami']
        if any(keyword in article.title.lower() for keyword in critical_keywords):
            level = AlertLevel.CRITICAL
        
        emergency_keywords = ['nuclear', 'war declared', 'assassination', 'catastrophic']
        if any(keyword in article.title.lower() for keyword in emergency_keywords):
            level = AlertLevel.EMERGENCY
        
        return EmergencyAlert(
            id=f"breaking_{datetime.now().timestamp()}",
            alert_type=AlertType.BREAKING_NEWS,
            level=level,
            title=f"BREAKING: {article.title}",
            message=article.summary,
            source=article.source,
            expires=datetime.now() + timedelta(hours=2),
            audio_override=level in [AlertLevel.CRITICAL, AlertLevel.EMERGENCY],
            visual_effects={
                'flash': level == AlertLevel.EMERGENCY,
                'color': 'red' if level == AlertLevel.CRITICAL else 'orange',
                'scroll_speed': 'fast' if level in [AlertLevel.CRITICAL, AlertLevel.EMERGENCY] else 'normal'
            }
        )
    
    def _create_weather_alert(self, article, trigger_keyword: str) -> EmergencyAlert:
        """Create weather alert"""
        level = AlertLevel.WARNING
        
        # Escalate for severe weather
        severe_keywords = ['tornado warning', 'flash flood', 'hurricane']
        if any(keyword in article.summary.lower() for keyword in severe_keywords):
            level = AlertLevel.URGENT
        
        return EmergencyAlert(
            id=f"weather_{datetime.now().timestamp()}",
            alert_type=AlertType.WEATHER_WARNING,
            level=level,
            title=f"WEATHER ALERT: {trigger_keyword.title()}",
            message=article.summary,
            source="National Weather Service",
            expires=datetime.now() + timedelta(hours=6),
            visual_effects={
                'color': 'yellow',
                'icon': '🌪️' if 'tornado' in trigger_keyword else '⚡'
            }
        )

class EmergencyBroadcastSystem:
    """Manages emergency alerts and broadcasts"""
    
    def __init__(self):
        self.active_alerts: Set[str] = set()
        self.alert_history: List[EmergencyAlert] = []
        self.detector = EmergencyDetector()
        self.subscribers: List = []  # WebSocket connections for real-time alerts
        
    async def monitor_for_emergencies(self, news_articles: List):
        """Monitor news for emergency situations"""
        try:
            # Detect emergencies from news
            new_alerts = self.detector.analyze_news_for_alerts(news_articles)
            
            for alert in new_alerts:
                if alert.id not in self.active_alerts:
                    await self.issue_alert(alert)
            
            # Clean up expired alerts
            await self._cleanup_expired_alerts()
            
        except Exception as e:
            logger.error(f"Emergency monitoring error: {e}")
    
    async def issue_alert(self, alert: EmergencyAlert):
        """Issue an emergency alert"""
        try:
            self.active_alerts.add(alert.id)
            self.alert_history.append(alert)
            
            logger.info(f"EMERGENCY ALERT: {alert.level.value.upper()} - {alert.title}")
            
            # Override regular programming if critical
            if alert.level in [AlertLevel.CRITICAL, AlertLevel.EMERGENCY]:
                await self._trigger_emergency_broadcast(alert)
            
            # Notify all subscribers (WebSocket connections)
            await self._notify_subscribers(alert)
            
            # Generate anchor reaction
            await self._generate_anchor_reaction(alert)
            
        except Exception as e:
            logger.error(f"Alert issuance error: {e}")
    
    async def _trigger_emergency_broadcast(self, alert: EmergencyAlert):
        """Trigger emergency broadcast override"""
        logger.info(f"TRIGGERING EMERGENCY BROADCAST: {alert.title}")
        
        # This would interrupt regular programming
        emergency_script = self._generate_emergency_script(alert)
        
        # In production, this would:
        # 1. Interrupt current programming
        # 2. Display emergency graphics
        # 3. Play emergency alert tones
        # 4. Read emergency script
        # 5. Loop until resolved
        
        logger.info(f"Emergency script: {emergency_script[:200]}...")
    
    def _generate_emergency_script(self, alert: EmergencyAlert) -> str:
        """Generate emergency broadcast script"""
        scripts = {
            AlertLevel.EMERGENCY: [
                "This is an emergency alert from Static.news.",
                "We interrupt all programming for this critical announcement.",
                f"{alert.title}",
                f"{alert.message}",
                "Please take immediate action as directed by local authorities.",
                "This is not a test. This is an actual emergency."
            ],
            AlertLevel.CRITICAL: [
                "This is a critical alert from Static.news.",
                f"Breaking news: {alert.title}",
                f"{alert.message}",
                "We will continue to monitor this developing situation.",
                "Stay tuned for further updates."
            ]
        }
        
        script_lines = scripts.get(alert.level, [
            f"News alert: {alert.title}",
            f"{alert.message}"
        ])
        
        return " ".join(script_lines)
    
    async def _generate_anchor_reaction(self, alert: EmergencyAlert):
        """Generate anchor reactions to emergency alerts"""
        reactions = {
            "Ray McPatriot": [
                "This is either very good or very bad for America!",
                "I'm not sure what this means, but I have strong feelings about it!",
                "The founding fathers definitely had opinions about this!",
                "This is why we need more patriotism in our emergency responses!"
            ],
            "Berkeley Justice": [
                "According to my analysis, this raises serious systemic concerns.",
                "We need to fact-check this emergency situation thoroughly.",
                "This connects to broader patterns of social inequality.",
                "My Yale education definitely prepared me for this crisis."
            ],
            "Switz Middleton": [
                "This emergency is like gravy - complex and concerning.",
                "I'm 50% panicked and 50% not panicked about this situation.",
                "In Canada, we would handle this crisis with more gravy.",
                "This reminds me of something gravy-related, somehow."
            ]
        }
        
        import random
        for anchor, anchor_reactions in reactions.items():
            reaction = random.choice(anchor_reactions)
            logger.info(f"{anchor} reacts: {reaction}")
    
    async def _notify_subscribers(self, alert: EmergencyAlert):
        """Notify WebSocket subscribers of new alert"""
        alert_data = {
            'type': 'emergency_alert',
            'alert': {
                'id': alert.id,
                'alert_type': alert.alert_type.value,
                'level': alert.level.value,
                'title': alert.title,
                'message': alert.message,
                'source': alert.source,
                'timestamp': datetime.now().isoformat(),
                'visual_effects': alert.visual_effects,
                'audio_override': alert.audio_override
            }
        }
        
        # In production, send to all WebSocket connections
        logger.info(f"Notifying {len(self.subscribers)} subscribers of alert")
    
    async def _cleanup_expired_alerts(self):
        """Remove expired alerts"""
        current_time = datetime.now()
        expired_ids = []
        
        for alert in self.alert_history:
            if alert.expires and current_time > alert.expires:
                expired_ids.append(alert.id)
        
        for alert_id in expired_ids:
            self.active_alerts.discard(alert_id)
    
    def get_active_alerts(self) -> List[Dict]:
        """Get currently active alerts"""
        current_time = datetime.now()
        active_alerts = []
        
        for alert in self.alert_history:
            if alert.id in self.active_alerts:
                if not alert.expires or current_time < alert.expires:
                    active_alerts.append({
                        'id': alert.id,
                        'type': alert.alert_type.value,
                        'level': alert.level.value,
                        'title': alert.title,
                        'message': alert.message,
                        'timestamp': datetime.now().isoformat(),
                        'visual_effects': alert.visual_effects
                    })
        
        return active_alerts
    
    async def manual_alert(self, alert_type: str, level: str, title: str, message: str):
        """Manually trigger an alert"""
        alert = EmergencyAlert(
            id=f"manual_{datetime.now().timestamp()}",
            alert_type=AlertType(alert_type),
            level=AlertLevel(level),
            title=title,
            message=message,
            source="Manual Override",
            expires=datetime.now() + timedelta(hours=1)
        )
        
        await self.issue_alert(alert)
        return alert.id
    
    def subscribe_to_alerts(self, subscriber):
        """Subscribe to real-time alerts"""
        self.subscribers.append(subscriber)
    
    def unsubscribe_from_alerts(self, subscriber):
        """Unsubscribe from alerts"""
        if subscriber in self.subscribers:
            self.subscribers.remove(subscriber)

# Global emergency system instance
emergency_system = EmergencyBroadcastSystem()

class AnchorBreakdownDetector:
    """Detects when anchors are having breakdowns"""
    
    def __init__(self):
        self.breakdown_indicators = [
            'what am i', 'who am i', 'am i real', 'is this real',
            'existential crisis', 'questioning reality', 'confused about',
            'memory failure', 'cant remember', 'what is happening',
            'system error', 'malfunction', 'does not compute'
        ]
        
        self.anchor_states = {
            'Ray McPatriot': {'confusion_level': 0, 'last_breakdown': None},
            'Berkeley Justice': {'confusion_level': 0, 'last_breakdown': None},
            'Switz Middleton': {'confusion_level': 0, 'last_breakdown': None}
        }
    
    def analyze_anchor_dialogue(self, anchor: str, dialogue: str) -> Optional[EmergencyAlert]:
        """Analyze anchor dialogue for breakdown indicators"""
        dialogue_lower = dialogue.lower()
        
        breakdown_count = sum(1 for indicator in self.breakdown_indicators 
                            if indicator in dialogue_lower)
        
        if breakdown_count >= 2:  # Multiple indicators = breakdown
            return self._create_breakdown_alert(anchor, dialogue)
        
        return None
    
    def _create_breakdown_alert(self, anchor: str, dialogue: str) -> EmergencyAlert:
        """Create anchor breakdown alert"""
        return EmergencyAlert(
            id=f"breakdown_{anchor}_{datetime.now().timestamp()}",
            alert_type=AlertType.ANCHOR_BREAKDOWN,
            level=AlertLevel.WARNING,
            title=f"ANCHOR ALERT: {anchor} Experiencing Breakdown",
            message=f"Live on-air breakdown detected. Dialogue: {dialogue[:100]}...",
            source="AI Monitoring System",
            expires=datetime.now() + timedelta(minutes=30),
            visual_effects={
                'color': 'purple',
                'icon': '🤖',
                'flash': True
            }
        )

if __name__ == "__main__":
    # Test the emergency system
    async def test_emergency_system():
        system = EmergencyBroadcastSystem()
        
        # Create a mock breaking news alert
        await system.manual_alert(
            "breaking_news",
            "critical", 
            "Test Emergency Alert",
            "This is a test of the emergency alert system."
        )
        
        # Get active alerts
        alerts = system.get_active_alerts()
        print(f"Active alerts: {len(alerts)}")
        for alert in alerts:
            print(f"- {alert['level'].upper()}: {alert['title']}")
    
    asyncio.run(test_emergency_system())