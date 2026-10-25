/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * Calendar widget — pure scheduling logic (no React, no network).
 * Entries are logs (event: calendar_entry). Alerts and completion are
 * append-only logs referencing the entry id, so Log is the source of truth.
 */

export type EntryType = 'note' | 'task' | 'call'
export type AlertStage = 't15' | 't0' | 'overdue'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD (local)
  time: string | null // HH:mm (local) or null = all-day
  text: string
  type: EntryType
}

export const ALERT_STAGES: AlertStage[] = ['t15', 't0', 'overdue']

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Normalise "930", "9:30", "09:30" → "09:30"; invalid → null. */
export function parseTime(input: string): string | null {
  const s = input.trim()
  if (!s) return null
  let m = s.match(/^(\d{1,2}):?(\d{2})$/)
  if (!m) return null
  const out = `${m[1].padStart(2, '0')}:${m[2]}`
  return TIME_RE.test(out) ? out : null
}

/** Local-time epoch ms for an entry; all-day entries anchor at 09:00. */
export function entryStart(e: Pick<CalendarEntry, 'date' | 'time'>): number {
  if (!DATE_RE.test(e.date)) return NaN
  const [y, mo, d] = e.date.split('-').map(Number)
  const [h, mi] = (e.time || '09:00').split(':').map(Number)
  return new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
}

const MIN = 60_000
const OVERDUE_AFTER = 30 * MIN // alert as OVERDUE 30 min after start
const MISSED_HORIZON = 24 * 60 * MIN // never alert for things older than 24h

/**
 * Highest alert stage that is due at `now`, or null. Only timed entries
 * alert at T-15; all-day entries alert at T-0 (09:00) and overdue only.
 * Notes never go overdue (nothing to complete).
 */
export function dueStage(e: CalendarEntry, now: number): AlertStage | null {
  const start = entryStart(e)
  if (Number.isNaN(start)) return null
  const dt = now - start
  if (dt > MISSED_HORIZON) return null
  if (e.type !== 'note' && dt >= OVERDUE_AFTER) return 'overdue'
  if (dt >= 0) return dt >= OVERDUE_AFTER ? null : 't0'
  if (e.time && dt >= -15 * MIN) return 't15'
  return null
}

/** "T-02:14", "T-00:15", "T+00:42" — compact military countdown. */
export function formatCountdown(ms: number): string {
  const sign = ms >= 0 ? '-' : '+'
  const abs = Math.abs(ms)
  const totalMin = Math.floor(abs / MIN)
  if (totalMin >= 48 * 60) return `T${sign}${Math.floor(totalMin / 1440)}D`
  const h = String(Math.floor(totalMin / 60)).padStart(2, '0')
  const m = String(totalMin % 60).padStart(2, '0')
  return `T${sign}${h}:${m}`
}

export const alertKey = (entryId: string, stage: AlertStage) => `${entryId}:${stage}`

export const STAGE_LABEL: Record<AlertStage, string> = {
  t15: 'T-15 MIN',
  t0: 'NOW',
  overdue: 'OVERDUE',
}
