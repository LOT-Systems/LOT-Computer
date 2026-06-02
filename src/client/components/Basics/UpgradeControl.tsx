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
import { RationStatus } from './types'

const T = {
  ink:  '#000000',
  bg:   '#ffffff',
  rule: '2px solid #000000',
  ruleHalf: '1px solid #000000',
  font: "'Liberation Mono', 'Lucida Console', 'Courier New', Courier, monospace",
  size: '13px',
  lineH: '1.5',
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

const inv: React.CSSProperties = { ...base, background: T.ink, color: T.bg }

type Props = {
  status: RationStatus | 'OPEN_TAB'
  nextIssueDate: string | null
  issueCount: number
  subscribedAt: string | null
  standDownAt: string | null
  onSubscribe: () => void
  onStandDown: () => void
  loading: boolean
}

const STATUS_LABELS: Record<RationStatus | 'OPEN_TAB', string> = {
  OPEN_TAB:     'OPEN TAB — NOT SUBSCRIBED',
  PENDING:      'PENDING — FIRST ISSUE IN QUEUE',
  ON_STRENGTH:  'ON STRENGTH',
  STEADY_STATE: 'ON STRENGTH / STEADY STATE',
  STAND_DOWN:   'STOOD DOWN — RATION INACTIVE',
}

export function StatusBadge({ status }: { status: RationStatus | 'OPEN_TAB' }) {
  const isActive = status === 'ON_STRENGTH' || status === 'STEADY_STATE'
  const isPending = status === 'PENDING'

  return (
    <div style={{
      ...base,
      display: 'inline-block',
      padding: '3px 10px',
      border: T.rule,
      fontWeight: 700,
      letterSpacing: '0.08em',
      background: isActive ? T.ink : T.bg,
      color: isActive ? T.bg : T.ink,
      opacity: status === 'STAND_DOWN' ? 0.45 : 1,
    }}>
      {isPending && <span style={{ marginRight: '8px', animation: 'none' }}>▪</span>}
      {STATUS_LABELS[status]}
    </div>
  )
}

type StateRowProps = { label: string; value: React.ReactNode; dim?: boolean }
function StateRow({ label, value, dim }: StateRowProps) {
  return (
    <div style={{ ...base, display: 'flex', gap: '24px', padding: '4px 12px', borderBottom: T.ruleHalf, opacity: dim ? 0.45 : 1 }}>
      <span style={{ minWidth: '168px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value ?? '—'}</span>
    </div>
  )
}

export function UpgradeControl({ status, nextIssueDate, issueCount, subscribedAt, standDownAt, onSubscribe, onStandDown, loading }: Props) {
  const canSubscribe = status === 'OPEN_TAB' || status === 'STAND_DOWN'
  const canStandDown = status === 'ON_STRENGTH' || status === 'STEADY_STATE' || status === 'PENDING'

  return (
    <div style={{ ...base }}>
      {/* Current state header */}
      <div style={{ ...base, padding: '6px 12px', borderBottom: T.rule }}>
        <StatusBadge status={status} />
      </div>

      {/* State fields */}
      <StateRow label="SUBSCRIPTION STATUS" value={STATUS_LABELS[status]} />
      {nextIssueDate && <StateRow label="NEXT ISSUE DATE" value={nextIssueDate} />}
      {issueCount > 0 && <StateRow label="ISSUES RECEIVED" value={String(issueCount)} />}
      {subscribedAt && <StateRow label="SUBSCRIBED" value={new Date(subscribedAt).toISOString().slice(0, 10)} dim />}
      {standDownAt && <StateRow label="STOOD DOWN" value={new Date(standDownAt).toISOString().slice(0, 10)} dim />}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', padding: '10px 12px', borderTop: T.rule, flexWrap: 'wrap' }}>
        {canSubscribe && (
          <button
            onClick={onSubscribe}
            disabled={loading}
            style={{
              ...inv,
              padding: '7px 20px',
              border: T.rule,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              opacity: loading ? 0.5 : 1,
              letterSpacing: '0.08em',
            }}
          >
            {loading ? 'PROCESSING...' : (status === 'STAND_DOWN' ? '↑ RE-SUBSCRIBE' : '↑ JOIN STRENGTH — USD 100/MO')}
          </button>
        )}
        {canStandDown && (
          <button
            onClick={onStandDown}
            disabled={loading}
            style={{
              ...base,
              padding: '7px 20px',
              border: T.rule,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 400,
              opacity: loading ? 0.5 : 0.6,
              letterSpacing: '0.06em',
            }}
          >
            {loading ? 'PROCESSING...' : '↓ STAND DOWN'}
          </button>
        )}
      </div>

      {status === 'PENDING' && (
        <div style={{ ...base, padding: '6px 12px', borderTop: T.ruleHalf, opacity: 0.5, fontSize: '11px' }}>
          RATION IS BEING PREPARED FOR FIRST ISSUE. NO ACTION REQUIRED.
        </div>
      )}
    </div>
  )
}
