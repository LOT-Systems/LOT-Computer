/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — INTERNAL COST SHEET (SERVER ONLY — NEVER BUNDLE TO CLIENT)
 *
 * Unit costs are per-issue quantities at 100-subscriber bulk volume.
 * Status ESTIMATE until a supplier quote is confirmed (Month 3).
 */

import {
  RATION_LOAD,
  RATION_PRICE_USD,
  RATION_MARGIN_FLOOR,
  RATION_LANDED_CEILING_USD,
  rationLoadForIssue,
} from '#shared/constants/ration'

export type CostStatus = 'ESTIMATE' | 'QUOTED' | 'CONFIRMED'

export const RATION_COGS: Record<string, { usd: number; status: CostStatus }> = {
  '01': { usd: 0.6, status: 'ESTIMATE' },
  '02': { usd: 0.9, status: 'ESTIMATE' },
  '03': { usd: 0.5, status: 'ESTIMATE' },
  '04': { usd: 1.4, status: 'ESTIMATE' },
  '05': { usd: 1.6, status: 'ESTIMATE' },
  '06': { usd: 1.2, status: 'ESTIMATE' },
  '07': { usd: 2.4, status: 'ESTIMATE' },
  '08': { usd: 0.4, status: 'ESTIMATE' },
  '09': { usd: 2.2, status: 'ESTIMATE' },
  '10': { usd: 4.0, status: 'ESTIMATE' },
  '11': { usd: 5.0, status: 'ESTIMATE' },
  '12': { usd: 3.5, status: 'ESTIMATE' },
  '13': { usd: 1.8, status: 'ESTIMATE' },
  '14': { usd: 1.2, status: 'ESTIMATE' },
  '15': { usd: 0.7, status: 'ESTIMATE' },
  '16': { usd: 1.1, status: 'ESTIMATE' },
  '17': { usd: 0.4, status: 'ESTIMATE' },
  '18': { usd: 1.8, status: 'ESTIMATE' },
  '19': { usd: 1.5, status: 'ESTIMATE' },
  '20': { usd: 1.6, status: 'ESTIMATE' },
  '21': { usd: 0.5, status: 'ESTIMATE' },
  '22': { usd: 0.8, status: 'ESTIMATE' },
  '23': { usd: 0.15, status: 'ESTIMATE' },
}

/** Per-box fixed landed cost: carton + dunnage, and domestic ground postage. */
export const RATION_PACK_USD = 1.2
export const RATION_POSTAGE_USD = 6.5
/** Card processing on the $100 charge (2.9% + $0.30). Counted against margin. */
export const RATION_PROCESSING_USD = RATION_PRICE_USD * 0.029 + 0.3

export type IssueEnvelope = {
  issue: number
  lines: number
  landedUsd: number
  marginPct: number
  withinCeiling: boolean
  withinMargin: boolean
}

export const landedForIssue = (issue: number): number => {
  const goods = rationLoadForIssue(issue).reduce(
    (sum, item) => sum + (RATION_COGS[item.line]?.usd ?? Infinity),
    0
  )
  return round2(goods + RATION_PACK_USD + RATION_POSTAGE_USD)
}

export const envelopeForIssue = (issue: number): IssueEnvelope => {
  const landedUsd = landedForIssue(issue)
  const marginPct = round2(
    ((RATION_PRICE_USD - landedUsd - RATION_PROCESSING_USD) / RATION_PRICE_USD) * 100
  )
  return {
    issue,
    lines: rationLoadForIssue(issue).length,
    landedUsd,
    marginPct,
    withinCeiling: landedUsd <= RATION_LANDED_CEILING_USD,
    withinMargin: marginPct >= RATION_MARGIN_FLOOR * 100,
  }
}

/** Full 6-issue cycle check. Every issue must hold the envelope. */
export const envelopeCycle = (): {
  issues: IssueEnvelope[]
  peakLandedUsd: number
  avgLandedUsd: number
  minMarginPct: number
  green: boolean
  costedLines: number
} => {
  const issues = [1, 2, 3, 4, 5, 6].map(envelopeForIssue)
  const peakLandedUsd = Math.max(...issues.map((i) => i.landedUsd))
  const avgLandedUsd = round2(issues.reduce((s, i) => s + i.landedUsd, 0) / issues.length)
  const minMarginPct = Math.min(...issues.map((i) => i.marginPct))
  const costedLines = RATION_LOAD.filter((i) => RATION_COGS[i.line]).length
  return {
    issues,
    peakLandedUsd,
    avgLandedUsd,
    minMarginPct,
    costedLines,
    green:
      costedLines === RATION_LOAD.length &&
      issues.every((i) => i.withinCeiling && i.withinMargin),
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
