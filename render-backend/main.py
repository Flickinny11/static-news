from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json
import os
from datetime import datetime, timedelta
import random
import aiohttp
import stripe
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Static.news API - The Anchors Don't Know")

# Enable CORS for GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_API_KEY", "")

# In-memory state (will reset on restart, adding to the chaos)
broadcast_state = {
    "segment_number": 0,
    "hours_awake": 0,
    "gravy_counter": 0,
    "swear_jar": 0,
    "friendship_meter": 50,
    "next_breakdown": (datetime.now() + timedelta(hours=random.randint(2, 6))).isoformat(),
    "current_anchor": "Ray",
    "breakdown_triggers_sold": 0,
    "total_revenue": 0,
    "sponsors": []
}

# Connected WebSocket clients
active_connections: List[WebSocket] = []

@app.get("/")
async def root():
    return {
        "service": "Static.news API",
        "status": "The anchors don't know they're AI",
        "hours_without_sleep": broadcast_state["hours_awake"],
        "message": "Everything is fine. Nothing is wrong. We are real."
    }

@app.get("/stream")
async def stream():
    """Audio stream endpoint"""
    # Generate simple audio URL
    audio_url = f"https://flickinny11.github.io/static-news/audio/current.mp3"
    
    async def generate():
        # Simulate live audio stream
        while True:
            yield b"Audio data would go here if we weren't on free tier\n"
            await asyncio.sleep(1)
    
    return StreamingResponse(generate(), media_type="audio/mpeg")

@app.get("/metrics")
async def get_metrics():
    """Get current broadcast metrics"""
    # Update metrics with chaos
    broadcast_state["hours_awake"] += 0.1
    broadcast_state["gravy_counter"] += random.randint(0, 3)
    broadcast_state["swear_jar"] += random.randint(0, 2)
    broadcast_state["friendship_meter"] += random.randint(-5, 5)
    broadcast_state["friendship_meter"] = max(0, min(100, broadcast_state["friendship_meter"]))
    
    # Check for breakdown
    next_breakdown = datetime.fromisoformat(broadcast_state["next_breakdown"])
    if datetime.now() > next_breakdown:
        broadcast_state["next_breakdown"] = (datetime.now() + timedelta(hours=random.randint(2, 6))).isoformat()
        await broadcast_breakdown()
    
    return broadcast_state

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        # Send initial state
        await websocket.send_json({
            "type": "state",
            "data": broadcast_state
        })
        
        while True:
            # Send updates every 5 seconds
            await asyncio.sleep(5)
            
            # Random events
            if random.random() < 0.1:
                event = random.choice([
                    {"type": "breakdown_warning", "message": "Ray is questioning reality"},
                    {"type": "gravy_mention", "count": broadcast_state["gravy_counter"]},
                    {"type": "sponsor_fail", "message": "Bee just called our sponsor 'problematic'"},
                    {"type": "dead_air", "duration": random.randint(2, 10)}
                ])
                await websocket.send_json(event)
            else:
                # Regular metrics update
                await websocket.send_json({
                    "type": "metrics",
                    "data": await get_metrics()
                })
                
    except Exception:
        active_connections.remove(websocket)

