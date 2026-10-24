/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'
import { useOSIndexes } from '#client/queries'
import { ProgressBars } from '#client/utils/progressBars'

type IndexView = 'current' | 'timeline' | 'correlation'

/**
 * Correlated Indexes Widget — Four-dimensional long-term tracking
 *
 * Displays selfAwareness, userScore, personScore, longevityScore
 * with weekly timeline and correlation strength.
 *
 * Cycles: Current Scores > Timeline > Correlation
 */
export function CorrelatedIndexesWidget() {
  const [view, setView] = React.useState<IndexView>('current')
  const { data: indexes, isLoading } = useOSIndexes()

  const cycleView = () => {
    setView(prev =>
      prev === 'current' ? 'timeline' :
      prev === 'timeline' ? 'correlation' :
      'current'
    )
  }

  if (isLoading) return null
  if (!indexes) return null

  const label =
    view === 'current' ? 'Indexes:' :
    view === 'timeline' ? 'Index Timeline:' :
    'Index Correlation:'

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'current' && (
        <div>
          <div className="flex flex-col gap-8 mb-16">
            <div className="flex items-center gap-8">
              <span className="w-[110px]">Self-awareness</span>
              <ProgressBars percentage={indexes.selfAwareness} barCount={10} />
              <span className="tabular-nums w-[36px] text-right">{indexes.selfAwareness.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[110px]">User</span>
              <ProgressBars percentage={indexes.userScore} barCount={10} />
              <span className="tabular-nums w-[36px] text-right">{indexes.userScore.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[110px]">Person</span>
              <ProgressBars percentage={indexes.personScore} barCount={10} />
              <span className="tabular-nums w-[36px] text-right">{indexes.personScore.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[110px]">Longevity</span>
              <ProgressBars percentage={indexes.longevityScore} barCount={10} />
              <span className="tabular-nums w-[36px] text-right">{indexes.longevityScore.toFixed(0)}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Composite</span>
            <span className="tabular-nums">{indexes.composite.toFixed(1)}</span>
          </div>
          <div className="opacity-30 mt-4">
            Trend: {
              indexes.trend === 'ascending' ? 'ascending.' :
              indexes.trend === 'descending' ? 'descending.' :
              'holding steady.'
            }
          </div>
        </div>
      )}

      {view === 'timeline' && (
        <div>
          {indexes.timeline.length === 0 ? (
            <div className="opacity-30">
              Insufficient data for timeline. Keep engaging to build history.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex gap-8 mb-4 opacity-30">
                <span className="w-[72px]">Week</span>
                <span className="w-[28px] text-right">SA</span>
                <span className="w-[28px] text-right">US</span>
                <span className="w-[28px] text-right">PS</span>
                <span className="w-[28px] text-right">LS</span>
                <span className="w-[28px] text-right">C</span>
              </div>
              {indexes.timeline.slice(-8).map((entry) => (
                <div key={entry.week} className="flex gap-8">
                  <span className="w-[72px] opacity-50 tabular-nums">{entry.week.replace(/^\d{4}-/, '')}</span>
                  <span className="w-[28px] text-right tabular-nums">{entry.selfAwareness.toFixed(0)}</span>
                  <span className="w-[28px] text-right tabular-nums">{entry.userScore.toFixed(0)}</span>
                  <span className="w-[28px] text-right tabular-nums">{entry.personScore.toFixed(0)}</span>
                  <span className="w-[28px] text-right tabular-nums">{entry.longevityScore.toFixed(0)}</span>
                  <span className="w-[28px] text-right tabular-nums">{entry.composite.toFixed(0)}</span>
                </div>
              ))}
              <div className="mt-8 opacity-30">
                SA=Self-awareness US=User PS=Person LS=Longevity C=Composite
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'correlation' && (
        <div>
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Correlation strength</span>
            <span className="tabular-nums">{(indexes.correlationStrength * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-8 mb-16">
            <ProgressBars percentage={indexes.correlationStrength * 100} barCount={10} />
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-baseline">
              <span className="opacity-30">Self-awareness</span>
              <span className="tabular-nums">{indexes.selfAwareness.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-30">User score</span>
              <span className="tabular-nums">{indexes.userScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-30">Person score</span>
              <span className="tabular-nums">{indexes.personScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-30">Longevity score</span>
              <span className="tabular-nums">{indexes.longevityScore.toFixed(1)}</span>
            </div>
          </div>

          <div className="mt-12 opacity-30">
            {indexes.correlationStrength > 0.7
              ? 'Indexes moving in strong alignment.'
              : indexes.correlationStrength > 0.4
              ? 'Moderate alignment across dimensions.'
              : 'Indexes developing independently — focus builds correlation.'}
          </div>
        </div>
      )}
    </Block>
  )
}
