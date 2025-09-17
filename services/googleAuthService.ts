import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { CURRENT_CONFIG as GOOGLE_CONFIG } from '../config/google-auth';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  photo?: string;
  givenName?: string;
  familyName?: string;
}

class GoogleAuthService {
  private isConfigured = false;

  // Configure Google Sign-In (call this in your app initialization)
  configure() {
    if (this.isConfigured) return;

    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: GOOGLE_CONFIG.webClientId,
        iosClientId: GOOGLE_CONFIG.iosClientId,
        androidClientId: GOOGLE_CONFIG.androidClientId,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
    }

    this.isConfigured = true;
  }

  // Sign in with Google (works on all platforms)
  async signIn(): Promise<GoogleUser> {
    this.configure();

    try {
      if (Platform.OS === 'web') {
        return await this.webSignIn();
      } else {
        return await this.nativeSignIn();
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw new Error('Google Sign-In failed. Please try again.');
    }
  }

  // Web-specific Google Sign-In using implicit flow (no client secret needed)
  private async webSignIn(): Promise<GoogleUser> {
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
      preferLocalhost: true,
    });

    console.log('🔗 Google OAuth Redirect URI:', redirectUri);
    console.log('🔑 Using Client ID:', GOOGLE_CONFIG.webClientId);

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CONFIG.webClientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token, // Use implicit flow
      redirectUri,
      additionalParameters: {},
      prompt: AuthSession.Prompt.SelectAccount,
      // Disable PKCE for implicit flow
      usePKCE: false,
    });

    console.log('🚀 Starting Google OAuth flow...');
    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    console.log('📥 OAuth result:', result.type);

    if (result.type !== 'success') {
      console.error('❌ OAuth failed:', result);
      throw new Error('Google Sign-In was cancelled or failed');
    }

    // With implicit flow, we get the access token directly
    const accessToken = result.params.access_token;
    
    if (!accessToken) {
      throw new Error('No access token received from Google');
    }

    // Get user info from Google using the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const userInfo = await userInfoResponse.json();

    return {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      photo: userInfo.picture,
      givenName: userInfo.given_name,
      familyName: userInfo.family_name,
    };
  }

  // Native (iOS/Android) Google Sign-In
  private async nativeSignIn(): Promise<GoogleUser> {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const user = userInfo.user;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        givenName: user.givenName,
        familyName: user.familyName,
      };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google Sign-In was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google Sign-In is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        throw new Error('Google Sign-In failed');
      }
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await GoogleSignin.signOut();
      }
      // For web, we just clear local session (Google doesn't provide web sign out)
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
      // Don't throw error for sign out - just log it
    }
  }

  // Check if user is currently signed in
  async isSignedIn(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll rely on our app's authentication state
        return false;
      } else {
        return await GoogleSignin.isSignedIn();
      }
    } catch (error) {
      return false;
    }
  }

  // Get current user (if signed in)
  async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll rely on our app's authentication state
        return null;
      } else {
        const userInfo = await GoogleSignin.signInSilently();
        const user = userInfo.user;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          photo: user.photo,
          givenName: user.givenName,
          familyName: user.familyName,
        };
      }
    } catch (error) {
      return null;
    }
  }
}

export const googleAuthService = new GoogleAuthService();
