/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / BASIC (RATION) — OPEN TAB
 * Public ledger of the 23-item ration load. Read-only. COGS withheld.
 */

import * as React from 'react'
import {
  BASIC_MANIFEST,
  BASIC_PRICE_USD,
  CADENCE_LABEL,
  DOCTRINE,
  itemsForIssue,
} from '#shared/basics/manifest'

const RULE = '2px solid currentColor'
const pad = (s: string | number, n: number) => String(s).padEnd(n, ' ')
const lpad = (s: string | number, n: number) => String(s).padStart(n, ' ')

const Rule: React.FC = () => (
  <div style={{ borderTop: RULE, margin: '12px 0' }} aria-hidden />
)

const Inverse: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-acc text-bac" style={{ padding: '0 1ch' }}>
    {children}
  </span>
)

export const StatusLine: React.FC<{ state?: string; next?: string }> = ({
  state = 'OPEN TAB',
  next = 'ISSUE 01',
}) => (
  <div className="bg-acc text-bac" style={{ padding: '0 1ch', whiteSpace: 'pre' }}>
    {`LOT-FM-001 | BASIC | ${state} | ${BASIC_MANIFEST.length} LINES | USD ${BASIC_PRICE_USD}/MO | NEXT ${next}`}
  </div>
)

export const Basics: React.FC<{ standalone?: boolean }> = ({ standalone }) => {
  const issue1 = itemsForIssue(1).length
  const issue2 = itemsForIssue(2).length
  const issue3 = itemsForIssue(3).length

  return (
    <div
      style={{
        fontFamily: "'Liberation Mono', ui-monospace, monospace",
        fontWeight: 700,
        textTransform: 'uppercase',
        overflowX: 'auto',
        ...(standalone ? { padding: 16, maxWidth: '88ch', margin: '0 auto' } : {}),
      }}
    >
      <StatusLine />
      <Rule />

      <div style={{ whiteSpace: 'pre-wrap' }}>
        {DOCTRINE.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>

      <Rule />
      <div>
        <Inverse>PRICE</Inverse> USD {BASIC_PRICE_USD}/MO. ADDITIVE TO USERSHIP. CANCEL ANY TIME.
      </div>
      <div>
        <Inverse>TERMS</Inverse> STAND DOWN DROPS THE RATION. AI RETAINED.
      </div>

      <Rule />
      <div style={{ whiteSpace: 'pre' }}>
        <div className="bg-acc text-bac" style={{ padding: '0 1ch' }}>
          {`${pad('NO', 4)}${pad('GROUP', 9)}${pad('NOMENCLATURE', 26)}${lpad('QTY', 4)}  CADENCE`}
        </div>
        {BASIC_MANIFEST.map((i) => (
          <div key={i.no}>
            {`${pad(String(i.no).padStart(2, '0'), 4)}${pad(i.group, 9)}${pad(i.nomenclature, 26)}${lpad(i.qty, 4)}  ${CADENCE_LABEL[i.cadence]}`}
          </div>
        ))}
      </div>

      <Rule />
      <div style={{ whiteSpace: 'pre' }}>
        {`ISSUE 01 ${lpad(issue1, 2)} LINES · ISSUE 02 ${lpad(issue2, 2)} LINES · ISSUE 03 ${lpad(issue3, 2)} LINES`}
      </div>
      <div>COST OF GOODS WITHHELD. MARGIN FLOOR 60%. LANDED CEILING HELD.</div>

      <Rule />
      <button
        disabled
        className="bg-acc text-bac"
        style={{ padding: '0 2ch', opacity: 0.3, cursor: 'not-allowed', border: RULE, borderRadius: 0 }}
      >
        UPGRADE — NOT YET ISSUED (MONTH 2)
      </button>
    </div>
  )
}
