/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar timing + alert logic (pure, no React / no network).
 *
 * An entry may carry an optional HH:mm time. Timed entries escalate through
 * alert stages: T-15 → T-05 → T-00 (now) → LATE (missed, up to 6h).
 * Each (entry, stage) fires at most once; the caller persists that fact.
 */

export type AlertStage = 'T-15' | 'T-05' | 'T-00' | 'LATE'

export const ALERT_STAGES: { stage: AlertStage; offsetMin: number }[] = [
  { stage: 'T-15', offsetMin: -15 },
  { stage: 'T-05', offsetMin: -5 },
  { stage: 'T-00', offsetMin: 0 },
  { stage: 'LATE', offsetMin: 5 },
]

/** Alerts older than this past due are considered stale and never fired. */
export const STALE_AFTER_MIN = 6 * 60

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isValidTime(t: unknown): t is string {
  return typeof t === 'string' && TIME_RE.test(t)
}

/** Local-time epoch ms for an entry's due moment, or null if untimed/invalid. */
export function dueMs(date: string, time?: string | null): number | null {
  if (!isValidTime(time)) return null
  const m = DATE_RE.exec(date)
  if (!m) return null
  const [h, min] = time.split(':').map(Number)
  const ts = new Date(+m[1], +m[2] - 1, +m[3], h, min, 0, 0).getTime()
  return Number.isNaN(ts) ? null : ts
}

/**
 * Most advanced stage reached at `now` (the one to show / fire), or null if
 * the entry is untimed, too early, or stale.
 */
export function currentStage(now: number, due: number | null): AlertStage | null {
  if (due === null) return null
  const minToDue = (due - now) / 60000
  if (minToDue < -STALE_AFTER_MIN) return null
  let reached: AlertStage | null = null
  for (const { stage, offsetMin } of ALERT_STAGES) {
    if (minToDue <= -offsetMin) reached = stage
  }
  return reached
}

/** Terse countdown: "T-14:59", "T+00:03", "T-02h10". */
export function formatCountdown(now: number, due: number): string {
  const diffSec = Math.round((due - now) / 1000)
  const sign = diffSec >= 0 ? '-' : '+'
  const abs = Math.abs(diffSec)
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `T${sign}${p(h)}h${p(m)}` : `T${sign}${p(m)}:${p(s)}`
}

export function alertKey(entryId: string, stage: AlertStage): string {
  return `${entryId}:${stage}`
}

/** Sort key: date, then time (untimed first within a day), then text. */
export function compareEntries(
  a: { date: string; time?: string | null; text: string },
  b: { date: string; time?: string | null; text: string }
): number {
  return (
    a.date.localeCompare(b.date) ||
    (a.time || '').localeCompare(b.time || '') ||
    a.text.localeCompare(b.text)
  )
}
