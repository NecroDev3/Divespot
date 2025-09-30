// Google OAuth Configuration
// 
// IMPORTANT: Replace these placeholder values with your actual Google OAuth credentials
// Get these from Google Cloud Console: https://console.cloud.google.com/
// 
// Steps to get Google OAuth credentials:
// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Create a new project or select existing project
// 3. Enable Google+ API and Google Sign-In API
// 4. Go to "Credentials" section
// 5. Create OAuth 2.0 Client IDs for:
//    - Web application (for web/development)
//    - iOS application (for iOS)
//    - Android application (for Android)
// 6. Replace the placeholder values below with your actual client IDs

export const GOOGLE_OAUTH_CONFIG = {
  // Web Client ID (used for web and as webClientId for mobile)
  webClientId: '147832202304-hedmlr681n9nm5qnsi8dmstqt81j8lv2.apps.googleusercontent.com',
  
  // iOS Client ID (you need to create this in Google Cloud Console for iOS)
  // For now using web client ID - you'll need to create a proper iOS client ID
  iosClientId: '147832202304-41re98jvn5ltb30uhh1hvj5upu11180n.apps.googleusercontent.com', // TODO: Replace with iOS-specific client ID
  
  // Android Client ID (get this from Google Cloud Console - you'll need to create this)
  androidClientId: '147832202304-hedmlr681n9nm5qnsi8dmstqt81j8lv2.apps.googleusercontent.com', // Using web client ID for now
};

// Development/Demo configuration (remove this in production)
export const DEMO_CONFIG = {
  // For development, you can use these demo values
  // These won't work for actual Google Sign-In, but allow the app to run
  webClientId: '1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
  iosClientId: '1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
  androidClientId: '1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
};

// Using your real Google OAuth credentials!
export const CURRENT_CONFIG = GOOGLE_OAUTH_CONFIG;
