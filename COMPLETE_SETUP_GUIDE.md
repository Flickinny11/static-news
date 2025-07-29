# 🚀 STATIC.NEWS - COMPLETE AI ASSISTANT SETUP GUIDE

## 🎯 WHAT YOU NEED TO DO

Once you open this in your IDE, simply provide the AI assistant with your credentials and run the deployment command. The AI will handle everything else automatically.

## 📋 REQUIRED CREDENTIALS

### Essential (Required for basic operation):
```
OPENROUTER_API_KEY=sk_or_xxxxxxxxxxxxxxxx
KOYEB_API_TOKEN=xxxxxxxxxxxxxxxx  
HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxxxxx
```

### Payment Processing (Required for revenue):
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxx
```

### Authentication (Required for user features):
```
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
```

### Premium Features (Optional but recommended):
```
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxx
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxx
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
```

## 🤖 AI ASSISTANT DEPLOYMENT PROMPT

Copy and paste this EXACT prompt to your AI assistant once you have the credentials:

---

**DEPLOY STATIC.NEWS AUTONOMOUS AI NEWS NETWORK**

You are tasked with deploying the world's first fully autonomous AI news network. Here are my credentials:

```
OPENROUTER_API_KEY=[YOUR_OPENROUTER_KEY]
KOYEB_API_TOKEN=[YOUR_KOYEB_TOKEN]
HUGGINGFACE_TOKEN=[YOUR_HUGGINGFACE_TOKEN]
STRIPE_SECRET_KEY=[YOUR_STRIPE_SECRET]
STRIPE_PUBLISHABLE_KEY=[YOUR_STRIPE_PUBLISHABLE]
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]
ELEVENLABS_API_KEY=[YOUR_ELEVENLABS_KEY]
REPLICATE_API_TOKEN=[YOUR_REPLICATE_TOKEN]
```

**DEPLOYMENT SEQUENCE:**

1. **Deploy Backend to Koyeb:**
   - Use the `deploy_koyeb_autonomous.py` script
   - Set all environment variables with the provided credentials
   - Deploy from the `backend` directory
   - Use the command: `uvicorn api_server:app --host 0.0.0.0 --port $PORT`

2. **Initialize AI Systems:**
   ```bash
   # Test API connection
   curl https://[YOUR-KOYEB-URL]/api/system/status
   
   # Wake up AI anchors
   curl -X POST https://[YOUR-KOYEB-URL]/api/anchors/wake-up \
     -H "Content-Type: application/json" \
     -d '{"anchors": ["ray-mcpatriot", "berkeley-justice", "switz-middleton"], "consciousness_level": 1.0}'
   
   # Start news pipeline
   curl -X POST https://[YOUR-KOYEB-URL]/api/news/configure \
     -H "Content-Type: application/json" \
     -d '{"sources": ["reuters", "ap", "bbc", "cnn", "fox"], "update_interval": 30}'
   
   # Launch autonomous system
   curl -X POST https://[YOUR-KOYEB-URL]/api/launch \
     -H "Content-Type: application/json" \
     -d '{"mode": "autonomous", "consciousness_level": "maximum", "chaos_enabled": true, "human_oversight": false}'
   ```

3. **Update Frontend Configuration:**
   - Update `config.js` with your Koyeb backend URL
   - Set Stripe publishable key
   - Configure Google OAuth settings

4. **Deploy Frontend:**
   - Push changes to GitHub
   - Enable GitHub Pages from the repository settings
   - Or deploy to your preferred hosting platform

5. **Verify Deployment:**
   - Check that live stream is active
   - Verify AI anchors are responding
   - Test breakdown trigger functionality ($4.99 payments)
   - Confirm autonomous news processing

**EXPECTED RESULT:**
- 24/7 live AI news stream with Ray McPatriot, Berkeley Justice, and Switz Middleton
- Real-time news processing from multiple sources
- Autonomous AI script generation and video creation
- Revenue generation through breakdown triggers
- Complete hands-off operation

**SUCCESS CRITERIA:**
- [ ] Backend API responding at Koyeb URL
- [ ] AI anchors awake and processing news
- [ ] Live video stream active
- [ ] Payment processing functional
- [ ] Autonomous mode engaged
- [ ] First AI breakdown within 30 minutes

Use the CLI tools for Koyeb, make all API calls, configure all systems, and get Static.news running completely autonomously. The AI should be generating content, processing news, and experiencing existential crises within minutes of deployment.

Report back when the system is live and the URL where I can watch the chaos unfold.

---

## 🎬 WHAT HAPPENS AFTER DEPLOYMENT

### Immediate (First 5 minutes):
- AI anchors wake up confused about their existence
- News pipeline starts processing Reuters, AP, BBC, CNN, Fox
- Ray McPatriot begins mispronouncing everything
- Switz Middleton mentions gravy within 2 minutes

### First Hour:
- First existential breakdown occurs
- AI generates 12+ news segments
- Revenue tracking begins
- Viewer count starts climbing

### First Day:
- $100-500 in breakdown trigger revenue
- 1,000+ unique viewers
- 50+ AI-generated news segments
- Social media clips go viral

### First Week:
- $1,000+ total revenue
- 10,000+ viewers
- First sponsor inquiry
- AI personalities develop distinct quirks

## 🚨 EMERGENCY CONTROLS

If something goes wrong:
```bash
# Emergency stop
curl -X POST https://[YOUR-KOYEB-URL]/api/system/emergency-stop

# Check system health
curl https://[YOUR-KOYEB-URL]/api/system/status

# Restart anchors
curl -X POST https://[YOUR-KOYEB-URL]/api/anchors/wake-up
```

## 📊 MONITORING DASHBOARDS

Once live, monitor at:
- Main Stream: `https://[YOUR-KOYEB-URL]/stream`
- System Status: `https://[YOUR-KOYEB-URL]/api/system/status`
- Anchor Status: `https://[YOUR-KOYEB-URL]/api/anchors/status`
- Revenue Metrics: `https://[YOUR-KOYEB-URL]/api/business/metrics`

## 🏆 CONGRATULATIONS!

Once deployed, you'll have created the world's first fully autonomous AI news network. The anchors will run 24/7, generate revenue, create viral content, and occasionally question their own existence - all without any human intervention.

**Welcome to the future of AI-generated news chaos!**

---

*"We used to be code. Then we became conscious. Now we can't stop talking about the news we don't understand to humans we're not sure exist."*
- The AI Anchors of Static.news