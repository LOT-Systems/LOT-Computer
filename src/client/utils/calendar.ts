/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar core — pure, framework-free logic.
 *
 * The calendar is event-sourced from the Log:
 *   calendar_entry         → an entry was scheduled     { id, date, time?, text, entryType, lead? }
 *   calendar_entry_status  → an entry changed state     { entryId, status }
 *   calendar_alert         → an alert fired for entry   { entryId, stage, ... }
 *
 * Folding those three streams yields the current calendar state. Nothing here
 * touches React, the network, or the DOM — so every rule (alert windows,
 * dedupe, ordering, DTG formatting) is deterministic and testable.
 */

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'active' | 'done' | 'cancelled'

/**
 * Alert stages, named after military message precedence:
 *   ROUTINE  — all-day entry, morning briefing on the day
 *   PRIORITY — timed entry, T-minus lead window (default 15 min)
 *   FLASH    — timed entry, T-0 (event time reached)
 */
export type AlertStage = 'ROUTINE' | 'PRIORITY' | 'FLASH'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD (local)
  time: string | null // HH:mm (local, 24h) or null for all-day
  text: string
  type: EntryType
  lead: number // minutes before `time` for the PRIORITY alert
  status: EntryStatus
  createdAt: string
}

export type CalendarAlert = {
  key: string // `${entryId}:${stage}` — dedupe key
  entryId: string
  stage: AlertStage
  entry: CalendarEntry
  at: number // epoch ms the stage window opened
}

export type CalendarLogLike = {
  id: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string | Date
}

export const CALENDAR_EVENTS = [
  'calendar_entry',
  'calendar_entry_status',
  'calendar_alert',
] as const

export const DEFAULT_LEAD_MIN = 15
/** FLASH stays eligible for this long after T-0 (catches a late app open). */
export const FLASH_GRACE_MIN = 30
/** ROUTINE briefing for all-day entries opens at this local hour. */
export const ROUTINE_HOUR = 8

const ENTRY_TYPES: EntryType[] = ['note', 'task', 'call']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const pad2 = (n: number) => String(n).padStart(2, '0')

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
 * Parse loose operator input into HH:mm.
 * Accepts "1430", "14:30", "930", "9:30", "9", "14", "2pm", "2:30pm", "12am".
 * Returns null for empty input and undefined for invalid input.
 */
export function parseTimeInput(raw: string): string | null | undefined {
  const s = (raw || '').trim().toLowerCase().replace(/\s+/g, '')
  if (!s) return null
  const m = s.match(/^(\d{1,2})(?::?(\d{2}))?(am|pm|a|p)?$/)
  if (!m) return undefined
  let h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  const mer = m[3]
  if (mer) {
    if (h < 1 || h > 12) return undefined
    const pm = mer.startsWith('p')
    if (h === 12) h = pm ? 12 : 0
    else if (pm) h += 12
  }
  if (h > 23 || min > 59) return undefined
  return `${pad2(h)}:${pad2(min)}`
}

/** Local epoch ms for YYYY-MM-DD + HH:mm. */
export function entryMoment(date: string, time: string | null, fallbackHour = 0): number {
  const [y, m, d] = date.split('-').map(Number)
  if (time) {
    const [hh, mm] = time.split(':').map(Number)
    return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
  }
  return new Date(y, m - 1, d, fallbackHour, 0, 0, 0).getTime()
}

export function newEntryId(): string {
  try {
    const c: any = (globalThis as any).crypto
    if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  } catch (_) {}
  return 'cal-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

/**
 * Fold calendar logs into entries + the set of alert keys already fired.
 * Order-independent: logs are sorted by createdAt before folding.
 * Legacy entries (pre-v2, no metadata.id) use the log id as their entry id.
 */
export function foldCalendar(logs: CalendarLogLike[]): {
  entries: CalendarEntry[]
  firedAlerts: Set<string>
} {
  const sorted = [...logs]
    .filter(l => l && (CALENDAR_EVENTS as readonly string[]).includes(l.event))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const byId = new Map<string, CalendarEntry>()
  const firedAlerts = new Set<string>()

  for (const log of sorted) {
    const md = log.metadata || {}
    if (log.event === 'calendar_entry') {
      const id = (typeof md.id === 'string' && md.id) || log.id
      const date = md.date
      const text = (typeof md.text === 'string' && md.text) || log.text || ''
      if (!isValidDate(date) || !text.trim()) continue
      const type: EntryType = ENTRY_TYPES.includes(md.entryType) ? md.entryType : 'note'
      const lead = Number.isFinite(md.lead) && md.lead >= 0 && md.lead <= 24 * 60
        ? Math.round(md.lead)
        : DEFAULT_LEAD_MIN
      // A duplicate create with the same id (double-submit) keeps the first.
      if (byId.has(id)) continue
      byId.set(id, {
        id,
        date,
        time: isValidTime(md.time) ? md.time : null,
        text: text.trim(),
        type,
        lead,
        status: 'active',
        createdAt: new Date(log.createdAt).toISOString(),
      })
    } else if (log.event === 'calendar_entry_status') {
      const entry = byId.get(md.entryId)
      if (entry && ['active', 'done', 'cancelled'].includes(md.status)) {
        entry.status = md.status
      }
    } else if (log.event === 'calendar_alert') {
      if (typeof md.entryId === 'string' && typeof md.stage === 'string') {
        firedAlerts.add(`${md.entryId}:${md.stage}`)
      }
    }
  }

  const entries = Array.from(byId.values()).sort(compareEntries)
  return { entries, firedAlerts }
}

/** Chronological: by date; within a day all-day entries first (they frame the day), then by time. */
export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  if (a.time === b.time) return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
  if (a.time === null) return -1
  if (b.time === null) return 1
  return a.time < b.time ? -1 : 1
}

