import React from 'react'
import { Block } from '#client/components/ui'
import { useCollectiveStats } from '#client/queries'
import { ProgressBars } from '#client/utils/progressBars'

export function CollectiveConsciousness() {
  const { data: stats, isLoading, error } = useCollectiveStats()

  if (isLoading || error || !stats) {
    return null
  }

  return (
    <Block label="Collective State:" blockView>
      <div className="inline-block">
        {/* Dimensional metrics with text-based bars */}
        <div className="flex flex-col gap-8 mb-16">
          <div className="flex items-center gap-8">
            <span className="w-[80px] opacity-60">Energy</span>
            <ProgressBars percentage={stats.energyLevel} barCount={10} />
            <span className="tabular-nums">{stats.energyLevel}%</span>
          </div>

          <div className="flex items-center gap-8">
            <span className="w-[80px] opacity-60">Clarity</span>
            <ProgressBars percentage={stats.clarityIndex} barCount={10} />
            <span className="tabular-nums">{stats.clarityIndex}%</span>
          </div>

          <div className="flex items-center gap-8">
            <span className="w-[80px] opacity-60">Alignment</span>
            <ProgressBars percentage={stats.alignmentScore} barCount={10} />
            <span className="tabular-nums">{stats.alignmentScore}%</span>
          </div>
        </div>

        {/* Active users in flow */}
        <div className="flex justify-between items-baseline mb-8">
          <span className="opacity-60">Users in flow</span>
          <span className="tabular-nums">{stats.soulsInFlow}</span>
        </div>

        {/* Today's activity */}
        <div className="flex justify-between items-baseline mb-8">
          <span className="opacity-60">Active intentions</span>
          <span className="tabular-nums">{stats.activeIntentions}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="opacity-60">Care moments</span>
          <span className="tabular-nums">{stats.careMoments}</span>
        </div>
      </div>
    </Block>
  )
}
