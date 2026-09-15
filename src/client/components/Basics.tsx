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
import { UserTag, RationEnrollment } from '#shared/types'
import { displayRosterState, emptyRationEnrollment } from '#shared/utils'
import { useEnrollRation, useStandDownRation } from '#client/queries'
import {
  RATION_MANIFEST,
  DOCTRINE_LINES,
  PRICE_LINE,
  MANUAL_REF,
  RATION_COUNT,
  type RationItem,
  type RationCadence,
} from './basics/doctrine'

// ─── terminal grid constants ──────────────────────────────────────────────────
const RULE = '─'
const HEAVY = '━'
const ruleOf = (n: number) => Array(n).fill(RULE).join('')
const heavyOf = (n: number) => Array(n).fill(HEAVY).join('')

// ─── sub-components ───────────────────────────────────────────────────────────

const HeavyRule: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('text-acc tracking-[0] leading-none select-none overflow-hidden', className)}>
    <div className="border-t-2 border-acc w-full" />
  </div>
)

const ThinRule: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('border-t border-acc/30 w-full', className)} />
)

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="font-mono text-[11px] tracking-widest uppercase text-acc/50 py-8">
    {children}
  </div>
)

const cadenceBadge = (cadence: RationCadence) => {
  const cls = cadence === 'MONTHLY'
    ? 'text-acc'
    : cadence === 'QUARTERLY'
    ? 'text-acc/60'
    : 'text-acc/40'
  return <span className={cn('font-mono text-[11px]', cls)}>{cadence}</span>
}

const LedgerRow: React.FC<{ item: RationItem; isLast: boolean }> = ({ item, isLast }) => (
  <div
    className={cn(
      'grid font-mono text-[12px] phone:text-[13px] py-[5px] gap-x-8',
      'grid-cols-[28px_1fr_auto_auto]',
      !isLast && 'border-b border-acc/10'
    )}
    style={{ gridTemplateColumns: '28px 1fr auto auto' }}
  >
    <span className="text-acc/40 tabular-nums">{item.line}</span>
    <span className="text-acc uppercase tracking-wide leading-snug">{item.nomenclature}</span>
    <span className="text-acc/50 text-right whitespace-nowrap">{item.spec}</span>
    <span className="text-right w-[80px] phone:w-[90px]">{cadenceBadge(item.cadence)}</span>
  </div>
)

const StatusLine: React.FC<{ plan: string; rationsStatus: string; nextIssue: string | null }> = ({
  plan,
  rationsStatus,
  nextIssue,
}) => (
  <div className="font-mono text-[12px] phone:text-[13px] flex flex-col gap-y-4">
    <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}>
      <span className="text-acc/50 uppercase tracking-wider">PLAN</span>
      <span className="text-acc uppercase">{plan}</span>
    </div>
    <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}>
      <span className="text-acc/50 uppercase tracking-wider">RATION</span>
      <span className="text-acc/60 uppercase">{rationsStatus}</span>
    </div>
    {nextIssue && (
      <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}>
        <span className="text-acc/50 uppercase tracking-wider">NEXT ISSUE</span>
        <span className="text-acc/60 uppercase">{nextIssue}</span>
      </div>
    )}
  </div>
)

const IssueLog: React.FC<{ enrollment: RationEnrollment }> = ({ enrollment }) => (
  <div className="mb-16">
    <SectionLabel>SECTION 3 — ISSUE LOG</SectionLabel>
    {enrollment.issueLog.length === 0 ? (
      <div className="font-mono text-[12px] text-acc/40 uppercase">NO ISSUES RECORDED</div>
    ) : (
      <div className="flex flex-col gap-y-4">
        {enrollment.issueLog.map((entry) => (
          <div
            key={entry.id}
            className="grid font-mono text-[12px] phone:text-[13px] gap-x-16"
            style={{ gridTemplateColumns: '120px 1fr auto' }}
          >
            <span className="text-acc/50 uppercase tracking-wider">{entry.scheduledFor}</span>
            <span className="text-acc/40 uppercase">
              {entry.status === 'DISPATCHED' ? 'DISPATCHED' : 'SCHEDULED — FULFILLMENT PENDING M3 BUILD'}
            </span>
            <span className="text-acc/60 text-right">{entry.status}</span>
          </div>
        ))}
      </div>
    )}
  </div>
)

