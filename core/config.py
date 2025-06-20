#!/usr/bin/env python3
"""
Configuration for Static.news
Optimized for minimal costs while maintaining maximum chaos
"""

import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")

# AI Model Configuration (using free/cheap models)
AI_MODELS = {
    "default": "mistralai/mistral-7b-instruct:free",  # Free tier
    "creative": "meta-llama/llama-2-13b-chat:free",   # Free tier
    "fast": "mistralai/mistral-7b-instruct:free"      # Free tier
}

# Voice Synthesis Configuration
VOICE_CONFIG = {
    "engine": "piper",  # Free, open-source, runs locally
    "models": {
        "Ray": "en_US-joe-medium",      # American male
        "Bee": "en_US-amy-medium",       # American female  
        "Switz": "en_US-danny-low"       # Different male voice
    },
    "download_dir": "/app/voice_models",
    "cache_audio": True,
    "sample_rate": 22050  # Lower sample rate to save space
}

# Cost Optimization Settings
COST_OPTIMIZATION = {
    "max_tokens_per_request": 150,  # Keep responses short
    "cache_responses": True,         # Cache common responses
    "batch_inference": True,         # Batch API calls
    "audio_compression": "mp3",      # Compressed audio
    "audio_bitrate": "64k"          # Lower bitrate for streaming
}

# Broadcast Settings
BROADCAST_CONFIG = {
    "segments_per_hour": 12,
    "breakdown_interval_hours": (2, 6),
    "max_audio_cache_gb": 1,
    "cleanup_after_hours": 24
}

# Free Services
NEWS_SOURCES = [
    # These RSS feeds don't require API keys
    "http://feeds.bbci.co.uk/news/rss.xml",
    "http://rss.cnn.com/rss/cnn_topstories.rss", 
    "https://feeds.npr.org/1001/rss.xml",
    "https://feeds.reuters.com/reuters/topNews",
    "https://www.reddit.com/r/news/.rss",
    "https://www.reddit.com/r/nottheonion/.rss"
]

# Deployment Mode
DEPLOYMENT_MODE = os.getenv("DEPLOYMENT_MODE", "hybrid")  # hybrid, full_local, full_cloud