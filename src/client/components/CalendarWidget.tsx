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
  time?: string
  text: string
  type: EntryType
}

type AlertStage = 'T-15' | 'T-05' | 'T-00' | 'MISSED'

type CalendarAlert = {
  key: string
  entry: CalendarEntry
  stage: AlertStage
  minutes: number
}

const ALERT_TICK_MS = 10_000
const MISSED_AFTER_MIN = 30
const MISSED_WINDOW_MIN = 24 * 60
const FIRED_STORAGE_KEY = 'lot:calendar:fired'
const ACKED_STORAGE_KEY = 'lot:calendar:acked'

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch (_) {
    return new Set()
  }
}

function writeSet(key: string, set: Set<string>) {
  try {
    // keep storage bounded
    localStorage.setItem(key, JSON.stringify(Array.from(set).slice(-300)))
  } catch (_) {}
}

// minutes from now until the entry (negative = past)
function minutesUntil(entry: CalendarEntry, now: Dayjs): number | null {
  if (!entry.time) return null
  const at = dayjs(`${entry.date}T${entry.time}`)
  if (!at.isValid()) return null
  return Math.ceil(at.diff(now, 'second') / 60)
}

function stageFor(minutes: number): AlertStage | null {
  if (minutes > 15) return null
  if (minutes > 5) return 'T-15'
  if (minutes > 0) return 'T-05'
  if (minutes > -MISSED_AFTER_MIN) return 'T-00'
  if (minutes > -MISSED_WINDOW_MIN) return 'MISSED'
  return null
}

function formatCountdown(minutes: number): string {
  const sign = minutes < 0 ? '+' : '-'
  const m = Math.abs(minutes)
  return `T${sign}${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
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
  const [now, setNow] = React.useState(() => dayjs())
  const [acked, setAcked] = React.useState<Set<string>>(() => readSet(ACKED_STORAGE_KEY))

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: String(log.id),
        date: log.metadata?.date as string,
        time: (log.metadata?.time as string | undefined) || undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`))
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    // Alerts already written to Log (any device) — source of truth for dedupe
  const loggedAlerts = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.entryId) {
        set.add(`${log.metadata.entryId}:${log.metadata.stage}`)
      }
    })
    return set
  }, [logs])

  // Clock: tick while mounted, re-sync when the tab wakes up
  React.useEffect(() => {
    const tick = () => setNow(dayjs())
    const id = window.setInterval(tick, ALERT_TICK_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  // Highest due stage per timed entry
  const activeAlerts = React.useMemo<CalendarAlert[]>(() => {
    const out: CalendarAlert[] = []
    entries.forEach(entry => {
      const minutes = minutesUntil(entry, now)
      if (minutes === null) return
      const stage = stageFor(minutes)
      if (!stage) return
      out.push({ key: `${entry.id}:${stage}`, entry, stage, minutes })
    })
    return out
  }, [entries, now])

  // Fire each stage once: claim locally first, then write to Log
  React.useEffect(() => {
    if (activeAlerts.length === 0) return
    const fired = readSet(FIRED_STORAGE_KEY)
    let changed = false
    activeAlerts.forEach(a => {
      if (fired.has(a.key) || loggedAlerts.has(a.key)) return
      fired.add(a.key)
      changed = true
      createLog({
        text: `[ALERT ${a.stage}] ${a.entry.type.toUpperCase()} ${a.entry.time} — ${a.entry.text}`,
        event: 'calendar_alert',
        metadata: {
          entryId: a.entry.id,
          stage: a.stage,
          date: a.entry.date,
          time: a.entry.time,
          entryType: a.entry.type,
        },
      }, {
        onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
        onError: () => {
          // release claim so the next tick retries
          const f = readSet(FIRED_STORAGE_KEY)
          f.delete(a.key)
          writeSet(FIRED_STORAGE_KEY, f)
        },
      })
      try {
        if (a.stage !== 'MISSED' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${a.stage} · ${a.entry.type.toUpperCase()} ${a.entry.time}`, { body: a.entry.text, tag: a.key })
        }
      } catch (_) {}
    })
    if (changed) writeSet(FIRED_STORAGE_KEY, fired)
  }, [activeAlerts, loggedAlerts, createLog, queryClient])

  const visibleAlerts = activeAlerts.filter(a => !acked.has(a.key))

  const handleAck = (key: string) => {
    const next = new Set(acked)
    next.add(key)
    setAcked(next)
    writeSet(ACKED_STORAGE_KEY, next)
  }

  const today = now.format('YYYY-MM-DD')
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
    if (entryTime && selectedDate === dayjs().format('YYYY-MM-DD') && entryTime < dayjs().format('HH:mm')) {
      // time already passed today — refuse silently rather than fire an instant MISSED
      setEntryTime('')
      return
    }

    try {
      if (entryTime && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch (_) {}

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${entryTime ? ' ' + entryTime : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        text: entryText.trim(),
        entryType,
        ...(entryTime ? { time: entryTime } : {}),
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
        {visibleAlerts.length > 0 && (
          <div className="mb-16 space-y-1" role="alert" aria-live="assertive">
            {visibleAlerts.map(a => (
              <div
                key={a.key}
                className={cn(
                  'flex items-center justify-between gap-16 border px-8 py-4 uppercase tracking-widest',
                  a.stage === 'T-00' ? 'border-acc text-acc animate-pulse'
                    : a.stage === 'MISSED' ? 'border-acc/20 text-acc/40'
                    : 'border-acc/40 text-acc/80'
                )}
              >
                <span className="tabular-nums whitespace-nowrap">
                  {a.stage === 'T-00' ? 'NOW' : a.stage} · {formatCountdown(a.minutes)}
                </span>
                <span className="flex-1 truncate normal-case tracking-normal">
                  {a.entry.type.toUpperCase()} {a.entry.time} — {a.entry.text}
                </span>
                <button
                  className="text-acc/60 hover:text-acc transition-opacity"
                  onClick={() => handleAck(a.key)}
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
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40 tabular-nums"
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
            {upcomingEntries.map(entry => (
              <div key={entry.id} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}{entry.time ? ` · ${entry.time}` : ''}
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
