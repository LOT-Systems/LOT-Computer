/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Page } from '#client/components/ui'
import { useDocumentTitle } from '#client/utils/hooks'

/**
 * BASICS — the hardware / physical ration surface of the LOT® System.
 * Doctrine: LOT-FM-001. Register is fixed and does not follow the app
 * theme — white ground, black ink, 2px rules, square corners, monospace
 * grid — because the manifest is a printed document, not a mood.
 *
 * Build state: MONTH 1 — LEDGER & DOCTRINE (read-only OPEN TAB).
 * UPGRADE / roster / issue engine are MONTH 2–3 scope; not wired here.
 */

const MONO_STACK =
  "'Liberation Mono', ui-monospace, Menlo, Consolas, 'DejaVu Sans Mono', monospace"

const CADENCE_LEGEND: Record<string, string> = {
  M: 'ISSUED MONTHLY',
  Q: 'ISSUED QUARTERLY',
  A: 'ISSUED ON INTAKE — REPLENISHED ON REQUEST',
}

type RationItem = {
  no: number
  nomenclature: string
  category: string
  cadence: keyof typeof CADENCE_LEGEND
}

// 23-item BASIC ration load, per LOT-FM-001 §2. Nomenclature + cadence only —
// COGS is withheld from the public ledger by doctrine ("the ledger is the
// marketing; no layer between public and manifest" does not mean the cost
// sheet is public — it means there is no marketing layer on top of it).
const RATION_LOAD: RationItem[] = [
  { no: 1, nomenclature: 'TOOTHBRUSH', category: 'HYGIENE', cadence: 'Q' },
  { no: 2, nomenclature: 'TOOTHPASTE, TRAVEL', category: 'HYGIENE', cadence: 'M' },
  { no: 3, nomenclature: 'DENTAL FLOSS', category: 'HYGIENE', cadence: 'M' },
  { no: 4, nomenclature: 'SOAP, BAR', category: 'HYGIENE', cadence: 'M' },
  { no: 5, nomenclature: 'SHAMPOO, TRAVEL', category: 'HYGIENE', cadence: 'M' },
  { no: 6, nomenclature: 'DEODORANT', category: 'HYGIENE', cadence: 'M' },
  { no: 7, nomenclature: 'RAZOR, DISPOSABLE (3-PACK)', category: 'HYGIENE', cadence: 'M' },
  { no: 8, nomenclature: 'NAIL CLIPPER', category: 'HYGIENE', cadence: 'A' },
  { no: 9, nomenclature: 'COTTON SWABS, BOX', category: 'HYGIENE', cadence: 'Q' },
  { no: 10, nomenclature: 'HAND SANITIZER, TRAVEL', category: 'HYGIENE', cadence: 'M' },
  { no: 11, nomenclature: 'UNDERWEAR, CREW (3-PACK)', category: 'APPAREL', cadence: 'Q' },
  { no: 12, nomenclature: 'SOCKS, CREW (3-PAIR)', category: 'APPAREL', cadence: 'Q' },
  { no: 13, nomenclature: 'UNDERSHIRT, CREW NECK', category: 'APPAREL', cadence: 'Q' },
  { no: 14, nomenclature: 'TOILET PAPER (4-ROLL)', category: 'PAPER GOODS', cadence: 'M' },
  { no: 15, nomenclature: 'PAPER TOWELS (2-ROLL)', category: 'PAPER GOODS', cadence: 'M' },
  { no: 16, nomenclature: 'TISSUES, BOX', category: 'PAPER GOODS', cadence: 'M' },
  { no: 17, nomenclature: 'TRASH BAGS, 13-GAL (10-COUNT)', category: 'HOME', cadence: 'M' },
  { no: 18, nomenclature: 'DISH SOAP', category: 'HOME', cadence: 'M' },
  { no: 19, nomenclature: 'ALL-PURPOSE CLEANER, TRAVEL', category: 'HOME', cadence: 'Q' },
  { no: 20, nomenclature: 'SPONGES (2-PACK)', category: 'HOME', cadence: 'Q' },
  { no: 21, nomenclature: 'BATTERIES, AA (4-PACK)', category: 'HOME', cadence: 'Q' },
  { no: 22, nomenclature: 'MULTIVITAMIN, 30-DAY SUPPLY', category: 'RATION', cadence: 'M' },
  { no: 23, nomenclature: 'FIRST-AID KIT, BASIC', category: 'RATION', cadence: 'A' },
]

const RULE = '2px solid #000'

