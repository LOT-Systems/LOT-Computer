/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/** Pure: calendar_* Log rows → current calendar state. No React, no network. */

// Kept import-free so it runs under plain node for tests.
const isValidTime = (t: unknown): t is string => typeof t === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(t)

export type FeedLog = {
  id: string | number
  event: string
  text?: string
  metadata?: Record<string, any> | null
}

export type EntryType = 'note' | 'task' | 'call'

export type CalendarEntry = {
  id: string
  date: string
  time?: string
  text: string
  type: EntryType
  done: boolean
  snoozeUntil?: number
  snoozeGen: number
}

/** Pure reducer: Log rows → entries + fired alert keys. Exported for tests. */
export function deriveCalendar(logs: FeedLog[]) {
  const doneIds = new Set<string>()
  const cancelIds = new Set<string>()
  const firedKeys = new Set<string>()
  const snoozes = new Map<string, { until: number; gen: number }>()

  for (const log of logs) {
    const m = log.metadata || {}
    const eid = m.entryId != null ? String(m.entryId) : ''
    if (log.event === 'calendar_done' && eid) doneIds.add(eid)
    else if (log.event === 'calendar_cancel' && eid) cancelIds.add(eid)
    else if (log.event === 'calendar_alert' && m.key) firedKeys.add(String(m.key))
    else if (log.event === 'calendar_snooze' && eid) {
      const until = Number(m.until)
      const gen = Number(m.gen) || 1
      if (!Number.isFinite(until)) continue
      const prev = snoozes.get(eid)
      if (!prev || gen > prev.gen) snoozes.set(eid, { until, gen })
    }
  }

  const entries: CalendarEntry[] = []
  for (const log of logs) {
    if (log.event !== 'calendar_entry' || !log.metadata) continue
    const id = String(log.id)
    if (cancelIds.has(id)) continue
    const date = log.metadata.date as string
    const text = (log.metadata.text as string) || log.text || ''
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !text) continue
    const time = isValidTime(log.metadata.time) ? (log.metadata.time as string) : undefined
    const s = snoozes.get(id)
    entries.push({
      id,
      date,
      time,
      text,
      type: (['note', 'task', 'call'].includes(log.metadata.entryType) ? log.metadata.entryType : 'note') as EntryType,
      done: doneIds.has(id),
      snoozeUntil: s?.until,
      snoozeGen: s?.gen || 0,
    })
  }
  entries.sort((a, b) => `${a.date} ${a.time || '08:00'}`.localeCompare(`${b.date} ${b.time || '08:00'}`))
  return { entries, firedKeys }
}

