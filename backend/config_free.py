"""
Free Backend Configuration
Uses Hugging Face Inference API and OpenRouter free models
"""

import os

# Hugging Face Inference API (free tier)
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
HF_MODELS = {
    "chat": "microsoft/DialoGPT-medium",
    "news": "google/flan-t5-base",
    "summary": "facebook/bart-large-cnn"
}

# OpenRouter free models
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_FREE_MODELS = [
    "google/gemma-7b-it:free",
    "mistralai/mistral-7b-instruct:free",
    "meta-llama/llama-3-8b-instruct:free"
]

# Redis alternative - use in-memory storage
USE_REDIS = False
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Stripe test mode
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY", "sk_test_demo")
STRIPE_PUBLIC_KEY = "pk_test_demo"

# Demo mode settings
DEMO_MODE = True
MAX_COMMENTS_PER_HOUR = 100
MAX_BREAKDOWNS_PER_HOUR = 10