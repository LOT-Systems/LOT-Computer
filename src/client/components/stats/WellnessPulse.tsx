import React from 'react'
import { Block } from '#client/components/ui'
import { useWellnessStats } from '#client/queries'
import { hasGrown, updateStatSnapshot, GrowthIndicator } from '#client/utils/statGrowth'

export function WellnessPulse() {
  const { data: stats, isLoading, error } = useWellnessStats()

  // Track stat changes
  React.useEffect(() => {
    if (!stats) return

    setTimeout(() => {
      updateStatSnapshot({
        activeNow: stats.activeNow,
        questionsToday: stats.questionsToday,
        reflectionsToday: stats.reflectionsToday,
        careMomentsToday: stats.careMomentsToday,
      })
    }, 2000)
  }, [stats])

  if (isLoading || error || !stats) {
    return null
  }

  return (
    <Block label="Community Wellness:" blockView className="min-h-[200px]">
      <div className="inline-block">
        {/* Active now */}
        <div className="mb-16">
          <div className="opacity-60 mb-4">Active now</div>
          <div className="flex items-baseline gap-4">
            <span className="tabular-nums">{stats.activeNow} users</span>
            {hasGrown('activeNow', stats.activeNow) && <GrowthIndicator />}
          </div>
        </div>

        {/* Today's activity */}
        <div className="flex flex-col gap-8 mb-16">
          <div className="flex justify-between items-baseline">
            <span className="opacity-60">Questions</span>
            <span className="flex items-center gap-4">
              <span className="tabular-nums">{stats.questionsToday}</span>
              {hasGrown('questionsToday', stats.questionsToday) && <GrowthIndicator />}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="opacity-60">Reflections</span>
            <span className="flex items-center gap-4">
              <span className="tabular-nums">{stats.reflectionsToday}</span>
              {hasGrown('reflectionsToday', stats.reflectionsToday) && <GrowthIndicator />}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="opacity-60">Care moments</span>
            <span className="flex items-center gap-4">
              <span className="tabular-nums">{stats.careMomentsToday}</span>
              {hasGrown('careMomentsToday', stats.careMomentsToday) && <GrowthIndicator />}
            </span>
          </div>
        </div>

        {/* Peak hours */}
        <div className="flex justify-between items-baseline mb-8">
          <span className="opacity-60">Peak energy hour</span>
          <span>{stats.peakEnergyHour}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="opacity-60">Quietest hour</span>
          <span>{stats.quietestHour}</span>
        </div>
      </div>
    </Block>
  )
}
