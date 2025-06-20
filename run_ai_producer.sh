#!/bin/bash

echo "======================================"
echo "    STATIC.NEWS AI PRODUCER"
echo "    Autonomous Management System"
echo "======================================"
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check for required environment variables
if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "⚠️  Warning: OPENROUTER_API_KEY not set"
    echo "   The AI will use fallback content generation"
    echo "   Set it with: export OPENROUTER_API_KEY='your-key'"
    echo ""
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  Warning: GITHUB_TOKEN not set" 
    echo "   The AI cannot automatically fix deployment issues"
    echo "   Set it with: export GITHUB_TOKEN='your-token'"
    echo ""
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
pip3 install httpx asyncio > /dev/null 2>&1

# Start the AI Producer
echo "🚀 Starting Autonomous AI Producer..."
echo ""

cd core
python3 ai_producer_autonomous.py