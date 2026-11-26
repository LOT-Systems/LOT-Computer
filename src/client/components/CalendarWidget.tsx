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
import {
  CALENDAR_QUERY_KEY,
  useCalendar,
  useCreateCalendarEntry,
  useSetCalendarStatus,
} from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import { requestCalendarNotificationPermission } from '#client/components/CalendarAlerts'
import {
  type CalendarEntry,
  type EntryStatus,
  type EntryType,
  ENTRY_TYPES,
  entryInstant,
  foldCalendarLogs,
  formatCountdown,
  getMonthWeeks,
  isOverdue,
  militaryTime,
  nextEntry,
  parseTimeInput,
  upcomingEntries,
} from '#client/utils/calendar'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/** Ticking clock: 1s when the next mark is within 24h, else 30s. */
function useNow(fast: boolean) {
  const [now, setNow] = React.useState(() => dayjs())
  React.useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) setNow(dayjs())
    }, fast ? 1000 : 30_000)
    return () => window.clearInterval(id)
  }, [fast])
  return now
}

function countdownLabel(entry: CalendarEntry, now: Dayjs): string {
  if (entry.time) return formatCountdown(entryInstant(entry).valueOf() - now.valueOf())
  const days = dayjs(entry.date).diff(now.startOf('day'), 'day')
  return days <= 0 ? 'TODAY' : `D-${days}`
}

