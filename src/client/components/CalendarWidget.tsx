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
  buildEntries,
  currentStage,
  formatAlertLine,
  formatCountdown,
  alertKey,
  loggedAlertKeys,
  minutesUntil,
  newEntryId,
  TIME_RE,
} from '#client/utils/calendar'
import type { AlertStage, CalendarEntry, EntryType } from '#client/utils/calendar'

const TICK_MS = 10_000
const LS_FIRED = 'lot-cal-fired'
const LS_ACKED = 'lot-cal-acked'

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch (_) {
    return new Set()
  }
}

function writeSet(key: string, set: Set<string>) {
  try {
    // Keep the newest 300 keys so storage cannot grow without bound.
    localStorage.setItem(key, JSON.stringify(Array.from(set).slice(-300)))
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
  const { data: logs = [], isFetched } = useLogs()
  const { mutate: createLog } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [now, setNow] = React.useState(() => Date.now())
  const [acked, setAcked] = React.useState<Set<string>>(() => readSet(LS_ACKED))
  const [notifyOn, setNotifyOn] = React.useState(
    () => typeof Notification !== 'undefined' && Notification.permission === 'granted'
  )
  // Entries created this session, shown at once while /api/logs is still cached.
  const [pending, setPending] = React.useState<CalendarEntry[]>([])
  const [statusOverride, setStatusOverride] = React.useState<Record<string, CalendarEntry['status']>>({})
  const firedRef = React.useRef<Set<string> | null>(null)
  const createLogRef = React.useRef(createLog)
  createLogRef.current = createLog

  const entries = React.useMemo<CalendarEntry[]>(() => {
    const built = buildEntries(logs)
    const known = new Set(built.map(e => e.id))
    return [...built, ...pending.filter(p => !known.has(p.id))]
      .map(e => (statusOverride[e.id] ? { ...e, status: statusOverride[e.id] } : e))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
  }, [logs, pending, statusOverride])

  // Clock: drives countdowns and alert staging.
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(id)
  }, [])

  // Alert engine: log each (entry, stage) exactly once, across reloads and tabs.
  React.useEffect(() => {
    if (!isFetched) return
    if (!firedRef.current) {
      const seeded = readSet(LS_FIRED)
      loggedAlertKeys(logs).forEach(k => seeded.add(k))
      firedRef.current = seeded
    }
    const fired = firedRef.current
    let changed = false

    for (const e of entries) {
      const stage = currentStage(e, now)
      if (!stage) continue
      const key = alertKey(e.id, stage)
      if (fired.has(key)) continue
      fired.add(key)
      changed = true

      createLogRef.current({
        text: `[ALERT] ${formatAlertLine(e, stage)}`,
        event: 'calendar_alert',
        metadata: { entryId: e.id, stage, date: e.date, time: e.time, entryType: e.type, text: e.text },
      })

      if (notifyOn && typeof Notification !== 'undefined') {
        try {
          new Notification(`${stage} // ${e.type.toUpperCase()} // ${e.time}`, { body: e.text, tag: key })
        } catch (_) {}
      }
    }
    if (changed) writeSet(LS_FIRED, fired)
  }, [now, entries, isFetched, logs, notifyOn])

  const activeAlerts = React.useMemo(() => {
    return entries
      .map(e => ({ e, stage: currentStage(e, now) as AlertStage | null }))
      .filter(a => a.stage && !acked.has(alertKey(a.e.id, a.stage)))
      .map(a => ({ ...a, stage: a.stage as AlertStage }))
  }, [entries, now, acked])

  const handleAck = (e: CalendarEntry, stage: AlertStage) => {
    const next = new Set(acked)
    next.add(alertKey(e.id, stage))
    setAcked(next)
    writeSet(LS_ACKED, next)
  }

  const handleStatus = (e: CalendarEntry, status: 'done' | 'cancelled') => {
    setStatusOverride(prev => ({ ...prev, [e.id]: status }))
    createLog({
      text: `[${status === 'done' ? 'DONE' : 'CANCELLED'}] ${e.type}: ${e.text} (${e.date}${e.time ? ' ' + e.time : ''})`,
      event: 'calendar_status',
      metadata: { entryId: e.id, status },
    }, {
      onSuccess: () => queryClient.refetchQueries(['/api/logs']),
      onError: () => setStatusOverride(prev => {
        const { [e.id]: _drop, ...rest } = prev
        return rest
      }),
    })
  }

  const handleToggleNotify = () => {
    if (typeof Notification === 'undefined') return
    if (notifyOn) { setNotifyOn(false); return }
    Notification.requestPermission().then(p => setNotifyOn(p === 'granted')).catch(() => {})
  }

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today && e.status === 'open')
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
    const text = entryText.trim()
    if (!selectedDate || !text) return
    const time = TIME_RE.test(entryTime) ? entryTime : undefined
    const id = newEntryId()
    const date = selectedDate
    const dateLabel = dayjs(date).format('dddd, MMMM D, YYYY')

    setPending(prev => [...prev, { id, date, time, text, type: entryType, status: 'open' }])

    createLog({
      text: `[SCHEDULE] ${entryType}: ${text} (${dateLabel}${time ? ' ' + time : ''})`,
      event: 'calendar_entry',
      metadata: { entryId: id, date, time: time || null, text, entryType },
    }, {
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        try { recordCalendarSignal(entryType, date) } catch (_) {}
      },
      onError: () => setPending(prev => prev.filter(p => p.id !== id)),
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
            {activeAlerts.map(({ e, stage }) => (
              <div
                key={alertKey(e.id, stage)}
                className={cn(
                  'flex justify-between gap-16 border-l-2 pl-8 tabular-nums',
                  stage === 'T-15' && 'border-acc/30 text-acc/60',
                  stage === 'T-05' && 'border-acc/60 text-acc',
                  stage === 'T-00' && 'border-acc text-acc animate-pulse',
                  stage === 'MISSED' && 'border-acc/30 text-acc/40 line-through decoration-acc/40',
                )}
              >
                <span>{formatAlertLine(e, stage)}</span>
                <span className="whitespace-nowrap">
                  <button className="text-acc/60 hover:text-acc" onClick={() => handleStatus(e, 'done')}>DONE</button>
                  {' '}
                  <button className="text-acc/60 hover:text-acc" onClick={() => handleAck(e, stage)}>ACK</button>
                </span>
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
              className={cn('transition-opacity', notifyOn ? 'text-acc' : 'text-acc/40 hover:text-acc/60')}
              onClick={handleToggleNotify}
            >
              Alerts: {notifyOn ? 'ON' : 'OFF'}
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
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40"
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
                  <div
                    key={e.id}
                    className={cn('text-acc/80 mb-1', e.status !== 'open' && 'text-acc/30 line-through')}
                  >
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
              const mins = minutesUntil(entry, now)
              const live = mins !== null && mins > -5 && mins <= 60
              return (
                <div key={entry.id} className="flex justify-between gap-16">
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="tabular-nums"> {entry.time}</span>}
                    {live && <span className="tabular-nums text-acc/60"> {formatCountdown(mins!)}</span>}
                  </span>
                  <span className="text-acc text-right">
                    {entry.text}
                    {' '}
                    <button
                      className="text-acc/30 hover:text-acc"
                      onClick={() => handleStatus(entry, 'done')}
                      title="Mark done"
                    >
                      ✓
                    </button>
                    {' '}
                    <button
                      className="text-acc/30 hover:text-acc"
                      onClick={() => handleStatus(entry, 'cancelled')}
                      title="Cancel"
                    >
                      ×
                    </button>
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
  )
}
