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
  time?: string // HH:mm, optional
  text: string
  type: EntryType
}

type Alert = {
  id: string
  label: string
  entry: CalendarEntry
}

// Alert thresholds in minutes before the event. Untimed entries alert once
// at DEFAULT_ALERT_TIME on the day (T-0 only).
const THRESHOLDS = [15, 5, 0]
const DEFAULT_ALERT_TIME = '09:00'
const STALE_MINUTES = 60 // events older than this are not alerted on late load
const TICK_MS = 15_000
const FIRED_KEY = 'lot.calendar.fired'
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const thresholdLabel = (m: number) => (m === 0 ? 'T-0 NOW' : `T-${m} MIN`)
const entryId = (e: CalendarEntry) => `${e.date}|${e.time || ''}|${e.type}|${e.text}`
const entryStart = (e: CalendarEntry) =>
  dayjs(`${e.date} ${e.time || DEFAULT_ALERT_TIME}`)

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
    // keep the set bounded
    localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(set).slice(-500)))
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
  const [alerts, setAlerts] = React.useState<Alert[]>([])

  const createLogRef = React.useRef(createLog)
  createLogRef.current = createLog
  const entriesRef = React.useRef<CalendarEntry[]>([])
  const firedRef = React.useRef<Set<string> | null>(null)

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        date: log.metadata?.date as string,
        time: TIME_RE.test(String(log.metadata?.time || '')) ? (log.metadata?.time as string) : undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs])

  // Re-evaluate "upcoming" as time passes
  const [now, setNow] = React.useState(() => dayjs())

  const upcomingEntries = React.useMemo(() => {
    const today = now.format('YYYY-MM-DD')
    const hhmm = now.format('HH:mm')
    return entries
      .filter(e => e.date > today || (e.date === today && (!e.time || e.time >= hhmm)))
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

  entriesRef.current = entries

  // Clock + alert engine. Runs every TICK_MS and on tab re-focus (timers are
  // throttled in background tabs). Each (entry, threshold) fires exactly once,
  // persisted in localStorage so reloads never re-alert.
  React.useEffect(() => {
    const check = () => {
      const t = dayjs()
      setNow(t)
      if (!firedRef.current) firedRef.current = loadFired()
      const fired = firedRef.current
      const fresh: Alert[] = []

      for (const e of entriesRef.current) {
        const start = entryStart(e)
        if (!start.isValid()) continue
        const minsUntil = start.diff(t, 'second') / 60
        if (minsUntil < -STALE_MINUTES) continue
        const thresholds = e.time ? THRESHOLDS : [0]
        // thresholds already crossed, most urgent last
        const crossed = thresholds.filter(m => minsUntil <= m)
        if (crossed.length === 0) continue
        const latest = Math.min(...crossed)
        for (const m of crossed) {
          const key = `${entryId(e)}#${m}`
          if (fired.has(key)) continue
          fired.add(key)
          // catch-up: only surface the most urgent crossed threshold
          if (m !== latest) continue
          const label = thresholdLabel(m)
          const alert: Alert = { id: key, label, entry: e }
          fresh.push(alert)
          try {
            createLogRef.current({
              text: `[ALERT] ${label} — ${e.type.toUpperCase()}: ${e.text}${e.time ? ` @ ${e.time}` : ''} (${e.date})`,
              event: 'calendar_alert',
              metadata: { date: e.date, time: e.time, text: e.text, entryType: e.type, threshold: m },
            })
          } catch (_) {}
          try {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(`${label} · ${e.type.toUpperCase()}`, { body: e.text })
            }
          } catch (_) {}
        }
      }

      if (fresh.length > 0) {
        saveFired(fired)
        setAlerts(prev => [...prev, ...fresh])
      }
    }

    check()
    const id = window.setInterval(check, TICK_MS)
    const onVisible = () => { if (!document.hidden) check() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [entries])

  const handleAck = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id))

  const today = now.format('YYYY-MM-DD')
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
    const time = TIME_RE.test(entryTime) ? entryTime : undefined

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ` ${time}` : ''})`,
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

    // one-time opt-in for system notifications, on a user gesture
    try {
      if (time && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch (_) {}
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
        {alerts.length > 0 && (
          <div className="mb-16 space-y-1">
            {alerts.map(a => (
              <div key={a.id} className="flex justify-between gap-16 text-acc border border-acc/40 px-4 py-2 animate-pulse">
                <span className="whitespace-nowrap">
                  ▲ {a.label} · {a.entry.type.toUpperCase()}{a.entry.time ? ` · ${a.entry.time}` : ''}
                </span>
                <span className="text-right flex-1">{a.entry.text}</span>
                <button
                  className="text-acc/60 hover:text-acc whitespace-nowrap"
                  onClick={() => handleAck(a.id)}
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
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    aria-label="Time (optional)"
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40"
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
                    {e.time ? `${e.time} ` : ''}{e.text}
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
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}{entry.time ? ` ${entry.time}` : ''}
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
