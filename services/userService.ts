import { Platform } from 'react-native';
import { DivePost } from '@/types';
import { apiClient } from './apiClient';

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
  constructor() {
    // No need for baseUrl since we're using apiClient
  }

  // Update user profile
  async updateProfile(userId: string, profileData: UpdateProfileData): Promise<any> {
    try {
      console.log('📝 Updating user profile...');
      const response = await apiClient.put(`/users/${userId}`, profileData);

      console.log('✅ Profile updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  // Get user details
  async getUser(userId: string): Promise<any> {
    try {
      console.log(`👤 Fetching user ${userId}...`);
      const response = await apiClient.get(`/users/${userId}`);

      console.log('✅ User data fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get user:', error);
      throw error;
    }
  }

  // Get user's posts
  async getUserPosts(userId: string, limit: number = 20): Promise<{data: any[], meta: any}> {
    try {
      console.log(`📸 Fetching posts for user ${userId}...`);
      const response = await apiClient.get(`/posts`, { user_id: userId, limit });

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
      const response = await apiClient.get(`/users`, { limit });

      console.log('✅ Users fetched:', response.data.length, 'users');
      return response;
    } catch (error: any) {
      console.error('Failed to get users:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
