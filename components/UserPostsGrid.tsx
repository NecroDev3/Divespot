import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { DivePost } from '@/types';
import { DetailedDivePost } from './DetailedDivePost';

interface UserPostsGridProps {
  posts: DivePost[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const numColumns = 3;
const spacing = 2;
const itemSize = (screenWidth - spacing * (numColumns + 1)) / numColumns;

export default function UserPostsGrid({ 
  posts, 
  onRefresh, 
  refreshing = false 
}: UserPostsGridProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [selectedPost, setSelectedPost] = useState<DivePost | null>(null);
  const [showDetailedPost, setShowDetailedPost] = useState(false);

  const handlePostPress = (post: DivePost) => {
    setSelectedPost(post);
    setShowDetailedPost(true);
  };

  const handleCloseDetailedPost = () => {
    setShowDetailedPost(false);
    setSelectedPost(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'Excellent': return '#22C55E';
      case 'Good': return '#84CC16';
      case 'Fair': return '#F59E0B';
      case 'Poor': return '#F97316';
      case 'Very Poor': return '#EF4444';
      default: return colors.text;
    }
  };

  const renderPost = ({ item: post }: { item: DivePost }) => (
    <TouchableOpacity
      style={[styles.postItem, { backgroundColor: colors.surface }]}
      onPress={() => handlePostPress(post)}
      activeOpacity={0.8}
    >
      <Image
        source={
          post.imageUris.length > 0
            ? typeof post.imageUris[0] === 'string'
              ? { uri: post.imageUris[0] }
              : post.imageUris[0]
            : require('@/assets/images/react-logo.png')
        }
        style={styles.postImage}
        contentFit="cover"
      />
      
      {/* Post overlay with basic info */}
      <ThemedView style={styles.postOverlay}>
        <ThemedView style={styles.postStats}>
          <ThemedView style={styles.postStat}>
            <IconSymbol name="arrow.down" size={12} color="white" />
            <ThemedText style={styles.postStatText}>
              {post.diveDetails.depth}m
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.postStat}>
            <IconSymbol name="clock" size={12} color="white" />
            <ThemedText style={styles.postStatText}>
              {post.diveDetails.diveDuration}min
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.postLocation}>
          <ThemedText style={styles.postLocationText} numberOfLines={1}>
            {post.diveSpot.name}
          </ThemedText>
          <ThemedText style={styles.postDate}>
            {formatDate(post.createdAt)}
          </ThemedText>
        </ThemedView>

        {/* Visibility indicator */}
        <ThemedView 
          style={[
            styles.visibilityIndicator, 
            { backgroundColor: getVisibilityColor(post.diveDetails.visibilityQuality) }
          ]} 
        />
      </ThemedView>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedView style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
        <IconSymbol name="photo.stack" size={40} color={colors.text + '40'} />
      </ThemedView>
      <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
        No Dive Posts Yet
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Start sharing your underwater adventures! Tap the + button to add your first dive post.
      </ThemedText>
      
      {onRefresh && (
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          onPress={onRefresh}
        >
          <IconSymbol name="arrow.clockwise" size={20} color="white" />
          <ThemedText style={styles.refreshButtonText}>
            Refresh
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );

  return (
    <>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.container}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
      />

      {/* Detailed Post Modal */}
      {selectedPost && (
        <DetailedDivePost
          visible={showDetailedPost}
          post={selectedPost}
          onClose={handleCloseDetailedPost}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  separator: {
    height: spacing,
  },
  postItem: {
    width: itemSize,
    height: itemSize,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  postStatText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  postLocation: {
    marginBottom: 2,
  },
  postLocationText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  postDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 9,
  },
  visibilityIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
