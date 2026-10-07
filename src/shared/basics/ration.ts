/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / BASIC (RATION) — public ledger data.
 * COGS withheld by doctrine: this file carries nomenclature + cadence only.
 */

export type Cadence = 'M' | 'Q' | 'S' | 'A'

export const CADENCE_LABEL: Record<Cadence, string> = {
  M: 'MONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMIANNUAL',
  A: 'ANNUAL',
}

// Months (1-12) in which a cadence is issued.
export const CADENCE_MONTHS: Record<Cadence, number[]> = {
  M: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  Q: [1, 4, 7, 10],
  S: [1, 7],
  A: [1],
}

export type Group = 'HYGIENE' | 'APPAREL' | 'PROVISION' | 'KIT'

export type RationItem = {
  no: number
  group: Group
  nomenclature: string
  qty: number
  cadence: Cadence
}

// PLACEHOLDER LOAD — pending S-2 confirmation against LOT-FM-001 Section 2.
export const RATION_LOAD: RationItem[] = [
  { no: 1, group: 'HYGIENE', nomenclature: 'TOOTHBRUSH', qty: 1, cadence: 'Q' },
  { no: 2, group: 'HYGIENE', nomenclature: 'TOOTHPASTE', qty: 1, cadence: 'M' },
  { no: 3, group: 'HYGIENE', nomenclature: 'DENTAL FLOSS', qty: 1, cadence: 'M' },
  { no: 4, group: 'HYGIENE', nomenclature: 'BAR SOAP', qty: 2, cadence: 'M' },
  { no: 5, group: 'HYGIENE', nomenclature: 'SHAMPOO', qty: 1, cadence: 'M' },
  { no: 6, group: 'HYGIENE', nomenclature: 'DEODORANT', qty: 1, cadence: 'M' },
  { no: 7, group: 'HYGIENE', nomenclature: 'RAZOR CARTRIDGES', qty: 4, cadence: 'M' },
  { no: 8, group: 'HYGIENE', nomenclature: 'LIP BALM', qty: 1, cadence: 'Q' },
  { no: 9, group: 'HYGIENE', nomenclature: 'HAND SANITIZER', qty: 1, cadence: 'Q' },
  { no: 10, group: 'HYGIENE', nomenclature: 'NAIL CLIPPER', qty: 1, cadence: 'A' },
  { no: 11, group: 'APPAREL', nomenclature: 'UNDERWEAR', qty: 3, cadence: 'Q' },
  { no: 12, group: 'APPAREL', nomenclature: 'SOCKS, PAIR', qty: 3, cadence: 'Q' },
  { no: 13, group: 'APPAREL', nomenclature: 'T-SHIRT, UNDER', qty: 2, cadence: 'S' },
  { no: 14, group: 'APPAREL', nomenclature: 'WASHCLOTH', qty: 2, cadence: 'S' },
  { no: 15, group: 'APPAREL', nomenclature: 'TOWEL, BATH', qty: 1, cadence: 'A' },
  { no: 16, group: 'PROVISION', nomenclature: 'COFFEE OR TEA', qty: 1, cadence: 'M' },
  { no: 17, group: 'PROVISION', nomenclature: 'RATION BAR', qty: 6, cadence: 'M' },
  { no: 18, group: 'PROVISION', nomenclature: 'MINERAL PACKETS', qty: 10, cadence: 'M' },
  { no: 19, group: 'PROVISION', nomenclature: 'NUTS, TIN', qty: 1, cadence: 'M' },
  { no: 20, group: 'KIT', nomenclature: 'NOTEBOOK, GRID', qty: 1, cadence: 'Q' },
  { no: 21, group: 'KIT', nomenclature: 'PEN, BLACK', qty: 2, cadence: 'Q' },
  { no: 22, group: 'KIT', nomenclature: 'EARPLUGS, PAIR', qty: 2, cadence: 'M' },
  { no: 23, group: 'KIT', nomenclature: 'MANIFEST CARD', qty: 1, cadence: 'M' },
]

export const PRICE_USD_PER_MONTH = 100
export const COGS_CEILING_USD = 40
export const MARGIN_FLOOR = 0.6

export const DOCTRINE = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'THE OPERATOR IS ON STRENGTH.',
  'ONE BOX. 23 ITEMS. FIXED LOAD. FIXED CADENCE.',
  'THE LEDGER IS THE MARKETING. NOTHING SITS BETWEEN PUBLIC AND MANIFEST.',
]

export const itemsIssuedIn = (month: number): RationItem[] =>
  RATION_LOAD.filter((i) => CADENCE_MONTHS[i.cadence].includes(month))

export type RationState = 'USERSHIP' | 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE'
