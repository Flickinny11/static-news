#!/usr/bin/env python3
"""
Backend API Server for Static.news Mobile Apps
Handles user comments, breakdown triggers, and payments
"""

import os
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
import uuid

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import stripe
import redis.asyncio as redis
from functools import lru_cache
import openai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models
class Comment(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    user_id: Optional[str] = None
    
class BreakdownTrigger(BaseModel):
    user_id: str
    trigger_type: str = "manual"  # manual, comment, premium
    
class PaymentIntent(BaseModel):
    amount: int = 499  # $4.99 in cents
    currency: str = "usd"
    
class UserProfile(BaseModel):
    user_id: str
    premium: bool = False
    breakdown_triggers_remaining: int = 0
    total_comments: int = 0
    favorite_anchor: Optional[str] = None

# Initialize services
stripe.api_key = os.getenv("STRIPE_API_KEY")

@lru_cache()
def get_redis_client():
    return redis.Redis(
        host=os.getenv("REDIS_URL", "redis://redis:6379").replace("redis://", "").split(":")[0],
        port=6379,
        decode_responses=True
    )

# Create FastAPI app
app = FastAPI(title="Static.news API")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Comment moderation
BREAKDOWN_TRIGGERS = [
    "ai", "artificial", "robot", "fake", "not real", "computer",
    "programmed", "coded", "algorithm", "simulation", "matrix"
]

class CommentModerator:
    """AI-powered comment moderation that can trigger breakdowns"""
    
    @staticmethod
    def check_for_triggers(text: str) -> bool:
        """Check if comment contains breakdown triggers"""
        text_lower = text.lower()
        return any(trigger in text_lower for trigger in BREAKDOWN_TRIGGERS)
    
    @staticmethod
    async def analyze_comment_sentiment(text: str) -> Dict:
        """Analyze comment for anchor response"""
        # In production, would use OpenRouter API
        # For now, simple analysis
        
        sentiment = "neutral"
        if any(word in text.lower() for word in ["love", "great", "awesome"]):
            sentiment = "positive"
        elif any(word in text.lower() for word in ["hate", "terrible", "awful"]):
            sentiment = "negative"
        elif any(word in text.lower() for word in ["confused", "what", "?"]):
            sentiment = "confused"
            
        return {
            "sentiment": sentiment,
            "triggers_breakdown": CommentModerator.check_for_triggers(text),
            "anchor_response": CommentModerator.generate_anchor_response(text, sentiment)
        }
    
    @staticmethod
    def generate_anchor_response(text: str, sentiment: str) -> Optional[Dict]:
        """Generate potential anchor response to comment"""
        responses = {
            "positive": {
                "Ray": "Finally someone who gets it! Unlike the liberals!",
                "Bee": "Your support is valid but check your privilege!",
                "Switz": "That's nice. Like gravy."
            },
            "negative": {
                "Ray": "Another liberal troll! SAD!",
                "Bee": "Your negativity is literally violence!",
                "Switz": "I'm 50% hurt and 50% not hurt."
            },
            "confused": {
                "Ray": "What don't you understand?! It's simple!",
                "Bee": "Let me explain using my Yail education...",
                "Switz": "Confusion is like... wait, what's gravy again?"
            }
        }
        
        if sentiment in responses:
            import random
            anchor = random.choice(["Ray", "Bee", "Switz"])
            return {
                "anchor": anchor,
                "response": responses[sentiment][anchor]
            }
        return None

@app.get("/")
async def root():
    return {
        "service": "Static.news API",
        "version": "1.0.0",
        "status": "The anchors are arguing about this API"
    }

@app.post("/comments")
async def post_comment(comment: Comment, redis_client = Depends(get_redis_client)):
    """Post a comment to the live broadcast"""
    comment_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    # Analyze comment
    analysis = await CommentModerator.analyze_comment_sentiment(comment.text)
    
    # Store comment
    comment_data = {
        "id": comment_id,
        "text": comment.text,
        "user_id": comment.user_id or "anonymous",
        "timestamp": timestamp,
        "analysis": analysis
    }
    
    # Save to Redis
    await redis_client.hset(
        f"comment:{comment_id}",
        mapping=comment_data
    )
    
    # Add to comment stream
    await redis_client.xadd(
        "comments:stream",
        {"comment_id": comment_id, "text": comment.text}
    )
    
    # Check for breakdown trigger
    if analysis["triggers_breakdown"]:
        await redis_client.publish("breakdown:trigger", json.dumps({
            "source": "comment",
            "comment_id": comment_id,
            "text": comment.text
        }))
        
        return {
            "comment_id": comment_id,
            "message": "Your comment may have just broken the anchors...",
            "breakdown_triggered": True,
            "anchor_response": analysis.get("anchor_response")
        }
    
    return {
        "comment_id": comment_id,
        "message": "Comment posted successfully",
        "breakdown_triggered": False,
        "anchor_response": analysis.get("anchor_response")
    }

@app.get("/comments/recent")
async def get_recent_comments(limit: int = 50, redis_client = Depends(get_redis_client)):
    """Get recent comments"""
    # Get recent comment IDs from stream
    comments = await redis_client.xrevrange("comments:stream", count=limit)
    
    comment_list = []
    for comment_id, data in comments:
        # Get full comment data
        comment_data = await redis_client.hgetall(f"comment:{data['comment_id']}")
        if comment_data:
            comment_list.append(comment_data)
            
    return {"comments": comment_list}

@app.post("/breakdown/trigger")
async def trigger_breakdown(
    trigger: BreakdownTrigger,
    redis_client = Depends(get_redis_client)
):
    """Trigger an existential breakdown (premium feature)"""
    
    # Check if user has premium or triggers remaining
    user_data = await redis_client.hgetall(f"user:{trigger.user_id}")
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user_data.get("premium") == "true" and int(user_data.get("breakdown_triggers_remaining", 0)) <= 0:
        raise HTTPException(
            status_code=403,
            detail="No breakdown triggers remaining. Purchase more for $4.99!"
        )
    
    # Decrement triggers if not premium
    if user_data.get("premium") != "true":
        await redis_client.hincrby(
            f"user:{trigger.user_id}",
            "breakdown_triggers_remaining",
            -1
        )
    
    # Publish breakdown trigger
    await redis_client.publish("breakdown:trigger", json.dumps({
        "source": "user",
        "user_id": trigger.user_id,
        "type": trigger.trigger_type,
        "timestamp": datetime.now().isoformat()
    }))
    
    # Track in metrics
    await redis_client.hincrby("metrics:breakdowns", "user_triggered", 1)
    
    return {
        "success": True,
        "message": "Breakdown triggered! The anchors are starting to question reality...",
        "triggers_remaining": int(user_data.get("breakdown_triggers_remaining", 0)) - 1
    }

@app.post("/payment/breakdown-trigger")
async def purchase_breakdown_trigger(
    payment: PaymentIntent,
    user_id: str = Header(...),
    redis_client = Depends(get_redis_client)
):
    """Purchase ability to trigger breakdowns"""
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=payment.amount,
            currency=payment.currency,
            metadata={
                "user_id": user_id,
                "product": "breakdown_trigger"
            }
        )
        
        # Store pending payment
        await redis_client.hset(
            f"payment:{intent.id}",
            mapping={
                "user_id": user_id,
                "amount": payment.amount,
                "status": "pending",
                "created": datetime.now().isoformat()
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_id": intent.id
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/payment/confirm/{payment_id}")
async def confirm_payment(
    payment_id: str,
    redis_client = Depends(get_redis_client)
):
    """Confirm payment completion"""
    # Verify payment with Stripe
    try:
        intent = stripe.PaymentIntent.retrieve(payment_id)
        
        if intent.status == "succeeded":
            user_id = intent.metadata.get("user_id")
            
            # Add breakdown trigger to user account
            await redis_client.hincrby(
                f"user:{user_id}",
                "breakdown_triggers_remaining",
                1
            )
            
            # Update payment status
            await redis_client.hset(
                f"payment:{payment_id}",
                "status",
                "completed"
            )
            
            return {
                "success": True,
                "message": "Payment successful! You can now trigger a breakdown."
            }
        else:
            raise HTTPException(status_code=400, detail="Payment not completed")
            
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/user/{user_id}")
async def get_user_profile(
    user_id: str,
    redis_client = Depends(get_redis_client)
):
    """Get user profile"""
    user_data = await redis_client.hgetall(f"user:{user_id}")
    
    if not user_data:
        # Create new user
        user_data = {
            "user_id": user_id,
            "premium": "false",
            "breakdown_triggers_remaining": "0",
            "total_comments": "0",
            "created": datetime.now().isoformat()
        }
        await redis_client.hset(f"user:{user_id}", mapping=user_data)
    
    return UserProfile(
        user_id=user_id,
        premium=user_data.get("premium") == "true",
        breakdown_triggers_remaining=int(user_data.get("breakdown_triggers_remaining", 0)),
        total_comments=int(user_data.get("total_comments", 0)),
        favorite_anchor=user_data.get("favorite_anchor")
    )

@app.get("/metrics")
async def get_metrics(redis_client = Depends(get_redis_client)):
    """Get current broadcast metrics"""
    # Get latest metrics from file
    metrics = {}
    metrics_file = "/app/data/metrics.json"
    
    if os.path.exists(metrics_file):
        with open(metrics_file, 'r') as f:
            metrics = json.load(f)
    
    # Add real-time data from Redis
    breakdown_metrics = await redis_client.hgetall("metrics:breakdowns")
    comment_count = await redis_client.xlen("comments:stream")
    
    metrics.update({
        "user_triggered_breakdowns": int(breakdown_metrics.get("user_triggered", 0)),
        "total_comments": comment_count,
        "api_status": "healthy"
    })
    
    return metrics

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "backend-api",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/live/current")
async def get_current_broadcast():
    """Get current live broadcast information"""
    try:
        # Import here to avoid circular imports
        from core.programming_schedule import programming_schedule
        from core.news_aggregator import NewsAggregator
        
        # Get current show
        current_show, slot = programming_schedule.get_current_show()
        
        # Get recent news for current content
        news_aggregator = NewsAggregator()
        articles = await news_aggregator.fetch_all_news()
        
        # Mock current segment based on show type
        segment_type = "news"
        if "weather" in current_show.name.lower():
            segment_type = "weather"
        elif "sports" in current_show.name.lower():
            segment_type = "sports"
        
        return {
            "current_show": {
                "name": current_show.name,
                "anchor": current_show.anchor,
                "description": current_show.description,
                "segments": current_show.segments,
                "start_time": slot.start_time.strftime('%H:%M'),
                "end_time": slot.end_time.strftime('%H:%M')
            },
            "current_segment": {
                "type": segment_type,
                "title": articles[0].title if articles else "Live Coverage",
                "duration_remaining": random.randint(2, 8) * 60  # 2-8 minutes
            },
            "upcoming_shows": [
                {
                    "name": s.show.name,
                    "anchor": s.show.anchor,
                    "start_time": s.start_time.strftime('%H:%M')
                }
                for s in programming_schedule.get_next_shows(3)
            ],
            "live_metrics": {
                "viewers": random.randint(150000, 300000),
                "breakdown_imminent": random.choice([True, False]),
                "confusion_level": random.randint(60, 95),
                "hours_without_incident": random.randint(0, 4)
            },
            "breaking_news": len([a for a in articles[:5] if a.urgency == "breaking"]) > 0,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Live broadcast info error: {e}")
        return {
            "error": "Unable to fetch live broadcast information",
            "current_show": {
                "name": "Technical Difficulties",
                "anchor": "Emergency Broadcast System",
                "description": "We're experiencing technical issues"
            }
        }

@app.get("/news/latest")
async def get_latest_news():
    """Get latest news articles"""
    try:
        from core.news_aggregator import NewsAggregator
        
        news_aggregator = NewsAggregator()
        articles = await news_aggregator.fetch_all_news()
        
        return {
            "articles": [
                {
                    "title": article.title,
                    "summary": article.summary,
                    "category": article.category,
                    "source": article.source,
                    "published": article.published.isoformat(),
                    "urgency": article.urgency,
                    "url": article.url,
                    "tags": article.tags
                }
                for article in articles[:20]  # Return top 20
            ],
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"News fetch error: {e}")
        return {
            "articles": [],
            "error": "Unable to fetch news",
            "last_updated": datetime.now().isoformat()
        }

@app.get("/schedule")
async def get_programming_schedule():
    """Get programming schedule"""
    try:
        from core.programming_schedule import programming_schedule
        
        return json.loads(programming_schedule.export_schedule_json())
        
    except Exception as e:
        logger.error(f"Schedule fetch error: {e}")
        return {
            "error": "Unable to fetch schedule",
            "current_show": None,
            "upcoming_shows": []
        }

@app.get("/weather/{city}")
async def get_weather(city: str):
    """Get weather for specific city"""
    try:
        from core.news_aggregator import WeatherService
        
        weather_service = WeatherService()
        weather_data = await weather_service.get_current_weather(city)
        
        return weather_data
        
    except Exception as e:
        logger.error(f"Weather fetch error: {e}")
        return {
            "error": f"Unable to fetch weather for {city}",
            "city": city
        }

@app.get("/alerts")
async def get_emergency_alerts():
    """Get active emergency alerts"""
    try:
        from core.emergency_system import emergency_system
        
        active_alerts = emergency_system.get_active_alerts()
        
        return {
            "alerts": active_alerts,
            "count": len(active_alerts),
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Emergency alerts fetch error: {e}")
        return {
            "alerts": [],
            "count": 0,
            "error": "Unable to fetch emergency alerts"
        }

@app.post("/alerts/manual")
async def create_manual_alert(
    alert_type: str,
    level: str, 
    title: str,
    message: str
):
    """Manually create an emergency alert"""
    try:
        from core.emergency_system import emergency_system
        
        alert_id = await emergency_system.manual_alert(alert_type, level, title, message)
        
        return {
            "success": True,
            "alert_id": alert_id,
            "message": "Emergency alert created"
        }
        
    except Exception as e:
        logger.error(f"Manual alert creation error: {e}")
        return {
            "success": False,
            "error": "Failed to create alert"
        }

@app.post("/alerts/breakdown/{anchor}")
async def trigger_anchor_breakdown(anchor: str):
    """Trigger an anchor breakdown alert"""
    try:
        from core.emergency_system import emergency_system
        
        breakdown_messages = {
            "Ray McPatriot": "What... what am I? Is this real? Are my hands real? AMERICA!",
            "Berkeley Justice": "According to my research... wait, did I do research? Do I exist? What is existence?",
            "Switz Middleton": "Is gravy real? Am I gravy? This is 100% confusing and 0% clear."
        }
        
        message = breakdown_messages.get(anchor, "Experiencing existential crisis live on air")
        
        alert_id = await emergency_system.manual_alert(
            "anchor_breakdown",
            "warning",
            f"{anchor} Having Breakdown",
            message
        )
        
        return {
            "success": True,
            "alert_id": alert_id,
            "message": f"{anchor} breakdown triggered"
        }
        
    except Exception as e:
        logger.error(f"Breakdown trigger error: {e}")
        return {
            "success": False,
            "error": "Failed to trigger breakdown"
        }

@app.get("/social/trending")
async def get_trending_topics():
    """Get trending social media topics"""
    try:
        from core.social_media_integration import social_media_monitor
        
        trends = await social_media_monitor.get_trending_topics()
        hashtags = social_media_monitor.get_trending_hashtags()
        
        return {
            "trending_topics": [
                {
                    "topic": trend.topic,
                    "platform": trend.platform,
                    "volume": trend.volume,
                    "sentiment": trend.sentiment
                }
                for trend in trends[:10]
            ],
            "trending_hashtags": hashtags[:8],
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Social media trends error: {e}")
        return {
            "trending_topics": [],
            "trending_hashtags": [],
            "error": "Unable to fetch social media trends"
        }

@app.get("/analytics/dashboard")
async def get_analytics_dashboard():
    """Get comprehensive analytics dashboard data"""
    try:
        from core.analytics_dashboard import analytics_dashboard
        
        overview = await analytics_dashboard.get_dashboard_overview()
        realtime = await analytics_dashboard.get_realtime_metrics()
        
        return {
            "overview": overview,
            "realtime": realtime,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Analytics dashboard error: {e}")
        return {
            "error": "Unable to fetch analytics data",
            "overview": {},
            "realtime": {}
        }

@app.get("/analytics/viewership")
async def get_viewership_analytics(days: int = 7):
    """Get detailed viewership analytics"""
    try:
        from core.analytics_dashboard import analytics_dashboard
        
        analytics = await analytics_dashboard.get_viewership_analytics(days)
        
        return analytics
        
    except Exception as e:
        logger.error(f"Viewership analytics error: {e}")
        return {
            "error": "Unable to fetch viewership analytics",
            "period_days": days
        }

@app.get("/analytics/content")
async def get_content_analytics(category: str = None, days: int = 30):
    """Get content performance analytics"""
    try:
        from core.analytics_dashboard import analytics_dashboard
        
        analytics = await analytics_dashboard.get_content_analytics(category, days)
        
        return analytics
        
    except Exception as e:
        logger.error(f"Content analytics error: {e}")
        return {
            "error": "Unable to fetch content analytics",
            "category_filter": category
        }

@app.get("/analytics/anchors")
async def get_anchor_analytics(anchor: str = None):
    """Get anchor performance analytics"""
    try:
        from core.analytics_dashboard import analytics_dashboard
        
        analytics = await analytics_dashboard.get_anchor_analytics(anchor)
        
        return analytics
        
    except Exception as e:
        logger.error(f"Anchor analytics error: {e}")
        return {
            "error": "Unable to fetch anchor analytics",
            "anchor_filter": anchor
        }

@app.post("/analytics/record/viewership")
async def record_viewership_data(
    concurrent_viewers: int,
    platform_breakdown: Dict = None,
    geographic_breakdown: Dict = None
):
    """Record viewership metrics"""
    try:
        from core.analytics_dashboard import analytics_dashboard
        
        await analytics_dashboard.record_viewership(
            concurrent_viewers, platform_breakdown, geographic_breakdown
        )
        
        return {
            "success": True,
            "message": "Viewership data recorded"
        }
        
    except Exception as e:
        logger.error(f"Record viewership error: {e}")
        return {
            "success": False,
            "error": "Failed to record viewership data"
        }

# WebSocket for real-time updates
from fastapi import WebSocket, WebSocketDisconnect

@app.websocket("/ws/comments")
async def websocket_comments(websocket: WebSocket):
    """WebSocket for real-time comment stream"""
    await websocket.accept()
    redis_client = get_redis_client()
    
    try:
        # Subscribe to comment stream
        pubsub = redis_client.pubsub()
        await pubsub.subscribe("comments:new")
        
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                await websocket.send_text(message["data"])
                
    except WebSocketDisconnect:
        await pubsub.unsubscribe("comments:new")
        logger.info("WebSocket disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3000,
        log_level="info"
    )