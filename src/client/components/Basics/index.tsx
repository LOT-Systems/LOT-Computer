/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 */

import * as React from 'react'
import { RATION_MANIFEST, ISSUE_PRICE_USD, LOT_FM_REF } from './rationManifest'

// Forced terminal palette — ignores app theme by design.
// LOT-FM-001 specifies white ground / black ink, inversion-only hierarchy.
const T = {
  bg:       '#ffffff',
  ink:      '#000000',
  rule:     '2px solid #000000',
  ruleHalf: '1px solid #000000',
  font:     "'Liberation Mono', 'Lucida Console', 'Courier New', Courier, monospace",
  size:     '13px',
  lineH:    '1.5',
} as const

const base: React.CSSProperties = {
  fontFamily:    T.font,
  fontSize:      T.size,
  lineHeight:    T.lineH,
  color:         T.ink,
  background:    T.bg,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.03em',
  borderRadius:  0,
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Header() {
  return (
    <div style={{ ...base, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: T.rule, background: T.ink, color: T.bg }}>
      <span style={{ fontWeight: 700 }}>LOT BASICS / {LOT_FM_REF} / RATION SYSTEM</span>
      <span style={{ fontWeight: 700, letterSpacing: '0.12em' }}>OPEN TAB</span>
    </div>
  )
}

type FieldRowProps = { label: string; value: React.ReactNode; dim?: boolean }
function FieldRow({ label, value, dim }: FieldRowProps) {
  return (
    <div style={{ ...base, display: 'flex', gap: '24px', padding: '4px 12px', borderBottom: T.ruleHalf, opacity: dim ? 0.45 : 1 }}>
      <span style={{ minWidth: '168px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...base, fontWeight: 700, padding: '5px 12px', borderBottom: T.rule, borderTop: T.rule, background: '#f0f0f0', letterSpacing: '0.08em' }}>
      {children}
    </div>
  )
}

function ManifestTable() {
  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Table header row */}
      <div style={{ ...base, display: 'flex', fontWeight: 700, padding: '4px 12px', borderBottom: T.rule, background: T.ink, color: T.bg, letterSpacing: '0.08em' }}>
        <span style={{ minWidth: '44px',  flexShrink: 0 }}>NO.</span>
        <span style={{ flex: 1 }}>NOMENCLATURE</span>
        <span style={{ minWidth: '120px', textAlign: 'right', flexShrink: 0 }}>CADENCE</span>
      </div>

      {RATION_MANIFEST.map((item, i) => (
        <div
          key={item.no}
          style={{
            ...base,
            display:       'flex',
            padding:       '3px 12px',
            borderBottom:  T.ruleHalf,
            background:    i % 2 === 0 ? T.bg : '#f9f9f9',
          }}
        >
          <span style={{ minWidth: '44px', flexShrink: 0, opacity: 0.55 }}>{item.no}</span>
          <span style={{ flex: 1 }}>{item.nomenclature}</span>
          <span style={{ minWidth: '120px', textAlign: 'right', flexShrink: 0, fontWeight: item.cadence === 'MONTHLY' ? 700 : 400 }}>
            {item.cadence}
          </span>
        </div>
      ))}
    </div>
  )
}

function Doctrine() {
  const lines = [
    'LOT ISSUES THE RATION. THE SUBSCRIBER IS ON STRENGTH.',
    'NO CURATION. NO MARKETING. ITEMS SELECTED BY NEED, NOT PREFERENCE.',
    'COST IS FIXED. LOAD IS FIXED. CADENCE IS FIXED. COGS IS WITHHELD.',
    'SUBSCRIBE → PENDING → ON STRENGTH → STEADY STATE.',
    'STAND DOWN AT ANY TIME. RATION DROPS; AI PLAN IS RETAINED.',
  ]
  return (
    <div style={{ padding: '8px 12px' }}>
      {lines.map((line, i) => (
        <div key={i} style={{ ...base, padding: '2px 0', opacity: i === 0 ? 1 : 0.65, fontWeight: i === 0 ? 700 : 400 }}>
          {i > 0 && <span style={{ marginRight: '8px', opacity: 0.3 }}>—</span>}
          {line}
        </div>
      ))}
    </div>
  )
}

function StatusLine() {
  const now = new Date()
  // Next issue is 1st of next month
  const nextIssueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${nextIssueDate.getFullYear()}-${pad(nextIssueDate.getMonth() + 1)}-${pad(nextIssueDate.getDate())}`

  return (
    <div style={{ ...base, display: 'flex', flexWrap: 'wrap', gap: '24px', padding: '5px 12px', borderTop: T.rule, opacity: 0.5, fontSize: '11px', letterSpacing: '0.06em' }}>
      <span>STATUS: OPEN TAB — NOT SUBSCRIBED</span>
      <span>NEXT ISSUE: {dateStr}</span>
      <span>LOAD: {RATION_MANIFEST.length} ITEMS</span>
      <span>REF: {LOT_FM_REF}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Basics() {
  return (
    <div style={{ fontFamily: T.font, fontSize: T.size, lineHeight: T.lineH, color: T.ink, background: T.bg, minHeight: '100vh' }}>
      {/* Terminal grid token — establishes the Basics CSS namespace */}
      <style>{`
        .lot-basics { --lot-basics-rule: 2px solid #000; --lot-basics-font: ${T.font}; }
      `}</style>

      <div className="lot-basics" style={{ maxWidth: '760px', margin: '0 auto', border: T.rule }}>
        <Header />

        <FieldRow label="ISSUE PRICE"    value={`USD ${ISSUE_PRICE_USD}.00 / MONTH`} />
        <FieldRow label="LANDED COST"    value="WITHHELD" dim />
        <FieldRow label="MARGIN FLOOR"   value="≥ 60 %" dim />
        <FieldRow label="SUBSCRIPTION"   value="ADDITIVE TO USERSHIP AI PLAN" />
        <FieldRow label="OPEN TAB"       value="MANIFEST IS PUBLIC — NO GATE" />

        <SectionHeader>LOAD / {RATION_MANIFEST.length} ITEMS / CADENCE</SectionHeader>

        <ManifestTable />

        <SectionHeader>DOCTRINE</SectionHeader>

        <Doctrine />

        <StatusLine />
      </div>
    </div>
  )
}
