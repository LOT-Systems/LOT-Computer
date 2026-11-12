/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar engine — pure, dependency-free.
 *
 * Logs are append-only (only `note` logs can be edited server-side), so the
 * calendar is event-sourced from three Log events:
 *
 *   calendar_entry   — an entry was scheduled. Entry id = the log id.
 *                      metadata: { date: 'YYYY-MM-DD', time?: 'HH:mm', text, entryType }
 *   calendar_status  — an entry changed state.
 *                      metadata: { entryId, status: 'done' | 'scrubbed' }
 *   calendar_alert   — an alert fired (dedupe across devices/tabs).
 *                      metadata: { entryId, stage: 'T-15' | 'T-0' }
 *
 * All times are interpreted in the viewer's local timezone.
 */

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'scheduled' | 'done' | 'scrubbed'
export type AlertStage = 'T-15' | 'T-0'

export const CALENDAR_EVENTS = ['calendar_entry', 'calendar_status', 'calendar_alert'] as const

/** Minimal log shape the engine needs (subset of the Log model). */
export type CalendarLogLike = {
  id: string
  event: string
  text?: string | null
  createdAt?: string | Date
  metadata?: Record<string, any> | null
}

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm, null = all-day
  text: string
  type: EntryType
  status: EntryStatus
  createdAt: number
  /** Epoch ms of the moment the entry is "due". All-day → ALL_DAY_ALERT_HOUR local. */
  dueAt: number
  alerts: Set<AlertStage>
}

/** All-day entries alert at 09:00 local on their date. */
export const ALL_DAY_ALERT_HOUR = 9
/** Lead time for the pre-alert on timed entries. */
export const PRE_ALERT_MS = 15 * 60 * 1000
/** A T-0 alert is still delivered if the app opens up to this long after due. */
export const LATE_GRACE_MS = 6 * 60 * 60 * 1000

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidDate(s: unknown): s is string {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

/** Accepts 'H:mm', 'HH:mm', 'HHmm', 'H', 'HH' → normalised 'HH:mm', or null. */
export function normalizeTime(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const s = input.trim()
  if (!s) return null
  let h: number
  let m: number
  const colon = s.match(/^(\d{1,2})[:.](\d{2})$/)
  const compact = s.match(/^(\d{1,2})(\d{2})$/)
  const hourOnly = s.match(/^(\d{1,2})$/)
  if (colon) {
    h = Number(colon[1]); m = Number(colon[2])
  } else if (compact && s.length >= 3) {
    h = Number(compact[1]); m = Number(compact[2])
  } else if (hourOnly) {
    h = Number(hourOnly[1]); m = 0
  } else {
    return null
  }
  if (h > 23 || m > 59) return null
  const out = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return TIME_RE.test(out) ? out : null
}

export function computeDueAt(date: string, time: string | null): number {
  const [y, mo, d] = date.split('-').map(Number)
  if (time) {
    const [h, mi] = time.split(':').map(Number)
    return new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
  }
  return new Date(y, mo - 1, d, ALL_DAY_ALERT_HOUR, 0, 0, 0).getTime()
}

function toMs(v: string | Date | undefined): number {
  if (!v) return 0
  const t = v instanceof Date ? v.getTime() : Date.parse(v)
  return Number.isFinite(t) ? t : 0
}

/**
 * Fold calendar logs into entries. Order-independent: status events are
 * applied by createdAt, latest wins. Unknown/malformed logs are ignored.
 */
export function buildCalendar(logs: CalendarLogLike[]): CalendarEntry[] {
  const byId = new Map<string, CalendarEntry>()
  const statuses: { entryId: string; status: EntryStatus; at: number }[] = []
  const alerts: { entryId: string; stage: AlertStage }[] = []

  for (const log of logs) {
    if (!log || !log.event) continue
    const md = log.metadata || {}
    if (log.event === 'calendar_entry') {
      const date = md.date
      const text = String(md.text || log.text || '').trim()
      if (!isValidDate(date) || !text) continue
      const time = normalizeTime(md.time)
      const type: EntryType = md.entryType === 'task' || md.entryType === 'call' ? md.entryType : 'note'
      byId.set(log.id, {
        id: log.id,
        date,
        time,
        text,
        type,
        status: 'scheduled',
        createdAt: toMs(log.createdAt),
        dueAt: computeDueAt(date, time),
        alerts: new Set(),
      })
    } else if (log.event === 'calendar_status') {
      if (typeof md.entryId !== 'string') continue
      const status = md.status
      if (status !== 'done' && status !== 'scrubbed' && status !== 'scheduled') continue
      statuses.push({ entryId: md.entryId, status, at: toMs(log.createdAt) })
    } else if (log.event === 'calendar_alert') {
      if (typeof md.entryId !== 'string') continue
      if (md.stage !== 'T-15' && md.stage !== 'T-0') continue
      alerts.push({ entryId: md.entryId, stage: md.stage })
    }
  }

  statuses.sort((a, b) => a.at - b.at)
  for (const s of statuses) {
    const e = byId.get(s.entryId)
    if (e) e.status = s.status
  }
  for (const a of alerts) {
    const e = byId.get(a.entryId)
    if (e) e.alerts.add(a.stage)
  }

  return Array.from(byId.values()).sort(compareEntries)
}

export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  // All-day entries first within a day, then by time, then by creation.
  if (a.time !== b.time) {
    if (a.time === null) return -1
    if (b.time === null) return 1
    return a.time < b.time ? -1 : 1
  }
  return a.createdAt - b.createdAt
}

