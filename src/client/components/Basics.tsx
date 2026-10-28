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
  type RationItem,
  type RationCategory,
} from './basics/doctrine'
import { BasicsOperator } from './basics/BasicsOperator'

// House style: bold mono, ink on ground, inversion-only hierarchy, 2px rules, square corners.
const MONO = 'font-mono font-bold uppercase'
const COLS = { gridTemplateColumns: '28px 1fr auto 96px' }
const CATEGORIES: RationCategory[] = ['NUTRITION', 'HEALTH', 'HYGIENE', 'EQUIPMENT']

const Rule = () => <div className="border-t-2 border-acc w-full" />

const Band: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={cn(MONO, 'bg-acc text-bac text-[12px] px-8 py-4 tracking-wider')}>{children}</div>
)

const LedgerRow: React.FC<{ item: RationItem }> = ({ item }) => (
  <div className={cn(MONO, 'grid gap-x-8 text-[12px] phone:text-[13px] py-[4px] border-b-2 border-acc')} style={COLS}>
    <span className="tabular-nums">{item.line}</span>
    <span>{item.nomenclature}</span>
    <span className="text-right whitespace-nowrap">{item.spec}</span>
    <span className="text-right">{item.cadence}</span>
  </div>
)

const StatusLine: React.FC<{ plan: string; ration: string }> = ({ plan, ration }) => (
  <div className={cn(MONO, 'text-[13px] grid gap-y-4')}>
    <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}><span>PLAN</span><span>{plan}</span></div>
    <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}><span>RATION</span><span>{ration}</span></div>
  </div>
)

export const Basics: React.FC = () => {
  const me = useStore(stores.me)
  const isMirrorOn = useStore(stores.isMirrorOn)

  const tags = me?.tags ?? []
  const has = (t: string) => tags.some((x) => x.toLowerCase() === t.toLowerCase())
  const isOnStrength = has(UserTag.Basic)
  const isUsership = has(UserTag.Usership)

  const plan = isOnStrength ? 'BASIC / ON STRENGTH' : isUsership ? 'USERSHIP / AI' : me ? 'NONE' : 'UNREGISTERED'
  const ration = isOnStrength ? 'ISSUED MONTHLY' : 'NOT ON STRENGTH'

  return (
    <div
      className={cn(
        'min-h-[100dvh] flex flex-col gap-y-16',
        'px-16 phone:px-32 tablet:px-48 desktop:px-64',
        'pt-24 phone:pt-32 pb-[120px]',
        isMirrorOn && 'text-white'
      )}
    >
      <div className="flex items-baseline justify-between">
        <h1 className={cn(MONO, 'text-[14px] tracking-[0.15em]')}>BASICS</h1>
        <span className={cn(MONO, 'text-[12px] tracking-widest')}>{MANUAL_REF}</span>
      </div>
      <Rule />

      <div className="flex flex-col gap-y-4">
        {DOCTRINE_LINES.map((line) => (
          <p key={line} className={cn(MONO, 'text-[12px] phone:text-[13px] leading-snug')}>{line}</p>
        ))}
        <p className={cn(MONO, 'text-[15px] mt-8 tracking-wide')}>{PRICE_LINE}</p>
      </div>

      <Rule />
      <Band>SECTION 1 — RATION MANIFEST ({RATION_COUNT} ITEMS)</Band>
      <div className={cn(MONO, 'grid gap-x-8 text-[11px] pb-4 border-b-2 border-acc')} style={COLS}>
        <span>NO.</span><span>NOMENCLATURE</span><span className="text-right">SPEC</span><span className="text-right">CADENCE</span>
      </div>
      {CATEGORIES.map((cat) => {
        const items = RATION_MANIFEST.filter((i) => i.category === cat)
        return (
          <div key={cat}>
            <div className={cn(MONO, 'text-[11px] py-4')}>{cat} ({items.length})</div>
            {items.map((item) => <LedgerRow key={item.line} item={item} />)}
          </div>
        )
      })}

      <Rule />
      <Band>SECTION 2 — STATUS</Band>
      <StatusLine plan={plan} ration={ration} />

      <Rule />
      <Band>SECTION 3 — UPGRADE / ROSTER</Band>
      {me ? (
        <BasicsOperator hasUsership={isUsership} />
      ) : (
        <div className={cn(MONO, 'text-[13px]')}>SIGN IN TO ENLIST. BASIC REQUIRES USERSHIP / AI.</div>
      )}
    </div>
  )
}
