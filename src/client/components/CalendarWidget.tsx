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
  type CalendarStage,
  dueAt,
  entryId,
  formatCountdown,
  isValidTime,
  normalizeTime,
  pendingStage,
  sortKey,
  stageLabel,
} from '#client/utils/calendar'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time?: string
  text: string
  type: EntryType
}

type ActiveAlert = {
  key: string
  stage: CalendarStage
  entry: CalendarEntry
}

const FIRED_KEY = 'lot:calendar:fired'

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
    // Keep the newest 200 keys so storage never grows unbounded
    localStorage.setItem(FIRED_KEY, JSON.stringify([...set].slice(-200)))
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
  const [entryTimeState, setEntryTime] = React.useState('')
  const [now, setNow] = React.useState(() => Date.now())
  const [alerts, setAlerts] = React.useState<ActiveAlert[]>([])
  const firedRef = React.useRef<Set<string>>(loadFired())

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => {
        const date = log.metadata?.date as string
        const rawTime = log.metadata?.time as string | undefined
        const time = isValidTime(rawTime) ? normalizeTime(rawTime) : undefined
        const text = (log.metadata?.text as string) || log.text || ''
        const type = (log.metadata?.entryType as EntryType) || 'note'
        return { id: entryId(date, time, text, type), date, time, text, type }
      })
      .filter(e => e.date && e.text)
      .sort((a, b) => sortKey(a.date, a.time).localeCompare(sortKey(b.date, b.time)))
  }, [logs])

  // Alerts already logged server-side survive reloads and other devices
  const loggedAlertKeys = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.entryId && log.metadata?.stage) {
        set.add(`${log.metadata.entryId}#${log.metadata.stage}`)
      }
    })
    return set
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today)
      .slice(0, 10)
  }, [entries])

  // Timed entries that can still raise an alert (today/tomorrow)
  const watchedEntries = React.useMemo(() => {
    const horizon = Date.now() + 36 * 3600_000
    return entries.filter(e => {
      const due = dueAt(e.date, e.time)
      return due !== null && due <= horizon && due > Date.now() - 2 * 3600_000
    })
  }, [entries, now])

  // Ticker: 1s while something is imminent, otherwise a slow 15s heartbeat
  const hasWatched = watchedEntries.length > 0
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), hasWatched ? 1000 : 15000)
    return () => clearInterval(id)
  }, [hasWatched])

  // Alert engine: fire each stage once per entry, raise banner, write to Log
  React.useEffect(() => {
    const raised: ActiveAlert[] = []
    for (const entry of watchedEntries) {
      const due = dueAt(entry.date, entry.time)!
      const done = (['T-15', 'T-05', 'T-00', 'MISSED'] as CalendarStage[]).filter(st => {
        const k = `${entry.id}#${st}`
        return firedRef.current.has(k) || loggedAlertKeys.has(k)
      })
      const stage = pendingStage(due, now, done)
      if (!stage) continue
      const key = `${entry.id}#${stage}`
      firedRef.current.add(key)
      raised.push({ key, stage, entry })
    }
    if (raised.length === 0) return
    saveFired(firedRef.current)
    setAlerts(prev => [...raised, ...prev.filter(a => !raised.some(r => r.entry.id === a.entry.id))].slice(0, 5))
    raised.forEach(({ stage, entry }) => {
      createLog({
        text: `[ALERT ${stage}] ${stageLabel(stage)} // ${entry.type}: ${entry.text} (${entry.date} ${entry.time})`,
        event: 'calendar_alert',
        metadata: {
          entryId: entry.id,
          stage,
          label: stageLabel(stage),
          entryType: entry.type,
          date: entry.date,
          time: entry.time,
          text: entry.text,
        },
      }, {
        onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
      })
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${stageLabel(stage)} // ${entry.time}`, { body: `${entry.type.toUpperCase()}: ${entry.text}` })
        }
      } catch (_) {}
    })
  }, [now, watchedEntries, loggedAlertKeys])

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
    const entryTime = entryTimeState

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${entryTime ? ` ${entryTime}` : ''})`,
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
        try {
          if (entryTime && typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission()
          }
        } catch (_) {}
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
                    value={entryTimeState}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    aria-label="Time (optional)"
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
                    {e.time && <span className="tabular-nums text-acc/40">{e.time} </span>}
                    {e.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {alerts.length > 0 && (
          <div className="mb-16 space-y-1">
            {alerts.map(a => {
              const due = dueAt(a.entry.date, a.entry.time)!
              const critical = a.stage === 'T-00' || a.stage === 'MISSED'
              return (
                <div
                  key={a.key}
                  role="alert"
                  className={cn(
                    'flex items-center justify-between gap-8 border px-8 py-4 uppercase tracking-widest tabular-nums',
                    critical ? 'border-acc text-acc animate-pulse' : 'border-acc/40 text-acc/80'
                  )}
                >
                  <span className="min-w-0">
                    {'▌'}{stageLabel(a.stage)} // {formatCountdown(due, now)} // {a.entry.type} {a.entry.time} — {a.entry.text}
                  </span>
                  <button
                    className="text-acc/60 hover:text-acc whitespace-nowrap"
                    onClick={() => setAlerts(prev => prev.filter(x => x.key !== a.key))}
                  >
                    ACK
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry, i) => {
              const due = dueAt(entry.date, entry.time)
              const live = due !== null && due - now < 24 * 3600_000 && due - now > -10 * 60_000
              return (
                <div key={i} className="flex justify-between gap-16">
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="tabular-nums"> {entry.time}</span>}
                  </span>
                  <span className="text-acc text-right">
                    {live && <span className="tabular-nums text-acc/50">{formatCountdown(due!, now)} </span>}
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
  )
}
