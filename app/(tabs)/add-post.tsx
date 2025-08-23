import { MapLocationPicker } from '@/components/MapLocationPicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

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
            style={[styles.locationButton, { borderColor: colors.border, backgroundColor: colors.surface }]} 
            onPress={getCurrentLocation}
          >
            <IconSymbol name="location.circle" size={24} color={colors.primary} />
            <ThemedText style={[styles.locationText, { color: colors.text }]}>
              Current Location
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.locationButton, styles.mapButton, { borderColor: colors.border, backgroundColor: colors.primary }]} 
            onPress={handleMapPickerToggle}
          >
            <IconSymbol name="map" size={24} color="white" />
            <ThemedText style={[styles.locationText, { color: 'white' }]}>
              Choose on Map
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
            initialLocation={diveLocation}
          />
        )}
      </ThemedView>

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
    marginBottom: 15,
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
    gap: 12,
    marginBottom: 16,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  mapButton: {
    // Specific styling for the map button
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  locationDetails: {
    flex: 1,
  },
  selectedLocationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedLocationCoords: {
    fontSize: 12,
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
});
