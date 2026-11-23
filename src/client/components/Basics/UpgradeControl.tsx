/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / UPGRADE STATE MACHINE
 * USERSHIP/AI → PENDING → ON_STRENGTH → STEADY_STATE
 *              ↑                       ↓
 *              └──────── STAND_DOWN ───┘
 */

import * as React from 'react'
import { RationViewStatus } from './types'
import { T, base, inv, row, button } from './tokens'

type Props = {
  status: RationViewStatus
  eligible: boolean
  billing: 'NONE' | 'AWAITING_PROVIDER' | 'ACTIVE'
  nextIssueDate: string | null
  issueCount: number
  subscribedAt: string | null
  standDownAt: string | null
  onSubscribe: () => void
  onStandDown: () => void
  loading: boolean
}

export const STATUS_LABELS: Record<RationViewStatus, string> = {
  OPEN_TAB: 'USERSHIP / AI — NOT ON STRENGTH',
  PENDING: 'PENDING — FIRST ISSUE IN QUEUE',
  ON_STRENGTH: 'ON STRENGTH',
  STEADY_STATE: 'ON STRENGTH / STEADY STATE',
  STAND_DOWN: 'STOOD DOWN — RATION DROPPED, AI RETAINED',
}

const PIPELINE: RationViewStatus[] = ['OPEN_TAB', 'PENDING', 'ON_STRENGTH', 'STEADY_STATE']
const PIPELINE_LABEL: Record<string, string> = {
  OPEN_TAB: 'USERSHIP/AI',
  PENDING: 'PENDING',
  ON_STRENGTH: 'ON STRENGTH',
  STEADY_STATE: 'STEADY STATE',
}

function StateRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={row}>
      <span style={{ minWidth: T.labelCh, flexShrink: 0 }}>{label}</span>
      <span>{value ?? '—'}</span>
    </div>
  )
}

export function UpgradeControl({
  status,
  eligible,
  billing,
  nextIssueDate,
  issueCount,
  subscribedAt,
  standDownAt,
  onSubscribe,
  onStandDown,
  loading,
}: Props) {
  const canSubscribe = eligible && (status === 'OPEN_TAB' || status === 'STAND_DOWN')
  const canStandDown = status === 'ON_STRENGTH' || status === 'STEADY_STATE' || status === 'PENDING'
  const stage = status === 'STAND_DOWN' ? 'OPEN_TAB' : status

  return (
    <div style={base}>
      {/* Pipeline: current stage inverted, all others plain. */}
      <div style={{ ...base, display: 'flex', flexWrap: 'wrap', borderBottom: T.rule }}>
        {PIPELINE.map((s, i) => (
          <span
            key={s}
            style={{
              ...(s === stage ? inv : base),
              padding: '4px 1ch',
              borderRight: i < PIPELINE.length - 1 ? T.rule : 'none',
            }}
          >
            {PIPELINE_LABEL[s]}
          </span>
        ))}
      </div>

      <StateRow label="STATE" value={STATUS_LABELS[status]} />
      {nextIssueDate && <StateRow label="NEXT ISSUE" value={nextIssueDate} />}
      {issueCount > 0 && <StateRow label="ISSUES RECEIVED" value={String(issueCount).padStart(3, '0')} />}
      {subscribedAt && <StateRow label="ON ROSTER SINCE" value={subscribedAt.slice(0, 10)} />}
      {standDownAt && <StateRow label="STOOD DOWN" value={standDownAt.slice(0, 10)} />}
      {canStandDown && (
        <StateRow
          label="BILLING"
          value={billing === 'ACTIVE' ? 'USD 100.00 / MO — ADDITIVE' : 'AWAITING BILLING PROVIDER — NOT CHARGED'}
        />
      )}

      <div style={{ ...base, display: 'flex', gap: '2ch', padding: '8px 1ch', borderBottom: T.rule, flexWrap: 'wrap' }}>
        {canSubscribe && (
          <button onClick={onSubscribe} disabled={loading} style={button(true, loading)}>
            {loading ? 'PROCESSING' : status === 'STAND_DOWN' ? 'UPGRADE — RETURN TO STRENGTH' : 'UPGRADE — GO ON STRENGTH / USD 100/MO'}
          </button>
        )}
        {canStandDown && (
          <button onClick={onStandDown} disabled={loading} style={button(false, loading)}>
            {loading ? 'PROCESSING' : 'STAND DOWN'}
          </button>
        )}
        {!eligible && !canStandDown && (
          <span>UPGRADE REQUIRES USERSHIP (AI PLAN). LEDGER IS OPEN TO ALL.</span>
        )}
      </div>
    </div>
  )
}
