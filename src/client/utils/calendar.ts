/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Calendar core: event-sourced entries + alert scheduling. Pure (no React, no dayjs)
// so the logic is unit-testable. Logs are append-only, so state is derived from
// `calendar_entry` logs by metadata.kind:
//   'event'  (default) — creates an entry
//   'status' — entryId + status ('done' | 'cancelled')
//   'alert'  — entryId + stage (alert already fired; dedupe key)

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
export type AlertStage = 'T-15' | 'T-0' | 'MISSED'

export const STAGE_RANK: Record<AlertStage, number> = { 'T-15': 1, 'T-0': 2, MISSED: 3 }

export const ALL_DAY_HOUR = 9 // untimed entries are due 09:00 local
const WARN_MS = 15 * 60_000
const NOW_WINDOW_MS = 10 * 60_000
const MISSED_WINDOW_MS = 24 * 3_600_000

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm
  text: string
  type: EntryType
  status: EntryStatus
  alerts: AlertStage[]
}

export type RawLog = {
  id: string
  event: string
  text?: string | null
  createdAt: string | Date
  metadata?: Record<string, any> | null
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidTime(t: string) {
  return TIME_RE.test(t)
}

export function buildEntries(logs: RawLog[]): CalendarEntry[] {
  const rows = logs
    .filter(l => l.event === 'calendar_entry' && l.metadata)
    .slice()
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))

  const map = new Map<string, CalendarEntry>()
  const pendingStatus = new Map<string, EntryStatus>()
  const pendingAlerts = new Map<string, AlertStage[]>()

  for (const l of rows) {
    const m = l.metadata!
    const kind = (m.kind as string) || 'event'
    if (kind === 'event') {
      const date = m.date as string
      const text = ((m.text as string) || l.text || '').trim()
      if (!date || !DATE_RE.test(date) || !text) continue
      const id = (m.entryId as string) || l.id
      if (map.has(id)) continue
      const time = typeof m.time === 'string' && TIME_RE.test(m.time) ? m.time : null
      map.set(id, {
        id, date, time, text,
        type: (['note', 'task', 'call'].includes(m.entryType) ? m.entryType : 'note') as EntryType,
        status: 'open', alerts: [],
      })
    } else if (kind === 'status' && m.entryId) {
      if (m.status === 'done' || m.status === 'cancelled' || m.status === 'open') {
        pendingStatus.set(m.entryId, m.status)
      }
    } else if (kind === 'alert' && m.entryId && m.stage in STAGE_RANK) {
      pendingAlerts.set(m.entryId, [...(pendingAlerts.get(m.entryId) || []), m.stage])
    }
  }
  for (const [id, e] of map) {
    e.status = pendingStatus.get(id) || 'open'
    e.alerts = pendingAlerts.get(id) || []
  }
  return [...map.values()].sort(
    (a, b) => (a.date + (a.time || '99:99')).localeCompare(b.date + (b.time || '99:99'))
  )
}

/** Due moment in local time. */
export function dueAt(e: Pick<CalendarEntry, 'date' | 'time'>): Date {
  const [y, mo, d] = e.date.split('-').map(Number)
  const [h, mi] = e.time ? e.time.split(':').map(Number) : [ALL_DAY_HOUR, 0]
  return new Date(y, mo - 1, d, h, mi, 0, 0)
}

/** The single highest-priority stage that is due now and not yet fired (null if none). */
export function pendingStage(e: CalendarEntry, now: Date): AlertStage | null {
  if (e.status !== 'open') return null
  const delta = dueAt(e).getTime() - now.getTime()
  let stage: AlertStage | null = null
  if (delta <= -MISSED_WINDOW_MS) return null // stale: stay silent
  if (delta <= -NOW_WINDOW_MS) stage = 'MISSED'
  else if (delta <= 0) stage = 'T-0'
  else if (delta <= WARN_MS) stage = 'T-15'
  if (!stage) return null
  // a stage that fired (or was superseded by a later one) is never repeated
  const maxFired = Math.max(0, ...e.alerts.map(s => STAGE_RANK[s]))
  return STAGE_RANK[stage] > maxFired ? stage : null
}

export function duplicateOf(
  entries: CalendarEntry[],
  c: { date: string; time: string | null; text: string; type: EntryType }
) {
  const t = c.text.trim().toLowerCase()
  return entries.some(
    e => e.status !== 'cancelled' && e.date === c.date && e.time === c.time &&
      e.type === c.type && e.text.toLowerCase() === t
  )
}

export function formatCountdown(ms: number): string {
  const s = Math.abs(Math.round(ms / 1000))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const body = d > 0 ? `${d}D ${h}H` : h > 0 ? `${h}H ${m}M` : `${m}M`
  return `${ms < 0 ? '-' : 'T-'}${body}`
}

export function alertLogText(e: CalendarEntry, stage: AlertStage): string {
  const when = e.time || 'ALL-DAY'
  return `[CAL // ${stage}] ${e.date} ${when} ${e.type.toUpperCase()} · ${e.text}`
}
