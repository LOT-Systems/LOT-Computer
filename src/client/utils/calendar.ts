/**
 * Calendar alert logic — pure functions, no React / network.
 * Stages fire once per entry: T15 → T5 → T0 (NOW) → LATE.
 */

export type AlertStage = 'T15' | 'T5' | 'T0' | 'LATE'

export const STAGE_ORDER: AlertStage[] = ['T15', 'T5', 'T0', 'LATE']

export const STAGE_LABEL: Record<AlertStage, string> = {
  T15: 'T-15',
  T5: 'T-05',
  T0: 'NOW',
  LATE: 'OVERDUE',
}

/** Minutes past due after which an unacknowledged alert stops escalating. */
export const EXPIRE_AFTER_MIN = 120
const LATE_AFTER_MIN = 5

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

/** Local Date for a "YYYY-MM-DD" + "HH:mm" pair; null if invalid. */
export function entryDueAt(date: string, time?: string | null): Date | null {
  if (!time || !TIME_RE.test(time) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const due = new Date(y, m - 1, d, hh, mm, 0, 0)
  return isNaN(due.getTime()) ? null : due
}

/** Signed whole seconds until due (negative = past). */
export function secondsUntil(due: Date, now: Date): number {
  return Math.round((due.getTime() - now.getTime()) / 1000)
}

/** Highest stage that currently applies, or null (too early / expired). */
export function currentStage(due: Date, now: Date): AlertStage | null {
  const min = secondsUntil(due, now) / 60
  if (min > 15) return null
  if (min > 5) return 'T15'
  if (min > 0) return 'T5'
  if (min > -LATE_AFTER_MIN) return 'T0'
  if (min > -EXPIRE_AFTER_MIN) return 'LATE'
  return null
}

/** "T-04:32" / "T+02:10" countdown string. */
export function formatCountdown(sec: number): string {
  const sign = sec >= 0 ? '-' : '+'
  const a = Math.abs(sec)
  const h = Math.floor(a / 3600)
  const m = Math.floor((a % 3600) / 60)
  const s = a % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `T${sign}${h}:${p(m)}:${p(s)}` : `T${sign}${p(m)}:${p(s)}`
}
