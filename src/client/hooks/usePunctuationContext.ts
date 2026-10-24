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
  const { data: logs = [] } = useLogs()
  const snapshot = useStore(punctuationContext)

  // Recompute whenever logs change. The store short-circuits on no-op
  // updates so this does not spam re-renders.
  React.useEffect(() => {
    updatePunctuationFromLogs(logs)
  }, [logs])

  return snapshot
}
