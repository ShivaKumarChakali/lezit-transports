#!/bin/bash

# Build APK script for Lezit Transports
# This script builds the React app, syncs with Capacitor, and generates an APK

set -e  # Exit on any error

echo "🚀 Building Lezit Transports APK..."

# Set Java environment
export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
export ANDROID_HOME="$HOME/Library/Android/sdk"

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

echo "📦 Building React app..."
npm run build

echo "🔄 Syncing with Capacitor..."
npx cap sync

echo "🔨 Building APK..."
cd android
./gradlew assembleDebug

echo "✅ APK built successfully!"
echo "📱 APK location: $(pwd)/app/build/outputs/apk/debug/app-debug.apk"

# Get APK size
APK_SIZE=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
echo "📊 APK size: $APK_SIZE"

echo ""
echo "🎉 Build complete! You can now install the APK on your Android device."
echo "💡 To install: adb install app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🌐 Backend API: https://lezit-transports-backend.onrender.com"
echo "🔗 Frontend Web: https://lezit-transports-frontend.onrender.com"
