#!/usr/bin/env python3
"""
Real News Processor
Fetches actual news, stock data, and economic indicators
Then hilariously misinterprets them through our anchors' lens
"""

import asyncio
import aiohttp
import feedparser
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import yfinance as yf
import random
import json
import logging

logger = logging.getLogger(__name__)

class RealNewsProcessor:
    """Processes real news into comedic gold"""
    
    def __init__(self):
        self.news_sources = [
            "http://feeds.bbci.co.uk/news/rss.xml",
            "http://rss.cnn.com/rss/cnn_topstories.rss",
            "https://feeds.npr.org/1001/rss.xml",
            "https://www.theonion.com/rss",  # For when reality isn't absurd enough
            "https://feeds.reuters.com/reuters/topNews",
            "https://www.reddit.com/r/nottheonion/.rss"  # Real news that sounds fake
        ]
        
        self.stock_tickers = ["SPY", "AAPL", "TSLA", "GME", "META", "GOOGL", "AMC", "NVDA"]
        self.crypto_tickers = ["BTC-USD", "ETH-USD", "DOGE-USD"]
        
        # Cache for fresh content
        self.news_cache = []
        self.stock_cache = {}
        self.last_refresh = None
        
    async def refresh_all_content(self):
        """Refresh all news and market data"""
        await asyncio.gather(
            self.fetch_breaking_news(),
            self.fetch_market_data(),
            self.fetch_trending_topics(),
            self.fetch_weather_somewhere()
        )
        self.last_refresh = datetime.now()
        
    async def fetch_breaking_news(self) -> List[Dict]:
        """Fetch real breaking news"""
        all_news = []
        
        async with aiohttp.ClientSession() as session:
            for source in self.news_sources:
                try:
                    async with session.get(source, timeout=5) as response:
                        content = await response.text()
                        feed = feedparser.parse(content)
                        
                        for entry in feed.entries[:5]:  # Top 5 from each
                            news_item = {
                                'title': entry.title,
                                'summary': entry.get('summary', ''),
                                'link': entry.link,
                                'published': entry.get('published', ''),
                                'source': feed.feed.get('title', 'Unknown'),
                                'category': self._categorize_news(entry.title),
                                'controversy_score': self._calculate_controversy(entry.title),
                                'misinterpretation_potential': random.randint(1, 10)
                            }
                            all_news.append(news_item)
                            
                except Exception as e:
                    logger.error(f"Error fetching from {source}: {e}")
                    
        # Sort by controversy and recency
        all_news.sort(key=lambda x: x['controversy_score'], reverse=True)
        self.news_cache = all_news[:20]  # Keep top 20
        
        return self.news_cache
        
    async def fetch_market_data(self) -> Dict:
        """Fetch real stock market data"""
        market_data = {}
        
        try:
            # Get stock data
            for ticker in self.stock_tickers:
                stock = yf.Ticker(ticker)
                info = stock.info
                history = stock.history(period="1d")
                
                if not history.empty:
                    current_price = history['Close'].iloc[-1]
                    change = history['Close'].iloc[-1] - history['Open'].iloc[0]
                    change_percent = (change / history['Open'].iloc[0]) * 100
                    
                    market_data[ticker] = {
                        'price': current_price,
                        'change': change,
                        'change_percent': change_percent,
                        'volume': history['Volume'].iloc[-1],
                        'name': info.get('longName', ticker),
                        'meme_stock': ticker in ['GME', 'AMC'],
                        'anchor_interpretation': self._generate_market_interpretation(ticker, change_percent)
                    }
                    
            # Get crypto data
            for crypto in self.crypto_tickers:
                crypto_ticker = yf.Ticker(crypto)
                history = crypto_ticker.history(period="1d")
                
                if not history.empty:
                    market_data[crypto] = {
                        'price': history['Close'].iloc[-1],
                        'change_percent': ((history['Close'].iloc[-1] - history['Open'].iloc[0]) / history['Open'].iloc[0]) * 100,
                        'is_crypto': True,
                        'confusion_level': random.randint(8, 10)  # Crypto always confuses them
                    }
                    
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            
        self.stock_cache = market_data
        return market_data
        
    async def fetch_trending_topics(self) -> List[str]:
        """Fetch trending topics from social media"""
        # In production, would use Twitter/Reddit APIs
        # For now, generate plausible trending topics
        
        trending_templates = [
            "#{word}IsOverParty",
            "#{word}Gate", 
            "Why{word}",
            "{word}Challenge",
            "Breaking: {word}",
            "JUST IN: {word}"
        ]
        
        current_events = ["AI", "Climate", "Election", "Viral", "Breaking", "Shocking"]
        trending = []
        
        for _ in range(10):
            template = random.choice(trending_templates)
            word = random.choice(current_events)
            trending.append(template.format(word=word))
            
        return trending
        
    async def fetch_weather_somewhere(self) -> Dict:
        """Fetch weather from random location"""
        # In production, would use weather API
        # For now, generate plausible weather
        
        locations = [
            "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
            "Timbuktu", "Antarctica", "The Moon", "Your Mom's House", "Canada"
        ]
        
        location = random.choice(locations)
        temp = random.randint(-20, 120)
        
        conditions = ["Sunny", "Cloudy", "Raining", "Snowing", "Apocalyptic", 
                     "Suspiciously Normal", "Gravy", "Existential"]
        
        return {
            'location': location,
            'temperature': temp,
            'condition': random.choice(conditions),
            'humidity': random.randint(0, 100),
            'wind': random.randint(0, 100),
            'uv_index': random.randint(0, 15),
            'anchor_panic_level': random.randint(1, 10)
        }
        
    def _categorize_news(self, title: str) -> str:
        """Categorize news for anchor assignment"""
        title_lower = title.lower()
        
        if any(word in title_lower for word in ['trump', 'republican', 'conservative', 'patriot']):
            return 'ray_territory'
        elif any(word in title_lower for word in ['climate', 'social', 'protest', 'rights']):
            return 'bee_territory'
        elif any(word in title_lower for word in ['canada', 'neutral', 'both sides']):
            return 'switz_territory'
        else:
            return 'general_chaos'
            
    def _calculate_controversy(self, title: str) -> int:
        """Calculate how controversial a story is"""
        controversy_words = [
            'slams', 'destroys', 'shocking', 'breaking', 'urgent',
            'controversy', 'scandal', 'exposed', 'leaked', 'bombshell'
        ]
        
        score = 0
        title_lower = title.lower()
        
        for word in controversy_words:
            if word in title_lower:
                score += 2
                
        # All caps words add to controversy
        caps_words = len([w for w in title.split() if w.isupper() and len(w) > 2])
        score += caps_words
        
        return min(score, 10)
        
    def _generate_market_interpretation(self, ticker: str, change: float) -> Dict:
        """Generate anchor-specific market interpretations"""
        
        interpretations = {
            'Ray': {
                'up': f"{ticker} is up! America wins again! Take that, socialists!",
                'down': f"{ticker} is down because of woke policies!",
                'flat': f"{ticker} is flat, just like the earth! Wait, what?"
            },
            'Bee': {
                'up': f"{ticker} gains represent wealth inequality!",
                'down': f"{ticker} falls show capitalism failing!",
                'flat': f"{ticker} stagnation is systematic oppression!"
            },
            'Switz': {
                'up': f"{ticker} is up, which is neither good nor bad.",
                'down': f"{ticker} is down, which is also neither good nor bad.",
                'flat': f"{ticker} unchanged, perfectly balanced, like gravy."
            }
        }
        
        if change > 2:
            market_state = 'up'
        elif change < -2:
            market_state = 'down'
        else:
            market_state = 'flat'
            
        return {
            'Ray': interpretations['Ray'][market_state],
            'Bee': interpretations['Bee'][market_state],
            'Switz': interpretations['Switz'][market_state]
        }
        
    def prepare_segment_content(self, segment_type: str) -> Dict:
        """Prepare fresh content for any segment type"""
        
        if not self.news_cache:
            return {'error': 'No news available', 'panic': True}
            
        if segment_type == 'market_watch':
            return self._prepare_market_segment()
        elif segment_type == 'breaking_news':
            return self._prepare_breaking_segment()
        elif segment_type == 'trending_now':
            return self._prepare_trending_segment()
        elif segment_type == 'weather':
            return self._prepare_weather_segment()
        else:
            return self._prepare_general_segment()
            
    def _prepare_market_segment(self) -> Dict:
        """Prepare market segment with real data"""
        if not self.stock_cache:
            return {'title': 'Markets Closed', 'panic': True}
            
        # Pick interesting stocks
        movers = sorted(self.stock_cache.items(), 
                       key=lambda x: abs(x[1].get('change_percent', 0)), 
                       reverse=True)[:3]
        
        return {
            'title': 'Market Mayhem',
            'stocks': movers,
            'overall_sentiment': 'chaos',
            'anchor_assignments': {
                movers[0][0]: 'Ray',  # Biggest mover to Ray
                movers[1][0]: 'Bee',  # Second to Bee
                movers[2][0]: 'Switz' # Third to Switz
            },
            'confusion_points': [
                "Is money real?",
                "What's a stock?",
                "Why are numbers?",
                "Help"
            ]
        }
        
    def _prepare_breaking_segment(self) -> Dict:
        """Prepare breaking news with misinterpretations"""
        # Get most controversial story
        story = self.news_cache[0] if self.news_cache else None
        
        if not story:
            return {'title': 'No News Is Good News?', 'panic': True}
            
        return {
            'original_title': story['title'],
            'misinterpreted_title': self._misinterpret_headline(story['title']),
            'summary': story['summary'],
            'anchor_reactions': {
                'Ray': f"This is clearly a liberal conspiracy about {self._extract_keyword(story['title'])}!",
                'Bee': f"We need to unpack the problematic implications of {self._extract_keyword(story['title'])}!",
                'Switz': f"In Canada, {self._extract_keyword(story['title'])} means gravy!"
            },
            'confusion_level': story['misinterpretation_potential'],
            'follow_up_questions': [
                "But what does it mean?",
                "Are we sure this is real?",
                "Who decided this was news?",
                "Is this about us?"
            ]
        }
        
    def _misinterpret_headline(self, headline: str) -> str:
        """Hilariously misinterpret a headline"""
        words = headline.split()
        
        # Random misinterpretation strategies
        strategies = [
            lambda: ' '.join(words[::-1]),  # Reverse
            lambda: ' '.join([w[::-1] if len(w) > 4 else w for w in words]),  # Reverse long words
            lambda: headline.replace(' ', ' probably '),  # Add uncertainty
            lambda: f"{headline}? {headline}!",  # Question then exclaim
            lambda: ''.join([w[0] for w in words]) + f" ...wait, that spells {headline}"  # Acronym confusion
        ]
        
        return random.choice(strategies)()
        
    def _extract_keyword(self, text: str) -> str:
        """Extract a keyword to obsess over"""
        words = [w for w in text.split() if len(w) > 4 and w.isalpha()]
        return random.choice(words) if words else "things"