/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / BASICS TAB
 * Month 1: Ledger & Doctrine (read-only)
 * Month 2: Upgrade state machine (PENDING → ON STRENGTH → STEADY STATE)
 * Month 3: Issue & Fulfillment (box ships)
 */

import * as React from 'react'
import { RATION_MANIFEST, ISSUE_PRICE_USD, LOT_FM_REF } from './rationManifest'
import { UpgradeControl } from './UpgradeControl'
import { RosterForm } from './RosterForm'
import { IssueLog } from './IssueLog'
import { RationSubscriptionState, RationRoster } from './types'

// Forced terminal palette — white ground / black ink, ignores app theme.
const T = {
  bg:       '#ffffff',
  ink:      '#000000',
  rule:     '2px solid #000000',
  ruleHalf: '1px solid #000000',
  dimBg:    '#f0f0f0',
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

function Header({ status }: { status: string }) {
  const isActive = status === 'ON_STRENGTH' || status === 'STEADY_STATE'
  return (
    <div style={{ ...base, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: T.rule, background: T.ink, color: T.bg }}>
      <span style={{ fontWeight: 700 }}>LOT BASICS / {LOT_FM_REF} / RATION SYSTEM</span>
      <span style={{ fontWeight: 700, letterSpacing: '0.12em' }}>{isActive ? 'ON STRENGTH' : 'OPEN TAB'}</span>
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
    <div style={{ ...base, fontWeight: 700, padding: '5px 12px', borderBottom: T.rule, borderTop: T.rule, background: T.dimBg, letterSpacing: '0.08em' }}>
      {children}
    </div>
  )
}

function ManifestTable() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ ...base, display: 'flex', fontWeight: 700, padding: '4px 12px', borderBottom: T.rule, background: T.ink, color: T.bg, letterSpacing: '0.08em' }}>
        <span style={{ minWidth: '44px',  flexShrink: 0 }}>NO.</span>
        <span style={{ flex: 1 }}>NOMENCLATURE</span>
        <span style={{ minWidth: '120px', textAlign: 'right', flexShrink: 0 }}>CADENCE</span>
      </div>
      {RATION_MANIFEST.map((item, i) => (
        <div
          key={item.no}
          style={{ ...base, display: 'flex', padding: '3px 12px', borderBottom: T.ruleHalf, background: i % 2 === 0 ? T.bg : '#f9f9f9' }}
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

function StatusLine({ state }: { state: RationSubscriptionState | null }) {
  const now = new Date()
  const nextIssueDate = state?.nextIssueDate
    ?? new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10)

  return (
    <div style={{ ...base, display: 'flex', flexWrap: 'wrap', gap: '24px', padding: '5px 12px', borderTop: T.rule, opacity: 0.5, fontSize: '11px', letterSpacing: '0.06em' }}>
      <span>STATUS: {state?.status ?? 'OPEN_TAB'}</span>
      <span>NEXT ISSUE: {nextIssueDate}</span>
      <span>LOAD: {RATION_MANIFEST.length} ITEMS</span>
      <span>REF: {LOT_FM_REF}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Basics() {
  const [subState, setSubState] = React.useState<RationSubscriptionState | null>(null)
  const [loading, setLoading]   = React.useState(false)
  const [fetchDone, setFetchDone] = React.useState(false)
  const [error, setError]       = React.useState<string | null>(null)
  const [showRosterForm, setShowRosterForm] = React.useState(false)

  // Fetch subscription status on mount
  React.useEffect(() => {
    fetch('/api/basics/status', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setSubState(data)
        setFetchDone(true)
      })
      .catch(() => setFetchDone(true))
  }, [])

  const status = subState?.status ?? 'OPEN_TAB'

  const handleSubscribe = () => {
    setShowRosterForm(true)
  }

  const handleRosterSubmit = async (roster: RationRoster) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/basics/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(roster),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Subscribe failed')
      setSubState((prev) => ({ ...(prev ?? { issueCount: 0, lastIssueDate: null, subscribedAt: new Date().toISOString(), standDownAt: null, roster: null }), ...data }))
      setShowRosterForm(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStandDown = async () => {
    if (!confirm('STAND DOWN? RATION WILL BE DROPPED. AI PLAN RETAINED. CONFIRM.')) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/basics/stand-down', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Stand down failed')
      setSubState((prev) => prev ? { ...prev, ...data, standDownAt: new Date().toISOString(), nextIssueDate: null } : null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: T.font, fontSize: T.size, lineHeight: T.lineH, color: T.ink, background: T.bg, minHeight: '100vh' }}>
      <style>{`.lot-basics { --lot-basics-rule: 2px solid #000; --lot-basics-font: ${T.font}; }`}</style>

      <div className="lot-basics" style={{ maxWidth: '760px', margin: '0 auto', border: T.rule }}>

        <Header status={status} />

        <FieldRow label="ISSUE PRICE"    value={`USD ${ISSUE_PRICE_USD}.00 / MONTH`} />
        <FieldRow label="LANDED COST"    value="WITHHELD" dim />
        <FieldRow label="MARGIN FLOOR"   value="≥ 60 %" dim />
        <FieldRow label="SUBSCRIPTION"   value="ADDITIVE TO USERSHIP AI PLAN" />
        <FieldRow label="OPEN TAB"       value="MANIFEST IS PUBLIC — NO GATE" />

        {/* ── UPGRADE CONTROL (Month 2) ───────────────────────────────── */}
        {fetchDone && (
          <>
            <SectionHeader>UPGRADE / STATE</SectionHeader>
            <UpgradeControl
              status={status}
              nextIssueDate={subState?.nextIssueDate ?? null}
              issueCount={subState?.issueCount ?? 0}
              subscribedAt={subState?.subscribedAt ?? null}
              standDownAt={subState?.standDownAt ?? null}
              onSubscribe={handleSubscribe}
              onStandDown={handleStandDown}
              loading={loading}
            />

            {showRosterForm && (status === 'OPEN_TAB' || status === 'STAND_DOWN') && (
              <>
                <SectionHeader>ROSTER INTAKE</SectionHeader>
                <RosterForm onSubmit={handleRosterSubmit} loading={loading} error={error} />
              </>
            )}

            {error && !showRosterForm && (
              <div style={{ ...base, padding: '5px 12px', borderTop: T.ruleHalf, color: '#c00', fontWeight: 700 }}>
                ERROR: {error}
              </div>
            )}
          </>
        )}

        {/* ── ISSUE LOG SCAFFOLD (Month 2) ────────────────────────────── */}
        {fetchDone && (status === 'ON_STRENGTH' || status === 'STEADY_STATE' || status === 'PENDING') && (
          <>
            <SectionHeader>ISSUE LOG</SectionHeader>
            <IssueLog
              entries={[]}
              nextIssueDate={subState?.nextIssueDate ?? null}
            />
          </>
        )}

        {/* ── MANIFEST LEDGER (Month 1) ────────────────────────────────── */}
        <SectionHeader>LOAD / {RATION_MANIFEST.length} ITEMS / CADENCE</SectionHeader>
        <ManifestTable />

        <SectionHeader>DOCTRINE</SectionHeader>
        <Doctrine />

        <StatusLine state={subState} />
      </div>
    </div>
  )
}
