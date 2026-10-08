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
import { useCreateLog, useDeleteCalendarEntry, useLogs } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import {
  type AlertStage,
  type AlertableEntry,
  TIME_RE,
  alertKey,
  countdownLabel,
  pendingAlerts,
} from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time?: string
  text: string
  type: EntryType
}

const FIRED_STORAGE_KEY = 'lot_cal_alerts_fired'
const TICK_MS = 15000

const STAGE_LABEL: Record<AlertStage, string> = {
  WARN: 'WARN',
  DUE: 'DUE',
  MISSED: 'MISSED',
  DAY: 'TODAY',
}

type ActiveAlert = { key: string; entry: AlertableEntry; stage: AlertStage }

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch (_) {
    return new Set()
  }
}

function saveFired(fired: Set<string>) {
  try {
    // Keep the ledger bounded.
    localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(Array.from(fired).slice(-300)))
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
  const { data: logs = [] } = useLogs()
  const { mutate: createLog } = useCreateLog()
  const { mutate: deleteEntry } = useDeleteCalendarEntry()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [entryTime, setEntryTime] = React.useState('')
  const [alerts, setAlerts] = React.useState<ActiveAlert[]>([])
  const [now, setNow] = React.useState(() => new Date())
  const submittingRef = React.useRef(false)
  const firedRef = React.useRef<Set<string>>(new Set())
  const entriesRef = React.useRef<CalendarEntry[]>([])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        date: log.metadata?.date as string,
        time: TIME_RE.test(String(log.metadata?.time || '')) ? (log.metadata?.time as string) : undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
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

  entriesRef.current = entries

  // Alert engine — ticks while the tab is visible, fires each (entry, stage) once.
  // The fired ledger lives in localStorage and is seeded from calendar_alert logs,
  // so a reload or second device never replays a notification.
  React.useEffect(() => {
    const fired = loadFired()
    logs.forEach(l => {
      if (l.event === 'calendar_alert' && l.metadata?.entryId && l.metadata?.stage) {
        fired.add(alertKey(String(l.metadata.entryId), l.metadata.stage as AlertStage))
      }
    })
    firedRef.current = fired
  }, [logs])

  React.useEffect(() => {
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return
      const nowDate = new Date()
      setNow(nowDate)
      const due = pendingAlerts(entriesRef.current, nowDate, firedRef.current)
      if (due.length === 0) return

      const fresh: ActiveAlert[] = []
      due.forEach(({ entry, stage }) => {
        const key = alertKey(entry.id, stage)
        firedRef.current.add(key)
        fresh.push({ key, entry, stage })
        createLog({
          text: `[ALERT:${STAGE_LABEL[stage]}] ${entry.type.toUpperCase()}: ${entry.text}${entry.time ? ` @ ${entry.time}` : ''}`,
          event: 'calendar_alert',
          metadata: {
            entryId: entry.id,
            stage,
            date: entry.date,
            time: entry.time,
            entryType: entry.type,
            firedAt: nowDate.toISOString(),
          },
        })
        try {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(`${STAGE_LABEL[stage]} · ${entry.type.toUpperCase()}`, { body: entry.text, tag: key })
          }
        } catch (_) {}
      })
      saveFired(firedRef.current)
      setAlerts(prev => [...prev, ...fresh.filter(f => !prev.some(p => p.key === f.key))])
    }
    tick()
    const id = setInterval(tick, TICK_MS)
    const onVisible = () => { if (!document.hidden) tick() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [createLog])

  // WARN / TODAY notices self-clear; DUE and MISSED wait for acknowledgement.
  React.useEffect(() => {
    const transient = alerts.filter(a => a.stage === 'WARN' || a.stage === 'DAY')
    if (transient.length === 0) return
    const t = setTimeout(
      () => setAlerts(prev => prev.filter(a => !transient.some(x => x.key === a.key))),
      20000
    )
    return () => clearTimeout(t)
  }, [alerts])

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
    if (!selectedDate || !entryText.trim() || submittingRef.current) return
    if (entryTime && !TIME_RE.test(entryTime)) return
    submittingRef.current = true
    const time = entryTime || undefined

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ` ${time}` : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        time,
        text: entryText.trim(),
        entryType,
      },
    }, {
      onSettled: () => { submittingRef.current = false },
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        try { recordCalendarSignal(entryType, selectedDate!) } catch (_) {}
      },
    })

    setEntryText('')
    setEntryTime('')
    setIsAddingEntry(false)
  }

  const handleDelete = (id: string) => {
    deleteEntry({ id }, { onSuccess: () => queryClient.refetchQueries(['/api/logs']) })
  }

  const requestNotifications = () => {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch (_) {}
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
        {alerts.length > 0 && (
          <div
            role="alert"
            aria-live="assertive"
            className="fixed bottom-16 right-16 z-50 space-y-4 max-w-[28em] font-mono uppercase tracking-widest text-acc"
          >
            {alerts.map(a => (
              <button
                key={a.key}
                onClick={() => setAlerts(prev => prev.filter(x => x.key !== a.key))}
                className={cn(
                  'block w-full text-left bg-bg border px-8 py-4',
                  a.stage === 'MISSED' ? 'border-acc' : 'border-acc/40',
                  a.stage === 'DUE' && 'border-acc animate-pulse',
                )}
              >
                <div className="flex justify-between gap-16">
                  <span>[{STAGE_LABEL[a.stage]}] {a.entry.type}</span>
                  <span className="tabular-nums opacity-60">{countdownLabel(a.entry, now)}</span>
                </div>
                <div className="normal-case tracking-normal opacity-80">{a.entry.text}</div>
              </button>
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
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onFocus={requestNotifications}
                    aria-label="Time (optional)"
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40 tabular-nums"
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
                  <div key={e.id} className="text-acc/80 mb-1 flex justify-between gap-16">
                    <span>{e.time && <span className="tabular-nums text-acc/40 mr-8">{e.time}</span>}{e.text}</span>
                    <button className="text-acc/30 hover:text-acc transition-opacity" onClick={() => handleDelete(e.id)} aria-label="Delete entry">×</button>
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
