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
import {
  alertKey,
  dueAlerts,
  alertLevelFor,
  entryTimestamp,
  formatCountdown,
  normalizeTime,
} from '#client/utils/calendarAlerts'
import type { AlertLevel } from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  date: string
  time?: string
  text: string
  type: EntryType
}

const FIRED_STORAGE_KEY = 'lot-calendar-alerts-fired'

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_STORAGE_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch (_) {
    return new Set()
  }
}

function saveFired(fired: Set<string>) {
  try {
    // keep the newest 200 keys only
    localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify([...fired].slice(-200)))
  } catch (_) {}
}

function sortKey(e: CalendarEntry) {
  return `${e.date} ${e.time || '99:99'}`
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
  const { data: logs = [], isSuccess: logsLoaded } = useLogs()
  const { mutate: createLog } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [now, setNow] = React.useState(() => Date.now())
  const firedRef = React.useRef<Set<string> | null>(null)
  const [entryType, setEntryType] = React.useState<EntryType>('note')

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
      .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today)
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

  // Tick: 1s while a timed entry is within the alert window, else 15s.
  const hasImminent = React.useMemo(
    () => entries.some(e => {
      const ts = entryTimestamp(e)
      return ts !== null && ts - now < 16 * 60_000 && ts - now > -61 * 60_000
    }),
    [entries, now]
  )
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), hasImminent ? 1000 : 15000)
    return () => clearInterval(id)
  }, [hasImminent])

  // Fire alerts into Log exactly once per entry/level (deduped via logs + localStorage).
  React.useEffect(() => {
    if (!logsLoaded) return
    if (!firedRef.current) {
      const fired = loadFired()
      logs.forEach(l => {
        if (l.event === 'calendar_alert' && l.metadata?.key) fired.add(l.metadata.key as string)
      })
      firedRef.current = fired
    }
    const fired = firedRef.current
    const due = dueAlerts(entries, now, fired)
    if (!due.length) return
    due.forEach(({ entry, level, key, deltaMs }) => {
      fired.add(key)
      const mins = Math.max(0, Math.round(deltaMs / 60000))
      createLog({
        text: `[ALERT] ${level} ${entry.type.toUpperCase()} ${entry.time} — ${entry.text}`,
        event: 'calendar_alert',
        metadata: {
          key,
          level,
          date: entry.date,
          time: entry.time,
          entryType: entry.type,
          text: entry.text,
          minutes: mins,
        },
      }, { onSuccess: () => { queryClient.refetchQueries(['/api/logs']) } })
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${level} · ${entry.type.toUpperCase()} ${entry.time}`, { body: entry.text })
        }
      } catch (_) {}
    })
    saveFired(fired)
  }, [entries, now, logsLoaded])

  const activeAlerts = React.useMemo(() => {
    const out: { entry: CalendarEntry; level: AlertLevel; deltaMs: number }[] = []
    entries.forEach(entry => {
      const ts = entryTimestamp(entry)
      if (ts === null) return
      const level = alertLevelFor(ts - now)
      if (level) out.push({ entry, level, deltaMs: ts - now })
    })
    return out
  }, [entries, now])

  const today = dayjs(now).format('YYYY-MM-DD')
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
    const time = entryTime.trim() ? normalizeTime(entryTime) : null
    if (entryTime.trim() && !time) return // invalid time: keep form open

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ' ' + time : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        ...(time ? { time } : {}),
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
        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-1">
            {activeAlerts.map(({ entry, level, deltaMs }, i) => (
              <div
                key={i}
                className={cn(
                  'flex justify-between gap-16 border-l-2 pl-8 uppercase tracking-widest tabular-nums',
                  level === 'NOW' && 'border-acc text-acc animate-pulse',
                  level === 'T-05' && 'border-acc text-acc',
                  level === 'T-15' && 'border-acc/40 text-acc/70',
                  level === 'OVERDUE' && 'border-acc/40 text-acc/40',
                )}
              >
                <span className="whitespace-nowrap">
                  {level === 'NOW' ? '▌NOW' : level === 'OVERDUE' ? '▌OVERDUE' : `▌${level}`}
                  {' '}{entry.type} {entry.time}
                </span>
                <span className="text-right normal-case tracking-normal">
                  {entry.text} · {formatCountdown(deltaMs)}
                </span>
              </div>
            ))}
          </div>
        )}

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
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    maxLength={5}
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5em] outline-none',
                      entryTime.trim() && !normalizeTime(entryTime)
                        ? 'border-acc/60'
                        : 'border-acc/20 focus:border-acc/40'
                    )}
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
                    {e.time && <span className="text-acc/40 tabular-nums mr-8">{e.time}</span>}
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
                  {entry.time && <span className="text-acc/60 tabular-nums"> {entry.time}</span>}
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
