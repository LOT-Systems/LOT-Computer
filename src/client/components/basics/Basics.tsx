/**
 * LOT SYSTEMS CORPORATION
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { PRICE_USD_MONTH, RATION, CADENCE_CODE } from './ration'

const W = 64 // fixed character grid, columns

const pad = (s: string, n: number) => s.slice(0, n).padEnd(n, ' ')
const rule = '='.repeat(W)

const Inverse: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: '#000', color: '#fff' }}>{children}</div>
)

/**
 * BASICS — OPEN TAB. Read-only ledger of the BASIC (RATION) load.
 * White ground, black ink, inversion-only hierarchy, 2px rules, square.
 */
export const Basics: React.FC = () => {
  const counts = React.useMemo(() => {
    const c: Record<string, number> = {}
    RATION.forEach((r) => (c[r.cadence] = (c[r.cadence] ?? 0) + 1))
    return c
  }, [])

  return (
    <div
      style={{
        background: '#fff',
        color: '#000',
        border: '2px solid #000',
        borderRadius: 0,
        fontFamily: '"Liberation Mono","LiberationMono-Bold",monospace',
        fontWeight: 700,
        whiteSpace: 'pre',
        overflowX: 'auto',
        padding: 16,
        fontSize: 14,
        lineHeight: '1.5rem',
      }}
      data-lot-basics="open-tab"
    >
      <Inverse>{pad(' LOT-FM-001 / BASIC (RATION) / OPEN TAB', W)}</Inverse>
      <div>{rule}</div>
      <div>{pad('STATUS', 12)}OPEN / READ-ONLY / ISSUE 01</div>
      <div>{pad('TERMS', 12)}USD {PRICE_USD_MONTH}/MO / CANCEL ANY TIME</div>
      <div>{pad('STRENGTH', 12)}{RATION.length} ITEMS ON LOAD</div>
      <div>{rule}</div>
      <div>{'ISSUE, NOT SOLD. THE USER IS ON STRENGTH.'}</div>
      <div>{'THE LEDGER IS THE MARKETING. NOTHING IS WITHHELD BUT COST.'}</div>
      <div>{rule}</div>
      <Inverse>{pad(' NO  NOMENCLATURE', W - 6) + 'CAD   '}</Inverse>
      {RATION.map((r) => (
        <div key={r.no}>
          {String(r.no).padStart(3, '0') + '  ' + pad(r.nomenclature, W - 11) + '  ' + CADENCE_CODE[r.cadence]}
        </div>
      ))}
      <div>{rule}</div>
      <div>
        {'CAD KEY  M=MONTHLY (' + (counts.MONTHLY ?? 0) + ')  Q=QUARTERLY (' + (counts.QUARTERLY ?? 0) + ')'}
      </div>
      <div>
        {'          S=SEMIANNUAL (' + (counts.SEMIANNUAL ?? 0) + ')  A=ANNUAL (' + (counts.ANNUAL ?? 0) + ')  1=ONCE (' + (counts.ONCE ?? 0) + ')'}
      </div>
      <div>{rule}</div>
      <Inverse>{pad(' UPGRADE / ROSTER: NOT YET OPEN (PHASE 2)', W)}</Inverse>
    </div>
  )
}
