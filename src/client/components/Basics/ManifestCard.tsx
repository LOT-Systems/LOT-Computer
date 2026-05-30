/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { RATION_MANIFEST } from './constants'
import type { BasicSubscription, BasicIssue } from '#shared/types'

type Props = {
  subscription: BasicSubscription
  issue: BasicIssue
  onClose: () => void
}

function getItemsForIssue(issueNumber: number) {
  const n = ((issueNumber - 1) % 6) + 1
  const quarterly   = [1, 3, 5].includes(n)
  const semiAnnual  = n === 1
  return RATION_MANIFEST.filter(item => {
    if (item.cadence === 'MONTHLY')       return true
    if (item.cadence === 'QUARTERLY')     return quarterly
    if (item.cadence === 'SEMI-ANNUALLY') return semiAnnual
    return false
  })
}

export const ManifestCard: React.FC<Props> = ({ subscription, issue, onClose }) => {
  const items = getItemsForIssue(issue.issueNumber)

  const handlePrint = () => window.print()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#ffffff',
        color: '#000000',
        fontFamily: "'Liberation Mono', 'Courier New', Courier, monospace",
        fontWeight: 700,
        zIndex: 1000,
        overflowY: 'auto',
        padding: '2rem',
      }}
    >
      {/* Print controls */}
      <div
        className="lb-no-print"
        style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}
      >
        <button className="lb-btn lb-btn-inv" onClick={handlePrint}>
          PRINT
        </button>
        <button className="lb-btn" onClick={onClose}>
          CLOSE
        </button>
      </div>

      {/* Card header */}
      <div style={{ border: '2px solid #000', marginBottom: '0' }}>
        <div
          className="lb-inv"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            borderBottom: '2px solid #000',
          }}
        >
          <span style={{ fontSize: '1.25rem', letterSpacing: '0.1em' }}>LOT® BASIC RATION</span>
          <span style={{ fontSize: '1.25rem' }}>
            ISSUE #{String(issue.issueNumber).padStart(3, '0')}
          </span>
        </div>

        {/* Subscriber info */}
        <div style={{ display: 'flex', borderBottom: '2px solid #000' }}>
          <div style={{ flex: 1, padding: '0.5rem 0.75rem', borderRight: '1px solid #000', fontSize: '0.875rem' }}>
            <div style={{ opacity: 0.5, fontSize: '0.75rem', marginBottom: '0.25rem' }}>ISSUED TO</div>
            <div>{subscription.shippingName ?? '—'}</div>
            <div>{subscription.shippingLine1 ?? ''}</div>
            {subscription.shippingLine2 && <div>{subscription.shippingLine2}</div>}
            <div>
              {[subscription.shippingCity, subscription.shippingState, subscription.shippingZip]
                .filter(Boolean).join(', ')}
            </div>
            <div>{subscription.shippingCountry ?? 'US'}</div>
          </div>
          <div style={{ width: '12rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>
            <div style={{ opacity: 0.5, fontSize: '0.75rem', marginBottom: '0.25rem' }}>PERIOD</div>
            <div>{issue.periodLabel ?? '—'}</div>
            <div style={{ marginTop: '0.5rem', opacity: 0.5, fontSize: '0.75rem' }}>ISSUE DATE</div>
            <div>
              {issue.issuedAt
                ? new Date(issue.issuedAt).toISOString().slice(0, 10)
                : '—'}
            </div>
          </div>
        </div>

        {/* Manifest table */}
        <div>
          {/* Column heads */}
          <div
            style={{
              display: 'flex',
              background: '#000',
              color: '#fff',
              borderBottom: '2px solid #000',
              fontSize: '0.75rem',
              letterSpacing: '0.06em',
            }}
          >
            <div style={{ width: '3rem', padding: '0.25rem 0.75rem', borderRight: '1px solid #fff' }}>SEQ</div>
            <div style={{ flex: 1,       padding: '0.25rem 0.75rem', borderRight: '1px solid #fff' }}>NOMENCLATURE</div>
            <div style={{ width: '4rem', padding: '0.25rem 0.75rem', borderRight: '1px solid #fff' }}>QTY</div>
            <div style={{ width: '8rem', padding: '0.25rem 0.75rem' }}>UNIT</div>
          </div>
          {items.map((item, i) => (
            <div
              key={item.seq}
              style={{
                display: 'flex',
                borderBottom: i < items.length - 1 ? '1px solid #000' : 'none',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ width: '3rem', padding: '0.1875rem 0.75rem', borderRight: '1px solid #000', fontVariantNumeric: 'tabular-nums' }}>{item.seq}</div>
              <div style={{ flex: 1,       padding: '0.1875rem 0.75rem', borderRight: '1px solid #000' }}>{item.nomenclature}</div>
              <div style={{ width: '4rem', padding: '0.1875rem 0.75rem', borderRight: '1px solid #000' }}>{item.qty}</div>
              <div style={{ width: '8rem', padding: '0.1875rem 0.75rem' }}>{item.unit}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.375rem 0.75rem',
            borderTop: '2px solid #000',
            fontSize: '0.75rem',
            opacity: 0.6,
          }}
        >
          <span>LOT-FM-001 / BASIC RATION MANIFEST</span>
          <span>{items.length} ITEMS · USD 100/MO · MARGIN ≥60%</span>
        </div>
      </div>
    </div>
  )
}
