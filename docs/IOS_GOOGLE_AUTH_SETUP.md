# iOS Google Authentication Setup Guide

## 📱 Complete iOS Google Auth Configuration

### 🔧 **Current Status:**
- ✅ Google Sign-In plugin configured in `app.json`
- ✅ iOS bundle identifier: `app.divespot.mobile`
- ✅ URL schemes configured for OAuth redirects
- ✅ Google Auth service implemented and uncommented
- ⚠️ **Need to create iOS-specific Client ID in Google Cloud Console**

---

## 🚀 **Step-by-Step Setup:**

### **Step 1: Google Cloud Console - Create iOS Client ID**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create one)

2. **Enable Required APIs:**
   - Go to "APIs & Services" > "Library"
   - Enable "Google Sign-In API"
   - Enable "Google+ API" (if available)

3. **Create iOS OAuth Client ID:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "iOS" as application type
   - **Bundle ID:** `app.divespot.mobile`
   - **App Store ID:** (leave empty for development)
   - Click "Create"

4. **Copy the iOS Client ID:**
   - You'll get a client ID like: `123456789-abcdefghijk.apps.googleusercontent.com`
   - **Important:** This will be different from your web client ID!

### **Step 2: Update Configuration**

1. **Update `config/google-auth.ts`:**
   ```typescript
   export const GOOGLE_OAUTH_CONFIG = {
     webClientId: '147832202304-hedmlr681n9nm5qnsi8dmstqt81j8lv2.apps.googleusercontent.com',
     
     // Replace this with your actual iOS Client ID from Step 1
     iosClientId: 'YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com',
     
     androidClientId: '147832202304-hedmlr681n9nm5qnsi8dmstqt81j8lv2.apps.googleusercontent.com',
   };
   ```

### **Step 3: Build and Test**

1. **Build iOS App:**
   ```bash
   npx expo run:ios
   ```

2. **Test Google Sign-In:**
   - Tap "Sign in with Google" button
   - Should open Google OAuth flow
   - Complete authentication
   - Should return to app with user data

---

## 🔍 **Current Configuration:**

### **App Configuration (`app.json`):**
```json
{
  "ios": {
    "bundleIdentifier": "app.divespot.mobile",
    "infoPlist": {
      "CFBundleURLTypes": [
        {
          "CFBundleURLName": "google-oauth",
          "CFBundleURLSchemes": ["app.divespot.mobile"]
        }
      ]
    }
  }
}
```

### **Google Auth Service:**
- ✅ Service is active and configured
- ✅ Handles both web and native authentication
- ✅ Proper error handling and user data extraction
- ✅ Fallback to local authentication if backend unavailable

---

## 🐛 **Troubleshooting:**

### **Common Issues:**

1. **"Google Sign-In failed" Error:**
   - ✅ Check iOS Client ID is correct
   - ✅ Verify bundle identifier matches Google Cloud Console (`app.divespot.mobile`)
   - ✅ Ensure URL schemes are configured

2. **"Invalid client ID" Error:**
   - ❌ Using web client ID instead of iOS client ID
   - ✅ Create separate iOS client ID in Google Cloud Console

3. **OAuth Redirect Issues:**
   - ✅ URL schemes already configured: `app.divespot.mobile`
   - ✅ Bundle identifier matches: `app.divespot.mobile`

4. **App Not Opening After OAuth:**
   - ✅ Check `CFBundleURLSchemes` in app.json
   - ✅ Verify scheme matches bundle identifier (`app.divespot.mobile`)

### **Debug Steps:**

1. **Check Configuration:**
   ```typescript
   // In your app, you can log the config:
   console.log('Google Config:', GOOGLE_CONFIG);
   ```

2. **Test Authentication Flow:**
   ```typescript
   // The auth service will log detailed steps:
   // 🔐 Starting Google authentication...
   // ✅ Google sign-in successful: user@example.com
   ```

3. **Verify Client IDs:**
   - Web Client ID: `147832202304-hedmlr681n9nm5qnsi8dmstqt81j8lv2.apps.googleusercontent.com`
   - iOS Client ID: **[NEEDS TO BE CREATED]**

---

## 📋 **Next Steps:**

### **Immediate Actions Needed:**

1. **🔴 CRITICAL:** Create iOS Client ID in Google Cloud Console
2. **🔴 CRITICAL:** Update `iosClientId` in `config/google-auth.ts`
3. **🟡 RECOMMENDED:** Test on iOS device/simulator
4. **🟡 RECOMMENDED:** Test authentication flow end-to-end

### **Optional Improvements:**

1. **Add App Store ID** (when publishing to App Store)
2. **Configure Android Client ID** (for Android support)
3. **Add custom OAuth scopes** (if needed)
4. **Implement sign-out flow** (already implemented)

---

## 🎯 **Expected Behavior:**

### **On iOS:**
1. User taps "Sign in with Google"
2. Native Google Sign-In sheet appears
3. User selects Google account
4. App receives user data
5. User is authenticated and logged in

### **Fallback Behavior:**
- If Google Auth fails, user can still use email/password
- If backend unavailable, creates local user session
- Graceful error handling with user-friendly messages

---

**🚀 Ready to test! Just need to create the iOS Client ID in Google Cloud Console and update the configuration.**
