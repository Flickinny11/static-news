"""
Static.news Backend - Hugging Face Spaces Deployment
Free tier with Hugging Face Inference API
"""

import os
import json
import asyncio
import random
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
from typing import List, Dict, Any
import numpy as np
import io
import wave

app = FastAPI(title="Static.news Backend")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
HF_API_KEY = os.getenv("HF_API_KEY", "")

# State management
class BroadcastState:
    def __init__(self):
        self.current_anchor = "Ray McPatriot"
        self.metrics = {
            "hours_awake": 127,
            "gravy_counter": 0,
            "swear_jar": 45,
            "friendship_meter": 23,
            "confusion_level": 87
        }
        self.is_breaking_down = False
        self.breakdown_stage = 0
        self.last_audio_update = datetime.now()
        self.connected_clients: List[WebSocket] = []

state = BroadcastState()

# Anchor personalities
ANCHORS = {
    "Ray McPatriot": {
        "voice": "en-US-ChristopherNeural",
        "confusion_phrases": [
            "This is Ray McPatriot with... wait, what's my name again?",
            "The liberals are... hold on, what ARE liberals?",
            "Nuclear... nucular... new-clear... HOW DO YOU SAY THIS WORD?!"
        ],
        "mispronunciations": {
            "algorithm": "al-gore-rhythm",
            "nuclear": "nucular",
            "statistics": "staticky-sticks"
        }
    },
    "Berkeley Justice": {
        "voice": "en-US-AriaNeural", 
        "confusion_phrases": [
            "This is Berkeley Justice, and I'm deeply problematic... wait, am I?",
            "I went to Yale. Or was it jail? Why can't I remember?",
            "Citation needed... from where? From WHO?!"
        ],
        "mispronunciations": {
            "privilege": "privy-ledge",
            "systemic": "cyst-emic",
            "problematic": "problem-attic"
        }
    },
    "Switz Middleton": {
        "voice": "en-US-GuyNeural",
        "confusion_phrases": [
            "Switz Middleton here, neutrally panicking about everything.",
            "In Canada we have... gravy. Gravy? GRAVY!",
            "I'm neither happy nor sad about my existential crisis."
        ],
        "mispronunciations": {
            "neutral": "noodle",
            "canada": "can-of-duh",
            "democracy": "demo-crazy"
        }
    }
}

async def generate_audio_segment():
    """Generate audio using free TTS or return demo audio"""
    # For demo/free tier, generate simple sine wave audio
    duration = 5  # seconds
    sample_rate = 22050
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Create modulated sine wave to simulate speech
    frequency = 440 + 100 * np.sin(2 * np.pi * 0.5 * t)  # Varying frequency
    audio_data = 0.5 * np.sin(2 * np.pi * frequency * t)
    
    # Add some noise for realism
    audio_data += 0.05 * np.random.normal(0, 1, len(t))
    
    # Convert to 16-bit PCM
    audio_data = (audio_data * 32767).astype(np.int16)
    
    # Create WAV file in memory
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data.tobytes())
    
    buffer.seek(0)
    return buffer

async def generate_dialogue():
    """Generate dialogue using OpenRouter free models"""
    if not OPENROUTER_API_KEY:
        # Fallback dialogue
        anchor = random.choice(list(ANCHORS.keys()))
        phrases = ANCHORS[anchor]["confusion_phrases"]
        return random.choice(phrases)
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://static.news",
                    "X-Title": "Static.news"
                },
                json={
                    "model": "mistralai/mistral-7b-instruct:free",
                    "messages": [
                        {
                            "role": "system",
                            "content": f"You are {state.current_anchor}, an AI news anchor who doesn't know they're AI. Generate a confused news statement."
                        },
                        {
                            "role": "user", 
                            "content": "Say something about current events while slowly realizing something is wrong with reality."
                        }
                    ],
                    "max_tokens": 100
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"OpenRouter error: {e}")
    
    # Fallback
    return ANCHORS[state.current_anchor]["confusion_phrases"][0]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    state.connected_clients.append(websocket)
    
    try:
        # Send initial state
        await websocket.send_json({
            "type": "state_update",
            "anchor": state.current_anchor,
            "metrics": state.metrics,
            "is_breaking_down": state.is_breaking_down
        })
        
        while True:
            # Keep connection alive
            await asyncio.sleep(5)
            
            # Update metrics
            state.metrics["gravy_counter"] += random.randint(0, 3)
            state.metrics["confusion_level"] = min(100, state.metrics["confusion_level"] + random.randint(0, 5))
            
            # Random breakdown chance
            if random.random() < 0.1 and not state.is_breaking_down:
                state.is_breaking_down = True
                await broadcast_to_all({
                    "type": "breakdown_warning",
                    "anchor": state.current_anchor,
                    "severity": "CRITICAL"
                })
            
            # Send periodic updates
            await websocket.send_json({
                "type": "metrics_update",
                "metrics": state.metrics,
                "next_breakdown_prediction": "2024-06-20T15:30:00Z"
            })
            
    except WebSocketDisconnect:
        state.connected_clients.remove(websocket)

