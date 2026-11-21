/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 status line — 3270-style operator line. KEY:VALUE pairs on one
// rule-bounded row. Reused by UPGRADE (M2) and ISSUE LOG (M3).

import * as React from 'react'

export type StatusItem = { k: string; v: string }

export function StatusLine({ items }: { items: StatusItem[] }) {
  return (
    <div className="fm-status fm-rule" role="status" aria-live="polite">
      {items.map(({ k, v }) => (
        <span key={k}>
          {k}:{v}
        </span>
      ))}
    </div>
  )
}
