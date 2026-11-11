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
import type { CalendarEntry, EntryType, Repeat } from '#client/utils/calendarFeed'
import type { AlertStage } from '#client/utils/calendarAlerts'

export type { EntryType, CalendarEntry, Repeat } from '#client/utils/calendarFeed'

const FEED_KEY = ['/api/calendar']

/** Entries, completions and already-fired alert keys, from the calendar feed. */
export function useCalendarEntries() {
  const { data, isSuccess } = useCalendarFeed()
  // Recurring expansion (and which occurrence has lapsed) depends on the
  // clock, so re-derive once a minute even when the feed is unchanged.
  const [minute, setMinute] = React.useState(() => Math.floor(Date.now() / 60000))
  React.useEffect(() => {
    const id = setInterval(() => setMinute(Math.floor(Date.now() / 60000)), 15_000)
    return () => clearInterval(id)
  }, [])
  return React.useMemo(() => {
    const d = deriveCalendar(data || [], { now: Date.now() })
    return { ...d, ready: isSuccess }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isSuccess, minute])
}

type EntryInput = { date: string; time?: string; text: string; type: EntryType; repeat?: Repeat }

const entryMeta = (input: EntryInput) => ({
  date: input.date,
  text: input.text,
  entryType: input.type,
  ...(input.time ? { time: input.time } : {}),
  ...(input.repeat ? { repeat: input.repeat } : {}),
})

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
    add(input: EntryInput, after?: () => void) {
      const label = `${stamp(input)}${input.repeat ? ' · ' + input.repeat : ''}`
      write({
        text: `[SCHEDULE] ${input.type}: ${input.text} (${label})`,
        event: 'calendar_entry',
        metadata: entryMeta(input),
      }, after)
    },
    /** Edit = a new calendar_entry that supersedes the old one (whole series for an occurrence). */
    edit(prev: CalendarEntry, input: EntryInput, after?: () => void) {
      const replaces = prev.seriesId || prev.id
      const label = `${stamp(input)}${input.repeat ? ' · ' + input.repeat : ''}`
      write({
        text: `[EDIT] ${input.type}: ${input.text} (${label})`,
        event: 'calendar_entry',
        metadata: { ...entryMeta(input), replaces, edited: true },
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
    /** Scrub one entry / one occurrence; `series: true` scrubs every occurrence. */
    cancel(e: CalendarEntry, opts: { series?: boolean } = {}) {
      const series = !!(opts.series && e.seriesId)
      write({
        text: `[${series ? 'SCRUB SERIES' : e.seriesId ? 'SKIP' : 'SCRUB'}] ${e.type}: ${e.text} (${series ? e.repeat : stamp(e)})`,
        event: 'calendar_cancel',
        metadata: {
          entryId: series ? e.seriesId : e.id, date: e.date, time: e.time, text: e.text,
          stage: series ? 'SCRUBBED SERIES' : e.seriesId ? 'SKIPPED' : 'SCRUBBED',
        },
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
