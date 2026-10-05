/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * LOT-FM-001 / BASIC RATION MODULE — the Basics tab.
 * House style: mono, ground/ink only, inversion-only hierarchy, 2px rules,
 * square corners, no icons. The ledger is the marketing.
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { cn } from '#client/utils'
import { UserTag } from '#shared/types'
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
import { STATE_LABEL, baselineState } from '#shared/basics/engine'
import { useBasic } from './basics/useBasic'
import { Enroll } from './basics/Enroll'

const CATEGORIES: RationCategory[] = ['HYGIENE', 'GROOMING', 'GARMENT', 'SUSTENANCE', 'RECORD']
const COLS = '28px 1fr auto 96px'

// Inversion bar: the only hierarchy device.
const Bar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-acc text-bac font-mono text-[12px] uppercase px-8 py-4">{children}</div>
)

export const Basics: React.FC = () => {
  const me = useStore(stores.me)
  const isMirrorOn = useStore(stores.isMirrorOn)
  const hasUsership = !!me?.tags?.some(
    (t) => t.toLowerCase() === UserTag.Usership.toLowerCase()
  )
  const { basic, card, busy, errors, act } = useBasic(!!me)
  // Until the server record loads, fall back to the tag-derived baseline.
  const state = basic?.state ?? baselineState(hasUsership)

  return (
    <div
      className={cn(
        'flex flex-col font-mono text-[12px] phone:text-[13px] text-acc gap-y-16',
        isMirrorOn && 'text-white'
      )}
    >
      <div>
        <div className="flex justify-between items-baseline pb-4 border-b-2 border-acc">
          <span className="uppercase font-bold">BASICS</span>
          <span>{MANUAL_REF}</span>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        {DOCTRINE_LINES.map((l) => (
          <p key={l}>{l}</p>
        ))}
        <p className="font-bold">{PRICE_LINE}</p>
      </div>

      <div>
        <Bar>STATUS</Bar>
        <div className="grid gap-x-16 pt-4" style={{ gridTemplateColumns: '120px 1fr' }}>
          <span>PLAN</span>
          <span className="uppercase">
            {state === 'ON_STRENGTH' || state === 'STEADY_STATE'
              ? `USERSHIP / AI + BASIC`
              : STATE_LABEL[state]}
          </span>
          <span>RATION</span>
          <span className="uppercase">
            {state === 'STEADY_STATE'
              ? 'STEADY STATE'
              : state === 'ON_STRENGTH'
              ? 'ON STRENGTH — FIRST ISSUE PENDING'
              : state === 'PENDING'
              ? 'PENDING — ROSTER INTAKE REQUIRED'
              : 'NOT ON STRENGTH'}
          </span>
        </div>
      </div>

      {basic?.nextIssue && (
        <div>
          <Bar>NEXT ISSUE {String(basic.issuesDispatched + 1).padStart(2, '0')} — {basic.nextIssue}</Bar>
          <pre className="pt-8 overflow-x-auto leading-[1.5rem]">{card}</pre>
          {basic.dispatches.length > 0 && (
            <div className="pt-8">
              <div className="uppercase font-bold">ISSUE LOG ({basic.dispatches.length})</div>
              {basic.dispatches.map((d) => (
                <div key={d.issue} className="grid gap-x-8 py-4 border-b border-acc" style={{ gridTemplateColumns: '48px 96px 1fr' }}>
                  <span className="tabular-nums">{String(d.issue).padStart(2, '0')}</span>
                  <span>{d.ts.slice(0, 10)}</span>
                  <span className="text-right">{d.tracking}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {me && basic && (
        <div>
          <Bar>UPGRADE / ROSTER</Bar>
          <div className="pt-8">
            <Enroll basic={basic} busy={busy} errors={errors} act={act} />
          </div>
        </div>
      )}

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

      <div>
        <Bar>ISSUE SCHEDULE — {SCHEDULE_HORIZON} MO</Bar>
        {Array.from({ length: SCHEDULE_HORIZON }, (_, k) => k + 1).map((n) => (
          <div key={n} className="grid gap-x-8 py-4 border-b border-acc" style={{ gridTemplateColumns: '48px 1fr' }}>
            <span className="tabular-nums">{String(n).padStart(2, '0')}</span>
            <span>{issueLoad(n).length} / {RATION_COUNT} LINES</span>
          </div>
        ))}
      </div>
    </div>
  )
}
