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
  currentStage,
  dueAlerts,
  formatCountdown,
  isValidTime,
  STAGE_LABEL,
} from '#client/utils/calendarAlerts'
import type { AlertStage, TimedEntry } from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = TimedEntry & { type: EntryType }

const FIRED_KEY = 'lot-calendar-fired-v1'
const TICK_MS = 15000

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch (_) {
    return new Set()
  }
}

function saveFired(set: Set<string>) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(set).slice(-300)))
  } catch (_) {}
}

function notifyBrowser(title: string, body: string, tag: string) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, tag })
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.([120, 60, 120])
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
  const { data: logs = [], isSuccess: logsReady } = useLogs()
  const { mutate: createLog } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [entryTime, setEntryTime] = React.useState('')
  const [now, setNow] = React.useState(() => Date.now())
  const firedRef = React.useRef<Set<string> | null>(null)

  // Ticker — drives countdowns and alert evaluation; paused while tab hidden.
  React.useEffect(() => {
    const tick = () => { if (!document.hidden) setNow(Date.now()) }
    const id = setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  // Alert engine — once per entry per stage, persisted locally and in Log.
  React.useEffect(() => {
    if (!logsReady) return
    if (!firedRef.current) firedRef.current = loadFired()
    const fired = firedRef.current
    firedFromLogs.forEach(k => fired.add(k))
    const due = dueAlerts(entries, now, fired)
    if (!due.length) return
    due.forEach(({ entry, stage }) => {
      fired.add(alertKey(entry, stage))
      const label = STAGE_LABEL[stage]
      const cd = formatCountdown(entry, now)
      createLog({
        text: `[CAL ALERT] ${label} ${cd} ${entry.type.toUpperCase()} ${entry.time}: ${entry.text}`,
        event: 'calendar_alert',
        metadata: { entryId: entry.id, stage, date: entry.date, time: entry.time, entryType: entry.type, text: entry.text },
      })
      notifyBrowser(`CAL // ${label} ${cd}`, `${entry.type.toUpperCase()} ${entry.time} — ${entry.text}`, alertKey(entry, stage))
    })
    saveFired(fired)
  }, [now, entries, firedFromLogs, logsReady, createLog])

  const activeAlerts = React.useMemo(() => {
    return entries
      .map(e => ({ entry: e, stage: currentStage(e, now) as AlertStage | null }))
      .filter((a): a is { entry: CalendarEntry; stage: AlertStage } => !!a.stage)
  }, [entries, now])

  const handleAck = (entry: CalendarEntry) => {
    createLog({
      text: `[CAL ACK] ${entry.type.toUpperCase()} ${entry.time || ''}: ${entry.text}`.replace('  ', ' '),
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, time: entry.time, entryType: entry.type, text: entry.text },
    }, {
      onSuccess: () => queryClient.refetchQueries(['/api/logs']),
    })
  }

  const { doneIds, firedFromLogs } = React.useMemo(() => {
    const done = new Set<string>()
    const fired = new Set<string>()
    logs.forEach(log => {
      const id = log.metadata?.entryId as string | undefined
      if (!id) return
      if (log.event === 'calendar_done') done.add(id)
      if (log.event === 'calendar_alert' && log.metadata?.stage) {
        fired.add(`${id}:${log.metadata.stage}`)
      }
    })
    return { doneIds: done, firedFromLogs: fired }
  }, [logs])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: String(log.id),
        date: log.metadata?.date as string,
        time: isValidTime(log.metadata?.time as string) ? (log.metadata?.time as string) : undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
        done: doneIds.has(String(log.id)),
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '99:99')).localeCompare(b.date + (b.time || '99:99')))
  }, [logs, doneIds])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today && !e.done)
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

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${isValidTime(entryTime) ? ' ' + entryTime : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        text: entryText.trim(),
        entryType,
        ...(isValidTime(entryTime) ? { time: entryTime } : {}),
      },
    }, {
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        try { recordCalendarSignal(entryType, selectedDate!) } catch (_) {}
      },
    })

    if (isValidTime(entryTime)) {
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission()
        }
      } catch (_) {}
    }
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
            {activeAlerts.map(({ entry, stage }) => (
              <div
                key={entry.id}
                className={cn(
                  'flex justify-between gap-16 text-acc',
                  stage !== 'T15' && 'animate-pulse'
                )}
              >
                <span className="uppercase tracking-widest tabular-nums">
                  {'▌'} CAL {'//'} {STAGE_LABEL[stage]} {formatCountdown(entry, now)} {'//'} {entry.type} {entry.time}
                  {' — '}
                  <span className="normal-case tracking-normal">{entry.text}</span>
                </span>
                <button
                  className="text-acc/60 hover:text-acc transition-opacity whitespace-nowrap"
                  onClick={() => handleAck(entry)}
                >
                  ACK
                </button>
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
                    aria-label="Time (optional)"
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
                  <div key={i} className={cn('text-acc/80 mb-1', e.done && 'line-through text-acc/30')}>
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
            {upcomingEntries.map((entry, i) => (
              <div key={entry.id + i} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time && <span className="tabular-nums"> {entry.time}</span>}
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
