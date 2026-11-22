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
 * The Log is the single source of truth. Three append-only events:
 *   calendar_entry   { date, time?, text, entryType }          → an entry
 *   calendar_status  { entryId, status }                         → lifecycle (latest wins)
 *   calendar_alert   { entryId, stage, date, time?, entryType } → a fired notification
 *
 * Everything below derives state from those logs, so it is deterministic and
 * survives reloads, tabs and devices. No Date parsing of 'YYYY-MM-DD' strings
 * via the Date constructor (that is UTC and shifts the day) — we build local
 * dates from components.
 */

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
export type AlertStage = 'T-15' | 'T-0' | 'DAY'

export const ENTRY_TYPES: EntryType[] = ['note', 'task', 'call']

/** Minutes before a timed entry at which the T-15 warning fires. */
export const LEAD_MINUTES = 15
/** How long after T-0 an alert may still fire (app was closed / asleep). */
export const GRACE_MINUTES = 60
/** Local hour at which an untimed entry fires its DAY briefing. */
export const DAY_BRIEF_HOUR = 8

export type CalendarLogLike = {
  id: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string | Date
}

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD (local)
  time: string | null // HH:MM (local, 24h)
  text: string
  type: EntryType
  status: EntryStatus
  createdAt: string
}

export type DueAlert = {
  entry: CalendarEntry
  stage: AlertStage
  key: string
}

// ─── Time + date primitives ──────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0')

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function isDateKey(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = fromDateKey(s)
  return toDateKey(d) === s
}

/** Local midnight for a YYYY-MM-DD key. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

/**
 * Parse loose human time input into canonical 24h "HH:MM".
 * Accepts: "14:30", "1430", "9:05", "905", "9", "9am", "2:30pm", "12am".
 * Returns null for empty input, undefined for invalid input.
 */
export function parseTime(input: string): string | null | undefined {
  const raw = (input || '').trim().toLowerCase().replace(/\s+/g, '')
  if (!raw) return null
  const m = raw.match(/^(\d{1,2})(?::?(\d{2}))?(am|pm|a|p)?$/)
  if (!m) return undefined
  let h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  const mer = m[3]
  if (mer) {
    if (h < 1 || h > 12) return undefined
    if (mer.startsWith('a')) h = h === 12 ? 0 : h
    else h = h === 12 ? 12 : h + 12
  }
  if (h > 23 || min > 59) return undefined
  return `${pad(h)}:${pad(min)}`
}

export function isTimeKey(s: unknown): s is string {
  return typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)
}

/** Local Date for an entry: its time, or local midnight if untimed. */
export function entryDateTime(entry: Pick<CalendarEntry, 'date' | 'time'>): Date {
  const d = fromDateKey(entry.date)
  if (entry.time) {
    const [h, m] = entry.time.split(':').map(Number)
    d.setHours(h, m, 0, 0)
  }
  return d
}

/**
 * Month grid, ISO weeks (Mon-first). Always starts from day 1 of the month,
 * so viewing February on the 31st of another month cannot overflow.
 */
export function getMonthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // Mon=0 … Sun=6
  const lastDate = new Date(year, month + 1, 0).getDate()
  const cells = Math.ceil((offset + lastDate) / 7) * 7
  const weeks: Date[][] = []
  for (let i = 0; i < cells; i++) {
    if (i % 7 === 0) weeks.push([])
    weeks[weeks.length - 1].push(new Date(year, month, 1 - offset + i))
  }
  return weeks
}

// ─── Military formatting ─────────────────────────────────────────────────────

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** NATO zone letter for the viewer's local UTC offset (whole hours only). */
export function zoneLetter(d: Date): string {
  const offsetMin = -d.getTimezoneOffset()
  if (offsetMin % 60 !== 0) return 'J' // non-integral zones → "local"
  const h = offsetMin / 60
  if (h === 0) return 'Z'
  if (h > 0 && h <= 12) return 'ABCDEFGHIKLM'[h - 1] // J is skipped
  if (h < 0 && h >= -12) return 'NOPQRSTUVWXY'[-h - 1]
  return 'J'
}