export function localDateKey(now: number): string {
  const d = new Date(now)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Active entries that are today or later (timed entries today stay until done/scrubbed). */
export function upcoming(entries: CalendarEntry[], now: number): CalendarEntry[] {
  const today = localDateKey(now)
  return entries.filter(e => e.status === 'scheduled' && e.date >= today)
}

/** Scheduled entries whose due moment has passed by more than the grace window. */
export function overdue(entries: CalendarEntry[], now: number): CalendarEntry[] {
  const today = localDateKey(now)
  return entries.filter(e => e.status === 'scheduled' && e.date < today)
}

/**
 * Which alert (if any) should fire right now for this entry.
 * - Timed entries: T-15 inside [due-15m, due), T-0 inside [due, due+grace].
 * - All-day entries: only T-0 (at 09:00 local), same grace window.
 * Never fires for an alert stage already logged, or a closed entry.
 * If T-0 is due, a pending T-15 is skipped (no double-ping).
 */
export function pendingAlert(entry: CalendarEntry, now: number): AlertStage | null {
  if (entry.status !== 'scheduled') return null
  const due = entry.dueAt
  if (now >= due && now <= due + LATE_GRACE_MS) {
    return entry.alerts.has('T-0') ? null : 'T-0'
  }
  if (entry.time && now >= due - PRE_ALERT_MS && now < due) {
    return entry.alerts.has('T-15') || entry.alerts.has('T-0') ? null : 'T-15'
  }
  return null
}

/** Milliseconds until the next moment any entry could change alert state. */
export function nextAlertBoundary(entries: CalendarEntry[], now: number): number | null {
  let best: number | null = null
  for (const e of entries) {
    if (e.status !== 'scheduled') continue
    const marks = e.time ? [e.dueAt - PRE_ALERT_MS, e.dueAt] : [e.dueAt]
    for (const m of marks) {
      if (m > now && (best === null || m - now < best)) best = m - now
    }
  }
  return best
}

/** Compact military countdown: T-2D 04H · T-03:12:09 · T+00:04:10 */
export function formatCountdown(dueAt: number, now: number): string {
  const diff = dueAt - now
  const sign = diff >= 0 ? '-' : '+'
  const abs = Math.abs(diff)
  const totalSec = Math.floor(abs / 1000)
  const days = Math.floor(totalSec / 86400)
  const hrs = Math.floor((totalSec % 86400) / 3600)
  const min = Math.floor((totalSec % 3600) / 60)
  const sec = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (days >= 1) return `T${sign}${days}D ${pad(hrs)}H`
  return `T${sign}${pad(hrs)}:${pad(min)}:${pad(sec)}`
}

/** 24h "Zulu-style" local time stamp: 1430L */
export function formatMilTime(time: string | null): string {
  if (!time) return 'ALL-DAY'
  return `${time.replace(':', '')}L`
}

export const TYPE_CODE: Record<EntryType, string> = {
  note: 'NTE',
  task: 'TSK',
  call: 'CLL',
}
