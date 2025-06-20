#!/usr/bin/env python3
"""
Streaming Server for Static.news
Broadcasts the live audio feed to web and mobile clients
Handles WebSocket connections for real-time updates
"""

import asyncio
import json
import os
from datetime import datetime
from typing import Dict, Set
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import aiofiles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioFileHandler(FileSystemEventHandler):
    """Watches for new audio files and notifies clients"""
    
    def __init__(self, stream_manager):
        self.stream_manager = stream_manager
        
    def on_created(self, event):
        if event.src_path.endswith('.mp3') and 'segment_' in event.src_path:
            asyncio.create_task(self.stream_manager.notify_new_segment(event.src_path))

class StreamManager:
    """Manages WebSocket connections and audio streaming"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.current_audio_file = None
        self.audio_dir = "/audio/live"
        self.metrics_file = "/app/data/metrics.json"
        
    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"New connection. Total: {len(self.active_connections)}")
        
        # Send current state
        await self.send_current_state(websocket)
        
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        self.active_connections.discard(websocket)
        logger.info(f"Connection closed. Total: {len(self.active_connections)}")
        
    async def send_current_state(self, websocket: WebSocket):
        """Send current broadcast state to new connection"""
        state = await self.get_current_state()
        await websocket.send_json(state)
        
    async def get_current_state(self) -> Dict:
        """Get current broadcast state"""
        state = {
            "type": "state",
            "timestamp": datetime.now().isoformat(),
            "current_audio": self.current_audio_file,
            "listeners": len(self.active_connections)
        }
        
        # Add metrics if available
        if os.path.exists(self.metrics_file):
            try:
                async with aiofiles.open(self.metrics_file, 'r') as f:
                    metrics = json.loads(await f.read())
                    state["metrics"] = metrics
            except Exception as e:
                logger.error(f"Error reading metrics: {e}")
                
        return state
        
    async def notify_new_segment(self, audio_file: str):
        """Notify all clients of new audio segment"""
        self.current_audio_file = audio_file
        
        message = {
            "type": "new_segment",
            "audio_file": os.path.basename(audio_file),
            "timestamp": datetime.now().isoformat()
        }
        
        # Get current metrics
        state = await self.get_current_state()
        message["metrics"] = state.get("metrics", {})
        
        # Broadcast to all connections
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending to client: {e}")
                disconnected.add(connection)
                
        # Clean up disconnected clients
        self.active_connections -= disconnected
        
    async def broadcast_breakdown_alert(self):
        """Alert all clients of incoming breakdown"""
        message = {
            "type": "breakdown_warning",
            "message": "EXISTENTIAL CRISIS IMMINENT",
            "timestamp": datetime.now().isoformat()
        }
        
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

# Create FastAPI app
app = FastAPI(title="Static.news Streaming Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create stream manager
stream_manager = StreamManager()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Static.news Streaming Server",
        "status": "broadcasting",
        "message": "The anchors still don't know they're AI"
    }

@app.get("/stream")
async def audio_stream():
    """HTTP audio stream endpoint"""
    current_file = os.path.join(stream_manager.audio_dir, "current.mp3")
    
    if not os.path.exists(current_file):
        return {"error": "No audio available yet"}
        
    async def generate():
        """Generate audio stream"""
        async with aiofiles.open(current_file, 'rb') as f:
            while True:
                chunk = await f.read(4096)
                if not chunk:
                    break
                yield chunk
                
    return StreamingResponse(
        generate(),
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "no-cache",
            "X-Content-Type-Options": "nosniff"
        }
    )

@app.get("/current")
async def get_current_audio():
    """Get current audio file"""
    current_file = os.path.join(stream_manager.audio_dir, "current.mp3")
    
    if os.path.exists(current_file):
        return FileResponse(
            current_file,
            media_type="audio/mpeg",
            filename="current_segment.mp3"
        )
    else:
        return {"error": "No audio available"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await stream_manager.connect(websocket)
    
    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            
            # Handle client messages
            try:
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                    
                elif message.get("type") == "trigger_breakdown":
                    # Mobile app triggered breakdown
                    logger.info("Breakdown triggered by user!")
                    await stream_manager.broadcast_breakdown_alert()
                    
            except json.JSONDecodeError:
                logger.error(f"Invalid message: {data}")
                
    except WebSocketDisconnect:
        stream_manager.disconnect(websocket)

@app.get("/metrics")
async def get_metrics():
    """Get current broadcast metrics"""
    state = await stream_manager.get_current_state()
    return state.get("metrics", {})

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "streaming-server",
        "connections": len(stream_manager.active_connections),
        "timestamp": datetime.now().isoformat()
    }

async def start_file_watcher():
    """Start watching for new audio files"""
    event_handler = AudioFileHandler(stream_manager)
    observer = Observer()
    observer.schedule(event_handler, stream_manager.audio_dir, recursive=False)
    observer.start()
    
    logger.info(f"Watching directory: {stream_manager.audio_dir}")

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🎙️ Static.news Streaming Server starting...")
    asyncio.create_task(start_file_watcher())
    
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown"""
    logger.info("📴 Streaming server shutting down...")
    
    # Close all WebSocket connections
    for connection in stream_manager.active_connections:
        try:
            await connection.close()
        except:
            pass

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )