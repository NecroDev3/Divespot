// API Configuration Constants
import { Platform } from 'react-native';

// Environment detection
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

// Platform-specific base URLs
const getBaseUrl = () => {
  if (!isDevelopment) return 'https://your-production-api.com';
  
  // For development, use localhost for web and network IP for mobile
  return Platform.OS === 'web' ? 'http://localhost:8000' : 'http://192.168.50.5:8000';
};

const getImageUrl = () => {
  if (!isDevelopment) return 'https://your-production-api.com';
  
  // For development, use localhost for web and network IP for mobile
  return Platform.OS === 'web' ? 'http://localhost:5010' : 'http://192.168.50.5:5010';
};

// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: isDevelopment 
    ? `${getBaseUrl()}/api`
    : 'https://your-production-api.com/api',
    
  IMAGE_URL: getImageUrl(),
    
  HEALTH_ENDPOINT: isDevelopment
    ? `${getBaseUrl()}/`
    : 'https://your-production-api.com/',
    
  // Timeouts (in milliseconds)
  REQUEST_TIMEOUT: 10000,        // 10 seconds for regular requests
  UPLOAD_TIMEOUT: 30000,         // 30 seconds for file uploads
  HEALTH_CHECK_TIMEOUT: 5000,    // 5 seconds for health checks
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,            // 1 second base delay
  
  // Cache settings
  CACHE_DURATION: 1000 * 60 * 5,       // 5 minutes
  HEALTH_CHECK_INTERVAL: 1000 * 60 * 2, // 2 minutes
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// API Endpoints
export const ENDPOINTS = {
  // Health
  HEALTH: '/',
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  
  // Posts
  POSTS: '/posts',
  POST_BY_ID: (id: string) => `/posts/${id}`,
  POST_LIKE: (postId: string) => `/posts/${postId}/like`,
  POST_UNLIKE: (postId: string) => `/posts/${postId}/unlike`,
  POST_LIKES: (postId: string) => `/posts/${postId}/likes`,
  POST_COMMENTS: (postId: string) => `/posts/${postId}/comments`,
  
  // Comments
  COMMENT_BY_ID: (id: string) => `/comments/${id}`,
  
  // Dive Spots
  SPOTS: '/spots',
  SPOT_BY_ID: (id: string) => `/spots/${id}`,
  SPOTS_SEARCH: '/spots/search',
  
  // Feed
  FEED: '/feed',
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Authentication required. Please log in again.',
  FORBIDDEN: 'Permission denied.',
  NOT_FOUND: 'Resource not found.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER: '@divespot_user',
  USER_POSTS: '@divespot_user_posts',
  USER_SETTINGS: '@divespot_user_settings',
  CACHED_SPOTS: '@divespot_cached_spots',
  CACHED_FEED: '@divespot_cached_feed',
  API_HEALTH: '@divespot_api_health',
  AUTH_TOKEN: '@divespot_auth_token', // For future authentication
} as const;

// Feature Flags (for gradual rollout of API features)
export const FEATURE_FLAGS = {
  USE_API_FOR_POSTS: true,
  USE_API_FOR_USERS: true,
  USE_API_FOR_SPOTS: true,
  USE_API_FOR_FEED: true,
  USE_API_FOR_LIKES: true,
  USE_API_FOR_COMMENTS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_BACKGROUND_SYNC: false, // Future feature
} as const;

// Development helpers
export const DEV_CONFIG = {
  LOG_API_REQUESTS: isDevelopment,
  LOG_API_RESPONSES: isDevelopment,
  LOG_CACHE_OPERATIONS: isDevelopment,
  MOCK_API_DELAY: isDevelopment ? 500 : 0, // Simulate network delay in development
} as const;
