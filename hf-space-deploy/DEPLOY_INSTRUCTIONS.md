# 🚀 Deploy to HuggingFace Space in Dev Mode

Since you're in Dev Mode, here's how to deploy the REAL broadcast system:

## Step 1: Copy Files to Dev Container

From your **local machine**, copy these files somewhere accessible:
- `/Volumes/Logan T7 Touch/static.news/hf-space-deploy/app_final.py`
- `/Volumes/Logan T7 Touch/static.news/hf-space-deploy/requirements.txt`
- `/Volumes/Logan T7 Touch/static.news/hf-space-deploy/character_generation_system.py`

## Step 2: In the Dev Container Terminal

```bash
# Navigate to the app directory
cd /home/user/app

# Create the new app.py with the REAL system
cat > app.py << 'EOF'
[Paste the entire content of app_final.py here]
EOF

# Update requirements.txt
cat > requirements.txt << 'EOF'
[Paste the content of requirements.txt here]
EOF

# Add character generation system if needed
cat > character_generation_system.py << 'EOF'
[Paste the content if you want character generation]
EOF

# Commit and push
git add -A
git commit -m "Deploy REAL AI news broadcast with live video and lip sync"
git push
```

## Step 3: What Happens Next

1. **The Space will automatically rebuild** (10-15 minutes)
2. **First run will generate characters** (30-60 minutes)
3. **Then 24/7 broadcast with:**
   - Real AI character videos (not circles)
   - Live lip syncing
   - Voice synthesis
   - Professional graphics
   - Real news from CNN/BBC/Reuters

## Alternative: Quick Test First

If you want to test that deployment works, use the simple test version:

```bash
# In dev container
cd /home/user/app

# Copy the test version
cp app_simple_test.py app.py

# Commit and push
git add app.py
git commit -m "Test deployment"
git push
```

This will show:
- Professional studio background
- Live news ticker
- "DEV MODE" message
- Working WebSocket

Then you can deploy the full version.

## 🔍 To Verify It's Working

1. Visit: https://alledged-static-news-backend.hf.space
2. You should see the Gradio interface
3. Visit: https://static.news/live.html
4. You should see the live broadcast

## 📡 The WebSocket URL is:
```
wss://alledged-static-news-backend.hf.space/ws
```

This is already configured in your website's `live-stream-connector.js`