const RosterControl: React.FC<{
  isUsership: boolean
  isOnStrength: boolean
  hasShippingAddress: boolean
}> = ({ isUsership, isOnStrength, hasShippingAddress }) => {
  const [sizing, setSizing] = React.useState('')
  const [confirmingStandDown, setConfirmingStandDown] = React.useState(false)

  const { mutate: enroll, isLoading: enrolling } = useEnrollRation({
    onSuccess: (data) => {
      const currentMe = stores.me.get()
      if (currentMe) {
        stores.me.set({ ...currentMe, tags: data.tags, metadata: data.metadata } as any)
      }
    },
  })

  const { mutate: standDown, isLoading: standingDown } = useStandDownRation({
    onSuccess: (data) => {
      const currentMe = stores.me.get()
      if (currentMe) {
        stores.me.set({ ...currentMe, tags: data.tags, metadata: data.metadata } as any)
      }
      setConfirmingStandDown(false)
    },
  })

  if (isOnStrength) {
    return (
      <div className="border-2 border-acc/20 p-16 font-mono text-[12px] flex flex-col gap-y-8">
        <div className="text-acc/50 uppercase tracking-widest text-[10px]">ROSTER CONTROL</div>
        {!confirmingStandDown ? (
          <button
            type="button"
            onClick={() => setConfirmingStandDown(true)}
            className="text-acc uppercase tracking-wider underline underline-offset-4 text-left w-fit"
          >
            STAND DOWN
          </button>
        ) : (
          <div className="flex flex-col gap-y-8">
            <div className="text-acc/60 leading-snug">
              STAND DOWN drops the ration. USERSHIP / AI plan is retained.
            </div>
            <div className="flex gap-x-16">
              <button
                type="button"
                disabled={standingDown}
                onClick={() => standDown()}
                className="text-acc uppercase tracking-wider underline underline-offset-4"
              >
                {standingDown ? 'PROCESSING…' : 'CONFIRM STAND DOWN'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingStandDown(false)}
                className="text-acc/40 uppercase tracking-wider"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="border-2 border-acc/20 p-16 font-mono text-[12px] flex flex-col gap-y-8">
      <div className="text-acc/50 uppercase tracking-widest text-[10px]">
        UPGRADE PATH — USERSHIP → BASIC
      </div>
      {!isUsership ? (
        <div className="text-acc leading-snug">Requires USERSHIP / AI plan as base layer.</div>
      ) : !hasShippingAddress ? (
        <div className="text-acc leading-snug">
          COMPLETE SHIPPING ADDRESS IN SETTINGS FIRST — required before enrollment.
        </div>
      ) : (
        <div className="flex flex-col gap-y-8">
          <div className="text-acc leading-snug">
            USERSHIP AI confirmed. BASIC ration available as additive layer (+USD 100.00/MO).
          </div>
          <label className="flex flex-col gap-y-4">
            <span className="text-acc/40 uppercase tracking-widest text-[10px]">SIZING (OPTIONAL)</span>
            <input
              value={sizing}
              onChange={(e) => setSizing(e.target.value)}
              className="bg-transparent border border-acc/30 px-8 py-6 text-acc font-mono text-[12px] outline-none focus:border-acc"
              placeholder="N/A"
            />
          </label>
          <button
            type="button"
            disabled={enrolling}
            onClick={() => enroll({ sizing })}
            className="text-acc uppercase tracking-wider underline underline-offset-4 text-left w-fit"
          >
            {enrolling ? 'PROCESSING…' : 'ENLIST — GO ON STRENGTH'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export const Basics: React.FC = () => {
  const me = useStore(stores.me)
  const isMirrorOn = useStore(stores.isMirrorOn)

  const isOnStrength = me?.tags?.some((t) => t.toLowerCase() === 'basic') ?? false
  const isUsership = me?.tags?.some((t) => t.toLowerCase() === UserTag.Usership.toLowerCase()) ?? false
  const hasShippingAddress = !!(me?.address && me?.city && me?.country)

  const enrollment: RationEnrollment =
    (me as any)?.metadata?.basics || emptyRationEnrollment()
  const rosterState = displayRosterState(enrollment)

  const planLabel = isOnStrength
    ? `BASIC / ${rosterState === 'STEADY_STATE' ? 'STEADY STATE' : 'ON STRENGTH'}`
    : isUsership
    ? 'USERSHIP / AI'
    : 'NONE'

  const rationStatus = isOnStrength ? 'ACTIVE' : 'NOT ON STRENGTH'
  const nextIssue =
    isOnStrength && enrollment.cadenceStart ? enrollment.cadenceStart : null

  const monthlyItems = RATION_MANIFEST.filter((i) => i.cadence === 'MONTHLY')
  const quarterlyItems = RATION_MANIFEST.filter((i) => i.cadence === 'QUARTERLY')
  const annualItems = RATION_MANIFEST.filter((i) => i.cadence === 'ANNUALLY')

  return (
    <div
      className={cn(
        'min-h-[100dvh] flex flex-col',
        'px-16 phone:px-32 tablet:px-48 desktop:px-64',
        'pt-24 phone:pt-32 pb-[120px]',
        isMirrorOn && 'text-white'
      )}
    >
      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="font-mono text-[13px] phone:text-[14px] uppercase tracking-[0.15em] text-acc font-bold">
          BASICS
        </h1>
        <span className="font-mono text-[11px] text-acc/40 tracking-widest">
          {MANUAL_REF}
        </span>
      </div>
      <HeavyRule className="mb-16" />

      {/* ── DOCTRINE + PRICE ──────────────────────────────── */}
      <div className="mb-16 flex flex-col gap-y-4">
        {DOCTRINE_LINES.map((line, i) => (
          <p key={i} className="font-mono text-[12px] phone:text-[13px] text-acc leading-snug">
            {line}
          </p>
        ))}
        <p className="font-mono text-[13px] phone:text-[15px] text-acc font-bold mt-8 tracking-wide">
          {PRICE_LINE}
        </p>
      </div>

      <ThinRule className="mb-16" />

      {/* ── MANIFEST LEDGER ───────────────────────────────── */}
      <SectionLabel>SECTION 1 — RATION MANIFEST ({RATION_COUNT} ITEMS)</SectionLabel>

      {/* Ledger column headers */}
      <div
        className="grid font-mono text-[10px] uppercase tracking-widest text-acc/40 pb-6 border-b-2 border-acc/20 mb-4 gap-x-8"
        style={{ gridTemplateColumns: '28px 1fr auto auto' }}
      >
        <span>NO.</span>
        <span>NOMENCLATURE</span>
        <span className="text-right">SPEC</span>
        <span className="text-right w-[80px] phone:w-[90px]">CADENCE</span>
      </div>

      {/* Monthly items */}
      <div className="mb-12">
        <div className="font-mono text-[10px] uppercase tracking-widest text-acc/30 pb-4">
          NUTRITION ({monthlyItems.filter(i => i.category === 'NUTRITION').length})
        </div>
        {RATION_MANIFEST.filter(i => i.category === 'NUTRITION').map((item, idx, arr) => (
          <LedgerRow key={item.line} item={item} isLast={idx === arr.length - 1} />
        ))}
      </div>

      <div className="mb-12">
        <div className="font-mono text-[10px] uppercase tracking-widest text-acc/30 pb-4">
          HEALTH ({RATION_MANIFEST.filter(i => i.category === 'HEALTH').length})
        </div>
        {RATION_MANIFEST.filter(i => i.category === 'HEALTH').map((item, idx, arr) => (
          <LedgerRow key={item.line} item={item} isLast={idx === arr.length - 1} />
        ))}
      </div>

      <div className="mb-12">
        <div className="font-mono text-[10px] uppercase tracking-widest text-acc/30 pb-4">
          HYGIENE ({RATION_MANIFEST.filter(i => i.category === 'HYGIENE').length})
        </div>
        {RATION_MANIFEST.filter(i => i.category === 'HYGIENE').map((item, idx, arr) => (
          <LedgerRow key={item.line} item={item} isLast={idx === arr.length - 1} />
        ))}
      </div>

      <div className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-acc/30 pb-4">
          EQUIPMENT ({RATION_MANIFEST.filter(i => i.category === 'EQUIPMENT').length})
        </div>
        {RATION_MANIFEST.filter(i => i.category === 'EQUIPMENT').map((item, idx, arr) => (
          <LedgerRow key={item.line} item={item} isLast={idx === arr.length - 1} />
        ))}
      </div>

      <ThinRule className="mb-16 mt-8" />

      {/* ── STATUS LINE ───────────────────────────────────── */}
      <SectionLabel>SECTION 2 — STATUS</SectionLabel>
      <div className="mb-16">
        <StatusLine plan={planLabel} rationsStatus={rationStatus} nextIssue={nextIssue} />
      </div>

      {/* ── ISSUE LOG (Month 3 fulfillment writes to this) ─── */}
      {isOnStrength && <IssueLog enrollment={enrollment} />}

      <ThinRule className="mb-16" />

      {/* ── UPGRADE / ROSTER CONTROL ──────────────────────── */}
      <div className="mt-4">
        <RosterControl
          isUsership={isUsership}
          isOnStrength={isOnStrength}
          hasShippingAddress={hasShippingAddress}
        />
      </div>
    </div>
  )
}
