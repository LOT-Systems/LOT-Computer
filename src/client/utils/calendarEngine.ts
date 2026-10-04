/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * Calendar engine — pure scheduling logic (no React, no network).
 * Turns calendar_entry logs into a deterministic alert timeline:
 *   T-60 → T-15 → T-00 → MISS (+15, only while unacknowledged)
 * Date-only entries raise a single DAY alert at 08:00 local.
 */

export type EntryType = 'note' | 'task' | 'call'
export type AlertStage = 'T-60' | 'T-15' | 'T-00' | 'MISS' | 'DAY'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD (local)
  time: string | null // HH:mm (local) or null for all-day
  text: string
  type: EntryType
}

export type CalendarAlert = {
  entryId: string
  stage: AlertStage
  at: number // epoch ms the stage became due
}

const MIN = 60_000
const DAY_ALERT_HOUR = 8
// An alert older than this is considered history, never re-fired on load.
const STALE_MS = 24 * 60 * MIN

// Ordered by time. Offsets are relative to the event start.
const TIMED_STAGES: { stage: AlertStage; offset: number }[] = [
  { stage: 'T-60', offset: -60 * MIN },
  { stage: 'T-15', offset: -15 * MIN },
  { stage: 'T-00', offset: 0 },
  { stage: 'MISS', offset: 15 * MIN },
]

export const STAGE_LABEL: Record<AlertStage, string> = {
  'T-60': 'T-60 MIN',
  'T-15': 'T-15 MIN',
  'T-00': 'NOW',
  MISS: 'MISSED',
  DAY: 'TODAY',
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidDate(s: unknown): s is string {
  return typeof s === 'string' && DATE_RE.test(s)
}

export function isValidTime(s: unknown): s is string {
  return typeof s === 'string' && TIME_RE.test(s)
}

/**
 * Lenient time input: "9", "930", "9:30", "0930", "21:05" → "HH:mm".
 * Returns null for empty or invalid input.
 */
export function normalizeTime(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  let h: number
  let m: number
  const colon = s.match(/^(\d{1,2}):(\d{2})$/)
  if (colon) {
    h = +colon[1]
    m = +colon[2]
  } else if (/^\d{1,2}$/.test(s)) {
    h = +s
    m = 0
  } else if (/^\d{3,4}$/.test(s)) {
    h = +s.slice(0, -2)
    m = +s.slice(-2)
  } else {
    return null
  }
  if (h > 23 || m > 59) return null
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Epoch ms of the entry's start in local time (all-day → 08:00). */
export function entryStartMs(e: Pick<CalendarEntry, 'date' | 'time'>): number {
  const [y, mo, d] = e.date.split('-').map(Number)
  const [h, mi] = e.time ? e.time.split(':').map(Number) : [DAY_ALERT_HOUR, 0]
  return new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
}

export function alertKey(entryId: string, stage: AlertStage): string {
  return `${entryId}:${stage}`
}

/** Sort key: date, then time (all-day first), then text. */
export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  return (
    a.date.localeCompare(b.date) ||
    (a.time || '').localeCompare(b.time || '') ||
    a.text.localeCompare(b.text)
  )
}

/**
 * Alerts that should fire right now.
 *
 * - Skips entries already done and stages already fired (`fired` holds alertKey()s).
 * - Catch-up safe: if several stages are overdue (tab was asleep), only the
 *   latest due stage fires — never a burst.
 * - MISS only fires for timed entries that are not done.
 * - Stages older than 24h are history and never fire.
 */
export function dueAlerts(
  entries: CalendarEntry[],
  now: number,
  fired: ReadonlySet<string>,
  done: ReadonlySet<string>
): CalendarAlert[] {
  const out: CalendarAlert[] = []
  for (const e of entries) {
    if (done.has(e.id)) continue
    const start = entryStartMs(e)
    const stages = e.time
      ? TIMED_STAGES.map(s => ({ stage: s.stage, at: start + s.offset }))
      : [{ stage: 'DAY' as AlertStage, at: start }]

    const due = stages.filter(s => s.at <= now && now - s.at <= STALE_MS)
    if (!due.length) continue
    const latest = due[due.length - 1]
    if (fired.has(alertKey(e.id, latest.stage))) continue
    out.push({ entryId: e.id, stage: latest.stage, at: latest.at })
  }
  return out.sort((a, b) => a.at - b.at)
}

/** "T-02:14:05" / "T-14:03" / "T+05:12" style countdown for a timed event. */
export function formatCountdown(startMs: number, now: number): string {
  const diff = startMs - now
  const sign = diff >= 0 ? '-' : '+'
  const total = Math.floor(Math.abs(diff) / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `T${sign}${p(h)}:${p(m)}:${p(s)}` : `T${sign}${p(m)}:${p(s)}`
}

export function formatAlertText(e: CalendarEntry, stage: AlertStage): string {
  const when = e.time ? `${e.date} ${e.time}` : e.date
  return `[ALERT] ${STAGE_LABEL[stage]} · ${e.type.toUpperCase()} · ${when} · ${e.text}`
}
