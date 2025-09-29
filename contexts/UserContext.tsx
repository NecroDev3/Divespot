import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, DivePost } from '@/types';
import { authService, AuthUser } from '@/services/authService';
import { userService, UpdateProfileData } from '@/services/userService';
import { divePostsService } from '@/services/divePostsService';
import { imageService } from '@/services/imageService';
import { Alert } from 'react-native';

// Helper function to transform AuthUser to User
const transformAuthUser = (authUser: AuthUser): User => {
  return {
    id: authUser.id,
    username: authUser.username,
    email: authUser.email,
    displayName: authUser.displayName,
    bio: authUser.bio,
    profileImageUri: authUser.profileImageUrl,
    location: authUser.location,
    stats: {
      totalDives: authUser.totalDives || 0,
      maxDepth: authUser.maxDepthAchieved || 0,
      totalBottomTime: authUser.totalBottomTime || 0,
      certificationLevel: authUser.certificationLevel || 'Open Water',
      favoriteSpot: undefined, // Will be calculated from posts
    },
    createdAt: new Date(authUser.createdAt),
  };
};

interface UserContextType {
  user: User | null;
  userPosts: DivePost[];
  isLoading: boolean;
  isInitialized: boolean;
  
  // Authentication
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  googleAuth: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Profile management
  setUser: (user: User | null) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateProfileImage: (imageUri: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  
  // User posts
  fetchUserPosts: () => Promise<void>;
  addUserPost: (post: DivePost) => void;
  clearUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUserState] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<DivePost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load user data from storage if available
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        const authUser = await authService.getCurrentUser();
        if (authUser) {
          console.log('Found existing user:', authUser.email);
          const user = transformAuthUser(authUser);
          setUserState(user);
        } else {
          console.log('No existing user found - showing auth screen');
        }
      } catch (error) {
        console.error('Failed to load stored user:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Authentication functions
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const authUser = await authService.login({ email, password });
      const user = transformAuthUser(authUser);
      
      // Set user state to trigger navigation to dashboard
      setUserState(user);
      console.log('✅ Login successful, navigating to dashboard...');
      
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      setIsLoading(true);
      
      const authUser = await authService.signup({ 
        email, 
        password, 
        displayName,
        location: 'Cape Town, South Africa',
        certificationLevel: 'Open Water'
      });
      const user = transformAuthUser(authUser);
      
      // Set user state to trigger navigation to dashboard
      setUserState(user);
      console.log('✅ Signup successful, navigating to dashboard...');
      
    } catch (error) {
      console.error('Signup failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Account creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleAuth = async () => {
    try {
      console.log('🔄 UserContext: Starting Google authentication...');
      setIsLoading(true);
      
      console.log('🔄 UserContext: Calling authService.googleAuth()...');
      const authUser = await authService.googleAuth();
      console.log('✅ UserContext: Auth service returned user:', authUser.email);
      
      console.log('🔄 UserContext: Transforming auth user...');
      const user = transformAuthUser(authUser);
      console.log('✅ UserContext: User transformed successfully');
      
      // Set user state first to trigger navigation
      console.log('🔄 UserContext: Setting user state...');
      setUserState(user);
      console.log('✅ UserContext: User state set, navigation should trigger');
      
      // Brief success message, then let navigation happen
      console.log('✅ Google sign-in successful, navigating to dashboard...');
      
      // Optional: Show a brief toast instead of blocking alert
      setTimeout(() => {
        console.log(`Welcome ${user.displayName}! Signed in with Google.`);
      }, 100);
      
    } catch (error) {
      console.error('❌ UserContext: Google auth failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
    } finally {
      console.log('🔄 UserContext: Setting loading to false');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUserState(null);
      setUserPosts([]);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = (userData: User | null) => {
    setUserState(userData);
    // Note: For now, just update state. Later can add saving to storage if needed
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Convert User updates to backend format
      const profileData: UpdateProfileData = {
        username: updates.username,
        display_name: updates.displayName,
        bio: updates.bio,
        location: updates.location,
        certification_level: updates.stats?.certificationLevel,
        total_dives: updates.stats?.totalDives,
        max_depth_achieved: updates.stats?.maxDepth,
        total_bottom_time: updates.stats?.totalBottomTime,
      };

      // Update backend
      const updatedBackendUser = await userService.updateProfile(user.id, profileData);
      
      // Update local state with backend response
      const updatedUser: User = {
        ...user,
        username: updatedBackendUser.username,
        displayName: updatedBackendUser.display_name,
        bio: updatedBackendUser.bio,
        location: updatedBackendUser.location,
        stats: {
          ...user.stats,
          certificationLevel: updatedBackendUser.certification_level,
          totalDives: updatedBackendUser.total_dives,
          maxDepth: updatedBackendUser.max_depth_achieved,
          totalBottomTime: updatedBackendUser.total_bottom_time,
        },
      };

      setUserState(updatedUser);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileImage = async (imageUri: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Upload image to backend
      const updatedImageUri = await userService.uploadProfileImage(user.id, imageUri);
      
      // Update local state
      const updatedUser = {
        ...user,
        profileImageUri: updatedImageUri,
      };

      setUserState(updatedUser);
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Failed to update profile image:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const authUser = await authService.getCurrentUser();
      if (authUser) {
        const userData = transformAuthUser(authUser);
        setUserState(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      console.log(`🔄 Fetching posts for user ${user.id}...`);
      
      // Get user's posts from backend
      const response = await userService.getUserPosts(user.id);
      
      // Transform API data to frontend format (similar to feed transformation)
      const transformedPosts = response.data.map((apiPost: any) => ({
        id: apiPost.id,
        userId: apiPost.user_id,
        user: user, // Use current user data
        diveSpotId: apiPost.dive_spot_id,
        diveSpot: {
          id: apiPost.dive_spot_id,
          name: apiPost.dive_spot?.name || 'Unknown Spot',
          description: apiPost.dive_spot?.description || '',
          coordinates: {
            latitude: apiPost.dive_spot?.latitude || 0,
            longitude: apiPost.dive_spot?.longitude || 0,
          },
          address: apiPost.dive_spot?.address || '',
          difficulty: (apiPost.dive_spot?.difficulty || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
          waterType: (apiPost.dive_spot?.water_type || 'Salt') as 'Salt' | 'Fresh' | 'Brackish',
          visibility: apiPost.dive_spot?.avg_visibility || 0,
          temperature: apiPost.dive_spot?.avg_temperature || 0,
          createdBy: apiPost.dive_spot?.created_by || 'system',
          createdAt: new Date(apiPost.dive_spot?.created_at || new Date()),
        },
        imageUris: (apiPost.image_urls || []).map((url: string) => imageService.getImageUrl(url)),
        caption: apiPost.caption,
        diveDetails: {
          date: new Date(apiPost.dive_date),
          depth: apiPost.max_depth,
          diveDuration: apiPost.dive_duration,
          visibilityQuality: apiPost.visibility_quality as 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor',
          waterTemp: apiPost.water_temp,
          windConditions: apiPost.wind_conditions as 'Calm' | 'Light' | 'Moderate' | 'Strong' | 'Very Strong',
          currentConditions: apiPost.current_conditions as 'None' | 'Light' | 'Moderate' | 'Strong' | 'Very Strong',
          seaLife: apiPost.sea_life || [],
          buddyNames: apiPost.buddy_names || [],
          equipment: apiPost.equipment || [],
          notes: apiPost.notes,
          diveTimestamp: new Date(apiPost.created_at),
        },
        likes: Array.from({ length: apiPost.likes_count || 0 }, (_, i) => ({
          userId: `user-${i}`,
          createdAt: new Date(),
        })),
        comments: Array.from({ length: apiPost.comments_count || 0 }, (_, i) => ({
          id: `comment-${i}`,
          userId: `user-${i}`,
          content: `Comment ${i}`,
          createdAt: new Date(),
        })),
        createdAt: new Date(apiPost.created_at),
      }));
      
      setUserPosts(transformedPosts);
      console.log(`✅ Loaded ${transformedPosts.length} user posts`);
      
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      setUserPosts([]); // Fallback to empty array
    }
  };

  const addUserPost = (post: DivePost) => {
    setUserPosts(prev => [post, ...prev]);
    
    // Update user stats when new post is added
    if (user) {
      const updatedUser = {
        ...user,
        stats: {
          ...user.stats,
          totalDives: user.stats.totalDives + 1,
          totalBottomTime: user.stats.totalBottomTime + post.diveDetails.diveDuration,
          maxDepth: Math.max(user.stats.maxDepth, post.diveDetails.depth),
        },
      };
      setUserState(updatedUser);
    }
  };

  const clearUserData = async () => {
    try {
      await authService.logout();
      setUserState(null);
      setUserPosts([]);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  };

  const value: UserContextType = {
    user,
    userPosts,
    isLoading,
    isInitialized,
    login,
    signup,
    googleAuth,
    logout,
    setUser,
    updateProfile,
    updateProfileImage,
    refreshUserData,
    fetchUserPosts,
    addUserPost,
    clearUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    // Instead of throwing an error immediately, let's provide a fallback
    console.warn('useUser called outside of UserProvider - this might be a timing issue with Expo router');
    return {
      user: null,
      userPosts: [],
      isLoading: false,
      isInitialized: false,
      login: async () => { throw new Error('UserProvider not initialized'); },
      signup: async () => { throw new Error('UserProvider not initialized'); },
      googleAuth: async () => { throw new Error('UserProvider not initialized'); },
      logout: async () => { throw new Error('UserProvider not initialized'); },
      setUser: () => { throw new Error('UserProvider not initialized'); },
      updateProfile: async () => { throw new Error('UserProvider not initialized'); },
      updateProfileImage: async () => { throw new Error('UserProvider not initialized'); },
      refreshUserData: async () => { throw new Error('UserProvider not initialized'); },
      fetchUserPosts: async () => { throw new Error('UserProvider not initialized'); },
      addUserPost: () => { throw new Error('UserProvider not initialized'); },
      clearUserData: async () => { throw new Error('UserProvider not initialized'); },
    } as UserContextType;
  }
  return context;
}
