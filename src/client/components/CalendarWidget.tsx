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
  ALERT_ORDER,
  currentStage,
  formatDuration,
  formatMinutes,
  minutesUntil,
  parseEntryInput,
} from '#client/utils/calendar'
import type { AlertStage } from '#client/utils/calendar'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time: string | null
  text: string
  type: EntryType
  done: boolean
}

type ActiveTimer = { entryId: string | null; label: string; startedAt: number }

const TIMER_KEY = 'lot-calendar-timer'
const ACK_KEY = 'lot-calendar-acked'

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch (_) {
    return fallback
  }
}

function writeStore(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
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

  const [now, setNow] = React.useState(() => Date.now())
  const [timer, setTimer] = React.useState<ActiveTimer | null>(() =>
    readStore<ActiveTimer | null>(TIMER_KEY, null)
  )
  const [acked, setAcked] = React.useState<Record<string, true>>(() =>
    readStore<Record<string, true>>(ACK_KEY, {})
  )
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const notified = React.useRef<Set<string>>(new Set())

  const doneIds = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_done' && log.metadata?.entryId) {
        set.add(log.metadata.entryId as string)
      }
    })
    return set
  }, [logs])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        date: log.metadata?.date as string,
        time: (log.metadata?.time as string) || null,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
        done: doneIds.has(log.id),
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
  }, [logs, doneIds])

  // Minutes tracked today, per entry id and in total (from calendar_timer logs).
  const trackedToday = React.useMemo(() => {
    const dayStart = dayjs(now).startOf('day').valueOf()
    const byEntry: Record<string, number> = {}
    let total = 0
    logs.forEach(log => {
      if (log.event !== 'calendar_timer') return
      if (new Date(log.createdAt).getTime() < dayStart) return
      const sec = Number(log.metadata?.seconds) || 0
      total += sec
      const k = log.metadata?.entryId as string | undefined
      if (k) byEntry[k] = (byEntry[k] || 0) + sec
    })
    return { byEntry, total }
  }, [logs, now])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today)
      .filter(e => !e.done || e.date === today)
      .slice(0, 10)
  }, [entries, now])

  // Reminder stages due now: most urgent per entry, unacknowledged only.
  const activeAlerts = React.useMemo(() => {
    const d = new Date(now)
    const todayKey = dayjs(d).format('YYYY-MM-DD')
    const out: { entry: CalendarEntry; stage: AlertStage; mins: number }[] = []
    entries.forEach(e => {
      if (e.done || !e.time || e.date !== todayKey) return
      const mins = minutesUntil(e.date, e.time, d)
      const stage = currentStage(mins)
      if (stage && !acked[`${e.id}:${stage}`]) out.push({ entry: e, stage, mins })
    })
    return out
  }, [entries, acked, now])

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

  // Clock: 1s while a timer runs, 20s otherwise (reminder granularity is 1 min).
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), timer ? 1000 : 20000)
    return () => clearInterval(id)
  }, [!!timer])

  // Optional OS notification, once per entry/stage, only if already permitted.
  React.useEffect(() => {
    activeAlerts.forEach(({ entry, stage }) => {
      const k = `${entry.id}:${stage}`
      if (notified.current.has(k)) return
      notified.current.add(k)
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${stage} · ${entry.type.toUpperCase()} · ${entry.time}`, { body: entry.text })
        }
      } catch (_) {}
    })
  }, [activeAlerts])

  const handleAck = (entryId: string, stage: AlertStage) => {
    const next = { ...acked }
    // Acknowledging a stage silences it and all earlier ones.
    ALERT_ORDER.slice(0, ALERT_ORDER.indexOf(stage) + 1).forEach(st => {
      next[`${entryId}:${st}`] = true
    })
    setAcked(next)
    writeStore(ACK_KEY, next)
  }

  const refetchLogs = () => queryClient.refetchQueries(['/api/logs'])

  const handleDone = (entry: CalendarEntry) => {
    if (entry.done) return
    createLog({
      text: `[SCHEDULE] done: ${entry.text}`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, label: entry.text, date: entry.date },
    }, {
      onSuccess: refetchLogs,
      onError: () => setError('Could not save. Try again.'),
    })
  }

  const handleStartTimer = (entry: CalendarEntry | null) => {
    if (timer) return
    const t: ActiveTimer = {
      entryId: entry?.id ?? null,
      label: entry?.text ?? 'Focus',
      startedAt: Date.now(),
    }
    setTimer(t)
    setNow(Date.now())
    writeStore(TIMER_KEY, t)
  }

  const handleStopTimer = () => {
    if (!timer) return
    const stopped = timer
    const endedAt = Date.now()
    const seconds = Math.round((endedAt - stopped.startedAt) / 1000)
    setTimer(null)
    writeStore(TIMER_KEY, null)
    if (seconds < 60) return // too short to be a record
    createLog({
      text: `[TIME] ${stopped.label} — ${formatMinutes(seconds / 60)}`,
      event: 'calendar_timer',
      metadata: {
        entryId: stopped.entryId,
        label: stopped.label,
        startedAt: new Date(stopped.startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        seconds,
      },
    }, {
      onSuccess: refetchLogs,
      onError: () => {
        // Restore so tracked time is never lost on a failed save.
        setTimer(stopped)
        writeStore(TIMER_KEY, stopped)
        setError('Could not save time. Timer restored.')
      },
    })
  }

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    if (selectedDate === key) {
      setSelectedDate(null)
    } else {
      setSelectedDate(key)
    }
  }

  const handleAddEntry = () => {
    if (!selectedDate || isSaving) return
    const { time, text } = parseEntryInput(entryText)
    if (!text) return

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const date = selectedDate
    setIsSaving(true)
    setError(null)

    createLog({
      text: `[SCHEDULE] ${entryType}: ${text} (${dateLabel}${time ? ` ${time}` : ''})`,
      event: 'calendar_entry',
      metadata: { date, text, entryType, ...(time ? { time } : {}) },
    }, {
      onSuccess: () => {
        refetchLogs()
        try { recordCalendarSignal(entryType, date) } catch (_) {}
        setEntryText('')
        setIsAddingEntry(false)
        setIsSaving(false)
        try {
          if (time && typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission()
          }
        } catch (_) {}
      },
      onError: () => {
        // Keep the text so nothing typed is lost.
        setIsSaving(false)
        setError('Could not save. Try again.')
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
        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-1">
            {activeAlerts.map(({ entry, stage, mins }) => (
              <div
                key={`${entry.id}:${stage}`}
                className={cn(
                  'flex items-baseline gap-8 border-l-2 border-acc pl-8 text-acc',
                  stage === 'T-00' && 'animate-pulse',
                  stage === 'LATE' && 'font-bold'
                )}
              >
                <span className="tabular-nums whitespace-nowrap">[{stage}]</span>
                <span className="uppercase tracking-widest whitespace-nowrap">{entry.type}</span>
                <span className="tabular-nums whitespace-nowrap">{entry.time}</span>
                <span className="flex-1">{entry.text}</span>
                <span className="text-acc/40 tabular-nums whitespace-nowrap">
                  {mins > 0 ? `${mins}m` : mins === 0 ? 'NOW' : `+${-mins}m`}
                </span>
                <button
                  className="text-acc/60 hover:text-acc transition-opacity whitespace-nowrap"
                  onClick={() => handleAck(entry.id, stage)}
                >
                  ACK
                </button>
              </div>
            ))}
          </div>
        )}

        {timer && (
          <div className="mb-16 flex items-baseline gap-8 text-acc">
            <span className="tabular-nums">{formatDuration((now - timer.startedAt) / 1000)}</span>
            <span className="flex-1 text-acc/60">{timer.label}</span>
            <button
              className="hover:opacity-60 transition-opacity"
              onClick={handleStopTimer}
            >
              Stop
            </button>
          </div>
        )}

        {error && <div className="mb-8 text-acc/60">{error}</div>}

        <div className="mb-16 flex gap-8 items-center">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          {!timer && (
            <Button onClick={() => handleStartTimer(null)}>
              Start timer
            </Button>
          )}
          {trackedToday.total >= 60 && (
            <span className="text-acc/40 tabular-nums">
              Today: {formatMinutes(trackedToday.total / 60)}
            </span>
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
                    type="text"
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder={`Add ${entryType}... (start with 14:30 to set a time)`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <Button onClick={handleAddEntry} disabled={isSaving}>Add</Button>
                </div>
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map((e, i) => (
                  <div key={e.id || i} className={cn('text-acc/80 mb-1', e.done && 'line-through text-acc/40')}>
                    {e.time && <span className="tabular-nums mr-8">{e.time}</span>}
                    {e.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry, i) => {
              const tracked = trackedToday.byEntry[entry.id]
              const isRunning = timer?.entryId === entry.id
              return (
                <div key={entry.id || i} className={cn('flex justify-between gap-16', entry.done && 'text-acc/40 line-through')}>
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="tabular-nums"> {entry.time}</span>}
                  </span>
                  <span className="text-acc text-right flex items-baseline gap-8 justify-end">
                    {tracked >= 60 && (
                      <span className="text-acc/40 tabular-nums">{formatMinutes(tracked / 60)}</span>
                    )}
                    {!entry.done && !timer && (
                      <button
                        className="text-acc/30 hover:text-acc transition-opacity no-underline"
                        onClick={() => handleStartTimer(entry)}
                        title="Start timer"
                      >
                        Start
                      </button>
                    )}
                    {!entry.done && isRunning && <span className="text-acc/60">running</span>}
                    {!entry.done && (
                      <button
                        className="text-acc/30 hover:text-acc transition-opacity"
                        onClick={() => handleDone(entry)}
                        title="Mark done"
                      >
                        Done
                      </button>
                    )}
                    <span>{entry.text}</span>
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {upcomingEntries.length === 0 && !isCalendarOpen && !timer && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
