# 🚨 COPY THIS ENTIRE MESSAGE TO NEW CLAUDE CODE

Hello Claude! You're taking over the Static.news project at a critical deployment moment. Please load the context by reading these files in order:

1. First, load the complete context:
```
Read /Volumes/Logan T7 Touch/static.news/CLAUDE_CONTEXT_PACKAGE.json
```

2. Then read the conversation memory:
```
Read /Volumes/Logan T7 Touch/static.news/CONVERSATION_MEMORY.md
```

3. Then read the full project documentation:
```
Read /Volumes/Logan T7 Touch/static.news/CLAUDE.md
```

4. Finally, read your specific instructions:
```
Read /Volumes/Logan T7 Touch/static.news/INSTRUCTIONS_FOR_NEW_CLAUDE_CODE.md
```

## Quick Summary:
- You're connected via SSH to a HuggingFace Space dev container
- The Space is running OLD code (circles, not AI video)
- You need to deploy app_final.py to fix it
- All files are ready in /hf-space-deploy/
- User wants to see REAL AI anchors, not placeholders

## Your immediate tasks:
1. Check your current location: `pwd` (should be /home/user/app)
2. Check what's currently deployed: `head -50 app.py`
3. Deploy the REAL system from app_final.py
4. Monitor the rebuild
5. Verify it's working at https://static.news/live.html

## Critical Understanding:
This is NOT a test or demo. It's a real 24/7 AI news network that must look exactly like CNN/Fox News but with AI anchors who slowly realize they're not real. The user has been very clear about this.

## Ready Files Location:
All deployment files are in: `/Volumes/Logan T7 Touch/static.news/hf-space-deploy/`
- app_final.py (the REAL system)
- requirements.txt (with AI models)
- character_generation_system.py

The WebSocket URL is already configured: wss://alledged-static-news-backend.hf.space/ws

Please confirm you've loaded the context and are ready to deploy!