/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / Issue Engine
 * Calculates per-issue load based on cadence, validates COGS ceiling.
 */

import { RATION_MANIFEST, RationItem, ISSUE_PRICE_USD } from '#client/components/Basics/rationManifest.js'

// Shared between server and client — imports from client/ intentionally.
// Source of truth for manifest is the client-facing spec.

export const COGS_CEILING_USD   = 40.00
export const MARGIN_FLOOR_PCT   = 0.60

export type IssueLoad = {
  issueNumber: number
  items: RationItem[]
  itemNos: string[]
  cogsTotal: number
  marginPct: number
  meetsFloor: boolean
  scheduledDate: string  // ISO date YYYY-MM-DD
}

export function computeIssueLoad(issueNumber: number, scheduledDate: Date): IssueLoad {
  const items = RATION_MANIFEST.filter((item) => {
    switch (item.cadence) {
      case 'MONTHLY':     return true
      case 'QUARTERLY':   return issueNumber % 3 === 1
      case 'SEMI-ANNUAL': return issueNumber % 6 === 1
      case 'ANNUAL':      return issueNumber === 1
      default:            return false
    }
  })

  const cogsTotal   = parseFloat(items.reduce((sum, i) => sum + i.cogsUsd, 0).toFixed(2))
  const marginPct   = parseFloat(((ISSUE_PRICE_USD - cogsTotal) / ISSUE_PRICE_USD).toFixed(4))
  const meetsFloor  = cogsTotal <= COGS_CEILING_USD && marginPct >= MARGIN_FLOOR_PCT

  return {
    issueNumber,
    items,
    itemNos: items.map((i) => i.no),
    cogsTotal,
    marginPct,
    meetsFloor,
    scheduledDate: scheduledDate.toISOString().slice(0, 10),
  }
}

export function nextScheduledDate(fromDate: Date = new Date()): Date {
  return new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 1)
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
