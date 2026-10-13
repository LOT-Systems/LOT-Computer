/**
 * LOT SYSTEMS CORPORATION
 * Calendar engine — pure time/alert logic (no React, no I/O).
 */

export type CalendarStage = 'T-15' | 'T-05' | 'T-00' | 'MISSED'

/** Stages in firing order, with offset (ms) relative to the due time. */
export const STAGES: { stage: CalendarStage; offsetMs: number }[] = [
  { stage: 'T-15', offsetMs: -15 * 60_000 },
  { stage: 'T-05', offsetMs: -5 * 60_000 },
  { stage: 'T-00', offsetMs: 0 },
  { stage: 'MISSED', offsetMs: 10 * 60_000 },
]

/** Alerts older than this past their threshold are stale and never fired. */
export const STALE_AFTER_MS = 60 * 60_000

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

export function isValidTime(time: string | undefined | null): time is string {
  return !!time && TIME_RE.test(time)
}

/** Normalise "9:5" style input to "HH:mm"; returns '' when invalid. */
export function normalizeTime(time: string): string {
  const m = TIME_RE.exec(time.trim())
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : ''
}

/** Stable id for an entry (deterministic: same inputs → same id). */
export function entryId(date: string, time: string | undefined, text: string, type: string): string {
  return `${date}|${time || '--:--'}|${type}|${text}`
}

/** Local-time due timestamp (ms) for a dated, timed entry; null if untimed. */
export function dueAt(date: string, time?: string | null): number | null {
  if (!isValidTime(time)) return null
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  if (!y || !mo || !d) return null
  const ts = new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
  return Number.isNaN(ts) ? null : ts
}

/**
 * Stages that should fire now: crossed their threshold, not yet fired and
 * not stale. Only the latest crossed stage is returned so a late page load
 * produces one alert, not a burst.
 */
export function pendingStage(
  due: number,
  now: number,
  fired: ReadonlySet<CalendarStage> | CalendarStage[]
): CalendarStage | null {
  const done = new Set(fired)
  let latest: CalendarStage | null = null
  for (const { stage, offsetMs } of STAGES) {
    const threshold = due + offsetMs
    if (now >= threshold && now - threshold < STALE_AFTER_MS) latest = stage
  }
  if (!latest || done.has(latest)) return null
  // A later stage supersedes earlier ones — mark nothing else as pending.
  return latest
}

/** "T-00:14:32" / "T+00:03:10" style countdown. */
export function formatCountdown(due: number, now: number): string {
  const diff = due - now
  const sign = diff >= 0 ? '-' : '+'
  let s = Math.floor(Math.abs(diff) / 1000)
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  const p = (n: number) => String(n).padStart(2, '0')
  return `T${sign}${p(h)}:${p(m)}:${p(s)}`
}

export function stageLabel(stage: CalendarStage): string {
  switch (stage) {
    case 'T-15': return 'ADVISORY'
    case 'T-05': return 'WARNING'
    case 'T-00': return 'EXECUTE'
    case 'MISSED': return 'OVERDUE'
  }
}

export function sortKey(date: string, time?: string | null): string {
  return `${date} ${isValidTime(time) ? normalizeTime(time) : '99:99'}`
}