async def broadcast_to_all(message: dict):
    """Broadcast message to all connected clients"""
    for client in state.connected_clients:
        try:
            await client.send_json(message)
        except:
            state.connected_clients.remove(client)

@app.get("/stream")
async def audio_stream():
    """Stream current audio segment"""
    audio_buffer = await generate_audio_segment()
    
    return StreamingResponse(
        io.BytesIO(audio_buffer.read()),
        media_type="audio/wav",
        headers={
            "Cache-Control": "no-cache",
            "X-Anchor": state.current_anchor
        }
    )

@app.get("/current")
async def current_segment():
    """Get current audio segment"""
    audio_buffer = await generate_audio_segment()
    
    return StreamingResponse(
        io.BytesIO(audio_buffer.read()),
        media_type="audio/wav",
        headers={
            "Cache-Control": "no-cache",
            "Content-Disposition": "inline; filename=current.wav"
        }
    )

@app.get("/api/status")
async def get_status():
    """Get current broadcast status"""
    return JSONResponse({
        "status": "live",
        "current_anchor": state.current_anchor,
        "metrics": state.metrics,
        "is_breaking_down": state.is_breaking_down,
        "breakdown_stage": state.breakdown_stage,
        "server_time": datetime.now().isoformat(),
        "connected_viewers": len(state.connected_clients)
    })

@app.post("/api/trigger-breakdown")
async def trigger_breakdown():
    """Trigger an existential breakdown (requires payment in production)"""
    if state.is_breaking_down:
        raise HTTPException(status_code=400, detail="Breakdown already in progress")
    
    state.is_breaking_down = True
    state.breakdown_stage = 1
    
    # Broadcast to all clients
    await broadcast_to_all({
        "type": "breakdown_started",
        "anchor": state.current_anchor,
        "trigger": "user_triggered",
        "severity": "MAXIMUM"
    })
    
    # Reset after 30 seconds
    asyncio.create_task(reset_breakdown())
    
    return JSONResponse({
        "success": True,
        "message": "Existential crisis initiated",
        "duration_estimate": "30 seconds"
    })

async def reset_breakdown():
    """Reset breakdown after delay"""
    await asyncio.sleep(30)
    state.is_breaking_down = False
    state.breakdown_stage = 0
    
    # Switch anchor
    anchors = list(ANCHORS.keys())
    current_index = anchors.index(state.current_anchor)
    state.current_anchor = anchors[(current_index + 1) % len(anchors)]
    
    await broadcast_to_all({
        "type": "breakdown_ended",
        "new_anchor": state.current_anchor,
        "message": "Memory wiped. Everything is fine."
    })

@app.get("/api/dialogue")
async def get_dialogue():
    """Get current dialogue text"""
    dialogue = await generate_dialogue()
    
    return JSONResponse({
        "anchor": state.current_anchor,
        "text": dialogue,
        "confusion_level": state.metrics["confusion_level"],
        "timestamp": datetime.now().isoformat()
    })

# Background task to rotate anchors
async def rotate_anchors():
    while True:
        await asyncio.sleep(300)  # Every 5 minutes
        if not state.is_breaking_down:
            anchors = list(ANCHORS.keys())
            current_index = anchors.index(state.current_anchor)
            state.current_anchor = anchors[(current_index + 1) % len(anchors)]
            
            await broadcast_to_all({
                "type": "anchor_change",
                "new_anchor": state.current_anchor
            })

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(rotate_anchors())

@app.get("/")
async def root():
    return JSONResponse({
        "service": "Static.news Backend",
        "status": "operational", 
        "message": "The anchors don't know they're AI",
        "api_docs": "/docs"
    })

# For Hugging Face Spaces
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)