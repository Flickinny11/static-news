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