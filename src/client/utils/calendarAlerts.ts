/**
 * Calendar alert logic — pure functions (no React, no I/O).
 * Time-tracking for the Calendar widget: countdown, alert levels, dedupe keys.
 */

export type AlertLevel = 'T-15' | 'T-05' | 'NOW' | 'OVERDUE'

export type TimedEntry = {
  date: string // YYYY-MM-DD
  time?: string // HH:mm (24h), optional
  text: string
  type: string
}

export const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

/** Accepts "9", "930", "9:30", "09:30" → "09:30"; returns null if invalid. */
export function normalizeTime(input: string): string | null {
  const s = input.trim()
  if (!s) return null
  let h: string, m: string
  const colon = s.match(/^(\d{1,2}):(\d{2})$/)
  if (colon) [, h, m] = colon
  else if (/^\d{1,2}$/.test(s)) [h, m] = [s, '00']
  else if (/^\d{3,4}$/.test(s)) [h, m] = [s.slice(0, -2), s.slice(-2)]
  else return null
  const out = `${h.padStart(2, '0')}:${m}`
  return TIME_RE.test(out) ? out : null
}

/** Local-time epoch ms of an entry, or null when it has no time. */
export function entryTimestamp(e: Pick<TimedEntry, 'date' | 'time'>): number | null {
  if (!e.time || !TIME_RE.test(e.time)) return null
  const [y, mo, d] = e.date.split('-').map(Number)
  const [h, mi] = e.time.split(':').map(Number)
  if (!y || !mo || !d) return null
  return new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
}

const MIN = 60_000
// A timed entry stays "OVERDUE" for this long, then stops alerting.
export const OVERDUE_WINDOW_MS = 60 * MIN
// "NOW" window: from due time until +1 minute.
const NOW_WINDOW_MS = MIN

/** Highest-priority alert level currently applicable, or null. */
export function alertLevelFor(deltaMs: number): AlertLevel | null {
  if (deltaMs > 15 * MIN) return null
  if (deltaMs > 5 * MIN) return 'T-15'
  if (deltaMs > 0) return 'T-05'
  if (deltaMs > -NOW_WINDOW_MS) return 'NOW'
  if (deltaMs > -OVERDUE_WINDOW_MS) return 'OVERDUE'
  return null
}

/** Stable per-entry-per-level dedupe key. */
export function alertKey(e: TimedEntry, level: AlertLevel): string {
  return `${e.date}|${e.time}|${e.type}|${e.text}|${level}`
}

/** "T-12:05", "T-1h05", "T+03:00" style military countdown. */
export function formatCountdown(deltaMs: number): string {
  const sign = deltaMs >= 0 ? '-' : '+'
  const total = Math.floor(Math.abs(deltaMs) / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `T${sign}${h}:${pad(m)}:${pad(s)}` : `T${sign}${pad(m)}:${pad(s)}`
}

export type DueAlert = { entry: TimedEntry; level: AlertLevel; key: string; deltaMs: number }

/**
 * Alerts that should fire now. Only the highest level per entry is returned
 * (a tab opened late fires OVERDUE, not a backlog of T-15/T-05/NOW), and
 * keys already in `fired` are skipped.
 */
export function dueAlerts(
  entries: TimedEntry[],
  now: number,
  fired: ReadonlySet<string>
): DueAlert[] {
  const out: DueAlert[] = []
  for (const entry of entries) {
    const ts = entryTimestamp(entry)
    if (ts === null) continue
    const deltaMs = ts - now
    const level = alertLevelFor(deltaMs)
    if (!level) continue
    const key = alertKey(entry, level)
    if (fired.has(key)) continue
    // Suppress if a higher level was already fired for this entry.
    const order: AlertLevel[] = ['T-15', 'T-05', 'NOW', 'OVERDUE']
    const higherFired = order
      .slice(order.indexOf(level) + 1)
      .some(l => fired.has(alertKey(entry, l)))
    if (higherFired) continue
    out.push({ entry, level, key, deltaMs })
  }
  return out
}
