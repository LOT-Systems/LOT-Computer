import React from 'react'
import { Block } from '#client/components/ui'
import { useOSStatus, useOSVersion, useOSPerformance } from '#client/queries'
import { ProgressBars } from '#client/utils/progressBars'

type MetricsView = 'status' | 'performance' | 'version'

/**
 * UserMetricsWidget - Personal operating system metrics
 * Shows health, performance, version progression from the OS API
 * Cycles: Status > Performance > Version
 */
export function UserMetricsWidget() {
  const [view, setView] = React.useState<MetricsView>('status')
  const { data: status, isLoading: statusLoading } = useOSStatus()
  const { data: performance, isLoading: perfLoading } = useOSPerformance()
  const { data: version, isLoading: versionLoading } = useOSVersion()

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'status': return 'performance'
        case 'performance': return 'version'
        case 'version': return 'status'
        default: return 'status'
      }
    })
  }

  // Don't render while loading all data
  if (statusLoading && perfLoading && versionLoading) return null
  // Need at least status to show anything
  if (!status) return null

  const label =
    view === 'status' ? 'System Health:' :
    view === 'performance' ? 'Performance Benchmark:' :
    'Runtime Version:'

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'status' && (
        <div className="inline-block">
          {/* Health meter */}
          <div className="mb-12">
            <div className="flex items-center gap-8 mb-8">
              <span className="w-[80px]">Health</span>
              <ProgressBars percentage={status.health} barCount={10} />
              <span className="tabular-nums">{status.health}%</span>
            </div>
          </div>

          {/* State */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-60">State</span>
            <span className="capitalize">{status.state}</span>
          </div>

          {/* Uptime */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-60">Uptime</span>
            <span className="tabular-nums">{status.uptime} day{status.uptime === 1 ? '' : 's'}</span>
          </div>

          {/* Streak */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-60">Streak</span>
            <span className="tabular-nums">{status.streak} day{status.streak === 1 ? '' : 's'}</span>
          </div>

          {/* Interactions */}
          <div className="flex justify-between items-baseline">
            <span className="opacity-60">Interactions</span>
            <span className="tabular-nums">{status.metrics.totalInteractions}</span>
          </div>
        </div>
      )}

      {view === 'performance' && performance && (
        <div className="inline-block">
          {/* Performance dimensions */}
          <div className="flex flex-col gap-8 mb-16">
            <div className="flex items-center gap-8">
              <span className="w-[80px] opacity-60">Consistency</span>
              <ProgressBars percentage={performance.overall.consistency} barCount={10} />
              <span className="tabular-nums">{performance.overall.consistency}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[80px] opacity-60">Velocity</span>
              <ProgressBars percentage={performance.overall.velocity} barCount={10} />
              <span className="tabular-nums">{performance.overall.velocity}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[80px] opacity-60">Depth</span>
              <ProgressBars percentage={performance.overall.depth} barCount={10} />
              <span className="tabular-nums">{performance.overall.depth}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[80px] opacity-60">Balance</span>
              <ProgressBars percentage={performance.overall.balance} barCount={10} />
              <span className="tabular-nums">{performance.overall.balance}%</span>
            </div>
          </div>

          {/* Trajectory */}
          <div className="opacity-60">
            Trajectory: {
              performance.trends.trajectory === 'increasing' ? 'accelerating.' :
              performance.trends.trajectory === 'decreasing' ? 'decelerating.' :
              'holding steady.'
            }
          </div>
        </div>
      )}

      {view === 'performance' && !performance && (
        <div className="inline-block">
          <div className="opacity-60">Insufficient telemetry for performance benchmarks.</div>
        </div>
      )}

      {view === 'version' && version && (
        <div className="inline-block">
          {/* Version info */}
          <div className="mb-12">
            <div className="mb-4">{version.version} {version.name}</div>
            <div className="opacity-60">{version.description}</div>
          </div>

          {/* Progression to next version */}
          {version.nextVersion && (
            <div className="mb-12">
              <div className="flex items-center gap-8 mb-4">
                <span className="opacity-60">Progress to {version.nextVersion}</span>
              </div>
              <div className="flex items-center gap-8">
                <ProgressBars percentage={version.progression} barCount={20} />
                <span className="tabular-nums">{version.progression}%</span>
              </div>
            </div>
          )}

          {/* Unlocked features */}
          {version.unlocked.length > 0 && (
            <div className="opacity-60">
              {version.unlocked.join(' . ')}
            </div>
          )}
        </div>
      )}

      {view === 'version' && !version && (
        <div className="inline-block">
          <div className="opacity-60">Loading version data.</div>
        </div>
      )}
    </Block>
  )
}
