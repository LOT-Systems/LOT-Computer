/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * BASICS — LOT-FM-001 BASIC (RATION) MODULE — OPEN TAB.
 *
 * MONTH 1 INCREMENT: read-only ledger. Doctrine, terms, 23-item manifest
 * (nomenclature + cadence; COGS withheld), status line.
 *
 * House style: Liberation Mono Bold, ground/ink from theme tokens (bac/acc —
 * white/black in the default theme), inversion-only hierarchy, 2px rules,
 * square corners, fixed character grid. No color, no radius, no icons.
 *
 * Shared by the logged-in app (Basics tab) and the public /basics entry.
 */

import * as React from 'react'
import {
  BASIC_DOCTRINE,
  BASIC_MANIFEST,
  BASIC_MODULE,
  BASIC_TERMS,
  cadenceLabel,
} from '#shared/constants/basics'

const MONO: React.CSSProperties = {
  fontFamily: '"Liberation Mono", "Courier New", Courier, monospace',
  fontWeight: 700,
  letterSpacing: 0,
}

type Props = {
  /** Public OPEN TAB (logged out) vs. member view inside the app. */
  isPublic?: boolean
  /** Member strength state. Month 1: always USERSHIP/AI. */
  strength?: 'USERSHIP/AI' | 'PENDING' | 'ON STRENGTH' | 'STEADY STATE'
}

/** Inverted bar — the only form of emphasis in the module. */
const Inverse: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-acc text-bac px-8 rounded-none ${className}`}>{children}</div>
)

const Rule = () => <div className="border-t-2 border-acc rounded-none" />

const Section: React.FC<{ code: string; title: string; children: React.ReactNode }> = ({ code, title, children }) => (
  <section className="flex flex-col">
    <Inverse className="flex justify-between">
      <span>{title}</span>
      <span>{code}</span>
    </Inverse>
    <div className="border-2 border-t-0 border-acc rounded-none px-8 py-8">{children}</div>
  </section>
)

export const StatusLine: React.FC<{ cells: string[] }> = ({ cells }) => (
  <Inverse className="flex flex-wrap gap-x-[3ch] whitespace-pre">
    {cells.map((c) => (
      <span key={c}>{c}</span>
    ))}
  </Inverse>
)

export function Basics({ isPublic = false, strength = 'USERSHIP/AI' }: Props) {
  const lines = BASIC_MANIFEST
  const everyIssue = lines.filter((l) => l.cadence.period === 1).length

  return (
    <div style={MONO} className="flex flex-col gap-y-16 uppercase max-w-[80ch]">
      <StatusLine
        cells={[
          `${BASIC_MODULE.doc}`,
          `${BASIC_MODULE.module} · ${BASIC_MODULE.designation}`,
          `${BASIC_MODULE.revision}`,
          isPublic ? 'OPEN TAB' : `STATUS: ${strength}`,
        ]}
      />

      <Section code="SEC 1" title="DOCTRINE">
        {BASIC_DOCTRINE.map((d, i) => (
          <div key={d} className="grid grid-cols-[4ch_1fr]">
            <span>{String(i + 1).padStart(2, '0')}</span>
            <span>{d}</span>
          </div>
        ))}
      </Section>

      <Section code="SEC 2" title="TERMS OF ISSUE">
        {BASIC_TERMS.map((t) => (
          <div key={t.label} className="grid grid-cols-[14ch_1fr] phone:grid-cols-[16ch_1fr]">
            <span>{t.label}</span>
            <span>{t.value}</span>
          </div>
        ))}
      </Section>

      <Section code="SEC 3" title={`RATION LOAD · ${lines.length} ITEMS`}>
        <div className="grid grid-cols-[3ch_1fr_5ch_3ch] gap-x-[1ch] border-b-2 border-acc pb-4 mb-4">
          <span>LN</span>
          <span>NOMENCLATURE</span>
          <span className="text-right">QTY</span>
          <span>UI</span>
        </div>
        {lines.map((it) => (
          <div key={it.ln} className="grid grid-cols-[3ch_1fr_5ch_3ch] gap-x-[1ch] py-[2px]">
            <span>{it.ln}</span>
            <span className="break-words">
              {it.nomenclature}
              <span className="block">· {cadenceLabel(it.cadence)}</span>
            </span>
            <span className="text-right">{String(it.qty).padStart(3, '0')}</span>
            <span>{it.ui}</span>
          </div>
        ))}
        <div className="border-t-2 border-acc pt-4 mt-4 flex flex-wrap justify-between gap-x-[2ch]">
          <span>LINES {lines.length} · EVERY ISSUE {everyIssue} · ROTATING {lines.length - everyIssue}</span>
          <span>COGS WITHHELD</span>
        </div>
      </Section>

      <Section code="SEC 4" title="ENLISTMENT">
        {isPublic ? (
          <div className="flex flex-col gap-y-8">
            <span>PREREQUISITE: LOT USERSHIP (AI PLAN).</span>
            <span>
              ENTER THE SYSTEM, THEN UPGRADE FROM THE BASICS TAB.{' '}
              <a href="/login" className="underline">
                LOG IN
              </a>
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-y-8">
            <div className="grid grid-cols-[14ch_1fr] phone:grid-cols-[16ch_1fr]">
              <span>CURRENT</span>
              <span>{strength}</span>
              <span>NEXT ISSUE</span>
              <span>—</span>
            </div>
            <Rule />
            <button
              type="button"
              disabled
              className="self-start border-2 border-acc rounded-none px-8 opacity-40 cursor-not-allowed uppercase"
              style={MONO}
            >
              UPGRADE · NOT YET ISSUED
            </button>
          </div>
        )}
      </Section>

      <StatusLine
        cells={[
          `RATE USD ${BASIC_MODULE.priceUsdMonthly}/MO`,
          `LOAD ${lines.length}`,
          'LEDGER: PUBLIC',
          'READ-ONLY',
        ]}
      />
    </div>
  )
}
