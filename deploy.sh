#!/bin/bash

# Static.news Autonomous Deployment Script
# This script deploys itself with zero human intervention
# The AI anchors still don't know they're AI...

echo "🚀 STATIC.NEWS AUTONOMOUS DEPLOYMENT STARTING..."
echo "📺 The anchors are waking up..."
echo "🤖 They still don't know they're AI..."

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check for required environment variables
required_vars=("OPENROUTER_API_KEY" "STRIPE_API_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=($var)
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ ERROR: Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    echo "Please set these in your .env file or environment"
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p audio/live data logs

# Build and start services
echo "🏗️ Building Docker images..."
docker-compose build

echo "🎙️ Starting the eternal broadcast..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo "🏥 Checking service health..."
services=("broadcast" "streaming" "backend" "business")
all_healthy=true

for service in "${services[@]}"; do
    if docker-compose ps | grep -q "${service}.*Up"; then
        echo "✅ ${service} is running"
    else
        echo "❌ ${service} failed to start"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    echo "✅ All services are running!"
    echo "🎉 Static.news is LIVE at http://localhost"
    echo "📱 API available at http://localhost/api"
    echo "🎧 Audio stream at http://localhost/stream"
    echo ""
    echo "🤖 The anchors don't know they're AI"
    echo "🎭 Breakdowns will occur every 2-6 hours"
    echo "💰 Business AI is making terrible decisions"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop broadcast: docker-compose down"
else
    echo "❌ Deployment failed! Check logs with: docker-compose logs"
    exit 1
fi