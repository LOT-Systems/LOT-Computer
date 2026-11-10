/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar alert engine — pure logic (no React, no network).
 *
 * Stages, escalating:
 *   T-15     15 min before a timed entry
 *   T-0      the minute the entry starts (stays active 5 min)
 *   OVERDUE  5+ min past start, still not marked done (up to 48 h)
 *   TODAY    untimed entry, from 08:00 on its date
 *
 * Only the CURRENT stage is ever returned, so opening the app late fires one
 * alert, not a burst. Each (entry, stage) fires at most once (key dedupe).
 *
 * Snooze: an entry with `snoozeUntil` is silent until that instant, then
 * re-arms as a timed entry anchored there (T-0 → OVERDUE, no pre-alert).
 * `snoozeGen` is folded into the alert key so each snooze can fire again.
 */

export type AlertStage = 'T-15' | 'T-0' | 'OVERDUE' | 'TODAY'

export type AlertEntry = {
  id: string
  date: string // YYYY-MM-DD (local)
  time?: string // HH:mm (local, 24h)
  done?: boolean
  snoozeUntil?: number // epoch ms
  snoozeGen?: number // number of snoozes applied
}

export const OVERDUE_WINDOW_MIN = 48 * 60
const T0_WINDOW_MIN = 5
const PRE_WINDOW_MIN = 15
const UNTIMED_HOUR = 8

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isValidTime(t: unknown): t is string {
  return typeof t === 'string' && TIME_RE.test(t)
}

/** Local-time Date for an entry; untimed entries anchor to 08:00. */
export function entryMoment(e: Pick<AlertEntry, 'date' | 'time'>): Date | null {
  const m = DATE_RE.exec(e.date)
  if (!m) return null
  let h = UNTIMED_HOUR
  let min = 0
  if (e.time) {
    const t = TIME_RE.exec(e.time)
    if (!t) return null
    h = +t[1]
    min = +t[2]
  }
  return new Date(+m[1], +m[2] - 1, +m[3], h, min, 0, 0)
}

export const SNOOZE_MIN = 10

/** Instant the entry is currently due: snooze target if snoozed, else its own moment. */
export function effectiveMoment(e: AlertEntry): Date | null {
  if (e.snoozeUntil && Number.isFinite(e.snoozeUntil)) return new Date(e.snoozeUntil)
  return entryMoment(e)
}

export function alertStage(e: AlertEntry, now: Date): AlertStage | null {
  if (e.done) return null
  const snoozed = !!(e.snoozeUntil && Number.isFinite(e.snoozeUntil))
  const at = effectiveMoment(e)
  if (!at) return null
  const diffMin = (at.getTime() - now.getTime()) / 60000

  if (snoozed) {
    if (diffMin > 0) return null
    if (-diffMin < T0_WINDOW_MIN) return 'T-0'
    return -diffMin <= OVERDUE_WINDOW_MIN ? 'OVERDUE' : null
  }

  if (!e.time) {
    // Untimed: TODAY from 08:00 until midnight, OVERDUE the day after (<=48h)
    const endOfDay = new Date(at.getFullYear(), at.getMonth(), at.getDate() + 1).getTime()
    if (diffMin > 0) return null
    if (now.getTime() < endOfDay) return 'TODAY'
    return -diffMin <= OVERDUE_WINDOW_MIN ? 'OVERDUE' : null
  }

  if (diffMin > PRE_WINDOW_MIN) return null
  if (diffMin > 0) return 'T-15'
  if (-diffMin < T0_WINDOW_MIN) return 'T-0'
  return -diffMin <= OVERDUE_WINDOW_MIN ? 'OVERDUE' : null
}

export const alertKey = (id: string, stage: AlertStage, gen = 0) =>
  gen > 0 ? `${id}:s${gen}:${stage}` : `${id}:${stage}`

/** Stages that hold on screen until the operator acts. */
export const isHoldStage = (s: AlertStage) => s !== 'T-15'

/** Minutes label for display: "in 12m", "now", "+37m", "+2h". */
export function relativeLabel(e: AlertEntry, now: Date): string {
  const at = effectiveMoment(e)
  if (!at) return ''
  const d = Math.round((at.getTime() - now.getTime()) / 60000)
  if (d === 0) return 'now'
  const a = Math.abs(d)
  const s = a >= 120 ? `${Math.floor(a / 60)}h` : `${a}m`
  return d > 0 ? `in ${s}` : `+${s}`
}
