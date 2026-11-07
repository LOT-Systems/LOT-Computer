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
  id: string
  date: string
  time: string | null // 'HH:mm' local, null = all-day
  text: string
  type: EntryType
}

type AlertTier = 'T-15' | 'T-0' | 'LATE'

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const ALERT_WINDOW_MS = 60 * 60 * 1000 // never raise alerts for entries >60 min overdue

function startOf(e: CalendarEntry): Dayjs | null {
  if (!e.time) return null
  return dayjs(`${e.date} ${e.time}`)
}

function tierFor(deltaMs: number): AlertTier | null {
  // deltaMs = start - now
  if (deltaMs > 15 * 60 * 1000) return null
  if (deltaMs > 0) return 'T-15'
  if (deltaMs > -5 * 60 * 1000) return 'T-0'
  if (deltaMs > -ALERT_WINDOW_MS) return 'LATE'
  return null
}

function fmtCountdown(deltaMs: number): string {
  const sign = deltaMs >= 0 ? 'T-' : 'T+'
  const t = Math.floor(Math.abs(deltaMs) / 1000)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const sec = t % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${sign}${pad(h)}:${pad(m)}:${pad(sec)}`
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getMonthWeeks(year: number, month: number): Dayjs[][] {
  // Anchor on day 1 first: dayjs().month(1) on the 31st overflows into March.
  const first = dayjs().startOf('month').year(year).month(month).startOf('month')
  const last = first.endOf('month')

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
  const [now, setNow] = React.useState(() => Date.now())
  const [acked, setAcked] = React.useState<Set<string>>(() => new Set())
  const [alertsOn, setAlertsOn] = React.useState(() => {
    try { return localStorage.getItem('lot.cal.alerts') !== 'off' } catch (_) { return true }
  })
  // Alerts already dispatched this session (guards against mutation latency double-fire)
  const firedRef = React.useRef<Set<string>>(new Set())

  // 1 Hz clock — drives countdowns and alert evaluation
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => {
        const rawTime = log.metadata?.time as string | undefined
        return {
          id: String(log.id),
          date: log.metadata?.date as string,
          time: rawTime && TIME_RE.test(rawTime) ? rawTime : null,
          text: log.metadata?.text as string || log.text || '',
          type: (log.metadata?.entryType as EntryType) || 'note',
        }
      })
      .filter(e => e.date && e.text)
      .sort((a, b) =>
        a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '')
      )
  }, [logs])

  // Persisted alert history (survives reloads and devices — it lives in Log)
  const alertedKeys = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.entryId) {
        set.add(`${log.metadata.entryId}:${log.metadata.tier}`)
      }
    })
    return set
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs(now).format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today)
      .slice(0, 10)
  }, [entries, Math.floor(now / 60000)])

  // Active alerts: timed entries inside the alert window
  const activeAlerts = React.useMemo(() => {
    return entries
      .map(e => {
        const st = startOf(e)
        if (!st) return null
        const delta = st.valueOf() - now
        const tier = tierFor(delta)
        return tier ? { entry: e, delta, tier } : null
      })
      .filter((a): a is { entry: CalendarEntry; delta: number; tier: AlertTier } => !!a)
  }, [entries, now])

  // Dispatch: log each (entry, tier) once, plus optional system notification
  React.useEffect(() => {
    if (!alertsOn) return
    activeAlerts.forEach(({ entry, tier }) => {
      const key = `${entry.id}:${tier}`
      if (alertedKeys.has(key) || firedRef.current.has(key)) return
      firedRef.current.add(key)
      const when = `${entry.date} ${entry.time}`
      createLog({
        text: `[ALERT ${tier}] ${entry.type.toUpperCase()}: ${entry.text} (${when})`,
        event: 'calendar_alert',
        metadata: {
          entryId: entry.id,
          tier,
          date: entry.date,
          time: entry.time,
          entryType: entry.type,
          text: entry.text,
        },
      }, {
        onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
        onError: () => { firedRef.current.delete(key) }, // retry on next tick
      })
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${tier} · ${entry.time}`, { body: entry.text, tag: key })
        }
      } catch (_) {}
    })
  }, [activeAlerts, alertsOn, alertedKeys])

  const toggleAlerts = () => {
    const next = !alertsOn
    setAlertsOn(next)
    try { localStorage.setItem('lot.cal.alerts', next ? 'on' : 'off') } catch (_) {}
    try {
      if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch (_) {}
  }

  // Next timed entry later today (for the status line)
  const nextTimed = React.useMemo(() => {
    for (const e of entries) {
      const st = startOf(e)
      if (st && st.valueOf() > now) return { entry: e, delta: st.valueOf() - now }
    }
    return null
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
    if (entryTime && !TIME_RE.test(entryTime)) return
    const time = entryTime || null

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
        {activeAlerts.filter(a => !acked.has(`${a.entry.id}:${a.tier}`)).map(({ entry, delta, tier }) => (
          <div
            key={`${entry.id}:${tier}`}
            role="alert"
            className={cn(
              'mb-8 border px-8 py-4 flex items-center justify-between gap-16 uppercase tracking-widest',
              tier === 'T-15' && 'border-acc/40 text-acc/80',
              tier === 'T-0' && 'border-acc text-acc animate-pulse',
              tier === 'LATE' && 'border-acc/60 text-acc',
            )}
          >
            <span className="tabular-nums whitespace-nowrap">
              [{tier === 'LATE' ? 'OVERDUE' : tier === 'T-0' ? 'NOW' : 'STANDBY'}] {entry.time} {fmtCountdown(delta)}
            </span>
            <span className="flex-1 truncate text-right normal-case tracking-normal">{entry.text}</span>
            <button
              className="text-acc/60 hover:text-acc"
              onClick={() => setAcked(prev => new Set(prev).add(`${entry.id}:${tier}`))}
            >
              ACK
            </button>
          </div>
        ))}

        <div className="mb-16 flex items-center gap-16">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          <button
            className="text-acc/40 hover:text-acc transition-opacity tabular-nums"
            onClick={toggleAlerts}
            title="Toggle event alerts"
          >
            ALERTS {alertsOn ? 'ON' : 'OFF'}
          </button>
          {nextTimed && nextTimed.delta < 24 * 3600 * 1000 && (
            <span className="text-acc/40 tabular-nums whitespace-nowrap">
              NEXT {nextTimed.entry.time} {fmtCountdown(nextTimed.delta)}
            </span>
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
                {entriesOnDate.map(e => (
                  <div key={e.id} className="text-acc/80 mb-1">
                    {e.time && <span className="tabular-nums text-acc/40 mr-8">{e.time}</span>}
                    {e.text}
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
                  {entry.time && <span className="tabular-nums text-acc/60"> · {entry.time}</span>}
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
