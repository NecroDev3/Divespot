# Google Sign-In Setup Guide

## Overview
This guide will help you set up Google Sign-In for your DiveSpot app. The implementation supports web, iOS, and Android platforms.

## Prerequisites
- Google Cloud Console account
- Your app's bundle ID/package name

## Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Enable the following APIs:
     - Google+ API
     - Google Sign-In API (if available)

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"

## Step 2: Create Client IDs

### Web Application
1. Select "Web application"
2. Add authorized origins:
   - `http://localhost:8081` (for Expo dev server)
   - Your production domain
3. Add authorized redirect URIs:
   - `http://localhost:8081`
   - Your production redirect URI
4. Save and copy the **Client ID**

### iOS Application
1. Create another OAuth client ID
2. Select "iOS"
3. Enter your iOS bundle ID (from `app.json`)
4. Save and copy the **Client ID**

### Android Application
1. Create another OAuth client ID
2. Select "Android"
3. Enter your Android package name
4. Add your SHA-1 certificate fingerprint
5. Save and copy the **Client ID**

## Step 3: Update Configuration

1. **Open the config file**: `/config/google-auth.ts`

2. **Replace the placeholder values**:
   ```typescript
   export const GOOGLE_OAUTH_CONFIG = {
     webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
     iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', 
     androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
   };
   ```

3. **Update the current config**:
   ```typescript
   // Change this line to use your real credentials
   export const CURRENT_CONFIG = GOOGLE_OAUTH_CONFIG; // instead of DEMO_CONFIG
   ```

## Step 4: Test the Integration

1. **Build and run your app**
   ```bash
   npx expo start
   ```

2. **Test on different platforms**:
   - Web: Open in browser and test
   - Mobile: Use Expo Go or build standalone app

## Step 5: Production Considerations

### For Production Builds
- Make sure to use production OAuth credentials
- Update redirect URIs to match your production domains
- Test on actual devices, not just simulators

### Security Notes
- Keep your client secrets secure
- Use different credentials for development and production
- Regularly rotate credentials if compromised

## Troubleshooting

### Common Issues

1. **"OAuth client not found"**
   - Check that client IDs are correct
   - Ensure APIs are enabled

2. **"Redirect URI mismatch"**
   - Verify redirect URIs in Google Console
   - Check that development server URL matches

3. **"Sign-in cancelled"**
   - Normal behavior when user cancels
   - Handle gracefully in your app

4. **"Play Services not available" (Android)**
   - Ensure Google Play Services is installed
   - Test on real device, not emulator

### Development Tips
- Use demo/mock mode during development
- Test with multiple Google accounts
- Check console logs for detailed error messages

## Current Status
✅ Google Sign-In service implemented
✅ AuthService integration complete  
✅ UI components updated
⏳ Waiting for real OAuth credentials

Once you add your real Google OAuth credentials, the Google Sign-In will work with actual Google accounts!
