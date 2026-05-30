/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { RATION_MANIFEST, RationCadence } from './constants'

const CADENCE_ORDER: RationCadence[] = ['MONTHLY', 'QUARTERLY', 'SEMI-ANNUALLY', 'ANNUALLY']

export const ManifestLedger: React.FC = () => {
  return (
    <div className="lb-border" style={{ overflowX: 'auto' }}>
      {/* Column headers */}
      <div className="lb-row lb-row-head">
        <div className="lb-cell lb-cell-mono" style={{ width: '3rem', flexShrink: 0 }}>SEQ</div>
        <div className="lb-cell" style={{ flex: 1, minWidth: '20rem' }}>NOMENCLATURE</div>
        <div className="lb-cell lb-cell-mono" style={{ width: '5.5rem', flexShrink: 0 }}>QTY</div>
        <div className="lb-cell lb-cell-mono" style={{ width: '8rem', flexShrink: 0 }}>UNIT</div>
        <div className="lb-cell lb-cell-mono" style={{ width: '9rem', flexShrink: 0 }}>CADENCE</div>
        <div className="lb-cell" style={{ width: '7rem', flexShrink: 0 }}>CAT</div>
      </div>
      {/* Items */}
      {[...RATION_MANIFEST].sort((a, b) =>
        CADENCE_ORDER.indexOf(a.cadence) - CADENCE_ORDER.indexOf(b.cadence) ||
        parseInt(a.seq) - parseInt(b.seq)
      ).map((item) => (
        <div key={item.seq} className="lb-row">
          <div className="lb-cell lb-cell-mono" style={{ width: '3rem', flexShrink: 0 }}>{item.seq}</div>
          <div className="lb-cell" style={{ flex: 1, minWidth: '20rem' }}>{item.nomenclature}</div>
          <div className="lb-cell lb-cell-mono" style={{ width: '5.5rem', flexShrink: 0 }}>{item.qty}</div>
          <div className="lb-cell lb-cell-mono" style={{ width: '8rem', flexShrink: 0 }}>{item.unit}</div>
          <div className="lb-cell lb-cell-mono" style={{ width: '9rem', flexShrink: 0 }}>{item.cadence}</div>
          <div className="lb-cell" style={{ width: '7rem', flexShrink: 0, fontSize: '0.75rem', opacity: 0.6 }}>{item.category}</div>
        </div>
      ))}
      {/* Footer */}
      <div className="lb-row lb-row-head" style={{ justifyContent: 'flex-end' }}>
        <div className="lb-cell lb-cell-mono" style={{ width: 'auto', fontSize: '0.75rem', opacity: 0.8 }}>
          {RATION_MANIFEST.length} ITEMS TOTAL · COGS WITHHELD
        </div>
      </div>
    </div>
  )
}
