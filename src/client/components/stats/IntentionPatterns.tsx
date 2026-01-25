import React from 'react'
import { Block } from '#client/components/ui'
import { usePatternStats } from '#client/queries'

const patternEmojis: { [key: string]: string } = {
  'Flow State': '🌊',
  'Precision Focus': '🎯',
  'Exploration Mode': '🌀',
  'Energy Surge': '⚡',
  'Rest & Renewal': '🌙',
  'Creative Expression': '🎨',
  'Connection Seeking': '🤝'
}

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
            <span className="flex items-center gap-2">
              <span className="text-lg">{patternEmojis[pattern] || '✨'}</span>
              <span className="opacity-80">{pattern}</span>
            </span>
            <span className="text-xl font-mono tabular-nums">{count}</span>
          </div>
        ))}

        <div className="pt-4 mt-6 border-t border-acc/20 text-sm">
          <div className="opacity-60 mb-1">Most Active Pattern</div>
          <div className="text-lg flex items-center gap-2">
            <span>{patternEmojis[mostActive] || '✨'}</span>
            <span>{mostActive}</span>
          </div>
        </div>
      </div>
    </Block>
  )
}
