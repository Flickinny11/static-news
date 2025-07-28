#!/usr/bin/env python3
"""
Mobile Push Notification System for Static.news
Handles breaking news alerts and push notifications to mobile apps
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
import aiohttp
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PushNotification:
    """Push notification definition"""
    title: str
    body: str
    data: Dict = None
    badge: int = 1
    sound: str = "default"
    category: str = "news"
    priority: str = "normal"  # normal, high
    
    def __post_init__(self):
        if self.data is None:
            self.data = {}

class NotificationManager:
    """Manages push notifications to mobile devices"""
    
    def __init__(self):
        self.firebase_server_key = os.getenv('FIREBASE_SERVER_KEY')
        self.apns_key_id = os.getenv('APNS_KEY_ID')
        self.apns_team_id = os.getenv('APNS_TEAM_ID')
        
        # Device tokens grouped by platform
        self.device_tokens = {
            'ios': set(),
            'android': set()
        }
        
        # User preferences
        self.user_preferences = {}
        
        # Notification categories
        self.categories = {
            'breaking_news': {
                'name': 'Breaking News',
                'sound': 'breaking_news.caf',
                'priority': 'high',
                'vibrate': True
            },
            'weather_alert': {
                'name': 'Weather Alert',
                'sound': 'weather_alert.caf', 
                'priority': 'high',
                'vibrate': True
            },
            'anchor_breakdown': {
                'name': 'Anchor Breakdown',
                'sound': 'confusion.caf',
                'priority': 'normal',
                'vibrate': False
            },
            'show_update': {
                'name': 'Show Update',
                'sound': 'default',
                'priority': 'normal',
                'vibrate': False
            },
            'general': {
                'name': 'General News',
                'sound': 'default',
                'priority': 'normal',
                'vibrate': False
            }
        }
    
    async def send_breaking_news_alert(self, title: str, summary: str, article_id: str = None):
        """Send breaking news alert to all subscribers"""
        notification = PushNotification(
            title=f"🚨 BREAKING: {title}",
            body=summary,
            data={
                'type': 'breaking_news',
                'article_id': article_id,
                'url': f'staticnews://article/{article_id}' if article_id else None,
                'timestamp': datetime.now().isoformat()
            },
            category='breaking_news',
            priority='high',
            sound='breaking_news.caf'
        )
        
        await self._send_to_all_devices(notification)
        logger.info(f"Breaking news alert sent: {title}")
    
    async def send_weather_alert(self, location: str, alert_type: str, message: str):
        """Send weather alert to users in specific location"""
        notification = PushNotification(
            title=f"⚠️ Weather Alert - {location}",
            body=f"{alert_type}: {message}",
            data={
                'type': 'weather_alert',
                'location': location,
                'alert_type': alert_type,
                'timestamp': datetime.now().isoformat()
            },
            category='weather_alert',
            priority='high',
            sound='weather_alert.caf'
        )
        
        # Send to users in affected location
        await self._send_to_location(notification, location)
        logger.info(f"Weather alert sent for {location}: {alert_type}")
    
    async def send_anchor_breakdown_alert(self, anchor: str, message: str):
        """Send anchor breakdown notification"""
        anchor_emojis = {
            'Ray McPatriot': '🇺🇸',
            'Berkeley Justice': '🎓',
            'Switz Middleton': '🍁'
        }
        
        emoji = anchor_emojis.get(anchor, '🤖')
        
        notification = PushNotification(
            title=f"{emoji} {anchor} is Having a Moment",
            body=f"Live breakdown in progress: {message}",
            data={
                'type': 'anchor_breakdown',
                'anchor': anchor,
                'timestamp': datetime.now().isoformat(),
                'url': 'staticnews://live'
            },
            category='anchor_breakdown',
            priority='normal',
            sound='confusion.caf'
        )
        
        # Only send to users subscribed to breakdown alerts
        await self._send_to_subscribers('breakdown_alerts', notification)
        logger.info(f"Anchor breakdown alert sent: {anchor}")
    
    async def send_show_starting_alert(self, show_name: str, anchor: str, start_time: str):
        """Send notification when a show is starting"""
        notification = PushNotification(
            title=f"📺 {show_name} Starting Now",
            body=f"Join {anchor} for another hour of confusion",
            data={
                'type': 'show_update',
                'show_name': show_name,
                'anchor': anchor,
                'start_time': start_time,
                'url': 'staticnews://live'
            },
            category='show_update',
            priority='normal'
        )
        
        await self._send_to_subscribers('show_notifications', notification)
        logger.info(f"Show notification sent: {show_name}")
    
    async def send_custom_notification(self, title: str, body: str, category: str = 'general', 
                                     data: Dict = None, priority: str = 'normal'):
        """Send custom notification"""
        notification = PushNotification(
            title=title,
            body=body,
            data=data or {},
            category=category,
            priority=priority
        )
        
        await self._send_to_all_devices(notification)
        logger.info(f"Custom notification sent: {title}")
    
    async def _send_to_all_devices(self, notification: PushNotification):
        """Send notification to all registered devices"""
        tasks = []
        
        # Send to iOS devices
        if self.device_tokens['ios']:
            tasks.append(self._send_apns(notification, list(self.device_tokens['ios'])))
        
        # Send to Android devices
        if self.device_tokens['android']:
            tasks.append(self._send_fcm(notification, list(self.device_tokens['android'])))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _send_to_location(self, notification: PushNotification, location: str):
        """Send notification to users in specific location"""
        # Filter device tokens by location preference
        location_tokens = {
            'ios': [token for token in self.device_tokens['ios'] 
                   if self._user_in_location(token, location)],
            'android': [token for token in self.device_tokens['android'] 
                       if self._user_in_location(token, location)]
        }
        
        tasks = []
        if location_tokens['ios']:
            tasks.append(self._send_apns(notification, location_tokens['ios']))
        if location_tokens['android']:
            tasks.append(self._send_fcm(notification, location_tokens['android']))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _send_to_subscribers(self, subscription_type: str, notification: PushNotification):
        """Send notification to users subscribed to specific type"""
        subscribed_tokens = {
            'ios': [token for token in self.device_tokens['ios'] 
                   if self._user_subscribed(token, subscription_type)],
            'android': [token for token in self.device_tokens['android'] 
                       if self._user_subscribed(token, subscription_type)]
        }
        
        tasks = []
        if subscribed_tokens['ios']:
            tasks.append(self._send_apns(notification, subscribed_tokens['ios']))
        if subscribed_tokens['android']:
            tasks.append(self._send_fcm(notification, subscribed_tokens['android']))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _send_fcm(self, notification: PushNotification, tokens: List[str]):
        """Send notification via Firebase Cloud Messaging (Android)"""
        if not self.firebase_server_key:
            logger.warning("Firebase server key not configured")
            return
        
        try:
            url = "https://fcm.googleapis.com/fcm/send"
            headers = {
                'Authorization': f'key={self.firebase_server_key}',
                'Content-Type': 'application/json'
            }
            
            # Batch send to multiple tokens
            payload = {
                'registration_ids': tokens,
                'notification': {
                    'title': notification.title,
                    'body': notification.body,
                    'sound': notification.sound,
                    'badge': notification.badge
                },
                'data': notification.data,
                'priority': notification.priority,
                'android': {
                    'notification': {
                        'sound': notification.sound,
                        'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                        'channel_id': f'staticnews_{notification.category}'
                    }
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    result = await response.json()
                    
                    if response.status == 200:
                        success_count = result.get('success', 0)
                        failure_count = result.get('failure', 0)
                        logger.info(f"FCM sent: {success_count} success, {failure_count} failures")
                        
                        # Handle failed tokens
                        if 'results' in result:
                            for i, result_item in enumerate(result['results']):
                                if 'error' in result_item:
                                    # Remove invalid tokens
                                    if result_item['error'] in ['InvalidRegistration', 'NotRegistered']:
                                        self.device_tokens['android'].discard(tokens[i])
                    else:
                        logger.error(f"FCM error: {result}")
                        
        except Exception as e:
            logger.error(f"FCM send error: {e}")
    
    async def _send_apns(self, notification: PushNotification, tokens: List[str]):
        """Send notification via Apple Push Notification Service (iOS)"""
        if not self.apns_key_id or not self.apns_team_id:
            logger.warning("APNS credentials not configured")
            return
        
        try:
            # In production, would use proper APNS library with JWT authentication
            # For now, log the notification
            logger.info(f"APNS notification to {len(tokens)} iOS devices: {notification.title}")
            
            # Mock APNS response
            success_count = len(tokens)
            logger.info(f"APNS sent: {success_count} notifications")
            
        except Exception as e:
            logger.error(f"APNS send error: {e}")
    
    def register_device(self, token: str, platform: str, user_id: str = None, 
                       location: str = None, preferences: Dict = None):
        """Register device token for notifications"""
        if platform.lower() in ['ios', 'android']:
            self.device_tokens[platform.lower()].add(token)
            
            # Store user preferences
            if user_id:
                self.user_preferences[token] = {
                    'user_id': user_id,
                    'platform': platform,
                    'location': location,
                    'preferences': preferences or {},
                    'registered_at': datetime.now().isoformat()
                }
            
            logger.info(f"Device registered: {platform} - {token[:10]}...")
            return True
        
        return False
    
    def unregister_device(self, token: str):
        """Unregister device token"""
        self.device_tokens['ios'].discard(token)
        self.device_tokens['android'].discard(token)
        self.user_preferences.pop(token, None)
        logger.info(f"Device unregistered: {token[:10]}...")
    
    def update_user_preferences(self, token: str, preferences: Dict):
        """Update user notification preferences"""
        if token in self.user_preferences:
            self.user_preferences[token]['preferences'].update(preferences)
            logger.info(f"Preferences updated for {token[:10]}...")
    
    def _user_in_location(self, token: str, location: str) -> bool:
        """Check if user is in specific location"""
        user_prefs = self.user_preferences.get(token, {})
        user_location = user_prefs.get('location', '')
        return location.lower() in user_location.lower()
    
    def _user_subscribed(self, token: str, subscription_type: str) -> bool:
        """Check if user is subscribed to notification type"""
        user_prefs = self.user_preferences.get(token, {})
        preferences = user_prefs.get('preferences', {})
        return preferences.get(subscription_type, True)  # Default to subscribed
    
    def get_notification_stats(self) -> Dict:
        """Get notification system statistics"""
        return {
            'total_devices': len(self.device_tokens['ios']) + len(self.device_tokens['android']),
            'ios_devices': len(self.device_tokens['ios']),
            'android_devices': len(self.device_tokens['android']),
            'registered_users': len(self.user_preferences),
            'categories': list(self.categories.keys()),
            'last_updated': datetime.now().isoformat()
        }

# Global notification manager instance
notification_manager = NotificationManager()

# Notification templates for common scenarios
class NotificationTemplates:
    """Pre-defined notification templates"""
    
    @staticmethod
    def anchor_quote(anchor: str, quote: str) -> PushNotification:
        """Notification for memorable anchor quotes"""
        anchor_emojis = {
            'Ray McPatriot': '🇺🇸',
            'Berkeley Justice': '🎓', 
            'Switz Middleton': '🍁'
        }
        
        emoji = anchor_emojis.get(anchor, '🤖')
        
        return PushNotification(
            title=f"{emoji} Quote of the Hour",
            body=f'{anchor}: "{quote}"',
            data={
                'type': 'anchor_quote',
                'anchor': anchor,
                'quote': quote
            },
            category='general'
        )
    
    @staticmethod
    def sponsor_mention(sponsor: str, mispronunciation: str) -> PushNotification:
        """Notification when sponsor is mentioned/mispronounced"""
        return PushNotification(
            title="📢 Sponsor Mention Alert",
            body=f'{sponsor} was just mentioned as "{mispronunciation}"',
            data={
                'type': 'sponsor_mention',
                'sponsor': sponsor,
                'mispronunciation': mispronunciation
            },
            category='general'
        )
    
    @staticmethod
    def confusion_milestone(anchor: str, confusion_level: int) -> PushNotification:
        """Notification for confusion level milestones"""
        return PushNotification(
            title="🤯 Confusion Milestone",
            body=f"{anchor} has reached {confusion_level}% confusion level!",
            data={
                'type': 'confusion_milestone',
                'anchor': anchor,
                'confusion_level': confusion_level
            },
            category='anchor_breakdown'
        )

if __name__ == "__main__":
    # Test notification system
    async def test_notifications():
        manager = NotificationManager()
        
        # Register some test devices
        manager.register_device("test_ios_token", "ios", "user1", "New York", {
            'breaking_news': True,
            'weather_alerts': True,
            'breakdown_alerts': False
        })
        
        manager.register_device("test_android_token", "android", "user2", "Los Angeles", {
            'breaking_news': True,
            'weather_alerts': False,
            'breakdown_alerts': True
        })
        
        # Send test notifications
        await manager.send_breaking_news_alert(
            "Test Breaking News",
            "This is a test of the emergency notification system"
        )
        
        await manager.send_anchor_breakdown_alert(
            "Ray McPatriot",
            "Questioning the reality of his own hands"
        )
        
        # Get stats
        stats = manager.get_notification_stats()
        print(f"Notification system stats: {stats}")
    
    asyncio.run(test_notifications())