import React from 'react'
import { Block } from '#client/components/ui'
import { useEnergy } from '#client/queries'
import { cn } from '#client/utils'
import { getEnergyNarrative, getRomanticNarrative } from '#client/utils/narrative'

type EnergyView = 'overview' | 'romantic' | 'needs'

/**
 * Energy Capacitor Widget - Tracks energy depletion/replenishment
 * Cycles: Overview > Romantic Connection > Needs
 */
export function EnergyCapacitor() {
  const [view, setView] = React.useState<EnergyView>('overview')
  const { data, isLoading } = useEnergy()

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'overview': return 'romantic'
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

  const label =
    view === 'overview' ? 'Energy:' :
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
            <span className="text-[20px]">
              {energyState.currentLevel}%
            </span>
            <span className="capitalize opacity-60">{energyState.status}</span>
          </div>

          {/* Trajectory indicator */}
          {energyState.trajectory !== 'stable' && (
            <div className="mb-12 opacity-75">
              {energyState.trajectory === 'improving' && '↑ Improving'}
              {energyState.trajectory === 'declining' && '↓ Declining'}
              {energyState.trajectory === 'critical' && '⚠ Critical'}
            </div>
          )}

          {/* Burnout warning */}
          {energyState.daysUntilBurnout !== null && energyState.daysUntilBurnout <= 7 && (
            <div className="mb-12">
              {energyState.daysUntilBurnout} day{energyState.daysUntilBurnout === 1 ? '' : 's'} until burnout
            </div>
          )}

          {/* Top suggestion */}
          {suggestions.length > 0 && (
            <div className="opacity-80">
              {suggestions[0]}
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

              <div className="mb-12 opacity-60">
                <span className="capitalize">{energyState.romanticConnection.connectionQuality}</span>
              </div>
              <div className="mb-12 opacity-75">
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
