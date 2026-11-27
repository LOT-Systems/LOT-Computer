/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 · BASIC (RATION) · COGS ENVELOPE — SERVER ONLY. NEVER EXPOSE.
 *
 * Landed cost per ISSUE EVENT (full qty), USD. Status: ESTIMATE (M1).
 * Month 3 replaces each line with a confirmed supplier quote (status QUOTED).
 *
 * Envelope: price USD 100 / MO · margin ≥ 60% · landed ≤ USD 40 in EVERY month.
 */

import {
  BASICS_MANIFEST,
  basicsLoadForMonth,
} from '#shared/constants/basics'

export const BASICS_PRICE_USD = 100
export const BASICS_LANDED_CEILING_USD = 40
export const BASICS_MIN_MARGIN = 0.6

/** Fixed per-box cost: carton, void fill, printed manifest card. */
export const BASICS_PACK_USD = 1.8
/** Outbound ground freight, CONUS, ≤ 5 LB zone-averaged. */
export const BASICS_FREIGHT_USD = 8.5

export type CogsStatus = 'ESTIMATE' | 'QUOTED'

export const BASICS_COGS: Record<string, { usd: number; status: CogsStatus }> = {
  'LB-01': { usd: 1.1, status: 'ESTIMATE' },
  'LB-02': { usd: 3.2, status: 'ESTIMATE' },
  'LB-03': { usd: 0.9, status: 'ESTIMATE' },
  'LB-04': { usd: 1.8, status: 'ESTIMATE' },
  'LB-05': { usd: 3.4, status: 'ESTIMATE' },
  'LB-06': { usd: 3.8, status: 'ESTIMATE' },
  'LB-07': { usd: 4.0, status: 'ESTIMATE' },
  'LB-08': { usd: 0.6, status: 'ESTIMATE' },
  'LB-09': { usd: 3.2, status: 'ESTIMATE' },
  'LB-10': { usd: 1.5, status: 'ESTIMATE' },
  'LB-11': { usd: 6.0, status: 'ESTIMATE' },
  'LB-12': { usd: 4.5, status: 'ESTIMATE' },
  'LB-13': { usd: 3.4, status: 'ESTIMATE' },
  'LB-14': { usd: 2.8, status: 'ESTIMATE' },
  'LB-15': { usd: 4.8, status: 'ESTIMATE' },
  'LB-16': { usd: 1.8, status: 'ESTIMATE' },
  'LB-17': { usd: 1.7, status: 'ESTIMATE' },
  'LB-18': { usd: 2.2, status: 'ESTIMATE' },
  'LB-19': { usd: 0.8, status: 'ESTIMATE' },
  'LB-20': { usd: 2.6, status: 'ESTIMATE' },
  'LB-21': { usd: 1.4, status: 'ESTIMATE' },
  'LB-22': { usd: 5.5, status: 'ESTIMATE' },
  'LB-23': { usd: 1.9, status: 'ESTIMATE' },
}

export interface BasicsMonthEnvelope {
  month: number
  items: number
  goodsUsd: number
  landedUsd: number
  margin: number
  breach: boolean
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function basicsEnvelopeForMonth(m: number): BasicsMonthEnvelope {
  const load = basicsLoadForMonth(m)
  const goods = load.reduce((s, i) => s + (BASICS_COGS[i.nsn]?.usd ?? Infinity), 0)
  const landed = goods + BASICS_PACK_USD + BASICS_FREIGHT_USD
  const margin = (BASICS_PRICE_USD - landed) / BASICS_PRICE_USD
  return {
    month: m,
    items: load.length,
    goodsUsd: round2(goods),
    landedUsd: round2(landed),
    margin: round2(margin),
    breach: landed > BASICS_LANDED_CEILING_USD || margin < BASICS_MIN_MARGIN,
  }
}

/** 12-month cycle. Cadence LCM is 12, so this covers every combination. */
export function basicsEnvelopeCycle(): BasicsMonthEnvelope[] {
  return Array.from({ length: 12 }, (_, m) => basicsEnvelopeForMonth(m))
}

/** Every manifest line must carry a cost. Returns missing NSNs. */
export function basicsCogsGaps(): string[] {
  return BASICS_MANIFEST.filter((i) => !BASICS_COGS[i.nsn]).map((i) => i.nsn)
}
