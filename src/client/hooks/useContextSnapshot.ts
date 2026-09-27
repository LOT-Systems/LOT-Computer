/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { persistentAtom } from '@nanostores/persistent'
import { useCreateLog } from '#client/queries'

/**
 * useContextSnapshot — click-to-record the moment.
 *
 * The System page surfaces the user's live environment context —
 * weather, temperature, sky, humidity, sunrise/sunset, astrology,
 * time. Clicking any of those widgets already changes what's on
 * screen (unit toggle, view cycle); this hook additionally records
 * that moment as a passive context_snapshot Log entry — no photo, no
 * sound, just the environment reading the server already attaches to
 * every Log (see getLogContext) — so the click also becomes a data
 * point in the user's own timeline.
 *
 * Rate-limited per source so repeated clicks (toggling temperature
 * units back and forth, cycling the astrology view) don't flood the
 * Log with duplicate snapshots.
 */
const SNAPSHOT_COOLDOWN_MS = 90 * 1000

const lastSnapshotAtBySource = persistentAtom<Record<string, number>>(
  'lastContextSnapshotAt',
  {},
  {
    encode: JSON.stringify,
    decode: (value) => {
      try {
        return value ? JSON.parse(value) : {}
      } catch {
        return {}
      }
    },
  }
)

export function useContextSnapshot() {
  const { mutate: createLog } = useCreateLog()

  const recordSnapshot = React.useCallback(
    (source: string) => {
      const now = Date.now()
      const last = lastSnapshotAtBySource.get()
      if (now - (last[source] || 0) < SNAPSHOT_COOLDOWN_MS) return
      lastSnapshotAtBySource.set({ ...last, [source]: now })
      createLog({
        text: `SNAPSHOT — ${source}`,
        event: 'context_snapshot',
        metadata: { source },
      })
    },
    [createLog]
  )

  return recordSnapshot
}
