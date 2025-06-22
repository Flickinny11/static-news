"""
Simple test version to verify HF Space is working
"""

import gradio as gr
import cv2
import numpy as np
import json
import asyncio
import websockets
from datetime import datetime
import base64
import threading
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleTestBroadcast:
    def __init__(self):
        self.broadcasting = True
        self.frame_width = 1280
        self.frame_height = 720
        self.current_frame = None
        self.connected_clients = set()
        
        logger.info("🚀 Starting Simple Test Broadcast")
        self.start()
    
    def start(self):
        threading.Thread(target=self.broadcast_loop, daemon=True).start()
    
    def generate_frame(self):
        """Generate a simple test frame"""
        frame = np.zeros((self.frame_height, self.frame_width, 3), dtype=np.uint8)
        
        # Add gradient background
        for y in range(self.frame_height):
            frame[y, :] = [y * 255 // self.frame_height, 0, 0]
        
        # Add text
        cv2.putText(frame, "STATIC.NEWS TEST BROADCAST", (200, 200), 
                   cv2.FONT_HERSHEY_BOLD, 2, (255, 255, 255), 3)
        
        # Add timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, timestamp, (400, 400), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        # Add status
        cv2.putText(frame, f"Clients: {len(self.connected_clients)}", (400, 500),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        return frame
    
    def broadcast_loop(self):
        """Simple broadcast loop"""
        while self.broadcasting:
            self.current_frame = self.generate_frame()
            time.sleep(1/24)  # 24 FPS
    
    def get_frame_bytes(self):
        if self.current_frame is not None:
            _, buffer = cv2.imencode('.jpg', self.current_frame)
            return buffer.tobytes()
        return None

# Create instance
broadcast = SimpleTestBroadcast()

# WebSocket handler
async def websocket_handler(websocket, path):
    broadcast.connected_clients.add(websocket)
    logger.info(f"Client connected. Total: {len(broadcast.connected_clients)}")
    
    try:
        await websocket.send(json.dumps({
            "type": "connected",
            "message": "Connected to Simple Test Broadcast"
        }))
        
        while True:
            if broadcast.current_frame is not None:
                _, buffer = cv2.imencode('.jpg', broadcast.current_frame)
                await websocket.send(json.dumps({
                    "type": "frame",
                    "data": base64.b64encode(buffer).decode('utf-8'),
                    "timestamp": datetime.now().isoformat()
                }))
            
            await asyncio.sleep(1/24)
            
    except websockets.exceptions.ConnectionClosed:
        broadcast.connected_clients.remove(websocket)
        logger.info(f"Client disconnected. Total: {len(broadcast.connected_clients)}")

# Gradio interface
with gr.Blocks(title="Static.news Test") as app:
    gr.Markdown("# 📺 STATIC.NEWS - Test Broadcast")
    
    with gr.Row():
        video = gr.Image(
            value=broadcast.get_frame_bytes,
            label="Test Stream",
            every=1/24,
            streaming=True
        )
    
    gr.Markdown("This is a simple test to verify the Space is working.")

# Launch
if __name__ == "__main__":
    # Start WebSocket
    import asyncio
    start_server = websockets.serve(websocket_handler, "0.0.0.0", 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    
    ws_thread = threading.Thread(
        target=asyncio.get_event_loop().run_forever,
        daemon=True
    )
    ws_thread.start()
    
    # Launch Gradio
    app.queue().launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )