# Building APK for Lezit Transports

## Prerequisites

### 1. Install Android Studio
- Download and install Android Studio from: https://developer.android.com/studio
- During installation, make sure to install:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (AVD)

### 2. Install Java 17 (Required for Android development)
```bash
# Using Homebrew (recommended)
brew install openjdk@17

# Set JAVA_HOME to use Java 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
```

### 3. Set up Android SDK environment variables
```bash
# Add to ~/.zshrc or ~/.bash_profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Building the APK

### Method 1: Using Android Studio (Recommended)

1. **Open the project in Android Studio:**
   ```bash
   cd /Users/capshiv/Desktop/ChakaliShivaKumar.github.io/lezit-transports/frontend
   npx cap open android
   ```

2. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - The APK will be generated in `android/app/build/outputs/apk/debug/`

### Method 2: Using Command Line

1. **Set Java 17 as default:**
   ```bash
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)
   ```

2. **Build the APK:**
   ```bash
   cd /Users/capshiv/Desktop/ChakaliShivaKumar.github.io/lezit-transports/frontend/android
   ./gradlew assembleDebug
   ```

3. **Find the APK:**
   The APK will be located at:
   `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

## Development Workflow

### For development and testing:
1. **Make changes to your React app**
2. **Build the React app:**
   ```bash
   cd frontend
   npm run build
   ```
3. **Sync with Capacitor:**
   ```bash
   npx cap sync
   ```
4. **Open in Android Studio or build APK:**
   ```bash
   npx cap open android
   # OR
   cd android && ./gradlew assembleDebug
   ```

### For production APK:
1. **Update version in `android/app/build.gradle`**
2. **Generate signed APK in Android Studio:**
   - `Build` → `Generate Signed Bundle / APK`
   - Choose APK
   - Create or use existing keystore
   - Build release APK

## Troubleshooting

### Java Version Issues:
- Make sure you're using Java 17: `java -version`
- Set JAVA_HOME correctly: `echo $JAVA_HOME`

### Android SDK Issues:
- Ensure Android SDK is installed via Android Studio
- Check ANDROID_HOME environment variable

### Gradle Issues:
- Clean and rebuild: `./gradlew clean && ./gradlew assembleDebug`
- Check Gradle wrapper version in `android/gradle/wrapper/gradle-wrapper.properties`

## Current Project Status

✅ Capacitor initialized
✅ Android platform added
✅ React app built and synced
✅ Ready for APK generation

**Next Steps:**
1. Install Android Studio
2. Install Java 17
3. Open project in Android Studio
4. Build APK
