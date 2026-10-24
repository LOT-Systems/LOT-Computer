/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'
import { useOSStatus, useOSVersion, useOSPerformance } from '#client/queries'
import { ProgressBars } from '#client/utils/progressBars'
import { useLogContext } from '#client/hooks/useLogContext'
import { useStore } from '@nanostores/react'
import { intentionEngine, getUserIndex, classifyPhysiologicalCohort, recordOSSignal } from '#client/stores/intentionEngine'

type MetricsView = 'status' | 'performance' | 'version' | 'physiology' | 'qos'

/**
 * CQGS Dashboard Widget - Personal operating system metrics
 * Shows Bioethics health, performance, version progression from OS API
 * enriched with user log data and biofeedback loop.
 * Cycles: Status > Performance > Version > Physiology > QOS
 */
export function UserMetricsWidget() {
  const [view, setView] = React.useState<MetricsView>('status')
  const { data: status, isLoading: statusLoading } = useOSStatus()
  const { data: performance, isLoading: perfLoading } = useOSPerformance()
  const { data: version, isLoading: versionLoading } = useOSVersion()
  const logCtx = useLogContext()
  const engineState = useStore(intentionEngine)
  const [cohortData, setCohortData] = React.useState<{
    archetype?: string
    behavioralCohort?: string
    energyStatus?: string
    energyTrajectory?: string
    computedAt?: string
  } | null>(null)

  React.useEffect(() => {
    // Load physiological cohort from server API
    fetch('/api/cohorts')
      .then(res => res.json())
      .then(data => {
        if (data.archetype || data.behavioralCohort) {
          setCohortData(prev => ({
            ...prev,
            archetype: data.archetype,
            behavioralCohort: data.behavioralCohort,
          }))
        }
      })
      .catch(() => {})
    // Also pull user metadata from weekly cohort job
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        const pc = data?.metadata?.physiologicalCohort
        if (pc) {
          setCohortData(prev => ({
            ...prev,
            archetype: pc.archetype ?? prev?.archetype,
            behavioralCohort: pc.behavioralCohort ?? prev?.behavioralCohort,
            energyStatus: pc.energyStatus,
            energyTrajectory: pc.energyTrajectory,
            computedAt: pc.computedAt,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'status': return 'performance'
        case 'performance': return 'version'
        case 'version': return 'physiology'
        case 'physiology': return 'qos'
        case 'qos': return 'status'
        default: return 'status'
      }
    })
  }

  // Fire OS health-check signal on first status load
  const hasRecordedOSRef = React.useRef(false)
  React.useEffect(() => {
    if (!status || hasRecordedOSRef.current) return
    hasRecordedOSRef.current = true
    recordOSSignal('health_check', { health: status.health, state: status.state, uptime: status.uptime })
  }, [status])

  // Memoize the heavy derivations BEFORE the early returns (Rules of Hooks) so
  // they only recompute when signals actually change — not on every re-render
  // this mounted widget receives from unrelated intentionEngine writes.
  const userIndex = React.useMemo(() => getUserIndex(), [engineState.signals])
  const qieCohort = React.useMemo(() => classifyPhysiologicalCohort(), [engineState.signals])

  // Don't render while loading all data
  if (statusLoading && perfLoading && versionLoading) return null
  // Need at least status to show anything
  if (!status) return null

  const label =
    view === 'status' ? 'CQGS Health:' :
    view === 'performance' ? 'Performance Benchmark:' :
    view === 'version' ? 'Runtime Version:' :
    view === 'physiology' ? 'Physiological Profile:' :
    'Quantum OS:'

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
            <span className="tabular-nums">{status.uptime.toLocaleString()} day{status.uptime === 1 ? '' : 's'}</span>
          </div>

          {/* Streak - cross-reference with log-derived streak */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Streak</span>
            <span className="tabular-nums">{status.streak.toLocaleString()} day{status.streak === 1 ? '' : 's'}</span>
          </div>

          {/* Interactions */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Interactions</span>
            <span className="tabular-nums">{status.metrics.totalInteractions.toLocaleString()}</span>
          </div>

          {/* Biofeedback loop context */}
          {!logCtx.isEmpty && (
            <div className="opacity-30 mt-8">
              {logCtx.todayActivity.length.toLocaleString()} signal{logCtx.todayActivity.length === 1 ? '' : 's'} today • {logCtx.activeModules.length}/6 CQGS modules active
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
            {!logCtx.isEmpty && logCtx.totalEntries < 10 ? ` ${logCtx.totalEntries.toLocaleString()} entries logged. Continue input.` : ''}
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
              {logCtx.widgetDiversity > 0 ? ` • ${logCtx.widgetDiversity.toLocaleString()} event types` : ''}
            </div>
          )}
        </div>
      )}

      {view === 'version' && !version && (
        <div>
          <div className="opacity-30">Loading version data.</div>
        </div>
      )}

      {/* ─── Physiological Profile View ─── */}
      {view === 'physiology' && (
        <div className="flex flex-col gap-y-8">
          {/* Archetype: server-derived if available, otherwise client QIE classification */}
          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Archetype</span>
            <span>{cohortData?.archetype ?? qieCohort.label}</span>
          </div>
          {cohortData?.behavioralCohort && (
            <div className="flex justify-between items-baseline">
              <span className="opacity-30">Cohort</span>
              <span>{cohortData.behavioralCohort}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Dominant</span>
            <span className="capitalize">{qieCohort.dominant}</span>
          </div>
          <div className="opacity-30 text-xs mt-4">{qieCohort.directive}</div>

          {/* Biofield state from QIE */}
          <div className="border-t border-acc-400/30 pt-8 mt-4">
            <div className="flex justify-between items-baseline mb-4">
              <span className="opacity-30">QIE Energy</span>
              <span className="capitalize">{engineState.userState.energy}</span>
            </div>
            <div className="flex justify-between items-baseline mb-4">
              <span className="opacity-30">Clarity</span>
              <span className="capitalize">{engineState.userState.clarity}</span>
            </div>
            <div className="flex justify-between items-baseline mb-4">
              <span className="opacity-30">Alignment</span>
              <span className="capitalize">{engineState.userState.alignment}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="opacity-30">Support Need</span>
              <span className="capitalize">{engineState.userState.needsSupport}</span>
            </div>
          </div>

          {/* Active physiological patterns */}
          {engineState.recognizedPatterns.filter(p =>
            ['physiological-depletion', 'recovery-window', 'circadian-drift', 'engagement-burst', 'biofield-coherence-peak', 'biofield-recovery-arc'].includes(p.pattern)
          ).length > 0 && (
            <div className="border-t border-acc-400/30 pt-8 mt-4">
              <div className="opacity-30 mb-4 uppercase tracking-widest text-xs">Biofield signals</div>
              {engineState.recognizedPatterns
                .filter(p => ['physiological-depletion', 'recovery-window', 'circadian-drift', 'engagement-burst', 'biofield-coherence-peak', 'biofield-recovery-arc'].includes(p.pattern))
                .map((p, idx) => (
                  <div key={idx} className="flex justify-between items-baseline mb-4">
                    <span className="opacity-50 uppercase text-xs">{p.pattern.replace(/-/g, ' ')}</span>
                    <span className="opacity-30 tabular-nums text-xs">{Math.round(p.confidence * 100)}%</span>
                  </div>
                ))
              }
            </div>
          )}

          {cohortData?.computedAt && (
            <div className="opacity-20 text-xs mt-4">
              Updated {new Date(cohortData.computedAt).toISOString().slice(0, 10)}
            </div>
          )}
        </div>
      )}

      {/* ─── Quantum OS View ─── */}
      {view === 'qos' && (
        <div>
          <div className="flex flex-col gap-y-8 mb-16">
            <div className="flex items-center gap-8">
              <span className="w-[100px] opacity-30 text-xs uppercase tracking-widest">Engagement</span>
              <ProgressBars percentage={userIndex.dimensions.engagement} barCount={10} />
              <span className="tabular-nums">{userIndex.dimensions.engagement}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[100px] opacity-30 text-xs uppercase tracking-widest">Emotional</span>
              <ProgressBars percentage={userIndex.dimensions.emotional} barCount={10} />
              <span className="tabular-nums">{userIndex.dimensions.emotional}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[100px] opacity-30 text-xs uppercase tracking-widest">Intentional</span>
              <ProgressBars percentage={userIndex.dimensions.intentional} barCount={10} />
              <span className="tabular-nums">{userIndex.dimensions.intentional}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[100px] opacity-30 text-xs uppercase tracking-widest">Social</span>
              <ProgressBars percentage={userIndex.dimensions.social} barCount={10} />
              <span className="tabular-nums">{userIndex.dimensions.social}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[100px] opacity-30 text-xs uppercase tracking-widest">Self-Care</span>
              <ProgressBars percentage={userIndex.dimensions.selfCare} barCount={10} />
              <span className="tabular-nums">{userIndex.dimensions.selfCare}%</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="w-[100px] opacity-30 text-xs uppercase tracking-widest">Cognitive</span>
              <ProgressBars percentage={userIndex.dimensions.cognitive} barCount={10} />
              <span className="tabular-nums">{userIndex.dimensions.cognitive}%</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">QOS Index</span>
            <span className="tabular-nums">{userIndex.overall}%</span>
          </div>

          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Trend</span>
            <span className="capitalize">{userIndex.trend}</span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Signals (7d)</span>
            <span className="tabular-nums">{engineState.signals.length.toLocaleString()}</span>
          </div>

          {!logCtx.isEmpty && (
            <div className="opacity-30 mt-8">
              {logCtx.activeModules.length}/6 modules active
            </div>
          )}
        </div>
      )}
    </Block>
  )
}
