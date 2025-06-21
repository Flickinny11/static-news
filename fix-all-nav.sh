#!/bin/bash

# Fix navigation links for GitHub Pages deployment
# Convert absolute paths to relative paths

echo "Fixing navigation links in all HTML files..."

# List of files to fix
files=(
    "index.html"
    "about.html"
    "shows.html"
    "incidents.html"
    "live.html"
    "anchors.html"
    "highlights.html"
    "sponsors.html"
    "news.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Fix navigation links - convert /page.html to page.html
        sed -i '' 's|href="/live.html"|href="live.html"|g' "$file"
        sed -i '' 's|href="/anchors.html"|href="anchors.html"|g' "$file"
        sed -i '' 's|href="/shows.html"|href="shows.html"|g' "$file"
        sed -i '' 's|href="/incidents.html"|href="incidents.html"|g' "$file"
        sed -i '' 's|href="/sponsors.html"|href="sponsors.html"|g' "$file"
        sed -i '' 's|href="/highlights.html"|href="highlights.html"|g' "$file"
        sed -i '' 's|href="/news.html"|href="news.html"|g' "$file"
        sed -i '' 's|href="/about.html"|href="about.html"|g' "$file"
        
        # Fix logo link - convert href="/" to href="index.html"
        sed -i '' 's|href="/"|href="index.html"|g' "$file"
        
        echo "✓ Fixed $file"
    fi
done

echo "All navigation links have been fixed!"