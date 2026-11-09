/**
 * LOT-FM-001 s2.1 - BASIC ration register (PUBLIC). COGS withheld by design:
 * cost data lives in #server/basics/cogs.ts and never reaches the client.
 */

export type RationClass = 'CONSUMABLE' | 'DURABLE' | 'BRAND'

export type RationItem = {
  item: string
  nomenclature: string
  class: RationClass
  cadence: string
  months: number[]
}

export const RATION_PRICE_USD = 100
export const RATION_MARGIN_FLOOR = 0.6
export const RATION_COGS_CEILING_USD = 40

export const RATION_MANIFEST: RationItem[] = [
  { item: '001', nomenclature: 'SOCK, COTTON, CREW, 2 PAIR', class: 'CONSUMABLE', cadence: 'MONTHLY', months: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { item: '002', nomenclature: 'BRIEF, COTTON', class: 'CONSUMABLE', cadence: 'MO 1,3,5,7,9,11', months: [1,3,5,7,9,11] },
  { item: '003', nomenclature: 'SHIRT, TEE, COTTON, BLACK', class: 'DURABLE', cadence: 'MO 2,6,10', months: [2,6,10] },
  { item: '004', nomenclature: 'BRUSH, TOOTH', class: 'DURABLE', cadence: 'MO 1,4,7,10', months: [1,4,7,10] },
  { item: '005', nomenclature: 'PASTE, TOOTH, TUBE', class: 'CONSUMABLE', cadence: 'MO 1,3,5,7,9,11', months: [1,3,5,7,9,11] },
  { item: '006', nomenclature: 'FLOSS, DENTAL', class: 'CONSUMABLE', cadence: 'MO 2,5,8,11', months: [2,5,8,11] },
  { item: '007', nomenclature: 'SOAP, BAR', class: 'CONSUMABLE', cadence: 'MONTHLY', months: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { item: '008', nomenclature: 'DEODORANT, STICK', class: 'CONSUMABLE', cadence: 'MO 1,3,5,7,9,11', months: [1,3,5,7,9,11] },
  { item: '009', nomenclature: 'PAD, COTTON, PACK', class: 'CONSUMABLE', cadence: 'MO 2,4,6,8,10,12', months: [2,4,6,8,10,12] },
  { item: '010', nomenclature: 'SWAB, COTTON, BOX', class: 'CONSUMABLE', cadence: 'MO 3,9', months: [3,9] },
  { item: '011', nomenclature: 'BLADE, RAZOR, HEAD, 4-PACK', class: 'CONSUMABLE', cadence: 'MO 2,5,8,11', months: [2,5,8,11] },
  { item: '012', nomenclature: 'HANDLE, RAZOR', class: 'DURABLE', cadence: 'MO 1 ONLY', months: [1] },
  { item: '013', nomenclature: 'SOAP, SHAVE', class: 'CONSUMABLE', cadence: 'MO 4,10', months: [4,10] },
  { item: '014', nomenclature: 'BAR, SHAMPOO', class: 'CONSUMABLE', cadence: 'MO 2,6,10', months: [2,6,10] },
  { item: '015', nomenclature: 'CLIPPER, NAIL', class: 'DURABLE', cadence: 'MO 3 ONLY', months: [3] },
  { item: '016', nomenclature: 'HANDKERCHIEF, COTTON, BLACK', class: 'DURABLE', cadence: 'MO 4,8,12', months: [4,8,12] },
  { item: '017', nomenclature: 'BALM, LIP', class: 'CONSUMABLE', cadence: 'MO 1,7', months: [1,7] },
  { item: '018', nomenclature: 'CREAM, HAND/FACE, TUBE', class: 'CONSUMABLE', cadence: 'MO 5,11', months: [5,11] },
  { item: '019', nomenclature: 'STICK, SUN, SPF', class: 'CONSUMABLE', cadence: 'MO 6 (SEASONAL)', months: [6] },
  { item: '020', nomenclature: 'TOWEL, COTTON/MICROFIBER', class: 'DURABLE', cadence: 'MO 7 ONLY', months: [7] },
  { item: '021', nomenclature: 'CAP, COTTON / BEANIE', class: 'DURABLE', cadence: 'MO 9 (SEASONAL)', months: [9] },
  { item: '022', nomenclature: 'BAG, COTTON, REUSABLE', class: 'DURABLE', cadence: 'MO 1,12', months: [1,12] },
  { item: '023', nomenclature: 'CARD, MANIFEST, PRINTED', class: 'BRAND', cadence: 'MONTHLY', months: [1,2,3,4,5,6,7,8,9,10,11,12] },
]

export const itemsForMonth = (mo: number): RationItem[] =>
  RATION_MANIFEST.filter((i) => i.months.includes(mo))
