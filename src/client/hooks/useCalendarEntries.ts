/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useLogs } from '#client/queries'
import { isValidTime } from '#client/utils/calendarAlerts'

export type EntryType = 'note' | 'task' | 'call'

export type CalendarEntry = {
  id: string
  date: string
  time?: string
  text: string
  type: EntryType
  done: boolean
}

/** Derive calendar entries, completions and already-fired alert keys from the Log. */
export function useCalendarEntries() {
  const { data: logs = [], isSuccess } = useLogs()

  return React.useMemo(() => {
    const doneIds = new Set<string>()
    const firedKeys = new Set<string>()
    for (const log of logs) {
      if (log.event === 'calendar_done' && log.metadata?.entryId) {
        doneIds.add(String(log.metadata.entryId))
      } else if (log.event === 'calendar_alert' && log.metadata?.key) {
        firedKeys.add(String(log.metadata.key))
      }
    }

    const entries: CalendarEntry[] = []
    for (const log of logs) {
      if (log.event !== 'calendar_entry' || !log.metadata) continue
      const date = log.metadata.date as string
      const text = (log.metadata.text as string) || log.text || ''
      if (!date || !text) continue
      const time = isValidTime(log.metadata.time) ? (log.metadata.time as string) : undefined
      entries.push({
        id: String(log.id),
        date,
        time,
        text,
        type: ((log.metadata.entryType as EntryType) || 'note'),
        done: doneIds.has(String(log.id)),
      })
    }
    entries.sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`))

    return { entries, firedKeys, ready: isSuccess }
  }, [logs, isSuccess])
}
