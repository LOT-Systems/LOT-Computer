/**
 * LOT® BASIC (RATION) — public manifest. LOT-FM-001 / Month 1.
 * Nomenclature + cadence only. COGS is NOT in this file (client bundle is public);
 * it lives in scripts/basic-margin-check.ts.
 */

export type Cadence = 'M' | 'Q' | 'S' | 'A'

export const CADENCE: Record<Cadence, { label: string; every: number }> = {
  M: { label: 'MONTHLY', every: 1 },
  Q: { label: 'QUARTERLY', every: 3 },
  S: { label: 'SEMIANNUAL', every: 6 },
  A: { label: 'ANNUAL', every: 12 },
}

export type RationItem = {
  no: number
  name: string
  cadence: Cadence
  /** Issue offset in months (0-based) so periodic items stagger across the year. */
  offset: number
}

export const RATION_MANIFEST: RationItem[] = [
  { no: 1, name: 'TOOTHPASTE', cadence: 'M', offset: 0 },
  { no: 2, name: 'DENTAL FLOSS', cadence: 'M', offset: 0 },
  { no: 3, name: 'BAR SOAP', cadence: 'M', offset: 0 },
  { no: 4, name: 'SHAMPOO', cadence: 'M', offset: 0 },
  { no: 5, name: 'DEODORANT', cadence: 'M', offset: 0 },
  { no: 6, name: 'RAZOR CARTRIDGE', cadence: 'M', offset: 0 },
  { no: 7, name: 'LAUNDRY SHEETS', cadence: 'M', offset: 0 },
  { no: 8, name: 'TOOTHBRUSH HEAD', cadence: 'Q', offset: 0 },
  { no: 9, name: 'LIP BALM', cadence: 'Q', offset: 1 },
  { no: 10, name: 'SOCKS, SET OF 3', cadence: 'Q', offset: 2 },
  { no: 11, name: 'UNDERWEAR, SET OF 2', cadence: 'Q', offset: 1 },
  { no: 12, name: 'WASHCLOTH', cadence: 'Q', offset: 2 },
  { no: 13, name: 'HAND CREAM', cadence: 'Q', offset: 0 },
  { no: 14, name: 'NAIL CLIPPER', cadence: 'A', offset: 0 },
  { no: 15, name: 'TONGUE SCRAPER', cadence: 'A', offset: 1 },
  { no: 16, name: 'RAZOR HANDLE', cadence: 'A', offset: 3 },
  { no: 17, name: 'T-SHIRT, PLAIN', cadence: 'S', offset: 0 },
  { no: 18, name: 'SUNSCREEN', cadence: 'S', offset: 2 },
  { no: 19, name: 'CONDITIONER BAR', cadence: 'S', offset: 4 },
  { no: 20, name: 'HAIR TIE SET', cadence: 'S', offset: 5 },
  { no: 21, name: 'FIRST-AID STRIPS', cadence: 'S', offset: 1 },
  { no: 22, name: 'POCKET TISSUE', cadence: 'M', offset: 0 },
  { no: 23, name: 'MANIFEST CARD', cadence: 'M', offset: 0 },
]

export const PRICE_USD_PER_MONTH = 100
export const COGS_CEILING_USD = 40
export const MARGIN_FLOOR = 0.6

export const DOCTRINE = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'THE MEMBER IS ON STRENGTH.',
  'ONE BOX. ONE PRICE. ONE LEDGER.',
  'WHAT IS ISSUED IS LISTED. WHAT IS LISTED IS ISSUED.',
]

/** Items due in a given 0-based issue month. */
export const itemsForMonth = (month: number): RationItem[] =>
  RATION_MANIFEST.filter(
    (i) => month % CADENCE[i.cadence].every === i.offset % CADENCE[i.cadence].every
  )
