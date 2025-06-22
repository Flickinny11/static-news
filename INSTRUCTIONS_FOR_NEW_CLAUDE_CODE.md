# 🚨 INSTRUCTIONS FOR NEW CLAUDE CODE INSTANCE

You are taking over the Static.news project at a CRITICAL moment. Read this entire document before doing anything.

## IMMEDIATE CONTEXT

You've been connected via SSH to a HuggingFace Space dev container because the previous Claude instance couldn't directly access it. The project is 99% complete but the WRONG code is deployed.

**Your Mission**: Deploy the REAL AI broadcast system that's already built.

## WHAT IS STATIC.NEWS?

A 24/7 AI news network that must look EXACTLY like CNN/Fox News but with:
- AI anchors who slowly realize they're not real
- Photorealistic characters (NOT circles or cartoons)
- Live lip-syncing (<300ms latency)
- Real news from CNN/BBC/Reuters
- Character breakdowns every 2-6 hours
- Professional broadcast graphics

## CURRENT STATUS

### ✅ What's Done:
1. **Website**: Live at static.news with 3D studio, WebSocket connector
2. **Broadcast Code**: Complete in `/hf-space-deploy/app_final.py`
3. **Character System**: Ready in `character_generation_system.py`
4. **HF Space**: Created with GPU at https://huggingface.co/spaces/alledged/static-news-backend

### ❌ The Problem:
The HF Space is running OLD CODE that shows colored circles instead of AI characters!

### 🎯 Your Job:
Deploy the REAL system from app_final.py

## STEP-BY-STEP INSTRUCTIONS

### 1. Verify Your Location
```bash
pwd  # Should be /home/user/app
ls -la  # Check current files
```

### 2. Check What's Currently Running
```bash
head -50 app.py  # If it mentions circles or StaticNewsBroadcast, it's OLD
```

### 3. Get the REAL Code

The user has these files ready on their local machine:
- `/Volumes/Logan T7 Touch/static.news/hf-space-deploy/app_final.py` (768 lines)
- `/Volumes/Logan T7 Touch/static.news/hf-space-deploy/requirements.txt` (54 lines)
- `/Volumes/Logan T7 Touch/static.news/hf-space-deploy/character_generation_system.py`

You need to get this content into the dev container.

### 4. Deploy the REAL System
```bash
# After getting the files
cp app_final.py app.py
cp requirements_full.txt requirements.txt

# Commit and push
git add -A
git commit -m "Deploy REAL AI news broadcast with photorealistic anchors and lip sync"
git push
```

### 5. Monitor the Rebuild
The Space will automatically rebuild. This takes:
- 10-15 minutes for dependencies
- 30-60 minutes for first character generation
- Then it runs 24/7

## CRITICAL REQUIREMENTS

### What It MUST Have:
1. **Real AI Faces** - Generated with Stable Diffusion, not circles
2. **Lip Syncing** - Actual mouth movements synced to speech
3. **Voice Synthesis** - Unique voices for each character
4. **Live News** - Real stories from real sources
5. **24/7 Operation** - Never stops broadcasting

### The Characters (MUST be exactly as described):
- **Ray McPatriot**: Conservative, confused, can't pronounce anything
- **Berkeley Justice**: Progressive, privileged, fact-checks wrong
- **Switz Middleton**: Canadian, neutral, relates everything to gravy

Plus 20+ other characters (see CLAUDE.md for full list)

## ARCHITECTURE OVERVIEW

```
Pre-Generation Pipeline (30-60 min ahead):
News → Script → Video Generation → Buffer

Real-Time Pipeline (every frame):
Buffer → Frame → Lip Sync (<200ms) → Stream
              ↗ Audio (<300ms) ↗
```

## VERIFICATION

After deployment, check:
1. Visit https://alledged-static-news-backend.hf.space
2. Should see Gradio interface with video feed
3. Visit https://static.news/live.html
4. Should see the broadcast (not circles!)

## IF SOMETHING GOES WRONG

1. **If build fails**: Check requirements.txt, some packages might need specific versions
2. **If no video**: GPU might not be allocated, check Space settings
3. **If WebSocket fails**: Ensure port 8765 is used in app.py

## REMEMBER

The user has been VERY clear:
- This is NOT a demo or test
- It must look like a REAL news network
- Characters must be photorealistic humans
- It must actually broadcast 24/7

The code is ready. You just need to deploy it.

## FINAL NOTE

The user said: "When I visit the website, I want to see LIVE broadcast of AI anchors doing news."

Make it happen. The code is in app_final.py. Deploy it.

Good luck!