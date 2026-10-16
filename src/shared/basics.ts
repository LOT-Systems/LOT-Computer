/**
 * LOT-FM-001 — BASIC (RATION) manifest.
 * Public ledger: nomenclature + cadence only. COGS is never stored here.
 * STATUS: PROVISIONAL — 23-item load drafted from the FMCG plan (toothbrush,
 * underwear, packaged goods, hygiene paper); S-2 to ratify against LOT-FM-001.
 */

export type RationCadence = 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL'
export type RationGroup = 'HYGIENE' | 'APPAREL' | 'PROVISION' | 'PAPER' | 'KIT'

export type RationItem = {
  no: number
  group: RationGroup
  nomenclature: string
  qty: number
  cadence: RationCadence
}

export const RATION_PRICE_USD = 100
export const RATION_MIN_MARGIN = 0.6
// Landed-cost ceiling: price x (1 - min margin). Never breached.
export const RATION_LANDED_CEILING_USD = RATION_PRICE_USD * (1 - RATION_MIN_MARGIN)

export const RATION_MANIFEST: RationItem[] = [
  { no: 1, group: 'HYGIENE', nomenclature: 'TOOTHBRUSH, MANUAL', qty: 1, cadence: 'QUARTERLY' },
  { no: 2, group: 'HYGIENE', nomenclature: 'TOOTHPASTE, 100ML', qty: 1, cadence: 'MONTHLY' },
  { no: 3, group: 'HYGIENE', nomenclature: 'DENTAL FLOSS, 50M', qty: 1, cadence: 'MONTHLY' },
  { no: 4, group: 'HYGIENE', nomenclature: 'SOAP BAR', qty: 2, cadence: 'MONTHLY' },
  { no: 5, group: 'HYGIENE', nomenclature: 'SHAMPOO, 250ML', qty: 1, cadence: 'MONTHLY' },
  { no: 6, group: 'HYGIENE', nomenclature: 'DEODORANT, STICK', qty: 1, cadence: 'MONTHLY' },
  { no: 7, group: 'HYGIENE', nomenclature: 'RAZOR CARTRIDGE', qty: 4, cadence: 'MONTHLY' },
  { no: 8, group: 'HYGIENE', nomenclature: 'HAND SANITIZER, 100ML', qty: 1, cadence: 'QUARTERLY' },
  { no: 9, group: 'HYGIENE', nomenclature: 'NAIL CLIPPER', qty: 1, cadence: 'BIANNUAL' },
  { no: 10, group: 'APPAREL', nomenclature: 'UNDERWEAR, COTTON', qty: 3, cadence: 'QUARTERLY' },
  { no: 11, group: 'APPAREL', nomenclature: 'SOCKS, CREW (PAIR)', qty: 3, cadence: 'QUARTERLY' },
  { no: 12, group: 'APPAREL', nomenclature: 'T-SHIRT, BLACK', qty: 1, cadence: 'QUARTERLY' },
  { no: 13, group: 'APPAREL', nomenclature: 'T-SHIRT, WHITE', qty: 1, cadence: 'QUARTERLY' },
  { no: 14, group: 'PAPER', nomenclature: 'TISSUE, FACIAL', qty: 2, cadence: 'MONTHLY' },
  { no: 15, group: 'PAPER', nomenclature: 'TOILET PAPER, 4 ROLL', qty: 1, cadence: 'MONTHLY' },
  { no: 16, group: 'PAPER', nomenclature: 'PAPER TOWEL, 2 ROLL', qty: 1, cadence: 'MONTHLY' },
  { no: 17, group: 'PAPER', nomenclature: 'WIPES, UNSCENTED', qty: 1, cadence: 'MONTHLY' },
  { no: 18, group: 'PROVISION', nomenclature: 'OATS, 500G', qty: 1, cadence: 'MONTHLY' },
  { no: 19, group: 'PROVISION', nomenclature: 'NUTS, MIXED, 200G', qty: 1, cadence: 'MONTHLY' },
  { no: 20, group: 'PROVISION', nomenclature: 'TEA, 20 BAG', qty: 1, cadence: 'MONTHLY' },
  { no: 21, group: 'PROVISION', nomenclature: 'SALT, SEA, 250G', qty: 1, cadence: 'BIANNUAL' },
  { no: 22, group: 'KIT', nomenclature: 'FIRST-AID PATCH SET', qty: 1, cadence: 'BIANNUAL' },
  { no: 23, group: 'KIT', nomenclature: 'MANIFEST CARD, PRINTED', qty: 1, cadence: 'MONTHLY' },
]

export type RationState = 'USERSHIP/AI' | 'PENDING' | 'ON STRENGTH' | 'STEADY STATE'

/** Items issued in a given issue number (1-based). Month 3 load engine seed. */
export const itemsForIssue = (issue: number): RationItem[] =>
  RATION_MANIFEST.filter((i) => {
    if (i.cadence === 'MONTHLY') return true
    if (i.cadence === 'QUARTERLY') return (issue - 1) % 3 === 0
    return (issue - 1) % 6 === 0
  })
