import { MapLocationPicker } from '@/components/MapLocationPicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CAPE_TOWN_DIVE_SPOTS } from '@/types';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface DiveLocation {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export default function AddPostScreen() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [diveLocation, setDiveLocation] = useState<DiveLocation | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showPopularSpots, setShowPopularSpots] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required to add photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...uris].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permissions are required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setSelectedImages(prev => [...prev, result.assets[0].uri].slice(0, 5));
    }
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Location permissions are required to tag dive spots');
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      
      // Auto-set dive location to current location
      setDiveLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: 'Current Location',
        name: 'Current Location',
      });
    } catch {
      Alert.alert('Error', 'Could not get current location');
    }
  };

  const handleLocationSelect = (selectedLocation: DiveLocation) => {
    setDiveLocation(selectedLocation);
    setShowMapPicker(false);
  };

  const handleMapPickerToggle = () => {
    setShowMapPicker(!showMapPicker);
  };

  const handlePopularSpotSelect = (spot: typeof CAPE_TOWN_DIVE_SPOTS[0]) => {
    setDiveLocation({
      latitude: spot.coordinates.latitude,
      longitude: spot.coordinates.longitude,
      name: spot.name,
      address: spot.address,
    });
    setShowPopularSpots(false);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={[styles.header, { backgroundColor: colors.surface }]}>
        <ThemedText type="title" style={{ color: colors.primary }}>Share Your Dive</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.secondary }]}>
          Document your underwater adventure 🤿
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Photos</ThemedText>
        <ThemedView style={styles.imageContainer}>
          {selectedImages.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.selectedImage}
            />
          ))}
          {selectedImages.length < 5 && (
            <ThemedView style={styles.addImageContainer}>
              <TouchableOpacity style={[styles.imageButton, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={pickImage}>
                <IconSymbol name="photo" size={30} color={colors.primary} />
                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Gallery</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.imageButton, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={takePhoto}>
                <IconSymbol name="camera" size={30} color={colors.primary} />
                <ThemedText style={[styles.buttonText, { color: colors.text }]}>Camera</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Dive Location</ThemedText>
        
        <ThemedView style={styles.locationButtons}>
          <TouchableOpacity 
            style={[styles.locationButton, { 
              borderColor: colors.like, 
              backgroundColor: colors.like,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }]} 
            onPress={() => setShowPopularSpots(true)}
            activeOpacity={0.8}
          >
            <IconSymbol name="mappin.and.ellipse" size={24} color="white" />
            <ThemedText style={[styles.locationButtonText, { color: 'white' }]}>
              Location
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.locationButton, { 
              borderColor: colors.primary, 
              backgroundColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }]} 
            onPress={handleMapPickerToggle}
            activeOpacity={0.8}
          >
            <IconSymbol name="map" size={24} color="white" />
            <ThemedText style={[styles.locationButtonText, { color: 'white' }]}>
              Map
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Selected Location Display */}
        {diveLocation && (
          <ThemedView style={[styles.selectedLocationCard, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
            <IconSymbol name="mappin.circle" size={20} color={colors.success} />
            <ThemedView style={styles.locationDetails}>
              <ThemedText style={[styles.selectedLocationName, { color: colors.text }]}>
                {diveLocation.name || 'Selected Location'}
              </ThemedText>
              <ThemedText style={[styles.selectedLocationCoords, { color: colors.text }]}>
                📍 {diveLocation.latitude.toFixed(4)}, {diveLocation.longitude.toFixed(4)}
              </ThemedText>
            </ThemedView>
            <TouchableOpacity onPress={() => setDiveLocation(null)}>
              <IconSymbol name="xmark.circle" size={20} color={colors.error} />
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Map Location Picker */}
        {showMapPicker && (
          <MapLocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={diveLocation ?? undefined}
          />
        )}
      </ThemedView>

      {/* Popular Cape Town Dive Spots Modal */}
      <Modal
        visible={showPopularSpots}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <ThemedText type="title" style={{ color: colors.primary }}>
              🌊 Cape Town Locations
            </ThemedText>
            <TouchableOpacity onPress={() => setShowPopularSpots(false)}>
              <IconSymbol name="xmark.circle" size={28} color={colors.error} />
            </TouchableOpacity>
          </ThemedView>
          
          <ScrollView style={styles.spotsContainer} showsVerticalScrollIndicator={false}>
            {CAPE_TOWN_DIVE_SPOTS.map((spot, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.spotCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handlePopularSpotSelect(spot)}
              >
                <ThemedView style={styles.spotHeader}>
                  <ThemedText style={[styles.spotName, { color: colors.text }]}>
                    {spot.name}
                  </ThemedText>
                  <ThemedView style={[styles.difficultyBadge, { 
                    backgroundColor: spot.difficulty === 'Beginner' ? colors.success : 
                                   spot.difficulty === 'Intermediate' ? colors.warning : colors.error 
                  }]}>
                    <ThemedText style={styles.difficultyText}>{spot.difficulty}</ThemedText>
                  </ThemedView>
                </ThemedView>
                
                <ThemedText style={[styles.spotDescription, { color: colors.text }]}>
                  {spot.description}
                </ThemedText>
                
                <ThemedView style={styles.spotDetails}>
                  <ThemedView style={styles.spotDetailItem}>
                    <IconSymbol name="arrow.down" size={16} color={colors.primary} />
                    <ThemedText style={[styles.spotDetailText, { color: colors.text }]}>
                      Max {spot.maxDepth}m
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.spotDetailItem}>
                    <IconSymbol name="eye" size={16} color={colors.primary} />
                    <ThemedText style={[styles.spotDetailText, { color: colors.text }]}>
                      {spot.visibility}m visibility
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.spotDetailItem}>
                    <IconSymbol name="thermometer" size={16} color={colors.primary} />
                    <ThemedText style={[styles.spotDetailText, { color: colors.text }]}>
                      {spot.temperature}°C
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      </Modal>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Dive Details</ThemedText>
        <ThemedText style={styles.placeholder}>
          🚧 Coming soon: Dive depth, time, conditions, and more details will be added here
        </ThemedText>
      </ThemedView>

      <TouchableOpacity style={[styles.shareButton, { backgroundColor: colors.primary }]}>
        <ThemedText style={[styles.shareButtonText, { color: 'white' }]}>🌊 Share Dive</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 120, // Extra space for tab bar and visual breathing room
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 40,
    paddingBottom: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  addImageContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  imageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  buttonText: {
    fontSize: 12,
    marginTop: 4,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 0,
    gap: 10,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    marginHorizontal: 8,
    gap: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationDetails: {
    flex: 1,
  },
  selectedLocationName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  selectedLocationCoords: {
    fontSize: 13,
    opacity: 0.7,
  },
  placeholder: {
    fontStyle: 'italic',
    opacity: 0.6,
    textAlign: 'center',
    padding: 20,
  },
  shareButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 60, // Increased bottom margin for better spacing
    marginHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  shareButtonText: {
    fontWeight: '600',
    fontSize: 18,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  spotsContainer: {
    flex: 1,
    padding: 16,
  },
  spotCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  spotName: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  spotDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
    lineHeight: 20,
  },
  spotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spotDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  spotDetailText: {
    fontSize: 12,
    opacity: 0.8,
  },
});
