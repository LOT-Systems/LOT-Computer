/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Pure calendar logic: entry parsing, alert staging, countdown formatting.
// No React, no network — everything here is deterministic given `now`.

import dayjs from '#client/utils/dayjs'

export type EntryType = 'note' | 'task' | 'call'

// Alert stages in ascending urgency. Minutes are relative to the entry time.
export type AlertStage = 'T-60' | 'T-15' | 'T-0' | 'OVERDUE'

export const ALERT_STAGES: { stage: AlertStage; offsetMin: number }[] = [
  { stage: 'T-60', offsetMin: -60 },
  { stage: 'T-15', offsetMin: -15 },
  { stage: 'T-0', offsetMin: 0 },
  { stage: 'OVERDUE', offsetMin: 15 },
]

// An alert older than this past its entry time is stale and is never fired.
export const ALERT_WINDOW_MIN = 6 * 60

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm (24h) or null for all-day
  text: string
  type: EntryType
  done: boolean
  alerted: Set<AlertStage>
}

type LogLike = {
  id: string
  text?: string | null
  event?: string | null
  metadata?: Record<string, any> | null
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidTime(value: string): boolean {
  return TIME_RE.test(value)
}

/** Accepts "9", "930", "9:30", "0930" → "09:30"; returns null if unparseable. */
export function normalizeTime(raw: string): string | null {
  const s = raw.trim().replace('.', ':')
  if (!s) return null
  let h: string, m: string
  if (s.includes(':')) {
    ;[h, m = '00'] = s.split(':')
  } else if (s.length <= 2) {
    h = s
    m = '00'
  } else {
    h = s.slice(0, -2)
    m = s.slice(-2)
  }
  const out = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
  return isValidTime(out) ? out : null
}

export function buildEntries(logs: LogLike[]): CalendarEntry[] {
  const done = new Set<string>()
  const alerted = new Map<string, Set<AlertStage>>()

  for (const log of logs) {
    const entryId = log.metadata?.entryId as string | undefined
    if (!entryId) continue
    if (log.event === 'calendar_done') done.add(entryId)
    if (log.event === 'calendar_alert') {
      const stage = log.metadata?.stage as AlertStage | undefined
      if (!stage) continue
      if (!alerted.has(entryId)) alerted.set(entryId, new Set())
      alerted.get(entryId)!.add(stage)
    }
  }

  const entries: CalendarEntry[] = []
  for (const log of logs) {
    if (log.event !== 'calendar_entry' || !log.metadata) continue
    const date = log.metadata.date as string | undefined
    const text = (log.metadata.text as string) || log.text || ''
    if (!date || !text) continue
    const time = log.metadata.time as string | undefined
    entries.push({
      id: log.id,
      date,
      time: time && isValidTime(time) ? time : null,
      text,
      type: (log.metadata.entryType as EntryType) || 'note',
      done: done.has(log.id),
      alerted: alerted.get(log.id) ?? new Set(),
    })
  }

  // Date, then timed entries by time (all-day first)
  return entries.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time ?? '').localeCompare(b.time ?? '')
  )
}

/** Entry moment; null for all-day entries (no alerting without a time). */
export function entryMoment(e: Pick<CalendarEntry, 'date' | 'time'>) {
  return e.time ? dayjs(`${e.date} ${e.time}`) : null
}

/**
 * The single most urgent stage that has been reached and not yet logged.
 * Returns null for done/all-day/already-alerted/stale entries. Only the latest
 * reached stage fires, so a long-closed tab never replays a backlog.
 */
export function dueStage(
  e: CalendarEntry,
  now: ReturnType<typeof dayjs>
): AlertStage | null {
  if (e.done) return null
  const at = entryMoment(e)
  if (!at) return null
  const minutesFrom = now.diff(at, 'minute', true) // negative = before entry
  if (minutesFrom > ALERT_WINDOW_MIN) return null

  let reached: AlertStage | null = null
  for (const s of ALERT_STAGES) {
    if (minutesFrom >= s.offsetMin) reached = s.stage
  }
  return reached && !e.alerted.has(reached) ? reached : null
}

/** Stage currently in force for display (ignores whether it was logged). */
export function activeStage(
  e: CalendarEntry,
  now: ReturnType<typeof dayjs>
): AlertStage | null {
  if (e.done) return null
  const at = entryMoment(e)
  if (!at) return null
  const minutesFrom = now.diff(at, 'minute', true)
  if (minutesFrom > ALERT_WINDOW_MIN) return null
  let reached: AlertStage | null = null
  for (const s of ALERT_STAGES) {
    if (minutesFrom >= s.offsetMin) reached = s.stage
  }
  return reached
}

/** "T-02:14:05" / "T+00:07:30" countdown from now to the entry moment. */
export function formatCountdown(
  e: Pick<CalendarEntry, 'date' | 'time'>,
  now: ReturnType<typeof dayjs>
): string | null {
  const at = entryMoment(e)
  if (!at) return null
  const diff = at.diff(now, 'second')
  const sign = diff >= 0 ? '-' : '+'
  const abs = Math.abs(diff)
  const pad = (n: number) => String(n).padStart(2, '0')
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  return h >= 100 ? `T${sign}${h}H` : `T${sign}${pad(h)}:${pad(m)}:${pad(s)}`
}

export function alertLogText(e: CalendarEntry, stage: AlertStage): string {
  const when = e.time ? `${e.date} ${e.time}` : e.date
  return `[ALERT ${stage}] ${e.type.toUpperCase()}: ${e.text} (${when})`
}

/** The next not-done timed entry at or after `now`, else null. */
export function nextTimedEntry(
  entries: CalendarEntry[],
  now: ReturnType<typeof dayjs>
): CalendarEntry | null {
  for (const e of entries) {
    if (e.done || !e.time) continue
    const at = entryMoment(e)!
    if (at.isAfter(now) || now.diff(at, 'minute') <= 15) return e
  }
  return null
}
