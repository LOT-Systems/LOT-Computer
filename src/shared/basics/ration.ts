/**
 * LOT-FM-001 / BASIC (RATION) — public ledger data.
 * COGS is withheld by design: nothing in this file carries cost.
 * PROVISIONAL: nomenclature pending S-2 confirmation against LOT-FM-001.
 */

export const BASIC_PRICE_USD = 100
export const BASIC_MARGIN_FLOOR = 0.6
export const BASIC_LANDED_CEILING_USD = 40

export type Cadence = 1 | 3 | 6 | 12 // months between issues

export type RationItem = {
  no: number
  nomenclature: string
  qty: number
  cadence: Cadence
}

export const CADENCE_LABEL: Record<Cadence, string> = {
  1: 'MONTHLY',
  3: 'QUARTERLY',
  6: 'SEMIANNUAL',
  12: 'ANNUAL',
}

const item = (
  no: number,
  nomenclature: string,
  qty: number,
  cadence: Cadence
): RationItem => ({ no, nomenclature, qty, cadence })

export const RATION_MANIFEST: readonly RationItem[] = [
  item(1, 'TOOTHBRUSH, MANUAL', 1, 3),
  item(2, 'TOOTHPASTE, FLUORIDE', 1, 1),
  item(3, 'FLOSS, WAXED', 1, 1),
  item(4, 'DEODORANT, STICK', 1, 1),
  item(5, 'SOAP, BAR', 2, 1),
  item(6, 'SHAMPOO', 1, 1),
  item(7, 'BODY WASH', 1, 1),
  item(8, 'RAZOR CARTRIDGE, 4PK', 1, 1),
  item(9, 'LIP BALM', 1, 3),
  item(10, 'HAND CREAM', 1, 3),
  item(11, 'SUNSCREEN, SPF 30', 1, 3),
  item(12, 'BRIEF, 3PK', 1, 6),
  item(13, 'SOCK, CREW, 3PK', 1, 3),
  item(14, 'T-SHIRT, BASE LAYER', 1, 6),
  item(15, 'WASHCLOTH', 2, 6),
  item(16, 'TOWEL, BATH', 1, 12),
  item(17, 'COFFEE, WHOLE BEAN', 1, 1),
  item(18, 'TEA, LOOSE LEAF', 1, 1),
  item(19, 'ELECTROLYTE SACHET, 10CT', 1, 1),
  item(20, 'OATS, ROLLED', 1, 1),
  item(21, 'SALT, FLAKE', 1, 3),
  item(22, 'BAG, UTILITY', 1, 12),
  item(23, 'MANIFEST CARD, PRINTED', 1, 1),
] as const

export const DOCTRINE: readonly string[] = [
  'ISSUE, DO NOT SELL.',
  'THE USER IS ON STRENGTH.',
  'ONE LOAD. ONE PRICE. ONE MONTH.',
  'THE LEDGER IS THE MARKETING.',
]

/** Items issued in a given 1-indexed issue month. Month 1 issues everything. */
export const loadForMonth = (month: number): RationItem[] =>
  RATION_MANIFEST.filter((i) => (month - 1) % i.cadence === 0)

export const pad = (s: string | number, n: number, right = false) =>
  right ? String(s).padStart(n) : String(s).padEnd(n)
