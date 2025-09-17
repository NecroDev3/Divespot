import { Platform } from 'react-native';
import { DivePost } from '@/types';
import { API_CONFIG } from '@/constants/Api';

// Get the appropriate base URL based on platform
const getBaseUrl = (): string => {
  // Use centralized API configuration
  return API_CONFIG.BASE_URL;
};

export interface UpdateProfileData {
  username?: string;
  display_name?: string;
  bio?: string;
  location?: string;
  certification_level?: string;
  profile_image_url?: string;
  total_dives?: number;
  max_depth_achieved?: number;
  total_bottom_time?: number;
}

class UserService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  // Basic HTTP request helper
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return responseData;
    } catch (error: any) {
      console.error('API Request failed:', error);
      throw new Error(error.message || 'Network request failed');
    }
  }

  // Update user profile
  async updateProfile(userId: string, profileData: UpdateProfileData): Promise<any> {
    try {
      console.log('📝 Updating user profile...');
      const response = await this.makeRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      console.log('✅ Profile updated successfully');
      return response;
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  // Get user details
  async getUser(userId: string): Promise<any> {
    try {
      console.log(`👤 Fetching user ${userId}...`);
      const response = await this.makeRequest(`/users/${userId}`, {
        method: 'GET',
      });

      console.log('✅ User data fetched successfully');
      return response;
    } catch (error: any) {
      console.error('Failed to get user:', error);
      throw error;
    }
  }

  // Get user's posts
  async getUserPosts(userId: string, limit: number = 20): Promise<{data: any[], meta: any}> {
    try {
      console.log(`📸 Fetching posts for user ${userId}...`);
      const response = await this.makeRequest<{data: any[], meta: any}>(`/posts?user_id=${userId}&limit=${limit}`, {
        method: 'GET',
      });

      console.log('✅ User posts fetched:', response.data.length, 'posts');
      return response;
    } catch (error: any) {
      console.error('Failed to get user posts:', error);
      throw error;
    }
  }

  // Upload profile image (simplified - in production would handle actual file upload)
  async uploadProfileImage(userId: string, imageUri: string): Promise<string> {
    try {
      console.log('📸 Uploading profile image...');
      
      // For MVP, we'll just use the imageUri directly
      // In production, this would upload to cloud storage and return a URL
      const profileData = {
        profile_image_url: imageUri
      };

      await this.updateProfile(userId, profileData);
      
      console.log('✅ Profile image updated');
      return imageUri;
    } catch (error: any) {
      console.error('Failed to upload profile image:', error);
      throw error;
    }
  }

  // Get all users (for discovery)
  async getAllUsers(limit: number = 50): Promise<{data: any[], meta: any}> {
    try {
      console.log('👥 Fetching all users...');
      const response = await this.makeRequest<{data: any[], meta: any}>(`/users?limit=${limit}`, {
        method: 'GET',
      });

      console.log('✅ Users fetched:', response.data.length, 'users');
      return response;
    } catch (error: any) {
      console.error('Failed to get users:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
