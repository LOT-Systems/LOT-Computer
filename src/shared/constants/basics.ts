/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 // BASIC (RATION) — ledger data
 * Nomenclature + cadence only. COGS is withheld from the public surface.
 * LOAD is PROVISIONAL until S-2 confirms the 23-item manifest (see LOT-SR report).
 */

export type Cadence = 'M' | 'Q' | 'S' | 'I'

export const CADENCE_LABEL: Record<Cadence, string> = {
  M: 'MONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMIANNUAL',
  I: 'INITIAL ISSUE',
}

export type RationItem = { no: number; nomenclature: string; cadence: Cadence }

const item = (no: number, nomenclature: string, cadence: Cadence): RationItem => ({
  no,
  nomenclature,
  cadence,
})

export const RATION_LOAD: RationItem[] = [
  item(1, 'TOOTHBRUSH', 'Q'),
  item(2, 'TOOTHPASTE', 'M'),
  item(3, 'DENTAL FLOSS', 'M'),
  item(4, 'DEODORANT', 'M'),
  item(5, 'SOAP, BAR', 'M'),
  item(6, 'SHAMPOO', 'M'),
  item(7, 'RAZOR CARTRIDGE', 'M'),
  item(8, 'LIP BALM', 'Q'),
  item(9, 'HAND CREAM', 'Q'),
  item(10, 'SUNSCREEN', 'Q'),
  item(11, 'UNDERWEAR', 'S'),
  item(12, 'SOCKS', 'S'),
  item(13, 'T-SHIRT, PLAIN', 'S'),
  item(14, 'WASHCLOTH', 'S'),
  item(15, 'LAUNDRY SHEETS', 'M'),
  item(16, 'DISH SOAP', 'Q'),
  item(17, 'SURFACE WIPES', 'M'),
  item(18, 'TRASH LINERS', 'Q'),
  item(19, 'COFFEE, GROUND', 'M'),
  item(20, 'TEA, LOOSE', 'M'),
  item(21, 'SALT / SPICE KIT', 'Q'),
  item(22, 'FIELD NOTEBOOK', 'Q'),
  item(23, 'PEN, BLACK', 'Q'),
]

export const BASIC_PRICE_USD = 100
export const BASIC_MARGIN_FLOOR = 0.6
export const BASIC_LANDED_CEILING_USD = BASIC_PRICE_USD * (1 - BASIC_MARGIN_FLOOR) // 40

export const BASIC_DOCTRINE = [
  'ISSUE, DO NOT SELL.',
  'THE OPERATOR IS ON STRENGTH.',
  'THE LEDGER IS THE MARKETING.',
  'NO LAYER BETWEEN PUBLIC AND MANIFEST.',
]

/** UPGRADE state machine (M2). Declared now so the ledger can show the states. */
export const BASIC_STATES = ['USERSHIP/AI', 'PENDING', 'ON STRENGTH', 'STEADY STATE'] as const

/** True while landed cost holds the ceiling. Gate for M3 supplier quotes. */
export const withinCeiling = (landedUsd: number): boolean =>
  landedUsd >= 0 && landedUsd <= BASIC_LANDED_CEILING_USD

export const marginPct = (landedUsd: number): number =>
  Math.round(((BASIC_PRICE_USD - landedUsd) / BASIC_PRICE_USD) * 1000) / 10
