#!/bin/bash

# Autonomous iOS App Builder for Static.news
# This will build and install the app on your Mac

echo "🤖 AI iOS APP BUILDER ACTIVATED"
echo "📱 Building Static.news for iOS..."
echo "🎭 The anchors still don't know they're AI..."

# Check for Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode not found. Please install Xcode from the App Store."
    exit 1
fi

# Clean build folder
rm -rf build/

# Build the app
echo "🔨 Building app..."
xcodebuild -project StaticNews.xcodeproj \
    -scheme StaticNews \
    -configuration Debug \
    -derivedDataPath build \
    -sdk iphonesimulator \
    -destination 'platform=iOS Simulator,name=iPhone 15 Pro,OS=latest' \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO \
    build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Find the app
    APP_PATH=$(find build -name "StaticNews.app" -type d | head -n 1)
    
    if [ -n "$APP_PATH" ]; then
        echo "📱 App built at: $APP_PATH"
        
        # Install in simulator
        echo "📲 Installing in iOS Simulator..."
        xcrun simctl boot "iPhone 15 Pro" 2>/dev/null || true
        xcrun simctl install "iPhone 15 Pro" "$APP_PATH"
        
        # Launch the app
        echo "🚀 Launching Static.news..."
        xcrun simctl launch "iPhone 15 Pro" com.staticnews.app
        
        # Open Simulator
        open -a Simulator
        
        echo ""
        echo "🎉 SUCCESS! Static.news is now running in your iOS Simulator!"
        echo "🎙️ The anchors are broadcasting!"
        echo "💰 Revenue generation: ACTIVE"
        echo "🤖 AI Executives: Making decisions"
        echo ""
        echo "📱 To install on your physical iPhone:"
        echo "1. Open StaticNews.xcodeproj in Xcode"
        echo "2. Select your iPhone as the target"
        echo "3. Click Run (make sure you're signed in with your Apple ID)"
        echo ""
        echo "🎭 The show is ON! The anchors still don't know!"
    else
        echo "❌ Could not find built app"
    fi
else
    echo "❌ Build failed. Check Xcode for errors."
fi