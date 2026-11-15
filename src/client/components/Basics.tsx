/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — BASIC (RATION) MODULE — BASICS TAB / OPEN TAB
 *
 * MONTH 1 — LEDGER & DOCTRINE. Read-only.
 * House style: mono bold, white ground / black ink, inversion-only hierarchy,
 * 2px rules, square corners, fixed character grid. No color. No radius. No icons.
 *
 * The same sheet renders inside the app (Basics tab) and on the public
 * /open surface. The ledger is the marketing — no layer in between.
 */

import * as React from 'react'
import {
  RATION_FM,
  RATION_MODULE,
  RATION_PRICE_USD,
  RATION_LOAD,
  RATION_LOAD_COUNT,
  RATION_DOCTRINE,
  RATION_TERMS,
  RATION_CLASS_LABEL,
  RATION_CADENCE_LABEL,
  RATION_STATE_ORDER,
  RATION_STATE_LABEL,
  RationClass,
  RationState,
  rationLoadForIssue,
} from '#shared/constants/ration'

// ─── Terminal tokens ─────────────────────────────────────────────────────────
// Fixed: the ration sheet does not follow the app theme. Ink on paper.
const INK = '#000000'
const PAPER = '#FFFFFF'
const RULE = `2px solid ${INK}`
const FONT = "'Liberation Mono', 'LiberationMono-Bold', 'Courier New', Courier, monospace"
const CYCLE = 6

const sheet: React.CSSProperties = {
  background: PAPER,
  color: INK,
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: 13,
  lineHeight: '20px',
  letterSpacing: 0,
  border: RULE,
  borderRadius: 0,
  fontVariantLigatures: 'none',
  textTransform: 'uppercase',
  maxWidth: 880,
  width: '100%',
}

const inverted: React.CSSProperties = { background: INK, color: PAPER }
const cell: React.CSSProperties = { padding: '0 8px', whiteSpace: 'nowrap' }
const section: React.CSSProperties = { borderTop: RULE }

const Bar: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <div style={{ ...inverted, display: 'flex', justifyContent: 'space-between', padding: '2px 8px', gap: 16 }}>
    <span>{children}</span>
    {right && <span>{right}</span>}
  </div>
)

// ─── Status line ─────────────────────────────────────────────────────────────
export type RationStatus = {
  envelope: 'HOLDING' | 'BREACH' | '—'
  phase: string
  intake: string
}

export const RationStatusLine: React.FC<{ status: RationStatus; state?: RationState | null }> = ({
  status,
  state,
}) => {
  const parts = [
    RATION_FM,
    RATION_MODULE,
    status.phase,
    `ENVELOPE ${status.envelope}`,
    `INTAKE ${status.intake}`,
  ]
  if (state) parts.push(RATION_STATE_LABEL[state])
  return (
    <div
      role="status"
      style={{ ...inverted, padding: '2px 8px', display: 'flex', flexWrap: 'wrap', columnGap: 0 }}
    >
      {parts.map((p, i) => (
        <span key={p} style={{ whiteSpace: 'nowrap' }}>
          {i > 0 && <span aria-hidden>{'\u00A0│\u00A0'}</span>}
          {p}
        </span>
      ))}
    </div>
  )
}

// ─── Ledger ──────────────────────────────────────────────────────────────────
const CLASSES: RationClass[] = ['I', 'II', 'III', 'IV']

