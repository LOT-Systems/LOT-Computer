/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar Alert — due-time matching for the Calendar widget's time
 * tracking. Pure helpers, no React: given the current logs and the
 * current time, decide whether a timed calendar_entry has come due and
 * has not already fired.
 */

import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import type { Log } from '#shared/types'

const FIRED_STORAGE_KEY = 'lot_calendar_alerts_fired'
const FIRED_STORAGE_MAX = 200

// A due entry only fires within this window after its scheduled time —
// older stale entries (app closed past due, or entries created before
// this feature existed) are shown in the log/list but never alert.
export const DUE_GRACE_MINUTES = 3

export type DueCalendarEntry = {
  id: string
  date: string
  time: string
  entryType: string
  text: string
  due: Dayjs
}

export function getFiredCalendarAlertIds(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch (_) {
    return new Set()
  }
}

export function markCalendarAlertFired(id: string): void {
  try {
    const fired = getFiredCalendarAlertIds()
    fired.add(id)
    const trimmed = Array.from(fired).slice(-FIRED_STORAGE_MAX)
    localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(trimmed))
  } catch (_) {}
}

export function findDueCalendarEntry(logs: Log[], now: Dayjs = dayjs()): DueCalendarEntry | null {
  const fired = getFiredCalendarAlertIds()

  for (const log of logs) {
    if (log.event !== 'calendar_entry' || !log.metadata || fired.has(log.id)) continue

    const date = log.metadata.date as string | undefined
    const time = log.metadata.time as string | undefined
    if (!date || !time) continue

    const due = dayjs(`${date}T${time}`)
    if (!due.isValid()) continue
    if (due.isAfter(now)) continue
    if (due.isBefore(now.subtract(DUE_GRACE_MINUTES, 'minute'))) continue

    return {
      id: log.id,
      date,
      time,
      entryType: (log.metadata.entryType as string) || 'note',
      text: (log.metadata.text as string) || log.text || '',
      due,
    }
  }

  return null
}
