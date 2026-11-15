/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — BASIC (RATION) MODULE — PUBLIC MANIFEST
 *
 * The ledger is the marketing. This file is the single source for what LOT
 * issues and on what terms. It is imported by the client (Basics tab, OPEN
 * TAB) and by the server. COGS is WITHHELD from this file by doctrine — the
 * internal cost sheet lives server-side in src/server/ration/cogs.ts and is
 * never bundled into the client.
 */

export const RATION_FM = 'LOT-FM-001'
export const RATION_MODULE = 'BASIC'
export const RATION_PRICE_USD = 100
export const RATION_LOAD_COUNT = 23
/** Doctrine envelope. Enforced server-side against the internal COGS sheet. */
export const RATION_MARGIN_FLOOR = 0.6
export const RATION_LANDED_CEILING_USD = 40

export type RationCadence = 'M1' | 'M2' | 'M3' | 'M6'

/** Cadence code → issue interval in months. M1 = every issue. */
export const RATION_CADENCE_MONTHS: Record<RationCadence, number> = {
  M1: 1,
  M2: 2,
  M3: 3,
  M6: 6,
}

export const RATION_CADENCE_LABEL: Record<RationCadence, string> = {
  M1: 'EVERY ISSUE',
  M2: 'EVERY 2ND ISSUE',
  M3: 'QUARTERLY',
  M6: 'SEMI-ANNUAL',
}

export type RationClass = 'I' | 'II' | 'III' | 'IV'

export const RATION_CLASS_LABEL: Record<RationClass, string> = {
  I: 'CLASS I — HYGIENE',
  II: 'CLASS II — GARMENT',
  III: 'CLASS III — SUSTENANCE',
  IV: 'CLASS IV — HOUSEHOLD',
}

export type RationItem = {
  /** Line number on the manifest, 01–23. */
  line: string
  /** LOT stock number. Format LOT-{class}-{seq}. */
  stock: string
  /** Nomenclature: NOUN, MODIFIER — quartermaster order. */
  nomenclature: string
  /** Unit of issue + quantity per issue. */
  unit: string
  qty: number
  cadence: RationCadence
  cls: RationClass
  /** Requires roster sizing (garments). */
  sized?: boolean
  /**
   * Stagger, in issues, applied before the cadence interval. Spreads the
   * slower lines so no single box breaches the landed ceiling.
   */
  offset?: number
}

/**
 * The 23-item ration load. Order is fixed. Do not re-sort.
 * Nomenclature + cadence only. COGS withheld.
 */
export const RATION_LOAD: RationItem[] = [
  // CLASS I — HYGIENE
  { line: '01', stock: 'LOT-I-001', nomenclature: 'TOOTHBRUSH, MANUAL, SOFT', unit: 'EA', qty: 1, cadence: 'M1', cls: 'I' },
  { line: '02', stock: 'LOT-I-002', nomenclature: 'DENTIFRICE, FLUORIDE, 100ML', unit: 'TU', qty: 1, cadence: 'M1', cls: 'I' },
  { line: '03', stock: 'LOT-I-003', nomenclature: 'FLOSS, DENTAL, UNWAXED, 50M', unit: 'EA', qty: 1, cadence: 'M2', cls: 'I' },
  { line: '04', stock: 'LOT-I-004', nomenclature: 'SOAP, BAR, UNSCENTED, 120G', unit: 'BR', qty: 2, cadence: 'M1', cls: 'I' },
  { line: '05', stock: 'LOT-I-005', nomenclature: 'SHAMPOO, CONCENTRATE, 250ML', unit: 'BT', qty: 1, cadence: 'M2', cls: 'I', offset: 1 },
  { line: '06', stock: 'LOT-I-006', nomenclature: 'DEODORANT, STICK, UNSCENTED', unit: 'EA', qty: 1, cadence: 'M2', cls: 'I' },
  { line: '07', stock: 'LOT-I-007', nomenclature: 'RAZOR CARTRIDGE, 4-PACK', unit: 'PK', qty: 1, cadence: 'M2', cls: 'I', offset: 1 },
  { line: '08', stock: 'LOT-I-008', nomenclature: 'BALM, LIP, PLAIN', unit: 'EA', qty: 1, cadence: 'M3', cls: 'I' },
  { line: '09', stock: 'LOT-I-009', nomenclature: 'SUNSCREEN, MINERAL, SPF30, 100ML', unit: 'TU', qty: 1, cadence: 'M3', cls: 'I', offset: 1 },
  // CLASS II — GARMENT
  { line: '10', stock: 'LOT-II-010', nomenclature: 'UNDERWEAR, COTTON, BLACK', unit: 'EA', qty: 2, cadence: 'M1', cls: 'II', sized: true },
  { line: '11', stock: 'LOT-II-011', nomenclature: 'SOCKS, CREW, MERINO, BLACK', unit: 'PR', qty: 2, cadence: 'M1', cls: 'II', sized: true },
  { line: '12', stock: 'LOT-II-012', nomenclature: 'T-SHIRT, CREW, HEAVYWEIGHT, WHITE', unit: 'EA', qty: 1, cadence: 'M2', cls: 'II', sized: true },
  { line: '13', stock: 'LOT-II-013', nomenclature: 'TOWEL, HAND, COTTON, WHITE', unit: 'EA', qty: 1, cadence: 'M6', cls: 'II', offset: 3 },
  // CLASS III — SUSTENANCE
  { line: '14', stock: 'LOT-III-014', nomenclature: 'TEA, BLACK, LOOSE, 100G', unit: 'PK', qty: 1, cadence: 'M1', cls: 'III' },
  { line: '15', stock: 'LOT-III-015', nomenclature: 'OATS, ROLLED, 500G', unit: 'PK', qty: 1, cadence: 'M1', cls: 'III' },
  { line: '16', stock: 'LOT-III-016', nomenclature: 'BUCKWHEAT, GROATS, 500G', unit: 'PK', qty: 1, cadence: 'M1', cls: 'III' },
  { line: '17', stock: 'LOT-III-017', nomenclature: 'SALT, SEA, COARSE, 250G', unit: 'PK', qty: 1, cadence: 'M3', cls: 'III', offset: 2 },
  { line: '18', stock: 'LOT-III-018', nomenclature: 'HONEY, RAW, 250G', unit: 'JR', qty: 1, cadence: 'M2', cls: 'III', offset: 1 },
  { line: '19', stock: 'LOT-III-019', nomenclature: 'ELECTROLYTE, TABLET, 20-CT', unit: 'TU', qty: 1, cadence: 'M1', cls: 'III' },
  // CLASS IV — HOUSEHOLD
  { line: '20', stock: 'LOT-IV-020', nomenclature: 'DETERGENT, LAUNDRY, SHEET, 32-CT', unit: 'PK', qty: 1, cadence: 'M2', cls: 'IV', offset: 1 },
  { line: '21', stock: 'LOT-IV-021', nomenclature: 'SPONGE, CELLULOSE, 2-PACK', unit: 'PK', qty: 1, cadence: 'M1', cls: 'IV' },
  { line: '22', stock: 'LOT-IV-022', nomenclature: 'CANDLE, PLAIN, WHITE, 8H', unit: 'EA', qty: 2, cadence: 'M3', cls: 'IV', offset: 2 },
  { line: '23', stock: 'LOT-IV-023', nomenclature: 'CARD, MANIFEST, PRINTED', unit: 'EA', qty: 1, cadence: 'M1', cls: 'IV' },
]

