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
  BASIC_MANIFEST,
  BASIC_PRICE_USD,
  BASIC_ITEM_COUNT,
  DOCTRINE,
  cadenceLabel,
  itemsDueInIssue,
} from '#shared/basics/manifest'

// OPEN TAB — public, read-only ledger of the LOT-FM-001 BASIC ration.
// Inversion-only hierarchy: black-on-white rows, white-on-black headers.
// Month 1 build: no state, no network, no billing. The ledger is the marketing.

const Rule = () => <div className="border-t-2 border-acc" />

const Header: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-acc text-bac px-8 uppercase">{children}</div>
)

const Cols: React.FC<{ cells: string[]; className?: string }> = ({
  cells,
  className,
}) => (
  <div
    className={cn(
      'grid grid-cols-[3.5rem_1fr_3rem_9rem] phone:grid-cols-[3rem_1fr_2rem_6.5rem] px-8 gap-x-8 uppercase',
      className
    )}
  >
    {cells.map((c, i) => (
      <span key={i} className={cn(i === 2 && 'text-right')}>
        {c}
      </span>
    ))}
  </div>
)

export const Basics = React.memo(function BasicsInner() {
  const [issue, setIssue] = React.useState(1)
  const due = React.useMemo(
    () => new Set(itemsDueInIssue(issue).map((i) => i.id)),
    [issue]
  )

  return (
    <div className="max-w-[60ch] uppercase" data-lot-tab="basics">
      <Header>LOT-FM-001 · BASIC RATION · OPEN TAB</Header>
      <div className="px-8 py-8">
        {DOCTRINE.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <Rule />
      <Cols cells={['ID', 'NOMENCLATURE', 'QTY', 'CADENCE']} className="opacity-60" />
      <Rule />
      {BASIC_MANIFEST.map((item) => {
        const inIssue = due.has(item.id)
        return (
          <Cols
            key={item.id}
            cells={[item.id, item.nomenclature, item.qty, cadenceLabel(item.cadence)]}
            className={cn(inIssue ? 'bg-acc text-bac' : '')}
          />
        )
      })}
      <Rule />
      <div className="px-8 py-8 flex flex-wrap items-center gap-8">
        <span>ISSUE</span>
        <button
          type="button"
          className="px-8 border-2 border-acc"
          disabled={issue <= 1}
          onClick={() => setIssue((n) => Math.max(1, n - 1))}
        >
          −
        </button>
        <span>{String(issue).padStart(2, '0')}</span>
        <button
          type="button"
          className="px-8 border-2 border-acc"
          disabled={issue >= 12}
          onClick={() => setIssue((n) => Math.min(12, n + 1))}
        >
          +
        </button>
        <span>
          {due.size}/{BASIC_ITEM_COUNT} ITEMS DUE
        </span>
      </div>
      <Rule />
      <div className="px-8 py-8">
        <p>
          TERMS: USD {BASIC_PRICE_USD}/MO · ADDITIVE TO USERSHIP · STAND DOWN
          ANY TIME
        </p>
        <p>COGS WITHHELD. MANIFEST IS THE PRICE LIST.</p>
      </div>
      <Header>
        STATUS: OPEN TAB LIVE · {BASIC_ITEM_COUNT} ITEMS · ENROLLMENT: NOT YET
        OPEN
      </Header>
    </div>
  )
})
