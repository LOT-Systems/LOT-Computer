/**
 * LOT-FM-001 / BASIC RATION — PUBLIC MANIFEST (23 items)
 * Public fields only. COGS is withheld by design and never enters this file.
 * Cadence codes: M monthly · B every 2nd month · Q quarterly · S semi-annual
 */

export type Cadence = 'M' | 'B' | 'Q' | 'S'

export type ManifestItem = {
  no: number
  group: 'HYGIENE' | 'PAPER' | 'APPAREL' | 'HOME' | 'FIELD' | 'RECORD'
  nomenclature: string
  qty: string
  cadence: Cadence
}

export const CADENCE_LABEL: Record<Cadence, string> = {
  M: 'EVERY ISSUE',
  B: 'EVERY 2ND ISSUE',
  Q: 'EVERY 3RD ISSUE',
  S: 'EVERY 6TH ISSUE',
}

export const CADENCE_INTERVAL: Record<Cadence, number> = { M: 1, B: 2, Q: 3, S: 6 }

export const BASIC_PRICE_USD = 100
export const BASIC_LANDED_CEILING_USD = 40
export const BASIC_MARGIN_FLOOR = 0.6

export const BASIC_MANIFEST: ManifestItem[] = [
  { no: 1, group: 'HYGIENE', nomenclature: 'TOOTHBRUSH, MANUAL', qty: '1', cadence: 'Q' },
  { no: 2, group: 'HYGIENE', nomenclature: 'TOOTHPASTE, 100ML', qty: '1', cadence: 'Q' },
  { no: 3, group: 'HYGIENE', nomenclature: 'DENTAL FLOSS, 50M', qty: '1', cadence: 'Q' },
  { no: 4, group: 'HYGIENE', nomenclature: 'SOAP, BAR, 100G', qty: '2', cadence: 'B' },
  { no: 5, group: 'HYGIENE', nomenclature: 'SHAMPOO, 250ML', qty: '1', cadence: 'B' },
  { no: 6, group: 'HYGIENE', nomenclature: 'DEODORANT, STICK', qty: '1', cadence: 'B' },
  { no: 7, group: 'HYGIENE', nomenclature: 'RAZOR CARTRIDGE', qty: '4', cadence: 'Q' },
  { no: 8, group: 'HYGIENE', nomenclature: 'LIP BALM', qty: '1', cadence: 'Q' },
  { no: 9, group: 'HYGIENE', nomenclature: 'HAND SANITIZER, 60ML', qty: '1', cadence: 'Q' },
  { no: 10, group: 'PAPER', nomenclature: 'TOILET PAPER, ROLL', qty: '6', cadence: 'M' },
  { no: 11, group: 'PAPER', nomenclature: 'PAPER TOWEL, ROLL', qty: '2', cadence: 'B' },
  { no: 12, group: 'PAPER', nomenclature: 'TISSUE, BOX', qty: '1', cadence: 'B' },
  { no: 13, group: 'APPAREL', nomenclature: 'UNDERWEAR, COTTON', qty: '3', cadence: 'Q' },
  { no: 14, group: 'APPAREL', nomenclature: 'SOCKS, PAIR', qty: '3', cadence: 'Q' },
  { no: 15, group: 'APPAREL', nomenclature: 'UNDERSHIRT, COTTON', qty: '2', cadence: 'S' },
  { no: 16, group: 'HOME', nomenclature: 'DISH SOAP, 250ML', qty: '1', cadence: 'B' },
  { no: 17, group: 'HOME', nomenclature: 'LAUNDRY PODS', qty: '16', cadence: 'B' },
  { no: 18, group: 'HOME', nomenclature: 'TRASH BAG', qty: '15', cadence: 'B' },
  { no: 19, group: 'HOME', nomenclature: 'BATTERY, AA', qty: '4', cadence: 'Q' },
  { no: 20, group: 'FIELD', nomenclature: 'PROTEIN BAR', qty: '6', cadence: 'M' },
  { no: 21, group: 'FIELD', nomenclature: 'MEAL, SHELF-STABLE', qty: '2', cadence: 'M' },
  { no: 22, group: 'FIELD', nomenclature: 'ELECTROLYTE SACHET', qty: '10', cadence: 'B' },
  { no: 23, group: 'RECORD', nomenclature: 'MANIFEST CARD, PRINTED', qty: '1', cadence: 'M' },
]

/** Items that ship in issue n (1-based). Issue 1 ships all 23. */
export const itemsForIssue = (n: number): ManifestItem[] =>
  BASIC_MANIFEST.filter((i) => (n - 1) % CADENCE_INTERVAL[i.cadence] === 0)

export const DOCTRINE = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'THE OPERATOR IS ON STRENGTH.',
  'ONE BOX. ONE CADENCE. 23 LINES.',
  'THE LEDGER IS THE MARKETING.',
]
