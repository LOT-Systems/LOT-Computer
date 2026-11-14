/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { Block, Button } from '#client/components/ui'
import { useCalendar, useCreateLog, useSetCalendarStatus } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import {
  ENTRY_TYPES,
  day,
  formatCountdown,
  isOverdue,
  nextEntry,
  newEntryId,
  normalizeTime,
  reduceCalendarLogs,
  type CalendarEntry,
  type EntryStatus,
  type EntryType,
} from '#client/utils/calendar'
import { requestCalendarNotificationPermission } from './CalendarAlerts'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const CLOCK_TICK_MS = 30 * 1000
const UPCOMING_LIMIT = 10

function getMonthWeeks(year: number, month: number): Dayjs[][] {
  const first = dayjs().year(year).month(month).startOf('month')
  const last = first.endOf('month')

  const isoDay = first.day() === 0 ? 6 : first.day() - 1
  const start = first.subtract(isoDay, 'day')

  const weeks: Dayjs[][] = []
  let current = start

  while (current.isBefore(last) || current.isSame(last, 'day') || weeks.length < 5) {
    const week: Dayjs[] = []
    for (let i = 0; i < 7; i++) {
      week.push(current)
      current = current.add(1, 'day')
    }
    weeks.push(week)
    if (weeks.length >= 6) break
  }

  return weeks
}

