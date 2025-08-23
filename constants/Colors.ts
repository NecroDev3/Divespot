/**
 * DiveSpot Color Scheme - Inspired by the depths of the ocean
 * Dark grey, deep ocean blues, and refreshing light blue accents
 */

// Primary diving-themed colors
const oceanBlue = '#1B4F72';      // Deep ocean blue
const lightBlue = '#5DADE2';      // Light blue accent  
const darkGrey = '#2C3E50';       // Dark grey
const abyssBlue = '#154360';      // Even deeper blue
const seafoam = '#85D5F0';        // Light seafoam blue
const deepGrey = '#34495E';       // Slightly lighter grey
const charcoal = '#1C2833';       // Very dark grey/charcoal

export const Colors = {
  light: {
    text: oceanBlue,
    background: '#F8F9FA',
    tint: oceanBlue,
    icon: darkGrey,
    tabIconDefault: deepGrey,
    tabIconSelected: oceanBlue,
    // Additional diving theme colors
    primary: oceanBlue,
    secondary: lightBlue,
    accent: seafoam,
    surface: '#FFFFFF',
    border: '#E8F4F8',
    cardBackground: '#FFFFFF',
    overlay: 'rgba(27, 79, 114, 0.1)',
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
  },
  dark: {
    text: seafoam,
    background: charcoal,
    tint: lightBlue,
    icon: seafoam,
    tabIconDefault: '#7F8C8D',
    tabIconSelected: lightBlue,
    // Additional diving theme colors
    primary: lightBlue,
    secondary: abyssBlue,
    accent: seafoam,
    surface: darkGrey,
    border: '#455A64',
    cardBackground: deepGrey,
    overlay: 'rgba(93, 173, 226, 0.15)',
    success: '#2ECC71',
    warning: '#F4D03F',
    error: '#EC7063',
  },
};
