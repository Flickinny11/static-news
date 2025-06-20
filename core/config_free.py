#!/usr/bin/env python3
"""
Free/Demo Configuration for Static.news
Uses Hugging Face Inference API and OpenRouter free models
"""

import os
from typing import Dict, Any

class FreeConfig:
    """Configuration for free/demo services"""
    
    # Hugging Face Inference API (free tier)
    HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
    HF_API_URL = "https://api-inference.huggingface.co/models"
    
    # OpenRouter free models
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_FREE_MODELS = [
        "google/gemma-7b-it:free",
        "mistralai/mistral-7b-instruct:free",
        "huggingfaceh4/zephyr-7b-beta:free",
        "openchat/openchat-7b:free",
        "gryphe/mythomist-7b:free",
        "undi95/toppy-m-7b:free",
        "meta-llama/llama-3-8b-instruct:free"
    ]
    
    # Text generation models (Hugging Face)
    TEXT_MODELS = {
        "news_generator": "microsoft/DialoGPT-medium",
        "dialogue": "microsoft/DialoGPT-small",
        "summary": "facebook/bart-large-cnn"
    }
    
    # Voice synthesis (using system TTS for free)
    VOICE_CONFIG = {
        "Ray": {
            "engine": "espeak",
            "voice": "english-us",
            "speed": 200,
            "pitch": 50
        },
        "Bee": {
            "engine": "espeak", 
            "voice": "english+f3",
            "speed": 180,
            "pitch": 80
        },
        "Switz": {
            "engine": "espeak",
            "voice": "english-north",
            "speed": 190,
            "pitch": 60
        }
    }
    
    # Redis (optional - can use in-memory storage)
    USE_REDIS = False
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    @classmethod
    def get_ai_config(cls) -> Dict[str, Any]:
        """Get AI configuration for free services"""
        return {
            "text_generation": {
                "provider": "huggingface",
                "api_token": cls.HF_API_TOKEN,
                "models": cls.TEXT_MODELS,
                "fallback": "rule-based"  # Fallback to rule-based generation
            },
            "voice_synthesis": {
                "provider": "system_tts",
                "config": cls.VOICE_CONFIG
            },
            "dialogue_enhancement": {
                "provider": "openrouter_free",
                "api_key": cls.OPENROUTER_API_KEY,
                "models": cls.OPENROUTER_FREE_MODELS
            }
        }
    
    @classmethod
    def validate_config(cls) -> bool:
        """Validate configuration"""
        valid = True
        
        if not cls.HF_API_TOKEN:
            print("Warning: HF_API_TOKEN not set. Using demo mode.")
            valid = False
            
        if not cls.OPENROUTER_API_KEY:
            print("Warning: OPENROUTER_API_KEY not set. Using rule-based generation.")
            valid = False
            
        return valid