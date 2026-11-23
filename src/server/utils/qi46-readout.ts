/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * QI·46 Node 7 (prep) — beta read-out.
 *
 * Pure aggregation over COSMO® audit rows (labels only, never text).
 * No DB, no network. The admin route fetches rows and passes them in, so the
 * smoke test runs exactly what the route runs.
 *
 * Privacy floor: per-label breakdowns are suppressed until at least
 * QI46_READOUT_MIN_PEOPLE distinct people are in the window. Below the floor
 * only totals are returned, so a read-out of one or two people cannot be
 * read back to a single person's state.
 */

import {
  COSMO_REASONS,
  QI46_REGISTERS,
  type CosmoReason,
  type Qi46Register,
} from './qi46.js'

export const QI46_READOUT_MIN_PEOPLE = 3

export interface Qi46ReadoutRow {
  userId: string
  status: string
  reasons: unknown
  risk_level: string
  lead: string
  engine_version: string
  source: string
}

export interface Qi46LabelStat {
  total: number
  held: number
  heldRate: number // 0..1, 2 decimals
}

export interface Qi46Readout {
  source: string
  days: number
  total: number
  held: number
  cleared: number
  heldRate: number
  people: number
  suppressed: boolean
  byReason: Partial<Record<CosmoReason, number>>
  byLead: Partial<Record<Qi46Register, Qi46LabelStat>>
  byRisk: Record<string, Qi46LabelStat>
  byVersion: Record<string, Qi46LabelStat>
}

const rate = (held: number, total: number) => (total ? Math.round((held / total) * 100) / 100 : 0)

function parseReasons(raw: unknown): CosmoReason[] {
  let list: unknown = raw
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw)
    } catch {
      return []
    }
  }
  if (!Array.isArray(list)) return []
  const allowed = new Set<string>(COSMO_REASONS)
  return list.filter((r): r is CosmoReason => typeof r === 'string' && allowed.has(r))
}

function bump(map: Record<string, Qi46LabelStat>, key: string, held: boolean) {
  const s = (map[key] ||= { total: 0, held: 0, heldRate: 0 })
  s.total++
  if (held) s.held++
}

/** Aggregate audit rows into the beta read-out. Unknown labels fall into 'other'. */
export function summarizeQi46Verdicts(
  rows: Qi46ReadoutRow[],
  opts: { source: string; days: number; minPeople?: number }
): Qi46Readout {
  const minPeople = opts.minPeople ?? QI46_READOUT_MIN_PEOPLE
  const scoped = rows.filter((r) => r.source === opts.source)
  const registers = new Set<string>(QI46_REGISTERS)
  const people = new Set<string>()
  const byReason: Record<string, number> = {}
  const byLead: Record<string, Qi46LabelStat> = {}
  const byRisk: Record<string, Qi46LabelStat> = {}
  const byVersion: Record<string, Qi46LabelStat> = {}
  let held = 0

  for (const r of scoped) {
    people.add(r.userId)
    const isHeld = r.status === 'HELD'
    if (isHeld) {
      held++
      for (const reason of parseReasons(r.reasons)) byReason[reason] = (byReason[reason] || 0) + 1
    }
    bump(byLead, registers.has(r.lead) ? r.lead : 'other', isHeld)
    bump(byRisk, ['none', 'low', 'moderate', 'elevated'].includes(r.risk_level) ? r.risk_level : 'other', isHeld)
    bump(byVersion, /^[0-9a-z.\-]{1,32}$/i.test(r.engine_version) ? r.engine_version : 'other', isHeld)
  }
  for (const m of [byLead, byRisk, byVersion]) for (const s of Object.values(m)) s.heldRate = rate(s.held, s.total)

  const suppressed = people.size < minPeople
  return {
    source: opts.source,
    days: opts.days,
    total: scoped.length,
    held,
    cleared: scoped.length - held,
    heldRate: rate(held, scoped.length),
    people: people.size,
    suppressed,
    byReason: suppressed ? {} : byReason,
    byLead: suppressed ? {} : byLead,
    byRisk: suppressed ? {} : byRisk,
    byVersion: suppressed ? {} : byVersion,
  }
}

/**
 * The three switch-on gates for Node 6, as booleans only. Shown on the admin
 * read-out card so the pending approvals sit next to the numbers they unlock.
 * This reports state. It never changes it.
 */
export function qi46SwitchGates(state: {
  migration: boolean
  copyApproved: boolean
  surfaceFlag: boolean
}): { id: 'migration' | 'copy' | 'flag'; label: string; done: boolean }[] {
  return [
    { id: 'migration', label: 'Migration 20261117120000 (audit trail)', done: !!state.migration },
    { id: 'copy', label: 'Node 5 copy approved (QI46_COPY_APPROVED)', done: !!state.copyApproved },
    { id: 'flag', label: 'Surface flag QI46_SURFACE_MEMORY=on', done: !!state.surfaceFlag },
  ]
}
