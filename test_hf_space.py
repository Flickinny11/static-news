#!/usr/bin/env python3
"""
Test what's actually running on the HuggingFace Space
"""

import asyncio
import websockets
import json
import requests
from datetime import datetime

async def test_websocket():
    """Test WebSocket connection to see what's actually being broadcast"""
    uri = "wss://alledged-static-news-backend.hf.space/ws"
    
    print(f"🔌 Connecting to: {uri}")
    
    try:
        async with websockets.connect(uri, timeout=10) as websocket:
            print("✅ WebSocket connected!")
            
            # Listen for a few messages
            message_count = 0
            while message_count < 5:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(message)
                    
                    print(f"\n📨 Message {message_count + 1}:")
                    print(f"   Type: {data.get('type', 'unknown')}")
                    
                    if data.get('type') == 'frame':
                        print(f"   Frame data size: {len(data.get('data', ''))} bytes")
                        print(f"   Timestamp: {data.get('timestamp', 'none')}")
                    else:
                        print(f"   Data: {json.dumps(data, indent=2)}")
                    
                    message_count += 1
                    
                except asyncio.TimeoutError:
                    print("⏱️ Timeout waiting for message")
                    break
                except Exception as e:
                    print(f"❌ Error receiving message: {e}")
                    break
                    
    except websockets.exceptions.WebSocketException as e:
        print(f"❌ WebSocket error: {e}")
    except Exception as e:
        print(f"❌ Connection error: {e}")

def check_gradio_interface():
    """Check what the Gradio interface shows"""
    print("\n🌐 Checking Gradio interface...")
    
    try:
        # Try to get the API info
        api_url = "https://alledged-static-news-backend.hf.space/api/info"
        response = requests.get(api_url, timeout=10)
        
        if response.status_code == 200:
            info = response.json()
            print("✅ Gradio API accessible")
            print(f"   Version: {info.get('version', 'unknown')}")
            
            # Check named endpoints
            named_endpoints = info.get('named_endpoints', {})
            if named_endpoints:
                print("   Endpoints found:")
                for endpoint in named_endpoints:
                    print(f"   - {endpoint}")
        else:
            print(f"⚠️ API returned status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Cannot access Gradio API: {e}")

def check_space_files():
    """Try to determine what files are deployed"""
    print("\n📁 Checking deployed configuration...")
    
    # Check if it's the basic version or advanced version
    print("   Based on WebSocket behavior, the Space is running:")
    print("   - If frames are being sent: ✅ Broadcast system active")
    print("   - If only connection message: ⚠️ Basic version")
    print("   - If no WebSocket at all: ❌ Old version without streaming")

# Run tests
print("🔍 Testing HuggingFace Space: alledged-static-news-backend")
print("=" * 60)

# Test WebSocket
asyncio.run(test_websocket())

# Test Gradio
check_gradio_interface()

# Summary
check_space_files()

print("\n📊 Summary:")
print("The Space needs to have:")
print("- app.py (with the REAL broadcast system, not circles)")
print("- requirements.txt (with AI model dependencies)")
print("- character_generation_system.py (for generating characters)")
print("\nIf you're seeing basic shapes instead of AI characters,")
print("the Space is running the OLD code and needs updating.")