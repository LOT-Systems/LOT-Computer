/**
 * LOT-FM-001 / BASIC RATION — public manifest (OPEN TAB source of truth).
 * The ledger is the marketing: client page and /api/public/basics read this file.
 * COGS is withheld here by design — see src/server/utils/basics-cogs.ts.
 */

export type Cadence = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL'

export type RationItem = {
  seq: number
  nomenclature: string
  qty: string
  cadence: Cadence
}

export const CADENCE_MONTHS: Record<Cadence, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  SEMIANNUAL: 6,
  ANNUAL: 12,
}

export const BASICS_PRICE_USD = 100
export const BASICS_CEILING_USD = 40 // landed cost per ration-month, hard ceiling
export const BASICS_DOCTRINE = [
  'ISSUE, DO NOT SELL.',
  'THE OPERATOR IS ON STRENGTH.',
  'THE LEDGER IS THE MARKETING.',
]

const R = (
  seq: number,
  nomenclature: string,
  qty: string,
  cadence: Cadence
): RationItem => ({ seq, nomenclature, qty, cadence })

// DRAFT LOAD — 23 items. Pending ratification against LOT-FM-001 Section 2.
export const BASICS_MANIFEST: RationItem[] = [
  R(1, 'TOOTHPASTE', '1 X 100G', 'MONTHLY'),
  R(2, 'DENTAL FLOSS', '1 X 50M', 'MONTHLY'),
  R(3, 'TOOTHBRUSH', '1 X MEDIUM', 'QUARTERLY'),
  R(4, 'BAR SOAP', '1 X 100G', 'MONTHLY'),
  R(5, 'SHAMPOO', '1 X 250ML', 'MONTHLY'),
  R(6, 'DEODORANT STICK', '1 X 75G', 'MONTHLY'),
  R(7, 'RAZOR CARTRIDGE', '4 X', 'MONTHLY'),
  R(8, 'LIP BALM', '1 X', 'QUARTERLY'),
  R(9, 'SUNSCREEN SPF30', '1 X 100ML', 'SEMIANNUAL'),
  R(10, 'NAIL CLIPPER', '1 X', 'ANNUAL'),
  R(11, 'TOILET PAPER', '12 ROLL', 'MONTHLY'),
  R(12, 'FACIAL TISSUE', '1 X BOX', 'MONTHLY'),
  R(13, 'LAUNDRY STRIP', '30 X', 'MONTHLY'),
  R(14, 'UNDERWEAR', '3 X', 'SEMIANNUAL'),
  R(15, 'SOCKS', '3 X PAIR', 'QUARTERLY'),
  R(16, 'T-SHIRT, BLACK', '1 X', 'SEMIANNUAL'),
  R(17, 'T-SHIRT, WHITE', '1 X', 'SEMIANNUAL'),
  R(18, 'TOWEL', '1 X', 'ANNUAL'),
  R(19, 'COFFEE, GROUND', '1 X 250G', 'MONTHLY'),
  R(20, 'OATS', '1 X 500G', 'MONTHLY'),
  R(21, 'SEA SALT', '1 X 250G', 'QUARTERLY'),
  R(22, 'BATTERY AAA', '4 X', 'QUARTERLY'),
  R(23, 'MANIFEST CARD', '1 X PRINTED', 'MONTHLY'),
]

/** Items issued in ration-month `m` (1-based). Even phasing is a Month 3 job. */
export const itemsInMonth = (m: number): RationItem[] =>
  BASICS_MANIFEST.filter((i) => (m - 1) % CADENCE_MONTHS[i.cadence] === 0)

// ── Fixed character grid (IBM 3270 register). 64 columns. ─────────────────
export const GRID_COLS = 64
const pad = (s: string, n: number) => (s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length))
const rpad = (s: string, n: number) => (s.length >= n ? s.slice(0, n) : ' '.repeat(n - s.length) + s)
export const gridLine = (s: string) => pad(s, GRID_COLS)

export const ledgerHeader = () =>
  gridLine(`${pad('NO', 3)}${pad('NOMENCLATURE', 24)}${pad('QTY', 14)}${pad('CADENCE', 10)}`)

export const ledgerRow = (i: RationItem) =>
  gridLine(
    `${rpad(String(i.seq).padStart(2, '0'), 2)} ${pad(i.nomenclature, 24)}${pad(i.qty, 14)}${pad(i.cadence, 10)}`
  )

export const statusLine = (opts: { items: number; state: string }) =>
  gridLine(
    `${opts.state} | ITEMS ${opts.items} | USD ${BASICS_PRICE_USD}/MO | NEXT ISSUE --`
  )
