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
  computeDueAlerts,
  formatCountdown,
  parseTime,
  type AlertStage,
  type DueAlert,
} from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time?: string
  text: string
  type: EntryType
}

const TICK_MS = 15000

const STAGE_LABEL: Record<AlertStage, string> = {
  'T-15': 'STANDBY',
  'T-00': 'EXECUTE',
  OVERDUE: 'OVERDUE',
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
  const [activeAlerts, setActiveAlerts] = React.useState<DueAlert[]>([])
  // keys fired this session (covers the gap before the logged alert is refetched)
  const firedRef = React.useRef<Set<string>>(new Set())

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        date: log.metadata?.date as string,
        time: (log.metadata?.time as string) || undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) =>
        (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))
      )
  }, [logs])

  // alert keys already persisted in Log — survive reloads and other devices
  const loggedAlertKeys = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.alertKey) {
        set.add(log.metadata.alertKey as string)
      }
    })
    return set
  }, [logs])

  const loggedKeysRef = React.useRef(loggedAlertKeys)
  loggedKeysRef.current = loggedAlertKeys
  const entriesRef = React.useRef(entries)
  entriesRef.current = entries

  React.useEffect(() => {
    const tick = () => {
      const fired = new Set([...loggedKeysRef.current, ...firedRef.current])
      const due = computeDueAlerts(entriesRef.current, Date.now(), fired)
      if (due.length === 0) return
      due.forEach(a => {
        firedRef.current.add(a.key)
        const when = `${a.entry.date} ${a.entry.time}`
        createLog({
          text: `[ALERT ${a.stage}] ${a.entry.type}: ${a.entry.text} (${when})`,
          event: 'calendar_alert',
          metadata: {
            alertKey: a.key,
            entryId: a.entry.id,
            stage: a.stage,
            entryType: a.entry.type,
            date: a.entry.date,
            time: a.entry.time,
            text: a.entry.text,
          },
        }, {
          onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
        })
      })
      setActiveAlerts(prev => [
        ...prev.filter(p => !due.some(d => d.entry.id === p.entry.id)),
        ...due,
      ])
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.([120, 60, 120])
      } catch (_) {}
    }
    tick()
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [createLog, queryClient])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
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

    const time = entryTime.trim() ? parseTime(entryTime) : undefined
    if (time === null) return // invalid time — keep form open

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ' ' + time : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        ...(time ? { time } : {}),
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
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) {
      setViewMonth(dayjs())
    }
    setIsCalendarOpen(!isCalendarOpen)
  }

  const timeInvalid = entryTime.trim() !== '' && parseTime(entryTime) === null

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-1" role="alert" aria-live="assertive">
            {activeAlerts.map(a => (
              <div
                key={a.key}
                className={cn(
                  'flex items-baseline justify-between gap-16 border-l-2 pl-8 uppercase tracking-widest tabular-nums',
                  a.stage === 'T-15' ? 'border-acc/40 text-acc/60' : 'border-acc text-acc',
                  a.stage === 'T-00' && 'animate-pulse',
                )}
              >
                <span className="truncate">
                  {STAGE_LABEL[a.stage]} {formatCountdown(a.minutesToGo)} · {a.entry.time} · {a.entry.type} · {a.entry.text}
                </span>
                <button
                  className="text-acc/60 hover:text-acc whitespace-nowrap"
                  onClick={() => setActiveAlerts(prev => prev.filter(p => p.key !== a.key))}
                >
                  [ACK]
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
                    type="text"
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    maxLength={5}
                    aria-label="Time (optional, 24h)"
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5.5em] outline-none',
                      timeInvalid ? 'border-acc/80' : 'border-acc/20 focus:border-acc/40'
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
                  <div key={e.id || i} className="text-acc/80 mb-1">
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
            {upcomingEntries.map((entry, i) => (
              <div key={entry.id || i} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time && <span className="text-acc/40 tabular-nums"> · {entry.time}</span>}
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
