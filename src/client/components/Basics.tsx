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
import { UserTag } from '#shared/types'
import {
  RATION_MANIFEST,
  DOCTRINE_LINES,
  PRICE_LINE,
  MANUAL_REF,
  RATION_COUNT,
  type RationCategory,
} from './basics/doctrine'

// LOT-FM-001 house style: mono, ink on ground, hierarchy by inversion only,
// 2px rules, square corners, fixed character grid. No tints, no radius, no icons.

const CATEGORIES: RationCategory[] = ['NUTRITION', 'HEALTH', 'HYGIENE', 'EQUIPMENT']

const Rule: React.FC = () => <div className="border-t-2 border-acc w-full" />

// Inverted band — the only emphasis device.
const Band: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-acc text-bac px-8 py-4 uppercase tracking-widest">{children}</div>
)

const Field: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div className="grid grid-cols-[96px_1fr] gap-x-16">
    <span className="uppercase">{k}</span>
    <span className="uppercase">{v}</span>
  </div>
)

export const Basics: React.FC = () => {
  const me = useStore(stores.me)

  const isOnStrength = me?.tags?.includes(UserTag.Basic) ?? false
  const isUsership = me?.tags?.includes(UserTag.Usership) ?? false

  const plan = isOnStrength ? 'BASIC / ON STRENGTH' : isUsership ? 'USERSHIP / AI' : 'NONE'
  const ration = isOnStrength ? 'ON STRENGTH' : 'NOT ON STRENGTH'

  return (
    <div
      className={cn(
        'font-mono text-[13px] leading-[1.5rem] flex flex-col gap-y-16',
        'px-16 phone:px-32 tablet:px-48 desktop:px-64 pt-24 phone:pt-32 pb-[120px]'
      )}
    >
      <header className="flex flex-col gap-y-8">
        <div className="flex justify-between font-bold uppercase tracking-widest">
          <span>BASIC</span>
          <span>{MANUAL_REF}</span>
        </div>
        <Rule />
      </header>

      <section className="flex flex-col gap-y-4">
        {DOCTRINE_LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p className="font-bold mt-8">{PRICE_LINE}</p>
      </section>

      <section aria-label="Ration manifest">
        <Band>SEC 1 — RATION MANIFEST — {RATION_COUNT} ITEMS</Band>
        {CATEGORIES.map((cat) => {
          const items = RATION_MANIFEST.filter((i) => i.category === cat)
          return (
            <div key={cat} className="mt-12">
              <div className="font-bold uppercase tracking-widest border-b-2 border-acc">
                {cat} ({items.length})
              </div>
              {items.map((item) => (
                <div
                  key={item.line}
                  className="grid grid-cols-[28px_1fr_auto_88px] gap-x-8 border-b border-acc"
                >
                  <span className="tabular-nums">{item.line}</span>
                  <span className="uppercase">{item.nomenclature}</span>
                  <span className="uppercase text-right whitespace-nowrap">{item.spec}</span>
                  <span className="uppercase text-right">{item.cadence}</span>
                </div>
              ))}
            </div>
          )
        })}
      </section>

      <section aria-label="Status" className="flex flex-col gap-y-4">
        <Band>SEC 2 — STATUS</Band>
        <Field k="PLAN" v={plan} />
        <Field k="RATION" v={ration} />
        <Field k="NEXT ISSUE" v={isOnStrength ? 'PENDING' : '—'} />
      </section>

      {!isOnStrength && (
        <section aria-label="Upgrade" className="flex flex-col gap-y-4 border-2 border-acc p-12">
          <div className="font-bold uppercase tracking-widest">UPGRADE — USERSHIP → BASIC</div>
          <p>
            {isUsership
              ? 'USERSHIP / AI confirmed. BASIC issues as an additive layer: +USD 100.00 / MO.'
              : 'Requires USERSHIP / AI as base layer.'}
          </p>
          <p className="uppercase">ENROLLMENT: CLOSED — OPENS MONTH 2</p>
        </section>
      )}
    </div>
  )
}
