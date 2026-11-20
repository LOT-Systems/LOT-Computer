/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 · MODULE: BASIC (RATION)
 *
 * PUBLIC MANIFEST. Nomenclature + cadence only. COGS is WITHHELD and lives
 * server-side in src/server/basics/ledger.ts. Nothing in this file may carry
 * a cost, a supplier, or a margin — it ships to every browser.
 *
 * STATUS: LOAD v0.1 — DRAFT. Nomenclature pending S-2 sign-off and supplier
 * quotes (Month 3). Item numbers are stable; text may change.
 */

export const BASICS_MODULE_ID = 'LOT-FM-001'
export const BASICS_LOAD_VERSION = 'LOAD v0.1 · DRAFT'
export const BASICS_PRICE_USD = 100
export const BASICS_ITEM_COUNT = 23

/** Issue cadence. Period in months; offset = first issue index (0-based). */
export type BasicsCadence = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL'

export const CADENCE_PERIOD: Record<BasicsCadence, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMIANNUAL: 6,
  ANNUAL: 12,
}

export const CADENCE_CODE: Record<BasicsCadence, string> = {
  MONTHLY: 'M',
  QUARTERLY: 'Q',
  SEMIANNUAL: 'S',
  ANNUAL: 'A',
}

export type BasicsClass = 'SUSTAIN' | 'HYGIENE' | 'GARMENT' | 'KIT'

export interface BasicsItem {
  /** Line number 01–23. Stable. */
  nsn: string
  /** Quartermaster nomenclature: NOUN, MODIFIER, SPEC. Uppercase. */
  nomenclature: string
  cls: BasicsClass
  qty: string
  cadence: BasicsCadence
  /** 0-based issue index of first issue; repeats every CADENCE_PERIOD. */
  offset: number
}

export const BASICS_MANIFEST: BasicsItem[] = [
  // ── SUSTAIN ──────────────────────────────────────────────────────────────
  { nsn: '01', nomenclature: 'COFFEE, WHOLE BEAN, 250G', cls: 'SUSTAIN', qty: '1 BAG', cadence: 'MONTHLY', offset: 0 },
  { nsn: '02', nomenclature: 'TEA, BLACK, SACHET', cls: 'SUSTAIN', qty: '20 EA', cadence: 'MONTHLY', offset: 0 },
  { nsn: '03', nomenclature: 'ELECTROLYTE, TABLET, UNFLAVORED', cls: 'SUSTAIN', qty: '10 EA', cadence: 'MONTHLY', offset: 0 },
  { nsn: '04', nomenclature: 'CANDLE, UTILITY, 40HR', cls: 'SUSTAIN', qty: '1 EA', cadence: 'SEMIANNUAL', offset: 2 },
  // ── HYGIENE ──────────────────────────────────────────────────────────────
  { nsn: '05', nomenclature: 'SOAP, BAR, UNSCENTED, 120G', cls: 'HYGIENE', qty: '1 EA', cadence: 'MONTHLY', offset: 0 },
  { nsn: '06', nomenclature: 'TOOTHPASTE, FLUORIDE, 100ML', cls: 'HYGIENE', qty: '1 EA', cadence: 'MONTHLY', offset: 0 },
  { nsn: '07', nomenclature: 'TOOTHBRUSH, MEDIUM', cls: 'HYGIENE', qty: '1 EA', cadence: 'QUARTERLY', offset: 0 },
  { nsn: '08', nomenclature: 'RAZOR, CARTRIDGE, REFILL', cls: 'HYGIENE', qty: '2 EA', cadence: 'QUARTERLY', offset: 0 },
  { nsn: '09', nomenclature: 'DEODORANT, ALUMINUM-FREE', cls: 'HYGIENE', qty: '1 EA', cadence: 'QUARTERLY', offset: 1 },
  { nsn: '10', nomenclature: 'BALM, LIP, SPF15', cls: 'HYGIENE', qty: '1 EA', cadence: 'QUARTERLY', offset: 0 },
  { nsn: '11', nomenclature: 'DETERGENT, LAUNDRY, SHEET', cls: 'HYGIENE', qty: '30 EA', cadence: 'QUARTERLY', offset: 1 },
  // ── GARMENT ──────────────────────────────────────────────────────────────
  { nsn: '12', nomenclature: 'SOCKS, WOOL-BLEND, BLACK', cls: 'GARMENT', qty: '1 PR', cadence: 'MONTHLY', offset: 0 },
  { nsn: '13', nomenclature: 'SHIRT, T, HEAVYWEIGHT, BLACK', cls: 'GARMENT', qty: '1 EA', cadence: 'QUARTERLY', offset: 0 },
  { nsn: '14', nomenclature: 'BRIEFS, COTTON, BLACK', cls: 'GARMENT', qty: '2 EA', cadence: 'SEMIANNUAL', offset: 4 },
  { nsn: '15', nomenclature: 'TOWEL, HAND, COTTON, WHITE', cls: 'GARMENT', qty: '1 EA', cadence: 'SEMIANNUAL', offset: 5 },
  { nsn: '16', nomenclature: 'CAP, WATCH, KNIT, BLACK', cls: 'GARMENT', qty: '1 EA', cadence: 'ANNUAL', offset: 7 },
  // ── KIT ──────────────────────────────────────────────────────────────────
  { nsn: '17', nomenclature: 'NOTEBOOK, GRID, A6', cls: 'KIT', qty: '1 EA', cadence: 'MONTHLY', offset: 0 },
  { nsn: '18', nomenclature: 'CARD, MANIFEST, PRINTED', cls: 'KIT', qty: '1 EA', cadence: 'MONTHLY', offset: 0 },
  { nsn: '19', nomenclature: 'FIRST AID, REFILL, 20PC', cls: 'KIT', qty: '1 SET', cadence: 'SEMIANNUAL', offset: 5 },
  { nsn: '20', nomenclature: 'BATTERY, AA, ALKALINE', cls: 'KIT', qty: '8 EA', cadence: 'SEMIANNUAL', offset: 5 },
  { nsn: '21', nomenclature: 'FLASHLIGHT, LED, AA', cls: 'KIT', qty: '1 EA', cadence: 'ANNUAL', offset: 1 },
  { nsn: '22', nomenclature: 'BOTTLE, WATER, STEEL, 750ML', cls: 'KIT', qty: '1 EA', cadence: 'ANNUAL', offset: 8 },
  { nsn: '23', nomenclature: 'MULTITOOL, POCKET, 12-FN', cls: 'KIT', qty: '1 EA', cadence: 'ANNUAL', offset: 2 },
]

