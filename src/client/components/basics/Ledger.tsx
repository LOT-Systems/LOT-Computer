/**
 * LOT-FM-001 / OPEN TAB ledger pieces — shared by the in-app Basics tab and the
 * public (logged-out) /open-tab page. One source: src/shared/basics/manifest.ts.
 * No layer between public and manifest. COGS never enters the client.
 */

import * as React from 'react'
import {
  RATION_MANIFEST,
  DOCTRINE_LINES,
  PRICE_LINE,
  MANUAL_REF,
  RATION_COUNT,
  SCHEDULE_HORIZON,
  cadenceLabel,
  issueLoad,
  type RationCategory,
} from '#shared/basics/manifest'

const CATEGORIES: RationCategory[] = ['HYGIENE', 'GROOMING', 'GARMENT', 'SUSTENANCE', 'RECORD']
const COLS = '28px 1fr auto 96px'

// Inversion bar: the only hierarchy device.
export const Bar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-acc text-bac font-mono text-[12px] uppercase px-8 py-4">{children}</div>
)

export const LedgerHead: React.FC<{ title?: string }> = ({ title = 'BASICS' }) => (
  <div className="flex justify-between items-baseline pb-4 border-b-2 border-acc">
    <span className="uppercase font-bold">{title}</span>
    <span>{MANUAL_REF}</span>
  </div>
)

export const Doctrine: React.FC = () => (
  <div className="flex flex-col gap-y-4">
    {DOCTRINE_LINES.map((l) => (
      <p key={l}>{l}</p>
    ))}
    <p className="font-bold">{PRICE_LINE}</p>
  </div>
)

export const ManifestLedger: React.FC = () => (
  <div>
    <Bar>RATION MANIFEST — {RATION_COUNT} LINES</Bar>
    <div className="grid gap-x-8 py-4 border-b-2 border-acc uppercase" style={{ gridTemplateColumns: COLS }}>
      <span>NO.</span>
      <span>NOMENCLATURE</span>
      <span className="text-right">SPEC</span>
      <span className="text-right">CADENCE</span>
    </div>
    {CATEGORIES.map((cat) => {
      const rows = RATION_MANIFEST.filter((i) => i.category === cat)
      return (
        <div key={cat} className="pt-8">
          <div className="uppercase font-bold">{cat} ({rows.length})</div>
          {rows.map((i) => (
            <div
              key={i.line}
              className="grid gap-x-8 py-4 border-b border-acc"
              style={{ gridTemplateColumns: COLS }}
            >
              <span className="tabular-nums">{i.line}</span>
              <span className="uppercase">{i.nomenclature}</span>
              <span className="text-right whitespace-nowrap">{i.spec}</span>
              <span className="text-right">{cadenceLabel(i.everyMonths)}</span>
            </div>
          ))}
        </div>
      )
    })}
  </div>
)

export const IssueSchedule: React.FC = () => (
  <div>
    <Bar>ISSUE SCHEDULE — {SCHEDULE_HORIZON} MO</Bar>
    {Array.from({ length: SCHEDULE_HORIZON }, (_, k) => k + 1).map((n) => (
      <div key={n} className="grid gap-x-8 py-4 border-b border-acc" style={{ gridTemplateColumns: '48px 1fr' }}>
        <span className="tabular-nums">{String(n).padStart(2, '0')}</span>
        <span>{issueLoad(n).length} / {RATION_COUNT} LINES</span>
      </div>
    ))}
  </div>
)
