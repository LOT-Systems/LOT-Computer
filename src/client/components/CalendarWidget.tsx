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
import { useCalendar, useCreateLog, CALENDAR_QUERY_KEY } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import { requestAlertPermission } from '#client/components/CalendarAlerts'
import {
  CalendarEntry,
  DEFAULT_LEAD_MIN,
  ENTRY_TYPES,
  EntryStatus,
  EntryType,
  LEAD_OPTIONS,
  TYPE_CODE,
  buildEntries,
  entryLogText,
  eventTime,
  formatTMinus,
  getMonthWeeks,
  leadLabel,
  milTime,
  nextEvent,
  parseTimeInput,
  statusLogText,
  upcomingEntries,
} from '#client/utils/calendar'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/** Ticks once a second while mounted and the tab is visible. */
function useNow(intervalMs = 1000) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setNow(Date.now())
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function NextLock({ entries }: { entries: CalendarEntry[] }) {
  const now = useNow()
  const next = nextEvent(entries, now)
  if (!next) return null
  return (
    <div className="flex justify-between gap-16 mb-16 tabular-nums uppercase tracking-widest">
      <span className="text-acc/40">Next · {TYPE_CODE[next.type]}</span>
      <span>{formatTMinus(eventTime(next) - now)}</span>
    </div>
  )
}

export function CalendarWidget() {
  const queryClient = useQueryClient()
  const { data } = useCalendar()
  const { mutate: createLog, isLoading: isSaving } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs().startOf('month'))
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryLead, setEntryLead] = React.useState<number>(DEFAULT_LEAD_MIN)
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [error, setError] = React.useState<string | null>(null)

  const entries = React.useMemo(() => buildEntries(data?.records || []), [data])

  // Re-evaluated once a minute — enough for list membership; countdowns tick on their own.
  const minuteNow = useNow(60_000)
  const upcoming = React.useMemo(() => upcomingEntries(entries, minuteNow), [entries, minuteNow])

  const entriesOnDate = React.useMemo(
    () => (selectedDate ? entries.filter((e) => e.date === selectedDate && e.status !== 'dropped') : []),
    [entries, selectedDate]
  )

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => e.status === 'active' && set.add(e.date))
    return set
  }, [entries])

  const today = dayjs(minuteNow).format('YYYY-MM-DD')
  const weeks = React.useMemo(() => getMonthWeeks(viewMonth), [viewMonth])
  const parsedTime = parseTimeInput(entryTime)
  const timeInvalid = entryTime.trim() !== '' && !parsedTime

  const refresh = () => {
    queryClient.invalidateQueries([CALENDAR_QUERY_KEY])
    queryClient.invalidateQueries(['/api/logs'])
  }

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    setSelectedDate(selectedDate === key ? null : key)
    setError(null)
  }

  const resetForm = () => {
    setEntryText('')
    setEntryTime('')
    setEntryLead(DEFAULT_LEAD_MIN)
    setIsAddingEntry(false)
  }

  const handleAddEntry = () => {
    const text = entryText.trim()
    if (!selectedDate || !text || isSaving) return
    if (timeInvalid) {
      setError('Time format: HH:MM, 24h')
      return
    }
    const time = parsedTime
    if (time) requestAlertPermission()
    const date = selectedDate

    createLog(
      {
        text: entryLogText({ type: entryType, text, date, time }),
        event: 'calendar_entry',
        metadata: {
          date,
          time,
          text,
          entryType,
          leadMin: time ? entryLead : 0,
        },
      },
      {
        onSuccess: () => {
          setError(null)
          refresh()
          try { recordCalendarSignal(entryType, date) } catch (_) {}
        },
        onError: () => {
          // Restore the draft so nothing typed is lost.
          setEntryText(text)
          setIsAddingEntry(true)
          setError('Not saved — retry')
        },
      }
    )
    resetForm()
  }

  const setStatus = (entry: CalendarEntry, status: EntryStatus) => {
    createLog(
      {
        text: statusLogText(entry, status),
        event: 'calendar_status',
        metadata: { entryId: entry.id, status, date: entry.date, entryType: entry.type },
      },
      { onSuccess: refresh, onError: () => setError('Not saved — retry') }
    )
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) setViewMonth(dayjs().startOf('month'))
    setIsCalendarOpen(!isCalendarOpen)
  }

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        <div className="mb-16">
          <Button onClick={handleToggleCalendar}>
            {isCalendarOpen ? 'Close' : 'Add date'}
          </Button>
        </div>

        <NextLock entries={entries} />

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
              <span className="text-acc">{viewMonth.format('MMMM, YYYY')}</span>
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
                <div className="flex flex-wrap gap-x-16 gap-y-4 mb-8">
                  <div className="flex gap-8">
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
                  {parsedTime && (
                    <div className="flex gap-8 tabular-nums">
                      {LEAD_OPTIONS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setEntryLead(m)}
                          className={cn(
                            'transition-opacity',
                            entryLead === m ? 'text-acc' : 'text-acc/40 hover:text-acc/60'
                          )}
                        >
                          {leadLabel(m)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-8 items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    aria-label="Time (24h, optional)"
                    maxLength={5}
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[4.5em] outline-none tabular-nums',
                      timeInvalid ? 'border-acc/60' : 'border-acc/20 focus:border-acc/40'
                    )}
                  />
                  <input
                    type="text"
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-0 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <Button onClick={handleAddEntry}>Add</Button>
                </div>
              </div>
            )}

            {error && <div className="mt-8 text-acc/60">{error}</div>}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map((e) => (
                  <div key={e.id} className="flex justify-between gap-16 mb-1">
                    <span className={cn('min-w-0 break-words', e.status === 'done' ? 'text-acc/40 line-through' : 'text-acc/80')}>
                      <span className="tabular-nums text-acc/40">{e.time ? milTime(e.time) : '----'} </span>
                      {e.text}
                    </span>
                    <span className="flex gap-8 whitespace-nowrap text-acc/40">
                      {e.status === 'active' ? (
                        <>
                          <button className="hover:text-acc" onClick={() => setStatus(e, 'done')}>Done</button>
                          <button className="hover:text-acc" onClick={() => setStatus(e, 'dropped')}>Drop</button>
                        </>
                      ) : (
                        <button className="hover:text-acc" onClick={() => setStatus(e, 'active')}>Undo</button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="space-y-1">
            {upcoming.map((entry) => (
              <div key={entry.id} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap tabular-nums">
                  {dayjs(entry.date).format(entry.date.slice(0, 4) === today.slice(0, 4) ? 'ddd, MMM D' : 'ddd, MMM D, YYYY')}
                  {entry.time && <span className="text-acc/40"> {milTime(entry.time)}</span>}
                </span>
                <span className="text-acc text-right min-w-0 break-words">{entry.text}</span>
              </div>
            ))}
          </div>
        )}

        {upcoming.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
