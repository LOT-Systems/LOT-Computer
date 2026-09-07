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
  time?: string
  text: string
  type: EntryType
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Notified alerts persist across reloads so a fired reminder never repeats.
const NOTIFIED_STORAGE_KEY = 'calendar_notified_entries_v1'
const ALERT_CHECK_INTERVAL_MS = 30 * 1000
const ALERT_WINDOW_MINUTES = 10

function entryKey(e: CalendarEntry): string {
  return `${e.date}|${e.time || ''}|${e.text}`
}

function entryDateTime(e: CalendarEntry): Dayjs {
  return e.time ? dayjs(`${e.date} ${e.time}`) : dayjs(e.date).startOf('day')
}

function loadNotifiedKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch (_) {
    return new Set()
  }
}

function saveNotifiedKeys(keys: Set<string>) {
  try {
    // Cap stored keys so this never grows unbounded across years of use.
    const trimmed = Array.from(keys).slice(-500)
    localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(trimmed))
  } catch (_) {}
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
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')

  const [activeAlert, setActiveAlert] = React.useState<CalendarEntry | null>(null)
  const notifiedKeysRef = React.useRef<Set<string>>(loadNotifiedKeys())

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        date: log.metadata?.date as string,
        time: (log.metadata?.time as string) || undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => entryDateTime(a).valueOf() - entryDateTime(b).valueOf())
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const now = dayjs()
    const today = now.startOf('day')
    return entries
      .filter(e => e.time ? entryDateTime(e).isAfter(now) : !dayjs(e.date).isBefore(today))
      .slice(0, 10)
  }, [entries])

  // Reliable due-reminder scan: fires a stylish alert once per entry, ever,
  // and logs the firing into the Log feed so alerts have their own trail.
  React.useEffect(() => {
    const checkDue = () => {
      if (document.hidden) return
      const now = dayjs()
      for (const e of entries) {
        if (!e.time) continue
        const key = entryKey(e)
        if (notifiedKeysRef.current.has(key)) continue
        const due = entryDateTime(e)
        if (now.isBefore(due)) continue
        if (now.isAfter(due.add(ALERT_WINDOW_MINUTES, 'minute'))) continue

        notifiedKeysRef.current.add(key)
        saveNotifiedKeys(notifiedKeysRef.current)
        setActiveAlert(e)

        createLog({
          text: `[ALERT] ${e.type}: ${e.text} (${dayjs(e.date).format('MMMM D')} ${e.time})`,
          event: 'calendar_alert',
          metadata: { date: e.date, time: e.time, entryType: e.type, text: e.text },
        }, {
          onSuccess: () => queryClient.refetchQueries(['/api/logs']),
        })

        setTimeout(() => setActiveAlert(a => (a === e ? null : a)), 8000)
        break // one alert on screen at a time
      }
    }

    checkDue()
    const interval = setInterval(checkDue, ALERT_CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [entries, createLog, queryClient])

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
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ` at ${time}` : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        time,
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
                    type="text"
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <input
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40"
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
                  {entry.time && <span className="text-acc/40 tabular-nums ml-4">{entry.time}</span>}
                  <span className="text-acc/30 ml-4">{entryDateTime(entry).fromNow()}</span>
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
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-16 py-8
                     border border-acc/20 bg-[var(--base-color)] grid-fill-light"
          style={{ animation: 'calAlertFadeInUp 0.4s ease-out, calAlertFadeOut 0.4s ease-in 7.5s forwards' }}
        >
          <div className="text-center">
            <div className="text-acc/40 uppercase tracking-widest mb-4">// Schedule Alert //</div>
            <div className="text-acc uppercase">{activeAlert.type}</div>
            <div className="text-acc/80 mt-4">{activeAlert.text}</div>
            {activeAlert.time && (
              <div className="text-acc/40 mt-4 tabular-nums">{activeAlert.time}</div>
            )}
          </div>
        </div>
      )}
    </Block>
  )
}

const calendarAlertStyle = document.createElement('style')
calendarAlertStyle.textContent = `
  @keyframes calAlertFadeInUp {
    from { opacity: 0; transform: translate(-50%, 10px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  @keyframes calAlertFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`
if (typeof document !== 'undefined') {
  document.head.appendChild(calendarAlertStyle)
}
