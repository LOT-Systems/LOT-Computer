/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / BASICS TAB — the hardware/physical part of the LOT® System.
 * M1  LEDGER & DOCTRINE   — OPEN TAB, read-only, public at /basics
 * M2  UPGRADE & ROSTER    — USERSHIP/AI → PENDING → ON STRENGTH → STEADY STATE
 * M3  ISSUE & FULFILLMENT — issue log accrues, NEXT ISSUE advances
 */

import * as React from 'react'
import {
  RATION_MANIFEST,
  ISSUE_PRICE_USD,
  LOT_FM_REF,
  firstOfNextMonth,
  RationCadence,
} from '#shared/basics'
import { UpgradeControl, STATUS_LABELS } from './UpgradeControl'
import { RosterForm } from './RosterForm'
import { IssueLog } from './IssueLog'
import { RationSubscriptionState, RationRoster } from './types'
import { T, base, inv, row, button } from './tokens'

const DOCTRINE = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'THE MEMBER IS ON STRENGTH.',
  'LOAD IS FIXED. CADENCE IS FIXED. PRICE IS FIXED.',
  'NEED OVER PREFERENCE. NO CURATION. NO UPSELL.',
  'THE LEDGER IS THE MARKETING.',
  'STAND DOWN AT ANY TIME. RATION DROPS. AI PLAN RETAINED.',
]

const CADENCE_ORDER: RationCadence[] = ['MONTHLY', 'QUARTERLY', 'SEMI-ANNUAL', 'ANNUAL']

