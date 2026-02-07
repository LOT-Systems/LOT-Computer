import React from 'react'
import { Block } from '#client/components/ui'
import { ProgressBars } from '#client/utils/progressBars'
import { useLogContext } from '#client/hooks/useLogContext'

interface PulseData {
  eventsPerMinute: number
  quantumFlux: number
  neuralActivity: number
  resonanceHz: number
  lastUpdate: number
}

type PulseView = 'metrics' | 'activity' | 'userload'

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
  const lastFetchRef = React.useRef<number>(0)
  const logCtx = useLogContext()

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'metrics': return 'activity'
        case 'activity': return 'userload'
        case 'userload': return 'metrics'
        default: return 'metrics'
      }
    })
  }

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

  // Auto-fetch every 1 second
  React.useEffect(() => {
    fetchPulse()

    intervalRef.current = setInterval(() => {
      fetchPulse()
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchPulse])

  // Check if data is stale (no update in 5 seconds)
  React.useEffect(() => {
    const checkStale = setInterval(() => {
      const timeSinceUpdate = Date.now() - lastFetchRef.current
      if (timeSinceUpdate > 5000) {
        setIsLive(false)
      }
    }, 1000)

    return () => clearInterval(checkStale)
  }, [])

  if (!pulse) {
    return null
  }

  const label =
    view === 'metrics' ? 'System Pulse:' :
    view === 'activity' ? 'System Load:' :
    'User Telemetry:'

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      {view === 'metrics' && (
        <div className="inline-block">
          {/* Live status with user context */}
          <div className="mb-12 opacity-60">
            {isLive ? 'Live.' : 'Reconnecting.'}
            {!logCtx.isEmpty && logCtx.sessionDepth > 0 ? ` Session depth: ${logCtx.sessionDepth}.` : ''}
          </div>

          {/* Events per minute */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-60">Events/min</span>
            <span className="tabular-nums">{Math.round(pulse.eventsPerMinute)}</span>
          </div>

          {/* Quantum Flux */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-60">Quantum flux</span>
            <span className="tabular-nums">{pulse.quantumFlux.toFixed(1)}%</span>
          </div>

          {/* Neural Activity */}
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-60">Neural activity</span>
            <span className="tabular-nums">{Math.round(pulse.neuralActivity)}</span>
          </div>

          {/* Resonance */}
          <div className="flex justify-between items-baseline">
            <span className="opacity-60">Resonance</span>
            <span className="tabular-nums">{pulse.resonanceHz.toFixed(1)} Hz</span>
          </div>
        </div>
      )}

      {view === 'activity' && (
        <div className="inline-block">
          {/* Activity level as progress bars */}
          <div className="mb-12">
            <div className="flex justify-between mb-4">
              <span className="opacity-60">Load</span>
              <span className="tabular-nums">{Math.min(100, Math.round(pulse.eventsPerMinute))}%</span>
            </div>
            <ProgressBars percentage={Math.min(100, pulse.eventsPerMinute)} barCount={20} />
          </div>

          <div className="mb-12">
            <div className="flex justify-between mb-4">
              <span className="opacity-60">Flux</span>
              <span className="tabular-nums">{pulse.quantumFlux.toFixed(1)}%</span>
            </div>
            <ProgressBars percentage={pulse.quantumFlux} barCount={20} />
          </div>

          {/* Status */}
          <div className="opacity-60">
            {isLive ? 'System operational.' : 'Connection interrupted.'}
          </div>
        </div>
      )}

      {view === 'userload' && (
        <div className="inline-block">
          {logCtx.isEmpty ? (
            <div className="opacity-60">No user telemetry. Begin logging to populate.</div>
          ) : (
            <>
              {/* Today's user activity metrics */}
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-60">Today signals</span>
                <span className="tabular-nums">{logCtx.todayActivity.length}</span>
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-60">Weekly rate</span>
                <span className="tabular-nums">{logCtx.weeklyRate}/wk</span>
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-60">Module coverage</span>
                <span className="tabular-nums">{logCtx.activeModules.length}/6</span>
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-60">Engagement</span>
                <span className="capitalize">{logCtx.engagementLevel}</span>
              </div>

              {logCtx.lastActivityAgo && (
                <div className="flex justify-between items-baseline mb-8">
                  <span className="opacity-60">Last signal</span>
                  <span>{logCtx.lastActivityAgo}</span>
                </div>
              )}

              {logCtx.peakHour !== null && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-60">Peak hour</span>
                  <span className="tabular-nums">{logCtx.peakHour}:00</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Block>
  )
}
