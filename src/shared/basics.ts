/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / Section 2 — 23-Item Ration Load (PUBLIC LEDGER)
 *
 * Nomenclature + cadence only. COGS is WITHHELD — supplier quotes live
 * server-side in src/server/utils/ration-cogs.ts and never ship to the
 * client bundle. The ledger is the marketing.
 */

export type RationCadence = 'MONTHLY' | 'QUARTERLY' | 'SEMI-ANNUAL' | 'ANNUAL'

export type RationItem = {
  no: string
  nomenclature: string
  cadence: RationCadence
}

export const RATION_MANIFEST: readonly RationItem[] = [
  { no: '001', nomenclature: 'ENERGY BAR, DENSE, 2400 KCAL',     cadence: 'MONTHLY' },
  { no: '002', nomenclature: 'ELECTROLYTE PACKET, 10-CT',         cadence: 'MONTHLY' },
  { no: '003', nomenclature: 'COFFEE, INSTANT, 14-CT',            cadence: 'MONTHLY' },
  { no: '004', nomenclature: 'OATS, INSTANT, 7-CT',               cadence: 'MONTHLY' },
  { no: '005', nomenclature: 'TRAIL MIX, PORTIONED, 6-CT',        cadence: 'MONTHLY' },
  { no: '006', nomenclature: 'PROTEIN BAR, 4-CT',                 cadence: 'MONTHLY' },
  { no: '007', nomenclature: 'RATION PACK, FREEZE-DRIED VEG',     cadence: 'MONTHLY' },
  { no: '008', nomenclature: 'GLUCOSE TABLET, 10-CT',             cadence: 'MONTHLY' },
  { no: '009', nomenclature: 'SANITIZER, HAND, 2 OZ',             cadence: 'MONTHLY' },
  { no: '010', nomenclature: 'GLOVE, NITRILE, PAIR',              cadence: 'MONTHLY' },
  { no: '011', nomenclature: 'MASK, N95, INDIVIDUALLY SEALED',    cadence: 'MONTHLY' },
  { no: '012', nomenclature: 'CARD, MANIFEST, PRINTED',           cadence: 'MONTHLY' },
  { no: '013', nomenclature: 'WATER PURIFICATION TAB, 20-CT',     cadence: 'QUARTERLY' },
  { no: '014', nomenclature: 'BANDAGE, ADHESIVE, 20-CT',          cadence: 'QUARTERLY' },
  { no: '015', nomenclature: 'WIPE, ANTISEPTIC, 10-CT',           cadence: 'QUARTERLY' },
  { no: '016', nomenclature: 'TABLET, IBUPROFEN 200MG, 24-CT',    cadence: 'QUARTERLY' },
  { no: '017', nomenclature: 'CORD, PARACORD TYPE III, 10 FT',    cadence: 'QUARTERLY' },
  { no: '018', nomenclature: 'FLASHLIGHT, MICRO, 1×AA',           cadence: 'QUARTERLY' },
  { no: '019', nomenclature: 'TAPE, DUCT, MINI ROLL',             cadence: 'QUARTERLY' },
  { no: '020', nomenclature: 'TIE, ZIP, 10-CT',                   cadence: 'QUARTERLY' },
  { no: '021', nomenclature: 'MARKER, PERMANENT, FINE TIP',       cadence: 'QUARTERLY' },
  { no: '022', nomenclature: 'PONCHO, EMERGENCY, SINGLE-USE',     cadence: 'SEMI-ANNUAL' },
  { no: '023', nomenclature: 'NOTEPAD, WATERPROOF, 3×5 IN',       cadence: 'SEMI-ANNUAL' },
]

export const ISSUE_PRICE_USD = 100
export const COGS_CEILING_USD = 40
export const MARGIN_FLOOR_PCT = 0.6
export const LOT_FM_REF = 'LOT-FM-001'

/** Does item ship on issue N (1-indexed)? Issue 1 carries the full load. */
export function itemShipsOnIssue(item: RationItem, issueNumber: number): boolean {
  switch (item.cadence) {
    case 'MONTHLY':     return true
    case 'QUARTERLY':   return issueNumber % 3 === 1
    case 'SEMI-ANNUAL': return issueNumber % 6 === 1
    case 'ANNUAL':      return issueNumber % 12 === 1
  }
}

export function loadForIssue(issueNumber: number): RationItem[] {
  return RATION_MANIFEST.filter((i) => itemShipsOnIssue(i, issueNumber))
}

/** First day of the month after `from`, as YYYY-MM-DD (UTC). */
export function firstOfNextMonth(from: Date = new Date()): string {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1))
  return d.toISOString().slice(0, 10)
}
