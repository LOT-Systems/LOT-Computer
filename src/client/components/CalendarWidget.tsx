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
import { useCreateLog, useCalendar, calendarAction } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import {
  type CalendarEntry,
  type CalendarEntryType as EntryType,
  compareEntries,
  dueAt,
  isOverdue,
  isValidTime,
  localDateKey,
  milDay,
  milTime,
  tMinus,
} from '#shared/utils/calendar'

const UPCOMING_LIMIT = 10
const COUNTDOWN_WINDOW_MS = 48 * 60 * 60 * 1000

function requestAlertPermission() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  } catch (_) {}
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getMonthWeeks(year: number, month: number): Dayjs[][] {
  const first = dayjs().year(year).month(month).startOf('month')
  const last = dayjs().year(year).month(month).endOf('month')

  let isoDay = first.day() === 0 ? 6 : first.day() - 1
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

export function CalendarWidget() {
  const queryClient = useQueryClient()
  const { data: calendar, isError } = useCalendar()
  const { mutate: createLog, isLoading: isSaving } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [openRow, setOpenRow] = React.useState<string | null>(null)
  const [saveError, setSaveError] = React.useState(false)

  // Live clock — minute resolution is all the UI shows, 15s keeps it honest.
  const [now, setNow] = React.useState(() => new Date())
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15 * 1000)
    return () => clearInterval(id)
  }, [])

  const entries = React.useMemo<CalendarEntry[]>(
    () => (calendar || []).slice().sort(compareEntries),
    [calendar]
  )

  const today = localDateKey(now)

  // Overdue (open, past) first, then upcoming open entries in time order.
  const upcomingEntries = React.useMemo(() => {
    const overdue = entries.filter(e => isOverdue(e, now) && e.date >= dayjs(today).subtract(7, 'day').format('YYYY-MM-DD'))
    const ahead = entries.filter(e => e.status === 'open' && !isOverdue(e, now) && e.date >= today)
    return [...overdue, ...ahead].slice(0, UPCOMING_LIMIT)
  }, [entries, now, today])

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter(e => e.date === selectedDate)
  }, [entries, selectedDate])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => { if (e.status !== 'void') set.add(e.date) })
    return set
  }, [entries])

  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    if (selectedDate === key) {
      setSelectedDate(null)
    } else {
      setSelectedDate(key)
    }
  }

  const refresh = () => {
    queryClient.invalidateQueries(['/api/calendar'])
    queryClient.invalidateQueries(['/api/logs'])
  }

  const handleAddEntry = () => {
    const text = entryText.trim()
    if (!selectedDate || !text || isSaving) return
    const time = isValidTime(entryTime) ? entryTime : null

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const date = selectedDate
    const type = entryType

    setSaveError(false)
    createLog({
      text: `[SCHEDULE] ${type}: ${text} (${dateLabel}${time ? ` ${time}` : ''})`,
      event: 'calendar_entry',
      metadata: {
        date,
        time,
        text,
        entryType: type,
        status: 'open',
      },
    }, {
      onSuccess: () => {
        refresh()
        try { recordCalendarSignal(type, date) } catch (_) {}
        setEntryText('')
        setEntryTime('')
        setIsAddingEntry(false)
      },
      // Keep the draft on failure so nothing typed is lost.
      onError: () => setSaveError(true),
    })

    if (time) requestAlertPermission()
  }

  const handleEntryAction = (entry: CalendarEntry, action: 'done' | 'void' | 'reopen') => {
    setOpenRow(null)
    // Optimistic status flip; server is the source of truth on refetch.
    queryClient.setQueryData<CalendarEntry[]>(['/api/calendar'], (prev = []) =>
      prev.map(e => e.id === entry.id
        ? { ...e, status: action === 'reopen' ? 'open' : action }
        : e)
    )
    calendarAction(entry.id, action).finally(refresh)
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) {
      setViewMonth(dayjs())
    }
    setIsCalendarOpen(!isCalendarOpen)
  }

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        <div className="mb-16 flex items-center justify-between gap-16">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          <span className="text-acc/40 uppercase tracking-wider tabular-nums whitespace-nowrap" title="Local time (J)">
            {milTime(now)}J · {milDay(now)}
          </span>
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
              <span className="text-acc">
                {viewMonth.format('MMMM, YYYY')}
              </span>
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
                          hasEntry && isCurrentMonth && !isToday && 'text-acc/60',
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
                  {(['note', 'task', 'call'] as EntryType[]).map(t => (
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
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    aria-label="Time (optional)"
                    title="Time (optional — empty = all day, alert 09:00)"
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40 tabular-nums"
                  />
                  <input
                    type="text"
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <Button onClick={handleAddEntry} disabled={isSaving || !entryText.trim()}>Add</Button>
                </div>
                {saveError && (
                  <div className="mt-4 text-acc/60 uppercase tracking-wider">Not saved — retry</div>
                )}
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
                      'mb-1 flex gap-8',
                      e.status === 'open' ? 'text-acc/80' : 'text-acc/30',
                      e.status === 'void' && 'line-through'
                    )}
                  >
                    <span className="tabular-nums whitespace-nowrap">{e.time ? e.time.replace(':', '') : '----'}</span>
                    <span>{e.text}</span>
                    {e.status === 'done' && <span className="uppercase tracking-wider">· done</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map(entry => {
              const due = dueAt(entry)
              const overdue = isOverdue(entry, now)
              const near = due.getTime() - now.getTime() < COUNTDOWN_WINDOW_MS
              const isOpen = openRow === entry.id
              return (
                <div key={entry.id}>
                  <button
                    className="w-full flex justify-between gap-16 text-left hover:opacity-60 transition-opacity"
                    onClick={() => setOpenRow(isOpen ? null : entry.id)}
                    aria-expanded={isOpen}
                  >
                    <span className={cn('whitespace-nowrap', overdue ? 'text-acc/60' : 'text-acc')}>
                      {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                      {entry.time && <span className="tabular-nums"> · {entry.time}</span>}
                    </span>
                    <span className="text-acc text-right">
                      {entry.text}
                    </span>
                  </button>
                  {(overdue || (near && entry.time) || entry.snoozeUntil || isOpen) && (
                    <div className="flex justify-between gap-16 text-acc/40 uppercase tracking-wider tabular-nums">
                      <span>
                        {entry.entryType}
                        {overdue ? ' · overdue' : entry.snoozeUntil ? ' · snoozed' : ''}
                        {(near || overdue) && entry.time ? ` · ${tMinus(due, now)}` : ''}
                      </span>
                      {isOpen && (
                        <span className="flex gap-16 normal-case tracking-normal">
                          <button className="text-acc/60 hover:text-acc" onClick={() => handleEntryAction(entry, 'done')}>Done</button>
                          <button className="text-acc/60 hover:text-acc" onClick={() => handleEntryAction(entry, 'void')}>Void</button>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {isError && !calendar && (
          <div className="text-acc/40">Calendar offline — retrying.</div>
        )}

        {upcomingEntries.length === 0 && !isCalendarOpen && !isError && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
