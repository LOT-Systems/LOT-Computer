import React from 'react'
import { Block } from '#client/components/ui'
import { useCollectiveStats } from '#client/queries'
import { cn } from '#client/utils'

export function CollectiveConsciousness() {
  const { data: stats, isLoading, error } = useCollectiveStats()

  if (isLoading || error || !stats) {
    return null
  }

  // Calculate bar widths for progress bars
  const energyWidth = `${stats.energyLevel}%`
  const clarityWidth = `${stats.clarityIndex}%`
  const alignmentWidth = `${stats.alignmentScore}%`

  return (
    <Block label="Collective State:" blockView className="min-h-[200px]">
      <div className="space-y-6">
        {/* Energy Level */}
        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="opacity-80">Energy Level</span>
            <span className="font-mono">{stats.energyLevel}%</span>
          </div>
          <div className="w-full bg-acc/10 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                'h-full bg-acc rounded-full transition-all duration-500',
                stats.energyLevel >= 70 && 'bg-green-500',
                stats.energyLevel < 50 && 'bg-orange-500'
              )}
              style={{ width: energyWidth }}
            />
          </div>
        </div>

        {/* Clarity Index */}
        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="opacity-80">Clarity Index</span>
            <span className="font-mono">{stats.clarityIndex}%</span>
          </div>
          <div className="w-full bg-acc/10 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                'h-full bg-acc rounded-full transition-all duration-500',
                stats.clarityIndex >= 70 && 'bg-blue-500',
                stats.clarityIndex < 50 && 'bg-yellow-500'
              )}
              style={{ width: clarityWidth }}
            />
          </div>
        </div>

        {/* Alignment Score */}
        <div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="opacity-80">Alignment Score</span>
            <span className="font-mono">{stats.alignmentScore}%</span>
          </div>
          <div className="w-full bg-acc/10 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                'h-full bg-acc rounded-full transition-all duration-500',
                stats.alignmentScore >= 70 && 'bg-purple-500'
              )}
              style={{ width: alignmentWidth }}
            />
          </div>
        </div>

        {/* Souls in Flow */}
        <div className="pt-4 border-t border-acc/20">
          <div className="flex justify-between items-center">
            <span className="opacity-80">Souls in Flow</span>
            <span className="text-2xl font-mono tabular-nums">{stats.soulsInFlow}</span>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="opacity-60 mb-1">Active Intentions</div>
            <div className="text-lg font-mono tabular-nums">{stats.activeIntentions}</div>
          </div>
          <div>
            <div className="opacity-60 mb-1">Care Moments</div>
            <div className="text-lg font-mono tabular-nums">{stats.careMoments}</div>
          </div>
        </div>
      </div>
    </Block>
  )
}
