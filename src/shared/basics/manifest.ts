/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 · BASIC (RATION) · SECTION 2 — THE 23-ITEM LOAD
 *
 * Public manifest. Nomenclature + cadence only. COGS is WITHHELD from this
 * file on purpose: it ships to the browser. Unit costs live server-side in
 * src/server/utils/basics-cogs.ts and never cross the wire.
 *
 * Cadence is expressed as an interval in months plus a phase offset, so the
 * load for any issue number N is deterministic:
 *   item ships on issue N  ⇔  N >= phase && (N - phase) % every === 0
 * ONCE items ship on issue 0 only (enlistment kit).
 */

export type Cadence = 'M' | 'B' | 'Q' | 'S' | 'A' | 'ONCE'

export const CADENCE_INTERVAL: Record<Cadence, number> = {
  M: 1,
  B: 2,
  Q: 3,
  S: 6,
  A: 12,
  ONCE: 0,
}

export const CADENCE_LABEL: Record<Cadence, string> = {
  M: 'MONTHLY',
  B: 'BIMONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMIANNUAL',
  A: 'ANNUAL',
  ONCE: 'ON ENLISTMENT',
}

export type SupplyClass = 'I' | 'II' | 'IV' | 'VIII'

export const SUPPLY_CLASS_LABEL: Record<SupplyClass, string> = {
  I: 'CLASS I — SUBSISTENCE',
  II: 'CLASS II — CLOTHING & INDIVIDUAL EQUIPMENT',
  IV: 'CLASS IV — FIELD & UTILITY',
  VIII: 'CLASS VIII — HYGIENE & MEDICAL',
}

export interface RationItem {
  /** Line number, 01–23. Stable forever; never renumber. */
  line: string
  /** NSN-style stock code, LOT internal. */
  code: string
  /** Nomenclature, noun-first, military convention. */
  nomenclature: string
  /** Unit of issue. */
  unit: string
  qty: number
  cls: SupplyClass
  cadence: Cadence
  /** Phase offset in months (0-based issue index of first shipment). */
  phase: number
  /** Requires roster sizing (Month 2 intake). */
  sized?: boolean
}

