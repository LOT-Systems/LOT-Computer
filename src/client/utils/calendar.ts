/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar core — pure functions, no React.
 *
 * Event model (all stored in the user's Log, append-only):
 *   calendar_entry  { date: 'YYYY-MM-DD', time?: 'HH:mm', text, entryType, lead? }
 *   calendar_status { entryId, status: 'done' | 'cancelled' | 'active', date, time?, text, entryType }
 *   calendar_alert  { entryId, phase: 'lead' | 'zero' | 'day', date, time?, text, entryType, lead? }
 *
 * The latest calendar_status per entry wins. Alerts are fired at most once per
 * (entryId, phase) — deduped against calendar_alert logs (cross-device) and a
 * local ledger (same device, before the log round-trips).
 */

import dayjs from '#client/utils/dayjs'

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'active' | 'done' | 'cancelled'
export type AlertPhase = 'lead' | 'zero' | 'day'

export type CalendarLog = {
  id: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string
}

export type CalendarEntry = {
  id: string
  date: string
  time: string | null
  text: string
  type: EntryType
  lead: number
  status: EntryStatus
  createdAt: string
}

export type CalendarAlert = {
  key: string
  entry: CalendarEntry
  phase: AlertPhase
  /** Minutes relative to the entry time at the moment of firing (negative = before). */
  offset: number
  firedAt: number
}

export const ENTRY_TYPES: EntryType[] = ['note', 'task', 'call']
export const DEFAULT_LEAD_MIN = 10
export const LEAD_OPTIONS = [0, 5, 10, 15, 30, 60]
/** A T-0 alert still fires if the app opens up to this many minutes late. */
export const LATE_GRACE_MIN = 30
/** Untimed entries get a day-of briefing after this local hour. */
export const DAY_BRIEF_HOUR = 7

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidDate(s: unknown): s is string {
  return typeof s === 'string' && DATE_RE.test(s) && dayjs(s).isValid()
}

export function isValidTime(s: unknown): s is string {
  return typeof s === 'string' && TIME_RE.test(s)
}

/** Accepts '9', '930', '0930', '9:30', '09.30', '21h' — returns 'HH:mm' or null. */
export function normalizeTime(raw: string): string | null {
  const s = raw.trim().toLowerCase().replace(/h$/, '')
  if (!s) return null
  let h: number
  let m: number
  const sep = s.match(/^(\d{1,2})[:.](\d{2})$/)
  if (sep) {
    h = +sep[1]
    m = +sep[2]
  } else if (/^\d{1,4}$/.test(s)) {
    if (s.length <= 2) { h = +s; m = 0 }
    else { h = +s.slice(0, s.length - 2); m = +s.slice(-2) }
  } else {
    return null
  }
  if (h > 23 || m > 59) return null
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function deriveEntries(logs: CalendarLog[]): CalendarEntry[] {
  const statusById = new Map<string, { status: EntryStatus; at: string }>()
  for (const l of logs) {
    if (l.event !== 'calendar_status') continue
    const id = l.metadata?.entryId
    const status = l.metadata?.status
    if (!id || !['active', 'done', 'cancelled'].includes(status)) continue
    const prev = statusById.get(id)
    if (!prev || l.createdAt > prev.at) statusById.set(id, { status, at: l.createdAt })
  }

  const entries: CalendarEntry[] = []
  for (const l of logs) {
    if (l.event !== 'calendar_entry' || !l.metadata) continue
    const date = l.metadata.date
    const text = (l.metadata.text as string) || l.text || ''
    if (!isValidDate(date) || !text) continue
    const type: EntryType = ENTRY_TYPES.includes(l.metadata.entryType) ? l.metadata.entryType : 'note'
    const time = isValidTime(l.metadata.time) ? l.metadata.time : null
    const lead = Number.isFinite(l.metadata.lead) ? Math.max(0, Math.min(1440, l.metadata.lead)) : DEFAULT_LEAD_MIN
    entries.push({
      id: l.id,
      date,
      time,
      text,
      type,
      lead,
      status: statusById.get(l.id)?.status || 'active',
      createdAt: l.createdAt,
    })
  }
  return entries.sort(compareEntries)
}

/** Chronological: by date; within a day, untimed (all-day) entries first, then by time. */
export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  const at = a.time ?? ''
  const bt = b.time ?? ''
  if (at !== bt) return at < bt ? -1 : 1
  return a.createdAt < b.createdAt ? -1 : 1
}

export function entryMoment(e: Pick<CalendarEntry, 'date' | 'time'>) {
  return dayjs(`${e.date}T${e.time ?? '00:00'}:00`)
}

export function alertKey(entryId: string, phase: AlertPhase) {
  return `${entryId}:${phase}`
}

export function firedKeysFromLogs(logs: CalendarLog[]): Set<string> {
  const set = new Set<string>()
  for (const l of logs) {
    if (l.event !== 'calendar_alert') continue
    const id = l.metadata?.entryId
    const phase = l.metadata?.phase
    if (id && phase) set.add(alertKey(id, phase))
  }
  return set
}

/**
 * Which alerts are due at `now`? Only active entries. Each phase fires inside a
 * window so a briefly closed tab still catches up, but stale alerts never spam:
 *   lead — from T-lead until T-0 (skipped when lead = 0)
 *   zero — from T-0 until T+LATE_GRACE_MIN
 *   day  — untimed entries, on their date after DAY_BRIEF_HOUR
 * When both lead and zero are due (app opened late), only zero fires.
 */
export function dueAlerts(entries: CalendarEntry[], now: Date, fired: Set<string>): CalendarAlert[] {
  const out: CalendarAlert[] = []
  const nowMs = now.getTime()
  const todayKey = dayjs(now).format('YYYY-MM-DD')

  for (const e of entries) {
    if (e.status !== 'active') continue

    if (!e.time) {
      if (e.date !== todayKey || now.getHours() < DAY_BRIEF_HOUR) continue
      const key = alertKey(e.id, 'day')
      if (!fired.has(key)) out.push({ key, entry: e, phase: 'day', offset: 0, firedAt: nowMs })
      continue
    }

    const t = entryMoment(e).valueOf()
    const diffMin = (nowMs - t) / 60000
    if (diffMin < -e.lead - 0.01 || diffMin > LATE_GRACE_MIN) continue

    const zeroKey = alertKey(e.id, 'zero')
    const leadKey = alertKey(e.id, 'lead')
    if (diffMin >= 0) {
      if (!fired.has(zeroKey)) out.push({ key: zeroKey, entry: e, phase: 'zero', offset: Math.floor(diffMin), firedAt: nowMs })
    } else if (e.lead > 0 && !fired.has(leadKey) && !fired.has(zeroKey)) {
      out.push({ key: leadKey, entry: e, phase: 'lead', offset: -Math.ceil(-diffMin), firedAt: nowMs })
    }
  }
  return out
}

/** Next moment (ms) any alert could become due — lets the scheduler sleep precisely. */
export function nextAlertAt(entries: CalendarEntry[], now: Date, fired: Set<string>): number | null {
  const nowMs = now.getTime()
  let best: number | null = null
  const consider = (t: number) => { if (t > nowMs && (best === null || t < best)) best = t }
  for (const e of entries) {
    if (e.status !== 'active') continue
    if (!e.time) {
      if (!fired.has(alertKey(e.id, 'day'))) consider(dayjs(e.date).hour(DAY_BRIEF_HOUR).valueOf())
      continue
    }
    const t = entryMoment(e).valueOf()
    if (e.lead > 0 && !fired.has(alertKey(e.id, 'lead'))) consider(t - e.lead * 60000)
    if (!fired.has(alertKey(e.id, 'zero'))) consider(t)
  }
  return best
}

/** 'T-09:59' / 'T-00:00' / 'T+03:12' — mm:ss when under an hour, hh:mm otherwise. */
export function formatCountdown(targetMs: number, nowMs: number): string {
  const diff = targetMs - nowMs
  const sign = diff >= 0 ? '-' : '+'
  const abs = Math.abs(diff)
  const totalSec = Math.floor(abs / 1000)
  if (totalSec < 3600) {
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `T${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  return `T${sign}${String(h).padStart(2, '0')}H${String(m).padStart(2, '0')}`
}

export function phaseLabel(phase: AlertPhase): string {
  return phase === 'lead' ? 'STANDBY' : phase === 'zero' ? 'EXECUTE' : 'BRIEF'
}

export function alertLogText(a: CalendarAlert): string {
  const e = a.entry
  const when = e.time ? `${e.date} ${e.time}` : e.date
  const offset = a.phase === 'day' ? 'DAY-OF' : a.offset === 0 ? 'T-0' : a.offset < 0 ? `T${a.offset}m` : `T+${a.offset}m`
  return `[CAL-ALERT] ${phaseLabel(a.phase)} ${offset} · ${e.type.toUpperCase()}: ${e.text} (${when})`
}

// ── Local ledger: same-device dedupe before the alert log round-trips ──────
const LEDGER_KEY = 'lot.calendar.alerts.v1'
const LEDGER_MAX = 400

export function readLedger(): Set<string> {
  try {
    const raw = localStorage.getItem(LEDGER_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

export function writeLedger(keys: Set<string>) {
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(Array.from(keys).slice(-LEDGER_MAX)))
  } catch {}
}

const SYS_NOTIFY_KEY = 'lot.calendar.sysnotify'

export function readSysNotify(): boolean {
  try { return localStorage.getItem(SYS_NOTIFY_KEY) === '1' } catch { return false }
}

export function writeSysNotify(on: boolean) {
  try { localStorage.setItem(SYS_NOTIFY_KEY, on ? '1' : '0') } catch {}
}
