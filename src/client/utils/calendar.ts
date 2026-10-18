/**
 * Calendar engine — pure helpers for time tracking and alert staging.
 * No React, no I/O: the widget feeds in entries + clock, gets stages back.
 */

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
export type AlertStage = 'T-15' | 'T-05' | 'T-00' | 'MISSED'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm, optional (untimed entries never alert)
  text: string
  type: EntryType
  status: EntryStatus
}

// Stages in firing order; offset = minutes before start when the stage opens.
const STAGES: { stage: AlertStage; offset: number }[] = [
  { stage: 'T-15', offset: 15 },
  { stage: 'T-05', offset: 5 },
  { stage: 'T-00', offset: 0 },
]

// After this many minutes past start an unacknowledged entry is MISSED.
export const MISSED_AFTER_MIN = 5
// Entries older than this are history, not alerts (avoids a flood on first load).
export const ALERT_WINDOW_MIN = 12 * 60

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function newEntryId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

/** Local start timestamp (ms) of an entry, or null when untimed/invalid. */
export function entryStartMs(e: Pick<CalendarEntry, 'date' | 'time'>): number | null {
  if (!e.time || !TIME_RE.test(e.time)) return null
  const [y, m, d] = e.date.split('-').map(Number)
  const [hh, mm] = e.time.split(':').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
}

/** Minutes until start (negative once started). */
export function minutesUntil(e: CalendarEntry, nowMs: number): number | null {
  const start = entryStartMs(e)
  return start === null ? null : (start - nowMs) / 60000
}

/**
 * The single stage an entry should currently be in, or null.
 * Only the latest applicable stage is returned so a late load fires one alert, not three.
 */
export function currentStage(e: CalendarEntry, nowMs: number): AlertStage | null {
  if (e.status !== 'open') return null
  const mins = minutesUntil(e, nowMs)
  if (mins === null) return null
  if (mins < -ALERT_WINDOW_MIN) return null
  if (mins <= -MISSED_AFTER_MIN) return 'MISSED'
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (mins <= STAGES[i].offset) return STAGES[i].stage
  }
  return null
}

/** Compact countdown: "T-14:32", "T+03:10" or "T-2h05". */
export function formatCountdown(mins: number): string {
  const sign = mins >= 0 ? '-' : '+'
  const abs = Math.abs(mins)
  if (abs >= 60) {
    const h = Math.floor(abs / 60)
    const m = Math.floor(abs % 60)
    return `T${sign}${h}h${String(m).padStart(2, '0')}`
  }
  const m = Math.floor(abs)
  const s = Math.floor((abs - m) * 60)
  return `T${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function alertKey(entryId: string, stage: AlertStage): string {
  return `${entryId}:${stage}`
}

/** Military-style single line: "T-05 // CALL // 14:30 // text". */
export function formatAlertLine(e: CalendarEntry, stage: AlertStage): string {
  return `${stage} // ${e.type.toUpperCase()} // ${e.time} // ${e.text}`
}

/** Sort key: date, then time (untimed first within a day), then text. */
export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  return (
    a.date.localeCompare(b.date) ||
    (a.time || '').localeCompare(b.time || '') ||
    a.text.localeCompare(b.text)
  )
}

type RawLog = { id?: string; event?: string; text?: string; metadata?: any }

/**
 * Rebuild entries from raw logs. Dedupes by entry id (legacy entries without
 * one fall back to a date+type+text key) and applies the latest status event.
 */
export function buildEntries(logs: RawLog[]): CalendarEntry[] {
  const byId = new Map<string, CalendarEntry>()
  const status = new Map<string, EntryStatus>()

  // /api/logs is newest-first; walk oldest-first so later status events win.
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i]
    const md = log.metadata
    if (!md) continue
    if (log.event === 'calendar_entry') {
      const date = md.date as string
      const text = ((md.text as string) || log.text || '').trim()
      if (!date || !text) continue
      const type = (md.entryType as EntryType) || 'note'
      const time = TIME_RE.test(md.time || '') ? (md.time as string) : undefined
      const id = (md.entryId as string) || `legacy:${date}:${type}:${text}`
      if (!byId.has(id)) byId.set(id, { id, date, time, text, type, status: 'open' })
    } else if (log.event === 'calendar_status' && md.entryId) {
      if (md.status === 'done' || md.status === 'cancelled' || md.status === 'open') {
        status.set(md.entryId as string, md.status)
      }
    }
  }

  const out = Array.from(byId.values()).map(e => ({ ...e, status: status.get(e.id) || e.status }))
  return out.sort(compareEntries)
}

/** Alert keys already recorded in the log. */
export function loggedAlertKeys(logs: RawLog[]): Set<string> {
  const set = new Set<string>()
  for (const log of logs) {
    if (log.event === 'calendar_alert' && log.metadata?.entryId && log.metadata?.stage) {
      set.add(alertKey(log.metadata.entryId, log.metadata.stage))
    }
  }
  return set
}
