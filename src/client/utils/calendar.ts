/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar core — pure, side-effect-free logic shared by the Calendar widget,
 * the app-level alert engine, and the System "Next:" line.
 *
 * Storage model (append-only, all rows live in Log):
 *   calendar_entry   metadata { date: YYYY-MM-DD, time?: HH:mm, text, entryType }
 *   calendar_status  metadata { entryId, status: 'done' | 'cancelled' | 'open' }
 *   calendar_alert   metadata { entryId, phase, alertKey, date, time, entryType }
 *
 * The latest calendar_status per entry wins. calendar_alert rows double as a
 * durable, cross-device "already fired" ledger so a notification never repeats.
 */

import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
export type AlertPhase = 'T-15' | 'T-0' | 'DAY'

export const ENTRY_TYPES: EntryType[] = ['note', 'task', 'call']

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD, local
  time: string | null // HH:mm, local, 24h
  text: string
  type: EntryType
  status: EntryStatus
  createdAt: string
}

export type CalendarAlert = {
  key: string
  entry: CalendarEntry
  phase: AlertPhase
}

type RawLog = {
  id: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string | Date
}

/** Lead time for the pre-alert. */
export const LEAD_MINUTES = 15
/** A T-0 alert still fires if the app opens up to this long after the mark. */
export const T0_GRACE_MINUTES = 120
/** All-day (untimed) entries alert at this local hour on their date. */
export const DAY_ALERT_HOUR = 9
/** Open entries this many days in the past are still listed as overdue. */
export const OVERDUE_WINDOW_DAYS = 3

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

/**
 * Parse loose user time input into 24h "HH:mm".
 * Accepts: "1430", "930", "14:30", "9:30", "14", "9am", "9:15pm", "12am".
 * Returns null for empty input, undefined for unparseable input.
 */
export function parseTimeInput(raw: string): string | null | undefined {
  const s = raw.trim().toLowerCase().replace(/\s+/g, '').replace(/h$/, '')
  if (!s) return null
  const m = s.match(/^(\d{1,2})(?::?(\d{2}))?(am|pm|a|p)?$/)
  if (!m) return undefined
  let h = parseInt(m[1], 10)
  const min = m[2] ? parseInt(m[2], 10) : 0
  const mer = m[3]
  if (min > 59) return undefined
  if (mer) {
    if (h < 1 || h > 12) return undefined
    const pm = mer.startsWith('p')
    if (h === 12) h = pm ? 12 : 0
    else if (pm) h += 12
  }
  if (h > 23) return undefined
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

/** "14:30" -> "1430H" */
export function militaryTime(time: string | null): string {
  if (!time) return '----H'
  return `${time.replace(':', '')}H`
}

/** Moment an entry is "due": its time, or DAY_ALERT_HOUR for untimed entries. */
export function entryInstant(entry: Pick<CalendarEntry, 'date' | 'time'>): Dayjs {
  const base = dayjs(entry.date)
  if (entry.time) {
    const [h, m] = entry.time.split(':').map(Number)
    return base.hour(h).minute(m).second(0).millisecond(0)
  }
  return base.hour(DAY_ALERT_HOUR).minute(0).second(0).millisecond(0)
}

/** Sort key: date, then timed entries by time, untimed entries first in the day. */
function sortKey(e: CalendarEntry): string {
  return `${e.date} ${e.time ?? '00:00'} ${e.time ? 1 : 0} ${e.createdAt}`
}

export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  return sortKey(a).localeCompare(sortKey(b))
}

export function alertKey(entryId: string, phase: AlertPhase): string {
  return `${entryId}:${phase}`
}

/**
 * Fold the raw calendar log stream into current entries + fired-alert ledger.
 */
export function foldCalendarLogs(logs: RawLog[]): {
  entries: CalendarEntry[]
  fired: Set<string>
} {
  const statusById = new Map<string, { status: EntryStatus; at: number }>()
  const fired = new Set<string>()
  const entries: CalendarEntry[] = []

  for (const log of logs) {
    const md = log.metadata || {}
    if (log.event === 'calendar_status' && typeof md.entryId === 'string') {
      const at = new Date(log.createdAt).getTime()
      const prev = statusById.get(md.entryId)
      const status: EntryStatus =
        md.status === 'done' || md.status === 'cancelled' ? md.status : 'open'
      if (!prev || at >= prev.at) statusById.set(md.entryId, { status, at })
    } else if (log.event === 'calendar_alert') {
      if (typeof md.alertKey === 'string') fired.add(md.alertKey)
      else if (typeof md.entryId === 'string' && md.phase) {
        fired.add(alertKey(md.entryId, md.phase))
      }
    }
  }

  const seen = new Set<string>()
  for (const log of logs) {
    if (log.event !== 'calendar_entry' || seen.has(log.id)) continue
    seen.add(log.id)
    const md = log.metadata || {}
    const text = String(md.text || log.text || '').trim()
    if (!isValidDate(md.date) || !text) continue
    const type: EntryType = ENTRY_TYPES.includes(md.entryType) ? md.entryType : 'note'
    entries.push({
      id: log.id,
      date: md.date,
      time: isValidTime(md.time) ? md.time : null,
      text,
      type,
      status: statusById.get(log.id)?.status ?? 'open',
      createdAt: new Date(log.createdAt).toISOString(),
    })
  }

  entries.sort(compareEntries)
  return { entries, fired }
}

