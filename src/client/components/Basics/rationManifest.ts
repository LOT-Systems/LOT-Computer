/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 */

// LOT-FM-001 / Section 2 — 23-Item Ration Load
// COGS withheld. Cadence fixed. Load fixed.

export type Cadence = 'MONTHLY' | 'QUARTERLY' | 'SEMI-ANNUAL' | 'ANNUAL'

export type RationItem = {
  no: string
  nomenclature: string
  cadence: Cadence
  cogsUsd: number  // confirmed supplier quote — Month 3
}

// COGS validated: monthly box ≤$22, Q1 box ≤$39.50 (margin ≥60%).
export const RATION_MANIFEST: RationItem[] = [
  { no: '001', nomenclature: 'ENERGY BAR, DENSE, 2400 KCAL',       cadence: 'MONTHLY',     cogsUsd: 3.50 },
  { no: '002', nomenclature: 'ELECTROLYTE PACKET, 10-CT',           cadence: 'MONTHLY',     cogsUsd: 2.25 },
  { no: '003', nomenclature: 'COFFEE, INSTANT, 14-CT',              cadence: 'MONTHLY',     cogsUsd: 3.25 },
  { no: '004', nomenclature: 'OATS, INSTANT, 7-CT',                 cadence: 'MONTHLY',     cogsUsd: 1.75 },
  { no: '005', nomenclature: 'TRAIL MIX, PORTIONED, 6-CT',          cadence: 'MONTHLY',     cogsUsd: 2.75 },
  { no: '006', nomenclature: 'PROTEIN BAR, 4-CT',                   cadence: 'MONTHLY',     cogsUsd: 2.25 },
  { no: '007', nomenclature: 'RATION PACK, FREEZE-DRIED VEG',       cadence: 'MONTHLY',     cogsUsd: 2.25 },
  { no: '008', nomenclature: 'GLUCOSE TABLET, 10-CT',               cadence: 'MONTHLY',     cogsUsd: 0.75 },
  { no: '009', nomenclature: 'SANITIZER, HAND, 2 OZ',               cadence: 'MONTHLY',     cogsUsd: 1.25 },
  { no: '010', nomenclature: 'GLOVE, NITRILE, PAIR',                cadence: 'MONTHLY',     cogsUsd: 0.40 },
  { no: '011', nomenclature: 'MASK, N95, INDIVIDUALLY SEALED',      cadence: 'MONTHLY',     cogsUsd: 1.35 },
  { no: '012', nomenclature: 'CARD, MANIFEST, PRINTED',             cadence: 'MONTHLY',     cogsUsd: 0.25 },
  { no: '013', nomenclature: 'WATER PURIFICATION TAB, 20-CT',       cadence: 'QUARTERLY',   cogsUsd: 2.50 },
  { no: '014', nomenclature: 'BANDAGE, ADHESIVE, 20-CT',            cadence: 'QUARTERLY',   cogsUsd: 1.75 },
  { no: '015', nomenclature: 'WIPE, ANTISEPTIC, 10-CT',             cadence: 'QUARTERLY',   cogsUsd: 1.25 },
  { no: '016', nomenclature: 'TABLET, IBUPROFEN 200MG, 24-CT',      cadence: 'QUARTERLY',   cogsUsd: 1.75 },
  { no: '017', nomenclature: 'CORD, PARACORD TYPE III, 10 FT',      cadence: 'QUARTERLY',   cogsUsd: 1.25 },
  { no: '018', nomenclature: 'FLASHLIGHT, MICRO, 1×AA',             cadence: 'QUARTERLY',   cogsUsd: 2.50 },
  { no: '019', nomenclature: 'TAPE, DUCT, MINI ROLL',               cadence: 'QUARTERLY',   cogsUsd: 1.25 },
  { no: '020', nomenclature: 'TIE, ZIP, 10-CT',                     cadence: 'QUARTERLY',   cogsUsd: 0.50 },
  { no: '021', nomenclature: 'MARKER, PERMANENT, FINE TIP',         cadence: 'QUARTERLY',   cogsUsd: 1.25 },
  { no: '022', nomenclature: 'PONCHO, EMERGENCY, SINGLE-USE',       cadence: 'SEMI-ANNUAL', cogsUsd: 1.50 },
  { no: '023', nomenclature: 'NOTEPAD, WATERPROOF, 3×5 IN',         cadence: 'SEMI-ANNUAL', cogsUsd: 2.00 },
]

export const ISSUE_PRICE_USD = 100
export const ISSUE_CADENCE = 'MONTHLY'
export const LOT_FM_REF = 'LOT-FM-001'
