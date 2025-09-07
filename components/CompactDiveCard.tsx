import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { DivePost } from '../types';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

const { width: screenWidth } = Dimensions.get('window');

interface CompactDiveCardProps {
  post: DivePost;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onPress: () => void;
}

export const CompactDiveCard: React.FC<CompactDiveCardProps> = ({
  post,
  isLiked,
  onLike,
  onComment,
  onShare,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getVisibilityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return colors.success;
      case 'Good': return colors.primary;
      case 'Fair': return colors.secondary;
      case 'Poor': return colors.warning;
      case 'Very Poor': return colors.error;
      default: return colors.text;
    }
  };

  const getDurationCondition = (duration: number) => {
    if (duration > 50) return 'Extended';
    if (duration > 30) return 'Standard';
    return 'Short';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
      <ThemedView style={[styles.card, { backgroundColor: colors.background }]}>
        {/* Header with user info */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.userInfo}>
            <ThemedView style={styles.avatar}>
              {post.user.profileImageUri ? (
                <Image source={{ uri: post.user.profileImageUri }} style={styles.avatarImage} />
              ) : (
                <IconSymbol name="person.crop.circle" size={32} color={colors.primary} />
              )}
            </ThemedView>
            <ThemedView style={styles.userDetails}>
              <ThemedText style={[styles.displayName, { color: colors.text }]}>
                {post.user.displayName}
              </ThemedText>
              <ThemedText style={[styles.locationTime, { color: colors.text }]}>
                📍 {post.diveSpot.name} • {format(post.diveDetails.diveTimestamp, 'MMM d, h:mm a')}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <TouchableOpacity>
            <IconSymbol name="ellipsis" size={20} color={colors.text} />
          </TouchableOpacity>
        </ThemedView>

        {/* Main content */}
        <TouchableOpacity onPress={onPress} style={styles.mainContent}>
          <ThemedText style={[styles.diveTitle, { color: colors.text }]}>
            {post.diveSpot.name} Dive
          </ThemedText>
          
          {/* Key Stats Grid */}
          <ThemedView style={styles.statsGrid}>
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statLabel, { color: colors.text }]}>Depth</ThemedText>
              <ThemedText style={[styles.statValue, { color: colors.primary }]}>
                {post.diveDetails.depth}m
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statLabel, { color: colors.text }]}>Duration</ThemedText>
              <ThemedText style={[styles.statValue, { color: colors.primary }]}>
                {post.diveDetails.diveDuration}min
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statLabel, { color: colors.text }]}>Visibility</ThemedText>
              <ThemedText 
                style={[styles.statValue, { color: getVisibilityColor(post.diveDetails.visibilityQuality) }]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
              >
                {post.diveDetails.visibilityQuality === 'Excellent' ? 'Excel.' : 
                 post.diveDetails.visibilityQuality === 'Very Poor' ? 'V.Poor' : 
                 post.diveDetails.visibilityQuality}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statLabel, { color: colors.text }]}>Temp</ThemedText>
              <ThemedText style={[styles.statValue, { color: colors.primary }]}>
                {post.diveDetails.waterTemp}°C
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Achievement callout */}
          {post.diveDetails.seaLife && post.diveDetails.seaLife.length > 2 && (
            <ThemedView style={[styles.achievement, { backgroundColor: colors.overlay }]}>
              <IconSymbol name="pawprint" size={16} color={colors.like} />
              <ThemedText style={[styles.achievementText, { color: colors.text }]}>
                Spotted {post.diveDetails.seaLife.length} marine species!
              </ThemedText>
            </ThemedView>
          )}
        </TouchableOpacity>

        {/* Large Dive Images */}
        <TouchableOpacity onPress={onPress}>
          <Image 
            source={post.imageUris[0]} 
            style={styles.mainDiveImage}
            contentFit="cover"
          />
        </TouchableOpacity>

        {/* Social Actions */}
        <ThemedView style={styles.socialActions}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { backgroundColor: isLiked ? colors.overlay : 'transparent' }
            ]} 
            onPress={onLike}
            activeOpacity={0.7}
          >
            <IconSymbol 
              name={isLiked ? "heart.fill" : "heart"} 
              size={22} 
              color={isLiked ? colors.likeActive : colors.like} 
            />
            <ThemedText style={[styles.actionText, { color: colors.text }]}>
              {post.likes.length > 0 ? post.likes.length : ''} Like
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: 'transparent' }]} 
            onPress={onComment}
            activeOpacity={0.7}
          >
            <IconSymbol name="bubble.left" size={22} color={colors.comment} />
            <ThemedText style={[styles.actionText, { color: colors.text }]}>
              {post.comments.length > 0 ? post.comments.length : ''} Comment
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: 'transparent' }]} 
            onPress={onShare}
            activeOpacity={0.7}
          >
            <IconSymbol name="square.and.arrow.up" size={22} color={colors.share} />
            <ThemedText style={[styles.actionText, { color: colors.text }]}>Share</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 18,
    marginVertical: 12,
    borderRadius: 24,
    padding: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 14,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userDetails: {
    flex: 1,
  },
  displayName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 3,
  },
  locationTime: {
    fontSize: 13,
    opacity: 0.7,
  },
  mainContent: {
    marginBottom: 20,
  },
  diveTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statItem: {
    width: '25%',
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 8,
    marginBottom: 16,
  },
  achievementText: {
    fontSize: 13,
    fontWeight: '500',
  },
  mainDiveImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    marginBottom: 20,
  },
  socialActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
