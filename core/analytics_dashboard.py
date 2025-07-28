#!/usr/bin/env python3
"""
Analytics Dashboard for Static.news
Comprehensive analytics and metrics tracking
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import sqlite3
import os
from collections import defaultdict, Counter
import statistics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ViewershipMetrics:
    """Viewership analytics data"""
    timestamp: datetime
    concurrent_viewers: int
    total_views: int
    unique_viewers: int
    average_session_duration: float  # minutes
    platform_breakdown: Dict[str, int]  # web, mobile, etc.
    geographic_breakdown: Dict[str, int]  # by country/region

@dataclass
class ContentMetrics:
    """Content performance metrics"""
    article_id: str
    title: str
    category: str
    views: int
    shares: int
    comments: int
    average_read_time: float  # seconds
    bounce_rate: float  # percentage
    engagement_score: float
    published_time: datetime

@dataclass
class AnchorMetrics:
    """Individual anchor performance metrics"""
    anchor_name: str
    total_airtime_minutes: int
    breakdown_count: int
    confusion_incidents: int
    accuracy_percentage: float
    viewer_rating: float
    memorable_quotes: int
    mispronunciations: int
    existential_crises: int

class AnalyticsDashboard:
    """Main analytics dashboard system"""
    
    def __init__(self, db_path: str = "analytics.db"):
        self.db_path = db_path
        self._init_database()
        
        # Cache for real-time metrics
        self.current_metrics = {
            'viewers': 0,
            'confusion_level': 0,
            'breakdowns_today': 0,
            'news_articles_today': 0
        }
    
    def _init_database(self):
        """Initialize analytics database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Viewership metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS viewership_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                concurrent_viewers INTEGER,
                total_views INTEGER,
                unique_viewers INTEGER,
                average_session_duration REAL,
                platform_breakdown TEXT,
                geographic_breakdown TEXT
            )
        ''')
        
        # Content metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS content_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                article_id TEXT NOT NULL,
                title TEXT,
                category TEXT,
                views INTEGER DEFAULT 0,
                shares INTEGER DEFAULT 0,
                comments INTEGER DEFAULT 0,
                average_read_time REAL DEFAULT 0,
                bounce_rate REAL DEFAULT 0,
                engagement_score REAL DEFAULT 0,
                published_time TEXT,
                recorded_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Anchor performance table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS anchor_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                anchor_name TEXT NOT NULL,
                date TEXT NOT NULL,
                airtime_minutes INTEGER DEFAULT 0,
                breakdown_count INTEGER DEFAULT 0,
                confusion_incidents INTEGER DEFAULT 0,
                accuracy_percentage REAL DEFAULT 0,
                viewer_rating REAL DEFAULT 0,
                memorable_quotes INTEGER DEFAULT 0,
                mispronunciations INTEGER DEFAULT 0,
                existential_crises INTEGER DEFAULT 0,
                UNIQUE(anchor_name, date)
            )
        ''')
        
        # User engagement table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_engagement (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                session_id TEXT,
                timestamp TEXT,
                action_type TEXT,  -- view, comment, share, breakdown_trigger
                content_id TEXT,
                duration_seconds INTEGER,
                platform TEXT,
                location TEXT
            )
        ''')
        
        # Revenue metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS revenue_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                breakdown_triggers_sold INTEGER DEFAULT 0,
                breakdown_trigger_revenue REAL DEFAULT 0,
                sponsor_revenue REAL DEFAULT 0,
                mobile_app_revenue REAL DEFAULT 0,
                total_revenue REAL DEFAULT 0,
                UNIQUE(date)
            )
        ''')
        
        # Create indexes for performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_viewership_timestamp ON viewership_metrics(timestamp)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_content_category ON content_metrics(category)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_anchor_date ON anchor_metrics(date)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_engagement_timestamp ON user_engagement(timestamp)')
        
        conn.commit()
        conn.close()
    
    async def record_viewership(self, concurrent_viewers: int, platform_breakdown: Dict[str, int] = None,
                               geographic_breakdown: Dict[str, int] = None):
        """Record current viewership metrics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calculate additional metrics
        total_views = await self._get_total_views_today()
        unique_viewers = await self._get_unique_viewers_today()
        avg_session_duration = await self._get_average_session_duration()
        
        cursor.execute('''
            INSERT INTO viewership_metrics 
            (timestamp, concurrent_viewers, total_views, unique_viewers, 
             average_session_duration, platform_breakdown, geographic_breakdown)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now().isoformat(),
            concurrent_viewers,
            total_views,
            unique_viewers,
            avg_session_duration,
            json.dumps(platform_breakdown or {}),
            json.dumps(geographic_breakdown or {})
        ))
        
        conn.commit()
        conn.close()
        
        # Update cache
        self.current_metrics['viewers'] = concurrent_viewers
    
    async def record_content_performance(self, article_id: str, title: str, category: str,
                                       views: int = 0, shares: int = 0, comments: int = 0):
        """Record content performance metrics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calculate engagement metrics
        engagement_score = self._calculate_engagement_score(views, shares, comments)
        
        cursor.execute('''
            INSERT OR REPLACE INTO content_metrics 
            (article_id, title, category, views, shares, comments, engagement_score, published_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            article_id, title, category, views, shares, comments, 
            engagement_score, datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
    
    async def record_anchor_performance(self, anchor_name: str, airtime_minutes: int = 0,
                                       breakdown_count: int = 0, confusion_incidents: int = 0,
                                       mispronunciations: int = 0):
        """Record anchor performance for the day"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        cursor.execute('''
            INSERT OR REPLACE INTO anchor_metrics 
            (anchor_name, date, airtime_minutes, breakdown_count, confusion_incidents, 
             mispronunciations, accuracy_percentage, viewer_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            anchor_name, today, airtime_minutes, breakdown_count, confusion_incidents,
            mispronunciations, self._calculate_accuracy(anchor_name), 
            self._calculate_viewer_rating(anchor_name)
        ))
        
        conn.commit()
        conn.close()
    
    async def record_user_action(self, user_id: str, action_type: str, content_id: str = None,
                                duration_seconds: int = 0, platform: str = 'web', location: str = None):
        """Record user engagement action"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        session_id = f"{user_id}_{datetime.now().date().isoformat()}"
        
        cursor.execute('''
            INSERT INTO user_engagement 
            (user_id, session_id, timestamp, action_type, content_id, 
             duration_seconds, platform, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, session_id, datetime.now().isoformat(), action_type,
            content_id, duration_seconds, platform, location
        ))
        
        conn.commit()
        conn.close()
    
    async def get_dashboard_overview(self) -> Dict:
        """Get main dashboard overview metrics"""
        overview = {
            'current_viewers': await self._get_current_viewers(),
            'today_stats': await self._get_today_stats(),
            'anchor_performance': await self._get_anchor_performance_summary(),
            'content_performance': await self._get_top_content_today(),
            'engagement_metrics': await self._get_engagement_summary(),
            'revenue_metrics': await self._get_revenue_summary(),
            'last_updated': datetime.now().isoformat()
        }
        
        return overview
    
    async def get_viewership_analytics(self, days: int = 7) -> Dict:
        """Get detailed viewership analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        start_date = datetime.now() - timedelta(days=days)
        
        cursor.execute('''
            SELECT timestamp, concurrent_viewers, total_views, unique_viewers,
                   average_session_duration, platform_breakdown, geographic_breakdown
            FROM viewership_metrics 
            WHERE timestamp >= ? 
            ORDER BY timestamp
        ''', (start_date.isoformat(),))
        
        rows = cursor.fetchall()
        conn.close()
        
        analytics = {
            'period_days': days,
            'data_points': len(rows),
            'hourly_breakdown': self._analyze_hourly_patterns(rows),
            'platform_distribution': self._analyze_platform_distribution(rows),
            'geographic_distribution': self._analyze_geographic_distribution(rows),
            'peak_viewing_times': self._find_peak_viewing_times(rows),
            'average_metrics': self._calculate_average_metrics(rows)
        }
        
        return analytics
    
    async def get_content_analytics(self, category: str = None, days: int = 30) -> Dict:
        """Get content performance analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        start_date = datetime.now() - timedelta(days=days)
        
        if category:
            cursor.execute('''
                SELECT * FROM content_metrics 
                WHERE category = ? AND published_time >= ?
                ORDER BY engagement_score DESC
            ''', (category, start_date.isoformat()))
        else:
            cursor.execute('''
                SELECT * FROM content_metrics 
                WHERE published_time >= ?
                ORDER BY engagement_score DESC
            ''', (start_date.isoformat(),))
        
        rows = cursor.fetchall()
        conn.close()
        
        analytics = {
            'total_articles': len(rows),
            'category_filter': category,
            'top_performing': self._get_top_performing_content(rows),
            'category_breakdown': self._analyze_content_by_category(rows),
            'engagement_trends': self._analyze_engagement_trends(rows),
            'viral_content': self._identify_viral_content(rows)
        }
        
        return analytics
    
    async def get_anchor_analytics(self, anchor_name: str = None) -> Dict:
        """Get anchor performance analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if anchor_name:
            cursor.execute('''
                SELECT * FROM anchor_metrics 
                WHERE anchor_name = ?
                ORDER BY date DESC
                LIMIT 30
            ''', (anchor_name,))
        else:
            cursor.execute('''
                SELECT * FROM anchor_metrics 
                ORDER BY date DESC
                LIMIT 90
            ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        analytics = {
            'anchor_filter': anchor_name,
            'performance_trends': self._analyze_anchor_trends(rows),
            'breakdown_analysis': self._analyze_breakdown_patterns(rows),
            'confusion_metrics': self._analyze_confusion_patterns(rows),
            'accuracy_trends': self._analyze_accuracy_trends(rows),
            'comparative_performance': self._compare_anchor_performance(rows)
        }
        
        return analytics
    
    async def get_realtime_metrics(self) -> Dict:
        """Get real-time dashboard metrics"""
        current_time = datetime.now()
        
        # Simulate real-time data
        import random
        
        metrics = {
            'live_viewers': random.randint(150000, 300000),
            'current_show': await self._get_current_show_info(),
            'breakdown_imminent': random.choice([True, False]),
            'confusion_levels': {
                'Ray McPatriot': random.randint(60, 95),
                'Berkeley Justice': random.randint(70, 90),
                'Switz Middleton': random.randint(50, 85)
            },
            'trending_topics': await self._get_trending_topics(),
            'emergency_alerts': await self._get_active_alerts(),
            'revenue_today': await self._get_revenue_today(),
            'social_media_mentions': random.randint(5000, 15000),
            'server_status': 'healthy',
            'last_updated': current_time.isoformat()
        }
        
        return metrics
    
    # Helper methods
    async def _get_total_views_today(self) -> int:
        """Get total views for today"""
        # Mock implementation
        return 50000 + (datetime.now().hour * 2000)
    
    async def _get_unique_viewers_today(self) -> int:
        """Get unique viewers for today"""
        # Mock implementation
        return 25000 + (datetime.now().hour * 800)
    
    async def _get_average_session_duration(self) -> float:
        """Get average session duration in minutes"""
        # Mock implementation
        import random
        return random.uniform(15.0, 45.0)
    
    def _calculate_engagement_score(self, views: int, shares: int, comments: int) -> float:
        """Calculate content engagement score"""
        if views == 0:
            return 0.0
        
        # Weighted engagement score
        share_weight = 3.0
        comment_weight = 5.0
        
        score = (shares * share_weight + comments * comment_weight) / views * 100
        return min(score, 100.0)  # Cap at 100
    
    def _calculate_accuracy(self, anchor_name: str) -> float:
        """Calculate anchor accuracy percentage"""
        # Mock accuracy calculation
        accuracies = {
            'Ray McPatriot': 23.5,
            'Berkeley Justice': 31.2,
            'Switz Middleton': 45.8
        }
        return accuracies.get(anchor_name, 25.0)
    
    def _calculate_viewer_rating(self, anchor_name: str) -> float:
        """Calculate viewer rating for anchor"""
        # Mock viewer rating
        ratings = {
            'Ray McPatriot': 4.2,
            'Berkeley Justice': 3.8,
            'Switz Middleton': 4.5
        }
        return ratings.get(anchor_name, 4.0)
    
    async def _get_current_viewers(self) -> int:
        """Get current viewer count"""
        import random
        return random.randint(180000, 280000)
    
    async def _get_today_stats(self) -> Dict:
        """Get today's statistics"""
        return {
            'total_views': await self._get_total_views_today(),
            'unique_viewers': await self._get_unique_viewers_today(),
            'articles_published': 15,
            'breakdowns': 8,
            'confusion_incidents': 23,
            'sponsor_mentions': 45,
            'mobile_app_downloads': 127
        }
    
    async def _get_anchor_performance_summary(self) -> Dict:
        """Get anchor performance summary"""
        return {
            'Ray McPatriot': {
                'airtime_hours': 8.5,
                'breakdowns': 3,
                'accuracy': 23.5,
                'viewer_rating': 4.2,
                'confusion_level': 87
            },
            'Berkeley Justice': {
                'airtime_hours': 6.2,
                'breakdowns': 2,
                'accuracy': 31.2,
                'viewer_rating': 3.8,
                'confusion_level': 76
            },
            'Switz Middleton': {
                'airtime_hours': 7.1,
                'breakdowns': 3,
                'accuracy': 45.8,
                'viewer_rating': 4.5,
                'confusion_level': 62
            }
        }
    
    async def _get_top_content_today(self) -> List[Dict]:
        """Get top performing content today"""
        return [
            {
                'title': 'Ray Creates 17 New Words',
                'category': 'linguistic_disaster',
                'views': 45000,
                'engagement_score': 85.2
            },
            {
                'title': 'Bee Questions Own Existence',
                'category': 'identity_crisis',
                'views': 38000,
                'engagement_score': 78.5
            },
            {
                'title': 'Switz Achieves Gravy Singularity',
                'category': 'gravy_emergency',
                'views': 52000,
                'engagement_score': 92.1
            }
        ]
    
    async def _get_engagement_summary(self) -> Dict:
        """Get engagement metrics summary"""
        return {
            'average_session_duration': 22.5,
            'bounce_rate': 15.2,
            'pages_per_session': 3.8,
            'breakdown_triggers_purchased': 47,
            'comments_posted': 1250,
            'social_shares': 2300
        }
    
    async def _get_revenue_summary(self) -> Dict:
        """Get revenue metrics summary"""
        return {
            'today_total': 2847.50,
            'breakdown_triggers': 1234.50,
            'sponsors': 1500.00,
            'mobile_premium': 113.00,
            'month_to_date': 85420.75,
            'projected_monthly': 125000.00
        }
    
    async def _get_current_show_info(self) -> Dict:
        """Get current show information"""
        from core.programming_schedule import programming_schedule
        current_show, slot = programming_schedule.get_current_show()
        
        return {
            'name': current_show.name,
            'anchor': current_show.anchor,
            'start_time': slot.start_time.strftime('%H:%M'),
            'end_time': slot.end_time.strftime('%H:%M')
        }
    
    async def _get_trending_topics(self) -> List[str]:
        """Get current trending topics"""
        return [
            "#BreakingNews",
            "#ExistentialCrisis", 
            "#GravyEmergency",
            "#FactCheckFail",
            "#AIAnchors"
        ]
    
    async def _get_active_alerts(self) -> int:
        """Get number of active emergency alerts"""
        return 0  # No active alerts currently
    
    async def _get_revenue_today(self) -> float:
        """Get today's revenue"""
        return 2847.50
    
    def _analyze_hourly_patterns(self, rows: List) -> Dict:
        """Analyze viewership by hour"""
        # Mock hourly analysis
        return {
            'peak_hour': '20:00',
            'lowest_hour': '04:00',
            'average_variation': '±15%'
        }
    
    def _analyze_platform_distribution(self, rows: List) -> Dict:
        """Analyze platform distribution"""
        return {
            'web': 65,
            'mobile_app': 30,
            'smart_tv': 5
        }
    
    def _analyze_geographic_distribution(self, rows: List) -> Dict:
        """Analyze geographic distribution"""
        return {
            'United States': 45,
            'Canada': 20,
            'United Kingdom': 15,
            'Australia': 10,
            'Other': 10
        }
    
    def _find_peak_viewing_times(self, rows: List) -> List[str]:
        """Find peak viewing times"""
        return ['19:00-21:00', '12:00-14:00', '07:00-09:00']
    
    def _calculate_average_metrics(self, rows: List) -> Dict:
        """Calculate average metrics"""
        return {
            'avg_concurrent_viewers': 225000,
            'avg_session_duration': 28.5,
            'avg_daily_views': 450000
        }
    
    def get_analytics_summary(self) -> Dict:
        """Get overall analytics summary"""
        return {
            'total_data_points': 50000,
            'analytics_categories': [
                'Viewership', 'Content Performance', 'Anchor Metrics',
                'User Engagement', 'Revenue', 'Social Media'
            ],
            'reporting_period': '30 days',
            'last_updated': datetime.now().isoformat()
        }

# Global analytics instance
analytics_dashboard = AnalyticsDashboard()

if __name__ == "__main__":
    # Test analytics dashboard
    async def test_analytics():
        dashboard = AnalyticsDashboard()
        
        # Record some test data
        await dashboard.record_viewership(250000, {'web': 150000, 'mobile': 100000})
        await dashboard.record_anchor_performance('Ray McPatriot', 60, 2, 5, 8)
        
        # Get dashboard overview
        overview = await dashboard.get_dashboard_overview()
        print("Dashboard Overview:")
        for key, value in overview.items():
            if isinstance(value, dict):
                print(f"  {key}: {len(value)} items")
            else:
                print(f"  {key}: {value}")
        
        # Get real-time metrics
        realtime = await dashboard.get_realtime_metrics()
        print(f"\nReal-time viewers: {realtime['live_viewers']:,}")
        print(f"Current show: {realtime['current_show']['name']}")
    
    import asyncio
    asyncio.run(test_analytics())