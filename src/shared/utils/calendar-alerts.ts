/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Pure calendar alert logic — no React, no dayjs, no I/O. Unit-testable.

export type EntryType = 'note' | 'task' | 'call'

// Escalation ladder, ordered. Only the highest reached stage is ever fired.
export type AlertStage = 'T-15' | 'T-0' | 'OVERDUE'

export const STAGE_ORDER: AlertStage[] = ['T-15', 'T-0', 'OVERDUE']

export const STAGE_LABEL: Record<AlertStage, string> = {
  'T-15': 'T-15 · PRE-ALERT',
  'T-0': 'T-0 · EXECUTE',
  'OVERDUE': 'OVERDUE',
}

const MINUTE = 60_000
const OVERDUE_AFTER = 15 * MINUTE
// Entries missed by more than this are history, not alerts.
const STALE_AFTER = 12 * 60 * MINUTE

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm (24h, local)
  text: string
  type: EntryType
  done: boolean
}

export type AlertRecord = { entryId: string; stage: AlertStage }

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function isValidTime(t: unknown): t is string {
  return typeof t === 'string' && TIME_RE.test(t)
}

/** Local-time epoch ms for an entry, or null if date/time are malformed. */
export function entryTimestamp(date: string, time: string): number | null {
  if (!DATE_RE.test(date) || !isValidTime(time)) return null
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const ts = new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
  return Number.isNaN(ts) ? null : ts
}

/** Highest stage reached at `now`, or null if too early / stale / untimed. */
export function currentStage(entry: CalendarEntry, now: number): AlertStage | null {
  if (!entry.time) return null
  const ts = entryTimestamp(entry.date, entry.time)
  if (ts === null) return null
  const delta = now - ts
  if (delta > STALE_AFTER) return null
  if (delta >= OVERDUE_AFTER) return 'OVERDUE'
  if (delta >= 0) return 'T-0'
  if (delta >= -15 * MINUTE) return 'T-15'
  return null
}

/**
 * Alerts that should fire now: one per open entry, at its highest reached
 * stage, skipping stages already recorded (fired earlier or on another device).
 */
export function dueAlerts(
  entries: CalendarEntry[],
  fired: AlertRecord[],
  now: number
): Array<{ entry: CalendarEntry; stage: AlertStage }> {
  const seen = new Set(fired.map(f => `${f.entryId}|${f.stage}`))
  const out: Array<{ entry: CalendarEntry; stage: AlertStage }> = []
  for (const entry of entries) {
    if (entry.done) continue
    const stage = currentStage(entry, now)
    if (!stage || seen.has(`${entry.id}|${stage}`)) continue
    out.push({ entry, stage })
  }
  return out
}

/** "T-14:59" countdown / "T+03:12" elapsed, for the alert panel. */
export function formatCountdown(ts: number, now: number): string {
  const diff = Math.abs(ts - now)
  const total = Math.floor(diff / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const p = (n: number) => String(n).padStart(2, '0')
  const body = h > 0 ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`
  return `${ts > now ? 'T-' : 'T+'}${body}`
}
