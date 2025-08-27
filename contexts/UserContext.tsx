import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, DivePost } from '@/types';
import { userService } from '@/services/userService';
import { Alert } from 'react-native';

interface UserContextType {
  user: User | null;
  userPosts: DivePost[];
  isLoading: boolean;
  
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

  useEffect(() => {
    // Load user data from storage if available
    const loadStoredUser = async () => {
      try {
        const userData = await userService.getCurrentUser();
        if (userData) {
          setUserState(userData);
        }
      } catch (error) {
        console.error('Failed to load stored user:', error);
      }
    };

    loadStoredUser();
  }, []);

  const setUser = (userData: User | null) => {
    setUserState(userData);
    if (userData) {
      userService.saveUser(userData);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const updatedUser = {
        ...user,
        ...updates,
        stats: {
          ...user.stats,
          ...(updates.stats || {}),
        },
      };

      // Save to storage/API
      await userService.updateUser(updatedUser);
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
      
      // In production, this would upload to cloud storage first
      const updatedUser = {
        ...user,
        profileImageUri: imageUri,
      };

      await userService.updateUser(updatedUser);
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
      const userData = await userService.getCurrentUser();
      if (userData) {
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
      // In production, this would fetch from API
      const posts = await userService.getUserPosts(user.id);
      setUserPosts(posts);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
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
      userService.updateUser(updatedUser);
    }
  };

  const clearUserData = async () => {
    try {
      await userService.clearUser();
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
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