/**
 * Which alerts should fire right now. At most one alert per entry per call —
 * if the app opens after T-0, the T-15 pre-alert is skipped (superseded).
 */
export function dueAlerts(
  entries: CalendarEntry[],
  now: Dayjs,
  fired: Set<string>
): CalendarAlert[] {
  const out: CalendarAlert[] = []
  const today = now.format('YYYY-MM-DD')

  for (const entry of entries) {
    if (entry.status !== 'open') continue
    const due = entryInstant(entry)
    // Logged after its own due moment (retroactive entry) — record, don't alert.
    if (dayjs(entry.createdAt).isAfter(due)) continue

    if (entry.time) {
      const pre = due.subtract(LEAD_MINUTES, 'minute')
      const graceEnd = due.add(T0_GRACE_MINUTES, 'minute')
      const k0 = alertKey(entry.id, 'T-0')
      const k15 = alertKey(entry.id, 'T-15')
      if (!now.isBefore(due) && now.isBefore(graceEnd)) {
        if (!fired.has(k0)) out.push({ key: k0, entry, phase: 'T-0' })
      } else if (!now.isBefore(pre) && now.isBefore(due)) {
        if (!fired.has(k15)) out.push({ key: k15, entry, phase: 'T-15' })
      }
    } else if (entry.date === today && !now.isBefore(due)) {
      const kd = alertKey(entry.id, 'DAY')
      if (!fired.has(kd)) out.push({ key: kd, entry, phase: 'DAY' })
    }
  }
  return out
}

export function isOverdue(entry: CalendarEntry, now: Dayjs): boolean {
  if (entry.status !== 'open') return false
  if (entry.time) return now.isAfter(entryInstant(entry))
  return entry.date < now.format('YYYY-MM-DD')
}

/**
 * Entries for the widget's list: open entries from today forward, plus open
 * overdue entries from the last OVERDUE_WINDOW_DAYS days.
 */
export function upcomingEntries(entries: CalendarEntry[], now: Dayjs, limit = 10): CalendarEntry[] {
  const floor = now.subtract(OVERDUE_WINDOW_DAYS, 'day').format('YYYY-MM-DD')
  return entries.filter(e => e.status === 'open' && e.date >= floor).slice(0, limit)
}

/** Next open entry whose due moment is still in the future. */
export function nextEntry(entries: CalendarEntry[], now: Dayjs): CalendarEntry | null {
  let best: CalendarEntry | null = null
  let bestAt = Infinity
  for (const e of entries) {
    if (e.status !== 'open') continue
    const at = e.time ? entryInstant(e).valueOf() : dayjs(e.date).endOf('day').valueOf()
    if (at <= now.valueOf()) continue
    const sortAt = entryInstant(e).valueOf()
    if (sortAt < bestAt) {
      best = e
      bestAt = sortAt
    }
  }
  return best
}

/** "T-02:14:05" under a day, "T-3D 04H" beyond. Negative -> "T+00:05:00". */
export function formatCountdown(ms: number): string {
  const sign = ms < 0 ? '+' : '-'
  let s = Math.floor(Math.abs(ms) / 1000)
  const d = Math.floor(s / 86400)
  s -= d * 86400
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  const p = (n: number) => String(n).padStart(2, '0')
  if (d > 0) return `T${sign}${d}D ${p(h)}H`
  return `T${sign}${p(h)}:${p(m)}:${p(s)}`
}

/** Short tactical reference for an entry, e.g. "A3F2". */
export function entryRef(id: string): string {
  return id.replace(/-/g, '').slice(-4).toUpperCase()
}

/** Calendar grid for a month, ISO weeks (Mon-first). Always 6 rows max. */
export function getMonthWeeks(year: number, month: number): Dayjs[][] {
  // Build from an explicit first-of-month — dayjs().month(n) overflows
  // when today's date doesn't exist in month n (e.g. Jan 31 -> Feb -> Mar 3).
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

export function alertPhaseLabel(phase: AlertPhase): string {
  switch (phase) {
    case 'T-15': return `T-${LEAD_MINUTES} MIN`
    case 'T-0': return 'T-0 · NOW'
    case 'DAY': return 'DAY OF'
  }
}

export function alertLogText(entry: CalendarEntry, phase: AlertPhase): string {
  const when = `${dayjs(entry.date).format('ddd D MMM').toUpperCase()}${entry.time ? ` ${militaryTime(entry.time)}` : ''}`
  return `[ALERT ${phase}] ${entry.type.toUpperCase()}: ${entry.text} (${when})`
}
