/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 · BASIC (RATION) · PUBLIC MANIFEST
 *
 * The 23-item civilian ration load. Nomenclature + cadence only.
 * COGS is WITHHELD from this file — it ships to the client bundle.
 * Landed cost lives server-side in src/server/utils/basics-cogs.ts.
 */

export type BasicsCadence = 'M' | 'Q' | 'S' | 'A'

export type BasicsClass = 'HYG' | 'APP' | 'HSE' | 'SUS'

export interface BasicsItem {
  /** Stock number, stable forever. Never reuse a retired number. */
  nsn: string
  /** Nomenclature: NOUN, MODIFIER, SPEC — uppercase, quartermaster order. */
  nomenclature: string
  /** Quantity issued per issue event. */
  qty: number
  /** Unit of issue. */
  ui: 'EA' | 'PK' | 'PR' | 'RL' | 'BX' | 'TU' | 'BT' | 'BR'
  cadence: BasicsCadence
  /** Month offset (0-based) of first issue within the cadence cycle. Staggers load. */
  offset: number
  cls: BasicsClass
}

export const BASICS_CADENCE_MONTHS: Record<BasicsCadence, number> = {
  M: 1,
  Q: 3,
  S: 6,
  A: 12,
}

export const BASICS_CADENCE_LABEL: Record<BasicsCadence, string> = {
  M: 'MONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMIANNUAL',
  A: 'ANNUAL',
}

export const BASICS_CLASS_LABEL: Record<BasicsClass, string> = {
  HYG: 'HYGIENE',
  APP: 'APPAREL',
  HSE: 'HOUSEHOLD',
  SUS: 'SUSTAINMENT',
}

