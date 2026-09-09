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
import { recordCalendarSignal, recordCalendarTimeSignal } from '#client/stores/intentionEngine'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  date: string
  text: string
  type: EntryType
}

type ActiveTimer = {
  key: string
  date: string
  text: string
  type: EntryType
  startedAt: number
}

type Notice = {
  id: string
  label: string
  message: string
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const ACTIVE_TIMER_KEY = 'lot_calendar_active_timer'
const NOTICE_LIFETIME_MS = 4200

function entryKey(e: { date: string; type: EntryType; text: string }): string {
  return `${e.date}|${e.type}|${e.text}`
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatTrackedBadge(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`
  const totalMinutes = Math.round(totalSeconds / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0) return `${h}h${m > 0 ? ` ${m}m` : ''}`
  return `${m}m`
}

function loadActiveTimer(): ActiveTimer | null {
  try {
    const raw = localStorage.getItem(ACTIVE_TIMER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.startedAt === 'number' && typeof parsed.key === 'string') {
      return parsed as ActiveTimer
    }
  } catch (_) {}
  return null
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

  const [activeTimer, setActiveTimer] = React.useState<ActiveTimer | null>(loadActiveTimer)
  const [tick, setTick] = React.useState(0)
  const [notices, setNotices] = React.useState<Notice[]>([])
  const dueTodayNotifiedRef = React.useRef(false)

  const pushNotice = React.useCallback((label: string, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setNotices(prev => [...prev.slice(-3), { id, label, message }])
    setTimeout(() => {
      setNotices(prev => prev.filter(n => n.id !== id))
    }, NOTICE_LIFETIME_MS)
  }, [])

  // Tick every second while a timer is running so elapsed time stays live.
  React.useEffect(() => {
    if (!activeTimer) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [activeTimer])

  // Persist the running timer so it survives a reload — reliability over a pure in-memory timer.
  React.useEffect(() => {
    try {
      if (activeTimer) localStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(activeTimer))
      else localStorage.removeItem(ACTIVE_TIMER_KEY)
    } catch (_) {}
  }, [activeTimer])

  const elapsedSeconds = React.useMemo(() => {
    if (!activeTimer) return 0
    return Math.max(0, Math.floor((Date.now() - activeTimer.startedAt) / 1000))
  }, [activeTimer, tick])

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

  const totalTrackedByKey = React.useMemo(() => {
    const map = new Map<string, number>()
    logs
      .filter(log => log.event === 'calendar_time_log' && log.metadata)
      .forEach(log => {
        const date = log.metadata?.date as string
        const type = (log.metadata?.entryType as EntryType) || 'note'
        const text = log.metadata?.text as string
        const duration = Number(log.metadata?.durationSeconds) || 0
        if (!date || !text || duration <= 0) return
        const key = entryKey({ date, type, text })
        map.set(key, (map.get(key) || 0) + duration)
      })
    return map
  }, [logs])

  const today = dayjs().format('YYYY-MM-DD')
  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  // Fire a one-time "due today" alert per mount once entries have loaded.
  React.useEffect(() => {
    if (dueTodayNotifiedRef.current) return
    const dueToday = entries.filter(e => e.date === today)
    if (dueToday.length > 0) {
      dueTodayNotifiedRef.current = true
      pushNotice('ALERT', `${dueToday.length} EVENT${dueToday.length !== 1 ? 'S' : ''} DUE TODAY`)
    }
  }, [entries, today, pushNotice])

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
        pushNotice('ENTRY', `${entryType.toUpperCase()} LOGGED — ${dateLabel}`)
      },
    })

    setEntryText('')
    setIsAddingEntry(false)
  }

  const handleStartTimer = (entry: CalendarEntry) => {
    if (activeTimer) return
    setActiveTimer({
      key: entryKey(entry),
      date: entry.date,
      text: entry.text,
      type: entry.type,
      startedAt: Date.now(),
    })
    pushNotice('TIMER', `ENGAGED — ${entry.text.toUpperCase()}`)
  }

  const handleStopTimer = () => {
    if (!activeTimer) return
    const timer = activeTimer
    const durationSeconds = Math.max(1, Math.floor((Date.now() - timer.startedAt) / 1000))

    createLog({
      text: `[TIMELOG] ${timer.type}: ${timer.text} — ${formatDuration(durationSeconds)}`,
      event: 'calendar_time_log',
      metadata: {
        date: timer.date,
        text: timer.text,
        entryType: timer.type,
        durationSeconds,
        startedAt: timer.startedAt,
        endedAt: Date.now(),
      },
    }, {
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        try { recordCalendarTimeSignal(timer.type, timer.date, durationSeconds) } catch (_) {}
      },
    })

    setActiveTimer(null)
    pushNotice('TIMER', `STANDBY — ${formatDuration(durationSeconds)} LOGGED`)
  }

  const renderTimerControl = (entry: CalendarEntry) => {
    const key = entryKey(entry)
    const isActive = activeTimer?.key === key
    const tracked = totalTrackedByKey.get(key) || 0

    if (isActive) {
      return (
        <button
          onClick={handleStopTimer}
          className="text-acc/60 hover:text-acc transition-opacity whitespace-nowrap"
        >
          ■ {formatDuration(elapsedSeconds)}
        </button>
      )
    }

    return (
      <span className="flex items-center gap-4 whitespace-nowrap">
        {tracked > 0 && (
          <span className="text-acc/30">{formatTrackedBadge(tracked)}</span>
        )}
        <button
          onClick={() => handleStartTimer(entry)}
          disabled={!!activeTimer}
          className={cn(
            'transition-opacity',
            activeTimer ? 'text-acc/15 cursor-default' : 'text-acc/30 hover:text-acc/60'
          )}
        >
          ▶
        </button>
      </span>
    )
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
                  <div key={i} className="flex items-center justify-between gap-8 text-acc/80 mb-1">
                    <span>{e.text}</span>
                    {renderTimerControl(e)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry, i) => (
              <div key={i} className="flex justify-between items-center gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                </span>
                <span className="text-acc text-right flex items-center justify-end gap-8">
                  <span>{entry.text}</span>
                  {renderTimerControl(entry)}
                </span>
              </div>
            ))}
          </div>
        )}

        {upcomingEntries.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>

      {notices.length > 0 && (
        <div className="fixed bottom-16 right-16 z-50 flex flex-col items-end gap-4 pointer-events-none">
          {notices.map(n => (
            <div
              key={n.id}
              className="pointer-events-auto border border-acc/30 bg-[var(--base-color)] px-8 py-4 text-acc font-mono text-xs uppercase tracking-wide"
              style={{ animation: 'calNoticeIn 0.25s ease-out, calNoticeOut 0.3s ease-in 3.9s forwards' }}
            >
              <span className="text-acc/50">[CAL::{n.label}]</span> {n.message}
            </div>
          ))}
        </div>
      )}
    </Block>
  )
}

if (typeof document !== 'undefined' && !document.getElementById('calendar-widget-keyframes')) {
  const style = document.createElement('style')
  style.id = 'calendar-widget-keyframes'
  style.textContent = `
    @keyframes calNoticeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes calNoticeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `
  document.head.appendChild(style)
}
