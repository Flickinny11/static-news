# Static.news SSH Deployment Guide for Hugging Face Spaces

## 🔐 Setting Up SSH Access

Since you mentioned needing to SSH into `alledged-static-news-backend@ssh.hf.space`, here's the complete guide:

### Step 1: Generate SSH Key (if you don't have one)

Run the provided script:
```bash
./generate-hf-ssh-key.sh
```

Or manually:
```bash
# Generate ED25519 key (recommended by HF)
ssh-keygen -t ed25519 -f ~/.ssh/hf_static_news_key -C "your-email@example.com"
```

### Step 2: Add SSH Key to Hugging Face

1. Copy your public key:
   ```bash
   cat ~/.ssh/hf_static_news_key.pub
   ```

2. Go to: https://huggingface.co/settings/keys
3. Click "Add SSH key"
4. Paste the public key
5. Give it a name like "Static.news Production"

### Step 3: SSH into Your Space

```bash
# Using the key you generated
ssh -i ~/.ssh/hf_static_news_key alledged-static-news-backend@ssh.hf.space

# Or if you have an existing key at a different path
ssh -i /path/to/your/private_key alledged-static-news-backend@ssh.hf.space
```

## 📦 Files to Deploy

Once connected via SSH, you'll need to upload these files:

### Core Production Files:
- `huggingface-space/app_production.py` - Main production app
- `huggingface-space/requirements.txt` - Dependencies
- `complete-hf-broadcast-space.py` - Complete broadcast system

### Quick Deploy Commands:

```bash
# After SSH connection is established
cd /home/user/app

# Upload the production app
cat > app.py << 'EOF'
[paste app_production.py content]
EOF

# Create requirements.txt
cat > requirements.txt << 'EOF'
gradio==4.44.0
torch>=2.0.0
torchaudio>=2.0.0
torchvision>=0.15.0
transformers>=4.35.0
diffusers>=0.24.0
accelerate>=0.25.0
numpy>=1.24.0
pillow>=10.0.0
opencv-python>=4.8.0
soundfile>=0.12.0
librosa>=0.10.0
websockets>=12.0
aiohttp>=3.9.0
requests>=2.31.0
python-dotenv>=1.0.0
psutil>=5.9.0
TTS>=0.22.0
bark>=0.1.5
audiocraft>=1.3.0
openai-whisper>=20231117
sadtalker>=0.0.2
pydub>=0.25.1
ffmpeg-python>=0.2.0
scipy>=1.11.0
matplotlib>=3.7.0
seaborn>=0.13.0
pandas>=2.0.0
redis>=5.0.0
celery>=5.3.0
prometheus-client>=0.19.0
sentry-sdk>=1.39.0
stripe>=7.0.0
newsapi-python>=0.2.7
tweepy>=4.14.0
praw>=7.7.0
beautifulsoup4>=4.12.0
lxml>=4.9.0
feedparser>=6.0.0
EOF

# Create config file
cat > config.py << 'EOF'
import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
NEWSAPI_KEY = os.getenv('NEWSAPI_KEY', '')
STRIPE_API_KEY = os.getenv('STRIPE_API_KEY', '')
HF_TOKEN = os.getenv('HF_TOKEN', '')

# Production Settings
PRODUCTION_MODE = True
DEBUG = False
ENABLE_BREAKDOWNS = True
BREAKDOWN_MIN_INTERVAL = 7200  # 2 hours
BREAKDOWN_MAX_INTERVAL = 21600  # 6 hours

# Model Settings
USE_GPU = torch.cuda.is_available()
DEVICE = 'cuda' if USE_GPU else 'cpu'
EOF

# Set environment variables
export OPENROUTER_API_KEY="your-key-here"
export NEWSAPI_KEY="your-key-here"
export STRIPE_API_KEY="your-key-here"

# Install dependencies
pip install -r requirements.txt

# Start the app
python app.py
```

## 🚀 Alternative: Direct File Upload via SCP

If you have the SSH key, you can also use SCP to upload files directly:

```bash
# Upload all production files
scp -i ~/.ssh/hf_static_news_key \
    huggingface-space/app_production.py \
    huggingface-space/requirements.txt \
    complete-hf-broadcast-space.py \
    alledged-static-news-backend@ssh.hf.space:/home/user/app/

# Upload the entire huggingface-space directory
scp -i ~/.ssh/hf_static_news_key -r \
    huggingface-space/* \
    alledged-static-news-backend@ssh.hf.space:/home/user/app/
```

## 🔧 Troubleshooting SSH Connection

### Permission Denied
```bash
# Check key permissions
chmod 600 ~/.ssh/hf_static_news_key
chmod 644 ~/.ssh/hf_static_news_key.pub
```

### Connection Refused
- Ensure your HF Space is running
- Check if SSH is enabled for your Space
- Verify the Space name matches exactly

### Key Not Accepted
- Make sure you added the PUBLIC key (.pub) to HF, not the private key
- Try regenerating the key pair
- Check if you're using the correct username

## 📱 Monitoring After Deployment

Once deployed and running:

1. **View Logs**:
   ```bash
   # In SSH session
   tail -f logs/broadcast.log
   ```

2. **Check Status**:
   ```bash
   # Check if app is running
   ps aux | grep app.py
   ```

3. **Monitor Resources**:
   ```bash
   # Check GPU usage (if available)
   nvidia-smi
   
   # Check memory
   free -h
   ```

## 🎯 Next Steps

1. **Find or generate your SSH key**
2. **Add it to Hugging Face**
3. **SSH into the space**
4. **Deploy the production files**
5. **Configure API keys**
6. **Start broadcasting!**

The AI anchors are ready to start their eternal broadcast as soon as you deploy!

---

**Note**: If you don't have the SSH private key file, you'll need to either:
- Find where it was saved when the Space was created
- Generate a new key pair and update HF settings
- Use the web interface at https://huggingface.co/spaces instead