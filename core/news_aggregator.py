#!/usr/bin/env python3
"""
Real News Aggregation System for Static.news
Fetches and processes real news from multiple sources
"""

import feedparser
import requests
import json
import re
from datetime import datetime, timedelta
import asyncio
import aiohttp
from typing import List, Dict, Optional
import logging
from dataclasses import dataclass
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class NewsArticle:
    """Structured news article"""
    title: str
    summary: str
    content: str
    category: str
    source: str
    url: str
    published: datetime
    urgency: str = "normal"  # breaking, urgent, normal, low
    location: Optional[str] = None
    tags: List[str] = None

class NewsAggregator:
    """Aggregates real news from multiple sources"""
    
    def __init__(self):
        self.news_sources = {
            # Major News Sources
            'reuters': 'http://feeds.reuters.com/reuters/topNews',
            'ap': 'https://feeds.feedburner.com/ap/national',
            'npr': 'https://feeds.npr.org/1001/rss.xml',
            'bbc': 'http://feeds.bbci.co.uk/news/world/rss.xml',
            
            # Category-specific feeds
            'reuters_business': 'http://feeds.reuters.com/reuters/businessNews',
            'reuters_tech': 'http://feeds.reuters.com/reuters/technologyNews',
            'reuters_world': 'http://feeds.reuters.com/reuters/worldNews',
            'ap_politics': 'https://feeds.feedburner.com/ap/politics',
            
            # Weather (NOAA)
            'weather_alerts': 'https://alerts.weather.gov/cap/us.php?x=1',
            
            # Sports
            'espn': 'https://www.espn.com/espn/rss/news',
        }
        
        self.breaking_keywords = [
            'breaking', 'urgent', 'alert', 'emergency', 'crisis',
            'explosion', 'earthquake', 'hurricane', 'tornado',
            'shooting', 'attack', 'killed', 'dead', 'injured',
            'resign', 'fired', 'arrested', 'indicted', 'verdict'
        ]
        
        self.categories = {
            'politics': ['election', 'congress', 'senate', 'president', 'vote', 'campaign'],
            'business': ['stocks', 'market', 'economy', 'gdp', 'inflation', 'fed'],
            'technology': ['ai', 'tech', 'apple', 'google', 'microsoft', 'tesla'],
            'sports': ['game', 'score', 'championship', 'playoffs', 'season'],
            'weather': ['storm', 'hurricane', 'tornado', 'flood', 'snow', 'heat'],
            'international': ['china', 'russia', 'europe', 'ukraine', 'israel', 'middle east']
        }
    
    async def fetch_all_news(self) -> List[NewsArticle]:
        """Fetch news from all sources"""
        articles = []
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for source_name, url in self.news_sources.items():
                tasks.append(self._fetch_feed(session, source_name, url))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, list):
                    articles.extend(result)
                elif isinstance(result, Exception):
                    logger.error(f"Error fetching news: {result}")
        
        # Sort by urgency and recency
        articles.sort(key=lambda x: (
            {'breaking': 0, 'urgent': 1, 'normal': 2, 'low': 3}[x.urgency],
            x.published
        ), reverse=True)
        
        return articles[:50]  # Return top 50 articles
    
    async def _fetch_feed(self, session: aiohttp.ClientSession, source_name: str, url: str) -> List[NewsArticle]:
        """Fetch and parse RSS feed"""
        try:
            async with session.get(url, timeout=10) as response:
                content = await response.text()
                
            feed = feedparser.parse(content)
            articles = []
            
            for entry in feed.entries[:10]:  # Limit per source
                try:
                    # Parse publish date
                    published = datetime.now()
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        published = datetime(*entry.published_parsed[:6])
                    
                    # Clean and extract content
                    title = self._clean_text(entry.title)
                    summary = self._clean_text(getattr(entry, 'summary', ''))
                    content = self._clean_text(getattr(entry, 'content', [{}])[0].get('value', summary) if hasattr(entry, 'content') else summary)
                    
                    # Determine category and urgency
                    category = self._categorize_article(title + ' ' + summary)
                    urgency = self._determine_urgency(title + ' ' + summary)
                    
                    article = NewsArticle(
                        title=title,
                        summary=summary[:300] + '...' if len(summary) > 300 else summary,
                        content=content,
                        category=category,
                        source=source_name,
                        url=getattr(entry, 'link', ''),
                        published=published,
                        urgency=urgency,
                        tags=self._extract_tags(title + ' ' + summary)
                    )
                    
                    articles.append(article)
                    
                except Exception as e:
                    logger.warning(f"Error parsing article from {source_name}: {e}")
                    continue
            
            logger.info(f"Fetched {len(articles)} articles from {source_name}")
            return articles
            
        except Exception as e:
            logger.error(f"Error fetching feed {source_name}: {e}")
            return []
    
    def _clean_text(self, text: str) -> str:
        """Clean HTML and format text"""
        if not text:
            return ""
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove common feed artifacts
        text = re.sub(r'\(Reuters\)|\(AP\)|\(BBC\)', '', text)
        
        return text
    
    def _categorize_article(self, text: str) -> str:
        """Determine article category"""
        text_lower = text.lower()
        
        for category, keywords in self.categories.items():
            if any(keyword in text_lower for keyword in keywords):
                return category
        
        return 'general'
    
    def _determine_urgency(self, text: str) -> str:
        """Determine article urgency level"""
        text_lower = text.lower()
        
        # Check for breaking news indicators
        if any(keyword in text_lower for keyword in self.breaking_keywords):
            return 'breaking'
        
        # Check if very recent (within 1 hour)
        if 'minutes ago' in text_lower or 'hour ago' in text_lower:
            return 'urgent'
        
        return 'normal'
    
    def _extract_tags(self, text: str) -> List[str]:
        """Extract relevant tags from text"""
        tags = []
        text_lower = text.lower()
        
        # Political figures
        political_figures = ['biden', 'trump', 'harris', 'desantis', 'putin', 'xi']
        for figure in political_figures:
            if figure in text_lower:
                tags.append(figure.title())
        
        # Companies
        companies = ['apple', 'google', 'microsoft', 'tesla', 'amazon', 'meta']
        for company in companies:
            if company in text_lower:
                tags.append(company.title())
        
        # Countries
        countries = ['china', 'russia', 'ukraine', 'israel', 'iran', 'north korea']
        for country in countries:
            if country in text_lower:
                tags.append(country.title())
        
        return tags[:5]  # Limit tags
    
    async def get_breaking_news(self) -> List[NewsArticle]:
        """Get only breaking news articles"""
        all_articles = await self.fetch_all_news()
        return [article for article in all_articles if article.urgency == 'breaking']
    
    async def get_news_by_category(self, category: str) -> List[NewsArticle]:
        """Get news for specific category"""
        all_articles = await self.fetch_all_news()
        return [article for article in all_articles if article.category == category]

