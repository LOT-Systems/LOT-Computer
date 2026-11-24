/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — BASIC (RATION) MODULE
 *
 * Public doctrine + 23-item load. This file is shared (client + server) and is
 * therefore PUBLIC. It MUST NOT carry cost data. COGS lives server-side only in
 * src/server/basics/cogs.ts.
 */

export const BASICS_DOC_ID = 'LOT-FM-001'
export const BASICS_PLAN_CODE = 'BASIC'
export const BASICS_PRICE_USD = 100
export const BASICS_BILLING_PERIOD = 'MO'
export const BASICS_MARGIN_FLOOR = 0.6
/** Landed COGS ceiling per issue. Derived: price × (1 − margin floor). */
export const BASICS_COGS_CEILING_USD = BASICS_PRICE_USD * (1 - BASICS_MARGIN_FLOOR)

export const BASICS_DOCTRINE: readonly string[] = [
  'LOT ISSUES. LOT DOES NOT SELL.',
  'ONE LOAD. TWENTY-THREE ITEMS. FIXED NOMENCLATURE.',
  'ITEMS ARRIVE ON CADENCE. NOTHING ARRIVES BY IMPULSE.',
  'BLACK AND WHITE. NO LOGOS ON THE BODY. NO NOVELTY.',
  'THE LEDGER IS PUBLIC. WHAT YOU READ IS WHAT IS ISSUED.',
  'STAND DOWN AT ANY TIME. THE AI PLAN REMAINS.',
]

export const BASICS_TERMS: readonly string[] = [
  `USD ${BASICS_PRICE_USD}/${BASICS_BILLING_PERIOD} — ADDITIVE TO USERSHIP (AI PLAN).`,
  'ONE ISSUE PER MONTH. CONTENTS FOLLOW THE CADENCE TABLE.',
  'SHIPPING INCLUDED. CONTINENTAL US AT FIRST ISSUE.',
  'STAND DOWN ENDS THE RATION AT THE CLOSE OF THE CURRENT CYCLE.',
]

/**
 * Cadence: the issue interval in months.
 *   M = every issue (1) · Q = quarterly (3) · S = semiannual (6) · A = annual (12)
 */
export type BasicsCadence = 'M' | 'Q' | 'S' | 'A'

export const BASICS_CADENCE_MONTHS: Record<BasicsCadence, number> = {
  M: 1,
  Q: 3,
  S: 6,
  A: 12,
}

export const BASICS_CADENCE_LABEL: Record<BasicsCadence, string> = {
  M: 'MONTHLY',
  Q: 'QUARTERLY',
  S: 'SEMIANNUAL',
  A: 'ANNUAL',
}

export type BasicsGroup = 'GARMENT' | 'HYGIENE' | 'MEDICAL' | 'PROVISION' | 'POWER' | 'STATIONERY'

export interface BasicsItem {
  /** Line number, 01–23. Stable. Never renumber. */
  line: string
  /** Military-spec nomenclature: NOUN, MODIFIER, MODIFIER. */
  nomenclature: string
  group: BasicsGroup
  qty: number
  unit: 'EA' | 'PR' | 'PK' | 'BX'
  cadence: BasicsCadence
  /**
   * Phase offset (0-based month index within the cadence) of the first issue.
   * Staggers non-monthly lines so no single issue breaches the COGS ceiling.
   */
  offset: number
}

