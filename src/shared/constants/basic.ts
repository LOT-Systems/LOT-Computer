/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 / BASIC (RATION). Public manifest only: nomenclature + cadence.
// COGS is withheld here by design; the private cost model lives in
// scripts/basics-envelope.ts and never enters the client bundle.

export type RationCadence = 'MONTHLY' | 'QUARTERLY' | 'SEMI-ANNUAL' | 'ANNUAL'

export type RationItem = {
  no: number
  nomenclature: string
  cadence: RationCadence
}

export const RATION_CADENCE_MONTHS: Record<RationCadence, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  'SEMI-ANNUAL': 6,
  ANNUAL: 12,
}

// PROVISIONAL: nomenclature drafted from the FMCG plan categories (hygiene,
// paper, packaged goods, apparel basics). Ratify against LOT-FM-001.
const RAW: [string, RationCadence][] = [
  ['TOOTHPASTE 100G', 'MONTHLY'],
  ['DENTAL FLOSS 50M', 'MONTHLY'],
  ['SOAP BAR 100G', 'MONTHLY'],
  ['SHAMPOO BAR', 'MONTHLY'],
  ['DEODORANT STICK', 'MONTHLY'],
  ['TOILET PAPER 6RL', 'MONTHLY'],
  ['PAPER TOWEL 2RL', 'MONTHLY'],
  ['FACIAL TISSUE BOX', 'MONTHLY'],
  ['RAZOR CARTRIDGE 2PK', 'MONTHLY'],
  ['OATS 500G', 'MONTHLY'],
  ['NUT BUTTER 340G', 'MONTHLY'],
  ['ELECTROLYTE SACHET 10CT', 'MONTHLY'],
  ['TEA BLACK 20CT', 'MONTHLY'],
  ['TOOTHBRUSH 2PK', 'QUARTERLY'],
  ['SOCKS WOOL BLEND 3PR', 'QUARTERLY'],
  ['UNDERWEAR COTTON 3PK', 'QUARTERLY'],
  ['WASHCLOTH 3PK', 'QUARTERLY'],
  ['NAIL CLIPPER', 'SEMI-ANNUAL'],
  ['T-SHIRT HEAVYWEIGHT', 'SEMI-ANNUAL'],
  ['TOWEL BATH', 'SEMI-ANNUAL'],
  ['FIRST AID REFILL', 'SEMI-ANNUAL'],
  ['BASE LAYER THERMAL', 'ANNUAL'],
  ['NOTEBOOK FIELD', 'ANNUAL'],
]

export const RATION_ITEMS: RationItem[] = RAW.map(([nomenclature, cadence], i) => ({
  no: i + 1,
  nomenclature,
  cadence,
}))

export const RATION_PRICE_USD = 100
export const RATION_PERIOD = 'MO'

export const RATION_DOCTRINE = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'THE USER IS ON STRENGTH.',
  'THE LEDGER IS THE MARKETING.',
  'ONE BOX. ONE CADENCE. NO SUBSTITUTION WITHOUT NOTICE.',
]

// Items issued in a given ration month (1-indexed). Month 1 is a full issue.
export const itemsForMonth = (month: number): RationItem[] =>
  RATION_ITEMS.filter(
    (it) => (month - 1) % RATION_CADENCE_MONTHS[it.cadence] === 0
  )
