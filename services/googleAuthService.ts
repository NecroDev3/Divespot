import React from 'react';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  statusCodes,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { CURRENT_CONFIG as GOOGLE_CONFIG } from '../config/google-auth';

// Configure Google Sign-In - following the tutorial approach
GoogleSignin.configure({
  webClientId: GOOGLE_CONFIG.webClientId,
  scopes: ['profile', 'email'], // what API you want to access on behalf of the user, default is email and profile
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  forceCodeForRefreshToken: false,
  iosClientId: GOOGLE_CONFIG.iosClientId,
});

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  photo?: string;
  givenName?: string;
  familyName?: string;
}

const GoogleLogin = async () => {
  try {
    // check if users' device has google play services
    await GoogleSignin.hasPlayServices();
    
    // initiates signIn process
    const userInfo = await GoogleSignin.signIn();
    return userInfo;
  } catch (error) {
    console.error('GoogleLogin error:', error);
    throw error;
  }
};

export const googleSignIn = async (): Promise<GoogleUser> => {
  try {
    console.log('🔐 Starting Google authentication...');
    const response = await GoogleLogin();
    
    console.log('📥 Google sign-in response received');
    
    // Check if sign-in was successful using the proper helper functions
    if (isSuccessResponse(response)) {
      console.log('✅ Google Sign-In successful!');
      const user = response.data.user;
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        givenName: user.givenName,
        familyName: user.familyName,
      };
    } else if (isErrorResponse(response)) {
      console.log('❌ Sign-in failed with error response:', response.error);
      throw new Error(`Google Sign-In failed: ${response.error?.message || 'Unknown error'}`);
    } else {
      console.log('❌ Sign-in was cancelled by user');
      throw new Error('Google Sign-In was cancelled');
    }
  } catch (error: any) {
    console.error('❌ Google Sign-In error:', error);
    
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          throw new Error('Google Sign-In was cancelled');
        case statusCodes.IN_PROGRESS:
          throw new Error('Google Sign-In is already in progress');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error('Google Play Services not available');
        default:
          throw new Error(`Google Sign-In failed: ${error.message || 'Unknown error'}`);
      }
    } else {
      throw new Error(`Google Sign-In failed: ${error.message || 'Unknown error'}`);
    }
  }
};

// use this for signing out the user
export const googleSignOut = async (): Promise<void> => {
  try {
    // initiates sign out process
    await GoogleSignin.signOut();
    console.log('✅ Google Sign-Out successful');
  } catch (error) {
    console.error('❌ Google Sign-Out error:', error);
  }
};

// Check if user is currently signed in
export const isSignedIn = async (): Promise<boolean> => {
  try {
    return await GoogleSignin.hasPreviousSignIn();
  } catch (error) {
    console.error('Error checking sign-in status:', error);
    return false;
  }
};

// Get current user (if signed in)
export const getCurrentUser = async (): Promise<GoogleUser | null> => {
  try {
    const response = await GoogleSignin.signInSilently();
    
    if (isSuccessResponse(response)) {
      const user = response.data.user;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        givenName: user.givenName,
        familyName: user.familyName,
      };
    } else if (error.code === statusCodes.NO_SAVED_CREDENTIALS_FOUND) {
      console.log('Error getting current user:', response.error);
      return null;
    } else {
      console.log('No saved credentials found');
      return null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Export the GoogleSigninButton for easy use
export { GoogleSigninButton };