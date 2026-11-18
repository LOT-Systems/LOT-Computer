/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar engine — pure logic shared by the Calendar widget (client) and the
 * Calendar Watch daemon (server). No DOM, no Node APIs.
 *
 * Storage model (append-only, lives in the Log):
 *   calendar_entry   { date, time?, text, entryType, tz? }       creates an entry
 *   calendar_status  { entryId, status }                          done / cancelled / reopened
 *   calendar_snooze  { entryId, until, minutes }                  re-arm an alert at `until`
 *   calendar_alert   { key, entryId, phase, date, time?, ... }    a fired notification
 *
 * Entries are never mutated; the current state is folded from the log stream.
 * Every alert has a deterministic `key`, so it is logged at most once across
 * reloads, tabs, devices and the server daemon.
 *
 * Time model: an entry's `date` + `time` is wall-clock time in the entry's
 * `tz` (IANA zone captured when it was created). Entries without `tz`
 * (legacy) resolve in the device's local zone, and the server skips them.
 */

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
export type AlertPhase = 'T-15' | 'T-0' | 'DAY' | 'SNZ'
export type AlertPriority = 'FLASH' | 'IMMEDIATE' | 'ROUTINE'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm wall clock, null = all-day
  tz: string | null // IANA zone, null = device local
  text: string
  type: EntryType
  status: EntryStatus
  snoozeUntil: number | null // epoch ms of the latest snooze
  createdAt: string
}

export type CalendarAlert = {
  key: string
  entryId: string
  phase: AlertPhase
  entry: CalendarEntry
  firedAt: number
}

export type RawCalendarLog = {
  id: string
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  createdAt: string | Date
}

export const CALENDAR_EVENTS = [
  'calendar_entry',
  'calendar_status',
  'calendar_snooze',
  'calendar_alert',
] as const

/** Lead time for the pre-alert, minutes. */
export const PRE_ALERT_MINUTES = 15
/** Alerts older than this are stale and are not fired (e.g. app opened hours later). */
export const ALERT_GRACE_MINUTES = 60
/** All-day entries fire their DAY alert from this local hour onward. */
export const DAY_ALERT_HOUR = 8
/** Snooze presets offered on the alert card, minutes. */
export const SNOOZE_MINUTES = 5
/** A fired alert is still shown as a toast on a device that opens within this window. */
export const ALERT_DISPLAY_WINDOW_MINUTES = 10

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

// ─── time zones ─────────────────────────────────────────────────────────────

const formatterCache = new Map<string, Intl.DateTimeFormat | null>()

function zoneFormatter(tz: string): Intl.DateTimeFormat | null {
  if (formatterCache.has(tz)) return formatterCache.get(tz)!
  let f: Intl.DateTimeFormat | null = null
  try {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    f = null // unknown zone → treated as device local
  }
  formatterCache.set(tz, f)
  return f
}

export function isValidZone(tz: unknown): tz is string {
  return typeof tz === 'string' && tz.length > 0 && tz.length < 64 && !!zoneFormatter(tz)
}

type WallClock = { y: number; mo: number; d: number; h: number; mi: number }

/** Wall clock at instant `ms` in zone `tz` (device local when tz is null). */
export function wallClock(ms: number, tz: string | null): WallClock {
  const f = tz ? zoneFormatter(tz) : null
  if (!f) {
    const d = new Date(ms)
    return { y: d.getFullYear(), mo: d.getMonth() + 1, d: d.getDate(), h: d.getHours(), mi: d.getMinutes() }
  }
  const p: Record<string, number> = {}
  for (const part of f.formatToParts(new Date(ms))) {
    if (part.type !== 'literal') p[part.type] = Number(part.value)
  }
  return { y: p.year, mo: p.month, d: p.day, h: p.hour === 24 ? 0 : p.hour, mi: p.minute }
}

function zoneOffsetMs(ms: number, tz: string): number {
  const w = wallClock(ms, tz)
  const asUtc = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi)
  return asUtc - Math.floor(ms / 60_000) * 60_000
}

/** Epoch ms for a wall-clock time in zone `tz` (device local when tz is null). */
export function wallToEpoch(w: WallClock, tz: string | null): number {
  if (!tz || !zoneFormatter(tz)) return new Date(w.y, w.mo - 1, w.d, w.h, w.mi, 0, 0).getTime()
  const guess = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi)
  const off1 = zoneOffsetMs(guess - zoneOffsetMs(guess, tz), tz)
  return guess - off1
}