class WeatherService:
    """Real weather data integration"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('WEATHER_API_KEY')
        self.base_url = "http://api.openweathermap.org/data/2.5"
    
    async def get_current_weather(self, city: str = "New York") -> Dict:
        """Get current weather for a city"""
        if not self.api_key:
            return self._mock_weather_data(city)
        
        try:
            url = f"{self.base_url}/weather?q={city}&appid={self.api_key}&units=imperial"
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    data = await response.json()
                    
                    return {
                        'city': city,
                        'temperature': round(data['main']['temp']),
                        'feels_like': round(data['main']['feels_like']),
                        'humidity': data['main']['humidity'],
                        'description': data['weather'][0]['description'].title(),
                        'wind_speed': round(data['wind']['speed']),
                        'visibility': data.get('visibility', 0) / 1000  # Convert to miles
                    }
        except Exception as e:
            logger.error(f"Weather API error: {e}")
            return self._mock_weather_data(city)
    
    def _mock_weather_data(self, city: str) -> Dict:
        """Mock weather data when API not available"""
        import random
        return {
            'city': city,
            'temperature': random.randint(65, 85),
            'feels_like': random.randint(65, 85),
            'humidity': random.randint(40, 80),
            'description': random.choice(['Partly Cloudy', 'Sunny', 'Overcast', 'Light Rain']),
            'wind_speed': random.randint(5, 15),
            'visibility': random.randint(8, 10)
        }

class SportsService:
    """Sports scores and updates"""
    
    async def get_latest_scores(self) -> List[Dict]:
        """Get latest sports scores"""
        # Mock data - in production would use ESPN API or similar
        mock_games = [
            {
                'sport': 'NBA',
                'home_team': 'Lakers',
                'away_team': 'Warriors',
                'home_score': 112,
                'away_score': 108,
                'status': 'Final',
                'quarter': '4th'
            },
            {
                'sport': 'NFL',
                'home_team': 'Cowboys',
                'away_team': 'Giants',
                'home_score': 21,
                'away_score': 14,
                'status': 'Live',
                'quarter': '3rd'
            }
        ]
        return mock_games

# Utility functions for AI anchor integration
def generate_anchor_take(article: NewsArticle, anchor_name: str) -> str:
    """Generate AI anchor commentary on news"""
    takes = {
        'Ray McPatriot': [
            f"This {article.category} news proves what I've been saying all along!",
            f"The {article.source} is reporting this, but do they know the REAL truth?",
            f"Back in my day, we didn't have {article.category} like this!"
        ],
        'Berkeley Justice': [
            f"According to my research, this {article.category} story raises important questions about systemic issues.",
            f"The {article.source} report lacks proper fact-checking, in my professional opinion.",
            f"This reminds me of something I learned at Yale... or was it jail?"
        ],
        'Switz Middleton': [
            f"This {article.category} news is like gravy - complex and hard to understand.",
            f"I'm 50% concerned and 50% not concerned about this {article.source} report.",
            f"In Canada, we would handle this {article.category} situation with more gravy."
        ]
    }
    
    import random
    return random.choice(takes.get(anchor_name, ["Interesting news development."]))

if __name__ == "__main__":
    async def test_aggregator():
        aggregator = NewsAggregator()
        articles = await aggregator.fetch_all_news()
        print(f"Fetched {len(articles)} articles")
        
        for article in articles[:3]:
            print(f"Title: {article.title}")
            print(f"Category: {article.category}")
            print(f"Urgency: {article.urgency}")
            print(f"Source: {article.source}")
            print("---")
    
    asyncio.run(test_aggregator())