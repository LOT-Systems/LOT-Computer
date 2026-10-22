/**
 * Calendar engine — pure, side-effect free. All state is derived from Log
 * events so it survives reloads and syncs across devices:
 *   calendar_entry  metadata { date, time?, text, entryType }
 *   calendar_alert  metadata { entryId, stage }   (alert fired)
 *   calendar_ack    metadata { entryId, stage }   (alert acknowledged)
 *   calendar_done   metadata { entryId }
 *   calendar_cancel metadata { entryId }
 */

export type EntryType = 'note' | 'task' | 'call'
export type AlertStage = 'T-15' | 'T-0'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm, null = all-day
  text: string
  type: EntryType
  status: 'open' | 'done' | 'cancelled'
}

export type CalendarAlert = {
  key: string
  entry: CalendarEntry
  stage: AlertStage
}

type LogLike = {
  id?: string
  event?: string
  text?: string
  metadata?: Record<string, any> | null
}

export const ALL_DAY_ALERT_HOUR = 8
export const LEAD_MINUTES = 15
export const GRACE_MINUTES = 120
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const alertKey = (entryId: string, stage: AlertStage) => `${entryId}:${stage}`

export function isValidTime(t: string) {
  return TIME_RE.test(t)
}

export function parseEntries(logs: LogLike[]): CalendarEntry[] {
  const done = new Set<string>()
  const cancelled = new Set<string>()
  for (const l of logs) {
    const id = l.metadata?.entryId
    if (typeof id !== 'string') continue
    if (l.event === 'calendar_done') done.add(id)
    else if (l.event === 'calendar_cancel') cancelled.add(id)
  }

  const entries: CalendarEntry[] = []
  for (const l of logs) {
    if (l.event !== 'calendar_entry' || !l.metadata || !l.id) continue
    const date = l.metadata.date
    const text = (l.metadata.text as string) || l.text || ''
    if (typeof date !== 'string' || !DATE_RE.test(date) || !text) continue
    const rawTime = l.metadata.time
    entries.push({
      id: l.id,
      date,
      time: typeof rawTime === 'string' && TIME_RE.test(rawTime) ? rawTime : null,
      text,
      type: (l.metadata.entryType as EntryType) || 'note',
      status: cancelled.has(l.id) ? 'cancelled' : done.has(l.id) ? 'done' : 'open',
    })
  }

  return entries.sort(
    (a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? '')
  )
}

/** Event instant (local time). All-day entries trigger at ALL_DAY_ALERT_HOUR. */
export function entryMoment(e: CalendarEntry): Date {
  const [y, m, d] = e.date.split('-').map(Number)
  const [hh, mm] = e.time ? e.time.split(':').map(Number) : [ALL_DAY_ALERT_HOUR, 0]
  return new Date(y, m - 1, d, hh, mm, 0, 0)
}

/**
 * Alert stages that are due at `now`. Only the latest due stage per entry is
 * returned, so a late-opened page yields one alert, not a burst. Stages older
 * than GRACE_MINUTES past the event are dropped (no spam for the past).
 */
export function dueAlerts(
  entries: CalendarEntry[],
  now: Date,
  alreadyAlerted: Set<string>
): CalendarAlert[] {
  const out: CalendarAlert[] = []
  for (const entry of entries) {
    if (entry.status !== 'open') continue
    const at = entryMoment(entry).getTime()
    const t = now.getTime()
    if (t > at + GRACE_MINUTES * 60_000) continue
    const stages: [AlertStage, number][] = entry.time
      ? [['T-0', at], ['T-15', at - LEAD_MINUTES * 60_000]]
      : [['T-0', at]]
    const due = stages.find(([, when]) => t >= when)
    if (!due) continue
    const key = alertKey(entry.id, due[0])
    if (!alreadyAlerted.has(key)) out.push({ key, entry, stage: due[0] })
  }
  return out
}

/** Countdown label, e.g. "T-00:14:32" / "T+00:03:10". */
export function countdown(e: CalendarEntry, now: Date): string {
  const diff = Math.round((entryMoment(e).getTime() - now.getTime()) / 1000)
  const abs = Math.abs(diff)
  const h = String(Math.floor(abs / 3600)).padStart(2, '0')
  const m = String(Math.floor((abs % 3600) / 60)).padStart(2, '0')
  const s = String(abs % 60).padStart(2, '0')
  return `T${diff >= 0 ? '-' : '+'}${h}:${m}:${s}`
}
