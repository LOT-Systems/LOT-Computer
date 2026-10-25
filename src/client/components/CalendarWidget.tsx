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
  type AlertStage,
  type CalendarEntry,
  type EntryType,
  STAGE_LABEL,
  alertKey,
  dueStage,
  entryStart,
  formatCountdown,
  parseTime,
} from '#client/utils/calendar'

type ActiveAlert = { key: string; entry: CalendarEntry; stage: AlertStage }

const TICK_MS = 15_000
const SEEN_STORAGE_KEY = 'lot:calendar:alerts'

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch (_) {
    return new Set()
  }
}

function saveSeen(seen: Set<string>) {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...seen].slice(-300)))
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

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        date: log.metadata?.date as string,
        time: parseTime((log.metadata?.time as string) || ''),
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) =>
        a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '')
      )
  }, [logs])

  const doneIds = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(l => {
      if (l.event === 'calendar_done' && l.metadata?.entryId) set.add(l.metadata.entryId as string)
    })
    return set
  }, [logs])

  const loggedAlertKeys = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(l => {
      if (l.event === 'calendar_alert' && l.metadata?.key) set.add(l.metadata.key as string)
    })
    return set
  }, [logs])

  const [now, setNow] = React.useState(() => Date.now())
  const [alerts, setAlerts] = React.useState<ActiveAlert[]>([])
  const seenRef = React.useRef<Set<string> | null>(null)

  const openEntries = React.useMemo(
    () => entries.filter(e => !doneIds.has(e.id)),
    [entries, doneIds]
  )

  // Tick: keeps countdowns live and evaluates alert stages.
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(t)
  }, [])

  React.useEffect(() => {
    if (!seenRef.current) seenRef.current = loadSeen()
    const seen = seenRef.current
    const fresh: ActiveAlert[] = []

    for (const entry of openEntries) {
      const stage = dueStage(entry, now)
      if (!stage) continue
      const key = alertKey(entry.id, stage)
      if (seen.has(key) || loggedAlertKeys.has(key)) continue
      seen.add(key)
      fresh.push({ key, entry, stage })
    }
    if (!fresh.length) return
    saveSeen(seen)

    setAlerts(prev => [...prev, ...fresh])
    fresh.forEach(({ key, entry, stage }) => {
      createLog({
        text: `[ALERT] ${STAGE_LABEL[stage]} · ${entry.type} · ${entry.time || 'all-day'} · ${entry.text}`,
        event: 'calendar_alert',
        metadata: { key, entryId: entry.id, stage, date: entry.date, time: entry.time, entryType: entry.type },
      })
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${STAGE_LABEL[stage]} · ${entry.time || entry.date}`, { body: entry.text })
        }
      } catch (_) {}
    })
    queryClient.refetchQueries(['/api/logs'])
  }, [now, openEntries, loggedAlertKeys, createLog, queryClient])

  const ackAlert = (key: string) => setAlerts(prev => prev.filter(a => a.key !== key))

  const handleDone = (entry: CalendarEntry) => {
    createLog({
      text: `[DONE] ${entry.type}: ${entry.text} (${entry.date}${entry.time ? ' ' + entry.time : ''})`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, time: entry.time, entryType: entry.type },
    }, {
      onSuccess: () => queryClient.refetchQueries(['/api/logs']),
    })
    setAlerts(prev => prev.filter(a => a.entry.id !== entry.id))
  }

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs(now).format('YYYY-MM-DD')
    return openEntries
      .filter(e => e.date >= today || (e.type !== 'note' && entryStart(e) < now && now - entryStart(e) < 7 * 86_400_000))
      .slice(0, 10)
  }, [openEntries, now])

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

    const time = parseTime(entryTime)
    if (entryTime.trim() && !time) return // invalid time: keep form open

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
    <>
    {alerts.length > 0 && (
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none" role="alert" aria-live="assertive">
        {alerts.map(a => (
          <div
            key={a.key}
            className={cn(
              'pointer-events-auto flex items-center gap-16 px-16 py-8 font-mono uppercase tracking-widest',
              'bg-black text-white border-b',
              a.stage === 'overdue' ? 'border-red-500' : 'border-white/60'
            )}
          >
            <span className={cn(a.stage === 'overdue' && 'text-red-500')}>
              ▌{STAGE_LABEL[a.stage]}
            </span>
            <span className="tabular-nums">{a.entry.time || 'ALL-DAY'}</span>
            <span className="opacity-60">{a.entry.type}</span>
            <span className="flex-1 truncate normal-case tracking-normal">{a.entry.text}</span>
            {a.entry.type !== 'note' && (
              <button className="opacity-60 hover:opacity-100" onClick={() => handleDone(a.entry)}>DONE</button>
            )}
            <button className="opacity-60 hover:opacity-100" onClick={() => ackAlert(a.key)}>ACK</button>
          </div>
        ))}
      </div>
    )}
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
                    type="text"
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    aria-label="Time (optional)"
                    maxLength={5}
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5.5em] outline-none tabular-nums',
                      entryTime.trim() && !parseTime(entryTime)
                        ? 'border-red-500/60'
                        : 'border-acc/20 focus:border-acc/40'
                    )}
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
                {entriesOnDate.map(e => (
                  <div key={e.id} className={cn('text-acc/80 mb-1', doneIds.has(e.id) && 'line-through text-acc/30')}>
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
            {upcomingEntries.map(entry => {
              const dt = entryStart(entry) - now
              const overdue = entry.type !== 'note' && dt < 0
              const soon = dt >= 0 && dt <= 15 * 60_000
              return (
                <div key={entry.id} className="flex justify-between gap-16">
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="tabular-nums"> {entry.time}</span>}
                  </span>
                  <span className="text-acc text-right flex gap-8 justify-end">
                    {(entry.time || overdue) && (
                      <span className={cn('tabular-nums whitespace-nowrap', overdue ? 'text-red-500' : soon ? 'text-acc' : 'text-acc/40')}>
                        {overdue ? 'OVERDUE ' : ''}{formatCountdown(dt)}
                      </span>
                    )}
                    <span>{entry.text}</span>
                    {entry.type !== 'note' && (
                      <button
                        className="text-acc/30 hover:text-acc transition-opacity"
                        onClick={() => handleDone(entry)}
                        aria-label="Mark done"
                      >
                        [OK]
                      </button>
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
    </Block>
    </>
  )
}
