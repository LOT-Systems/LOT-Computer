/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar core — pure, side-effect-free logic shared by CalendarWidget and
 * CalendarAlerts. The calendar is event-sourced from the Log:
 *
 *   calendar_entry   { entryId, date, time?, text, entryType }   — creation
 *   calendar_status  { entryId, status }                         — done / cancelled / open
 *   calendar_alert   { entryId, stage }                          — a fired notification
 *
 * Folding these rows in createdAt order yields the current state of every
 * entry. Nothing is ever mutated in place, so the Log stays a full audit trail.
 */

import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
/** T-15: 15 min before a timed entry · T-0: at time · D-0: day-of, for all-day entries */
export type AlertStage = 'T-15' | 'T-0' | 'D-0'

export const ENTRY_TYPES: EntryType[] = ['note', 'task', 'call']
export const LEAD_MINUTES = 15
/** How long after T-0 an alert may still fire (e.g. app opened slightly late). */
export const T0_GRACE_MINUTES = 60
/** All-day entries alert at this local hour on the day. */
export const ALL_DAY_ALERT_HOUR = 9

export type CalendarLogRow = {
  id: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string | Date
}

export type CalendarEntry = {
  id: string
  logId: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm (24h) or null for all-day
  text: string
  type: EntryType
  status: EntryStatus
  createdAt: string
}

export type DueAlert = {
  entry: CalendarEntry
  stage: AlertStage
  key: string
}

/** Parse YYYY-MM-DD as a LOCAL calendar day (dayjs regex-parses ISO dates locally). */
export function day(date: string): Dayjs {
  return dayjs(date)
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidDate(date: unknown): date is string {
  return typeof date === 'string' && DATE_RE.test(date) && day(date).format('YYYY-MM-DD') === date
}

export function normalizeTime(time: unknown): string | null {
  if (typeof time !== 'string') return null
  const t = time.trim()
  if (TIME_RE.test(t)) return t
  // Accept H:mm
  const m = /^(\d):([0-5]\d)$/.exec(t)
  if (m) return `0${m[1]}:${m[2]}`
  return null
}

function toType(v: unknown): EntryType {
  return v === 'task' || v === 'call' ? v : 'note'
}

function toIso(d: string | Date): string {
  return typeof d === 'string' ? d : d.toISOString()
}

/** Fold calendar log rows into current entry state. */
export function reduceCalendarLogs(rows: CalendarLogRow[]): CalendarEntry[] {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const byId = new Map<string, CalendarEntry>()

  for (const row of sorted) {
    const md = row.metadata || {}
    if (row.event === 'calendar_entry') {
      const date = md.date
      const text = ((md.text as string) || row.text || '').trim()
      if (!isValidDate(date) || !text) continue
      // Legacy entries (pre-v2) have no entryId — the log id is their identity.
      const id = (typeof md.entryId === 'string' && md.entryId) || row.id
      if (byId.has(id)) continue
      byId.set(id, {
        id,
        logId: row.id,
        date,
        time: normalizeTime(md.time),
        text,
        type: toType(md.entryType),
        status: 'open',
        createdAt: toIso(row.createdAt),
      })
    } else if (row.event === 'calendar_status') {
      const entry = byId.get(md.entryId as string)
      const status = md.status
      if (entry && (status === 'open' || status === 'done' || status === 'cancelled')) {
        entry.status = status
      }
    }
  }

  return [...byId.values()].sort(compareEntries)
}

export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  // All-day entries first within a day, then by time
  const at = a.time ?? ''
  const bt = b.time ?? ''
  if (at !== bt) return at < bt ? -1 : 1
  return a.createdAt < b.createdAt ? -1 : 1
}

/** Keys of alerts already recorded in the Log (server-side truth). */
export function firedAlertKeys(rows: CalendarLogRow[]): Set<string> {
  const keys = new Set<string>()
  for (const row of rows) {
    if (row.event !== 'calendar_alert') continue
    const { entryId, stage } = row.metadata || {}
    if (entryId && stage) keys.add(alertKey(entryId, stage))
  }
  return keys
}

