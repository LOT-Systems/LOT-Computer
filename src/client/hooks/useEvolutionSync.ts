/**
 * Evolution Sync Hook
 *
 * Syncs interface evolution state with:
 * - Narrative achievements and level progression
 * - Badge unlocks and theme selection
 * - User stats (streak, entries)
 *
 * Call this hook once in the main System component to keep
 * evolution state reactive to user progression.
 */

import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { useNarrative } from '#client/queries';
import { updateEvolutionState } from '#client/stores/evolution';
import type { Achievement } from '#client/utils/interfaceEvolution';

export function useEvolutionSync(
  totalEntries: number,
  currentStreak: number
) {
  const { data: narrativeData } = useNarrative();
  const [lastMilestone, setLastMilestone] = useState<string | null>(null);

  useEffect(() => {
    if (!narrativeData?.narrative) return;

    const { narrative } = narrativeData;

    // Get badge theme from localStorage
    const badgeTheme = localStorage.getItem('badge_theme') as 'water' | 'architecture' | null;
    const earnedBadgesStr = localStorage.getItem('earned_badges') || '';
    const earnedBadges = earnedBadgesStr ? earnedBadgesStr.split(',') : [];

    // Convert narrative achievements to our format
    const achievements: Achievement[] = narrative.achievements
      .filter((a: any) => a.unlocked)
      .map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        unlock_date: a.unlockedAt || new Date().toISOString(),
        rarity: mapRarityFromNarrative(a.rarity || 'common')
      }));

    // Update evolution state
    const milestone = updateEvolutionState({
      achievements,
      level: narrative.currentLevel,
      streak: currentStreak,
      totalEntries,
      badgeTheme,
      earnedBadges
    });

    // Track milestone for notification
    if (milestone && milestone !== lastMilestone) {
      setLastMilestone(milestone);

      // Show subtle notification (we'll create a toast system)
      console.log('Evolution Milestone:', milestone);

      // Store milestone for display in evolution widget or notification
      const milestones = JSON.parse(localStorage.getItem('evolution_milestones') || '[]');
      milestones.unshift({
        message: milestone,
        timestamp: new Date().toISOString()
      });
      // Keep only last 10 milestones
      localStorage.setItem('evolution_milestones', JSON.stringify(milestones.slice(0, 10)));
    }
  }, [narrativeData, totalEntries, currentStreak, lastMilestone]);

  return { lastMilestone };
}

/**
 * Map narrative rarity to achievement rarity
 */
function mapRarityFromNarrative(rarity: string): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  const rarityMap: Record<string, 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'> = {
    'common': 'common',
    'uncommon': 'uncommon',
    'rare': 'rare',
    'epic': 'epic',
    'legendary': 'legendary'
  };
  return rarityMap[rarity.toLowerCase()] || 'common';
}
