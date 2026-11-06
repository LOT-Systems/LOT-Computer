/**
 * LOT SYSTEMS CORPORATION
 * Calendar engine — pure time logic (no React, no network).
 * Entries carry an optional HH:mm. Alerts fire at two stages: T-10 and T-00.
 */

export type AlertStage = 'T-10' | 'T-00'

export const ALERT_LEAD_MS = 10 * 60 * 1000
/** An alert older than this past its due time is "missed", never fired late. */
export const ALERT_GRACE_MS = 30 * 60 * 1000

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

/** Normalize "9:5"/"09:05"/"930" style input to "HH:mm"; null if invalid. */
export function normalizeTime(input: string | null | undefined): string | null {
  if (!input) return null
  const s = input.trim()
  const m = TIME_RE.exec(s) || /^([01]?\d|2[0-3])([0-5]\d)$/.exec(s)
  if (!m) return null
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

/** Local-time epoch ms for a YYYY-MM-DD (+ optional HH:mm; default 09:00 for all-day). */
export function dueAt(date: string, time?: string | null): number {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = (time || '09:00').split(':').map(Number)
  return new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
}

/** Stage that should be firing right now, or null. Only timed entries alert. */
export function currentStage(
  date: string,
  time: string | null | undefined,
  now: number
): AlertStage | null {
  if (!time) return null
  const delta = dueAt(date, time) - now
  if (delta <= 0 && delta > -ALERT_GRACE_MS) return 'T-00'
  if (delta > 0 && delta <= ALERT_LEAD_MS) return 'T-10'
  return null
}

/** Military-style countdown: T-00:09:42 / T+00:03:10 / T-2D 03H. */
export function formatCountdown(date: string, time: string | null | undefined, now: number): string {
  const delta = dueAt(date, time) - now
  const sign = delta >= 0 ? '-' : '+'
  const abs = Math.abs(delta)
  const s = Math.floor(abs / 1000)
  const days = Math.floor(s / 86400)
  if (days >= 1) return `T${sign}${days}D ${String(Math.floor((s % 86400) / 3600)).padStart(2, '0')}H`
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return `T${sign}${p(h)}:${p(m)}:${p(sec)}`
}

export function alertKey(entryId: string, stage: AlertStage): string {
  return `${entryId}:${stage}`
}
