/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar core — pure functions, no React, no network.
 *
 * Event model (all persisted as Log rows, append-only):
 *   calendar_entry   { date, time?, text, entryType }        — creates an entry
 *   calendar_done    { entryId, date, text, entryType }      — closes an entry as complete
 *   calendar_cancel  { entryId, date, text, entryType }      — scrubs an entry
 *   calendar_alert   { entryId, phase, date, time?, text, entryType } — notification fired
 *
 * Entry state is derived by folding status events over entries. Nothing is
 * ever mutated in place, so the Log remains a faithful field record.
 */

import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
export type AlertPhase = 'T-15' | 'T-0'

export const CALENDAR_EVENTS = [
  'calendar_entry',
  'calendar_done',
  'calendar_cancel',
  'calendar_alert',
] as const

export const ENTRY_TYPES: EntryType[] = ['note', 'task', 'call']

/** Pre-alert lead time in minutes. */
export const WARN_LEAD_MIN = 15
/** Untimed entries alert at this local hour on their date. */
export const UNTIMED_ALERT_HOUR = 9
/** Alerts older than this are considered stale and are never fired. */
export const STALE_ALERT_MIN = 60

export type CalendarEntry = {
  id: string
  ref: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm (local)
  text: string
  type: EntryType
  status: EntryStatus
  createdAt: string
}

