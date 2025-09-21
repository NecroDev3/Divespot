import { API_CONFIG } from '@/constants/Api';
import { Platform } from 'react-native';

export interface ImageUploadResponse {
  message: string;
  file_url: string;
}

class ImageService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.IMAGE_URL;
  }

  /**
   * Upload an image to the image server
   * @param imageUri - Local URI of the image to upload
   * @param fileName - Optional filename for the image
   * @returns Promise with the uploaded image URL
   */
  async uploadImage(imageUri: string, fileName?: string): Promise<string> {
    try {
      console.log('📸 Uploading image to server:', imageUri);

      const formData = new FormData();
      const defaultFileName = fileName || `image_${Date.now()}.jpg`;
      
      if (Platform.OS === 'web') {
        // For web, convert data URL to File object
        if (imageUri.startsWith('data:')) {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const file = new File([blob], defaultFileName, { type: blob.type || 'image/jpeg' });
          formData.append('file', file);
        } else {
          // Handle regular URLs on web
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const file = new File([blob], defaultFileName, { type: 'image/jpeg' });
          formData.append('file', file);
        }
      } else {
        // For React Native mobile platforms
        const imageFile = {
          uri: imageUri,
          type: 'image/jpeg',
          name: defaultFileName,
        } as any;
        formData.append('file', imageFile);
      }

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const result: ImageUploadResponse = await response.json();
      
      // Always return network-accessible URL for cross-device compatibility
      // Use the network IP so images can be accessed from any device on the network
      // This ensures images work on both web and mobile platforms
      const networkImageUrl = `http://192.168.50.79:5010${result.file_url}`;
      
      console.log('✅ Image uploaded successfully:', networkImageUrl);
      return networkImageUrl;

    } catch (error: any) {
      console.error('❌ Image upload failed:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  }

  /**
   * Upload multiple images in parallel
   * @param imageUris - Array of local image URIs
   * @returns Promise with array of uploaded image URLs
   */
  async uploadMultipleImages(imageUris: string[]): Promise<string[]> {
    try {
      console.log(`📸 Uploading ${imageUris.length} images to server...`);

      const uploadPromises = imageUris.map((uri, index) => 
        this.uploadImage(uri, `image_${Date.now()}_${index}.jpg`)
      );

      const uploadedUrls = await Promise.all(uploadPromises);
      
      console.log('✅ All images uploaded successfully:', uploadedUrls.length);
      return uploadedUrls;

    } catch (error: any) {
      console.error('❌ Multiple image upload failed:', error);
      throw new Error(error.message || 'Failed to upload images');
    }
  }

  /**
   * Get the full URL for an image file
   * @param fileUrl - The file URL returned from upload (e.g., "/files/filename.jpg")
   * @returns Full URL to access the image
   */
  getImageUrl(fileUrl: string): string {
    if (fileUrl.startsWith('http')) {
      return fileUrl; // Already a full URL
    }
    return `${this.baseUrl}${fileUrl}`;
  }

  /**
   * Check if the image server is available
   * @returns Promise<boolean>
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/files/example.png`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Image server health check failed:', error);
      return false;
    }
  }
}

export const imageService = new ImageService();