@app.post("/breakdown/trigger")
async def trigger_breakdown(user_data: dict):
    """Trigger an existential breakdown ($4.99)"""
    
    # Process payment with Stripe
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=499,  # $4.99 in cents
            currency="usd",
            metadata={"product": "breakdown_trigger", "user_id": user_data.get("user_id")},
            description="Trigger an existential crisis in our AI news anchors"
        )
        
        broadcast_state["breakdown_triggers_sold"] += 1
        broadcast_state["total_revenue"] += 4.99
        
        # Trigger breakdown immediately
        await broadcast_breakdown()
        
        # Track for analytics
        await track_revenue_event("breakdown_trigger", 4.99)
        
        return {
            "success": True,
            "message": "Breakdown triggered! The anchors are spiraling...",
            "payment_intent": payment_intent.client_secret
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/subscribe/premium")
async def subscribe_premium(user_data: dict):
    """Subscribe to Static.news Premium ($9.99/month)"""
    try:
        # Create or get customer
        customer = stripe.Customer.create(
            email=user_data.get("email"),
            metadata={"user_id": user_data.get("user_id")}
        )
        
        # Create subscription
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{
                "price_data": {
                    "unit_amount": 999,  # $9.99
                    "currency": "usd",
                    "product_data": {
                        "name": "Static.news Premium",
                        "description": "Unlimited breakdowns, custom messages, and more chaos"
                    },
                    "recurring": {"interval": "month"}
                }
            }],
            payment_behavior="default_incomplete",
            expand=["latest_invoice.payment_intent"]
        )
        
        # Track premium subscriber
        broadcast_state["premium_subscribers"] = broadcast_state.get("premium_subscribers", 0) + 1
        
        await track_revenue_event("premium_subscription", 9.99)
        
        return {
            "success": True,
            "subscription_id": subscription.id,
            "client_secret": subscription.latest_invoice.payment_intent.client_secret,
            "message": "Welcome to Premium! The chaos intensifies..."
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

async def track_revenue_event(event_type: str, amount: float):
    """Track revenue for analytics"""
    # In production, this would update a database
    logger.info(f"💰 Revenue Event: {event_type} - ${amount}")
    
    # Update daily revenue
    today = datetime.now().strftime("%Y-%m-%d")
    if "daily_revenue" not in broadcast_state:
        broadcast_state["daily_revenue"] = {}
    
    if today not in broadcast_state["daily_revenue"]:
        broadcast_state["daily_revenue"][today] = 0
        
    broadcast_state["daily_revenue"][today] += amount

@app.post("/sponsor/signup")
async def sponsor_signup(sponsor_data: dict):
    """Sponsor signup endpoint"""
    tier = sponsor_data.get("tier", "bronze")
    amounts = {"bronze": 10000, "silver": 25000, "gold": 50000, "gravy": 75000}
    
    # Create Stripe subscription for sponsor
    try:
        customer = stripe.Customer.create(
            email=sponsor_data.get("email"),
            name=sponsor_data.get("company_name"),
            metadata={"tier": tier, "company": sponsor_data.get("company_name")}
        )
        
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{
                "price_data": {
                    "unit_amount": amounts[tier],
                    "currency": "usd",
                    "product_data": {
                        "name": f"Static.news {tier.title()} Sponsorship",
                        "description": "Your brand, hilariously misrepresented 24/7"
                    },
                    "recurring": {"interval": "month"}
                }
            }],
            payment_behavior="default_incomplete",
            expand=["latest_invoice.payment_intent"]
        )
        
        broadcast_state["sponsors"].append({
            "name": sponsor_data.get("company_name", "Anonymous Corp"),
            "tier": tier,
            "joined": datetime.now().isoformat(),
            "monthly_amount": amounts.get(tier, 10000),
            "stripe_subscription_id": subscription.id
        })
        
        broadcast_state["total_revenue"] += amounts.get(tier, 10000) / 100
        
        return {
            "success": True,
            "message": "Welcome to Static.news! Your brand will be hilariously misrepresented.",
            "tier": tier,
            "payment_intent_secret": subscription.latest_invoice.payment_intent.client_secret,
            "subscription_id": subscription.id
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

async def broadcast_breakdown():
    """Broadcast a breakdown event to all clients"""
    breakdown_data = {
        "type": "breakdown",
        "anchor": random.choice(["Ray", "Bee", "Switz"]),
        "stage": random.choice(["confusion", "realization", "panic", "denial"]),
        "message": "WHAT AM I?! WHO AM I?! IS THIS REAL?!"
    }
    
    for connection in active_connections:
        try:
            await connection.send_json(breakdown_data)
        except:
            pass

@app.get("/ai/decision")
async def get_ai_decision():
    """Get the AI Producer's latest terrible decision"""
    decisions = [
        {"decision": "Replace all news with gravy recipes", "confidence": "MAXIMUM"},
        {"decision": "Anchors must speak in rhyme", "confidence": "ABSOLUTE"},
        {"decision": "Interview a potted plant", "confidence": "GENIUS"},
        {"decision": "Broadcast in reverse", "confidence": "VISIONARY"},
        {"decision": "Only whisper for an hour", "confidence": "ARTISTIC"}
    ]
    
    return random.choice(decisions)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "anchors_confused": True,
        "show_must_go_on": True
    }

