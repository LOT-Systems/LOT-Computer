/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'
import { useMemoryEngineStats, useAIUsageStats } from '#client/queries'
import { hasGrown, updateStatSnapshot, GrowthIndicator } from '#client/utils/statGrowth'

type EngineView = 'performance' | 'transmissions'

export function MemoryEngineStats() {
  const [view, setView] = React.useState<EngineView>('performance')
  const { data: stats, isLoading, error } = useMemoryEngineStats()
  const { data: usage } = useAIUsageStats()

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

  const cycleView = () => {
    setView(prev => prev === 'performance' ? 'transmissions' : 'performance')
  }

  // Render quality bars (text-based game aesthetic)
  const renderQualityBars = (rating: number) => {
    const fullBars = Math.floor(rating)
    const emptyBars = 5 - fullBars

    return (
      <span className="flex items-center gap-1">
        {Array(fullBars).fill('|').map((bar, i) => (
          <span key={`full-${i}`} className="text-acc">{bar}</span>
        ))}
        {Array(emptyBars).fill('|').map((bar, i) => (
          <span key={`empty-${i}`} className="opacity-30">{bar}</span>
        ))}
      </span>
    )
  }

  // Format large numbers with commas
  const formatNumber = (n: number): string => {
    return n.toLocaleString()
  }

  const label = view === 'performance' ? 'Memory Engine:' : 'AI Transmissions:'

  return (
    <Block label={label} blockView className="min-h-[200px]" onLabelClick={cycleView}>
      {view === 'performance' && (
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Questions Generated</span>
            <span>
              {stats.questionsGenerated}/day
              {hasGrown('questionsGenerated', stats.questionsGenerated) && <GrowthIndicator />}
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Response Quality</span>
            <span className="flex items-center gap-4">
              {renderQualityBars(stats.responseQuality)}
              <span>
                {stats.responseQuality.toFixed(1)}/5
                {hasGrown('responseQuality', stats.responseQuality * 100) && <GrowthIndicator />}
              </span>
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Avg Response Time</span>
            <span>{stats.avgResponseTime}ms</span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Context Depth</span>
            <span>
              {stats.contextDepth} logs
              {hasGrown('contextDepth', stats.contextDepth) && <GrowthIndicator />}
            </span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="opacity-30">AI Diversity Score</span>
            <span>
              {stats.aiDiversityScore}%
              {hasGrown('aiDiversityScore', stats.aiDiversityScore) && <GrowthIndicator />}
            </span>
          </div>
        </div>
      )}

      {view === 'transmissions' && (
        <div className="space-y-4">
          {!usage ? (
            <div className="opacity-30">Collecting transmission data.</div>
          ) : (
            <>
              <div className="flex justify-between items-baseline">
                <span className="opacity-30">Completions today</span>
                <span className="tabular-nums">{usage.today.totalCalls.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="opacity-30">Tokens processed</span>
                <span className="tabular-nums">{formatNumber(usage.today.totalTokens)}</span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="opacity-30">Image generations</span>
                <span className="tabular-nums">{usage.today.totalImageGenerations.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="opacity-30">Rate</span>
                <span className="tabular-nums">{usage.today.callsPerHour.toLocaleString()}/hr</span>
              </div>

              {/* Engine breakdown */}
              {Object.entries(usage.today.byEngine).length > 0 && (
                <div className="mt-8">
                  <div className="opacity-30 mb-4">Engine breakdown:</div>
                  {Object.entries(usage.today.byEngine).map(([engine, data]) => (
                    <div key={engine} className="flex justify-between items-baseline">
                      <span className="opacity-30">{engine}</span>
                      <span className="tabular-nums">
                        {data.calls.toLocaleString()} calls / {formatNumber(data.estimatedTokens)} tkn
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="opacity-30 mt-8">
                Session: {usage.session.totalCalls.toLocaleString()} calls / {formatNumber(usage.session.totalTokens)} tokens
              </div>
            </>
          )}
        </div>
      )}
    </Block>
  )
}
