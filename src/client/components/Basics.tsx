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
import { getMe, useEnrollBasics, useStandDownBasics } from '#client/queries'
import { cn } from '#client/utils'
import { UserTag, BasicsEnrollment } from '#shared/types'
import { Button, Select, Textarea } from '#client/components/ui'
import {
  RATION_MANIFEST,
  DOCTRINE_LINES,
  PRICE_LINE,
  MANUAL_REF,
  RATION_COUNT,
  STATE_SEQUENCE,
  BILLING_NOTE,
  SIZING_OPTIONS,
  type RationItem,
  type RationCadence,
} from './basics/doctrine'

// ─── terminal grid constants ──────────────────────────────────────────────────

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

// State the operator's roster is currently in, derived from tags + metadata.
// ON_STRENGTH is tag-derived (source of truth); PENDING/STOOD_DOWN/NONE are
// metadata-derived intent states. See doctrine.ts for why the tag grant is
// CEO-gated rather than self-service.
type DerivedState = 'NONE' | 'USERSHIP' | 'PENDING' | 'ON_STRENGTH'

const StateMachineLine: React.FC<{ state: DerivedState }> = ({ state }) => {
  const activeIndex =
    state === 'ON_STRENGTH' ? 2 : state === 'PENDING' ? 1 : state === 'USERSHIP' ? 0 : -1
  return (
    <div className="font-mono text-[11px] phone:text-[12px] flex flex-wrap items-center gap-x-4 gap-y-4">
      {STATE_SEQUENCE.map((step, i) => (
        <React.Fragment key={step}>
          {i > 0 && <span className="text-acc/30">{'->'}</span>}
          <span
            className={cn(
              'uppercase tracking-wide',
              i === activeIndex ? 'text-acc font-bold' : 'text-acc/30'
            )}
          >
            {i === activeIndex ? `[${step}]` : step}
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}

const RosterIntakeForm: React.FC<{ defaultAddress: string }> = ({ defaultAddress }) => {
  const [sizing, setSizing] = React.useState('')
  const [shippingAddress, setShippingAddress] = React.useState(defaultAddress)
  const [cadenceStart, setCadenceStart] = React.useState<'IMMEDIATE' | 'NEXT_CYCLE'>('NEXT_CYCLE')
  const enroll = useEnrollBasics()

  const canSubmit = !!sizing && !!shippingAddress.trim() && !enroll.isLoading

  const onSubmit = () => {
    if (!canSubmit) return
    enroll.mutate(
      { sizing, shippingAddress: shippingAddress.trim(), cadenceStart },
      { onSuccess: () => { getMe().then((user) => stores.me.set(user)) } }
    )
  }

  return (
    <div className="flex flex-col gap-y-12 font-mono text-[12px]">
      <div>
        <div className="text-acc/50 uppercase tracking-widest text-[10px] mb-4">SIZE</div>
        <Select
          value={sizing}
          onChange={setSizing}
          placeholder="SELECT"
          options={SIZING_OPTIONS.map((s) => ({ label: s, value: s }))}
          className="rounded-none font-mono"
        />
      </div>
      <div>
        <div className="text-acc/50 uppercase tracking-widest text-[10px] mb-4">SHIPPING ADDRESS</div>
        <Textarea
          value={shippingAddress}
          onChange={setShippingAddress}
          rows={3}
          maxLength={500}
          className="rounded-none font-mono w-full"
        />
      </div>
      <div>
        <div className="text-acc/50 uppercase tracking-widest text-[10px] mb-4">CADENCE START</div>
        <div className="flex gap-x-8">
          {(['IMMEDIATE', 'NEXT_CYCLE'] as const).map((c) => (
            <Button
              key={c}
              size="small"
              className={cn(
                'rounded-none font-mono text-[11px] uppercase',
                cadenceStart === c && 'bg-acc text-bac'
              )}
              onClick={() => setCadenceStart(c)}
            >
              {c.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>
      <Button
        kind="primary"
        className="rounded-none font-mono uppercase text-[12px] mt-4 self-start"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        {enroll.isLoading ? 'SUBMITTING...' : 'SUBMIT FOR ISSUE'}
      </Button>
      {enroll.isError && (
        <div className="text-acc/60 text-[11px]">
          {(enroll.error as any)?.response?.data?.error || 'REQUEST FAILED'}
        </div>
      )}
    </div>
  )
}

const StandDownControl: React.FC<{ label: string }> = ({ label }) => {
  const [confirming, setConfirming] = React.useState(false)
  const standDown = useStandDownBasics()

  const onConfirm = () => {
    standDown.mutate(undefined, {
      onSuccess: () => { getMe().then((user) => stores.me.set(user)) },
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-x-8 font-mono text-[11px]">
        <span className="text-acc/60 uppercase">CONFIRM {label}?</span>
        <Button
          size="small"
          className="rounded-none font-mono text-[11px] uppercase"
          disabled={standDown.isLoading}
          onClick={onConfirm}
        >
          {standDown.isLoading ? 'PROCESSING...' : 'CONFIRM'}
        </Button>
        <Button
          size="small"
          className="rounded-none font-mono text-[11px] uppercase"
          onClick={() => setConfirming(false)}
        >
          CANCEL
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="small"
      className="rounded-none font-mono text-[11px] uppercase self-start"
      onClick={() => setConfirming(true)}
    >
      {label}
    </Button>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export const Basics: React.FC = () => {
  const me = useStore(stores.me)
  const isMirrorOn = useStore(stores.isMirrorOn)

  const isOnStrength = me?.tags?.some((t) => t.toLowerCase() === 'basic') ?? false
  const isUsership = me?.tags?.some((t) => t.toLowerCase() === UserTag.Usership.toLowerCase()) ?? false
  const basics: BasicsEnrollment | undefined = (me?.metadata as any)?.basics
  const isPending = !isOnStrength && basics?.status === 'PENDING'

  const derivedState: DerivedState = isOnStrength
    ? 'ON_STRENGTH'
    : isPending
    ? 'PENDING'
    : isUsership
    ? 'USERSHIP'
    : 'NONE'

  const planLabel = isOnStrength
    ? 'BASIC / ON STRENGTH'
    : isPending
    ? 'USERSHIP / AI — PENDING'
    : isUsership
    ? 'USERSHIP / AI'
    : 'NONE'

  const rationStatus = isOnStrength
    ? 'ACTIVE — NEXT ISSUE PENDING FULFILLMENT ENGINE (M3)'
    : isPending
    ? 'PENDING — AWAITING ISSUE CONFIRMATION'
    : 'NOT ON STRENGTH'

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
        <p className="font-mono text-[10px] text-acc/40 tracking-wide">
          {BILLING_NOTE}
        </p>
      </div>

      <ThinRule className="mb-16" />

      {/* ── MANIFEST LEDGER ───────────────────────────────── */}
      <SectionLabel>SECTION 1 — RATION MANIFEST ({RATION_COUNT} ITEMS)</SectionLabel>

      <div
        className="grid font-mono text-[10px] uppercase tracking-widest text-acc/40 pb-6 border-b-2 border-acc/20 mb-4 gap-x-8"
        style={{ gridTemplateColumns: '28px 1fr auto auto' }}
      >
        <span>NO.</span>
        <span>NOMENCLATURE</span>
        <span className="text-right">SPEC</span>
        <span className="text-right w-[80px] phone:w-[90px]">CADENCE</span>
      </div>

      {(['NUTRITION', 'HEALTH', 'HYGIENE', 'EQUIPMENT'] as const).map((category) => {
        const items = RATION_MANIFEST.filter((i) => i.category === category)
        return (
          <div key={category} className="mb-12">
            <div className="font-mono text-[10px] uppercase tracking-widest text-acc/30 pb-4">
              {category} ({items.length})
            </div>
            {items.map((item, idx, arr) => (
              <LedgerRow key={item.line} item={item} isLast={idx === arr.length - 1} />
            ))}
          </div>
        )
      })}

      <ThinRule className="mb-16 mt-8" />

      {/* ── STATUS LINE ───────────────────────────────────── */}
      <SectionLabel>SECTION 2 — STATUS</SectionLabel>
      <div className="mb-16">
        <StatusLine plan={planLabel} rationsStatus={rationStatus} />
      </div>

      <ThinRule className="mb-16" />

      {/* ── ENROLLMENT / STATE MACHINE ────────────────────── */}
      <SectionLabel>SECTION 3 — ENROLLMENT</SectionLabel>
      <div className="mb-16">
        <StateMachineLine state={derivedState} />
      </div>

      <div className="border-2 border-acc/20 p-16 font-mono text-[12px] flex flex-col gap-y-12">
        {derivedState === 'NONE' && (
          <div className="text-acc/60 leading-snug">
            REQUIRES USERSHIP / AI AS BASE LAYER. UPGRADE UNAVAILABLE.
          </div>
        )}

        {derivedState === 'USERSHIP' && (
          <>
            <div className="text-acc leading-snug">
              USERSHIP AI confirmed. BASIC ration available as additive layer
              (+{PRICE_LINE}).
            </div>
            <RosterIntakeForm defaultAddress={me?.address || ''} />
          </>
        )}

        {derivedState === 'PENDING' && basics && (
          <>
            <div className="text-acc leading-snug">
              ENROLLMENT PENDING — AWAITING ISSUE CONFIRMATION.
            </div>
            <div className="flex flex-col gap-y-4 text-acc/60 text-[11px]">
              <div>SIZE: {basics.roster.sizing}</div>
              <div>SHIPPING: {basics.roster.shippingAddress}</div>
              <div>CADENCE START: {basics.roster.cadenceStart.replace('_', ' ')}</div>
              <div>REQUESTED: {new Date(basics.requestedAt).toISOString().slice(0, 10)}</div>
            </div>
            <StandDownControl label="WITHDRAW REQUEST" />
          </>
        )}

        {derivedState === 'ON_STRENGTH' && basics && (
          <>
            <div className="text-acc leading-snug">
              ON STRENGTH since {basics.activatedAt ? new Date(basics.activatedAt).toISOString().slice(0, 10) : 'CONFIRMED'}.
              STAND DOWN drops the ration and retains USERSHIP / AI.
            </div>
            <div className="flex flex-col gap-y-4 text-acc/60 text-[11px]">
              <div>SIZE: {basics.roster.sizing}</div>
              <div>SHIPPING: {basics.roster.shippingAddress}</div>
            </div>
            <div>
              <div className="text-acc/50 uppercase tracking-widest text-[10px] mb-4">ISSUE LOG</div>
              {basics.issueLog && basics.issueLog.length > 0 ? (
                basics.issueLog.map((entry, i) => (
                  <div key={i} className="text-acc/60 text-[11px]">
                    {entry.date} — {entry.note}
                  </div>
                ))
              ) : (
                <div className="text-acc/40 text-[11px]">
                  NO ISSUES RECORDED — FULFILLMENT ENGINE PENDING (M3)
                </div>
              )}
            </div>
            <StandDownControl label="STAND DOWN" />
          </>
        )}
      </div>
    </div>
  )
}
