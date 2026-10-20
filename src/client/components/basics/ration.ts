/**
 * LOT-FM-001 — BASIC (RATION) load. PROVISIONAL manifest, issue 01.
 * Public fields only: nomenclature + cadence. COGS is withheld by doctrine
 * and never ships in client code.
 */

export type Cadence = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL' | 'ONCE'

export type RationItem = {
  no: number
  nomenclature: string
  cadence: Cadence
}

export const PRICE_USD_MONTH = 100

export const RATION: RationItem[] = [
  { no: 1, nomenclature: 'SOCK, CREW, BLACK, PAIR x3', cadence: 'QUARTERLY' },
  { no: 2, nomenclature: 'UNDERSHIRT, CREW, WHITE x2', cadence: 'QUARTERLY' },
  { no: 3, nomenclature: 'BRIEF, BLACK x3', cadence: 'QUARTERLY' },
  { no: 4, nomenclature: 'T-SHIRT, LOT, BLACK', cadence: 'SEMIANNUAL' },
  { no: 5, nomenclature: 'TOWEL, HAND, WHITE', cadence: 'ANNUAL' },
  { no: 6, nomenclature: 'TOOTHBRUSH, MEDIUM x2', cadence: 'QUARTERLY' },
  { no: 7, nomenclature: 'TOOTHPASTE, FLUORIDE', cadence: 'MONTHLY' },
  { no: 8, nomenclature: 'FLOSS, WAXED', cadence: 'MONTHLY' },
  { no: 9, nomenclature: 'SOAP, BAR, UNSCENTED', cadence: 'MONTHLY' },
  { no: 10, nomenclature: 'SHAMPOO, UNSCENTED', cadence: 'MONTHLY' },
  { no: 11, nomenclature: 'DEODORANT, STICK', cadence: 'MONTHLY' },
  { no: 12, nomenclature: 'RAZOR, SAFETY, CARTRIDGE x4', cadence: 'QUARTERLY' },
  { no: 13, nomenclature: 'NAIL CLIPPER, STEEL', cadence: 'ANNUAL' },
  { no: 14, nomenclature: 'COMB, POCKET', cadence: 'ANNUAL' },
  { no: 15, nomenclature: 'LIP BALM, UNSCENTED', cadence: 'QUARTERLY' },
  { no: 16, nomenclature: 'SUNSCREEN, SPF 30', cadence: 'SEMIANNUAL' },
  { no: 17, nomenclature: 'BANDAGE, ASSORTED x20', cadence: 'QUARTERLY' },
  { no: 18, nomenclature: 'ELECTROLYTE PACKET x8', cadence: 'MONTHLY' },
  { no: 19, nomenclature: 'WATER BOTTLE, STEEL, 750ML', cadence: 'ONCE' },
  { no: 20, nomenclature: 'NOTEBOOK, GRID, A6', cadence: 'QUARTERLY' },
  { no: 21, nomenclature: 'PEN, BLACK x2', cadence: 'QUARTERLY' },
  { no: 22, nomenclature: 'CABLE, USB-C, 1M, BLACK', cadence: 'ONCE' },
  { no: 23, nomenclature: 'MANIFEST CARD, PRINTED', cadence: 'MONTHLY' },
]

export const CADENCE_CODE: Record<Cadence, string> = {
  MONTHLY: 'M',
  QUARTERLY: 'Q',
  SEMIANNUAL: 'S',
  ANNUAL: 'A',
  ONCE: '1',
}
