/**
 * LOT-FM-001 / BASIC (RATION) — public manifest.
 * Nomenclature + cadence only. COGS is withheld (kept in docs/basics/, never bundled).
 * PROVISIONAL: source manual not in repo; nomenclature to be reconciled with S-2.
 */

export type Cadence = 'M' | 'Q' | 'S' | 'A'

export const CADENCE_LABEL: Record<Cadence, string> = {
  M: 'MONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMIANNUAL',
  A: 'ANNUAL',
}

// Months between issues, and the month offset the item first ships in (1-based).
export const CADENCE_PERIOD: Record<Cadence, number> = { M: 1, Q: 3, S: 6, A: 12 }

export type ManifestItem = {
  no: number
  nomenclature: string
  qty: number
  cadence: Cadence
  group: 'HYGIENE' | 'GROOM' | 'WEAR' | 'KIT'
}

export const MANIFEST: ManifestItem[] = [
  { no: 1, nomenclature: 'TOOTHBRUSH, SOFT', qty: 1, cadence: 'Q', group: 'HYGIENE' },
  { no: 2, nomenclature: 'TOOTHPASTE, 100G', qty: 1, cadence: 'M', group: 'HYGIENE' },
  { no: 3, nomenclature: 'FLOSS, 50M', qty: 1, cadence: 'M', group: 'HYGIENE' },
  { no: 4, nomenclature: 'SOAP BAR, 100G', qty: 1, cadence: 'M', group: 'HYGIENE' },
  { no: 5, nomenclature: 'SHAMPOO BAR', qty: 1, cadence: 'M', group: 'HYGIENE' },
  { no: 6, nomenclature: 'DEODORANT STICK', qty: 1, cadence: 'M', group: 'HYGIENE' },
  { no: 7, nomenclature: 'HAND SANITIZER, 60ML', qty: 1, cadence: 'M', group: 'HYGIENE' },
  { no: 8, nomenclature: 'TISSUE, POCKET', qty: 6, cadence: 'M', group: 'HYGIENE' },
  { no: 9, nomenclature: 'LAUNDRY SHEET', qty: 8, cadence: 'M', group: 'HYGIENE' },
  { no: 10, nomenclature: 'RAZOR CARTRIDGE', qty: 4, cadence: 'M', group: 'GROOM' },
  { no: 11, nomenclature: 'LIP BALM', qty: 1, cadence: 'Q', group: 'GROOM' },
  { no: 12, nomenclature: 'SUNSCREEN, 50ML', qty: 1, cadence: 'Q', group: 'GROOM' },
  { no: 13, nomenclature: 'NAIL CLIPPER', qty: 1, cadence: 'A', group: 'GROOM' },
  { no: 14, nomenclature: 'COMB', qty: 1, cadence: 'A', group: 'GROOM' },
  { no: 15, nomenclature: 'UNDERWEAR, COTTON', qty: 3, cadence: 'Q', group: 'WEAR' },
  { no: 16, nomenclature: 'SOCKS, CREW', qty: 3, cadence: 'Q', group: 'WEAR' },
  { no: 17, nomenclature: 'UNDERSHIRT', qty: 2, cadence: 'S', group: 'WEAR' },
  { no: 18, nomenclature: 'TEE, HEAVYWEIGHT', qty: 1, cadence: 'S', group: 'WEAR' },
  { no: 19, nomenclature: 'WASHCLOTH', qty: 2, cadence: 'S', group: 'WEAR' },
  { no: 20, nomenclature: 'HAND TOWEL', qty: 1, cadence: 'A', group: 'WEAR' },
  { no: 21, nomenclature: 'EARPLUGS, PAIR', qty: 4, cadence: 'M', group: 'KIT' },
  { no: 22, nomenclature: 'BANDAGE KIT', qty: 1, cadence: 'Q', group: 'KIT' },
  { no: 23, nomenclature: 'WATER PURIFICATION TAB', qty: 20, cadence: 'S', group: 'KIT' },
]

export const PRICE_USD_MONTH = 100
export const DOCTRINE =
  'LOT ISSUES. LOT DOES NOT SELL. THE SUBSCRIBER IS ON STRENGTH. ' +
  'THE LEDGER IS THE MARKETING. NO LAYER BETWEEN PUBLIC AND MANIFEST.'

/** Items shipped in issue month n (1-based). Issue 1 ships everything (initial load). */
export const itemsForIssue = (n: number): ManifestItem[] =>
  MANIFEST.filter((i) => n === 1 || (n - 1) % CADENCE_PERIOD[i.cadence] === 0)
