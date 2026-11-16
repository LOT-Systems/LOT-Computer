/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar core — pure logic for the Calendar widget.
 *
 * Storage model (append-only, lives in the Log):
 *   calendar_entry   { date, time?, text, entryType }          — the entry itself
 *   calendar_done    { entryId, date, text, entryType }        — entry closed as done
 *   calendar_cancel  { entryId, date, text, entryType }        — entry scrubbed
 *   calendar_alert   { entryId, stage, date, time?, text, ... } — an alert fired
 *
 * The widget never mutates a log; status is derived from the latest
 * done/cancel record that references the entry's log id.
 *
 * Nothing in this file touches React or the DOM so it stays testable.
 */

import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
export type AlertStage = 'pre' | 'now' | 'day'

export const ENTRY_TYPES: EntryType[] = ['note', 'task', 'call']

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm (24h) or null for all-day
  text: string
  type: EntryType
  status: EntryStatus
  createdAt: string
}

export type CalendarAlert = {
  key: string // `${entryId}:${stage}` — dedup key
  entry: CalendarEntry
  stage: AlertStage
  at: number // epoch ms the alert is scheduled for
}

type LogLike = {
  id: string
  event: string
  text?: string | null
  createdAt: string | Date
  metadata?: Record<string, any> | null
}

/** Minutes of lead time for the pre-alert on timed entries. */
export const PRE_ALERT_MIN = 15
/** All-day entries alert at this local hour on the day itself. */
export const DAY_ALERT_HOUR = 9
/**
 * An alert whose moment passed while the app was closed still fires once
 * if we are within this grace window. Older ones are dropped silently so
 * opening the app never floods the operator with stale alerts.
 */
export const MISSED_GRACE_MS = 2 * 60 * 60 * 1000

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidDate(s: unknown): s is string {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

export function isValidTime(s: unknown): s is string {
  return typeof s === 'string' && TIME_RE.test(s)
}

/**
 * Normalize loose time input ("930", "9:30", "21", "0930") to HH:mm.
 * Returns null for empty input, undefined for invalid input.
 */
export function normalizeTime(raw: string): string | null | undefined {
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
    return undefined
  }
  if (h > 23 || m > 59) return undefined
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Local moment an entry happens. All-day entries resolve to 00:00. */
export function entryMoment(entry: Pick<CalendarEntry, 'date' | 'time'>): Dayjs {
  const [y, mo, d] = entry.date.split('-').map(Number)
  const [hh, mm] = entry.time ? entry.time.split(':').map(Number) : [0, 0]
  return dayjs(new Date(y, mo - 1, d, hh, mm, 0, 0))
}

/** Derive entries (with status) from the raw log list. */
export function parseEntries(logs: LogLike[]): CalendarEntry[] {
  // Latest closing record wins (logs arrive newest first, but don't rely on it)
  const closing = new Map<string, { status: EntryStatus; at: number }>()
  for (const log of logs) {
    if (log.event !== 'calendar_done' && log.event !== 'calendar_cancel') continue
    const entryId = log.metadata?.entryId
    if (typeof entryId !== 'string') continue
    const at = new Date(log.createdAt).getTime()
    const prev = closing.get(entryId)
    if (!prev || at > prev.at) {
      closing.set(entryId, { status: log.event === 'calendar_done' ? 'done' : 'cancelled', at })
    }
  }

  const out: CalendarEntry[] = []
  for (const log of logs) {
    if (log.event !== 'calendar_entry' || !log.metadata) continue
    const date = log.metadata.date
    const text = String(log.metadata.text || log.text || '').trim()
    if (!isValidDate(date) || !text) continue
    const rawType = log.metadata.entryType
    const type: EntryType = ENTRY_TYPES.includes(rawType) ? rawType : 'note'
    const time = isValidTime(log.metadata.time) ? log.metadata.time : null
    out.push({
      id: log.id,
      date,
      time,
      text,
      type,
      status: closing.get(log.id)?.status || 'open',
      createdAt: new Date(log.createdAt).toISOString(),
    })
  }
  return out.sort(compareEntries)
}

export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date.localeCompare(b.date)
  // All-day first, then by time
  if (a.time !== b.time) {
    if (a.time === null) return -1
    if (b.time === null) return 1
    return a.time.localeCompare(b.time)
  }
  return a.createdAt.localeCompare(b.createdAt)
}

/** When each alert stage for an entry is due (epoch ms). */
export function alertSchedule(entry: CalendarEntry): { stage: AlertStage; at: number }[] {
  const t = entryMoment(entry)
  if (entry.time) {
    return [
      { stage: 'pre', at: t.subtract(PRE_ALERT_MIN, 'minute').valueOf() },
      { stage: 'now', at: t.valueOf() },
    ]
  }
  return [{ stage: 'day', at: t.hour(DAY_ALERT_HOUR).valueOf() }]
}

/**
 * Alerts that should fire at `now`, excluding ones already fired.
 * For each entry only the latest due stage fires (no stacked pre+now).
 */
