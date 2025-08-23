import AsyncStorage from '@react-native-async-storage/async-storage';
import { DivePost, DiveSpot, User } from '../types';

// Keys for AsyncStorage
const STORAGE_KEYS = {
  USER: 'divespot_user',
  POSTS: 'divespot_posts',
  DIVE_SPOTS: 'divespot_dive_spots',
  LIKED_POSTS: 'divespot_liked_posts',
} as const;

export class DiveSpotStorage {
  
  // User data management
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Failed to save user data');
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Posts management
  static async savePosts(posts: DivePost[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving posts:', error);
      throw new Error('Failed to save posts');
    }
  }

  static async getPosts(): Promise<DivePost[]> {
    try {
      const postsData = await AsyncStorage.getItem(STORAGE_KEYS.POSTS);
      return postsData ? JSON.parse(postsData) : [];
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  static async addPost(post: DivePost): Promise<void> {
    try {
      const existingPosts = await this.getPosts();
      const updatedPosts = [post, ...existingPosts];
      await this.savePosts(updatedPosts);
    } catch (error) {
      console.error('Error adding post:', error);
      throw new Error('Failed to add post');
    }
  }

  // Dive spots management
  static async saveDiveSpots(spots: DiveSpot[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DIVE_SPOTS, JSON.stringify(spots));
    } catch (error) {
      console.error('Error saving dive spots:', error);
      throw new Error('Failed to save dive spots');
    }
  }

  static async getDiveSpots(): Promise<DiveSpot[]> {
    try {
      const spotsData = await AsyncStorage.getItem(STORAGE_KEYS.DIVE_SPOTS);
      return spotsData ? JSON.parse(spotsData) : [];
    } catch (error) {
      console.error('Error getting dive spots:', error);
      return [];
    }
  }

  static async addDiveSpot(spot: DiveSpot): Promise<void> {
    try {
      const existingSpots = await this.getDiveSpots();
      const updatedSpots = [...existingSpots, spot];
      await this.saveDiveSpots(updatedSpots);
    } catch (error) {
      console.error('Error adding dive spot:', error);
      throw new Error('Failed to add dive spot');
    }
  }

  // Liked posts management
  static async saveLikedPosts(likedPostIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LIKED_POSTS, JSON.stringify(likedPostIds));
    } catch (error) {
      console.error('Error saving liked posts:', error);
      throw new Error('Failed to save liked posts');
    }
  }

  static async getLikedPosts(): Promise<string[]> {
    try {
      const likedData = await AsyncStorage.getItem(STORAGE_KEYS.LIKED_POSTS);
      return likedData ? JSON.parse(likedData) : [];
    } catch (error) {
      console.error('Error getting liked posts:', error);
      return [];
    }
  }

  static async toggleLike(postId: string): Promise<boolean> {
    try {
      const likedPosts = await this.getLikedPosts();
      const isLiked = likedPosts.includes(postId);
      
      if (isLiked) {
        const updatedLikes = likedPosts.filter(id => id !== postId);
        await this.saveLikedPosts(updatedLikes);
        return false;
      } else {
        const updatedLikes = [...likedPosts, postId];
        await this.saveLikedPosts(updatedLikes);
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw new Error('Failed to toggle like');
    }
  }

  // Utility methods
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('Failed to clear data');
    }
  }

  static async initializeDefaultData(): Promise<void> {
    try {
      // Check if user exists, if not create a default one
      const existingUser = await this.getUser();
      if (!existingUser) {
        const defaultUser: User = {
          id: '1',
          username: 'diver',
          email: 'diver@divespot.com',
          displayName: 'New Diver',
          bio: 'Ready to explore the depths! 🤿',
          stats: {
            totalDives: 0,
            maxDepth: 0,
            totalBottomTime: 0,
            certificationLevel: 'Open Water',
            favoriteSpot: 'To be discovered',
          },
          createdAt: new Date(),
        };
        await this.saveUser(defaultUser);
      }

      // Initialize with some sample dive spots if none exist
      const existingSpots = await this.getDiveSpots();
      if (existingSpots.length === 0) {
        const defaultSpots: DiveSpot[] = [
          {
            id: '1',
            name: 'Great Blue Hole',
            description: 'World-famous blue hole with stunning stalactite formations',
            coordinates: { latitude: 17.3189, longitude: -87.5353 },
            address: 'Belize Barrier Reef Reserve System, Belize',
            maxDepth: 124,
            difficulty: 'Advanced',
            waterType: 'Salt',
            visibility: 30,
            temperature: 26,
            createdBy: '1',
            createdAt: new Date(),
          },
          {
            id: '2',
            name: 'Blue Corner',
            description: 'Incredible current dive with sharks, mantas, and schooling fish',
            coordinates: { latitude: 7.3037, longitude: 134.5130 },
            address: 'Palau',
            maxDepth: 35,
            difficulty: 'Intermediate',
            waterType: 'Salt',
            visibility: 40,
            temperature: 28,
            createdBy: '1',
            createdAt: new Date(),
          },
        ];
        await this.saveDiveSpots(defaultSpots);
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }
}
