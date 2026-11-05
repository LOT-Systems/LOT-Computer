/**
 * LOT SYSTEMS — Calendar alert engine (pure logic, no React / no I/O).
 *
 * Stages are monotonic per entry: T15 -> T0 -> OVERDUE.
 * An entry with a time gets at most one alert per stage (dedupe by key).
 */

export type AlertStage = 'T15' | 'T0' | 'OVERDUE'

export type TimedEntry = {
  id: string
  date: string // YYYY-MM-DD (local)
  time?: string // HH:mm (local)
  text: string
  type: string
  done?: boolean
}

export const WARN_MINUTES = 15
export const OVERDUE_MINUTES = 5

export function isValidTime(t?: string): t is string {
  return !!t && /^([01]\d|2[0-3]):[0-5]\d$/.test(t)
}

/** Local-time epoch ms for an entry; null if untimed/invalid. */
export function entryTimestamp(e: { date: string; time?: string }): number | null {
  if (!isValidTime(e.time)) return null
  const [y, m, d] = e.date.split('-').map(Number)
  const [hh, mm] = e.time.split(':').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
}

/** Highest stage reached at `now`, or null if too early / long past / done. */
export function currentStage(e: TimedEntry, now: number): AlertStage | null {
  if (e.done) return null
  const ts = entryTimestamp(e)
  if (ts === null) return null
  const deltaMin = (ts - now) / 60000
  if (deltaMin > WARN_MINUTES) return null
  if (deltaMin > 0) return 'T15'
  if (deltaMin > -OVERDUE_MINUTES) return 'T0'
  // Overdue stays active for up to 6h so a missed event is still surfaced.
  if (deltaMin > -360) return 'OVERDUE'
  return null
}

export function alertKey(e: { id: string }, stage: AlertStage): string {
  return `${e.id}:${stage}`
}

/** Entries whose current stage has not been fired yet. */
export function dueAlerts(
  entries: TimedEntry[],
  now: number,
  fired: Set<string>
): { entry: TimedEntry; stage: AlertStage }[] {
  const out: { entry: TimedEntry; stage: AlertStage }[] = []
  for (const entry of entries) {
    const stage = currentStage(entry, now)
    if (stage && !fired.has(alertKey(entry, stage))) out.push({ entry, stage })
  }
  return out
}

/** Military countdown, e.g. T-14:59 / T+00:42 / T-02H05M */
export function formatCountdown(e: { date: string; time?: string }, now: number): string {
  const ts = entryTimestamp(e)
  if (ts === null) return ''
  const diff = ts - now
  const sign = diff >= 0 ? '-' : '+'
  const s = Math.floor(Math.abs(diff) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `T${sign}${p(h)}H${p(m)}M` : `T${sign}${p(m)}:${p(sec)}`
}

export const STAGE_LABEL: Record<AlertStage, string> = {
  T15: 'INBOUND',
  T0: 'NOW',
  OVERDUE: 'OVERDUE',
}
