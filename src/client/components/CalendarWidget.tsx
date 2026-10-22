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
  alertKey,
  countdown,
  dueAlerts,
  isValidTime,
  parseEntries,
  type AlertStage,
  type CalendarAlert,
  type CalendarEntry,
  type EntryType,
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
  const [now, setNow] = React.useState(() => new Date())
  const [pending, setPending] = React.useState<Set<string>>(() => new Set())

  const entries = React.useMemo(() => parseEntries(logs), [logs])

  // Alert / ack state is derived from logs, plus optimistic local keys
  const { alerted, acked } = React.useMemo(() => {
    const alerted = new Set<string>(pending)
    const acked = new Set<string>()
    for (const l of logs) {
      const id = l.metadata?.entryId as string | undefined
      const stage = l.metadata?.stage as AlertStage | undefined
      if (!id || !stage) continue
      if (l.event === 'calendar_alert') alerted.add(alertKey(id, stage))
      else if (l.event === 'calendar_ack') acked.add(alertKey(id, stage))
    }
    return { alerted, acked }
  }, [logs, pending])

  const logEvent = React.useCallback(
    (event: string, text: string, metadata: Record<string, any>) => {
      createLog(
        { text, event, metadata },
        { onSuccess: () => queryClient.refetchQueries(['/api/logs']) }
      )
    },
    [createLog, queryClient]
  )

  // Clock: 1s tick drives countdowns and alert evaluation
  React.useEffect(() => {
    const tick = () => setNow(new Date())
    const id = setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  // Fire due alerts once: log it, then optional OS notification
  React.useEffect(() => {
    const due = dueAlerts(entries, now, alerted)
    if (!due.length) return
    setPending(prev => {
      const next = new Set(prev)
      due.forEach(a => next.add(a.key))
      return next
    })
    due.forEach(a => {
      const when = a.entry.time ?? 'ALL-DAY'
      logEvent(
        'calendar_alert',
        `[ALERT ${a.stage}] ${a.entry.type.toUpperCase()} ${when} — ${a.entry.text}`,
        { entryId: a.entry.id, stage: a.stage, date: a.entry.date, time: a.entry.time }
      )
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${a.stage} · ${a.entry.type.toUpperCase()} ${when}`, { body: a.entry.text })
        }
      } catch (_) {}
    })
  }, [entries, now, alerted, logEvent])

  const activeAlerts = React.useMemo<CalendarAlert[]>(() => {
    const out: CalendarAlert[] = []
    for (const entry of entries) {
      if (entry.status !== 'open') continue
      for (const stage of ['T-0', 'T-15'] as AlertStage[]) {
        const key = alertKey(entry.id, stage)
        if (alerted.has(key) && !acked.has(key)) {
          out.push({ key, entry, stage })
          break
        }
      }
    }
    return out
  }, [entries, alerted, acked])

  const acknowledge = (a: CalendarAlert) => {
    setPending(prev => new Set(prev).add(a.key))
    logEvent('calendar_ack', `[ACK ${a.stage}] ${a.entry.text}`, { entryId: a.entry.id, stage: a.stage })
  }

  const markDone = (e: CalendarEntry) =>
    logEvent('calendar_done', `[DONE] ${e.text}`, { entryId: e.id })

  const cancelEntry = (e: CalendarEntry) =>
    logEvent('calendar_cancel', `[CANCEL] ${e.text}`, { entryId: e.id })

  const canNotify = typeof Notification !== 'undefined' && Notification.permission === 'default'

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.status === 'open' && e.date >= today)
      .slice(0, 10)
  }, [entries])

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter(e => e.date === selectedDate && e.status !== 'cancelled')
  }, [entries, selectedDate])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => e.status === 'open' && set.add(e.date))
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

    const time = isValidTime(entryTime) ? entryTime : null
    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ' ' + time : ''})`,
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
        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-1">
            {activeAlerts.map(a => (
              <div key={a.key} className="flex justify-between gap-16 border border-acc/40 px-4 py-2 animate-pulse">
                <span className="text-acc uppercase tracking-widest">
                  {'▲'} {a.stage} · {a.entry.type} · {a.entry.time ?? 'all-day'} · {a.entry.text}
                </span>
                <span className="flex gap-8 whitespace-nowrap">
                  <span className="text-acc/60 tabular-nums">{countdown(a.entry, now)}</span>
                  <button className="text-acc hover:underline" onClick={() => { markDone(a.entry); acknowledge(a) }}>DONE</button>
                  <button className="text-acc/60 hover:text-acc" onClick={() => acknowledge(a)}>ACK</button>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mb-16 flex gap-8">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          {canNotify && (
            <Button onClick={() => { try { Notification.requestPermission().then(() => setNow(new Date())) } catch (_) {} }}>
              Enable alerts
            </Button>
          )}
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
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40"
                    aria-label="Time (optional)"
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
                  <div key={e.id} className="flex justify-between gap-16 mb-1">
                    <span className={cn('text-acc/80', e.status === 'done' && 'line-through text-acc/40')}>
                      {e.time && <span className="tabular-nums mr-8">{e.time}</span>}
                      {e.text}
                    </span>
                    {e.status === 'open' && (
                      <span className="flex gap-8 whitespace-nowrap">
                        <button className="text-acc/40 hover:text-acc" onClick={() => markDone(e)}>done</button>
                        <button className="text-acc/40 hover:text-acc" onClick={() => cancelEntry(e)}>cancel</button>
                      </span>
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
                  {entry.time && <span className="tabular-nums"> · {entry.time}</span>}
                  {entry.date === today && entry.time && (
                    <span className="text-acc/40 tabular-nums"> · {countdown(entry, now)}</span>
                  )}
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
