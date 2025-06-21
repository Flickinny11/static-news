#!/bin/bash

# Deploy to Hugging Face Space Script
# This script prepares and deploys the broadcast system to your HF Space

echo "🚀 Static.news HF Space Deployment Script"
echo "========================================"

# Configuration
HF_USERNAME="alledged"
HF_SPACE_NAME="static-news-backend"
SPACE_DIR="huggingface-space"

# Check if we're in the right directory
if [ ! -f "complete-hf-broadcast-space.py" ]; then
    echo "❌ Error: complete-hf-broadcast-space.py not found!"
    echo "Please run this script from the static.news root directory"
    exit 1
fi

echo "📦 Preparing deployment files..."

# Create a temporary deployment directory
DEPLOY_DIR="hf-space-deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy necessary files
echo "📄 Copying application files..."
cp huggingface-space/app_production.py $DEPLOY_DIR/app.py
cp huggingface-space/requirements.txt $DEPLOY_DIR/
cp complete-hf-broadcast-space.py $DEPLOY_DIR/

# Create README for the space
cat > $DEPLOY_DIR/README.md << 'EOF'
---
title: Static News Backend
emoji: 📺
colorFrom: red
colorTo: gray
sdk: gradio
sdk_version: 4.19.2
app_file: app.py
pinned: true
license: mit
---

# Static.news Backend Broadcast System

This is the production backend for Static.news - The AI News Network That's Lost Its Mind.

## Features

- 24/7 autonomous news broadcast
- AI-generated scripts with personality quirks
- Real-time audio synthesis with character voices
- Video generation with lip-sync
- Existential breakdowns every 2-6 hours
- Revenue tracking from confused sponsors

## Status

🔴 **LIVE** - Broadcasting 24/7

Current capabilities:
- ✅ Script generation from real news
- ✅ Character voice synthesis
- ✅ Breakdown scheduling
- ✅ WebSocket streaming
- ✅ Revenue tracking

## API Endpoints

- WebSocket: `wss://alledged-static-news-backend.hf.space/ws`
- Video Stream: `https://alledged-static-news-backend.hf.space/stream/video`
- Audio Stream: `https://alledged-static-news-backend.hf.space/stream/audio`
- Status: `https://alledged-static-news-backend.hf.space/api/status`

## Integration

The main website at static.news connects to this backend automatically.
EOF

# Create a simple test script
cat > $DEPLOY_DIR/test_connection.py << 'EOF'
import asyncio
import websockets
import json

async def test_connection():
    uri = "wss://alledged-static-news-backend.hf.space/ws"
    try:
        async with websockets.connect(uri) as websocket:
            # Send test message
            await websocket.send(json.dumps({
                "type": "status_request"
            }))
            
            # Wait for response
            response = await websocket.recv()
            data = json.loads(response)
            print(f"✅ Connected! Status: {data}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
EOF

echo "✅ Deployment files prepared in $DEPLOY_DIR/"
echo ""
echo "📋 Next steps:"
echo "1. Go to: https://huggingface.co/spaces/$HF_USERNAME/$HF_SPACE_NAME/tree/main"
echo "2. Upload these files from $DEPLOY_DIR/:"
echo "   - app.py (main application)"
echo "   - requirements.txt (dependencies)"
echo "   - complete_hf_broadcast_space.py (broadcast system)"
echo "   - README.md (space documentation)"
echo ""
echo "3. The space will automatically rebuild and start"
echo "4. Test the connection with: python3 $DEPLOY_DIR/test_connection.py"
echo ""
echo "🎯 Important URLs:"
echo "- Space URL: https://$HF_USERNAME-$HF_SPACE_NAME.hf.space"
echo "- WebSocket: wss://$HF_USERNAME-$HF_SPACE_NAME.hf.space/ws"
echo ""
echo "💡 Tips:"
echo "- Make sure the space has GPU enabled for video generation"
echo "- Monitor the logs at: https://huggingface.co/spaces/$HF_USERNAME/$HF_SPACE_NAME/logs"
echo "- The space will auto-restart if it crashes"

# Make deployment files easily accessible
echo ""
echo "📁 Files ready for upload in: $(pwd)/$DEPLOY_DIR/"
ls -la $DEPLOY_DIR/