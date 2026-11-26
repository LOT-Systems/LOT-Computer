/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 / MODULE: BASIC (RATION)
// Public half of the ration ledger. Nomenclature + cadence ONLY.
// COGS lives server-side in src/server/utils/basics-ledger.ts and must
// never be imported into client code. The ledger is the marketing.

export const BASICS_FM = 'LOT-FM-001'
export const BASICS_MODULE = 'BASIC'
export const BASICS_PRICE_USD = 100
export const BASICS_CYCLE_MONTHS = 12

export const BASICS_DOCTRINE: string[] = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'ONE BOX. ONE CADENCE. NO CHOICES TO MAKE.',
  'EVERY ITEM IS ON THE LEDGER. NOTHING IS HIDDEN BEHIND IT.',
  'CONSUMABLES REPLACE THEMSELVES. DURABLES ARRIVE ONCE A CYCLE.',
  'STAND DOWN AT ANY TIME. THE AI STAYS ON.',
]

export const BASICS_PRICE_LINE =
  'USD 100 / MO · ADDITIVE TO USERSHIP · SHIPPED MONTHLY · STAND DOWN ANY TIME'

export type RationClass = 'SUSTAIN' | 'HYGIENE' | 'KIT' | 'FIELD' | 'SIGNAL'

// M = every month. Q = every 3 months. S = every 6 months. A = once per cycle.
export type RationCadence = 'M' | 'Q' | 'S' | 'A'

export const CADENCE_PERIOD: Record<RationCadence, number> = {
  M: 1,
  Q: 3,
  S: 6,
  A: 12,
}

export const CADENCE_LABEL: Record<RationCadence, string> = {
  M: 'MONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMIANNUAL',
  A: 'ANNUAL',
}

export type RationItem = {
  /** Line number on the manifest, 01–23. Stable. */
  line: number
  /** Stable id shared with the server-side COGS table. */
  id: string
  nomenclature: string
  qty: string
  cls: RationClass
  cadence: RationCadence
  /** First issue month within the 12-month cycle (0 = first box). */
  offset: number
}

