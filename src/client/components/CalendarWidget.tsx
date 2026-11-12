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
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import { useCalendar, useNow } from '#client/hooks/useCalendar'
import { armAlerts, getArmState, type ArmState } from '#client/components/CalendarAlerts'
import {
  formatCountdown,
  normalizeTime,
  overdue as getOverdue,
  upcoming as getUpcoming,
  TYPE_CODE,
  type CalendarEntry,
  type EntryType,
} from '#client/utils/calendar'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const ENTRY_TYPES: EntryType[] = ['note', 'task', 'call']
const UPCOMING_LIMIT = 10
const SOON_MS = 24 * 60 * 60 * 1000
const OVERDUE_WINDOW_DAYS = 7

function getMonthWeeks(year: number, month: number): Dayjs[][] {
  const first = dayjs().year(year).month(month).startOf('month')
  const last = dayjs().year(year).month(month).endOf('month')

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

/** Isolated ticker so only the countdown text re-renders every second. */
function Countdown({ dueAt }: { dueAt: number }) {
  const now = useNow(1000)
  return <span className="tabular-nums tracking-wider">{formatCountdown(dueAt, now)}</span>
}

function EntryActions({
  entry,
  onStatus,
}: {
  entry: CalendarEntry
  onStatus: (e: CalendarEntry, s: 'done' | 'scrubbed' | 'scheduled') => void
}) {
  const btn = 'text-acc/40 hover:text-acc transition-opacity'
  if (entry.status !== 'scheduled') {
    return (
      <button className={btn} onClick={() => onStatus(entry, 'scheduled')}>
        Reopen
      </button>
    )
  }
  return (
    <span className="flex gap-16">
      <button className={btn} onClick={() => onStatus(entry, 'done')}>Done</button>
      <button className={btn} onClick={() => onStatus(entry, 'scrubbed')}>Scrub</button>
    </span>
  )
}

export function CalendarWidget() {
  const { entries, setStatus, addEntry } = useCalendar()
  const now = useNow(60 * 1000)

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [timeError, setTimeError] = React.useState(false)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [armState, setArmState] = React.useState<ArmState>(() => getArmState())

  const upcomingEntries = React.useMemo(
    () => getUpcoming(entries, now).slice(0, UPCOMING_LIMIT),
    [entries, now]
  )
  // Only surface the last 7 days of misses — older legacy entries stay quiet.
  const overdueEntries = React.useMemo(() => {
    const floor = dayjs(now).subtract(OVERDUE_WINDOW_DAYS, 'day').format('YYYY-MM-DD')
    return getOverdue(entries, now).filter(e => e.date >= floor)
  }, [entries, now])

  const entriesOnDate = React.useMemo(
    () => (selectedDate ? entries.filter(e => e.date === selectedDate) : []),
    [entries, selectedDate]
  )

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => { if (e.status === 'scheduled') set.add(e.date) })
    return set
  }, [entries])

  const today = dayjs(now).format('YYYY-MM-DD')
  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  const resetForm = () => {
    setEntryText('')
    setEntryTime('')
    setTimeError(false)
    setIsAddingEntry(false)
  }

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    if (selectedDate === key) {
      setSelectedDate(null)
      resetForm()
      return
    }
    setSelectedDate(key)
    if (d.month() !== viewMonth.month()) setViewMonth(d)
  }

  const handleAddEntry = () => {
    if (!selectedDate || !entryText.trim()) return
    const rawTime = entryTime.trim()
    const time = rawTime ? normalizeTime(rawTime) : null
    if (rawTime && !time) {
      setTimeError(true)
      return
    }
    const date = selectedDate
    const type = entryType
    addEntry({ date, time, text: entryText, type }, () => {
      try { recordCalendarSignal(type, date) } catch (_) {}
    })
    resetForm()
  }

  const handleStatus = (e: CalendarEntry, s: 'done' | 'scrubbed' | 'scheduled') => {
    setStatus(e, s)
    setExpandedId(null)
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) setViewMonth(dayjs())
    else resetForm()
    setIsCalendarOpen(!isCalendarOpen)
  }

  const handleArm = async () => {
    setArmState(await armAlerts())
  }

  const armLabel: Record<ArmState, string> = {
    armed: 'Alerts: Armed',
    off: 'Alerts: In-app',
    denied: 'Alerts: In-app (blocked)',
    unsupported: 'Alerts: In-app',
  }

  const renderRow = (entry: CalendarEntry, opts: { overdue?: boolean } = {}) => {
    const isOpen = expandedId === entry.id
    const soon = entry.dueAt - now < SOON_MS && entry.dueAt >= now - 60 * 60 * 1000
    return (
      <div key={entry.id}>
        <button
          className="w-full flex flex-col sm:flex-row sm:justify-between sm:gap-16 text-left"
          onClick={() => setExpandedId(isOpen ? null : entry.id)}
        >
          <span className={cn('sm:whitespace-nowrap', opts.overdue ? 'text-acc/40' : 'text-acc')}>
            {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
            {entry.time && ` · ${entry.time}`}
          </span>
          <span className={cn('sm:text-right break-words', opts.overdue ? 'text-acc/40' : 'text-acc')}>
            {entry.text}
          </span>
        </button>
        {(isOpen || opts.overdue || soon) && (
          <div className="flex justify-between gap-16 text-acc/40">
            <span className="uppercase tracking-widest">
              {TYPE_CODE[entry.type]}
              {soon && !opts.overdue && <> · <Countdown dueAt={entry.dueAt} /></>}
              {opts.overdue && ' · Overdue'}
            </span>
            {isOpen && <EntryActions entry={entry} onStatus={handleStatus} />}
          </div>
        )}
      </div>
    )
  }

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        <div className="mb-16 flex items-center gap-16">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          {isCalendarOpen && (
            <button
              className={cn(
                'transition-opacity',
                armState === 'armed' ? 'text-acc/60' : 'text-acc/30 hover:text-acc/60'
              )}
              onClick={handleArm}
              disabled={armState !== 'off'}
              title="Native notifications when LOT is in the background"
            >
              {armLabel[armState]}
            </button>
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
              <button
                className="text-acc"
                onClick={() => setViewMonth(dayjs())}
                title="Back to this month"
              >
                {viewMonth.format('MMMM, YYYY')}
              </button>
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
                <div
                  className="flex gap-8 items-center"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddEntry()
                    if (e.key === 'Escape') resetForm()
                  }}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => { setEntryTime(e.target.value); setTimeError(false) }}
                    placeholder="HH:MM"
                    aria-label="Time (optional, 24h)"
                    maxLength={5}
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5.5em] outline-none tabular-nums',
                      timeError ? 'border-acc/60' : 'border-acc/20 focus:border-acc/40'
                    )}
                  />
                  <input
                    type="text"
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-0 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <Button onClick={handleAddEntry}>Add</Button>
                </div>
                <div className="text-acc/30 mt-4">
                  {timeError
                    ? 'Time must be 24h, e.g. 09:30 or 1430.'
                    : 'Time optional. Timed entries alert at T-15 and T-0; all-day at 09:00.'}
                </div>
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map(e => (
                  <div key={e.id} className="flex justify-between gap-16 mb-1">
                    <span className={cn(e.status === 'scheduled' ? 'text-acc/80' : 'text-acc/30')}>
                      {e.time ? `${e.time} · ` : ''}{e.text}
                      {e.status === 'done' && ' · Done'}
                      {e.status === 'scrubbed' && ' · Scrubbed'}
                    </span>
                    <EntryActions entry={e} onStatus={handleStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {overdueEntries.length > 0 && (
          <div className="space-y-1 mb-8">
            {overdueEntries.slice(-5).map(e => renderRow(e, { overdue: true }))}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map(e => renderRow(e))}
          </div>
        )}

        {upcomingEntries.length === 0 && overdueEntries.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