export const RATION_MANIFEST: readonly RationItem[] = [
  // CLASS I — SUBSISTENCE
  { line: '01', code: 'LOT-8960-001', nomenclature: 'ELECTROLYTE, POWDER, UNFLAVORED', unit: 'SACHET', qty: 30, cls: 'I', cadence: 'M', phase: 0 },
  { line: '02', code: 'LOT-8955-002', nomenclature: 'TEA, GREEN, LOOSE LEAF, 100 G', unit: 'PG', qty: 1, cls: 'I', cadence: 'M', phase: 0 },
  { line: '03', code: 'LOT-8925-003', nomenclature: 'CHOCOLATE, DARK, 85%, 100 G', unit: 'BAR', qty: 1, cls: 'I', cadence: 'M', phase: 0 },
  { line: '04', code: 'LOT-8950-004', nomenclature: 'SALT, SEA, COARSE, 250 G', unit: 'JR', qty: 1, cls: 'I', cadence: 'S', phase: 5 },
  { line: '05', code: 'LOT-8960-005', nomenclature: 'BOTTLE, WATER, STEEL, 750 ML', unit: 'EA', qty: 1, cls: 'I', cadence: 'ONCE', phase: 0 },

  // CLASS II — CLOTHING & INDIVIDUAL EQUIPMENT
  { line: '06', code: 'LOT-8440-006', nomenclature: 'SOCKS, CREW, MERINO, BLACK', unit: 'PR', qty: 2, cls: 'II', cadence: 'S', phase: 1, sized: true },
  { line: '07', code: 'LOT-8420-007', nomenclature: 'SHIRT, T, COTTON, WHITE', unit: 'EA', qty: 1, cls: 'II', cadence: 'S', phase: 3, sized: true },
  { line: '08', code: 'LOT-8420-008', nomenclature: 'UNDERWEAR, COTTON, BLACK', unit: 'EA', qty: 2, cls: 'II', cadence: 'S', phase: 2, sized: true },
  { line: '09', code: 'LOT-8415-009', nomenclature: 'GLOVES, WORK, LEATHER', unit: 'PR', qty: 1, cls: 'II', cadence: 'A', phase: 5, sized: true },

  // CLASS VIII — HYGIENE & MEDICAL
  { line: '10', code: 'LOT-8530-010', nomenclature: 'SOAP, BAR, UNSCENTED', unit: 'BAR', qty: 1, cls: 'VIII', cadence: 'M', phase: 0 },
  { line: '11', code: 'LOT-8530-011', nomenclature: 'TOOTHPASTE, FLUORIDE, 100 ML', unit: 'TU', qty: 1, cls: 'VIII', cadence: 'B', phase: 0 },
  { line: '12', code: 'LOT-8530-012', nomenclature: 'TOOTHBRUSH, SOFT', unit: 'EA', qty: 1, cls: 'VIII', cadence: 'Q', phase: 1 },
  { line: '13', code: 'LOT-8530-013', nomenclature: 'FLOSS, DENTAL, 50 M', unit: 'EA', qty: 1, cls: 'VIII', cadence: 'Q', phase: 2 },
  { line: '14', code: 'LOT-8530-014', nomenclature: 'BLADE, RAZOR, DOUBLE EDGE', unit: 'PG', qty: 10, cls: 'VIII', cadence: 'Q', phase: 1 },
  { line: '15', code: 'LOT-8510-015', nomenclature: 'BALM, LIP, UNSCENTED', unit: 'EA', qty: 1, cls: 'VIII', cadence: 'Q', phase: 2 },
  { line: '16', code: 'LOT-8510-016', nomenclature: 'SUNSCREEN, SPF 50, 50 ML', unit: 'TU', qty: 1, cls: 'VIII', cadence: 'S', phase: 4 },
  { line: '17', code: 'LOT-6545-017', nomenclature: 'KIT, FIRST AID, POCKET', unit: 'KT', qty: 1, cls: 'VIII', cadence: 'A', phase: 11 },

  // CLASS IV — FIELD & UTILITY
  { line: '18', code: 'LOT-7530-018', nomenclature: 'NOTEBOOK, A5, GRID, 96 SH', unit: 'EA', qty: 1, cls: 'IV', cadence: 'Q', phase: 0 },
  { line: '19', code: 'LOT-7510-019', nomenclature: 'PENCIL, GRAPHITE, HB', unit: 'EA', qty: 3, cls: 'IV', cadence: 'Q', phase: 2 },
  { line: '20', code: 'LOT-6260-020', nomenclature: 'CANDLE, BEESWAX, 4 HR', unit: 'EA', qty: 2, cls: 'IV', cadence: 'Q', phase: 0 },
  { line: '21', code: 'LOT-7920-021', nomenclature: 'CLOTH, MICROFIBER, 30 CM', unit: 'EA', qty: 1, cls: 'IV', cadence: 'S', phase: 0 },
  { line: '22', code: 'LOT-6150-022', nomenclature: 'CABLE, USB-C, BRAIDED, 1 M', unit: 'EA', qty: 1, cls: 'IV', cadence: 'A', phase: 10 },
  { line: '23', code: 'LOT-7690-023', nomenclature: 'CARD, MANIFEST, PRINTED', unit: 'EA', qty: 1, cls: 'IV', cadence: 'M', phase: 0 },
] as const

export const RATION_TERMS = {
  plan: 'BASIC',
  priceUsdMonthly: 100,
  marginFloor: 0.6,
  landedCeilingUsd: 40,
  itemCount: 23,
  /** Additive to Usership (AI). Ration drops on STAND DOWN; AI retained. */
  requires: 'USERSHIP',
} as const

export const DOCTRINE: readonly string[] = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'ONE BOX. ONE CADENCE. NO CHOICES TO MAKE.',
  'EVERY ITEM IS LISTED. NOTHING IS HIDDEN.',
  'THE LEDGER IS THE MARKETING.',
  'STAND DOWN AT ANY TIME. THE SYSTEM REMAINS.',
]

/** Does `item` ship on 0-based issue number `issue`? */
export function shipsOnIssue(item: RationItem, issue: number): boolean {
  if (issue < 0) return false
  if (item.cadence === 'ONCE') return issue === 0
  const every = CADENCE_INTERVAL[item.cadence]
  return issue >= item.phase && (issue - item.phase) % every === 0
}

/** Month-by-month load engine: the items issued on a given issue number. */
export function loadForIssue(issue: number): RationItem[] {
  return RATION_MANIFEST.filter((it) => shipsOnIssue(it, issue))
}

/** Next issue date: the 1st of next month (UTC). Dispatch day per FM-001. */
export function nextIssueDate(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
}
