/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — BASIC (RATION) — COGS TABLE. SERVER-ONLY. WITHHELD FROM PUBLIC.
 *
 * STATUS: PLANNING ESTIMATES (REV 0). Not supplier quotes.
 * Month 3 replaces every line with a confirmed quote (source + date).
 * Values are USD per line as issued (qty already applied).
 */

export type CogsLine = { ln: string; usd: number; basis: 'ESTIMATE' | 'QUOTE'; source?: string }

export const BASIC_COGS: readonly CogsLine[] = [
  { ln: '01', usd: 3.0, basis: 'ESTIMATE' },
  { ln: '02', usd: 6.5, basis: 'ESTIMATE' },
  { ln: '03', usd: 7.0, basis: 'ESTIMATE' },
  { ln: '04', usd: 1.6, basis: 'ESTIMATE' },
  { ln: '05', usd: 0.9, basis: 'ESTIMATE' },
  { ln: '06', usd: 0.8, basis: 'ESTIMATE' },
  { ln: '07', usd: 0.9, basis: 'ESTIMATE' },
  { ln: '08', usd: 2.2, basis: 'ESTIMATE' },
  { ln: '09', usd: 1.9, basis: 'ESTIMATE' },
  { ln: '10', usd: 1.6, basis: 'ESTIMATE' },
  { ln: '11', usd: 3.5, basis: 'ESTIMATE' },
  { ln: '12', usd: 0.6, basis: 'ESTIMATE' },
  { ln: '13', usd: 1.8, basis: 'ESTIMATE' },
  { ln: '14', usd: 3.0, basis: 'ESTIMATE' },
  { ln: '15', usd: 2.2, basis: 'ESTIMATE' },
  { ln: '16', usd: 4.0, basis: 'ESTIMATE' },
  { ln: '17', usd: 1.2, basis: 'ESTIMATE' },
  { ln: '18', usd: 1.2, basis: 'ESTIMATE' },
  { ln: '19', usd: 1.6, basis: 'ESTIMATE' },
  { ln: '20', usd: 1.1, basis: 'ESTIMATE' },
  { ln: '21', usd: 0.3, basis: 'ESTIMATE' },
  { ln: '22', usd: 0.6, basis: 'ESTIMATE' },
  { ln: '23', usd: 1.4, basis: 'ESTIMATE' },
]

/** Per-issue overhead: container + printed manifest card + domestic freight. */
export const BASIC_OVERHEAD = {
  containerUsd: 1.1,
  manifestCardUsd: 0.4,
  freightUsd: 6.5,
} as const

/** Card processing on the USD 100 charge (2.9% + 0.30). Reported, not in landed. */
export const BASIC_PROCESSING_USD = 100 * 0.029 + 0.3
