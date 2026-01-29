import React from 'react'
import { Block } from '#client/components/ui'
import { useGrowthStats } from '#client/queries'
import { hasGrown, updateStatSnapshot, GrowthIndicator } from '#client/utils/statGrowth'

export function GrowthMilestones() {
  const { data: stats, isLoading, error } = useGrowthStats()

  // Track stat changes on mount and when stats update
  React.useEffect(() => {
    if (!stats) return

    const { personal, community } = stats

    // Update snapshot with current values (after checking growth)
    // Use setTimeout to ensure hasGrown checks happen first
    setTimeout(() => {
      updateStatSnapshot({
        journeyDays: personal.journeyDays,
        questionsAnswered: personal.questionsAnswered,
        insightsGained: personal.insightsGained,
        badgeCount: personal.badgeCount,
        totalSouls: community.totalSouls,
        daysOfOperation: community.daysOfOperation,
        collectiveWisdom: community.collectiveWisdom,
      })
    }, 2000) // 2 second delay to show arrows before updating
  }, [stats])

  if (isLoading || error || !stats) {
    return null
  }

  const { personal, community } = stats

  return (
    <Block label="Growth Metrics:" blockView className="min-h-[200px]">
      <div className="space-y-12">
        {/* Personal Journey */}
        <div>
          <div className="opacity-60 mb-6">Your Journey</div>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="opacity-60">Days</span>
              <span>
                {personal.journeyDays}
                {hasGrown('journeyDays', personal.journeyDays) && <GrowthIndicator />}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-60">Questions Answered</span>
              <span>
                {personal.questionsAnswered}
                {hasGrown('questionsAnswered', personal.questionsAnswered) && <GrowthIndicator />}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-60">Insights Gained</span>
              <span>
                {personal.insightsGained}
                {hasGrown('insightsGained', personal.insightsGained) && <GrowthIndicator />}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-acc/20">
              <span className="opacity-60">Badge Level</span>
              <span>
                {personal.badgeLevel} ({personal.badgeCount})
                {hasGrown('badgeCount', personal.badgeCount) && <GrowthIndicator />}
              </span>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="pt-6 border-t border-acc/20">
          <div className="opacity-60 mb-4">Community</div>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="opacity-60">Total Souls</span>
              <span>
                {community.totalSouls.toLocaleString()}
                {hasGrown('totalSouls', community.totalSouls) && <GrowthIndicator />}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-60">Days of Operation</span>
              <span>
                {community.daysOfOperation}
                {hasGrown('daysOfOperation', community.daysOfOperation) && <GrowthIndicator />}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-60">Collective Wisdom</span>
              <span>
                {community.collectiveWisdom.toLocaleString()}
                {hasGrown('collectiveWisdom', community.collectiveWisdom) && <GrowthIndicator />}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Block>
  )
}
