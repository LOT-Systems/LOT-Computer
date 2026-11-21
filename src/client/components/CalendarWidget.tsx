/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { useCalendarData, useNow } from '#client/hooks/useCalendar'
import {
  ENTRY_TYPES,
  formatCountdown,
  isOverdue,
  isUpcoming,
  isValidTime,
  toDateKey,
  type CalendarEntry,
  type EntryType,
} from '#client/utils/calendar'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MAX_UPCOMING = 10
const MAX_OVERDUE = 5

/**
 * ISO weeks (Mon-first) covering a month. Built from the 1st of the month so
 * it never overflows (dayjs().month(1) on the 31st would land in March).
 */
function getMonthWeeks(year: number, month: number): Dayjs[][] {
  const first = dayjs(new Date(year, month, 1))
  const last = first.endOf('month')
  const isoDay = first.day() === 0 ? 6 : first.day() - 1
  let current = first.subtract(isoDay, 'day')

  const weeks: Dayjs[][] = []
  while (weeks.length < 6 && (weeks.length < 5 || !current.isAfter(last, 'day'))) {
    const week: Dayjs[] = []
    for (let i = 0; i < 7; i++) {
      week.push(current)
      current = current.add(1, 'day')
    }
    weeks.push(week)
  }
  return weeks
}

function entryWhen(e: CalendarEntry, short = false): string {
  const fmt = short ? 'ddd, MMM D' : 'dddd, MMMM D, YYYY'
  return `${dayjs(e.date).format(fmt)}${e.time ? ` · ${e.time}` : ''}`
}

/** Row with tap-to-reveal actions — keeps the list clean on touch screens. */
const EntryRow: React.FC<{
  entry: CalendarEntry
  now: number
  overdue?: boolean
  showDate?: boolean
  expanded: boolean
  onToggle: () => void
  onStatus: (status: 'done' | 'cancelled' | 'open') => void
}> = ({ entry, now, overdue, showDate = true, expanded, onToggle, onStatus }) => {
  const closed = entry.status !== 'open'
  const countdown = closed
    ? entry.status === 'done' ? 'DONE' : 'DROPPED'
    : overdue
      ? 'OVERDUE'
      : entry.time
        ? formatCountdown(entry.at, now)
        : entry.date === toDateKey(now) ? 'TODAY' : formatCountdown(entry.at, now)

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex justify-between gap-16 text-left',
          closed && 'opacity-40 line-through',
          overdue && 'opacity-60'
        )}
      >
        <span className="text-acc whitespace-nowrap">
          {showDate ? (
            <>
              <span className="sm:hidden">{entryWhen(entry, true)}</span>
              <span className="hidden sm:inline">{entryWhen(entry)}</span>
            </>
          ) : (entry.time || 'All day')}
        </span>
        <span className="text-acc text-right min-w-0 break-words">{entry.text}</span>
      </button>
      {expanded && (
        <div className="flex justify-between gap-16 mt-2 mb-4 text-acc/40">
          <span className="uppercase tracking-widest tabular-nums">
            {entry.type} · {countdown}
          </span>
          <span className="flex gap-16">
            {closed ? (
              <button className="hover:text-acc transition-opacity" onClick={() => onStatus('open')}>
                Reopen
              </button>
            ) : (
              <>
                <button className="hover:text-acc transition-opacity" onClick={() => onStatus('done')}>
                  Done
                </button>
                <button className="hover:text-acc transition-opacity" onClick={() => onStatus('cancelled')}>
                  Drop
                </button>
              </>
            )}
          </span>
        </div>
      )}
    </div>
  )
}

