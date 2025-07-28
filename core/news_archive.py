#!/usr/bin/env python3
"""
News Archive and Search System for Static.news
Stores, indexes, and provides search functionality for all news content
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Set
from dataclasses import dataclass, asdict
import re
import hashlib
import os
import sqlite3
from collections import defaultdict
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ArchivedArticle:
    """Archived news article with metadata"""
    id: str
    title: str
    summary: str
    content: str
    category: str
    source: str
    url: str
    published: datetime
    archived_at: datetime
    urgency: str
    location: Optional[str] = None
    tags: List[str] = None
    anchor_takes: Dict[str, str] = None  # Anchor commentary
    view_count: int = 0
    search_keywords: List[str] = None
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.anchor_takes is None:
            self.anchor_takes = {}
        if self.search_keywords is None:
            self.search_keywords = []

@dataclass
class SearchResult:
    """Search result with relevance scoring"""
    article: ArchivedArticle
    relevance_score: float
    matched_terms: List[str]
    snippet: str

class NewsArchive:
    """News article archive with full-text search"""
    
    def __init__(self, db_path: str = "news_archive.db"):
        self.db_path = db_path
        self.search_index = {}  # In-memory search index
        self.tag_index = defaultdict(set)  # Tag-based index
        self.category_index = defaultdict(set)  # Category-based index
        self.date_index = defaultdict(set)  # Date-based index
        
        self._init_database()
        self._load_index()
    
    def _init_database(self):
        """Initialize SQLite database for persistent storage"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS articles (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                summary TEXT,
                content TEXT,
                category TEXT,
                source TEXT,
                url TEXT,
                published TEXT,
                archived_at TEXT,
                urgency TEXT,
                location TEXT,
                tags TEXT,
                anchor_takes TEXT,
                view_count INTEGER DEFAULT 0,
                search_keywords TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS search_analytics (
                query TEXT PRIMARY KEY,
                search_count INTEGER DEFAULT 0,
                last_searched TEXT,
                results_count INTEGER DEFAULT 0
            )
        ''')
        
        # Create indexes for performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_published ON articles(published)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_category ON articles(category)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_urgency ON articles(urgency)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_source ON articles(source)')
        
        conn.commit()
        conn.close()
    
    def _load_index(self):
        """Load search index from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, title, summary, content, tags, category, published FROM articles')
        rows = cursor.fetchall()
        
        for row in rows:
            article_id, title, summary, content, tags, category, published = row
            
            # Build search index
            searchable_text = f"{title} {summary} {content}".lower()
            keywords = self._extract_keywords(searchable_text)
            self.search_index[article_id] = keywords
            
            # Build tag index
            if tags:
                article_tags = json.loads(tags)
                for tag in article_tags:
                    self.tag_index[tag.lower()].add(article_id)
            
            # Build category index
            if category:
                self.category_index[category.lower()].add(article_id)
            
            # Build date index
            if published:
                date_key = published[:10]  # YYYY-MM-DD
                self.date_index[date_key].add(article_id)
        
        conn.close()
        logger.info(f"Loaded search index with {len(self.search_index)} articles")
    
    async def archive_article(self, article) -> str:
        """Archive a news article"""
        try:
            # Generate unique ID
            article_id = hashlib.md5(f"{article.title}{article.source}{article.published}".encode()).hexdigest()
            
            # Extract search keywords
            search_keywords = self._extract_keywords(f"{article.title} {article.summary} {article.content}".lower())
            
            # Create archived article
            archived = ArchivedArticle(
                id=article_id,
                title=article.title,
                summary=article.summary,
                content=getattr(article, 'content', article.summary),
                category=article.category,
                source=article.source,
                url=article.url,
                published=article.published,
                archived_at=datetime.now(),
                urgency=article.urgency,
                location=getattr(article, 'location', None),
                tags=getattr(article, 'tags', []),
                search_keywords=search_keywords
            )
            
            # Generate anchor takes
            archived.anchor_takes = self._generate_anchor_takes(archived)
            
            # Store in database
            await self._store_article(archived)
            
            # Update search indexes
            self._update_indexes(archived)
            
            logger.info(f"Archived article: {article.title[:50]}...")
            return article_id
            
        except Exception as e:
            logger.error(f"Error archiving article: {e}")
            return None
    
    async def _store_article(self, article: ArchivedArticle):
        """Store article in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO articles 
            (id, title, summary, content, category, source, url, published, 
             archived_at, urgency, location, tags, anchor_takes, view_count, search_keywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            article.id,
            article.title,
            article.summary,
            article.content,
            article.category,
            article.source,
            article.url,
            article.published.isoformat(),
            article.archived_at.isoformat(),
            article.urgency,
            article.location,
            json.dumps(article.tags),
            json.dumps(article.anchor_takes),
            article.view_count,
            json.dumps(article.search_keywords)
        ))
        
        conn.commit()
        conn.close()
    
    def _update_indexes(self, article: ArchivedArticle):
        """Update in-memory search indexes"""
        # Update search index
        self.search_index[article.id] = article.search_keywords
        
        # Update tag index
        for tag in article.tags:
            self.tag_index[tag.lower()].add(article.id)
        
        # Update category index
        self.category_index[article.category.lower()].add(article.id)
        
        # Update date index
        date_key = article.published.date().isoformat()
        self.date_index[date_key].add(article.id)
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract searchable keywords from text"""
        # Remove punctuation and split into words
        words = re.findall(r'\b\w+\b', text.lower())
        
        # Filter out common stop words
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',
            'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
            'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
            'his', 'her', 'its', 'our', 'their'
        }
        
        # Filter out stop words and short words
        keywords = [word for word in words if len(word) > 2 and word not in stop_words]
        
        # Remove duplicates while preserving order
        seen = set()
        unique_keywords = []
        for word in keywords:
            if word not in seen:
                seen.add(word)
                unique_keywords.append(word)
        
        return unique_keywords
    
    def _generate_anchor_takes(self, article: ArchivedArticle) -> Dict[str, str]:
        """Generate anchor commentary on archived articles"""
        anchor_takes = {}
        
        # Ray McPatriot takes
        ray_takes = [
            f"This {article.category} story is either great or terrible for America!",
            f"Back in my day, {article.category} news was more patriotic!",
            f"The founding fathers had strong opinions about {article.category}!",
            f"This reminds me why I love/hate this country!"
        ]
        
        # Berkeley Justice takes
        bee_takes = [
            f"This {article.category} story raises important systemic questions.",
            f"According to my Yale research, {article.category} issues connect to broader patterns.",
            f"We need to fact-check the underlying assumptions in this {article.category} report.",
            f"This intersects with multiple social justice frameworks I studied."
        ]
        
        # Switz Middleton takes
        switz_takes = [
            f"This {article.category} situation is like gravy - complex and Canadian.",
            f"I'm 50% concerned and 50% neutral about this {article.category} development.",
            f"In Canada, we would handle {article.category} issues with more gravy.",
            f"This {article.category} news reminds me of something gravy-related."
        ]
        
        import random
        anchor_takes['Ray McPatriot'] = random.choice(ray_takes)
        anchor_takes['Berkeley Justice'] = random.choice(bee_takes)
        anchor_takes['Switz Middleton'] = random.choice(switz_takes)
        
        return anchor_takes
    
    async def search(self, query: str, filters: Dict = None, limit: int = 20) -> List[SearchResult]:
        """Search archived articles"""
        try:
            # Record search analytics
            await self._record_search(query)
            
            # Parse search query
            search_terms = self._extract_keywords(query.lower())
            if not search_terms:
                return []
            
            # Find matching articles
            matching_articles = self._find_matching_articles(search_terms, filters)
            
            # Score and rank results
            results = []
            for article_id, match_score in matching_articles:
                article = await self._get_article_by_id(article_id)
                if article:
                    # Calculate relevance score
                    relevance_score = self._calculate_relevance(article, search_terms, match_score)
                    
                    # Generate snippet
                    snippet = self._generate_snippet(article, search_terms)
                    
                    # Find matched terms
                    matched_terms = [term for term in search_terms 
                                   if term in article.search_keywords]
                    
                    result = SearchResult(
                        article=article,
                        relevance_score=relevance_score,
                        matched_terms=matched_terms,
                        snippet=snippet
                    )
                    results.append(result)
            
            # Sort by relevance score
            results.sort(key=lambda x: x.relevance_score, reverse=True)
            
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            return []
    
    def _find_matching_articles(self, search_terms: List[str], filters: Dict = None) -> List[Tuple[str, float]]:
        """Find articles matching search terms"""
        article_scores = defaultdict(float)
        
        # Search in text index
        for article_id, keywords in self.search_index.items():
            match_count = 0
            for term in search_terms:
                if term in keywords:
                    match_count += 1
                    # Boost score for exact matches
                    article_scores[article_id] += 1.0
                else:
                    # Partial matches (contains term)
                    partial_matches = [kw for kw in keywords if term in kw or kw in term]
                    if partial_matches:
                        match_count += 0.5
                        article_scores[article_id] += 0.5
            
            # Only include articles with at least one match
            if match_count == 0:
                article_scores.pop(article_id, None)
        
        # Apply filters
        if filters:
            filtered_scores = {}
            for article_id, score in article_scores.items():
                if self._matches_filters(article_id, filters):
                    filtered_scores[article_id] = score
            article_scores = filtered_scores
        
        # Convert to list of tuples and sort
        return [(article_id, score) for article_id, score in article_scores.items()]
    
    def _matches_filters(self, article_id: str, filters: Dict) -> bool:
        """Check if article matches search filters"""
        # Category filter
        if 'category' in filters:
            if article_id not in self.category_index.get(filters['category'].lower(), set()):
                return False
        
        # Tag filter
        if 'tag' in filters:
            if article_id not in self.tag_index.get(filters['tag'].lower(), set()):
                return False
        
        # Date range filter
        if 'date_from' in filters or 'date_to' in filters:
            # Would need to check actual dates from database
            pass
        
        return True
    
    def _calculate_relevance(self, article: ArchivedArticle, search_terms: List[str], base_score: float) -> float:
        """Calculate relevance score for search result"""
        score = base_score
        
        # Boost for title matches
        title_lower = article.title.lower()
        for term in search_terms:
            if term in title_lower:
                score += 2.0
        
        # Boost for recent articles
        age_days = (datetime.now() - article.published).days
        if age_days < 1:
            score += 1.0
        elif age_days < 7:
            score += 0.5
        elif age_days < 30:
            score += 0.2
        
        # Boost for breaking news
        if article.urgency == 'breaking':
            score += 1.5
        elif article.urgency == 'urgent':
            score += 1.0
        
        # Boost for view count (popularity)
        score += math.log(article.view_count + 1) * 0.1
        
        return score
    
    def _generate_snippet(self, article: ArchivedArticle, search_terms: List[str], max_length: int = 200) -> str:
        """Generate search result snippet"""
        text = f"{article.title}. {article.summary}"
        
        # Find best snippet location (around search terms)
        best_position = 0
        max_term_count = 0
        
        # Check different positions for term density
        words = text.split()
        for i in range(0, len(words), 10):
            snippet_words = words[i:i+30]  # 30-word window
            snippet_text = ' '.join(snippet_words).lower()
            
            term_count = sum(1 for term in search_terms if term in snippet_text)
            if term_count > max_term_count:
                max_term_count = term_count
                best_position = i
        
        # Extract snippet
        snippet_words = words[best_position:best_position+30]
        snippet = ' '.join(snippet_words)
        
        # Truncate to max length
        if len(snippet) > max_length:
            snippet = snippet[:max_length-3] + "..."
        
        # Highlight search terms
        for term in search_terms:
            pattern = re.compile(re.escape(term), re.IGNORECASE)
            snippet = pattern.sub(f"**{term}**", snippet)
        
        return snippet
    
    async def _get_article_by_id(self, article_id: str) -> Optional[ArchivedArticle]:
        """Retrieve article from database by ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM articles WHERE id = ?', (article_id,))
        row = cursor.fetchone()
        
        if row:
            # Increment view count
            cursor.execute('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', (article_id,))
            conn.commit()
            
            # Convert row to ArchivedArticle
            article = ArchivedArticle(
                id=row[0],
                title=row[1],
                summary=row[2],
                content=row[3],
                category=row[4],
                source=row[5],
                url=row[6],
                published=datetime.fromisoformat(row[7]),
                archived_at=datetime.fromisoformat(row[8]),
                urgency=row[9],
                location=row[10],
                tags=json.loads(row[11]) if row[11] else [],
                anchor_takes=json.loads(row[12]) if row[12] else {},
                view_count=row[13] + 1,  # Updated count
                search_keywords=json.loads(row[14]) if row[14] else []
            )
            
            conn.close()
            return article
        
        conn.close()
        return None
    
    async def _record_search(self, query: str):
        """Record search analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO search_analytics 
            (query, search_count, last_searched) 
            VALUES (?, COALESCE((SELECT search_count FROM search_analytics WHERE query = ?), 0) + 1, ?)
        ''', (query, query, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    async def get_trending_searches(self, limit: int = 10) -> List[Dict]:
        """Get trending search queries"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT query, search_count, last_searched 
            FROM search_analytics 
            ORDER BY search_count DESC 
            LIMIT ?
        ''', (limit,))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'query': row[0],
                'search_count': row[1],
                'last_searched': row[2]
            })
        
        conn.close()
        return results
    
    async def get_popular_articles(self, limit: int = 10) -> List[ArchivedArticle]:
        """Get most popular articles by view count"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id FROM articles 
            ORDER BY view_count DESC 
            LIMIT ?
        ''', (limit,))
        
        results = []
        for row in cursor.fetchall():
            article = await self._get_article_by_id(row[0])
            if article:
                results.append(article)
        
        conn.close()
        return results
    
    async def get_articles_by_category(self, category: str, limit: int = 20) -> List[ArchivedArticle]:
        """Get articles in specific category"""
        article_ids = list(self.category_index.get(category.lower(), set()))
        results = []
        
        for article_id in article_ids[:limit]:
            article = await self._get_article_by_id(article_id)
            if article:
                results.append(article)
        
        # Sort by published date (newest first)
        results.sort(key=lambda x: x.published, reverse=True)
        return results
    
    async def get_articles_by_date_range(self, start_date: datetime, end_date: datetime) -> List[ArchivedArticle]:
        """Get articles within date range"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id FROM articles 
            WHERE published BETWEEN ? AND ?
            ORDER BY published DESC
        ''', (start_date.isoformat(), end_date.isoformat()))
        
        results = []
        for row in cursor.fetchall():
            article = await self._get_article_by_id(row[0])
            if article:
                results.append(article)
        
        conn.close()
        return results
    
    def get_archive_stats(self) -> Dict:
        """Get archive statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM articles')
        total_articles = cursor.fetchone()[0]
        
        cursor.execute('SELECT category, COUNT(*) FROM articles GROUP BY category')
        category_counts = dict(cursor.fetchall())
        
        cursor.execute('SELECT urgency, COUNT(*) FROM articles GROUP BY urgency')
        urgency_counts = dict(cursor.fetchall())
        
        cursor.execute('SELECT SUM(view_count) FROM articles')
        total_views = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            'total_articles': total_articles,
            'category_distribution': category_counts,
            'urgency_distribution': urgency_counts,
            'total_views': total_views,
            'indexed_keywords': len(self.search_index),
            'last_updated': datetime.now().isoformat()
        }

# Global archive instance
news_archive = NewsArchive()

if __name__ == "__main__":
    # Test the archive system
    async def test_archive():
        archive = NewsArchive()
        
        # Test search
        results = await archive.search("breaking news politics")
        print(f"Search results: {len(results)}")
        
        for result in results[:3]:
            print(f"- {result.article.title} (score: {result.relevance_score:.2f})")
            print(f"  Snippet: {result.snippet}")
        
        # Get stats
        stats = archive.get_archive_stats()
        print(f"Archive stats: {stats}")
    
    asyncio.run(test_archive())