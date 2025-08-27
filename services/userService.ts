import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, DivePost, UserStats } from '@/types';

const STORAGE_KEYS = {
  USER: '@divespot_user',
  USER_POSTS: '@divespot_user_posts',
  USER_SETTINGS: '@divespot_user_settings',
};

// Mock dive posts for the user - in production these would come from API
const mockUserPosts: DivePost[] = [
  {
    id: 'post-user-1',
    userId: 'user-123',
    user: {
      id: 'user-123',
      username: 'capetowndiver',
      email: 'diver@capetown.com',
      displayName: 'Cape Town Diver',
      bio: 'PADI Advanced Open Water | Exploring Cape Town\'s incredible underwater world 🌊🦭',
      location: 'Cape Town, South Africa',
      stats: {
        totalDives: 47,
        maxDepth: 35,
        totalBottomTime: 1420,
        certificationLevel: 'Advanced Open Water',
        favoriteSpot: 'Seal Island',
      },
      createdAt: new Date('2024-01-15'),
    },
    diveSpot: {
      id: 'spot-1',
      name: 'Seal Island',
      description: 'Famous for Great White shark cage diving and seal colonies',
      coordinates: { latitude: -34.1369, longitude: 18.5819 },
      address: 'False Bay, Cape Town',
      maxDepth: 25,
      difficulty: 'Intermediate' as const,
      waterType: 'Salt' as const,
      visibility: 10,
      temperature: 18,
      createdBy: 'system',
      createdAt: new Date('2024-01-01'),
    },
    imageUris: [require('@/assets/images/ds2.jpg').default],
    caption: 'Amazing visibility at Seal Island today! The seals were so playful and curious. Perfect conditions for photography 📸',
    diveDetails: {
      date: new Date('2024-11-15'),
      depth: 18,
      diveDuration: 45,
      visibilityQuality: 'Excellent' as const,
      waterTemp: 18,
      windConditions: 'Light' as const,
      currentConditions: 'Light' as const,
      seaLife: ['Cape Fur Seals', 'Seven Gill Sharks', 'Kelp Forest Fish'],
      buddyNames: ['Sarah Johnson', 'Mike Roberts'],
      diveTimestamp: new Date('2024-11-15T10:30:00'),
      notes: 'Incredible dive! Seals were very interactive and we had great visibility throughout.',
      equipment: ['Wetsuit 5mm', 'Underwater Camera', 'Dive Computer'],
    },
    likes: [],
    comments: [],
    createdAt: new Date('2024-11-15T14:00:00'),
  },
  {
    id: 'post-user-2',
    userId: 'user-123',
    user: {
      id: 'user-123',
      username: 'capetowndiver',
      email: 'diver@capetown.com',
      displayName: 'Cape Town Diver',
      bio: 'PADI Advanced Open Water | Exploring Cape Town\'s incredible underwater world 🌊🦭',
      location: 'Cape Town, South Africa',
      stats: {
        totalDives: 47,
        maxDepth: 35,
        totalBottomTime: 1420,
        certificationLevel: 'Advanced Open Water',
        favoriteSpot: 'Seal Island',
      },
      createdAt: new Date('2024-01-15'),
    },
    diveSpot: {
      id: 'spot-3',
      name: 'Atlantis Reef',
      description: 'Pristine reef system with incredible kelp forests',
      coordinates: { latitude: -33.8567, longitude: 18.3026 },
      address: 'Atlantic Seaboard, Cape Town',
      maxDepth: 20,
      difficulty: 'Intermediate' as const,
      waterType: 'Salt' as const,
      visibility: 12,
      temperature: 15,
      createdBy: 'system',
      createdAt: new Date('2024-01-01'),
    },
    imageUris: [require('@/assets/images/ds4.jpg').default],
    caption: 'First time at Atlantis Reef and it exceeded all expectations! The kelp forest was like an underwater cathedral 🌿',
    diveDetails: {
      date: new Date('2024-11-10'),
      depth: 15,
      diveDuration: 52,
      visibilityQuality: 'Good' as const,
      waterTemp: 15,
      windConditions: 'Moderate' as const,
      currentConditions: 'Light' as const,
      seaLife: ['Kelp Forest', 'Red Roman', 'Hottentot', 'Octopus'],
      buddyNames: ['Emma Wilson'],
      diveTimestamp: new Date('2024-11-10T11:15:00'),
      notes: 'Beautiful kelp forest dive. Found a small octopus hiding in the rocks!',
      equipment: ['Wetsuit 7mm', 'Dive Light', 'SMB'],
    },
    likes: [],
    comments: [],
    createdAt: new Date('2024-11-10T16:30:00'),
  },
];

class UserService {
  // User management
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (userData) {
        const user = JSON.parse(userData);
        // Convert date strings back to Date objects
        user.createdAt = new Date(user.createdAt);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  }

