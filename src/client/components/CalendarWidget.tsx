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
import { useCreateCalendarEntry, useSetCalendarStatus } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import {
  useCalendarEntries,
  useNow,
  getDesktopAlertsEnabled,
  setDesktopAlertsEnabled,
} from '#client/hooks/useCalendarEntries'
import {
  ENTRY_TYPES,
  agenda,
  countdown,
  entryDateTime,
  getMonthGrid,
  isOverdue,
  parseTime,
  toDateKey,
  TYPE_CODE,
} from '#shared/utils/calendar'
import type { CalendarEntry, EntryStatus, EntryType } from '#shared/utils/calendar'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function whenLabel(e: CalendarEntry, now: Date): string {
  const todayKey = toDateKey(now)
  const tomorrowKey = toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
  const day =
    e.date === todayKey ? 'Today' :
    e.date === tomorrowKey ? 'Tomorrow' :
    dayjs(entryDateTime(e)).format(
      e.date.slice(0, 4) === String(now.getFullYear()) ? 'ddd, MMM D' : 'ddd, MMM D, YYYY'
    )
  return e.time ? `${day} · ${e.time}` : day
}

export function CalendarWidget() {
  const queryClient = useQueryClient()
  const { entries, isLoading, isError, refetch } = useCalendarEntries()
  const { mutate: createEntry, isLoading: isSaving } = useCreateCalendarEntry()
  const { mutate: setStatus } = useSetCalendarStatus()
  const now = useNow(30000)

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [error, setError] = React.useState<string | null>(null)
  const [openRow, setOpenRow] = React.useState<string | null>(null)
  const [desktopOn, setDesktopOn] = React.useState(() => getDesktopAlertsEnabled())

  const todayKey = toDateKey(now)
  const upcoming = React.useMemo(() => agenda(entries, now), [entries, now])

  const entriesOnDate = React.useMemo(
    () => (selectedDate ? entries.filter(e => e.date === selectedDate) : []),
    [entries, selectedDate]
  )

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => { if (e.status === 'open') set.add(e.date) })
    return set
  }, [entries])

  const weeks = React.useMemo(
    () => getMonthGrid(viewMonth.year, viewMonth.month),
    [viewMonth]
  )
  const monthLabel = dayjs(new Date(viewMonth.year, viewMonth.month, 1)).format('MMMM, YYYY')
  const isCurrentView = viewMonth.year === now.getFullYear() && viewMonth.month === now.getMonth()

  const shiftMonth = (delta: number) =>
    setViewMonth(v => {
      const d = new Date(v.year, v.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const resetForm = () => {
    setEntryText('')
    setEntryTime('')
    setError(null)
  }

  const handleDateClick = (key: string) => {
    setSelectedDate(prev => (prev === key ? null : key))
    setIsAddingEntry(false)
    resetForm()
  }

  const invalidate = () => {
    queryClient.invalidateQueries(['/api/calendar'])
    queryClient.invalidateQueries(['/api/logs'])
  }

  const handleAddEntry = () => {
    if (!selectedDate || isSaving) return
    const text = entryText.trim()
    if (!text) return setError('Text required')
    const time = parseTime(entryTime)
    if (time === undefined) return setError('Time: HH:MM')

    setError(null)
    const date = selectedDate
    createEntry({ date, time, text, entryType }, {
      onSuccess: () => {
        invalidate()
        resetForm()
        setIsAddingEntry(false)
        try { recordCalendarSignal(entryType, date) } catch (_) {}
      },
      onError: () => setError('Not saved — retry'),
    })
  }

  const handleStatus = (e: CalendarEntry, status: EntryStatus) => {
    setOpenRow(null)
    setStatus({ entryId: e.id, status }, { onSuccess: invalidate })
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) {
      setViewMonth({ year: now.getFullYear(), month: now.getMonth() })
    }
    setIsCalendarOpen(!isCalendarOpen)
  }

  const toggleDesktop = async () => {
    if (desktopOn) {
      setDesktopAlertsEnabled(false)
      setDesktopOn(false)
      return
    }
    try {
      const perm = Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission
      const on = perm === 'granted'
      setDesktopAlertsEnabled(on)
      setDesktopOn(on)
    } catch {}
  }
  const canDesktop = typeof window !== 'undefined' && 'Notification' in window

  const renderRow = (e: CalendarEntry, showDate: boolean) => {
    const overdue = isOverdue(e, now)
    const at = entryDateTime(e)
    const soon = e.time && e.date === todayKey && !overdue
    const isOpen = openRow === e.id
    const done = e.status !== 'open'
    return (
      <div key={e.id}>
        <div
          className={cn(
            'flex flex-wrap justify-between gap-x-16 cursor-pointer',
            done && 'text-acc/30 line-through'
          )}
          onClick={() => setOpenRow(isOpen ? null : e.id)}
        >
          <span>
            {showDate ? whenLabel(e, now) : (e.time || '—')}
            {overdue && <span className="text-acc/40 uppercase tracking-widest"> · Overdue</span>}
            {soon && <span className="text-acc/40 tabular-nums"> · {countdown(at, now)}</span>}
          </span>
          <span className="text-right break-words min-w-0 ml-auto">
            {e.type !== 'note' && <span className="text-acc/40">{TYPE_CODE[e.type]} </span>}
            {e.text}
          </span>
        </div>
        {isOpen && (
          <div className="flex gap-16 text-acc/40 mb-4">
            {e.status === 'open' ? (
              <>
                <button className="hover:text-acc transition-opacity" onClick={() => handleStatus(e, 'done')}>
                  Done
                </button>
                <button className="hover:text-acc transition-opacity" onClick={() => handleStatus(e, 'cancelled')}>
                  Scrub
                </button>
              </>
            ) : (
              <button className="hover:text-acc transition-opacity" onClick={() => handleStatus(e, 'open')}>
                Reopen
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
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
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
              >
                {'<—'}
              </button>
              <span className="text-acc">{monthLabel}</span>
              <button
                className="text-acc/40 hover:text-acc transition-opacity"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
              >
                {'—>'}
              </button>
              {!isCurrentView && (
                <button
                  className="text-acc/30 hover:text-acc/60 transition-opacity ml-8"
                  onClick={() => setViewMonth({ year: now.getFullYear(), month: now.getMonth() })}
                >
                  Today
                </button>
              )}
            </div>

            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex gap-0">
                  {week.map((d, di) => {
                    const key = toDateKey(d)
                    const isToday = key === todayKey
                    const isCurrentMonth = d.getMonth() === viewMonth.month
                    const isSelected = key === selectedDate
                    const hasEntry = datesWithEntries.has(key)

                    return (
                      <button
                        key={key}
                        onClick={() => handleDateClick(key)}
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
                        {DAY_LETTERS[di]}{d.getDate()}
                        {hasEntry && <span className="text-acc/60">·</span>}
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
                  <span className="text-acc/30 ml-auto">
                    {dayjs(selectedDate).format('ddd, MMM D')}
                  </span>
                </div>
                <div className="flex gap-8 items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => { setEntryTime(e.target.value); setError(null) }}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    aria-label="Time (optional)"
                    maxLength={7}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 w-[5.5em] outline-none focus:border-acc/40 tabular-nums"
                  />
                  <input
                    type="text"
                    value={entryText}
                    onChange={e => { setEntryText(e.target.value); setError(null) }}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder={`Add ${entryType}...`}
                    maxLength={280}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-0 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <Button onClick={handleAddEntry} disabled={isSaving}>
                    {isSaving ? '...' : 'Add'}
                  </Button>
                </div>
                {error && <div className="text-acc/40 mt-4">{error}</div>}
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map(e => renderRow(e, false))}
              </div>
            )}
          </div>
        )}

        {isError && (
          <button className="text-acc/40 hover:text-acc transition-opacity" onClick={() => refetch()}>
            Calendar offline — retry
          </button>
        )}

        {upcoming.length > 0 && (
          <div className="space-y-1">
            {upcoming.map(e => renderRow(e, true))}
          </div>
        )}

        {!isLoading && !isError && upcoming.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}

        {canDesktop && (upcoming.length > 0 || isCalendarOpen) && (
          <div className="mt-8">
            <button
              className="text-acc/30 hover:text-acc/60 transition-opacity"
              onClick={toggleDesktop}
            >
              Desktop alerts: {desktopOn ? 'On' : 'Off'}
            </button>
          </div>
        )}
      </div>
    </Block>
  )
}