export const RATION_DOCTRINE: string[] = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'ONE LOAD. TWENTY-THREE ITEMS. FIXED NOMENCLATURE.',
  'THE OPERATOR IS PLACED ON STRENGTH, NOT ON A CART.',
  'CADENCE REPLACES DECISION. THE BOX ARRIVES. THE MIND IS FREED.',
  'THE LEDGER IS PUBLIC. NOTHING STANDS BETWEEN THE PUBLIC AND THE MANIFEST.',
]

export const RATION_TERMS: Array<[string, string]> = [
  ['PLAN', 'BASIC (RATION)'],
  ['RATE', 'USD 100 / MONTH'],
  ['BILLING', 'ADDITIVE TO USERSHIP (AI)'],
  ['ISSUE', 'MONTHLY. ONE BOX.'],
  ['LOAD', '23 LINES. CADENCE PER LINE.'],
  ['ELIGIBILITY', 'USERSHIP MEMBERS. CONTINENTAL US.'],
  ['STAND DOWN', 'ANY TIME. RATION DROPS. AI RETAINED.'],
]

/**
 * UPGRADE state machine. Month 1 renders states read-only.
 * Month 2 wires transitions server-side.
 */
export type RationState = 'USERSHIP_AI' | 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE' | 'STOOD_DOWN'

export const RATION_STATE_LABEL: Record<RationState, string> = {
  USERSHIP_AI: 'USERSHIP / AI',
  PENDING: 'PENDING',
  ON_STRENGTH: 'ON STRENGTH',
  STEADY_STATE: 'STEADY STATE',
  STOOD_DOWN: 'STOOD DOWN',
}

export const RATION_STATE_ORDER: RationState[] = [
  'USERSHIP_AI',
  'PENDING',
  'ON_STRENGTH',
  'STEADY_STATE',
]

/** Allowed transitions. STAND DOWN returns the operator to USERSHIP_AI. */
export const RATION_TRANSITIONS: Record<RationState, RationState[]> = {
  USERSHIP_AI: ['PENDING'],
  PENDING: ['ON_STRENGTH', 'USERSHIP_AI'],
  ON_STRENGTH: ['STEADY_STATE', 'STOOD_DOWN'],
  STEADY_STATE: ['STOOD_DOWN'],
  STOOD_DOWN: ['USERSHIP_AI'],
}

export const canTransitionRation = (from: RationState, to: RationState): boolean =>
  RATION_TRANSITIONS[from].includes(to)

/**
 * Load for issue N (1-indexed). A line is issued when
 * (N - 1 - offset) mod interval === 0. Issue 1 carries every M1 line plus the
 * un-staggered slow lines; the cycle repeats every 6 issues (LCM of cadences).
 */
export const rationLoadForIssue = (issueNumber: number): RationItem[] => {
  const n = Math.max(1, Math.floor(issueNumber))
  return RATION_LOAD.filter((item) => {
    const interval = RATION_CADENCE_MONTHS[item.cadence]
    const k = n - 1 - (item.offset ?? 0)
    return ((k % interval) + interval) % interval === 0
  })
}

/** Issue numbers 1..count on which a given line ships. */
export const rationIssuesForLine = (item: RationItem, count = 6): number[] => {
  const out: number[] = []
  for (let n = 1; n <= count; n++) {
    if (rationLoadForIssue(n).some((i) => i.line === item.line)) out.push(n)
  }
  return out
}
