/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT-FM-001 / BASIC RATION MODULE
 * SECTION 3 — UPGRADE / ROSTER / ISSUE LOG (logged-in operators only)
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { AxiosError } from 'axios'
import { cn } from '#client/utils'
import { useBasics, useBasicsEnlist, useBasicsStandDown } from '#client/queries'
import {
  SIZINGS,
  STATE_LABEL,
  RATION_PRICE_CENTS,
  daysUntil,
  usd,
  validateRoster,
  type BasicsView,
  type Roster,
  type RosterErrors,
  type Sizing,
} from '#shared/basics/roster'

// Inversion-only hierarchy: ink on ground, or ground on ink. 2px rules, square corners.
const Cmd: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { solid?: boolean }> = ({
  solid,
  className,
  ...p
}) => (
  <button
    {...p}
    className={cn(
      'font-mono font-bold uppercase tracking-wider text-[13px] px-16 py-8 border-2 border-acc',
      'disabled:opacity-30 disabled:cursor-not-allowed select-none',
      solid ? 'bg-acc text-bac' : 'bg-bac text-acc hover:bg-acc hover:text-bac',
      className
    )}
  />
)

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <label className="grid gap-x-16 items-center font-mono font-bold text-[13px] uppercase" style={{ gridTemplateColumns: '120px 1fr' }}>
    <span>{label}</span>
    <span className="flex items-center gap-x-8">
      {children}
      {error && <span className="bg-acc text-bac px-8">{error}</span>}
    </span>
  </label>
)

const INPUT = 'w-full bg-bac text-acc border-2 border-acc px-8 py-4 font-mono font-bold text-[13px] uppercase rounded-none outline-none focus:bg-acc focus:text-bac'

const BLANK: Roster = {
  sizing: 'M',
  cadenceDay: 1,
  shipping: { name: '', line1: '', line2: '', city: '', region: '', postal: '', country: 'US' },
}

const RosterForm: React.FC<{
  initial: Roster | null
  busy: boolean
  serverErrors?: RosterErrors
  onSubmit: (r: Roster) => void
  onCancel: () => void
}> = ({ initial, busy, serverErrors, onSubmit, onCancel }) => {
  const [r, setR] = React.useState<Roster>(initial ?? BLANK)
  const [touched, setTouched] = React.useState(false)
  const errors: RosterErrors = touched ? validateRoster(r) : serverErrors ?? {}
  const setShip = (k: keyof Roster['shipping']) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setR({ ...r, shipping: { ...r.shipping, [k]: e.target.value } })

  return (
    <form
      className="flex flex-col gap-y-8 border-2 border-acc p-16"
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (Object.keys(validateRoster(r)).length === 0) onSubmit(r)
      }}
    >
      <Field label="NAME" error={errors.name}><input className={INPUT} value={r.shipping.name} onChange={setShip('name')} maxLength={120} /></Field>
      <Field label="ADDRESS 1" error={errors.line1}><input className={INPUT} value={r.shipping.line1} onChange={setShip('line1')} maxLength={120} /></Field>
      <Field label="ADDRESS 2" error={errors.line2}><input className={INPUT} value={r.shipping.line2} onChange={setShip('line2')} maxLength={120} /></Field>
      <Field label="CITY" error={errors.city}><input className={INPUT} value={r.shipping.city} onChange={setShip('city')} maxLength={120} /></Field>
      <Field label="REGION" error={errors.region}><input className={INPUT} value={r.shipping.region} onChange={setShip('region')} maxLength={120} /></Field>
      <Field label="POSTAL" error={errors.postal}><input className={INPUT} value={r.shipping.postal} onChange={setShip('postal')} maxLength={120} /></Field>
      <Field label="COUNTRY" error={errors.country}><input className={INPUT} value={r.shipping.country} onChange={setShip('country')} maxLength={120} /></Field>
      <Field label="SIZING" error={errors.sizing}>
        <span className="flex gap-x-8">
          {SIZINGS.map((s: Sizing) => (
            <Cmd key={s} type="button" solid={r.sizing === s} onClick={() => setR({ ...r, sizing: s })}>{s}</Cmd>
          ))}
        </span>
      </Field>
      <Field label="ISSUE DAY" error={errors.cadenceDay}>
        <input
          className={cn(INPUT, 'w-[80px]')}
          type="number"
          min={1}
          max={28}
          value={r.cadenceDay}
          onChange={(e) => setR({ ...r, cadenceDay: Number(e.target.value) })}
        />
        <span className="whitespace-nowrap">OF MONTH (1–28)</span>
      </Field>
      <div className="font-mono font-bold text-[13px] uppercase mt-8">
        {usd(RATION_PRICE_CENTS)} / MO ADDITIVE TO USERSHIP. STAND DOWN ANY TIME.
      </div>
      <div className="flex gap-x-8">
        <Cmd type="submit" solid disabled={busy}>{busy ? 'TRANSMITTING' : 'ENLIST'}</Cmd>
        <Cmd type="button" onClick={onCancel} disabled={busy}>CANCEL</Cmd>
      </div>
    </form>
  )
}

