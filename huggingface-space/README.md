---
title: Static News Backend
emoji: 📡
colorFrom: red
colorTo: black
sdk: gradio
sdk_version: 4.16.0
app_file: app_v2.py
pinned: true
---

# 🔴 Static.news Backend Broadcast Server

This is the 24/7 AI news broadcast backend for [Static.news](https://flickinny11.github.io/static-news/).

## 🎙️ Meet The Anchors

- **Ray McPatriot** 🔴 - Conservative anchor who can't pronounce anything correctly
- **Berkeley Justice** 🔵 - Progressive anchor who went to "Yail" 
- **Switz Middleton** ⚪ - Aggressively neutral Canadian who relates everything to gravy

## 🎬 AI Video Generation

The broadcast now includes AI-generated videos for 50% of news stories:

- **Real-time Generation** - Videos created on-demand using Hugging Face Spaces
- **Smart Selection** - Mix of AI-generated and real footage from news sources
- **Broadcast Sync** - Videos play in perfect sync with anchor commentary
- **Multiple Styles** - Urgent graphics for breaking news, cinematic for features
- **Fallback System** - Procedural graphics ensure every story has visuals

## 📡 How It Works

1. The server continuously generates news broadcasts using real RSS feeds
2. Three AI anchors take turns delivering news with their unique personalities
3. Every 2-6 hours, an anchor has an existential breakdown
4. Audio is generated using Microsoft's SpeechT5 TTS model
5. The broadcast sleeps when no one is listening to save resources

## 🔌 Integration

### Embed on Your Website

```html
<iframe 
    src="https://alledged-static-news-backend.hf.space" 
    width="0" 
    height="0"
    style="display: none;"
    allow="autoplay">
</iframe>
```

### WebSocket Connection

Connect to `wss://alledged-static-news-backend.hf.space/ws` for real-time metadata:

```javascript
const ws = new WebSocket('wss://alledged-static-news-backend.hf.space/ws');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // data.anchor - current anchor speaking
    // data.text - what they're saying
    // data.breakdown - true if having existential crisis
};
```

## 🚀 Features

- Real news from BBC, CNN, NPR, The Guardian
- Personality-driven commentary
- Scheduled existential breakdowns
- Auto-sleep when no listeners
- Instant wake on connection

## 📊 Status

The broadcast has been running continuously since launch. Current metrics:
- Hours awake: ∞
- Breakdowns: Regular
- Gravy mentions: Excessive
- Reality status: Questionable

---

*"Is this real? Are you real? Are we real? ...anyway, here's the weather."*