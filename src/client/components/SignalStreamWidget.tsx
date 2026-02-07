import React from 'react'
import { Block } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import { intentionEngine, type IntentionSignal } from '#client/stores/intentionEngine'
import { cn } from '#client/utils'
import { useLogContext } from '#client/hooks/useLogContext'

/**
 * Signal Stream Widget - Terminal-style live feed of QIE signals + log context
 * Shows the most recent signals with user log grounding
 * No cycling views - single focused display
 */
export function SignalStreamWidget() {
  const engine = useStore(intentionEngine)
  const [highlightedIndex, setHighlightedIndex] = React.useState<number | null>(null)
  const prevCountRef = React.useRef(engine.signals.length)
  const logCtx = useLogContext()

  // Highlight newest signal briefly when it arrives
  React.useEffect(() => {
    if (engine.signals.length > prevCountRef.current) {
      setHighlightedIndex(0)
      const timer = setTimeout(() => setHighlightedIndex(null), 2000)
      prevCountRef.current = engine.signals.length
      return () => clearTimeout(timer)
    }
    prevCountRef.current = engine.signals.length
  }, [engine.signals.length])

  // Don't show if fewer than 3 signals
  if (engine.signals.length < 3) return null

  // Get last 12 signals, newest first
  const recentSignals = [...engine.signals]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 12)

  const formatTimestamp = (ts: number): string => {
    const date = new Date(ts)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  // Calculate signal rate (signals per hour over last 24h)
  const signalRate = React.useMemo(() => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000
    const daySignals = engine.signals.filter(s => s.timestamp > dayAgo)
    if (daySignals.length < 2) return null

    const timeSpan = Date.now() - daySignals[daySignals.length - 1].timestamp
    const hours = timeSpan / (60 * 60 * 1000)
    if (hours < 0.1) return null

    return (daySignals.length / hours).toFixed(1)
  }, [engine.signals])

  return (
    <Block label="Signal Bus:" blockView>
      <div>
        {/* Stream header with log-context enrichment */}
        <div className="flex justify-between mb-12">
          <span className="opacity-30">
            {engine.signals.length} total
            {!logCtx.isEmpty ? ` . ${logCtx.totalEntries} logs` : ''}
          </span>
          {signalRate && (
            <span className="opacity-30">
              {signalRate}/hr
            </span>
          )}
        </div>

        {/* Signal entries - terminal style */}
        <div className="flex flex-col gap-2">
          {recentSignals.map((signal, idx) => (
            <div
              key={`${signal.timestamp}-${idx}`}
              className={cn(
                'flex items-baseline gap-8 transition-opacity duration-[1400ms]',
                idx === 0 && highlightedIndex === 0 ? 'opacity-100' : 'opacity-30'
              )}
            >
              <span className="opacity-30 tabular-nums w-[64px]">
                {formatTimestamp(signal.timestamp)}
              </span>
              <span className="w-[56px] capitalize opacity-30">
                {signal.source}
              </span>
              <span>
                {signal.signal}
              </span>
            </div>
          ))}
        </div>

        {/* Sync status enriched with log context */}
        <div className="mt-12 opacity-30">
          {engine.lastSyncedTimestamp > 0
            ? `Last upstream sync: ${formatTimestamp(engine.lastSyncedTimestamp)}`
            : 'Awaiting upstream sync.'
          }
          {!logCtx.isEmpty && logCtx.lastActivityAgo ? ` . Last log: ${logCtx.lastActivityAgo}.` : ''}
        </div>
      </div>
    </Block>
  )
}
