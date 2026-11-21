/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar core — pure, side-effect-free logic shared by the Calendar widget
 * and the app-wide alert watcher.
 *
 * Storage model (all rows live in the Log table, so everything is logged):
 *   calendar_entry   metadata { date: 'YYYY-MM-DD', time?: 'HH:mm', text, entryType }
 *   calendar_status  metadata { refId, status: 'done' | 'cancelled' | 'open', date, time?, text, entryType }
 *   calendar_alert   metadata { refId, phase: AlertPhase, date, time?, text, entryType }
 *
 * The entry's id is the id of its calendar_entry log row. The latest
 * calendar_status row for a refId wins. All dates/times are the user's local
 * wall clock.
 */

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
export type AlertPhase = 'T-15' | 'T-0' | 'DAY'

export const ENTRY_TYPES: EntryType[] = ['note', 'task', 'call']
export const CALENDAR_EVENTS = ['calendar_entry', 'calendar_status', 'calendar_alert'] as const

export const LEAD_MINUTES = 15
/** How long after T-0 the "on time" alert may still fire (e.g. tab was asleep). */
export const T0_GRACE_MS = 30 * 60 * 1000
/** Untimed (all-day) entries alert at this local hour on their date. */
export const DAY_ALERT_HOUR = 9

export type CalendarLogLike = {
  id: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string | Date
}

export type CalendarEntry = {
  id: string
  date: string
  time: string | null
  text: string
  type: EntryType
  status: EntryStatus
  createdAt: number
  /** Epoch ms of the moment the entry is "due": date+time, or start of day for untimed. */
  at: number
}

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

/** Local-time epoch ms for a 'YYYY-MM-DD' + optional 'HH:mm'. */
export function toEpoch(date: string, time?: string | null): number {
  const [y, m, d] = date.split('-').map(Number)
  let hh = 0
  let mm = 0
  if (time && isValidTime(time)) {
    ;[hh, mm] = time.split(':').map(Number)
  }
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
}

export function toDateKey(t: number | Date): string {
  const d = typeof t === 'number' ? new Date(t) : t
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ms(v: string | Date): number {
  return typeof v === 'string' ? new Date(v).getTime() : v.getTime()
}

/** Fold raw calendar log rows into the current list of entries. */
export function buildEntries(logs: CalendarLogLike[]): CalendarEntry[] {
  const statusByRef = new Map<string, { status: EntryStatus; at: number }>()
  for (const log of logs) {
    if (log.event !== 'calendar_status') continue
    const refId = log.metadata?.refId
    const status = log.metadata?.status
    if (typeof refId !== 'string') continue
    if (status !== 'done' && status !== 'cancelled' && status !== 'open') continue
    const at = ms(log.createdAt)
    const prev = statusByRef.get(refId)
    if (!prev || at >= prev.at) statusByRef.set(refId, { status, at })
  }

  const entries: CalendarEntry[] = []
  for (const log of logs) {
    if (log.event !== 'calendar_entry') continue
    const md = log.metadata || {}
    const date = md.date
    const text = (typeof md.text === 'string' && md.text) || log.text || ''
    if (!isValidDate(date) || !text) continue
    const time = isValidTime(md.time) ? md.time : null
    const type: EntryType = ENTRY_TYPES.includes(md.entryType) ? md.entryType : 'note'
    entries.push({
      id: log.id,
      date,
      time,
      text,
      type,
      status: statusByRef.get(log.id)?.status ?? 'open',
      createdAt: ms(log.createdAt),
      at: toEpoch(date, time),
    })
  }

  return entries.sort(compareEntries)
}

/** Chronological: date, then timed entries (by time) before all-day ones, then creation. */
export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  if (a.time && b.time && a.time !== b.time) return a.time < b.time ? -1 : 1
  if (a.time && !b.time) return -1
  if (!a.time && b.time) return 1
  return a.createdAt - b.createdAt
}

/** An open entry is overdue once its due moment (timed) or its whole day (untimed) has passed. */
export function isOverdue(e: CalendarEntry, now: number): boolean {
  if (e.status !== 'open') return false
  if (e.time) return now >= e.at + T0_GRACE_MS
  return e.date < toDateKey(now)
}

