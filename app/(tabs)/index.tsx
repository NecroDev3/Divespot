import { CompactDiveCard } from '@/components/CompactDiveCard';
import { DetailedDivePost } from '@/components/DetailedDivePost';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DivePost } from '@/types';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    userId: '1',
    user: {
      id: '1',
      displayName: 'Sarah Ocean',
      username: '@sarahocean',
      email: 'sarah@divespot.com',
      profileImageUri: undefined,
      stats: {
        totalDives: 45,
        maxDepth: 30,
        totalBottomTime: 2250,
        certificationLevel: 'Advanced Open Water',
        favoriteSpot: 'Seal Island',
      },
      createdAt: new Date('2023-06-01'),
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
      createdBy: 'admin',
      createdAt: new Date('2023-01-01'),
    },
    imageUris: [require('@/assets/images/ds1.jpg')],
    caption: 'Incredible Great White encounter at Seal Island! The seals were so playful 🦭🦈',
    diveDetails: {
      date: new Date('2024-01-15'),
      depth: 22,
      diveDuration: 35,
      visibilityQuality: 'Good' as const,
      waterTemp: 17,
      windConditions: 'Light' as const,
      currentConditions: 'Moderate' as const,
      seaLife: ['Great White Shark', 'Cape Fur Seals', 'Bronze Whaler Shark', 'Kelp Fish'],
      equipment: ['BCD', 'Regulator', 'Wetsuit 7mm', 'Fins', 'Mask', 'Camera'],
      buddyNames: ['Alex', 'Jordan'],
      diveTimestamp: new Date('2024-01-15T14:30:00'),
      notes: 'Amazing encounter with a 4-meter Great White! Perfect conditions for photography.',
    },
    likes: [],
    comments: [],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    userId: '2',
    user: {
      id: '2',
      displayName: 'Mike Deep',
      username: '@mikedeep',
      email: 'mike@divespot.com',
      profileImageUri: undefined,
      stats: {
        totalDives: 78,
        maxDepth: 45,
        totalBottomTime: 3900,
        certificationLevel: 'Rescue Diver',
        favoriteSpot: 'Two Oceans Aquarium',
      },
      createdAt: new Date('2023-03-15'),
    },
    diveSpot: {
      id: 'spot-2',
      name: 'Two Oceans Aquarium',
      description: 'Perfect for beginners with excellent visibility and diverse marine life',
      coordinates: { latitude: -33.9028, longitude: 18.4201 },
      address: 'V&A Waterfront, Cape Town',
      maxDepth: 12,
      difficulty: 'Beginner' as const,
      waterType: 'Salt' as const,
      visibility: 15,
      temperature: 16,
      createdBy: 'admin',
      createdAt: new Date('2023-01-01'),
    },
    imageUris: [require('@/assets/images/ds2.jpg')],
    caption: 'Perfect beginner dive with incredible kelp forest! So many colorful nudibranchs 🌊🐠',
    diveDetails: {
      date: new Date('2024-01-14'),
      depth: 12,
      diveDuration: 45,
      visibilityQuality: 'Excellent' as const,
      waterTemp: 16,
      windConditions: 'Calm' as const,
      currentConditions: 'None' as const,
      seaLife: ['Klipfish', 'Nudibranch', 'Sea Anemone', 'Hermit Crab', 'Octopus'],
      equipment: ['BCD', 'Regulator', 'Wetsuit 5mm', 'Fins', 'Mask', 'Camera'],
      buddyNames: ['Taylor'],
      diveTimestamp: new Date('2024-01-14T10:15:00'),
      notes: 'Perfect conditions for underwater photography. Amazing kelp forest with diverse marine life.',
    },
    likes: [],
    comments: [],
    createdAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    userId: '3',
    user: {
      id: '3',
      displayName: 'Emma Reef',
      username: '@emmareef',
      email: 'emma@divespot.com',
      profileImageUri: undefined,
      stats: {
        totalDives: 32,
        maxDepth: 25,
        totalBottomTime: 1800,
        certificationLevel: 'Open Water',
        favoriteSpot: 'Atlantis Reef',
      },
      createdAt: new Date('2023-08-10'),
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
      createdBy: 'admin',
      createdAt: new Date('2023-01-01'),
    },
    imageUris: [require('@/assets/images/ds3.jpg')],
    caption: 'Stunning kelp forest dive with incredible visibility! The reef was alive with fish 🐟🌿',
    diveDetails: {
      date: new Date('2024-01-13'),
      depth: 18,
      diveDuration: 50,
      visibilityQuality: 'Excellent' as const,
      waterTemp: 15,
      windConditions: 'Light' as const,
      currentConditions: 'Light' as const,
      seaLife: ['Red Roman', 'Yellowtail', 'Cape Stumpnose', 'Sea Bamboo', 'Pyjama Shark'],
      equipment: ['BCD', 'Regulator', 'Wetsuit 5mm', 'Fins', 'Mask', 'Camera'],
      buddyNames: ['Sophie', 'Marcus'],
      diveTimestamp: new Date('2024-01-13T13:45:00'),
      notes: 'Perfect conditions with amazing kelp forest. Great diversity of Cape reef fish.',
    },
    likes: [],
    comments: [],
    createdAt: new Date('2024-01-13'),
  },
  {
    id: '4',
    userId: '4',
    user: {
      id: '4',
      displayName: 'Jake Wreck',
      username: '@jakewreck',
      email: 'jake@divespot.com',
      profileImageUri: undefined,
      stats: {
        totalDives: 156,
        maxDepth: 40,
        totalBottomTime: 7200,
        certificationLevel: 'Divemaster',
        favoriteSpot: 'Castle Rock',
      },
      createdAt: new Date('2022-11-20'),
    },
    diveSpot: {
      id: 'spot-4',
      name: 'Castle Rock',
      description: 'Dramatic underwater topography with caves and swim-throughs',
      coordinates: { latitude: -34.3578, longitude: 18.4678 },
      address: 'Cape Peninsula, Cape Town',
      maxDepth: 30,
      difficulty: 'Advanced' as const,
      waterType: 'Salt' as const,
      visibility: 8,
      temperature: 14,
      createdBy: 'admin',
      createdAt: new Date('2023-01-01'),
    },
    imageUris: [require('@/assets/images/ds4.jpg')],
    caption: 'Advanced dive at Castle Rock with strong currents but incredible pelagics! 🦈⚡',
    diveDetails: {
      date: new Date('2024-01-12'),
      depth: 28,
      diveDuration: 35,
      visibilityQuality: 'Fair' as const,
      waterTemp: 14,
      windConditions: 'Strong' as const,
      currentConditions: 'Strong' as const,
      seaLife: ['Bronze Whaler Shark', 'Yellowtail', 'Cape Fur Seal', 'Steentjie', 'Kelp Gull'],
      equipment: ['BCD', 'Regulator', 'Wetsuit 7mm', 'Fins', 'Mask', 'Dive Computer', 'Safety Sausage'],
      buddyNames: ['Rachel'],
      diveTimestamp: new Date('2024-01-12T11:20:00'),
      notes: 'Challenging conditions with strong current, but rewarded with amazing pelagic life including bronze whaler sharks.',
    },
    likes: [],
    comments: [],
    createdAt: new Date('2024-01-12'),
  },
];

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<DivePost | null>(null);
  const [showDetailedPost, setShowDetailedPost] = useState(false);
  const colors = Colors[colorScheme ?? 'light'];

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handlePostPress = (post: DivePost) => {
    setSelectedPost(post);
    setShowDetailedPost(true);
  };

  const handleCloseDetailedPost = () => {
    setShowDetailedPost(false);
    setSelectedPost(null);
  };

  const handleComment = () => {
    // TODO: Implement comment functionality
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={[styles.header, { borderBottomColor: colors.border }]}>
        <Image 
          source={require('@/assets/images/graphic.jpg')}
          style={styles.headerImage}
          contentFit="cover"
        />
        <ThemedView style={styles.headerOverlay}>
          <ThemedText type="title" style={styles.headerTitle}>DiveSpot</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Discover Cape Town&apos;s underwater adventures</ThemedText>
        </ThemedView>
      </ThemedView>

      {mockPosts.map((post) => (
        <CompactDiveCard
          key={post.id}
          post={post}
          isLiked={likedPosts.has(post.id)}
          onLike={() => toggleLike(post.id)}
          onComment={handleComment}
          onShare={handleShare}
          onPress={() => handlePostPress(post)}
        />
      ))}

      {/* Detailed Post Modal */}
      {selectedPost && (
        <DetailedDivePost
          post={selectedPost}
          isVisible={showDetailedPost}
          isLiked={likedPosts.has(selectedPost.id)}
          onClose={handleCloseDetailedPost}
          onLike={() => toggleLike(selectedPost.id)}
          onComment={handleComment}
          onShare={handleShare}
        />
      )}

      <ThemedView style={[styles.endMessage, styles.lastMessage]}>
        <ThemedText style={styles.endText}>
          🌊 You&apos;re all caught up! Time for another dive? 🤿
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Extra space for tab bar and visual breathing room
  },
  header: {
    position: 'relative',
    height: 200,
    borderBottomWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        height: 120,
        maxWidth: 800,
        alignSelf: 'center',
        borderRadius: 12,
        marginTop: 16,
      },
    }),
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  headerTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  endMessage: {
    padding: 30,
    alignItems: 'center',
  },
  lastMessage: {
    marginBottom: 40, // Extra bottom margin for the last message
  },
  endText: {
    fontStyle: 'italic',
    opacity: 0.6,
    textAlign: 'center',
  },
});


