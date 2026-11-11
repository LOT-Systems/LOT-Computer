/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — BASIC (RATION) MODULE
 *
 * Public doctrine + 23-item ration load. This file ships to the browser, so it
 * carries NOMENCLATURE and CADENCE only. Landed cost (COGS) per line lives in
 * src/server/utils/basics-cogs.ts and never leaves the server.
 *
 * Cadence: every item has a period (in issues) and a phase offset. An item is
 * in the load for issue N (1-based) when (N - 1 - phase) % period === 0 and
 * N - 1 >= phase. Phases stagger quarterly/semi/annual lines so no single box
 * breaches the landed ceiling.
 */

export const BASICS_MODULE = {
  code: 'LOT-FM-001',
  name: 'BASIC',
  designation: 'CIVILIAN RATION',
  revision: 'REV A · M1',
  priceUsd: 100,
  cogsCeilingUsd: 40,
  marginFloor: 0.6,
  itemCount: 23,
} as const

export type BasicsCadence = 'M' | 'Q' | 'S' | 'A'

export const BASICS_CADENCE: Record<BasicsCadence, { label: string; period: number }> = {
  M: { label: 'EVERY ISSUE', period: 1 },
  Q: { label: 'EVERY 3RD ISSUE', period: 3 },
  S: { label: 'EVERY 6TH ISSUE', period: 6 },
  A: { label: 'EVERY 12TH ISSUE', period: 12 },
}

export type BasicsClass = 'A' | 'B' | 'C' | 'D'

export const BASICS_CLASSES: Record<BasicsClass, string> = {
  A: 'HYGIENE',
  B: 'GARMENT',
  C: 'SUBSISTENCE',
  D: 'FIELD',
}

export interface BasicsItem {
  /** Line number on the manifest, 01–23 */
  line: number
  /** Stable stock code, e.g. A-01 */
  code: string
  cls: BasicsClass
  /** Military-style nomenclature: NOUN, MODIFIER, SPEC */
  nomenclature: string
  qty: string
  cadence: BasicsCadence
  /** Issue offset (0-based) for staggered lines */
  phase: number
  /** True when the line needs a size from the roster (Month 2 intake) */
  sized?: boolean
}

