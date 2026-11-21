/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// =============================================================================
// LOT-FM-001 — BASIC (RATION) MODULE
// Shared doctrine + 23-item load. NOMENCLATURE AND CADENCE ONLY.
// Unit costs (COGS) are NOT in this file and never ship to the client.
// They live server-side in src/server/utils/basics-envelope.ts.
// =============================================================================

export const BASIC_FORM = 'LOT-FM-001'
export const BASIC_MODULE = 'BASIC (RATION)'
export const BASIC_PRICE_USD = 100
export const BASIC_MARGIN_FLOOR_PCT = 60
export const BASIC_LANDED_CEILING_USD = 40 // = PRICE × (1 − MARGIN FLOOR)

export type BasicClass = 'A' | 'B' | 'C' | 'D' | 'E'

export const BASIC_CLASSES: Record<BasicClass, string> = {
  A: 'HYGIENE',
  B: 'GARMENT',
  C: 'HEALTH',
  D: 'SUSTENANCE',
  E: 'FIELD',
}

/** Issue interval in months. 1 = every issue. */
export type BasicInterval = 1 | 3 | 6 | 12

export const BASIC_INTERVAL_LABEL: Record<BasicInterval, string> = {
  1: 'MONTHLY',
  3: 'QUARTERLY',
  6: 'SEMI-ANNUAL',
  12: 'ANNUAL',
}

export type BasicItem = {
  /** Line number, 2 digits. */
  ln: string
  /** Stable key — used by server envelope + issue log. Never rename. */
  key: string
  cls: BasicClass
  /** Nomenclature, noun-first, military register. */
  nomen: string
  qty: number
  /** Unit of issue. */
  ui: string
  interval: BasicInterval
  /**
   * Phase offset (0-based month of first issue). Staggers non-monthly lines
   * so no single issue breaches the landed ceiling. 0 ≤ phase < interval.
   */
  phase: number
  /** True when the line requires a roster size (Month 2 intake). */
  sized?: boolean
}

// 23 LINES. Order = ledger order. Do not reorder keys; append only.
export const BASIC_LOAD: readonly BasicItem[] = [
  // CLASS A — HYGIENE
  { ln: '01', key: 'soap-bar',        cls: 'A', nomen: 'SOAP, BAR, UNSCENTED, 4 OZ',            qty: 1, ui: 'EA', interval: 1,  phase: 0 },
  { ln: '02', key: 'dentifrice',      cls: 'A', nomen: 'DENTIFRICE, FLUORIDE, 4 OZ',            qty: 1, ui: 'TU', interval: 1,  phase: 0 },
  { ln: '03', key: 'toothbrush',      cls: 'A', nomen: 'TOOTHBRUSH, SOFT, MANUAL',              qty: 1, ui: 'EA', interval: 3,  phase: 0 },
  { ln: '04', key: 'floss',           cls: 'A', nomen: 'FLOSS, DENTAL, WAXED, 50 M',            qty: 1, ui: 'EA', interval: 3,  phase: 1 },
  { ln: '05', key: 'deodorant',       cls: 'A', nomen: 'DEODORANT, SOLID, UNSCENTED',           qty: 1, ui: 'EA', interval: 1,  phase: 0 },
  { ln: '06', key: 'shampoo',         cls: 'A', nomen: 'SHAMPOO, UNSCENTED, 12 OZ',             qty: 1, ui: 'BT', interval: 3,  phase: 0 },
  { ln: '07', key: 'conditioner',     cls: 'A', nomen: 'CONDITIONER, UNSCENTED, 12 OZ',         qty: 1, ui: 'BT', interval: 3,  phase: 1 },
  { ln: '08', key: 'razor-cart',      cls: 'A', nomen: 'RAZOR, CARTRIDGE, 5-BLADE',             qty: 2, ui: 'EA', interval: 1,  phase: 0 },
  { ln: '09', key: 'moisturizer',     cls: 'A', nomen: 'MOISTURIZER, FRAGRANCE-FREE, 8 OZ',     qty: 1, ui: 'BT', interval: 3,  phase: 2 },
  { ln: '10', key: 'sunscreen',       cls: 'A', nomen: 'SUNSCREEN, MINERAL, SPF 50, 3 OZ',      qty: 1, ui: 'TU', interval: 3,  phase: 2 },
  { ln: '11', key: 'lip-balm',        cls: 'A', nomen: 'BALM, LIP, SPF 15',                     qty: 1, ui: 'EA', interval: 3,  phase: 1 },
  { ln: '12', key: 'nail-clipper',    cls: 'A', nomen: 'CLIPPER, NAIL, STAINLESS',              qty: 1, ui: 'EA', interval: 12, phase: 4 },
  // CLASS B — GARMENT (sized at roster)
  { ln: '13', key: 'underwear',       cls: 'B', nomen: 'UNDERWEAR, BRIEF, COTTON, BLACK',       qty: 1, ui: 'PR', interval: 1,  phase: 0, sized: true },
  { ln: '14', key: 'socks',           cls: 'B', nomen: 'SOCKS, CREW, MERINO BLEND, BLACK',      qty: 1, ui: 'PR', interval: 1,  phase: 0, sized: true },
  { ln: '15', key: 'undershirt',      cls: 'B', nomen: 'UNDERSHIRT, CREW, HEAVYWEIGHT, WHITE',  qty: 1, ui: 'EA', interval: 6,  phase: 3, sized: true },
  // CLASS C — HEALTH
  { ln: '16', key: 'multivitamin',    cls: 'C', nomen: 'MULTIVITAMIN, TABLET, 30 CT',           qty: 1, ui: 'BT', interval: 1,  phase: 0 },
  { ln: '17', key: 'vitamin-d3',      cls: 'C', nomen: 'VITAMIN D3, 2000 IU, 30 CT',            qty: 1, ui: 'BT', interval: 1,  phase: 0 },
  { ln: '18', key: 'electrolyte',     cls: 'C', nomen: 'ELECTROLYTE, POWDER, SACHET',           qty: 8, ui: 'EA', interval: 1,  phase: 0 },
  { ln: '19', key: 'bandage',         cls: 'C', nomen: 'BANDAGE, ADHESIVE, ASSORTED, 30 CT',    qty: 1, ui: 'BX', interval: 6,  phase: 0 },
  // CLASS D — SUSTENANCE
  { ln: '20', key: 'coffee',          cls: 'D', nomen: 'COFFEE, GROUND, DARK ROAST, 12 OZ',     qty: 1, ui: 'BG', interval: 1,  phase: 0 },
  { ln: '21', key: 'tea',             cls: 'D', nomen: 'TEA, BLACK, BAGGED, 20 CT',             qty: 1, ui: 'BX', interval: 1,  phase: 0 },
  { ln: '22', key: 'ration-bar',      cls: 'D', nomen: 'BAR, PROTEIN, UNFLAVORED',              qty: 2, ui: 'EA', interval: 1,  phase: 0 },
  // CLASS E — FIELD
  { ln: '23', key: 'field-book',      cls: 'E', nomen: 'BOOK, FIELD, RULED, W/ PEN',            qty: 1, ui: 'EA', interval: 3,  phase: 2 },
] as const

