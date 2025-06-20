#!/bin/bash

# Hybrid Deployment Script for Static.news
# Uses GitHub Pages (free) for web + Minimal VPS for backend
# This gives you the best of both worlds!

set -e

echo "🎭 STATIC.NEWS HYBRID DEPLOYMENT"
echo "💰 Minimal costs, maximum chaos!"
echo ""

# Configuration
GITHUB_USERNAME=${GITHUB_USERNAME:-""}
GITHUB_REPO="static-news"

# Check requirements
check_requirements() {
    echo "✅ Checking requirements..."
    
    if [ ! -f .env ]; then
        echo "❌ ERROR: .env file not found!"
        exit 1
    fi
    
    if [ -z "$GITHUB_USERNAME" ]; then
        echo "❌ ERROR: GITHUB_USERNAME not set!"
        echo "Please run: export GITHUB_USERNAME=your_github_username"
        exit 1
    fi
    
    echo "✅ All requirements met!"
}

# Deploy web to GitHub Pages
deploy_web_github() {
    echo "🌐 Deploying web interface to GitHub Pages..."
    
    # Initialize git if needed
    if [ ! -d .git ]; then
        git init
        git add .
        git commit -m "Initial commit: Static.news - Where Truth Goes to Die"
    fi
    
    # Create gh-pages branch
    git checkout -b gh-pages 2>/dev/null || git checkout gh-pages
    
    # Prepare web files
    mkdir -p docs
    cp -r web/* docs/
    
    # Update API endpoints to use Render backend
    cat > docs/config.js << 'EOF'
// Static.news Configuration
const CONFIG = {
    API_URL: 'https://static-news-api.onrender.com',
    WS_URL: 'wss://static-news-api.onrender.com',
    STRIPE_PUBLIC_KEY: 'pk_live_51RPEbZ2KRfBV8ELzwlVnrkzOoE7JxBNaBgAqEuWOxJTN1zullzP0CdzGflZsofkisQWuBgxiBmvUx9jifHZYvVCB00VhrDaRYu'
};
EOF
    
    # Update index.html to use config
    sed -i '' '/<\/head>/i\
<script src="config.js"></script>' docs/index.html
    
    sed -i '' 's|http://localhost:8000|" + CONFIG.API_URL + "|g' docs/index.html
    sed -i '' 's|ws://localhost:8000|" + CONFIG.WS_URL + "|g' docs/index.html
    
    # Commit and push
    git add docs/
    git commit -m "Deploy Static.news web interface"
    
    # Add remote if not exists
    if ! git remote | grep -q origin; then
        git remote add origin https://github.com/$GITHUB_USERNAME/$GITHUB_REPO.git
    fi
    
    echo "📤 Pushing to GitHub..."
    git push -u origin gh-pages
    
    echo "✅ Web deployed to: https://$GITHUB_USERNAME.github.io/$GITHUB_REPO"
}

# Create minimal backend for Render.com (free tier)
create_render_backend() {
    echo "🔧 Creating minimal backend for Render..."
    
    # Create render directory
    mkdir -p render-backend
    
    # Create minimal FastAPI backend
    cat > render-backend/main.py << 'EOF'
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import os
from datetime import datetime
import random

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory state
broadcast_state = {
    "segment_number": 0,
    "hours_awake": 0,
    "gravy_counter": 0,
    "swear_jar": 0,
    "friendship_meter": 50,
    "next_breakdown": datetime.now().isoformat()
}

@app.get("/")
async def root():
    return {"service": "Static.news API", "status": "The anchors don't know"}

@app.get("/stream")
async def stream():
    # Return a simple audio URL (you can host MP3s on GitHub)
    return {"audio_url": f"https://{os.getenv('GITHUB_USERNAME')}.github.io/static-news/audio/current.mp3"}

@app.get("/metrics")
async def metrics():
    # Update metrics
    broadcast_state["hours_awake"] += 0.1
    broadcast_state["gravy_counter"] += random.randint(0, 2)
    return broadcast_state

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(5)
            await websocket.send_json({
                "type": "update",
                "metrics": broadcast_state
            })
    except:
        pass

# Minimal audio generation endpoint
@app.post("/generate")
async def generate_segment():
    # This would trigger audio generation
    # For now, return pre-generated audio
    return {"status": "generated", "file": "segment.mp3"}
EOF
    
    # Create requirements.txt
    cat > render-backend/requirements.txt << 'EOF'
fastapi==0.111.0
uvicorn[standard]==0.30.1
websockets==12.0
EOF
    
    # Create render.yaml
    cat > render-backend/render.yaml << 'EOF'
services:
  - type: web
    name: static-news-api
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: GITHUB_USERNAME
        sync: false
EOF
    
    echo "✅ Minimal backend created!"
}

# Create GitHub Action for continuous audio generation
create_github_action() {
    echo "🤖 Creating GitHub Action for audio generation..."
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/generate_audio.yml << 'EOF'
name: Generate Audio Segments

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y ffmpeg espeak
          pip install pydub numpy
          
      - name: Generate audio segment
        run: |
          python scripts/generate_minimal_audio.py
          
      - name: Commit audio
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/audio/
          git commit -m "Update audio segment" || exit 0
          git push
EOF
    
    # Create minimal audio generation script
    mkdir -p scripts
    cat > scripts/generate_minimal_audio.py << 'EOF'
#!/usr/bin/env python3
import subprocess
import random
from datetime import datetime

# Generate simple audio with espeak
anchors = ["Ray", "Bee", "Switz"]
anchor = random.choice(anchors)

texts = [
    "This is Static.news, where truth goes to die.",
    "Breaking news: Everything is confusing.",
    "I might be having a breakdown soon.",
    "Is this real? Are you real? Am I real?",
    "Gravy counter is at infinity.",
    "The news is fake but my confusion is real."
]

text = random.choice(texts)

# Generate with espeak
subprocess.run([
    "espeak", "-w", "/tmp/segment.wav", 
    "-s", "150",  # Speed
    text
])

# Convert to MP3
subprocess.run([
    "ffmpeg", "-i", "/tmp/segment.wav",
    "-codec:a", "libmp3lame", "-b:a", "64k",
    "docs/audio/current.mp3"
])

print(f"Generated: {text}")
EOF
    
    chmod +x scripts/generate_minimal_audio.py
    
    echo "✅ GitHub Action created!"
}

# Main deployment
main() {
    check_requirements
    
    echo "🎬 Starting hybrid deployment..."
    echo ""
    echo "This will:"
    echo "1. Deploy web to GitHub Pages (FREE)"
    echo "2. Create minimal backend for Render.com (FREE)"
    echo "3. Use GitHub Actions for basic audio (FREE)"
    echo ""
    
    # Deploy web
    deploy_web_github
    
    # Create backend
    create_render_backend
    
    # Create GitHub Action
    create_github_action
    
    echo ""
    echo "🎉 HYBRID DEPLOYMENT READY!"
    echo ""
    echo "📋 Next steps:"
    echo ""
    echo "1. Enable GitHub Pages in your repo settings (use /docs folder)"
    echo "   👉 https://github.com/$GITHUB_USERNAME/$GITHUB_REPO/settings/pages"
    echo ""
    echo "2. Deploy backend to Render.com (FREE):"
    echo "   a. Go to https://render.com"
    echo "   b. Connect your GitHub repo"
    echo "   c. Select the 'render-backend' directory"
    echo "   d. Deploy!"
    echo ""
    echo "3. Enable GitHub Actions in your repo"
    echo ""
    echo "🌐 Your site will be live at:"
    echo "   Web: https://$GITHUB_USERNAME.github.io/$GITHUB_REPO"
    echo "   API: https://static-news-api.onrender.com"
    echo ""
    echo "💰 Total monthly cost: $0"
    echo "🎭 The show goes on... for free!"
}

# Run deployment
main