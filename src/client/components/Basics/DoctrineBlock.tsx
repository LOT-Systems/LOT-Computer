/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { DOCTRINE_LINES, RATION_PRICE_USD } from './constants'

export const DoctrineBlock: React.FC = () => {
  return (
    <div className="lb-border" style={{ marginBottom: '1.5rem' }}>
      {/* Header */}
      <div className="lb-row lb-row-head" style={{ padding: '0' }}>
        <div className="lb-cell" style={{ flex: 1, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          DOCTRINE / LOT-FM-001
        </div>
        <div className="lb-cell lb-cell-mono" style={{ fontWeight: 900, fontSize: '1.125rem', letterSpacing: '0.05em' }}>
          USD {RATION_PRICE_USD}/MO
        </div>
      </div>
      {/* Doctrine lines */}
      {DOCTRINE_LINES.map((line, i) => (
        <div key={i} className="lb-doctrine">{line}</div>
      ))}
    </div>
  )
}
