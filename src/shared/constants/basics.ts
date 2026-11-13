/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — BASIC (RATION) MODULE
// Shared, public-safe definition of the 23-item civilian ration load.
// COGS is WITHHELD from this file on purpose: it is bundled into the public
// client. Unit cost lives server-side only (src/server/utils/basics-envelope.ts).

export const BASIC_FORM = 'LOT-FM-001'
export const BASIC_PRICE_USD = 100
export const BASIC_MARGIN_FLOOR_PCT = 60
export const BASIC_LANDED_CEILING_USD = 40

/**
 * Cadence code + phase. An item issues on issue number n (1-based) when
 * (n - 1) % period === phase. Phases are staggered so no single issue
 * carries every non-monthly item — that is what holds the landed ceiling.
 */
export type BasicCadence = 'M' | 'Q' | 'S' | 'A'

export const BASIC_CADENCE_PERIOD: Record<BasicCadence, number> = {
  M: 1,
  Q: 3,
  S: 6,
  A: 12,
}

export const BASIC_CADENCE_LABEL: Record<BasicCadence, string> = {
  M: 'MONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMI-ANNUAL',
  A: 'ANNUAL',
}

export type BasicClass = 'HYG' | 'APP' | 'SUS' | 'MED' | 'OPS'

export const BASIC_CLASS_LABEL: Record<BasicClass, string> = {
  HYG: 'HYGIENE',
  APP: 'APPAREL',
  SUS: 'SUSTENANCE',
  MED: 'MEDICAL',
  OPS: 'OPERATIONAL',
}

export type BasicItem = {
  /** Line number, 01–23. Stable. Never renumber. */
  ln: string
  /** Nomenclature: NOUN, MODIFIER, MODIFIER. */
  nomenclature: string
  qty: number
  /** Unit of issue. */
  ui: string
  cadence: BasicCadence
  phase: number
  cls: BasicClass
  /** True when the item needs a roster sizing entry (Month 2 intake). */
  sized?: boolean
}

export const BASIC_LOAD: readonly BasicItem[] = [
  { ln: '01', nomenclature: 'SOAP, BAR, CASTILE, UNSCENTED',     qty: 1, ui: '4 OZ',  cadence: 'M', phase: 0, cls: 'HYG' },
  { ln: '02', nomenclature: 'TOOTHPASTE, FLUORIDE',              qty: 1, ui: '4 OZ',  cadence: 'M', phase: 0, cls: 'HYG' },
  { ln: '03', nomenclature: 'FLOSS, DENTAL, WAXED',              qty: 1, ui: '50 YD', cadence: 'M', phase: 0, cls: 'HYG' },
  { ln: '04', nomenclature: 'DEODORANT, SOLID, UNSCENTED',       qty: 1, ui: 'EA',    cadence: 'M', phase: 0, cls: 'HYG' },
  { ln: '05', nomenclature: 'SHAMPOO, CONCENTRATE, UNSCENTED',   qty: 1, ui: '8 OZ',  cadence: 'M', phase: 0, cls: 'HYG' },
  { ln: '06', nomenclature: 'BLADE, RAZOR, DOUBLE-EDGE',         qty: 5, ui: 'EA',    cadence: 'M', phase: 0, cls: 'HYG' },
  { ln: '07', nomenclature: 'BALM, LIP, PLAIN',                  qty: 1, ui: 'EA',    cadence: 'M', phase: 0, cls: 'HYG' },
  { ln: '08', nomenclature: 'LOTION, BODY, UNSCENTED',           qty: 1, ui: '8 OZ',  cadence: 'M', phase: 0, cls: 'HYG' },
  { ln: '09', nomenclature: 'SOCKS, CREW, COTTON, BLACK',        qty: 2, ui: 'PR',    cadence: 'M', phase: 0, cls: 'APP', sized: true },
  { ln: '10', nomenclature: 'UNDERWEAR, BRIEF, COTTON, BLACK',   qty: 2, ui: 'EA',    cadence: 'M', phase: 0, cls: 'APP', sized: true },
  { ln: '11', nomenclature: 'COFFEE, GROUND, DARK',              qty: 1, ui: '12 OZ', cadence: 'M', phase: 0, cls: 'SUS' },
  { ln: '12', nomenclature: 'TEA, BLACK, BAGGED',                qty: 20, ui: 'EA',   cadence: 'M', phase: 0, cls: 'SUS' },
  { ln: '13', nomenclature: 'BAR, RATION, OAT-NUT',              qty: 6, ui: 'EA',    cadence: 'M', phase: 0, cls: 'SUS' },
  { ln: '14', nomenclature: 'ELECTROLYTE, POWDER, SACHET',       qty: 10, ui: 'EA',   cadence: 'M', phase: 0, cls: 'MED' },
  { ln: '15', nomenclature: 'TOOTHBRUSH, MANUAL, SOFT',          qty: 1, ui: 'EA',    cadence: 'Q', phase: 0, cls: 'HYG' },
  { ln: '16', nomenclature: 'T-SHIRT, CREW, COTTON, BLACK',      qty: 1, ui: 'EA',    cadence: 'Q', phase: 0, cls: 'APP', sized: true },
  { ln: '17', nomenclature: 'BANDAGE, ADHESIVE, ASSORTED',       qty: 20, ui: 'EA',   cadence: 'Q', phase: 1, cls: 'MED' },
  { ln: '18', nomenclature: 'CLOTH, MICROFIBER, BLACK',          qty: 1, ui: 'EA',    cadence: 'Q', phase: 1, cls: 'OPS' },
  { ln: '19', nomenclature: 'BATTERY, AA, ALKALINE',             qty: 4, ui: 'EA',    cadence: 'Q', phase: 1, cls: 'OPS' },
  { ln: '20', nomenclature: 'SUNSCREEN, MINERAL, SPF 30',        qty: 1, ui: '3 OZ',  cadence: 'Q', phase: 2, cls: 'MED' },
  { ln: '21', nomenclature: 'CLIPPER, NAIL, STEEL',              qty: 1, ui: 'EA',    cadence: 'S', phase: 2, cls: 'HYG' },
  { ln: '22', nomenclature: 'NOTEBOOK, FIELD, RULED, 48 PG',     qty: 1, ui: 'EA',    cadence: 'S', phase: 4, cls: 'OPS' },
  { ln: '23', nomenclature: 'HANDLE, RAZOR, SAFETY, STEEL',      qty: 1, ui: 'EA',    cadence: 'A', phase: 0, cls: 'HYG' },
]

