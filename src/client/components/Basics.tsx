/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * BASICS — LOT-FM-001 OPEN TAB (MONTH 1 · READ-ONLY)
 *
 * The physical arm of the LOT System. Renders the 23-line ration manifest
 * as a ledger, the doctrine, the price line and a 3270-register status line.
 *
 * House style: monospace bold, theme ink on theme ground (acc on bac),
 * hierarchy by inversion only, 2px rules, square corners, fixed character
 * grid. No color, no radius, no icons.
 *
 * Data comes straight from #shared/basics/manifest — the same module the
 * public API serves. No layer between the public and the manifest.
 */

import * as React from 'react'
import {
  BASIC_PLAN,
  RATION_MANIFEST,
  RATION_CLASS_LABEL,
  CADENCE_LABEL,
  RationClass,
} from '#shared/basics/manifest'
import { cn } from '#client/utils'

const MONO: React.CSSProperties = {
  fontFamily: "'Liberation Mono', 'LiberationMono-Bold', 'Courier New', Courier, monospace",
  fontWeight: 700,
  letterSpacing: 0,
  fontVariantLigatures: 'none',
}

const RULE = 'border-acc border-solid'

/** Inverted bar: the only hierarchy device. */
const Bar: React.FC<{ left: string; right?: string }> = ({ left, right }) => (
  <div className="flex justify-between gap-16 bg-acc text-bac px-8 whitespace-pre">
    <span>{left}</span>
    {right && <span>{right}</span>}
  </div>
)

const CLASSES: RationClass[] = ['I', 'II', 'III', 'IV', 'V']

export type BasicsState = 'USERSHIP/AI' | 'PENDING' | 'ON STRENGTH' | 'STEADY STATE' | 'GUEST'

export const StatusLine: React.FC<{ state: BasicsState; nextIssue?: string }> = ({
  state,
  nextIssue = '----',
}) => (
  <div
    className={cn('flex flex-wrap gap-x-16 border-t-2 px-8 whitespace-pre', RULE)}
    role="status"
  >
    <span>{BASIC_PLAN.code}</span>
    <span>STATE {state}</span>
    <span>NEXT ISSUE {nextIssue}</span>
    <span className="ml-auto">LINES {String(RATION_MANIFEST.length).padStart(2, '0')}</span>
  </div>
)

export const Basics: React.FC<{ state?: BasicsState }> = ({ state = 'USERSHIP/AI' }) => {
  return (
    <div style={MONO} className="flex flex-col gap-y-24 max-w-[720px] uppercase">
      {/* HEADER */}
      <section className={cn('border-2', RULE)}>
        <Bar left="LOT-FM-001" right="OPEN TAB" />
        <div className="px-8 py-8 flex flex-col">
          <span>{BASIC_PLAN.designation}</span>
          <span>
            {`USD ${BASIC_PLAN.priceUsdMonthly} / MONTH · ISSUED MONTHLY · ${RATION_MANIFEST.length} LINES`}
          </span>
        </div>
      </section>

      {/* DOCTRINE */}
      <section className={cn('border-2', RULE)}>
        <Bar left="SECTION 1" right="DOCTRINE" />
        <ol className="px-8 py-8 flex flex-col">
          {BASIC_PLAN.doctrine.map((d, i) => (
            <li key={i} className="flex gap-x-8">
              <span className="shrink-0">{`1.${i + 1}`}</span>
              <span>{d}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* MANIFEST LEDGER */}
      <section className={cn('border-2', RULE)}>
        <Bar left="SECTION 2" right="RATION LOAD" />
        <div
          className={cn('grid px-8 border-b-2 whitespace-pre', RULE)}
          style={{ gridTemplateColumns: '3ch 1fr 7ch 11ch' }}
        >
          <span>LN</span>
          <span>NOMENCLATURE</span>
          <span>QTY</span>
          <span className="text-right">CADENCE</span>
        </div>
        {CLASSES.map((cls, ci) => (
          <div key={cls}>
            <div className={cn('px-8 border-b-2 whitespace-pre', ci > 0 && 'border-t-2', RULE)}>
              {`CLASS ${cls.padEnd(3)} ${RATION_CLASS_LABEL[cls]}`}
            </div>
            {RATION_MANIFEST.filter((it) => it.cls === cls).map((it) => (
              <div
                key={it.code}
                className="grid px-8 gap-x-0 hover:bg-acc hover:text-bac"
                style={{ gridTemplateColumns: '3ch 1fr 7ch 11ch' }}
                title={it.code}
              >
                <span>{it.line}</span>
                <span className="pr-8">{it.nomenclature}</span>
                <span className="whitespace-pre">{it.qty}</span>
                <span className="text-right whitespace-pre">{CADENCE_LABEL[it.cadence]}</span>
              </div>
            ))}
          </div>
        ))}
        <div className={cn('px-8 border-t-2 whitespace-pre', RULE)}>
          {`TOTAL ${RATION_MANIFEST.length} LINES · COGS WITHHELD`}
        </div>
      </section>

      {/* TERMS */}
      <section className={cn('border-2', RULE)}>
        <Bar left="SECTION 3" right="TERMS OF ISSUE" />
        <ol className="px-8 py-8 flex flex-col">
          {BASIC_PLAN.terms.map((t, i) => (
            <li key={i} className="flex gap-x-8">
              <span className="shrink-0">{`3.${i + 1}`}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
        <StatusLine state={state} />
      </section>
    </div>
  )
}