export const BASICS_DOCTRINE: string[] = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'ONE RATION. 23 LINES. ONE PRICE.',
  'THE LEDGER IS THE MARKETING. WHAT YOU READ IS WHAT SHIPS.',
  'NO CHOICE FATIGUE. NO UPSELL. NO CART.',
  'BASIC IS ADDITIVE TO USERSHIP. STAND DOWN ANY TIME. AI RETAINED.',
]

export const BASICS_TERMS: Array<[string, string]> = [
  ['PRICE', `USD ${BASICS_PRICE_USD} / MO`],
  ['BILLING', 'MONTHLY · ADDITIVE TO USERSHIP'],
  ['ISSUE', '1 RATION / MO · 12-ISSUE CYCLE'],
  ['LINES', `${BASICS_ITEM_COUNT} · M / Q / S / A CADENCE`],
  ['TERM', 'NONE · STAND DOWN ANY TIME'],
  ['ELIGIBILITY', 'USERSHIP MEMBERS · US ADDRESSES'],
]

export const BASICS_CYCLE_LENGTH = 12

/** True if the item is issued on the given 0-based issue index. */
export function isIssuedOn(item: BasicsItem, issueIndex: number): boolean {
  if (issueIndex < 0) return false
  const period = CADENCE_PERIOD[item.cadence]
  if (issueIndex < item.offset) return false
  return (issueIndex - item.offset) % period === 0
}

/** The load for one issue. issueIndex is 0-based, counted from cadence start. */
export function loadForIssue(issueIndex: number): BasicsItem[] {
  return BASICS_MANIFEST.filter((item) => isIssuedOn(item, issueIndex))
}

/** Public, COGS-free projection — safe for /api/public/basics. */
export interface BasicsPublicManifest {
  module: string
  version: string
  priceUsd: number
  doctrine: string[]
  terms: Array<[string, string]>
  items: BasicsItem[]
  cycle: Array<{ issue: number; lines: string[] }>
}

export function getPublicManifest(): BasicsPublicManifest {
  return {
    module: BASICS_MODULE_ID,
    version: BASICS_LOAD_VERSION,
    priceUsd: BASICS_PRICE_USD,
    doctrine: BASICS_DOCTRINE,
    terms: BASICS_TERMS,
    items: BASICS_MANIFEST,
    cycle: Array.from({ length: BASICS_CYCLE_LENGTH }, (_, i) => ({
      issue: i + 1,
      lines: loadForIssue(i).map((item) => item.nsn),
    })),
  }
}