export const BASICS_MANIFEST: readonly BasicsItem[] = [
  // ── CLASS HYG · HYGIENE ──────────────────────────────────────────────
  { nsn: 'LB-01', nomenclature: 'TOOTHBRUSH, MANUAL, SOFT', qty: 1, ui: 'EA', cadence: 'Q', offset: 0, cls: 'HYG' },
  { nsn: 'LB-02', nomenclature: 'TOOTHPASTE, FLUORIDE, 100ML', qty: 2, ui: 'TU', cadence: 'Q', offset: 0, cls: 'HYG' },
  { nsn: 'LB-03', nomenclature: 'FLOSS, DENTAL, WAXED, 50M', qty: 1, ui: 'EA', cadence: 'Q', offset: 0, cls: 'HYG' },
  { nsn: 'LB-04', nomenclature: 'SOAP, BAR, UNSCENTED, 120G', qty: 2, ui: 'BR', cadence: 'M', offset: 0, cls: 'HYG' },
  { nsn: 'LB-05', nomenclature: 'SHAMPOO, NEUTRAL, 500ML', qty: 1, ui: 'BT', cadence: 'Q', offset: 2, cls: 'HYG' },
  { nsn: 'LB-06', nomenclature: 'DEODORANT, STICK, UNSCENTED', qty: 2, ui: 'EA', cadence: 'Q', offset: 1, cls: 'HYG' },
  { nsn: 'LB-07', nomenclature: 'RAZOR, CARTRIDGE, REFILL', qty: 4, ui: 'PK', cadence: 'Q', offset: 2, cls: 'HYG' },
  { nsn: 'LB-08', nomenclature: 'BALM, LIP, PLAIN', qty: 1, ui: 'EA', cadence: 'Q', offset: 0, cls: 'HYG' },
  { nsn: 'LB-09', nomenclature: 'SUNSCREEN, SPF 30, 100ML', qty: 1, ui: 'TU', cadence: 'Q', offset: 1, cls: 'HYG' },
  { nsn: 'LB-10', nomenclature: 'BANDAGE, ADHESIVE, ASSORTED', qty: 40, ui: 'BX', cadence: 'S', offset: 1, cls: 'HYG' },

  // ── CLASS APP · APPAREL ──────────────────────────────────────────────
  { nsn: 'LB-11', nomenclature: 'UNDERWEAR, BRIEF, COTTON, BLACK', qty: 3, ui: 'PK', cadence: 'Q', offset: 0, cls: 'APP' },
  { nsn: 'LB-12', nomenclature: 'SOCKS, CREW, COTTON, BLACK', qty: 3, ui: 'PR', cadence: 'Q', offset: 2, cls: 'APP' },
  { nsn: 'LB-13', nomenclature: 'T-SHIRT, CREW, COTTON, WHITE', qty: 1, ui: 'EA', cadence: 'Q', offset: 2, cls: 'APP' },
  { nsn: 'LB-14', nomenclature: 'CAP, WATCH, KNIT, BLACK', qty: 1, ui: 'EA', cadence: 'A', offset: 6, cls: 'APP' },

  // ── CLASS HSE · HOUSEHOLD ────────────────────────────────────────────
  { nsn: 'LB-15', nomenclature: 'TISSUE, TOILET, 2-PLY', qty: 12, ui: 'RL', cadence: 'M', offset: 0, cls: 'HSE' },
  { nsn: 'LB-16', nomenclature: 'TISSUE, FACIAL, BOX', qty: 2, ui: 'BX', cadence: 'Q', offset: 0, cls: 'HSE' },
  { nsn: 'LB-17', nomenclature: 'TOWEL, PAPER, ROLL', qty: 2, ui: 'RL', cadence: 'M', offset: 0, cls: 'HSE' },
  { nsn: 'LB-18', nomenclature: 'SOAP, DISH, CONCENTRATE, 1L', qty: 1, ui: 'BT', cadence: 'Q', offset: 1, cls: 'HSE' },
  { nsn: 'LB-19', nomenclature: 'SPONGE, CELLULOSE', qty: 3, ui: 'PK', cadence: 'M', offset: 0, cls: 'HSE' },
  { nsn: 'LB-20', nomenclature: 'DETERGENT, LAUNDRY, SHEET', qty: 30, ui: 'PK', cadence: 'M', offset: 0, cls: 'HSE' },
  { nsn: 'LB-21', nomenclature: 'BAG, TRASH, 13 GAL', qty: 20, ui: 'BX', cadence: 'M', offset: 0, cls: 'HSE' },

  // ── CLASS SUS · SUSTAINMENT ──────────────────────────────────────────
  { nsn: 'LB-22', nomenclature: 'MULTIVITAMIN, DAILY, 90 CT', qty: 1, ui: 'BT', cadence: 'Q', offset: 1, cls: 'SUS' },
  { nsn: 'LB-23', nomenclature: 'BATTERY, ALKALINE, AA', qty: 4, ui: 'PK', cadence: 'S', offset: 3, cls: 'SUS' },
] as const

export const BASICS_DOCTRINE: readonly string[] = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'ONE BOX. ONE CADENCE. TWENTY-THREE ITEMS.',
  'THE MANIFEST IS PUBLIC. THE LEDGER IS THE MARKETING.',
  'NO CHOICE FATIGUE. NO CART. NO RESTOCK ANXIETY.',
  'THE MEMBER IS ON STRENGTH UNTIL THE MEMBER STANDS DOWN.',
]

export const BASICS_TERMS = {
  priceUsd: 100,
  period: 'MO',
  basis: 'ADDITIVE TO LOT USERSHIP (AI)',
  shipping: 'INCLUDED · CONUS',
  exit: 'STAND DOWN ANY CYCLE · AI RETAINED',
} as const

export const BASICS_FORM = 'LOT-FM-001'

/** Is item due in cycle month `m` (0-based, from member's cadence start)? */
export function isBasicsItemDue(item: BasicsItem, m: number): boolean {
  const n = BASICS_CADENCE_MONTHS[item.cadence]
  return m >= item.offset && (m - item.offset) % n === 0
}

/** Load list for cycle month `m`. */
export function basicsLoadForMonth(m: number): BasicsItem[] {
  return BASICS_MANIFEST.filter((i) => isBasicsItemDue(i, m))
}
