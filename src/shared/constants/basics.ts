/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — BASIC (RATION) MODULE
 * Public doctrine + 23-item ration load. PUBLIC FILE.
 *
 * COGS IS WITHHELD. Unit costs live server-side only in
 * src/server/basics/cogs.ts and must never be imported by client code.
 *
 * Cadence model: an item is issued in cycle month m (1..12) when
 *   (m - 1 - offset) mod period === 0
 * period 1 = every issue, 3 = quarterly, 6 = semiannual, 12 = annual.
 * Offsets stagger rotating items so no single issue breaches the
 * USD 40 landed ceiling (verified by scripts/basics-envelope-check.ts).
 */

export const BASIC_MODULE = {
  doc: 'LOT-FM-001',
  module: 'BASIC',
  designation: 'CIVILIAN RATION',
  revision: 'REV 0 / M1',
  priceUsdMonthly: 100,
  ceilingUsdLanded: 40,
  marginFloor: 0.6,
  itemCount: 23,
  cycleMonths: 12,
} as const

export const BASIC_DOCTRINE: readonly string[] = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'ONE LOAD. TWENTY-THREE ITEMS. ONE CADENCE.',
  'THE MEMBER IS CARRIED ON STRENGTH. THE RATION ARRIVES.',
  'NO CHOICE FATIGUE. NO CART. NO RESTOCK DECISION.',
  'THE LEDGER IS PUBLIC. WHAT IS LISTED IS WHAT IS ISSUED.',
  'STAND DOWN AT ANY TIME. THE AI PLAN IS RETAINED.',
]

export const BASIC_TERMS: readonly { label: string; value: string }[] = [
  { label: 'RATE', value: 'USD 100 / MONTH' },
  { label: 'BILLING', value: 'ADDITIVE TO USERSHIP' },
  { label: 'PREREQUISITE', value: 'LOT USERSHIP (AI PLAN)' },
  { label: 'ISSUE', value: 'MONTHLY · ONE CONTAINER' },
  { label: 'THEATER', value: 'USA · DOMESTIC' },
  { label: 'STAND DOWN', value: 'ANY TIME · NO PENALTY' },
]

export type BasicCadence = { period: 1 | 3 | 6 | 12; offset: number }

export type BasicItem = {
  ln: string // line number, zero-padded
  nomenclature: string // NOUN, MODIFIER, MODIFIER
  qty: number
  ui: string // unit of issue
  cadence: BasicCadence
  category: 'HYG' | 'GAR' | 'SUS' | 'MED' | 'EQP'
}

const every = (period: BasicCadence['period'], offset = 0): BasicCadence => ({ period, offset })

export const BASIC_MANIFEST: readonly BasicItem[] = [
  { ln: '01', nomenclature: 'SOCKS, CREW, WOOL BLEND, BLACK', qty: 1, ui: 'PR', cadence: every(1), category: 'GAR' },
  { ln: '02', nomenclature: 'SHIRT, T, CREW, COTTON, BLACK', qty: 1, ui: 'EA', cadence: every(6, 0), category: 'GAR' },
  { ln: '03', nomenclature: 'BRIEFS, COTTON, BLACK', qty: 2, ui: 'EA', cadence: every(6, 3), category: 'GAR' },
  { ln: '04', nomenclature: 'TOOTHPASTE, FLUORIDE, 100 ML', qty: 1, ui: 'TU', cadence: every(1), category: 'HYG' },
  { ln: '05', nomenclature: 'TOOTHBRUSH, SOFT, MANUAL', qty: 1, ui: 'EA', cadence: every(3, 1), category: 'HYG' },
  { ln: '06', nomenclature: 'FLOSS, DENTAL, WAXED, 50 M', qty: 1, ui: 'EA', cadence: every(3, 2), category: 'HYG' },
  { ln: '07', nomenclature: 'SOAP, BAR, UNSCENTED', qty: 1, ui: 'BR', cadence: every(1), category: 'HYG' },
  { ln: '08', nomenclature: 'SHAMPOO, UNSCENTED, 250 ML', qty: 1, ui: 'BT', cadence: every(1), category: 'HYG' },
  { ln: '09', nomenclature: 'DEODORANT, STICK, UNSCENTED', qty: 1, ui: 'EA', cadence: every(1), category: 'HYG' },
  { ln: '10', nomenclature: 'CARTRIDGE, RAZOR, 5-BLADE', qty: 2, ui: 'EA', cadence: every(1), category: 'HYG' },
  { ln: '11', nomenclature: 'SUNSCREEN, SPF 50, 100 ML', qty: 1, ui: 'TU', cadence: every(6, 4), category: 'MED' },
  { ln: '12', nomenclature: 'BALM, LIP, SPF 15', qty: 1, ui: 'EA', cadence: every(3, 0), category: 'MED' },
  { ln: '13', nomenclature: 'SALVE, HAND, 75 ML', qty: 1, ui: 'TU', cadence: every(6, 2), category: 'HYG' },
  { ln: '14', nomenclature: 'ELECTROLYTE, POWDER, SACHET', qty: 10, ui: 'EA', cadence: every(1), category: 'SUS' },
  { ln: '15', nomenclature: 'MULTIVITAMIN, TABLET', qty: 30, ui: 'EA', cadence: every(1), category: 'SUS' },
  { ln: '16', nomenclature: 'COFFEE, WHOLE BEAN, 250 G', qty: 1, ui: 'BG', cadence: every(1), category: 'SUS' },
  { ln: '17', nomenclature: 'TEA, BLACK, BAGGED', qty: 25, ui: 'EA', cadence: every(1), category: 'SUS' },
  { ln: '18', nomenclature: 'BANDAGE, ADHESIVE, ASSORTED', qty: 20, ui: 'EA', cadence: every(6, 5), category: 'MED' },
  { ln: '19', nomenclature: 'BATTERY, AA, ALKALINE', qty: 4, ui: 'EA', cadence: every(6, 1), category: 'EQP' },
  { ln: '20', nomenclature: 'NOTEBOOK, FIELD, 48 PG', qty: 1, ui: 'EA', cadence: every(1), category: 'EQP' },
  { ln: '21', nomenclature: 'PENCIL, GRAPHITE, NO. 2', qty: 2, ui: 'EA', cadence: every(3, 2), category: 'EQP' },
  { ln: '22', nomenclature: 'MATCHES, SAFETY, BOOK', qty: 1, ui: 'PK', cadence: every(6, 4), category: 'EQP' },
  { ln: '23', nomenclature: 'BAG, REFUSE, 13 GAL', qty: 20, ui: 'EA', cadence: every(1), category: 'EQP' },
]

export const cadenceLabel = (c: BasicCadence): string => {
  if (c.period === 1) return 'EVERY ISSUE'
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
    .filter((m) => isIssuedInMonth(c, m))
    .map((m) => `M${String(m).padStart(2, '0')}`)
  const name = c.period === 3 ? 'QTR' : c.period === 6 ? 'SEMI' : 'ANNUAL'
  return `${name} ${months.join('/')}`
}

/** Cycle month m is 1-based (M01..M12). */
export const isIssuedInMonth = (c: BasicCadence, m: number): boolean =>
  (((m - 1 - c.offset) % c.period) + c.period) % c.period === 0

export const loadForMonth = (m: number): BasicItem[] =>
  BASIC_MANIFEST.filter((it) => isIssuedInMonth(it.cadence, m))