export function alertKey(entryId: string, stage: AlertStage | string): string {
  return `${entryId}:${stage}`
}

/** The instant an entry is "due": its time, or ALL_DAY_ALERT_HOUR for all-day entries. */
export function entryInstant(entry: Pick<CalendarEntry, 'date' | 'time'>): Dayjs {
  const base = day(entry.date)
  if (entry.time) {
    const [h, m] = entry.time.split(':').map(Number)
    return base.hour(h).minute(m).second(0).millisecond(0)
  }
  return base.hour(ALL_DAY_ALERT_HOUR).minute(0).second(0).millisecond(0)
}

/**
 * Alerts that should fire right now and haven't yet.
 * Windows are bounded so a stale tab never floods the operator with old alerts:
 *   T-15  [at − 15m, at)
 *   T-0   [at, at + 60m]
 *   D-0   [day 09:00, end of day]
 */
export function computeDueAlerts(
  entries: CalendarEntry[],
  fired: Set<string>,
  now: Dayjs = dayjs()
): DueAlert[] {
  const due: DueAlert[] = []
  for (const entry of entries) {
    if (entry.status !== 'open') continue
    const at = entryInstant(entry)
    const push = (stage: AlertStage) => {
      const key = alertKey(entry.id, stage)
      if (!fired.has(key)) due.push({ entry, stage, key })
    }
    if (entry.time) {
      const leadStart = at.subtract(LEAD_MINUTES, 'minute')
      if (!now.isBefore(leadStart) && now.isBefore(at)) push('T-15')
      else if (!now.isBefore(at) && !now.isAfter(at.add(T0_GRACE_MINUTES, 'minute'))) push('T-0')
    } else {
      if (!now.isBefore(at) && !now.isAfter(at.endOf('day'))) push('D-0')
    }
  }
  return due
}

/** An open task/call whose moment has passed (all-day: after the day ends). */
export function isOverdue(entry: CalendarEntry, now: Dayjs = dayjs()): boolean {
  if (entry.status !== 'open' || entry.type === 'note') return false
  const at = entry.time ? entryInstant(entry) : day(entry.date).endOf('day')
  return now.isAfter(at)
}

/**
 * Next open entry still ahead of `now`. Within the earliest pending day a
 * timed entry outranks an all-day one (it is the actionable countdown); an
 * all-day entry stays pending until its day ends.
 */
export function nextEntry(entries: CalendarEntry[], now: Dayjs = dayjs()): CalendarEntry | null {
  let firstAllDay: CalendarEntry | null = null
  for (const e of entries) {
    if (e.status !== 'open') continue
    const horizon = e.time ? entryInstant(e) : day(e.date).endOf('day')
    if (now.isAfter(horizon)) continue
    if (firstAllDay && e.date !== firstAllDay.date) return firstAllDay
    if (e.time) return e
    if (!firstAllDay) firstAllDay = e
  }
  return firstAllDay
}

/** Military-style countdown: T-2D 04:15 · T-04:15 · T-00:09 · NOW */
export function formatCountdown(entry: CalendarEntry, now: Dayjs = dayjs()): string {
  if (!entry.time) {
    const days = day(entry.date).diff(now.startOf('day'), 'day')
    if (days <= 0) return 'TODAY'
    return `T-${days}D`
  }
  const mins = Math.ceil(entryInstant(entry).diff(now, 'second') / 60)
  if (mins <= 0) return 'NOW'
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  const hm = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return d > 0 ? `T-${d}D ${hm}` : `T-${hm}`
}

/** Compact date-time-group, e.g. "SAT 14 NOV · 14:30" */
export function formatDtg(entry: Pick<CalendarEntry, 'date' | 'time'>): string {
  const d = day(entry.date).format('ddd D MMM').toUpperCase()
  return entry.time ? `${d} · ${entry.time}` : d
}

export function newEntryId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {}
  return `cal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
