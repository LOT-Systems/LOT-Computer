/**
 * LOT SYSTEMS CORPORATION
 * Calendar alert engine — pure logic (no React, no network).
 *
 * Stages (per entry, each fires at most once, highest applicable wins):
 *   WARN   T-15 min before start
 *   DUE    start time reached (grace window 60 min)
 *   MISSED start passed >60 min ago and never alerted (look-back 24 h)
 * Untimed ("all-day") entries are treated as due at 09:00 local.
 */
import dayjs from './dayjs'
import type { Dayjs } from './dayjs'

export type AlertStage = 'warn' | 'due' | 'missed'

export const ALL_DAY_HOUR = '09:00'
export const WARN_MINUTES = 15
export const GRACE_MINUTES = 60
export const LOOKBACK_MINUTES = 24 * 60

const STAGE_RANK: Record<AlertStage, number> = { warn: 1, due: 2, missed: 2 }

export type AlertableEntry = {
  id: string
  date: string // YYYY-MM-DD
  time?: string | null // HH:mm
}

export function isValidTime(t?: string | null): t is string {
  return !!t && /^([01]\d|2[0-3]):[0-5]\d$/.test(t)
}

export function entryStart(e: Pick<AlertableEntry, 'date' | 'time'>): Dayjs {
  const t = isValidTime(e.time) ? e.time : ALL_DAY_HOUR
  return dayjs(`${e.date}T${t}:00`)
}

/** Minutes until start (negative once started). */
export function minutesUntil(e: Pick<AlertableEntry, 'date' | 'time'>, now: Dayjs): number {
  return entryStart(e).diff(now, 'second') / 60
}

/**
 * Stage that should fire now, or null.
 * `fired` = stages already recorded for this entry.
 */
export function pendingStage(
  e: AlertableEntry,
  now: Dayjs,
  fired: ReadonlySet<AlertStage>
): AlertStage | null {
  const m = minutesUntil(e, now)
  let stage: AlertStage | null = null
  if (m > WARN_MINUTES) stage = null
  else if (m > 0) stage = 'warn'
  else if (m > -GRACE_MINUTES) stage = 'due'
  else if (m > -LOOKBACK_MINUTES) stage = 'missed'
  if (!stage) return null
  let firedRank = 0
  fired.forEach(s => { firedRank = Math.max(firedRank, STAGE_RANK[s]) })
  return STAGE_RANK[stage] > firedRank ? stage : null
}

/** "T-02:14:05" / "T+00:03:10" countdown, military style. */
export function formatCountdown(e: Pick<AlertableEntry, 'date' | 'time'>, now: Dayjs): string {
  const s = Math.round(entryStart(e).diff(now, 'second', true))
  const sign = s >= 0 ? '-' : '+'
  const a = Math.abs(s)
  const p = (n: number) => String(n).padStart(2, '0')
  return `T${sign}${p(Math.floor(a / 3600))}:${p(Math.floor((a % 3600) / 60))}:${p(a % 60)}`
}

export const STAGE_LABEL: Record<AlertStage, string> = {
  warn: 'T-15 WARNING',
  due: 'T-0 EXECUTE',
  missed: 'MISSED',
}
