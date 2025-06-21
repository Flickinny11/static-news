"""
Simple test app for Static.news HuggingFace Space
Tests basic functionality before full deployment
"""

import gradio as gr
import json
import asyncio
import websockets
from datetime import datetime
import numpy as np
import cv2
import base64

class SimpleTestBroadcast:
    def __init__(self):
        self.frame_count = 0
        self.is_broadcasting = False
        
    def generate_test_frame(self):
        """Generate a simple test frame"""
        # Create a simple frame with text
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        
        # Add gradient background
        for y in range(720):
            intensity = int((y / 720) * 50)
            frame[y, :] = [intensity, intensity, intensity + 10]
        
        # Add text
        cv2.putText(frame, "STATIC.NEWS TEST BROADCAST", 
                   (100, 100), cv2.FONT_HERSHEY_BOLD, 2, (255, 255, 255), 3)
        
        cv2.putText(frame, f"Frame: {self.frame_count}", 
                   (100, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        
        cv2.putText(frame, f"Time: {datetime.now().strftime('%H:%M:%S')}", 
                   (100, 300), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        cv2.putText(frame, "GPU: T4 Active", 
                   (100, 400), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        
        self.frame_count += 1
        
        return frame
    
    def generate_test_video(self, duration=5):
        """Generate a test video"""
        fps = 24
        frames = []
        
        for i in range(fps * duration):
            frame = self.generate_test_frame()
            frames.append(frame)
        
        # Convert to video
        height, width = frames[0].shape[:2]
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        
        # Save to temporary file
        output_path = '/tmp/test_video.mp4'
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        for frame in frames:
            out.write(frame)
        
        out.release()
        
        return output_path

# Create Gradio interface
def create_test_interface():
    broadcast = SimpleTestBroadcast()
    
    def generate_test():
        """Generate test video"""
        video_path = broadcast.generate_test_video(5)
        status = f"Test video generated: {broadcast.frame_count} frames"
        return video_path, status
    
    def get_system_status():
        """Get current system status"""
        status = {
            "status": "operational",
            "gpu": "T4",
            "models_loaded": {
                "tts": "Ready (Simplified)",
                "video": "Ready (Test Mode)",
                "websocket": "Available"
            },
            "timestamp": datetime.now().isoformat()
        }
        return json.dumps(status, indent=2)
    
    with gr.Blocks(title="Static.news Test Broadcast") as app:
        gr.Markdown("# Static.news Test Broadcast System")
        gr.Markdown("This is a simplified test to verify HuggingFace Space functionality")
        
        with gr.Tab("Test Video"):
            video_output = gr.Video(label="Test Broadcast")
            status_output = gr.Textbox(label="Status")
            generate_btn = gr.Button("Generate Test Video")
            
            generate_btn.click(
                generate_test,
                outputs=[video_output, status_output]
            )
        
        with gr.Tab("System Status"):
            status_json = gr.JSON(label="Current Status")
            refresh_btn = gr.Button("Refresh Status")
            
            refresh_btn.click(
                get_system_status,
                outputs=[status_json]
            )
            
            # Auto-refresh on load
            app.load(get_system_status, outputs=[status_json])
        
        with gr.Tab("WebSocket Test"):
            gr.Markdown("""
            WebSocket endpoint available at:
            - wss://alledged-static-news-backend.hf.space/ws
            
            Test with the connection test page on the main website.
            """)
    
    return app

# WebSocket server
async def websocket_handler(websocket, path):
    """Handle WebSocket connections"""
    try:
        await websocket.send(json.dumps({
            "type": "connection",
            "status": "connected",
            "message": "Connected to Static.news test broadcast"
        }))
        
        async for message in websocket:
            data = json.loads(message)
            
            if data.get('type') == 'ping':
                await websocket.send(json.dumps({
                    "type": "pong",
                    "timestamp": data.get('timestamp')
                }))
            elif data.get('type') == 'get_stream':
                # Send test frames
                for i in range(10):
                    await websocket.send(json.dumps({
                        "type": "test_frame",
                        "frame_number": i,
                        "timestamp": datetime.now().isoformat()
                    }))
                    await asyncio.sleep(0.1)
                    
    except websockets.exceptions.ConnectionClosed:
        pass

# Main entry point
if __name__ == "__main__":
    app = create_test_interface()
    
    # Start WebSocket server in background
    start_server = websockets.serve(websocket_handler, "0.0.0.0", 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    
    # Launch Gradio app
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )