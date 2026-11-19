/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 · BASIC (RATION) — PUBLIC MANIFEST
 *
 * The 23-item ration load. Nomenclature + cadence only. COGS is withheld
 * from this module on purpose: it ships to the browser. Unit costs live in
 * src/server/utils/basics-cogs.ts and never leave the server.
 *
 * Cadence is expressed in months. An item with cadence N and offset K is
 * issued in every month m (1-indexed from ON STRENGTH) where (m - 1) % N === K.
 * Offsets stagger heavy items so no single issue breaches the landed ceiling.
 */

export type RationClass = 'I' | 'II' | 'III' | 'IV' | 'V'

export const RATION_CLASS_LABEL: Record<RationClass, string> = {
  I: 'SUSTENANCE',
  II: 'HYGIENE',
  III: 'CLOTHING',
  IV: 'EQUIPMENT',
  V: 'DOCUMENT',
}

export type RationCadence = 1 | 3 | 6 | 12

export const CADENCE_LABEL: Record<RationCadence, string> = {
  1: 'MONTHLY',
  3: 'QUARTERLY',
  6: 'SEMIANNUAL',
  12: 'ANNUAL',
}

export interface RationItem {
  /** Line number, 01–23. Stable. Never renumber. */
  line: string
  /** NSN-style stock code. LOT-<class>-<seq>. */
  code: string
  /** Nomenclature: NOUN, MODIFIER, SPEC. Uppercase. */
  nomenclature: string
  cls: RationClass
  /** Quantity per issue, unit of issue. */
  qty: string
  cadence: RationCadence
  /** Month offset within the cadence cycle (0-indexed). */
  offset: number
}

export const BASIC_PLAN = {
  code: 'BASIC',
  designation: 'LOT CIVILIAN RATION · BASIC',
  priceUsdMonthly: 100,
  marginFloor: 0.6,
  landedCeilingUsd: 40,
  doctrine: [
    'LOT ISSUES. LOT DOES NOT SELL.',
    'ONE LOAD. TWENTY-THREE LINES. NO CHOICE REQUIRED.',
    'THE LEDGER IS PUBLIC. WHAT YOU READ IS WHAT SHIPS.',
    'REPLACE BEFORE FAILURE. NEVER RUN OUT.',
    'NO COLOR. NO LOGO ON THE ITEM. NO NOISE IN THE HOME.',
  ],
  terms: [
    'USD 100 / MONTH. ADDITIVE TO USERSHIP.',
    'ISSUE ONCE PER MONTH. CADENCE PER LINE.',
    'STAND DOWN ANY TIME. AI USERSHIP IS RETAINED.',
    'SHIPS TO ONE ADDRESS. CONTINENTAL US AT FIRST ISSUE.',
  ],
} as const

