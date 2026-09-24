/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useBasicsManifest } from '#client/queries'
import { useDocumentTitle } from '#client/utils/hooks'
import { BASIC_RATION_MANIFEST, BASIC_RATION_PRICE_USD, RationItem } from '#shared/constants'

/**
 * LOT-FM-001 — BASIC (RATION) MODULE, MONTH 1: LEDGER & DOCTRINE.
 *
 * House style for this surface is deliberately not the app's normal Tailwind
 * theme (no acc/bac tokens, no rounded corners, no color). This is the
 * OPEN TAB: a stranger reads what LOT issues and on what terms. Read-only.
 * Inversion-only hierarchy, 2px rules, fixed character grid, IBM 3270
 * register. Manifest fetched from GET /api/public/basics; the shared-constant
 * import is the same-request fallback so the tab still renders the ledger
 * before/without a network round trip.
 */

const MONO_STACK =
  '"Liberation Mono", "DejaVu Sans Mono", Menlo, Consolas, "Courier New", monospace'

const grid: React.CSSProperties = {
  fontFamily: MONO_STACK,
  fontWeight: 700,
  background: '#fff',
  color: '#000',
  border: '2px solid #000',
  borderRadius: 0,
  letterSpacing: 0,
}

const rule: React.CSSProperties = {
  borderTop: '2px solid #000',
  margin: 0,
}

const CategoryHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr style={{ background: '#000' }}>
    <td colSpan={3} style={{ padding: '6px 10px', color: '#fff' }}>
      {children}
    </td>
  </tr>
)

export function Basics() {
  useDocumentTitle('Basics')

  const { data, isLoading, isError } = useBasicsManifest()

  // Fall back to the shared constant so the ledger is never blank — the
  // manifest is meant to be readable even before the network round trip
  // resolves, or if it fails outright. COGS never appears either way.
  const manifest: RationItem[] = data?.manifest ?? BASIC_RATION_MANIFEST
  const priceUsd = data?.priceUsd ?? BASIC_RATION_PRICE_USD
  const itemCount = data?.itemCount ?? BASIC_RATION_MANIFEST.length

  const byCategory = React.useMemo(() => {
    const order: RationItem['category'][] = ['HYGIENE', 'APPAREL', 'HOUSEHOLD', 'FIELD-SUNDRY']
    return order
      .map((cat) => ({ cat, items: manifest.filter((m) => m.category === cat) }))
      .filter((g) => g.items.length > 0)
  }, [manifest])

  const statusLine = isError
    ? 'STATUS: LEDGER SERVED FROM LOCAL MANIFEST — LIVE FEED UNREACHABLE'
    : isLoading
    ? 'STATUS: READING LEDGER...'
    : data?.status ?? 'STATUS: SYSTEM OPEN — READ-ONLY — MONTH 1 OF 3'

  return (
    <div style={{ ...grid, padding: 0, maxWidth: '760px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ padding: '16px 16px 12px', background: '#000', color: '#fff' }}>
        <div style={{ fontSize: '12px', opacity: 0.85 }}>LOT-FM-001 // BASIC RATION MODULE</div>
        <div style={{ fontSize: '22px', marginTop: '4px' }}>BASICS</div>
      </div>

      {/* STATUS LINE */}
      <div style={{ padding: '8px 16px', fontSize: '12px', borderBottom: '2px solid #000' }}>
        {statusLine}
      </div>

      {/* DOCTRINE */}
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '11px', marginBottom: '6px' }}>DOCTRINE</div>
        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
          {data?.doctrine ??
            'LOT-FM-001. Issue, not sale. Fixed monthly ration of 23 lines across hygiene, apparel, household, and field-sundry categories, shipped on the cadence printed against each line. This ledger is the full manifest — no undisclosed substitutions, no marketing layer between what is public and what is issued.'}
        </div>
      </div>

      <hr style={rule} />

      {/* PRICE LINE */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <div style={{ fontSize: '13px' }}>ISSUE PRICE</div>
        <div style={{ fontSize: '20px' }}>
          USD {priceUsd}.00 / MONTH
        </div>
      </div>

      <hr style={rule} />

      {/* LEDGER */}
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '11px', marginBottom: '10px' }}>
          MANIFEST — {itemCount} LINES — COST DATA WITHHELD
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '4px 8px', width: '72px' }}>LINE</th>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>NOMENCLATURE</th>
              <th style={{ textAlign: 'right', padding: '4px 8px', width: '110px' }}>CADENCE</th>
            </tr>
          </thead>
          <tbody>
            {byCategory.map((group) => (
              <React.Fragment key={group.cat}>
                <CategoryHead>{group.cat}</CategoryHead>
                {group.items.map((item) => (
                  <tr key={item.nsn} style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ padding: '4px 8px', opacity: 0.7 }}>{item.nsn}</td>
                    <td style={{ padding: '4px 8px' }}>{item.nomenclature}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'right' }}>{item.cadence}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <hr style={rule} />

      {/* UPGRADE PATH — read-only notice in Month 1 */}
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '11px', marginBottom: '6px' }}>UPGRADE PATH</div>
        <div style={{ fontSize: '12px', lineHeight: 1.5, opacity: 0.85 }}>
          {data?.upgradePath ?? 'USERSHIP/AI -> BASIC RATION: not yet operational. Target: Month 2.'}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: '10px 16px', fontSize: '10px', borderTop: '2px solid #000', opacity: 0.6 }}>
        LOT SYSTEMS — BASIC RATION — READ-ONLY OPEN TAB
      </div>
    </div>
  )
}