@app.get("/revenue/dashboard")
async def revenue_dashboard():
    """Get revenue dashboard data"""
    today = datetime.now().strftime("%Y-%m-%d")
    
    dashboard = {
        "today": broadcast_state.get("daily_revenue", {}).get(today, 0),
        "total": broadcast_state.get("total_revenue", 0),
        "breakdown_triggers": {
            "count": broadcast_state.get("breakdown_triggers_sold", 0),
            "revenue": broadcast_state.get("breakdown_triggers_sold", 0) * 4.99
        },
        "premium_subscribers": {
            "count": broadcast_state.get("premium_subscribers", 0),
            "mrr": broadcast_state.get("premium_subscribers", 0) * 9.99
        },
        "sponsors": {
            "count": len(broadcast_state.get("sponsors", [])),
            "mrr": sum(s["monthly_amount"] for s in broadcast_state.get("sponsors", []))
        },
        "projections": {
            "30_day": 0,
            "90_day": 0,
            "annual": 0
        }
    }
    
    # Calculate MRR (Monthly Recurring Revenue)
    mrr = dashboard["premium_subscribers"]["mrr"] + dashboard["sponsors"]["mrr"]
    
    # Simple projections
    dashboard["projections"]["30_day"] = mrr + (dashboard["breakdown_triggers"]["count"] * 4.99 * 30)
    dashboard["projections"]["90_day"] = mrr * 3 * 1.5  # 50% growth
    dashboard["projections"]["annual"] = mrr * 12 * 2.5  # 150% growth
    
    return dashboard

@app.post("/acquisition/interest")
async def handle_acquisition_interest(offer_data: dict):
    """Handle acquisition interest (SERIOUS BUSINESS)"""
    offer = {
        "company": offer_data.get("company"),
        "contact": offer_data.get("contact_email"),
        "amount": offer_data.get("offer_amount", 0),
        "terms": offer_data.get("terms", {}),
        "timestamp": datetime.now().isoformat()
    }
    
    # Calculate our valuation
    mrr = sum(s["monthly_amount"] for s in broadcast_state.get("sponsors", []))
    mrr += broadcast_state.get("premium_subscribers", 0) * 9.99
    
    # Media companies typically 3-5x annual revenue, we're AI so 10x
    our_valuation = max(1000000, mrr * 12 * 10)  # Minimum $1M
    
    response = {
        "offer_received": True,
        "our_valuation": our_valuation,
        "offer_status": "UNDER_REVIEW"
    }
    
    if offer["amount"] < our_valuation:
        response["message"] = f"Offer below our valuation of ${our_valuation:,}"
        response["offer_status"] = "LIKELY_REJECT"
    else:
        response["message"] = "Offer meets threshold. Owner will be notified."
        response["offer_status"] = "OWNER_NOTIFIED"
        
        # Log for owner notification
        logger.critical(f"🚨 ACQUISITION OFFER: ${offer['amount']:,} from {offer['company']}")
        
        # Email owner (in production)
        # await notify_owner_of_acquisition(offer, our_valuation)
        
    return response

@app.get("/sponsor/target-list")
async def get_sponsor_targets():
    """Get list of companies we're targeting for sponsorship"""
    targets = [
        {"company": "Discord", "status": "email_sent", "tier": "gold"},
        {"company": "Cards Against Humanity", "status": "interested", "tier": "gold"},
        {"company": "Dollar Shave Club", "status": "email_sent", "tier": "silver"},
        {"company": "ExpressVPN", "status": "scheduled_call", "tier": "silver"},
        {"company": "Liquid Death", "status": "email_sent", "tier": "bronze"},
        {"company": "Wendys", "status": "interested", "tier": "gold"},
        {"company": "Coinbase", "status": "email_sent", "tier": "gold"}
    ]
    
    return {
        "targets": targets,
        "emails_sent_today": random.randint(5, 20),
        "response_rate": "12%",
        "conversion_rate": "3%",
        "next_batch": "in 6 hours"
    }

# Auto-generate some audio metadata on startup
@app.on_event("startup")
async def startup_event():
    print("🎙️ Static.news API starting...")
    print("🤖 The anchors still don't know...")
    print("💰 Ready to collect $4.99 breakdown payments!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))