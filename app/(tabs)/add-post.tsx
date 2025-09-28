import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUser } from '@/contexts/UserContext';
import { CAPE_TOWN_DIVE_SPOTS } from '@/types';
import { divePostsService, CreateDivePostData } from '@/services/divePostsService';
import { imageService } from '@/services/imageService';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, Platform, TextInput, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

// Platform-specific imports
let MapLocationPicker: any;
if (Platform.OS === 'web') {
  MapLocationPicker = require('@/components/MapLocationPicker.web').MapLocationPicker;
} else {
  MapLocationPicker = require('@/components/MapLocationPicker').MapLocationPicker;
}

interface DiveLocation {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export default function AddPostScreen() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [diveLocation, setDiveLocation] = useState<DiveLocation | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showPopularSpots, setShowPopularSpots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Simplified form data - only essentials
  const [caption, setCaption] = useState('');
  
  // Optional details (hidden by default)
  const [optionalDetails, setOptionalDetails] = useState({
    maxDepth: '',
    diveDuration: '',
    visibilityQuality: 'Good' as CreateDivePostData['visibility_quality'],
    waterTemp: '',
    seaLife: '',
    buddyNames: '',
    notes: '',
  });
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useUser();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permissions are required to add photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      const newImages = [...selectedImages, ...uris].slice(0, 5);
      setSelectedImages(newImages);
      await uploadImages(uris);
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
      const newImages = [...selectedImages, result.assets[0].uri].slice(0, 5);
      setSelectedImages(newImages);
      await uploadImages([result.assets[0].uri]);
    }
  };

  const uploadImages = async (imageUris: string[]) => {
    if (imageUris.length === 0) return;

    try {
      setIsUploadingImages(true);
      console.log('🔄 Uploading images to server...');
      
      const urls = await imageService.uploadMultipleImages(imageUris);
      setUploadedImageUrls(prev => [...prev, ...urls]);
      
      console.log(' Images uploaded successfully:', urls);
    } catch (error) {
      console.error(' Image upload failed:', error);
      Alert.alert('Upload Failed', 'Failed to upload images. They will be stored locally.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handlePopularSpotSelect = (spot: any) => {
    setDiveLocation({
      latitude: spot.coordinates.latitude,
      longitude: spot.coordinates.longitude,
      name: spot.name,
      address: spot.address,
    });
    setShowPopularSpots(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a dive post');
      return;
    }

    // Minimal validation - only require caption and location
    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption to share your dive experience');
      return;
    }

    if (!diveLocation) {
      Alert.alert('Error', 'Please select where you dove');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create dive spot first
      console.log('Creating dive spot for location:', diveLocation);
      const diveSpotId = await divePostsService.createDiveSpot(
        diveLocation.latitude,
        diveLocation.longitude,
        diveLocation.name,
        diveLocation.address,
        user.id
      );

      const postData: CreateDivePostData = {
        user_id: user.id,
        dive_spot_id: diveSpotId,
        dive_date: divePostsService.formatDateForAPI(new Date()),
        // Use defaults for required fields if not provided
        max_depth: optionalDetails.maxDepth ? parseInt(optionalDetails.maxDepth) : 10,
        dive_duration: optionalDetails.diveDuration ? parseInt(optionalDetails.diveDuration) : 30,
        visibility_quality: optionalDetails.visibilityQuality,
        wind_conditions: 'Light', // Default
        current_conditions: 'Light', // Default
        caption: caption.trim(),
        image_urls: uploadedImageUrls.length > 0 ? uploadedImageUrls : selectedImages,
        water_temp: optionalDetails.waterTemp ? parseInt(optionalDetails.waterTemp) : undefined,
        sea_life: optionalDetails.seaLife ? optionalDetails.seaLife.split(',').map(s => s.trim()) : undefined,
        buddy_names: optionalDetails.buddyNames ? optionalDetails.buddyNames.split(',').map(s => s.trim()) : undefined,
        equipment: undefined, // Not needed for simple posts
        notes: optionalDetails.notes || undefined,
        dive_timestamp: new Date().toISOString(),
      };

      const createdPost = await divePostsService.createDivePost(postData);
      
      // Clear form data immediately
      setCaption('');
      setOptionalDetails({
        maxDepth: '',
        diveDuration: '',
        visibilityQuality: 'Good',
        waterTemp: '',
        seaLife: '',
        buddyNames: '',
        notes: '',
      });
      setSelectedImages([]);
      setUploadedImageUrls([]);
      setDiveLocation(null);
      setShowDetails(false);

      Alert.alert(
        'Success!', 
        'Your dive has been shared with the community!',
        [
          {
            text: 'View Feed',
            onPress: () => router.push('/(tabs)/')
          },
          {
            text: 'Add Another',
            style: 'cancel'
          }
        ]
      );

    } catch (error: any) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ThemedView style={[styles.header, { backgroundColor: colors.primary + '15' }]}>
        <ThemedText type="title" style={{ color: colors.primary }}>
          Share Your Dive 🤿
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.text }]}>
          Quick and easy dive sharing
        </ThemedText>
      </ThemedView>

      {/* Photos Section */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedView style={[styles.sectionIcon, { backgroundColor: colors.like + '20' }]}>
            <ThemedText style={styles.sectionEmoji}>📸</ThemedText>
          </ThemedView>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Photos (Optional)
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.imageContainer}>
          {selectedImages.map((uri, index) => (
            <ThemedView key={index} style={styles.imageWrapper}>
              <Image
                source={{ uri }}
                style={styles.selectedImage}
              />
              <TouchableOpacity 
                style={[styles.removeImageButton, { backgroundColor: colors.error }]} 
                onPress={() => removeImage(index)}
              >
                <IconSymbol name="xmark" size={12} color="white" />
              </TouchableOpacity>
              {isUploadingImages && (
                <ThemedView style={styles.uploadingOverlay}>
                  <ActivityIndicator color="white" />
                </ThemedView>
              )}
            </ThemedView>
          ))}
          
          {selectedImages.length < 5 && (
            <ThemedView style={styles.addImageContainer}>
              <TouchableOpacity
                style={[styles.imageButton, { borderColor: colors.like, backgroundColor: colors.like + '10' }]}
                onPress={pickImage}
              >
                <IconSymbol name="photo" size={24} color={colors.like} />
                <ThemedText style={[styles.buttonText, { color: colors.like }]}>
                  Gallery
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.imageButton, { borderColor: colors.share, backgroundColor: colors.share + '10' }]}
                onPress={takePhoto}
              >
                <IconSymbol name="camera" size={24} color={colors.share} />
                <ThemedText style={[styles.buttonText, { color: colors.share }]}>
                  Camera
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>

      {/* Caption Section */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedView style={[styles.sectionIcon, { backgroundColor: colors.comment + '20' }]}>
            <ThemedText style={styles.sectionEmoji}>💬</ThemedText>
          </ThemedView>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            What happened on your dive? *
          </ThemedText>
        </ThemedView>
        
        <TextInput
          style={[
            styles.textInput,
            styles.textArea,
            { 
              borderColor: colors.border, 
              backgroundColor: colors.surface,
              color: colors.text 
            }
          ]}
          placeholder="Amazing dive at Seal Island! Saw some incredible sea life..."
          placeholderTextColor={colors.text + '60'}
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={500}
        />
      </ThemedView>

      {/* Location Section */}
      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionHeader}>
          <ThemedView style={[styles.sectionIcon, { backgroundColor: colors.share + '20' }]}>
            <ThemedText style={styles.sectionEmoji}>📍</ThemedText>
          </ThemedView>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Where did you dive? *
          </ThemedText>
        </ThemedView>
        
        {diveLocation ? (
          <TouchableOpacity
            style={[styles.selectedLocation, { backgroundColor: colors.surface, borderColor: colors.primary }]}
            onPress={() => setShowMapPicker(true)}
          >
            <IconSymbol name="location" size={20} color={colors.primary} />
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={[styles.locationName, { color: colors.text }]}>
                {diveLocation.name || 'Selected Location'}
              </ThemedText>
              {diveLocation.address && (
                <ThemedText style={[styles.locationAddress, { color: colors.text }]}>
                  {diveLocation.address}
                </ThemedText>
              )}
            </ThemedView>
            <IconSymbol name="pencil" size={16} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <ThemedView style={styles.locationButtons}>
            <TouchableOpacity
              style={[styles.locationButton, { backgroundColor: colors.like }]}
              onPress={() => setShowPopularSpots(true)}
            >
              <IconSymbol name="star" size={20} color="white" />
              <ThemedText style={styles.locationButtonText}>Popular Spots</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.locationButton, { backgroundColor: colors.comment + '15', borderColor: colors.comment, borderWidth: 1 }]}
              onPress={() => setShowMapPicker(true)}
            >
              <IconSymbol name="location" size={20} color={colors.comment} />
              <ThemedText style={[styles.locationButtonText, { color: colors.comment }]}>
                Choose on Map
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>

      {/* Optional Details Toggle */}
      <ThemedView style={styles.section}>
        <TouchableOpacity
          style={[styles.detailsToggle, { backgroundColor: colors.share + '10', borderColor: colors.share }]}
          onPress={() => setShowDetails(!showDetails)}
        >
          <IconSymbol 
            name={showDetails ? "chevron.down" : "chevron.right"} 
            size={16} 
            color={colors.share} 
          />
          <ThemedText style={[styles.detailsToggleText, { color: colors.text }]}>
            Add dive details (optional)
          </ThemedText>
          <ThemedText style={[styles.detailsHint, { color: colors.share }]}>
            Depth, duration, conditions...
          </ThemedText>
        </TouchableOpacity>

        {showDetails && (
          <ThemedView style={styles.detailsContainer}>
            <ThemedView style={styles.rowContainer}>
              <ThemedView style={styles.halfWidth}>
                <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                  Max Depth (m)
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                  placeholder="e.g. 18"
                  placeholderTextColor={colors.text + '60'}
                  value={optionalDetails.maxDepth}
                  onChangeText={(text) => setOptionalDetails(prev => ({ ...prev, maxDepth: text }))}
                  keyboardType="numeric"
                />
              </ThemedView>
              
              <ThemedView style={styles.halfWidth}>
                <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                  Duration (min)
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                  placeholder="e.g. 45"
                  placeholderTextColor={colors.text + '60'}
                  value={optionalDetails.diveDuration}
                  onChangeText={(text) => setOptionalDetails(prev => ({ ...prev, diveDuration: text }))}
                  keyboardType="numeric"
                />
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                Sea Life Spotted
              </ThemedText>
              <TextInput
                style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                placeholder="e.g. Seals, Stingrays, Kelp Forest"
                placeholderTextColor={colors.text + '60'}
                value={optionalDetails.seaLife}
                onChangeText={(text) => setOptionalDetails(prev => ({ ...prev, seaLife: text }))}
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                Dive Buddies
              </ThemedText>
              <TextInput
                style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                placeholder="e.g. Sarah, Mike"
                placeholderTextColor={colors.text + '60'}
                value={optionalDetails.buddyNames}
                onChangeText={(text) => setOptionalDetails(prev => ({ ...prev, buddyNames: text }))}
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                Additional Notes
              </ThemedText>
              <TextInput
                style={[styles.textInput, styles.textArea, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Any other details about your dive..."
                placeholderTextColor={colors.text + '60'}
                value={optionalDetails.notes}
                onChangeText={(text) => setOptionalDetails(prev => ({ ...prev, notes: text }))}
                multiline
                maxLength={300}
              />
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { 
            backgroundColor: (caption.trim() && diveLocation) ? colors.like : colors.border,
            opacity: isSubmitting ? 0.7 : 1,
            shadowColor: (caption.trim() && diveLocation) ? colors.like : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }
        ]}
        onPress={handleSubmit}
        disabled={!caption.trim() || !diveLocation || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <IconSymbol name="paperplane" size={20} color="white" />
            <ThemedText style={styles.submitButtonText}>
              Share Dive
            </ThemedText>
          </>
        )}
      </TouchableOpacity>

      {/* Map Picker Modal */}
      <Modal visible={showMapPicker} animationType="slide" presentationStyle="pageSheet">
        <MapLocationPicker
          onLocationSelect={(location) => {
            setDiveLocation(location);
            setShowMapPicker(false);
          }}
          onCancel={() => setShowMapPicker(false)}
          initialLocation={diveLocation}
        />
      </Modal>

      {/* Popular Spots Modal */}
      <Modal visible={showPopularSpots} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText type="title" style={{ color: colors.text }}>
              Popular Cape Town Dive Spots
            </ThemedText>
            <TouchableOpacity onPress={() => setShowPopularSpots(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
          </ThemedView>
          
          <ScrollView style={styles.spotsContainer}>
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
                  <ThemedView style={[styles.difficultyBadge, { backgroundColor: colors.primary }]}>
                    <ThemedText style={styles.difficultyText}>
                      {spot.difficulty}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                
                <ThemedText style={[styles.spotDescription, { color: colors.text }]}>
                  {spot.description}
                </ThemedText>
                
                <ThemedView style={styles.spotDetails}>
                  <ThemedView style={styles.spotDetailItem}>
                    <IconSymbol name="arrow.down" size={12} color={colors.primary} />
                    <ThemedText style={[styles.spotDetailText, { color: colors.text }]}>
                      {spot.maxDepth}m
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.spotDetailItem}>
                    <IconSymbol name="eye" size={12} color={colors.primary} />
                    <ThemedText style={[styles.spotDetailText, { color: colors.text }]}>
                      {spot.visibility}m
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.spotDetailItem}>
                    <IconSymbol name="thermometer" size={12} color={colors.primary} />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 120,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    gap: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  
  // Image styles
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageWrapper: {
    position: 'relative',
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    ...Platform.select({
      web: {
        width: 60,
        height: 60,
      },
    }),
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Form styles
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },

  // Location styles
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
    borderRadius: 12,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationAddress: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },

  // Details toggle
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  detailsToggleText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  detailsHint: {
    fontSize: 14,
    opacity: 0.6,
  },
  detailsContainer: {
    paddingLeft: 16,
  },

  // Submit button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  spotsContainer: {
    padding: 20,
  },
  spotCard: {
    padding: 20,
    borderRadius: 16,
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
    fontSize: 18,
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