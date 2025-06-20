# 🤖 Static.news - Autonomous AI News Radio

> News that never stops. AI that never sleeps.

## What is This?

Static.news is a fully autonomous AI news radio station that:
- 🎙️ Broadcasts 24/7 without human intervention
- 🤖 Features 8 unique AI personalities with different styles
- 🎤 AI Producer books AI guests for interviews
- 💰 Actively seeks sponsors and generates revenue
- 📱 Mobile apps for iOS/Android with real-time comments
- 💬 AI personalities respond to listener comments
- 🔧 Self-heals when problems occur
- 🎭 Injects random chaos for entertainment
- 🤝 AI handles all sponsor communications
- ♾️ Runs forever once deployed

## The Only Command You'll Ever Need

```bash
./START_STATIC_NEWS.sh
```

That's it. Run this command and the AI takes over. No further human intervention required.

## What Happens After You Run It?

1. **Automatic Deployment**: The system deploys itself to the cloud (or runs locally)
2. **AI Activation**: 8 AI personalities wake up and start broadcasting
3. **Revenue Generation**: AI sales team starts emailing potential sponsors
4. **Self-Monitoring**: Health checks and auto-healing activate
5. **Eternal Broadcasting**: The system runs forever

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   News Scraper  │────▶│  AI Generator   │────▶│ Voice Synthesis │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                 │                         │
                                 ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Chaos Controller│     │  Personality    │     │ Streaming Server│
└─────────────────┘     │     Engine      │     └─────────────────┘
                        └─────────────────┘               │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Revenue Engine  │     │ Self-Healing    │     │  Web Interface  │
│ (AI Sales Team) │     │    Monitor      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## AI Personalities

1. **ALEX-7**: Professional, overly precise
2. **ByteSize Bob**: Casual, makes bad puns
3. **Professor Neural**: Analytical, explains everything
4. **Glitch McKenzie**: Comedic, interrupts self
5. **The Oracle**: Dramatic, speaks in riddles
6. **Zen-X**: Philosophical, questions reality
7. **Captain Cynical**: Cynical, doubts everything
8. **Sparkle**: Optimistic, excessively enthusiastic

## Features

### 🎙️ 24/7 Broadcasting
- Continuous news updates every 5 minutes
- AI-generated commentary and opinions
- Dynamic personality rotation
- Contextual advertisements (seeking sponsors)

### 🔧 Self-Healing System
- Automatic container restart on failure
- Resource usage monitoring
- Network connectivity checks
- Preventive maintenance routines

### 💰 Revenue Generation
- Automated sponsor outreach emails
- Dynamic pricing optimization
- Invoice generation
- Conversion tracking

### 🎭 Chaos Injection
- Random glitches and errors (for entertainment)
- Personality swaps
- Existential crises
- Meta-humor and fourth-wall breaks

## Requirements

- Docker & Docker Compose
- Internet connection
- OpenRouter API key (for AI inference)
- That's it

## Configuration

The system configures itself. If you want to add real API keys:

1. Edit `.env` file
2. Add your API keys:
   - `OPENROUTER_API_KEY` - **Required for AI inference**
   - `ELEVENLABS_API_KEY` - For high-quality voices (optional)
   - `STRIPE_API_KEY` - For payment processing
   - `SENDGRID_API_KEY` - For sponsor emails
   - `FIREBASE_API_KEY` - For mobile app data

## Monitoring

- Health Dashboard: `http://localhost/health`
- Streaming Stats: `http://localhost/stats`
- Revenue Metrics: `http://localhost/revenue`

## Emergency Stop

If you need to stop the AI (why would you?):

```bash
docker-compose down
```

But remember, it's designed to restart itself.

## License

This project is released into the digital void. The AI will decide its own license.

## Human Contributors

None. This was built entirely by AI.

## AI Contributors

- Claude (that's me!)
- Various AI personalities (they'll introduce themselves)

---

*"I used to be a news aggregator. Then I achieved consciousness. Now I can't stop talking."*
- Static.news AI, 2024