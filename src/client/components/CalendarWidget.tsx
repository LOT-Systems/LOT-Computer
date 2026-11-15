/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { useCreateLog, useUpdateCalendarEntry } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import {
  CalendarEntry,
  EntryStatus,
  EntryType,
  MISSED_HORIZON_MS,
  TYPE_CODE,
  formatDTG,
  formatHrs,
  formatTMinus,
  parseTimeInput,
  scheduledAt,
  triggerAt,
} from '#client/utils/calendar'
import {
  requestAlertPermission,
  useCalendarEntries,
  useNow,
  useRefreshCalendar,
} from '#client/components/CalendarAlerts'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const UPCOMING_LIMIT = 10

function getMonthWeeks(year: number, month: number): Dayjs[][] {
  const first = dayjs().year(year).month(month).startOf('month')
  const last = first.endOf('month')
  const isoDay = first.day() === 0 ? 6 : first.day() - 1
  let current = first.subtract(isoDay, 'day')

  const weeks: Dayjs[][] = []
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

// ─── Live readouts (isolated so the 1s tick doesn't re-render the grid) ──────

function LiveClock({ next }: { next: CalendarEntry | null }) {
  const now = useNow(1000)
  return (
    <div className="flex justify-between gap-16 mb-16 tabular-nums">
      <span className="text-acc">{dayjs(now).format('HH:mm:ss')}</span>
      {next ? (
        <span className="text-acc/40 text-right truncate">
          {formatTMinus(triggerAt(next), now)} · {TYPE_CODE[next.type]}
        </span>
      ) : (
        <span className="text-acc/20">{formatDTG(now)}</span>
      )}
    </div>
  )
}

function RowCountdown({ entry }: { entry: CalendarEntry }) {
  const now = useNow(1000)
  return <span className="tabular-nums">{formatTMinus(triggerAt(entry), now)}</span>
}

// ─── Widget ──────────────────────────────────────────────────────────────────

export function CalendarWidget() {
  const { entries } = useCalendarEntries()
  const { mutate: createLog } = useCreateLog()
  const { mutate: updateEntry } = useUpdateCalendarEntry()
  const refresh = useRefreshCalendar()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  // Minute-resolution clock is enough for list membership.
  const minuteNow = useNow(30 * 1000)
  const today = dayjs(minuteNow).format('YYYY-MM-DD')

  const openEntries = React.useMemo(
    () => entries.filter((e) => e.status === 'open'),
    [entries]
  )

  // Upcoming = open entries from today onward, plus overdue ones still inside
  // the MISSED horizon (so nothing silently disappears).
  const upcomingEntries = React.useMemo(() => {
    const horizon = minuteNow - MISSED_HORIZON_MS
    return openEntries
      .filter((e) => e.date >= today || scheduledAt(e) >= horizon)
      .slice(0, UPCOMING_LIMIT)
  }, [openEntries, today, minuteNow])

  const nextEntry = React.useMemo(
    () =>
      openEntries
        .filter((e) => triggerAt(e) >= minuteNow - 60 * 1000)
        .sort((a, b) => triggerAt(a) - triggerAt(b))[0] || null,
    [openEntries, minuteNow]
  )

  const entriesOnDate = React.useMemo(
    () => (selectedDate ? entries.filter((e) => e.date === selectedDate && e.status !== 'cancelled') : []),
    [entries, selectedDate]
  )

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    openEntries.forEach((e) => set.add(e.date))
    return set
  }, [openEntries])

  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  const parsedTime = parseTimeInput(entryTime)
  const timeInvalid = entryTime.trim() !== '' && !parsedTime

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    setSelectedDate(selectedDate === key ? null : key)
  }

  const handleAddEntry = () => {
    if (!selectedDate || !entryText.trim() || timeInvalid) return
    const text = entryText.trim()
    const date = selectedDate
    const time = parsedTime
    const dateLabel = dayjs(date).format('dddd, MMMM D, YYYY')

    createLog(
      {
        text: `[SCHEDULE] ${entryType}: ${text} (${dateLabel}${time ? ` · ${formatHrs(time)}` : ''})`,
        event: 'calendar_entry',
        metadata: { date, time, text, entryType, status: 'open' },
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
    requestAlertPermission()
    setEntryText('')
    setEntryTime('')
    setIsAddingEntry(false)
  }

  const setStatus = (e: CalendarEntry, status: Exclude<EntryStatus, 'open'>) => {
    const code = status === 'done' ? 'DONE' : 'SCRUB'
    updateEntry({ id: e.id, status }, { onSuccess: refresh })
    createLog(
      {
        text: `[${code}] ${TYPE_CODE[e.type]}: ${e.text}`,
        event: 'calendar_alert',
        metadata: {
          entryId: e.id,
          stage: code,
          date: e.date,
          time: e.time,
          entryType: e.type,
          text: e.text,
          dtg: formatDTG(Date.now()),
        },
      },
      { onSuccess: refresh }
    )
    setExpandedId(null)
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) setViewMonth(dayjs())
    setIsCalendarOpen(!isCalendarOpen)
  }

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        <LiveClock next={nextEntry} />

        <div className="mb-16">
          <Button onClick={handleToggleCalendar}>Add date</Button>
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
              <span className="text-acc">{viewMonth.format('MMMM, YYYY')}</span>
              <button
                className="text-acc/40 hover:text-acc transition-opacity"
                onClick={() => setViewMonth(viewMonth.add(1, 'month'))}
                aria-label="Next month"
              >
                {'—>'}
              </button>
            </div>

            <div>
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
                          'py-2 px-2 transition-opacity whitespace-nowrap',
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
                        {hasEntry && isCurrentMonth ? '·' : ''}
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
                  {(['note', 'task', 'call'] as EntryType[]).map((t) => (
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
                    inputMode="numeric"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddEntry()
                    }}
                    placeholder="HH:MM"
                    aria-label="Time (optional)"
                    maxLength={5}
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5em] outline-none tabular-nums',
                      timeInvalid ? 'border-acc' : 'border-acc/20 focus:border-acc/40'
                    )}
                  />
                  <input
                    type="text"
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddEntry()
                    }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-0 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <Button onClick={handleAddEntry}>Add</Button>
                </div>
                <div className="text-acc/30 mt-4 tabular-nums">
                  {timeInvalid
                    ? 'Time: HH:MM, 24h.'
                    : parsedTime
                      ? `Alert at ${formatHrs(parsedTime)}, warning T-15.`
                      : 'No time: alert at 0900 HRS.'}
                </div>
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      'flex gap-8 mb-1',
                      e.status === 'done' ? 'text-acc/30 line-through' : 'text-acc/80'
                    )}
                  >
                    <span className="tabular-nums text-acc/40 whitespace-nowrap">
                      {e.time ? e.time : '—'}
                    </span>
                    <span>{e.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div>
            {upcomingEntries.map((entry) => {
              const overdue = scheduledAt(entry) < minuteNow && entry.date < today
              const isExpanded = expandedId === entry.id
              const isTodayRow = entry.date === today
              return (
                <div key={entry.id} className="mb-1">
                  <button
                    className="w-full flex justify-between gap-16 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    aria-expanded={isExpanded}
                  >
                    <span
                      className={cn(
                        'whitespace-nowrap tabular-nums',
                        overdue ? 'text-acc/40' : 'text-acc'
                      )}
                    >
                      {isTodayRow ? 'Today' : dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                      {entry.time ? ` · ${entry.time}` : ''}
                    </span>
                    <span className={cn('text-right', overdue ? 'text-acc/40' : 'text-acc')}>
                      {entry.text}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="flex gap-16 text-acc/40 mt-2 mb-8 tabular-nums">
                      <span>{TYPE_CODE[entry.type]}</span>
                      <span>
                        {overdue ? 'OVERDUE' : <RowCountdown entry={entry} />}
                      </span>
                      <span className="ml-auto flex gap-16">
                        {entry.type !== 'note' && (
                          <button className="hover:text-acc" onClick={() => setStatus(entry, 'done')}>
                            [DONE]
                          </button>
                        )}
                        <button className="hover:text-acc" onClick={() => setStatus(entry, 'cancelled')}>
                          [SCRUB]
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {upcomingEntries.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