function StatusLine({
  phase,
  state,
}: {
  phase: string
  state: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '4px 16px',
        padding: '8px 0',
        borderTop: RULE,
        borderBottom: RULE,
        fontFamily: MONO_STACK,
        fontWeight: 700,
        fontSize: '13px',
        letterSpacing: '0.02em',
      }}
    >
      <span>TAB: BASICS — OPEN TAB</span>
      <span>PHASE: {phase}</span>
      <span>STATE: {state}</span>
    </div>
  )
}

export function Basics() {
  useDocumentTitle('Basics')

  return (
    <Page className="max-w-[720px]">
      <div
        style={{
          fontFamily: MONO_STACK,
          background: '#fff',
          color: '#000',
          border: RULE,
          borderRadius: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: RULE }}>
          <div style={{ fontSize: '13px', fontWeight: 700, opacity: 0.7 }}>
            LOT-FM-001 / SELF-ASSEMBLY DIRECTIVE
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>
            BASIC (RATION)
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>
            THE HARDWARE / PHYSICAL SYSTEM
          </div>
        </div>

        <StatusLine phase="MONTH 1 / LEDGER &amp; DOCTRINE" state="READ ONLY" />

        {/* Doctrine */}
        <div style={{ padding: '16px', borderBottom: RULE, fontSize: '14px', lineHeight: 1.5 }}>
          <p style={{ fontWeight: 700, marginBottom: '8px' }}>DOCTRINE.</p>
          <p style={{ marginBottom: '8px' }}>
            LOT does not sell a box. LOT issues a ration. The user is ON
            STRENGTH — carried on the roster, resupplied on a fixed cadence,
            without negotiation and without upsell.
          </p>
          <p>
            This ledger is the entire marketing surface. There is no layer
            between what you read here and what ships. Nomenclature and
            cadence are public. Cost of goods is withheld.
          </p>
        </div>

        {/* Price line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            padding: '16px',
            borderBottom: RULE,
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 700 }}>ISSUE RATE</span>
          <span style={{ fontSize: '20px', fontWeight: 700 }}>USD 100.00 / MONTH</span>
        </div>

        {/* Manifest */}
        <div style={{ padding: '16px', borderBottom: RULE }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
            MANIFEST — 23 ITEMS
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                fontSize: '12px',
                borderCollapse: 'collapse',
                lineHeight: 1.4,
              }}
            >
              <thead>
                <tr style={{ borderBottom: RULE, fontWeight: 700 }}>
                  <th style={{ textAlign: 'left', padding: '2px 8px 6px 0', width: '28px' }}>NO.</th>
                  <th style={{ textAlign: 'left', padding: '2px 8px 6px' }}>NOMENCLATURE</th>
                  <th style={{ textAlign: 'left', padding: '2px 8px 6px' }}>CATEGORY</th>
                  <th style={{ textAlign: 'right', padding: '2px 0 6px 8px', width: '64px' }}>CADENCE</th>
                </tr>
              </thead>
              <tbody>
                {RATION_LOAD.map((item) => (
                  <tr key={item.no} style={{ borderBottom: '1px solid #000' }}>
                    <td style={{ padding: '4px 8px 4px 0', opacity: 0.7 }}>
                      {String(item.no).padStart(2, '0')}
                    </td>
                    <td style={{ padding: '4px 8px' }}>{item.nomenclature}</td>
                    <td style={{ padding: '4px 8px', opacity: 0.7 }}>{item.category}</td>
                    <td style={{ padding: '4px 0 4px 8px', textAlign: 'right', fontWeight: 700 }}>
                      {item.cadence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '12px', fontSize: '11px', opacity: 0.7 }}>
            {Object.entries(CADENCE_LEGEND).map(([code, label]) => (
              <div key={code}>
                {code} — {label}
              </div>
            ))}
            <div style={{ marginTop: '4px' }}>COGS: WITHHELD.</div>
          </div>
        </div>

        {/* Locked controls — honest about build state, no dead buttons pretending to work */}
        <div style={{ padding: '16px', fontSize: '12px', opacity: 0.7 }}>
          <div style={{ fontWeight: 700, opacity: 1, marginBottom: '4px' }}>
            UPGRADE — LOCKED
          </div>
          <div>
            Roster intake and USERSHIP/AI → BASIC upgrade path ship MONTH 2.
            Issue scheduling and fulfillment ship MONTH 3. This tab reads
            read-only until then — nothing above is a live transaction.
          </div>
        </div>
      </div>
    </Page>
  )
}
