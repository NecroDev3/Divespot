import React from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ProfileImagePickerProps {
  onImageSelected: (uri: string) => void;
  onError?: (error: string) => void;
}

export function useProfileImagePicker({ onImageSelected, onError }: ProfileImagePickerProps) {
  
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'We need camera and photo library permissions to update your profile picture.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const showImagePicker = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert(
      'Select Profile Picture',
      'Choose how you want to set your profile picture',
      [
        {
          text: 'Camera',
          onPress: takePicture,
        },
        {
          text: 'Photo Library',
          onPress: pickFromLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile pictures
        quality: 0.8,
        exif: false, // Don't include location data
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      const errorMessage = 'Failed to take picture. Please try again.';
      console.error('Camera error:', error);
      onError?.(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile pictures
        quality: 0.8,
        exif: false, // Don't include location data
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      const errorMessage = 'Failed to select image. Please try again.';
      console.error('Image picker error:', error);
      onError?.(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  return {
    showImagePicker,
    takePicture,
    pickFromLibrary,
  };
}
