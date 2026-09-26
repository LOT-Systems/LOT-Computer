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
import { recordCalendarSignal, recordCalendarAlertSignal } from '#client/stores/intentionEngine'
import { playCalendarAlertChime } from '#client/utils/sovietKeyboard'
import { ensureNotificationPermission, fireBrowserNotification } from '#client/utils/notifications'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time: string | null
  text: string
  type: EntryType
}

// Persists which alerts have already fired so a reload never re-fires
// a reminder the operator already saw. Capped so the list can't grow
// without bound over a multi-year session history.
const FIRED_ALERTS_KEY = 'lot_calendar_alerts_fired'
const MAX_FIRED_ALERTS = 200
// Reminders older than this are treated as stale backlog (e.g. the tab
// was closed for days) and are marked fired without alerting — a
// reliable reminder must not resurrect a week of missed entries at once.
const ALERT_CATCH_UP_MS = 30 * 60 * 1000
const ALERT_CHECK_INTERVAL_MS = 30 * 1000

function getFiredAlertIds(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_ALERTS_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function markAlertFired(id: string) {
  try {
    const raw = localStorage.getItem(FIRED_ALERTS_KEY)
    const arr: string[] = raw ? JSON.parse(raw) : []
    arr.push(id)
    localStorage.setItem(FIRED_ALERTS_KEY, JSON.stringify(arr.slice(-MAX_FIRED_ALERTS)))
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
  const { data: logs = [] } = useLogs()
  const { mutate: createLog } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [entryTime, setEntryTime] = React.useState('')
  const [activeAlert, setActiveAlert] = React.useState<CalendarEntry | null>(null)

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        date: log.metadata?.date as string,
        time: (log.metadata?.time as string) || null,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date)
        if (dateCmp !== 0) return dateCmp
        if (a.time && b.time) return a.time.localeCompare(b.time)
        return a.time ? -1 : b.time ? 1 : 0
      })
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
        ...(time && { time }),
      },
    }, {
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        try { recordCalendarSignal(entryType, selectedDate!) } catch (_) {}
      },
    })

    // A timed entry implies the operator wants to be alerted when it
    // comes due — ask for notification permission right here, on a
    // direct user action, since browsers ignore prompts fired later
    // from the background reminder timer.
    if (time) {
      ensureNotificationPermission().catch(() => {})
    }

    setEntryText('')
    setEntryTime('')
    setIsAddingEntry(false)
  }

  const fireAlert = React.useCallback((entry: CalendarEntry) => {
    setActiveAlert(entry)
    try { playCalendarAlertChime() } catch (_) {}
    try {
      fireBrowserNotification(
        `ALERT — ${entry.type.toUpperCase()} DUE`,
        entry.text
      )
    } catch (_) {}

    createLog({
      text: `[ALERT] ${entry.type} DUE ${entry.time} — ${entry.text}`,
      event: 'calendar_alert',
      metadata: {
        date: entry.date,
        time: entry.time,
        text: entry.text,
        entryType: entry.type,
        sourceLogId: entry.id,
      },
    }, {
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        try { recordCalendarAlertSignal(entry.type, entry.date, entry.time!) } catch (_) {}
      },
    })
  }, [createLog, queryClient])

  // Reminder engine: polls timed entries for the moment they come due.
  // Fired alerts persist in localStorage so a reload never repeats one.
  // Entries more than ALERT_CATCH_UP_MS overdue are marked fired
  // silently — a reliability guarantee against a backlog dump after
  // the tab has been closed for a long stretch.
  React.useEffect(() => {
    const checkAlerts = () => {
      const fired = getFiredAlertIds()
      const now = dayjs()

      for (const entry of entries) {
        if (!entry.time || fired.has(entry.id)) continue

        // dayjs() here has no customParseFormat plugin loaded, so build
        // the due moment from chained setters rather than parsing a
        // combined date+time string — a plugin-less format parse would
        // silently fall back to native Date parsing and drift by browser.
        const [hour, minute] = entry.time.split(':').map(Number)
        if (Number.isNaN(hour) || Number.isNaN(minute)) continue
        const due = dayjs(entry.date).hour(hour).minute(minute).second(0)

        const overdueMs = now.diff(due)
        if (overdueMs < 0) continue

        markAlertFired(entry.id)
        if (overdueMs <= ALERT_CATCH_UP_MS) {
          fireAlert(entry)
        }
      }
    }

    checkAlerts()
    const interval = setInterval(checkAlerts, ALERT_CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [entries, fireAlert])

  React.useEffect(() => {
    if (!activeAlert) return
    const timeout = setTimeout(() => setActiveAlert(null), 30000)
    return () => clearTimeout(timeout)
  }, [activeAlert])

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
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40 w-[6.5em]"
                    aria-label="Entry time (optional)"
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
                  <div key={i} className="text-acc/80 mb-1">
                    {e.time && <span className="text-acc/40 tabular-nums">{e.time} · </span>}
                    {e.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeAlert && (
          <div className="mb-16">
            <Block label="ALERT:" blockView>
              <div className="flex justify-between items-baseline gap-16">
                <div className="uppercase tracking-widest">{activeAlert.type} DUE</div>
                <button
                  className="text-acc/40 hover:text-acc transition-opacity whitespace-nowrap"
                  onClick={() => setActiveAlert(null)}
                >
                  Dismiss
                </button>
              </div>
              <div className="opacity-80 mt-4">{activeAlert.text}</div>
              <div className="opacity-40 mt-8 tabular-nums">
                {activeAlert.time} · {dayjs(activeAlert.date).format('MMM D')}
              </div>
            </Block>
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry, i) => (
              <div key={i} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time && ` · ${entry.time}`}
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
  )
}
