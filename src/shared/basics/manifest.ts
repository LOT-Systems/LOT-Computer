/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — BASIC (RATION) MANIFEST
 * Public ledger. Nomenclature + cadence only. COGS lives server-side
 * (src/server/basics/cogs.ts) and never ships to the client.
 */

export const BASIC_PRICE_USD = 100
export const BASIC_ITEM_COUNT = 23
export const BASIC_MIN_MARGIN = 0.6
export const BASIC_LANDED_CEILING_USD = 40

export const BASIC_DOCTRINE = [
  'ISSUE, DO NOT SELL.',
  'THE USER IS ON STRENGTH.',
  'ONE BOX. ONE MONTH. NO CHOICES TO MAKE.',
  'THE LEDGER IS THE MARKETING. NOTHING SITS BETWEEN PUBLIC AND MANIFEST.',
] as const

export type CadenceMonths = 1 | 2 | 3 | 6 | 12

export type RationClass = 'HYGIENE' | 'GROOMING' | 'GARMENT' | 'SUSTENANCE' | 'RECORD'

export type RationItem = {
  /** Line number, 01..23 */
  no: number
  /** Nomenclature, quartermaster register */
  name: string
  class: RationClass
  /** Issued every N months */
  cadence: CadenceMonths
  /** Issue month offset within the cadence (1-based); staggers the load */
  phase: number
}

export const BASIC_MANIFEST: readonly RationItem[] = [
  { no: 1, name: 'TOOTHPASTE, 100ML', class: 'HYGIENE', cadence: 1, phase: 1 },
  { no: 2, name: 'TOOTHBRUSH', class: 'HYGIENE', cadence: 3, phase: 1 },
  { no: 3, name: 'FLOSS, WAXED', class: 'HYGIENE', cadence: 2, phase: 2 },
  { no: 4, name: 'SOAP, BAR', class: 'HYGIENE', cadence: 1, phase: 1 },
  { no: 5, name: 'BODY WASH', class: 'HYGIENE', cadence: 2, phase: 1 },
  { no: 6, name: 'SHAMPOO', class: 'HYGIENE', cadence: 2, phase: 2 },
  { no: 7, name: 'DEODORANT', class: 'HYGIENE', cadence: 1, phase: 1 },
  { no: 8, name: 'RAZOR CARTRIDGES, 4PK', class: 'GROOMING', cadence: 2, phase: 1 },
  { no: 9, name: 'HAND SOAP, REFILL', class: 'HYGIENE', cadence: 2, phase: 2 },
  { no: 10, name: 'LIP BALM', class: 'GROOMING', cadence: 3, phase: 2 },
  { no: 11, name: 'SUNSCREEN, SPF 30', class: 'GROOMING', cadence: 6, phase: 6 },
  { no: 12, name: 'UNDERWEAR, 2PK', class: 'GARMENT', cadence: 3, phase: 3 },
  { no: 13, name: 'SOCKS, 3PK', class: 'GARMENT', cadence: 3, phase: 2 },
  { no: 14, name: 'T-SHIRT, PLAIN', class: 'GARMENT', cadence: 6, phase: 4 },
  { no: 15, name: 'TOWEL, FACE', class: 'GARMENT', cadence: 6, phase: 5 },
  { no: 16, name: 'TISSUE, POCKET PACKS', class: 'HYGIENE', cadence: 1, phase: 1 },
  { no: 17, name: 'SWABS, COTTON', class: 'HYGIENE', cadence: 3, phase: 1 },
  { no: 18, name: 'NAIL CLIPPER', class: 'GROOMING', cadence: 12, phase: 9 },
  { no: 19, name: 'COMB', class: 'GROOMING', cadence: 12, phase: 8 },
  { no: 20, name: 'LAUNDRY SHEETS', class: 'HYGIENE', cadence: 1, phase: 1 },
  { no: 21, name: 'FIELD BARS, SHELF-STABLE', class: 'SUSTENANCE', cadence: 1, phase: 1 },
  { no: 22, name: 'ELECTROLYTE STICKS', class: 'SUSTENANCE', cadence: 1, phase: 1 },
  { no: 23, name: 'MANIFEST CARD, PRINTED', class: 'RECORD', cadence: 1, phase: 1 },
] as const

export const cadenceLabel = (c: CadenceMonths): string =>
  c === 1 ? 'MONTHLY' : c === 12 ? 'ANNUAL' : `EVERY ${c} MO`

/** Is this item issued in ration month `n` (1-based)? */
export const isIssued = (item: RationItem, n: number): boolean =>
  n >= item.phase && (n - item.phase) % item.cadence === 0

/** Items in issue number `n` (1-based). Month-by-month load engine, v0. */
export const issueLoad = (n: number): RationItem[] =>
  BASIC_MANIFEST.filter((i) => isIssued(i, n))

/** Forward schedule: the next issue number (>= from) in which `item` ships. */
export const nextIssueOf = (item: RationItem, from: number): number => {
  if (from <= item.phase) return item.phase
  const steps = Math.ceil((from - item.phase) / item.cadence)
  return item.phase + steps * item.cadence
}
