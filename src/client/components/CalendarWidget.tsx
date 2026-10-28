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
  entryTimestamp,
  formatCountdown,
  isValidTime,
  STAGE_LABEL,
} from '#shared/utils/calendar-alerts'
import type { AlertStage, CalendarEntry, EntryType } from '#shared/utils/calendar-alerts'

const TICK_MS = 15_000

type ActiveAlert = { key: string; entry: CalendarEntry; stage: AlertStage }

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
  const { data: logs = [], isFetched } = useLogs()
  const { mutate: createLog } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [entryTime, setEntryTime] = React.useState('')
  const [alerts, setAlerts] = React.useState<ActiveAlert[]>([])
  const [now, setNow] = React.useState(() => Date.now())
  // Alerts fired this session, so a slow refetch never double-fires one.
  const firedRef = React.useRef<Set<string>>(new Set())

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
        id: String(log.id),
        date: log.metadata?.date as string,
        time: isValidTime(log.metadata?.time) ? (log.metadata?.time as string) : undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
        done: doneIds.has(String(log.id)),
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs, doneIds])

  const firedRecords = React.useMemo(() => {
    return logs
      .filter(log => log.event === 'calendar_alert' && log.metadata?.entryId)
      .map(log => ({
        entryId: log.metadata?.entryId as string,
        stage: log.metadata?.stage as AlertStage,
      }))
  }, [logs])

  const entriesRef = React.useRef(entries)
  entriesRef.current = entries
  const firedRecordsRef = React.useRef(firedRecords)
  firedRecordsRef.current = firedRecords

  const fireAlert = React.useCallback((entry: CalendarEntry, stage: AlertStage) => {
    const key = `${entry.id}|${stage}`
    if (firedRef.current.has(key)) return
    firedRef.current.add(key)
    setAlerts(prev => [...prev, { key, entry, stage }])
    createLog({
      text: `[ALERT] ${STAGE_LABEL[stage]} — ${entry.type.toUpperCase()}: ${entry.text} (${entry.date} ${entry.time})`,
      event: 'calendar_alert',
      metadata: { entryId: entry.id, stage, date: entry.date, time: entry.time, entryType: entry.type },
    }, { onSuccess: () => { queryClient.refetchQueries(['/api/logs']) } })
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(`${STAGE_LABEL[stage]} · ${entry.time}`, { body: entry.text, tag: key })
      }
    } catch (_) {}
  }, [createLog, queryClient])

  // Alert engine — runs only after logs are fetched, so history is never replayed.
  React.useEffect(() => {
    if (!isFetched) return
    const tick = () => {
      const t = Date.now()
      setNow(t)
      dueAlerts(entriesRef.current, firedRecordsRef.current, t)
        .forEach(({ entry, stage }) => fireAlert(entry, stage))
    }
    tick()
    const id = window.setInterval(tick, TICK_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isFetched, fireAlert])

  // Drop panel items for entries completed elsewhere.
  React.useEffect(() => {
    setAlerts(prev => prev.filter(a => !doneIds.has(a.entry.id)))
  }, [doneIds])

  // One-second clock while the panel is showing, for the live countdown.
  React.useEffect(() => {
    if (alerts.length === 0) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [alerts.length])

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
    const time = isValidTime(entryTime) ? entryTime : undefined
    // A timed entry in the past would never alert; refuse rather than silently log it.
    if (time && (entryTimestamp(selectedDate, time) ?? 0) < Date.now() - 60_000) return

    if (time) {
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission()
        }
      } catch (_) {}
    }

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ` ${time}` : ''})`,
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

  const handleDone = (entry: CalendarEntry) => {
    if (entry.done) return
    setAlerts(prev => prev.filter(a => a.entry.id !== entry.id))
    createLog({
      text: `[DONE] ${entry.type.toUpperCase()}: ${entry.text} (${entry.date}${entry.time ? ` ${entry.time}` : ''})`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, time: entry.time, entryType: entry.type },
    }, { onSuccess: () => { queryClient.refetchQueries(['/api/logs']) } })
  }

  const dismissAlert = (key: string) => setAlerts(prev => prev.filter(a => a.key !== key))

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
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    aria-label="Time (optional)"
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40 tabular-nums"
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
                  <div key={e.id || i} className={cn('flex gap-8 mb-1', e.done ? 'text-acc/30 line-through' : 'text-acc/80')}>
                    {e.time && <span className="tabular-nums">{e.time}</span>}
                    <span className="flex-1">{e.text}</span>
                    {!e.done && (
                      <button className="text-acc/30 hover:text-acc transition-opacity" onClick={() => handleDone(e)}>
                        Done
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry, i) => (
              <div key={entry.id || i} className="flex justify-between gap-16">
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

      {alerts.length > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-16 right-16 z-50 w-[22rem] max-w-[calc(100vw-2rem)] space-y-8 font-mono"
        >
          {alerts.map(a => {
            const ts = entryTimestamp(a.entry.date, a.entry.time || '') ?? now
            return (
              <div key={a.key} className="bg-black/90 border border-acc/60 text-acc p-12 backdrop-blur">
                <div className="flex justify-between uppercase tracking-widest">
                  <span className={a.stage === 'OVERDUE' ? 'animate-pulse' : ''}>{STAGE_LABEL[a.stage]}</span>
                  <span className="tabular-nums">{formatCountdown(ts, now)}</span>
                </div>
                <div className="mt-8 uppercase tracking-widest text-acc/40">
                  {a.entry.type} · {a.entry.time}
                </div>
                <div className="mt-4">{a.entry.text}</div>
                <div className="flex gap-16 mt-8 uppercase tracking-widest">
                  <button className="text-acc/60 hover:text-acc transition-opacity" onClick={() => dismissAlert(a.key)}>
                    Ack
                  </button>
                  <button className="text-acc/60 hover:text-acc transition-opacity" onClick={() => handleDone(a.entry)}>
                    Done
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Block>
  )
}
