import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image } from 'expo-image';
import { User } from '@/types';

interface ProfileEditModalProps {
  visible: boolean;
  user: User;
  onClose: () => void;
  onSave: (updatedUser: Partial<User>) => void;
  onImagePick: () => void;
}

const CERTIFICATION_LEVELS = [
  'Open Water',
  'Advanced Open Water',
  'Rescue Diver',
  'Divemaster',
  'Open Water Instructor',
  'Master Instructor',
];

export default function ProfileEditModal({ 
  visible, 
  user, 
  onClose, 
  onSave, 
  onImagePick 
}: ProfileEditModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    certificationLevel: user?.stats?.certificationLevel || 'Open Water',
  });

  const [showCertificationPicker, setShowCertificationPicker] = useState(false);

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        certificationLevel: user.stats?.certificationLevel || 'Open Water',
      });
    }
  }, [user]);

  const handleSave = () => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    const updatedUser: Partial<User> = {
      displayName: formData.displayName.trim(),
      username: formData.username.trim(),
      bio: formData.bio.trim() || undefined,
      location: formData.location.trim() || undefined,
      stats: {
        ...user.stats,
        certificationLevel: formData.certificationLevel,
      },
    };

    onSave(updatedUser);
    onClose();
  };

  const renderCertificationPicker = () => (
    <Modal
      visible={showCertificationPicker}
      transparent
      animationType="slide"
    >
      <ThemedView style={styles.pickerOverlay}>
        <ThemedView style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
          <ThemedView style={styles.pickerHeader}>
            <ThemedText type="subtitle">Select Certification Level</ThemedText>
            <TouchableOpacity onPress={() => setShowCertificationPicker(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
          </ThemedView>
          
          <ScrollView style={styles.pickerOptions}>
            {CERTIFICATION_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.pickerOption,
                  { 
                    backgroundColor: level === formData.certificationLevel ? colors.primary + '20' : 'transparent',
                    borderBottomColor: colors.border 
                  }
                ]}
                onPress={() => {
                  setFormData(prev => ({ ...prev, certificationLevel: level }));
                  setShowCertificationPicker(false);
                }}
              >
                <ThemedText style={[
                  styles.pickerOptionText,
                  { color: level === formData.certificationLevel ? colors.primary : colors.text }
                ]}>
                  {level}
                </ThemedText>
                {level === formData.certificationLevel && (
                  <IconSymbol name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ThemedView style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            {Platform.OS === 'web' ? (
              <TouchableOpacity onPress={onClose} style={[styles.webBackButton, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
                <IconSymbol name="chevron.left" size={18} color={colors.text} />
                <ThemedText style={[styles.webBackText, { color: colors.text }]}>Back</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <ThemedText style={[styles.headerButtonText, { color: colors.primary }]}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
            )}
            
            <ThemedText type="subtitle">Edit Profile</ThemedText>
            
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <ThemedText style={[styles.headerButtonText, { color: colors.primary }]}>
                Save
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ScrollView 
            style={[styles.content, { backgroundColor: colors.background }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Image Section */}
            <ThemedView style={styles.imageSection}>
              <TouchableOpacity style={styles.profileImageContainer} onPress={onImagePick}>
                <Image
                  source={
                    user.profileImageUri 
                      ? { uri: user.profileImageUri }
                      : require('@/assets/images/adaptive-icon.png')
                  }
                  style={styles.profileImage}
                />
                <ThemedView style={[styles.imageOverlay, { backgroundColor: colors.primary + '80' }]}>
                  <IconSymbol name="camera" size={24} color="white" />
                </ThemedView>
              </TouchableOpacity>
              <ThemedText style={styles.imageHint}>Tap to change profile picture</ThemedText>
            </ThemedView>

            {/* Form Fields */}
            <ThemedView style={styles.formSection}>
              <ThemedView style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Display Name *</ThemedText>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: colors.surface, 
                    color: colors.text,
                    borderColor: colors.border 
                  }]}
                  value={formData.displayName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                  placeholder="Enter your display name"
                  placeholderTextColor={colors.text + '60'}
                  maxLength={50}
                />
              </ThemedView>

              <ThemedView style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Username *</ThemedText>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: colors.surface, 
                    color: colors.text,
                    borderColor: colors.border 
                  }]}
                  value={formData.username}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, username: text.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                  placeholder="Enter your username"
                  placeholderTextColor={colors.text + '60'}
                  maxLength={30}
                  autoCapitalize="none"
                />
              </ThemedView>

              <ThemedView style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Bio</ThemedText>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: colors.surface, 
                    color: colors.text,
                    borderColor: colors.border 
                  }]}
                  value={formData.bio}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                  placeholder="Tell us about your diving journey..."
                  placeholderTextColor={colors.text + '60'}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                />
                <ThemedText style={styles.characterCount}>
                  {formData.bio.length}/200
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Location</ThemedText>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: colors.surface, 
                    color: colors.text,
                    borderColor: colors.border 
                  }]}
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                  placeholder="Cape Town, South Africa"
                  placeholderTextColor={colors.text + '60'}
                  maxLength={100}
                />
              </ThemedView>

              <ThemedView style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>Certification Level</ThemedText>
                <TouchableOpacity
                  style={[styles.picker, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border 
                  }]}
                  onPress={() => setShowCertificationPicker(true)}
                >
                  <ThemedText style={[styles.pickerText, { color: colors.text }]}>
                    {formData.certificationLevel}
                  </ThemedText>
                  <IconSymbol name="chevron.down" size={16} color={colors.text} />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.footer}>
              <ThemedText style={styles.footerText}>
                * Required fields
              </ThemedText>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {renderCertificationPicker()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageHint: {
    fontSize: 14,
    opacity: 0.6,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 50,
  },
  pickerText: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  // Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  pickerOptions: {
    maxHeight: 300,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerOptionText: {
    fontSize: 16,
  },
});
