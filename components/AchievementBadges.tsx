import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AchievementBadgesProps {
  achievements: string[];
  totalDives: number;
  maxDepth: number;
  totalBottomTime: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

export default function AchievementBadges({ 
  achievements, 
  totalDives, 
  maxDepth, 
  totalBottomTime 
}: AchievementBadgesProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const allAchievements: Achievement[] = [
    // Dive count achievements
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Complete 5 dives',
      icon: 'figure.wave',
      color: '#10B981',
      unlocked: achievements.includes('Getting Started'),
    },
    {
      id: 'double-digits',
      name: 'Double Digits',
      description: 'Complete 10 dives',
      icon: 'number.circle',
      color: '#3B82F6',
      unlocked: achievements.includes('Double Digits'),
    },
    {
      id: 'quarter-century',
      name: 'Quarter Century',
      description: 'Complete 25 dives',
      icon: 'star.circle',
      color: '#8B5CF6',
      unlocked: achievements.includes('Quarter Century Diver'),
    },
    {
      id: 'half-century',
      name: 'Half Century',
      description: 'Complete 50 dives',
      icon: 'crown',
      color: '#F59E0B',
      unlocked: achievements.includes('Half Century Diver'),
    },
    // Depth achievements
    {
      id: 'going-deeper',
      name: 'Going Deeper',
      description: 'Reach 15m depth',
      icon: 'arrow.down.circle',
      color: '#06B6D4',
      unlocked: achievements.includes('Going Deeper'),
    },
    {
      id: 'depth-seeker',
      name: 'Depth Seeker',
      description: 'Reach 20m depth',
      icon: 'arrow.down.square',
      color: '#0EA5E9',
      unlocked: achievements.includes('Depth Seeker'),
    },
    {
      id: 'deep-explorer',
      name: 'Deep Sea Explorer',
      description: 'Reach 30m depth',
      icon: 'water.waves',
      color: '#1E40AF',
      unlocked: achievements.includes('Deep Sea Explorer'),
    },
    // Time achievements
    {
      id: 'getting-experience',
      name: 'Getting Experience',
      description: '10+ hours underwater',
      icon: 'clock.circle',
      color: '#22C55E',
      unlocked: achievements.includes('Getting Experience'),
    },
    {
      id: 'experienced',
      name: 'Experienced',
      description: '25+ hours underwater',
      icon: 'hourglass',
      color: '#16A34A',
      unlocked: achievements.includes('Experienced'),
    },
    {
      id: 'time-master',
      name: 'Time Master',
      description: '50+ hours underwater',
      icon: 'timer',
      color: '#15803D',
      unlocked: achievements.includes('Time Master'),
    },
    // Cape Town specific
    {
      id: 'local-diver',
      name: 'Local Diver',
      description: 'Dive 5 Cape Town spots',
      icon: 'location.circle',
      color: '#DC2626',
      unlocked: achievements.includes('Local Diver'),
    },
    {
      id: 'cape-explorer',
      name: 'Cape Town Explorer',
      description: 'Dive 10 Cape Town spots',
      icon: 'map.circle',
      color: '#B91C1C',
      unlocked: achievements.includes('Cape Town Explorer'),
    },
    // Marine life
    {
      id: 'species-spotter',
      name: 'Species Spotter',
      description: 'Spot 10+ different species',
      icon: 'eye.circle',
      color: '#059669',
      unlocked: achievements.includes('Species Spotter'),
    },
    {
      id: 'marine-biologist',
      name: 'Marine Biologist',
      description: 'Spot 20+ different species',
      icon: 'leaf.circle',
      color: '#047857',
      unlocked: achievements.includes('Marine Biologist'),
    },
  ];

  const unlockedAchievements = allAchievements.filter(achievement => achievement.unlocked);
  const lockedAchievements = allAchievements.filter(achievement => !achievement.unlocked);

  const renderBadge = (achievement: Achievement, isLocked: boolean = false) => (
    <ThemedView
      key={achievement.id}
      style={[
        styles.badge,
        {
          backgroundColor: isLocked ? colors.surface : achievement.color + '20',
          borderColor: isLocked ? colors.border : achievement.color,
        },
      ]}
    >
      <ThemedView
        style={[
          styles.badgeIcon,
          {
            backgroundColor: isLocked ? colors.text + '20' : achievement.color,
          },
        ]}
      >
        <IconSymbol
          name={achievement.icon}
          size={16}
          color={isLocked ? colors.text + '40' : 'white'}
        />
      </ThemedView>
      <ThemedView style={styles.badgeContent}>
        <ThemedText
          style={[
            styles.badgeName,
            {
              color: isLocked ? colors.text + '60' : colors.text,
            },
          ]}
        >
          {achievement.name}
        </ThemedText>
        <ThemedText
          style={[
            styles.badgeDescription,
            {
              color: isLocked ? colors.text + '40' : colors.text + '80',
            },
          ]}
        >
          {achievement.description}
        </ThemedText>
      </ThemedView>
      {isLocked && (
        <IconSymbol
          name="lock.fill"
          size={14}
          color={colors.text + '30'}
          style={styles.lockIcon}
        />
      )}
    </ThemedView>
  );

  const getProgressMessage = () => {
    const nextMilestones = [];
    
    if (totalDives < 5) nextMilestones.push(`${5 - totalDives} dives to Getting Started`);
    else if (totalDives < 10) nextMilestones.push(`${10 - totalDives} dives to Double Digits`);
    else if (totalDives < 25) nextMilestones.push(`${25 - totalDives} dives to Quarter Century`);
    else if (totalDives < 50) nextMilestones.push(`${50 - totalDives} dives to Half Century`);
    
    if (maxDepth < 15) nextMilestones.push(`${15 - maxDepth}m deeper for Going Deeper`);
    else if (maxDepth < 20) nextMilestones.push(`${20 - maxDepth}m deeper for Depth Seeker`);
    else if (maxDepth < 30) nextMilestones.push(`${30 - maxDepth}m deeper for Deep Explorer`);
    
    return nextMilestones.length > 0 ? nextMilestones[0] : 'Keep diving to unlock more achievements!';
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="trophy.fill" size={20} color={colors.primary} />
        <ThemedText type="subtitle" style={[styles.title, { color: colors.primary }]}>
          Achievements
        </ThemedText>
        <ThemedView style={[styles.achievementCount, { backgroundColor: colors.primary }]}>
          <ThemedText style={styles.achievementCountText}>
            {unlockedAchievements.length}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {unlockedAchievements.length === 0 ? (
        <ThemedView style={styles.noAchievements}>
          <IconSymbol name="star" size={32} color={colors.text + '40'} />
          <ThemedText style={[styles.noAchievementsText, { color: colors.text + '60' }]}>
            No achievements unlocked yet
          </ThemedText>
          <ThemedText style={styles.progressHint}>
            {getProgressMessage()}
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgeList}
            >
              {unlockedAchievements.map(achievement => renderBadge(achievement, false))}
            </ScrollView>
          )}

          {/* Progress hint */}
          <ThemedText style={styles.progressHint}>
            {getProgressMessage()}
          </ThemedText>

          {/* Next achievements to unlock */}
          {lockedAchievements.length > 0 && (
            <>
              <ThemedText style={[styles.sectionTitle, { color: colors.text + '60' }]}>
                Coming Up
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgeList}
              >
                {lockedAchievements.slice(0, 3).map(achievement => renderBadge(achievement, true))}
              </ScrollView>
            </>
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    marginHorizontal: 20,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  title: {
    flex: 1,
  },
  achievementCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeList: {
    gap: 14,
  },
  badge: {
    width: 170,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContent: {
    flex: 1,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  badgeDescription: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
  },
  lockIcon: {
    marginLeft: 4,
  },
  noAchievements: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  noAchievementsText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressHint: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
});
