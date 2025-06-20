#!/usr/bin/env python3
"""
Real news fetching and biased interpretation system
Pulls from real sources, spins it through our confused anchors
"""

import asyncio
import aiohttp
import feedparser
from bs4 import BeautifulSoup
import random
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
import os

logger = logging.getLogger(__name__)

class NewsProcessor:
    """Fetches real news and prepares it for our confused anchors"""
    
    def __init__(self):
        self.news_api_key = os.getenv('NEWS_API_KEY', 'demo-key')
        
        # Real news sources (RSS feeds that don't require API keys)
        self.news_sources = [
            {
                'name': 'AP News',
                'url': 'https://feeds.apnews.com/rss/topnews',
                'bias': 'neutral'
            },
            {
                'name': 'Reuters',
                'url': 'https://feeds.reuters.com/reuters/topNews',
                'bias': 'neutral'
            },
            {
                'name': 'BBC',
                'url': 'https://feeds.bbci.co.uk/news/rss.xml',
                'bias': 'slight_left'
            },
            {
                'name': 'CNN',
                'url': 'https://rss.cnn.com/rss/cnn_topstories.rss',
                'bias': 'left'
            },
            {
                'name': 'Fox News',
                'url': 'https://moxie.foxnews.com/google-publisher/latest.xml',
                'bias': 'right'
            },
            {
                'name': 'NPR',
                'url': 'https://feeds.npr.org/1001/rss.xml',
                'bias': 'left'
            },
            {
                'name': 'The Guardian',
                'url': 'https://www.theguardian.com/us/rss',
                'bias': 'left'
            }
        ]
        
        # Categories for segment organization
        self.categories = [
            'politics', 'economy', 'technology', 'health',
            'entertainment', 'sports', 'world', 'science'
        ]
        
        # Story cache to avoid repeats
        self.recent_stories = []
        self.used_stories = set()
        
    async def fetch_latest_news(self) -> List[Dict]:
        """Fetch latest news from all sources"""
        all_news = []
        
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch_from_source(session, source) for source in self.news_sources]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, list):
                    all_news.extend(result)
                    
        # Sort by timestamp and remove duplicates
        all_news = self.deduplicate_news(all_news)
        
        # Categorize stories
        for story in all_news:
            story['category'] = self.categorize_story(story)
            story['controversy_score'] = self.calculate_controversy(story)
            
        # Sort by controversy (more controversial = more entertaining)
        all_news.sort(key=lambda x: x['controversy_score'], reverse=True)
        
        return all_news[:50]  # Top 50 stories
        
    async def fetch_from_source(self, session: aiohttp.ClientSession, source: Dict) -> List[Dict]:
        """Fetch news from a single source"""
        try:
            async with session.get(source['url'], timeout=10) as response:
                content = await response.text()
                
            feed = feedparser.parse(content)
            stories = []
            
            for entry in feed.entries[:10]:  # Max 10 per source
                story = {
                    'id': entry.get('id', entry.get('link', '')),
                    'title': entry.get('title', ''),
                    'summary': entry.get('summary', ''),
                    'link': entry.get('link', ''),
                    'source': source['name'],
                    'source_bias': source['bias'],
                    'published': entry.get('published', datetime.now().isoformat()),
                    'raw_text': entry.get('title', '') + ' ' + entry.get('summary', '')
                }
                
                # Clean HTML from summary
                if story['summary']:
                    soup = BeautifulSoup(story['summary'], 'html.parser')
                    story['summary'] = soup.get_text()[:500]
                    
                stories.append(story)
                
            return stories
            
        except Exception as e:
            logger.error(f"Error fetching from {source['name']}: {e}")
            return []
            
    def deduplicate_news(self, news_list: List[Dict]) -> List[Dict]:
        """Remove duplicate stories"""
        seen_titles = set()
        unique_news = []
        
        for story in news_list:
            # Create a normalized title for comparison
            normalized_title = ''.join(story['title'].lower().split())[:50]
            
            if normalized_title not in seen_titles and story['id'] not in self.used_stories:
                seen_titles.add(normalized_title)
                unique_news.append(story)
                
        return unique_news
        
    def categorize_story(self, story: Dict) -> str:
        """Categorize a news story"""
        text = (story['title'] + ' ' + story['summary']).lower()
        
        category_keywords = {
            'politics': ['president', 'congress', 'election', 'politician', 'government', 'senate', 'vote'],
            'economy': ['economy', 'market', 'stock', 'dollar', 'inflation', 'job', 'unemployment'],
            'technology': ['tech', 'ai', 'computer', 'internet', 'software', 'app', 'silicon valley'],
            'health': ['health', 'covid', 'vaccine', 'disease', 'hospital', 'doctor', 'medical'],
            'entertainment': ['movie', 'actor', 'singer', 'celebrity', 'film', 'music', 'hollywood'],
            'sports': ['game', 'player', 'team', 'score', 'championship', 'athlete', 'sports'],
            'world': ['country', 'international', 'global', 'nation', 'foreign', 'war', 'peace'],
            'science': ['science', 'research', 'study', 'space', 'nasa', 'discovery', 'climate']
        }
        
        scores = {}
        for category, keywords in category_keywords.items():
            scores[category] = sum(1 for keyword in keywords if keyword in text)
            
        # Return category with highest score
        if max(scores.values()) > 0:
            return max(scores, key=scores.get)
        return 'general'
        
    def calculate_controversy(self, story: Dict) -> float:
        """Calculate how controversial/entertaining a story might be"""
        text = story['raw_text'].lower()
        
        # Controversial keywords
        controversy_keywords = [
            'scandal', 'shocking', 'breaking', 'emergency', 'crisis',
            'slam', 'blast', 'destroy', 'chaos', 'panic', 'fear',
            'war', 'conflict', 'debate', 'controversy', 'accusation',
            'arrest', 'crash', 'explosion', 'disaster', 'tragedy'
        ]
        
        # Political figures (always controversial for our anchors)
        political_figures = [
            'trump', 'biden', 'obama', 'clinton', 'sanders',
            'republican', 'democrat', 'liberal', 'conservative'
        ]
        
        score = 0
        
        # Base controversy from keywords
        score += sum(2 for keyword in controversy_keywords if keyword in text)
        score += sum(3 for figure in political_figures if figure in text)
        
        # Source bias adds to controversy
        if story['source_bias'] in ['left', 'right']:
            score += 2
            
        # Recent stories are more controversial
        try:
            published = datetime.fromisoformat(story['published'].replace('Z', '+00:00'))
            hours_old = (datetime.now() - published).total_seconds() / 3600
            if hours_old < 2:
                score += 3
            elif hours_old < 6:
                score += 2
            elif hours_old < 12:
                score += 1
        except:
            pass
            
        return min(score, 10)  # Max score of 10
        
    def get_segment_stories(self, category: str = None, count: int = 3) -> List[Dict]:
        """Get stories for a specific segment"""
        available_stories = [
            s for s in self.recent_stories 
            if s['id'] not in self.used_stories
        ]
        
        if category:
            available_stories = [
                s for s in available_stories 
                if s['category'] == category
            ]
            
        # Sort by controversy
        available_stories.sort(key=lambda x: x['controversy_score'], reverse=True)
        
        selected = available_stories[:count]
        
        # Mark as used
        for story in selected:
            self.used_stories.add(story['id'])
            
        return selected
        
    def get_breaking_news(self) -> Optional[Dict]:
        """Get the most controversial/breaking story"""
        available = [
            s for s in self.recent_stories 
            if s['id'] not in self.used_stories
        ]
        
        if not available:
            return None
            
        # Get highest controversy score
        breaking = max(available, key=lambda x: x['controversy_score'])
        
        if breaking['controversy_score'] >= 5:  # High enough to interrupt
            self.used_stories.add(breaking['id'])
            return breaking
            
        return None
        
    async def refresh_news_cache(self):
        """Refresh the news cache"""
        logger.info("🔄 Refreshing news cache...")
        
        new_stories = await self.fetch_latest_news()
        
        # Keep some recent stories but prioritize new ones
        self.recent_stories = new_stories + self.recent_stories[:20]
        
        # Clear old used stories
        if len(self.used_stories) > 100:
            self.used_stories.clear()
            
        logger.info(f"📰 Cached {len(self.recent_stories)} stories")
        
    def prepare_story_for_anchor(self, story: Dict, anchor_name: str) -> Dict:
        """Prepare a story with anchor-specific notes"""
        prepared = story.copy()
        
        # Add pronunciation challenges
        difficult_words = self.find_difficult_words(story['title'])
        prepared['pronunciation_challenges'] = difficult_words
        
        # Add bias notes based on anchor
        if anchor_name == "Ray":
            prepared['talking_points'] = [
                "This is probably a liberal conspiracy",
                "The mainstream media is hiding something",
                "This wouldn't happen in Texas"
            ]
        elif anchor_name == "Bee":
            prepared['talking_points'] = [
                "This is problematic",
                "We need to unpack this",
                "Check your privilege"
            ]
        else:  # Switz
            prepared['talking_points'] = [
                "I'm 50% concerned about this",
                "This is like gravy",
                "In Canada, we handle this differently"
            ]
            
        return prepared
        
    def find_difficult_words(self, text: str) -> List[str]:
        """Find words that anchors will struggle with"""
        words = text.split()
        difficult = []
        
        # Long words
        difficult.extend([w for w in words if len(w) > 10])
        
        # Specific challenging words
        challenging = [
            'nuclear', 'algorithm', 'infrastructure', 'pharmaceutical',
            'constitutional', 'environmental', 'technological', 'international'
        ]
        
        for word in words:
            if any(challenge in word.lower() for challenge in challenging):
                difficult.append(word)
                
        return list(set(difficult))[:3]  # Max 3 per story