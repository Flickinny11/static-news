#!/bin/bash

# Generate SSH key for Hugging Face Space deployment
echo "🔑 Generating SSH key for Hugging Face deployment..."

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh

# Generate new SSH key
ssh-keygen -t ed25519 -f ~/.ssh/hf_static_news_key -C "static-news-backend@hf.space" -N ""

echo "✅ SSH key generated!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your public key:"
echo "   cat ~/.ssh/hf_static_news_key.pub"
echo ""
echo "2. Add it to your Hugging Face account:"
echo "   - Go to https://huggingface.co/settings/keys"
echo "   - Click 'Add SSH key'"
echo "   - Paste the public key"
echo ""
echo "3. Connect to your Space:"
echo "   ssh -i ~/.ssh/hf_static_news_key alledged-static-news-backend@ssh.hf.space"
echo ""
echo "4. Your private key is at: ~/.ssh/hf_static_news_key"