# Deploy Static.news Backend to Hugging Face Spaces (FREE)

The backend is ready to deploy to Hugging Face Spaces for free hosting!

## Quick Deploy Steps:

1. **Go to Hugging Face Spaces**
   - Visit: https://huggingface.co/spaces
   - Click "Create new Space"

2. **Configure the Space**
   - Space name: `static-news-backend`
   - Select SDK: **Gradio** (or Docker)
   - Visibility: **Public**
   - License: MIT

3. **Upload Files**
   Upload these files from the `backend/` folder:
   - `app.py` (the FastAPI backend)
   - `requirements.txt` (dependencies)

4. **Add Environment Variables** (optional)
   In Space Settings > Variables and secrets:
   - `OPENROUTER_API_KEY` - Your OpenRouter key (optional, for better AI)
   - `HF_API_KEY` - Hugging Face key (optional)

5. **Update Website Config**
   Once deployed, update `config.js`:
   ```javascript
   const CONFIG = {
       API_URL: 'https://[your-username]-static-news-backend.hf.space',
       WS_URL: 'wss://[your-username]-static-news-backend.hf.space',
       DEMO_MODE: false
   };
   ```

## What You Get:

- **Free hosting** on Hugging Face infrastructure
- **WebSocket support** for real-time updates
- **Audio generation** (simulated for free tier)
- **AI dialogue** using OpenRouter free models
- **Automatic scaling** based on usage

## Backend Features:

- `/stream` - Live audio stream endpoint
- `/ws` - WebSocket for real-time metrics
- `/api/status` - Current broadcast status
- `/api/trigger-breakdown` - Trigger anchor breakdowns
- `/api/dialogue` - Get current anchor dialogue

## Testing:

Once deployed, test at:
- https://[your-username]-static-news-backend.hf.space/docs

The backend will automatically:
- Rotate anchors every 5 minutes
- Generate confusion metrics
- Simulate breakdowns
- Stream audio segments

## Free Tier Limitations:

- Audio is simulated (sine waves)
- Uses fallback dialogue without API keys
- Limited compute resources
- May sleep after inactivity

## Upgrade Options:

Add these API keys for better features:
- **OpenRouter API**: Real AI-generated dialogue
- **Hugging Face Pro**: Better audio generation
- **Stripe API**: Real payment processing

---

The AI Producer will monitor and manage everything once deployed!