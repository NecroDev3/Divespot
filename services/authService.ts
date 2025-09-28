import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/Api';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { googleSignIn, GoogleUser } from './googleAuthService';

// Simple types for auth
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  location?: string;
  totalDives: number;
  maxDepthAchieved: number;
  totalBottomTime: number;
  certificationLevel: string;
  createdAt: string;
}

export interface SignupData {
  email: string;
  password: string;
  displayName: string;
  location?: string;
  certificationLevel?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Get the appropriate base URL based on platform
const getBaseUrl = (): string => {
  // Use centralized API configuration
  return API_CONFIG.BASE_URL;
};

class AuthService {
  private baseUrl: string;
  
  constructor() {
    // Use port 5001 to avoid conflict with AirTunes on port 5000
    // Platform-specific URL: localhost for web, network IP for mobile
    this.baseUrl = getBaseUrl();
  }

  // Basic HTTP request helper
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('API Request failed:', error);
      throw new Error(error.message || 'Network request failed');
    }
  }

  // Signup - create new user
  async signup(signupData: SignupData): Promise<AuthUser> {
    try {
      // First, check if backend is available
      const backendAvailable = await this.checkHealth();
      
      if (backendAvailable) {
        const requestData = {
          username: signupData.email.split('@')[0], // Use email prefix as username
          email: signupData.email,
          display_name: signupData.displayName,
          location: signupData.location || 'Cape Town, South Africa',
          certification_level: signupData.certificationLevel || 'Open Water',
          password_hash: signupData.password, // Backend should hash this
          email_verified: false,
        };

        const user = await this.makeRequest<AuthUser>('/users', {
          method: 'POST',
          body: JSON.stringify(requestData),
        });

        // Save user to local storage
        await this.saveUser(user);
        
        return user;
      } else {
        // Backend not available - create user locally for demo
        console.log('Backend unavailable, creating user locally for demo');
        return this.createLocalUser(signupData);
      }
    } catch (error: any) {
      console.error('Signup via API failed, falling back to local user:', error);
      // Fallback to creating a local user for demo
      return this.createLocalUser(signupData);
    }
  }

  // Create a local user when backend is not available (for demo purposes)
  private async createLocalUser(signupData: SignupData): Promise<AuthUser> {
    const user: AuthUser = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: signupData.email.split('@')[0],
      email: signupData.email,
      displayName: signupData.displayName,
      location: signupData.location || 'Cape Town, South Africa',
      totalDives: 0,
      maxDepthAchieved: 0,
      totalBottomTime: 0,
      certificationLevel: signupData.certificationLevel || 'Open Water',
      createdAt: new Date().toISOString(),
    };

    await this.saveUser(user);
    return user;
  }

  // Login - authenticate user
  async login(loginData: LoginData): Promise<AuthUser> {
    try {
      // First, check if backend is available
      const backendAvailable = await this.checkHealth();
      
      if (backendAvailable) {
        // Try backend authentication
        const user = await this.makeRequest<AuthUser>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
          }),
        });

        // Save user to local storage
        await this.saveUser(user);
        return user;
      } else {
        // Backend unavailable - check local storage
        const existingUser = await this.getCurrentUser();
        if (existingUser && existingUser.email === loginData.email) {
          console.log('Backend unavailable, using cached user');
          return existingUser;
        } else {
          throw new Error('No cached user found and backend unavailable');
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Fallback: check local storage
      const existingUser = await this.getCurrentUser();
      if (existingUser && existingUser.email === loginData.email) {
        console.log('API login failed, using cached user');
        return existingUser;
      }
      
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  }

  // Real Google authentication
  async googleAuth(): Promise<AuthUser> {
    try {
      console.log('🔐 Starting Google authentication...');
      
      // Use the simplified Google Sign-In function
      const googleUser: GoogleUser = await googleSignIn();
      console.log('✅ Google sign-in successful:', googleUser.email);

      // Try to authenticate with backend first
      try {
        // Check if backend is available
        await this.checkHealth();
        
        // Try to get existing user or create new one via backend
        const backendUser = await this.getOrCreateGoogleUser(googleUser);
        await this.saveUser(backendUser);
        return backendUser;
        
      } catch (backendError) {
        console.warn('Backend unavailable, creating user locally for demo:', backendError);
        
        // Fallback: Create local user from Google data
        const localUser: AuthUser = {
          id: `google-${googleUser.id}`,
          username: googleUser.email.split('@')[0],
          email: googleUser.email,
          displayName: googleUser.name,
          bio: 'Signed in with Google',
          profileImageUrl: googleUser.photo || 'https://via.placeholder.com/150',
          location: 'Cape Town, South Africa',
          totalDives: 0,
          maxDepthAchieved: 0,
          totalBottomTime: 0,
          certificationLevel: 'Open Water',
          createdAt: new Date().toISOString(),
        };

        await this.saveUser(localUser);
        return localUser;
      }
      
    } catch (error) {
      console.error('Google auth error:', error);
      throw new Error(error instanceof Error ? error.message : 'Google authentication failed');
    }
  }

  // Helper method to get or create user via backend
  private async getOrCreateGoogleUser(googleUser: GoogleUser): Promise<AuthUser> {
    try {
      // Try to get existing user by email
      const response = await fetch(`${this.baseUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_id: googleUser.id,
          email: googleUser.email,
          display_name: googleUser.name,
          profile_image_url: googleUser.photo,
          given_name: googleUser.givenName,
          family_name: googleUser.familyName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend auth failed: ${response.status}`);
      }

      const data = await response.json();
      return data.user;
      
    } catch (error) {
      console.error('Backend Google auth failed:', error);
      throw error;
    }
  }

  // Save user to local storage
  private async saveUser(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem('current_user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }

  // Get current user from storage
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Logout - clear user data
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('current_user');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  // Check if backend is available
  async checkHealth(): Promise<boolean> {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.baseUrl.replace('/api', '')}/`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      return response.ok && data.ok === true;
    } catch (error) {
      console.log('Backend health check failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
