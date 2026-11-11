/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — BASIC (RATION) · OPEN TAB
 *
 * Month 1: read-only ledger. Doctrine, price line, 23-line manifest
 * (nomenclature + cadence, COGS withheld), status line.
 *
 * House style: monospace bold, ink on ground, hierarchy by inversion only,
 * 2px rules, square corners, fixed character grid. No icons. No color.
 * Styles live under `.lot-term` in index.css.
 */

import * as React from 'react'
import {
  BASICS_MODULE,
  BASICS_MANIFEST,
  BASICS_CADENCE,
  BASICS_CLASSES,
  BASICS_DOCTRINE,
  BASICS_TERMS,
  getIssueLoad,
  type BasicsClass,
} from '#shared/constants/basics'

type Envelope = {
  withinCeiling: boolean
  marginHeld: boolean
  quotedLines: number
  totalLines: number
  manifestIntact: boolean
}

type PublicBasics = {
  envelope: Envelope
  roster: 'CLOSED' | 'OPEN'
}

const pad = (s: string | number, n: number) => String(s).padStart(n, '0')

/** One-line status strip, IBM 3270 register. */
export const StatusLine = ({ cells }: { cells: Array<[string, string]> }) => (
  <div className="lot-term-status" role="status">
    {cells.map(([k, v]) => (
      <span key={k} className="lot-term-status-cell">
        <span className="lot-term-dim">{k}</span> {v}
      </span>
    ))}
  </div>
)

const Rule = () => <div className="lot-term-rule" aria-hidden="true" />

const SectionHead = ({ children }: { children: React.ReactNode }) => (
  <div className="lot-term-head">{children}</div>
)

const CLASS_ORDER: BasicsClass[] = ['A', 'B', 'C', 'D']

