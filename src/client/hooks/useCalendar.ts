/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * useCalendar — shared state + write actions for the Calendar widget and the
 * global alert watcher. Both read the same react-query cache (/api/calendar),
 * so a write in one surface is reflected in the other on refetch.
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useCalendarLogs, useCreateLog } from '#client/queries'
import {
  type AlertStage,
  type CalendarAlert,
  type CalendarEntry,
  type EntryStatus,
  type EntryType,
  DEFAULT_LEAD_MIN,
  foldCalendar,
  formatDTG,
  newEntryId,
} from '#client/utils/calendar'
import dayjs from '#client/utils/dayjs'

export const CALENDAR_QUERY_KEY = ['/api/calendar']

const STATUS_TAG: Record<EntryStatus, string> = {
  active: 'RESTORED',
  done: 'DONE',
  cancelled: 'CANCELLED',
}

export function useCalendar() {
  const queryClient = useQueryClient()
  const { data: logs, isLoading, isError } = useCalendarLogs()
  const { mutateAsync: createLog } = useCreateLog()

  const { entries, firedAlerts } = React.useMemo(() => foldCalendar(logs || []), [logs])

  const refresh = React.useCallback(() => {
    queryClient.invalidateQueries(CALENDAR_QUERY_KEY)
    queryClient.invalidateQueries(['/api/logs'])
  }, [queryClient])

  const addEntry = React.useCallback(
    async (input: { date: string; time: string | null; text: string; type: EntryType; lead?: number }) => {
      const text = input.text.trim()
      if (!text) return null
      const id = newEntryId()
      const lead = input.lead ?? DEFAULT_LEAD_MIN
      const dateLabel = dayjs(input.date).format('dddd, MMMM D, YYYY')
      const when = input.time ? `${dateLabel} · ${input.time}` : dateLabel
      const log = await createLog({
        text: `[SCHEDULE] ${input.type}: ${text} (${when})`,
        event: 'calendar_entry',
        metadata: {
          id,
          date: input.date,
          time: input.time,
          text,
          entryType: input.type,
          lead,
          dtg: formatDTG(input.date, input.time),
          v: 2,
        },
      })
      refresh()
      return log
    },
    [createLog, refresh]
  )

  const setStatus = React.useCallback(
    async (entry: CalendarEntry, status: EntryStatus) => {
      if (entry.status === status) return
      await createLog({
        text: `[${STATUS_TAG[status]}] ${entry.type}: ${entry.text} (${formatDTG(entry.date, entry.time)})`,
        event: 'calendar_entry_status',
        metadata: {
          entryId: entry.id,
          status,
          date: entry.date,
          time: entry.time,
          text: entry.text,
          entryType: entry.type,
        },
      })
      refresh()
    },
    [createLog, refresh]
  )

  const logAlert = React.useCallback(
    async (alert: CalendarAlert) => {
      const { entry, stage } = alert
      const dtg = formatDTG(entry.date, entry.time)
      await createLog({
        text: `[${stage}] ${dtg} — ${entry.type.toUpperCase()}: ${entry.text}`,
        event: 'calendar_alert',
        metadata: {
          entryId: entry.id,
          stage,
          dtg,
          date: entry.date,
          time: entry.time,
          text: entry.text,
          entryType: entry.type,
          firedAt: new Date().toISOString(),
        },
      })
      refresh()
    },
    [createLog, refresh]
  )

  return { entries, firedAlerts, isLoading, isError, addEntry, setStatus, logAlert, refresh }
}

export type { AlertStage, CalendarEntry, EntryType, EntryStatus }
