"""
News Router for Static.news
Handles article routing, API endpoints, and integration with main app
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional
import gradio as gr
from news_article_generator import NewsArticleGenerator
import logging

logger = logging.getLogger(__name__)

class NewsRouter:
    """Handles routing and serving of news articles"""
    
    def __init__(self):
        self.generator = NewsArticleGenerator()
        self.cache = {}
        self._initialize_routes()
        
    def _initialize_routes(self):
        """Initialize article routes and categories"""
        self.routes = {
            'home': self.get_homepage_articles,
            'category': self.get_category_articles,
            'article': self.get_article,
            'author': self.get_author_articles,
            'search': self.search_articles,
            'live': self.get_live_updates
        }
        
    def get_homepage_articles(self) -> Dict:
        """Get articles for homepage display"""
        # Top story (most important)
        latest = self.generator.get_latest_articles(20)
        if not latest:
            return {'top_story': None, 'featured': [], 'categories': {}}
        
        # Sort by importance
        latest.sort(key=lambda x: x['metadata']['importance_score'], reverse=True)
        
        top_story = latest[0] if latest else None
        featured = latest[1:4] if len(latest) > 1 else []
        
        # Get top articles by category
        categories = {}
        for category in self.generator.categories:
            cat_articles = self.generator.get_articles_by_category(category, 5)
            if cat_articles:
                categories[category] = cat_articles
        
        return {
            'top_story': top_story,
            'featured': featured,
            'categories': categories,
            'latest': latest[:10]
        }
    
    def get_category_articles(self, category: str, page: int = 1, per_page: int = 20) -> Dict:
        """Get articles for a specific category"""
        articles = self.generator.get_articles_by_category(category, per_page * page)
        
        # Paginate
        start = (page - 1) * per_page
        end = start + per_page
        paginated = articles[start:end]
        
        return {
            'category': category,
            'articles': paginated,
            'page': page,
            'total': len(articles),
            'has_more': end < len(articles)
        }
    
    def get_article(self, article_id: str) -> Optional[Dict]:
        """Get a specific article by ID"""
        article_path = f"data/articles/{article_id}.json"
        if os.path.exists(article_path):
            with open(article_path, 'r') as f:
                article = json.load(f)
                
            # Get related articles
            related = self._get_related_articles(article)
            article['related_articles'] = related
            
            return article
        return None
    
    def get_author_articles(self, author_id: str, limit: int = 10) -> List[Dict]:
        """Get articles by a specific author"""
        index_path = "data/articles/index.json"
        if not os.path.exists(index_path):
            return []
        
        with open(index_path, 'r') as f:
            index = json.load(f)
        
        article_ids = index['authors'].get(author_id, [])[:limit]
        articles = []
        
        for article_id in article_ids:
            article_path = f"data/articles/{article_id}.json"
            if os.path.exists(article_path):
                with open(article_path, 'r') as f:
                    articles.append(json.load(f))
        
        return articles
    
    def search_articles(self, query: str, limit: int = 20) -> List[Dict]:
        """Search articles by query"""
        query_lower = query.lower()
        results = []
        
        index_path = "data/articles/index.json"
        if not os.path.exists(index_path):
            return []
        
        with open(index_path, 'r') as f:
            index = json.load(f)
        
        for entry in index['articles']:
            # Simple search in title
            if query_lower in entry['title'].lower():
                article_path = f"data/articles/{entry['id']}.json"
                if os.path.exists(article_path):
                    with open(article_path, 'r') as f:
                        article = json.load(f)
                        # Check content too
                        if (query_lower in article['title'].lower() or 
                            query_lower in article['content'].lower() or
                            query_lower in ' '.join(article['tags']).lower()):
                            results.append(article)
                            
                if len(results) >= limit:
                    break
        
        return results
    
    def get_live_updates(self) -> List[Dict]:
        """Get live updates for the news ticker"""
        # Get latest 10 articles
        latest = self.generator.get_latest_articles(10)
        
        updates = []
        for article in latest:
            updates.append({
                'id': article['id'],
                'title': article['title'],
                'category': article['category'],
                'time': self._format_time_ago(article['published']),
                'breaking': article['metadata']['importance_score'] > 70
            })
        
        return updates
    
    def _get_related_articles(self, article: Dict, limit: int = 4) -> List[Dict]:
        """Get related articles based on category and tags"""
        related = []
        
        # Get articles from same category
        category_articles = self.generator.get_articles_by_category(article['category'], 10)
        
        for cat_article in category_articles:
            if cat_article['id'] != article['id']:
                # Check tag overlap
                common_tags = set(article['tags']) & set(cat_article['tags'])
                if common_tags:
                    related.append({
                        'id': cat_article['id'],
                        'title': cat_article['title'],
                        'author': cat_article['author']['name'],
                        'reading_time': cat_article['reading_time'],
                        'image': cat_article['images'][0]['url'] if cat_article['images'] else None
                    })
                    
                if len(related) >= limit:
                    break
        
        return related
    
    def _format_time_ago(self, timestamp: str) -> str:
        """Format timestamp as time ago"""
        try:
            published = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            now = datetime.now()
            delta = now - published
            
            if delta.days > 0:
                return f"{delta.days}d ago"
            elif delta.seconds > 3600:
                return f"{delta.seconds // 3600}h ago"
            elif delta.seconds > 60:
                return f"{delta.seconds // 60}m ago"
            else:
                return "Just now"
        except:
            return "Recently"
    
    def create_article_html(self, article: Dict) -> str:
        """Create HTML for article display"""
        html = f"""
        <article class="news-article">
            <header class="article-header">
                <div class="article-category">{article['category']}</div>
                <h1 class="article-title">{article['title']}</h1>
                <p class="article-subtitle">{article['subtitle']}</p>
                
                <div class="article-meta">
                    <div class="author-info">
                        <img src="{article['author']['portrait']}" alt="{article['author']['name']}" class="author-portrait">
                        <div>
                            <div class="author-name">By {article['author']['name']}</div>
                            <div class="publish-info">
                                {self._format_time_ago(article['published'])} · {article['reading_time']} min read
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <div class="article-image">
                <img src="{article['images'][0]['url']}" alt="{article['images'][0]['caption']}">
                <div class="image-caption">{article['images'][0]['caption']}</div>
            </div>
            
            <div class="article-content">
                {''.join(f'<p>{p}</p>' for p in article['content'].split('\n\n') if p)}
            </div>
            
            <footer class="article-footer">
                <div class="article-tags">
                    {''.join(f'<span class="tag">{tag}</span>' for tag in article['tags'])}
                </div>
                
                <div class="article-sources">
                    <h3>Sources</h3>
                    <ul>
                        {''.join(f'<li><a href="{source["url"]}" target="_blank">{source["name"]}</a></li>' for source in article['sources'])}
                    </ul>
                </div>
            </footer>
        </article>
        
        <style>
            .news-article {{
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }}
            
            .article-category {{
                color: #dc2626;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 0.875rem;
                margin-bottom: 0.5rem;
            }}
            
            .article-title {{
                font-size: 2.5rem;
                font-weight: 700;
                line-height: 1.2;
                margin-bottom: 1rem;
            }}
            
            .article-subtitle {{
                font-size: 1.25rem;
                color: #6b7280;
                line-height: 1.5;
                margin-bottom: 2rem;
            }}
            
            .article-meta {{
                display: flex;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 2rem;
                border-bottom: 1px solid #e5e7eb;
            }}
            
            .author-info {{
                display: flex;
                align-items: center;
                gap: 1rem;
            }}
            
            .author-portrait {{
                width: 48px;
                height: 48px;
                border-radius: 50%;
                object-fit: cover;
            }}
            
            .author-name {{
                font-weight: 600;
                margin-bottom: 0.25rem;
            }}
            
            .publish-info {{
                color: #6b7280;
                font-size: 0.875rem;
            }}
            
            .article-image {{
                margin-bottom: 2rem;
            }}
            
            .article-image img {{
                width: 100%;
                height: auto;
                border-radius: 0.5rem;
            }}
            
            .image-caption {{
                color: #6b7280;
                font-size: 0.875rem;
                margin-top: 0.5rem;
            }}
            
            .article-content {{
                font-size: 1.125rem;
                line-height: 1.75;
                color: #1f2937;
            }}
            
            .article-content p {{
                margin-bottom: 1.5rem;
            }}
            
            .article-footer {{
                margin-top: 3rem;
                padding-top: 2rem;
                border-top: 1px solid #e5e7eb;
            }}
            
            .article-tags {{
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                margin-bottom: 2rem;
            }}
            
            .tag {{
                background: #f3f4f6;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.875rem;
                color: #4b5563;
            }}
            
            .article-sources h3 {{
                font-size: 1.125rem;
                margin-bottom: 0.5rem;
            }}
            
            .article-sources ul {{
                list-style: none;
                padding: 0;
            }}
            
            .article-sources a {{
                color: #3b82f6;
                text-decoration: none;
            }}
            
            .article-sources a:hover {{
                text-decoration: underline;
            }}
        </style>
        """
        
        return html
    
    def create_news_feed_html(self, articles: List[Dict]) -> str:
        """Create HTML for news feed display"""
        html = """
        <div class="news-feed">
        """
        
        for article in articles:
            html += f"""
            <article class="feed-item">
                <div class="feed-image">
                    <img src="{article['images'][0]['url'] if article['images'] else ''}" alt="{article['title']}">
                </div>
                <div class="feed-content">
                    <div class="feed-category">{article['category']}</div>
                    <h2 class="feed-title">
                        <a href="#" onclick="loadArticle('{article['id']}')">{article['title']}</a>
                    </h2>
                    <p class="feed-summary">{article['summary']}</p>
                    <div class="feed-meta">
                        <span class="feed-author">{article['author']['name']}</span>
                        <span class="feed-time">{self._format_time_ago(article['published'])}</span>
                    </div>
                </div>
            </article>
            """
        
        html += """
        </div>
        
        <style>
            .news-feed {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }
            
            .feed-item {
                display: flex;
                gap: 1.5rem;
                margin-bottom: 2rem;
                padding-bottom: 2rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .feed-image {
                flex-shrink: 0;
                width: 200px;
                height: 150px;
            }
            
            .feed-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 0.5rem;
            }
            
            .feed-content {
                flex: 1;
            }
            
            .feed-category {
                color: #dc2626;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 0.75rem;
                margin-bottom: 0.5rem;
            }
            
            .feed-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                line-height: 1.3;
            }
            
            .feed-title a {
                color: inherit;
                text-decoration: none;
            }
            
            .feed-title a:hover {
                color: #dc2626;
            }
            
            .feed-summary {
                color: #6b7280;
                line-height: 1.5;
                margin-bottom: 0.75rem;
            }
            
            .feed-meta {
                display: flex;
                gap: 1rem;
                color: #6b7280;
                font-size: 0.875rem;
            }
            
            .feed-author {
                font-weight: 500;
            }
        </style>
        
        <script>
            function loadArticle(articleId) {
                // This would be implemented to load the full article
                console.log('Loading article:', articleId);
            }
        </script>
        """
        
        return html