import { DiveStatsCard } from '@/components/DiveStatsCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    user: {
      displayName: 'Sarah Ocean',
      username: '@sarahocean',
      profileImageUri: null,
    },
    diveSpot: {
      name: 'Seal Island',
      coordinates: { latitude: -34.1369, longitude: 18.5819 },
    },
    imageUris: [require('@/assets/images/ds1.jpg')],
    caption: 'Incredible Great White encounter at Seal Island! The seals were so playful 🦭🦈',
    diveDetails: {
      date: new Date('2024-01-15'),
      depth: 22,
      diveDuration: 35,
      visibilityQuality: 'Good',
      waterTemp: 17,
      windConditions: 'Light',
      currentConditions: 'Moderate',
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
    user: {
      displayName: 'Mike Deep',
      username: '@mikedeep',
      profileImageUri: null,
    },
    diveSpot: {
      name: 'Two Oceans Aquarium',
      coordinates: { latitude: -33.9028, longitude: 18.4201 },
    },
    imageUris: [require('@/assets/images/ds2.jpg')],
    caption: 'Perfect beginner dive with incredible kelp forest! So many colorful nudibranchs 🌊🐠',
    diveDetails: {
      date: new Date('2024-01-14'),
      depth: 12,
      diveDuration: 45,
      visibilityQuality: 'Excellent',
      waterTemp: 16,
      windConditions: 'Calm',
      currentConditions: 'None',
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
    user: {
      displayName: 'Emma Reef',
      username: '@emmareef',
      profileImageUri: null,
    },
    diveSpot: {
      name: 'Atlantis Reef',
      coordinates: { latitude: -33.8567, longitude: 18.3026 },
    },
    imageUris: [require('@/assets/images/ds3.jpg')],
    caption: 'Stunning kelp forest dive with incredible visibility! The reef was alive with fish 🐟🌿',
    diveDetails: {
      date: new Date('2024-01-13'),
      depth: 18,
      diveDuration: 50,
      visibilityQuality: 'Excellent',
      waterTemp: 15,
      windConditions: 'Light',
      currentConditions: 'Light',
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
    user: {
      displayName: 'Jake Wreck',
      username: '@jakewreck',
      profileImageUri: null,
    },
    diveSpot: {
      name: 'Castle Rock',
      coordinates: { latitude: -34.3578, longitude: 18.4678 },
    },
    imageUris: [require('@/assets/images/ds4.jpg')],
    caption: 'Advanced dive at Castle Rock with strong currents but incredible pelagics! 🦈⚡',
    diveDetails: {
      date: new Date('2024-01-12'),
      depth: 28,
      diveDuration: 35,
      visibilityQuality: 'Fair',
      waterTemp: 14,
      windConditions: 'Strong',
      currentConditions: 'Strong',
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

  const dynamicStyles = createDynamicStyles(colors);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={[styles.header, dynamicStyles.header]}>
        <ThemedText type="title" style={{ color: colors.primary }}>DiveSpot</ThemedText>
        <ThemedText style={styles.subtitle}>Discover underwater adventures</ThemedText>
      </ThemedView>

      {mockPosts.map((post) => (
        <ThemedView key={post.id} style={[styles.post, dynamicStyles.post]}>
          {/* Post Header */}
          <ThemedView style={styles.postHeader}>
            <ThemedView style={styles.userInfo}>
              <ThemedView style={styles.avatar}>
                <IconSymbol 
                  name="person.crop.circle" 
                  size={40} 
                  color={Colors[colorScheme ?? 'light'].tint} 
                />
              </ThemedView>
              <ThemedView>
                <ThemedText style={styles.displayName}>
                  {post.user.displayName}
                </ThemedText>
                <ThemedText style={styles.username}>
                  {post.user.username}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedText style={styles.timestamp}>
              {format(post.createdAt, 'MMM d')}
            </ThemedText>
          </ThemedView>

          {/* Post Image */}
          <Image 
            source={post.imageUris[0]} 
            style={styles.postImage}
            contentFit="cover"
          />

          {/* Dive Details */}
          <ThemedView style={styles.diveDetails}>
            <ThemedView style={styles.locationHeader}>
              <IconSymbol 
                name="location" 
                size={16} 
                color={colors.primary} 
              />
              <ThemedText style={styles.locationName}>
                {post.diveSpot.name}
              </ThemedText>
            </ThemedView>
            
            <DiveStatsCard diveDetails={post.diveDetails} />
          </ThemedView>

          {/* Post Actions */}
          <ThemedView style={[styles.actions, dynamicStyles.actions]}>
            <TouchableOpacity 
              style={[styles.actionButton, dynamicStyles.actionButton]}
              onPress={() => toggleLike(post.id)}
            >
              <IconSymbol 
                name={likedPosts.has(post.id) ? "heart.fill" : "heart"} 
                size={20} 
                color={likedPosts.has(post.id) ? colors.likeActive : colors.like} 
              />
              <ThemedText style={[styles.actionText, { color: colors.text }]}>Like</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, dynamicStyles.actionButton]}>
              <IconSymbol 
                name="bubble.left" 
                size={20} 
                color={colors.comment} 
              />
              <ThemedText style={[styles.actionText, { color: colors.text }]}>Comment</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, dynamicStyles.actionButton]}>
              <IconSymbol 
                name="square.and.arrow.up" 
                size={20} 
                color={colors.share} 
              />
              <ThemedText style={[styles.actionText, { color: colors.text }]}>Share</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Caption */}
          {post.caption && (
            <ThemedView style={styles.caption}>
              <ThemedText>
                <ThemedText style={styles.captionUsername}>
                  {post.user.username}
                </ThemedText>
                {' '}
                {post.caption}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      ))}

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
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  post: {
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    fontWeight: '600',
  },
  username: {
    fontSize: 12,
    opacity: 0.6,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  postImage: {
    width: screenWidth,
    height: screenWidth * 0.75,
  },
  diveDetails: {
    padding: 15,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationName: {
    fontWeight: '600',
    fontSize: 16,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
  },
  caption: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  captionUsername: {
    fontWeight: '600',
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

const createDynamicStyles = (colors: any) => StyleSheet.create({
  header: {
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  post: {
    backgroundColor: colors.cardBackground,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  actions: {
    borderTopColor: colors.border,
  },
  actionButton: {
    backgroundColor: colors.overlay,
  },
});
