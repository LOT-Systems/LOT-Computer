/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { cn } from '#client/utils'
import {
  RATION_ITEMS,
  RATION_PRICE_USD,
  RATION_PERIOD,
  RATION_DOCTRINE,
  itemsForMonth,
  type RationCadence,
} from '#shared/constants/basic'

// BASICS / OPEN TAB. Read-only ledger of the BASIC (RATION) issue.
// Inversion-only hierarchy: bg-acc text-bac is the single emphasis device.

const pad = (n: number, w = 2) => String(n).padStart(w, '0')

const Rule = () => <div className="border-t-2 border-acc" />

const StatusLine = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-acc text-bac px-8 py-4 uppercase tracking-wide">
    {children}
  </div>
)

const CADENCE_ORDER: RationCadence[] = [
  'MONTHLY',
  'QUARTERLY',
  'SEMI-ANNUAL',
  'ANNUAL',
]

export const Basics = React.memo(function BasicsInner() {
  const monthOneCount = itemsForMonth(1).length
  const monthTwoCount = itemsForMonth(2).length

  return (
    <div className="font-mono font-bold uppercase max-w-[72ch] mx-auto">
      <StatusLine>
        LOT-FM-001 / BASIC (RATION) / OPEN TAB / READ-ONLY
      </StatusLine>

      <div className="mt-16 mb-16">
        {RATION_DOCTRINE.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>

      <Rule />
      <div className="flex justify-between py-8">
        <span>PRICE</span>
        <span>
          USD {RATION_PRICE_USD}/{RATION_PERIOD}
        </span>
      </div>
      <div className="flex justify-between pb-8">
        <span>LOAD</span>
        <span>{pad(RATION_ITEMS.length)} ITEMS</span>
      </div>
      <div className="flex justify-between pb-8">
        <span>ISSUE 01 / ISSUE 02</span>
        <span>
          {pad(monthOneCount)} / {pad(monthTwoCount)} ITEMS
        </span>
      </div>
      <Rule />

      <div className="mt-16 mb-8">LEDGER</div>
      {CADENCE_ORDER.map((cadence) => {
        const rows = RATION_ITEMS.filter((it) => it.cadence === cadence)
        return (
          <div key={cadence} className="mb-16">
            <div className="bg-acc text-bac px-8">{cadence}</div>
            {rows.map((it) => (
              <div
                key={it.no}
                className={cn(
                  'flex justify-between px-8 py-2 border-b-2 border-acc/20'
                )}
              >
                <span>
                  {pad(it.no)} {it.nomenclature}
                </span>
                <span className="opacity-60">{it.cadence}</span>
              </div>
            ))}
          </div>
        )
      })}

      <Rule />
      <div className="py-8">
        COGS WITHHELD. UPGRADE: MONTH 2. FIRST ISSUE: MONTH 3.
      </div>
      <StatusLine>STATUS: LEDGER LIVE / UPGRADE NOT YET ISSUED</StatusLine>
    </div>
  )
})