/** Items that issue on issue number n (1-based). */
export function basicLoadForIssue(n: number): BasicItem[] {
  if (!Number.isInteger(n) || n < 1) return []
  return BASIC_LOAD.filter(
    (it) => (n - 1) % BASIC_CADENCE_PERIOD[it.cadence] === it.phase
  )
}

/** Full cadence cycle length (LCM of all periods) — 12 issues. */
export const BASIC_CYCLE_ISSUES = 12

export const BASIC_DOCTRINE: readonly string[] = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'THE BASIC RATION IS ONE MONTHLY ISSUE OF 23 LINE ITEMS.',
  'THE MEMBER IS ON STRENGTH, NOT A CUSTOMER.',
  'THE LEDGER IS THE MARKETING. NO LAYER BETWEEN PUBLIC AND MANIFEST.',
  'BASIC IS ADDITIVE TO USERSHIP (AI). STAND DOWN DROPS RATION, RETAINS AI.',
]

export const BASIC_TERMS: readonly [string, string][] = [
  ['PRICE', 'USD 100 / MONTH'],
  ['BILLING', 'RECURRING. ADDITIVE TO USERSHIP.'],
  ['ISSUE', 'ONE PER MONTH. CONUS.'],
  ['LOAD', '23 LINE ITEMS. CADENCE PER LEDGER.'],
  ['COGS', 'WITHHELD'],
  ['STAND DOWN', 'ANY TIME. AI PLAN RETAINED.'],
]

/** Build state of the module, advanced once per monthly increment. */
export type BasicBuildPhase = 'LEDGER' | 'ROSTER' | 'ISSUE'
export const BASIC_BUILD_PHASE: BasicBuildPhase = 'LEDGER'

export type BasicEnvelopeStatus = 'WITHIN' | 'BREACH'

export type BasicPublicLedger = {
  form: string
  phase: BasicBuildPhase
  priceUsd: number
  envelope: BasicEnvelopeStatus
  cycleIssues: number
  lines: number
}
