import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { Colors } from '@/constants/Colors';
import AuthScreen from '@/components/AuthScreen';

// Inner component that uses the UserContext
function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isInitialized, isLoading, login, signup, googleAuth } = useUser();

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
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

  console.log('✅ User found, showing main app:', user.email);

  // Show main app with expo-router navigation if user is authenticated
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutInner />
        <StatusBar style="auto" />
      </ThemeProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
