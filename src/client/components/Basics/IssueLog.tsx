/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / ISSUE LOG
 * Accrues one line per issue. Margin is withheld from the subscriber view.
 */

import * as React from 'react'
import { IssueLogEntry } from './types'
import { T, base, inv, row } from './tokens'

type Props = {
  entries: IssueLogEntry[]
  nextIssueDate: string | null
}

const COLS = { no: '5ch', date: '12ch', items: '7ch', card: '7ch' }

export function IssueLog({ entries, nextIssueDate }: Props) {
  return (
    <div>
      <div style={{ ...inv, display: 'flex', gap: '2ch', padding: '4px 1ch' }}>
        <span style={{ width: COLS.no, flexShrink: 0 }}>NO.</span>
        <span style={{ width: COLS.date, flexShrink: 0 }}>DATE</span>
        <span style={{ flex: 1 }}>STATUS</span>
        <span style={{ width: COLS.items, flexShrink: 0, textAlign: 'right' }}>ITEMS</span>
        <span style={{ width: COLS.card, flexShrink: 0, textAlign: 'right' }}>CARD</span>
      </div>

      {entries.length === 0 ? (
        <div style={row}>NO ISSUES ON RECORD. FIRST ISSUE IN QUEUE.</div>
      ) : (
        entries.map((e) => (
          <div key={e.id} style={row}>
            <span style={{ width: COLS.no, flexShrink: 0 }}>{String(e.no).padStart(3, '0')}</span>
            <span style={{ width: COLS.date, flexShrink: 0 }}>{e.date}</span>
            <span style={{ flex: 1 }}>
              {e.status}
              {e.trackingCode ? ` / ${e.trackingCode}` : ''}
            </span>
            <span style={{ width: COLS.items, flexShrink: 0, textAlign: 'right' }}>{e.items}</span>
            <span style={{ width: COLS.card, flexShrink: 0, textAlign: 'right' }}>
              <a
                href={`/api/basics/manifest-card/${e.id}`}
                target="_blank"
                rel="noreferrer"
                style={{ ...base, textDecoration: 'underline' }}
              >
                PRINT
              </a>
            </span>
          </div>
        ))
      )}

      {nextIssueDate && (
        <div style={row}>
          <span style={{ minWidth: T.labelCh, flexShrink: 0 }}>NEXT ISSUE</span>
          <span>{nextIssueDate}</span>
        </div>
      )}
    </div>
  )
}
