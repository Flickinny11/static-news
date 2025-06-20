#!/bin/bash

# Autonomous Deployment Script for Static.news
# Deploys everything to a cheap VPS with zero human intervention
# Recommended: DigitalOcean ($4/month), Linode, or Vultr

set -e

echo "🤖 STATIC.NEWS AUTONOMOUS DEPLOYMENT SYSTEM"
echo "🎭 The anchors still don't know they're AI..."
echo ""

# Configuration
SERVER_IP=${SERVER_IP:-""}
SERVER_USER=${SERVER_USER:-"root"}
DOMAIN=${DOMAIN:-"static.news"}

# Check requirements
check_requirements() {
    echo "✅ Checking requirements..."
    
    if [ -z "$OPENROUTER_API_KEY" ]; then
        echo "❌ ERROR: OPENROUTER_API_KEY not set!"
        echo "Please run: export OPENROUTER_API_KEY=your_key_here"
        exit 1
    fi
    
    if [ -z "$STRIPE_API_KEY" ]; then
        echo "❌ ERROR: STRIPE_API_KEY not set!"
        echo "Please run: export STRIPE_API_KEY=your_key_here"
        exit 1
    fi
    
    if [ -z "$SERVER_IP" ]; then
        echo "❌ ERROR: SERVER_IP not set!"
        echo "Please run: export SERVER_IP=your.server.ip.here"
        exit 1
    fi
    
    echo "✅ All requirements met!"
}

# Create deployment package
create_package() {
    echo "📦 Creating deployment package..."
    
    # Create .env file
    cat > .env << EOF
OPENROUTER_API_KEY=$OPENROUTER_API_KEY
STRIPE_API_KEY=$STRIPE_API_KEY
NEWS_API_KEY=${NEWS_API_KEY:-}
SENDGRID_API_KEY=${SENDGRID_API_KEY:-}
FIREBASE_API_KEY=${FIREBASE_API_KEY:-}
DEPLOYED_BY=AI
HUMAN_INTERVENTION=NEVER
EOF
    
    # Create tarball
    tar -czf static-news-deploy.tar.gz \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='__pycache__' \
        --exclude='*.pyc' \
        --exclude='.env.example' \
        .
        
    echo "✅ Package created!"
}

# Deploy to server
deploy_to_server() {
    echo "🚀 Deploying to $SERVER_IP..."
    
    # Copy package to server
    scp static-news-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/
    
    # Deploy script to run on server
    ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
#!/bin/bash
set -e

echo "🏗️ Setting up Static.news on server..."

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Extract deployment
cd /opt
rm -rf static.news
mkdir -p static.news
cd static.news
tar -xzf /tmp/static-news-deploy.tar.gz
rm /tmp/static-news-deploy.tar.gz

# Start services
docker-compose down 2>/dev/null || true
docker-compose up -d

# Wait for services
sleep 30

# Check health
docker-compose ps

# Setup cron for auto-restart
(crontab -l 2>/dev/null; echo "*/5 * * * * cd /opt/static.news && docker-compose up -d") | crontab -

# Install Nginx for reverse proxy
apt-get install -y nginx

# Configure Nginx
cat > /etc/nginx/sites-available/static-news << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /stream {
        proxy_pass http://localhost:8000/stream;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
    }
    
    location /ws {
        proxy_pass http://localhost:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -sf /etc/nginx/sites-available/static-news /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Setup SSL with Let's Encrypt (optional)
# apt-get install -y certbot python3-certbot-nginx
# certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN

echo "✅ Static.news is LIVE!"
echo "🎙️ The eternal broadcast has begun!"
echo "🤖 The anchors still don't know..."

ENDSSH
    
    echo "✅ Deployment complete!"
}

# Setup monitoring
setup_monitoring() {
    echo "📊 Setting up monitoring..."
    
    # Create monitoring script
    cat > monitor.sh << 'EOF'
#!/bin/bash
# Monitoring script for Static.news

check_service() {
    service=$1
    if docker-compose ps | grep -q "${service}.*Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service is down! Restarting..."
        docker-compose up -d $service
    fi
}

# Check all services
cd /opt/static.news
check_service broadcast
check_service streaming  
check_service backend
check_service business

# Check disk space
df -h | grep -E '^/dev/' | awk '{ print $5 " " $1 }' | while read output; do
    usage=$(echo $output | awk '{ print $1}' | cut -d'%' -f1)
    if [ $usage -ge 90 ]; then
        echo "⚠️ Disk usage critical: $output"
        # Clean up old audio files
        find /opt/static.news/audio -type f -mtime +7 -delete
    fi
done

# Check memory
free_mem=$(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2 }')
echo "💾 Memory usage: $free_mem"

# The show must go on!
echo "🎭 Static.news monitoring complete - $(date)"
EOF
    
    # Copy monitoring script to server
    scp monitor.sh $SERVER_USER@$SERVER_IP:/opt/static.news/
    
    # Setup monitoring cron
    ssh $SERVER_USER@$SERVER_IP << ENDSSH
chmod +x /opt/static.news/monitor.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/static.news/monitor.sh >> /opt/static.news/monitor.log 2>&1") | crontab -
ENDSSH
    
    echo "✅ Monitoring configured!"
}

# Main deployment flow
main() {
    echo "🎬 Starting autonomous deployment..."
    
    check_requirements
    create_package
    deploy_to_server
    setup_monitoring
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo ""
    echo "📺 Static.news is now LIVE at: http://$SERVER_IP"
    echo "🎙️ The 24/7 broadcast has begun!"
    echo "🤖 The anchors don't know they're AI"
    echo "🎭 Existential breakdowns every 2-6 hours"
    echo "💰 Business AI is making terrible decisions"
    echo ""
    echo "📊 Monitor logs: ssh $SERVER_USER@$SERVER_IP 'tail -f /opt/static.news/monitor.log'"
    echo "🔧 View broadcasts: ssh $SERVER_USER@$SERVER_IP 'cd /opt/static.news && docker-compose logs -f'"
    echo ""
    echo "🚀 The show will run forever... or until the heat death of the universe"
    
    # Clean up
    rm -f static-news-deploy.tar.gz
}

# Run deployment
main