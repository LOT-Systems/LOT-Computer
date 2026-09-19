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
  time?: string
  text: string
  type: EntryType
}

type AlertState = {
  entry: CalendarEntry
  status: 'EXECUTE' | 'ALERT'
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

function getEventDayjs(entry: CalendarEntry): Dayjs {
  return entry.time
    ? dayjs(`${entry.date} ${entry.time}`, 'YYYY-MM-DD HH:mm')
    : dayjs(entry.date).endOf('day')
}

// Timed events escalate EXECUTE (<=15min) -> ALERT (<=60min) -> STANDBY (<=24h) -> ELAPSED.
// Untimed (all-day) entries only ever show STANDBY (today) or ELAPSED (past).
function getStatus(entry: CalendarEntry, now: Dayjs): 'EXECUTE' | 'ALERT' | 'STANDBY' | 'ELAPSED' | null {
  if (!entry.time) {
    const todayStr = now.format('YYYY-MM-DD')
    if (entry.date < todayStr) return 'ELAPSED'
    if (entry.date === todayStr) return 'STANDBY'
    return null
  }
  const diffMin = getEventDayjs(entry).diff(now, 'minute')
  if (diffMin < -120) return null
  if (diffMin < 0) return 'ELAPSED'
  if (diffMin <= 15) return 'EXECUTE'
  if (diffMin <= 60) return 'ALERT'
  if (diffMin <= 1440) return 'STANDBY'
  return null
}

function formatCountdown(entry: CalendarEntry, now: Dayjs): string {
  const diffSec = getEventDayjs(entry).diff(now, 'second')
  const sign = diffSec < 0 ? '+' : '-'
  const abs = Math.abs(diffSec)
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  return `T${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function statusClass(status: ReturnType<typeof getStatus>): string {
  if (status === 'EXECUTE') return 'text-acc'
  if (status === 'ALERT') return 'text-acc/70'
  if (status === 'STANDBY') return 'text-acc/50'
  if (status === 'ELAPSED') return 'text-acc/25'
  return 'text-acc/40'
}

export function CalendarWidget() {
  const queryClient = useQueryClient()
  const { data: logs = [] } = useLogs()
  const { mutate: createLog } = useCreateLog()

  const [now, setNow] = React.useState(() => dayjs())
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [activeAlert, setActiveAlert] = React.useState<AlertState | null>(null)
  const alertedRef = React.useRef<Set<string>>(new Set())

  // Live clock — ticks every second, drives countdowns and status escalation
  React.useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-dismiss the alert overlay after 30 seconds if not acknowledged
  React.useEffect(() => {
    if (!activeAlert) return
    const timer = setTimeout(() => setActiveAlert(null), 30000)
    return () => clearTimeout(timer)
  }, [activeAlert])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        date: log.metadata?.date as string,
        time: log.metadata?.time as string | undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => {
        const aKey = `${a.date}${a.time ?? '23:59'}`
        const bKey = `${b.date}${b.time ?? '23:59'}`
        return aKey.localeCompare(bKey)
      })
  }, [logs])

  // Fire the alert overlay once per timed entry as it crosses the 60-minute horizon
  React.useEffect(() => {
    const check = () => {
      const n = dayjs()
      for (const entry of entries) {
        if (!entry.time) continue
        const key = `${entry.date}|${entry.time}|${entry.text}`
        if (alertedRef.current.has(key)) continue
        const diffMin = getEventDayjs(entry).diff(n, 'minute')
        if (diffMin >= 0 && diffMin <= 60) {
          alertedRef.current.add(key)
          setActiveAlert({ entry, status: diffMin <= 15 ? 'EXECUTE' : 'ALERT' })
          break
        }
      }
    }
    check()
    const timer = setInterval(check, 60000)
    return () => clearInterval(timer)
  }, [entries])

  const todayStr = now.format('YYYY-MM-DD')

  const todayEntries = React.useMemo(
    () => entries.filter(e => e.date === todayStr),
    [entries, todayStr]
  )

  const upcomingEntries = React.useMemo(
    () => entries.filter(e => e.date > todayStr).slice(0, 8),
    [entries, todayStr]
  )

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter(e => e.date === selectedDate)
  }, [entries, selectedDate])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => set.add(e.date))
    return set
  }, [entries])

  // Next upcoming timed event — recomputed each render since `now` ticks every second
  const nextTimedEvent = entries.find(e => e.time && getEventDayjs(e).isAfter(now)) ?? null

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
    setIsAddingEntry(false)
  }

  const handleAddEntry = () => {
    if (!selectedDate || !entryText.trim()) return

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const timeLabel = entryTime ? ` at ${entryTime}` : ''

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${timeLabel})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        ...(entryTime ? { time: entryTime } : {}),
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

  return (
    <>
      <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
        <div className="w-full">

          <div className="flex justify-between items-baseline mb-16">
            <span className="text-acc tabular-nums tracking-widest">
              {now.format('HH:mm:ss')}
            </span>
            {nextTimedEvent && (
              <span className={cn('tabular-nums text-xs', statusClass(getStatus(nextTimedEvent, now)))}>
                {formatCountdown(nextTimedEvent, now)}
              </span>
            )}
          </div>

          {todayEntries.length > 0 && (
            <div className="mb-16">
              <div className="text-acc/25 text-xs uppercase tracking-widest mb-4">Today</div>
              {todayEntries.map((e, i) => {
                const status = getStatus(e, now)
                return (
                  <div key={i} className="flex items-baseline gap-8 mb-2">
                    {e.time
                      ? <span className="text-acc/40 tabular-nums shrink-0 w-10">{e.time}</span>
                      : <span className="text-acc/20 text-xs shrink-0 w-10">—</span>
                    }
                    <span className={cn('text-xs uppercase tracking-widest shrink-0', statusClass(status))}>
                      {e.type[0]}
                    </span>
                    <span className={cn('flex-1', statusClass(status))}>{e.text}</span>
                    {(status === 'EXECUTE' || status === 'ALERT') && (
                      <span className={cn('text-xs tabular-nums shrink-0', statusClass(status))}>
                        {formatCountdown(e, now)}
                      </span>
                    )}
                    {status === 'ELAPSED' && (
                      <span className="text-acc/20 text-xs shrink-0 uppercase tracking-widest">done</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mb-16">
            <Button onClick={handleToggleCalendar}>
              {isCalendarOpen ? 'Close calendar' : 'Add date'}
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
                      const isToday = key === todayStr
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
                  <div className="flex gap-8 items-center mb-8">
                    <input
                      type="time"
                      value={entryTime}
                      onChange={e => setEntryTime(e.target.value)}
                      className="bg-transparent border border-acc/20 text-acc/60 px-4 py-1 outline-none focus:border-acc/40 tabular-nums"
                    />
                    <span className="text-acc/20 text-xs">time optional</span>
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
                    <Button onClick={handleAddEntry}>Add</Button>
                  </div>
                </div>
              )}

              {selectedDate && entriesOnDate.length > 0 && !isAddingEntry && (
                <div className="mt-8">
                  <div className="text-acc/40 mb-4">
                    {dayjs(selectedDate).format('dddd, MMMM D')}
                  </div>
                  {entriesOnDate.map((e, i) => (
                    <div key={i} className="flex gap-8 items-baseline text-acc/80 mb-1">
                      {e.time && <span className="text-acc/40 tabular-nums">{e.time}</span>}
                      <span>{e.text}</span>
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
                    {entry.time && ` · ${entry.time}`}
                  </span>
                  <span className="text-acc text-right">
                    {entry.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {todayEntries.length === 0 && upcomingEntries.length === 0 && !isCalendarOpen && (
            <div className="text-acc/40">No upcoming dates.</div>
          )}
        </div>
      </Block>

      {activeAlert && (
        <div className="fixed bottom-32 right-16 z-50">
          <div className="border border-acc/40 bg-base grid-fill p-16 max-w-64">
            <div className="flex justify-between items-baseline mb-8">
              <span className={cn(
                'text-xs uppercase tracking-widest font-bold',
                activeAlert.status === 'EXECUTE' ? 'text-acc' : 'text-acc/70'
              )}>
                CAL [{activeAlert.status}]
              </span>
              <button
                className="text-acc/30 hover:text-acc/70 text-xs ml-16 uppercase tracking-widest transition-opacity"
                onClick={() => setActiveAlert(null)}
              >
                ACK
              </button>
            </div>
            <div className="text-acc text-sm uppercase tracking-widest mb-4 leading-tight">
              {activeAlert.entry.type}: {activeAlert.entry.text}
            </div>
            <div className="text-acc/40 text-xs uppercase tracking-widest">
              {dayjs(activeAlert.entry.date).format('ddd D MMM').toUpperCase()}
              {activeAlert.entry.time && ` · ${activeAlert.entry.time}`}
            </div>
            <div className={cn(
              'tabular-nums font-mono mt-4 text-sm',
              activeAlert.status === 'EXECUTE' ? 'text-acc' : 'text-acc/60'
            )}>
              {formatCountdown(activeAlert.entry, now)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
