"""
News Integration Module for Static.news
Integrates article generation with the main broadcast app
"""

import gradio as gr
import threading
import time
import logging
from datetime import datetime
from news_article_generator import NewsArticleGenerator
from news_router import NewsRouter

logger = logging.getLogger(__name__)

class NewsIntegration:
    """Integrates news article generation with broadcast system"""
    
    def __init__(self, broadcast_system):
        self.broadcast = broadcast_system
        self.generator = NewsArticleGenerator()
        self.router = NewsRouter()
        self.generation_thread = None
        self.running = True
        
    def start(self):
        """Start news generation and integration"""
        # Start article generation thread
        self.generation_thread = threading.Thread(
            target=self._generation_loop,
            daemon=True
        )
        self.generation_thread.start()
        
        logger.info("✅ News article generation system started")
        
    def _generation_loop(self):
        """Continuously generate news articles"""
        while self.running:
            try:
                # Generate new articles every 30 minutes
                logger.info("🔄 Generating new article batch...")
                generated = self.generator.generate_news_batch(limit=10)
                logger.info(f"✅ Generated {generated} new articles")
                
                # Update broadcast system with new articles
                self._update_broadcast_articles()
                
                # Wait 30 minutes
                time.sleep(1800)
                
            except Exception as e:
                logger.error(f"Article generation error: {e}")
                time.sleep(60)  # Wait 1 minute on error
    
    def _update_broadcast_articles(self):
        """Update broadcast system with latest articles"""
        # Get latest articles
        latest = self.generator.get_latest_articles(20)
        
        # Convert to broadcast format
        for article in latest:
            story = {
                'id': article['id'],
                'title': article['title'],
                'description': article['summary'],
                'link': f"/article/{article['id']}",  # Internal link
                'source': 'Static.news Original',
                'timestamp': time.time(),
                'category': article['category'],
                'author': article['author']['name'],
                'full_article': True
            }
            
            # Add to broadcast queue if not already there
            if not any(s['id'] == story['id'] for s in self.broadcast.news_queue):
                self.broadcast.news_queue.append(story)
                
                # Check if breaking news
                if article['metadata']['importance_score'] > 80:
                    self.broadcast.breaking_news = story
                    logger.info(f"🚨 BREAKING: {story['title']}")
    
    def create_gradio_interface(self):
        """Create Gradio interface components for news articles"""
        with gr.Tab("📰 News Articles"):
            with gr.Row():
                # Categories
                with gr.Column(scale=1):
                    gr.Markdown("### Categories")
                    category_btns = []
                    for category in self.generator.categories:
                        btn = gr.Button(category, variant="secondary")
                        category_btns.append(btn)
                
                # Article feed
                with gr.Column(scale=3):
                    article_feed = gr.HTML(
                        value=self._get_homepage_html,
                        label="Latest Articles"
                    )
                    
                    # Refresh button
                    refresh_btn = gr.Button("🔄 Refresh", variant="primary")
                    
            # Article viewer
            with gr.Row(visible=False) as article_viewer:
                article_display = gr.HTML()
                back_btn = gr.Button("← Back to Feed")
            
            # Authors section
            with gr.Tab("✍️ Our Authors"):
                authors_grid = gr.HTML(
                    value=self._get_authors_html,
                    label="News Team"
                )
            
            # Search
            with gr.Row():
                search_input = gr.Textbox(
                    placeholder="Search articles...",
                    label="Search"
                )
                search_btn = gr.Button("🔍 Search")
                
            search_results = gr.HTML(visible=False)
            
            # Event handlers
            def show_category(category):
                articles = self.router.get_category_articles(category)
                return self.router.create_news_feed_html(articles['articles'])
            
            def show_article(article_id):
                article = self.router.get_article(article_id)
                if article:
                    return (
                        self.router.create_article_html(article),
                        gr.update(visible=False),  # Hide feed
                        gr.update(visible=True)    # Show viewer
                    )
                return None, gr.update(), gr.update()
            
            def back_to_feed():
                return (
                    self._get_homepage_html(),
                    gr.update(visible=True),   # Show feed
                    gr.update(visible=False)   # Hide viewer
                )
            
            def search_articles(query):
                results = self.router.search_articles(query)
                if results:
                    return (
                        self.router.create_news_feed_html(results),
                        gr.update(visible=True)
                    )
                return (
                    "<p>No articles found.</p>",
                    gr.update(visible=True)
                )
            
            # Connect events
            for i, btn in enumerate(category_btns):
                btn.click(
                    show_category,
                    inputs=[gr.State(self.generator.categories[i])],
                    outputs=article_feed
                )
            
            refresh_btn.click(
                self._get_homepage_html,
                outputs=article_feed
            )
            
            back_btn.click(
                back_to_feed,
                outputs=[article_feed, article_feed, article_viewer]
            )
            
            search_btn.click(
                search_articles,
                inputs=search_input,
                outputs=[search_results, search_results]
            )
            
        # Live updates tab
        with gr.Tab("🔴 Live Updates"):
            live_ticker = gr.DataFrame(
                value=self._get_live_updates,
                headers=["Time", "Category", "Headline"],
                label="Latest Updates",
                every=30  # Update every 30 seconds
            )
            
            breaking_alert = gr.HTML(
                value=self._get_breaking_news,
                label="Breaking News",
                every=10  # Check every 10 seconds
            )
    
    def _get_homepage_html(self):
        """Get homepage HTML"""
        data = self.router.get_homepage_articles()
        
        html = """
        <div class="homepage">
        """
        
        # Top story
        if data['top_story']:
            story = data['top_story']
            html += f"""
            <div class="top-story">
                <h2>TOP STORY</h2>
                <div class="story-content">
                    <h1>{story['title']}</h1>
                    <p>{story['subtitle']}</p>
                    <div class="story-meta">
                        <span class="author">By {story['author']['name']}</span>
                        <span class="time">{story['reading_time']} min read</span>
                    </div>
                </div>
            </div>
            """
        
        # Featured articles
        if data['featured']:
            html += '<div class="featured-articles">'
            for article in data['featured']:
                html += f"""
                <article class="featured-item">
                    <h3>{article['title']}</h3>
                    <p>{article['summary']}</p>
                    <div class="meta">
                        <span>{article['category']}</span>
                        <span>{article['author']['name']}</span>
                    </div>
                </article>
                """
            html += '</div>'
        
        # Latest articles
        html += self.router.create_news_feed_html(data['latest'])
        
        html += """
        </div>
        
        <style>
            .homepage {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }
            
            .top-story {
                background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                color: white;
                padding: 3rem;
                border-radius: 1rem;
                margin-bottom: 3rem;
            }
            
            .top-story h2 {
                font-size: 0.875rem;
                font-weight: 600;
                letter-spacing: 0.1em;
                margin-bottom: 1rem;
                opacity: 0.9;
            }
            
            .story-content h1 {
                font-size: 2.5rem;
                font-weight: 700;
                line-height: 1.2;
                margin-bottom: 1rem;
            }
            
            .story-meta {
                display: flex;
                gap: 2rem;
                font-size: 0.875rem;
                opacity: 0.9;
                margin-top: 1.5rem;
            }
            
            .featured-articles {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 2rem;
                margin-bottom: 3rem;
            }
            
            .featured-item {
                background: #f9fafb;
                padding: 1.5rem;
                border-radius: 0.5rem;
                border: 1px solid #e5e7eb;
            }
            
            .featured-item h3 {
                font-size: 1.25rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                line-height: 1.3;
            }
            
            .featured-item .meta {
                display: flex;
                justify-content: space-between;
                font-size: 0.875rem;
                color: #6b7280;
                margin-top: 1rem;
            }
        </style>
        """
        
        return html
    
    def _get_authors_html(self):
        """Get authors grid HTML"""
        html = """
        <div class="authors-grid">
            <h2>Meet Our News Team</h2>
            <div class="authors">
        """
        
        for author in self.generator.authors.values():
            html += f"""
            <div class="author-card">
                <img src="{author.portrait_path}" alt="{author.name}" class="author-photo">
                <h3>{author.name}</h3>
                <p class="specialty">{author.specialty} Correspondent</p>
                <p class="bio">{author.bio}</p>
                <div class="writing-style">
                    <span>{author.writing_style['primary']} style</span>
                    <span>•</span>
                    <span>{author.writing_style['vocabulary']} vocabulary</span>
                </div>
            </div>
            """
        
        html += """
            </div>
        </div>
        
        <style>
            .authors-grid {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }
            
            .authors-grid h2 {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 2rem;
                text-align: center;
            }
            
            .authors {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 2rem;
            }
            
            .author-card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 0.5rem;
                padding: 1.5rem;
                text-align: center;
            }
            
            .author-photo {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                margin: 0 auto 1rem;
                object-fit: cover;
            }
            
            .author-card h3 {
                font-size: 1.25rem;
                font-weight: 700;
                margin-bottom: 0.25rem;
            }
            
            .specialty {
                color: #dc2626;
                font-weight: 600;
                font-size: 0.875rem;
                margin-bottom: 1rem;
            }
            
            .bio {
                color: #4b5563;
                line-height: 1.5;
                margin-bottom: 1rem;
                font-size: 0.875rem;
            }
            
            .writing-style {
                display: flex;
                justify-content: center;
                gap: 0.5rem;
                font-size: 0.75rem;
                color: #6b7280;
            }
        </style>
        """
        
        return html
    
    def _get_live_updates(self):
        """Get live updates for ticker"""
        updates = self.router.get_live_updates()
        
        # Convert to DataFrame format
        data = []
        for update in updates[:10]:
            data.append([
                update['time'],
                update['category'],
                update['title']
            ])
        
        return data
    
    def _get_breaking_news(self):
        """Get breaking news alert HTML"""
        if self.broadcast.breaking_news:
            news = self.broadcast.breaking_news
            return f"""
            <div class="breaking-news-alert">
                <div class="breaking-label">🚨 BREAKING NEWS</div>
                <div class="breaking-content">
                    <h3>{news['title']}</h3>
                    <p>{news.get('description', '')}</p>
                    <div class="breaking-meta">
                        <span>{news.get('source', 'Static.news')}</span>
                        <span>•</span>
                        <span>{news.get('category', 'General')}</span>
                    </div>
                </div>
            </div>
            
            <style>
                .breaking-news-alert {
                    background: #dc2626;
                    color: white;
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1rem;
                    animation: pulse 2s infinite;
                }
                
                .breaking-label {
                    font-weight: 700;
                    font-size: 0.875rem;
                    letter-spacing: 0.1em;
                    margin-bottom: 0.5rem;
                }
                
                .breaking-content h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                
                .breaking-meta {
                    display: flex;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    opacity: 0.9;
                    margin-top: 1rem;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.9; }
                }
            </style>
            """
        
        return ""