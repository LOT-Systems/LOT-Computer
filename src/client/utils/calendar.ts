/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Pure helpers for the Calendar widget (no React, no dayjs — unit-testable).

export type AlertStage = 'T-15' | 'T-05' | 'T-00' | 'LATE'

export const ALERT_ORDER: AlertStage[] = ['T-15', 'T-05', 'T-00', 'LATE']

/** Late alerts stop mattering after this many minutes. */
export const LATE_WINDOW_MIN = 60

/** Pull a leading "HH:mm" off entry text. Returns null time when absent/invalid. */
export function parseEntryInput(raw: string): { time: string | null; text: string } {
  const trimmed = raw.trim()
  const m = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s+|$)/)
  if (!m) return { time: null, text: trimmed }
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return { time: null, text: trimmed }
  const time = `${String(h).padStart(2, '0')}:${m[2]}`
  return { time, text: trimmed.slice(m[0].length).trim() }
}

/** Minutes from `now` to the entry (negative = in the past). */
export function minutesUntil(date: string, time: string, now: Date): number {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  const target = new Date(y, mo - 1, d, h, mi, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 60000)
}

/** The most urgent stage that applies right now, or null when nothing is due. */
export function currentStage(minsUntilEntry: number): AlertStage | null {
  if (minsUntilEntry > 15) return null
  if (minsUntilEntry > 5) return 'T-15'
  if (minsUntilEntry > 0) return 'T-05'
  if (minsUntilEntry === 0) return 'T-00'
  if (minsUntilEntry >= -LATE_WINDOW_MIN) return 'LATE'
  return null
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${p(m)}:${p(sec)}` : `${p(m)}:${p(sec)}`
}

export function formatMinutes(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes))
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
}
