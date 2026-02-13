import React from 'react'
import { Block } from '#client/components/ui'
import { usePatternStats } from '#client/queries'

export function IntentionPatterns() {
  const { data: stats, isLoading, error } = usePatternStats()

  if (isLoading || error || !stats) {
    return null
  }

  const { patterns, mostActive } = stats

  // Sort patterns by count
  const sortedPatterns = Object.entries(patterns)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])

  if (sortedPatterns.length === 0) {
    return null // Don't show if no data
  }

  return (
    <Block label="Quantum Patterns Today:" blockView className="min-h-[200px]">
      <div className="space-y-4">
        {sortedPatterns.map(([pattern, count]) => (
          <div key={pattern} className="flex justify-between items-center">
            <span className="opacity-30">{pattern}</span>
            <span className="tabular-nums">{count}</span>
          </div>
        ))}

        <div className="pt-4 mt-8 border-t border-acc/20">
          <div className="opacity-30 mb-8">Most Active Pattern</div>
          <div className="opacity-30">{mostActive}</div>
        </div>
      </div>
    </Block>
  )
}
