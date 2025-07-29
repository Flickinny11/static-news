#!/usr/bin/env python3
"""
Live Video Streaming Server for Static.news
RTMP/HLS streaming with real-time video composition
"""

import os
import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
import subprocess
import threading
import queue
import time
from dataclasses import dataclass

import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
import uvicorn

from video_generation import VideoCompositionEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class StreamConfig:
    """Video stream configuration"""
    width: int = 1920
    height: int = 1080
    fps: int = 30
    bitrate: str = "4000k"
    rtmp_url: Optional[str] = None
    hls_output: str = "/tmp/hls"

class LiveVideoComposer:
    """Real-time video composition for live streaming"""
    
    def __init__(self, stream_config: StreamConfig):
        self.config = stream_config
        self.video_engine = VideoCompositionEngine()
        self.current_segment = None
        self.frame_queue = queue.Queue(maxsize=30)
        self.is_streaming = False
        self.ffmpeg_process = None
        
    async def start_stream(self):
        """Start live video streaming"""
        logger.info("Starting live video stream...")
        
        # Create HLS output directory
        os.makedirs(self.config.hls_output, exist_ok=True)
        
        # Start FFmpeg for HLS streaming
        self._start_ffmpeg_process()
        
        # Start video generation loop
        self.is_streaming = True
        asyncio.create_task(self._video_generation_loop())
        asyncio.create_task(self._frame_output_loop())
        
    def _start_ffmpeg_process(self):
        """Start FFmpeg process for streaming"""
        ffmpeg_cmd = [
            'ffmpeg',
            '-y',  # Overwrite output files
            '-f', 'rawvideo',
            '-vcodec', 'rawvideo',
            '-pix_fmt', 'bgr24',
            '-s', f'{self.config.width}x{self.config.height}',
            '-r', str(self.config.fps),
            '-i', '-',  # Input from stdin
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-tune', 'zerolatency',
            '-b:v', self.config.bitrate,
            '-maxrate', self.config.bitrate,
            '-bufsize', '8000k',
            '-pix_fmt', 'yuv420p',
            '-g', str(self.config.fps * 2),  # Keyframe interval
            '-hls_time', '4',
            '-hls_list_size', '10',
            '-hls_flags', 'delete_segments',
            '-hls_segment_filename', f'{self.config.hls_output}/segment_%03d.ts',
            f'{self.config.hls_output}/playlist.m3u8'
        ]
        
        # Add RTMP output if configured
        if self.config.rtmp_url:
            ffmpeg_cmd.extend([
                '-f', 'flv',
                self.config.rtmp_url
            ])
            
        logger.info(f"Starting FFmpeg with command: {' '.join(ffmpeg_cmd)}")
        
        self.ffmpeg_process = subprocess.Popen(
            ffmpeg_cmd,
            stdin=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
    async def _video_generation_loop(self):
        """Main video generation loop"""
        while self.is_streaming:
            try:
                # Generate new video segment
                segment = await self._generate_current_segment()
                
                # Convert to video frames
                frames = await self._segment_to_frames(segment)
                
                # Add frames to queue
                for frame in frames:
                    if not self.frame_queue.full():
                        self.frame_queue.put(frame)
                    else:
                        # Drop oldest frame if queue is full
                        try:
                            self.frame_queue.get_nowait()
                            self.frame_queue.put(frame)
                        except queue.Empty:
                            pass
                            
                # Wait before generating next segment
                await asyncio.sleep(5)  # 5-second segments
                
            except Exception as e:
                logger.error(f"Error in video generation loop: {e}")
                await asyncio.sleep(1)
                
    async def _frame_output_loop(self):
        """Output frames to FFmpeg"""
        while self.is_streaming:
            try:
                if not self.frame_queue.empty():
                    frame = self.frame_queue.get()
                    
                    if self.ffmpeg_process and self.ffmpeg_process.stdin:
                        self.ffmpeg_process.stdin.write(frame.tobytes())
                        self.ffmpeg_process.stdin.flush()
                        
                else:
                    # Generate placeholder frame if no content
                    placeholder = self._generate_placeholder_frame()
                    if self.ffmpeg_process and self.ffmpeg_process.stdin:
                        self.ffmpeg_process.stdin.write(placeholder.tobytes())
                        self.ffmpeg_process.stdin.flush()
                        
                # Maintain frame rate
                await asyncio.sleep(1.0 / self.config.fps)
                
            except Exception as e:
                logger.error(f"Error in frame output loop: {e}")
                await asyncio.sleep(0.1)
                
    async def _generate_current_segment(self) -> Dict:
        """Generate current news segment"""
        # Get current news and anchor rotation
        from anchors import get_current_anchor
        from news_aggregator import get_latest_breaking_news
        
        current_anchor = get_current_anchor()
        latest_news = get_latest_breaking_news()
        
        # Determine if this is breaking news
        breaking_news = latest_news.get('breaking', False)
        
        # Generate video composition
        segment = await self.video_engine.compose_news_segment(
            character_id=current_anchor['id'],
            emotion="neutral",
            studio_type="main_desk",
            news_text=latest_news.get('summary', 'No news available'),
            breaking_news=breaking_news
        )
        
        return segment
        
    async def _segment_to_frames(self, segment: Dict) -> List[np.ndarray]:
        """Convert video segment to frames"""
        frames = []
        
        # For now, generate static frames from the composition
        # In production, this would animate the avatar and graphics
        for i in range(self.config.fps * 5):  # 5 seconds worth of frames
            frame = self._compose_frame(segment, i)
            frames.append(frame)
            
        return frames
        
    def _compose_frame(self, segment: Dict, frame_number: int) -> np.ndarray:
        """Compose a single frame from segment components"""
        # Create base frame
        frame = np.zeros((self.config.height, self.config.width, 3), dtype=np.uint8)
        
        # Add studio background (simplified - would use actual image composition)
        studio_color = self._get_studio_color(segment.get('studio_type', 'main_desk'))
        frame[:] = studio_color
        
        # Add character info text (placeholder for avatar)
        character_id = segment.get('character_id', 'Unknown')
        emotion = segment.get('emotion', 'neutral')
        
        # Add text overlay
        cv2.putText(frame, f"STATIC.NEWS LIVE", (50, 80), 
                   cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
        cv2.putText(frame, f"Anchor: {character_id}", (50, 150), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 204, 0), 2)
        cv2.putText(frame, f"Emotion: {emotion}", (50, 200), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 204, 0), 2)
                   
        # Add timestamp
        timestamp = datetime.now().strftime("%H:%M:%S")
        cv2.putText(frame, timestamp, (1600, 80), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                   
        # Add breaking news banner if needed
        if segment.get('breaking_news'):
            cv2.rectangle(frame, (0, 0), (1920, 100), (0, 0, 204), -1)
            cv2.putText(frame, "BREAKING NEWS", (50, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
                       
        # Add lower third
        cv2.rectangle(frame, (0, 960), (1920, 1080), (0, 51, 102), -1)
        cv2.putText(frame, character_id, (30, 1000), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2)
        cv2.putText(frame, "AI News Anchor", (30, 1040), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
                   
        return frame
        
    def _get_studio_color(self, studio_type: str) -> tuple:
        """Get studio background color"""
        colors = {
            "main_desk": (102, 51, 0),      # Dark blue (BGR)
            "breaking_news": (0, 0, 204),   # Red
            "weather": (51, 102, 0),        # Green
            "sports": (0, 102, 255),        # Orange
            "tech": (102, 0, 51),           # Purple
            "chaos": (147, 20, 255)         # Hot pink
        }
        return colors.get(studio_type, (102, 51, 0))
        
    def _generate_placeholder_frame(self) -> np.ndarray:
        """Generate placeholder frame when no content available"""
        frame = np.zeros((self.config.height, self.config.width, 3), dtype=np.uint8)
        frame[:] = (102, 51, 0)  # Dark blue
        
        cv2.putText(frame, "STATIC.NEWS", (600, 500), 
                   cv2.FONT_HERSHEY_SIMPLEX, 4, (255, 255, 255), 8)
        cv2.putText(frame, "AI News That Never Sleeps", (650, 600), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 204, 0), 3)
                   
        return frame
        
    def stop_stream(self):
        """Stop the video stream"""
        logger.info("Stopping video stream...")
        self.is_streaming = False
        
        if self.ffmpeg_process:
            self.ffmpeg_process.terminate()
            self.ffmpeg_process.wait()

class VideoStreamingServer:
    """FastAPI server for video streaming endpoints"""
    
    def __init__(self):
        self.app = FastAPI(title="Static.news Video Streaming Server")
        self.composer = None
        self.setup_routes()
        
    def setup_routes(self):
        """Setup streaming routes"""
        
        @self.app.get("/")
        async def root():
            return {"message": "Static.news Video Streaming Server"}
            
        @self.app.post("/stream/start")
        async def start_stream(rtmp_url: Optional[str] = None):
            """Start live video stream"""
            if self.composer and self.composer.is_streaming:
                raise HTTPException(400, "Stream already active")
                
            config = StreamConfig()
            if rtmp_url:
                config.rtmp_url = rtmp_url
                
            self.composer = LiveVideoComposer(config)
            await self.composer.start_stream()
            
            return {"status": "streaming", "hls_url": "/stream/playlist.m3u8"}
            
        @self.app.post("/stream/stop")
        async def stop_stream():
            """Stop live video stream"""
            if not self.composer or not self.composer.is_streaming:
                raise HTTPException(400, "No active stream")
                
            self.composer.stop_stream()
            return {"status": "stopped"}
            
        @self.app.get("/stream/playlist.m3u8")
        async def get_playlist():
            """Get HLS playlist"""
            playlist_path = "/tmp/hls/playlist.m3u8"
            if os.path.exists(playlist_path):
                return FileResponse(playlist_path, media_type="application/vnd.apple.mpegurl")
            else:
                raise HTTPException(404, "Playlist not found")
                
        @self.app.get("/stream/segment_{segment:int}.ts")
        async def get_segment(segment: int):
            """Get HLS segment"""
            segment_path = f"/tmp/hls/segment_{segment:03d}.ts"
            if os.path.exists(segment_path):
                return FileResponse(segment_path, media_type="video/mp2t")
            else:
                raise HTTPException(404, "Segment not found")
                
        @self.app.get("/stream/status")
        async def get_stream_status():
            """Get streaming status"""
            if self.composer and self.composer.is_streaming:
                return {
                    "streaming": True,
                    "config": {
                        "width": self.composer.config.width,
                        "height": self.composer.config.height,
                        "fps": self.composer.config.fps,
                        "bitrate": self.composer.config.bitrate
                    },
                    "queue_size": self.composer.frame_queue.qsize()
                }
            else:
                return {"streaming": False}
                
        @self.app.websocket("/stream/control")
        async def stream_control_websocket(websocket: WebSocket):
            """WebSocket for real-time stream control"""
            await websocket.accept()
            
            try:
                while True:
                    data = await websocket.receive_json()
                    
                    if data.get("action") == "trigger_breakdown":
                        character_id = data.get("character_id", "Glitch McKenzie")
                        # Trigger breakdown effect
                        if self.composer:
                            logger.info(f"Triggering breakdown for {character_id}")
                            await websocket.send_json({
                                "status": "breakdown_triggered",
                                "character": character_id
                            })
                    
                    elif data.get("action") == "change_anchor":
                        new_anchor = data.get("anchor_id")
                        logger.info(f"Changing anchor to {new_anchor}")
                        await websocket.send_json({
                            "status": "anchor_changed",
                            "anchor": new_anchor
                        })
                        
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                
    def run(self, host: str = "0.0.0.0", port: int = 8001):
        """Run the streaming server"""
        uvicorn.run(self.app, host=host, port=port)

def main():
    """Run the video streaming server"""
    server = VideoStreamingServer()
    server.run()

if __name__ == "__main__":
    main()