export function isUpcoming(e: CalendarEntry, now: number): boolean {
  return e.status === 'open' && !isOverdue(e, now)
}

export function alertKey(refId: string, phase: AlertPhase): string {
  return `${refId}:${phase}`
}

/** Keys of alerts already recorded server-side (cross-device dedupe). */
export function firedAlertKeys(logs: CalendarLogLike[]): Set<string> {
  const set = new Set<string>()
  for (const log of logs) {
    if (log.event !== 'calendar_alert') continue
    const refId = log.metadata?.refId
    const phase = log.metadata?.phase
    if (typeof refId === 'string' && typeof phase === 'string') {
      set.add(`${refId}:${phase}`)
    }
  }
  return set
}

export type AlertWindow = { phase: AlertPhase; start: number; end: number }

/** The alert windows an entry owns. An alert fires only while `now` is inside its window. */
export function alertWindows(e: CalendarEntry): AlertWindow[] {
  if (e.time) {
    const lead = e.at - LEAD_MINUTES * 60 * 1000
    const out: AlertWindow[] = []
    // Skip the lead alert when the entry was created inside the lead window —
    // the operator just scheduled it and does not need to be told about it.
    if (e.createdAt < lead) out.push({ phase: 'T-15', start: lead, end: e.at })
    out.push({ phase: 'T-0', start: e.at, end: e.at + T0_GRACE_MS })
    return out
  }
  const start = e.at + DAY_ALERT_HOUR * 60 * 60 * 1000
  const end = e.at + 24 * 60 * 60 * 1000
  if (e.createdAt >= start) return []
  return [{ phase: 'DAY', start, end }]
}

export type DueAlert = { entry: CalendarEntry; phase: AlertPhase; key: string }

/**
 * Alerts that should fire right now. Only the most advanced phase per entry is
 * returned, so a tab waking at T+2 shows T-0, not a stale T-15 as well.
 */
export function dueAlerts(
  entries: CalendarEntry[],
  now: number,
  fired: Set<string>
): DueAlert[] {
  const out: DueAlert[] = []
  for (const e of entries) {
    if (e.status !== 'open') continue
    const windows = alertWindows(e).filter(w => now >= w.start && now < w.end)
    const w = windows[windows.length - 1]
    if (!w) continue
    const key = alertKey(e.id, w.phase)
    if (fired.has(key)) continue
    out.push({ entry: e, phase: w.phase, key })
  }
  return out
}

/** Next moment (epoch ms) at which some open entry's alert window opens, or null. */
export function nextAlertAt(entries: CalendarEntry[], now: number): number | null {
  let best: number | null = null
  for (const e of entries) {
    if (e.status !== 'open') continue
    for (const w of alertWindows(e)) {
      if (w.start > now && (best === null || w.start < best)) best = w.start
    }
  }
  return best
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Military-style countdown.
 *   ≥ 1 day   → "T-3D 04H"
 *   < 1 day   → "T-04:12:09"
 *   past      → "T+00:02:11" / "T+2D 01H"
 */
export function formatCountdown(targetMs: number, now: number): string {
  const diff = targetMs - now
  const sign = diff >= 0 ? '-' : '+'
  const abs = Math.abs(diff)
  const totalSec = Math.floor(abs / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  if (days >= 1) return `T${sign}${days}D ${pad(hours)}H`
  return `T${sign}${pad(hours)}:${pad(mins)}:${pad(secs)}`
}

export const PRIORITY: Record<EntryType, string> = {
  call: 'PRI-1',
  task: 'PRI-2',
  note: 'PRI-3',
}

export const PHASE_LABEL: Record<AlertPhase, string> = {
  'T-15': `T-MINUS ${LEAD_MINUTES} MIN`,
  'T-0': 'ON TIME',
  DAY: 'DAY OF',
}

export function describeEntry(e: Pick<CalendarEntry, 'type' | 'text' | 'time'>): string {
  return `${e.type}: ${e.text}${e.time ? ` @ ${e.time}` : ''}`
}
