import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Mock user data - will be replaced with real data later
  const mockUser = {
    displayName: 'Diver Mike',
    username: '@divermike',
    bio: 'PADI Advanced Open Water | Underwater photographer | Exploring the depths 🌊',
    location: 'Maldives',
    stats: {
      totalDives: 127,
      maxDepth: 42,
      totalBottomTime: 3840, // in minutes
      certificationLevel: 'Advanced Open Water',
      favoriteSpot: 'Great Blue Hole',
    },
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.header}>
        <ThemedView style={styles.profileImageContainer}>
          <Image
            source={require('@/assets/images/adaptive-icon.png')}
            style={styles.profileImage}
          />
          <TouchableOpacity style={[styles.editImageButton, { backgroundColor: colors.primary }]}>
            <IconSymbol name="camera.fill" size={16} color="white" />
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedText type="title" style={styles.displayName}>
          {mockUser.displayName}
        </ThemedText>
        <ThemedText style={styles.username}>
          {mockUser.username}
        </ThemedText>
        
        <ThemedText style={styles.bio}>
          {mockUser.bio}
        </ThemedText>
        
        <ThemedView style={styles.locationContainer}>
          <IconSymbol name="location" size={16} color={colors.primary} />
          <ThemedText style={styles.location}>
            🌍 {mockUser.location}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={[styles.statsContainer, { backgroundColor: colors.overlay }]}>
        <ThemedView style={styles.statsHeader}>
          <IconSymbol name="chart.bar" size={20} color={colors.primary} />
          <ThemedText type="subtitle" style={[styles.statsTitle, { color: colors.primary }]}>
            Diving Statistics
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statsGrid}>
          <ThemedView style={styles.statItem}>
            <ThemedView style={styles.statIconContainer}>
              <IconSymbol name="list.number" size={18} color={colors.primary} />
            </ThemedView>
            <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
              {mockUser.stats.totalDives}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Total Dives
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statItem}>
            <ThemedView style={styles.statIconContainer}>
              <IconSymbol name="arrow.down" size={18} color={colors.secondary} />
            </ThemedView>
            <ThemedText style={[styles.statNumber, { color: colors.secondary }]}>
              {mockUser.stats.maxDepth}m
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Max Depth
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statItem}>
            <ThemedView style={styles.statIconContainer}>
              <IconSymbol name="clock" size={18} color={colors.accent} />
            </ThemedView>
            <ThemedText style={[styles.statNumber, { color: colors.accent }]}>
              {formatTime(mockUser.stats.totalBottomTime)}
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Bottom Time
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statItem}>
            <ThemedView style={styles.statIconContainer}>
              <IconSymbol name="graduationcap" size={18} color={colors.success} />
            </ThemedView>
            <ThemedText style={[styles.statNumber, { color: colors.success }]}>
              PADI AOW
            </ThemedText>
            <ThemedText style={styles.statLabel}>
              Certification
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <IconSymbol name="heart" size={18} color={colors.error} />
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Favorite Dive Spot
          </ThemedText>
        </ThemedView>
        <ThemedView style={[styles.favoriteSpot, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <ThemedView style={styles.favoriteSpotIconContainer}>
            <IconSymbol name="location.magnifyingglass" size={24} color={colors.secondary} />
          </ThemedView>
          <ThemedView style={styles.favoriteSpotContent}>
            <ThemedText style={[styles.favoriteSpotText, { color: colors.text }]}>
              {mockUser.stats.favoriteSpot}
            </ThemedText>
            <ThemedView style={styles.favoriteSpotBadge}>
              <IconSymbol name="trophy" size={14} color={colors.warning} />
              <ThemedText style={[styles.favoriteSpotBadgeText, { color: colors.warning }]}>
                Favorite
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <IconSymbol name="photo.stack" size={18} color={colors.primary} />
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            My Dive Posts
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.placeholder}>
          🚧 Your dive posts will appear here once the feed functionality is implemented
        </ThemedText>
      </ThemedView>

      <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]}>
        <IconSymbol name="pencil" size={20} color="white" />
        <ThemedText style={styles.editButtonText}>
          ✏️ Edit Profile
        </ThemedText>
      </TouchableOpacity>
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
    alignItems: 'center',
    padding: 24,
    paddingTop: 50,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    marginBottom: 6,
    fontSize: 28,
    fontWeight: '700',
  },
  username: {
    opacity: 0.6,
    marginBottom: 16,
    fontSize: 16,
  },
  bio: {
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
    lineHeight: 20,
    fontSize: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  location: {
    opacity: 0.7,
    fontSize: 15,
  },
  statsContainer: {
    margin: 20,
    padding: 22,
    borderRadius: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  statsTitle: {
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  favoriteSpot: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
  },
  favoriteSpotIconContainer: {
    marginRight: 16,
  },
  favoriteSpotContent: {
    flex: 1,
  },
  favoriteSpotText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  favoriteSpotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  favoriteSpotBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 20,
    marginBottom: 40,
    padding: 18,
    borderRadius: 12,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
