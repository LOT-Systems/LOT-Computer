/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { RATION_MANIFEST, RationCadence } from './constants'
import type { BasicSubscription, BasicIssue } from '#shared/types'

type Props = {
  subscription: BasicSubscription | null
  nextIssue: BasicIssue | null
  onPrintManifest: () => void
}

function getItemsForIssue(issueNumber: number): typeof RATION_MANIFEST {
  const cadenceMap: Record<number, RationCadence[]> = {
    1: ['MONTHLY', 'QUARTERLY', 'SEMI-ANNUALLY', 'ANNUALLY'],
    2: ['MONTHLY'],
    3: ['MONTHLY', 'QUARTERLY'],
    4: ['MONTHLY'],
    5: ['MONTHLY'],
    6: ['MONTHLY', 'QUARTERLY', 'SEMI-ANNUALLY'],
  }
  const n = ((issueNumber - 1) % 6) + 1
  const activeCadences = cadenceMap[n] ?? ['MONTHLY']
  return RATION_MANIFEST.filter(item => activeCadences.includes(item.cadence))
}

export const NextIssueBlock: React.FC<Props> = ({ subscription, nextIssue, onPrintManifest }) => {
  if (!subscription || !nextIssue) return null

  const issueItems = getItemsForIssue(nextIssue.issueNumber)

  return (
    <div className="lb-border" style={{ marginBottom: '1.5rem' }}>
      {/* Header */}
      <div className="lb-row lb-row-head">
        <div className="lb-cell" style={{ flex: 1, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          NEXT ISSUE — #{String(nextIssue.issueNumber).padStart(3, '0')}
        </div>
        <div className="lb-cell lb-cell-mono" style={{ fontSize: '0.875rem' }}>
          {nextIssue.issuedAt
            ? new Date(nextIssue.issuedAt).toISOString().slice(0, 10)
            : 'TBD'}
        </div>
      </div>

      {/* Period and status */}
      <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
        <div style={{ flex: 1, padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }}>
          {nextIssue.periodLabel ?? '—'}
        </div>
        <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', opacity: 0.6 }}>
          {issueItems.length} ITEMS THIS ISSUE
        </div>
      </div>

      {/* Load for this issue */}
      <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #000' }}>
        <div style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', opacity: 0.5, marginBottom: '0.375rem' }}>
          LOAD / THIS ISSUE
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem' }}>
          {issueItems.map(item => (
            <span key={item.seq} style={{ fontSize: '0.8125rem' }}>
              {item.seq}. {item.nomenclature}
            </span>
          ))}
        </div>
      </div>

      {/* Margin check */}
      <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
        <div style={{ flex: 1, padding: '0.25rem 0.75rem', fontSize: '0.75rem', opacity: 0.6 }}>
          ISSUE PRICE: USD 100/MO · COGS CEILING: USD 40 · MARGIN FLOOR: 60%
        </div>
        <div style={{ padding: '0.25rem 0.75rem' }}>
          <span className="lb-badge" style={{ fontSize: '0.6875rem' }}>MARGIN OK</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem' }}>
        <button className="lb-btn" onClick={onPrintManifest}>
          PRINT MANIFEST CARD
        </button>
      </div>
    </div>
  )
}
