/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / ISSUE LOG
 * Month 2: scaffold. Month 3: live data from fulfillment engine.
 */

import * as React from 'react'
import { IssueLogEntry } from './types'

const T = {
  ink:      '#000000',
  bg:       '#ffffff',
  rule:     '2px solid #000000',
  ruleHalf: '1px solid #000000',
  font:     "'Liberation Mono', 'Lucida Console', 'Courier New', Courier, monospace",
  size:     '13px',
  lineH:    '1.5',
} as const

const base: React.CSSProperties = {
  fontFamily:    T.font,
  fontSize:      T.size,
  lineHeight:    T.lineH,
  color:         T.ink,
  background:    T.bg,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.03em',
  borderRadius:  0,
}

type Props = {
  entries: IssueLogEntry[]
  nextIssueDate: string | null
}

const STATUS_RANK: Record<string, number> = {
  DELIVERED: 4, IN_TRANSIT: 3, DISPATCHED: 2, SCHEDULED: 1,
}

export function IssueLog({ entries, nextIssueDate }: Props) {
  return (
    <div>
      {/* Column headers */}
      <div style={{ ...base, display: 'flex', fontWeight: 700, padding: '4px 12px', borderBottom: T.rule, background: T.ink, color: T.bg, letterSpacing: '0.08em' }}>
        <span style={{ minWidth: '44px', flexShrink: 0 }}>NO.</span>
        <span style={{ minWidth: '108px', flexShrink: 0 }}>DATE</span>
        <span style={{ flex: 1 }}>STATUS</span>
        <span style={{ minWidth: '56px', textAlign: 'right', flexShrink: 0 }}>ITEMS</span>
        <span style={{ minWidth: '72px', textAlign: 'right', flexShrink: 0 }}>MARGIN</span>
        <span style={{ minWidth: '56px', textAlign: 'right', flexShrink: 0 }}>CARD</span>
      </div>

      {entries.length === 0 ? (
        <div style={{ ...base, padding: '8px 12px', borderBottom: T.ruleHalf, opacity: 0.4 }}>
          NO ISSUES ON RECORD — FIRST ISSUE PENDING.
        </div>
      ) : (
        entries.map((e, i) => {
          const isDelivered = e.status === 'DELIVERED'
          return (
            <div key={e.id} style={{ ...base, display: 'flex', alignItems: 'center', padding: '3px 12px', borderBottom: T.ruleHalf, background: i % 2 === 0 ? T.bg : '#f9f9f9' }}>
              <span style={{ minWidth: '44px', flexShrink: 0, opacity: 0.55 }}>{String(e.no).padStart(3, '0')}</span>
              <span style={{ minWidth: '108px', flexShrink: 0 }}>{e.date}</span>
              <span style={{ flex: 1, fontWeight: isDelivered ? 700 : 400, opacity: e.status === 'SCHEDULED' ? 0.55 : 1 }}>{e.status}</span>
              <span style={{ minWidth: '56px', textAlign: 'right', flexShrink: 0 }}>{e.items}</span>
              <span style={{ minWidth: '72px', textAlign: 'right', flexShrink: 0, fontWeight: 700 }}>
                {(e.marginPct * 100).toFixed(0)}%
              </span>
              <span style={{ minWidth: '56px', textAlign: 'right', flexShrink: 0 }}>
                <a
                  href={`/api/basics/manifest-card/${e.id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...base, color: T.ink, textDecoration: 'underline', fontSize: '11px' }}
                >
                  PRINT
                </a>
              </span>
            </div>
          )
        })
      )}

      {nextIssueDate && (
        <div style={{ ...base, padding: '4px 12px', borderTop: entries.length > 0 ? T.rule : 'none', opacity: 0.55, fontSize: '11px' }}>
          NEXT ISSUE: {nextIssueDate}
        </div>
      )}
    </div>
  )
}
