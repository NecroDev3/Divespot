import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/Api';

export interface TokenData {
  access_token: string;
  expires_at?: number;
  refresh_token?: string;
}

class TokenService {
  private static instance: TokenService;
  private currentToken: string | null = null;

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Store JWT token securely
   */
  async storeToken(tokenData: TokenData): Promise<void> {
    try {
      this.currentToken = tokenData.access_token;
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(tokenData));
      console.log('✅ JWT token stored successfully');
    } catch (error) {
      console.error('❌ Failed to store JWT token:', error);
      throw new Error('Failed to store authentication token');
    }
  }

  /**
   * Retrieve stored JWT token
   */
  async getToken(): Promise<string | null> {
    try {
      // Return cached token if available
      if (this.currentToken) {
        return this.currentToken;
      }

      // Retrieve from storage
      const tokenDataString = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!tokenDataString) {
        return null;
      }

      const tokenData: TokenData = JSON.parse(tokenDataString);
      
      // Check if token is expired (if expiration info is available)
      if (tokenData.expires_at && Date.now() > tokenData.expires_at) {
        console.log('🔄 JWT token expired, clearing...');
        await this.clearToken();
        return null;
      }

      this.currentToken = tokenData.access_token;
      return this.currentToken;
    } catch (error) {
      console.error('❌ Failed to retrieve JWT token:', error);
      return null;
    }
  }

  /**
   * Get full token data including refresh token
   */
  async getTokenData(): Promise<TokenData | null> {
    try {
      const tokenDataString = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!tokenDataString) {
        return null;
      }

      const tokenData: TokenData = JSON.parse(tokenDataString);
      
      // Check if token is expired
      if (tokenData.expires_at && Date.now() > tokenData.expires_at) {
        await this.clearToken();
        return null;
      }

      return tokenData;
    } catch (error) {
      console.error('❌ Failed to retrieve token data:', error);
      return null;
    }
  }

  /**
   * Clear stored JWT token
   */
  async clearToken(): Promise<void> {
    try {
      this.currentToken = null;
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('✅ JWT token cleared');
    } catch (error) {
      console.error('❌ Failed to clear JWT token:', error);
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * Get authorization header value
   */
  async getAuthHeader(): Promise<string | null> {
    const token = await this.getToken();
    return token ? `Bearer ${token}` : null;
  }

  /**
   * Decode JWT payload (without verification - for client-side info only)
   */
  decodeTokenPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT payload:', error);
      return null;
    }
  }

  /**
   * Get user ID from token
   */
  async getUserIdFromToken(): Promise<string | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const payload = this.decodeTokenPayload(token);
      return payload?.sub || payload?.user_id || payload?.identity || null;
    } catch (error) {
      console.error('Failed to get user ID from token:', error);
      return null;
    }
  }
}

export const tokenService = TokenService.getInstance();
