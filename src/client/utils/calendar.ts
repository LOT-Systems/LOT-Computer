/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar engine — pure, side-effect-free logic shared by the Calendar
 * widget and the global alert scheduler.
 *
 * Storage model (append-only, everything lives in Log):
 *   calendar_entry   metadata { date, time?, text, entryType, leadMin? }
 *   calendar_status  metadata { entryId, status: 'done' | 'dropped' | 'active' }
 *   calendar_alert   metadata { entryId, alertKey, lead, date, time?, late? }
 *
 * The entry id is the id of its calendar_entry log. The latest
 * calendar_status log (by createdAt) wins.
 */

import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'active' | 'done' | 'dropped'

export const ENTRY_TYPES: EntryType[] = ['note', 'task', 'call']
/** Selectable alert lead times, minutes before the event. */
export const LEAD_OPTIONS = [0, 5, 15, 60] as const
export const DEFAULT_LEAD_MIN = 15
/** Untimed entries are briefed at this local time on their day. */
export const UNTIMED_BRIEF_TIME = '09:00'
/** Alerts missed while the app was closed are still delivered (flagged LATE) within this window. */
export const LATE_GRACE_MS = 6 * 60 * 60 * 1000

export const TYPE_CODE: Record<EntryType, string> = {
  note: 'NOTE',
  task: 'TASK',
  call: 'CALL',
}

export type CalendarLogLike = {
  id: string
  event: string
  text?: string | null
  createdAt: string | Date
  metadata?: Record<string, any> | null
}

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD (local)
  time: string | null // HH:mm (local) or null = all-day
  text: string
  type: EntryType
  leadMin: number
  status: EntryStatus
  createdAt: number
}