export function CalendarWidget() {
  const { entries, isLoading, isError, isSaving, addEntry, setStatus } = useCalendarData()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs().startOf('month'))
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  // Coarse clock to classify entries; the fine 1 Hz clock only runs for T-minus.
  const coarseNow = useNow(30_000)

  const upcoming = React.useMemo(
    () => entries.filter(e => isUpcoming(e, coarseNow)).slice(0, MAX_UPCOMING),
    [entries, coarseNow]
  )
  const overdue = React.useMemo(
    () => entries.filter(e => isOverdue(e, coarseNow)).slice(-MAX_OVERDUE).reverse(),
    [entries, coarseNow]
  )
  const next = upcoming[0] || null
  const nextIsSoon = !!next && next.at - coarseNow < 24 * 60 * 60 * 1000

  const entriesOnDate = React.useMemo(
    () => (selectedDate ? entries.filter(e => e.date === selectedDate) : []),
    [entries, selectedDate]
  )

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => { if (e.status === 'open') set.add(e.date) })
    return set
  }, [entries])

  const today = toDateKey(coarseNow)
  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    setSelectedDate(selectedDate === key ? null : key)
    if (selectedDate === key) setIsAddingEntry(false)
  }

  const timeValid = entryTime === '' || isValidTime(entryTime)

  const handleAddEntry = () => {
    if (!selectedDate || !entryText.trim() || !timeValid || isSaving) return
    addEntry(
      { date: selectedDate, time: entryTime || null, text: entryText, type: entryType },
      () => {
        setEntryText('')
        setEntryTime('')
        setIsAddingEntry(false)
      }
    )
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) {
      setViewMonth(dayjs().startOf('month'))
      setSelectedDate(today)
    } else {
      setIsAddingEntry(false)
    }
    setIsCalendarOpen(!isCalendarOpen)
  }

  const rowProps = (e: CalendarEntry) => ({
    entry: e,
    expanded: expandedId === e.id,
    onToggle: () => setExpandedId(expandedId === e.id ? null : e.id),
    onStatus: (s: 'done' | 'cancelled' | 'open') => {
      setStatus(e, s)
      setExpandedId(null)
    },
  })

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        <div className="mb-16">
          <Button onClick={handleToggleCalendar}>
            {isCalendarOpen ? 'Close' : 'Add date'}
          </Button>
        </div>

        {next && !isCalendarOpen && (
          <NextLine entry={next} live={nextIsSoon} fallbackNow={coarseNow} />
        )}

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
                    <div className="hidden sm:flex text-acc/30 items-center ml-4 whitespace-nowrap">
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

            {selectedDate && !isAddingEntry && (
              <button
                className="sm:hidden mt-8 text-acc/30 hover:text-acc/60 transition-opacity"
                onClick={() => setIsAddingEntry(true)}
              >
                Note / Task / Call
              </button>
            )}

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
                  <span className="text-acc/30 ml-auto">
                    {dayjs(selectedDate).format('ddd, MMM D')}
                  </span>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-8 items-center">
                  <input
                    type="text"
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddEntry()
                      if (e.key === 'Escape') setIsAddingEntry(false)
                    }}
                    placeholder={`Add ${entryType}...`}
                    maxLength={280}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 basis-full sm:basis-auto flex-1 min-w-0 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <input
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    aria-label="Time (optional)"
                    title="Time (optional) — timed entries alert at T-15 and T-0"
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[6.5em] outline-none tabular-nums',
                      timeValid ? 'border-acc/20 focus:border-acc/40' : 'border-acc/60'
                    )}
                  />
                  <Button onClick={handleAddEntry} disabled={isSaving || !entryText.trim() || !timeValid}>
                    {isSaving ? '...' : 'Add'}
                  </Button>
                </div>
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                <div className="space-y-1">
                  {entriesOnDate.map(e => (
                    <EntryRow
                      key={e.id}
                      {...rowProps(e)}
                      now={coarseNow}
                      overdue={isOverdue(e, coarseNow)}
                      showDate={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="space-y-1">
            {upcoming.map(e => (
              <EntryRow key={e.id} {...rowProps(e)} now={coarseNow} />
            ))}
          </div>
        )}

        {overdue.length > 0 && (
          <div className={cn('space-y-1', upcoming.length > 0 && 'mt-16')}>
            <div className="text-acc/40 mb-4">Overdue:</div>
            {overdue.map(e => (
              <EntryRow key={e.id} {...rowProps(e)} now={coarseNow} overdue />
            ))}
          </div>
        )}

        {upcoming.length === 0 && overdue.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">
            {isLoading ? 'Loading...' : isError ? 'Calendar offline.' : 'No upcoming dates.'}
          </div>
        )}
      </div>
    </Block>
  )
}

/** "Next" status line. Ticks at 1 Hz only when the next entry is within 24 h. */
const NextLine: React.FC<{ entry: CalendarEntry; live: boolean; fallbackNow: number }> = ({
  entry,
  live,
  fallbackNow,
}) => {
  return live ? <LiveNext entry={entry} /> : <NextText entry={entry} now={fallbackNow} />
}

const LiveNext: React.FC<{ entry: CalendarEntry }> = ({ entry }) => {
  const now = useNow(1000)
  return <NextText entry={entry} now={now} />
}

const NextText: React.FC<{ entry: CalendarEntry; now: number }> = ({ entry, now }) => {
  const isToday = entry.date === toDateKey(now)
  const label = entry.time ? formatCountdown(entry.at, now) : isToday ? 'TODAY' : formatCountdown(entry.at, now)
  return (
    <div className="mb-16 flex justify-between gap-16 text-acc/40 uppercase tracking-widest tabular-nums">
      <span>Next · {entry.type}</span>
      <span>{label}</span>
    </div>
  )
}
