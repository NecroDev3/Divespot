import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

interface MapLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  style?: any;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const mapRef = useRef<MapView>(null);
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null);
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || 25.7617, // Default to Dubai (popular diving destination)
    longitude: initialLocation?.longitude || 55.9657,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Location permission is needed to show your current location and nearby dive spots.'
        );
        return;
      }

      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Could not get your current location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const [result] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result) {
        const parts = [];
        if (result.name) parts.push(result.name);
        if (result.city) parts.push(result.city);
        if (result.country) parts.push(result.country);
        return parts.join(', ') || 'Selected Location';
      }
      return 'Selected Location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Selected Location';
    }
  };

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    setIsLoading(true);

    try {
      const address = await reverseGeocode(coordinate.latitude, coordinate.longitude);
      
      const locationData: LocationData = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        address,
        name: address,
      };

      setSelectedLocation(locationData);
      onLocationSelect(locationData);
    } catch (error) {
      console.error('Error processing location:', error);
      Alert.alert('Error', 'Could not process the selected location.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocationPress = () => {
    getCurrentLocation();
  };

  const getDivingSpotMarkers = () => {
    // Popular diving destinations - in a real app, this would come from a database
    const popularDiveSpots = [
      { latitude: 25.0657, longitude: 55.1713, title: 'Dubai Aquarium Dive', type: 'artificial' },
      { latitude: 25.6892, longitude: 56.3303, title: 'Dibba Rock', type: 'reef' },
      { latitude: 18.2206, longitude: -67.9927, title: 'Blue Hole, Puerto Rico', type: 'cenote' },
    ];

    return popularDiveSpots
      .filter(spot => 
        Math.abs(spot.latitude - region.latitude) < region.latitudeDelta * 2 &&
        Math.abs(spot.longitude - region.longitude) < region.longitudeDelta * 2
      )
      .map((spot, index) => (
        <Marker
          key={`popular-${index}`}
          coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
          title={spot.title}
          description={`Popular ${spot.type} dive spot`}
        >
          <View style={[styles.popularSpotMarker, { backgroundColor: colors.secondary }]}>
            <IconSymbol name="location" size={16} color="white" />
          </View>
        </Marker>
      ));
  };

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
          Tap on the map to select your dive location
        </ThemedText>
      </ThemedView>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
        >
          {/* Selected Location Marker */}
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Selected Dive Spot"
              description={selectedLocation.address}
            >
              <View style={[styles.selectedMarker, { backgroundColor: colors.primary }]}>
                <IconSymbol name="location.fill" size={20} color="white" />
              </View>
            </Marker>
          )}

          {/* Popular Dive Spots */}
          {getDivingSpotMarkers()}
        </MapView>

        {/* Current Location Button */}
        <View style={styles.mapControls}>
          <ThemedView 
            style={[styles.locationButton, { backgroundColor: colors.surface }]}
            onTouchEnd={handleCurrentLocationPress}
          >
            <IconSymbol 
              name="location.circle" 
              size={24} 
              color={isLoading ? colors.secondary : colors.primary} 
            />
          </ThemedView>
        </View>
      </View>

      {/* Selected Location Info */}
      {selectedLocation && (
        <ThemedView style={[styles.locationInfo, { backgroundColor: colors.overlay }]}>
          <View style={styles.locationDetails}>
            <IconSymbol name="mappin.circle" size={20} color={colors.primary} />
            <View style={styles.locationText}>
              <ThemedText style={[styles.locationName, { color: colors.text }]}>
                {selectedLocation.name || 'Selected Location'}
              </ThemedText>
              <ThemedText style={[styles.coordinates, { color: colors.text }]}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </ThemedText>
            </View>
          </View>
          <View style={[styles.confirmBadge, { backgroundColor: colors.success }]}>
            <IconSymbol name="checkmark" size={16} color="white" />
            <ThemedText style={styles.confirmText}>Selected</ThemedText>
          </View>
        </ThemedView>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <ThemedView style={styles.loadingOverlay}>
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            📍 Locating...
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    position: 'relative',
    height: 300,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  locationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  popularSpotMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 1,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  locationText: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  coordinates: {
    fontSize: 12,
    opacity: 0.7,
  },
  confirmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confirmText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
