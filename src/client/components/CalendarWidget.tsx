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
  dueAlerts,
  entryDateTime,
  formatCountdown,
  isValidTime,
  normalizeTime,
  stageLabel,
} from '#client/utils/calendarAlerts'
import type { AlertStage } from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time: string | null
  text: string
  type: EntryType
  done: boolean
}

type ActiveAlert = { key: string; entryId: string; stage: AlertStage }

const TICK_MS = 15_000
const FIRED_STORAGE_KEY = 'lot.calendar.fired'

function loadFired(): string[] {
  try {
    const raw = localStorage.getItem(FIRED_STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : []
  } catch (_) {
    return []
  }
}

function saveFired(keys: Set<string>) {
  try {
    // Cap storage so it never grows unbounded
    localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(Array.from(keys).slice(-300)))
  } catch (_) {}
}

function notifyBrowser(title: string, body: string, tag: string) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, tag, silent: false })
    }
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
  const [entryError, setEntryError] = React.useState('')

  const doneIds = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_done' && log.metadata?.entryId) {
        set.add(String(log.metadata.entryId))
      }
    })
    return set
  }, [logs])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: String(log.id),
        date: log.metadata?.date as string,
        time: isValidTime(log.metadata?.time) ? normalizeTime(log.metadata?.time as string) : null,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
        done: doneIds.has(String(log.id)),
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs, doneIds])

  // Alert keys already raised (this device or any other, via the Log)
  const firedRef = React.useRef<Set<string>>(new Set(loadFired()))
  const [activeAlerts, setActiveAlerts] = React.useState<ActiveAlert[]>([])
  const [now, setNow] = React.useState(() => new Date())
  const logsReady = logs.length > 0

  React.useEffect(() => {
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.alertKey) {
        firedRef.current.add(String(log.metadata.alertKey))
      }
    })
  }, [logs])

  const entriesRef = React.useRef(entries)
  entriesRef.current = entries

  const runTick = React.useCallback(() => {
    const current = new Date()
    setNow(current)
    const due = dueAlerts(current, entriesRef.current, firedRef.current)
    if (!due.length) return
    due.forEach(d => {
      const entry = entriesRef.current.find(e => e.id === d.id)
      if (!entry) return
      firedRef.current.add(d.key)
      const label = stageLabel(d.stage)
      const line = `${d.stage} ${label} · ${entry.type.toUpperCase()} · ${entry.time} · ${entry.text}`
      createLog({
        text: `[ALERT] ${line}`,
        event: 'calendar_alert',
        metadata: {
          alertKey: d.key,
          entryId: entry.id,
          stage: d.stage,
          date: entry.date,
          time: entry.time,
          entryType: entry.type,
          entryText: entry.text,
        },
      })
      notifyBrowser(`LOT // ${d.stage} ${label}`, `${entry.type.toUpperCase()} ${entry.time} — ${entry.text}`, d.key)
      setActiveAlerts(prev => [
        ...prev.filter(a => a.entryId !== entry.id),
        { key: d.key, entryId: entry.id, stage: d.stage },
      ])
    })
    saveFired(firedRef.current)
  }, [createLog])

  // Reliable ticker: interval + immediate check on focus / visibility regain
  React.useEffect(() => {
    if (!logsReady) return
    runTick()
    const id = window.setInterval(runTick, TICK_MS)
    const onWake = () => { if (document.visibilityState !== 'hidden') runTick() }
    document.addEventListener('visibilitychange', onWake)
    window.addEventListener('focus', onWake)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onWake)
      window.removeEventListener('focus', onWake)
    }
  }, [logsReady, runTick])

  const visibleAlerts = activeAlerts
    .map(a => ({ a, entry: entries.find(e => e.id === a.entryId) }))
    .filter(x => x.entry && !x.entry.done)

  const dismissAlert = (entryId: string) =>
    setActiveAlerts(prev => prev.filter(a => a.entryId !== entryId))

  const handleMarkDone = (entry: CalendarEntry) => {
    createLog({
      text: `[DONE] ${entry.type}: ${entry.text} (${dayjs(entry.date).format('MMMM D, YYYY')}${entry.time ? ' ' + entry.time : ''})`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, time: entry.time, entryType: entry.type, entryText: entry.text },
    }, {
      onSuccess: () => queryClient.refetchQueries(['/api/logs']),
    })
    dismissAlert(entry.id)
  }

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
    const time = isValidTime(entryTime) ? normalizeTime(entryTime) : null

    // Timed entries in the past can never alert — refuse rather than silently drop
    if (time) {
      const target = entryDateTime(selectedDate, time)
      if (target && target.getTime() < Date.now() - 60_000) {
        setEntryError('Time already passed.')
        return
      }
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {})
        }
      } catch (_) {}
    }
    setEntryError('')

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
            {visibleAlerts.map(({ a, entry }) => (
              <div
                key={a.key}
                className={cn(
                  'flex justify-between gap-16 border-l-2 pl-8 uppercase tracking-widest tabular-nums',
                  a.stage === 'T-15' && 'border-acc/30 text-acc/60',
                  a.stage === 'T-05' && 'border-acc/60 text-acc/80',
                  (a.stage === 'T-00' || a.stage === 'MISSED') && 'border-acc text-acc',
                  a.stage === 'T-00' && 'animate-pulse',
                )}
              >
                <span>
                  {a.stage} {stageLabel(a.stage)} · {entry!.type} · {entry!.time} · {formatCountdown(now, entryDateTime(entry!.date, entry!.time)!)}
                  <span className="normal-case tracking-normal ml-8">{entry!.text}</span>
                </span>
                <span className="whitespace-nowrap">
                  <button className="text-acc/60 hover:text-acc" onClick={() => dismissAlert(entry!.id)}>ACK</button>
                  {' / '}
                  <button className="text-acc/60 hover:text-acc" onClick={() => handleMarkDone(entry!)}>DONE</button>
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
                    type="time"
                    value={entryTime}
                    onChange={e => { setEntryTime(e.target.value); setEntryError('') }}
                    aria-label="Time (optional)"
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40 w-[7em]"
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
                {entryError && <div className="text-acc/60 mt-4">{entryError}</div>}
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map((e, i) => (
                  <div key={i} className={cn('mb-1', e.done ? 'text-acc/30 line-through' : 'text-acc/80')}>
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
              <div key={i} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time && <span className="tabular-nums text-acc/60"> · {entry.time}</span>}
                </span>
                <span className="text-acc text-right">
                  {entry.text}
                  {entry.time && !entry.done && (
                    <button
                      className="text-acc/30 hover:text-acc ml-8"
                      onClick={() => handleMarkDone(entry)}
                      aria-label="Mark done"
                    >
                      ✓
                    </button>
                  )}
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
