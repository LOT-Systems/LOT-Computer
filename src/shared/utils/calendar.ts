/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT/CAL — calendar core.
 *
 * Pure functions shared by the Calendar widget, the alert engine and the
 * server. No dayjs / no DOM: everything works on plain Date objects in the
 * viewer's local time zone so the logic stays deterministic and testable.
 *
 * Entry lifecycle (stored on the `calendar_entry` log's metadata):
 *   open ──(T-15 timed only)──▶ prealertAt stamped (STANDBY toast)
 *        ──(T-00)────────────▶ firedAt stamped   (ALERT toast + Log row)
 *        ──(+10M)────────────▶ snoozeUntil set, firedAt cleared (re-arms)
 *        ──(DONE / VOID)──────▶ status closed     (Log row)
 */

export type CalendarEntryType = 'note' | 'task' | 'call'
export type CalendarEntryStatus = 'open' | 'done' | 'void'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD (local)
  time: string | null // HH:mm (local, 24h) — null = all-day
  text: string
  entryType: CalendarEntryType
  status: CalendarEntryStatus
  firedAt: string | null
  prealertAt: string | null
  snoozeUntil: string | null
  createdAt: string
}

export type CalendarAction = 'prealert' | 'fire' | 'snooze' | 'done' | 'void' | 'reopen'

