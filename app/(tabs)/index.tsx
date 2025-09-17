import { CompactDiveCard } from '@/components/CompactDiveCard';
import { DetailedDivePost } from '@/components/DetailedDivePost';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUser } from '@/contexts/UserContext';
import { DivePost, User, DiveSpot } from '@/types';
import { divePostsService } from '@/services/divePostsService';
import { shareService } from '@/services/shareService';
import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dimensions, ScrollView, StyleSheet, Platform, ActivityIndicator, Alert, Modal, View, TextInput, TouchableOpacity, KeyboardAvoidingView, FlatList } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Transform API data to frontend format
const transformApiPost = (apiPost: any): DivePost => {
  return {
    id: apiPost.id,
    userId: apiPost.user_id,
    user: {
      id: apiPost.user.id,
      username: apiPost.user.username || apiPost.user.email.split('@')[0],
      email: apiPost.user.email,
      displayName: apiPost.user.display_name || apiPost.user.username || 'Diver',
      bio: apiPost.user.bio,
      profileImageUri: apiPost.user.profile_image_url,
      location: apiPost.user.location,
      stats: {
        totalDives: apiPost.user.total_dives || 0,
        maxDepth: apiPost.user.max_depth_achieved || 0,
        totalBottomTime: apiPost.user.total_bottom_time || 0,
        certificationLevel: apiPost.user.certification_level || 'Open Water',
        favoriteSpot: apiPost.dive_spot?.name,
      },
      createdAt: new Date(apiPost.user.created_at || new Date()),
    },
    diveSpot: {
      id: apiPost.dive_spot.id,
      name: apiPost.dive_spot.name,
      description: apiPost.dive_spot.description,
      coordinates: {
        latitude: apiPost.dive_spot.latitude,
        longitude: apiPost.dive_spot.longitude,
      },
      address: apiPost.dive_spot.address,
      maxDepth: apiPost.dive_spot.max_depth,
      difficulty: (apiPost.dive_spot.difficulty || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
      waterType: (apiPost.dive_spot.water_type || 'Salt') as 'Salt' | 'Fresh' | 'Brackish',
      visibility: apiPost.dive_spot.avg_visibility,
      temperature: apiPost.dive_spot.avg_temperature,
      createdBy: apiPost.dive_spot.created_by,
      createdAt: new Date(apiPost.dive_spot.created_at || new Date()),
    },
    imageUris: apiPost.image_urls || [],
    caption: apiPost.caption,
    diveDetails: {
      date: new Date(apiPost.dive_date),
      depth: apiPost.max_depth,
      diveDuration: apiPost.dive_duration,
      visibilityQuality: apiPost.visibility_quality as 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor',
      waterTemp: apiPost.water_temp,
      windConditions: apiPost.wind_conditions as 'Calm' | 'Light' | 'Moderate' | 'Strong' | 'Very Strong',
      currentConditions: apiPost.current_conditions as 'None' | 'Light' | 'Moderate' | 'Strong' | 'Very Strong',
      seaLife: apiPost.sea_life || [],
      buddyNames: apiPost.buddy_names || [],
      equipment: apiPost.equipment || [],
      notes: apiPost.notes,
       diveTimestamp: new Date(apiPost.created_at),
    },
    likes: Array.from({ length: apiPost.likes_count || 0 }, (_, i) => ({
      userId: `user-${i}`, // Placeholder - in real app we'd get actual like data
      createdAt: new Date(),
    })),
    comments: Array.from({ length: apiPost.comments_count || 0 }, (_, i) => ({
      id: `comment-${i}`,
      userId: `user-${i}`,
      content: `Comment ${i}`,
      createdAt: new Date(),
    })),
    createdAt: new Date(apiPost.created_at),
  };
};

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
  const { user } = useUser();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<DivePost | null>(null);
  const [showDetailedPost, setShowDetailedPost] = useState(false);
  const [posts, setPosts] = useState<DivePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Comment modal state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<DivePost | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const colors = Colors[colorScheme ?? 'light'];

  // Load feed data on component mount
  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading feed data...');
      
      // Get feed data from API
      const feedData = await divePostsService.getFeed();
      console.log('Feed data loaded:', feedData);
      
      // Transform API data to frontend format
      const transformedPosts = feedData.data.map(transformApiPost);
      
      // If no real posts, fall back to mock data for demo
      if (transformedPosts.length === 0) {
        console.log('No real posts found, using mock data');
        setPosts(mockPosts);
      } else {
        console.log('Using real posts:', transformedPosts.length);
        setPosts(transformedPosts);
      }
      
    } catch (err) {
      console.error('Failed to load feed data:', err);
      setError('Failed to load posts');
      // Fallback to mock data if API fails
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    // Must be logged in to like posts
    if (!user?.id) {
      Alert.alert('Login Required', 'Please log in to like posts');
      return;
    }

    const isCurrentlyLiked = likedPosts.has(postId);
    
    // Optimistic update - update UI immediately
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    // Update like count in posts immediately
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: isCurrentlyLiked 
            ? post.likes.filter(like => like.userId !== user.id)
            : [...post.likes, { userId: user.id, createdAt: new Date() }] 
          }
        : post
    ));

    try {
      // Make API call
      if (isCurrentlyLiked) {
        await divePostsService.unlikePost(postId, user.id);
        console.log('✅ Post unliked successfully');
      } else {
        await divePostsService.likePost(postId, user.id);
        console.log('✅ Post liked successfully');
      }
    } catch (error: any) {
      // Revert optimistic update on error
      console.error('Failed to toggle like:', error);
      
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(postId); // Re-add the like
        } else {
          newSet.delete(postId); // Remove the like
        }
        return newSet;
      });

      // Revert like count in posts
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: isCurrentlyLiked 
              ? [...post.likes, { userId: user.id, createdAt: new Date() }]
              : post.likes.filter(like => like.userId !== user.id)
            }
          : post
      ));

      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handlePostPress = (post: DivePost) => {
    setSelectedPost(post);
    setShowDetailedPost(true);
  };

  const handleCloseDetailedPost = () => {
    setShowDetailedPost(false);
    setSelectedPost(null);
  };

  const handleComment = async (post: DivePost) => {
    if (!user?.id) {
      Alert.alert('Login Required', 'Please log in to view and add comments');
      return;
    }

    setSelectedPostForComments(post);
    setShowCommentModal(true);
    
    // Load comments for this post
    await loadComments(post.id);
  };

  const loadComments = async (postId: string) => {
    try {
      setLoadingComments(true);
      const response = await divePostsService.getComments(postId);
      setComments(response.data);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!user?.id || !selectedPostForComments || !commentText.trim()) {
      return;
    }

    try {
      setSubmittingComment(true);
      await divePostsService.createComment(selectedPostForComments.id, user.id, commentText.trim());
      
      // Clear comment text
      setCommentText('');
      
      // Reload comments
      await loadComments(selectedPostForComments.id);
      
      // Update the post's comment count in the UI
      setPosts(prev => prev.map(post => 
        post.id === selectedPostForComments.id 
          ? { ...post, comments: [...post.comments, { userId: user.id, createdAt: new Date() }] }
          : post
      ));
      
    } catch (error: any) {
      console.error('Failed to submit comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setSelectedPostForComments(null);
    setComments([]);
    setCommentText('');
  };

  const handleShare = async (post: DivePost) => {
    try {
      const success = await shareService.shareDivePost(post);
      if (success) {
        console.log('Post shared successfully!');
        // Optionally add an analytics event here
      }
    } catch (error) {
      console.error('Failed to share post:', error);
    }
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

      {/* Loading state */}
      {loading && (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Loading dive posts...</ThemedText>
        </ThemedView>
      )}

      {/* Error state */}
      {error && !loading && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
          <ThemedText style={styles.errorSubText}>Showing sample posts for now</ThemedText>
        </ThemedView>
      )}

      {/* Posts */}
      {!loading && posts.map((post) => (
        <CompactDiveCard
          key={post.id}
          post={post}
          isLiked={likedPosts.has(post.id)}
          onLike={() => toggleLike(post.id)}
          onComment={() => handleComment(post)}
          onShare={() => handleShare(post)}
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
          onComment={() => selectedPost && handleComment(selectedPost)}
          onShare={() => selectedPost && handleShare(selectedPost)}
        />
      )}

      <ThemedView style={[styles.endMessage, styles.lastMessage]}>
        <ThemedText style={styles.endText}>
          🌊 You&apos;re all caught up! Time for another dive? 🤿
        </ThemedText>
      </ThemedView>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCommentModal}
      >
        <KeyboardAvoidingView 
          style={[styles.commentModal, { backgroundColor: colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Modal Header */}
          <View style={[styles.commentHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={closeCommentModal} style={styles.closeButton}>
              <ThemedText style={[styles.closeButtonText, { color: colors.primary }]}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.commentTitle, { color: colors.text }]}>Comments</ThemedText>
            <View style={styles.closeButton} />
          </View>

          {/* Comments List */}
          <View style={styles.commentsContainer}>
            {loadingComments ? (
              <View style={styles.loadingComments}>
                <ActivityIndicator size="small" color={colors.primary} />
                <ThemedText style={[styles.loadingText, { color: colors.text }]}>Loading comments...</ThemedText>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.noComments}>
                <ThemedText style={[styles.noCommentsText, { color: colors.text }]}>
                  💬 Be the first to comment on this dive!
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: comment }) => (
                  <View style={[styles.commentItem, { borderBottomColor: colors.border }]}>
                    <View style={styles.commentContent}>
                      <ThemedText style={[styles.commentUser, { color: colors.primary }]}>
                        User #{comment.user_id.slice(-4)}
                      </ThemedText>
                      <ThemedText style={[styles.commentText, { color: colors.text }]}>
                        {comment.content}
                      </ThemedText>
                      <ThemedText style={[styles.commentTime, { color: colors.text }]}>
                        {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                      </ThemedText>
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          {/* Add Comment Input */}
          <View style={[
            styles.commentInputContainer, 
            { 
              borderTopColor: colors.border, 
              backgroundColor: colors.background,
              paddingBottom: 80, // Extra padding for Android
            }
          ]}>
            <TextInput
              style={[styles.commentInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.text + '80'}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                { 
                  backgroundColor: commentText.trim() ? colors.primary : colors.border,
                  opacity: submittingComment ? 0.7 : 1
                }
              ]}
              onPress={submitComment}
              disabled={!commentText.trim() || submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText style={styles.sendButtonText}>Post</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  // Comment Modal Styles
  commentModal: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 60,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },
  commentTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    minHeight: 70,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    minHeight: 44,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 50,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});


