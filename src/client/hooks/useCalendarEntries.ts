/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useCalendarFeed, useCreateLog } from '#client/queries'
import type { CalendarLog } from '#client/queries'
import { SNOOZE_MIN } from '#client/utils/calendarAlerts'
import { deriveCalendar } from '#client/utils/calendarFeed'
import type { CalendarEntry, EntryType } from '#client/utils/calendarFeed'
import type { AlertStage } from '#client/utils/calendarAlerts'

export type { EntryType, CalendarEntry } from '#client/utils/calendarFeed'

const FEED_KEY = ['/api/calendar']

/** Entries, completions and already-fired alert keys, from the calendar feed. */
export function useCalendarEntries() {
  const { data, isSuccess } = useCalendarFeed()
  return React.useMemo(() => {
    const d = deriveCalendar(data || [])
    return { ...d, ready: isSuccess }
  }, [data, isSuccess])
}

const stamp = (e: Pick<CalendarEntry, 'date' | 'time'>) => `${e.date}${e.time ? ' ' + e.time : ''}`

/**
 * All calendar writes go through here. Each write is appended to the feed
 * cache on success (so the alert engine sees it before the next poll) and
 * the main Log is invalidated so the record shows up there too.
 */
export function useCalendarActions() {
  const queryClient = useQueryClient()
  const { mutate } = useCreateLog()

  const write = React.useCallback(
    (body: { text: string; event: string; metadata: Record<string, any> }, after?: () => void) => {
      mutate(body, {
        onSuccess: (log: any) => {
          queryClient.setQueryData<CalendarLog[]>(FEED_KEY, (prev = []) =>
            log && log.id ? [{ id: log.id, event: body.event, text: body.text, metadata: body.metadata, createdAt: log.createdAt }, ...prev] : prev
          )
          queryClient.invalidateQueries(FEED_KEY)
          queryClient.invalidateQueries(['/api/logs'])
          after?.()
        },
      })
    },
    [mutate, queryClient]
  )

  return React.useMemo(() => ({
    add(input: { date: string; time?: string; text: string; type: EntryType }, after?: () => void) {
      const label = `${input.date}${input.time ? ' ' + input.time : ''}`
      write({
        text: `[SCHEDULE] ${input.type}: ${input.text} (${label})`,
        event: 'calendar_entry',
        metadata: { date: input.date, text: input.text, entryType: input.type, ...(input.time ? { time: input.time } : {}) },
      }, after)
    },
    done(e: CalendarEntry, stage: AlertStage | 'MANUAL' = 'MANUAL') {
      if (e.done) return
      write({
        text: `[DONE] ${e.type}: ${e.text} (${stamp(e)})`,
        event: 'calendar_done',
        metadata: { entryId: e.id, date: e.date, time: e.time, text: e.text, stage: 'DONE', from: stage, at: Date.now() },
      })
    },
    snooze(e: CalendarEntry, minutes = SNOOZE_MIN) {
      const until = Date.now() + minutes * 60_000
      const gen = (e.snoozeGen || 0) + 1
      const hhmm = new Date(until).toTimeString().slice(0, 5)
      write({
        text: `[SNOOZE +${minutes}m] ${e.type}: ${e.text} → ${hhmm}`,
        event: 'calendar_snooze',
        metadata: { entryId: e.id, date: e.date, time: e.time, text: e.text, stage: `SNOOZE +${minutes}M`, until, gen, minutes },
      })
    },
    cancel(e: CalendarEntry) {
      write({
        text: `[SCRUB] ${e.type}: ${e.text} (${stamp(e)})`,
        event: 'calendar_cancel',
        metadata: { entryId: e.id, date: e.date, time: e.time, text: e.text, stage: 'SCRUBBED' },
      })
    },
    alert(e: CalendarEntry, stage: AlertStage, key: string) {
      write({
        text: `[ALERT ${stage}] ${e.type}: ${e.text} (${stamp(e)})`,
        event: 'calendar_alert',
        metadata: { key, entryId: e.id, stage, date: e.date, time: e.time, text: e.text, entryType: e.type, gen: e.snoozeGen || 0 },
      })
    },
  }), [write])
}
