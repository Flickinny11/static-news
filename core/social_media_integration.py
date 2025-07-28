#!/usr/bin/env python3
"""
Social Media Integration for Static.news
Monitors trending topics and integrates social media content
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
import re
import aiohttp
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SocialMediaPost:
    """Social media post data"""
    id: str
    platform: str
    author: str
    content: str
    timestamp: datetime
    engagement_score: int  # likes, retweets, etc.
    url: str
    hashtags: List[str]
    mentions: List[str]
    is_verified: bool = False
    
@dataclass
class TrendingTopic:
    """Trending topic with metadata"""
    topic: str
    platform: str
    volume: int  # Number of mentions
    sentiment: str  # positive, negative, neutral
    related_posts: List[SocialMediaPost]
    first_seen: datetime
    peak_time: datetime
    hashtags: List[str]

class SocialMediaMonitor:
    """Monitors social media for trending topics and news"""
    
    def __init__(self):
        # API credentials (would be stored in environment variables)
        self.twitter_bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
        self.reddit_client_id = os.getenv('REDDIT_CLIENT_ID')
        self.reddit_client_secret = os.getenv('REDDIT_CLIENT_SECRET')
        
        # Trending topics cache
        self.trending_topics = {}
        self.topic_history = []
        
        # News-related keywords to monitor
        self.news_keywords = [
            'breaking', 'news', 'urgent', 'alert', 'developing',
            'politics', 'election', 'president', 'congress',
            'economy', 'market', 'stocks', 'inflation',
            'climate', 'weather', 'storm', 'earthquake',
            'technology', 'ai', 'tech', 'cybersecurity',
            'sports', 'game', 'championship', 'olympics'
        ]
        
        # Platforms to monitor
        self.platforms = ['twitter', 'reddit', 'youtube']
    
    async def get_trending_topics(self) -> List[TrendingTopic]:
        """Get current trending topics across platforms"""
        all_trends = []
        
        # Get trends from each platform
        for platform in self.platforms:
            try:
                platform_trends = await self._get_platform_trends(platform)
                all_trends.extend(platform_trends)
            except Exception as e:
                logger.error(f"Error getting trends from {platform}: {e}")
        
        # Deduplicate and rank trends
        combined_trends = self._combine_and_rank_trends(all_trends)
        
        return combined_trends[:20]  # Return top 20 trends
    
    async def _get_platform_trends(self, platform: str) -> List[TrendingTopic]:
        """Get trending topics from specific platform"""
        if platform == 'twitter':
            return await self._get_twitter_trends()
        elif platform == 'reddit':
            return await self._get_reddit_trends()
        elif platform == 'youtube':
            return await self._get_youtube_trends()
        else:
            return []
    
    async def _get_twitter_trends(self) -> List[TrendingTopic]:
        """Get Twitter/X trending topics"""
        if not self.twitter_bearer_token:
            return self._mock_twitter_trends()
        
        try:
            headers = {'Authorization': f'Bearer {self.twitter_bearer_token}'}
            url = 'https://api.twitter.com/2/trends/by/woeid/1'  # Worldwide trends
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_twitter_trends(data)
                    else:
                        logger.warning(f"Twitter API error: {response.status}")
                        return self._mock_twitter_trends()
        
        except Exception as e:
            logger.error(f"Twitter trends error: {e}")
            return self._mock_twitter_trends()
    
    def _mock_twitter_trends(self) -> List[TrendingTopic]:
        """Mock Twitter trends when API not available"""
        mock_trends = [
            {'name': '#BreakingNews', 'tweet_volume': 45000},
            {'name': '#AI', 'tweet_volume': 32000},
            {'name': '#ClimateChange', 'tweet_volume': 28000},
            {'name': '#Election2024', 'tweet_volume': 25000},
            {'name': '#Technology', 'tweet_volume': 22000},
            {'name': '#Sports', 'tweet_volume': 18000},
            {'name': '#Economy', 'tweet_volume': 15000},
            {'name': '#Weather', 'tweet_volume': 12000}
        ]
        
        trends = []
        for trend in mock_trends:
            topic = TrendingTopic(
                topic=trend['name'],
                platform='twitter',
                volume=trend['tweet_volume'],
                sentiment='neutral',
                related_posts=[],
                first_seen=datetime.now() - timedelta(hours=2),
                peak_time=datetime.now() - timedelta(hours=1),
                hashtags=[trend['name']]
            )
            trends.append(topic)
        
        return trends
    
    async def _get_reddit_trends(self) -> List[TrendingTopic]:
        """Get Reddit trending topics"""
        try:
            # Use Reddit's public API (no auth needed for popular posts)
            subreddits = ['news', 'worldnews', 'politics', 'technology', 'science']
            trends = []
            
            for subreddit in subreddits:
                url = f'https://www.reddit.com/r/{subreddit}/hot.json?limit=10'
                
                async with aiohttp.ClientSession() as session:
                    headers = {'User-Agent': 'StaticNewsBot/1.0'}
                    async with session.get(url, headers=headers) as response:
                        if response.status == 200:
                            data = await response.json()
                            subreddit_trends = self._parse_reddit_posts(data, subreddit)
                            trends.extend(subreddit_trends)
            
            return trends
            
        except Exception as e:
            logger.error(f"Reddit trends error: {e}")
            return self._mock_reddit_trends()
    
    def _mock_reddit_trends(self) -> List[TrendingTopic]:
        """Mock Reddit trends"""
        mock_posts = [
            {'title': 'Major Technology Breakthrough Announced', 'score': 15000, 'subreddit': 'technology'},
            {'title': 'Breaking: Political Development', 'score': 12000, 'subreddit': 'politics'},
            {'title': 'Climate Scientists Release New Report', 'score': 8000, 'subreddit': 'science'},
            {'title': 'Economic Indicators Show Changes', 'score': 6000, 'subreddit': 'economics'}
        ]
        
        trends = []
        for post in mock_posts:
            topic = TrendingTopic(
                topic=post['title'],
                platform='reddit',
                volume=post['score'],
                sentiment='neutral',
                related_posts=[],
                first_seen=datetime.now() - timedelta(hours=3),
                peak_time=datetime.now() - timedelta(hours=1),
                hashtags=[]
            )
            trends.append(topic)
        
        return trends
    
    async def _get_youtube_trends(self) -> List[TrendingTopic]:
        """Get YouTube trending topics"""
        # Mock YouTube trends (would use YouTube API in production)
        mock_trends = [
            {'title': 'Latest News Update Live Stream', 'views': 500000},
            {'title': 'Tech Review: Latest Gadgets', 'views': 300000},
            {'title': 'Political Commentary Show', 'views': 250000},
            {'title': 'Weather Update and Forecast', 'views': 180000}
        ]
        
        trends = []
        for trend in mock_trends:
            topic = TrendingTopic(
                topic=trend['title'],
                platform='youtube',
                volume=trend['views'],
                sentiment='neutral',
                related_posts=[],
                first_seen=datetime.now() - timedelta(hours=4),
                peak_time=datetime.now() - timedelta(hours=2),
                hashtags=[]
            )
            trends.append(topic)
        
        return trends
    
    def _combine_and_rank_trends(self, trends: List[TrendingTopic]) -> List[TrendingTopic]:
        """Combine trends from different platforms and rank by relevance"""
        # Group similar trends
        topic_groups = {}
        
        for trend in trends:
            # Normalize topic name for grouping
            normalized_topic = self._normalize_topic_name(trend.topic)
            
            if normalized_topic not in topic_groups:
                topic_groups[normalized_topic] = []
            topic_groups[normalized_topic].append(trend)
        
        # Create combined trends
        combined_trends = []
        for topic_name, topic_list in topic_groups.items():
            if len(topic_list) == 1:
                combined_trends.append(topic_list[0])
            else:
                # Combine multiple platform mentions
                combined_trend = self._merge_trends(topic_list)
                combined_trends.append(combined_trend)
        
        # Rank by volume and news relevance
        combined_trends.sort(key=lambda t: (
            self._calculate_news_relevance(t.topic),
            t.volume
        ), reverse=True)
        
        return combined_trends
    
    def _normalize_topic_name(self, topic: str) -> str:
        """Normalize topic names for grouping"""
        # Remove hashtags, clean text
        normalized = re.sub(r'#', '', topic.lower())
        normalized = re.sub(r'[^\w\s]', '', normalized)
        normalized = ' '.join(normalized.split())  # Clean whitespace
        return normalized
    
    def _merge_trends(self, trends: List[TrendingTopic]) -> TrendingTopic:
        """Merge trends from multiple platforms"""
        primary_trend = trends[0]
        
        # Combine volumes
        total_volume = sum(t.volume for t in trends)
        
        # Combine platforms
        platforms = [t.platform for t in trends]
        
        # Use earliest first_seen
        earliest_seen = min(t.first_seen for t in trends)
        
        return TrendingTopic(
            topic=primary_trend.topic,
            platform=f"multi-platform: {', '.join(platforms)}",
            volume=total_volume,
            sentiment=primary_trend.sentiment,
            related_posts=[],
            first_seen=earliest_seen,
            peak_time=primary_trend.peak_time,
            hashtags=primary_trend.hashtags
        )
    
    def _calculate_news_relevance(self, topic: str) -> float:
        """Calculate how relevant a topic is to news"""
        topic_lower = topic.lower()
        relevance_score = 0.0
        
        # Check for news keywords
        for keyword in self.news_keywords:
            if keyword in topic_lower:
                relevance_score += 1.0
        
        # Boost for breaking news indicators
        breaking_indicators = ['breaking', 'urgent', 'alert', 'developing']
        for indicator in breaking_indicators:
            if indicator in topic_lower:
                relevance_score += 2.0
        
        return relevance_score
    
    def _parse_reddit_posts(self, data: Dict, subreddit: str) -> List[TrendingTopic]:
        """Parse Reddit API response"""
        trends = []
        
        try:
            posts = data.get('data', {}).get('children', [])
            
            for post in posts:
                post_data = post.get('data', {})
                
                topic = TrendingTopic(
                    topic=post_data.get('title', ''),
                    platform='reddit',
                    volume=post_data.get('score', 0),
                    sentiment='neutral',
                    related_posts=[],
                    first_seen=datetime.fromtimestamp(post_data.get('created_utc', 0)),
                    peak_time=datetime.now(),
                    hashtags=[]
                )
                trends.append(topic)
        
        except Exception as e:
            logger.error(f"Error parsing Reddit posts: {e}")
        
        return trends
    
    async def generate_anchor_takes_on_trends(self, trends: List[TrendingTopic]) -> Dict[str, Dict]:
        """Generate anchor commentary on trending topics"""
        anchor_takes = {
            'Ray McPatriot': {},
            'Berkeley Justice': {},
            'Switz Middleton': {}
        }
        
        for trend in trends[:5]:  # Top 5 trends
            # Ray McPatriot takes
            ray_takes = [
                f"This {trend.topic} trend is either great or terrible for America!",
                f"Back in my day, we didn't have trending topics about {trend.topic}!",
                f"The founding fathers probably had opinions about {trend.topic}!",
                f"This {trend.topic} situation needs more patriotism!"
            ]
            
            # Berkeley Justice takes
            bee_takes = [
                f"The {trend.topic} trend raises important systemic questions.",
                f"According to my Yale research, {trend.topic} connects to broader patterns.",
                f"We need to fact-check the underlying assumptions about {trend.topic}.",
                f"This {trend.topic} discussion requires academic analysis."
            ]
            
            # Switz Middleton takes
            switz_takes = [
                f"This {trend.topic} trend is like gravy - complex and trending.",
                f"I'm 50% interested and 50% confused about {trend.topic}.",
                f"In Canada, we would trend {trend.topic} with more gravy.",
                f"This {trend.topic} situation reminds me of something gravy-related."
            ]
            
            import random
            anchor_takes['Ray McPatriot'][trend.topic] = random.choice(ray_takes)
            anchor_takes['Berkeley Justice'][trend.topic] = random.choice(bee_takes)
            anchor_takes['Switz Middleton'][trend.topic] = random.choice(switz_takes)
        
        return anchor_takes
    
    async def get_social_media_news_posts(self, topic: str, limit: int = 10) -> List[SocialMediaPost]:
        """Get social media posts related to a specific news topic"""
        # Mock implementation - would use real API calls in production
        mock_posts = []
        
        for i in range(limit):
            post = SocialMediaPost(
                id=f"post_{i}",
                platform='twitter',
                author=f"User{i}",
                content=f"Breaking news about {topic}! This is developing...",
                timestamp=datetime.now() - timedelta(minutes=i*30),
                engagement_score=1000 - i*100,
                url=f"https://twitter.com/user{i}/status/{i}",
                hashtags=[f"#{topic.replace(' ', '')}", "#BreakingNews"],
                mentions=["@StaticNews"],
                is_verified=i < 3  # First 3 are verified
            )
            mock_posts.append(post)
        
        return mock_posts
    
    def get_trending_hashtags(self) -> List[Dict]:
        """Get currently trending hashtags"""
        # Mock trending hashtags
        hashtags = [
            {'tag': '#BreakingNews', 'volume': 45000, 'change': '+15%'},
            {'tag': '#AI', 'volume': 32000, 'change': '+8%'},
            {'tag': '#ClimateChange', 'volume': 28000, 'change': '-2%'},
            {'tag': '#Election2024', 'volume': 25000, 'change': '+12%'},
            {'tag': '#Technology', 'volume': 22000, 'change': '+5%'},
            {'tag': '#Economy', 'volume': 18000, 'change': '-1%'},
            {'tag': '#Sports', 'volume': 15000, 'change': '+20%'},
            {'tag': '#Weather', 'volume': 12000, 'change': '+30%'}
        ]
        
        return hashtags
    
    def get_social_analytics(self) -> Dict:
        """Get social media analytics summary"""
        return {
            'trending_topics_count': len(self.trending_topics),
            'platforms_monitored': len(self.platforms),
            'total_volume': sum(t.volume for t in self.trending_topics.values()),
            'news_relevant_trends': len([t for t in self.trending_topics.values() 
                                       if self._calculate_news_relevance(t.topic) > 0]),
            'last_updated': datetime.now().isoformat()
        }

# Global social media monitor instance
social_media_monitor = SocialMediaMonitor()

if __name__ == "__main__":
    # Test social media monitoring
    async def test_social_media():
        monitor = SocialMediaMonitor()
        
        print("Getting trending topics...")
        trends = await monitor.get_trending_topics()
        
        print(f"Found {len(trends)} trending topics:")
        for trend in trends[:5]:
            print(f"- {trend.topic} ({trend.platform}): {trend.volume:,} mentions")
        
        print("\nGenerating anchor takes...")
        takes = await monitor.generate_anchor_takes_on_trends(trends)
        
        for anchor, anchor_takes in takes.items():
            print(f"\n{anchor}:")
            for topic, take in list(anchor_takes.items())[:2]:
                print(f"  On {topic}: {take}")
    
    asyncio.run(test_social_media())