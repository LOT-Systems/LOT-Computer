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
  alertKey,
  currentStage,
  dueAt,
  formatCountdown,
  normalizeTime,
} from '#client/utils/calendar'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  time: string | null
  done: boolean
  date: string
  text: string
  type: EntryType
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

  // Alerts already logged (survives reload because they live in Log)
  const loggedAlerts = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.entryId) {
        set.add(alertKey(log.metadata.entryId as string, log.metadata.stage as AlertStage))
      }
    })
    return set
  }, [logs])

  const doneIds = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_done' && log.metadata?.entryId) set.add(log.metadata.entryId as string)
    })
    return set
  }, [logs])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        time: normalizeTime(log.metadata?.time as string),
        done: doneIds.has(log.id),
        date: log.metadata?.date as string,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => dueAt(a.date, a.time) - dueAt(b.date, b.time))
  }, [logs, doneIds])

  // Clock tick — 1s while an alert is live, otherwise 15s
  const [now, setNow] = React.useState(() => Date.now())
  const firedRef = React.useRef<Set<string>>(new Set())

  const activeAlerts = React.useMemo(
    () =>
      entries
        .filter(e => !e.done)
        .map(e => ({ e, stage: currentStage(e.date, e.time, now) }))
        .filter((x): x is { e: CalendarEntry; stage: AlertStage } => !!x.stage),
    [entries, now]
  )
  const hasLive = activeAlerts.length > 0

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), hasLive ? 1000 : 15000)
    return () => clearInterval(id)
  }, [hasLive])

  // Fire each (entry, stage) exactly once: log it, and OS-notify if permitted
  React.useEffect(() => {
    activeAlerts.forEach(({ e, stage }) => {
      const key = alertKey(e.id, stage)
      if (firedRef.current.has(key) || loggedAlerts.has(key)) return
      firedRef.current.add(key)
      const label = stage === 'T-00' ? 'NOW' : 'T-10'
      createLog({
        text: `[ALERT ${label}] ${e.type.toUpperCase()} ${e.time} — ${e.text}`,
        event: 'calendar_alert',
        metadata: { entryId: e.id, stage, date: e.date, time: e.time },
      }, {
        onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
        onError: () => { firedRef.current.delete(key) },
      })
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${label} · ${e.type.toUpperCase()} ${e.time}`, { body: e.text, tag: key })
        }
      } catch (_) {}
    })
  }, [activeAlerts, loggedAlerts])

  const handleDone = (id: string, text: string) => {
    createLog({
      text: `[DONE] ${text}`,
      event: 'calendar_done',
      metadata: { entryId: id },
    }, { onSuccess: () => { queryClient.refetchQueries(['/api/logs']) } })
  }

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs(now).format('YYYY-MM-DD')
    // Keep today's timed entries visible until done; drop finished and past-day ones
    return entries.filter(e => !e.done && e.date >= today).slice(0, 10)
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

  const today = dayjs(now).format('YYYY-MM-DD')
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
    const time = normalizeTime(entryTime)
    if (entryTime.trim() && !time) return // invalid time: keep form open

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ' ' + time : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        text: entryText.trim(),
        entryType,
        time,
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

  const requestNotify = () => {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch (_) {}
  }

  const handleToggleCalendar = () => {
    requestNotify()
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
          <div className="mb-16 space-y-1" role="alert">
            {activeAlerts.map(({ e, stage }) => (
              <div
                key={e.id + stage}
                className={cn(
                  'flex items-center gap-8 border-l-2 pl-8 uppercase tracking-wider',
                  stage === 'T-00' ? 'border-acc text-acc animate-pulse' : 'border-acc/40 text-acc/80'
                )}
              >
                <span className="whitespace-nowrap">{stage === 'T-00' ? '■ NOW' : '▲ ' + formatCountdown(e.date, e.time, now)}</span>
                <span className="whitespace-nowrap">{e.type} {e.time}</span>
                <span className="flex-1 truncate normal-case tracking-normal">{e.text}</span>
                <button className="text-acc/60 hover:text-acc" onClick={() => handleDone(e.id, e.text)}>ACK</button>
              </div>
            ))}
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
                    type="text"
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:mm"
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5em] outline-none focus:border-acc/40',
                      entryTime.trim() && !normalizeTime(entryTime) ? 'border-red-500/60' : 'border-acc/20'
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
                {entriesOnDate.map((e, i) => (
                  <div key={i} className={cn('text-acc/80 mb-1', e.done && 'line-through text-acc/30')}>
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
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}{entry.time ? ` · ${entry.time}` : ''}
                </span>
                <span className="text-acc text-right">
                  {entry.time && entry.date === dayjs(now).format('YYYY-MM-DD') && (
                    <span className="text-acc/40 mr-8">{formatCountdown(entry.date, entry.time, now)}</span>
                  )}
                  {entry.text}
                  <button
                    className="ml-8 text-acc/30 hover:text-acc"
                    title="Mark done"
                    onClick={() => handleDone(entry.id, entry.text)}
                  >
                    ✓
                  </button>
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
