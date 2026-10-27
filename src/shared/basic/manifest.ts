/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * BASIC (RATION) — LOT-FM-001 manifest. Single source for the OPEN TAB
 * (public /basics) and the in-app Basics tab. No layer between public and
 * manifest: both render this file.
 *
 * STATUS: DRAFT-0. The LOT-FM-001 manual was not in the repo at build time.
 * Nomenclature below is a placeholder load of 23 items; S-2 replaces it
 * line-for-line. COGS is deliberately NOT stored here (withheld; Month 3).
 */

export type Cadence = 'M' | 'Q' | 'S' | 'A'

export const CADENCE_LABEL: Record<Cadence, string> = {
  M: 'MONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMIANNUAL',
  A: 'ANNUAL',
}

export type Section = 'HYGIENE' | 'WEAR' | 'PANTRY' | 'HOME'

export type ManifestItem = {
  no: number
  nomenclature: string
  qty: number
  cadence: Cadence
  section: Section
}

export const BASIC_PRICE_USD = 100
export const BASIC_MIN_MARGIN = 0.6
// Landed-cost ceiling per issue. Never breach.
export const BASIC_LANDED_CEILING_USD = BASIC_PRICE_USD * (1 - BASIC_MIN_MARGIN)

export const BASIC_DOCTRINE = [
  'ISSUE, DO NOT SELL.',
  'THE USER IS ON STRENGTH.',
  'ONE LOAD. ONE CADENCE. ONE PRICE.',
  'THE LEDGER IS THE MARKETING.',
]

const i = (
  no: number,
  nomenclature: string,
  qty: number,
  cadence: Cadence,
  section: Section
): ManifestItem => ({ no, nomenclature, qty, cadence, section })

export const BASIC_MANIFEST: ManifestItem[] = [
  i(1, 'TOOTHBRUSH, MANUAL', 1, 'M', 'HYGIENE'),
  i(2, 'TOOTHPASTE, 100ML', 1, 'M', 'HYGIENE'),
  i(3, 'DENTAL FLOSS, 50M', 1, 'M', 'HYGIENE'),
  i(4, 'SOAP BAR', 2, 'M', 'HYGIENE'),
  i(5, 'SHAMPOO, 250ML', 1, 'M', 'HYGIENE'),
  i(6, 'DEODORANT', 1, 'M', 'HYGIENE'),
  i(7, 'RAZOR CARTRIDGE', 4, 'M', 'HYGIENE'),
  i(8, 'LIP BALM', 1, 'Q', 'HYGIENE'),
  i(9, 'HAND CREAM, 75ML', 1, 'Q', 'HYGIENE'),
  i(10, 'NAIL CLIPPER', 1, 'A', 'HYGIENE'),
  i(11, 'UNDERSHIRT', 2, 'Q', 'WEAR'),
  i(12, 'UNDERWEAR', 3, 'Q', 'WEAR'),
  i(13, 'SOCKS, PAIR', 3, 'Q', 'WEAR'),
  i(14, 'WATCH CAP', 1, 'A', 'WEAR'),
  i(15, 'COFFEE, 250G', 1, 'M', 'PANTRY'),
  i(16, 'TEA, 25 BAGS', 1, 'M', 'PANTRY'),
  i(17, 'SALT, 250G', 1, 'S', 'PANTRY'),
  i(18, 'OLIVE OIL, 250ML', 1, 'Q', 'PANTRY'),
  i(19, 'PROTEIN BAR', 6, 'M', 'PANTRY'),
  i(20, 'DISH SOAP, 250ML', 1, 'M', 'HOME'),
  i(21, 'LAUNDRY STRIPS', 20, 'M', 'HOME'),
  i(22, 'TRASH LINERS', 30, 'Q', 'HOME'),
  i(23, 'BATTERIES, AA', 4, 'S', 'HOME'),
]

/** Items issued in a given month of subscription (1-based; month 1 = full load). */
export const issuedInMonth = (month: number): ManifestItem[] =>
  BASIC_MANIFEST.filter((it) => {
    if (month === 1) return true
    const period = { M: 1, Q: 3, S: 6, A: 12 }[it.cadence]
    return (month - 1) % period === 0
  })

export const STATUS_LINE = (): string =>
  `LOT-FM-001 / BASIC / ${BASIC_MANIFEST.length} ITEMS / USD ${BASIC_PRICE_USD}/MO / DRAFT-0`
