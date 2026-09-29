/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — COGS BUDGET (INTERNAL — NEVER RENDERED IN OPEN TAB)
// Per-unit landed TARGETS in USD. A target is a ceiling to quote against,
// not a supplier quote. quoted=false until a written supplier quote is filed.

import { RATION_MANIFEST, RATION_PRICE_USD, RATION_COGS_CEILING_USD, RATION_MARGIN_FLOOR_PCT } from './constants'

export const CADENCE_MONTHS = { MONTHLY: 1, QUARTERLY: 3, 'SEMI-ANNUALLY': 6, ANNUALLY: 12 } as const

// seq -> target landed cost per unit (USD)
export const UNIT_COST_TARGET: Record<string, number> = {
  '01': 1.2,  '02': 0.6,  '03': 0.6,  '04': 0.6,  '05': 0.8,  '06': 0.9,
  '07': 1.2,  '08': 1.8,  '09': 0.7,  '10': 1.5,  '11': 2.0,  '12': 0.6,
  '13': 2.5,  '14': 1.5,  '15': 2.0,  '16': 3.0,  '17': 1.5,  '18': 0.75,
  '19': 2.0,  '20': 4.0,  '21': 1.5,  '22': 1.2,  '23': 0.5,
}

// Non-item lines, per issue (USD)
export const PACK_USD = 2.0
export const FREIGHT_USD = 5.0

export type CogsReport = {
  itemsUsd: number
  packUsd: number
  freightUsd: number
  landedUsd: number
  marginPct: number
  withinCeiling: boolean
  marginOk: boolean
  missing: string[]
  quotedCount: number
}

/** Monthly-equivalent landed cost of the 23-item load + pack + freight. */
export const computeCogs = (quoted: ReadonlySet<string> = new Set()): CogsReport => {
  const missing: string[] = []
  let itemsUsd = 0
  for (const item of RATION_MANIFEST) {
    const unit = UNIT_COST_TARGET[item.seq]
    if (unit === undefined) { missing.push(item.seq); continue }
    itemsUsd += (unit * item.qty) / CADENCE_MONTHS[item.cadence]
  }
  const landedUsd = itemsUsd + PACK_USD + FREIGHT_USD
  const marginPct = ((RATION_PRICE_USD - landedUsd) / RATION_PRICE_USD) * 100
  return {
    itemsUsd, packUsd: PACK_USD, freightUsd: FREIGHT_USD, landedUsd, marginPct,
    withinCeiling: missing.length === 0 && landedUsd <= RATION_COGS_CEILING_USD,
    marginOk: missing.length === 0 && marginPct >= RATION_MARGIN_FLOOR_PCT,
    missing,
    quotedCount: RATION_MANIFEST.filter(i => quoted.has(i.seq)).length,
  }
}
