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
type EntryStatus = 'EXECUTE' | 'ALERT' | 'STANDBY' | 'ELAPSED' | null

type CalendarEntry = {
  id: string
  date: string
  time?: string
  text: string
  type: EntryType
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const ALERT_WINDOW_MIN = 60
const EXECUTE_WINDOW_MIN = 15
const ALERT_AUTO_DISMISS_MS = 30000
const ALERT_POLL_MS = 30000

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

// Entries are keyed by a plain "HH:mm" string, so build the timestamp from
// numeric parts rather than re-parsing a composed string — avoids depending
// on a date-time format the runtime's Date parser may read differently.
function parseTimeParts(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}

// Timed entries come due at the clock minute; all-day entries come due at
// end-of-day so a bare date doesn't fire an alert the instant it rolls over.
function getEventDayjs(entry: CalendarEntry): Dayjs {
  const base = dayjs(entry.date)
  const parts = entry.time ? parseTimeParts(entry.time) : null
  if (!parts) return base.endOf('day')
  return base.hour(parts.hour).minute(parts.minute).second(0).millisecond(0)
}

function getStatus(entry: CalendarEntry, now: Dayjs): EntryStatus {
  if (!entry.time) return null
  const diffMin = getEventDayjs(entry).diff(now, 'minute')
  if (diffMin < 0) return 'ELAPSED'
  if (diffMin <= EXECUTE_WINDOW_MIN) return 'EXECUTE'
  if (diffMin <= ALERT_WINDOW_MIN) return 'ALERT'
  return 'STANDBY'
}

function statusClass(status: EntryStatus): string {
  if (status === 'EXECUTE') return 'text-acc font-bold'
  if (status === 'ALERT') return 'text-acc/70'
  if (status === 'ELAPSED') return 'text-acc/30'
  return 'text-acc/60'
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
  const [now, setNow] = React.useState(() => dayjs())
  const [activeAlert, setActiveAlert] = React.useState<{ entry: CalendarEntry; status: 'EXECUTE' | 'ALERT' } | null>(null)
  const [notifyPermission, setNotifyPermission] = React.useState<NotificationPermission | 'unsupported'>(
    () => (typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported')
  )
  const alertedRef = React.useRef<Set<string>>(new Set())

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        date: log.metadata?.date as string,
        time: log.metadata?.time as string | undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => a.date === b.date
        ? (a.time || '').localeCompare(b.time || '')
        : a.date.localeCompare(b.date))
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const today = now.format('YYYY-MM-DD')
    const nowTime = now.format('HH:mm')
    return entries
      .filter(e => e.date > today || (e.date === today && (!e.time || e.time >= nowTime)))
      .slice(0, 10)
  }, [entries, now])

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter(e => e.date === selectedDate)
  }, [entries, selectedDate])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => set.add(e.date))
    return set
  }, [entries])

  const today = now.format('YYYY-MM-DD')
  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  // Tick the clock so due status (EXECUTE/ALERT/ELAPSED) advances live
  // without requiring a log refetch.
  React.useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 30000)
    return () => clearInterval(timer)
  }, [])

  // Fire an in-widget alert for timed entries within the alert window, and
  // record a `calendar_alert` Log entry so the event is durably tracked —
  // not just a transient toast. Each entry alerts at most once per mount
  // (deduped via alertedRef); an OS-level notification is also sent if the
  // operator has granted permission, so a due event still reaches them with
  // the tab in the background.
  React.useEffect(() => {
    const check = () => {
      const n = dayjs()
      for (const entry of entries) {
        if (!entry.time) continue
        if (alertedRef.current.has(entry.id)) continue
        const diffMin = getEventDayjs(entry).diff(n, 'minute')
        if (diffMin < 0 || diffMin > ALERT_WINDOW_MIN) continue

        alertedRef.current.add(entry.id)
        const status: 'EXECUTE' | 'ALERT' = diffMin <= EXECUTE_WINDOW_MIN ? 'EXECUTE' : 'ALERT'
        setActiveAlert({ entry, status })

        createLog({
          text: `[CAL-ALERT] ${status}: ${entry.text}`,
          event: 'calendar_alert',
          metadata: {
            entryId: entry.id,
            status,
            date: entry.date,
            time: entry.time,
            text: entry.text,
            entryType: entry.type,
          },
        }, {
          onSuccess: () => queryClient.refetchQueries(['/api/logs']),
        })

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`CAL [${status}] ${entry.type.toUpperCase()}`, {
              body: entry.text,
              tag: `lot-calendar-${entry.id}`,
            })
          } catch (_) { /* notification delivery is best-effort */ }
        }
      }
    }

    check()
    const timer = setInterval(check, ALERT_POLL_MS)
    return () => clearInterval(timer)
  }, [entries, createLog, queryClient])

  React.useEffect(() => {
    if (!activeAlert) return
    const timer = setTimeout(() => setActiveAlert(null), ALERT_AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [activeAlert])

  const requestNotifyPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    Notification.requestPermission().then(setNotifyPermission).catch(() => {})
  }

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    if (selectedDate === key) {
      setSelectedDate(null)
    } else {
      setSelectedDate(key)
    }
    // A date switch invalidates any in-progress entry for the previous day
    setIsAddingEntry(false)
    setEntryText('')
    setEntryTime('')
  }

  const handleAddEntry = () => {
    if (!selectedDate || !entryText.trim()) return

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const timeLabel = entryTime ? ` ${entryTime}` : ''

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${timeLabel})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        time: entryTime || undefined,
        text: entryText.trim(),
        entryType,
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
    <>
      <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
        <div className="w-full">
          <div className="mb-16 flex items-center gap-16">
            <Button onClick={handleToggleCalendar}>
              Add date
            </Button>
            {notifyPermission === 'default' && (
              <button
                className="text-acc/30 hover:text-acc/60 transition-opacity"
                onClick={requestNotifyPermission}
              >
                Enable alerts
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
                    <Button onClick={handleAddEntry}>Add</Button>
                  </div>
                </div>
              )}

              {selectedDate && entriesOnDate.length > 0 && (
                <div className="mt-8">
                  <div className="text-acc/40 mb-4">
                    {dayjs(selectedDate).format('dddd, MMMM D')}
                  </div>
                  {entriesOnDate.map((e) => {
                    const status = getStatus(e, now)
                    return (
                      <div key={e.id} className="text-acc/80 mb-1">
                        {e.time && <span className={cn('tabular-nums mr-8', statusClass(status))}>{e.time}</span>}
                        {e.text}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {upcomingEntries.length > 0 && (
            <div className="space-y-1">
              {upcomingEntries.map((entry) => {
                const status = getStatus(entry, now)
                return (
                  <div key={entry.id} className="flex justify-between gap-16">
                    <span className="text-acc whitespace-nowrap">
                      {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                      {entry.time && <span className={cn('tabular-nums', statusClass(status))}> · {entry.time}</span>}
                    </span>
                    <span className="text-acc text-right">
                      {entry.text}
                    </span>
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

      {activeAlert && (
        <div
          className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50
                     px-16 py-8 border border-[rgb(var(--acc-color-default)/0.4)]
                     bg-[var(--base-color)] grid-fill-light"
          style={{ animation: 'fadeInUp 0.3s ease-out, fadeOut 0.3s ease-in 29.5s forwards' }}
        >
          <div className="text-center uppercase tracking-widest">
            <div className="mb-4 font-bold text-acc">
              CAL [{activeAlert.status}] {activeAlert.entry.type}
            </div>
            <div className="text-acc/70 normal-case tracking-normal">
              {activeAlert.entry.text}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
