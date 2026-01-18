import React from 'react'
import { Block } from '#client/components/ui'
import { useWellnessStats } from '#client/queries'

export function WellnessPulse() {
  const { data: stats, isLoading, error } = useWellnessStats()

  if (isLoading || error || !stats) {
    return null
  }

  return (
    <Block label="Community Wellness:" blockView className="min-h-[200px]">
      <div className="space-y-6">
        {/* Active Now */}
        <div className="pb-4 border-b border-acc/20">
          <div className="opacity-60 text-sm mb-2">Active Now</div>
          <div className="text-3xl font-mono tabular-nums">{stats.activeNow} souls</div>
        </div>

        {/* Today's Activity */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="opacity-60 text-xs mb-1">Questions</div>
            <div className="text-2xl font-mono tabular-nums">{stats.questionsToday}</div>
          </div>
          <div>
            <div className="opacity-60 text-xs mb-1">Reflections</div>
            <div className="text-2xl font-mono tabular-nums">{stats.reflectionsToday}</div>
          </div>
          <div>
            <div className="opacity-60 text-xs mb-1">Care</div>
            <div className="text-2xl font-mono tabular-nums">{stats.careMomentsToday}</div>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-acc/20 text-sm">
          <div>
            <div className="opacity-60 mb-1">Peak Energy Hour</div>
            <div className="font-mono">{stats.peakEnergyHour}</div>
          </div>
          <div>
            <div className="opacity-60 mb-1">Quietest Hour</div>
            <div className="font-mono">{stats.quietestHour}</div>
          </div>
        </div>
      </div>
    </Block>
  )
}
