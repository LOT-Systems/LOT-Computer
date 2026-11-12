/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useCalendarLogs, useCreateLog } from '#client/queries'
import {
  buildCalendar,
  formatMilTime,
  TYPE_CODE,
  type AlertStage,
  type CalendarEntry,
  type CalendarLogLike,
  type EntryStatus,
  type EntryType,
} from '#client/utils/calendar'

const CAL_KEY = ['/api/calendar']
const LOGS_KEY = ['/api/logs']

/** Re-render on a fixed cadence so countdowns and alert windows stay live. */
export function useNow(intervalMs: number): number {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const tick = () => setNow(Date.now())
    const id = window.setInterval(() => {
      if (!document.hidden) tick()
    }, intervalMs)
    const onVis = () => { if (!document.hidden) tick() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [intervalMs])
  return now
}

function formatDateLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export function useCalendar() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useCalendarLogs()
  const logs = data ?? []
  // Ready once any feed has landed — a later failed refetch keeps cached data,
  // so alerts keep firing through transient network errors.
  const isReady = data !== undefined
  const { mutate: createLog } = useCreateLog()

  const entries = React.useMemo<CalendarEntry[]>(
    () => buildCalendar(logs as unknown as CalendarLogLike[]),
    [logs]
  )

  /** Insert a provisional log so the UI (and alert dedupe) reacts before the round-trip. */
  const pushLocal = React.useCallback((log: CalendarLogLike) => {
    queryClient.setQueryData<any[]>(CAL_KEY, (prev = []) => [log, ...prev])
  }, [queryClient])

  const sync = React.useCallback(() => {
    queryClient.invalidateQueries(CAL_KEY)
    queryClient.invalidateQueries(LOGS_KEY)
  }, [queryClient])

  const write = React.useCallback(
    (text: string, event: string, metadata: Record<string, any>, onDone?: () => void) => {
      const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      pushLocal({ id: tempId, event, text, metadata, createdAt: new Date().toISOString() })
      createLog({ text, event, metadata }, {
        onSuccess: () => { sync(); onDone?.() },
        onError: () => {
          // Roll back the provisional row so the UI never shows a phantom entry.
          queryClient.setQueryData<any[]>(CAL_KEY, (prev = []) => prev.filter(l => l.id !== tempId))
        },
      })
    },
    [createLog, pushLocal, sync, queryClient]
  )

  const addEntry = React.useCallback(
    (input: { date: string; time: string | null; text: string; type: EntryType }, onDone?: () => void) => {
      const text = input.text.trim()
      if (!text) return
      const when = `${formatDateLabel(input.date)}${input.time ? ` ${input.time}` : ''}`
      write(
        `[SCHEDULE] ${TYPE_CODE[input.type]} · ${text} · ${when}`,
        'calendar_entry',
        { date: input.date, time: input.time, text, entryType: input.type },
        onDone
      )
    },
    [write]
  )

  const setStatus = React.useCallback(
    (entry: CalendarEntry, status: EntryStatus) => {
      if (entry.id.startsWith('tmp-')) return // not persisted yet
      const verb = status === 'done' ? 'COMPLETE' : status === 'scrubbed' ? 'SCRUBBED' : 'REOPENED'
      write(
        `[SCHEDULE] ${verb} · ${TYPE_CODE[entry.type]} · ${entry.text}`,
        'calendar_status',
        { entryId: entry.id, status, date: entry.date, time: entry.time, text: entry.text, entryType: entry.type }
      )
    },
    [write]
  )

  const logAlert = React.useCallback(
    (entry: CalendarEntry, stage: AlertStage) => {
      if (entry.id.startsWith('tmp-')) return
      write(
        `[ALERT] ${stage} · ${TYPE_CODE[entry.type]} · ${entry.text} · ${entry.date} ${formatMilTime(entry.time)}`,
        'calendar_alert',
        { entryId: entry.id, stage, date: entry.date, time: entry.time, text: entry.text, entryType: entry.type }
      )
    },
    [write]
  )

  return { entries, isLoading, isError, isReady, addEntry, setStatus, logAlert }
}