  async updateUser(updatedUser: User): Promise<void> {
    try {
      await this.saveUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }

  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.USER_POSTS,
        STORAGE_KEYS.USER_SETTINGS,
      ]);
    } catch (error) {
      console.error('Failed to clear user data:', error);
      throw error;
    }
  }

  // User posts management
  async getUserPosts(userId: string): Promise<DivePost[]> {
    try {
      const postsData = await AsyncStorage.getItem(STORAGE_KEYS.USER_POSTS);
      if (postsData) {
        const posts = JSON.parse(postsData);
        // Convert date strings back to Date objects
        return posts.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          diveDetails: {
            ...post.diveDetails,
            date: new Date(post.diveDetails.date),
            diveTimestamp: new Date(post.diveDetails.diveTimestamp),
          },
        }));
      }
      
      // Return empty array if no posts found
      return [];
    } catch (error) {
      console.error('Failed to get user posts:', error);
      return [];
    }
  }

  // Initialize mock data for testing/demo purposes
  async initializeMockData(userId: string): Promise<void> {
    try {
      // Update mock posts with the actual user ID
      const updatedMockPosts = mockUserPosts.map(post => ({
        ...post,
        userId: userId,
        user: { ...post.user, id: userId }
      }));
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_POSTS, JSON.stringify(updatedMockPosts));
    } catch (error) {
      console.error('Failed to initialize mock data:', error);
    }
  }

  async saveUserPost(post: DivePost): Promise<void> {
    try {
      const existingPosts = await this.getUserPosts(post.userId);
      const updatedPosts = [post, ...existingPosts];
      await AsyncStorage.setItem(STORAGE_KEYS.USER_POSTS, JSON.stringify(updatedPosts));
    } catch (error) {
      console.error('Failed to save user post:', error);
      throw error;
    }
  }

  async deleteUserPost(postId: string, userId: string): Promise<void> {
    try {
      const existingPosts = await this.getUserPosts(userId);
      const filteredPosts = existingPosts.filter(post => post.id !== postId);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_POSTS, JSON.stringify(filteredPosts));
    } catch (error) {
      console.error('Failed to delete user post:', error);
      throw error;
    }
  }

  // User statistics helpers
  calculateUserStats(posts: DivePost[]): UserStats {
    if (posts.length === 0) {
      return {
        totalDives: 0,
        maxDepth: 0,
        totalBottomTime: 0,
        certificationLevel: 'Open Water',
        favoriteSpot: undefined,
      };
    }

    const totalDives = posts.length;
    const maxDepth = Math.max(...posts.map(post => post.diveDetails.depth));
    const totalBottomTime = posts.reduce((total, post) => total + post.diveDetails.diveDuration, 0);
    
    // Find most frequent dive spot as favorite
    const spotCounts: { [key: string]: number } = {};
    posts.forEach(post => {
      spotCounts[post.diveSpot.name] = (spotCounts[post.diveSpot.name] || 0) + 1;
    });
    
    const favoriteSpot = Object.keys(spotCounts).reduce((a, b) => 
      spotCounts[a] > spotCounts[b] ? a : b, ''
    );

    return {
      totalDives,
      maxDepth,
      totalBottomTime,
      certificationLevel: 'Advanced Open Water', // This would be managed separately
      favoriteSpot: favoriteSpot || undefined,
    };
  }

  async updateUserStats(userId: string): Promise<UserStats> {
    try {
      const posts = await this.getUserPosts(userId);
      const stats = this.calculateUserStats(posts);
      
      const user = await this.getCurrentUser();
      if (user) {
        user.stats = { ...user.stats, ...stats };
        await this.updateUser(user);
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to update user stats:', error);
      throw error;
    }
  }

  // Profile image management (mock for MVP)
  async uploadProfileImage(imageUri: string): Promise<string> {
    try {
      // In production, this would upload to cloud storage (S3, Cloudinary, etc.)
      // For MVP, we just return the local URI
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
      return imageUri;
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      throw error;
    }
  }

  // Achievement/Badge system helpers
  calculateAchievements(user: User, posts: DivePost[]): string[] {
    const achievements: string[] = [];

    // Dive count achievements
    if (user.stats.totalDives >= 50) achievements.push('Half Century Diver');
    else if (user.stats.totalDives >= 25) achievements.push('Quarter Century Diver');
    else if (user.stats.totalDives >= 10) achievements.push('Double Digits');
    else if (user.stats.totalDives >= 5) achievements.push('Getting Started');

    // Depth achievements
    if (user.stats.maxDepth >= 30) achievements.push('Deep Sea Explorer');
    else if (user.stats.maxDepth >= 20) achievements.push('Depth Seeker');
    else if (user.stats.maxDepth >= 15) achievements.push('Going Deeper');

    // Time achievements
    const totalHours = Math.floor(user.stats.totalBottomTime / 60);
    if (totalHours >= 50) achievements.push('Time Master');
    else if (totalHours >= 25) achievements.push('Experienced');
    else if (totalHours >= 10) achievements.push('Getting Experience');

    // Cape Town specific achievements
    const capeSpots = posts.filter(post => 
      post.diveSpot.address?.includes('Cape Town')
    ).length;
    
    if (capeSpots >= 10) achievements.push('Cape Town Explorer');
    else if (capeSpots >= 5) achievements.push('Local Diver');

    // Marine life achievements
    const allSeaLife = posts.flatMap(post => post.diveDetails.seaLife || []);
    const uniqueSpecies = [...new Set(allSeaLife)];
    
    if (uniqueSpecies.length >= 20) achievements.push('Marine Biologist');
    else if (uniqueSpecies.length >= 10) achievements.push('Species Spotter');

    return achievements;
  }
}

export const userService = new UserService();
