import React from 'react'
import { Block } from '#client/components/ui'
import { useMemoryEngineStats } from '#client/queries'

export function MemoryEngineStats() {
  const { data: stats, isLoading, error } = useMemoryEngineStats()

  // Don't show if user doesn't have access (403 error)
  if (error || isLoading || !stats) {
    return null
  }

  // Render quality stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <span className="flex items-center gap-0.5">
        {Array(fullStars).fill('★').map((star, i) => (
          <span key={`full-${i}`} className="text-acc">{star}</span>
        ))}
        {hasHalfStar && <span className="text-acc">☆</span>}
        {Array(emptyStars).fill('☆').map((star, i) => (
          <span key={`empty-${i}`} className="opacity-40">{star}</span>
        ))}
      </span>
    )
  }

  return (
    <Block label="Memory Engine:" blockView className="min-h-[200px]">
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="opacity-80">Questions Generated</span>
          <span className="text-xl font-mono tabular-nums">{stats.questionsGenerated}/day</span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="opacity-80">Response Quality</span>
          <span className="flex items-center gap-2">
            {renderStars(stats.responseQuality)}
            <span className="text-sm font-mono">{stats.responseQuality}/5</span>
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="opacity-80">Avg Response Time</span>
          <span className="text-lg font-mono tabular-nums">{stats.avgResponseTime}ms</span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="opacity-80">Context Depth</span>
          <span className="text-lg font-mono tabular-nums">{stats.contextDepth} logs</span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="opacity-80">AI Diversity Score</span>
          <span className="text-lg font-mono tabular-nums">{stats.aiDiversityScore}%</span>
        </div>
      </div>
    </Block>
  )
}
