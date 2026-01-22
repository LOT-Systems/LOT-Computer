import React from 'react'
import { Block } from '#client/components/ui'
import { cn } from '#client/utils'

interface PulseData {
  eventsPerMinute: number
  quantumFlux: number
  neuralActivity: number
  resonanceHz: number
  lastUpdate: number
}

/**
 * SystemPulseWidget - Ultra-fast updating stats showing system heartbeat
 * Updates every 1 second with real-time activity metrics
 */
export function SystemPulseWidget() {
  const [pulse, setPulse] = React.useState<PulseData | null>(null)
  const [isLive, setIsLive] = React.useState(true)
  const intervalRef = React.useRef<NodeJS.Timeout>()
  const lastFetchRef = React.useRef<number>(0)

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
    fetchPulse() // Initial fetch

    intervalRef.current = setInterval(() => {
      fetchPulse()
    }, 1000) // Update every second

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

  // Animate number changes
  const AnimatedNumber: React.FC<{ value: number; decimals?: number }> = ({ value, decimals = 0 }) => {
    return (
      <span className="inline-block transition-all duration-300 ease-out tabular-nums">
        {decimals > 0 ? value.toFixed(decimals) : Math.round(value)}
      </span>
    )
  }

  // Get intensity level for visual feedback
  const getIntensity = (value: number, max: number) => {
    const percent = (value / max) * 100
    if (percent > 80) return 'high'
    if (percent > 50) return 'medium'
    return 'low'
  }

  const eventsIntensity = getIntensity(pulse.eventsPerMinute, 100)
  const fluxIntensity = getIntensity(pulse.quantumFlux, 100)

  return (
    <Block label="System Pulse:" blockView>
      <div className="flex flex-col gap-y-12">
        {/* Live indicator */}
        <div className="flex items-center gap-4 text-xs opacity-60">
          <div className={cn(
            'w-8 h-8 rounded-full transition-all duration-300',
            isLive ? 'bg-green animate-pulse' : 'bg-red-500'
          )} />
          <span>{isLive ? 'LIVE' : 'RECONNECTING...'}</span>
        </div>

        {/* Events Per Minute */}
        <div className="flex justify-between items-baseline">
          <span className="opacity-80">Events/Min</span>
          <div className="flex items-baseline gap-4">
            <span className={cn(
              'text-2xl font-mono transition-colors duration-300',
              eventsIntensity === 'high' && 'text-green',
              eventsIntensity === 'medium' && 'text-blue',
              eventsIntensity === 'low' && 'opacity-75'
            )}>
              <AnimatedNumber value={pulse.eventsPerMinute} />
            </span>
            {eventsIntensity === 'high' && (
              <span className="text-green text-lg animate-pulse">▲</span>
            )}
          </div>
        </div>

        {/* Quantum Flux */}
        <div className="flex justify-between items-baseline">
          <span className="opacity-80">Quantum Flux</span>
          <div className="flex items-baseline gap-4">
            <span className={cn(
              'text-2xl font-mono transition-colors duration-300',
              fluxIntensity === 'high' && 'text-acc',
              fluxIntensity === 'medium' && 'text-blue',
              fluxIntensity === 'low' && 'opacity-75'
            )}>
              <AnimatedNumber value={pulse.quantumFlux} decimals={1} />%
            </span>
          </div>
        </div>

        {/* Neural Activity */}
        <div className="flex justify-between items-baseline">
          <span className="opacity-80">Neural Activity</span>
          <span className="text-xl font-mono">
            <AnimatedNumber value={pulse.neuralActivity} />
          </span>
        </div>

        {/* Resonance Frequency */}
        <div className="flex justify-between items-baseline pt-8 border-t border-acc-400/30">
          <span className="opacity-80">Resonance</span>
          <span className="text-xl font-mono">
            <AnimatedNumber value={pulse.resonanceHz} decimals={1} /> Hz
          </span>
        </div>

        {/* Activity bar */}
        <div className="w-full h-4 bg-acc/10 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              eventsIntensity === 'high' && 'bg-green',
              eventsIntensity === 'medium' && 'bg-blue',
              eventsIntensity === 'low' && 'bg-acc'
            )}
            style={{
              width: `${Math.min(100, (pulse.eventsPerMinute / 100) * 100)}%`
            }}
          />
        </div>

        {/* Last update timestamp */}
        <div className="text-xs opacity-40 font-mono text-right">
          {new Date(pulse.lastUpdate).toLocaleTimeString()}
        </div>
      </div>
    </Block>
  )
}
