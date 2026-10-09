/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import {
  BASICS_DOCTRINE,
  BASICS_MANIFEST,
  BASICS_PRICE_USD,
  GRID_COLS,
  gridLine,
  ledgerHeader,
  ledgerRow,
  statusLine,
} from '#shared/constants/basics'

// House style: monospace bold, white ground / black ink, inversion-only
// hierarchy, 2px rules, square corners, fixed character grid. No color/icons.
const mono: React.CSSProperties = {
  fontFamily: "'LiberationMono-Bold','Liberation Mono','Courier New',monospace",
  fontWeight: 700,
  fontSize: 14,
  lineHeight: '24px',
  whiteSpace: 'pre',
  borderRadius: 0,
}
const rule = '2px solid #000'

const Inv: React.FC<{ children: string }> = ({ children }) => (
  <div style={{ background: '#000', color: '#fff' }}>{gridLine(children)}</div>
)

export const StatusLine: React.FC<{ state: string; items: number }> = ({ state, items }) => (
  <Inv>{statusLine({ state, items })}</Inv>
)

/** BASICS — OPEN TAB. Public, read-only. Month 1 of LOT-FM-001. */
export function BasicsPage() {
  return (
    <div style={{ ...mono, background: '#fff', color: '#000', border: rule, overflowX: 'auto', maxWidth: `${GRID_COLS + 2}ch` }}>
      <StatusLine state="OPEN TAB" items={BASICS_MANIFEST.length} />
      <div style={{ borderBottom: rule }}>{gridLine('')}</div>
      <div>{gridLine('LOT-FM-001 / BASIC RATION')}</div>
      <div>{gridLine('')}</div>
      {BASICS_DOCTRINE.map((l) => (
        <div key={l}>{gridLine(l)}</div>
      ))}
      <div>{gridLine('')}</div>
      <div style={{ borderTop: rule, borderBottom: rule }}>
        {gridLine(`PRICE  USD ${BASICS_PRICE_USD}/MO   BILLING MONTHLY   CANCEL ANY TIME`)}
      </div>
      <div>{gridLine('')}</div>
      <Inv>{ledgerHeader()}</Inv>
      {BASICS_MANIFEST.map((i) => (
        <div key={i.seq}>{ledgerRow(i)}</div>
      ))}
      <div style={{ borderTop: rule }}>{gridLine(`TOTAL ${BASICS_MANIFEST.length} ITEMS. COST WITHHELD.`)}</div>
      <div>{gridLine('UPGRADE FROM USERSHIP: OFFLINE UNTIL MONTH 2.')}</div>
    </div>
  )
}
