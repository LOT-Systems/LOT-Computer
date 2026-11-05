/**
 * LOT-FM-001 REV A — BASIC (RATION) — PUBLIC LEDGER DATA
 * Public surface only. COGS, margin, supplier data are WITHHELD (FM-001 §5.3).
 * Cost data lives in scripts/basics/envelope.ts and is never bundled.
 */

export type RationClass = 'CONSUMABLE' | 'DURABLE' | 'BRAND'

export type RationItem = {
  id: string
  nomenclature: string
  cls: RationClass
  /** Issue months (1-12) counted from month of going ON STRENGTH. */
  months: number[]
  /** Printed cadence, as in FM-001 §2.1. */
  cadence: string
}

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const ODD = [1, 3, 5, 7, 9, 11]
const EVEN = [2, 4, 6, 8, 10, 12]

export const RATION_ITEMS: RationItem[] = [
  { id: '001', nomenclature: 'SOCK, COTTON, CREW, 2 PAIR', cls: 'CONSUMABLE', months: ALL, cadence: 'MONTHLY' },
  { id: '002', nomenclature: 'BRIEF, COTTON', cls: 'CONSUMABLE', months: ODD, cadence: 'MO 1,3,5,7,9,11' },
  { id: '003', nomenclature: 'SHIRT, TEE, COTTON, BLACK', cls: 'DURABLE', months: [2, 6, 10], cadence: 'MO 2,6,10' },
  { id: '004', nomenclature: 'BRUSH, TOOTH', cls: 'DURABLE', months: [1, 4, 7, 10], cadence: 'MO 1,4,7,10' },
  { id: '005', nomenclature: 'PASTE, TOOTH, TUBE', cls: 'CONSUMABLE', months: ODD, cadence: 'MO 1,3,5,7,9,11' },
  { id: '006', nomenclature: 'FLOSS, DENTAL', cls: 'CONSUMABLE', months: [2, 5, 8, 11], cadence: 'MO 2,5,8,11' },
  { id: '007', nomenclature: 'SOAP, BAR', cls: 'CONSUMABLE', months: ALL, cadence: 'MONTHLY' },
  { id: '008', nomenclature: 'DEODORANT, STICK', cls: 'CONSUMABLE', months: ODD, cadence: 'MO 1,3,5,7,9,11' },
  { id: '009', nomenclature: 'PAD, COTTON, PACK', cls: 'CONSUMABLE', months: EVEN, cadence: 'MO 2,4,6,8,10,12' },
  { id: '010', nomenclature: 'SWAB, COTTON, BOX', cls: 'CONSUMABLE', months: [3, 9], cadence: 'MO 3,9' },
  { id: '011', nomenclature: 'BLADE, RAZOR, HEAD, 4-PACK', cls: 'CONSUMABLE', months: [2, 5, 8, 11], cadence: 'MO 2,5,8,11' },
  { id: '012', nomenclature: 'HANDLE, RAZOR', cls: 'DURABLE', months: [1], cadence: 'MO 1 ONLY' },
  { id: '013', nomenclature: 'SOAP, SHAVE', cls: 'CONSUMABLE', months: [4, 10], cadence: 'MO 4,10' },
  { id: '014', nomenclature: 'BAR, SHAMPOO', cls: 'CONSUMABLE', months: [2, 6, 10], cadence: 'MO 2,6,10' },
  { id: '015', nomenclature: 'CLIPPER, NAIL', cls: 'DURABLE', months: [3], cadence: 'MO 3 ONLY' },
  { id: '016', nomenclature: 'HANDKERCHIEF, COTTON, BLACK', cls: 'DURABLE', months: [4, 8, 12], cadence: 'MO 4,8,12' },
  { id: '017', nomenclature: 'BALM, LIP', cls: 'CONSUMABLE', months: [1, 7], cadence: 'MO 1,7' },
  { id: '018', nomenclature: 'CREAM, HAND/FACE, TUBE', cls: 'CONSUMABLE', months: [5, 11], cadence: 'MO 5,11' },
  { id: '019', nomenclature: 'STICK, SUN, SPF', cls: 'CONSUMABLE', months: [6], cadence: 'MO 6 (SEASONAL)' },
  { id: '020', nomenclature: 'TOWEL, COTTON/MICROFIBER', cls: 'DURABLE', months: [7], cadence: 'MO 7 ONLY' },
  { id: '021', nomenclature: 'CAP, COTTON / BEANIE', cls: 'DURABLE', months: [9], cadence: 'MO 9 (SEASONAL)' },
  { id: '022', nomenclature: 'BAG, COTTON, REUSABLE', cls: 'DURABLE', months: [1, 12], cadence: 'MO 1,12' },
  { id: '023', nomenclature: 'CARD, MANIFEST, PRINTED', cls: 'BRAND', months: ALL, cadence: 'MONTHLY' },
]

/**
 * FM-001 §2.3 month 10 carries "002,007,008 backfill". 007 is already monthly,
 * so the effective backfill is 002 + 008 (even-month gap in odd-month items).
 */
export const MONTH_BACKFILL: Record<number, string[]> = { 10: ['002', '008'] }

/** Item ids issued in ration month m (1-12), cadence + backfill. */
export function loadForMonth(m: number): string[] {
  const ids = RATION_ITEMS.filter((i) => i.months.includes(m)).map((i) => i.id)
  for (const b of MONTH_BACKFILL[m] ?? []) if (!ids.includes(b)) ids.push(b)
  return ids.sort()
}

export const BASIC_PRICE_USD = 100
export const BASIC_PRICE_LINE = 'BASIC — USD 100.00 / MONTH'

export const DOCTRINE = [
  'LOT ISSUES. IT DOES NOT SELL.',
  'THE SUBSCRIBER IS ON STRENGTH — CARRIED ON THE ROSTER, SUPPLIED ACCORDINGLY.',
  'DAILY CONSUMABLES ARE REMOVED FROM YOUR LOAD AND DELIVERED ON CADENCE.',
  'YOU CEASE TO DECIDE. THE SYSTEM DECIDES.',
  '23 ITEMS. MONOCHROME. UNBRANDED AT ITEM LEVEL. LABELED AS EQUIPMENT.',
  'ELIMINATE ONE DISTRACTION.',
]

export const TERMS = [
  ['ISSUE', 'ONE BOX PER MONTH, ON CADENCE, FROM DATE OF GOING ON STRENGTH.'],
  ['RETURN WHEN SPENT', 'ISSUE IS EQUIPMENT. CONSUMABLES REFILL; DURABLES ISSUE ONCE OR AMORTIZED.'],
  ['ON STRENGTH', 'ACTIVE ROSTER STATUS. NEXT ISSUE DATE IS SHOWN ON THE STATUS LINE.'],
  ['STAND DOWN', 'OFF STRENGTH AT END OF PAID CYCLE. USERSHIP (AI) PLAN RETAINED.'],
  ['ADD-ON', 'BASIC IS ADDITIVE TO USERSHIP (AI). IT DOES NOT REPLACE IT.'],
] as const

export const MANIFEST_CLASS_DEFS: Record<RationClass, string> = {
  CONSUMABLE: 'DEPLETES IN USE; REFILLED ON CADENCE.',
  DURABLE: 'MULTI-MONTH SERVICE LIFE; ISSUED ONCE OR AMORTIZED.',
  BRAND: 'NON-FUNCTIONAL ISSUE; CARRIES THE MANIFEST.',
}
