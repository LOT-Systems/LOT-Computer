import React from 'react'
import { Block } from '#client/components/ui'
import { useBadgeStats } from '#client/queries'

function formatTimeAgo(minutes: number): string {
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${Math.floor(minutes)}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function BadgeUnlockFeed() {
  const { data: stats, isLoading, error } = useBadgeStats()

  if (isLoading || error || !stats) {
    return null
  }

  if (stats.recentUnlocks.length === 0) {
    return null // Don't show if no recent unlocks
  }

  return (
    <Block label="Recent Unlocks:" blockView className="min-h-[200px]">
      <div className="space-y-4">
        {stats.recentUnlocks.slice(0, 5).map((unlock, index) => (
          <div
            key={index}
            className="flex justify-between items-center hover:opacity-100 transition-opacity"
          >
            <span>
              {unlock.userName} unlocked {unlock.badge}
            </span>
            <span className="opacity-30 tabular-nums">{formatTimeAgo(unlock.timeAgo)}</span>
          </div>
        ))}

        <div className="pt-4 mt-4 border-t border-acc/20">
          <div className="opacity-30">{stats.totalToday} badges unlocked today</div>
        </div>
      </div>
    </Block>
  )
}
