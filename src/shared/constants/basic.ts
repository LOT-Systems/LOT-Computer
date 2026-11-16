/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — BASIC (RATION) MODULE
// Public manifest. Nomenclature + cadence ONLY. COGS is withheld and lives
// server-side in src/server/utils/basic-envelope.ts — never import it here,
// this file ships in the public client bundle.

export const BASIC_FM = 'LOT-FM-001'
export const BASIC_PRICE_USD = 100
export const BASIC_PRICE_LINE = 'USD 100 / MO · ADDITIVE TO USERSHIP · CANCEL = STAND DOWN'

export type RationClass = 'HYGIENE' | 'HEALTH' | 'TEXTILE' | 'SUSTENANCE' | 'OPERATIONAL'

export type RationItem = {
  /** Line number on the manifest, '01'..'23' */
  seq: string
  /** NOUN, MODIFIER, MODIFIER — military nomenclature order */
  nomenclature: string
  qty: number
  unit: string
  cls: RationClass
  /** Issued every N months (1, 2, 3, 6, 12) */
  every: 1 | 2 | 3 | 6 | 12
  /** Month offset of first issue (0 = issue 01). Staggers peaks. */
  offset: number
  /** Requires roster sizing before issue */
  sized?: boolean
}

export const RATION_MANIFEST: readonly RationItem[] = [
  { seq: '01', nomenclature: 'SOAP, BAR, UNSCENTED',            qty: 1, unit: '4 OZ',    cls: 'HYGIENE',     every: 1,  offset: 0 },
  { seq: '02', nomenclature: 'SHAMPOO, BAR',                    qty: 1, unit: '2.5 OZ',  cls: 'HYGIENE',     every: 2,  offset: 0 },
  { seq: '03', nomenclature: 'CONDITIONER, BAR',                qty: 1, unit: '2 OZ',    cls: 'HYGIENE',     every: 2,  offset: 1 },
  { seq: '04', nomenclature: 'TOOTHPASTE, FLUORIDE',            qty: 1, unit: '4 OZ',    cls: 'HYGIENE',     every: 1,  offset: 0 },
  { seq: '05', nomenclature: 'TOOTHBRUSH, MANUAL, SOFT',        qty: 1, unit: 'EA',      cls: 'HYGIENE',     every: 3,  offset: 0 },
  { seq: '06', nomenclature: 'FLOSS, DENTAL, WAXED',            qty: 1, unit: '50 YD',   cls: 'HYGIENE',     every: 2,  offset: 0 },
  { seq: '07', nomenclature: 'DEODORANT, SOLID, UNSCENTED',     qty: 1, unit: '2.6 OZ',  cls: 'HYGIENE',     every: 2,  offset: 1 },
  { seq: '08', nomenclature: 'RAZOR, CARTRIDGE, REFILL',        qty: 4, unit: 'CT',      cls: 'HYGIENE',     every: 2,  offset: 1 },
  { seq: '09', nomenclature: 'BALM, LIP, SPF-15',               qty: 1, unit: 'EA',      cls: 'HYGIENE',     every: 3,  offset: 1 },
  { seq: '10', nomenclature: 'MOISTURIZER, FRAGRANCE-FREE',     qty: 1, unit: '3 OZ',    cls: 'HYGIENE',     every: 2,  offset: 0 },
  { seq: '11', nomenclature: 'SUNSCREEN, MINERAL, SPF-30',      qty: 1, unit: '3 OZ',    cls: 'HYGIENE',     every: 3,  offset: 1 },
  { seq: '12', nomenclature: 'CLIPPER, NAIL, STAINLESS',        qty: 1, unit: 'EA',      cls: 'HYGIENE',     every: 12, offset: 4 },
  { seq: '13', nomenclature: 'BANDAGE, ADHESIVE, ASSORTED',     qty: 20, unit: 'CT',     cls: 'HEALTH',      every: 6,  offset: 2 },
  { seq: '14', nomenclature: 'MULTIVITAMIN, TABLET, DAILY',     qty: 30, unit: 'CT',     cls: 'HEALTH',      every: 1,  offset: 0 },
  { seq: '15', nomenclature: 'ELECTROLYTE, POWDER, SACHET',     qty: 4, unit: 'CT',      cls: 'HEALTH',      every: 2,  offset: 1 },
  { seq: '16', nomenclature: 'EARPLUG, FOAM',                   qty: 10, unit: 'PR',     cls: 'HEALTH',      every: 6,  offset: 5 },
  { seq: '17', nomenclature: 'UNDERWEAR, COTTON, BLACK',        qty: 2, unit: 'EA',      cls: 'TEXTILE',     every: 3,  offset: 0, sized: true },
  { seq: '18', nomenclature: 'SOCK, CREW, COTTON, BLACK',       qty: 2, unit: 'PR',      cls: 'TEXTILE',     every: 3,  offset: 1, sized: true },
  { seq: '19', nomenclature: 'SHIRT, T, CREW, WHITE',           qty: 1, unit: 'EA',      cls: 'TEXTILE',     every: 6,  offset: 2, sized: true },
  { seq: '20', nomenclature: 'COFFEE, GROUND, DARK ROAST',      qty: 1, unit: '4 OZ',    cls: 'SUSTENANCE',  every: 1,  offset: 0 },
  { seq: '21', nomenclature: 'TEA, BLACK, BAGGED',              qty: 20, unit: 'CT',     cls: 'SUSTENANCE',  every: 2,  offset: 0 },
  { seq: '22', nomenclature: 'NOTEBOOK, RULED, A6',             qty: 1, unit: 'EA',      cls: 'OPERATIONAL', every: 3,  offset: 2 },
  { seq: '23', nomenclature: 'PEN, BALLPOINT, BLACK',           qty: 2, unit: 'CT',      cls: 'OPERATIONAL', every: 3,  offset: 2 },
] as const

export const CADENCE_LABEL: Record<RationItem['every'], string> = {
  1: 'MONTHLY',
  2: 'BI-MONTHLY',
  3: 'QUARTERLY',
  6: 'SEMI-ANNUAL',
  12: 'ANNUAL',
}

/** Is `item` in the load for issue number `issueNo` (1-based)? */
export function isDue(item: RationItem, issueNo: number): boolean {
  const m = issueNo - 1
  return m >= item.offset && (m - item.offset) % item.every === 0
}

/** The load for issue number `issueNo` (1-based). */
export function loadForIssue(issueNo: number): RationItem[] {
  return RATION_MANIFEST.filter((item) => isDue(item, issueNo))
}

export const BASIC_DOCTRINE: readonly string[] = [
  'LOT DOES NOT SELL BASICS. LOT ISSUES THEM.',
  'ONE BOX. ONCE A MONTH. 23 LINES ON ROTATION.',
  'NO CHOICE AT THE POINT OF NEED. THE CHOICE WAS MADE ONCE.',
  'THE LEDGER IS THE MARKETING. WHAT YOU READ IS WHAT SHIPS.',
  'ADDITIVE TO USERSHIP. STAND DOWN DROPS THE RATION, KEEPS THE AI.',
]

/** UPGRADE state machine — wired in Month 2. Declared now so the public
 *  status line and the server agree on vocabulary from day one. */
export const BASIC_STATES = ['USERSHIP', 'PENDING', 'ON_STRENGTH', 'STEADY_STATE'] as const
export type BasicState = (typeof BASIC_STATES)[number]

/** Module build phase. Advance at each monthly exit. */
export const BASIC_PHASE = {
  month: 1,
  name: 'LEDGER & DOCTRINE',
  state: 'READ-ONLY',
  nextIssue: 'NOT SCHEDULED',
} as const