type LogLike = {
  id: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string | Date
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidDate(date: unknown): date is string {
  if (typeof date !== 'string' || !DATE_RE.test(date)) return false
  const d = dayjs(date)
  return d.isValid() && d.format('YYYY-MM-DD') === date
}

export function isValidTime(time: unknown): time is string {
  return typeof time === 'string' && TIME_RE.test(time)
}

/** Normalizes loose input ("9", "930", "9:30", "09:30") into HH:mm, or null. */
export function normalizeTime(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  let h: number
  let m: number
  const colon = raw.match(/^(\d{1,2}):(\d{2})$/)
  if (colon) {
    h = Number(colon[1])
    m = Number(colon[2])
  } else if (/^\d{1,4}$/.test(raw)) {
    if (raw.length <= 2) {
      h = Number(raw)
      m = 0
    } else {
      h = Number(raw.slice(0, raw.length - 2))
      m = Number(raw.slice(-2))
    }
  } else {
    return null
  }
  if (h > 23 || m > 59) return null
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Short operator reference code derived from the log id: CAL-7F3A. */
export function entryRef(id: string): string {
  const clean = String(id).replace(/[^a-zA-Z0-9]/g, '')
  return `CAL-${clean.slice(-4).toUpperCase().padStart(4, '0')}`
}

/** Folds calendar log events into the current entry set. */
export function deriveEntries(logs: LogLike[]): CalendarEntry[] {
  const status = new Map<string, EntryStatus>()
  // Status events: the latest one wins.
  const statusEvents = logs
    .filter((l) => (l.event === 'calendar_done' || l.event === 'calendar_cancel') && l.metadata?.entryId)
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
  for (const l of statusEvents) {
    status.set(String(l.metadata!.entryId), l.event === 'calendar_done' ? 'done' : 'cancelled')
  }

  const seen = new Set<string>()
  const entries: CalendarEntry[] = []
  for (const l of logs) {
    if (l.event !== 'calendar_entry' || !l.metadata) continue
    if (seen.has(l.id)) continue
    seen.add(l.id)
    const date = l.metadata.date
    const text = String(l.metadata.text || l.text || '').trim()
    if (!isValidDate(date) || !text) continue
    const type = ENTRY_TYPES.includes(l.metadata.entryType) ? (l.metadata.entryType as EntryType) : 'note'
    entries.push({
      id: l.id,
      ref: entryRef(l.id),
      date,
      time: isValidTime(l.metadata.time) ? l.metadata.time : null,
      text,
      type,
      status: status.get(l.id) || 'open',
      createdAt: String(l.createdAt),
    })
  }
  return entries.sort(compareEntries)
}

export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date.localeCompare(b.date)
  // Timed entries first within a day, ordered by time; untimed after.
  if (a.time && b.time) return a.time.localeCompare(b.time)
  if (a.time) return -1
  if (b.time) return 1
  return a.createdAt.localeCompare(b.createdAt)
}

/** The local moment an entry is due. Untimed entries resolve to end of day. */
export function entryMoment(e: Pick<CalendarEntry, 'date' | 'time'>): Dayjs {
  if (e.time) return dayjs(`${e.date}T${e.time}:00`)
  return dayjs(`${e.date}T23:59:59`)
}

/** Whether an open entry has passed its due moment. */
export function isOverdue(e: CalendarEntry, now: Dayjs): boolean {
  return e.status === 'open' && entryMoment(e).isBefore(now)
}

/**
 * Military countdown.
 *   T-3D 04H   more than a day out
 *   T-04:12    under a day (HH:MM)
 *   T-00:00    due now (within the current minute)
 *   T+01:30    overdue, under a day
 *   T+2D       overdue, more than a day
 *   D-DAY      untimed, today
 */
export function countdown(e: Pick<CalendarEntry, 'date' | 'time'>, now: Dayjs): string {
  if (!e.time) {
    const days = dayjs(e.date).startOf('day').diff(now.startOf('day'), 'day')
    if (days === 0) return 'D-DAY'
    if (days > 0) return `T-${days}D`
    return `T+${-days}D`
  }
  const diffSec = entryMoment(e).diff(now, 'second')
  const sign = diffSec >= 0 ? '-' : '+'
  // Whole elapsed minutes in either direction (truncate toward zero).
  const abs = Math.floor(Math.abs(diffSec) / 60)
  if (abs >= 24 * 60) {
    const d = Math.floor(abs / (24 * 60))
    const h = Math.floor((abs % (24 * 60)) / 60)
    return sign === '-' ? `T-${d}D ${String(h).padStart(2, '0')}H` : `T+${d}D`
  }
  const hh = String(Math.floor(abs / 60)).padStart(2, '0')
  const mm = String(abs % 60).padStart(2, '0')
  return `T${sign}${hh}:${mm}`
}

/** When each alert phase should fire for an entry. */
export function alertSchedule(e: CalendarEntry): { phase: AlertPhase; at: Dayjs }[] {
  if (e.time) {
    const due = entryMoment(e)
    return [
      { phase: 'T-15', at: due.subtract(WARN_LEAD_MIN, 'minute') },
      { phase: 'T-0', at: due },
    ]
  }
  return [{ phase: 'T-0', at: dayjs(`${e.date}T${String(UNTIMED_ALERT_HOUR).padStart(2, '0')}:00:00`) }]
}

export function alertKey(entryId: string, phase: AlertPhase): string {
  return `${entryId}:${phase}`
}

/** Alert keys already logged on the server. */
export function firedAlertKeys(logs: LogLike[]): Set<string> {
  const set = new Set<string>()
  for (const l of logs) {
    if (l.event === 'calendar_alert' && l.metadata?.entryId && l.metadata?.phase) {
      set.add(alertKey(String(l.metadata.entryId), l.metadata.phase as AlertPhase))
    }
  }
  return set
}

export type DueAlert = { entry: CalendarEntry; phase: AlertPhase; at: Dayjs }

/**
 * Alerts that are due now and have not been fired.
 * An alert is due when its moment has passed but is not older than
 * STALE_ALERT_MIN — so reopening the app days later never floods the Log.
 * If both phases are due at once, only the most advanced one (T-0) fires.
 */
export function dueAlerts(entries: CalendarEntry[], fired: Set<string>, now: Dayjs): DueAlert[] {
  const out: DueAlert[] = []
  for (const entry of entries) {
    if (entry.status !== 'open') continue
    const schedule = alertSchedule(entry)
    let pick: DueAlert | null = null
    for (const s of schedule) {
      if (s.at.isAfter(now)) continue
      if (now.diff(s.at, 'minute') > STALE_ALERT_MIN) continue
      pick = { entry, phase: s.phase, at: s.at }
    }
    if (!pick) continue
    // T-0 supersedes T-15: if T-0 is due, skip regardless of whether T-15 fired.
    if (fired.has(alertKey(entry.id, pick.phase))) continue
    out.push(pick)
  }
  return out
}

/** Month grid, ISO weeks (Mon-first). Always starts on the 1st — avoids month overflow. */
export function getMonthWeeks(year: number, month: number): Dayjs[][] {
  const first = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-01`)
  const last = first.endOf('month')
  const isoDay = first.day() === 0 ? 6 : first.day() - 1
  let current = first.subtract(isoDay, 'day')
  const weeks: Dayjs[][] = []
  while (!current.isAfter(last, 'day') && weeks.length < 6) {
    const week: Dayjs[] = []
    for (let i = 0; i < 7; i++) {
      week.push(current)
      current = current.add(1, 'day')
    }
    weeks.push(week)
  }
  return weeks
}

export function typeCode(t: EntryType): string {
  return t === 'note' ? 'NOTE' : t === 'task' ? 'TASK' : 'CALL'
}
