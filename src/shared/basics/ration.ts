/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 / BASIC (RATION) — public manifest. COGS is never present here:
// the ledger shows nomenclature + cadence only.
// STATUS: PROVISIONAL. The 23 items below are a build-agent draft pending
// ratification against LOT-FM-001 Section 2.

export type Cadence = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL'

export type RationItem = {
  no: number
  nomenclature: string
  cadence: Cadence
}

export const RATION_PRICE_USD = 100
export const RATION_ITEM_COUNT = 23

export const DOCTRINE = [
  'ISSUE, DO NOT SELL.',
  'THE USER IS ON STRENGTH.',
  'THE LEDGER IS THE MARKETING.',
]

export const RATION: RationItem[] = [
  { no: 1, nomenclature: 'TOOTHPASTE', cadence: 'MONTHLY' },
  { no: 2, nomenclature: 'TOOTHBRUSH HEAD', cadence: 'QUARTERLY' },
  { no: 3, nomenclature: 'DENTAL FLOSS', cadence: 'MONTHLY' },
  { no: 4, nomenclature: 'BAR SOAP', cadence: 'MONTHLY' },
  { no: 5, nomenclature: 'SHAMPOO', cadence: 'MONTHLY' },
  { no: 6, nomenclature: 'DEODORANT', cadence: 'MONTHLY' },
  { no: 7, nomenclature: 'LIP BALM', cadence: 'MONTHLY' },
  { no: 8, nomenclature: 'SUNSCREEN', cadence: 'QUARTERLY' },
  { no: 9, nomenclature: 'RAZOR CARTRIDGES', cadence: 'MONTHLY' },
  { no: 10, nomenclature: 'WASH CLOTH', cadence: 'QUARTERLY' },
  { no: 11, nomenclature: 'SOCKS, PAIR', cadence: 'QUARTERLY' },
  { no: 12, nomenclature: 'UNDERSHIRT', cadence: 'SEMIANNUAL' },
  { no: 13, nomenclature: 'NOTEBOOK, GRID', cadence: 'MONTHLY' },
  { no: 14, nomenclature: 'PEN, BLACK', cadence: 'MONTHLY' },
  { no: 15, nomenclature: 'CHARGE CABLE', cadence: 'SEMIANNUAL' },
  { no: 16, nomenclature: 'EARPLUGS', cadence: 'MONTHLY' },
  { no: 17, nomenclature: 'WATER FILTER CARTRIDGE', cadence: 'QUARTERLY' },
  { no: 18, nomenclature: 'ELECTROLYTE PACKETS', cadence: 'MONTHLY' },
  { no: 19, nomenclature: 'COFFEE OR TEA, FIELD', cadence: 'MONTHLY' },
  { no: 20, nomenclature: 'RATION BAR', cadence: 'MONTHLY' },
  { no: 21, nomenclature: 'FIRST AID KIT, COMPACT', cadence: 'ANNUAL' },
  { no: 22, nomenclature: 'MULTITOOL CARD', cadence: 'ANNUAL' },
  { no: 23, nomenclature: 'MANIFEST CARD', cadence: 'MONTHLY' },
]

export type UpgradeState =
  | 'USERSHIP/AI'
  | 'PENDING'
  | 'ON STRENGTH'
  | 'STEADY STATE'

export const issueNo = (n: number) => String(n).padStart(2, '0')
