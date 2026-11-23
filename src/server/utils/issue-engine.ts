/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / Issue Engine
 * Calculates per-issue load from cadence, prices it against the server-only
 * COGS ledger, and enforces the USD 40 landed ceiling / 60% margin floor.
 */

import {
  loadForIssue,
  RationItem,
  ISSUE_PRICE_USD,
  COGS_CEILING_USD,
  MARGIN_FLOOR_PCT,
} from '#shared/basics'
import { cogsFor } from './ration-cogs.js'

export { COGS_CEILING_USD, MARGIN_FLOOR_PCT }

export type IssueLoad = {
  issueNumber: number
  items: RationItem[]
  itemNos: string[]
  cogsTotal: number
  marginPct: number
  meetsFloor: boolean
  scheduledDate: string // YYYY-MM-DD
}

export function computeIssueLoad(issueNumber: number, scheduledDate: string): IssueLoad {
  const items = loadForIssue(issueNumber)
  const cogsTotal = Math.round(items.reduce((s, i) => s + cogsFor(i.no), 0) * 100) / 100
  const marginPct =
    Math.round(((ISSUE_PRICE_USD - cogsTotal) / ISSUE_PRICE_USD) * 10000) / 10000
  return {
    issueNumber,
    items,
    itemNos: items.map((i) => i.no),
    cogsTotal,
    marginPct,
    meetsFloor: cogsTotal <= COGS_CEILING_USD && marginPct >= MARGIN_FLOOR_PCT,
    scheduledDate,
  }
}

export function verifyMarginOrThrow(load: IssueLoad): void {
  if (!load.meetsFloor) {
    throw new Error(
      `COGS CEILING BREACH: issue #${load.issueNumber} — ` +
        `COGS $${load.cogsTotal.toFixed(2)} (ceiling $${COGS_CEILING_USD}), ` +
        `margin ${(load.marginPct * 100).toFixed(1)}% (floor ${(MARGIN_FLOOR_PCT * 100).toFixed(0)}%). ` +
        `DO NOT DISPATCH.`
    )
  }
}

/** Envelope check over a 12-issue year. Worst case must hold the ceiling. */
export function envelopeReport(issues = 12) {
  const rows = Array.from({ length: issues }, (_, k) => computeIssueLoad(k + 1, ''))
  const worst = rows.reduce((a, b) => (b.cogsTotal > a.cogsTotal ? b : a))
  const avgCogs = rows.reduce((s, r) => s + r.cogsTotal, 0) / rows.length
  return {
    rows: rows.map((r) => ({
      no: r.issueNumber,
      items: r.items.length,
      cogs: r.cogsTotal,
      margin: r.marginPct,
      ok: r.meetsFloor,
    })),
    worstIssue: worst.issueNumber,
    worstCogs: worst.cogsTotal,
    avgCogs: Math.round(avgCogs * 100) / 100,
    avgMargin: Math.round(((ISSUE_PRICE_USD - avgCogs) / ISSUE_PRICE_USD) * 10000) / 10000,
    allOk: rows.every((r) => r.meetsFloor),
  }
}
