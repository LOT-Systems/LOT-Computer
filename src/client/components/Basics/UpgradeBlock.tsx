/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { RATION_STATES, RationState } from './constants'
import type { BasicSubscription } from '#shared/types'

type Props = {
  subscription: BasicSubscription | null
  onUpgrade: () => void
  onStandDown: () => void
  isLoading: boolean
}

const STATE_LABELS: Record<RationState, string> = {
  USERSHIP:     'USERSHIP — AI PLAN ONLY. BASIC RATION NOT ISSUED.',
  PENDING:      'PENDING — ORDER PROCESSING. AWAITING ROSTER INTAKE.',
  ON_STRENGTH:  'ON STRENGTH — RATION ACTIVE. FIRST ISSUE SCHEDULED.',
  STEADY_STATE: 'STEADY STATE — RATION ISSUING ON CADENCE.',
}

const STATE_FLOW: RationState[] = [
  RATION_STATES.USERSHIP,
  RATION_STATES.PENDING,
  RATION_STATES.ON_STRENGTH,
  RATION_STATES.STEADY_STATE,
]

export const UpgradeBlock: React.FC<Props> = ({
  subscription,
  onUpgrade,
  onStandDown,
  isLoading,
}) => {
  const state: RationState = subscription?.status ?? RATION_STATES.USERSHIP
  const currentIdx = STATE_FLOW.indexOf(state)

  return (
    <div className="lb-border" style={{ marginBottom: '1.5rem' }}>
      {/* Header */}
      <div className="lb-row lb-row-head">
        <div className="lb-cell" style={{ flex: 1, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          STRENGTH STATUS
        </div>
        <div className="lb-cell">
          <span className="lb-badge lb-badge-inv">{state}</span>
        </div>
      </div>

      {/* State description */}
      <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderBottom: 'var(--lb-rule-thin)' }}>
        {STATE_LABELS[state]}
      </div>

      {/* State pipeline */}
      <div style={{ display: 'flex', borderBottom: 'var(--lb-rule-thin)' }}>
        {STATE_FLOW.map((s, i) => (
          <div
            key={s}
            className={i <= currentIdx ? 'lb-inv' : ''}
            style={{
              flex: 1,
              padding: '0.25rem 0.5rem',
              fontSize: '0.6875rem',
              letterSpacing: '0.04em',
              borderRight: i < STATE_FLOW.length - 1 ? '1px solid' : 'none',
              textAlign: 'center',
              opacity: i < currentIdx ? 0.6 : 1,
            }}
          >
            {s.replace('_', ' ')}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {state === RATION_STATES.USERSHIP && (
          <button
            className="lb-btn lb-btn-inv"
            onClick={onUpgrade}
            disabled={isLoading}
          >
            {isLoading ? 'PROCESSING…' : 'UPGRADE — GO ON STRENGTH'}
          </button>
        )}
        {(state === RATION_STATES.ON_STRENGTH || state === RATION_STATES.STEADY_STATE) && (
          <button
            className="lb-btn"
            onClick={onStandDown}
            disabled={isLoading}
          >
            {isLoading ? 'PROCESSING…' : 'STAND DOWN — DROP RATION'}
          </button>
        )}
        {state === RATION_STATES.PENDING && (
          <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>
            COMPLETE ROSTER INTAKE BELOW TO ACTIVATE ISSUE.
          </span>
        )}
        {(state === RATION_STATES.ON_STRENGTH || state === RATION_STATES.STEADY_STATE) && (
          <span style={{ fontSize: '0.75rem', opacity: 0.5, marginLeft: 'auto' }}>
            STAND DOWN DROPS RATION. AI PLAN RETAINED.
          </span>
        )}
      </div>
    </div>
  )
}
