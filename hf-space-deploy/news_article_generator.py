"""
News Article Generation System for Static.news
Generates full articles with AI authors and images
"""

import json
import hashlib
import time
import requests
from datetime import datetime
import random
from typing import Dict, List, Optional
import logging
import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import feedparser

logger = logging.getLogger(__name__)

class AIAuthor:
    """Represents an AI-generated news author with portrait and background"""
    
    def __init__(self, author_id: str, name: str, bio: str, specialty: str):
        self.id = author_id
        self.name = name
        self.bio = bio
        self.specialty = specialty
        self.portrait_path = f"assets/authors/{author_id}/portrait.jpg"
        self.writing_style = self._generate_writing_style()
        
    def _generate_writing_style(self):
        """Generate unique writing characteristics for this author"""
        styles = {
            'formal': ['scholarly', 'analytical', 'methodical', 'precise'],
            'conversational': ['engaging', 'relatable', 'casual', 'direct'],
            'investigative': ['probing', 'detailed', 'thorough', 'skeptical'],
            'narrative': ['storytelling', 'descriptive', 'immersive', 'emotional']
        }
        
        # Assign primary and secondary styles
        primary = random.choice(list(styles.keys()))
        secondary = random.choice([k for k in styles.keys() if k != primary])
        
        return {
            'primary': primary,
            'secondary': secondary,
            'traits': styles[primary][:2] + styles[secondary][:1],
            'sentence_length': random.choice(['short', 'medium', 'long', 'varied']),
            'vocabulary': random.choice(['simple', 'moderate', 'advanced', 'technical'])
        }

