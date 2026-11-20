/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useCalendar, useCreateCalendarEntry, useSetCalendarStatus } from '#client/queries'
import { recordCalendarSignal, recordSignal } from '#client/stores/intentionEngine'
import { dismissCalAlertsForEntry } from '#client/stores/calendar'
import {
  type CalEntry,
  type CalEntryType,
  closeDelta,
  deriveEntries,
  firedAlertKeys,
} from '#shared/utils/calendar'

/** Live wall clock. `stepMs` 1000 for seconds display, 15000 for engines. */
export function useNow(stepMs = 1000): number {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    let id: ReturnType<typeof setTimeout>
    // align to the step boundary so the seconds column never stutters
    const schedule = () => {
      const t = Date.now()
      id = setTimeout(() => { setNow(Date.now()); schedule() }, stepMs - (t % stepMs) + 5)
    }
    schedule()
    const onVis = () => { if (!document.hidden) setNow(Date.now()) }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearTimeout(id); document.removeEventListener('visibilitychange', onVis) }
  }, [stepMs])
  return now
}

const EMPTY: never[] = []

export function useCalendarEntries() {
  const query = useCalendar()
  const logs = query.data?.logs
  const entries = React.useMemo(() => deriveEntries(logs ?? []), [logs])
  const fired = React.useMemo(() => firedAlertKeys(logs ?? []), [logs])
  return { entries, fired, logs: logs ?? EMPTY, isLoading: query.isLoading, isError: query.isError, loaded: !!query.data }
}

export function useCalendarActions() {
  const queryClient = useQueryClient()
  const { mutateAsync: createEntry, isLoading: isCreating } = useCreateCalendarEntry()
  const { mutateAsync: setStatus } = useSetCalendarStatus()

  const refresh = React.useCallback(() => {
    queryClient.invalidateQueries(['/api/calendar'])
    queryClient.invalidateQueries(['/api/logs'])
  }, [queryClient])

  const schedule = React.useCallback(
    async (input: { date: string; time: string | null; text: string; type: CalEntryType }) => {
      const log = await createEntry({ date: input.date, time: input.time, text: input.text, entryType: input.type })
      refresh()
      try { recordCalendarSignal(input.type, input.date) } catch (_) {}
      return log
    },
    [createEntry, refresh]
  )

  const close = React.useCallback(
    async (entry: CalEntry, status: 'done' | 'scrubbed' | 'active') => {
      const deltaMinutes = status === 'done' ? closeDelta(entry, Date.now()) : null
      await setStatus({ id: entry.id, status, deltaMinutes })
      // only after the server confirms — a failed clear must not look cleared
      if (status !== 'active') dismissCalAlertsForEntry(entry.id)
      refresh()
      try { recordSignal('log', 'calendar_update', { status, entryType: entry.type }) } catch (_) {}
    },
    [setStatus, refresh]
  )

  return { schedule, close, isCreating, refresh }
}
