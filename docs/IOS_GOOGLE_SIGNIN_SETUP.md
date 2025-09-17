# 🍎 iOS Google Sign-In Setup Guide

## Overview
Setting up Google OAuth for iOS with Expo requires creating an iOS development build and configuring Google Cloud Console. Here's the complete flow for beginners.

## Prerequisites
- ✅ Xcode installed on Mac
- ✅ Apple Developer Account (free or paid)
- ✅ Google Cloud Console project
- ✅ Your existing web Google OAuth working

## Step 1: Get Your iOS Bundle ID

First, we need to find your app's bundle identifier:

### Option A: Check app.json/app.config.js
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourname.divespot"
    }
  }
}
```

### Option B: Use default Expo bundle ID
If not specified, Expo uses: `com.yourname.yourappname`
- Replace `yourname` with your Expo username
- Replace `yourappname` with your app slug

## Step 2: Create iOS OAuth Client in Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. **Click "Create Credentials" → "OAuth 2.0 Client IDs"**
3. **Select "iOS"**
4. **Fill in details**:
   - **Name**: `DiveSpot iOS`
   - **Bundle ID**: Your iOS bundle identifier (from Step 1)
5. **Click "Create"**
6. **Copy the Client ID** (looks like: `123456-abc.apps.googleusercontent.com`)

## Step 3: Update Your App Configuration

### Update config/google-auth.ts
```typescript
export const GOOGLE_OAUTH_CONFIG = {
  webClientId: '147832202304-hedmlr681n9nm5qnsi8dmstqt81j8lv2.apps.googleusercontent.com',
  iosClientId: 'YOUR_NEW_IOS_CLIENT_ID.apps.googleusercontent.com', // 👈 Add this
  androidClientId: '147832202304-hedmlr681n9nm5qnsi8dmstqt81j8lv2.apps.googleusercontent.com',
};
```

### Update app.json (if needed)
```json
{
  "expo": {
    "name": "DiveSpot",
    "slug": "divespot",
    "ios": {
      "bundleIdentifier": "com.yourname.divespot",
      "buildNumber": "1.0.0"
    },
    "plugins": [
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

## Step 4: Create iOS Development Build

### Install EAS CLI (if not already installed)
```bash
npm install -g @expo/eas-cli
```

### Login to Expo
```bash
eas login
```

### Configure EAS Build
```bash
eas build:configure
```

### Create iOS Development Build
```bash
eas build --platform ios --profile development
```

**What this does**:
- Creates a development build of your app
- Includes native Google Sign-In capabilities
- Generates an `.ipa` file you can install on device

## Step 5: Install on iOS Device

### Option A: Physical iPhone/iPad
1. **Download Expo Orbit** from App Store (easiest method)
2. **Open the EAS build link** from terminal output
3. **Install via Expo Orbit**

### Option B: iOS Simulator (Xcode required)
1. **Open Xcode**
2. **Go to Window → Devices and Simulators**
3. **Select a simulator** (iPhone 15, iOS 17+)
4. **Drag the .ipa file** to the simulator
5. **Or use command**: `xcrun simctl install booted path/to/app.ipa`

## Step 6: Test Google Sign-In

1. **Open your app** on iOS device/simulator
2. **Tap "Continue with Google"**
3. **Should open native iOS Google sign-in**
4. **Complete authentication**
5. **Should navigate to dashboard**

## Expected iOS Flow

```
Tap Google Button → Native iOS Google Sign-In → Safari/Chrome → Google Login → 
App Returns → Dashboard
```

## Troubleshooting

### "Google Sign-In SDK not found"
- Make sure you created a **development build** (not Expo Go)
- Expo Go doesn't support native Google Sign-In

### "Invalid bundle ID"
- Check bundle ID matches Google Cloud Console exactly
- Case sensitive: `com.yourname.divespot` ≠ `com.yourname.DiveSpot`

### "URL scheme not registered"
- This is handled automatically by the Google Sign-In plugin
- If issues persist, check app.json configuration

### Build Fails
- Make sure Apple Developer account is set up
- Try: `eas build --platform ios --profile development --clear-cache`

## Development vs Production

### Development Build
- For testing during development
- Includes debugging tools
- Larger file size
- Use: `eas build --platform ios --profile development`

### Production Build (later)
- For App Store submission
- Optimized and minified
- Smaller file size
- Use: `eas build --platform ios --profile production`

## Next Steps After Setup

1. ✅ Test Google Sign-In on iOS
2. ✅ Verify user data flows correctly
3. ✅ Test navigation to dashboard
4. ✅ Check profile image loading
5. ✅ Test on multiple iOS devices/versions

## Cost Considerations

- **Free Apple Developer Account**: Can test on device for 7 days
- **Paid Apple Developer Account ($99/year)**: No time limits, can distribute

Your web Google Sign-In is already working perfectly, so iOS should work seamlessly once the native build is configured!