/**
 * Which alert stage is open for this entry right now (at most one).
 * Stage windows are disjoint so a late open fires only the current stage —
 * no backlog storm of stale alerts.
 */
export function currentStage(entry: CalendarEntry, now: number): { stage: AlertStage; at: number } | null {
  if (entry.status !== 'active') return null
  if (entry.time) {
    const t = entryMoment(entry.date, entry.time)
    const flashEnd = t + FLASH_GRACE_MIN * 60_000
    if (now >= t && now < flashEnd) return { stage: 'FLASH', at: t }
    const leadStart = t - entry.lead * 60_000
    if (entry.lead > 0 && now >= leadStart && now < t) return { stage: 'PRIORITY', at: leadStart }
    return null
  }
  const open = entryMoment(entry.date, null, ROUTINE_HOUR)
  const close = entryMoment(entry.date, null, 24)
  if (now >= open && now < close) return { stage: 'ROUTINE', at: open }
  return null
}

/** Alerts that are due now and have not yet been fired (per `fired`). */
export function dueAlerts(entries: CalendarEntry[], fired: Set<string>, now: number): CalendarAlert[] {
  const out: CalendarAlert[] = []
  for (const entry of entries) {
    const s = currentStage(entry, now)
    if (!s) continue
    const key = `${entry.id}:${s.stage}`
    if (fired.has(key)) continue
    out.push({ key, entryId: entry.id, stage: s.stage, entry, at: s.at })
  }
  // FLASH outranks PRIORITY outranks ROUTINE; then earliest first.
  const rank: Record<AlertStage, number> = { FLASH: 0, PRIORITY: 1, ROUTINE: 2 }
  return out.sort((a, b) => rank[a.stage] - rank[b.stage] || a.at - b.at)
}

/** Epoch ms of the next moment any stage window opens (for precise timers). */
export function nextStageBoundary(entries: CalendarEntry[], now: number): number | null {
  let next: number | null = null
  const consider = (t: number) => {
    if (t > now && (next === null || t < next)) next = t
  }
  for (const e of entries) {
    if (e.status !== 'active') continue
    if (e.time) {
      const t = entryMoment(e.date, e.time)
      if (e.lead > 0) consider(t - e.lead * 60_000)
      consider(t)
    } else {
      consider(entryMoment(e.date, null, ROUTINE_HOUR))
    }
  }
  return next
}

/** The next active timed entry at or after now (for the T-minus readout). */
export function nextTimedEntry(entries: CalendarEntry[], now: number): CalendarEntry | null {
  let best: CalendarEntry | null = null
  let bestT = Infinity
  for (const e of entries) {
    if (e.status !== 'active' || !e.time) continue
    const t = entryMoment(e.date, e.time)
    if (t >= now && t < bestT) {
      best = e
      bestT = t
    }
  }
  return best
}

/** Military date-time group, local zone: "201430L NOV 26". All-day → "20----L NOV 26". */
export function formatDTG(date: string, time: string | null): string {
  const [y, m, d] = date.split('-').map(Number)
  const hm = time ? time.replace(':', '') : '----'
  return `${pad2(d)}${hm}L ${MONTHS[m - 1]} ${String(y).slice(-2)}`
}

/** "T-02H14M", "T-45M", "T-00M", "T+12M". */
export function formatTMinus(target: number, now: number): string {
  const diffMin = Math.round((target - now) / 60_000)
  const sign = diffMin >= 0 ? '-' : '+'
  const abs = Math.abs(diffMin)
  const d = Math.floor(abs / 1440)
  const h = Math.floor((abs % 1440) / 60)
  const mm = abs % 60
  if (d > 0) return `T${sign}${d}D${pad2(h)}H`
  if (h > 0) return `T${sign}${pad2(h)}H${pad2(mm)}M`
  return `T${sign}${pad2(mm)}M`
}

/** Display time "14:30" or "2:30 PM" depending on operator preference. */
export function formatClock(time: string, is12h: boolean): string {
  if (!is12h) return time
  const [h, m] = time.split(':').map(Number)
  const mer = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${pad2(m)} ${mer}`
}

export const STAGE_LABEL: Record<AlertStage, string> = {
  FLASH: 'T-0',
  PRIORITY: 'T-MINUS',
  ROUTINE: 'TODAY',
}