export function deviceZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function wallDateKey(w: WallClock): string {
  return `${w.y}-${pad2(w.mo)}-${pad2(w.d)}`
}

/** Local YYYY-MM-DD for a Date in the device zone. */
export function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** Epoch ms of an entry's start. All-day entries resolve to 00:00 in their zone. */
export function entryStartMs(entry: Pick<CalendarEntry, 'date' | 'time' | 'tz'>): number {
  const [y, mo, d] = entry.date.split('-').map(Number)
  const [h, mi] = entry.time ? entry.time.split(':').map(Number) : [0, 0]
  return wallToEpoch({ y, mo, d, h, mi }, entry.tz ?? null)
}

export function entryStart(entry: Pick<CalendarEntry, 'date' | 'time' | 'tz'>): Date {
  return new Date(entryStartMs(entry))
}

/** Short zone tag ("TOKYO") when an entry was made in a different zone than this device. */
export function zoneTag(entry: Pick<CalendarEntry, 'tz'>, here: string | null): string | null {
  if (!entry.tz || !here || entry.tz === here) return null
  const city = entry.tz.split('/').pop() || entry.tz
  return city.replace(/_/g, ' ').toUpperCase()
}

// ─── fold ───────────────────────────────────────────────────────────────────

export function alertKey(entryId: string, phase: AlertPhase, snoozeUntil?: number | null): string {
  return phase === 'SNZ' ? `${entryId}:SNZ@${snoozeUntil}` : `${entryId}:${phase}`
}

/** Key of a logged calendar_alert (new logs carry `key`; legacy ones are derived). */
export function loggedAlertKey(md: Record<string, any>): string | null {
  if (typeof md.key === 'string' && md.key) return md.key
  if (!md.entryId || !md.phase) return null
  if (md.phase === 'SNZ') {
    const until = Date.parse(md.snoozeUntil)
    return Number.isFinite(until) ? alertKey(md.entryId, 'SNZ', until) : null
  }
  return alertKey(md.entryId, md.phase)
}

/** Fold the log stream into current calendar state. */
export function foldCalendar(logs: RawCalendarLog[]): {
  entries: CalendarEntry[]
  firedAlerts: Set<string>
  /** Fired alert logs keyed by alert key → fired-at epoch ms (for cross-device display). */
  firedAt: Map<string, number>
} {
  // Oldest first so later status changes win.
  const sorted = [...logs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const byId = new Map<string, CalendarEntry>()
  const firedAlerts = new Set<string>()
  const firedAt = new Map<string, number>()

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
        tz: isValidZone(md.tz) ? md.tz : null,
        text,
        type,
        status: 'open',
        snoozeUntil: null,
        createdAt: new Date(log.createdAt).toISOString(),
      })
    } else if (log.event === 'calendar_status') {
      const entry = byId.get(md.entryId)
      if (!entry) continue
      if (md.status === 'done' || md.status === 'cancelled' || md.status === 'open') {
        entry.status = md.status
        if (md.status !== 'open') entry.snoozeUntil = null
      }
    } else if (log.event === 'calendar_snooze') {
      const entry = byId.get(md.entryId)
      const until = Date.parse(md.until)
      if (!entry || !Number.isFinite(until)) continue
      entry.snoozeUntil = until
    } else if (log.event === 'calendar_alert') {
      const key = loggedAlertKey(md)
      if (!key) continue
      firedAlerts.add(key)
      const at = Date.parse(md.firedAt) || new Date(log.createdAt).getTime()
      if (!firedAt.has(key)) firedAt.set(key, at)
    }
  }

  const entries = [...byId.values()].sort(compareEntries)
  return { entries, firedAlerts, firedAt }
}

export function compareEntries(a: CalendarEntry, b: CalendarEntry): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  // All-day entries first within a day, then by time.
  if (a.time === b.time) return a.createdAt < b.createdAt ? -1 : 1
  if (a.time === null) return -1
  if (b.time === null) return 1
  return a.time < b.time ? -1 : 1
}

// ─── alert engine ───────────────────────────────────────────────────────────

export type DueAlert = { entry: CalendarEntry; phase: AlertPhase; key: string }

/**
 * Which alerts are due at `now`.
 * - Timed entries: T-15 (lead) and T-0 (start). A phase is due once its moment
 *   has passed and is still within the grace window. If both are due (opened
 *   late), only T-0 fires and the unfired T-15 is returned in `suppressed`.
 * - All-day entries: DAY, from DAY_ALERT_HOUR in the entry's zone on its date.
 * - Snoozed entries: SNZ at `snoozeUntil` (one per snooze).
 * Only open entries alert.
 */
