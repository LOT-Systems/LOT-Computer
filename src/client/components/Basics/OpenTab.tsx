/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — OPEN TAB. Month 1 increment: read-only ledger + doctrine.
// Renders from shared constants immediately (no spinner); the server only
// contributes the envelope verdict (HELD / BREACH), never a dollar figure.

import * as React from 'react'
import {
  BASIC_FORM,
  BASIC_MODULE,
  BASIC_PRICE_USD,
  BASIC_LOAD,
  BASIC_CLASSES,
  BASIC_INTERVAL_LABEL,
  BASIC_DOCTRINE,
  BASIC_TERMS,
  BasicClass,
  basicFirstIssue,
  basicIssuesPerYear,
} from '#shared/constants/basics'
import { StatusLine, StatusItem } from './StatusLine'

type Envelope = { ceiling: string; marginFloor: string; costBasis: string }

const INTERVAL_SHORT: Record<number, string> = { 1: 'M', 3: 'Q', 6: 'S', 12: 'A' }

function useEnvelope() {
  const [env, setEnv] = React.useState<Envelope | null>(null)
  const [err, setErr] = React.useState(false)
  React.useEffect(() => {
    let live = true
    fetch('/api/public/basics')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => live && setEnv(d.envelope))
      .catch(() => live && setErr(true))
    return () => {
      live = false
    }
  }, [])
  return { env, err }
}

export function OpenTab({ variant = 'member' }: { variant?: 'public' | 'member' }) {
  const { env, err } = useEnvelope()
  const now = React.useMemo(() => new Date(), [])
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, '')

  const status: StatusItem[] = [
    { k: 'FORM', v: BASIC_FORM },
    { k: 'ENROLLMENT', v: 'CLOSED' },
    { k: 'CEILING', v: env ? env.ceiling : err ? 'NO SIGNAL' : '....' },
    { k: 'MARGIN', v: env ? env.marginFloor : err ? 'NO SIGNAL' : '....' },
    { k: 'BASIS', v: env ? env.costBasis : '....' },
    { k: 'DTG', v: stamp },
  ]

  let lastCls: BasicClass | null = null

  return (
    <section className="fm" aria-label="LOT BASIC ration open tab">
      <div className="fm-inv fm-bar">
        {BASIC_FORM} / {BASIC_MODULE} / OPEN TAB
      </div>
      <StatusLine items={status} />

      <div className="fm-sec">
        <div className="fm-h">00 DOCTRINE</div>
        <ol className="fm-list">
          {BASIC_DOCTRINE.map((line, i) => (
            <li key={i}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="fm-sec">
        <div className="fm-h">01 TERMS OF ISSUE</div>
        <dl className="fm-kv">
          {BASIC_TERMS.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt>{k}</dt>
              <dd style={{ margin: 0 }}>{v}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>

      <div className="fm-sec">
        <div className="fm-h">02 LOAD / {BASIC_LOAD.length} LINES</div>
        <table className="fm-ledger">
          <colgroup>
            <col className="c-ln" />
            <col />
            <col className="c-qty" />
            <col className="c-ui" />
            <col className="c-cad" />
            <col className="c-first" />
            <col className="c-yr" />
          </colgroup>
          <thead>
            <tr>
              <th>LN</th>
              <th>NOMENCLATURE</th>
              <th className="fm-n">QTY</th>
              <th>UI</th>
              <th>
                <span className="fm-long">CADENCE</span>
                <span className="fm-short">CAD</span>
              </th>
              <th>1ST</th>
              <th className="fm-n c-yr-cell">/YR</th>
            </tr>
          </thead>
          <tbody>
            {BASIC_LOAD.map((it) => {
              const header = it.cls !== lastCls
              lastCls = it.cls
              return (
                <React.Fragment key={it.key}>
                  {header && (
                    <tr className="fm-clsrow" aria-hidden="true">
                      <td colSpan={7}>
                        CLASS {it.cls} — {BASIC_CLASSES[it.cls]}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>{it.ln}</td>
                    <td>
                      {it.nomen}
                      {it.sized ? ' *' : ''}
                    </td>
                    <td className="fm-n">{it.qty}</td>
                    <td>{it.ui}</td>
                    <td>
                      <span className="fm-long">{BASIC_INTERVAL_LABEL[it.interval]}</span>
                      <span className="fm-short">{INTERVAL_SHORT[it.interval]}</span>
                    </td>
                    <td>{basicFirstIssue(it)}</td>
                    <td className="fm-n c-yr-cell">{basicIssuesPerYear(it)}</td>
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 'var(--fm-row)' }}>
          * SIZED AT ROSTER. CADENCE: M MONTHLY / Q QUARTERLY / S SEMI-ANNUAL / A ANNUAL.
          <br />
          1ST = ISSUE OF FIRST DRAW. LINES ARE STAGGERED SO NO SINGLE ISSUE BREACHES THE CEILING.
          <br />
          UNIT COST WITHHELD. ENVELOPE VERIFIED SERVER-SIDE ON EVERY READ.
        </div>
      </div>

      <div className="fm-sec">
        <div className="fm-h">03 PRICE</div>
        <div>
          USD {BASIC_PRICE_USD}.00 / MONTH. ADDITIVE TO USERSHIP (AI). NO TIERS. NO ADD-ONS.
        </div>
        <div className="fm-noprint" style={{ marginTop: 'var(--fm-row)' }}>
          {variant === 'public' ? (
            <>
              MEMBERS: <a href="/">SIGN IN</a> TO REQUEST ISSUE. UPGRADE PATH OPENS NEXT INCREMENT.
            </>
          ) : (
            <button className="fm-btn" disabled title="UPGRADE opens in Month 2 increment">
              UPGRADE — NOT YET OPEN
            </button>
          )}
        </div>
      </div>

      <div className="fm-inv fm-bar">
        END OF LEDGER. ISSUE, DO NOT SELL.
      </div>
    </section>
  )
}