class NewsArticleGenerator:
    """Main system for generating full news articles"""
    
    def __init__(self):
        self.authors = self._initialize_authors()
        self.categories = ['Politics', 'Technology', 'Business', 'World', 'Science', 
                          'Health', 'Entertainment', 'Sports', 'Environment']
        self.articles = []
        self.news_api_key = os.getenv('NEWS_API_KEY', '')
        self._setup_directories()
        
    def _setup_directories(self):
        """Create necessary directories for assets"""
        directories = [
            'assets/authors',
            'assets/articles',
            'assets/images',
            'data/articles',
            'data/cache'
        ]
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            
    def _initialize_authors(self) -> Dict[str, AIAuthor]:
        """Initialize a diverse set of AI news authors"""
        authors_data = [
            {
                'id': 'sarah_chen',
                'name': 'Sarah Chen',
                'bio': 'Technology correspondent with 10 years covering Silicon Valley. Stanford graduate with a passion for AI ethics and emerging tech.',
                'specialty': 'Technology'
            },
            {
                'id': 'marcus_johnson',
                'name': 'Marcus Johnson',
                'bio': 'Senior political analyst covering Washington D.C. Former campaign strategist turned journalist with insider perspective.',
                'specialty': 'Politics'
            },
            {
                'id': 'elena_rodriguez',
                'name': 'Elena Rodriguez',
                'bio': 'International correspondent reporting from conflict zones and diplomatic hotspots. Fluent in 5 languages.',
                'specialty': 'World'
            },
            {
                'id': 'david_thompson',
                'name': 'David Thompson',
                'bio': 'Business editor specializing in market analysis and corporate strategy. MBA from Wharton, CFA charterholder.',
                'specialty': 'Business'
            },
            {
                'id': 'priya_patel',
                'name': 'Dr. Priya Patel',
                'bio': 'Science and health reporter with PhD in molecular biology. Translating complex research for general audiences.',
                'specialty': 'Science'
            },
            {
                'id': 'james_wright',
                'name': 'James Wright',
                'bio': 'Environmental journalist documenting climate change impacts. Winner of the Green Journalism Award 2023.',
                'specialty': 'Environment'
            },
            {
                'id': 'sophia_kim',
                'name': 'Sophia Kim',
                'bio': 'Entertainment reporter covering Hollywood and streaming media. Former film critic for major publications.',
                'specialty': 'Entertainment'
            },
            {
                'id': 'michael_davis',
                'name': 'Michael Davis',
                'bio': 'Sports analyst and former NCAA athlete. Covering major leagues and Olympic events for over a decade.',
                'specialty': 'Sports'
            }
        ]
        
        authors = {}
        for data in authors_data:
            author = AIAuthor(**data)
            authors[data['id']] = author
            self._generate_author_portrait(author)
            
        return authors
    
    def _generate_author_portrait(self, author: AIAuthor):
        """Generate AI portrait for author"""
        # Create directory for author
        author_dir = os.path.dirname(author.portrait_path)
        os.makedirs(author_dir, exist_ok=True)
        
        # For now, create a placeholder portrait
        # In production, this would use an AI portrait generator
        img = Image.new('RGB', (400, 400), color='white')
        draw = ImageDraw.Draw(img)
        
        # Simple placeholder with initials
        initials = ''.join([n[0] for n in author.name.split()])
        
        # Background color based on specialty
        colors = {
            'Technology': (59, 130, 246),  # Blue
            'Politics': (220, 38, 38),      # Red
            'Business': (16, 185, 129),     # Green
            'World': (139, 92, 246),        # Purple
            'Science': (245, 158, 11),      # Amber
            'Environment': (34, 197, 94),   # Emerald
            'Entertainment': (236, 72, 153), # Pink
            'Sports': (251, 146, 60)        # Orange
        }
        
        bg_color = colors.get(author.specialty, (107, 114, 128))
        draw.rectangle([0, 0, 400, 400], fill=bg_color)
        
        # Add initials
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 120)
        except:
            font = None
            
        draw.text((200, 200), initials, fill='white', anchor='mm', font=font)
        
        # Save portrait
        img.save(author.portrait_path, 'JPEG', quality=95)
        logger.info(f"Generated portrait for {author.name}")
    
    def fetch_news_sources(self) -> List[Dict]:
        """Fetch news from multiple sources including News API"""
        all_stories = []
        
        # RSS Feeds (existing functionality)
        rss_sources = [
            'http://rss.cnn.com/rss/cnn_topstories.rss',
            'http://feeds.bbci.co.uk/news/world/rss.xml',
            'http://feeds.reuters.com/reuters/topNews',
            'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
            'https://feeds.npr.org/1001/rss.xml',
            'https://www.theguardian.com/world/rss',
            'http://feeds.washingtonpost.com/rss/politics',
            'https://www.politico.com/rss/congress.xml'
        ]
        
        for source in rss_sources:
            try:
                feed = feedparser.parse(source)
                for entry in feed.entries[:10]:
                    story = {
                        'id': hashlib.md5(entry.link.encode()).hexdigest(),
                        'title': entry.title,
                        'description': entry.get('summary', ''),
                        'url': entry.link,
                        'source': feed.feed.get('title', 'Unknown'),
                        'published': entry.get('published_parsed', time.gmtime()),
                        'category': self._categorize_story(entry.title, entry.get('summary', ''))
                    }
                    all_stories.append(story)
            except Exception as e:
                logger.error(f"Error fetching RSS {source}: {e}")
        
        # News API
        if self.news_api_key:
            try:
                url = 'https://newsapi.org/v2/top-headlines'
                params = {
                    'apiKey': self.news_api_key,
                    'country': 'us',
                    'pageSize': 50
                }
                response = requests.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    for article in data.get('articles', []):
                        if article.get('title') and article.get('url'):
                            story = {
                                'id': hashlib.md5(article['url'].encode()).hexdigest(),
                                'title': article['title'],
                                'description': article.get('description', ''),
                                'url': article['url'],
                                'source': article.get('source', {}).get('name', 'Unknown'),
                                'published': article.get('publishedAt', ''),
                                'category': self._categorize_story(
                                    article['title'], 
                                    article.get('description', '')
                                ),
                                'image_url': article.get('urlToImage')
                            }
                            all_stories.append(story)
            except Exception as e:
                logger.error(f"Error fetching from News API: {e}")
        
        return all_stories
    
    def _categorize_story(self, title: str, description: str) -> str:
        """Categorize story based on content"""
        text = (title + ' ' + description).lower()
        
        categories = {
            'Politics': ['election', 'president', 'congress', 'senate', 'government', 
                        'political', 'democrat', 'republican', 'vote', 'campaign'],
            'Technology': ['tech', 'ai', 'software', 'internet', 'cyber', 'apple', 
                          'google', 'microsoft', 'startup', 'innovation', 'digital'],
            'Business': ['market', 'economy', 'stocks', 'dow', 'nasdaq', 'business',
                        'company', 'ceo', 'earnings', 'finance', 'trade'],
            'World': ['international', 'global', 'foreign', 'diplomat', 'summit',
                     'united nations', 'eu', 'asia', 'europe', 'africa'],
            'Science': ['research', 'study', 'scientist', 'discovery', 'space',
                       'nasa', 'physics', 'biology', 'chemistry', 'experiment'],
            'Health': ['health', 'medical', 'doctor', 'hospital', 'disease', 'vaccine',
                      'treatment', 'fda', 'covid', 'pandemic', 'medicine'],
            'Environment': ['climate', 'environment', 'weather', 'storm', 'hurricane',
                           'global warming', 'pollution', 'renewable', 'energy'],
            'Entertainment': ['movie', 'film', 'actor', 'actress', 'hollywood', 'music',
                             'album', 'concert', 'celebrity', 'netflix', 'disney'],
            'Sports': ['game', 'player', 'team', 'score', 'championship', 'league',
                      'nfl', 'nba', 'mlb', 'soccer', 'olympics', 'athlete']
        }
        
        scores = {}
        for category, keywords in categories.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                scores[category] = score
        
        if scores:
            return max(scores, key=scores.get)
        return 'General'
    
    def analyze_importance(self, stories: List[Dict]) -> List[Dict]:
        """Analyze and rank stories by importance"""
        for story in stories:
            # Calculate importance score
            score = 0
            
            # Recency bonus
            if story.get('published'):
                try:
                    if isinstance(story['published'], str):
                        pub_time = datetime.fromisoformat(story['published'].replace('Z', '+00:00'))
                    else:
                        pub_time = datetime.fromtimestamp(time.mktime(story['published']))
                    
                    hours_old = (datetime.now() - pub_time).total_seconds() / 3600
                    if hours_old < 1:
                        score += 50
                    elif hours_old < 6:
                        score += 30
                    elif hours_old < 24:
                        score += 10
                except:
                    pass
            
            # Source credibility
            trusted_sources = ['Reuters', 'BBC', 'CNN', 'New York Times', 'NPR', 
                              'The Guardian', 'Washington Post', 'Associated Press']
            for source in trusted_sources:
                if source.lower() in story.get('source', '').lower():
                    score += 20
                    break
            
            # Breaking news keywords
            breaking_keywords = ['breaking', 'urgent', 'alert', 'exclusive', 'developing']
            title_lower = story.get('title', '').lower()
            for keyword in breaking_keywords:
                if keyword in title_lower:
                    score += 30
            
            # Category importance
            important_categories = ['Politics', 'World', 'Business', 'Health']
            if story.get('category') in important_categories:
                score += 15
            
            story['importance_score'] = score
        
        # Sort by importance
        return sorted(stories, key=lambda x: x.get('importance_score', 0), reverse=True)
    
    def generate_article(self, source_story: Dict) -> Dict:
        """Generate a full article from a news source"""
        # Select appropriate author
        author = self._select_author(source_story['category'])
        
        # Generate article content
        article = {
            'id': f"article_{source_story['id']}",
            'source_id': source_story['id'],
            'title': source_story['title'],
            'subtitle': self._generate_subtitle(source_story),
            'author': {
                'id': author.id,
                'name': author.name,
                'bio': author.bio,
                'portrait': author.portrait_path
            },
            'category': source_story['category'],
            'published': datetime.now().isoformat(),
            'updated': datetime.now().isoformat(),
            'reading_time': 0,  # Will calculate after content generation
            'content': self._generate_article_content(source_story, author),
            'summary': self._generate_summary(source_story),
            'tags': self._extract_tags(source_story),
            'sources': [
                {
                    'name': source_story['source'],
                    'url': source_story['url'],
                    'type': 'primary'
                }
            ],
            'images': self._generate_article_images(source_story),
            'related_articles': [],  # Will populate with related article IDs
            'metadata': {
                'importance_score': source_story.get('importance_score', 0),
                'original_published': source_story.get('published'),
                'generation_model': 'static-news-v1'
            }
        }
        
        # Calculate reading time (words per minute)
        word_count = len(article['content'].split())
        article['reading_time'] = max(1, round(word_count / 200))
        
        return article
    
    def _select_author(self, category: str) -> AIAuthor:
        """Select the most appropriate author for a category"""
        # First try to find specialist
        for author in self.authors.values():
            if author.specialty == category:
                return author
        
        # Otherwise select randomly for diversity
        return random.choice(list(self.authors.values()))
    
    def _generate_subtitle(self, story: Dict) -> str:
        """Generate engaging subtitle"""
        # Extract key information from description
        desc = story.get('description', '')
        if len(desc) > 100:
            # Find a good breaking point
            sentences = desc.split('.')
            if sentences:
                return sentences[0].strip() + '.'
        return desc
    
    def _generate_article_content(self, story: Dict, author: AIAuthor) -> str:
        """Generate full article content based on author style"""
        # This is a simplified version - in production would use LLM
        content = []
        
        # Lead paragraph
        lead = story.get('description', '')
        if not lead:
            lead = f"In a developing story, {story['title'].lower()}"
        content.append(lead)
        
        # Expand based on author style
        if author.writing_style['primary'] == 'investigative':
            content.append(f"\n\nThis development raises important questions about the broader implications for {story['category'].lower()} coverage.")
        elif author.writing_style['primary'] == 'narrative':
            content.append(f"\n\nThe story begins with what many are calling a pivotal moment in {story['category'].lower()}.")
        else:
            content.append(f"\n\nExperts in {story['category'].lower()} are closely monitoring this situation as it continues to develop.")
        
        # Add context paragraphs
        content.append("\n\nAccording to sources familiar with the matter, this event represents a significant shift in current trends.")
        
        # Add analysis based on category
        analysis = {
            'Politics': "Political analysts suggest this could have far-reaching consequences for upcoming legislative sessions.",
            'Technology': "Industry observers note this development could reshape the competitive landscape in the tech sector.",
            'Business': "Market watchers are evaluating the potential economic impact of these developments.",
            'World': "International relations experts are assessing how this might affect global diplomatic efforts.",
            'Science': "Researchers in the field are examining the broader implications of these findings.",
            'Health': "Medical professionals are evaluating what this means for patient care and public health policy.",
            'Environment': "Environmental scientists warn this could have lasting effects on climate patterns.",
            'Entertainment': "Industry insiders suggest this could signal a new trend in entertainment media.",
            'Sports': "Sports analysts are debating the long-term impact on competitive dynamics."
        }
        
        content.append(f"\n\n{analysis.get(story['category'], 'Experts continue to monitor this developing situation.')}")
        
        # Closing
        content.append("\n\nAs this story continues to develop, we will provide updates with the latest information and analysis.")
        
        return '\n'.join(content)
    
    def _generate_summary(self, story: Dict) -> str:
        """Generate article summary"""
        # Use description or create from title
        if story.get('description'):
            return story['description'][:200] + '...' if len(story['description']) > 200 else story['description']
        return f"Breaking news: {story['title']}"
    
    def _extract_tags(self, story: Dict) -> List[str]:
        """Extract relevant tags from story"""
        tags = [story['category']]
        
        # Extract entities and keywords (simplified)
        text = (story.get('title', '') + ' ' + story.get('description', '')).lower()
        
        # Common entities to look for
        entities = {
            'usa': ['america', 'united states', 'u.s.', 'us '],
            'china': ['china', 'beijing', 'chinese'],
            'europe': ['europe', 'eu ', 'european union'],
            'technology': ['ai ', 'artificial intelligence', 'software', 'tech '],
            'economy': ['economy', 'inflation', 'recession', 'market'],
            'climate': ['climate', 'warming', 'carbon', 'emissions']
        }
        
        for tag, keywords in entities.items():
            if any(keyword in text for keyword in keywords):
                tags.append(tag)
        
        return list(set(tags))[:5]  # Limit to 5 tags
    
    def _generate_article_images(self, story: Dict) -> List[Dict]:
        """Generate or fetch images for article"""
        images = []
        
        # Primary image
        if story.get('image_url'):
            images.append({
                'url': story['image_url'],
                'caption': f"Image related to: {story['title']}",
                'type': 'primary',
                'credit': story.get('source', 'News Source')
            })
        else:
            # Generate placeholder image
            placeholder_path = self._create_placeholder_image(story)
            images.append({
                'url': placeholder_path,
                'caption': story['title'],
                'type': 'primary',
                'credit': 'Static.news Generated'
            })
        
        return images
    
    def _create_placeholder_image(self, story: Dict) -> str:
        """Create placeholder image for article"""
        # Create image with category color
        colors = {
            'Politics': (220, 38, 38),
            'Technology': (59, 130, 246),
            'Business': (16, 185, 129),
            'World': (139, 92, 246),
            'Science': (245, 158, 11),
            'Health': (236, 72, 153),
            'Environment': (34, 197, 94),
            'Entertainment': (251, 146, 60),
            'Sports': (251, 191, 36)
        }
        
        color = colors.get(story['category'], (107, 114, 128))
        img = Image.new('RGB', (1200, 630), color=color)
        draw = ImageDraw.Draw(img)
        
        # Add text
        try:
            font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
            font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        except:
            font_large = None
            font_small = None
        
        # Category
        draw.text((60, 60), story['category'].upper(), fill='white', font=font_small)
        
        # Title (wrapped)
        title = story['title']
        if len(title) > 60:
            words = title.split()
            lines = []
            current_line = []
            for word in words:
                current_line.append(word)
                if len(' '.join(current_line)) > 40:
                    lines.append(' '.join(current_line[:-1]))
                    current_line = [word]
            if current_line:
                lines.append(' '.join(current_line))
            
            y = 250
            for line in lines[:3]:  # Max 3 lines
                draw.text((60, y), line, fill='white', font=font_large)
                y += 60
        else:
            draw.text((60, 280), title, fill='white', font=font_large)
        
        # Save
        filename = f"assets/images/placeholder_{story['id']}.jpg"
        img.save(filename, 'JPEG', quality=85)
        return filename
    
    def save_article(self, article: Dict):
        """Save article to file system"""
        # Save JSON data
        article_path = f"data/articles/{article['id']}.json"
        with open(article_path, 'w') as f:
            json.dump(article, f, indent=2)
        
        # Update article index
        self._update_article_index(article)
        
        logger.info(f"Saved article: {article['title']}")
    
    def _update_article_index(self, article: Dict):
        """Update the article index for quick access"""
        index_path = "data/articles/index.json"
        
        # Load existing index
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                index = json.load(f)
        else:
            index = {
                'articles': [],
                'categories': {},
                'authors': {}
            }
        
        # Add article to index
        article_entry = {
            'id': article['id'],
            'title': article['title'],
            'category': article['category'],
            'author_id': article['author']['id'],
            'published': article['published'],
            'importance_score': article['metadata']['importance_score']
        }
        
        # Remove if already exists (update)
        index['articles'] = [a for a in index['articles'] if a['id'] != article['id']]
        index['articles'].append(article_entry)
        
        # Sort by published date
        index['articles'].sort(key=lambda x: x['published'], reverse=True)
        
        # Update category index
        if article['category'] not in index['categories']:
            index['categories'][article['category']] = []
        if article['id'] not in index['categories'][article['category']]:
            index['categories'][article['category']].append(article['id'])
        
        # Update author index
        author_id = article['author']['id']
        if author_id not in index['authors']:
            index['authors'][author_id] = []
        if article['id'] not in index['authors'][author_id]:
            index['authors'][author_id].append(article['id'])
        
        # Save updated index
        with open(index_path, 'w') as f:
            json.dump(index, f, indent=2)
    
    def generate_news_batch(self, limit: int = 20):
        """Generate a batch of news articles"""
        logger.info("Fetching news sources...")
        stories = self.fetch_news_sources()
        
        logger.info(f"Analyzing {len(stories)} stories...")
        ranked_stories = self.analyze_importance(stories)
        
        # Generate articles for top stories
        generated = 0
        for story in ranked_stories[:limit]:
            try:
                article = self.generate_article(story)
                self.save_article(article)
                self.articles.append(article)
                generated += 1
                logger.info(f"Generated article {generated}/{limit}: {article['title']}")
            except Exception as e:
                logger.error(f"Failed to generate article for {story['title']}: {e}")
        
        return generated
    
    def get_articles_by_category(self, category: str, limit: int = 10) -> List[Dict]:
        """Get articles by category"""
        index_path = "data/articles/index.json"
        if not os.path.exists(index_path):
            return []
        
        with open(index_path, 'r') as f:
            index = json.load(f)
        
        article_ids = index['categories'].get(category, [])[:limit]
        articles = []
        
        for article_id in article_ids:
            article_path = f"data/articles/{article_id}.json"
            if os.path.exists(article_path):
                with open(article_path, 'r') as f:
                    articles.append(json.load(f))
        
        return articles
    
    def get_latest_articles(self, limit: int = 10) -> List[Dict]:
        """Get latest articles"""
        index_path = "data/articles/index.json"
        if not os.path.exists(index_path):
            return []
        
        with open(index_path, 'r') as f:
            index = json.load(f)
        
        articles = []
        for entry in index['articles'][:limit]:
            article_path = f"data/articles/{entry['id']}.json"
            if os.path.exists(article_path):
                with open(article_path, 'r') as f:
                    articles.append(json.load(f))
        
        return articles