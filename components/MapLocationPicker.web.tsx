import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

interface MapLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData | null;
  style?: any;
}

// Web-only component that shows a message instead of a map
export default function MapLocationPicker({ 
  onLocationSelect, 
  initialLocation, 
  style 
}: MapLocationPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={[styles.container, style]}>
      {/* Map Header */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerContent}>
          <IconSymbol name="map" size={24} color={colors.primary} />
          <ThemedText style={[styles.headerTitle, { color: colors.primary }]}>
            Select Dive Spot Location
          </ThemedText>
        </ThemedView>
        <ThemedText style={[styles.instruction, { color: colors.text }]}>
          Map selection is only available on mobile devices
        </ThemedText>
      </ThemedView>

      {/* Web Fallback */}
      <ThemedView style={styles.mapContainer}>
        <ThemedView style={[styles.webFallback, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <IconSymbol name="map" size={64} color={colors.text} />
          <ThemedText style={[styles.webFallbackTitle, { color: colors.text }]}>
            Mobile-Only Feature
          </ThemedText>
          <ThemedText style={[styles.webFallbackText, { color: colors.text }]}>
            Interactive map selection is only available on iOS and Android devices.
          </ThemedText>
          <ThemedText style={[styles.webFallbackSubtext, { color: colors.text }]}>
            Please use the DiveSpot mobile app to select dive locations on the map.
          </ThemedText>
          
          {/* Show current selection if any */}
          {initialLocation && (
            <ThemedView style={[styles.currentSelection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="location.fill" size={16} color={colors.primary} />
              <ThemedText style={[styles.selectionText, { color: colors.text }]}>
                {initialLocation.name || 'Selected Location'}
              </ThemedText>
              {initialLocation.address && (
                <ThemedText style={[styles.selectionAddress, { color: colors.text }]}>
                  {initialLocation.address}
                </ThemedText>
              )}
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 14,
    opacity: 0.7,
  },
  mapContainer: {
    flex: 1,
    padding: 20,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 40,
  },
  webFallbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  webFallbackText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  webFallbackSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  currentSelection: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 200,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  selectionAddress: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
});
