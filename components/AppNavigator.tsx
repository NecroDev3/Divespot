import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import AuthScreen from '@/components/AuthScreen';

export default function AppNavigator() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isInitialized, isLoading, login, signup, googleAuth } = useUser();

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.like} />
      </View>
    );
  }

  // Show auth screen if no user is logged in
  if (!user) {
    return (
      <AuthScreen
        onLogin={login}
        onSignUp={signup}
        onGoogleAuth={googleAuth}
      />
    );
  }

  // Show main app tabs if user is authenticated
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
