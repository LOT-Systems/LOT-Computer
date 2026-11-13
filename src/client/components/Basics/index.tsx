/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 / BASIC (RATION) — OPEN TAB.
// Month 1 increment: read-only ledger. Same component renders inside the
// logged-in app (Basics tab) and on the public /basics surface.
// House style: mono bold, ground/ink only, inversion is the only hierarchy,
// 2px rules, square corners, fixed character grid. No icons. No color.

import * as React from 'react'
import {
  BASIC_FORM,
  BASIC_LOAD,
  BASIC_DOCTRINE,
  BASIC_TERMS,
  BASIC_CADENCE_LABEL,
  BASIC_CADENCE_PERIOD,
  BASIC_CYCLE_ISSUES,
  BASIC_BUILD_PHASE,
  type BasicItem,
  type BasicPublicLedger,
} from '#shared/constants/basics'

type Props = {
  /** Public surface (stranger, not signed in). */
  isPublic?: boolean
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** 12-character cycle strip: X where the line issues, . where it does not. */
function cycleStrip(it: BasicItem): string {
  let s = ''
  for (let n = 1; n <= BASIC_CYCLE_ISSUES; n++) {
    s += (n - 1) % BASIC_CADENCE_PERIOD[it.cadence] === it.phase ? 'X' : '.'
  }
  return s
}

function useLedgerHeader() {
  const [hdr, setHdr] = React.useState<BasicPublicLedger | null>(null)
  React.useEffect(() => {
    let alive = true
    fetch('/api/public/basics')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setHdr(d))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return hdr
}

function todayStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export const StatusLine: React.FC<{ cells: [string, string][] }> = ({ cells }) => (
  <div className="lot-basic-status" role="status">
    {cells.map(([k, v]) => (
      <span key={k} className="lot-basic-status-cell">
        {k}: {v}
      </span>
    ))}
  </div>
)

const Section: React.FC<{ title: string; meta?: string; children: React.ReactNode }> = ({
  title,
  meta,
  children,
}) => (
  <section className="lot-basic-section">
    <div className="lot-basic-section-head">
      <span>{title}</span>
      {meta && <span>{meta}</span>}
    </div>
    {children}
  </section>
)

export const Basics: React.FC<Props> = ({ isPublic = false }) => {
  const hdr = useLedgerHeader()
  const [selected, setSelected] = React.useState<string | null>(null)

  const status: [string, string][] = [
    ['FORM', BASIC_FORM],
    ['PHASE', hdr?.phase ?? BASIC_BUILD_PHASE],
    ['STATE', 'OFF STRENGTH'],
    ['ENVELOPE', hdr?.envelope ?? '----'],
    ['DTG', todayStamp()],
  ]

  return (
    <div className="lot-basic">
      <header className="lot-basic-masthead">
        <span>LOT® BASIC</span>
        <span>CIVILIAN RATION / {BASIC_FORM}</span>
      </header>

      <StatusLine cells={status} />

      <Section title="DOCTRINE">
        <ol className="lot-basic-lines">
          {BASIC_DOCTRINE.map((l, i) => (
            <li key={i}>
              <span className="lot-basic-ln">{pad2(i + 1)}</span>
              <span>{l}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="TERMS">
        <dl className="lot-basic-terms">
          {BASIC_TERMS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="LEDGER" meta={`${BASIC_LOAD.length} LINE ITEMS / ${BASIC_CYCLE_ISSUES}-ISSUE CYCLE`}>
        <div className="lot-basic-ledger" role="table" aria-label="Ration load ledger">
          <div className="lot-basic-row lot-basic-row-head" role="row">
            <span role="columnheader">LN</span>
            <span role="columnheader">NOMENCLATURE</span>
            <span role="columnheader" className="lot-basic-num">QTY</span>
            <span role="columnheader">UI</span>
            <span role="columnheader">CADENCE</span>
            <span role="columnheader" className="lot-basic-wide">CYCLE 01-12</span>
          </div>
          {BASIC_LOAD.map((it) => {
            const on = selected === it.ln
            return (
              <div
                key={it.ln}
                role="row"
                tabIndex={0}
                aria-selected={on}
                className={on ? 'lot-basic-row lot-basic-inv' : 'lot-basic-row'}
                onClick={() => setSelected(on ? null : it.ln)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelected(on ? null : it.ln)
                  }
                }}
              >
                <span role="cell">{it.ln}</span>
                <span role="cell">{it.nomenclature}</span>
                <span role="cell" className="lot-basic-num">{it.qty}</span>
                <span role="cell">{it.ui}</span>
                <span role="cell">{BASIC_CADENCE_LABEL[it.cadence]}</span>
                <span role="cell" className="lot-basic-wide">{cycleStrip(it)}</span>
              </div>
            )
          })}
        </div>
        <div className="lot-basic-note">
          X = ISSUED THAT MONTH. UNIT COST WITHHELD. LOAD FIXED BY LEDGER, NOT BY MEMBER.
        </div>
      </Section>

      <Section title={isPublic ? 'ENLISTMENT' : 'UPGRADE'}>
        <div className="lot-basic-lines">
          {isPublic ? (
            <>
              <div>BASIC IS ISSUED TO USERSHIP MEMBERS ONLY.</div>
              <div>
                <a className="lot-basic-link" href="/">
                  SIGN IN TO LOT
                </a>
              </div>
            </>
          ) : (
            <>
              <div>USERSHIP / AI — ACTIVE.</div>
              <div>UPGRADE TO BASIC OPENS WITH ROSTER INTAKE. NOT YET ISSUABLE.</div>
            </>
          )}
        </div>
      </Section>
    </div>
  )
}