const stateLine = (v: BasicsView, now: Date): string => {
  switch (v.state) {
    case 'PENDING': return 'AUTHORISATION PENDING — AWAITING BILLING CONFIRMATION'
    case 'ON_STRENGTH':
    case 'STEADY_STATE': {
      if (!v.nextIssue) return 'NEXT ISSUE PENDING'
      const d = daysUntil(v.nextIssue, now)
      return `NEXT ISSUE ${v.nextIssue.slice(0, 10)}  T-${Math.max(d, 0)}D`
    }
    default: return 'NOT ON STRENGTH'
  }
}

export const BasicsOperator: React.FC<{ hasUsership: boolean }> = ({ hasUsership }) => {
  const qc = useQueryClient()
  const { data, isLoading, isError } = useBasics()
  const enlist = useBasicsEnlist()
  const standDown = useBasicsStandDown()
  const [formOpen, setFormOpen] = React.useState(false)
  const [armed, setArmed] = React.useState(false)
  const [msg, setMsg] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState<RosterErrors | undefined>()

  const apply = (v: BasicsView) => {
    qc.setQueryData(['/api/basics'], v)
    qc.invalidateQueries(['/api/me'])
    setFormOpen(false)
    setArmed(false)
    setMsg('')
    setFieldErrors(undefined)
  }
  const fail = (e: AxiosError) => {
    const d = e.response?.data as { error?: string; fields?: RosterErrors } | undefined
    setMsg(d?.error ?? 'TRANSMISSION FAILED')
    setFieldErrors(d?.fields)
  }

  if (isLoading) return <div className="font-mono font-bold text-[13px]">READING ROSTER…</div>
  if (isError || !data) return <div className="font-mono font-bold text-[13px]">ROSTER UNAVAILABLE</div>

  const now = new Date()
  const onRoster = data.state !== 'USERSHIP'

  return (
    <div className="flex flex-col gap-y-16">
      <div className="font-mono font-bold text-[13px] uppercase grid gap-y-4">
        <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}>
          <span>STATE</span><span className="bg-acc text-bac px-8 justify-self-start">{STATE_LABEL[data.state]}</span>
        </div>
        <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}>
          <span>RATION</span><span>{stateLine(data, now)}</span>
        </div>
        {data.roster && onRoster && (
          <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}>
            <span>SHIP TO</span>
            <span>{data.roster.shipping.name}, {data.roster.shipping.city}, {data.roster.shipping.region} {data.roster.shipping.postal} {data.roster.shipping.country} · SIZE {data.roster.sizing} · DAY {data.roster.cadenceDay}</span>
          </div>
        )}
      </div>

      {msg && <div className="bg-acc text-bac font-mono font-bold text-[13px] uppercase px-8 py-4">{msg}</div>}

      {!onRoster && !formOpen && (
        hasUsership ? (
          <div><Cmd solid onClick={() => setFormOpen(true)}>UPGRADE → BASIC</Cmd></div>
        ) : (
          <div className="font-mono font-bold text-[13px] uppercase">REQUIRES USERSHIP / AI AS BASE LAYER.</div>
        )
      )}

      {!onRoster && formOpen && (
        <RosterForm
          initial={data.roster}
          busy={enlist.isLoading}
          serverErrors={fieldErrors}
          onCancel={() => setFormOpen(false)}
          onSubmit={(r) => enlist.mutate(r, { onSuccess: apply, onError: fail })}
        />
      )}

      {onRoster && (
        <div className="flex gap-x-8 items-center">
          {!armed ? (
            <Cmd onClick={() => setArmed(true)}>STAND DOWN</Cmd>
          ) : (
            <>
              <Cmd solid disabled={standDown.isLoading} onClick={() => standDown.mutate(undefined, { onSuccess: apply, onError: fail })}>
                CONFIRM STAND DOWN
              </Cmd>
              <Cmd onClick={() => setArmed(false)}>ABORT</Cmd>
              <span className="font-mono font-bold text-[13px] uppercase">DROPS RATION. RETAINS AI.</span>
            </>
          )}
        </div>
      )}

      <div>
        <div className="font-mono font-bold text-[13px] uppercase bg-acc text-bac px-8 py-4">ISSUE LOG</div>
        {data.log.length === 0 ? (
          <div className="font-mono font-bold text-[13px] uppercase py-8">NO ENTRIES.</div>
        ) : (
          [...data.log].reverse().map((e) => (
            <div
              key={e.seq}
              className="grid gap-x-8 font-mono font-bold text-[12px] uppercase py-[4px] border-b-2 border-acc"
              style={{ gridTemplateColumns: '36px 92px 56px 1fr' }}
            >
              <span>{String(e.seq).padStart(3, '0')}</span>
              <span>{e.at.slice(0, 10)}</span>
              <span>{e.kind}</span>
              <span>{e.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
