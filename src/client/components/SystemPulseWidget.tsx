/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'
import { ProgressBars } from '#client/utils/progressBars'
import { useLogContext } from '#client/hooks/useLogContext'
import { useStore } from '@nanostores/react'
import { intentionEngine, classifyPhysiologicalCohort, getCircadianPhase, getUserState, getUserIndex } from '#client/stores/intentionEngine'
import { isRouteActive } from '#client/stores/router'

interface CommunityPulse {
  index: number | null
  topMood: string | null
  activeCount: number | null
}

interface PulseData {
  eventsPerMinute: number
  quantumFlux: number
  neuralActivity: number
  resonanceHz: number
  community: CommunityPulse | null
  lastUpdate: number
}

type PulseView = 'metrics' | 'activity' | 'userload' | 'cohort' | 'community'

/**
 * SystemPulseWidget - Real-time system heartbeat + user activity telemetry
 * Updates every 1 second with live activity data, cross-referenced with log context
 * Cycles: Metrics > Activity > User Load
 */
export function SystemPulseWidget() {
  const [pulse, setPulse] = React.useState<PulseData | null>(null)
  const [isLive, setIsLive] = React.useState(true)
  const [view, setView] = React.useState<PulseView>('metrics')
  const intervalRef = React.useRef<NodeJS.Timeout>()
  const lastFetchRef = React.useRef<number>(Date.now())
  const logCtx = useLogContext()
  const engineState = useStore(intentionEngine)

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'metrics':   return 'activity'
        case 'activity':  return 'userload'
        case 'userload':  return 'cohort'
        case 'cohort':    return 'community'
        case 'community': return 'metrics'
        default:          return 'metrics'
      }
    })
  }

  // Derive cohort from live engine state
  const cohortClassification = React.useMemo(() => {
    if (engineState.signals.length === 0) return null
    return classifyPhysiologicalCohort(
      engineState.signals,
      engineState.userState,
      engineState.recognizedPatterns
    )
  }, [engineState.signals.length, engineState.userState.energy])

  const circadianPhase = React.useMemo(() => getCircadianPhase(), [])
  const userIndex = React.useMemo(() => getUserIndex(), [engineState.userIndex?.overall])

  // Fetch pulse data
  const fetchPulse = React.useCallback(async () => {
    try {
      const response = await fetch('/api/system/pulse')
      if (!response.ok) return

      const data = await response.json()
      setPulse(data)
      lastFetchRef.current = Date.now()
      setIsLive(true)
    } catch (error) {
      console.error('Failed to fetch pulse:', error)
      setIsLive(false)
    }
  }, [])

  // Auto-fetch every 10 seconds (was 1s — reduced to prevent DB overload under traffic)
  React.useEffect(() => {
    fetchPulse()

    intervalRef.current = setInterval(() => {
      // Pause polling (each fetch setStates → re-renders this hidden widget)
      // when the browser tab is hidden or the user is on another in-app tab.
      if (document.hidden) return
      if (!isRouteActive('system')) return
      fetchPulse()
    }, 10_000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchPulse])

  const label =
    view === 'metrics'   ? 'System Pulse:' :
    view === 'activity'  ? 'System Load:' :
    view === 'userload'  ? 'User Telemetry:' :
    view === 'cohort'    ? 'Biofield:' :
    'Community Biofield:'

  if (!pulse) {
    return (
      <Block label={label} blockView onLabelClick={cycleView}>
        <div className="opacity-30">Connecting.</div>
      </Block>
    )
  }

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'metrics' && (
        <div>
          {/* Live status with user context */}
          <div className="mb-8 opacity-30">
            {isLive ? 'Live.' : 'Reconnecting.'}
            {!logCtx.isEmpty && logCtx.sessionDepth > 0 ? ` Session depth: ${logCtx.sessionDepth}.` : ''}
          </div>

          {/* Events per minute */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Events/min</span>
            <span className="tabular-nums">{Math.round(pulse.eventsPerMinute).toLocaleString()}</span>
          </div>

          {/* Quantum Flux */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Quantum flux</span>
            <span className="tabular-nums">{pulse.quantumFlux.toFixed(1)}%</span>
          </div>

          {/* Neural Activity */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Neural activity</span>
            <span className="tabular-nums">{Math.round(pulse.neuralActivity).toLocaleString()}</span>
          </div>

          {/* Resonance */}
          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Resonance</span>
            <span className="tabular-nums">{pulse.resonanceHz.toFixed(1)} Hz</span>
          </div>
        </div>
      )}

      {view === 'activity' && (
        <div>
          {/* Activity level as progress bars */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              <span className="opacity-30">Load</span>
              <span className="tabular-nums">{Math.min(100, Math.round(pulse.eventsPerMinute))}%</span>
            </div>
            <ProgressBars percentage={Math.min(100, pulse.eventsPerMinute)} barCount={20} />
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-4">
              <span className="opacity-30">Flux</span>
              <span className="tabular-nums">{pulse.quantumFlux.toFixed(1)}%</span>
            </div>
            <ProgressBars percentage={pulse.quantumFlux} barCount={20} />
          </div>

          {/* Status */}
          <div className="opacity-30">
            {isLive ? 'System operational.' : 'Connection interrupted.'}
          </div>
        </div>
      )}

      {view === 'userload' && (
        <div>
          {logCtx.isEmpty ? (
            <div className="opacity-30">No user telemetry. Begin logging to populate.</div>
          ) : (
            <>
              {/* Today's user activity metrics */}
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Today signals</span>
                <span className="tabular-nums">{logCtx.todayActivity.length.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Weekly rate</span>
                <span className="tabular-nums">{logCtx.weeklyRate.toLocaleString()}/wk</span>
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Module coverage</span>
                <span className="tabular-nums">{logCtx.activeModules.length}/6</span>
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Engagement</span>
                <span className="capitalize">{logCtx.engagementLevel}</span>
              </div>

              {logCtx.lastActivityAgo && (
                <div className="flex justify-between items-baseline mb-8">
                  <span className="opacity-30">Last signal</span>
                  <span>{logCtx.lastActivityAgo}</span>
                </div>
              )}

              {logCtx.peakHour !== null && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">Peak hour</span>
                  <span className="tabular-nums">{logCtx.peakHour}:00</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {view === 'cohort' && (
        <div className="flex flex-col gap-y-8 font-mono text-xs">
          {cohortClassification ? (
            <>
              <div className="flex justify-between items-baseline">
                <span className="opacity-30 uppercase tracking-widest">Archetype</span>
                <span>{cohortClassification.archetype}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-30 uppercase tracking-widest">Conf</span>
                <span className="tabular-nums">{Math.round(cohortClassification.confidence * 100)}%</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-30 uppercase tracking-widest">ATP</span>
                <span className="capitalize">{engineState.userState.energy}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-30 uppercase tracking-widest">Circadian</span>
                <span className="capitalize">{circadianPhase}</span>
              </div>
              {userIndex.overall > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30 uppercase tracking-widest">Index</span>
                  <span className="tabular-nums">{userIndex.overall}</span>
                </div>
              )}
              <div className="border-t border-acc-400/20 pt-8 mt-4">
                <div className="opacity-40">{cohortClassification.directive}</div>
              </div>
            </>
          ) : (
            <div className="opacity-30">Cohort pending. Engage widgets to surface archetype.</div>
          )}
        </div>
      )}

      {view === 'community' && (
        <div className="flex flex-col gap-y-8 font-mono text-xs">
          {pulse.community ? (
            <>
              {pulse.community.index !== null && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30 uppercase tracking-widest">COHR</span>
                  <span className="tabular-nums">{pulse.community.index}%</span>
                </div>
              )}
              {pulse.community.topMood && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30 uppercase tracking-widest">Signal</span>
                  <span className="uppercase">{pulse.community.topMood}</span>
                </div>
              )}
              {pulse.community.activeCount !== null && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30 uppercase tracking-widest">Active</span>
                  <span className="tabular-nums">{pulse.community.activeCount}</span>
                </div>
              )}
              <div className="border-t border-acc-400/20 pt-8 mt-4">
                <div className="opacity-40">Community coherence — 16:00 UTC pulse.</div>
              </div>
            </>
          ) : (
            <div className="opacity-30">No community pulse in last 24h. Job 14 fires at 16:00 UTC.</div>
          )}
        </div>
      )}
    </Block>
  )
}
