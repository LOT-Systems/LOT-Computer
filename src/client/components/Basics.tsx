/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * LOT-FM-001 / BASIC RATION MODULE
 * White ground, black ink, inversion-only hierarchy, 2px rules, square corners.
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { cn } from '#client/utils'
import { Button } from '#client/components/ui'
import {
  useBasicsStatus,
  useBasicsUpgrade,
  useBasicsStandDown,
} from '#client/queries'
import {
  RATION_MANIFEST,
  RATION_CATEGORIES,
  DOCTRINE_LINES,
  PRICE_LINE,
  MANUAL_REF,
  STATE_LABEL,
  isRationed,
  validateRoster,
  type Roster,
} from '#shared/basics/index'

const Rule: React.FC = () => <div className="border-t-2 border-black w-full" />

const Inverted: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-black text-white px-8 py-4 font-bold uppercase tracking-wide">
    {children}
  </div>
)

const Row: React.FC<{ k: string; v: React.ReactNode }> = ({ k, v }) => (
  <div className="grid grid-cols-[10ch_1fr] gap-x-16 uppercase">
    <span>{k}</span>
    <span className="font-bold">{v}</span>
  </div>
)

const nextMonthStart = () => {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString().slice(0, 10)
}

const BLANK: Roster = {
  name: '', line1: '', city: '', region: '', postal: '', country: 'US',
  size: 'M', cadenceStart: nextMonthStart(),
}

