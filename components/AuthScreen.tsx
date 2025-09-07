import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width: screenWidth } = Dimensions.get('window');

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, displayName: string) => Promise<void>;
  onGoogleAuth: () => Promise<void>;
}

type AuthMode = 'login' | 'signup';

export default function AuthScreen({ onLogin, onSignUp, onGoogleAuth }: AuthScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }

    if (mode === 'signup' && !formData.displayName.trim()) {
      Alert.alert('Error', 'Display name is required for sign up');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await onLogin(formData.email, formData.password);
      } else {
        await onSignUp(formData.email, formData.password, formData.displayName);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await onGoogleAuth();
    } catch (error) {
      Alert.alert('Error', 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <ThemedView style={styles.header}>
          <Image
            source={require('@/assets/images/graphic.jpg')}
            style={styles.headerImage}
            contentFit="cover"
          />
          <ThemedView style={styles.headerOverlay}>
            <ThemedText type="title" style={styles.title}>DiveSpot</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.text }]}>
              Discover Cape Town's underwater adventures
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Auth Form */}
        <ThemedView style={styles.formContainer}>
          {/* Mode Toggle */}
          <ThemedView style={[styles.modeToggle, { borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'login' && { backgroundColor: colors.like }
              ]}
              onPress={() => setMode('login')}
            >
              <ThemedText style={[
                styles.modeButtonText,
                mode === 'login' && { color: 'white' }
              ]}>
                Sign In
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'signup' && { backgroundColor: colors.like }
              ]}
              onPress={() => setMode('signup')}
            >
              <ThemedText style={[
                styles.modeButtonText,
                mode === 'signup' && { color: 'white' }
              ]}>
                Sign Up
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Form Fields */}
          <ThemedView style={styles.formFields}>
            {mode === 'signup' && (
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                  Display Name
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.text
                    }
                  ]}
                  value={formData.displayName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                  placeholder="Your name"
                  placeholderTextColor={colors.text + '80'}
                  autoCapitalize="words"
                />
              </ThemedView>
            )}

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                Email
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.text + '80'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={[styles.inputLabel, { color: colors.text }]}>
                Password
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                placeholder="Enter your password"
                placeholderTextColor={colors.text + '80'}
                secureTextEntry
                autoCapitalize="none"
              />
            </ThemedView>
          </ThemedView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.like },
              isLoading && { opacity: 0.7 }
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <ThemedText style={styles.submitButtonText}>
              {isLoading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </ThemedText>
          </TouchableOpacity>

          {/* Divider */}
          <ThemedView style={styles.divider}>
            <ThemedView style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <ThemedText style={[styles.dividerText, { color: colors.text }]}>or</ThemedText>
            <ThemedView style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </ThemedView>

          {/* Google Auth Button */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              { 
                borderColor: colors.border,
                backgroundColor: colors.background
              }
            ]}
            onPress={handleGoogleAuth}
            disabled={isLoading}
          >
            <IconSymbol 
              name="logo.google" 
              size={20} 
              color={colors.text}
            />
            <ThemedText style={[styles.googleButtonText, { color: colors.text }]}>
              Continue with Google
            </ThemedText>
          </TouchableOpacity>

          {/* Footer */}
          <ThemedView style={styles.footer}>
            <ThemedText style={[styles.footerText, { color: colors.text + '80' }]}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </ThemedText>
            <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              <ThemedText style={[styles.footerLink, { color: colors.like }]}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    paddingTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 32,
    ...Platform.select({
      web: {
        width: '40%',
        alignSelf: 'center',
      },
    }),
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formFields: {
    marginBottom: 24,
    ...Platform.select({
      web: {
        width: '40%',
        alignSelf: 'center',
      },
    }),
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      web: {
        width: '40%',
        alignSelf: 'center',
      },
    }),
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    marginBottom: 32,
    ...Platform.select({
      web: {
        width: '40%',
        alignSelf: 'center',
      },
    }),
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