export function dueAlerts(
  entries: CalendarEntry[],
  now: number,
  fired: Set<string>
): CalendarAlert[] {
  const out: CalendarAlert[] = []
  for (const entry of entries) {
    if (entry.status !== 'open') continue
    const created = new Date(entry.createdAt).getTime()
    // Stages whose moment predates the entry itself never fire
    const schedule = alertSchedule(entry).filter(s => s.at >= created)
    const due = schedule.filter(s => s.at <= now && now - s.at <= MISSED_GRACE_MS)
    if (!due.length) continue
    const latest = due[due.length - 1]
    const key = `${entry.id}:${latest.stage}`
    // If a later stage already fired, earlier stages are moot
    const laterFired = schedule
      .slice(schedule.indexOf(latest))
      .some(s => fired.has(`${entry.id}:${s.stage}`))
    if (laterFired) continue
    out.push({ key, entry, stage: latest.stage, at: latest.at })
  }
  return out.sort((a, b) => a.at - b.at)
}

/** Next moment (epoch ms) any open entry needs an alert, or null. */
export function nextAlertAt(entries: CalendarEntry[], now: number): number | null {
  let next: number | null = null
  for (const entry of entries) {
    if (entry.status !== 'open') continue
    for (const s of alertSchedule(entry)) {
      if (s.at > now && (next === null || s.at < next)) next = s.at
    }
  }
  return next
}

/** Signed countdown "T-14:59" / "T+00:12" / "T-2D 04:10". */
export function formatT(targetMs: number, nowMs: number): string {
  const diff = targetMs - nowMs
  const sign = diff >= 0 ? '-' : '+'
  let s = Math.floor(Math.abs(diff) / 1000)
  const d = Math.floor(s / 86400)
  s -= d * 86400
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (d > 0) return `T${sign}${d}D ${pad(h)}:${pad(m)}`
  if (h > 0) return `T${sign}${pad(h)}:${pad(m)}:${pad(s)}`
  return `T${sign}${pad(m)}:${pad(s)}`
}

/** Minute-resolution countdown for at-a-glance UI: "T-2D 4H", "T-3H 05M", "T-14M". */
export function formatTShort(targetMs: number, nowMs: number): string {
  const mins = Math.max(0, Math.ceil((targetMs - nowMs) / 60000))
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60
  if (d > 0) return `T-${d}D ${h}H`
  if (h > 0) return `T-${h}H ${String(m).padStart(2, '0')}M`
  return `T-${m}M`
}

/** Short type code used in alerts and log lines. */
export function typeCode(t: EntryType): string {
  return t === 'task' ? 'TSK' : t === 'call' ? 'CALL' : 'NOTE'
}

export function stageLabel(stage: AlertStage): string {
  if (stage === 'pre') return `T-${PRE_ALERT_MIN} MIN`
  if (stage === 'now') return 'EXECUTE'
  return 'DAY OF'
}

/** Military date-time group, local: "161430L NOV 26". */
export function dtg(m: Dayjs): string {
  return `${m.format('DDHHmm')}L ${m.format('MMM').toUpperCase()} ${m.format('YY')}`
}

/** One-line log text for an alert record. */
export function alertLogText(alert: CalendarAlert): string {
  const e = alert.entry
  const when = e.time ? `${e.date} ${e.time}` : e.date
  return `[CAL//ALERT] ${stageLabel(alert.stage)} · ${typeCode(e.type)} · ${e.text} (${when})`
}

/** Month grid — ISO weeks (Mon first), always whole weeks, 5–6 rows. */
export function getMonthWeeks(year: number, month: number): Dayjs[][] {
  // Build from an explicit Date: dayjs().year().month() overflows when
  // today's day-of-month doesn't exist in the target month (e.g. 31st → Feb).
  const first = dayjs(new Date(year, month, 1))
  const isoDay = (first.day() + 6) % 7
  const rows = Math.max(5, Math.ceil((isoDay + first.daysInMonth()) / 7))
  const start = first.subtract(isoDay, 'day')

  const weeks: Dayjs[][] = []
  for (let w = 0; w < rows; w++) {
    const week: Dayjs[] = []
    for (let i = 0; i < 7; i++) week.push(start.add(w * 7 + i, 'day'))
    weeks.push(week)
  }
  return weeks
}

// ── Fired-alert ledger (per browser) ─────────────────────────────────────────

const LEDGER_KEY = 'lot_calendar_alerts_v1'
const LEDGER_MAX = 300

export function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(LEDGER_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr.filter((x: unknown) => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

export function saveFired(fired: Set<string>): void {
  try {
    const arr = Array.from(fired).slice(-LEDGER_MAX)
    localStorage.setItem(LEDGER_KEY, JSON.stringify(arr))
  } catch {
    /* storage unavailable — alerts still dedupe for this session */
  }
}

/** Seed the ledger from calendar_alert logs so other devices don't re-fire. */
export function firedFromLogs(logs: LogLike[]): string[] {
  const out: string[] = []
  for (const log of logs) {
    if (log.event !== 'calendar_alert') continue
    const id = log.metadata?.entryId
    const stage = log.metadata?.stage
    if (typeof id === 'string' && typeof stage === 'string') out.push(`${id}:${stage}`)
  }
  return out
}
