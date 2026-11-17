/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar engine — pure logic for the Calendar widget.
 *
 * Storage model (append-only, lives in the Log):
 *   calendar_entry   { date, time?, text, entryType }      — creates an entry
 *   calendar_status  { entryId, status }                    — done / cancelled / reopened
 *   calendar_alert   { entryId, phase, date, time?, ... }   — a fired notification
 *
 * Entries are never mutated; the current state is folded from the log stream.
 * Alerts are logged once per (entryId, phase), which makes them idempotent
 * across reloads, tabs and devices.
 */

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
export type AlertPhase = 'T-15' | 'T-0' | 'DAY'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm (local), null = all-day
  text: string
  type: EntryType
  status: EntryStatus
  createdAt: string
}

export type CalendarAlert = {
  key: string // `${entryId}:${phase}`
  entryId: string
  phase: AlertPhase
  entry: CalendarEntry
  firedAt: number
}

type RawLog = {
  id: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string | Date
}

export const CALENDAR_EVENTS = ['calendar_entry', 'calendar_status', 'calendar_alert'] as const

/** Lead time for the pre-alert, minutes. */
export const PRE_ALERT_MINUTES = 15
/** Alerts older than this are considered stale and are not fired (e.g. app opened hours later). */
export const ALERT_GRACE_MINUTES = 60
/** All-day entries fire their DAY alert from this local hour onward. */
export const DAY_ALERT_HOUR = 8

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function isValidTime(t: unknown): t is string {
  return typeof t === 'string' && TIME_RE.test(t)
}

export function isValidDate(d: unknown): d is string {
  return typeof d === 'string' && DATE_RE.test(d)
}

