import React from 'react'
import { Block } from '#client/components/ui'
import { useMemoryEngineStats } from '#client/queries'
import { hasGrown, updateStatSnapshot, GrowthIndicator } from '#client/utils/statGrowth'

export function MemoryEngineStats() {
  const { data: stats, isLoading, error } = useMemoryEngineStats()

  // Track stat changes
  React.useEffect(() => {
    if (!stats) return

    setTimeout(() => {
      updateStatSnapshot({
        questionsGenerated: stats.questionsGenerated,
        responseQuality: stats.responseQuality * 100, // Convert to percentage for comparison
        contextDepth: stats.contextDepth,
        aiDiversityScore: stats.aiDiversityScore,
      })
    }, 2000)
  }, [stats])

  // Don't show if user doesn't have access (403 error)
  if (error || isLoading || !stats) {
    return null
  }

  // Render quality bars (LOT design system - no emojis)
  const renderQualityBars = (rating: number) => {
    const fullBars = Math.floor(rating)
    const emptyBars = 5 - fullBars

    return (
      <span className="flex items-center gap-1 font-mono">
        {Array(fullBars).fill('|').map((bar, i) => (
          <span key={`full-${i}`} className="text-acc">{bar}</span>
        ))}
        {Array(emptyBars).fill('|').map((bar, i) => (
          <span key={`empty-${i}`} className="opacity-30">{bar}</span>
        ))}
      </span>
    )
  }

  return (
    <Block label="Memory Engine:" blockView className="min-h-[200px]">
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="opacity-60">Questions Generated</span>
          <span className="font-mono tabular-nums">
            {stats.questionsGenerated}/day
            {hasGrown('questionsGenerated', stats.questionsGenerated) && <GrowthIndicator />}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="opacity-60">Response Quality</span>
          <span className="flex items-center gap-3">
            {renderQualityBars(stats.responseQuality)}
            <span className="font-mono">
              {stats.responseQuality.toFixed(1)}/5
              {hasGrown('responseQuality', stats.responseQuality * 100) && <GrowthIndicator />}
            </span>
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="opacity-60">Avg Response Time</span>
          <span className="font-mono tabular-nums">{stats.avgResponseTime}ms</span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="opacity-60">Context Depth</span>
          <span className="font-mono tabular-nums">
            {stats.contextDepth} logs
            {hasGrown('contextDepth', stats.contextDepth) && <GrowthIndicator />}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="opacity-60">AI Diversity Score</span>
          <span className="font-mono tabular-nums">
            {stats.aiDiversityScore}%
            {hasGrown('aiDiversityScore', stats.aiDiversityScore) && <GrowthIndicator />}
          </span>
        </div>
      </div>
    </Block>
  )
}
