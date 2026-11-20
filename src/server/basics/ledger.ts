/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 · BASIC (RATION) · COGS LEDGER — SERVER ONLY. WITHHELD FROM PUBLIC.
 *
 * Unit costs are PLANNING ESTIMATES (USD, landed at the fulfillment dock),
 * not supplier quotes. Month 3 replaces every line with a confirmed quote.
 * The envelope check below is the gate: no load ships that breaches it.
 */

import {
  BASICS_MANIFEST,
  BASICS_PRICE_USD,
  BASICS_CYCLE_LENGTH,
  loadForIssue,
} from '#shared/basics'

export type CostSource = 'ESTIMATE' | 'QUOTE'

/** Unit COGS per line, keyed by NSN. */
export const BASICS_UNIT_COGS: Record<string, { usd: number; source: CostSource }> = {
  '01': { usd: 4.2, source: 'ESTIMATE' },
  '02': { usd: 1.5, source: 'ESTIMATE' },
  '03': { usd: 1.9, source: 'ESTIMATE' },
  '04': { usd: 2.0, source: 'ESTIMATE' },
  '05': { usd: 1.6, source: 'ESTIMATE' },
  '06': { usd: 1.4, source: 'ESTIMATE' },
  '07': { usd: 0.9, source: 'ESTIMATE' },
  '08': { usd: 3.6, source: 'ESTIMATE' },
  '09': { usd: 2.6, source: 'ESTIMATE' },
  '10': { usd: 0.8, source: 'ESTIMATE' },
  '11': { usd: 3.0, source: 'ESTIMATE' },
  '12': { usd: 2.9, source: 'ESTIMATE' },
  '13': { usd: 5.2, source: 'ESTIMATE' },
  '14': { usd: 4.4, source: 'ESTIMATE' },
  '15': { usd: 3.8, source: 'ESTIMATE' },
  '16': { usd: 3.9, source: 'ESTIMATE' },
  '17': { usd: 1.2, source: 'ESTIMATE' },
  '18': { usd: 0.25, source: 'ESTIMATE' },
  '19': { usd: 2.6, source: 'ESTIMATE' },
  '20': { usd: 3.2, source: 'ESTIMATE' },
  '21': { usd: 4.8, source: 'ESTIMATE' },
  '22': { usd: 6.0, source: 'ESTIMATE' },
  '23': { usd: 8.5, source: 'ESTIMATE' },
}

/** Per-issue overhead, landed. */
export const BASICS_ISSUE_OVERHEAD = {
  mailerUsd: 1.1, // corrugated mailer, 1-color black print
  pickPackUsd: 2.0, // 3PL pick/pack, per order
  postageUsd: 7.4, // USPS Ground Advantage, ~2 LB, blended zone
}

/** Card processing on USD 100. Not landed cost, but counted against margin. */
export const BASICS_PROCESSING_USD = 0.029 * BASICS_PRICE_USD + 0.3

export const BASICS_ENVELOPE = {
  /** Hard ceiling. A load above this does not ship. */
  landedCeilingUsd: 40,
  /** Margin floor, (price − landed) / price. */
  marginFloor: 0.6,
}

export interface IssueCosting {
  issue: number
  lines: string[]
  goodsUsd: number
  overheadUsd: number
  landedUsd: number
  margin: number
  netMargin: number
  withinEnvelope: boolean
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function costIssue(issueIndex: number): IssueCosting {
  const items = loadForIssue(issueIndex)
  const goods = items.reduce((sum, item) => {
    const cost = BASICS_UNIT_COGS[item.nsn]
    if (!cost) throw new Error(`[BASICS] NO COGS FOR LINE ${item.nsn}`)
    return sum + cost.usd
  }, 0)
  const o = BASICS_ISSUE_OVERHEAD
  const overhead = o.mailerUsd + o.pickPackUsd + o.postageUsd
  const landed = goods + overhead
  const margin = (BASICS_PRICE_USD - landed) / BASICS_PRICE_USD
  const netMargin = (BASICS_PRICE_USD - landed - BASICS_PROCESSING_USD) / BASICS_PRICE_USD
  return {
    issue: issueIndex + 1,
    lines: items.map((i) => i.nsn),
    goodsUsd: round2(goods),
    overheadUsd: round2(overhead),
    landedUsd: round2(landed),
    margin: round2(margin),
    netMargin: round2(netMargin),
    withinEnvelope:
      landed <= BASICS_ENVELOPE.landedCeilingUsd && margin >= BASICS_ENVELOPE.marginFloor,
  }
}

export interface EnvelopeReport {
  issues: IssueCosting[]
  peakLandedUsd: number
  meanLandedUsd: number
  minMargin: number
  allWithinEnvelope: boolean
  quotedLines: number
  estimatedLines: number
}

export function envelopeReport(): EnvelopeReport {
  const missing = BASICS_MANIFEST.filter((i) => !BASICS_UNIT_COGS[i.nsn])
  if (missing.length) {
    throw new Error(`[BASICS] COGS MISSING: ${missing.map((i) => i.nsn).join(', ')}`)
  }
  const issues = Array.from({ length: BASICS_CYCLE_LENGTH }, (_, i) => costIssue(i))
  const landed = issues.map((i) => i.landedUsd)
  const sources = Object.values(BASICS_UNIT_COGS)
  return {
    issues,
    peakLandedUsd: Math.max(...landed),
    meanLandedUsd: round2(landed.reduce((a, b) => a + b, 0) / landed.length),
    minMargin: Math.min(...issues.map((i) => i.margin)),
    allWithinEnvelope: issues.every((i) => i.withinEnvelope),
    quotedLines: sources.filter((s) => s.source === 'QUOTE').length,
    estimatedLines: sources.filter((s) => s.source === 'ESTIMATE').length,
  }
}
