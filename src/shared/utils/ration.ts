/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — BASIC RATION: manifest + load engine (single source of truth).
// Consumed by server (issue scheduling) and client (ledger, next issue, card).

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

export const RATION_PRICE_USD = 100
export const RATION_COGS_CEILING_USD = 40
export const RATION_MARGIN_FLOOR_PCT = 60

/** Issue #1 is the full load (all 23). Cadence period index p = issueNumber - 1. */
const CADENCE_PERIOD: Record<RationCadence, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  'SEMI-ANNUALLY': 6,
  ANNUALLY: 12,
}

export function itemsForIssue(issueNumber: number): RationItem[] {
  const p = Math.max(0, Math.floor(issueNumber) - 1)
  return RATION_MANIFEST.filter(i => p % CADENCE_PERIOD[i.cadence] === 0)
}

/** Landed cost of an issue against a {seq: unitCostUSD} quote table. */
export function issueCogs(
  issueNumber: number,
  quotes: Record<string, number>
): { totalUsd: number; unquoted: string[] } {
  let totalUsd = 0
  const unquoted: string[] = []
  for (const i of itemsForIssue(issueNumber)) {
    const q = quotes[i.seq]
    if (q === undefined) unquoted.push(i.seq)
    else totalUsd += q * i.qty
  }
  return { totalUsd: Math.round(totalUsd * 100) / 100, unquoted }
}

/** Margin verdict. Never passes while any item is unquoted. */
export function marginCheck(totalUsd: number, unquoted: string[]) {
  const marginPct = ((RATION_PRICE_USD - totalUsd) / RATION_PRICE_USD) * 100
  const ok = unquoted.length === 0 &&
    totalUsd <= RATION_COGS_CEILING_USD && marginPct >= RATION_MARGIN_FLOOR_PCT
  return { ok, marginPct: Math.round(marginPct * 10) / 10 }
}