/** All-day entries alert at this local hour on their date. */
export const ALL_DAY_ALERT_HOUR = 9
/** Timed entries get a STANDBY warning this many minutes before T-00. */
export const PREALERT_MINUTES = 15
/** An unfired alert older than this is considered lapsed — shown as OVERDUE, never toasted. */
export const FIRE_WINDOW_MS = 24 * 60 * 60 * 1000
/** Default snooze length. */
export const SNOOZE_MINUTES = 10

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const ENTRY_TYPES: CalendarEntryType[] = ['note', 'task', 'call']
const STATUSES: CalendarEntryStatus[] = ['open', 'done', 'void']
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export function isValidDate(s: unknown): s is string {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

export function isValidTime(s: unknown): s is string {
  return typeof s === 'string' && TIME_RE.test(s)
}

export function normalizeEntryType(t: unknown): CalendarEntryType {
  return ENTRY_TYPES.includes(t as CalendarEntryType) ? (t as CalendarEntryType) : 'note'
}

export function normalizeStatus(s: unknown): CalendarEntryStatus {
  return STATUSES.includes(s as CalendarEntryStatus) ? (s as CalendarEntryStatus) : 'open'
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Local wall-clock instant the entry is scheduled for (ignores snooze). */
export function scheduledAt(entry: Pick<CalendarEntry, 'date' | 'time'>): Date {
  const [y, m, d] = entry.date.split('-').map(Number)
  if (entry.time && isValidTime(entry.time)) {
    const [hh, mm] = entry.time.split(':').map(Number)
    return new Date(y, m - 1, d, hh, mm, 0, 0)
  }
  return new Date(y, m - 1, d, ALL_DAY_ALERT_HOUR, 0, 0, 0)
}

/** Instant the next ALERT should fire (snooze overrides the schedule). */
export function dueAt(entry: Pick<CalendarEntry, 'date' | 'time' | 'snoozeUntil'>): Date {
  if (entry.snoozeUntil) {
    const s = new Date(entry.snoozeUntil)
    if (!isNaN(s.getTime())) return s
  }
  return scheduledAt(entry)
}

/**
 * Which alert (if any) the engine should claim for this entry right now.
 * Returns null when nothing is due. Pure — `now` is injected.
 */
export function pendingAlert(entry: CalendarEntry, now: Date): 'fire' | 'prealert' | null {
  if (entry.status !== 'open') return null
  const due = dueAt(entry).getTime()
  const t = now.getTime()
  if (!entry.firedAt) {
    if (t >= due && t - due < FIRE_WINDOW_MS) return 'fire'
    if (
      t < due &&
      entry.time &&
      !entry.snoozeUntil &&
      !entry.prealertAt &&
      due - t <= PREALERT_MINUTES * 60 * 1000
    ) {
      return 'prealert'
    }
  }
  return null
}

/** Open entry whose moment has passed. */
export function isOverdue(entry: CalendarEntry, now: Date): boolean {
  if (entry.status !== 'open') return false
  if (entry.time) return dueAt(entry).getTime() <= now.getTime()
  // All-day entries are overdue only once their day is over.
  return entry.date < localDateKey(now)
}

export function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 24h military time, e.g. "1430". */
export function milTime(d: Date): string {
  return `${pad(d.getHours())}${pad(d.getMinutes())}`
}

/**
 * Date-Time Group in local time (zone "J" — Juliet, the observer's local time),
 * e.g. "131430J NOV 26".
 */
export function dtg(d: Date): string {
  return `${pad(d.getDate())}${milTime(d)}J ${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
}

/** "FRI 13 NOV" */
export function milDay(d: Date): string {
  return `${WEEKDAYS[d.getDay()]} ${pad(d.getDate())} ${MONTHS[d.getMonth()]}`
}

/**
 * Signed countdown relative to `now`: "T-02:14" (hh:mm) before, "T+00:03" after.
 * Beyond 99h it collapses to days: "T-5D".
 */
export function tMinus(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime()
  const sign = diff > 0 ? '-' : '+'
  const abs = Math.abs(diff)
  const totalMin = diff > 0 ? Math.ceil(abs / 60000) : Math.floor(abs / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 99) return `T${sign}${Math.floor(h / 24)}D`
  return `T${sign}${pad(h)}:${pad(m)}`
}

/** Raw log metadata → typed entry. Returns null for malformed rows. */
export function entryFromLog(log: {
  id: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string | Date
}): CalendarEntry | null {
  const md = log.metadata || {}
  if (!isValidDate(md.date)) return null
  const text = String(md.text || log.text || '').trim()
  if (!text) return null
  return {
    id: log.id,
    date: md.date,
    time: isValidTime(md.time) ? md.time : null,
    text,
    entryType: normalizeEntryType(md.entryType),
    status: normalizeStatus(md.status),
    firedAt: typeof md.firedAt === 'string' ? md.firedAt : null,
    prealertAt: typeof md.prealertAt === 'string' ? md.prealertAt : null,
    snoozeUntil: typeof md.snoozeUntil === 'string' ? md.snoozeUntil : null,
    createdAt: new Date(log.createdAt).toISOString(),
  }
}

/** Chronological order: date, then time (all-day first), then creation. */
export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  const at = a.time || ''
  const bt = b.time || ''
  if (at !== bt) return at < bt ? -1 : 1
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
}

/**
 * DTG built from the stored local date/time strings — time-zone independent,
 * so the server renders exactly what the operator scheduled.
 * "2026-11-13" + "14:30" → "131430J NOV 26"; all-day → "13 NOV 26 ALL-DAY".
 */
export function entryDtg(entry: Pick<CalendarEntry, 'date' | 'time'>): string {
  const [y, m, d] = entry.date.split('-')
  const tail = `${MONTHS[Number(m) - 1]} ${y.slice(-2)}`
  if (entry.time) return `${d}${entry.time.replace(':', '')}J ${tail}`
  return `${d} ${tail} ALL-DAY`
}

/** One-line Log text for an alert/transition, e.g. "[CAL/ALERT] 131430J NOV 26 · CALL · Dentist". */
export function alertLogText(
  kind: 'ALERT' | 'DONE' | 'VOID' | 'SNOOZE' | 'REOPEN',
  entry: Pick<CalendarEntry, 'date' | 'time' | 'text' | 'entryType'>
): string {
  return `[CAL/${kind}] ${entryDtg(entry)} · ${entry.entryType.toUpperCase()} · ${entry.text}`
}
