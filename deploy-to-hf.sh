#!/bin/bash

# Static.news HF Space Deployment Script
# This script uploads the correct production files to your HF Space

echo "🚀 Deploying Static.news Production System to Hugging Face Space..."

# Check if we're in the right directory
if [ ! -f "hf-space-deploy/app.py" ]; then
    echo "❌ Error: Cannot find hf-space-deploy/app.py"
    echo "Please run this script from the static.news root directory"
    exit 1
fi

# Create temporary directory for deployment
DEPLOY_DIR=$(mktemp -d)
echo "📁 Created temporary deployment directory: $DEPLOY_DIR"

# Copy production files
echo "📋 Copying production files..."
cp hf-space-deploy/app.py "$DEPLOY_DIR/"
cp hf-space-deploy/requirements.txt "$DEPLOY_DIR/"
cp hf-space-deploy/README.md "$DEPLOY_DIR/"

# If you have the HF CLI installed, you can use this section
# Otherwise, use the manual upload method below
if command -v huggingface-cli &> /dev/null; then
    echo "🤗 Found Hugging Face CLI"
    
    # Login to HF (you'll need to have your token ready)
    echo "Please make sure you're logged in to Hugging Face CLI"
    echo "Run: huggingface-cli login"
    
    # Upload files
    cd "$DEPLOY_DIR"
    
    # Initialize git if needed
    git init
    git add .
    git commit -m "Deploy Static.news production system with real TTS and video generation"
    
    # Add HF remote
    git remote add hf https://huggingface.co/spaces/alledged/static-news-backend
    
    # Push to HF
    echo "📤 Pushing to Hugging Face Space..."
    git push hf main --force
    
else
    echo "⚠️  Hugging Face CLI not found"
    echo ""
    echo "📝 Manual deployment instructions:"
    echo "1. Go to: https://huggingface.co/spaces/alledged/static-news-backend/tree/main"
    echo "2. Click 'Files and versions' tab"
    echo "3. Delete the current app.py, requirements.txt, and README.md"
    echo "4. Upload these files from $DEPLOY_DIR:"
    echo "   - app.py (31KB - Complete production system)"
    echo "   - requirements.txt (with TTS, audiocraft, etc.)"
    echo "   - README.md (updated documentation)"
    echo ""
    echo "Or use SCP to upload directly:"
    echo "scp -r $DEPLOY_DIR/* alledged-static-news-backend@ssh.hf.space:~/"
fi

echo ""
echo "📋 File checksums for verification:"
md5sum "$DEPLOY_DIR"/*

echo ""
echo "✅ Deployment files ready!"
echo ""
echo "🔍 After deployment, verify:"
echo "1. Check logs at: https://huggingface.co/spaces/alledged/static-news-backend/logs"
echo "2. Test WebSocket: wss://alledged-static-news-backend.hf.space/ws"
echo "3. Check status: https://alledged-static-news-backend.hf.space/api/status"
echo "4. Verify TTS is working (should see 'TTS initialized successfully' in logs)"
echo "5. GPU should show as available (T4 GPU allocated)"
echo ""
echo "🎮 Your Space has a T4 GPU - all features will work:"
echo "   - Real-time TTS voice generation with Coqui TTS"
echo "   - MusicGen for theme music and jingles"
echo "   - Fast video frame generation"
echo "   - Support for multiple concurrent streams"