const RationLedger: React.FC = () => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640 }}>
      <thead>
        <tr style={{ borderBottom: RULE }}>
          {['LN', 'STOCK NO', 'NOMENCLATURE', 'U/I', 'QTY', 'CADENCE'].map((h) => (
            <th key={h} style={{ ...cell, textAlign: 'left', fontWeight: 700 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      {CLASSES.map((cls) => (
        <tbody key={cls}>
          <tr>
            <td colSpan={6} style={{ ...cell, ...inverted }}>
              {RATION_CLASS_LABEL[cls]}
            </td>
          </tr>
          {RATION_LOAD.filter((i) => i.cls === cls).map((item) => (
            <tr key={item.line}>
              <td style={cell}>{item.line}</td>
              <td style={cell}>{item.stock}</td>
              <td style={{ ...cell, whiteSpace: 'normal' }}>
                {item.nomenclature}
                {item.sized && ' [SZ]'}
              </td>
              <td style={cell}>{item.unit}</td>
              <td style={{ ...cell, textAlign: 'right' }}>{String(item.qty).padStart(2, '0')}</td>
              <td style={cell}>
                {item.cadence} {RATION_CADENCE_LABEL[item.cadence]}
              </td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  </div>
)

// ─── Cadence grid (issues 1–6 × 23 lines) ────────────────────────────────────
const CadenceGrid: React.FC = () => {
  const issues = React.useMemo(
    () => Array.from({ length: CYCLE }, (_, i) => new Set(rationLoadForIssue(i + 1).map((x) => x.line))),
    []
  )
  const header = 'ISSUE  ' + RATION_LOAD.map((i) => i.line.slice(-1)).join('')
  return (
    <pre style={{ margin: 0, padding: '8px', fontFamily: FONT, fontWeight: 700, overflowX: 'auto' }}>
      {'       ' + RATION_LOAD.map((i) => i.line[0]).join('') + '\n'}
      {header + '  LINES\n'}
      {issues
        .map((set, idx) => {
          const row = RATION_LOAD.map((i) => (set.has(i.line) ? '■' : '·')).join('')
          return `  ${String(idx + 1).padStart(2, '0')}   ${row}  ${String(set.size).padStart(2, '0')}`
        })
        .join('\n')}
      {'\n\n■ ISSUED\n· NOT IN LOAD\nCYCLE REPEATS EVERY 6 ISSUES'}
    </pre>
  )
}

// ─── Upgrade strip (read-only in Month 1) ────────────────────────────────────
// 2px rules drawn by the grid gap on an ink ground: 4 across, 2×2 on phones.
// Rule lives in src/client/index.css ([data-lot-ration-strip]) — CSP forbids
// un-nonced inline <style> tags.
const UpgradeStrip: React.FC<{ state: RationState | null }> = ({ state }) => (
  <div data-lot-ration-strip="">
    {RATION_STATE_ORDER.map((s, i) => {
      const active = s === state
      return (
        <div
          key={s}
          style={{
            ...(active ? inverted : { background: PAPER }),
            padding: '2px 8px',
            whiteSpace: 'nowrap',
          }}
        >
          {String(i + 1).padStart(2, '0')} {RATION_STATE_LABEL[s]}
        </div>
      )
    })}
  </div>
)

// ─── Sheet ───────────────────────────────────────────────────────────────────
type Props = {
  /** Operator's current ration state. null on the public surface. */
  state?: RationState | null
  /** Public surface shows a sign-in line instead of the upgrade control. */
  isPublic?: boolean
}

const DEFAULT_STATUS: RationStatus = {
  envelope: '—',
  phase: 'MONTH 1 — LEDGER & DOCTRINE',
  intake: 'CLOSED',
}

export const RationSheet: React.FC<Props> = ({ state = null, isPublic = false }) => {
  const [status, setStatus] = React.useState<RationStatus>(DEFAULT_STATUS)

  React.useEffect(() => {
    let alive = true
    fetch('/api/public/ration')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return
        setStatus({
          envelope: d.envelope === 'HOLDING' ? 'HOLDING' : 'BREACH',
          phase: d.phase || DEFAULT_STATUS.phase,
          intake: d.intake || DEFAULT_STATUS.intake,
        })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <div style={sheet} data-lot-ration="FM-001">
      <RationStatusLine status={status} state={state} />

      <div style={{ padding: '16px 8px 8px' }}>
        <div>LOT® BASICS</div>
        <div>CIVILIAN RATION — ISSUED MONTHLY</div>
      </div>

      <div style={section}>
        <Bar right={`${RATION_DOCTRINE.length} ARTICLES`}>SECTION 1 — DOCTRINE</Bar>
        <ol style={{ margin: 0, padding: '8px', listStyle: 'none' }}>
          {RATION_DOCTRINE.map((d, i) => (
            <li key={i}>
              1.{i + 1} {d}
            </li>
          ))}
        </ol>
      </div>

      <div style={section}>
        <Bar right={`${RATION_LOAD_COUNT} LINES`}>SECTION 2 — LOAD MANIFEST</Bar>
        <RationLedger />
        <div style={{ ...section, padding: '2px 8px' }}>
          [SZ] SIZED AT ROSTER INTAKE. COST OF GOODS WITHHELD.
        </div>
      </div>

      <div style={section}>
        <Bar right="ISSUES 01–06">SECTION 3 — CADENCE</Bar>
        <CadenceGrid />
      </div>

      <div style={section}>
        <Bar>SECTION 4 — TERMS</Bar>
        <div style={{ padding: '8px' }}>
          {RATION_TERMS.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 8 }}>
              <span style={{ whiteSpace: 'pre' }}>{(k + ' ').padEnd(14, '.')}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={section}>
        <Bar>SECTION 5 — UPGRADE PATH</Bar>
        <UpgradeStrip state={state} />
        <div style={{ ...section, padding: '8px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <button
            type="button"
            disabled
            aria-disabled
            title="Roster intake opens Month 2"
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 13,
              lineHeight: '20px',
              textTransform: 'uppercase',
              background: PAPER,
              color: INK,
              border: RULE,
              borderRadius: 0,
              padding: '2px 12px',
              cursor: 'not-allowed',
              opacity: 1,
              borderStyle: 'dashed',
            }}
          >
            UPGRADE — USD {RATION_PRICE_USD}/MO
          </button>
          <span>
            {isPublic
              ? 'USERSHIP MEMBERS ONLY. SIGN IN AT LOT-SYSTEMS.COM.'
              : 'ROSTER INTAKE OPENS MONTH 2. STAND BY.'}
          </span>
        </div>
      </div>

      <div style={{ ...inverted, padding: '2px 8px', display: 'flex', flexWrap: 'wrap', columnGap: 16, justifyContent: 'space-between' }}>
        <span>LOT SYSTEMS — ISSUE, DO NOT SELL.</span>
        <span>{RATION_FM}</span>
      </div>
    </div>
  )
}

/** In-app Basics tab. */
export const Basics: React.FC<{ state?: RationState | null }> = ({ state = null }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
    <RationSheet state={state} />
  </div>
)