export const BASICS_MANIFEST: readonly BasicsItem[] = [
  { line: '01', nomenclature: 'SHIRT, T, CREW, COTTON, BLACK', group: 'GARMENT', qty: 1, unit: 'EA', cadence: 'Q', offset: 0 },
  { line: '02', nomenclature: 'SHIRT, T, CREW, COTTON, WHITE', group: 'GARMENT', qty: 1, unit: 'EA', cadence: 'Q', offset: 1 },
  { line: '03', nomenclature: 'SOCK, CREW, MERINO BLEND, BLACK', group: 'GARMENT', qty: 1, unit: 'PR', cadence: 'M', offset: 0 },
  { line: '04', nomenclature: 'BRIEF, BOXER, COTTON STRETCH, BLACK', group: 'GARMENT', qty: 1, unit: 'EA', cadence: 'Q', offset: 2 },
  { line: '05', nomenclature: 'TOWEL, HAND, COTTON, WHITE', group: 'GARMENT', qty: 1, unit: 'EA', cadence: 'S', offset: 4 },
  { line: '06', nomenclature: 'TOOTHBRUSH, MANUAL, SOFT, WHITE', group: 'HYGIENE', qty: 1, unit: 'EA', cadence: 'Q', offset: 0 },
  { line: '07', nomenclature: 'TOOTHPASTE, FLUORIDE, 100 ML', group: 'HYGIENE', qty: 1, unit: 'EA', cadence: 'M', offset: 0 },
  { line: '08', nomenclature: 'FLOSS, DENTAL, WAXED, 50 M', group: 'HYGIENE', qty: 1, unit: 'EA', cadence: 'Q', offset: 1 },
  { line: '09', nomenclature: 'SOAP, BAR, UNSCENTED, 120 G', group: 'HYGIENE', qty: 1, unit: 'EA', cadence: 'M', offset: 0 },
  { line: '10', nomenclature: 'SHAMPOO, BAR, UNSCENTED, 80 G', group: 'HYGIENE', qty: 1, unit: 'EA', cadence: 'Q', offset: 2 },
  { line: '11', nomenclature: 'DEODORANT, STICK, UNSCENTED', group: 'HYGIENE', qty: 1, unit: 'EA', cadence: 'Q', offset: 0 },
  { line: '12', nomenclature: 'RAZOR, SAFETY, BLADE, DOUBLE EDGE', group: 'HYGIENE', qty: 5, unit: 'PK', cadence: 'Q', offset: 1 },
  { line: '13', nomenclature: 'BALM, LIP, UNSCENTED', group: 'HYGIENE', qty: 1, unit: 'EA', cadence: 'Q', offset: 2 },
  { line: '14', nomenclature: 'SUNSCREEN, SPF 30, 50 ML', group: 'HYGIENE', qty: 1, unit: 'EA', cadence: 'S', offset: 3 },
  { line: '15', nomenclature: 'CREAM, HAND, UNSCENTED, 50 ML', group: 'HYGIENE', qty: 1, unit: 'EA', cadence: 'S', offset: 0 },
  { line: '16', nomenclature: 'TISSUE, FACIAL, POCKET', group: 'HYGIENE', qty: 4, unit: 'PK', cadence: 'M', offset: 0 },
  { line: '17', nomenclature: 'BANDAGE, ADHESIVE, ASSORTED', group: 'MEDICAL', qty: 1, unit: 'BX', cadence: 'S', offset: 2 },
  { line: '18', nomenclature: 'ELECTROLYTE, POWDER, SACHET', group: 'PROVISION', qty: 10, unit: 'PK', cadence: 'M', offset: 0 },
  { line: '19', nomenclature: 'TEA, BLACK, LOOSE LEAF, 50 G', group: 'PROVISION', qty: 1, unit: 'EA', cadence: 'M', offset: 0 },
  { line: '20', nomenclature: 'BATTERY, AA, ALKALINE', group: 'POWER', qty: 4, unit: 'PK', cadence: 'S', offset: 5 },
  { line: '21', nomenclature: 'CABLE, USB-C TO USB-C, 1 M, BLACK', group: 'POWER', qty: 1, unit: 'EA', cadence: 'A', offset: 7 },
  { line: '22', nomenclature: 'NOTEBOOK, GRID, A6, BLACK', group: 'STATIONERY', qty: 1, unit: 'EA', cadence: 'Q', offset: 1 },
  { line: '23', nomenclature: 'PEN, GEL, 0.5 MM, BLACK INK', group: 'STATIONERY', qty: 1, unit: 'EA', cadence: 'Q', offset: 2 },
] as const

export const BASICS_ITEM_COUNT = BASICS_MANIFEST.length

/**
 * Lines issued at a given cycle (0-based month index since ON STRENGTH).
 * Pure. Month 3 load engine builds on this.
 */
export function basicsLoadForCycle(cycle: number): BasicsItem[] {
  if (!Number.isInteger(cycle) || cycle < 0) return []
  return BASICS_MANIFEST.filter((item) => {
    const every = BASICS_CADENCE_MONTHS[item.cadence]
    return cycle >= item.offset && (cycle - item.offset) % every === 0
  })
}

// -----------------------------------------------------------------------------
// ENROLLMENT STATE MACHINE (doctrine for Month 2 — UPGRADE / STAND DOWN)
// -----------------------------------------------------------------------------

export type BasicsState = 'USERSHIP_AI' | 'PENDING' | 'ON_STRENGTH' | 'STEADY_STATE'

export type BasicsEvent =
  | 'UPGRADE' // member requests ration
  | 'ROSTER_COMPLETE' // sizing + shipping + cadence start + billing confirmed
  | 'FIRST_ISSUE_DISPATCHED'
  | 'STAND_DOWN' // drops ration, retains AI plan
  | 'CANCEL_PENDING'

export const BASICS_STATE_LABEL: Record<BasicsState, string> = {
  USERSHIP_AI: 'USERSHIP / AI',
  PENDING: 'PENDING',
  ON_STRENGTH: 'ON STRENGTH',
  STEADY_STATE: 'STEADY STATE',
}

const TRANSITIONS: Record<BasicsState, Partial<Record<BasicsEvent, BasicsState>>> = {
  USERSHIP_AI: { UPGRADE: 'PENDING' },
  PENDING: { ROSTER_COMPLETE: 'ON_STRENGTH', CANCEL_PENDING: 'USERSHIP_AI' },
  ON_STRENGTH: { FIRST_ISSUE_DISPATCHED: 'STEADY_STATE', STAND_DOWN: 'USERSHIP_AI' },
  STEADY_STATE: { STAND_DOWN: 'USERSHIP_AI' },
}

/** Returns the next state, or null if the event is illegal in this state. */
export function basicsTransition(state: BasicsState, event: BasicsEvent): BasicsState | null {
  return TRANSITIONS[state]?.[event] ?? null
}

export interface BasicsManifestPayload {
  doc: string
  plan: string
  priceUsd: number
  period: string
  itemCount: number
  doctrine: readonly string[]
  terms: readonly string[]
  manifest: readonly BasicsItem[]
}

export function basicsPublicPayload(): BasicsManifestPayload {
  return {
    doc: BASICS_DOC_ID,
    plan: BASICS_PLAN_CODE,
    priceUsd: BASICS_PRICE_USD,
    period: BASICS_BILLING_PERIOD,
    itemCount: BASICS_ITEM_COUNT,
    doctrine: BASICS_DOCTRINE,
    terms: BASICS_TERMS,
    manifest: BASICS_MANIFEST,
  }
}
