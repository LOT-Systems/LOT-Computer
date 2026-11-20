/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT Calendar — core engine (pure, dependency-free).
 *
 * The calendar is event-sourced on top of the Log stream. Nothing is ever
 * mutated or deleted; every state change is an append-only log record:
 *
 *   calendar_entry   → an entry is SCHEDULED        (metadata: date, time?, text, entryType)
 *   calendar_update  → an entry is CLEARED/SCRUBBED (metadata: entryId, status, deltaMinutes?)
 *   calendar_alert   → an alert was FIRED            (metadata: entryId, level, ...)
 *
 * Current state = fold(entries, updates). Alert dedup = set of (entryId, level)
 * already present in the stream, so an alert fires once per level — across
 * reloads, tabs and devices (the server enforces the same key idempotently).
 *
 * Times are wall-clock local ("YYYY-MM-DD" + optional "HH:mm"), interpreted in
 * the runtime's local zone. No dependencies so it runs on client, server and
 * in scripts/verify-calendar.ts unchanged.
 */

export type CalEntryType = 'note' | 'task' | 'call'
export type CalStatus = 'active' | 'done' | 'scrubbed'
export type CalAlertLevel = 'NOTICE' | 'ALERT' | 'EXECUTE' | 'OVERDUE'

export const CAL_ENTRY_TYPES: CalEntryType[] = ['note', 'task', 'call']
export const CAL_EVENTS = ['calendar_entry', 'calendar_update', 'calendar_alert'] as const

export const CAL_MAX_TEXT = 200

/** Lead times (ms) */
export const MIN = 60_000
export const HOUR = 60 * MIN
export const DAY = 24 * HOUR
export const ALERT_LEAD = 60 * MIN          // T-60 → ALERT
export const EXECUTE_LEAD = 5 * MIN         // T-5  → EXECUTE
export const EXECUTE_GRACE = 15 * MIN       // EXECUTE holds until T+15
export const OVERDUE_HORIZON = 7 * DAY      // never page for things older than a week

/** Rank — higher levels supersede lower ones (no downgrade alerts). */
export const LEVEL_RANK: Record<CalAlertLevel, number> = {
  NOTICE: 1,
  ALERT: 2,
  EXECUTE: 3,
  OVERDUE: 4,
}

export type CalLogLike = {
  id: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string | Date | number
}

export type CalEntry = {
  id: string
  date: string
  time: string | null
  text: string
  type: CalEntryType
  status: CalStatus
  createdAt: number
  closedAt: number | null
  deltaMinutes: number | null
}

export type CalPendingAlert = { entry: CalEntry; level: CalAlertLevel }

// ─── Validation ─────────────────────────────────────────────────────────────

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidCalDate(s: unknown): s is string {
  if (typeof s !== 'string') return false
  const m = DATE_RE.exec(s)
  if (!m) return false
  const y = +m[1], mo = +m[2], d = +m[3]
  if (y < 1970 || y > 2999 || mo < 1 || mo > 12 || d < 1) return false
  return d <= new Date(y, mo, 0).getDate()
}

export function isValidCalTime(s: unknown): s is string {
  return typeof s === 'string' && TIME_RE.test(s)
}

export function isCalEntryType(s: unknown): s is CalEntryType {
  return typeof s === 'string' && (CAL_ENTRY_TYPES as string[]).includes(s)
}

// ─── Time ───────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0')

/** Local wall-clock → Date. Untimed entries resolve to 00:00 local. */
export function toLocalDate(date: string, time?: string | null): Date {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time && isValidCalTime(time) ? time.split(':').map(Number) : [0, 0]
  return new Date(y, mo - 1, d, h, mi, 0, 0)
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function addDaysKey(key: string, n: number): string {
  const d = toLocalDate(key)
  d.setDate(d.getDate() + n)
  return dateKey(d)
}

/** Whole calendar days between two date keys (b - a), DST-safe. */
export function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / DAY)
}

/** The moment an entry is "due": its time, or the start of its day. */
export function entryMoment(e: Pick<CalEntry, 'date' | 'time'>): number {
  return toLocalDate(e.date, e.time).getTime()
}

/** End of the entry's window — timed: moment; untimed: end of its day. */
export function entryDeadline(e: Pick<CalEntry, 'date' | 'time'>): number {
  if (e.time) return entryMoment(e)
  return toLocalDate(addDaysKey(e.date, 1)).getTime() - 1
}

function toMs(v: string | Date | number): number {
  if (typeof v === 'number') return v
  const t = new Date(v).getTime()
  return Number.isFinite(t) ? t : 0
}

// ─── Fold (log stream → entries) ────────────────────────────────────────────

export function deriveEntries(logs: CalLogLike[]): CalEntry[] {
  const byId = new Map<string, CalEntry>()
  const sorted = [...logs].sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt))

  for (const log of sorted) {
    const m = log.metadata || {}
    if (log.event === 'calendar_entry') {
      if (!isValidCalDate(m.date)) continue
      const text = String(m.text || '').trim()
      if (!text) continue
      byId.set(log.id, {
        id: log.id,
        date: m.date,
        time: isValidCalTime(m.time) ? m.time : null,
        text,
        type: isCalEntryType(m.entryType) ? m.entryType : 'note',
        status: 'active',
        createdAt: toMs(log.createdAt),
        closedAt: null,
        deltaMinutes: null,
      })
    } else if (log.event === 'calendar_update') {
      const e = byId.get(String(m.entryId || ''))
      if (!e) continue
      if (m.status === 'done' || m.status === 'scrubbed') {
        e.status = m.status
        e.closedAt = toMs(log.createdAt)
        e.deltaMinutes = typeof m.deltaMinutes === 'number' ? m.deltaMinutes : null
      } else if (m.status === 'active') {
        e.status = 'active'
        e.closedAt = null
        e.deltaMinutes = null
      }
    }
  }

  return [...byId.values()].sort(compareEntries)
}

/** Chronological; all-day entries lead their day. */
export function compareEntries(a: CalEntry, b: CalEntry): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  const at = a.time ?? '', bt = b.time ?? ''
  if (at !== bt) return at < bt ? -1 : 1
  return a.createdAt - b.createdAt
}

export function alertKey(entryId: string, level: CalAlertLevel): string {
  return `${entryId}:${level}`
}

export function firedAlertKeys(logs: CalLogLike[]): Set<string> {
  const keys = new Set<string>()
  for (const log of logs) {
    if (log.event !== 'calendar_alert') continue
    const m = log.metadata || {}
    if (m.entryId && m.level) keys.add(alertKey(String(m.entryId), m.level))
  }
  return keys
}

export type CalFiredAlert = { entryId: string; level: CalAlertLevel; firedAt: number }

/** Alerts fired within `windowMs` — lets every device surface what any device logged. */
export function recentAlerts(logs: CalLogLike[], now: number, windowMs: number): CalFiredAlert[] {
  const out: CalFiredAlert[] = []
  for (const log of logs) {
    if (log.event !== 'calendar_alert') continue
    const m = log.metadata || {}
    if (!m.entryId || !(m.level in LEVEL_RANK)) continue
    const firedAt = typeof m.firedAt === 'number' ? m.firedAt : toMs(log.createdAt)
    if (now - firedAt >= 0 && now - firedAt < windowMs) {
      out.push({ entryId: String(m.entryId), level: m.level, firedAt })
    }
  }
  return out
}

// ─── Alert engine ───────────────────────────────────────────────────────────

/** Entries that can go overdue — notes simply elapse. */
export function canGoOverdue(e: CalEntry): boolean {
  return e.type === 'task' || e.type === 'call'
}

/** Past its deadline (+ EXECUTE grace for timed) and still open. */
export function isOverdue(e: CalEntry, now: number): boolean {
  if (e.status !== 'active' || !canGoOverdue(e)) return false
  return e.time ? now - entryMoment(e) >= EXECUTE_GRACE : now > entryDeadline(e)
}

/**
 * The single alert level an entry is in right now, or null.
 *
 * Untimed:  D-1 → NOTICE · D-0 → ALERT · past (task/call) → OVERDUE
 * Timed:    D-1 → NOTICE · T-60 → ALERT · T-5…T+15 → EXECUTE · after (task/call) → OVERDUE
 *
 * NOTICE/ALERT are suppressed when the entry was created inside that window —
 * the operator just scheduled it, paging them about it is noise. EXECUTE and
 * OVERDUE always fire.
 */
export function currentAlertLevel(e: CalEntry, now: number): CalAlertLevel | null {
  if (e.status !== 'active') return null
  const today = dateKey(new Date(now))
  const days = dayDiff(today, e.date) // >0 future, 0 today, <0 past

  if (!e.time) {
    if (days < 0) {
      if (!canGoOverdue(e)) return null
      return now - entryDeadline(e) <= OVERDUE_HORIZON ? 'OVERDUE' : null
    }
    if (days === 0) return e.createdAt < toLocalDate(e.date).getTime() ? 'ALERT' : null
    if (days === 1) return e.createdAt < toLocalDate(today).getTime() ? 'NOTICE' : null
    return null
  }

  const t = entryMoment(e) - now // ms until moment
  if (t <= -EXECUTE_GRACE) {
    if (!canGoOverdue(e)) return null
    return -t <= OVERDUE_HORIZON ? 'OVERDUE' : null
  }
  if (t <= EXECUTE_LEAD) return 'EXECUTE'
  if (t <= ALERT_LEAD) return e.createdAt < entryMoment(e) - ALERT_LEAD ? 'ALERT' : null
  if (days === 1) return e.createdAt < toLocalDate(today).getTime() ? 'NOTICE' : null
  return null
}

/** Alerts that should fire now, highest severity first. */
export function pendingAlerts(entries: CalEntry[], fired: Set<string>, now: number): CalPendingAlert[] {
  const out: CalPendingAlert[] = []
  for (const entry of entries) {
    const level = currentAlertLevel(entry, now)
    if (!level) continue
    if (fired.has(alertKey(entry.id, level))) continue
    // never downgrade: a higher level already fired means this one is stale
    const superseded = (Object.keys(LEVEL_RANK) as CalAlertLevel[]).some(
      l => LEVEL_RANK[l] > LEVEL_RANK[level] && fired.has(alertKey(entry.id, l))
    )
    if (superseded) continue
    out.push({ entry, level })
  }
  return out.sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level] || compareEntries(a.entry, b.entry))
}

// ─── Formatting (military register) ─────────────────────────────────────────

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** "19 NOV 2026" */
export function milDate(date: string): string {
  const d = toLocalDate(date)
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "THU" */
export function milWeekday(date: string): string {
  return WEEKDAYS[toLocalDate(date).getDay()]
}

/** "19 NOV 2026 · 14:00" | "19 NOV 2026" */
export function milStamp(e: Pick<CalEntry, 'date' | 'time'>): string {
  return e.time ? `${milDate(e.date)} · ${e.time}` : milDate(e.date)
}

/**
 * Countdown. Under a day: "T-01:23:45" / "T+00:04:10".
 * A day or more: "T-3D 04H".
 */
export function countdown(ms: number): string {
  const sign = ms < 0 ? '+' : '-'
  const abs = Math.abs(Math.trunc(ms / 1000))
  const d = Math.floor(abs / 86400)
  const h = Math.floor((abs % 86400) / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  if (d > 0) return `T${sign}${d}D ${pad(h)}H`
  return `T${sign}${pad(h)}:${pad(m)}:${pad(s)}`
}

/** "+12M" / "-3M" / "+2H 05M" / "+1D 03H" relative to schedule. */
export function deltaLabel(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+'
  const abs = Math.abs(Math.round(minutes))
  if (abs < 60) return `${sign}${abs}M`
  if (abs < 1440) return `${sign}${Math.floor(abs / 60)}H ${pad(abs % 60)}M`
  return `${sign}${Math.floor(abs / 1440)}D ${pad(Math.floor((abs % 1440) / 60))}H`
}

export function entryLine(e: Pick<CalEntry, 'type' | 'text' | 'date' | 'time'>): string {
  return `${e.type.toUpperCase()} · ${e.text} · ${milStamp(e)}`
}

export function scheduledText(e: Pick<CalEntry, 'type' | 'text' | 'date' | 'time'>): string {
  return `[SCHEDULED] ${entryLine(e)}`
}

export function alertText(level: CalAlertLevel, e: CalEntry, now: number): string {
  const ms = e.time ? entryMoment(e) - now : 0
  const today = dateKey(new Date(now))
  let tail: string
  switch (level) {
    case 'NOTICE':
      tail = 'T-1D'
      break
    case 'ALERT':
      tail = e.time ? countdown(ms) : 'TODAY'
      break
    case 'EXECUTE':
      tail = ms > 0 ? countdown(ms) : 'NOW'
      break
    case 'OVERDUE':
      tail = e.time
        ? deltaLabel((now - entryMoment(e)) / MIN)
        : `+${Math.max(1, dayDiff(e.date, today))}D`
      break
  }
  return `[${level}] ${entryLine(e)} · ${tail}`
}

/** Minutes late (+) or early (−) at close, vs the entry's deadline. Null for notes. */
export function closeDelta(e: CalEntry, closedAt: number): number | null {
  if (e.type === 'note') return null
  return Math.round((closedAt - entryDeadline(e)) / MIN)
}

export function updateText(status: 'done' | 'scrubbed' | 'active', e: CalEntry, deltaMinutes: number | null): string {
  if (status === 'active') return `[REINSTATED] ${entryLine(e)}`
  if (status === 'scrubbed') return `[SCRUBBED] ${entryLine(e)}`
  const timing = deltaMinutes === null ? '' : deltaMinutes > 0 ? ` · ${deltaLabel(deltaMinutes)} LATE` : ' · ON TIME'
  return `[CLEARED] ${entryLine(e)}${timing}`
}