/** Accepts "9", "930", "9:30", "09.30", "21h" → "HH:mm" or null. */
export function normalizeTime(input: string): string | null {
  const raw = input.trim().toLowerCase().replace(/h$/, '')
  if (!raw) return null
  let h: number
  let m: number
  const sep = raw.match(/^(\d{1,2})[:.](\d{2})$/)
  if (sep) {
    h = Number(sep[1])
    m = Number(sep[2])
  } else if (/^\d{1,4}$/.test(raw)) {
    if (raw.length <= 2) {
      h = Number(raw)
      m = 0
    } else {
      h = Number(raw.slice(0, raw.length - 2))
      m = Number(raw.slice(-2))
    }
  } else {
    return null
  }
  if (h > 23 || m > 59) return null
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Local Date for an entry's start. All-day entries resolve to 00:00 local. */
export function entryStart(entry: Pick<CalendarEntry, 'date' | 'time'>): Date {
  const [y, mo, d] = entry.date.split('-').map(Number)
  const [h, mi] = entry.time ? entry.time.split(':').map(Number) : [0, 0]
  return new Date(y, mo - 1, d, h, mi, 0, 0)
}

export function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Fold the log stream into current calendar state. */
export function foldCalendar(logs: RawLog[]): {
  entries: CalendarEntry[]
  firedAlerts: Set<string>
} {
  // Oldest first so later status changes win.
  const sorted = [...logs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const byId = new Map<string, CalendarEntry>()
  const firedAlerts = new Set<string>()

  for (const log of sorted) {
    const md = log.metadata || {}
    if (log.event === 'calendar_entry') {
      const date = md.date
      const text = (md.text as string) || log.text || ''
      if (!isValidDate(date) || !text) continue
      const type: EntryType = ['note', 'task', 'call'].includes(md.entryType) ? md.entryType : 'note'
      byId.set(log.id, {
        id: log.id,
        date,
        time: isValidTime(md.time) ? md.time : null,
        text,
        type,
        status: 'open',
        createdAt: new Date(log.createdAt).toISOString(),
      })
    } else if (log.event === 'calendar_status') {
      const entry = byId.get(md.entryId)
      if (!entry) continue
      if (md.status === 'done' || md.status === 'cancelled' || md.status === 'open') {
        entry.status = md.status
      }
    } else if (log.event === 'calendar_alert') {
      if (md.entryId && md.phase) firedAlerts.add(`${md.entryId}:${md.phase}`)
    }
  }

  const entries = [...byId.values()].sort(compareEntries)
  return { entries, firedAlerts }
}

export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  // All-day entries first within a day, then by time.
  if (a.time === b.time) return a.createdAt < b.createdAt ? -1 : 1
  if (a.time === null) return -1
  if (b.time === null) return 1
  return a.time < b.time ? -1 : 1
}

/**
 * Which alerts are due right now.
 * - Timed entries: T-15 (lead) and T-0 (start). A phase is due once its moment
 *   has passed and is still within the grace window. If both are due (app opened
 *   late), only T-0 fires and T-15 is suppressed — returned in `suppressed`.
 * - All-day entries: DAY, from DAY_ALERT_HOUR local on the entry's date.
 * Only open entries alert. Notes alert too — a note on a date is a reminder.
 */
export function dueAlerts(
  entries: CalendarEntry[],
  fired: Set<string>,
  now: Date
): { due: Array<{ entry: CalendarEntry; phase: AlertPhase }>; suppressed: string[] } {
  const due: Array<{ entry: CalendarEntry; phase: AlertPhase }> = []
  const suppressed: string[] = []
  const nowMs = now.getTime()
  const graceMs = ALERT_GRACE_MINUTES * 60_000
  const todayKey = localDateKey(now)

  for (const entry of entries) {
    if (entry.status !== 'open') continue

    if (entry.time === null) {
      if (entry.date !== todayKey) continue
      if (now.getHours() < DAY_ALERT_HOUR) continue
      const key = `${entry.id}:DAY`
      if (!fired.has(key)) due.push({ entry, phase: 'DAY' })
      continue
    }

    const start = entryStart(entry).getTime()
    const lead = start - PRE_ALERT_MINUTES * 60_000
    const startKey = `${entry.id}:T-0`
    const leadKey = `${entry.id}:T-15`
    const startDue = nowMs >= start && nowMs - start <= graceMs
    const leadDue = nowMs >= lead && nowMs < start

    if (startDue && !fired.has(startKey)) {
      due.push({ entry, phase: 'T-0' })
      if (!fired.has(leadKey)) suppressed.push(leadKey)
    } else if (leadDue && !fired.has(leadKey)) {
      due.push({ entry, phase: 'T-15' })
    }
  }

  return { due, suppressed }
}

/** "T-02:14:09" style countdown. Negative values render as "T+". */
export function formatCountdown(ms: number): string {
  const sign = ms >= 0 ? '-' : '+'
  const abs = Math.abs(ms)
  const totalSec = Math.floor(abs / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (d > 0) return `T${sign}${d}D ${pad(h)}H`
  return `T${sign}${pad(h)}:${pad(m)}:${pad(s)}`
}

/** Military date-time group, e.g. "171430L NOV 26" (L = local time zone). */
export function formatDTG(d: Date): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}L ${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
}

export const TYPE_CODE: Record<EntryType, string> = {
  note: 'NTE',
  task: 'TSK',
  call: 'CLL',
}

export const PHASE_LABEL: Record<AlertPhase, string> = {
  'T-15': `T-${PRE_ALERT_MINUTES} MIN`,
  'T-0': 'T-0 · NOW',
  DAY: 'DAY OF',
}

/** Priority of an alert — calls and timed starts escalate. */
export function alertPriority(entry: CalendarEntry, phase: AlertPhase): 'FLASH' | 'IMMEDIATE' | 'ROUTINE' {
  if (phase === 'T-0' && entry.type !== 'note') return 'FLASH'
  if (phase === 'T-0' || phase === 'T-15') return 'IMMEDIATE'
  return 'ROUTINE'
}

/** Single-line text for the Log + system notification. */
export function alertLogText(entry: CalendarEntry, phase: AlertPhase, firedAt: Date): string {
  const when = entry.time ? `${entry.date} ${entry.time}` : entry.date
  return `[${alertPriority(entry, phase)}] CAL ${PHASE_LABEL[phase]} · ${TYPE_CODE[entry.type]} · ${entry.text} · ${when} · DTG ${formatDTG(firedAt)}`
}
