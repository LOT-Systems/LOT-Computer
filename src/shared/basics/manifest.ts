/**
 * LOT-FM-001 — BASIC (RATION) public manifest.
 * Public surface only: nomenclature + cadence. COGS is withheld and lives in
 * scripts/basics/cogs.ts (never imported by client code).
 * STATUS: DRAFT-01 — nomenclature pending reconciliation with LOT-FM-001 text.
 */

export const BASIC_PRICE_USD = 100
export const BASIC_ITEM_COUNT = 23

export type Cadence = 1 | 2 | 3 | 6 | 12

export type ManifestItem = {
  id: string
  nomenclature: string
  qty: string
  cadence: Cadence
  group: 'HYGIENE' | 'ISSUE' | 'GARMENT' | 'SUSTAIN' | 'ADMIN'
}

export const BASIC_MANIFEST: ManifestItem[] = [
  { id: 'B-01', nomenclature: 'TOOTHBRUSH', qty: '1', cadence: 3, group: 'HYGIENE' },
  { id: 'B-02', nomenclature: 'TOOTHPASTE', qty: '1', cadence: 1, group: 'HYGIENE' },
  { id: 'B-03', nomenclature: 'FLOSS', qty: '1', cadence: 1, group: 'HYGIENE' },
  { id: 'B-04', nomenclature: 'TONGUE SCRAPER', qty: '1', cadence: 6, group: 'HYGIENE' },
  { id: 'B-05', nomenclature: 'BAR SOAP', qty: '2', cadence: 1, group: 'HYGIENE' },
  { id: 'B-06', nomenclature: 'SHAMPOO', qty: '1', cadence: 2, group: 'HYGIENE' },
  { id: 'B-07', nomenclature: 'DEODORANT', qty: '1', cadence: 1, group: 'HYGIENE' },
  { id: 'B-08', nomenclature: 'RAZOR CARTRIDGE', qty: '4', cadence: 3, group: 'HYGIENE' },
  { id: 'B-09', nomenclature: 'NAIL CLIPPER', qty: '1', cadence: 12, group: 'HYGIENE' },
  { id: 'B-10', nomenclature: 'LIP BALM', qty: '1', cadence: 3, group: 'HYGIENE' },
  { id: 'B-11', nomenclature: 'SUNSCREEN', qty: '1', cadence: 3, group: 'HYGIENE' },
  { id: 'B-12', nomenclature: 'BANDAGE ASSORTED', qty: '1', cadence: 3, group: 'HYGIENE' },
  { id: 'B-13', nomenclature: 'EARPLUG PAIR', qty: '2', cadence: 3, group: 'HYGIENE' },
  { id: 'B-14', nomenclature: 'WASHCLOTH', qty: '2', cadence: 6, group: 'ISSUE' },
  { id: 'B-15', nomenclature: 'LAUNDRY STRIP', qty: '1', cadence: 1, group: 'ISSUE' },
  { id: 'B-16', nomenclature: 'TISSUE POCKET', qty: '1', cadence: 1, group: 'ISSUE' },
  { id: 'B-17', nomenclature: 'UNDERWEAR', qty: '2', cadence: 3, group: 'GARMENT' },
  { id: 'B-18', nomenclature: 'SOCKS', qty: '2', cadence: 3, group: 'GARMENT' },
  { id: 'B-19', nomenclature: 'UNDERSHIRT', qty: '1', cadence: 6, group: 'GARMENT' },
  { id: 'B-20', nomenclature: 'RATION BAR', qty: '4', cadence: 1, group: 'SUSTAIN' },
  { id: 'B-21', nomenclature: 'ELECTROLYTE SACHET', qty: '6', cadence: 1, group: 'SUSTAIN' },
  { id: 'B-22', nomenclature: 'COFFEE SACHET', qty: '6', cadence: 1, group: 'SUSTAIN' },
  { id: 'B-23', nomenclature: 'MANIFEST CARD', qty: '1', cadence: 1, group: 'ADMIN' },
]

export const cadenceLabel = (c: Cadence): string =>
  c === 1 ? 'MONTHLY' : c === 12 ? 'ANNUAL' : `EVERY ${c} MO`

/** Items falling due in issue month n (1-based; issue 1 carries the full load). */
export const itemsDueInIssue = (n: number): ManifestItem[] =>
  BASIC_MANIFEST.filter((i) => (n - 1) % i.cadence === 0)

export const DOCTRINE = [
  'ISSUE, DO NOT SELL. THE OPERATOR IS ON STRENGTH.',
  'ONE RATION. 23 ITEMS. ISSUED ON CADENCE. NO SUBSTITUTION. NO UPSELL.',
  'THE LEDGER IS THE MARKETING. NO LAYER BETWEEN PUBLIC AND MANIFEST.',
  'STAND DOWN AT ANY TIME. THE RATION STOPS. THE INTELLIGENCE REMAINS.',
]

/** Month 2 contract — declared now so the ledger can show state vocabulary. */
export const BASIC_STATES = [
  'USERSHIP/AI',
  'PENDING',
  'ON STRENGTH',
  'STEADY STATE',
] as const
export type BasicState = (typeof BASIC_STATES)[number]
