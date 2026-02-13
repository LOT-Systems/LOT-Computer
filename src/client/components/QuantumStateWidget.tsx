import React from 'react'
import { Block } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import { intentionEngine, analyzeIntentions, getUserState, type UserState } from '#client/stores/intentionEngine'
import { useLogs } from '#client/queries'
import { ProgressBars } from '#client/utils/progressBars'
import { useLogContext } from '#client/hooks/useLogContext'

type QuantumView = 'state' | 'dimensions' | 'history'

/**
 * Quantum State Widget - Real-time 4D user state from QIE cross-referenced with log context
 * Displays energy, clarity, alignment, and support needs as text-based meters
 * Cycles: State > Dimensions > History
 */
export function QuantumStateWidget() {
  const [view, setView] = React.useState<QuantumView>('state')
  const engine = useStore(intentionEngine)
  const { data: logs = [] } = useLogs()
  const logCtx = useLogContext()

  // Trigger fresh analysis when logs change
  React.useEffect(() => {
    analyzeIntentions()
  }, [logs])

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
    view === 'state' ? 'Quantum State:' :
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

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'state' && (
        <div>
          {/* 4D State with progress bars */}
          <div className="flex flex-col gap-8 mb-16">
            <div className="flex items-center gap-8">
              <span className="w-[80px]">Energy</span>
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

          {/* Signal count enriched with log context */}
          <div className="opacity-30">
            {engine.signals.length} signal{engine.signals.length === 1 ? '' : 's'} cached in local memory.
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

          {/* Analysis metadata enriched with log context */}
          <div className="opacity-30">
            {engine.lastAnalysis > 0
              ? `Last compiled: ${formatTimeAgo(engine.lastAnalysis)} ago.`
              : 'Awaiting initial compilation.'
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
                  <span>{signal.signal}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