const Field: React.FC<{
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}> = ({ label, value, onChange, type = 'text' }) => (
  <label className="grid grid-cols-[10ch_1fr] items-center gap-x-16 uppercase">
    <span>{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-2 border-black bg-white text-black px-8 py-4 rounded-none outline-none focus:bg-black focus:text-white"
    />
  </label>
)

const Intake: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [r, setR] = React.useState<Roster>(BLANK)
  const [errs, setErrs] = React.useState<string[]>([])
  const upgrade = useBasicsUpgrade()
  const set = (k: keyof Roster) => (v: string) => setR((p) => ({ ...p, [k]: v }))

  const submit = () => {
    const e = validateRoster(r)
    setErrs(e)
    if (e.length) return
    upgrade.mutate(r, {
      onSuccess: onDone,
      onError: (err: any) => setErrs([err?.response?.data?.error ?? 'UPGRADE FAILED']),
    })
  }

  return (
    <div className="flex flex-col gap-y-8 border-2 border-black p-16">
      <Inverted>ROSTER INTAKE</Inverted>
      <Field label="NAME" value={r.name} onChange={set('name')} />
      <Field label="ADDRESS" value={r.line1} onChange={set('line1')} />
      <Field label="ADDR 2" value={r.line2 ?? ''} onChange={set('line2')} />
      <Field label="CITY" value={r.city} onChange={set('city')} />
      <Field label="REGION" value={r.region} onChange={set('region')} />
      <Field label="POSTAL" value={r.postal} onChange={set('postal')} />
      <Field label="COUNTRY" value={r.country} onChange={set('country')} />
      <label className="grid grid-cols-[10ch_1fr] items-center gap-x-16 uppercase">
        <span>SIZE</span>
        <select
          value={r.size}
          onChange={(e) => set('size')(e.target.value)}
          className="border-2 border-black bg-white text-black px-8 py-4 rounded-none"
        >
          {['S', 'M', 'L', 'XL'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <Field label="START" type="date" value={r.cadenceStart} onChange={set('cadenceStart')} />
      {errs.length > 0 && (
        <div className="uppercase font-bold">{errs.map((e) => `ERR: ${e}`).join(' / ')}</div>
      )}
      <div className="uppercase">
        {PRICE_LINE} PENDING UNTIL OPERATOR CONFIRMS PAYMENT.
      </div>
      <div>
        <Button onClick={submit}>UPGRADE</Button>
      </div>
    </div>
  )
}

export const Basics: React.FC = () => {
  const qc = useQueryClient()
  const status = useBasicsStatus({ retry: false })
  const standDown = useBasicsStandDown()
  const [intake, setIntake] = React.useState(false)
  const rec = status.data
  const refresh = () => {
    setIntake(false)
    qc.invalidateQueries({ queryKey: ['/api/basics/status'] })
  }

  return (
    <div className="font-mono uppercase text-black flex flex-col gap-y-16 pb-[120px] max-w-[88ch]">
      <div className="flex justify-between font-bold">
        <span>BASICS</span>
        <span>{MANUAL_REF}</span>
      </div>
      <Rule />

      <div className="flex flex-col gap-y-4">
        {DOCTRINE_LINES.map((l) => <div key={l}>{l}</div>)}
      </div>
      <Inverted>{PRICE_LINE}</Inverted>

      {/* SECTION 1 — LEDGER (public, COGS withheld) */}
      <Rule />
      <div className="font-bold">SECTION 1 — RATION MANIFEST ({RATION_MANIFEST.length} LINES)</div>
      {RATION_CATEGORIES.map((cat) => {
        const items = RATION_MANIFEST.filter((i) => i.category === cat)
        return (
          <div key={cat} className="flex flex-col">
            <Inverted>{cat} ({items.length})</Inverted>
            {items.map((i) => (
              <div
                key={i.line}
                className="grid grid-cols-[3ch_1fr_auto_11ch] gap-x-16 py-4 border-b-2 border-black"
              >
                <span>{i.line}</span>
                <span>{i.nomenclature}</span>
                <span className="text-right">{i.spec}</span>
                <span className="text-right font-bold">{i.cadence}</span>
              </div>
            ))}
          </div>
        )
      })}

      {/* SECTION 2 — STATUS */}
      <Rule />
      <div className="font-bold">SECTION 2 — STATUS</div>
      {status.isLoading && <div>READING…</div>}
      {status.isError && <div>NOT ON NET. LEDGER IS READ-ONLY.</div>}
      {rec && (
        <div className="flex flex-col gap-y-4">
          <Row k="PLAN" v={STATE_LABEL[rec.state]} />
          <Row k="RATION" v={isRationed(rec.state) ? STATE_LABEL[rec.state] : 'NOT ON STRENGTH'} />
          <Row k="NEXT ISSUE" v={rec.nextIssue ?? '—'} />
          <Row k="ISSUED" v={`${rec.issues.length}`} />
        </div>
      )}

      {/* SECTION 3 — ISSUE LOG */}
      {rec && rec.issues.length > 0 && (
        <>
          <Rule />
          <div className="font-bold">SECTION 3 — ISSUE LOG</div>
          {rec.issues.map((i) => (
            <div key={i.issue} className="grid grid-cols-[6ch_1fr_auto] gap-x-16 border-b-2 border-black py-4">
              <span>#{String(i.issue).padStart(3, '0')}</span>
              <span>{i.at.slice(0, 10)}</span>
              <span className="font-bold">{i.status}</span>
            </div>
          ))}
        </>
      )}

      {/* CONTROL */}
      {rec?.state === 'USERSHIP' && !intake && (
        <div><Button onClick={() => setIntake(true)}>UPGRADE → BASIC</Button></div>
      )}
      {rec?.state === 'USERSHIP' && intake && <Intake onDone={refresh} />}
      {rec?.state === 'NONE' && (
        <div>REQUIRES USERSHIP / AI AS BASE LAYER. RATION IS ADDITIVE.</div>
      )}
      {rec && isRationed(rec.state) && (
        <div>
          <Button
            onClick={() => standDown.mutate(undefined, { onSuccess: refresh })}
          >
            STAND DOWN
          </Button>
          <div className="mt-8">STAND DOWN DROPS THE RATION. AI IS RETAINED.</div>
        </div>
      )}
    </div>
  )
}
