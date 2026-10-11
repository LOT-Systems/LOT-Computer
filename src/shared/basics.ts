/**
 * LOT-FM-001 / BASIC (RATION) — public manifest.
 * Nomenclature + cadence only. COGS is withheld from the client bundle.
 * PROVISIONAL: load pending reconciliation against LOT-FM-001 §2.
 */

export type Cadence = 'M' | 'Q' | 'S' | 'A'
export type Group = 'WEAR' | 'CARE' | 'HOME'

export type RationItem = {
  no: number
  group: Group
  item: string
  qty: number
  cadence: Cadence
  /** Month offset within the cadence period (staggers load across months). */
  phase: number
}

export const CADENCE_LABEL: Record<Cadence, string> = {
  M: 'MONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMIANNUAL',
  A: 'ANNUAL',
}

export const GROUP_LABEL: Record<Group, string> = {
  WEAR: 'WARDROBE',
  CARE: 'SELF-CARE',
  HOME: 'HOME',
}

const i = (
  no: number,
  group: Group,
  item: string,
  qty: number,
  cadence: Cadence,
  phase: number
): RationItem => ({ no, group, item, qty, cadence, phase })

export const RATION: RationItem[] = [
  i(1, 'WEAR', 'TEE, CREW, BLACK', 1, 'Q', 1),
  i(2, 'WEAR', 'TEE, CREW, WHITE', 1, 'Q', 2),
  i(3, 'WEAR', 'SOCKS, CREW, BLACK, PAIR', 3, 'Q', 1),
  i(4, 'WEAR', 'SOCKS, CREW, WHITE, PAIR', 3, 'Q', 2),
  i(5, 'WEAR', 'UNDERWEAR, BLACK', 2, 'Q', 1),
  i(6, 'WEAR', 'BASE LAYER, LONG SLEEVE, BLACK', 1, 'S', 2),
  i(7, 'WEAR', 'CAP OR BEANIE, BLACK', 1, 'A', 1),
  i(8, 'WEAR', 'HOODIE, BLACK', 1, 'A', 0),
  i(9, 'CARE', 'SOAP, BAR', 1, 'M', 0),
  i(10, 'CARE', 'SHAMPOO, BAR', 1, 'M', 0),
  i(11, 'CARE', 'TOOTHPASTE', 1, 'M', 0),
  i(12, 'CARE', 'TOOTHBRUSH', 1, 'Q', 1),
  i(13, 'CARE', 'FLOSS', 1, 'M', 0),
  i(14, 'CARE', 'DEODORANT', 1, 'M', 0),
  i(15, 'CARE', 'RAZOR CARTRIDGES', 1, 'M', 0),
  i(16, 'CARE', 'LIP BALM', 1, 'Q', 0),
  i(17, 'CARE', 'SUNSCREEN', 1, 'Q', 2),
  i(18, 'HOME', 'LAUNDRY SHEETS', 1, 'M', 0),
  i(19, 'HOME', 'DISH SOAP', 1, 'M', 0),
  i(20, 'HOME', 'SPONGE', 2, 'M', 0),
  i(21, 'HOME', 'TRASH BAGS', 1, 'M', 0),
  i(22, 'HOME', 'BATTERIES, AA', 1, 'S', 3),
  i(23, 'HOME', 'LIGHT BULB, LED', 1, 'S', 3),
]

export const PRICE_USD_MONTH = 100
export const MARGIN_FLOOR = 0.6
export const LANDED_CEILING_USD = 40

/** Items due in a given month (1-based, month 1 = first issue). */
export const dueInMonth = (month: number): RationItem[] =>
  RATION.filter((r) => {
    const period = { M: 1, Q: 3, S: 6, A: 12 }[r.cadence]
    return (month - 1) % period === r.phase
  })
