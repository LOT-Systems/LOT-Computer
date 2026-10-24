/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

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

  // Get last 12 signals, newest first. Memoized on engine.signals so the
  // full copy+sort of up to 1000 signals only runs when signals actually
  // change — not on every re-render this mounted widget receives from other
  // intentionEngine writes (analyzeIntentions keeps the same signals ref).
  const recentSignals = React.useMemo(
    () => [...engine.signals].sort((a, b) => b.timestamp - a.timestamp).slice(0, 12),
    [engine.signals]
  )

  const formatTimestamp = (ts: number): string => {
    const date = new Date(ts)
    const h = date.getHours()
    const period = h >= 12 ? 'PM' : 'AM'
    const hours = (h % 12 || 12).toString()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds} ${period}`
  }

  // Format raw signal names into human-readable labels
  const formatSignal = (signal: string): string => {
    const signalLabels: Record<string, string> = {
      'prompt_accepted': 'Prompt accepted',
      'prompt_skipped': 'Prompt skipped',
      'energy_low': 'Energy: low',
      'energy_depleted': 'Energy: depleted',
      'energy_moderate': 'Energy: moderate',
      'energy_high': 'Energy: high',
      'energy_unknown': 'Energy: scanning',
      'awareness_explored': 'Awareness explored',
      'mood_logged': 'Mood logged',
      'plan_created': 'Plan created',
      'intention_set': 'Intention set',
      'selfcare_complete': 'Self-care complete',
      'journal_entry': 'Journal entry',
    }
    if (signalLabels[signal]) return signalLabels[signal]
    // Fallback: replace underscores with spaces and capitalize
    return signal.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
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
        <div className="flex justify-between mb-8">
          <span className="opacity-30">
            {engine.signals.length} total
            {!logCtx.isEmpty ? ` • ${logCtx.totalEntries} logs` : ''}
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
              <span className="shrink-0 whitespace-nowrap opacity-30 tabular-nums w-[88px]">
                {formatTimestamp(signal.timestamp)}
              </span>
              <span className="shrink-0 whitespace-nowrap w-[64px] capitalize opacity-30">
                {signal.source}
              </span>
              <span className="min-w-0">
                {formatSignal(signal.signal)}
              </span>
            </div>
          ))}
        </div>

        {/* Sync status enriched with log context */}
        <div className="mt-16 opacity-30">
          {engine.lastSyncedTimestamp > 0
            ? `Last upstream sync: ${formatTimestamp(engine.lastSyncedTimestamp)}`
            : 'Awaiting upstream sync.'
          }
          {!logCtx.isEmpty && logCtx.lastActivityAgo ? ` • Last log: ${logCtx.lastActivityAgo}.` : ''}
        </div>
      </div>
    </Block>
  )
}
