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
  time: string | null
  text: string
  type: EntryType
}

type AlertStage = 'pre' | 'due' | 'ack'

const PRE_ALERT_MS = 10 * 60 * 1000
const STALE_MS = 6 * 60 * 60 * 1000
const TICK_MS = 5000
const FIRED_KEY = 'lot-calendar-fired'
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const dueMs = (e: CalendarEntry) =>
  e.time ? new Date(`${e.date}T${e.time}:00`).getTime() : null

function formatCountdown(ms: number): string {
  const sign = ms >= 0 ? 'T-' : 'T+'
  const s = Math.floor(Math.abs(ms) / 1000)
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return `${sign}${hh > 0 ? p(hh) + ':' : ''}${p(mm)}:${p(ss)}`
}

function readFired(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(FIRED_KEY) || '[]'))
  } catch (_) {
    return new Set()
  }
}

function writeFired(set: Set<string>) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify([...set].slice(-200)))
  } catch (_) {}
}

function notifyBrowser(e: CalendarEntry, stage: 'pre' | 'due') {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    new Notification(stage === 'due' ? `${e.time} — ${e.type.toUpperCase()}` : `T-10 — ${e.type.toUpperCase()}`, {
      body: e.text,
      tag: `${e.id}:${stage}`,
    })
    navigator.vibrate?.(stage === 'due' ? [200, 100, 200] : [100])
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
  const [now, setNow] = React.useState(() => Date.now())

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => {
        const time = log.metadata?.time as string | undefined
        return {
          id: log.id,
          date: log.metadata?.date as string,
          time: time && TIME_RE.test(time) ? time : null,
          text: log.metadata?.text as string || log.text || '',
          type: (log.metadata?.entryType as EntryType) || 'note',
        }
      })
      .filter(e => e.date && e.text)
      .sort((a, b) =>
        a.date.localeCompare(b.date) || (a.time || '99:99').localeCompare(b.time || '99:99')
      )
  }, [logs])

  // Alert stages already recorded in Log (survives reloads and other devices)
  const loggedStages = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.entryId) {
        set.add(`${log.metadata.entryId}:${log.metadata.stage}`)
      }
    })
    return set
  }, [logs])

  const firedRef = React.useRef<Set<string>>(new Set())

  const logAlert = React.useCallback((e: CalendarEntry, stage: AlertStage, delta: number) => {
    const key = `${e.id}:${stage}`
    const fired = (firedRef.current = readFired())
    if (fired.has(key)) return false
    fired.add(key)
    writeFired(fired)
    const tag = stage === 'pre' ? 'PRE-ALERT' : stage === 'due' ? 'ALERT' : 'ACK'
    createLog({
      text: `[${tag}] ${e.time} ${e.type.toUpperCase()}: ${e.text} (${formatCountdown(delta)})`,
      event: 'calendar_alert',
      metadata: { entryId: e.id, stage, date: e.date, time: e.time, entryType: e.type },
    }, {
      onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
    })
    return true
  }, [createLog, queryClient])

  // Clock tick
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(id)
  }, [])

  // Fire alerts as time passes
  React.useEffect(() => {
    entries.forEach(e => {
      const due = dueMs(e)
      if (due === null) return
      const delta = due - now
      if (delta < -STALE_MS) return
      if (loggedStages.has(`${e.id}:ack`)) return
      if (delta <= 0 && !loggedStages.has(`${e.id}:due`)) {
        if (logAlert(e, 'due', delta)) notifyBrowser(e, 'due')
      } else if (delta > 0 && delta <= PRE_ALERT_MS && !loggedStages.has(`${e.id}:pre`)) {
        if (logAlert(e, 'pre', delta)) notifyBrowser(e, 'pre')
      }
    })
  }, [now, entries, loggedStages, logAlert])

  const activeAlerts = React.useMemo(() => {
    return entries
      .map(e => ({ e, due: dueMs(e) }))
      .filter((x): x is { e: CalendarEntry; due: number } => x.due !== null)
      .filter(({ e, due }) => {
        const delta = due - now
        return delta <= PRE_ALERT_MS && delta >= -STALE_MS && !loggedStages.has(`${e.id}:ack`)
      })
  }, [entries, now, loggedStages])

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
    if (entryTime && !TIME_RE.test(entryTime)) return
    const time = entryTime || undefined

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ' ' + time : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        text: entryText.trim(),
        entryType,
        ...(time ? { time } : {}),
      },
    }, {
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        try { recordCalendarSignal(entryType, selectedDate!) } catch (_) {}
      },
    })

    if (time) {
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
        <div className="mb-16">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
        </div>

        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-1 font-mono">
            {activeAlerts.map(({ e, due }) => {
              const delta = due - now
              const live = delta <= 0
              return (
                <div
                  key={e.id}
                  className={cn(
                    'flex items-center gap-8 border-l-2 pl-8',
                    live ? 'border-acc text-acc' : 'border-acc/40 text-acc/60'
                  )}
                >
                  <span className="whitespace-nowrap">
                    [{live ? 'ALERT' : 'PRE-ALERT'}] {e.time} {e.type.toUpperCase()}
                  </span>
                  <span className="flex-1 truncate">{e.text}</span>
                  <span className="whitespace-nowrap tabular-nums">{formatCountdown(delta)}</span>
                  <button
                    className="text-acc/60 hover:text-acc transition-opacity"
                    onClick={() => logAlert(e, 'ack', delta)}
                  >
                    [ACK]
                  </button>
                </div>
              )
            })}
          </div>
        )}

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
                    title="Optional time — enables alerts"
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
                  <div key={i} className="text-acc/80 mb-1">
                    {e.time && <span className="text-acc/40 mr-8">{e.time}</span>}
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
                  {entry.time && <span className="text-acc/60"> · {entry.time}</span>}
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
