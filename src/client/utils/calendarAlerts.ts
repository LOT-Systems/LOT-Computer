/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Calendar alert engine — pure functions, no React. Alerts are derived from
// (entry, now); the only persisted state is the set of fired "entryId:stage"
// keys (localStorage + calendar_alert logs), which makes firing idempotent
// across ticks, tabs and devices.

export type AlertStage = 'T60' | 'T15' | 'T0' | 'MISSED'

export type TimedEntry = {
  id: string
  date: string // YYYY-MM-DD (local)
  time: string // HH:mm (local)
  text: string
  type: string
  createdAt: number // epoch ms
}

export const STAGE_MINUTES: Record<AlertStage, number> = {
  T60: 60,
  T15: 15,
  T0: 0,
  MISSED: -120,
}

export const STAGE_LABEL: Record<AlertStage, string> = {
  T60: 'T-60',
  T15: 'T-15',
  T0: 'T-0',
  MISSED: 'MISSED',
}

const MISSED_WINDOW_MIN = 24 * 60
const STORAGE_KEY = 'lot:calendar-alerts:fired'
const STORAGE_CAP = 300

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export const isValidTime = (t: unknown): t is string =>
  typeof t === 'string' && TIME_RE.test(t)

export const alertKey = (entryId: string, stage: AlertStage) => `${entryId}:${stage}`

export function entryTimestamp(date: string, time: string): number {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  return new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
}

/** Whole minutes until the entry starts (negative once started). */
export function minutesUntil(entry: TimedEntry, now: number): number {
  return Math.ceil((entryTimestamp(entry.date, entry.time) - now) / 60000)
}

/** The single stage an entry should be at right now, ignoring fired state. */
export function currentStage(mins: number): AlertStage | null {
  if (mins <= STAGE_MINUTES.MISSED) {
    return mins > -MISSED_WINDOW_MIN ? 'MISSED' : null
  }
  if (mins <= 0) return 'T0'
  if (mins <= 15) return 'T15'
  if (mins <= 60) return 'T60'
  return null
}

/**
 * Alerts to fire now. Only the most advanced due stage per entry fires, so a
 * late open yields one alert instead of a burst. Stages that had already
 * passed when the entry was created are skipped.
 */
export function dueAlerts(
  entries: TimedEntry[],
  fired: Set<string>,
  now: number
): { entry: TimedEntry; stage: AlertStage; mins: number }[] {
  const out: { entry: TimedEntry; stage: AlertStage; mins: number }[] = []
  for (const entry of entries) {
    const mins = minutesUntil(entry, now)
    const stage = currentStage(mins)
    if (!stage) continue
    if (fired.has(alertKey(entry.id, stage))) continue
    // A later stage already fired (e.g. T15 logged, now T60 re-evaluated): skip.
    if (stage === 'T60' && (fired.has(alertKey(entry.id, 'T15')) || fired.has(alertKey(entry.id, 'T0')))) continue
    if (stage === 'T15' && fired.has(alertKey(entry.id, 'T0'))) continue
    if (stage === 'MISSED' && fired.has(alertKey(entry.id, 'T0'))) continue
    const stageAt = entryTimestamp(entry.date, entry.time) - STAGE_MINUTES[stage] * 60000
    if (entry.createdAt > stageAt) continue
    out.push({ entry, stage, mins })
  }
  return out
}

/** Entries in the live window (T-60 .. +120 min) for the status board. */
export function activeEntries(entries: TimedEntry[], now: number) {
  return entries
    .map(entry => ({ entry, mins: minutesUntil(entry, now) }))
    .filter(({ mins }) => mins <= 60 && mins > STAGE_MINUTES.MISSED)
    .sort((a, b) => a.mins - b.mins)
}

/** T-minus readout, e.g. "T-14:59" under an hour, "T+00:12" once started. */
export function countdown(entry: TimedEntry, now: number): string {
  const diff = entryTimestamp(entry.date, entry.time) - now
  const abs = Math.abs(diff)
  const m = Math.floor(abs / 60000)
  const s = Math.floor((abs % 60000) / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `T${diff >= 0 ? '-' : '+'}${pad(m)}:${pad(s)}`
}

export function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr : [])
  } catch (_) {
    return new Set()
  }
}

export function saveFired(fired: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...fired].slice(-STORAGE_CAP)))
  } catch (_) {}
}