function useNow(intervalMs: number): Dayjs {
  const [now, setNow] = React.useState(() => dayjs())
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(dayjs()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

export function CalendarWidget() {
  const queryClient = useQueryClient()
  const { data: rows = [] } = useCalendar()
  const { mutate: createLog, isLoading: isCreating } = useCreateLog()
  const { mutate: setStatus } = useSetCalendarStatus()
  const now = useNow(CLOCK_TICK_MS)

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [activeEntryId, setActiveEntryId] = React.useState<string | null>(null)

  const refresh = React.useCallback(() => {
    queryClient.invalidateQueries(['/api/calendar'])
    queryClient.invalidateQueries(['/api/logs'])
  }, [queryClient])

  const entries = React.useMemo(() => reduceCalendarLogs(rows), [rows])

  const today = now.format('YYYY-MM-DD')

  const overdueEntries = React.useMemo(
    () => entries.filter((e) => isOverdue(e, now)),
    [entries, now]
  )

  const upcomingEntries = React.useMemo(
    () =>
      entries
        .filter((e) => e.status === 'open' && e.date >= today && !isOverdue(e, now))
        .slice(0, UPCOMING_LIMIT),
    [entries, today, now]
  )

  const next = React.useMemo(() => nextEntry(entries, now), [entries, now])

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter((e) => e.date === selectedDate)
  }, [entries, selectedDate])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => {
      if (e.status !== 'cancelled') set.add(e.date)
    })
    return set
  }, [entries])

  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    setSelectedDate(selectedDate === key ? null : key)
    setIsAddingEntry(false)
  }

  const handleAddEntry = () => {
    const text = entryText.trim()
    if (!selectedDate || !text || isCreating) return

    const time = normalizeTime(entryTime)
    const entryId = newEntryId()
    const dateLabel = day(selectedDate).format('dddd, MMMM D, YYYY')
    const date = selectedDate

    createLog(
      {
        text: `[SCHEDULE] ${entryType}: ${text} (${dateLabel}${time ? ` · ${time}` : ''})`,
        event: 'calendar_entry',
        metadata: { entryId, date, time, text, entryType },
      },
      {
        onSuccess: () => {
          refresh()
          try {
            recordCalendarSignal(entryType, date)
          } catch (_) {}
        },
      }
    )

    // Timed entries are what alerts are for — ask for system notifications
    // here, inside the user gesture, so the browser allows the prompt.
    if (time) requestCalendarNotificationPermission()

    setEntryText('')
    setEntryTime('')
    setIsAddingEntry(false)
  }

  const handleStatus = (entry: CalendarEntry, status: EntryStatus) => {
    setStatus({ entryId: entry.id, status }, { onSuccess: refresh })
    setActiveEntryId(null)
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) {
      setViewMonth(dayjs())
    }
    setIsCalendarOpen(!isCalendarOpen)
  }

  const renderActions = (entry: CalendarEntry) => (
    <div className="flex gap-16 mt-4 text-acc/60">
      {entry.status === 'open' ? (
        <>
          {entry.type !== 'note' && (
            <button className="hover:text-acc" onClick={() => handleStatus(entry, 'done')}>
              Done
            </button>
          )}
          <button className="hover:text-acc" onClick={() => handleStatus(entry, 'cancelled')}>
            Cancel
          </button>
        </>
      ) : (
        <button className="hover:text-acc" onClick={() => handleStatus(entry, 'open')}>
          Reopen
        </button>
      )}
    </div>
  )

  const renderRow = (entry: CalendarEntry, overdue = false) => {
    const isActive = activeEntryId === entry.id
    return (
      <div key={entry.id}>
        <button
          className="w-full flex flex-wrap justify-between gap-x-16 text-left"
          onClick={() => setActiveEntryId(isActive ? null : entry.id)}
        >
          <span className={cn('whitespace-nowrap', overdue ? 'text-acc/60' : 'text-acc')}>
            {day(entry.date).format('dddd, MMMM D, YYYY')}
            {entry.time && <span className="tabular-nums"> {entry.time}</span>}
          </span>
          <span className="text-acc text-right">
            {overdue && <span className="text-acc/40 uppercase tracking-widest">Overdue </span>}
            {entry.text}
          </span>
        </button>
        {isActive && renderActions(entry)}
      </div>
    )
  }

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        <div className="mb-16 flex flex-wrap items-baseline justify-between gap-x-16 gap-y-8">
          <Button onClick={handleToggleCalendar}>Add date</Button>
          {next && (
            <span className="text-acc/40 uppercase tracking-widest tabular-nums whitespace-nowrap">
              Next {formatCountdown(next, now)}
            </span>
          )}
        </div>

        {isCalendarOpen && (
          <div className="mb-16">
            <div className="flex items-center gap-8 mb-8">
              <button
                className="text-acc/40 hover:text-acc transition-opacity"
                onClick={() => setViewMonth(viewMonth.subtract(1, 'month'))}
              >
                {'<—'}
              </button>
              <span className="text-acc">{viewMonth.format('MMMM, YYYY')}</span>
              <button
                className="text-acc/40 hover:text-acc transition-opacity"
                onClick={() => setViewMonth(viewMonth.add(1, 'month'))}
              >
                {'—>'}
              </button>
            </div>

            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex gap-0">
                  {week.map((d, di) => {
                    const key = d.format('YYYY-MM-DD')
                    const isToday = key === today
                    const isCurrentMonth = d.month() === viewMonth.month()
                    const isSelected = key === selectedDate
                    const hasEntry = datesWithEntries.has(key)

                    return (
                      <button
                        key={key}
                        onClick={() => handleDateClick(d)}
                        className={cn(
                          'py-0.5 px-0.5 transition-opacity whitespace-nowrap',
                          'min-w-[2.5em] text-left',
                          isToday && 'font-bold',
                          isSelected && 'underline',
                          !isCurrentMonth && 'text-acc/20',
                          isCurrentMonth && !isToday && 'text-acc/40',
                          isToday && 'text-acc',
                          hasEntry && isCurrentMonth && !isToday && 'text-acc/80'
                        )}
                      >
                        {DAY_LETTERS[di]}
                        {d.date()}
                      </button>
                    )
                  })}

                  {wi === 0 && (
                    <div className="text-acc/30 flex items-center ml-4 whitespace-nowrap">
                      {selectedDate && !isAddingEntry && (
                        <button
                          className="text-acc/30 hover:text-acc/60 transition-opacity"
                          onClick={() => setIsAddingEntry(true)}
                        >
                          Note / Task / Call
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isAddingEntry && selectedDate && (
              <div className="mt-8">
                <div className="flex gap-8 mb-8">
                  {ENTRY_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setEntryType(t)}
                      className={cn(
                        'transition-opacity capitalize',
                        entryType === t ? 'text-acc' : 'text-acc/40 hover:text-acc/60'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-8 items-center">
                  <input
                    type="text"
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddEntry()
                      if (e.key === 'Escape') setIsAddingEntry(false)
                    }}
                    placeholder={`Add ${entryType}...`}
                    maxLength={500}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-[10em] outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <input
                    type="time"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddEntry()
                    }}
                    aria-label="Time (optional)"
                    title="Time (optional) — alerts at T-15 and T-0"
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 w-[6.5em] outline-none focus:border-acc/40 tabular-nums"
                  />
                  <Button onClick={handleAddEntry}>Add</Button>
                </div>
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">{day(selectedDate).format('dddd, MMMM D')}</div>
                {entriesOnDate.map((e) => {
                  const isActive = activeEntryId === e.id
                  return (
                    <div key={e.id} className="mb-1">
                      <button
                        className={cn(
                          'text-left w-full',
                          e.status === 'open' ? 'text-acc/80' : 'text-acc/30',
                          e.status === 'cancelled' && 'line-through'
                        )}
                        onClick={() => setActiveEntryId(isActive ? null : e.id)}
                      >
                        {e.time && <span className="tabular-nums">{e.time} </span>}
                        {e.text}
                        {e.status === 'done' && (
                          <span className="uppercase tracking-widest"> · Done</span>
                        )}
                      </button>
                      {isActive && renderActions(e)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {(overdueEntries.length > 0 || upcomingEntries.length > 0) && (
          <div className="space-y-1">
            {overdueEntries.slice(-3).map((e) => renderRow(e, true))}
            {upcomingEntries.map((e) => renderRow(e))}
          </div>
        )}

        {upcomingEntries.length === 0 && overdueEntries.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
