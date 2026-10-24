/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import { intentionEngine, getUserState, type UserState } from '#client/stores/intentionEngine'
import { useLogs } from '#client/queries'
import { ProgressBars } from '#client/utils/progressBars'
import { useLogContext } from '#client/hooks/useLogContext'

type QuantumView = 'state' | 'dimensions' | 'history'

/**
 * CQGS Quantum State Widget - Real-time 4D biofield state from QIE
 * Displays ATP energy, clarity, alignment, and support needs as text-based meters.
 * Cross-referenced with log context for biofeedback loop.
 * Cycles: Biofield State > Signal Allocation > Signal Log
 */
export function QuantumStateWidget() {
  const [view, setView] = React.useState<QuantumView>('state')
  const engine = useStore(intentionEngine)
  const { data: logs = [] } = useLogs()
  const logCtx = useLogContext()

  const userState = getUserState()

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'state': return 'dimensions'
        case 'dimensions': return 'history'
        case 'history': return 'state'
        default: return 'state'
      }
    })
  }

  // Don't render if no signals have been recorded
  if (engine.signals.length === 0) return null

  const label =
    view === 'state' ? 'Biofield State:' :
    view === 'dimensions' ? 'Signal Allocation:' :
    'Signal Log:'

  // Map state values to numeric percentages for bars
  const getEnergyPercent = (energy: UserState['energy']): number => {
    switch (energy) {
      case 'depleted': return 10
      case 'low': return 30
      case 'moderate': return 60
      case 'high': return 90
      default: return 0
    }
  }

  const getClarityPercent = (clarity: UserState['clarity']): number => {
    switch (clarity) {
      case 'confused': return 10
      case 'uncertain': return 30
      case 'clear': return 60
      case 'focused': return 90
      default: return 0
    }
  }

  const getAlignmentPercent = (alignment: UserState['alignment']): number => {
    switch (alignment) {
      case 'disconnected': return 10
      case 'searching': return 30
      case 'aligned': return 60
      case 'flowing': return 90
      default: return 0
    }
  }

  const getSupportPercent = (support: UserState['needsSupport']): number => {
    switch (support) {
      case 'critical': return 90
      case 'moderate': return 60
      case 'low': return 30
      case 'none': return 5
      default: return 0
    }
  }

  // Get signal count by source
  const signalCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    engine.signals.forEach(s => {
      counts[s.source] = (counts[s.source] || 0) + 1
    })
    return counts
  }, [engine.signals])

  // Check for active full-stack session (fired in last 4 hours)
  const hasFullStack = React.useMemo(() => {
    const fourHoursAgoTs = Date.now() - 4 * 60 * 60 * 1000
    return engine.signals.some(s =>
      s.signal === 'full_stack_session' && s.timestamp > fourHoursAgoTs
    )
  }, [engine.signals])

  // Get recent signals for history view
  const recentSignals = React.useMemo(() => {
    return [...engine.signals]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8)
  }, [engine.signals])

  const formatTimeAgo = (timestamp: number): string => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  // Format raw signal names into human-readable labels
  const formatSignal = (signal: string): string => {
    const signalLabels: Record<string, string> = {
      'prompt_accepted': 'Prompt accepted',
      'prompt_skipped': 'Prompt skipped',
      'energy_low': 'Energy: low',
      'energy_depleted': 'Energy: depleted',
      'energy_moderate': 'Energy: moderate',
      'energy_high': 'Energy: high',
      'energy_unknown': 'Energy: scanning',
      'awareness_explored': 'Awareness explored',
    }
    if (signalLabels[signal]) return signalLabels[signal]
    return signal.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
  }

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'state' && (
        <div>
          {/* 4D Biofield State with progress bars */}
          <div className="flex flex-col gap-8 mb-16">
            <div className="flex items-center gap-8">
              <span className="w-[80px]">ATP</span>
              <ProgressBars percentage={getEnergyPercent(userState.energy)} barCount={10} />
              <span className="capitalize">{userState.energy}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[80px]">Clarity</span>
              <ProgressBars percentage={getClarityPercent(userState.clarity)} barCount={10} />
              <span className="capitalize">{userState.clarity}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[80px]">Alignment</span>
              <ProgressBars percentage={getAlignmentPercent(userState.alignment)} barCount={10} />
              <span className="capitalize">{userState.alignment}</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[80px]">Support</span>
              <ProgressBars percentage={getSupportPercent(userState.needsSupport)} barCount={10} />
              <span className="capitalize">{userState.needsSupport}</span>
            </div>
          </div>

          {/* Full-stack session indicator */}
          {hasFullStack && (
            <div className="flex items-center gap-8 mt-8">
              <span className="w-[80px] opacity-30">Stack</span>
              <span>Full-stack active</span>
            </div>
          )}

          {/* Signal count enriched with log context — biofeedback loop */}
          <div className="opacity-30 mt-8">
            {engine.signals.length} signal{engine.signals.length === 1 ? '' : 's'} in biofeedback loop.
          </div>
          {!logCtx.isEmpty && (
            <div className="mt-4 opacity-30">
              <span className="capitalize">{logCtx.timePhase}</span> phase • <span className="capitalize">{logCtx.engagementLevel}</span>
              {logCtx.dominantMood ? ` • ${logCtx.dominantMood}` : ''}
            </div>
          )}
        </div>
      )}

      {view === 'dimensions' && (
        <div>
          {/* Signal sources breakdown */}
          <div className="flex flex-col gap-4 mb-16">
            {Object.entries(signalCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([source, count]) => (
                <div key={source} className="flex justify-between gap-16">
                  <span className="capitalize">{source}</span>
                  <span>{count} signal{count === 1 ? '' : 's'}</span>
                </div>
              ))
            }
          </div>

          {/* Analysis metadata — CQGS biofeedback loop */}
          <div className="opacity-30">
            {engine.lastAnalysis > 0
              ? `Last biofield compilation: ${formatTimeAgo(engine.lastAnalysis)} ago.`
              : 'Awaiting initial biofield compilation.'
            }
          </div>
          {!logCtx.isEmpty && (
            <div className="mt-4 opacity-30">
              {logCtx.activeModules.length}/6 modules reporting • {logCtx.todayActivity.length} today
            </div>
          )}
        </div>
      )}

      {view === 'history' && (
        <div>
          {recentSignals.length === 0 ? (
            <div>No signals indexed yet.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentSignals.map((signal, idx) => (
                <div key={idx} className="flex items-center gap-8">
                  <span className="w-[32px] opacity-30">{formatTimeAgo(signal.timestamp)}</span>
                  <span className="w-[64px] capitalize opacity-30">{signal.source}</span>
                  <span>{formatSignal(signal.signal)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
