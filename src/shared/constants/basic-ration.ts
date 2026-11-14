/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — BASIC RATION MODULE
// 23-ITEM CIVILIAN RATION LOAD

export type RationCadence = 'MONTHLY' | 'QUARTERLY' | 'SEMI-ANNUALLY' | 'ANNUALLY'

export type RationItem = {
  seq: string
  nomenclature: string
  cadence: RationCadence
  qty: number
  unit: string
  category: 'HYGIENE' | 'HEALTH' | 'SUSTENANCE' | 'OPERATIONAL'
}

export const RATION_MANIFEST: RationItem[] = [
  { seq: '01', nomenclature: 'SOAP, CASTILE, UNSCENTED',          cadence: 'MONTHLY',       qty: 1, unit: '4OZ BAR',        category: 'HYGIENE' },
  { seq: '02', nomenclature: 'SHAMPOO, LIQUID, UNSCENTED',         cadence: 'MONTHLY',       qty: 1, unit: '2OZ',            category: 'HYGIENE' },
  { seq: '03', nomenclature: 'CONDITIONER, LIGHT',                 cadence: 'MONTHLY',       qty: 1, unit: '2OZ',            category: 'HYGIENE' },
  { seq: '04', nomenclature: 'BODY WASH, FOAMING',                 cadence: 'MONTHLY',       qty: 1, unit: '2OZ',            category: 'HYGIENE' },
  { seq: '05', nomenclature: 'TOOTHPASTE, FLUORIDE',               cadence: 'MONTHLY',       qty: 1, unit: '1OZ TUBE',       category: 'HYGIENE' },
  { seq: '06', nomenclature: 'DENTAL FLOSS, WAXED',                cadence: 'MONTHLY',       qty: 1, unit: '30YD',           category: 'HYGIENE' },
  { seq: '07', nomenclature: 'TOOTHBRUSH, SOFT, MANUAL',           cadence: 'QUARTERLY',     qty: 1, unit: 'EACH',           category: 'HYGIENE' },
  { seq: '08', nomenclature: 'DEODORANT, SOLID, UNSCENTED',        cadence: 'MONTHLY',       qty: 1, unit: '1OZ STICK',      category: 'HYGIENE' },
  { seq: '09', nomenclature: 'LIP BALM, SPF-15',                   cadence: 'MONTHLY',       qty: 1, unit: 'EACH',           category: 'HYGIENE' },
  { seq: '10', nomenclature: 'MOISTURIZER, FRAGRANCE-FREE',        cadence: 'MONTHLY',       qty: 1, unit: '1OZ',            category: 'HYGIENE' },
  { seq: '11', nomenclature: 'SUNSCREEN, MINERAL, SPF-50',         cadence: 'MONTHLY',       qty: 1, unit: '1OZ',            category: 'HYGIENE' },
  { seq: '12', nomenclature: 'HAND SANITIZER, 70% ETHANOL',        cadence: 'MONTHLY',       qty: 1, unit: '2OZ',            category: 'HYGIENE' },
  { seq: '13', nomenclature: 'NAIL CLIPPERS, STAINLESS STEEL',     cadence: 'SEMI-ANNUALLY', qty: 1, unit: 'EACH',           category: 'HYGIENE' },
  { seq: '14', nomenclature: 'BANDAGES, ADHESIVE, ASSORTED',       cadence: 'QUARTERLY',     qty: 1, unit: '10CT',           category: 'HEALTH' },
  { seq: '15', nomenclature: 'VITAMIN C, 500MG TABLET',            cadence: 'MONTHLY',       qty: 1, unit: '30CT',           category: 'HEALTH' },
  { seq: '16', nomenclature: 'MULTIVITAMIN, DAILY TABLET',         cadence: 'MONTHLY',       qty: 1, unit: '30CT',           category: 'HEALTH' },
  { seq: '17', nomenclature: 'MELATONIN, 3MG TABLET',              cadence: 'MONTHLY',       qty: 1, unit: '30CT',           category: 'HEALTH' },
  { seq: '18', nomenclature: 'ELECTROLYTE POWDER, SACHET',         cadence: 'MONTHLY',       qty: 4, unit: 'CT',             category: 'HEALTH' },
  { seq: '19', nomenclature: 'PROTEIN BAR, ASSORTED',              cadence: 'MONTHLY',       qty: 2, unit: 'CT',             category: 'SUSTENANCE' },
  { seq: '20', nomenclature: 'COFFEE, GROUND, DARK ROAST',         cadence: 'MONTHLY',       qty: 1, unit: '3OZ BAG',        category: 'SUSTENANCE' },
  { seq: '21', nomenclature: 'TEA, ASSORTED BAGS',                 cadence: 'MONTHLY',       qty: 1, unit: '10CT',           category: 'SUSTENANCE' },
  { seq: '22', nomenclature: 'NOTECARD, RULED',                    cadence: 'QUARTERLY',     qty: 1, unit: '50-SHEET PAD',   category: 'OPERATIONAL' },
  { seq: '23', nomenclature: 'PEN, BALLPOINT, BLACK',              cadence: 'QUARTERLY',     qty: 2, unit: 'CT',             category: 'OPERATIONAL' },
]

