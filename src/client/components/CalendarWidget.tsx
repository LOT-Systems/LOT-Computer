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
  time: string | null
  text: string
  type: EntryType
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Scheduled entries fire their alert once, within this window after their time.
const ALERT_WINDOW_MS = 10 * 60 * 1000
const CLOCK_TICK_MS = 20 * 1000
const NOTIFIED_STORAGE_KEY = 'calendar_notified_entries'

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

// Combine a 'YYYY-MM-DD' date with an 'HH:mm' time into a single instant.
// Avoids format-string parsing (no customParseFormat plugin loaded).
function combineDateTime(date: string, time: string): Dayjs | null {
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return dayjs(date).hour(h).minute(m).second(0).millisecond(0)
}

function entryKey(e: CalendarEntry): string {
  return `${e.date}|${e.time || ''}|${e.text}`
}

function loadNotifiedKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch (_) {
    return new Set()
  }
}

function saveNotifiedKeys(keys: Set<string>) {
  try {
    // Keep the tail only — this is a de-dupe guard, not a log.
    localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(Array.from(keys).slice(-200)))
  } catch (_) {}
}

// "T-minus 2h 15m" / "NOW" / "" (no time set)
function formatCountdown(date: string, time: string | null, now: Dayjs): string {
  if (!time) return ''
  const target = combineDateTime(date, time)
  if (!target) return ''
  const diffMin = target.diff(now, 'minute')
  if (diffMin <= 0 && diffMin > -(ALERT_WINDOW_MS / 60000)) return 'NOW'
  if (diffMin <= 0) return ''
  if (diffMin < 60) return `T-minus ${diffMin}m`
  const hours = Math.floor(diffMin / 60)
  const mins = diffMin % 60
  if (hours < 24) return `T-minus ${hours}h ${mins}m`
  return `T-minus ${Math.floor(hours / 24)}d`
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
  const [saveError, setSaveError] = React.useState(false)

  // Live clock — drives countdowns and the due-entry alert check.
  const [now, setNow] = React.useState(() => dayjs())
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return
      setNow(dayjs())
    }, CLOCK_TICK_MS)
    return () => clearInterval(interval)
  }, [])

  const [notifiedKeys, setNotifiedKeys] = React.useState<Set<string>>(() => loadNotifiedKeys())
  const [activeAlert, setActiveAlert] = React.useState<CalendarEntry | null>(null)

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        date: log.metadata?.date as string,
        time: (log.metadata?.time as string) || null,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today)
      .slice(0, 10)
  }, [entries])

  // Fire one tactical alert per tick for any timed entry that just came due,
  // and log it to the OS Log so the alert is a durable record, not just a toast.
  React.useEffect(() => {
    const due = entries.find(e => {
      if (!e.time || notifiedKeys.has(entryKey(e))) return false
      const target = combineDateTime(e.date, e.time)
      if (!target) return false
      const diffMs = now.diff(target)
      return diffMs >= 0 && diffMs <= ALERT_WINDOW_MS
    })
    if (!due) return

    const key = entryKey(due)
    setNotifiedKeys(prev => {
      const next = new Set(prev).add(key)
      saveNotifiedKeys(next)
      return next
    })
    setActiveAlert(due)

    createLog({
      text: `[ALERT] ${due.type}: ${due.text} — due ${due.time} ${dayjs(due.date).format('MMM D')}`,
      event: 'calendar_notification',
      metadata: { date: due.date, time: due.time, text: due.text, entryType: due.type },
    }, {
      onSuccess: () => queryClient.refetchQueries(['/api/logs']),
    })
  }, [entries, now, notifiedKeys, createLog, queryClient])

  React.useEffect(() => {
    if (!activeAlert) return
    const timer = setTimeout(() => setActiveAlert(null), 8000)
    return () => clearTimeout(timer)
  }, [activeAlert])

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
    const time = /^\d{2}:\d{2}$/.test(entryTime) ? entryTime : null
    const timeSuffix = time ? ` @ ${time}` : ''

    setSaveError(false)

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${timeSuffix})`,
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
        setEntryText('')
        setEntryTime('')
        setIsAddingEntry(false)
      },
      onError: () => {
        // Keep the draft in place — the entry is not reliably saved yet.
        setSaveError(true)
      },
    })
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
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40"
                  />
                  <Button onClick={handleAddEntry}>Add</Button>
                </div>
                {saveError && (
                  <div className="text-acc/60 mt-4">
                    ╞═╡ NOT SAVED — retry
                  </div>
                )}
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map((e, i) => (
                  <div key={i} className="flex gap-8 text-acc/80 mb-1">
                    {e.time && <span className="text-acc/40 whitespace-nowrap">{e.time}</span>}
                    <span>{e.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry, i) => {
              const countdown = formatCountdown(entry.date, entry.time, now)
              return (
                <div key={i} className="flex justify-between gap-16">
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && ` ${entry.time}`}
                  </span>
                  <span className="text-acc text-right">
                    {entry.text}
                    {countdown && (
                      <span className="text-acc/40 ml-8 whitespace-nowrap">{countdown}</span>
                    )}
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

      {activeAlert && (
        <div
          className="fixed bottom-16 right-16 z-50 max-w-[320px]
                     px-16 py-8 border border-acc/20 bg-[var(--base-color)] grid-fill-light"
          style={{ animation: 'calendarAlertIn 0.4s ease-out, calendarAlertOut 0.4s ease-in 7.6s forwards' }}
        >
          <div className="text-acc/40 whitespace-nowrap mb-4">
            {'╞═╡ SCHEDULE ALERT ╞═╡'}
          </div>
          <div className="text-acc uppercase">{activeAlert.type} · {activeAlert.time}</div>
          <div className="text-acc/80">{activeAlert.text}</div>
        </div>
      )}
    </Block>
  )
}

// CSS animation for the schedule-alert toast (mirrors EvolutionMilestoneToast's pattern,
// scoped keyframe names to avoid coupling to that component's lifecycle).
const style = document.createElement('style')
style.textContent = `
  @keyframes calendarAlertIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes calendarAlertOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`

if (typeof document !== 'undefined') {
  document.head.appendChild(style)
}
