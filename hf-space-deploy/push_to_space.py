#!/usr/bin/env python3
"""
Quick script to verify and update HuggingFace Space
"""

import requests
import json
import os

# Check if Space is accessible
space_url = "https://alledged-static-news-backend.hf.space"
api_url = "https://alledged-static-news-backend.hf.space/api/predict"

print("🔍 Checking HuggingFace Space status...")

try:
    # Try to access the Space
    response = requests.get(space_url, timeout=10)
    if response.status_code == 200:
        print("✅ Space is accessible!")
        print(f"🔗 URL: {space_url}")
    else:
        print(f"⚠️ Space returned status: {response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"❌ Cannot access Space: {e}")
    print("The Space might be:")
    print("1. Starting up (takes 5-10 minutes)")
    print("2. Not deployed yet")
    print("3. In sleep mode")

print("\n📡 WebSocket endpoint should be:")
print("wss://alledged-static-news-backend.hf.space/ws")

print("\n📦 Files ready for deployment:")
print("- app.py (REAL broadcast system)")
print("- requirements.txt (all AI models)")
print("- character_generation_system.py")

print("\n🚀 To manually update the Space:")
print("1. Go to: https://huggingface.co/spaces/alledged/static-news-backend")
print("2. Click 'Files and versions'")
print("3. Upload the new app.py and requirements.txt")
print("4. The Space will rebuild automatically")

print("\n⏱️ Expected timeline:")
print("- 10-15 minutes: Space builds and starts")
print("- 30-60 minutes: Initial character generation")
print("- Then: 24/7 operation with full features")