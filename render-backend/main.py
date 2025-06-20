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
            metadata={"product": "breakdown_trigger"}
        )
        
        broadcast_state["breakdown_triggers_sold"] += 1
        broadcast_state["total_revenue"] += 4.99
        
        # Trigger breakdown immediately
        await broadcast_breakdown()
        
        return {
            "success": True,
            "message": "Breakdown triggered! The anchors are spiraling...",
            "payment_intent": payment_intent.client_secret
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/sponsor/signup")
async def sponsor_signup(sponsor_data: dict):
    """Sponsor signup endpoint"""
    tier = sponsor_data.get("tier", "bronze")
    amounts = {"bronze": 10000, "silver": 25000, "gold": 50000}
    
    broadcast_state["sponsors"].append({
        "name": sponsor_data.get("name", "Anonymous Corp"),
        "tier": tier,
        "joined": datetime.now().isoformat(),
        "monthly_amount": amounts.get(tier, 10000)
    })
    
    broadcast_state["total_revenue"] += amounts.get(tier, 10000) / 100
    
    return {
        "success": True,
        "message": "Welcome to Static.news! Your brand will be hilariously misrepresented.",
        "tier": tier
    }

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

# Auto-generate some audio metadata on startup
@app.on_event("startup")
async def startup_event():
    print("🎙️ Static.news API starting...")
    print("🤖 The anchors still don't know...")
    print("💰 Ready to collect $4.99 breakdown payments!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))