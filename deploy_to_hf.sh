#!/bin/bash
# Deploy the REAL AI broadcast system to HuggingFace Space

echo "🚀 Deploying Static.news REAL AI Broadcast to HuggingFace Space"

# Configuration
HF_USERNAME="alledged"
SPACE_NAME="static-news-backend"
SPACE_PATH="/Volumes/Logan T7 Touch/static.news/hf-space-deploy"

# Check if we have the HF CLI
if ! command -v huggingface-cli &> /dev/null; then
    echo "❌ HuggingFace CLI not found. Installing..."
    pip install huggingface-hub
fi

# Navigate to deployment directory
cd "$SPACE_PATH"

# Create a deployment package with the REAL system
echo "📦 Preparing deployment package..."

# Copy the REAL broadcast system
cp app_final.py app.py
cp requirements_full.txt requirements.txt

# Create README for the Space
cat > README.md << EOF
---
title: Static News Backend
emoji: 📺
colorFrom: red
colorTo: blue
sdk: gradio
sdk_version: 4.16.0
app_file: app.py
pinned: true
hardware: gpu-t4
---

# Static.news - 24/7 AI News Network Backend

This is the backend for Static.news, a 24/7 AI news network with:
- Real AI-generated anchors
- Live lip-syncing
- Voice cloning
- Professional broadcast graphics
- Existential breakdowns every 2-6 hours

## Status: LIVE 🔴
EOF

# Create .gitignore
cat > .gitignore << EOF
__pycache__/
*.pyc
.env
.DS_Store
assets/ai_characters/*.png
assets/ai_characters/*.jpg
temp/
*.log
EOF

# Log into HuggingFace (if not already logged in)
echo "🔐 Checking HuggingFace authentication..."
huggingface-cli whoami || huggingface-cli login

# Clone or update the Space
SPACE_URL="https://huggingface.co/spaces/$HF_USERNAME/$SPACE_NAME"
TEMP_DIR="/tmp/hf_space_deploy_$$"

echo "📥 Cloning Space..."
git clone $SPACE_URL $TEMP_DIR 2>/dev/null || {
    echo "Space doesn't exist, creating new one..."
    huggingface-cli repo create $SPACE_NAME --type space --space_sdk gradio
    git clone $SPACE_URL $TEMP_DIR
}

# Copy files to Space
echo "📤 Copying files..."
cp app.py $TEMP_DIR/
cp requirements.txt $TEMP_DIR/
cp README.md $TEMP_DIR/
cp .gitignore $TEMP_DIR/
cp character_generation_system.py $TEMP_DIR/ 2>/dev/null || echo "Character system will be created on first run"

# Create necessary directories
mkdir -p $TEMP_DIR/assets/characters
mkdir -p $TEMP_DIR/assets/studio
mkdir -p $TEMP_DIR/temp

# Commit and push
cd $TEMP_DIR
git add -A
git commit -m "Deploy REAL AI broadcast system with live video generation" || echo "No changes to commit"
git push

echo "✅ Deployment complete!"
echo "📺 Your Space: $SPACE_URL"
echo ""
echo "⏳ The Space will take 10-15 minutes to build"
echo "⏳ First character generation will take 30-60 minutes"
echo ""
echo "🔗 WebSocket URL: wss://$HF_USERNAME-$SPACE_NAME.hf.space/ws"
echo ""
echo "📺 Once running, visit: https://static.news/live.html"

# Cleanup
rm -rf $TEMP_DIR