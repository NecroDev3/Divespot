import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface OceanGradientProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'surface' | 'deep' | 'abyss' | 'shallow';
}

export const OceanGradient: React.FC<OceanGradientProps> = ({ 
  children, 
  style, 
  variant = 'surface' 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getGradientColors = () => {
    const isDark = colorScheme === 'dark';
    
    switch (variant) {
      case 'surface':
        return isDark 
          ? [colors.surface, colors.background] 
          : ['#E8F6F3', '#FFFFFF'];
      case 'shallow':
        return isDark
          ? [colors.primary, colors.secondary]
          : ['#AED6F1', '#E8F6F3'];
      case 'deep':
        return isDark
          ? [colors.secondary, colors.primary]
          : ['#5DADE2', '#1B4F72'];
      case 'abyss':
        return isDark
          ? [colors.background, '#0B1426']
          : ['#1B4F72', '#0B2F5C'];
      default:
        return [colors.surface, colors.background];
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors() as [string, string]}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
