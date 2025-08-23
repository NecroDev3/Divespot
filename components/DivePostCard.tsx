import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { DivePost } from '../types';
import { DiveStatsCard } from './DiveStatsCard';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

const { width: screenWidth } = Dimensions.get('window');

interface DivePostCardProps {
  post: DivePost;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export const DivePostCard: React.FC<DivePostCardProps> = ({
  post,
  isLiked,
  onLike,
  onComment,
  onShare,
}) => {
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.post}>
      {/* Post Header */}
      <ThemedView style={styles.postHeader}>
        <ThemedView style={styles.userInfo}>
          <ThemedView style={styles.avatar}>
            {post.user.profileImageUri ? (
              <Image source={{ uri: post.user.profileImageUri }} style={styles.avatarImage} />
            ) : (
                          <IconSymbol 
              name="person.crop.circle" 
              size={40} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            )}
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
          color={Colors[colorScheme ?? 'light'].primary} 
        />
          <ThemedText style={styles.locationName}>
            {post.diveSpot.name}
          </ThemedText>
        </ThemedView>
        
        <DiveStatsCard diveDetails={post.diveDetails} />
      </ThemedView>

      {/* Post Actions */}
      <ThemedView style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onLike}
        >
          <IconSymbol 
            name={isLiked ? "heart.fill" : "heart"} 
            size={24} 
            color={isLiked ? Colors[colorScheme ?? 'light'].likeActive : Colors[colorScheme ?? 'light'].like} 
          />
          <ThemedText style={styles.actionText}>
            {post.likes.length > 0 && `${post.likes.length} `}Like
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <IconSymbol 
            name="bubble.left" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].comment} 
          />
          <ThemedText style={styles.actionText}>
            {post.comments.length > 0 && `${post.comments.length} `}Comment
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <IconSymbol 
            name="square.and.arrow.up" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].share} 
          />
          <ThemedText style={styles.actionText}>Share</ThemedText>
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
  );
};

const styles = StyleSheet.create({
  post: {
    marginBottom: 16,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
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
    borderTopColor: Colors.light.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.overlay,
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
});
