/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar engine — pure logic (no React, no network).
 *
 * Source of truth is the Log stream:
 *   calendar_entry   metadata { id, date, time?, text, entryType }
 *   calendar_alert   metadata { entryId, stage }
 *   calendar_done    metadata { entryId }
 *   calendar_cancel  metadata { entryId }
 * Entry state is folded from those events, so every state change is auditable.
 */

import dayjs from '#client/utils/dayjs'
import type { Log } from '#shared/types'

export type EntryType = 'note' | 'task' | 'call'
export type AlertStage = 'warn' | 'now' | 'missed'
export type EntryStatus = 'open' | 'done' | 'cancelled'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm, null = all-day
  text: string
  type: EntryType
  status: EntryStatus
  alerts: AlertStage[]
}

export const CALENDAR_EVENTS = [
  'calendar_entry',
  'calendar_alert',
  'calendar_done',
  'calendar_cancel',
] as const

export const WARN_LEAD_MIN = 15
export const MISSED_AFTER_MIN = 30
export const ALL_DAY_HOUR = 8 // all-day entries alert at 08:00 local
const STALE_AFTER_HOURS = 24 // never alert on entries older than this

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export const isValidTime = (t: string | null | undefined): t is string =>
  !!t && TIME_RE.test(t)

export function newEntryId(): string {
  return `cal_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

/** Local due moment. All-day entries are due at ALL_DAY_HOUR:00. */
export function getDue(e: Pick<CalendarEntry, 'date' | 'time'>) {
  const t = e.time ?? `${String(ALL_DAY_HOUR).padStart(2, '0')}:00`
  return dayjs(`${e.date} ${t}`, 'YYYY-MM-DD HH:mm')
}

/** Fold calendar_* log events into current entries. Order-independent. */
export function foldEntries(logs: Pick<Log, 'id' | 'event' | 'metadata' | 'text'>[]): CalendarEntry[] {
  const byId = new Map<string, CalendarEntry>()
  const done = new Set<string>()
  const cancelled = new Set<string>()
  const alerts = new Map<string, Set<AlertStage>>()

  for (const log of logs) {
    const m = log.metadata || {}
    if (log.event === 'calendar_entry') {
      const date = m.date as string | undefined
      const text = ((m.text as string) || log.text || '').trim()
      if (!date || !text) continue
      const id = (m.id as string) || log.id // legacy entries have no id
      byId.set(id, {
        id,
        date,
        time: isValidTime(m.time) ? m.time : null,
        text,
        type: (m.entryType as EntryType) || 'note',
        status: 'open',
        alerts: [],
      })
    } else if (log.event === 'calendar_done' && m.entryId) {
      done.add(m.entryId)
    } else if (log.event === 'calendar_cancel' && m.entryId) {
      cancelled.add(m.entryId)
    } else if (log.event === 'calendar_alert' && m.entryId && m.stage) {
      if (!alerts.has(m.entryId)) alerts.set(m.entryId, new Set())
      alerts.get(m.entryId)!.add(m.stage)
    }
  }

  const out: CalendarEntry[] = []
  byId.forEach((e, id) => {
    e.status = cancelled.has(id) ? 'cancelled' : done.has(id) ? 'done' : 'open'
    e.alerts = Array.from(alerts.get(id) ?? [])
    out.push(e)
  })
  return out.sort((a, b) =>
    (a.date + (a.time ?? '00:00')).localeCompare(b.date + (b.time ?? '00:00'))
  )
}

/**
 * The single alert stage an entry is currently in, or null.
 * Only the latest eligible stage is returned, so reopening the app after a
 * long absence yields one alert per entry (not a backlog burst).
 */
export function currentStage(e: CalendarEntry, now = dayjs()): AlertStage | null {
  if (e.status !== 'open') return null
  const minsToDue = getDue(e).diff(now, 'minute', true)
  if (minsToDue < -STALE_AFTER_HOURS * 60) return null
  if (minsToDue <= -MISSED_AFTER_MIN) return 'missed'
  if (minsToDue <= 0) return 'now'
  // all-day entries have no lead warning, they simply open the day
  if (e.time && minsToDue <= WARN_LEAD_MIN) return 'warn'
  return null
}

/** Alerts that should be fired right now (stage reached, not yet fired). */
export function pendingAlerts(
  entries: CalendarEntry[],
  fired: Set<string>,
  now = dayjs()
): { entry: CalendarEntry; stage: AlertStage }[] {
  const out: { entry: CalendarEntry; stage: AlertStage }[] = []
  for (const entry of entries) {
    const stage = currentStage(entry, now)
    if (!stage) continue
    if (entry.alerts.includes(stage) || fired.has(`${entry.id}:${stage}`)) continue
    out.push({ entry, stage })
  }
  return out
}

/** T-minus / T-plus string, e.g. "T-00:15", "T+01:05", "T-2D". */
export function formatCountdown(e: Pick<CalendarEntry, 'date' | 'time'>, now = dayjs()): string {
  const mins = Math.round(getDue(e).diff(now, 'minute', true))
  const sign = mins >= 0 ? '-' : '+'
  const abs = Math.abs(mins)
  if (abs >= 48 * 60) return `T${sign}${Math.floor(abs / 1440)}D`
  const h = String(Math.floor(abs / 60)).padStart(2, '0')
  const m = String(abs % 60).padStart(2, '0')
  return `T${sign}${h}:${m}`
}

export const STAGE_LABEL: Record<AlertStage, string> = {
  warn: 'STANDBY',
  now: 'EXECUTE',
  missed: 'MISSED',
}

/** Compact log line for the Log stream. */
export function alertLogText(e: CalendarEntry, stage: AlertStage): string {
  return `[SCHEDULE] ${STAGE_LABEL[stage]} ${e.type.toUpperCase()}: ${e.text} (${e.date}${e.time ? ' ' + e.time : ''})`
}

// --- fired-alert dedupe (survives reload, shared across tabs) -------------

const FIRED_KEY = 'lot_calendar_fired'

export function loadFired(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(FIRED_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

export function markFired(key: string): void {
  try {
    const set = loadFired()
    set.add(key)
    // keep the newest 300 keys
    localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(set).slice(-300)))
  } catch {
    /* storage unavailable: server-side alert logs still dedupe after refetch */
  }
}