function Section({ title, right }: { title: string; right?: string }) {
  return (
    <div style={{ ...inv, display: 'flex', justifyContent: 'space-between', gap: '2ch', padding: '4px 1ch' }}>
      <span>{title}</span>
      {right && <span>{right}</span>}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={row}>
      <span style={{ minWidth: T.labelCh, flexShrink: 0 }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function Ledger() {
  const counts = CADENCE_ORDER.map((c) => ({
    c,
    n: RATION_MANIFEST.filter((i) => i.cadence === c).length,
  })).filter((x) => x.n > 0)
  return (
    <div>
      <div style={{ ...row, borderBottom: T.rule }}>
        <span style={{ width: '5ch', flexShrink: 0 }}>NO.</span>
        <span style={{ flex: 1 }}>NOMENCLATURE</span>
        <span style={{ width: '12ch', flexShrink: 0, textAlign: 'right' }}>CADENCE</span>
      </div>
      {RATION_MANIFEST.map((item) => (
        <div key={item.no} style={row}>
          <span style={{ width: '5ch', flexShrink: 0 }}>{item.no}</span>
          <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{item.nomenclature}</span>
          <span style={{ width: '12ch', flexShrink: 0, textAlign: 'right' }}>{item.cadence}</span>
        </div>
      ))}
      <div style={row}>
        <span style={{ minWidth: T.labelCh, flexShrink: 0 }}>COUNT</span>
        <span>{counts.map((x) => `${x.c} ${x.n}`).join(' / ')}</span>
      </div>
      <div style={row}>
        <span style={{ minWidth: T.labelCh, flexShrink: 0 }}>COGS</span>
        <span>WITHHELD</span>
      </div>
    </div>
  )
}

function StatusLine({ status, next }: { status: string; next: string }) {
  return (
    <div style={{ ...inv, display: 'flex', flexWrap: 'wrap', columnGap: '2ch', padding: '4px 1ch' }}>
      <span>STATUS {status}</span>
      <span>NEXT ISSUE {next}</span>
      <span>LOAD {RATION_MANIFEST.length}</span>
      <span>REF {LOT_FM_REF}</span>
    </div>
  )
}

type Props = {
  /** Public OPEN TAB for strangers: no fetch, no controls. */
  publicMode?: boolean
}

export function Basics({ publicMode = false }: Props) {
  const [sub, setSub] = React.useState<RationSubscriptionState | null>(null)
  const [fetchDone, setFetchDone] = React.useState(publicMode)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [mode, setMode] = React.useState<'idle' | 'roster' | 'confirm-stand-down'>('idle')

  const load = React.useCallback(() => {
    return fetch('/api/basics/status', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setSub(data))
      .catch(() => {})
      .finally(() => setFetchDone(true))
  }, [])

  React.useEffect(() => {
    if (!publicMode) load()
  }, [publicMode, load])

  const status = sub?.status ?? 'OPEN_TAB'

  const post = async (path: string, body?: unknown) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'REQUEST FAILED')
      await load()
      setMode('idle')
    } catch (e: any) {
      setError(String(e.message || e).toUpperCase())
    } finally {
      setLoading(false)
    }
  }

  const onRoster = (roster: RationRoster) => post('/api/basics/subscribe', roster)
  const onStandDown = () => post('/api/basics/stand-down')

  const active = status === 'PENDING' || status === 'ON_STRENGTH' || status === 'STEADY_STATE'

  return (
    <div style={{ ...base, width: '100%' }}>
      <div style={{ ...base, maxWidth: '80ch', border: T.rule }}>
        <div style={{ ...inv, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2ch', padding: '6px 1ch' }}>
          <span>LOT® BASICS / {LOT_FM_REF}</span>
          <span>{active ? 'ON STRENGTH' : 'OPEN TAB'}</span>
        </div>

        <Field label="ISSUE" value="CIVILIAN RATION / 23 ITEMS" />
        <Field label="PRICE" value={`USD ${ISSUE_PRICE_USD}.00 / MONTH`} />
        <Field label="TERMS" value="ADDITIVE TO USERSHIP (AI PLAN)" />
        <Field label="CADENCE" value="MONTHLY / 1ST OF MONTH" />
        <Field label="EXIT" value="STAND DOWN AT ANY TIME" />

        {!publicMode && fetchDone && (
          <>
            <Section title="UPGRADE" right={STATUS_LABELS[status]} />
            <UpgradeControl
              status={status}
              eligible={sub?.eligible ?? false}
              billing={sub?.billing ?? 'NONE'}
              nextIssueDate={sub?.nextIssueDate ?? null}
              issueCount={sub?.issueCount ?? 0}
              subscribedAt={sub?.subscribedAt ?? null}
              standDownAt={sub?.standDownAt ?? null}
              onSubscribe={() => setMode('roster')}
              onStandDown={() => setMode('confirm-stand-down')}
              loading={loading}
            />

            {mode === 'confirm-stand-down' && (
              <div style={{ ...base, padding: '8px 1ch', borderBottom: T.rule }}>
                <div style={{ marginBottom: '8px' }}>CONFIRM STAND DOWN. RATION DROPS. AI PLAN RETAINED.</div>
                <div style={{ display: 'flex', gap: '2ch', flexWrap: 'wrap' }}>
                  <button onClick={onStandDown} disabled={loading} style={button(true, loading)}>
                    {loading ? 'PROCESSING' : 'CONFIRM — STAND DOWN'}
                  </button>
                  <button onClick={() => setMode('idle')} disabled={loading} style={button(false, loading)}>
                    HOLD
                  </button>
                </div>
              </div>
            )}

            {mode === 'roster' && (status === 'OPEN_TAB' || status === 'STAND_DOWN') && (
              <>
                <Section title="ROSTER INTAKE" right="SIZING / SHIPPING / CADENCE" />
                <RosterForm onSubmit={onRoster} onCancel={() => setMode('idle')} loading={loading} error={error} />
              </>
            )}

            {error && mode !== 'roster' && (
              <div style={{ ...inv, padding: '4px 1ch', borderBottom: T.rule }}>ERROR: {error}</div>
            )}

            {(active || (sub?.issues?.length ?? 0) > 0) && (
              <>
                <Section title="ISSUE LOG" right={`${String(sub?.issueCount ?? 0).padStart(3, '0')} ISSUED`} />
                <IssueLog entries={sub?.issues ?? []} nextIssueDate={sub?.nextIssueDate ?? null} />
              </>
            )}
          </>
        )}

        <Section title="LOAD" right={`${RATION_MANIFEST.length} ITEMS`} />
        <Ledger />

        <Section title="DOCTRINE" />
        <div style={{ ...base, padding: '6px 1ch', borderBottom: T.rule }}>
          {DOCTRINE.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>

        {publicMode && (
          <div style={{ ...base, padding: '6px 1ch', borderBottom: T.rule }}>
            UPGRADE FROM USERSHIP. <a href="/" style={{ ...base, textDecoration: 'underline' }}>REPORT TO LOT</a>
          </div>
        )}

        <StatusLine status={status.replace('_', ' ')} next={sub?.nextIssueDate ?? firstOfNextMonth()} />
      </div>
    </div>
  )
}
