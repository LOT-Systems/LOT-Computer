/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * BASICS TAB — LOT-FM-001 · BASIC (RATION) · MONTH 1: LEDGER & DOCTRINE
 *
 * The OPEN TAB. Read-only. Renders the 23-item manifest as a ledger
 * (nomenclature + cadence; COGS withheld), the doctrine, the price line and
 * a status line. Same component serves the in-app tab (member) and the
 * public /basics surface (stranger). No stores, no fetches: the manifest is
 * the source of truth and is compiled in.
 *
 * House style: monospace bold, ink on ground, inversion-only hierarchy,
 * 2px rules, square corners, fixed character grid. No color, radius, icons.
 */

import * as React from 'react'
import {
  RATION_MANIFEST,
  RATION_TERMS,
  DOCTRINE,
  CADENCE_LABEL,
  SUPPLY_CLASS_LABEL,
  loadForIssue,
  nextIssueDate,
  type RationItem,
  type SupplyClass,
} from '#shared/basics/manifest'

const MONO: React.CSSProperties = {
  fontFamily: "'Liberation Mono', 'LiberationMono-Bold', 'Courier New', Courier, monospace",
  fontWeight: 700,
  letterSpacing: 0,
}

// Fixed character grid: LN | NOMENCLATURE ··· QTY UI  CADENCE. The qty/cadence
// block is a fixed-width padded string; on narrow screens it wraps under the
// nomenclature instead of crushing it.
const LEDGER_GRID: React.CSSProperties = {
  gridTemplateColumns: '3ch minmax(0,1fr)',
  columnGap: '2ch',
}

const CLASS_ORDER: SupplyClass[] = ['I', 'II', 'VIII', 'IV']

const fmtDate = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`

/** Inverted bar — the only hierarchy device. */
function Bar({ left, right }: { left: string; right?: string }) {
  return (
    <div className="bg-acc text-bac px-8 flex justify-between gap-16 uppercase">
      <span>{left}</span>
      {right && <span className="text-right">{right}</span>}
    </div>
  )
}

function Section({ title, right, children }: { title: string; right?: string; children: React.ReactNode }) {
  return (
    <section className="border-2 border-acc rounded-none">
      <Bar left={title} right={right} />
      <div className="px-8 py-8">{children}</div>
    </section>
  )
}

function LedgerRow({ item }: { item: RationItem }) {
  return (
    <div className="grid border-t-2 border-acc first:border-t-0 py-2" style={LEDGER_GRID}>
      <span>{item.line}</span>
      <span className="flex flex-wrap justify-between" style={{ columnGap: '2ch' }}>
        <span className="break-words" style={{ minWidth: 0 }}>
          {item.nomenclature}
          {item.sized ? ' *' : ''}
        </span>
        <span style={{ whiteSpace: 'pre' }}>
          {`${item.qty} ${item.unit}`.padStart(10)}  {CADENCE_LABEL[item.cadence].padEnd(13)}
        </span>
      </span>
    </div>
  )
}

export function StatusLine({ mode }: { mode: 'public' | 'member' }) {
  const next = fmtDate(nextIssueDate())
  const fields = [
    'BASIC',
    'LEDGER V1',
    `${RATION_MANIFEST.length}/${RATION_TERMS.itemCount} ITEMS`,
    `NEXT ISSUE ${next}`,
    'ROSTER CLOSED',
    mode === 'member' ? 'YOU: USERSHIP' : 'YOU: NOT ON STRENGTH',
  ]
  return (
    <div className="bg-acc text-bac px-8 flex flex-wrap gap-x-8 uppercase" role="status">
      {fields.map((f, i) => (
        <span key={f}>
          {i > 0 && '· '}
          {f}
        </span>
      ))}
    </div>
  )
}

export function Basics({ mode = 'member' }: { mode?: 'public' | 'member' }) {
  const firstLoad = React.useMemo(() => loadForIssue(0), [])
  const byClass = React.useMemo(() => {
    const m = new Map<SupplyClass, RationItem[]>()
    for (const c of CLASS_ORDER) m.set(c, [])
    for (const it of RATION_MANIFEST) m.get(it.cls)!.push(it)
    return m
  }, [])

  return (
    <div style={MONO} className="flex flex-col gap-y-16 uppercase max-w-[96ch] text-acc" data-lot-basics="ledger">
      <Bar left="LOT-FM-001 · BASIC (RATION)" right="OPEN TAB" />

      <Section title="DOCTRINE">
        {DOCTRINE.map((d, i) => (
          <div key={d}>
            {String(i + 1).padStart(2, '0')}. {d}
          </div>
        ))}
      </Section>

      <Section title="TERMS">
        <div className="grid" style={{ gridTemplateColumns: '11ch minmax(0,1fr)', columnGap: '1ch' }}>
          <span>PLAN</span>
          <span>{RATION_TERMS.plan}</span>
          <span>PRICE</span>
          <span>USD {RATION_TERMS.priceUsdMonthly} / MONTH</span>
          <span>REQUIRES</span>
          <span>{RATION_TERMS.requires} (AI). RATION IS ADDITIVE.</span>
          <span>LOAD</span>
          <span>{RATION_TERMS.itemCount} ITEMS ON CADENCE. ONE BOX PER MONTH.</span>
          <span>DISPATCH</span>
          <span>1ST OF EACH MONTH.</span>
          <span>STAND DOWN</span>
          <span>ANY TIME. RATION STOPS. AI RETAINED.</span>
        </div>
      </Section>

      <Section title="MANIFEST" right={`${RATION_MANIFEST.length} LINES`}>
        <div className="grid pb-2" style={LEDGER_GRID}>
          <span>LN</span>
          <span className="flex flex-wrap justify-between" style={{ columnGap: '2ch' }}>
            <span>NOMENCLATURE</span>
            <span style={{ whiteSpace: 'pre' }}>{'QTY UI'.padStart(10)}  {'CADENCE'.padEnd(13)}</span>
          </span>
        </div>
        <div className="flex flex-col gap-y-8">
          {CLASS_ORDER.map((c) => (
            <div key={c} className="border-2 border-acc">
              <div className="px-8 border-b-2 border-acc">{SUPPLY_CLASS_LABEL[c]}</div>
              <div className="px-8">
                {byClass.get(c)!.map((it) => (
                  <LedgerRow key={it.line} item={it} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-8">* SIZED AT ROSTER INTAKE. UNIT COST WITHHELD.</div>
      </Section>

      <Section title="FIRST ISSUE · LOAD 000" right={`${firstLoad.length} LINES`}>
        <div>{firstLoad.map((i) => i.line).join(' ')}</div>
        <div className="pt-8">
          SUBSEQUENT ISSUES ROTATE PER CADENCE. EVERY RECURRING LINE SHIPS AT LEAST ONCE PER 12 ISSUES.
        </div>
      </Section>

      <Section title="UPGRADE">
        <div>USERSHIP (AI) → PENDING → ON STRENGTH → STEADY STATE</div>
        <div className="pt-8">ROSTER: NOT YET OPEN. NO ACTION REQUIRED.</div>
      </Section>

      <StatusLine mode={mode} />
    </div>
  )
}
