import React from 'react'
import { Block } from '#client/components/ui'
import { useEnergy } from '#client/queries'
import { cn } from '#client/utils'
import { getEnergyNarrative, getRomanticNarrative } from '#client/utils/narrative'
import { recordSignal } from '#client/stores/intentionEngine'
import { useLogContext } from '#client/hooks/useLogContext'

type EnergyView = 'overview' | 'romantic' | 'needs' | 'correlation'

/**
 * Energy Capacitor Widget - Tracks energy depletion/replenishment
 * Cycles: Overview > Correlation > Romantic Connection > Needs
 */
export function EnergyCapacitor() {
  const [view, setView] = React.useState<EnergyView>('overview')
  const { data, isLoading } = useEnergy()
  const logCtx = useLogContext()
  const hasRecordedRef = React.useRef(false)

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'overview': return 'correlation'
        case 'correlation': return 'romantic'
        case 'romantic': return 'needs'
        case 'needs': return 'overview'
        default: return 'overview'
      }
    })
  }

  if (isLoading) return null
  if (!data || data.message) return null // Not enough data yet
  if (!data.energyState) return null

  const { energyState, suggestions } = data

  // Record energy signal once per mount
  if (!hasRecordedRef.current && energyState) {
    recordSignal('selfcare', `energy_${energyState.status}`, {
      level: energyState.currentLevel,
      trajectory: energyState.trajectory,
      hour: new Date().getHours()
    })
    hasRecordedRef.current = true
  }

  // Correlate energy with mood
  const getMoodEnergyCorrelation = (): string | null => {
    if (!logCtx.dominantMood) return null

    const mood = logCtx.dominantMood
    const level = energyState.currentLevel

    if (level < 30 && ['anxious', 'overwhelmed', 'tired'].includes(mood)) {
      return `Low energy aligns with ${mood} mood. Rest is the priority.`
    }
    if (level < 30 && ['calm', 'peaceful'].includes(mood)) {
      return `Low energy but calm mood. Gentle replenishment works best.`
    }
    if (level > 70 && ['energized', 'excited', 'hopeful'].includes(mood)) {
      return `High energy matches positive mood. Good conditions for deep work.`
    }
    if (level > 70 && ['anxious', 'restless'].includes(mood)) {
      return `High energy but unsettled mood. Channel energy with intention.`
    }
    if (level >= 30 && level <= 70) {
      return `Moderate energy. ${logCtx.moodTrend === 'improving' ? 'Mood is trending positive.' : logCtx.moodTrend === 'declining' ? 'Watch the mood trend.' : 'Steady state.'}`
    }
    return null
  }

  const label =
    view === 'overview' ? 'Energy:' :
    view === 'correlation' ? 'Energy + Mood:' :
    view === 'romantic' ? 'Connection:' :
    'Needs:'

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'overview' && (
        <div className="inline-block">
          {/* Narrative status */}
          <div className="mb-12">
            {getEnergyNarrative(energyState.currentLevel, energyState.trajectory)}
          </div>

          {/* Energy level */}
          <div className="mb-12 flex items-center gap-12">
            <span>
              {energyState.currentLevel}%
            </span>
            <span className="capitalize">{energyState.status}</span>
          </div>

          {/* Trajectory indicator */}
          {energyState.trajectory !== 'stable' && (
            <div className="mb-12 opacity-30">
              {energyState.trajectory === 'improving' && 'Improving.'}
              {energyState.trajectory === 'declining' && 'Declining.'}
              {energyState.trajectory === 'critical' && 'Critical.'}
            </div>
          )}

          {/* Burnout warning */}
          {energyState.daysUntilBurnout !== null && energyState.daysUntilBurnout <= 7 && (
            <div className="mb-12">
              Estimated {energyState.daysUntilBurnout} day{energyState.daysUntilBurnout === 1 ? '' : 's'} until buffer overflow.
            </div>
          )}

          {/* Top suggestion */}
          {suggestions.length > 0 && (
            <div className="opacity-30">
              {suggestions[0]}
            </div>
          )}
        </div>
      )}

      {view === 'correlation' && (
        <div className="inline-block">
          {/* Mood-energy correlation */}
          {getMoodEnergyCorrelation() ? (
            <div className="mb-12">
              {getMoodEnergyCorrelation()}
            </div>
          ) : (
            <div className="mb-12 opacity-30">
              Record mood check-ins to see energy-mood correlation.
            </div>
          )}

          {/* Activity context */}
          {logCtx.todayActivity.length > 0 && (
            <div className="mb-8">
              {logCtx.todayActivity.length} interaction{logCtx.todayActivity.length === 1 ? '' : 's'} today.
            </div>
          )}

          {/* Suggestion based on combined state */}
          {energyState.currentLevel < 40 && logCtx.hasSelfCare && (
            <div className="opacity-30">
              Deploy self-care module to restore energy buffer.
            </div>
          )}
          {energyState.currentLevel < 40 && !logCtx.hasSelfCare && (
            <div className="opacity-30">
              Initialize self-care module to build energy awareness.
            </div>
          )}
          {energyState.currentLevel >= 70 && !logCtx.hasMemory && (
            <div className="opacity-30">
              Energy buffer high. Optimal window for Memory Engine integration.
            </div>
          )}
        </div>
      )}

      {view === 'romantic' && (
        <div className="inline-block">
          {energyState.romanticConnection.lastIntimacyMoment ? (
            <>
              {/* Narrative status */}
              <div className="mb-12">
                {getRomanticNarrative(
                  energyState.romanticConnection.daysSinceConnection,
                  energyState.romanticConnection.connectionQuality
                )}
              </div>

              <div className="mb-12">
                <span className="capitalize">{energyState.romanticConnection.connectionQuality}</span>
              </div>
              <div className="mb-12">
                {energyState.romanticConnection.daysSinceConnection} day{energyState.romanticConnection.daysSinceConnection === 1 ? '' : 's'} since connection
              </div>
              {energyState.romanticConnection.needsAttention && (
                <div>
                  Your heart needs tending.
                </div>
              )}
            </>
          ) : (
            <div>
              No romantic moments tracked yet.
            </div>
          )}
        </div>
      )}

      {view === 'needs' && (
        <div className="inline-block">
          {energyState.needsReplenishment.length === 0 ? (
            <div>
              All needs balanced.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {energyState.needsReplenishment.slice(0, 3).map((need, idx) => (
                <div key={idx}>
                  <span className="capitalize">{need.category}</span>: {need.daysSinceLastReplenishment} days
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
