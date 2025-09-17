import { authService } from './authService';
import { Platform } from 'react-native';
import { API_CONFIG } from '@/constants/Api';

export interface CreateDivePostData {
  // Required fields
  user_id: string;
  dive_spot_id: string;
  dive_date: string; // YYYY-MM-DD format
  max_depth: number; // meters
  dive_duration: number; // minutes
  visibility_quality: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
  wind_conditions: 'Calm' | 'Light' | 'Moderate' | 'Strong' | 'Very Strong';
  current_conditions: 'None' | 'Light' | 'Moderate' | 'Strong' | 'Very Strong';
  
  // Optional fields
  caption?: string;
  image_urls?: string[];
  water_temp?: number; // celsius
  sea_life?: string[];
  buddy_names?: string[];
  equipment?: string[];
  notes?: string;
  dive_timestamp?: string; // ISO string
}

export interface DivePostResponse {
  id: string;
  user_id: string;
  dive_spot_id: string;
  caption?: string;
  image_urls: string[];
  dive_date: string;
  max_depth: number;
  dive_duration: number;
  visibility_quality: string;
  water_temp?: number;
  wind_conditions: string;
  current_conditions: string;
  sea_life: string[];
  buddy_names: string[];
  equipment: string[];
  notes?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  dive_timestamp: string;
  updated_at?: string;
}

// Get the appropriate base URL based on platform
const getBaseUrl = (): string => {
  // Use centralized API configuration
  return API_CONFIG.BASE_URL;
};

class DivePostsService {
  private baseUrl: string;

  constructor() {
    // Use platform-specific base URL: localhost for web, network IP for mobile
    this.baseUrl = getBaseUrl();
  }

  // Basic HTTP request helper (reused from authService pattern)
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

  // Create a new dive post
  async createDivePost(postData: CreateDivePostData): Promise<DivePostResponse> {
    try {
      // Check if backend is available
      const backendAvailable = await authService.checkHealth();
      
      if (backendAvailable) {
        console.log('Creating dive post via API...');
        const response = await this.makeRequest<DivePostResponse>('/posts', {
          method: 'POST',
          body: JSON.stringify(postData),
        });
        
        console.log('✅ Dive post created successfully:', response.id);
        return response;
      } else {
        // Backend unavailable - for now, just throw error
        // In future, could save locally and sync later
        throw new Error('Backend unavailable - cannot create dive post');
      }
    } catch (error: any) {
      console.error('Failed to create dive post:', error);
      throw new Error(error.message || 'Failed to create dive post');
    }
  }

  // Get user's dive posts
  async getUserPosts(userId: string, limit?: number, offset?: number): Promise<DivePostResponse[]> {
    try {
      const params = new URLSearchParams();
      params.append('user_id', userId);
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const response = await this.makeRequest<{ data: DivePostResponse[] }>(`/posts?${params}`);
      return response.data || [];
    } catch (error: any) {
      console.error('Failed to get user posts:', error);
      return [];
    }
  }

  // Get all posts (feed)
  async getFeedPosts(limit?: number, offset?: number): Promise<DivePostResponse[]> {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const response = await this.makeRequest<{ data: DivePostResponse[] }>(`/feed?${params}`);
      return response.data || [];
    } catch (error: any) {
      console.error('Failed to get feed posts:', error);
      return [];
    }
  }

  // Get feed data (list of posts)
  async getFeed(limit: number = 20): Promise<{data: any[], meta: any}> {
    try {
      console.log('🌊 Fetching feed data...');
      const response = await this.makeRequest<{data: any[], meta: any}>(`/feed?limit=${limit}`, {
        method: 'GET',
      });
      
      console.log('✅ Feed data fetched:', response.data.length, 'posts');
      return response;
    } catch (error: any) {
      console.error('Failed to get feed:', error);
      throw error;
    }
  }

  // Like a post
  async likePost(postId: string, userId: string): Promise<void> {
    try {
      await this.makeRequest(`/posts/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (error: any) {
      console.error('Failed to like post:', error);
      throw error;
    }
  }

  // Unlike a post
  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      await this.makeRequest(`/posts/${postId}/unlike`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (error: any) {
      console.error('Failed to unlike post:', error);
      throw error;
    }
  }

  // Get comments for a post
  async getComments(postId: string, limit: number = 50): Promise<{data: any[], meta: any}> {
    try {
      console.log(`💬 Fetching comments for post ${postId}...`);
      const response = await this.makeRequest<{data: any[], meta: any}>(`/posts/${postId}/comments?limit=${limit}`, {
        method: 'GET',
      });

      console.log('✅ Comments fetched:', response.data.length, 'comments');
      return response;
    } catch (error: any) {
      console.error('Failed to get comments:', error);
      throw error;
    }
  }

  // Create a comment on a post
  async createComment(postId: string, userId: string, content: string): Promise<any> {
    try {
      console.log(`💬 Creating comment on post ${postId}...`);
      const response = await this.makeRequest(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, content: content }),
      });

      console.log('✅ Comment created successfully');
      return response;
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  }

  // Update a comment
  async updateComment(commentId: string, content: string): Promise<any> {
    try {
      console.log(`💬 Updating comment ${commentId}...`);
      const response = await this.makeRequest(`/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: content }),
      });

      console.log('✅ Comment updated successfully');
      return response;
    } catch (error: any) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  }

  // Delete a comment
  async deleteComment(commentId: string): Promise<void> {
    try {
      console.log(`💬 Deleting comment ${commentId}...`);
      await this.makeRequest(`/comments/${commentId}`, {
        method: 'DELETE',
      });

      console.log('✅ Comment deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  }

  // Create or find dive spot by location
  async createDiveSpot(latitude: number, longitude: number, name?: string, address?: string, userId?: string): Promise<string> {
    try {
      // Create a new dive spot
      const spotData = {
        name: name || 'Custom Dive Spot',
        description: `Dive spot at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        latitude: latitude,
        longitude: longitude,
        address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        difficulty: 'Intermediate', // Default difficulty
        water_type: 'Salt', // Default for Cape Town
        avg_visibility: 12, // Default visibility
        avg_temperature: 16, // Default Cape Town water temp
        created_by: userId || 'system', // Use authenticated user or system as fallback
      };

      const response = await this.makeRequest<{id: string}>('/spots', {
        method: 'POST',
        body: JSON.stringify(spotData),
      });

      console.log('✅ Dive spot created:', response.id);
      return response.id;
    } catch (error: any) {
      console.error('Failed to create dive spot:', error);
      throw new Error('Failed to create dive spot: ' + error.message);
    }
  }

  // Format date for API (YYYY-MM-DD)
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Format datetime for API (ISO string)
  formatDateTimeForAPI(date: Date): string {
    return date.toISOString();
  }
}

export const divePostsService = new DivePostsService();
