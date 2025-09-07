import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, DivePost } from '@/types';
import { userService } from '@/services/userService';
import { Alert } from 'react-native';

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
        
        // For testing auth flow: Clear existing data to force login screen
        // Comment out the next line after testing authentication
        await userService.clearUser();
        
        const userData = await userService.getCurrentUser();
        if (userData) {
          console.log('Found existing user:', userData.email);
          setUserState(userData);
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
      
      // For MVP, we'll create a user based on email/name
      // In production, this would authenticate with your backend
      const existingUser = await userService.getCurrentUser();
      
      if (existingUser && existingUser.email === email) {
        setUserState(existingUser);
        return;
      }
      
      // Create new user for this email
      const newUser = await userService.createDefaultUser();
      const updatedUser = {
        ...newUser,
        email: email,
        displayName: email.split('@')[0], // Use email prefix as display name
        username: email.split('@')[0].toLowerCase(),
      };
      
      await userService.saveUser(updatedUser);
      setUserState(updatedUser);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      setIsLoading(true);
      
      // For MVP, create user with provided details
      // In production, this would register with your backend
      const newUser = await userService.createDefaultUser();
      const updatedUser = {
        ...newUser,
        email: email,
        displayName: displayName,
        username: email.split('@')[0].toLowerCase(),
        id: `user-${Date.now()}`, // Generate unique ID
      };
      
      await userService.saveUser(updatedUser);
      setUserState(updatedUser);
      
    } catch (error) {
      console.error('Signup failed:', error);
      throw new Error('Account creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const googleAuth = async () => {
    try {
      setIsLoading(true);
      
      // For MVP, create a default Google user
      // In production, this would use actual Google Auth SDK
      const googleUser = await userService.createDefaultUser();
      const updatedUser = {
        ...googleUser,
        email: 'google.user@gmail.com',
        displayName: 'Google User',
        username: 'googleuser',
        id: `google-user-${Date.now()}`,
      };
      
      await userService.saveUser(updatedUser);
      setUserState(updatedUser);
      
      Alert.alert('Success', 'Signed in with Google! (Demo)');
      
    } catch (error) {
      console.error('Google auth failed:', error);
      throw new Error('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await userService.clearUser();
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
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
