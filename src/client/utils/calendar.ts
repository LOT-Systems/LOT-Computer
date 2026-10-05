/**
 * Calendar alert logic — pure functions, no React / network.
 * An entry is a point in time (date + optional HH:mm). Date-only entries
 * are treated as all-day and armed at ALLDAY_HOUR local time.
 */

export type AlertStage = 'standby' | 'execute' | 'overdue'

export const ALLDAY_HOUR = 9
export const STANDBY_MIN = 15
export const OVERDUE_MIN = 15

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidTime(t?: string | null): t is string {
  return !!t && TIME_RE.test(t)
}

/** Local-time epoch ms for an entry. Returns NaN on a malformed date. */
export function entryTimestamp(date: string, time?: string | null): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!m) return NaN
  let h = ALLDAY_HOUR
  let min = 0
  if (isValidTime(time)) {
    h = Number(time.slice(0, 2))
    min = Number(time.slice(3, 5))
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), h, min, 0, 0).getTime()
}

/**
 * Highest stage reached at `now`, or null if not yet armed.
 * standby: T-15..T-0 · execute: T-0..T+15 · overdue: after T+15
 * Stale entries (> 24h past) return null so old history never re-alerts.
 */
export function getAlertStage(ts: number, now: number): AlertStage | null {
  if (Number.isNaN(ts)) return null
  const diffMin = (ts - now) / 60000
  if (diffMin > STANDBY_MIN) return null
  if (diffMin > 0) return 'standby'
  if (diffMin > -OVERDUE_MIN) return 'execute'
  if (diffMin > -24 * 60) return 'overdue'
  return null
}

/** Military-style countdown: T-14:59, T+00:03 */
export function formatCountdown(ts: number, now: number): string {
  const diff = Math.round((ts - now) / 1000)
  const abs = Math.abs(diff)
  const mm = String(Math.floor(abs / 60)).padStart(2, '0')
  const ss = String(abs % 60).padStart(2, '0')
  return `T${diff > 0 ? '-' : '+'}${mm}:${ss}`
}

export const STAGE_LABEL: Record<AlertStage, string> = {
  standby: 'STANDBY',
  execute: 'EXECUTE',
  overdue: 'OVERDUE',
}
