import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '@/constants/Api';
import { tokenService } from './tokenService';

export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiClient {
  private baseUrl: string;
  private onUnauthorized?: () => void;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set callback for when user becomes unauthorized (401 errors)
   */
  setUnauthorizedCallback(callback: () => void) {
    this.onUnauthorized = callback;
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      console.log('🔄 Token refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        console.log('🔄 Attempting to refresh access token...');
        const tokenData = await tokenService.getTokenData();
        
        if (!tokenData?.refresh_token) {
          console.log('❌ No refresh token available');
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint with refresh token
        const response = await fetch(`${this.baseUrl}/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.refresh_token}`,
          },
        });

        if (!response.ok) {
          console.log('❌ Token refresh failed with status:', response.status);
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        
        // Store the new access token (keep the same refresh token)
        await tokenService.storeToken({
          access_token: data.access_token,
          expires_at: data.expires_at,
          refresh_token: tokenData.refresh_token, // Keep existing refresh token
        });

        console.log('✅ Access token refreshed successfully');
        return data.access_token;
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        // Clear tokens and trigger logout
        await tokenService.clearToken();
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Make HTTP request with automatic JWT token injection
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      // Get JWT token and add to headers
      const authHeader = await tokenService.getAuthHeader();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add Authorization header if token exists
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      const requestOptions: RequestInit = {
        ...options,
        headers,
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      };

      console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
      if (authHeader) {
        console.log('🔐 Request includes JWT token');
      }

      const response = await fetch(url, requestOptions);
      
      // Handle different response types
      if (response.status === HTTP_STATUS.NO_CONTENT) {
        return { data: null as T };
      }

      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Handle successful responses
      if (response.ok) {
        console.log(`✅ API Success: ${response.status} ${endpoint}`);
        
        // Handle different response formats
        if (responseData && typeof responseData === 'object' && 'data' in responseData) {
          return responseData as ApiResponse<T>;
        } else {
          return { data: responseData as T };
        }
      }

      // Handle error responses
      await this.handleErrorResponse(response, responseData, endpoint, options, isRetry);
      
    } catch (error: any) {
      console.error(`❌ API Error: ${endpoint}`, error);
      
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      
      if (error.message?.includes('Network request failed') || !navigator.onLine) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      throw new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }

    // This should never be reached, but TypeScript requires it
    throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
  }

  /**
   * Handle error responses with proper error mapping
   */
  private async handleErrorResponse(
    response: Response, 
    responseData: any, 
    endpoint: string, 
    options: RequestInit, 
    isRetry: boolean
  ): Promise<never> {
    const status = response.status;
    let errorMessage = ERROR_MESSAGES.UNKNOWN_ERROR;

    // Extract error message from response
    if (responseData) {
      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (responseData.error) {
        errorMessage = responseData.error;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.msg) {
        errorMessage = responseData.msg;
      }
    }

    // Handle specific status codes
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        // Try to refresh token if this is not already a retry and not the refresh endpoint
        if (!isRetry && !endpoint.includes('/refresh')) {
          console.log('🔄 Access token expired, attempting to refresh...');
          const newToken = await this.refreshToken();
          
          if (newToken) {
            // Token refresh successful, retry the original request
            console.log('✅ Token refreshed, retrying original request...');
            return this.request(endpoint, options, true) as never;
          }
        }
        
        // If refresh failed or this is already a retry, trigger logout
        console.log('🔒 Unauthorized - clearing token and triggering logout');
        await tokenService.clearToken();
        if (this.onUnauthorized) {
          this.onUnauthorized();
        }
        throw new Error(errorMessage || ERROR_MESSAGES.UNAUTHORIZED);
        
      case HTTP_STATUS.FORBIDDEN:
        throw new Error(errorMessage || ERROR_MESSAGES.FORBIDDEN);
        
      case HTTP_STATUS.NOT_FOUND:
        throw new Error(errorMessage || ERROR_MESSAGES.NOT_FOUND);
        
      case HTTP_STATUS.BAD_REQUEST:
        throw new Error(errorMessage || ERROR_MESSAGES.BAD_REQUEST);
        
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
      case HTTP_STATUS.GATEWAY_TIMEOUT:
        throw new Error(errorMessage || ERROR_MESSAGES.SERVER_ERROR);
        
      default:
        throw new Error(errorMessage || `HTTP ${status}: ${response.statusText}`);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file with multipart/form-data
   */
  async upload<T = any>(
    endpoint: string, 
    formData: FormData,
    onProgress?: (progress: number) => void,
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      // Get JWT token for upload
      const authHeader = await tokenService.getAuthHeader();
      const headers: HeadersInit = {};

      // Add Authorization header if token exists
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      // Note: Don't set Content-Type for FormData, let browser set it with boundary

      const requestOptions: RequestInit = {
        method: 'POST',
        headers,
        body: formData,
      };

      console.log(`📤 Upload Request: POST ${endpoint}`);
      if (authHeader) {
        console.log('🔐 Upload includes JWT token');
      }

      const response = await fetch(url, requestOptions);
      const responseData = await response.json();

      if (response.ok) {
        console.log(`✅ Upload Success: ${response.status} ${endpoint}`);
        return { data: responseData as T };
      }

      await this.handleErrorResponse(response, responseData, endpoint, requestOptions, isRetry);
      
    } catch (error: any) {
      console.error(`❌ Upload Error: ${endpoint}`, error);
      throw new Error(error.message || 'Upload failed');
    }

    throw new Error('Upload failed');
  }

  /**
   * Health check without authentication
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/`, {
        method: 'GET',
        timeout: API_CONFIG.HEALTH_CHECK_TIMEOUT,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.ok === true;
      }
      
      return false;
    } catch (error) {
      console.log('Health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
