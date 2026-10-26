/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { cn } from '#client/utils'
import { SIZES, RationState, RATION_PRICE_USD } from '#shared/basics/ration-state'
import {
  BasicsRosterResponse,
  useBasicsIntake,
  useBasicsStandDown,
  useBasicsUpgrade,
} from '#client/queries'

const BTN =
  'font-mono text-[12px] uppercase tracking-widest border-2 border-acc px-16 py-8 ' +
  'bg-transparent text-acc hover:bg-acc hover:text-[var(--bg,#fff)] disabled:opacity-30'
const FIELD =
  'font-mono text-[12px] uppercase bg-transparent border-2 border-acc text-acc px-8 py-6 w-full rounded-none'

const FIELDS: [string, string][] = [
  ['shipName', 'NAME'],
  ['shipLine1', 'ADDRESS 1'],
  ['shipLine2', 'ADDRESS 2'],
  ['shipCity', 'CITY'],
  ['shipRegion', 'STATE / REGION'],
  ['shipPostal', 'POSTAL'],
  ['shipCountry', 'COUNTRY (ISO-2)'],
]

const today = () => new Date().toISOString().slice(0, 10)

export const RosterControl: React.FC<{
  state: RationState
  isUsership: boolean
  data: BasicsRosterResponse | undefined
}> = ({ state, isUsership, data }) => {
  const qc = useQueryClient()
  const refresh = () => qc.invalidateQueries(['/api/basics/roster'])
  const upgrade = useBasicsUpgrade({ onSuccess: refresh })
  const intake = useBasicsIntake({ onSuccess: refresh })
  const standDown = useBasicsStandDown({ onSuccess: refresh })
  const [form, setForm] = React.useState<Record<string, string>>({ size: 'M', cadenceStart: today() })
  const [confirmDown, setConfirmDown] = React.useState(false)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const bad: string[] = (intake.error as any)?.response?.data?.fields ?? []
  const roster = data?.roster
  const err = [upgrade, intake, standDown].find((m) => m.error)?.error as any

  return (
    <div className="border-2 border-acc p-16 font-mono text-[12px] flex flex-col gap-y-12">
      <div className="uppercase tracking-widest text-[10px] text-acc/50">
        UPGRADE — USERSHIP / AI → BASIC
      </div>

      {state === 'USERSHIP' && (
        <>
          <div className="text-acc leading-snug">
            {isUsership
              ? `BASIC ration is an additive layer. USD ${RATION_PRICE_USD}.00/MO on top of Usership. AI retained.`
              : 'REQUIRES USERSHIP / AI AS BASE LAYER.'}
          </div>
          <div>
            <button className={BTN} disabled={!isUsership || upgrade.isLoading} onClick={() => upgrade.mutate()}>
              UPGRADE
            </button>
          </div>
        </>
      )}

      {state === 'PENDING' && (
        <>
          <div className="text-acc leading-snug">
            PENDING. FILE ROSTER INTAKE. ON STRENGTH WHEN INTAKE AND BILLING ARE BOTH CONFIRMED.
          </div>
          <div className="text-acc/60">
            INTAKE: {roster?.intake ? 'FILED' : 'OPEN'} / BILLING:{' '}
            {roster?.billingConfirmed ? 'CONFIRMED' : 'AWAITING CONFIRMATION'}
          </div>
        </>
      )}

      {(state === 'PENDING' || state === 'ON_STRENGTH' || state === 'STEADY_STATE') && (
        <form
          className="flex flex-col gap-y-8"
          onSubmit={(e) => {
            e.preventDefault()
            intake.mutate(form as any)
          }}
        >
          <label className="flex flex-col gap-y-2">
            <span className="text-acc/50 text-[10px] tracking-widest">SIZE</span>
            <select className={FIELD} value={form.size} onChange={(e) => set('size', e.target.value)}>
              {SIZES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {FIELDS.map(([k, label]) => (
            <label key={k} className="flex flex-col gap-y-2">
              <span className={cn('text-[10px] tracking-widest', bad.includes(k) ? 'text-acc font-bold' : 'text-acc/50')}>
                {label}
                {bad.includes(k) ? ' — INVALID' : ''}
              </span>
              <input className={FIELD} value={form[k] ?? ''} onChange={(e) => set(k, e.target.value)} />
            </label>
          ))}
          <label className="flex flex-col gap-y-2">
            <span className={cn('text-[10px] tracking-widest', bad.includes('cadenceStart') ? 'text-acc font-bold' : 'text-acc/50')}>
              CADENCE START{bad.includes('cadenceStart') ? ' — INVALID' : ''}
            </span>
            <input
              type="date"
              min={today()}
              className={FIELD}
              value={form.cadenceStart}
              onChange={(e) => set('cadenceStart', e.target.value)}
            />
          </label>
          <div>
            <button className={BTN} type="submit" disabled={intake.isLoading}>
              {roster?.intake ? 'UPDATE INTAKE' : 'FILE INTAKE'}
            </button>
          </div>
        </form>
      )}

      {state !== 'USERSHIP' && (
        <div className="border-t-2 border-acc pt-12 flex flex-col gap-y-8">
          <div className="text-acc/60 leading-snug">
            STAND DOWN DROPS THE RATION AND BILLING. USERSHIP / AI IS RETAINED.
          </div>
          {!confirmDown ? (
            <div>
              <button className={BTN} onClick={() => setConfirmDown(true)}>STAND DOWN</button>
            </div>
          ) : (
            <div className="flex gap-x-8">
              <button className={BTN} disabled={standDown.isLoading} onClick={() => { standDown.mutate(); setConfirmDown(false) }}>
                CONFIRM STAND DOWN
              </button>
              <button className={BTN} onClick={() => setConfirmDown(false)}>CANCEL</button>
            </div>
          )}
        </div>
      )}

      {err && (
        <div className="text-acc font-bold">
          REJECTED: {err?.response?.data?.error ?? 'REQUEST FAILED'}
        </div>
      )}
    </div>
  )
}

export const IssueLog: React.FC<{ rows: BasicsRosterResponse['issues'] }> = ({ rows }) => (
  <div className="font-mono text-[11px] flex flex-col">
    {rows.length === 0 && <div className="text-acc/40">NO ENTRIES.</div>}
    {rows.map((r) => (
      <div key={r.id} className="grid gap-x-8 py-[3px] border-b border-acc/10" style={{ gridTemplateColumns: '90px 110px 1fr' }}>
        <span className="text-acc/40 tabular-nums">{r.timestamp.slice(0, 10)}</span>
        <span className="text-acc uppercase">{r.kind}</span>
        <span className="text-acc/70">{r.detail}</span>
      </div>
    ))}
  </div>
)
