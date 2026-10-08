/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar alert staging — pure logic, no React / DOM.
 *
 * Timed entries escalate: T-15 (WARN) → T-0 (DUE) → T+5 (MISSED, until T+60).
 * Untimed entries raise a single DAY notice on their date.
 * Each (entryId, stage) fires at most once; callers dedupe via fired keys.
 */

export type AlertStage = 'WARN' | 'DUE' | 'MISSED' | 'DAY'

export type AlertableEntry = {
  id: string
  date: string // YYYY-MM-DD (local)
  time?: string // HH:mm (local)
  text: string
  type: string
}

export const WARN_MIN = 15
export const MISSED_AFTER_MIN = 5
export const MISSED_WINDOW_MIN = 60

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function entryDateTime(date: string, time: string): Date | null {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) return null
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  return new Date(y, mo - 1, d, h, mi, 0, 0)
}

export function localDateKey(now: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

/** Highest-priority stage currently applicable to the entry, or null. */
export function currentStage(entry: AlertableEntry, now: Date): AlertStage | null {
  if (!entry.time) {
    return entry.date === localDateKey(now) ? 'DAY' : null
  }
  const at = entryDateTime(entry.date, entry.time)
  if (!at) return null
  const deltaMin = (at.getTime() - now.getTime()) / 60000
  if (deltaMin > WARN_MIN) return null
  if (deltaMin > 0) return 'WARN'
  if (deltaMin > -MISSED_AFTER_MIN) return 'DUE'
  if (deltaMin > -MISSED_WINDOW_MIN) return 'MISSED'
  return null
}

export const alertKey = (id: string, stage: AlertStage) => `${id}:${stage}`

/** Alerts that should fire now, skipping anything already in `fired`. */
export function pendingAlerts(
  entries: AlertableEntry[],
  now: Date,
  fired: ReadonlySet<string>
): { entry: AlertableEntry; stage: AlertStage }[] {
  const out: { entry: AlertableEntry; stage: AlertStage }[] = []
  for (const entry of entries) {
    const stage = currentStage(entry, now)
    if (!stage || fired.has(alertKey(entry.id, stage))) continue
    // A later stage supersedes earlier ones: don't replay WARN after DUE fired.
    if (stage === 'DUE' && fired.has(alertKey(entry.id, 'MISSED'))) continue
    out.push({ entry, stage })
  }
  return out
}

export function countdownLabel(entry: AlertableEntry, now: Date): string {
  if (!entry.time) return 'ALL DAY'
  const at = entryDateTime(entry.date, entry.time)
  if (!at) return '—'
  const m = Math.round((at.getTime() - now.getTime()) / 60000)
  if (m > 0) return `T-${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  if (m === 0) return 'T-00:00'
  const a = -m
  return `T+${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`
}
