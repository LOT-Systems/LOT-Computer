/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 / MODULE: BASIC (RATION) — OPEN TAB.
// Month 1 increment: read-only ledger. Nomenclature + cadence. COGS withheld.
// House style: mono bold, white ground / black ink, inversion-only hierarchy,
// 2px rules, square corners, fixed character grid. Styles: .lr-* in index.css.

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import {
  BASICS_FM,
  BASICS_MODULE,
  BASICS_DOCTRINE,
  BASICS_PRICE_LINE,
  BASICS_CYCLE_MONTHS,
  RATION_MANIFEST,
  STRENGTH_LABEL,
  StrengthState,
  cadenceString,
  issuesInMonth,
  loadForMonth,
} from '#shared/constants/basics'

const MONTHS = Array.from({ length: BASICS_CYCLE_MONTHS }, (_, m) => m)
const mo = (m: number) => String(m + 1).padStart(2, '0')
const ln = (n: number) => String(n).padStart(2, '0')

type Envelope = 'HELD' | 'BREACH' | '----'

const useEnvelope = (): Envelope => {
  const [envelope, setEnvelope] = React.useState<Envelope>('----')
  React.useEffect(() => {
    let live = true
    fetch('/api/public/basics/manifest')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (live && d && (d.envelope === 'HELD' || d.envelope === 'BREACH')) setEnvelope(d.envelope)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])
  return envelope
}

const strengthFor = (tags: string[] | undefined | null, loggedIn: boolean): StrengthState => {
  if (!loggedIn) return 'NOT_ON_ROLL'
  // Month 2 replaces this with the UPGRADE state machine.
  const t = (tags || []).map((x) => x.toLowerCase())
  return t.includes('usership') ? 'USERSHIP_AI' : 'NOT_ON_ROLL'
}

export const StatusLine: React.FC<{ strength: StrengthState; envelope: Envelope; nextIssue: string }> = ({
  strength,
  envelope,
  nextIssue,
}) => (
  <div className="lr-status" role="status">
    <span>{BASICS_FM}</span>
    <span>{BASICS_MODULE}</span>
    <span>STATUS: {STRENGTH_LABEL[strength]}</span>
    <span>NEXT ISSUE: {nextIssue}</span>
    <span>ENVELOPE: {envelope}</span>
  </div>
)

export function Basics() {
  const me = useStore(stores.me)
  const envelope = useEnvelope()
  const strength = strengthFor(me?.tags, !!me)
  const [month, setMonth] = React.useState(0)
  const load = React.useMemo(() => loadForMonth(month), [month])

  return (
    <div className="lr-root">
      <StatusLine strength={strength} envelope={envelope} nextIssue="----" />

      <section className="lr-sect">
        <div className="lr-head">BASIC · CIVILIAN RATION · OPEN TAB</div>
        <ol className="lr-doctrine">
          {BASICS_DOCTRINE.map((d, i) => (
            <li key={i}>
              <span>{ln(i + 1)}</span> {d}
            </li>
          ))}
        </ol>
        <div className="lr-rule" />
        <div className="lr-price">{BASICS_PRICE_LINE}</div>
      </section>

      <section className="lr-sect">
        <div className="lr-head">MANIFEST · {RATION_MANIFEST.length} LINES · 12-MO CYCLE</div>
        <div className="lr-scroll">
          <table className="lr-table">
            <thead>
              <tr>
                <th>LN</th>
                <th>NOMENCLATURE</th>
                <th>QTY</th>
                <th>CLASS</th>
                <th>CADENCE</th>
                {MONTHS.map((m) => (
                  <th key={m} className={m === month ? 'lr-inv lr-mo' : 'lr-mo'}>
                    {mo(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RATION_MANIFEST.map((item) => (
                <tr key={item.id} className={issuesInMonth(item, month) ? 'lr-on' : undefined}>
                  <td>{ln(item.line)}</td>
                  <td>{item.nomenclature}</td>
                  <td>{item.qty}</td>
                  <td>{item.cls}</td>
                  <td>{cadenceString(item)}</td>
                  {MONTHS.map((m) => (
                    <td key={m} className="lr-mo">
                      {issuesInMonth(item, m) ? '■' : '·'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lr-sect">
        <div className="lr-head">LOAD · MO {mo(month)} · {load.length} ITEMS</div>
        <div className="lr-months" role="tablist" aria-label="Cycle month">
          {MONTHS.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={m === month}
              className={m === month ? 'lr-btn lr-inv' : 'lr-btn'}
              onClick={() => setMonth(m)}
            >
              {mo(m)}
            </button>
          ))}
        </div>
        <ul className="lr-load">
          {load.map((item) => (
            <li key={item.id}>
              <span>{ln(item.line)}</span> {item.nomenclature} · {item.qty}
            </li>
          ))}
        </ul>
      </section>

      <section className="lr-sect">
        <div className="lr-head">UPGRADE</div>
        <div>USERSHIP/AI → BASIC. NOT YET OPEN. MEMBERS ON THE ROLL WILL BE CALLED.</div>
      </section>
    </div>
  )
}
