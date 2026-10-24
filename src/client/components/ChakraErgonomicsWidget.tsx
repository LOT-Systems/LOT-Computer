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
import {
  chakraErgonomics,
  recomputeChakras,
  formatCharge,
  formatDuration,
} from '#client/stores/chakraErgonomics'
import type { ChakraLevel } from '#client/stores/chakraErgonomics'
import { recordSignal } from '#client/stores/intentionEngine'
import { isRouteActive } from '#client/stores/router'

type ChakraView = 'status' | 'session' | 'recommendations'

const STATUS_LABELS: Record<string, string> = {
  blocked: 'BLOCKED',
  strained: 'STRAINED',
  depleted: 'DEPLETED',
  balanced: 'BALANCED',
  open: 'OPEN',
  overactive: 'OVERACTIVE',
  grounded: 'GROUNDED',
  flowing: 'FLOWING',
}

/**
 * Chakra Ergonomics Widget
 *
 * Surfaces the seven-chakra energy map alongside real-time session
 * ergonomics.  Three views cycle through status, session metrics,
 * and actionable recommendations.
 *
 * CQGS Bioethics: The body is not separate from the session.
 */
export function ChakraErgonomicsWidget() {
  const [view, setView] = React.useState<ChakraView>('status')
  const state = useStore(chakraErgonomics)
  const hasInitRef = React.useRef(false)

  // Recompute on mount and every 2 minutes
  React.useEffect(() => {
    recomputeChakras()
    const interval = setInterval(() => {
      // recomputeChakras() writes the chakraErgonomics atom → re-renders
      // subscribers. Skip while this widget's tab is not the one being viewed.
      if (document.hidden || !isRouteActive('system')) return
      recomputeChakras()
    }, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Record signal once per mount
  if (!hasInitRef.current) {
    const weakest = [...state.chakras].sort((a, b) => a.charge - b.charge)[0]
    if (weakest) {
      recordSignal('selfcare', `chakra_scan_${weakest.id}`, {
        weakestCharge: weakest.charge,
        coherence: state.session.coherence,
        durationMinutes: state.session.durationMinutes,
      })
    }
    hasInitRef.current = true
  }

  const cycleView = () => {
    setView(prev =>
      prev === 'status' ? 'session' :
      prev === 'session' ? 'recommendations' :
      'status'
    )
  }

  const label =
    view === 'status' ? 'Chakra Field:' :
    view === 'session' ? 'Session:' :
    'Body:'

  // Only show the 4 most relevant chakras in status view (like the user's display)
  const primaryChakras = getPrimaryChakras(state.chakras)
  const highPriorityRecs = state.recommendations.filter(r => r.priority === 'high' || r.priority === 'medium')

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'status' && (
        <div>
          {primaryChakras.map(chakra => (
            <div key={chakra.id} className="mb-4 flex items-center gap-8">
              <span className="uppercase" style={{ minWidth: 110 }}>{chakra.label}</span>
              <span className="opacity-50">{formatCharge(chakra.charge)}</span>
              <span className="uppercase opacity-70">{STATUS_LABELS[chakra.status] || chakra.status}</span>
              <span className="opacity-30">-- {chakra.quality}</span>
            </div>
          ))}

          {/* Top recommendation if urgent */}
          {highPriorityRecs.length > 0 && (
            <div className="mt-8 opacity-30">
              {highPriorityRecs[0].action}
            </div>
          )}
        </div>
      )}

      {view === 'session' && (
        <div>
          <div className="mb-4">
            SESSION: {formatDuration(state.session.durationMinutes)}
            {' / '}
            {state.session.interactionCount.toLocaleString()} keystrokes
            {' / '}
            COHERENCE: {state.session.coherence}%
          </div>

          {/* Mini chakra summary — one line */}
          <div className="mb-8 opacity-50">
            {state.chakras.map(c => {
              const icon =
                c.charge >= 70 ? '\u25C9' :
                c.charge >= 40 ? '\u25CE' :
                '\u25CB'
              return icon
            }).join(' ')}
          </div>

          {state.layoutSuggestion && (
            <div className="opacity-30">
              LAYOUT NEXT SESSION: {state.layoutSuggestion}
            </div>
          )}
        </div>
      )}

      {view === 'recommendations' && (
        <div>
          {state.recommendations.length === 0 ? (
            <div className="opacity-50">All systems balanced. No action needed.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {state.recommendations.slice(0, 4).map((rec, idx) => (
                <div key={idx}>
                  <span className="capitalize opacity-50">{rec.category}:</span>{' '}
                  {rec.action}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Block>
  )
}

/**
 * Return the 4 most "interesting" chakras — weakest 2 + strongest 2,
 * deduplicated and ordered top-down (crown → root).
 */
function getPrimaryChakras(chakras: ChakraLevel[]): ChakraLevel[] {
  const sorted = [...chakras].sort((a, b) => a.charge - b.charge)
  const weakest = sorted.slice(0, 2)
  const strongest = sorted.slice(-2)
  const ids = new Set<string>()
  const selected: ChakraLevel[] = []

  // Merge, dedup, maintain original order
  for (const c of [...weakest, ...strongest]) {
    if (!ids.has(c.id)) {
      ids.add(c.id)
      selected.push(c)
    }
  }

  // Sort by original definition order (crown → root)
  const ORDER = ['crown', 'thirdEye', 'throat', 'heart', 'solarPlexus', 'sacral', 'root']
  selected.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id))

  return selected
}
