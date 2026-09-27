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
  id: string
  date: string
  text: string
  type: EntryType
  time?: string
}

const DEFAULT_DUE_TIME = '09:00'
const ALERT_CATCH_UP_WINDOW_HOURS = 24
const ALERT_CHECK_INTERVAL_MS = 20000
const ALERT_DISPLAY_MS = 9000

function getDueAt(entry: Pick<CalendarEntry, 'date' | 'time'>): Dayjs {
  return dayjs(`${entry.date} ${entry.time || DEFAULT_DUE_TIME}`)
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
  const { data: logs = [] } = useLogs()
  const { mutate: createLog } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [entryTime, setEntryTime] = React.useState('')

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        date: log.metadata?.date as string,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
        time: log.metadata?.time as string | undefined,
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
  }, [logs])

  const firedAlertSourceIds = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.sourceLogId) {
        set.add(log.metadata.sourceLogId as string)
      }
    })
    return set
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

  // --- Reliable due-time tracking: fires a [ALERT] log + banner when a
  // scheduled entry's date/time arrives, catching up on entries missed
  // while the tab was closed (bounded to ALERT_CATCH_UP_WINDOW_HOURS so a
  // long-stale backlog never floods the widget on reopen).
  const [activeAlert, setActiveAlert] = React.useState<CalendarEntry | null>(null)
  const pendingAlertIds = React.useRef<Set<string>>(new Set())
  const alertQueueRef = React.useRef<CalendarEntry[]>([])
  const dismissTimerRef = React.useRef<number>()

  const showNextAlert = React.useCallback(() => {
    if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current)
    const next = alertQueueRef.current.shift() || null
    setActiveAlert(next)
    if (next) {
      dismissTimerRef.current = window.setTimeout(showNextAlert, ALERT_DISPLAY_MS)
    }
  }, [])

  const checkDueEntries = React.useCallback(() => {
    const now = dayjs()
    let queuedNew = false

    entries.forEach(entry => {
      if (firedAlertSourceIds.has(entry.id) || pendingAlertIds.current.has(entry.id)) return

      const dueAt = getDueAt(entry)
      if (!dueAt.isValid()) return

      const hoursOverdue = now.diff(dueAt, 'hour', true)
      if (hoursOverdue < 0 || hoursOverdue > ALERT_CATCH_UP_WINDOW_HOURS) return

      pendingAlertIds.current.add(entry.id)
      queuedNew = true
      alertQueueRef.current.push(entry)

      const dateLabel = dayjs(entry.date).format('dddd, MMMM D, YYYY')
      createLog({
        text: `[ALERT] SCHEDULE DUE — ${entry.type}: ${entry.text} (${dateLabel}${entry.time ? ` ${entry.time}` : ''})`,
        event: 'calendar_alert',
        metadata: {
          sourceLogId: entry.id,
          date: entry.date,
          time: entry.time,
          entryType: entry.type,
          text: entry.text,
        },
      }, {
        onSuccess: () => queryClient.refetchQueries(['/api/logs']),
        onError: () => { pendingAlertIds.current.delete(entry.id) },
      })
    })

    if (queuedNew && !activeAlert) showNextAlert()
  }, [entries, firedAlertSourceIds, createLog, queryClient, activeAlert, showNextAlert])

  React.useEffect(() => {
    checkDueEntries()
    const interval = window.setInterval(() => {
      if (!document.hidden) checkDueEntries()
    }, ALERT_CHECK_INTERVAL_MS)
    const onVisibility = () => { if (!document.hidden) checkDueEntries() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [checkDueEntries])

  React.useEffect(() => {
    return () => {
      if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current)
    }
  }, [])

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    if (selectedDate === key) {
      setSelectedDate(null)
    } else {
      setSelectedDate(key)
    }
  }

  const handleAddEntry = () => {
    if (!selectedDate || !entryText.trim()) return

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const time = entryTime || undefined

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ` ${time}` : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        text: entryText.trim(),
        entryType,
        time,
      },
    }, {
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        try { recordCalendarSignal(entryType, selectedDate!) } catch (_) {}
      },
    })

    setEntryText('')
    setEntryTime('')
    setIsAddingEntry(false)
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
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40"
                    title="Due time (optional, defaults to 09:00)"
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
                  <Button onClick={handleAddEntry}>Add</Button>
                </div>
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map((e, i) => (
                  <div key={i} className="text-acc/80 mb-1 flex gap-8">
                    {e.time && <span className="text-acc/40 tabular-nums">{e.time}</span>}
                    <span>{e.text}</span>
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
                  {entry.time && <span className="text-acc/40"> {entry.time}</span>}
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

      {activeAlert && (
        <div
          role="alert"
          className="fixed bottom-16 right-16 z-50 max-w-[320px] border border-acc/30 bg-bac px-16 py-12 font-mono"
          style={{ animation: 'calendarAlertIn 0.3s ease-out' }}
        >
          <div className="flex items-center justify-between gap-16 mb-4">
            <span className="uppercase tracking-widest text-acc animate-pulse">[ALERT]</span>
            <button
              className="text-acc/40 hover:text-acc transition-opacity"
              onClick={showNextAlert}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
          <div className="uppercase tracking-widest text-acc/60 text-xs mb-4">
            SCHEDULE DUE — {activeAlert.type}
          </div>
          <div className="text-acc mb-4">{activeAlert.text}</div>
          <div className="text-acc/40 tabular-nums">
            {dayjs(activeAlert.date).format('YYYY-MM-DD')}
            {activeAlert.time ? ` ${activeAlert.time}` : ''}
          </div>
        </div>
      )}
    </Block>
  )
}
