import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity, TextInput, SafeAreaView, FlatList } from 'react-native';
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

interface SearchSuggestion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'geocode' | 'popular_spot';
}

interface MapLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  onCancel?: () => void;
  initialLocation?: LocationData;
  style?: any;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onLocationSelect,
  onCancel,
  initialLocation,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const mapRef = useRef<MapView>(null);
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null);
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || -33.9249, // Default to Cape Town (diving destination)
    longitude: initialLocation?.longitude || 18.4241,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Popular Cape Town dive spots for quick suggestions
  const popularDiveSpots = [
    { name: "Two Oceans Aquarium", address: "V&A Waterfront, Cape Town", latitude: -33.9028, longitude: 18.4201 },
    { name: "Seal Island", address: "False Bay, Cape Town", latitude: -34.1369, longitude: 18.5819 },
    { name: "Atlantis Reef", address: "Atlantic Seaboard, Cape Town", latitude: -33.8567, longitude: 18.3026 },
    { name: "Castle Rock", address: "Cape Peninsula, Cape Town", latitude: -34.3578, longitude: 18.4678 },
    { name: "Windmill Beach", address: "Simon's Town, Cape Town", latitude: -34.1950, longitude: 18.4503 },
    { name: "Pyramid Rock", address: "Miller's Point, Cape Town", latitude: -34.2156, longitude: 18.4789 },
    { name: "Smitswinkel Bay", address: "Cape Peninsula, Cape Town", latitude: -34.2167, longitude: 18.4500 },
    { name: "Long Beach", address: "Kommetjie, Cape Town", latitude: -34.1333, longitude: 18.3167 },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch(searchQuery);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
    setShowSuggestions(false); // Hide suggestions when tapping map

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

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(query);
      
      if (results.length > 0) {
        const result = results[0];
        const newRegion = {
          latitude: result.latitude,
          longitude: result.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        
        setRegion(newRegion);
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
        
        // Get address for the searched location
        const address = await reverseGeocode(result.latitude, result.longitude);
        const locationData: LocationData = {
          latitude: result.latitude,
          longitude: result.longitude,
          address,
          name: query,
        };
        
        setSelectedLocation(locationData);
      } else {
        Alert.alert('Location Not Found', 'Could not find the specified location. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Could not search for the location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    searchLocation(searchQuery);
    setShowSuggestions(false);
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    const suggestions: SearchSuggestion[] = [];
    
    try {
      // First, add matching popular dive spots
      const matchingSpots = popularDiveSpots.filter(spot =>
        spot.name.toLowerCase().includes(query.toLowerCase()) ||
        spot.address.toLowerCase().includes(query.toLowerCase())
      );
      
      matchingSpots.forEach((spot, index) => {
        suggestions.push({
          id: `popular-${index}`,
          name: spot.name,
          address: spot.address,
          latitude: spot.latitude,
          longitude: spot.longitude,
          type: 'popular_spot'
        });
      });
      
      // Then, add geocoding results (limit to avoid too many results)
      if (suggestions.length < 5) {
        try {
          const geocodeResults = await Location.geocodeAsync(query);
          const limitedResults = geocodeResults.slice(0, 5 - suggestions.length);
          
          for (let i = 0; i < limitedResults.length; i++) {
            const result = limitedResults[i];
            const address = await reverseGeocode(result.latitude, result.longitude);
            
            suggestions.push({
              id: `geocode-${i}`,
              name: query,
              address: address,
              latitude: result.latitude,
              longitude: result.longitude,
              type: 'geocode'
            });
          }
        } catch (geocodeError) {
          console.log('Geocoding failed, showing only popular spots');
        }
      }
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    const locationData: LocationData = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      address: suggestion.address,
      name: suggestion.name,
    };
    
    // Update map region
    const newRegion = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
    
    setSelectedLocation(locationData);
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
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
    <SafeAreaView style={[styles.container, style, { backgroundColor: colors.background }]}>
      {/* Enhanced Header with Back Button and Search */}
      <ThemedView style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ThemedView style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onCancel}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
            Select Location
          </ThemedText>
          
          <View style={styles.headerSpacer} />
        </ThemedView>
        
        {/* Search Bar */}
        <ThemedView style={styles.searchContainer}>
          <ThemedView style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.text + '60'} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search for a location..."
              placeholderTextColor={colors.text + '60'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              onFocus={() => {
                if (searchQuery.trim().length > 2) {
                  setShowSuggestions(true);
                }
              }}
              returnKeyType="search"
            />
            {isSearching && (
              <IconSymbol name="arrow.clockwise" size={16} color={colors.primary} />
            )}
            {searchQuery.length > 0 && !isSearching && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={16} color={colors.text + '60'} />
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>
        
        <ThemedText style={[styles.instruction, { color: colors.text }]}>
          Search above or tap on the map to select your dive location
        </ThemedText>
      </ThemedView>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <ThemedView style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FlatList
            data={searchSuggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                onPress={() => handleSuggestionSelect(item)}
              >
                <IconSymbol 
                  name={item.type === 'popular_spot' ? "star.fill" : "location"} 
                  size={16} 
                  color={item.type === 'popular_spot' ? colors.primary : colors.text + '60'} 
                />
                <View style={styles.suggestionText}>
                  <ThemedText style={[styles.suggestionName, { color: colors.text }]}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={[styles.suggestionAddress, { color: colors.text + '70' }]}>
                    {item.address}
                  </ThemedText>
                </View>
                {item.type === 'popular_spot' && (
                  <View style={[styles.popularBadge, { backgroundColor: colors.primary + '20' }]}>
                    <ThemedText style={[styles.popularBadgeText, { color: colors.primary }]}>
                      Popular
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </ThemedView>
      )}

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 32, // Compensate for back button width
  },
  headerSpacer: {
    width: 32, // Same width as back button for centering
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  instruction: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 120, // Position below header
    left: 16,
    right: 16,
    maxHeight: 200,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 1000,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  suggestionAddress: {
    fontSize: 14,
    marginTop: 2,
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
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