export const Basics = ({ standalone = false }: { standalone?: boolean }) => {
  const [data, setData] = React.useState<PublicBasics | null>(null)
  const [linkFault, setLinkFault] = React.useState(false)
  const [showIssue, setShowIssue] = React.useState<number | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetch('/api/public/basics')
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setLinkFault(true))
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    const prev = document.title
    document.title = 'LOT — BASIC'
    return () => {
      document.title = prev
    }
  }, [])

  const envelopeStatus = linkFault
    ? 'NO LINK'
    : !data
    ? '....'
    : data.envelope.withinCeiling && data.envelope.marginHeld && data.envelope.manifestIntact
    ? 'HELD'
    : 'BREACH'

  const issueLoad = showIssue ? new Set(getIssueLoad(showIssue).map((i) => i.code)) : null

  return (
    <div className={standalone ? 'lot-term lot-term-standalone' : 'lot-term'}>
      <StatusLine
        cells={[
          ['MOD', `${BASICS_MODULE.code} ${BASICS_MODULE.name}`],
          ['REV', BASICS_MODULE.revision],
          ['ROSTER', data?.roster ?? 'CLOSED'],
          ['ENVELOPE', envelopeStatus],
        ]}
      />

      <div className="lot-term-title">
        <div className="lot-term-invert">{BASICS_MODULE.name}</div>
        <div>{BASICS_MODULE.designation} · {pad(BASICS_MODULE.itemCount, 2)} LINES</div>
      </div>

      <Rule />
      <SectionHead>01 DOCTRINE</SectionHead>
      <div className="lot-term-body">
        {BASICS_DOCTRINE.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <Rule />
      <SectionHead>02 TERMS</SectionHead>
      <div className="lot-term-body">
        {BASICS_TERMS.map((t) => (
          <div key={t.key} className="lot-term-kv">
            <span className="lot-term-k">{t.key}</span>
            <span>{t.value}</span>
          </div>
        ))}
      </div>

      <Rule />
      <SectionHead>03 MANIFEST</SectionHead>
      <div className="lot-term-body">
        <div className="lot-term-filter">
          <button
            type="button"
            className={showIssue === null ? 'lot-term-btn lot-term-invert' : 'lot-term-btn'}
            onClick={() => setShowIssue(null)}
          >
            FULL LOAD
          </button>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              className={showIssue === n ? 'lot-term-btn lot-term-invert' : 'lot-term-btn'}
              onClick={() => setShowIssue(n)}
            >
              ISSUE {pad(n, 3)}
            </button>
          ))}
        </div>

        <div className="lot-term-ledger" role="table" aria-label="BASIC ration manifest">
          <div className="lot-term-row lot-term-row-head" role="row">
            <span role="columnheader">LN</span>
            <span role="columnheader">CODE</span>
            <span role="columnheader">NOMENCLATURE</span>
            <span role="columnheader">QTY</span>
            <span role="columnheader">CAD</span>
          </div>
          {CLASS_ORDER.map((cls) => (
            <React.Fragment key={cls}>
              <div className="lot-term-row lot-term-row-class" role="row">
                <span role="cell">CLASS {cls} — {BASICS_CLASSES[cls]}</span>
              </div>
              {BASICS_MANIFEST.filter((i) => i.cls === cls).map((item) => {
                const off = issueLoad ? !issueLoad.has(item.code) : false
                return (
                  <div
                    key={item.code}
                    role="row"
                    className={off ? 'lot-term-row lot-term-off' : 'lot-term-row'}
                  >
                    <span role="cell">{pad(item.line, 2)}</span>
                    <span role="cell">{item.code}</span>
                    <span role="cell">{item.nomenclature}{item.sized ? ' *' : ''}</span>
                    <span role="cell">{item.qty}</span>
                    <span role="cell" title={BASICS_CADENCE[item.cadence].label}>
                      {item.cadence}
                    </span>
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>

        <div className="lot-term-legend">
          {Object.entries(BASICS_CADENCE).map(([k, v]) => (
            <div key={k}>{k} = {v.label}</div>
          ))}
          <div>* = SIZED AT ROSTER INTAKE</div>
        </div>
        {issueLoad && (
          <div className="lot-term-invert lot-term-inline">
            ISSUE {pad(showIssue!, 3)}: {pad(issueLoad.size, 2)} OF {pad(BASICS_MODULE.itemCount, 2)} LINES
          </div>
        )}
      </div>

      <Rule />
      <SectionHead>04 ENVELOPE</SectionHead>
      <div className="lot-term-body">
        <div className="lot-term-kv">
          <span className="lot-term-k">CEILING</span>
          <span>{data ? (data.envelope.withinCeiling ? 'HELD' : 'BREACH') : '....'}</span>
        </div>
        <div className="lot-term-kv">
          <span className="lot-term-k">MARGIN</span>
          <span>{data ? (data.envelope.marginHeld ? 'HELD' : 'BREACH') : '....'}</span>
        </div>
        <div className="lot-term-kv">
          <span className="lot-term-k">QUOTES</span>
          <span>
            {data
              ? `${pad(data.envelope.quotedLines, 2)} / ${pad(data.envelope.totalLines, 2)} CONFIRMED`
              : '....'}
          </span>
        </div>
        <div className="lot-term-dim">LANDED COST PER LINE IS WITHHELD. THE VERDICT IS NOT.</div>
      </div>

      <Rule />
      <SectionHead>05 UPGRADE</SectionHead>
      <div className="lot-term-body">
        <div>ROSTER IS CLOSED. INTAKE OPENS TO USERSHIP MEMBERS FIRST.</div>
        <button type="button" className="lot-term-btn lot-term-btn-disabled" disabled>
          UPGRADE — NOT YET ISSUED
        </button>
      </div>

      <Rule />
      <StatusLine
        cells={[
          ['ISSUE', '000'],
          ['NEXT ISSUE', '—'],
          ['ON STRENGTH', '000'],
        ]}
      />
    </div>
  )
}