/** Date-Time Group, e.g. "231430R NOV 26". */
export function militaryDTG(d: Date): string {
  return `${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${zoneLetter(d)} ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
}

/**
 * Wall-clock DTG for an entry, zone "J" (Juliet = observer's local time).
 * Timezone-independent: safe to compute on the server. "231430J NOV 26".
 */
export function entryDTG(e: Pick<CalendarEntry, 'date' | 'time'>): string {
  const [y, m, d] = e.date.split('-')
  const hm = e.time ? e.time.replace(':', '') : '----'
  return `${d}${hm}J ${MONTHS[Number(m) - 1]} ${y.slice(-2)}`
}

/** "1430" style clock, or "----" for untimed. */
export function militaryClock(time: string | null): string {
  return time ? time.replace(':', '') : '----'
}

/** Signed countdown: "T-00:15", "T+00:05", "T-2D". */
export function countdown(target: Date, now: Date): string {
  const diffMin = Math.round((target.getTime() - now.getTime()) / 60000)
  const sign = diffMin >= 0 ? '-' : '+'
  const abs = Math.abs(diffMin)
  if (abs >= 48 * 60) return `T${sign}${Math.floor(abs / 1440)}D`
  return `T${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

export const TYPE_CODE: Record<EntryType, string> = { note: 'NOTE', task: 'TASK', call: 'CALL' }

export function entryLogText(e: { date: string; time: string | null; text: string; type: EntryType }) {
  return `[CAL] SCHEDULED · ${TYPE_CODE[e.type]} · ${entryDTG(e)} · ${e.text}`
}

export function alertLogText(e: CalendarEntry, stage: AlertStage) {
  return `[CAL] ALERT ${stage} · ${TYPE_CODE[e.type]} · ${militaryClock(e.time)} · ${e.text}`
}

export function statusLogText(e: CalendarEntry, status: EntryStatus) {
  const word = status === 'done' ? 'COMPLETE' : status === 'cancelled' ? 'SCRUBBED' : 'REOPENED'
  return `[CAL] ${word} · ${TYPE_CODE[e.type]} · ${e.text}`
}

// ─── Derivation from the Log ─────────────────────────────────────────────────

const ts = (x: string | Date) => (typeof x === 'string' ? Date.parse(x) : x.getTime())

/** Build entries from calendar logs, applying status logs (latest wins). */
export function buildEntries(logs: CalendarLogLike[]): CalendarEntry[] {
  const byId = new Map<string, CalendarEntry>()
  const sorted = [...logs].sort((a, b) => ts(a.createdAt) - ts(b.createdAt))

  for (const log of sorted) {
    if (log.event !== 'calendar_entry') continue
    const md = log.metadata || {}
    const date = md.date
    const text = String(md.text || '').trim()
    if (!isDateKey(date) || !text) continue
    const type: EntryType = ENTRY_TYPES.includes(md.entryType) ? md.entryType : 'note'
    byId.set(log.id, {
      id: log.id,
      date,
      time: isTimeKey(md.time) ? md.time : null,
      text,
      type,
      status: 'open',
      createdAt: new Date(ts(log.createdAt)).toISOString(),
    })
  }

  for (const log of sorted) {
    if (log.event !== 'calendar_status') continue
    const md = log.metadata || {}
    const entry = byId.get(md.entryId)
    if (!entry) continue
    if (md.status === 'done' || md.status === 'cancelled' || md.status === 'open') {
      entry.status = md.status
    }
  }

  return [...byId.values()].sort(compareEntries)
}

export function compareEntries(a: CalendarEntry, b: CalendarEntry) {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  // Untimed entries lead the day (they are day-level orders)
  const at = a.time ?? ''
  const bt = b.time ?? ''
  if (at !== bt) return at < bt ? -1 : 1
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
}

export const alertKey = (entryId: string, stage: AlertStage) => `${entryId}:${stage}`

export function firedAlertKeys(logs: CalendarLogLike[]): Set<string> {
  const set = new Set<string>()
  for (const log of logs) {
    if (log.event !== 'calendar_alert') continue
    const { entryId, stage } = log.metadata || {}
    if (entryId && stage) set.add(alertKey(entryId, stage))
  }
  return set
}

/**
 * Alerts that should fire right now and have not fired yet.
 * Windows are exclusive so one entry never yields two alerts at once:
 *   timed:   T-15 in [t-15m, t)   ·   T-0 in [t, t+grace)
 *   untimed: DAY  on its date from DAY_BRIEF_HOUR until end of day
 */
export function dueAlerts(entries: CalendarEntry[], now: Date, fired: Set<string>): DueAlert[] {
  const out: DueAlert[] = []
  const nowMs = now.getTime()
  const todayKey = toDateKey(now)

  for (const entry of entries) {
    if (entry.status !== 'open') continue
    let stage: AlertStage | null = null

    if (entry.time) {
      const t = entryDateTime(entry).getTime()
      if (nowMs >= t - LEAD_MINUTES * 60000 && nowMs < t) stage = 'T-15'
      else if (nowMs >= t && nowMs < t + GRACE_MINUTES * 60000) stage = 'T-0'
    } else if (entry.date === todayKey && now.getHours() >= DAY_BRIEF_HOUR) {
      stage = 'DAY'
    }

    if (!stage) continue
    const key = alertKey(entry.id, stage)
    if (fired.has(key)) continue
    out.push({ entry, stage, key })
  }
  return out
}

/** Open task/call past its window, or an open untimed task from a past day. */
export function isOverdue(entry: CalendarEntry, now: Date): boolean {
  if (entry.status !== 'open' || entry.type === 'note') return false
  if (entry.time) return now.getTime() >= entryDateTime(entry).getTime() + GRACE_MINUTES * 60000
  return entry.date < toDateKey(now)
}

/**
 * The working list: open entries from today forward, plus overdue open
 * tasks/calls (so nothing silently falls off), soonest first.
 */
export function agenda(entries: CalendarEntry[], now: Date, limit = 10): CalendarEntry[] {
  const todayKey = toDateKey(now)
  return entries
    .filter(e => e.status === 'open' && (e.date >= todayKey || isOverdue(e, now)))
    .slice(0, limit)
}

/** Milliseconds until the next alert boundary (for precise scheduling). */
export function msUntilNextBoundary(entries: CalendarEntry[], now: Date): number | null {
  const nowMs = now.getTime()
  let best: number | null = null
  const consider = (t: number) => {
    if (t > nowMs && (best === null || t - nowMs < best)) best = t - nowMs
  }
  for (const e of entries) {
    if (e.status !== 'open') continue
    if (e.time) {
      const t = entryDateTime(e).getTime()
      consider(t - LEAD_MINUTES * 60000)
      consider(t)
    } else {
      const d = fromDateKey(e.date)
      d.setHours(DAY_BRIEF_HOUR, 0, 0, 0)
      consider(d.getTime())
    }
  }
  return best
}
