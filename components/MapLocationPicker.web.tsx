import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Location from 'expo-location';
import React, { useEffect, useState, useRef } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity, TextInput, SafeAreaView, FlatList } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
// Web-specific location picker - no external map dependencies

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

// Simple web location picker without external map dependencies

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onLocationSelect,
  onCancel,
  initialLocation,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // No map state needed for web version

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

  // No map click handler needed for web version

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    const locationData: LocationData = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      address: suggestion.address,
      name: suggestion.name,
    };
    
    setSelectedLocation(locationData);
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    onLocationSelect(locationData);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() && searchSuggestions.length > 0) {
      handleSuggestionSelect(searchSuggestions[0]);
    }
    setShowSuggestions(false);
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
          Search for dive locations or popular spots
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

      {/* Web Location Selection */}
      <ThemedView style={styles.webLocationContainer}>
        <ThemedView style={[styles.webLocationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="location" size={48} color={colors.primary} />
          <ThemedText style={[styles.webLocationTitle, { color: colors.text }]}>
            Web Location Picker
          </ThemedText>
          <ThemedText style={[styles.webLocationDescription, { color: colors.text + '80' }]}>
            Use the search bar above to find and select your dive location. Popular Cape Town dive spots are available for quick selection.
          </ThemedText>
          
          {selectedLocation && (
            <ThemedView style={[styles.selectedLocationCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
              <ThemedView style={styles.selectedLocationText}>
                <ThemedText style={[styles.selectedLocationName, { color: colors.text }]}>
                  {selectedLocation.name}
                </ThemedText>
                <ThemedText style={[styles.selectedLocationAddress, { color: colors.text + '70' }]}>
                  {selectedLocation.address}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
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
  webLocationContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  webLocationCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  webLocationTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  webLocationDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  selectedLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    width: '100%',
  },
  selectedLocationText: {
    flex: 1,
  },
  selectedLocationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedLocationAddress: {
    fontSize: 14,
    marginTop: 2,
  },
});