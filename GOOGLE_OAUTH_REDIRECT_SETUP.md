# 🔧 Google OAuth Redirect URI Setup

## The Issue
You're getting a "client_secret is missing" error because the web OAuth flow needs proper redirect URI configuration.

## Quick Fix Steps

### 1. Check Your Redirect URI
When you test Google Sign-In, check the browser console for a log message like:
```
🔗 Google OAuth Redirect URI: https://auth.expo.io/@your-username/your-app-slug
```

### 2. Add This URI to Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Find your Web Client ID**: `147832202304-hedmlr681n9nm5qnsi8dmstqt81j8lv2.apps.googleusercontent.com`
4. **Click Edit** (pencil icon)
5. **Add to "Authorized redirect URIs"**:
   - `https://auth.expo.io/@your-username/your-app-slug` (from console log)
   - `http://localhost:8082` (for local development)
   - `http://localhost:8081` (backup port)
   - `https://localhost:8082` (HTTPS version)

### 3. Common Redirect URIs to Add
```
https://auth.expo.io/@your-username/divespot
http://localhost:8082
http://localhost:8081
https://localhost:8082
https://localhost:8081
```

### 4. Save and Test
1. **Click "Save"** in Google Cloud Console
2. **Wait 5 minutes** for changes to propagate
3. **Try Google Sign-In again**

## What We Fixed
- ✅ Changed from Authorization Code flow to Implicit flow (no client_secret needed)
- ✅ Added proper error handling and debugging
- ✅ Fixed CORS issues with proper redirect URIs

## Expected Flow After Fix
1. Click "Continue with Google"
2. Google OAuth popup opens
3. Sign in with Google account
4. Popup closes automatically
5. Navigate to dashboard

## Still Having Issues?
Check the browser console for the exact redirect URI being used and make sure it's added to your Google Cloud Console credentials.
