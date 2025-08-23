import React from 'react';
import { View } from 'react-native';

interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  vertical?: boolean;
  horizontal?: boolean;
  custom?: number;
}

/**
 * Spacer component for consistent spacing throughout the app
 * Useful for maintaining proper visual hierarchy and breathing room
 */
export const Spacer: React.FC<SpacerProps> = ({ 
  size = 'md', 
  vertical = true, 
  horizontal = false,
  custom 
}) => {
  const getSpacing = () => {
    if (custom) return custom;
    
    switch (size) {
      case 'xs': return 4;
      case 'sm': return 8;
      case 'md': return 16;
      case 'lg': return 24;
      case 'xl': return 32;
      case 'xxl': return 48;
      default: return 16;
    }
  };

  const spacing = getSpacing();

  const style = {
    width: horizontal ? spacing : 0,
    height: vertical ? spacing : 0,
  };

  return <View style={style} />;
};

// Common spacer components for specific use cases
export const BottomTabSpacer = () => <Spacer size="xxl" custom={100} />;
export const SectionSpacer = () => <Spacer size="lg" />;
export const ItemSpacer = () => <Spacer size="md" />;
export const TightSpacer = () => <Spacer size="sm" />;

// No styles needed for this component
