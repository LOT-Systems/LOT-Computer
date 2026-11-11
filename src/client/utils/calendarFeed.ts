/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Pure: calendar_* Log rows → current calendar state. No React, no network.
 *
 * The Log is append-only, so every change is a new row:
 *   calendar_entry   create (metadata.repeat → recurring series,
 *                    metadata.replaces → supersedes an earlier entry = edit)
 *   calendar_done    complete one entry / one occurrence
 *   calendar_snooze  push the alert of one entry / occurrence
 *   calendar_cancel  scrub one entry, one occurrence, or a whole series
 *   calendar_alert   an alert that already fired (dedupe key)
 *
 * Recurring series expand into occurrences with id `${seriesId}@${date}`;
 * done / snooze / cancel / alert rows for an occurrence use that id.
 */

// Kept import-free so it runs under plain node for tests.
const isValidTime = (t: unknown): t is string => typeof t === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(t)
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export type FeedLog = {
  id: string | number
  event: string
  text?: string
  metadata?: Record<string, any> | null
  createdAt?: string
}

export type EntryType = 'note' | 'task' | 'call'
export type Repeat = 'daily' | 'weekdays' | 'weekly'
export const REPEATS: Repeat[] = ['daily', 'weekdays', 'weekly']

export type CalendarEntry = {
  id: string
  date: string
  time?: string
  text: string
  type: EntryType
  done: boolean
  doneAt?: number
  doneFrom?: string
  snoozeUntil?: number
  snoozeGen: number
  /** Set on occurrences of a recurring series (id of the defining calendar_entry). */
  seriesId?: string
  repeat?: Repeat
  /** The next occurrence of the same series is already in its alert window; this one is history. */
  lapsed?: boolean
}

export type DeriveOptions = {
  /** Epoch ms used to bound recurring expansion (default: Date.now()). */
  now?: number
  /** Days of recurring history to expand (for on-time stats). */
  backDays?: number
  /** Days ahead to expand recurring series. */
  horizonDays?: number
}

const pad2 = (n: number) => String(n).padStart(2, '0')
export const ymd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

function parseDate(s: string): Date | null {
  const m = DATE_RE.exec(s)
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null
}

function matchesRepeat(repeat: Repeat, base: Date, d: Date) {
  if (repeat === 'daily') return true
  if (repeat === 'weekdays') return d.getDay() >= 1 && d.getDay() <= 5
  return d.getDay() === base.getDay() // weekly
}

/** Dates (YYYY-MM-DD) of a series between `from` and `to` inclusive, never before its base date. */
export function seriesDates(baseDate: string, repeat: Repeat, from: Date, to: Date): string[] {
  const base = parseDate(baseDate)
  if (!base) return []
  const start = base > from ? base : new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const out: string[] = []
  for (let d = new Date(start); d <= to && out.length < 400; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    if (matchesRepeat(repeat, base, d)) out.push(ymd(d))
  }
  return out
}

const startOf = (date: string, time?: string) => {
  const d = parseDate(date)
  if (!d) return 0
  const [h, m] = time ? time.split(':').map(Number) : [8, 0]
  d.setHours(h, m, 0, 0)
  return d.getTime()
}

/** Pure reducer: Log rows → entries + fired alert keys. Exported for tests. */
export function deriveCalendar(logs: FeedLog[], opts: DeriveOptions = {}) {
  const now = opts.now ?? Date.now()
  const backDays = opts.backDays ?? 8
  const horizonDays = opts.horizonDays ?? 92

  const done = new Map<string, { at?: number; from?: string }>()
  const cancelIds = new Set<string>()
  const firedKeys = new Set<string>()
  const snoozes = new Map<string, { until: number; gen: number }>()
  const replaced = new Set<string>()

  for (const log of logs) {
    const m = log.metadata || {}
    const eid = m.entryId != null ? String(m.entryId) : ''
    if (log.event === 'calendar_done' && eid) {
      const at = Number(m.at) || (log.createdAt ? Date.parse(log.createdAt) : NaN)
      done.set(eid, { at: Number.isFinite(at) ? at : undefined, from: typeof m.from === 'string' ? m.from : undefined })
    } else if (log.event === 'calendar_cancel' && eid) cancelIds.add(eid)
    else if (log.event === 'calendar_alert' && m.key) firedKeys.add(String(m.key))
    else if (log.event === 'calendar_entry' && m.replaces != null) replaced.add(String(m.replaces))
    else if (log.event === 'calendar_snooze' && eid) {
      const until = Number(m.until)
      const gen = Number(m.gen) || 1
      if (!Number.isFinite(until)) continue
      const prev = snoozes.get(eid)
      if (!prev || gen > prev.gen) snoozes.set(eid, { until, gen })
    }
  }

  const make = (id: string, date: string, time: string | undefined, text: string, type: EntryType): CalendarEntry => {
    const s = snoozes.get(id)
    const d = done.get(id)
    return {
      id, date, time, text, type,
      done: !!d,
      ...(d?.at ? { doneAt: d.at } : {}),
      ...(d?.from ? { doneFrom: d.from } : {}),
      snoozeUntil: s?.until,
      snoozeGen: s?.gen || 0,
    }
  }

  const nowD = new Date(now)
  const from = new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate() - backDays)
  const to = new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate() + horizonDays)

  const entries: CalendarEntry[] = []
  for (const log of logs) {
    if (log.event !== 'calendar_entry' || !log.metadata) continue
    const id = String(log.id)
    if (cancelIds.has(id) || replaced.has(id)) continue
    const date = log.metadata.date as string
    const text = String((log.metadata.text as string) || log.text || '').slice(0, 280)
    if (!date || !DATE_RE.test(date) || !text) continue
    const time = isValidTime(log.metadata.time) ? (log.metadata.time as string) : undefined
    const type = (['note', 'task', 'call'].includes(log.metadata.entryType) ? log.metadata.entryType : 'note') as EntryType
    const repeat = REPEATS.includes(log.metadata.repeat) ? (log.metadata.repeat as Repeat) : undefined

    if (!repeat) {
      entries.push(make(id, date, time, text, type))
      continue
    }

    const occ: CalendarEntry[] = []
    for (const d of seriesDates(date, repeat, from, to)) {
      const oid = `${id}@${d}`
      if (cancelIds.has(oid)) continue
      occ.push({ ...make(oid, d, time, text, type), seriesId: id, repeat })
    }
    // Once the next occurrence's alert window opens (T-15, or 08:00 if
    // untimed), earlier ones stop alerting: one live alert per series.
    const lead = time ? 15 * 60000 : 0
    for (let i = 0; i < occ.length - 1; i++) {
      if (startOf(occ[i + 1].date, time) - lead <= now) occ[i].lapsed = true
    }
    entries.push(...occ)
  }
  entries.sort((a, b) => `${a.date} ${a.time || '08:00'}`.localeCompare(`${b.date} ${b.time || '08:00'}`))
  return { entries, firedKeys }
}