export const BASIC_DOCTRINE: readonly string[] = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'ONE ISSUE PER MONTH. 23 LINES. FIXED CADENCE.',
  'THE MEMBER IS CARRIED ON STRENGTH, NOT AS A CUSTOMER.',
  'THE LEDGER IS THE MARKETING. NO LAYER BETWEEN PUBLIC AND MANIFEST.',
  'BASIC IS ADDITIVE TO USERSHIP (AI). STAND DOWN DROPS RATION, RETAINS AI.',
]

export const BASIC_TERMS: readonly [string, string][] = [
  ['PRICE', `USD ${BASIC_PRICE_USD}/MO, ADDITIVE TO USERSHIP`],
  ['ISSUE', 'MONTHLY, ONE BOX, PRINTED MANIFEST CARD'],
  ['LOAD', '23 LINES, STAGGERED BY CADENCE'],
  ['ENVELOPE', `LANDED ≤ USD ${BASIC_LANDED_CEILING_USD} / MARGIN ≥ ${BASIC_MARGIN_FLOOR_PCT}%`],
  ['STAND DOWN', 'ANY TIME. RATION STOPS. AI RETAINED.'],
  ['SHIPS TO', 'USA, CONTIGUOUS 48 (PHASE 1)'],
]

/** Upgrade state machine (Month 2). Declared now so the status line is stable. */
export const BASIC_STATES = ['USERSHIP', 'PENDING', 'ON_STRENGTH', 'STEADY_STATE', 'STOOD_DOWN'] as const
export type BasicState = (typeof BASIC_STATES)[number]

/**
 * LOAD ENGINE. Returns the lines issued at month index n (0 = first issue).
 * A line issues when n ≥ phase and (n − phase) is a multiple of its interval.
 */
export function basicLoadForMonth(n: number): BasicItem[] {
  if (!Number.isInteger(n) || n < 0) return []
  return BASIC_LOAD.filter(
    (it) => n >= it.phase && (n - it.phase) % it.interval === 0
  )
}

/** First issue month label for a line: M01..M12. */
export function basicFirstIssue(it: BasicItem): string {
  return 'M' + String(it.phase + 1).padStart(2, '0')
}

/** Lines issued across a 12-month cycle per line (for ledger "PER YR"). */
export function basicIssuesPerYear(it: BasicItem): number {
  return (12 / it.interval) * it.qty
}
