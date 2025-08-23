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
  date: Date; // Keep date for backend/data purposes, but won't display in main stats
  depth: number; // in meters (max depth reached)
  diveDuration: number; // in minutes (total dive duration)
  visibilityQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor'; // Cape Town specific visibility rating
  waterTemp?: number; // in celsius
  windConditions: 'Calm' | 'Light' | 'Moderate' | 'Strong' | 'Very Strong'; // Cape Town wind conditions
  currentConditions: 'None' | 'Light' | 'Moderate' | 'Strong' | 'Very Strong'; // Current strength
  seaLife?: string[]; // Marine life observed during dive
  buddyNames?: string[]; // Who they dived with
  diveTimestamp: Date; // When the dive was recorded/logged
  equipment?: string[]; // Keep for backend but won't display in main stats
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

// Cape Town Popular Dive Spots
export const CAPE_TOWN_DIVE_SPOTS: Omit<DiveSpot, 'id' | 'createdBy' | 'createdAt'>[] = [
  {
    name: "Two Oceans Aquarium",
    description: "Perfect for beginners with excellent visibility and diverse marine life",
    coordinates: { latitude: -33.9028, longitude: 18.4201 },
    address: "V&A Waterfront, Cape Town",
    maxDepth: 12,
    difficulty: 'Beginner',
    waterType: 'Salt',
    visibility: 15,
    temperature: 16,
  },
  {
    name: "Seal Island",
    description: "Famous for Great White shark cage diving and seal colonies",
    coordinates: { latitude: -34.1369, longitude: 18.5819 },
    address: "False Bay, Cape Town", 
    maxDepth: 25,
    difficulty: 'Intermediate',
    waterType: 'Salt',
    visibility: 10,
    temperature: 18,
  },
  {
    name: "Atlantis Reef",
    description: "Pristine reef system with incredible kelp forests",
    coordinates: { latitude: -33.8567, longitude: 18.3026 },
    address: "Atlantic Seaboard, Cape Town",
    maxDepth: 20,
    difficulty: 'Intermediate', 
    waterType: 'Salt',
    visibility: 12,
    temperature: 15,
  },
  {
    name: "Castle Rock",
    description: "Dramatic underwater topography with caves and swim-throughs",
    coordinates: { latitude: -34.3578, longitude: 18.4678 },
    address: "Cape Peninsula, Cape Town",
    maxDepth: 30,
    difficulty: 'Advanced',
    waterType: 'Salt',
    visibility: 8,
    temperature: 14,
  },
  {
    name: "Windmill Beach",
    description: "Shore diving with beautiful reefs and easy entry",
    coordinates: { latitude: -34.1950, longitude: 18.4503 },
    address: "Simon's Town, Cape Town",
    maxDepth: 15,
    difficulty: 'Beginner',
    waterType: 'Salt',
    visibility: 12,
    temperature: 17,
  },
  {
    name: "Pyramid Rock", 
    description: "Advanced dive site with strong currents and pelagic fish",
    coordinates: { latitude: -34.2156, longitude: 18.4789 },
    address: "Miller's Point, Cape Town",
    maxDepth: 35,
    difficulty: 'Advanced',
    waterType: 'Salt',
    visibility: 6,
    temperature: 13,
  }
];

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
