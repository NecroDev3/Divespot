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

  const getVisibilityCondition = (visibility: number) => {
    if (visibility > 30) return { color: colors.success, condition: 'Excellent' };
    if (visibility > 15) return { color: colors.primary, condition: 'Good' };
    return { color: colors.warning, condition: 'Limited' };
  };

  const getTempCondition = (temp: number) => {
    if (temp > 24) return { color: colors.success, condition: 'Warm' };
    if (temp > 18) return { color: colors.primary, condition: 'Cool' };
    return { color: colors.warning, condition: 'Cold' };
  };

  const getTimeCondition = (time: number) => {
    if (time > 50) return { color: colors.success, condition: 'Extended' };
    if (time > 30) return { color: colors.primary, condition: 'Standard' };
    return { color: colors.warning, condition: 'Short' };
  };

  const depthInfo = getDepthCondition(diveDetails.depth);
  const visibilityInfo = getVisibilityCondition(diveDetails.visibility || 0);
  const tempInfo = getTempCondition(diveDetails.waterTemp || 0);
  const timeInfo = getTimeCondition(diveDetails.bottomTime);

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
            <IconSymbol name="clock" size={18} color={timeInfo.color} />
            <ThemedText style={[styles.statLabel, { color: colors.text }]}>Bottom Time</ThemedText>
          </ThemedView>
          <ThemedText style={[styles.primaryValue, { color: timeInfo.color }]}>
            {diveDetails.bottomTime}min
          </ThemedText>
          <ThemedText style={[styles.conditionText, { color: timeInfo.color }]}>
            {timeInfo.condition}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Secondary Stats Row */}
      <ThemedView style={styles.secondaryStats}>
        <ThemedView style={styles.miniStat}>
          <ThemedView style={styles.iconContainer}>
            <IconSymbol name="eye" size={16} color={visibilityInfo.color} />
          </ThemedView>
          <ThemedView style={styles.miniStatText}>
            <ThemedText style={[styles.miniValue, { color: visibilityInfo.color }]}>
              {diveDetails.visibility || 'N/A'}m
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

        {diveDetails.conditions && (
          <ThemedView style={styles.miniStat}>
            <ThemedView style={styles.iconContainer}>
              <IconSymbol name="wind" size={16} color={colors.secondary} />
            </ThemedView>
            <ThemedView style={styles.miniStatText}>
              <ThemedText style={[styles.miniValue, { color: colors.secondary }]}>
                {diveDetails.conditions}
              </ThemedText>
              <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Conditions</ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        <ThemedView style={styles.miniStat}>
          <ThemedView style={styles.iconContainer}>
            <IconSymbol name="calendar" size={16} color={colors.accent} />
          </ThemedView>
          <ThemedView style={styles.miniStatText}>
            <ThemedText style={[styles.miniValue, { color: colors.accent }]}>
              {diveDetails.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </ThemedText>
            <ThemedText style={[styles.miniLabel, { color: colors.text }]}>Dive Date</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Equipment and Buddies */}
      {(diveDetails.equipment?.length || diveDetails.buddyNames?.length) && (
        <ThemedView style={styles.additionalInfo}>
          {diveDetails.equipment && diveDetails.equipment.length > 0 && (
            <ThemedView style={styles.infoRow}>
              <ThemedView style={styles.infoIconContainer}>
                <IconSymbol name="wrench.and.screwdriver" size={14} color={colors.secondary} />
              </ThemedView>
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                {diveDetails.equipment.slice(0, 3).join(', ')}
                {diveDetails.equipment.length > 3 && ` +${diveDetails.equipment.length - 3} more`}
              </ThemedText>
            </ThemedView>
          )}
          
          {diveDetails.buddyNames && diveDetails.buddyNames.length > 0 && (
            <ThemedView style={styles.infoRow}>
              <ThemedView style={styles.infoIconContainer}>
                <IconSymbol name="person.2" size={14} color={colors.accent} />
              </ThemedView>
              <ThemedText style={[styles.infoText, { color: colors.text }]}>
                With {diveDetails.buddyNames.join(', ')}
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
});