export const RATION_MANIFEST: readonly RationItem[] = [
  // CLASS I — SUSTENANCE
  { line: '01', code: 'LOT-I-001', nomenclature: 'COFFEE, GROUND, MEDIUM ROAST', cls: 'I', qty: '340 G', cadence: 1, offset: 0 },
  { line: '02', code: 'LOT-I-002', nomenclature: 'TEA, BLACK, BAGGED', cls: 'I', qty: '50 EA', cadence: 1, offset: 0 },
  { line: '03', code: 'LOT-I-003', nomenclature: 'OATS, ROLLED, PLAIN', cls: 'I', qty: '1 KG', cadence: 1, offset: 0 },
  { line: '04', code: 'LOT-I-004', nomenclature: 'ELECTROLYTE, TABLET, UNFLAVORED', cls: 'I', qty: '20 EA', cadence: 1, offset: 0 },
  { line: '05', code: 'LOT-I-005', nomenclature: 'MULTIVITAMIN, DAILY', cls: 'I', qty: '30 EA', cadence: 1, offset: 0 },
  // CLASS II — HYGIENE
  { line: '06', code: 'LOT-II-001', nomenclature: 'SOAP, BAR, UNSCENTED', cls: 'II', qty: '2 EA', cadence: 1, offset: 0 },
  { line: '07', code: 'LOT-II-002', nomenclature: 'TOOTHPASTE, FLUORIDE', cls: 'II', qty: '1 TU', cadence: 1, offset: 0 },
  { line: '08', code: 'LOT-II-003', nomenclature: 'TOOTHBRUSH, SOFT, PLAIN', cls: 'II', qty: '1 EA', cadence: 3, offset: 0 },
  { line: '09', code: 'LOT-II-004', nomenclature: 'FLOSS, WAXED, UNFLAVORED', cls: 'II', qty: '1 EA', cadence: 3, offset: 1 },
  { line: '10', code: 'LOT-II-005', nomenclature: 'DEODORANT, STICK, UNSCENTED', cls: 'II', qty: '1 EA', cadence: 1, offset: 0 },
  { line: '11', code: 'LOT-II-006', nomenclature: 'BALM, LIP, UNSCENTED', cls: 'II', qty: '1 EA', cadence: 3, offset: 2 },
  { line: '12', code: 'LOT-II-007', nomenclature: 'SUNSCREEN, SPF 30, MINERAL', cls: 'II', qty: '1 TU', cadence: 3, offset: 1 },
  // CLASS III — CLOTHING
  { line: '13', code: 'LOT-III-001', nomenclature: 'SHIRT, CREW, COTTON, BLACK', cls: 'III', qty: '1 EA', cadence: 3, offset: 0 },
  { line: '14', code: 'LOT-III-002', nomenclature: 'SOCKS, CREW, COTTON, BLACK', cls: 'III', qty: '3 PR', cadence: 3, offset: 1 },
  { line: '15', code: 'LOT-III-003', nomenclature: 'BRIEFS, COTTON, BLACK', cls: 'III', qty: '3 EA', cadence: 6, offset: 2 },
  { line: '16', code: 'LOT-III-004', nomenclature: 'TOWEL, HAND, COTTON, WHITE', cls: 'III', qty: '1 EA', cadence: 6, offset: 5 },
  // CLASS IV — EQUIPMENT
  { line: '17', code: 'LOT-IV-001', nomenclature: 'BATTERY, AA, ALKALINE', cls: 'IV', qty: '4 EA', cadence: 3, offset: 2 },
  { line: '18', code: 'LOT-IV-002', nomenclature: 'MATCHES, SAFETY, BOXED', cls: 'IV', qty: '1 BX', cadence: 6, offset: 3 },
  { line: '19', code: 'LOT-IV-003', nomenclature: 'FIRST AID, REFILL, BASIC', cls: 'IV', qty: '1 KT', cadence: 6, offset: 4 },
  { line: '20', code: 'LOT-IV-004', nomenclature: 'BAG, STORAGE, ZIP, CLEAR', cls: 'IV', qty: '10 EA', cadence: 3, offset: 0 },
  // CLASS V — DOCUMENT
  { line: '21', code: 'LOT-V-001', nomenclature: 'NOTEBOOK, GRID, A5', cls: 'V', qty: '1 EA', cadence: 3, offset: 2 },
  { line: '22', code: 'LOT-V-002', nomenclature: 'PENCIL, GRAPHITE, HB', cls: 'V', qty: '2 EA', cadence: 3, offset: 2 },
  { line: '23', code: 'LOT-V-003', nomenclature: 'CARD, MANIFEST, PRINTED', cls: 'V', qty: '1 EA', cadence: 1, offset: 0 },
] as const

/** Lines issued in month m (1-indexed from ON STRENGTH). */
export function linesForMonth(month: number): RationItem[] {
  if (!Number.isInteger(month) || month < 1) return []
  return RATION_MANIFEST.filter((it) => (month - 1) % it.cadence === it.offset)
}

/** Public view: nomenclature + cadence. No cost fields exist on this type. */
export function publicManifest() {
  return RATION_MANIFEST.map((it) => ({
    line: it.line,
    code: it.code,
    nomenclature: it.nomenclature,
    cls: it.cls,
    classLabel: RATION_CLASS_LABEL[it.cls],
    qty: it.qty,
    cadence: CADENCE_LABEL[it.cadence],
  }))
}
