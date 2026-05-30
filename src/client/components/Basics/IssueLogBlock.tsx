/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO©
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import type { BasicIssue } from '#shared/types'

type Props = {
  issues: BasicIssue[]
}

const STATUS_LABELS: Record<BasicIssue['status'], string> = {
  SCHEDULED: 'SCHED',
  PACKED:    'PACKED',
  SHIPPED:   'SHIPPED',
  DELIVERED: 'DLVRD',
  CANCELLED: 'CANC',
}

export const IssueLogBlock: React.FC<Props> = ({ issues }) => {
  if (!issues.length) return null

  return (
    <div className="lb-border" style={{ marginBottom: '1.5rem' }}>
      <div className="lb-row lb-row-head">
        <div className="lb-cell" style={{ width: '4.5rem', flexShrink: 0, fontSize: '0.75rem' }}>ISSUE</div>
        <div className="lb-cell" style={{ width: '6rem', flexShrink: 0, fontSize: '0.75rem' }}>DATE</div>
        <div className="lb-cell" style={{ flex: 1, fontSize: '0.75rem' }}>PERIOD</div>
        <div className="lb-cell" style={{ width: '5rem', flexShrink: 0, fontSize: '0.75rem' }}>ITEMS</div>
        <div className="lb-cell" style={{ width: '5.5rem', flexShrink: 0, fontSize: '0.75rem' }}>STATUS</div>
        <div className="lb-cell" style={{ width: '8rem', flexShrink: 0, fontSize: '0.75rem' }}>TRACKING</div>
      </div>
      {[...issues].reverse().map((issue) => (
        <div key={issue.id} className="lb-row">
          <div className="lb-cell lb-cell-mono" style={{ width: '4.5rem', flexShrink: 0, fontSize: '0.875rem' }}>
            #{String(issue.issueNumber).padStart(3, '0')}
          </div>
          <div className="lb-cell lb-cell-mono" style={{ width: '6rem', flexShrink: 0, fontSize: '0.875rem' }}>
            {issue.issuedAt ? new Date(issue.issuedAt).toISOString().slice(0, 10) : '—'}
          </div>
          <div className="lb-cell" style={{ flex: 1, fontSize: '0.875rem' }}>
            {issue.periodLabel ?? '—'}
          </div>
          <div className="lb-cell lb-cell-mono" style={{ width: '5rem', flexShrink: 0, fontSize: '0.875rem' }}>
            {issue.itemCount ?? '—'}
          </div>
          <div className="lb-cell" style={{ width: '5.5rem', flexShrink: 0, fontSize: '0.75rem' }}>
            <span
              className={issue.status === 'DELIVERED' ? 'lb-badge lb-badge-inv' : 'lb-badge'}
              style={{ fontSize: '0.6875rem' }}
            >
              {STATUS_LABELS[issue.status]}
            </span>
          </div>
          <div
            className="lb-cell lb-cell-mono"
            style={{ width: '8rem', flexShrink: 0, fontSize: '0.75rem', opacity: 0.7 }}
          >
            {issue.trackingNumber ?? '—'}
          </div>
        </div>
      ))}
    </div>
  )
}
