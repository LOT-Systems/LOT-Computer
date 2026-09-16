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
import { useSubmitRoster, useStandDown } from '#client/queries'
import { UserTag, type RationRoster } from '#shared/types'
import {
  RATION_MANIFEST,
  DOCTRINE_LINES,
  PRICE_LINE,
  MANUAL_REF,
  RATION_COUNT,
  type RationItem,
  type RationCadence,
} from './basics/doctrine'
import { nextCadenceDefault, nextIssueDate } from './basics/cadence'

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

const StatusLine: React.FC<{ plan: string; rationsStatus: string }> = ({ plan, rationsStatus }) => (
  <div className="font-mono text-[12px] phone:text-[13px] flex flex-col gap-y-4">
    <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}>
      <span className="text-acc/50 uppercase tracking-wider">PLAN</span>
      <span className="text-acc uppercase">{plan}</span>
    </div>
    <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}>
      <span className="text-acc/50 uppercase tracking-wider">RATION</span>
      <span className="text-acc/60 uppercase">{rationsStatus}</span>
    </div>
  </div>
)

// ─── main component ───────────────────────────────────────────────────────────

export const Basics: React.FC = () => {
  const me = useStore(stores.me)
  const isMirrorOn = useStore(stores.isMirrorOn)

  const ration: RationRoster | undefined = me?.metadata?.ration
  const issueLog = ration?.issueLog ?? []
  const isOnStrength = me?.tags?.some((t) => t.toLowerCase() === UserTag.Basic.toLowerCase()) ?? false
  const isSteadyState = isOnStrength && issueLog.length > 0
  const isPending = !isOnStrength && ration?.status === 'PENDING'
  const isStoodDown = !isOnStrength && !isPending && ration?.status === 'STAND_DOWN'
  const isUsership = me?.tags?.includes(UserTag.Usership) ?? false

  const [cadenceInput, setCadenceInput] = React.useState('')
  React.useEffect(() => {
    if (!cadenceInput) setCadenceInput(nextCadenceDefault())
  }, [cadenceInput])

  const applyRation = (nextRation: RationRoster) => {
    const currentMe = stores.me.get()
    if (!currentMe) return
    stores.me.set({
      ...currentMe,
      metadata: { ...(currentMe as any).metadata, ration: nextRation },
    })
  }

  const { mutate: submitRoster, isLoading: isSubmitting, error: submitError } = useSubmitRoster({
    onSuccess: (data) => applyRation(data.ration),
  })
  const { mutate: standDown, isLoading: isStandingDown } = useStandDown({
    onSuccess: (data) => {
      applyRation(data.ration)
      // STAND DOWN also drops the Basic tag server-side — mirror it locally
      // so the UI reflects NOT ON STRENGTH without waiting on a refetch.
      const currentMe = stores.me.get()
      if (currentMe) {
        stores.me.set({
          ...currentMe,
          tags: currentMe.tags.filter((t) => t.toLowerCase() !== UserTag.Basic.toLowerCase()),
        })
      }
    },
  })

  const hasShippingAddress = !!(me?.address && me?.city && me?.country)

  const planLabel = isSteadyState
    ? 'BASIC / STEADY STATE'
    : isOnStrength
    ? 'BASIC / ON STRENGTH'
    : isPending
    ? 'USERSHIP / AI — PENDING'
    : isUsership
    ? 'USERSHIP / AI'
    : 'NONE'

  const rationStatus = isSteadyState
    ? `ACTIVE — NEXT ISSUE ${nextIssueDate(ration!.cadenceStart)}`
    : isOnStrength
    ? `ACTIVE — NEXT ISSUE ${ration ? nextIssueDate(ration.cadenceStart) : 'PENDING'}`
    : isPending
    ? 'PENDING — AWAITING QUARTERMASTER CONFIRMATION'
    : isStoodDown
    ? `STOOD DOWN — ${ration?.standDownAt?.slice(0, 10) ?? ''}`
    : 'NOT ON STRENGTH'

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
        <StatusLine plan={planLabel} rationsStatus={rationStatus} />
      </div>

      {/* ── UPGRADE / ROSTER ──────────────────────────────── */}
      <ThinRule className="mb-16 mt-4" />
      <SectionLabel>SECTION 3 — UPGRADE // ROSTER</SectionLabel>

      {!isUsership && (
        <div className="border-2 border-acc/20 p-16 font-mono text-[12px] flex flex-col gap-y-8">
          <div className="text-acc/50 uppercase tracking-widest text-[10px]">
            UPGRADE PATH — USERSHIP → BASIC
          </div>
          <div className="text-acc leading-snug">
            Requires USERSHIP / AI plan as base layer.
          </div>
        </div>
      )}

      {isUsership && (isPending) && (
        <div className="border-2 border-acc/40 p-16 font-mono text-[12px] flex flex-col gap-y-8">
          <div className="text-acc/50 uppercase tracking-widest text-[10px]">
            INTAKE SUBMITTED
          </div>
          <div className="grid gap-x-16" style={{ gridTemplateColumns: '140px 1fr' }}>
            <span className="text-acc/50 uppercase">SUBMITTED</span>
            <span className="text-acc">{ration?.submittedAt?.slice(0, 10)}</span>
          </div>
          <div className="grid gap-x-16" style={{ gridTemplateColumns: '140px 1fr' }}>
            <span className="text-acc/50 uppercase">CADENCE START</span>
            <span className="text-acc">{ration?.cadenceStart}</span>
          </div>
          <div className="text-acc/40 text-[11px]">
            AWAITING QUARTERMASTER CONFIRMATION — enrollment is issued, not self-checkout.
          </div>
          <button
            onClick={() => standDown()}
            disabled={isStandingDown}
            className="mt-4 self-start border-2 border-acc/30 px-12 py-6 text-acc/70 uppercase tracking-widest text-[11px] hover:border-acc/60 disabled:opacity-40"
          >
            {isStandingDown ? 'WITHDRAWING…' : 'WITHDRAW INTAKE'}
          </button>
        </div>
      )}

      {(isOnStrength) && (
        <div className="border-2 border-acc/40 p-16 font-mono text-[12px] flex flex-col gap-y-8">
          <div className="text-acc/50 uppercase tracking-widest text-[10px]">
            {isSteadyState ? 'STEADY STATE' : 'ON STRENGTH'}
          </div>
          {ration?.cadenceStart && (
            <div className="grid gap-x-16" style={{ gridTemplateColumns: '140px 1fr' }}>
              <span className="text-acc/50 uppercase">CADENCE START</span>
              <span className="text-acc">{ration.cadenceStart}</span>
            </div>
          )}
          <div className="mt-8">
            <div className="text-acc/40 uppercase tracking-widest text-[10px] pb-6">
              ISSUE LOG ({issueLog.length})
            </div>
            {issueLog.length === 0 ? (
              <div className="text-acc/40 text-[11px]">
                NO ISSUES LOGGED — fulfillment (M3 build cycle) not yet operational.
              </div>
            ) : (
              issueLog.map((entry, i) => (
                <div key={i} className="grid gap-x-16 text-[11px]" style={{ gridTemplateColumns: '110px 1fr' }}>
                  <span className="text-acc/50 tabular-nums">{entry.date}</span>
                  <span className="text-acc/70">{entry.note}</span>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => standDown()}
            disabled={isStandingDown}
            className="mt-4 self-start border-2 border-acc/30 px-12 py-6 text-acc/70 uppercase tracking-widest text-[11px] hover:border-acc/60 disabled:opacity-40"
          >
            {isStandingDown ? 'STANDING DOWN…' : 'STAND DOWN'}
          </button>
          <div className="text-acc/30 text-[10px]">
            STAND DOWN drops the ration only. USERSHIP / AI is retained.
          </div>
        </div>
      )}

      {isUsership && !isOnStrength && !isPending && (
        <div className="border-2 border-acc/20 p-16 font-mono text-[12px] flex flex-col gap-y-12">
          <div className="text-acc/50 uppercase tracking-widest text-[10px]">
            UPGRADE PATH — USERSHIP → BASIC
          </div>
          <div className="text-acc leading-snug">
            USERSHIP AI confirmed. BASIC ration available as additive layer (+{PRICE_LINE}).
          </div>
          {isStoodDown && (
            <div className="text-acc/40 text-[11px]">
              PREVIOUSLY STOOD DOWN — {ration?.standDownAt?.slice(0, 10)}. Re-intake below.
            </div>
          )}
          {!hasShippingAddress ? (
            <div className="text-acc/60 text-[11px]">
              Shipping address incomplete. Set address, city, and country in SETTINGS before intake.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-x-12">
                <label className="text-acc/50 uppercase tracking-widest text-[10px] w-[140px]">
                  CADENCE START
                </label>
                <input
                  type="date"
                  value={cadenceInput}
                  onChange={(e) => setCadenceInput(e.target.value)}
                  className="bg-transparent border-2 border-acc/30 px-8 py-4 font-mono text-[12px] text-acc"
                />
              </div>
              <button
                onClick={() => submitRoster({ cadenceStart: cadenceInput })}
                disabled={isSubmitting || !cadenceInput}
                className="self-start border-2 border-acc px-12 py-6 text-acc uppercase tracking-widest text-[11px] hover:bg-acc hover:text-bac disabled:opacity-40"
              >
                {isSubmitting ? 'SUBMITTING…' : 'SUBMIT INTAKE'}
              </button>
              {submitError && (
                <div className="text-acc/60 text-[11px]">
                  {(submitError as any)?.response?.data?.error || 'Intake failed. Try again.'}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
