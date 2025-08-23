import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet } from 'react-native';
import { DiveDetails } from '../types';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface DiveStatsCardProps {
  diveDetails: DiveDetails;
  style?: any;
}

export const DiveStatsCard: React.FC<DiveStatsCardProps> = ({ diveDetails, style }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Function to get condition color based on values
  const getDepthCondition = (depth: number) => {
    if (depth < 12) return { color: colors.success, condition: 'Shallow' };
    if (depth < 30) return { color: colors.primary, condition: 'Recreational' };
    return { color: colors.warning, condition: 'Deep' };
  };

  const getVisibilityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return colors.success;
      case 'Good': return colors.primary;
      case 'Fair': return colors.secondary;
      case 'Poor': return colors.warning;
      case 'Very Poor': return colors.error;
      default: return colors.text;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Calm': case 'None': return colors.success;
      case 'Light': return colors.primary;
      case 'Moderate': return colors.secondary;
      case 'Strong': return colors.warning;
      case 'Very Strong': return colors.error;
      default: return colors.text;
    }
  };

  const getTempCondition = (temp: number) => {
    if (temp > 20) return { color: colors.success, condition: 'Warm' };
    if (temp > 15) return { color: colors.primary, condition: 'Cool' };
    return { color: colors.warning, condition: 'Cold' };
  };

  const getDurationCondition = (duration: number) => {
    if (duration > 50) return { color: colors.success, condition: 'Extended' };
    if (duration > 30) return { color: colors.primary, condition: 'Standard' };
    return { color: colors.warning, condition: 'Short' };
  };

  const depthInfo = getDepthCondition(diveDetails.depth);
  const tempInfo = getTempCondition(diveDetails.waterTemp || 0);
  const durationInfo = getDurationCondition(diveDetails.diveDuration);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.overlay }, style]}>
      {/* Primary Stats Row */}
      <ThemedView style={styles.primaryStats}>
        <ThemedView style={styles.statGroup}>
          <ThemedView style={styles.statHeader}>
            <IconSymbol name="arrow.down" size={18} color={depthInfo.color} />
            <ThemedText style={[styles.statLabel, { color: colors.text }]}>Max Depth</ThemedText>
          </ThemedView>
          <ThemedText style={[styles.primaryValue, { color: depthInfo.color }]}>
            {diveDetails.depth}m
          </ThemedText>
          <ThemedText style={[styles.conditionText, { color: depthInfo.color }]}>
            {depthInfo.condition}
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.divider, { backgroundColor: colors.border }]} />

        <ThemedView style={styles.statGroup}>
          <ThemedView style={styles.statHeader}>
            <IconSymbol name="clock" size={18} color={durationInfo.color} />
            <ThemedText style={[styles.statLabel, { color: colors.text }]}>Dive Duration</ThemedText>
          </ThemedView>
          <ThemedText style={[styles.primaryValue, { color: durationInfo.color }]}>
            {diveDetails.diveDuration}min
          </ThemedText>
          <ThemedText style={[styles.conditionText, { color: durationInfo.color }]}>
            {durationInfo.condition}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Cape Town Dive Conditions */}
      <ThemedView style={styles.secondaryStats}>
        <ThemedView style={styles.miniStat}>
          <ThemedView style={styles.iconContainer}>
            <IconSymbol name="eye" size={16} color={getVisibilityColor(diveDetails.visibilityQuality)} />
          </ThemedView>
          <ThemedView style={styles.miniStatText}>
            <ThemedText style={[styles.miniValue, { color: getVisibilityColor(diveDetails.visibilityQuality) }]}>
              {diveDetails.visibilityQuality}
            </ThemedText>
            <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Visibility</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.miniStat}>
          <ThemedView style={styles.iconContainer}>
            <IconSymbol name="thermometer" size={16} color={tempInfo.color} />
          </ThemedView>
          <ThemedView style={styles.miniStatText}>
            <ThemedText style={[styles.miniValue, { color: tempInfo.color }]}>
              {diveDetails.waterTemp || 'N/A'}°C
            </ThemedText>
            <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Water Temp</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.miniStat}>
          <ThemedView style={styles.iconContainer}>
            <IconSymbol name="wind" size={16} color={getConditionColor(diveDetails.windConditions)} />
          </ThemedView>
          <ThemedView style={styles.miniStatText}>
            <ThemedText style={[styles.miniValue, { color: getConditionColor(diveDetails.windConditions) }]}>
              {diveDetails.windConditions}
            </ThemedText>
            <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Wind</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.miniStat}>
          <ThemedView style={styles.iconContainer}>
            <IconSymbol name="water.waves" size={16} color={getConditionColor(diveDetails.currentConditions)} />
          </ThemedView>
          <ThemedView style={styles.miniStatText}>
            <ThemedText style={[styles.miniValue, { color: getConditionColor(diveDetails.currentConditions) }]}>
              {diveDetails.currentConditions}
            </ThemedText>
            <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Current</ThemedText>
          </ThemedView>
        </ThemedView>


      </ThemedView>

      {/* Marine Life, Dive Companions & Timestamp */}
      {(diveDetails.seaLife?.length || diveDetails.buddyNames?.length || diveDetails.diveTimestamp) && (
        <ThemedView style={styles.additionalInfo}>
          {diveDetails.seaLife && diveDetails.seaLife.length > 0 && (
            <ThemedView style={styles.infoRow}>
              <ThemedView style={styles.infoIconContainer}>
                <IconSymbol name="pawprint" size={14} color={colors.like} />
              </ThemedView>
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                <ThemedText style={[styles.infoLabel, { color: colors.like }]}>Sea Life: </ThemedText>
                {diveDetails.seaLife.slice(0, 4).join(', ')}
                {diveDetails.seaLife.length > 4 && ` +${diveDetails.seaLife.length - 4} more`}
              </ThemedText>
            </ThemedView>
          )}
          
          {diveDetails.buddyNames && diveDetails.buddyNames.length > 0 && (
            <ThemedView style={styles.infoRow}>
              <ThemedView style={styles.infoIconContainer}>
                <IconSymbol name="person.2" size={14} color={colors.accent} />
              </ThemedView>
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                <ThemedText style={[styles.infoLabel, { color: colors.accent }]}>Buddies: </ThemedText>
                {diveDetails.buddyNames.join(', ')}
              </ThemedText>
            </ThemedView>
          )}

          {diveDetails.diveTimestamp && (
            <ThemedView style={styles.infoRow}>
              <ThemedView style={styles.infoIconContainer}>
                <IconSymbol name="clock.badge.checkmark" size={14} color={colors.share} />
              </ThemedView>
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                <ThemedText style={[styles.infoLabel, { color: colors.share }]}>Recorded: </ThemedText>
                {diveDetails.diveTimestamp.toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 18,
    margin: 8,
  },
  primaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statGroup: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
  },
  primaryValue: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
    marginHorizontal: 20,
  },
  secondaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 8,
  },
  miniStatText: {
    flex: 1,
  },
  miniValue: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  miniLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
    flex: 1,
    lineHeight: 16,
  },
  infoLabel: {
    fontWeight: '600',
    opacity: 1,
  },
});
