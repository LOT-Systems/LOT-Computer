import React from 'react'
import { Block } from '#client/components/ui'
import { useGrowthStats } from '#client/queries'

export function GrowthMilestones() {
  const { data: stats, isLoading, error } = useGrowthStats()

  if (isLoading || error || !stats) {
    return null
  }

  const { personal, community } = stats

  return (
    <Block label="Growth Metrics:" blockView className="min-h-[200px]">
      <div className="space-y-8">
        {/* Personal Journey */}
        <div>
          <div className="text-sm opacity-60 mb-4">Your Journey</div>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="opacity-80">Days</span>
              <span className="text-2xl font-mono tabular-nums">{personal.journeyDays}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-80">Questions Answered</span>
              <span className="text-2xl font-mono tabular-nums">{personal.questionsAnswered}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-80">Insights Gained</span>
              <span className="text-2xl font-mono tabular-nums">{personal.insightsGained}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-acc/20">
              <span className="opacity-80">Badge Level</span>
              <span className="text-xl font-mono">{personal.badgeLevel} ({personal.badgeCount})</span>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="pt-6 border-t border-acc/20">
          <div className="text-sm opacity-60 mb-4">Community</div>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="opacity-80">Total Souls</span>
              <span className="text-xl font-mono tabular-nums">{community.totalSouls.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-80">Days of Operation</span>
              <span className="text-xl font-mono tabular-nums">{community.daysOfOperation}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-80">Collective Wisdom</span>
              <span className="text-xl font-mono tabular-nums">{community.collectiveWisdom.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Block>
  )
}
