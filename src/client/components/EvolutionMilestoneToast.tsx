/**
 * Evolution Milestone Toast
 *
 * Displays subtle notifications when user crosses evolution milestones
 * or unlocks new features through their spiritual/psychological progression.
 */

import React from 'react';
import { useStore } from '@nanostores/react';
import { $featureUnlocks } from '#client/stores/evolution';

interface Milestone {
  message: string;
  timestamp: string;
}

export function EvolutionMilestoneToast() {
  const [currentMilestone, setCurrentMilestone] = React.useState<Milestone | null>(null);
  const [showToast, setShowToast] = React.useState(false);
  const [seenMilestones, setSeenMilestones] = React.useState<Set<string>>(new Set());

  const featureUnlocks = useStore($featureUnlocks);

  // Check for new milestones
  React.useEffect(() => {
    const checkMilestones = () => {
      const milestonesStr = localStorage.getItem('evolution_milestones');
      if (!milestonesStr) return;

      const milestones: Milestone[] = JSON.parse(milestonesStr);
      if (milestones.length === 0) return;

      const latest = milestones[0];
      const milestoneKey = `${latest.message}-${latest.timestamp}`;

      if (!seenMilestones.has(milestoneKey)) {
        setCurrentMilestone(latest);
        setShowToast(true);
        setSeenMilestones(prev => new Set(prev).add(milestoneKey));

        // Auto-hide after 6 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 6000);
      }
    };

    // Check on mount and every 30 seconds
    checkMilestones();
    const interval = setInterval(checkMilestones, 30000);
    return () => clearInterval(interval);
  }, [seenMilestones]);

  // Count newly unlocked features
  const unlockedCount = React.useMemo(() => {
    if (!featureUnlocks) return 0;
    return Object.values(featureUnlocks).filter(Boolean).length;
  }, [featureUnlocks]);

  if (!showToast || !currentMilestone) return null;

  return (
    <div
      className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50
                 px-16 py-8 border border-[rgb(var(--acc-color-default)/0.2)]
                 bg-[var(--base-color)] grid-fill-light
                 animate-fade-in-up evolved-text evolved-opacity"
      style={{
        animation: 'fadeInUp 0.5s ease-out, fadeOut 0.5s ease-in 5.5s forwards'
      }}
    >
      <div className="text-center">
        <div className="mb-4 evolved-glow">
          {currentMilestone.message}
        </div>
        {unlockedCount > 0 && (
          <div>
            {unlockedCount} feature{unlockedCount !== 1 ? 's' : ''} unlocked
          </div>
        )}
      </div>
    </div>
  );
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}
