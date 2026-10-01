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
  entryTimestamp,
  firedKey,
  formatAlert,
  formatOffset,
  isValidTime,
  liveState,
  planStages,
  STAGE_ORDER,
} from '#client/utils/calendarAlerts'
import type { AlertStage } from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time: string | null
  startMs: number | null
  text: string
  type: EntryType
}

type AlertToast = {
  key: string
  stage: AlertStage
  head: string
  body: string
  entryId: string
}

const FIRED_STORAGE_KEY = 'lot.calendar.fired.v1'
const ARMED_STORAGE_KEY = 'lot.calendar.armed.v1'
const TICK_MS = 15_000
const MAX_FIRED_KEEP = 500

function readStorage(key: string): string | null {
  try { return localStorage.getItem(key) } catch (_) { return null }
}

function writeStorage(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch (_) {}
}

function loadFired(): Set<string> {
  try {
    const raw = readStorage(FIRED_STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [])
  } catch (_) {
    return new Set()
  }
}

function saveFired(set: Set<string>) {
  writeStorage(FIRED_STORAGE_KEY, JSON.stringify(Array.from(set).slice(-MAX_FIRED_KEEP)))
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

  const [now, setNow] = React.useState(() => Date.now())
  const [toast, setToast] = React.useState<AlertToast | null>(null)
  const [entryTime, setEntryTime] = React.useState('')
  const [localDone, setLocalDone] = React.useState<Set<string>>(() => new Set())
  const [armed, setArmed] = React.useState(() => readStorage(ARMED_STORAGE_KEY) === '1')
  const firedRef = React.useRef<Set<string> | null>(null)

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => {
        const time = isValidTime(log.metadata?.time) ? (log.metadata!.time as string) : null
        const date = log.metadata?.date as string
        return {
          id: log.id,
          date,
          time,
          startMs: entryTimestamp(date, time),
          text: log.metadata?.text as string || log.text || '',
          type: (log.metadata?.entryType as EntryType) || 'note',
        }
      })
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs])

  const doneIds = React.useMemo(() => {
    const set = new Set<string>(localDone)
    logs.forEach(log => {
      if (log.event === 'calendar_done' && typeof log.metadata?.entryId === 'string') {
        set.add(log.metadata.entryId)
      }
    })
    return set
  }, [logs, localDone])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs(now).format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today && !doneIds.has(e.id))
      .slice(0, 10)
  }, [entries, doneIds, now])

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

    const time = isValidTime(entryTime) ? entryTime : null

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
    if (doneIds.has(entry.id)) return
    setLocalDone(prev => new Set(prev).add(entry.id))
    setToast(t => (t && t.entryId === entry.id ? null : t))
    createLog({
      text: `[DONE] ${entry.type}: ${entry.text}${entry.time ? ` (${entry.date} ${entry.time})` : ` (${entry.date})`}`,
      event: 'calendar_done',
      metadata: {
        entryId: entry.id,
        date: entry.date,
        entryType: entry.type,
        text: entry.text,
        ...(entry.time ? { time: entry.time } : {}),
      },
    }, {
      onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
      onError: () => {
        setLocalDone(prev => {
          const next = new Set(prev)
          next.delete(entry.id)
          return next
        })
      },
    })
  }

  const handleToggleArmed = async () => {
    const next = !armed
    if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try { await Notification.requestPermission() } catch (_) {}
    }
    setArmed(next)
    writeStorage(ARMED_STORAGE_KEY, next ? '1' : '0')
  }

  // Clock: drives countdowns and the alert engine. Paused on hidden tabs.
  React.useEffect(() => {
    const tick = () => { if (!document.hidden) setNow(Date.now()) }
    const id = setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  // Alert engine: fire each stage once per entry, persist, log, notify.
  React.useEffect(() => {
    if (!firedRef.current) firedRef.current = loadFired()
    const fired = firedRef.current
    let dirty = false

    logs.forEach(log => {
      if (log.event !== 'calendar_alert') return
      const id = log.metadata?.entryId
      const stage = log.metadata?.stage
      if (typeof id === 'string' && typeof stage === 'string') {
        const k = `${id}:${stage}`
        if (!fired.has(k)) { fired.add(k); dirty = true }
      }
    })

    for (const entry of entries) {
      if (entry.startMs === null || doneIds.has(entry.id)) continue
      const done = new Set<AlertStage>(STAGE_ORDER.filter(st => fired.has(firedKey(entry.id, st))))
      const plan = planStages(entry.startMs, now, done)
      plan.silent.forEach(st => { fired.add(firedKey(entry.id, st)); dirty = true })

      if (plan.fire) {
        const stage = plan.fire
        const key = firedKey(entry.id, stage)
        fired.add(key)
        dirty = true

        const msg = formatAlert(stage, entry.type, entry.text, entry.time as string)
        setToast({ key, stage, head: msg.head, body: msg.body, entryId: entry.id })

        if (armed && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try { new Notification(msg.head, { body: msg.body, tag: key }) } catch (_) {}
        }

        createLog({
          text: msg.log,
          event: 'calendar_alert',
          metadata: {
            entryId: entry.id,
            stage,
            date: entry.date,
            time: entry.time,
            entryType: entry.type,
            text: entry.text,
          },
        })
      }
    }

    if (dirty) saveFired(fired)
  }, [now, entries, doneIds, logs, armed, createLog])

  // Auto-dismiss advisory toasts; execute/overdue stay until acknowledged.
  React.useEffect(() => {
    if (!toast || toast.stage === 'T0' || toast.stage === 'MISSED') return
    const id = setTimeout(() => setToast(t => (t && t.key === toast.key ? null : t)), 12_000)
    return () => clearTimeout(id)
  }, [toast])

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
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
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
                  <div key={i} className="text-acc/80 mb-1">
                    {e.time && <span className="text-acc/40 tabular-nums">{e.time} </span>}
                    {doneIds.has(e.id) ? <span className="line-through opacity-60">{e.text}</span> : e.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map(entry => {
              const state = liveState(entry.startMs, now, false)
              const hot = state === 'SOON' || state === 'NOW' || state === 'OVERDUE'
              const tag =
                entry.startMs !== null && (state === 'SOON' || state === 'NOW' || state === 'OVERDUE')
                  ? (state === 'OVERDUE' ? 'OVERDUE ' : '') + formatOffset(entry.startMs, now)
                  : null
              return (
                <div key={entry.id} className="flex justify-between gap-16">
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="text-acc/60 tabular-nums"> {entry.time}</span>}
                  </span>
                  <span className="text-acc text-right">
                    {tag && (
                      <span className={cn('tabular-nums mr-8', state === 'SOON' ? 'text-acc/60' : 'font-bold')}>
                        {tag}
                      </span>
                    )}
                    {entry.text}
                    {(hot || entry.date <= dayjs(now).format('YYYY-MM-DD')) && (
                      <button
                        className="ml-8 text-acc/40 hover:text-acc transition-opacity"
                        onClick={() => handleDone(entry)}
                        aria-label="Mark done"
                      >
                        [DONE]
                      </button>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-16">
          <button
            className="text-acc/30 hover:text-acc/60 transition-opacity"
            onClick={handleToggleArmed}
          >
            Alerts: {armed ? 'ARMED' : 'OFF'}
          </button>
        </div>

        {toast && (
          <div
            role="alert"
            className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50
                       px-16 py-8 border border-[rgb(var(--acc-color-default)/0.4)]
                       bg-[var(--base-color)] grid-fill-light animate-fade-in-up
                       text-acc max-w-[90vw]"
          >
            <div className="uppercase tracking-widest font-bold">▌{toast.head}</div>
            <div className="uppercase tracking-widest opacity-80">{toast.body}</div>
            <div className="flex gap-16 mt-4 opacity-60">
              {(toast.stage === 'T0' || toast.stage === 'MISSED') && (
                <button
                  className="hover:opacity-100"
                  onClick={() => {
                    const e = entries.find(x => x.id === toast.entryId)
                    if (e) handleDone(e)
                  }}
                >
                  [DONE]
                </button>
              )}
              <button className="hover:opacity-100" onClick={() => setToast(null)}>
                [ACK]
              </button>
            </div>
          </div>
        )}

        {upcomingEntries.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
