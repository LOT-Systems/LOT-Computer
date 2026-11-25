/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / BASIC RATION MODULE — UPGRADE control + roster intake + STAND DOWN
 * House style: inversion-only hierarchy, 2px rules, square corners, mono grid.
 */

import * as React from 'react'
import { cn } from '#client/utils'
import {
  STATE_LABEL,
  nextFirstOfMonth,
  type BasicRecord,
} from '#shared/basics/engine'

const Cmd: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { solid?: boolean }
> = ({ solid, className, ...p }) => (
  <button
    {...p}
    className={cn(
      'font-mono text-[12px] uppercase px-16 py-8 border-2 border-acc',
      solid ? 'bg-acc text-bac' : 'bg-bac text-acc',
      'disabled:opacity-100 disabled:line-through disabled:cursor-not-allowed',
      className
    )}
  />
)

const Field: React.FC<{
  label: string
  value: string
  onChange: (v: string) => void
  w?: string
}> = ({ label, value, onChange, w }) => (
  <label className={cn('flex flex-col gap-y-4', w)}>
    <span className="font-mono text-[11px] uppercase">{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="font-mono text-[12px] uppercase bg-bac text-acc border-2 border-acc px-8 py-4 rounded-none outline-none focus:bg-acc focus:text-bac"
    />
  </label>
)

const money = (c: number) => `USD ${(c / 100).toFixed(2)}`

export const Enroll: React.FC<{
  basic: BasicRecord
  busy: boolean
  errors: string[]
  act: (path: string, body?: unknown) => Promise<boolean>
}> = ({ basic, busy, errors, act }) => {
  const [f, setF] = React.useState({
    name: '', line1: '', line2: '', city: '', region: '', postal: '',
  })
  const [start, setStart] = React.useState(() => nextFirstOfMonth(new Date()))
  const [confirmDown, setConfirmDown] = React.useState(false)
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }))
  const s = basic.state

  return (
    <div className="flex flex-col gap-y-16 font-mono text-[12px]">
      {s === 'NONE' && (
        <div>BASIC REQUIRES USERSHIP / AI AS BASE LAYER. NO ENROLLMENT.</div>
      )}

      {s === 'USERSHIP' && (
        <div className="flex flex-col gap-y-8">
          <div>ADDITIVE: +{money(10000)} / MO. AI PLAN RETAINED.</div>
          <Cmd solid disabled={busy} onClick={() => act('/upgrade')}>
            UPGRADE
          </Cmd>
        </div>
      )}

      {s === 'PENDING' && (
        <div className="flex flex-col gap-y-12">
          <div className="bg-acc text-bac px-8 py-4 uppercase">
            ROSTER INTAKE — OPERATOR 1 OF 1
          </div>
          <div className="grid grid-cols-1 phone:grid-cols-2 gap-8">
            <Field label="NAME" value={f.name} onChange={set('name')} />
            <Field label="ADDRESS 1" value={f.line1} onChange={set('line1')} />
            <Field label="ADDRESS 2" value={f.line2} onChange={set('line2')} />
            <Field label="CITY" value={f.city} onChange={set('city')} />
            <Field label="STATE (US)" value={f.region} onChange={set('region')} />
            <Field label="ZIP" value={f.postal} onChange={set('postal')} />
            <Field label="FIRST ISSUE (YYYY-MM-01)" value={start} onChange={setStart} />
          </div>
          <div>SIZING: STD / 1 OPERATOR. HOLDS BY LINE NO. VIA SUPPORT. PRICE UNCHANGED.</div>
          <div className="flex gap-x-8">
            <Cmd
              solid
              disabled={busy}
              onClick={() => act('/roster', { shipping: f, cadenceStart: start })}
            >
              CONFIRM — ON STRENGTH
            </Cmd>
            <Cmd disabled={busy} onClick={() => act('/stand-down')}>
              STAND DOWN
            </Cmd>
          </div>
        </div>
      )}

      {(s === 'ON_STRENGTH' || s === 'STEADY_STATE') && (
        <div className="flex flex-col gap-y-8">
          <div className="grid gap-x-16" style={{ gridTemplateColumns: '120px 1fr' }}>
            <span>BILLING</span>
            <span className="uppercase">
              {money(basic.billing.amountCents)} / MO — {basic.billing.status}
              {basic.billing.processor === 'NOT_CONNECTED' && ' — NOT CHARGED, PROCESSOR NOT CONNECTED'}
            </span>
            <span>NEXT ISSUE</span>
            <span>{basic.nextIssue ?? '—'}</span>
            <span>SHIP TO</span>
            <span className="uppercase">
              {basic.roster &&
                `${basic.roster.shipping.name}, ${basic.roster.shipping.line1}, ${basic.roster.shipping.city} ${basic.roster.shipping.region} ${basic.roster.shipping.postal}`}
            </span>
          </div>
          {!confirmDown ? (
            <Cmd disabled={busy} onClick={() => setConfirmDown(true)} className="self-start">
              STAND DOWN
            </Cmd>
          ) : (
            <div className="flex flex-col gap-y-8">
              <div className="bg-acc text-bac px-8 py-4">
                DROPS RATION. RETAINS {STATE_LABEL.USERSHIP}. CONFIRM?
              </div>
              <div className="flex gap-x-8">
                <Cmd solid disabled={busy} onClick={() => act('/stand-down').then(() => setConfirmDown(false))}>
                  CONFIRM
                </Cmd>
                <Cmd disabled={busy} onClick={() => setConfirmDown(false)}>
                  ABORT
                </Cmd>
              </div>
            </div>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <div className="border-2 border-acc p-8 uppercase">
          {errors.map((e) => (
            <div key={e}>! {e}</div>
          ))}
        </div>
      )}

      <div>
        <div className="bg-acc text-bac px-8 py-4 uppercase">ISSUE LOG</div>
        {basic.issueLog.length === 0 ? (
          <div className="py-4">NO ENTRIES.</div>
        ) : (
          [...basic.issueLog].reverse().slice(0, 12).map((e) => (
            <div key={e.ts + e.event} className="py-4 border-b-2 border-acc grid gap-x-8" style={{ gridTemplateColumns: '160px 1fr' }}>
              <span>{e.ts.slice(0, 19).replace('T', ' ')}Z</span>
              <span className="uppercase">{e.event} {STATE_LABEL[e.from]} → {STATE_LABEL[e.to]}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
