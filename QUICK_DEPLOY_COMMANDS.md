# 🚀 QUICK DEPLOY COMMANDS FOR HF SPACE

Copy and paste these in the HF Space dev container:

## 1. Check Current Status
```bash
cd /home/user/app
pwd
ls -la
head -20 app.py
```

## 2. Create the REAL app.py

Since you can't directly copy from local, you have three options:

### Option A: Direct Edit
```bash
# Open app.py in container's editor
# Delete everything
# Copy content from local app_final.py
# Save
```

### Option B: Use Python to download
```python
# If you can host app_final.py somewhere temporarily:
import urllib.request
urllib.request.urlretrieve('URL_TO_APP_FINAL', 'app.py')
```

### Option C: Base64 Transfer
```bash
# On local machine:
base64 /Volumes/Logan\ T7\ Touch/static.news/hf-space-deploy/app_final.py > app_encoded.txt

# In container:
base64 -d < app_encoded.txt > app.py
```

## 3. Update requirements.txt
```bash
cat > requirements.txt << 'EOF'
gradio==4.16.0
opencv-python-headless==4.8.1.78
numpy==1.24.3
websockets==12.0
feedparser==6.0.10
requests==2.31.0
Pillow==10.1.0
torch==2.1.0
torchvision==0.16.0
transformers==4.35.0
diffusers==0.24.0
accelerate==0.24.0
safetensors==0.4.0
xformers==0.0.22
bark==1.0.0
TTS==0.21.0
gfpgan==1.3.8
facexlib==0.3.0
realesrgan==0.3.0
moviepy==1.0.3
imageio==2.31.1
imageio-ffmpeg==0.4.8
scipy==1.11.4
scikit-image==0.21.0
tqdm==4.66.1
soundfile==0.12.1
pydub==0.25.1
EOF
```

## 4. Deploy
```bash
git add -A
git commit -m "Deploy REAL AI broadcast system with photorealistic anchors"
git push
```

## 5. Monitor
```bash
# Watch the build logs in HF Space
# Should take 10-15 minutes to build
# Then 30-60 minutes for first character generation
```

## Key Files You Need:
1. **app_final.py** (768 lines) - The REAL broadcast system
2. **requirements.txt** - With all AI dependencies
3. **character_generation_system.py** - For generating characters

## WebSocket URL:
```
wss://alledged-static-news-backend.hf.space/ws
```

This is already configured in the website's live-stream-connector.js