export type CalendarAlert = {
  key: string // `${entryId}:${lead}` — stable dedupe key
  entryId: string
  lead: number // minutes before event (0 = event time)
  fireAt: number // epoch ms
  eventAt: number // epoch ms
  late: boolean
  entry: CalendarEntry
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidDate(s: unknown): s is string {
  return typeof s === 'string' && DATE_RE.test(s) && dayjs(s).isValid()
}

export function isValidTime(s: unknown): s is string {
  return typeof s === 'string' && TIME_RE.test(s)
}

/** Normalise loose user input ("930", "9:30", "0930", "21") into HH:mm, or null. */
export function parseTimeInput(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  let h: number
  let m: number
  const colon = s.match(/^(\d{1,2}):(\d{2})$/)
  if (colon) {
    h = Number(colon[1])
    m = Number(colon[2])
  } else if (/^\d{1,4}$/.test(s)) {
    if (s.length <= 2) {
      h = Number(s)
      m = 0
    } else {
      h = Number(s.slice(0, s.length - 2))
      m = Number(s.slice(-2))
    }
  } else {
    return null
  }
  if (h > 23 || m > 59) return null
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function ts(d: string | Date): number {
  const n = new Date(d).getTime()
  return Number.isFinite(n) ? n : 0
}

/** Reduce raw calendar logs into the current entry set (all statuses). */
export function buildEntries(logs: CalendarLogLike[]): CalendarEntry[] {
  const statusById = new Map<string, { status: EntryStatus; at: number }>()
  for (const log of logs) {
    if (log.event !== 'calendar_status') continue
    const entryId = log.metadata?.entryId
    const status = log.metadata?.status
    if (typeof entryId !== 'string') continue
    if (status !== 'done' && status !== 'dropped' && status !== 'active') continue
    const at = ts(log.createdAt)
    const prev = statusById.get(entryId)
    if (!prev || at >= prev.at) statusById.set(entryId, { status, at })
  }

  const entries: CalendarEntry[] = []
  const seen = new Set<string>()
  for (const log of logs) {
    if (log.event !== 'calendar_entry' || !log.metadata) continue
    if (seen.has(log.id)) continue
    seen.add(log.id)
    const md = log.metadata
    const date = md.date
    const text = String(md.text || log.text || '').trim()
    if (!isValidDate(date) || !text) continue
    const type: EntryType = ENTRY_TYPES.includes(md.entryType) ? md.entryType : 'note'
    const time = isValidTime(md.time) ? md.time : null
    const leadRaw = Number(md.leadMin)
    const leadMin = Number.isFinite(leadRaw) && leadRaw >= 0 && leadRaw <= 24 * 60
      ? Math.round(leadRaw)
      : DEFAULT_LEAD_MIN
    entries.push({
      id: log.id,
      date,
      time,
      text,
      type,
      leadMin,
      status: statusById.get(log.id)?.status || 'active',
      createdAt: ts(log.createdAt),
    })
  }

  return entries.sort(compareEntries)
}

export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  // All-day entries lead the day, then chronological.
  const at = a.time ?? ''
  const bt = b.time ?? ''
  if (at !== bt) return at < bt ? -1 : 1
  return a.createdAt - b.createdAt
}

/** Local epoch ms of the event itself (all-day → briefing time). */
export function eventTime(entry: Pick<CalendarEntry, 'date' | 'time'>): number {
  return dayjs(`${entry.date}T${entry.time ?? UNTIMED_BRIEF_TIME}:00`).valueOf()
}

/** The alert schedule for one entry. */
export function alertsFor(entry: CalendarEntry): Omit<CalendarAlert, 'late'>[] {
  if (entry.status !== 'active') return []
  const eventAt = eventTime(entry)
  const leads = entry.time && entry.leadMin > 0 ? [entry.leadMin, 0] : [0]
  return leads.map((lead) => ({
    key: `${entry.id}:${lead}`,
    entryId: entry.id,
    lead,
    fireAt: eventAt - lead * 60_000,
    eventAt,
    entry,
  }))
}

/**
 * Alerts that should fire right now. An alert is due when its fire time has
 * passed, it has not been fired (by any device), and it is within the late
 * grace window. When several windows of one entry are overdue, only the
 * most recent one is delivered — no stale T-15 after the event already began.
 */
export function dueAlerts(
  entries: CalendarEntry[],
  now: number,
  fired: Set<string>,
  graceMs = LATE_GRACE_MS
): CalendarAlert[] {
  const out: CalendarAlert[] = []
  for (const entry of entries) {
    const schedule = alertsFor(entry).filter((a) => a.fireAt <= now)
    if (!schedule.length) continue
    const latest = schedule.reduce((m, a) => (a.fireAt > m.fireAt ? a : m))
    if (fired.has(latest.key)) continue
    if (now - latest.fireAt > graceMs) continue
    out.push({ ...latest, late: now - latest.fireAt > 60_000 })
  }
  return out.sort((a, b) => a.fireAt - b.fireAt)
}

/** Next pending fire time after `now`, or null. */
export function nextFireAt(entries: CalendarEntry[], now: number, fired: Set<string>): number | null {
  let next: number | null = null
  for (const entry of entries) {
    for (const a of alertsFor(entry)) {
      if (a.fireAt <= now || fired.has(a.key)) continue
      if (next === null || a.fireAt < next) next = a.fireAt
    }
  }
  return next
}

/** Active entries whose event moment has not passed yet (all-day: until end of day). */
export function upcomingEntries(entries: CalendarEntry[], now: number, limit = 10): CalendarEntry[] {
  const todayKey = dayjs(now).format('YYYY-MM-DD')
  return entries
    .filter((e) => e.status === 'active')
    .filter((e) => (e.time ? eventTime(e) > now - 60 * 60_000 : e.date >= todayKey))
    .slice(0, limit)
}

/** Next timed or all-day event the countdown should lock onto. */
export function nextEvent(entries: CalendarEntry[], now: number): CalendarEntry | null {
  let best: CalendarEntry | null = null
  for (const e of entries) {
    if (e.status !== 'active') continue
    const at = eventTime(e)
    if (at > now && (!best || at < eventTime(best))) best = e
  }
  return best
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Military T-minus readout.
 *   < 1h   → T-14:05
 *   < 24h  → T-02:14:05
 *   ≥ 24h  → T-3D 04H
 * After the event: T+05:00 etc.
 */
export function formatTMinus(deltaMs: number): string {
  const sign = deltaMs >= 0 ? '-' : '+'
  const total = Math.floor(Math.abs(deltaMs) / 1000)
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (d > 0) return `T${sign}${d}D ${pad(h)}H`
  if (h > 0) return `T${sign}${pad(h)}:${pad(m)}:${pad(s)}`
  return `T${sign}${pad(m)}:${pad(s)}`
}

/** "T-15" / "T-0" label of an alert window. */
export function leadLabel(lead: number): string {
  if (lead >= 60 && lead % 60 === 0) return `T-${lead / 60}H`
  return `T-${lead}`
}

/** 24h military clock, e.g. 1430. */
export function milTime(time: string | null): string {
  return time ? time.replace(':', '') : '----'
}

/** Weeks (Mon-first) covering the month of `month`. Overflow-safe. */
export function getMonthWeeks(month: Dayjs): Dayjs[][] {
  const first = month.startOf('month')
  const last = month.endOf('month')
  const isoDay = first.day() === 0 ? 6 : first.day() - 1
  let current = first.subtract(isoDay, 'day')
  const weeks: Dayjs[][] = []
  do {
    const week: Dayjs[] = []
    for (let i = 0; i < 7; i++) {
      week.push(current)
      current = current.add(1, 'day')
    }
    weeks.push(week)
  } while (!current.isAfter(last, 'day') && weeks.length < 6)
  return weeks
}

/** Log text for each record type — stays readable in plain Log view. */
export function entryLogText(e: { type: EntryType; text: string; date: string; time: string | null }): string {
  const when = dayjs(e.date).format('ddd D MMM YYYY').toUpperCase()
  return `[SCHEDULE] ${TYPE_CODE[e.type]} · ${e.text} · ${when}${e.time ? ` ${milTime(e.time)}H` : ''}`
}

export function alertLogText(a: CalendarAlert): string {
  const e = a.entry
  return `[ALERT] ${leadLabel(a.lead)}${a.late ? ' LATE' : ''} · ${TYPE_CODE[e.type]} · ${e.text}${e.time ? ` · ${milTime(e.time)}H` : ''}`
}

export function statusLogText(e: CalendarEntry, status: EntryStatus): string {
  const code = status === 'done' ? 'COMPLETE' : status === 'dropped' ? 'SCRUBBED' : 'REINSTATED'
  return `[${code}] ${TYPE_CODE[e.type]} · ${e.text}`
}
