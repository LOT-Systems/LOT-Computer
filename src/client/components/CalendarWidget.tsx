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
import { useCreateLog, useLogs } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  date: string
  text: string
  type: EntryType
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function formatTrackedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = `0${Math.floor(totalSeconds / 3600)}`.slice(-2)
  const minutes = `0${Math.floor((totalSeconds % 3600) / 60)}`.slice(-2)
  const seconds = `0${totalSeconds % 60}`.slice(-2)
  return `${hours}:${minutes}:${seconds}`
}

type CalendarAlert = {
  code: string
  text: string
  time: string
}

if (typeof document !== 'undefined' && !document.getElementById('calendar-alert-keyframes')) {
  const style = document.createElement('style')
  style.id = 'calendar-alert-keyframes'
  style.textContent = `
    @keyframes calendarAlertIn {
      from { opacity: 0; transform: translate(-50%, 10px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes calendarAlertOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `
  document.head.appendChild(style)
}

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
  const { data: logs = [] } = useLogs()
  const { mutate: createLog } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')

  const [isTrackingPanelOpen, setIsTrackingPanelOpen] = React.useState(false)
  const [isTracking, setIsTracking] = React.useState(false)
  const [trackedMs, setTrackedMs] = React.useState(0)
  const trackingStartRef = React.useRef(0)
  const trackingFrameRef = React.useRef<number>()

  const [alert, setAlert] = React.useState<CalendarAlert | null>(null)
  const alertTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>()

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        date: log.metadata?.date as string,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today)
      .slice(0, 10)
  }, [entries])

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter(e => e.date === selectedDate)
  }, [entries, selectedDate])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => set.add(e.date))
    return set
  }, [entries])

  const today = dayjs().format('YYYY-MM-DD')
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

  const fireAlert = React.useCallback((code: string, text: string) => {
    clearTimeout(alertTimeoutRef.current)
    setAlert({ code, text, time: dayjs().format('HH:mm:ss') })
    alertTimeoutRef.current = setTimeout(() => setAlert(null), 4200)
  }, [])

  React.useEffect(() => {
    return () => {
      clearTimeout(alertTimeoutRef.current)
      cancelAnimationFrame(trackingFrameRef.current!)
    }
  }, [])

  const handleAddEntry = () => {
    if (!selectedDate || !entryText.trim()) return

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        text: entryText.trim(),
        entryType,
      },
    }, {
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        try { recordCalendarSignal(entryType, selectedDate!) } catch (_) {}
        fireAlert('CAL-LOG', `${entryType.toUpperCase()} · ${dayjs(selectedDate).format('MMM D')}`)
      },
    })

    setEntryText('')
    setIsAddingEntry(false)
  }

  const trackingTick = (now: number) => {
    setTrackedMs(now - trackingStartRef.current)
    trackingFrameRef.current = requestAnimationFrame(trackingTick)
  }

  const startTracking = () => {
    if (isTracking) return
    setIsTracking(true)
    trackingStartRef.current = performance.now() - trackedMs
    trackingFrameRef.current = requestAnimationFrame(trackingTick)
  }

  const pauseTracking = () => {
    setIsTracking(false)
    cancelAnimationFrame(trackingFrameRef.current!)
  }

  const discardTracking = () => {
    setIsTracking(false)
    setTrackedMs(0)
    cancelAnimationFrame(trackingFrameRef.current!)
  }

  const handleLogTrackedTime = () => {
    if (!selectedDate || trackedMs < 1000) return

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const label = entryText.trim() || undefined
    const durationMs = Math.round(trackedMs)

    createLog({
      text: `[TIME] ${formatTrackedTime(durationMs)} logged (${dateLabel})${label ? ` — ${label}` : ''}`,
      event: 'calendar_time_session',
      metadata: {
        date: selectedDate,
        durationMs,
        label,
      },
    }, {
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        fireAlert('CAL-TIME', `${formatTrackedTime(durationMs)} · ${dayjs(selectedDate).format('MMM D')}`)
      },
    })

    setIsTracking(false)
    setTrackedMs(0)
    cancelAnimationFrame(trackingFrameRef.current!)
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) {
      setViewMonth(dayjs())
    }
    setIsCalendarOpen(!isCalendarOpen)
  }

  return (
    <>
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
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
                    <div className="text-acc/30 flex items-center gap-8 ml-4 whitespace-nowrap">
                      {selectedDate && !isAddingEntry && (
                        <button
                          className="text-acc/30 hover:text-acc/60 transition-opacity"
                          onClick={() => setIsAddingEntry(true)}
                        >
                          Note / Task / Call
                        </button>
                      )}
                      {selectedDate && !isTrackingPanelOpen && (
                        <button
                          className="text-acc/30 hover:text-acc/60 transition-opacity"
                          onClick={() => setIsTrackingPanelOpen(true)}
                        >
                          Track time
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
                    type="text"
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <Button onClick={handleAddEntry}>Add</Button>
                </div>
              </div>
            )}

            {isTrackingPanelOpen && selectedDate && (
              <div className="mt-8">
                <div className="flex items-center gap-16">
                  <span className="text-acc tabular-nums tracking-widest">
                    {formatTrackedTime(trackedMs)}
                  </span>
                  <div className="flex gap-8">
                    {!isTracking ? (
                      <button
                        className="text-acc/40 hover:text-acc transition-opacity"
                        onClick={startTracking}
                      >
                        Start
                      </button>
                    ) : (
                      <button
                        className="text-acc/40 hover:text-acc transition-opacity"
                        onClick={pauseTracking}
                      >
                        Pause
                      </button>
                    )}
                    <button
                      className="text-acc/40 hover:text-acc transition-opacity"
                      onClick={handleLogTrackedTime}
                      disabled={trackedMs < 1000}
                    >
                      Log
                    </button>
                    <button
                      className="text-acc/30 hover:text-acc/60 transition-opacity"
                      onClick={() => { discardTracking(); setIsTrackingPanelOpen(false) }}
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map((e, i) => (
                  <div key={i} className="text-acc/80 mb-1">
                    {e.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry, i) => (
              <div key={i} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                </span>
                <span className="text-acc text-right">
                  {entry.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {upcomingEntries.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>

    {alert && (
      <div
        className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50
                   px-16 py-8 border border-acc/20 bg-[var(--base-color)] grid-fill-light"
        style={{ animation: 'calendarAlertIn 0.3s ease-out, calendarAlertOut 0.4s ease-in 3.8s forwards' }}
      >
        <div className="flex items-center gap-16 whitespace-nowrap">
          <span className="text-acc uppercase tracking-widest">{alert.code}</span>
          <span className="text-acc/60 tabular-nums">{alert.text}</span>
          <span className="text-acc/30 tabular-nums">{alert.time}</span>
        </div>
      </div>
    )}
    </>
  )
}
