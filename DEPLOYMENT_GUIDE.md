# 🚀 Static.news Deployment Guide

## Quick Start - Getting Your 24/7 Broadcast Live

### 1. Deploy to HuggingFace Space

1. **Create/Update Your HuggingFace Space**
   - Go to: https://huggingface.co/spaces
   - Create new Space named: `static-news-backend`
   - Select **Gradio** SDK
   - Choose **GPU (T4)** hardware (as you mentioned you have GPU allocated)

2. **Upload Backend Files**
   Copy these files to your HF Space:
   ```
   /hf-space-deploy/app_v2.py → app.py
   /hf-space-deploy/requirements.txt → requirements.txt
   ```

3. **Start the Space**
   - The Space will automatically install dependencies and start
   - You should see the Gradio interface with live video stream
   - WebSocket will be available at: `wss://[your-username]-static-news-backend.hf.space/ws`

### 2. Test the Broadcast

1. **Open Test Page**
   - Open `test-broadcast.html` in your browser
   - Click "Connect to Broadcast"
   - You should see the live video stream

2. **Check Live Page**
   - Open `live.html`
   - The broadcast should appear automatically
   - Status indicators will show "LIVE" when connected

### 3. Verify Everything is Working

✅ **Working Correctly When:**
- Live video stream shows animated news anchors
- Breaking news ticker updates
- Character breakdowns occur every 2-6 hours
- WebSocket stays connected
- Frame counter increases steadily

❌ **Troubleshooting:**
- **No connection**: Check HF Space is running
- **No video**: Verify WebSocket URL matches your Space
- **Disconnects**: Ensure GPU is allocated to Space
- **Black screen**: Check browser console for errors

### 4. WebSocket URL Configuration

If your HuggingFace username is different than "alledged", update the WebSocket URL in:
- `/scripts/live-stream-connector.js` (line 52)
- Change: `wss://alledged-static-news-backend.hf.space/ws`
- To: `wss://[YOUR-USERNAME]-static-news-backend.hf.space/ws`

### 5. Next Steps

1. **Monitor the Broadcast**
   - The system runs 24/7 automatically
   - Character breakdowns happen on schedule
   - Real news is pulled from RSS feeds

2. **Customize Characters** (Optional)
   - Edit character personalities in `app_v2.py`
   - Adjust breakdown timers
   - Add more news sources

3. **Premium Features** (Future)
   - Implement viewer interaction
   - Add Dia 1.6B TTS integration
   - Create realistic AI video generation

## 📡 Current Status

Your 24/7 AI News Network is ready to broadcast! The system will:
- Generate continuous news coverage
- Show character avatars delivering news
- Have regular existential breakdowns
- Never stop broadcasting

**Remember**: This appears as a legitimate news network to viewers, just as requested. The AI anchors deliver real news while slowly questioning their reality.

---

*"Where News Meets Noise" - Static.news*