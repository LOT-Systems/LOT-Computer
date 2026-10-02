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
  alertLogText,
  currentStage,
  isValidTime,
  milDate,
  milTime,
  nextAlert,
  stageLabel,
} from '#client/utils/calendarAlerts'
import type { AlertStage, TimedEntry } from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = TimedEntry & { type: EntryType }

const FIRED_STORAGE_KEY = 'lot-calendar-fired'
const TICK_MS = 15_000

function loadFired(): string[] {
  try {
    const raw = localStorage.getItem(FIRED_STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.slice(-300) : []
  } catch (_) {
    return []
  }
}

function saveFired(keys: Set<string>) {
  try {
    localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(Array.from(keys).slice(-300)))
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
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [entryTime, setEntryTime] = React.useState('')
  const [now, setNow] = React.useState(() => dayjs())
  const firedRef = React.useRef<Set<string> | null>(null)
  if (firedRef.current === null) firedRef.current = new Set(loadFired())

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        date: log.metadata?.date as string,
        time: isValidTime(log.metadata?.time) ? (log.metadata.time as string) : undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs])

  // Alert state recorded in Log (survives reloads and other devices).
  const { loggedKeys, ackedIds } = React.useMemo(() => {
    const keys = new Set<string>()
    const acks = new Set<string>()
    logs.forEach(log => {
      if (log.event !== 'calendar_alert' || !log.metadata) return
      const { entryId, stage } = log.metadata as { entryId?: string; stage?: AlertStage }
      if (!entryId || !stage) return
      keys.add(alertKey(entryId, stage))
      if (stage === 'ACK') acks.add(entryId)
    })
    return { loggedKeys: keys, ackedIds: acks }
  }, [logs])

  const emitAlert = React.useCallback((entry: CalendarEntry, stage: AlertStage) => {
    const fired = firedRef.current!
    const key = alertKey(entry.id, stage)
    if (fired.has(key)) return
    fired.add(key)
    saveFired(fired)
    createLog({
      text: alertLogText(entry, stage),
      event: 'calendar_alert',
      metadata: {
        entryId: entry.id,
        stage,
        date: entry.date,
        time: entry.time,
        entryType: entry.type,
        key,
      },
    }, {
      onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
      onError: () => {
        // Allow a retry on the next tick if the log write failed.
        fired.delete(key)
        saveFired(fired)
      },
    })
    if (stage !== 'ACK') {
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(stageLabel(stage), {
            body: `${entry.type.toUpperCase()} · ${entry.time ? milTime(entry.time) : ''} · ${entry.text}`,
            tag: key,
          })
        }
      } catch (_) {}
    }
  }, [createLog, queryClient])

  // Clock tick: drives countdowns and alert firing.
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(dayjs()), TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  React.useEffect(() => {
    if (!isFetched) return // never fire before we know what was already logged
    const fired = firedRef.current!
    loggedKeys.forEach(k => fired.add(k))
    entries.forEach(entry => {
      const stage = nextAlert(entry, fired, ackedIds, now)
      if (stage) emitAlert(entry, stage)
    })
  }, [now, entries, loggedKeys, ackedIds, isFetched, emitAlert])

  const activeAlerts = React.useMemo(() => {
    return entries
      .filter(e => !ackedIds.has(e.id))
      .map(e => ({ entry: e, stage: currentStage(e, now) }))
      .filter((a): a is { entry: CalendarEntry; stage: AlertStage } => !!a.stage)
  }, [entries, ackedIds, now])

  const upcomingEntries = React.useMemo(() => {
    const today = now.format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today && !ackedIds.has(e.id))
      .slice(0, 10)
  }, [entries, now, ackedIds])

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter(e => e.date === selectedDate)
  }, [entries, selectedDate])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => set.add(e.date))
    return set
  }, [entries])

  const today = now.format('YYYY-MM-DD')
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

    if (isValidTime(entryTime)) {
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission()
        }
      } catch (_) {}
    }

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${isValidTime(entryTime) ? ` ${milTime(entryTime)}` : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        text: entryText.trim(),
        entryType,
        ...(isValidTime(entryTime) ? { time: entryTime } : {}),
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
        <div className="mb-16">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
        </div>

        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-1" role="alert">
            {activeAlerts.map(({ entry, stage }) => (
              <div key={entry.id} className="flex justify-between gap-16 text-acc uppercase">
                <span className={cn('whitespace-nowrap', (stage === 'T-00' || stage === 'MISSED') && 'animate-pulse')}>
                  {'▌'} {stageLabel(stage)} · {entry.type} · {milTime(entry.time!)} {milDate(entry.date)}
                </span>
                <span className="text-right flex gap-8">
                  <span className="truncate normal-case">{entry.text}</span>
                  <button
                    className="text-acc/40 hover:text-acc transition-opacity"
                    onClick={() => emitAlert(entry, 'ACK')}
                  >
                    ACK
                  </button>
                </span>
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
                  <div key={i} className="text-acc/80 mb-1">
                    {e.time ? `${milTime(e.time)} · ` : ''}{e.text}
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
                  {entry.time ? ` · ${milTime(entry.time)}` : ''}
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
