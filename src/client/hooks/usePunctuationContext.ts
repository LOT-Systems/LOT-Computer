/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useLogs } from '#client/queries'
import {
  punctuationContext,
  updatePunctuationFromLogs,
  type PunctuationContextState,
} from '#client/stores/punctuationContext'

/**
 * usePunctuationContext
 *
 * React hook that ensures the punctuation context store is kept up to
 * date from the user's logs, and returns the latest snapshot. Any widget
 * that wants to respond to the user's intonation can call this hook —
 * the work of analyzing logs is memoized via the store, so calling it
 * from many widgets is cheap.
 *
 * Returns the full PunctuationContextState (aggregate, latest, trend,
 * callForHelp flag, etc.).
 */
export function usePunctuationContext(): PunctuationContextState {
  // No `= []` default here: a fresh array literal on every render (while logs
  // are loading, errored or rate-limited) re-fired the effect below, which
  // always writes the store → re-render → new [] → "Maximum update depth
  // exceeded". That loop crashed CohortConnectWidget (Community group) and
  // MicroImageWidget. Only recompute when react-query hands us real data.
  const { data: logs } = useLogs()
  const snapshot = useStore(punctuationContext)

  React.useEffect(() => {
    if (!logs) return
    updatePunctuationFromLogs(logs)
  }, [logs])

  return snapshot
}
