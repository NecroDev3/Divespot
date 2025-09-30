import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Cape Town dive spots data
const popularDiveSpots = [
  {
    id: '1',
    name: 'Seal Island',
    location: 'False Bay, Cape Town',
    difficulty: 'Intermediate' as const,
    maxDepth: 25,
    waterType: 'Salt' as const,
    visibility: 10,
    description: 'Famous for Great White shark cage diving and seal colonies',
    imageUri: require('@/assets/images/ds1.jpg'),
  },
  {
    id: '2', 
    name: 'Two Oceans Aquarium',
    location: 'V&A Waterfront, Cape Town',
    difficulty: 'Beginner' as const,
    maxDepth: 12,
    waterType: 'Salt' as const,
    visibility: 15,
    description: 'Perfect for beginners with excellent visibility and diverse marine life',
    imageUri: require('@/assets/images/ds2.jpg'),
  },
  {
    id: '3',
    name: 'Atlantis Reef',
    location: 'Atlantic Seaboard, Cape Town',
    difficulty: 'Intermediate' as const,
    maxDepth: 20,
    waterType: 'Salt' as const,
    visibility: 12,
    description: 'Pristine reef system with incredible kelp forests',
    imageUri: require('@/assets/images/ds3.jpg'),
  },
  {
    id: '4',
    name: 'Castle Rock',
    location: 'Cape Peninsula, Cape Town',
    difficulty: 'Advanced' as const,
    maxDepth: 30,
    waterType: 'Salt' as const,
    visibility: 8,
    description: 'Dramatic underwater topography with caves and swim-throughs',
    imageUri: require('@/assets/images/ds4.jpg'),
  },
];

const categories = [
  { name: 'Wrecks', icon: 'sailboat', count: 1245 },
  { name: 'Reefs', icon: 'leaf', count: 3567 },
  { name: 'Caves', icon: 'mountain.2', count: 892 },
  { name: 'Wall Diving', icon: 'square.stack.3d.down.forward', count: 654 },
];

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return colors.success;
      case 'Intermediate': return colors.warning;
      case 'Advanced': return colors.error;
      default: return colors.primary;
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={[styles.header, { backgroundColor: colors.background }]}>
        <ThemedText type="title" style={{ color: colors.primary }}>Cape Town DiveSpots</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.like}]}>
          Discover the Mother City&apos;s underwater wonders 🦭🦈
        </ThemedText>
      </ThemedView>

      {/* Preview Banner */}
      <ThemedView style={[styles.previewBanner, { borderColor: colors.warning }]}>
        <IconSymbol 
          name="exclamationmark.triangle" 
          size={20} 
          color={colors.warning} 
        />
        <ThemedView style={styles.previewTextContainer}>
          <ThemedText style={[styles.previewTitle, { color: colors.warning }]}>
            Feature Preview
          </ThemedText>
          <ThemedText style={[styles.previewSubtitle, { color: colors.text }]}>
            This explore feature is currently in development. Stay tuned for the full experience!
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Search Bar */}
      <ThemedView style={styles.searchContainer}>
        <TouchableOpacity style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol 
            name="magnifyingglass" 
            size={20} 
            color={colors.primary} 
          />
          <ThemedText style={[styles.searchPlaceholder, { color: colors.text }]}>
            Search dive spots, locations...
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Categories */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Browse by Category
        </ThemedText>
        <ThemedView style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity key={category.name} style={[styles.categoryItem, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <IconSymbol 
                name={category.icon as any} 
                size={32} 
                color={colors.primary} 
              />
              <ThemedText style={styles.categoryName}>
                {category.name}
              </ThemedText>
              <ThemedText style={styles.categoryCount}>
                {category.count.toLocaleString()} spots
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Popular Spots */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Popular Dive Spots
        </ThemedText>
        {popularDiveSpots.map((spot) => (
          <TouchableOpacity key={spot.id} style={[styles.spotCard, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
            <Image 
              source={spot.imageUri} 
              style={styles.spotImage}
              contentFit="cover"
            />
            <ThemedView style={styles.spotInfo}>
              <ThemedView style={styles.spotHeader}>
                <ThemedText style={styles.spotName}>
                  {spot.name}
                </ThemedText>
                <ThemedView style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(spot.difficulty) }]}>
                  <ThemedText style={styles.difficultyText}>
                    {spot.difficulty}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedView style={styles.locationRow}>
                <IconSymbol 
                  name="location" 
                  size={14} 
                  color={colors.primary} 
                />
                <ThemedText style={styles.locationText}>
                  {spot.location}
                </ThemedText>
              </ThemedView>

              <ThemedText style={styles.description} numberOfLines={2}>
                {spot.description}
              </ThemedText>

              <ThemedView style={styles.spotStats}>
                <ThemedView style={styles.spotStat}>
                  <ThemedText style={[styles.statValue, { color: colors.primary }]}>{spot.maxDepth}m</ThemedText>
                  <ThemedText style={styles.statLabel}>Max Depth</ThemedText>
                </ThemedView>
                <ThemedView style={styles.spotStat}>
                  <ThemedText style={[styles.statValue, { color: colors.primary }]}>{spot.visibility}m</ThemedText>
                  <ThemedText style={styles.statLabel}>Visibility</ThemedText>
                </ThemedView>
                <ThemedView style={styles.spotStat}>
                  <ThemedText style={[styles.statValue, { color: colors.primary }]}>{spot.waterType}</ThemedText>
                  <ThemedText style={styles.statLabel}>Water</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Map View */}
      <ThemedView style={[styles.section, styles.lastSection]}>
        <TouchableOpacity style={[styles.mapContainer, { borderColor: colors.border, backgroundColor: colors.overlay }]}>
          <IconSymbol 
            name="map" 
            size={48} 
            color={colors.secondary} 
          />
          <ThemedText style={styles.mapText}>
            View dive spots on map
          </ThemedText>
          <ThemedText style={styles.mapSubtext}>
            Coming soon: Interactive map with all dive locations
          </ThemedText>
        </TouchableOpacity>
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
    borderRadius: 16,
    marginHorizontal: 8,
    marginTop: 8,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'center',
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewSubtitle: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    opacity: 0.6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  lastSection: {
    marginBottom: 40, // Extra bottom margin for the last section
  },
  sectionTitle: {
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  categoryItem: {
    width: (screenWidth - 60) / 2,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryName: {
    fontWeight: '600',
    marginTop: 8,
  },
  categoryCount: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  spotCard: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  spotImage: {
    width: 100,
    height: 100,
  },
  spotInfo: {
    flex: 1,
    padding: 12,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  spotName: {
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    opacity: 0.7,
  },
  description: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 10,
    lineHeight: 16,
  },
  spotStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  spotStat: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  mapContainer: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  mapSubtext: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 5,
    textAlign: 'center',
  },
});
