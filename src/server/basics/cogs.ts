/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / BASIC — COGS (SERVER ONLY, WITHHELD FROM PUBLIC LEDGER)
 *
 * STATUS: ESTIMATE. Unit costs are bulk-wholesale guesses by the build agent,
 * not supplier quotes. Replace each with a quoted value and flip COGS_STATUS to
 * 'QUOTED' only when all 23 lines are quoted. The envelope gate runs on these.
 * Never import this file from src/client or src/shared.
 */
import { RATION_MANIFEST, issueLoad, SCHEDULE_HORIZON } from '#shared/basics/manifest'
import { BASIC_PRICE_CENTS, COGS_CEILING_CENTS, MARGIN_FLOOR } from '#shared/basics/engine'

export type CogsStatus = 'ESTIMATE' | 'QUOTED'
export const COGS_STATUS: CogsStatus = 'ESTIMATE'

/** Landed unit cost per line, USD cents (goods delivered to the fulfillment dock). */
export const UNIT_COGS_CENTS: Record<string, number> = {
  '01': 90, '02': 40, '03': 60, '04': 50, '05': 150, '06': 150, '07': 150, '08': 300,
  '09': 100, '10': 40, '11': 200, '12': 500, '13': 300, '14': 350, '15': 250, '16': 60,
  '17': 30, '18': 60, '19': 30, '20': 150, '21': 450, '22': 300, '23': 25,
}

/** Carton + pick/pack + last-mile freight per issue. */
export const PACK_FREIGHT_CENTS = 750
/** Payment processing assumption: 2.9% + 30c on USD 100. Counted against the envelope. */
export const PROCESSING_CENTS = Math.round(BASIC_PRICE_CENTS * 0.029) + 30

export type IssueCost = {
  issue: number
  lines: number
  goodsCents: number
  landedCents: number
  /** landed + processing: the figure the 60% floor is tested on */
  allInCents: number
  margin: number
}

export const issueCost = (issue: number): IssueCost => {
  const load = issueLoad(issue)
  const goodsCents = load.reduce((s, i) => s + UNIT_COGS_CENTS[i.line], 0)
  const landedCents = goodsCents + PACK_FREIGHT_CENTS
  const allInCents = landedCents + PROCESSING_CENTS
  return {
    issue,
    lines: load.length,
    goodsCents,
    landedCents,
    allInCents,
    margin: (BASIC_PRICE_CENTS - allInCents) / BASIC_PRICE_CENTS,
  }
}

export type Envelope = {
  ok: boolean
  status: CogsStatus
  rows: IssueCost[]
  worst: IssueCost
  meanMargin: number
  /** First reason the gate failed, if any */
  breach?: string
}

export const envelope = (): Envelope => {
  const rows = Array.from({ length: SCHEDULE_HORIZON }, (_, k) => issueCost(k + 1))
  const worst = rows.reduce((a, b) => (b.allInCents > a.allInCents ? b : a))
  const meanMargin = rows.reduce((s, r) => s + r.margin, 0) / rows.length
  const missing = RATION_MANIFEST.filter((i) => UNIT_COGS_CENTS[i.line] === undefined)
  let breach: string | undefined
  if (missing.length) breach = `NO COGS FOR LINE ${missing.map((m) => m.line).join(',')}`
  else if (worst.landedCents > COGS_CEILING_CENTS)
    breach = `ISSUE ${worst.issue} LANDED ${(worst.landedCents / 100).toFixed(2)} > CEILING`
  else if (worst.margin < MARGIN_FLOOR)
    breach = `ISSUE ${worst.issue} MARGIN ${(worst.margin * 100).toFixed(1)}% < FLOOR`
  return { ok: !breach, status: COGS_STATUS, rows, worst, meanMargin, breach }
}
