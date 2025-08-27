import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { userService } from '@/services/userService';
import ProfileEditModal from '@/components/ProfileEditModal';

import { useProfileImagePicker } from '@/components/ProfileImagePicker';
import { User } from '@/types';



export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const { 
    user, 
    userPosts, 
    isLoading, 
    updateProfile, 
    updateProfileImage,
    fetchUserPosts,
    refreshUserData 
  } = useUser();

  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  // Profile image picker
  const { showImagePicker } = useProfileImagePicker({
    onImageSelected: async (uri: string) => {
      await updateProfileImage(uri);
    },
    onError: (error: string) => {
      console.error('Image picker error:', error);
    },
  });

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshUserData(),
      fetchUserPosts(),
    ]);
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (updatedUser: Partial<User>) => {
    await updateProfile(updatedUser);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getAchievements = () => {
    if (!user) return [];
    return userService.calculateAchievements(user, userPosts);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  const renderHeader = () => {
    if (!user) return null;
    
    return (
      <>
        {/* Profile Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.profileImageContainer}>
            <Image
              source={
                user.profileImageUri 
                  ? { uri: user.profileImageUri }
                  : require('@/assets/images/adaptive-icon.png')
              }
              style={styles.profileImage}
            />
            <TouchableOpacity 
              style={[styles.editImageButton, { backgroundColor: colors.primary }]}
              onPress={showImagePicker}
            >
              <IconSymbol name="camera.fill" size={16} color="white" />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedText type="title" style={styles.displayName}>
            {user.displayName}
          </ThemedText>
          <ThemedText style={styles.username}>
            @{user.username}
          </ThemedText>
          
          {user.bio && (
            <ThemedText style={styles.bio}>
              {user.bio}
            </ThemedText>
          )}
          
          {user.location && (
            <ThemedView style={styles.locationContainer}>
              <IconSymbol name="location" size={16} color={colors.primary} />
              <ThemedText style={styles.location}>
                📍 {user.location}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Diving Statistics */}
        <ThemedView style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('stats')}
            activeOpacity={0.7}
          >
            <IconSymbol name="chart.bar" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
              Diving Statistics
            </ThemedText>
            <IconSymbol 
              name={expandedSections.stats ? "chevron.up" : "chevron.down"} 
              size={16} 
              color={colors.text} 
            />
          </TouchableOpacity>
          
          {expandedSections.stats && (
            <ThemedView style={styles.expandedContent}>
              <ThemedView style={styles.statRow}>
                <ThemedView style={styles.statLeft}>
                  <IconSymbol name="list.number" size={18} color={colors.primary} />
                  <ThemedText style={styles.statRowLabel}>Total Dives</ThemedText>
                </ThemedView>
                <ThemedText style={[styles.statRowValue, { color: colors.primary }]}>
                  {user.stats.totalDives}
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.statRow}>
                <ThemedView style={styles.statLeft}>
                  <IconSymbol name="arrow.down" size={18} color={colors.secondary} />
                  <ThemedText style={styles.statRowLabel}>Max Depth</ThemedText>
                </ThemedView>
                <ThemedText style={[styles.statRowValue, { color: colors.secondary }]}>
                  {user.stats.maxDepth}m
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.statRow}>
                <ThemedView style={styles.statLeft}>
                  <IconSymbol name="clock" size={18} color={colors.accent} />
                  <ThemedText style={styles.statRowLabel}>Bottom Time</ThemedText>
                </ThemedView>
                <ThemedText style={[styles.statRowValue, { color: colors.accent }]}>
                  {formatTime(user.stats.totalBottomTime)}
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.statRow}>
                <ThemedView style={styles.statLeft}>
                  <IconSymbol name="graduationcap" size={18} color={colors.success} />
                  <ThemedText style={styles.statRowLabel}>Certification</ThemedText>
                </ThemedView>
                <ThemedText style={[styles.statRowValue, { color: colors.success }]}>
                  {user.stats.certificationLevel}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>

        {/* Favorite Dive Spot */}
        {user.stats.favoriteSpot && (
          <ThemedView style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('favorite')}
              activeOpacity={0.7}
            >
              <IconSymbol name="heart" size={18} color={colors.error} />
              <ThemedText style={[styles.sectionTitle, { color: colors.error }]}>
                Favorite Dive Spot
              </ThemedText>
              <IconSymbol 
                name={expandedSections.favorite ? "chevron.up" : "chevron.down"} 
                size={16} 
                color={colors.text} 
              />
            </TouchableOpacity>
            
            {expandedSections.favorite && (
              <ThemedView style={styles.expandedContent}>
                <ThemedView style={styles.statRow}>
                  <ThemedView style={styles.statLeft}>
                    <IconSymbol name="location.magnifyingglass" size={18} color={colors.secondary} />
                    <ThemedText style={styles.statRowLabel}>Location</ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.statRowValue, { color: colors.text }]}>
                    {user.stats.favoriteSpot}
                  </ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.statRow}>
                  <ThemedView style={styles.statLeft}>
                    <IconSymbol name="trophy" size={18} color={colors.warning} />
                    <ThemedText style={styles.statRowLabel}>Status</ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.statRowValue, { color: colors.warning }]}>
                    Most Visited
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>
        )}

        {/* Achievements */}
        <ThemedView style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('achievements')}
            activeOpacity={0.7}
          >
            <IconSymbol name="trophy.fill" size={18} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
              Achievements ({getAchievements().length})
            </ThemedText>
            <IconSymbol 
              name={expandedSections.achievements ? "chevron.up" : "chevron.down"} 
              size={16} 
              color={colors.text} 
            />
          </TouchableOpacity>
          
          {expandedSections.achievements && (
            <ThemedView style={styles.expandedContent}>
              {getAchievements().length > 0 ? (
                getAchievements().map((achievement, index) => (
                  <ThemedView key={index} style={styles.statRow}>
                    <ThemedView style={styles.statLeft}>
                      <IconSymbol name="checkmark.circle" size={18} color={colors.success} />
                      <ThemedText style={styles.statRowLabel}>{achievement}</ThemedText>
                    </ThemedView>
                    <IconSymbol name="trophy" size={16} color={colors.warning} />
                  </ThemedView>
                ))
              ) : (
                <ThemedView style={styles.statRow}>
                  <ThemedView style={styles.statLeft}>
                    <IconSymbol name="star" size={18} color={colors.text + '40'} />
                    <ThemedText style={styles.statRowLabel}>No achievements yet</ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.statRowValue, { opacity: 0.6 }]}>
                    Keep diving!
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          )}
        </ThemedView>

        {/* My Dive Posts */}
        <ThemedView style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('posts')}
            activeOpacity={0.7}
          >
            <IconSymbol name="photo.stack" size={18} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
              My Dive Posts ({userPosts.length})
            </ThemedText>
            <IconSymbol 
              name={expandedSections.posts ? "chevron.up" : "chevron.down"} 
              size={16} 
              color={colors.text} 
            />
          </TouchableOpacity>
          
          {expandedSections.posts && (
            <ThemedView style={styles.expandedContent}>
              <ThemedView style={styles.statRow}>
                <ThemedView style={styles.statLeft}>
                  <IconSymbol name="photo" size={18} color={colors.accent} />
                  <ThemedText style={styles.statRowLabel}>Total Posts</ThemedText>
                </ThemedView>
                <ThemedText style={[styles.statRowValue, { color: colors.accent }]}>
                  {userPosts.length}
                </ThemedText>
              </ThemedView>
              
              {userPosts.length > 0 && (
                <ThemedView style={styles.statRow}>
                  <ThemedView style={styles.statLeft}>
                    <IconSymbol name="calendar" size={18} color={colors.secondary} />
                    <ThemedText style={styles.statRowLabel}>Latest Post</ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.statRowValue, { color: colors.secondary }]}>
                    {userPosts[0].createdAt.toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          )}
        </ThemedView>

        {/* Edit Profile Button */}
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={handleEditProfile}
        >
          <IconSymbol name="pencil" size={20} color="white" />
          <ThemedText style={styles.editButtonText}>
            Edit Profile
          </ThemedText>
        </TouchableOpacity>
      </>
    );
  };



  if (!user) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ThemedText>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderHeader()}
      </ScrollView>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        visible={showEditModal}
        user={user}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        onImagePick={showImagePicker}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: 100, // Extra space for tab bar and visual breathing room
  },


  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 50,
    paddingBottom: 32,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  displayName: {
    marginBottom: 8,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  username: {
    opacity: 0.8,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  bio: {
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 24,
    lineHeight: 22,
    fontSize: 16,
    opacity: 0.9,
    fontWeight: '400',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  location: {
    opacity: 0.85,
    fontSize: 15,
    fontWeight: '500',
  },

  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 0,
  },
  expandedContent: {
    paddingLeft: 8,
    paddingBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderRadius: 8,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statRowLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statRowValue: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },

  placeholder: {
    fontStyle: 'italic',
    opacity: 0.6,
    textAlign: 'center',
    padding: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
    padding: 18,
    borderRadius: 16,
    gap: 10,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
