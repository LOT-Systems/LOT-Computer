/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block, Button } from '#client/components/ui'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import { useCalendar } from '#client/hooks/useCalendar'
import { requestAlertPermission } from '#client/components/CalendarAlerts'
import {
  type CalendarEntry,
  type EntryType,
  entryMoment,
  formatClock,
  formatTMinus,
  nextTimedEntry,
  parseTimeInput,
} from '#client/utils/calendar'

const UPCOMING_LIMIT = 10
const OVERDUE_LIMIT = 5
const NEXT_HORIZON_MS = 7 * 24 * 60 * 60 * 1000

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
  const { entries, addEntry, setStatus } = useCalendar()
  const is12h = useStore(stores.isTimeFormat12h)

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [focusedId, setFocusedId] = React.useState<string | null>(null)
  const [now, setNow] = React.useState(() => Date.now())

  // Clock for the T-minus readout — 30s resolution, paused on hidden tabs.
  React.useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) setNow(Date.now())
    }, 30_000)
    return () => window.clearInterval(id)
  }, [])

  const today = dayjs(now).format('YYYY-MM-DD')

  const upcomingEntries = React.useMemo(
    () =>
      entries
        .filter(e => e.date >= today && (e.status === 'active' || e.date === today))
        .filter(e => e.status !== 'cancelled')
        .slice(0, UPCOMING_LIMIT),
    [entries, today]
  )

  // Open tasks from past days stay visible until they are closed out.
  const overdueEntries = React.useMemo(
    () =>
      entries
        .filter(e => e.date < today && e.status === 'active' && e.type === 'task')
        .slice(-OVERDUE_LIMIT),
    [entries, today]
  )

  const nextEntry = React.useMemo(() => {
    const e = nextTimedEntry(entries, now)
    if (!e || !e.time) return null
    const t = entryMoment(e.date, e.time)
    return t - now <= NEXT_HORIZON_MS ? { entry: e, t } : null
  }, [entries, now])

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter(e => e.date === selectedDate)
  }, [entries, selectedDate])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => {
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
    if (selectedDate === key) {
      setSelectedDate(null)
    } else {
      setSelectedDate(key)
    }
  }

  const handleAddEntry = async () => {
    if (!selectedDate || !entryText.trim() || isSaving) return
    const time = parseTimeInput(entryTime)
    if (time === undefined) {
      setError('Time: use HHMM, HH:MM or 2:30pm')
      return
    }
    setError(null)
    setIsSaving(true)
    const date = selectedDate
    const type = entryType
    try {
      await addEntry({ date, time, text: entryText, type })
      if (time) requestAlertPermission()
      try { recordCalendarSignal(type, date) } catch (_) {}
      setEntryText('')
      setEntryTime('')
      setIsAddingEntry(false)
    } catch (_) {
      setError('Not saved. Retry.')
    } finally {
      setIsSaving(false)
    }
  }

  const renderEntryLine = (entry: CalendarEntry, opts: { showDate: boolean; overdue?: boolean }) => {
    const isFocused = focusedId === entry.id
    const closed = entry.status !== 'active'
    const d = dayjs(entry.date)
    const dateLabel = opts.showDate
      ? d.format(d.year() === dayjs(now).year() ? 'ddd, MMM D' : 'ddd, MMM D, YYYY')
      : null
    const clock = entry.time ? formatClock(entry.time, is12h) : null
    return (
      <div key={entry.id} className="mb-8 phone:mb-0">
        <div
          className={cn(
            'flex flex-col phone:flex-row phone:justify-between phone:gap-16 cursor-pointer',
            closed && 'opacity-30'
          )}
          onClick={() => setFocusedId(isFocused ? null : entry.id)}
        >
          <span className="text-acc whitespace-nowrap tabular-nums">
            {opts.overdue && <span className="opacity-40">Overdue · </span>}
            {dateLabel}
            {dateLabel && clock && ' · '}
            {clock}
            {!dateLabel && !clock && <span className="capitalize opacity-40">{entry.type}</span>}
          </span>
          <span className={cn('text-acc phone:text-right min-w-0 break-words', entry.status === 'done' && 'line-through')}>
            {entry.text}
          </span>
        </div>
        {isFocused && (
          <div className="flex phone:justify-end gap-16 text-acc/40 mt-4 mb-8">
            <span className="capitalize">{entry.type}</span>
            {entry.status === 'active' ? (
              <>
                <button className="hover:text-acc transition-opacity" onClick={() => { setStatus(entry, 'done').catch(() => {}); setFocusedId(null) }}>
                  Done
                </button>
                <button className="hover:text-acc transition-opacity" onClick={() => { setStatus(entry, 'cancelled').catch(() => {}); setFocusedId(null) }}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="hover:text-acc transition-opacity" onClick={() => { setStatus(entry, 'active').catch(() => {}); setFocusedId(null) }}>
                Restore
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) {
      setViewMonth(dayjs())
    }
    setIsCalendarOpen(!isCalendarOpen)
  }

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar} contentClassName="min-w-0">
      <div className="w-full">
        <div className="mb-16">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
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
                          'transition-opacity whitespace-nowrap text-left',
                          'flex-1 min-w-0 phone:flex-none phone:min-w-[2.5em]',
                          isToday && 'font-bold',
                          isSelected && 'underline',
                          !isCurrentMonth && 'text-acc/20',
                          isCurrentMonth && !isToday && 'text-acc/40',
                          isToday && 'text-acc',
                          hasEntry && isCurrentMonth && !isToday && 'text-acc/60',
                        )}
                      >
                        <span className="hidden phone:inline">{DAY_LETTERS[di]}</span>{d.date()}
                      </button>
                    )
                  })}

                  {wi === 0 && (
                    <div className="text-acc/30 hidden phone:flex items-center ml-4 whitespace-nowrap">
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
                className="phone:hidden mt-8 text-acc/30 hover:text-acc/60 transition-opacity"
                onClick={() => setIsAddingEntry(true)}
              >
                Note / Task / Call
              </button>
            )}

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
                    type="text"
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-0 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => { setEntryTime(e.target.value); setError(null) }}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HHMM"
                    aria-label="Time (optional)"
                    maxLength={8}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 w-[72px] tabular-nums outline-none focus:border-acc/40"
                  />
                  <Button onClick={handleAddEntry} disabled={isSaving}>
                    {isSaving ? '...' : 'Add'}
                  </Button>
                </div>
                <div className="text-acc/30 mt-4">
                  {error || (entryTime.trim() ? 'Alert at T-15 and T-0.' : 'No time: briefing at 0800 on the day.')}
                </div>
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map(e => renderEntryLine(e, { showDate: false }))}
              </div>
            )}
          </div>
        )}

        {nextEntry && (
          <div className="text-acc/40 mb-8 uppercase tracking-widest tabular-nums">
            Next · {formatTMinus(nextEntry.t, now)} · {formatClock(nextEntry.entry.time!, is12h)}
          </div>
        )}

        {(overdueEntries.length > 0 || upcomingEntries.length > 0) && (
          <div className="space-y-1">
            {overdueEntries.map(e => renderEntryLine(e, { showDate: true, overdue: true }))}
            {upcomingEntries.map(e => renderEntryLine(e, { showDate: true }))}
          </div>
        )}

        {upcomingEntries.length === 0 && overdueEntries.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
