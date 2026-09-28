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
  STAGE_LABEL,
  STAGE_ORDER,
  TIME_RE,
  currentStage,
  entryDueAt,
  formatCountdown,
  secondsUntil,
} from '#client/utils/calendar'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time?: string
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
  const [now, setNow] = React.useState(() => new Date())
  const [alertsOn, setAlertsOn] = React.useState(
    () => typeof Notification !== 'undefined' && Notification.permission === 'granted'
  )
  // Guards against double-firing while the log round-trip is in flight
  const sentRef = React.useRef<Set<string>>(new Set())

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id as string,
        date: log.metadata?.date as string,
        time: TIME_RE.test(log.metadata?.time as string) ? (log.metadata?.time as string) : undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs])

  // Entries already acknowledged, and alert stages already logged (any device)
  const { doneIds, firedStages } = React.useMemo(() => {
    const done = new Set<string>()
    const fired = new Set<string>()
    logs.forEach(log => {
      const id = log.metadata?.entryId as string | undefined
      if (!id) return
      if (log.event === 'calendar_done') done.add(id)
      if (log.event === 'calendar_alert') fired.add(`${id}:${log.metadata?.stage}`)
    })
    return { doneIds: done, firedStages: fired }
  }, [logs])

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

  // 1s clock while any timed entry is live; otherwise 30s
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Live alerts: today's timed, unacknowledged entries inside the alert window
  const liveAlerts = React.useMemo(() => {
    return entries
      .filter(e => e.time && !doneIds.has(e.id))
      .map(e => {
        const due = entryDueAt(e.date, e.time)
        const stage = due ? currentStage(due, now) : null
        return due && stage ? { entry: e, due, stage } : null
      })
      .filter(Boolean) as { entry: CalendarEntry; due: Date; stage: AlertStage }[]
  }, [entries, doneIds, now])

  // Fire each stage once: log it, and raise a system notification if enabled
  React.useEffect(() => {
    liveAlerts.forEach(({ entry, stage }) => {
      const key = `${entry.id}:${stage}`
      if (firedStages.has(key) || sentRef.current.has(key)) return
      // Mark every earlier stage as sent so a late page load fires only the current one
      STAGE_ORDER.slice(0, STAGE_ORDER.indexOf(stage) + 1).forEach(st =>
        sentRef.current.add(`${entry.id}:${st}`)
      )
      createLog({
        text: `[ALERT ${STAGE_LABEL[stage]}] ${entry.type}: ${entry.text} (${entry.time})`,
        event: 'calendar_alert',
        metadata: { entryId: entry.id, stage, date: entry.date, time: entry.time, entryType: entry.type },
      }, { onSuccess: () => { queryClient.refetchQueries(['/api/logs']) } })
      try {
        if (alertsOn && stage !== 'LATE' && typeof Notification !== 'undefined') {
          new Notification(`${STAGE_LABEL[stage]} · ${entry.type.toUpperCase()} ${entry.time}`, { body: entry.text })
        }
      } catch (_) {}
    })
  }, [liveAlerts, firedStages, alertsOn])

  const handleAck = (entry: CalendarEntry) => {
    createLog({
      text: `[DONE] ${entry.type}: ${entry.text} (${entry.time || entry.date})`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, time: entry.time, entryType: entry.type },
    }, { onSuccess: () => { queryClient.refetchQueries(['/api/logs']) } })
  }

  const handleToggleAlerts = async () => {
    if (typeof Notification === 'undefined') return
    if (alertsOn) { setAlertsOn(false); return }
    try {
      const res = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
      setAlertsOn(res === 'granted')
    } catch (_) {}
  }

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

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        {liveAlerts.length > 0 && (
          <div className="mb-16 space-y-4">
            {liveAlerts.map(({ entry, due, stage }) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-baseline gap-8 border-l-2 pl-8 uppercase tracking-widest',
                  stage === 'T15' && 'border-acc/30 text-acc/60',
                  stage === 'T5' && 'border-acc/60 text-acc/80',
                  (stage === 'T0' || stage === 'LATE') && 'border-acc text-acc animate-pulse',
                )}
              >
                <span className="tabular-nums whitespace-nowrap">
                  {formatCountdown(secondsUntil(due, now))}
                </span>
                <span className="whitespace-nowrap">{STAGE_LABEL[stage]}</span>
                <span className="opacity-60 whitespace-nowrap">{entry.type} {entry.time}</span>
                <span className="flex-1 normal-case tracking-normal">{entry.text}</span>
                <button
                  className="text-acc/60 hover:text-acc transition-opacity"
                  onClick={() => handleAck(entry)}
                >
                  [ACK]
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-16 flex gap-8 items-center">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          {typeof Notification !== 'undefined' && (
            <button
              className={cn('transition-opacity', alertsOn ? 'text-acc/60 hover:text-acc' : 'text-acc/30 hover:text-acc/60')}
              onClick={handleToggleAlerts}
            >
              Alerts: {alertsOn ? 'ON' : 'OFF'}
            </button>
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
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    aria-label="Time (optional)"
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40"
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
              <div key={entry.id || i} className={cn('flex justify-between gap-16', doneIds.has(entry.id) && 'opacity-40 line-through')}>
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