export const RATION_MANIFEST: RationItem[] = [
  // SUSTAIN — every box
  { line: 1, id: 'water-tabs', nomenclature: 'WATER PURIFICATION TABLETS', qty: '50 CT', cls: 'SUSTAIN', cadence: 'M', offset: 0 },
  { line: 2, id: 'electrolyte', nomenclature: 'ELECTROLYTE SACHET', qty: '10 CT', cls: 'SUSTAIN', cadence: 'M', offset: 0 },
  { line: 3, id: 'ration-bar', nomenclature: 'RATION BAR, 3600 KCAL', qty: '1 EA', cls: 'SUSTAIN', cadence: 'M', offset: 0 },
  { line: 4, id: 'coffee', nomenclature: 'COFFEE, INSTANT', qty: '10 SERV', cls: 'SUSTAIN', cadence: 'M', offset: 0 },
  // HYGIENE — every box
  { line: 5, id: 'soap', nomenclature: 'SOAP BAR, UNSCENTED', qty: '1 EA', cls: 'HYGIENE', cadence: 'M', offset: 0 },
  { line: 6, id: 'tooth-powder', nomenclature: 'TOOTH POWDER', qty: '1 TIN', cls: 'HYGIENE', cadence: 'M', offset: 0 },
  // KIT — every box
  { line: 7, id: 'socks', nomenclature: 'SOCKS, MERINO, CREW', qty: '1 PR', cls: 'KIT', cadence: 'M', offset: 0 },
  // SIGNAL / FIELD — quarterly rotation
  { line: 8, id: 'aa-cells', nomenclature: 'CELL, AA, LITHIUM', qty: '4 CT', cls: 'SIGNAL', cadence: 'Q', offset: 0 },
  { line: 9, id: 'gloves', nomenclature: 'GLOVES, NITRILE', qty: '10 PR', cls: 'HYGIENE', cadence: 'Q', offset: 1 },
  { line: 10, id: 'notebook', nomenclature: 'FIELD NOTEBOOK, WATERPROOF', qty: '1 EA', cls: 'FIELD', cadence: 'Q', offset: 1 },
  { line: 11, id: 'tape', nomenclature: 'TAPE, DUCT, FLAT ROLL', qty: '1 EA', cls: 'FIELD', cadence: 'Q', offset: 1 },
  { line: 12, id: 'cord', nomenclature: 'CORD, 550, OLIVE', qty: '15 M', cls: 'FIELD', cadence: 'Q', offset: 2 },
  { line: 13, id: 'pencil', nomenclature: 'PENCIL, CARPENTER', qty: '2 CT', cls: 'FIELD', cadence: 'Q', offset: 2 },
  { line: 14, id: 'ferro', nomenclature: 'FIRE STARTER, FERRO ROD', qty: '1 EA', cls: 'FIELD', cadence: 'Q', offset: 2 },
  // Semiannual
  { line: 15, id: 'first-aid', nomenclature: 'FIRST-AID REFILL, TYPE I', qty: '1 PK', cls: 'SUSTAIN', cadence: 'S', offset: 0 },
  { line: 16, id: 'blanket', nomenclature: 'BLANKET, EMERGENCY, MYLAR', qty: '2 CT', cls: 'KIT', cadence: 'S', offset: 1 },
  { line: 17, id: 'dry-bags', nomenclature: 'BAG, WATERPROOF, ROLL-TOP', qty: '3 CT', cls: 'KIT', cadence: 'S', offset: 2 },
  { line: 18, id: 'towel', nomenclature: 'TOWEL, MICROFIBER', qty: '1 EA', cls: 'HYGIENE', cadence: 'S', offset: 4 },
  { line: 19, id: 'bandana', nomenclature: 'BANDANA, COTTON, BLACK', qty: '1 EA', cls: 'KIT', cadence: 'S', offset: 5 },
  // Annual — durables, once per cycle
  { line: 20, id: 'id-tag', nomenclature: 'ID TAG, STAMPED, ON STRENGTH', qty: '1 EA', cls: 'KIT', cadence: 'A', offset: 0 },
  { line: 21, id: 'headlamp', nomenclature: 'HEADLAMP, 300 LM', qty: '1 EA', cls: 'SIGNAL', cadence: 'A', offset: 3 },
  { line: 22, id: 'knife', nomenclature: 'KNIFE, UTILITY, FIXED BLADE', qty: '1 EA', cls: 'FIELD', cadence: 'A', offset: 9 },
  { line: 23, id: 'whistle', nomenclature: 'WHISTLE, SIGNAL, PEALESS', qty: '1 EA', cls: 'SIGNAL', cadence: 'A', offset: 7 },
]

/** True when `item` issues in cycle month `m` (0-based, months since ON STRENGTH). */
export const issuesInMonth = (item: RationItem, m: number): boolean => {
  const period = CADENCE_PERIOD[item.cadence]
  const idx = ((m % BASICS_CYCLE_MONTHS) + BASICS_CYCLE_MONTHS) % BASICS_CYCLE_MONTHS
  return idx >= item.offset && (idx - item.offset) % period === 0
}

/** The load for cycle month `m`. Pure. Used by the ledger now, the issue engine in Month 3. */
export const loadForMonth = (m: number): RationItem[] =>
  RATION_MANIFEST.filter((item) => issuesInMonth(item, m))

/** Human cadence string, e.g. "QUARTERLY · FROM MO 02". */
export const cadenceString = (item: RationItem): string =>
  item.cadence === 'M'
    ? CADENCE_LABEL.M
    : `${CADENCE_LABEL[item.cadence]} · FROM MO ${String(item.offset + 1).padStart(2, '0')}`

// Strength states — declared now, driven in Month 2 (UPGRADE state machine).
export type StrengthState = 'NOT_ON_ROLL' | 'USERSHIP_AI' | 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE'

export const STRENGTH_LABEL: Record<StrengthState, string> = {
  NOT_ON_ROLL: 'NOT ON ROLL',
  USERSHIP_AI: 'USERSHIP/AI',
  PENDING: 'PENDING',
  ON_STRENGTH: 'ON STRENGTH',
  STEADY_STATE: 'STEADY STATE',
}
