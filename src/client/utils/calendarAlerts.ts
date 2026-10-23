/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar alert stages — pure time logic, no React, no I/O.
 *
 *   T-15   15 minutes before the event
 *   T-00   event start
 *   MISSED 10 minutes past start with no acknowledgement
 *
 * A stage is only raised inside a 6h grace window so reopening the app
 * after a long absence never replays a backlog.
 */

export type AlertStage = 'T-15' | 'T-00' | 'MISSED'

const MIN = 60 * 1000
export const ALERT_WINDOW_MS = 6 * 60 * MIN

export const STAGE_ORDER: AlertStage[] = ['T-15', 'T-00', 'MISSED']

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

/** Event start as epoch ms in local time, or null if date/time invalid. */
export function eventStartMs(date: string, time?: string): number | null {
  if (!time || !TIME_RE.test(time) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  const ms = new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
  return Number.isNaN(ms) ? null : ms
}

/** Highest stage reached at `now`, or null if too early / outside window. */
export function currentStage(startMs: number, now: number): AlertStage | null {
  const delta = now - startMs
  if (delta < -15 * MIN || delta > ALERT_WINDOW_MS) return null
  if (delta >= 10 * MIN) return 'MISSED'
  if (delta >= 0) return 'T-00'
  return 'T-15'
}

/** Countdown label, e.g. "T-00:14:32" before start, "T+00:02:10" after. */
export function formatCountdown(startMs: number, now: number): string {
  const diff = Math.abs(startMs - now)
  const s = Math.floor(diff / 1000)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${startMs >= now ? 'T-' : 'T+'}${hh}:${mm}:${ss}`
}

export function alertKey(entryId: string, stage: AlertStage): string {
  return `${entryId}:${stage}`
}