export function dueAlerts(
  entries: CalendarEntry[],
  fired: Set<string>,
  now: Date | number
): { due: DueAlert[]; suppressed: string[] } {
  const due: DueAlert[] = []
  const suppressed: string[] = []
  const nowMs = typeof now === 'number' ? now : now.getTime()
  const graceMs = ALERT_GRACE_MINUTES * 60_000

  for (const entry of entries) {
    if (entry.status !== 'open') continue

    if (entry.snoozeUntil !== null) {
      const key = alertKey(entry.id, 'SNZ', entry.snoozeUntil)
      const d = nowMs - entry.snoozeUntil
      if (d >= 0 && d <= graceMs && !fired.has(key)) {
        due.push({ entry, phase: 'SNZ', key })
        continue
      }
    }

    if (entry.time === null) {
      const w = wallClock(nowMs, entry.tz)
      if (entry.date !== wallDateKey(w) || w.h < DAY_ALERT_HOUR) continue
      const key = alertKey(entry.id, 'DAY')
      if (!fired.has(key)) due.push({ entry, phase: 'DAY', key })
      continue
    }

    const start = entryStartMs(entry)
    const lead = start - PRE_ALERT_MINUTES * 60_000
    const startKey = alertKey(entry.id, 'T-0')
    const leadKey = alertKey(entry.id, 'T-15')
    const startDue = nowMs >= start && nowMs - start <= graceMs
    const leadDue = nowMs >= lead && nowMs < start

    if (startDue && !fired.has(startKey)) {
      due.push({ entry, phase: 'T-0', key: startKey })
      if (!fired.has(leadKey)) suppressed.push(leadKey)
    } else if (leadDue && !fired.has(leadKey)) {
      due.push({ entry, phase: 'T-15', key: leadKey })
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
  if (d > 0) return `T${sign}${d}D ${pad2(h)}H`
  return `T${sign}${pad2(h)}:${pad2(m)}:${pad2(s)}`
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/**
 * Military date-time group, e.g. "171430L NOV 26".
 * Suffix L = device local; with a zone, the time is in that zone and the
 * suffix stays L (local to the entry's operator) — the zone is logged separately.
 */
export function formatDTG(d: Date | number, tz: string | null = null): string {
  const w = wallClock(typeof d === 'number' ? d : d.getTime(), tz)
  return `${pad2(w.d)}${pad2(w.h)}${pad2(w.mi)}L ${MONTHS[w.mo - 1]} ${String(w.y).slice(-2)}`
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
  SNZ: 'SNOOZE · RE-ALERT',
}

/** Priority of an alert — timed starts of tasks/calls (and their snoozes) escalate to FLASH. */
export function alertPriority(entry: CalendarEntry, phase: AlertPhase): AlertPriority {
  if ((phase === 'T-0' || phase === 'SNZ') && entry.type !== 'note') return 'FLASH'
  if (phase === 'T-0' || phase === 'T-15' || phase === 'SNZ') return 'IMMEDIATE'
  return 'ROUTINE'
}

/** Single-line text for the Log + system notification. */
export function alertLogText(entry: CalendarEntry, phase: AlertPhase, firedAt: Date | number): string {
  const when = entry.time ? `${entry.date} ${entry.time}` : entry.date
  return `[${alertPriority(entry, phase)}] CAL ${PHASE_LABEL[phase]} · ${TYPE_CODE[entry.type]} · ${entry.text} · ${when} · DTG ${formatDTG(firedAt, entry.tz)}`
}

/** Metadata for a calendar_alert log. Same shape from client and server. */
export function alertMetadata(
  a: DueAlert,
  firedAt: number,
  source: 'client' | 'watch'
): Record<string, any> {
  return {
    key: a.key,
    entryId: a.entry.id,
    phase: a.phase,
    priority: alertPriority(a.entry, a.phase),
    date: a.entry.date,
    time: a.entry.time,
    tz: a.entry.tz,
    entryType: a.entry.type,
    text: a.entry.text,
    snoozeUntil: a.phase === 'SNZ' && a.entry.snoozeUntil ? new Date(a.entry.snoozeUntil).toISOString() : undefined,
    firedAt: new Date(firedAt).toISOString(),
    source,
  }
}
