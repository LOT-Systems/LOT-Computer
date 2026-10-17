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
  type CalendarEntry,
  type EntryType,
  activeStage,
  alertLogText,
  buildEntries,
  dueStage,
  formatCountdown,
  nextTimedEntry,
  normalizeTime,
} from '#client/utils/calendar'

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
  const sentAlerts = React.useRef<Set<string>>(new Set())

  const entries = React.useMemo<CalendarEntry[]>(() => buildEntries(logs), [logs])

  // Clock: 1s while a timed entry is upcoming (live countdown), 30s otherwise
  const hasTimed = entries.some(e => e.time && !e.done && e.date >= now.format('YYYY-MM-DD'))
  React.useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), hasTimed ? 1000 : 30000)
    return () => clearInterval(id)
  }, [hasTimed])

  // Alert engine: each stage is logged once per entry (deduped by logs + ref)
  React.useEffect(() => {
    let fired = false
    for (const e of entries) {
      const stage = dueStage(e, now)
      if (!stage) continue
      const key = `${e.id}:${stage}`
      if (sentAlerts.current.has(key)) continue
      sentAlerts.current.add(key)
      fired = true
      const text = alertLogText(e, stage)
      createLog({
        text,
        event: 'calendar_alert',
        metadata: { entryId: e.id, stage, date: e.date, time: e.time, entryType: e.type },
      }, {
        onError: () => sentAlerts.current.delete(key),
      })
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`LOT // ${stage}`, { body: `${e.type.toUpperCase()} ${e.time} — ${e.text}`, tag: key })
        }
      } catch (_) {}
    }
    if (fired) setTimeout(() => queryClient.refetchQueries(['/api/logs']), 1500)
  }, [entries, now])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today && !e.done)
      .slice(0, 10)
  }, [entries])

  const alerting = entries.filter(e => {
    const st = activeStage(e, now)
    return st === 'T-15' || st === 'T-0' || st === 'OVERDUE'
  })
  const nextEntry = nextTimedEntry(entries.filter(e => !alerting.includes(e)), now)

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

    const time = entryTime.trim() ? normalizeTime(entryTime) : null
    if (entryTime.trim() && !time) return // invalid time: keep form open

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

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

  const handleDone = (e: CalendarEntry) => {
    createLog({
      text: `[DONE] ${e.type.toUpperCase()}: ${e.text} (${e.date}${e.time ? ` ${e.time}` : ''})`,
      event: 'calendar_done',
      metadata: { entryId: e.id, date: e.date, time: e.time, entryType: e.type },
    }, {
      onSuccess: () => queryClient.refetchQueries(['/api/logs']),
    })
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

        {alerting.length > 0 && (
          <div className="mb-16 space-y-1">
            {alerting.map(e => {
              const st = activeStage(e, now)!
              return (
                <div
                  key={e.id}
                  className={cn(
                    'flex justify-between gap-16 border-l-2 border-acc pl-8',
                    st !== 'T-15' && 'animate-pulse'
                  )}
                >
                  <span className="text-acc uppercase tracking-widest whitespace-nowrap tabular-nums">
                    {st === 'OVERDUE' ? 'OVERDUE' : st === 'T-0' ? 'NOW' : 'T-15'} · {e.time} · {e.type}
                  </span>
                  <span className="text-acc text-right">
                    {e.text}{' '}
                    <button className="text-acc/40 hover:text-acc" onClick={() => handleDone(e)}>
                      [done]
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {nextEntry && (
          <div className="mb-16 text-acc/60 tabular-nums">
            NEXT {formatCountdown(nextEntry, now)} · {nextEntry.time} · {nextEntry.text}
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
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    maxLength={5}
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5em] outline-none tabular-nums',
                      entryTime.trim() && !normalizeTime(entryTime) ? 'border-red-500/60' : 'border-acc/20 focus:border-acc/40'
                    )}
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
                {entriesOnDate.map(e => (
                  <div key={e.id} className={cn('text-acc/80 mb-1', e.done && 'line-through text-acc/30')}>
                    {e.time && <span className="tabular-nums">{e.time} </span>}
                    {e.text}
                    {!e.done && (
                      <>{' '}<button className="text-acc/30 hover:text-acc" onClick={() => handleDone(e)}>[done]</button></>
                    )}
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
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time && <span className="tabular-nums"> {entry.time}</span>}
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