export const BASICS_MANIFEST: BasicsItem[] = [
  // CLASS A — HYGIENE
  { line: 1, code: 'A-01', cls: 'A', nomenclature: 'TOOTHPASTE, FLUORIDE, 100ML', qty: '1 EA', cadence: 'M', phase: 0 },
  { line: 2, code: 'A-02', cls: 'A', nomenclature: 'TOOTHBRUSH, SOFT, BAMBOO', qty: '1 EA', cadence: 'Q', phase: 0 },
  { line: 3, code: 'A-03', cls: 'A', nomenclature: 'FLOSS, DENTAL, 50M', qty: '1 EA', cadence: 'Q', phase: 1 },
  { line: 4, code: 'A-04', cls: 'A', nomenclature: 'SOAP, BAR, UNSCENTED', qty: '1 EA', cadence: 'M', phase: 0 },
  { line: 5, code: 'A-05', cls: 'A', nomenclature: 'SHAMPOO, BAR, CONCENTRATE', qty: '1 EA', cadence: 'S', phase: 0 },
  { line: 6, code: 'A-06', cls: 'A', nomenclature: 'DEODORANT, ALUMINUM-FREE', qty: '1 EA', cadence: 'Q', phase: 1 },
  { line: 7, code: 'A-07', cls: 'A', nomenclature: 'RAZOR, CARTRIDGE, REFILL', qty: '4 EA', cadence: 'Q', phase: 2 },
  { line: 8, code: 'A-08', cls: 'A', nomenclature: 'SUNSCREEN, SPF 30, 50ML', qty: '1 EA', cadence: 'S', phase: 1 },
  { line: 9, code: 'A-09', cls: 'A', nomenclature: 'BALM, LIP, UNSCENTED', qty: '1 EA', cadence: 'Q', phase: 0 },
  // CLASS B — GARMENT
  { line: 10, code: 'B-01', cls: 'B', nomenclature: 'SOCKS, CREW, BLACK', qty: '2 PR', cadence: 'M', phase: 0, sized: true },
  { line: 11, code: 'B-02', cls: 'B', nomenclature: 'UNDERWEAR, BRIEF, BLACK', qty: '3 EA', cadence: 'Q', phase: 0, sized: true },
  { line: 12, code: 'B-03', cls: 'B', nomenclature: 'T-SHIRT, CREW, WHITE, HEAVYWEIGHT', qty: '1 EA', cadence: 'Q', phase: 1, sized: true },
  { line: 13, code: 'B-04', cls: 'B', nomenclature: 'T-SHIRT, CREW, BLACK, HEAVYWEIGHT', qty: '1 EA', cadence: 'Q', phase: 2, sized: true },
  { line: 14, code: 'B-05', cls: 'B', nomenclature: 'GLOVES, KNIT, BLACK', qty: '1 PR', cadence: 'A', phase: 10, sized: true },
  { line: 15, code: 'B-06', cls: 'B', nomenclature: 'CAP, WATCH, WOOL BLEND, BLACK', qty: '1 EA', cadence: 'A', phase: 11 },
  // CLASS C — SUBSISTENCE
  { line: 16, code: 'C-01', cls: 'C', nomenclature: 'ELECTROLYTE, SACHET, UNFLAVORED', qty: '10 EA', cadence: 'M', phase: 0 },
  { line: 17, code: 'C-02', cls: 'C', nomenclature: 'RATION BAR, OAT, 60G', qty: '4 EA', cadence: 'M', phase: 0 },
  { line: 18, code: 'C-03', cls: 'C', nomenclature: 'COFFEE, WHOLE BEAN, 250G', qty: '1 EA', cadence: 'M', phase: 0 },
  { line: 19, code: 'C-04', cls: 'C', nomenclature: 'TEA, BLACK, BAGGED', qty: '20 EA', cadence: 'Q', phase: 0 },
  // CLASS D — FIELD
  { line: 20, code: 'D-01', cls: 'D', nomenclature: 'NOTEBOOK, A6, GRID', qty: '1 EA', cadence: 'Q', phase: 2 },
  { line: 21, code: 'D-02', cls: 'D', nomenclature: 'PENCIL, HB, GRAPHITE', qty: '2 EA', cadence: 'S', phase: 2 },
  { line: 22, code: 'D-03', cls: 'D', nomenclature: 'BATTERY, AA, LITHIUM', qty: '4 EA', cadence: 'S', phase: 3 },
  { line: 23, code: 'D-04', cls: 'D', nomenclature: 'CARD, MANIFEST, PRINTED', qty: '1 EA', cadence: 'M', phase: 0 },
]

export const BASICS_DOCTRINE: string[] = [
  'LOT ISSUES THE BASICS. ONE BOX. ONCE A MONTH. THE SAME LOAD FOR EVERY MEMBER.',
  'YOU DO NOT SHOP. YOU DO NOT CHOOSE. YOU ARE ISSUED.',
  'EVERY LINE IS A THING YOU WOULD HAVE BOUGHT ANYWAY. LOT REMOVES THE ERRAND.',
  'THE LEDGER BELOW IS THE ENTIRE OFFER. THERE IS NOTHING BEHIND IT.',
]

export const BASICS_TERMS: Array<{ key: string; value: string }> = [
  { key: 'PRICE', value: 'USD 100 / MONTH' },
  { key: 'BILLING', value: 'ADDITIVE TO USERSHIP' },
  { key: 'LOAD', value: '23 LINES · STAGGERED CADENCE' },
  { key: 'SHIPS', value: 'CONTINENTAL US · ONCE A MONTH' },
  { key: 'EXIT', value: 'STAND DOWN · ANY TIME · AI RETAINED' },
]

/** Subscription state machine (wired in Month 2). */
export type BasicsState = 'USERSHIP' | 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE' | 'STOOD_DOWN'

/** Lines due on issue N (1-based). */
export const getIssueLoad = (issue: number): BasicsItem[] => {
  const n = Math.max(1, Math.floor(issue)) - 1
  return BASICS_MANIFEST.filter((item) => {
    const period = BASICS_CADENCE[item.cadence].period
    return n >= item.phase && (n - item.phase) % period === 0
  })
}

/** Zero-padded issue number for the status line: 7 → "007". */
export const formatIssueNumber = (issue: number): string =>
  String(Math.max(0, Math.floor(issue))).padStart(3, '0')
