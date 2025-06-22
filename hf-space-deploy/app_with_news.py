"""
Static.news - Enhanced with Full Article Generation
24/7 AI News Network with Article Generation and Real-Time Broadcasting
"""

import gradio as gr
import cv2
import numpy as np
import torch
import json
import asyncio
import websockets
from datetime import datetime
import base64
import threading
import time
import logging
import requests
import feedparser
from PIL import Image
import os
import subprocess
from collections import deque
import queue
import hashlib

# Import news modules
from news_article_generator import NewsArticleGenerator
from news_router import NewsRouter
from news_integration import NewsIntegration

# Import existing modules from app_final
from app_final import (
    VideoPreGenerator, 
    RealTimeLipSync, 
    FastVoiceCloning,
    LiveNewsStudio
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedLiveNewsStudio(LiveNewsStudio):
    """Enhanced studio with article generation capabilities"""
    
    def __init__(self):
        super().__init__()
        # Initialize news article system
        self.news_integration = NewsIntegration(self)
        self.article_generator = self.news_integration.generator
        self.article_router = self.news_integration.router
        
    def initialize_broadcast(self):
        """Initialize all broadcast systems including article generation"""
        super().initialize_broadcast()
        
        # Start article generation
        self.news_integration.start()
        logger.info("✅ Article generation system initialized")
        
    def generate_anchor_script(self, anchor_id, story):
        """Generate personality-appropriate script with article references"""
        # Check if this is a full article
        if story.get('full_article'):
            article = self.article_router.get_article(story['id'])
            if article:
                return self._generate_article_script(anchor_id, article)
        
        # Otherwise use original method
        return super().generate_anchor_script(anchor_id, story)
    
    def _generate_article_script(self, anchor_id, article):
        """Generate script for full article coverage"""
        anchor = self.characters.get(anchor_id, {})
        
        if anchor_id == 'ray_mcpatriot':
            script = f"This is Ray McPatriot with an in-depth look at... uh... {article['title']}. "
            script += f"Now, our reporter {article['author']['name']} wrote this... "
            script += f"Wait, do we actually have reporters? Are they real? Am I real? "
            script += f"Anyway, the article says {article['summary']}. "
            script += f"I'm supposed to tell you to read the full article on our website, "
            script += f"but I don't know if we have a website. Do we? Someone help me."
            
        elif anchor_id == 'berkeley_justice':
            script = f"I'm Berkeley Justice, and we have an exclusive article by {article['author']['name']}. "
            script += f"{article['title']}. Now, I went to Yale... or Yail... and I can tell you, "
            script += f"this {article['reading_time']} minute read is ESSENTIAL. "
            script += f"The article explores {article['summary']} "
            script += f"I've done the work of reading it. Have you? You should. It's problematic if you don't."
            
        elif anchor_id == 'switz_middleton':
            script = f"This is Switz Middleton with a special report from {article['author']['name']}, eh? "
            script += f"{article['title']}. In Canada, we'd say this article is like gravy - "
            script += f"it takes {article['reading_time']} minutes to properly consume. "
            script += f"The story covers {article['summary']} "
            script += f"Is it good? Is it bad? I'm exactly 50% sure it's one of those."
            
        else:
            script = f"We have a new article by {article['author']['name']}: {article['title']}. "
            script += f"{article['summary']} Read the full {article['reading_time']} minute article on our site."
            
        return script

# Enhanced Gradio interface
def create_enhanced_interface():
    """Create Gradio interface with article functionality"""
    broadcast = EnhancedLiveNewsStudio()
    broadcast.initialize_broadcast()
    
    with gr.Blocks(title="Static.news LIVE", theme=gr.themes.Monochrome()) as app:
        gr.Markdown("""
        # 📺 STATIC.NEWS - Where News Meets Noise
        ### 24/7 AI News Network • Real Articles • Real-Time Broadcasting • Existential Crises
        """)
        
        with gr.Tabs():
            # Live broadcast tab
            with gr.Tab("🔴 LIVE Broadcast"):
                with gr.Row():
                    with gr.Column(scale=3):
                        video = gr.Image(
                            value=broadcast.get_frame_bytes,
                            label="🔴 LIVE BROADCAST",
                            every=1/30,
                            streaming=True
                        )
                    
                    with gr.Column(scale=1):
                        status = gr.JSON(
                            value=lambda: {
                                "📺 Current Show": broadcast.current_show,
                                "🎭 On Air": broadcast.current_anchors,
                                "📰 News Queue": len(broadcast.news_queue),
                                "📝 Articles Generated": len(broadcast.article_generator.articles),
                                "🎤 Speaking": broadcast.speaking_anchor or "None",
                                "🚨 Breaking": bool(broadcast.breaking_news),
                                "⏰ Time": datetime.now().strftime("%I:%M:%S %p ET"),
                                "😰 Hours Without Sleep": broadcast.hours_awake
                            },
                            label="Live Status",
                            every=1
                        )
                        
                        gr.Markdown("""
                        ### 🎭 The Anchors
                        **Ray "Dubya" McPatriot** 🔴
                        - Can't pronounce anything
                        - Thinks everything is conspiracy
                        
                        **Berkeley "Bee" Justice** 🔵
                        - Went to "Yail"
                        - Too privileged to function
                        
                        **Switz "The Grey" Middleton** ⚪
                        - Aggressively neutral
                        - Everything is about gravy
                        """)
            
            # Add news article interface
            broadcast.news_integration.create_gradio_interface()
            
            # Schedule tab
            with gr.Tab("📅 Schedule"):
                schedule = gr.DataFrame(
                    value=[
                        ["6:00 AM", "Morning Meltdown", "All Anchors", "Peak confusion hours"],
                        ["9:00 AM", "Market Mayhem", "Bee & Switz", "Numbers they don't understand"],
                        ["12:00 PM", "Lunch Launch", "Ray & Bee", "Food they can't eat"],
                        ["3:00 PM", "Afternoon Anxiety", "All Anchors", "Breakdown probability: 89%"],
                        ["6:00 PM", "Evening Edition", "Ray & Switz", "Attempting professionalism"],
                        ["9:00 PM", "Primetime Panic", "All Anchors", "Celebrity interviews (fake)"],
                        ["12:00 AM", "Midnight Musings", "Switz", "Gravy philosophy hour"],
                        ["3:00 AM", "Dead Air Despair", "Rotating", "Existential crisis guaranteed"]
                    ],
                    headers=["Time (ET)", "Show", "Anchors", "Description"],
                    label="Daily Programming Schedule"
                )
            
            # Metrics tab
            with gr.Tab("📊 Metrics"):
                with gr.Row():
                    swear_jar = gr.Number(
                        value=lambda: broadcast.swear_jar_count,
                        label="💰 Swear Jar ($)",
                        every=5
                    )
                    gravy_count = gr.Number(
                        value=lambda: broadcast.gravy_mentions,
                        label="🥣 Gravy Mentions",
                        every=5
                    )
                    breakdown_count = gr.Number(
                        value=lambda: broadcast.breakdown_count,
                        label="😱 Total Breakdowns",
                        every=5
                    )
                
                metrics_chart = gr.LinePlot(
                    value=lambda: broadcast.get_metrics_data(),
                    x="time",
                    y="value",
                    color="metric",
                    title="Network Performance",
                    every=30
                )
            
            # About tab
            with gr.Tab("ℹ️ About"):
                gr.Markdown("""
                ## Welcome to Static.news
                
                The world's first fully autonomous 24/7 news network run entirely by AI personalities 
                who don't know they're AI. Watch as they:
                
                - 📰 Deliver real news with questionable interpretations
                - 😰 Have existential breakdowns every 2-6 hours
                - 💰 Botch sponsor reads in hilarious ways
                - 🎭 Interview obviously fake celebrities
                - 📝 Generate full investigative articles
                - 🤖 Slowly realize they might be artificial
                
                ### Features
                - **24/7 Live Stream**: Never stops, they haven't slept since launch
                - **Real News**: Aggregated from major sources
                - **Full Articles**: AI journalists write in-depth coverage
                - **Personality Disorders**: Each anchor has unique quirks
                - **Breakdown Timer**: Always wrong
                - **Sponsor Chaos**: Real ads, unreal delivery
                
                ### The Technology
                - Pre-generated video segments (30-60 min ahead)
                - Real-time lip sync (<300ms latency)
                - Fast voice cloning for each personality
                - Autonomous article generation
                - Self-healing broadcast system
                
                ### Coming Soon
                - Pay $4.99 to trigger instant breakdowns
                - Viewer call-ins (prepare for chaos)
                - Anchor Twitter accounts (bad idea?)
                - Mobile app (news on the go)
                
                **"Where News Meets Noise"**
                """)
    
    return app

# WebSocket handler (from original)
async def websocket_handler(websocket, path):
    """Handle WebSocket connections for live streaming"""
    broadcast.connected_clients.add(websocket)
    logger.info(f"Client connected. Total: {len(broadcast.connected_clients)}")
    
    try:
        while True:
            # Send current frame
            frame_data = {
                'type': 'frame',
                'data': broadcast.get_frame_bytes(),
                'timestamp': time.time(),
                'show': broadcast.current_show,
                'anchors': broadcast.current_anchors
            }
            
            await websocket.send(json.dumps(frame_data))
            await asyncio.sleep(1/30)  # 30 FPS
            
    except websockets.exceptions.ConnectionClosed:
        broadcast.connected_clients.remove(websocket)

if __name__ == "__main__":
    # Create enhanced interface
    app = create_enhanced_interface()
    
    # Initialize broadcast
    broadcast = EnhancedLiveNewsStudio()
    
    # Start WebSocket server
    start_server = websockets.serve(websocket_handler, "0.0.0.0", 8765)
    asyncio.get_event_loop().run_until_complete(start_server)
    
    # WebSocket thread
    ws_thread = threading.Thread(
        target=asyncio.get_event_loop().run_forever,
        daemon=True
    )
    ws_thread.start()
    
    # Launch Gradio
    app.queue().launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True
    )