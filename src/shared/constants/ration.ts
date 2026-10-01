/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / MODULE BASIC (RATION)
 * Manifest data. Nomenclature + cadence are public. COGS is NEVER stored here.
 * STATUS: PROVISIONAL — item list drafted from doctrine; reconcile against
 * the issued LOT-FM-001 manual when it is committed to the repo.
 */

export type RationCadence = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL' | 'ONCE'
export type RationGroup = 'HYGIENE' | 'WEAR' | 'FIELD' | 'SYSTEM'

export type RationItem = {
  id: number
  nomenclature: string
  group: RationGroup
  qty: number
  cadence: RationCadence
}

export const RATION_PRICE_USD = 100
export const RATION_MARGIN_FLOOR = 0.6
export const RATION_LANDED_CEILING_USD = 40
export const RATION_STATUS_SPEC = 'PROVISIONAL' as const

export const RATION_DOCTRINE = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'THE USER IS ON STRENGTH.',
  'THE LEDGER IS THE MARKETING.',
  'WHAT IS ISSUED IS LISTED. WHAT IS LISTED IS ISSUED.',
]

export const RATION_MANIFEST: readonly RationItem[] = [
  { id: 1, nomenclature: 'TOOTHBRUSH', group: 'HYGIENE', qty: 1, cadence: 'QUARTERLY' },
  { id: 2, nomenclature: 'TOOTHPASTE, 75ML', group: 'HYGIENE', qty: 1, cadence: 'MONTHLY' },
  { id: 3, nomenclature: 'FLOSS, 50M', group: 'HYGIENE', qty: 1, cadence: 'MONTHLY' },
  { id: 4, nomenclature: 'SOAP, BAR', group: 'HYGIENE', qty: 1, cadence: 'MONTHLY' },
  { id: 5, nomenclature: 'SHAMPOO, BAR', group: 'HYGIENE', qty: 1, cadence: 'MONTHLY' },
  { id: 6, nomenclature: 'DEODORANT, STICK', group: 'HYGIENE', qty: 1, cadence: 'MONTHLY' },
  { id: 7, nomenclature: 'RAZOR CARTRIDGE', group: 'HYGIENE', qty: 2, cadence: 'MONTHLY' },
  { id: 8, nomenclature: 'LIP BALM', group: 'HYGIENE', qty: 1, cadence: 'QUARTERLY' },
  { id: 9, nomenclature: 'HAND CREAM, 50ML', group: 'HYGIENE', qty: 1, cadence: 'MONTHLY' },
  { id: 10, nomenclature: 'SUNSCREEN, SPF50', group: 'HYGIENE', qty: 1, cadence: 'QUARTERLY' },
  { id: 11, nomenclature: 'SOCKS, PAIR', group: 'WEAR', qty: 2, cadence: 'QUARTERLY' },
  { id: 12, nomenclature: 'UNDERSHIRT, BLACK', group: 'WEAR', qty: 1, cadence: 'QUARTERLY' },
  { id: 13, nomenclature: 'BRIEFS, BLACK', group: 'WEAR', qty: 1, cadence: 'QUARTERLY' },
  { id: 14, nomenclature: 'NOTEBOOK, GRID', group: 'FIELD', qty: 1, cadence: 'QUARTERLY' },
  { id: 15, nomenclature: 'PEN, BLACK', group: 'FIELD', qty: 2, cadence: 'MONTHLY' },
  { id: 16, nomenclature: 'EARPLUGS, PAIR', group: 'FIELD', qty: 2, cadence: 'MONTHLY' },
  { id: 17, nomenclature: 'ELECTROLYTE, PACKET', group: 'FIELD', qty: 10, cadence: 'MONTHLY' },
  { id: 18, nomenclature: 'TEA, LOOSE, 50G', group: 'FIELD', qty: 1, cadence: 'MONTHLY' },
  { id: 19, nomenclature: 'MULTIVITAMIN, 30D', group: 'FIELD', qty: 1, cadence: 'MONTHLY' },
  { id: 20, nomenclature: 'BANDAGE KIT', group: 'FIELD', qty: 1, cadence: 'SEMIANNUAL' },
  { id: 21, nomenclature: 'CABLE, USB-C, 1M', group: 'SYSTEM', qty: 1, cadence: 'ANNUAL' },
  { id: 22, nomenclature: 'FLASH DRIVE, LOT OS', group: 'SYSTEM', qty: 1, cadence: 'ONCE' },
  { id: 23, nomenclature: 'MANIFEST CARD, PRINTED', group: 'SYSTEM', qty: 1, cadence: 'MONTHLY' },
]

export const RATION_CADENCE_ORDER: RationCadence[] = [
  'MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL', 'ONCE',
]

/** Line count in a given issue month (1-based). ONCE = issue 1 only. */
export function itemsInIssue(month: number): RationItem[] {
  return RATION_MANIFEST.filter((i) => {
    switch (i.cadence) {
      case 'MONTHLY': return true
      case 'QUARTERLY': return (month - 1) % 3 === 0
      case 'SEMIANNUAL': return (month - 1) % 6 === 0
      case 'ANNUAL': return (month - 1) % 12 === 0
      case 'ONCE': return month === 1
    }
  })
}
