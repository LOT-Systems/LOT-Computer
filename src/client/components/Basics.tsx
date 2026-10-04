/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { cn } from '#client/utils'
import {
  BASIC_DOCTRINE,
  BASIC_ITEM_COUNT,
  BASIC_MANIFEST,
  BASIC_PRICE_USD,
  cadenceLabel,
  issueLoad,
} from '#shared/basics/manifest'

/**
 * BASICS — OPEN TAB (LOT-FM-001, Month 1: LEDGER & DOCTRINE).
 * Read-only. Fixed grid, 2px rules, square corners, inversion-only hierarchy.
 * Renders the shared manifest directly: no layer between public and ledger.
 */

const RULE = 'border-2 border-acc rounded-none'
const INVERT = 'bg-acc text-bac'

export function StatusLine({ state }: { state: string }) {
  const cells = [
    'LOT-FM-001',
    'BASIC',
    `USD ${BASIC_PRICE_USD}/MO`,
    `${BASIC_ITEM_COUNT} ITEMS`,
    state,
  ]
  return (
    <div className={cn(INVERT, 'px-8 py-4 uppercase flex flex-wrap gap-x-16')}>
      {cells.map((c) => (
        <span key={c}>{c}</span>
      ))}
    </div>
  )
}

const pad2 = (n: number) => String(n).padStart(2, '0')

function Ledger() {
  return (
    <div className={cn(RULE, 'uppercase')}>
      <div
        className={cn(INVERT, 'grid grid-cols-[3ch_1fr_12ch] gap-x-8 px-8 py-4')}
      >
        <span>NO</span>
        <span>NOMENCLATURE</span>
        <span>CADENCE</span>
      </div>
      {BASIC_MANIFEST.map((item) => (
        <div
          key={item.no}
          className="grid grid-cols-[3ch_1fr_12ch] gap-x-8 px-8 py-4 border-t-2 border-acc"
        >
          <span>{pad2(item.no)}</span>
          <span>{item.name}</span>
          <span>{cadenceLabel(item.cadence)}</span>
        </div>
      ))}
    </div>
  )
}

function IssueSchedule() {
  const [issue, setIssue] = React.useState(1)
  const load = React.useMemo(() => issueLoad(issue), [issue])
  return (
    <div className="uppercase">
      <div className="flex flex-wrap gap-4 mb-8">
        {Array.from({ length: 12 }, (_, k) => k + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setIssue(n)}
            aria-pressed={issue === n}
            className={cn(RULE, 'px-8 py-4', issue === n && INVERT)}
          >
            {pad2(n)}
          </button>
        ))}
      </div>
      <div className={RULE}>
        <div className={cn(INVERT, 'px-8 py-4')}>
          ISSUE {pad2(issue)} — {load.length} OF {BASIC_ITEM_COUNT} LINES
        </div>
        {load.map((item) => (
          <div
            key={item.no}
            className="grid grid-cols-[3ch_1fr] gap-x-8 px-8 py-4 border-t-2 border-acc"
          >
            <span>{pad2(item.no)}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-24">
      <div className="uppercase mb-8">{title}</div>
      {children}
    </section>
  )
}

export function Basics() {
  const me = useStore(stores.me)
  const upgrade = me ? 'UPGRADE: NOT YET ISSUED' : 'UPGRADE: LOG IN'
  return (
    <div className="flex flex-col max-w-[72ch]">
      <div className="mb-24">
        <StatusLine state="OPEN TAB // READ-ONLY" />
      </div>

      <Section title="DOCTRINE">
        <div className={cn(RULE, 'px-8 py-8 uppercase')}>
          {BASIC_DOCTRINE.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </Section>

      <Section title="TERMS">
        <div className={cn(RULE, 'px-8 py-8 uppercase')}>
          <div>USD {BASIC_PRICE_USD}/MO. ADDITIVE TO USERSHIP.</div>
          <div>{BASIC_ITEM_COUNT} LINES ON THE MANIFEST. ONE BOX PER MONTH.</div>
          <div>STAND DOWN AT ANY TIME. THE AI PLAN IS RETAINED.</div>
        </div>
      </Section>

      <Section title="MANIFEST">
        <Ledger />
      </Section>

      <Section title="ISSUE SCHEDULE">
        <IssueSchedule />
      </Section>

      <Section title="STATUS">
        <div className={cn(RULE, 'px-8 py-4 uppercase')}>{upgrade}</div>
      </Section>
    </div>
  )
}
