/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import type { Log } from '#shared/types'

// Pure calendar logic (no React / no network) so the widget stays thin.

export type EntryType = 'note' | 'task' | 'call'
export type AlertStage = 'T-15' | 'T-0' | 'OVERDUE'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  text: string
  type: EntryType
  startedAt?: number // epoch ms
  doneAt?: number // epoch ms
  elapsedMin?: number
  alerted: AlertStage[]
}

type RawLog = Pick<Log, 'id' | 'event' | 'text' | 'createdAt' | 'metadata'>

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const OVERDUE_AFTER_MIN = 5
const OVERDUE_WINDOW_MIN = 12 * 60

export function buildEntries(logs: readonly RawLog[]): CalendarEntry[] {
  const byId = new Map<string, CalendarEntry>()
  const sorted = [...logs].sort((a, b) =>
    String(a.createdAt || '').localeCompare(String(b.createdAt || ''))
  )

  for (const log of sorted) {
    const m = log.metadata || {}
    if (log.event === 'calendar_entry') {
      const date = m.date as string
      const text = ((m.text as string) || log.text || '').trim()
      if (!date || !text) continue
      byId.set(log.id, {
        id: log.id,
        date,
        time: TIME_RE.test(m.time || '') ? m.time : undefined,
        text,
        type: (m.entryType as EntryType) || 'note',
        alerted: [],
      })
    }
  }

  for (const log of sorted) {
    const m = log.metadata || {}
    const entry = byId.get(m.entryId as string)
    if (!entry) continue
    const at = log.createdAt ? new Date(log.createdAt).getTime() : Date.now()
    if (log.event === 'calendar_start' && !entry.startedAt) {
      entry.startedAt = (m.startedAt as number) || at
    } else if (log.event === 'calendar_done' && !entry.doneAt) {
      entry.doneAt = (m.doneAt as number) || at
      if (typeof m.elapsedMin === 'number') entry.elapsedMin = m.elapsedMin
    } else if (log.event === 'calendar_alert' && m.stage) {
      if (!entry.alerted.includes(m.stage)) entry.alerted.push(m.stage)
    }
  }

  return [...byId.values()].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time || '99:99').localeCompare(b.time || '99:99') ||
      a.id.localeCompare(b.id)
  )
}

/** Minutes until the entry starts (negative = past). Null if untimed. */
export function minutesUntil(entry: CalendarEntry, now: Date): number | null {
  if (!entry.time) return null
  const [h, mi] = entry.time.split(':').map(Number)
  const [y, mo, d] = entry.date.split('-').map(Number)
  const at = new Date(y, mo - 1, d, h, mi, 0, 0)
  return Math.floor((at.getTime() - now.getTime()) / 60000)
}

/** The single alert stage that applies right now, or null. */
export function currentStage(entry: CalendarEntry, now: Date): AlertStage | null {
  if (entry.doneAt) return null
  const mins = minutesUntil(entry, now)
  if (mins === null) return null
  if (entry.startedAt && mins <= 0) return null // already underway
  if (mins <= -OVERDUE_AFTER_MIN && mins >= -OVERDUE_WINDOW_MIN) return 'OVERDUE'
  if (mins <= 0 && mins > -OVERDUE_AFTER_MIN) return 'T-0'
  if (mins > 0 && mins <= 15) return 'T-15'
  return null
}

export function formatCountdown(mins: number): string {
  const abs = Math.abs(mins)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const body = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return mins >= 0 ? `T-${body}` : `T+${body}`
}

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