export function CalendarWidget() {
  const queryClient = useQueryClient()
  const { data: logs, isLoading, isError } = useCalendar()
  const { mutate: createEntry, isLoading: isSaving } = useCreateCalendarEntry()
  const { mutate: setStatus } = useSetCalendarStatus()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs().startOf('month'))
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [formError, setFormError] = React.useState<string | null>(null)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const { entries } = React.useMemo(() => foldCalendarLogs((logs as any[]) || []), [logs])

  const [clockFast, setClockFast] = React.useState(false)
  const now = useNow(clockFast)
  const today = now.format('YYYY-MM-DD')

  const next = React.useMemo(() => nextEntry(entries, now), [entries, now])
  const nextWithin24h = !!next && entryInstant(next).diff(now, 'hour', true) < 24
  React.useEffect(() => setClockFast(nextWithin24h), [nextWithin24h])

  const upcoming = React.useMemo(() => upcomingEntries(entries, now), [entries, now])

  const entriesOnDate = React.useMemo(
    () => (selectedDate ? entries.filter(e => e.date === selectedDate && e.status !== 'cancelled') : []),
    [entries, selectedDate]
  )

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => { if (e.status === 'open') set.add(e.date) })
    return set
  }, [entries])

  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  const refresh = () => {
    queryClient.invalidateQueries([CALENDAR_QUERY_KEY])
    queryClient.invalidateQueries(['/api/logs'])
  }

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    setFormError(null)
    if (selectedDate === key) {
      setSelectedDate(null)
      setIsAddingEntry(false)
    } else {
      setSelectedDate(key)
    }
  }

  const handleAddEntry = () => {
    if (!selectedDate || isSaving) return
    const text = entryText.trim()
    if (!text) return
    const time = parseTimeInput(entryTime)
    if (time === undefined) {
      setFormError('Time: HHMM, e.g. 0930 or 1730')
      return
    }
    setFormError(null)
    const date = selectedDate
    const type = entryType
    if (time) requestCalendarNotificationPermission()

    createEntry(
      { date, time, text, entryType: type },
      {
        onSuccess: () => {
          refresh()
          try { recordCalendarSignal(type, date) } catch (_) {}
          setEntryText('')
          setEntryTime('')
          setIsAddingEntry(false)
        },
        onError: () => setFormError('Not saved. Retry.'),
      }
    )
  }

  const handleStatus = (entry: CalendarEntry, status: EntryStatus) => {
    setActiveId(null)
    setStatus({ entryId: entry.id, status }, { onSuccess: refresh })
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) setViewMonth(dayjs().startOf('month'))
    setIsCalendarOpen(!isCalendarOpen)
    setFormError(null)
  }

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        {next && (
          <div className="mb-8 flex justify-between gap-16 text-acc/60 tabular-nums">
            <span className="whitespace-nowrap">
              Next {countdownLabel(next, now)}
            </span>
            <span className="text-right truncate">
              <span className="capitalize">{next.type}</span>
              {' · '}
              {next.text}
            </span>
          </div>
        )}

        <div className="mb-16">
          <Button onClick={handleToggleCalendar}>
            {isCalendarOpen ? 'Close' : 'Add date'}
          </Button>
        </div>

        {isCalendarOpen && (
          <div className="mb-16">
            <div className="flex items-center gap-8 mb-8">
              <button
                className="text-acc/40 hover:text-acc transition-opacity"
                onClick={() => setViewMonth(viewMonth.subtract(1, 'month'))}
                aria-label="Previous month"
              >
                {'<—'}
              </button>
              <span className="text-acc">
                {viewMonth.format('MMMM, YYYY')}
              </span>
              <button
                className="text-acc/40 hover:text-acc transition-opacity"
                onClick={() => setViewMonth(viewMonth.add(1, 'month'))}
                aria-label="Next month"
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
                          hasEntry && isCurrentMonth && !isToday && 'text-acc/80',
                        )}
                      >
                        {DAY_LETTERS[di]}{d.date()}
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
                  {ENTRY_TYPES.map(t => (
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
                <div className="flex gap-8 items-center">
                  <input
                    type="text"
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder={`Add ${entryType}...`}
                    maxLength={280}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-0 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => { setEntryTime(e.target.value); setFormError(null) }}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HHMM"
                    maxLength={7}
                    aria-label="Time (optional, 24h)"
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 w-[4.5em] tabular-nums outline-none focus:border-acc/40"
                  />
                  <Button onClick={handleAddEntry} disabled={isSaving}>
                    {isSaving ? '...' : 'Add'}
                  </Button>
                </div>
                <div className="mt-4 text-acc/30">
                  {formError || `${dayjs(selectedDate).format('ddd, MMMM D')} · time optional · alert T-15 and T-0`}
                </div>
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map(e => (
                  <div
                    key={e.id}
                    className={cn(
                      'flex gap-8 mb-1',
                      e.status === 'done' ? 'text-acc/30 line-through' : 'text-acc/80'
                    )}
                  >
                    <span className="tabular-nums whitespace-nowrap text-acc/40">
                      {e.time ? militaryTime(e.time) : 'DAY'}
                    </span>
                    <span>{e.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="space-y-1">
            {upcoming.map(entry => {
              const overdue = isOverdue(entry, now)
              const isActive = activeId === entry.id
              return (
                <div key={entry.id}>
                  <button
                    className="w-full flex justify-between gap-16 text-left"
                    onClick={() => setActiveId(isActive ? null : entry.id)}
                  >
                    <span className={cn('whitespace-nowrap', overdue ? 'text-acc/40' : 'text-acc')}>
                      {entry.date === today ? 'Today' : dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                      {entry.time && <span className="tabular-nums">{' '}{militaryTime(entry.time)}</span>}
                    </span>
                    <span className={cn('text-right', overdue ? 'text-acc/40' : 'text-acc')}>
                      {overdue && <span className="uppercase tracking-widest">Overdue · </span>}
                      {entry.text}
                    </span>
                  </button>
                  {isActive && (
                    <div className="flex justify-end gap-16 text-acc/40 mt-2 mb-4">
                      <span className="capitalize text-acc/30">{entry.type}</span>
                      <button className="hover:text-acc transition-opacity" onClick={() => handleStatus(entry, 'done')}>
                        Done
                      </button>
                      <button className="hover:text-acc transition-opacity" onClick={() => handleStatus(entry, 'cancelled')}>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {upcoming.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">
            {isLoading ? 'Loading...' : isError ? 'Calendar offline. Retrying.' : 'No upcoming dates.'}
          </div>
        )}
      </div>
    </Block>
  )
}
