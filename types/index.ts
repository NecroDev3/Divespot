// Core data models for DiveSpot MVP

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  profileImageUri?: string;
  location?: string;
  stats: UserStats;
  createdAt: Date;
}

export interface UserStats {
  totalDives: number;
  maxDepth: number;
  totalBottomTime: number; // in minutes
  certificationLevel: string;
  favoriteSpot?: string;
}

export interface DiveSpot {
  id: string;
  name: string;
  description?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  maxDepth?: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  waterType: 'Salt' | 'Fresh' | 'Brackish';
  visibility?: number; // in meters
  temperature?: number; // in celsius
  createdBy: string;
  createdAt: Date;
}

export interface DivePost {
  id: string;
  userId: string;
  user: User; // populated user data
  diveSpot: DiveSpot;
  imageUris: string[];
  caption?: string;
  diveDetails: DiveDetails;
  likes: Like[];
  comments: Comment[];
  createdAt: Date;
}

export interface DiveDetails {
  date: Date;
  depth: number; // in meters
  bottomTime: number; // in minutes
  visibility?: number; // in meters
  waterTemp?: number; // in celsius
  conditions?: string;
  equipment?: string[];
  buddyNames?: string[];
  notes?: string;
}

export interface Like {
  id: string;
  userId: string;
  user: User;
  postId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  postId: string;
  content: string;
  createdAt: Date;
}

// UI and Navigation types
export interface RootTabParamList {
  Feed: undefined;
  AddPost: undefined;
  Profile: undefined;
  Explore: undefined;
}

export interface NavigationProps {
  navigation: any; // Will be properly typed when navigation is set up
  route: any;
}
