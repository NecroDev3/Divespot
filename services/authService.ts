import AsyncStorage from '@react-native-async-storage/async-storage';
import { googleSignIn, GoogleUser } from './googleAuthService';
import { apiClient } from './apiClient';
import { tokenService } from './tokenService';

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

class AuthService {
  constructor() {
    // Note: Unauthorized callback is set up in UserContext to access React state
  }


  // Signup - create new user
  async signup(signupData: SignupData): Promise<AuthUser> {
    try {
      // First, check if backend is available
      const backendAvailable = await apiClient.healthCheck();
      
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

        const response = await apiClient.post('/users', requestData);
        const user = response.data as AuthUser;

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
      const backendAvailable = await apiClient.healthCheck();
      
      if (backendAvailable) {
        console.log('🔐 Attempting login with backend...');
        
        // Try backend authentication - this should return JWT token
        const response = await apiClient.post('/auth/login', {
          email: loginData.email,
          password: loginData.password,
        });

        // Check if response contains JWT token
        if (response.data.access_token) {
          console.log('✅ Login successful - JWT token received');
          
          // Store JWT token
          await tokenService.storeToken({
            access_token: response.data.access_token,
            expires_at: response.data.expires_at,
            refresh_token: response.data.refresh_token,
          });

          // Get user data (response might include user data or we need to fetch it)
          let user: AuthUser;
          if (response.data.user) {
            user = response.data.user;
          } else {
            // If user data not included, we need to fetch it using the token
            // For now, extract user ID from token and fetch user data
            const userId = await tokenService.getUserIdFromToken();
            if (userId) {
              const userResponse = await apiClient.get(`/users/${userId}`);
              user = userResponse.data;
            } else {
              throw new Error('Unable to get user information from token');
            }
          }

          // Save user to local storage
          await this.saveUser(user);
          return user;
        } else {
          // Legacy response format without JWT (fallback)
          console.log('⚠️ Login response without JWT token - using legacy format');
          const user = response.data as AuthUser;
          await this.saveUser(user);
          return user;
        }
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
        await apiClient.healthCheck();
        
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
      // Try to get existing user by email or create new one
      const response = await apiClient.post('/auth/google', {
        google_id: googleUser.id,
        email: googleUser.email,
        display_name: googleUser.name,
        profile_image_url: googleUser.photo,
        given_name: googleUser.givenName,
        family_name: googleUser.familyName,
      });

      // Handle JWT token if present
      if (response.data.access_token) {
        console.log('✅ Google auth successful - JWT token received');
        
        // Store JWT token
        await tokenService.storeToken({
          access_token: response.data.access_token,
          expires_at: response.data.expires_at,
          refresh_token: response.data.refresh_token,
        });
      }

      return response.data.user || response.data;
      
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

  // Logout - clear user data and JWT tokens
  async logout(): Promise<void> {
    try {
      console.log('🔐 Logging out - clearing tokens and user data');
      await tokenService.clearToken();
      await AsyncStorage.removeItem('current_user');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }
}

export const authService = new AuthService();
