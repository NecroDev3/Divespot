import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { DivePost } from '../types';
import { DiveStatsCard } from './DiveStatsCard';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DetailedDivePostProps {
  post: DivePost;
  isVisible: boolean;
  isLiked: boolean;
  onClose: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export const DetailedDivePost: React.FC<DetailedDivePostProps> = ({
  post,
  isVisible,
  isLiked,
  onClose,
  onLike,
  onComment,
  onShare,
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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Calm': case 'None': return colors.success;
      case 'Light': return colors.primary;
      case 'Moderate': return colors.secondary;
      case 'Strong': return colors.warning;
      case 'Very Strong': return colors.error;
      default: return colors.text;
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <ThemedView style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Dive Details</ThemedText>
          <View style={styles.placeholder} />
        </ThemedView>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <ThemedView style={styles.userSection}>
            <ThemedView style={styles.userInfo}>
              {post.user.profileImageUri ? (
                <Image source={{ uri: post.user.profileImageUri }} style={styles.userAvatar} />
              ) : (
                <ThemedView style={[styles.userAvatar, { backgroundColor: colors.overlay }]}>
                  <IconSymbol name="person.crop.circle" size={32} color={colors.primary} />
                </ThemedView>
              )}
              <ThemedView style={styles.userText}>
                <ThemedText style={[styles.userName, { color: colors.text }]}>
                  {post.user.displayName}
                </ThemedText>
                <ThemedText style={[styles.userLocation, { color: colors.text }]}>
                  📍 {format(post.diveDetails.diveTimestamp, 'PPP')} • {format(post.diveDetails.diveTimestamp, 'p')}
                </ThemedText>
                <ThemedText style={[styles.diveLocation, { color: colors.secondary }]}>
                  {post.diveSpot.address || post.diveSpot.name}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <TouchableOpacity>
              <IconSymbol name="ellipsis" size={24} color={colors.text} />
            </TouchableOpacity>
          </ThemedView>

          {/* Main Title */}
          <ThemedView style={styles.titleSection}>
            <ThemedText style={[styles.diveTitle, { color: colors.text }]}>
              {post.diveSpot.name} Dive
            </ThemedText>
          </ThemedView>

          {/* Key Stats Grid - Fitness App Style */}
          <ThemedView style={styles.keyStatsSection}>
            <ThemedView style={styles.keyStatsGrid}>
              <ThemedView style={styles.keyStatItem}>
                <ThemedText style={[styles.keyStatLabel, { color: colors.text }]}>Max Depth</ThemedText>
                <ThemedText style={[styles.keyStatValue, { color: colors.primary }]}>
                  {post.diveDetails.depth} m
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.keyStatItem}>
                <ThemedText style={[styles.keyStatLabel, { color: colors.text }]}>Duration</ThemedText>
                <ThemedText style={[styles.keyStatValue, { color: colors.primary }]}>
                  {Math.floor(post.diveDetails.diveDuration / 60) > 0 
                    ? `${Math.floor(post.diveDetails.diveDuration / 60)}h ${post.diveDetails.diveDuration % 60}m`
                    : `${post.diveDetails.diveDuration}m`
                  }
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.keyStatItem}>
                <ThemedText style={[styles.keyStatLabel, { color: colors.text }]}>Visibility</ThemedText>
                <ThemedText style={[styles.keyStatValue, { color: getVisibilityColor(post.diveDetails.visibilityQuality) }]}>
                  {post.diveDetails.visibilityQuality}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.keyStatItem}>
                <ThemedText style={[styles.keyStatLabel, { color: colors.text }]}>Water Temp</ThemedText>
                <ThemedText style={[styles.keyStatValue, { color: colors.primary }]}>
                  {post.diveDetails.waterTemp}°C
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Achievement Banner */}
            {post.diveDetails.seaLife && post.diveDetails.seaLife.length > 3 && (
              <ThemedView style={[styles.achievementBanner, { backgroundColor: colors.overlay }]}>
                <IconSymbol name="star.circle" size={20} color={colors.like} />
                <ThemedText style={[styles.achievementText, { color: colors.text }]}>
                  Amazing dive! Spotted {post.diveDetails.seaLife.length} different marine species
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          {/* Dive Image */}
          <ThemedView style={styles.imageSection}>
            <Image 
              source={post.imageUris[0]} 
              style={styles.diveImage}
              contentFit="cover"
            />
          </ThemedView>

          {/* Detailed Conditions */}
          <ThemedView style={styles.conditionsSection}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Dive Conditions
            </ThemedText>
            <ThemedView style={styles.conditionsGrid}>
              <ThemedView style={styles.conditionItem}>
                <IconSymbol name="wind" size={20} color={getConditionColor(post.diveDetails.windConditions)} />
                <ThemedText style={[styles.conditionLabel, { color: colors.text }]}>Wind</ThemedText>
                <ThemedText style={[styles.conditionValue, { color: getConditionColor(post.diveDetails.windConditions) }]}>
                  {post.diveDetails.windConditions}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.conditionItem}>
                <IconSymbol name="water.waves" size={20} color={getConditionColor(post.diveDetails.currentConditions)} />
                <ThemedText style={[styles.conditionLabel, { color: colors.text }]}>Current</ThemedText>
                <ThemedText style={[styles.conditionValue, { color: getConditionColor(post.diveDetails.currentConditions) }]}>
                  {post.diveDetails.currentConditions}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Marine Life & Buddies */}
          {(post.diveDetails.seaLife?.length || post.diveDetails.buddyNames?.length) && (
            <ThemedView style={styles.detailsSection}>
              {post.diveDetails.seaLife && post.diveDetails.seaLife.length > 0 && (
                <ThemedView style={styles.detailItem}>
                  <ThemedText style={[styles.detailTitle, { color: colors.like }]}>
                    🐟 Marine Life Spotted
                  </ThemedText>
                  <ThemedView style={styles.tagContainer}>
                    {post.diveDetails.seaLife.map((species, index) => (
                      <ThemedView key={index} style={[styles.tag, { backgroundColor: colors.overlay }]}>
                        <ThemedText style={[styles.tagText, { color: colors.text }]}>
                          {species}
                        </ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                </ThemedView>
              )}

              {post.diveDetails.buddyNames && post.diveDetails.buddyNames.length > 0 && (
                <ThemedView style={styles.detailItem}>
                  <ThemedText style={[styles.detailTitle, { color: colors.accent }]}>
                    👥 Dive Buddies
                  </ThemedText>
                  <ThemedText style={[styles.detailText, { color: colors.text }]}>
                    {post.diveDetails.buddyNames.join(', ')}
                  </ThemedText>
                </ThemedView>
              )}

              {post.caption && (
                <ThemedView style={styles.detailItem}>
                  <ThemedText style={[styles.detailTitle, { color: colors.secondary }]}>
                    💭 Notes
                  </ThemedText>
                  <ThemedText style={[styles.detailText, { color: colors.text }]}>
                    {post.caption}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          )}

          {/* Social Actions */}
          <ThemedView style={[styles.socialSection, { backgroundColor: colors.surface }]}>
            <ThemedView style={styles.socialStats}>
              <ThemedText style={[styles.socialStatsText, { color: colors.text }]}>
                {post.likes.length > 0 && `${post.likes.length} ${post.likes.length === 1 ? 'like' : 'likes'}`}
                {post.likes.length > 0 && post.comments.length > 0 && ' • '}
                {post.comments.length > 0 && `${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}`}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.socialActions}>
              <TouchableOpacity style={styles.socialButton} onPress={onLike}>
                <IconSymbol 
                  name={isLiked ? "heart.fill" : "heart"} 
                  size={24} 
                  color={isLiked ? colors.likeActive : colors.like} 
                />
                <ThemedText style={[styles.socialButtonText, { color: colors.text }]}>
                  Like
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton} onPress={onComment}>
                <IconSymbol name="bubble.left" size={24} color={colors.comment} />
                <ThemedText style={[styles.socialButtonText, { color: colors.text }]}>
                  Comment
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton} onPress={onShare}>
                <IconSymbol name="square.and.arrow.up" size={24} color={colors.share} />
                <ThemedText style={[styles.socialButtonText, { color: colors.text }]}>
                  Share
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  diveLocation: {
    fontSize: 12,
    opacity: 0.7,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  diveTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  keyStatsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  keyStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keyStatItem: {
    width: '48%',
    marginBottom: 16,
  },
  keyStatLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  keyStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  achievementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  imageSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  diveImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
  },
  conditionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  conditionsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  conditionItem: {
    alignItems: 'center',
    flex: 1,
  },
  conditionLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 4,
  },
  conditionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  detailItem: {
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  socialSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  socialStats: {
    marginBottom: 16,
  },
  socialStatsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  socialActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});
