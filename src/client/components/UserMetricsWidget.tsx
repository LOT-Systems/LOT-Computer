import React from 'react'
import { Block } from '#client/components/ui'
import { useOSStatus, useOSVersion, useOSPerformance } from '#client/queries'
import { ProgressBars } from '#client/utils/progressBars'
import { useLogContext } from '#client/hooks/useLogContext'

type MetricsView = 'status' | 'performance' | 'version'

/**
 * CQGS Dashboard Widget - Personal operating system metrics
 * Shows Bioethics health, performance, version progression from OS API
 * enriched with user log data and biofeedback loop.
 * Cycles: Status > Performance > Version
 */
export function UserMetricsWidget() {
  const [view, setView] = React.useState<MetricsView>('status')
  const { data: status, isLoading: statusLoading } = useOSStatus()
  const { data: performance, isLoading: perfLoading } = useOSPerformance()
  const { data: version, isLoading: versionLoading } = useOSVersion()
  const logCtx = useLogContext()

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
    view === 'status' ? 'CQGS Health:' :
    view === 'performance' ? 'Performance Benchmark:' :
    'Runtime Version:'

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'status' && (
        <div>
          {/* Health meter */}
          <div className="mb-8">
            <div className="flex items-center gap-8 mb-8">
              <span className="w-[80px]">Health</span>
              <ProgressBars percentage={status.health} barCount={10} />
              <span className="tabular-nums">{status.health}%</span>
            </div>
          </div>

          {/* State */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">State</span>
            <span className="capitalize">{status.state}</span>
          </div>

          {/* Uptime */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Uptime</span>
            <span className="tabular-nums">{status.uptime} day{status.uptime === 1 ? '' : 's'}</span>
          </div>

          {/* Streak - cross-reference with log-derived streak */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Streak</span>
            <span className="tabular-nums">{status.streak} day{status.streak === 1 ? '' : 's'}</span>
          </div>

          {/* Interactions */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Interactions</span>
            <span className="tabular-nums">{status.metrics.totalInteractions}</span>
          </div>

          {/* Biofeedback loop context */}
          {!logCtx.isEmpty && (
            <div className="opacity-30 mt-8">
              {logCtx.todayActivity.length} signal{logCtx.todayActivity.length === 1 ? '' : 's'} today • {logCtx.activeModules.length}/6 CQGS modules active
            </div>
          )}
        </div>
      )}

      {view === 'performance' && performance && (
        <div>
          {/* Performance dimensions */}
          <div className="flex flex-col gap-8 mb-16">
            <div className="flex items-center gap-8">
              <span className="w-[80px] opacity-30">Consistency</span>
              <ProgressBars percentage={performance.overall.consistency} barCount={10} />
              <span className="tabular-nums">{performance.overall.consistency}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[80px] opacity-30">Velocity</span>
              <ProgressBars percentage={performance.overall.velocity} barCount={10} />
              <span className="tabular-nums">{performance.overall.velocity}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[80px] opacity-30">Depth</span>
              <ProgressBars percentage={performance.overall.depth} barCount={10} />
              <span className="tabular-nums">{performance.overall.depth}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[80px] opacity-30">Balance</span>
              <ProgressBars percentage={performance.overall.balance} barCount={10} />
              <span className="tabular-nums">{performance.overall.balance}%</span>
            </div>
          </div>

          {/* Trajectory enriched with log mood trend */}
          <div className="opacity-30">
            Trajectory: {
              performance.trends.trajectory === 'increasing' ? 'accelerating.' :
              performance.trends.trajectory === 'decreasing' ? 'decelerating.' :
              'holding steady.'
            }
            {logCtx.moodTrend !== 'stable' ? ` Mood ${logCtx.moodTrend}.` : ''}
          </div>
        </div>
      )}

      {view === 'performance' && !performance && (
        <div>
          <div className="opacity-30">
            Insufficient biofeedback for performance benchmarks.
            {!logCtx.isEmpty && logCtx.totalEntries < 10 ? ` ${logCtx.totalEntries} entries logged. Continue input.` : ''}
          </div>
        </div>
      )}

      {view === 'version' && version && (
        <div>
          {/* Version info */}
          <div className="mb-8">
            <div className="mb-4">{version.version} {version.name}</div>
            <div className="opacity-30">{version.description}</div>
          </div>

          {/* Progression to next version */}
          {version.nextVersion && (
            <div className="mb-8">
              <div className="flex items-center gap-8 mb-4">
                <span className="opacity-30">Progress to {version.nextVersion}</span>
              </div>
              <div className="flex items-center gap-8">
                <ProgressBars percentage={version.progression} barCount={20} />
                <span className="tabular-nums">{version.progression}%</span>
              </div>
            </div>
          )}

          {/* Unlocked features */}
          {version.unlocked.length > 0 && (
            <div className="opacity-30">
              {version.unlocked.join(' • ')}
            </div>
          )}

          {/* Log-derived engagement context */}
          {!logCtx.isEmpty && (
            <div className="opacity-30 mt-8">
              Engagement: <span className="capitalize">{logCtx.engagementLevel}</span>
              {logCtx.widgetDiversity > 0 ? ` • ${logCtx.widgetDiversity} event types` : ''}
            </div>
          )}
        </div>
      )}

      {view === 'version' && !version && (
        <div>
          <div className="opacity-30">Loading version data.</div>
        </div>
      )}
    </Block>
  )
}