// ── LOAD ENGINE ──────────────────────────────────────────────────────────────
// Single source of truth for what ships in issue N. Used by server (itemCount,
// scheduling) and client (next issue, printed manifest card).
// Issue 1 is the full load: every cadence ships. Thereafter, by month index
// m = N - 1: MONTHLY every issue, QUARTERLY when m % 3 === 0, SEMI-ANNUALLY
// when m % 6 === 0, ANNUALLY when m % 12 === 0.
const CADENCE_PERIOD: Record<RationCadence, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  'SEMI-ANNUALLY': 6,
  ANNUALLY: 12,
}

export function cadencesForIssue(issueNumber: number): RationCadence[] {
  const m = Math.max(0, Math.floor(issueNumber) - 1)
  return (Object.keys(CADENCE_PERIOD) as RationCadence[]).filter(
    (c) => m % CADENCE_PERIOD[c] === 0
  )
}

export function itemsForIssue(issueNumber: number): RationItem[] {
  const active = cadencesForIssue(issueNumber)
  return RATION_MANIFEST.filter((item) => active.includes(item.cadence))
}

/** First day (UTC) of the month `offset` months after `from`. */
export function issueDateFrom(from: Date, offset: number): Date {
  return new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + offset, 1))
}

export function periodLabelFor(date: Date): string {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).toUpperCase()
}

export const RATION_PRICE_USD = 100
export const RATION_COGS_CEILING_USD = 40
export const RATION_MARGIN_FLOOR_PCT = 60

/** Margin check against the envelope. Returns pct (0–100) and pass flag. */
export function marginCheck(landedCostUsd: number) {
  const pct = ((RATION_PRICE_USD - landedCostUsd) / RATION_PRICE_USD) * 100
  return {
    pct: Math.round(pct * 10) / 10,
    pass: landedCostUsd <= RATION_COGS_CEILING_USD && pct >= RATION_MARGIN_FLOOR_PCT,
  }
}

export const DOCTRINE_LINES = [
  'THE BASIC RATION IS A MONTHLY ISSUE, NOT A PURCHASE.',
  'LOT ISSUES TO MEMBERS ON STRENGTH. THE LEDGER IS THE MARKETING.',
  'NO LAYER BETWEEN THE PUBLIC AND THE MANIFEST.',
  'ADDITIVE TO USERSHIP (AI) PLAN. STAND DOWN DROPS RATION, RETAINS AI.',
]

export const RATION_STATES = {
  USERSHIP: 'USERSHIP',
  PENDING: 'PENDING',
  ON_STRENGTH: 'ON_STRENGTH',
  STEADY_STATE: 'STEADY_STATE',
} as const

export type RationState = (typeof RATION_STATES)[keyof typeof RATION_STATES]

