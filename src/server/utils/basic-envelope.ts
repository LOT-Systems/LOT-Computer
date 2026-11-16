/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — BASIC envelope. SERVER ONLY. COGS IS WITHHELD FROM THE PUBLIC.
// Figures are planning estimates (USD, landed, small-volume wholesale) until
// Month 3 supplier quotes replace them. Each quote must keep every issue
// under the ceiling.

import {
  BASIC_PRICE_USD,
  RATION_MANIFEST,
  loadForIssue,
} from '#shared/constants/basic'

export const COGS_CEILING_USD = 40
export const MARGIN_FLOOR_PCT = 60

/** Per-line unit COGS estimate, keyed by manifest seq. */
export const UNIT_COGS_USD: Record<string, number> = {
  '01': 1.5,  '02': 3.0,  '03': 3.0,  '04': 1.8,  '05': 0.9,
  '06': 0.8,  '07': 2.2,  '08': 3.5,  '09': 0.7,  '10': 2.5,
  '11': 3.5,  '12': 1.2,  '13': 1.0,  '14': 2.2,  '15': 2.0,
  '16': 1.0,  '17': 6.0,  '18': 3.5,  '19': 5.5,  '20': 3.0,
  '21': 1.5,  '22': 1.2,  '23': 0.6,
}

/** Fixed cost per box shipped. */
export const FIXED_PER_ISSUE_USD = {
  box: 1.2,
  manifestCard: 0.6,
  pickPack: 2.5,
  outboundPostage: 8.5,
}

const round2 = (n: number) => Math.round(n * 100) / 100

export type IssueEnvelope = {
  issueNo: number
  lines: number
  goodsUsd: number
  fixedUsd: number
  landedUsd: number
  marginPct: number
  withinCeiling: boolean
}

export function envelopeForIssue(issueNo: number): IssueEnvelope {
  const load = loadForIssue(issueNo)
  const goods = load.reduce((sum, item) => {
    const unit = UNIT_COGS_USD[item.seq]
    if (unit === undefined) throw new Error(`NO COGS FOR LINE ${item.seq}`)
    return sum + unit
  }, 0)
  const fixed = Object.values(FIXED_PER_ISSUE_USD).reduce((a, b) => a + b, 0)
  const landed = goods + fixed
  const marginPct = ((BASIC_PRICE_USD - landed) / BASIC_PRICE_USD) * 100
  return {
    issueNo,
    lines: load.length,
    goodsUsd: round2(goods),
    fixedUsd: round2(fixed),
    landedUsd: round2(landed),
    marginPct: round2(marginPct),
    withinCeiling: landed <= COGS_CEILING_USD && marginPct >= MARGIN_FLOOR_PCT,
  }
}

/** One full year of issues — every cadence (max 12) completes a cycle. */
export function envelopeForYear(): IssueEnvelope[] {
  return Array.from({ length: 12 }, (_, i) => envelopeForIssue(i + 1))
}

export function verifyEnvelope(): { ok: boolean; peak: IssueEnvelope; avgLandedUsd: number; issues: IssueEnvelope[] } {
  const missing = RATION_MANIFEST.filter((i) => UNIT_COGS_USD[i.seq] === undefined)
  if (missing.length) throw new Error(`COGS MISSING: ${missing.map((i) => i.seq).join(',')}`)
  const issues = envelopeForYear()
  const peak = issues.reduce((a, b) => (b.landedUsd > a.landedUsd ? b : a))
  const avgLandedUsd = round2(issues.reduce((s, i) => s + i.landedUsd, 0) / issues.length)
  return { ok: issues.every((i) => i.withinCeiling), peak, avgLandedUsd, issues }
}
