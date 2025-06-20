#!/bin/bash

# GitHub Pages Deployment Script for Static.news
# Deploys the web interface to GitHub Pages for free hosting

echo "🚀 Deploying Static.news to GitHub Pages..."

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Static.news - Where Truth Goes to Die"
fi

# Create gh-pages branch
echo "🌿 Creating gh-pages branch..."
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Copy only web files
echo "📋 Preparing web files..."
mkdir -p docs
cp -r web/* docs/
cp nginx.conf docs/

# Create GitHub Pages config
cat > docs/_config.yml << EOF
title: Static.news
description: 24/7 AI News - The Anchors Don't Know They're AI
theme: none
EOF

# Create CNAME file for custom domain (optional)
# echo "static.news" > docs/CNAME

# Update index.html to use backend API
sed -i '' 's|localhost:8000|api.static.news|g' docs/index.html
sed -i '' 's|ws://localhost:8000|wss://api.static.news|g' docs/index.html

# Commit and push
echo "💾 Committing web files..."
git add docs/
git commit -m "Deploy Static.news web interface"

echo "📤 Ready to push to GitHub!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/static-news.git"
echo "3. Push: git push -u origin gh-pages"
echo "4. Enable GitHub Pages in repository settings (use /docs folder)"
echo "5. Your site will be live at: https://YOUR_USERNAME.github.io/static-news"
echo ""
echo "🎭 The show must go on!"