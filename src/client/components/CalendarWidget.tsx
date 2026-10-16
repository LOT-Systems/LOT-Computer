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
import { useCreateLog, useCalendarLogs } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import {
  buildEntries,
  currentStage,
  formatCountdown,
  formatElapsed,
  minutesUntil,
  TIME_RE,
} from '#client/utils/calendar'
import type { AlertStage, CalendarEntry, EntryType } from '#client/utils/calendar'

const ALERT_STORE = 'lot_cal_alerted'
const TICK_MS = 15000

function readAlerted(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(ALERT_STORE) || '[]'))
  } catch (_) {
    return new Set()
  }
}

function writeAlerted(set: Set<string>) {
  try {
    localStorage.setItem(ALERT_STORE, JSON.stringify([...set].slice(-200)))
  } catch (_) {}
}

function browserNotify(title: string, body: string, tag: string) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, tag })
    }
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
  const { data: logs = [] } = useCalendarLogs()
  const { mutate: createLog } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [saveError, setSaveError] = React.useState(false)
  const [now, setNow] = React.useState(() => new Date())
  const alertedRef = React.useRef<Set<string>>(readAlerted())

  const entries = React.useMemo<CalendarEntry[]>(() => buildEntries(logs), [logs])

  const refresh = React.useCallback(() => {
    queryClient.refetchQueries(['/api/calendar'])
    queryClient.invalidateQueries(['/api/logs'])
  }, [queryClient])

  // Clock tick: drives countdowns, elapsed timers and alert evaluation.
  React.useEffect(() => {
    const tick = () => { if (!document.hidden) setNow(new Date()) }
    const id = setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  // Alerts: one per entry+stage, persisted to Log (survives reload / other devices).
  React.useEffect(() => {
    const nowDate = new Date()
    const todayKey = dayjs(nowDate).format('YYYY-MM-DD')
    for (const entry of entries) {
      if (entry.date !== todayKey) continue
      const stage = currentStage(entry, nowDate)
      if (!stage) continue
      const key = `${entry.id}:${stage}`
      if (entry.alerted.includes(stage) || alertedRef.current.has(key)) continue
      alertedRef.current.add(key)
      writeAlerted(alertedRef.current)
      const label = `${stage} // ${entry.type.toUpperCase()} // ${entry.text}`
      createLog({
        text: `[ALERT] ${label}${entry.time ? ` @ ${entry.time}` : ''}`,
        event: 'calendar_alert',
        metadata: { entryId: entry.id, stage, date: entry.date, time: entry.time },
      }, {
        onSuccess: refresh,
        onError: () => { alertedRef.current.delete(key); writeAlerted(alertedRef.current) },
      })
      if (stage !== 'OVERDUE' || !document.hidden) {
        browserNotify(`LOT // ${stage}`, `${entry.type.toUpperCase()} // ${entry.text}`, key)
      }
    }
  }, [entries, now, createLog, refresh])

  const activeAlerts = React.useMemo(() => {
    const todayKey = dayjs(now).format('YYYY-MM-DD')
    return entries
      .filter(e => e.date === todayKey)
      .map(e => ({ entry: e, stage: currentStage(e, now) as AlertStage | null }))
      .filter((x): x is { entry: CalendarEntry; stage: AlertStage } => !!x.stage)
  }, [entries, now])

  const upcomingEntries = React.useMemo(() => {
    const todayKey = dayjs(now).format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= todayKey || (e.startedAt && !e.doneAt))
      .slice(0, 12)
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

    const time = TIME_RE.test(entryTime) ? entryTime : undefined
    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const text = entryText.trim()
    setSaveError(false)

    createLog({
      text: `[SCHEDULE] ${entryType}: ${text} (${dateLabel}${time ? ` ${time}` : ''})`,
      event: 'calendar_entry',
      metadata: { date: selectedDate, time, text, entryType },
    }, {
      onSuccess: () => {
        refresh()
        setEntryText('')
        setEntryTime('')
        setIsAddingEntry(false)
        try { recordCalendarSignal(entryType, selectedDate!) } catch (_) {}
        try {
          if (time && typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission()
          }
        } catch (_) {}
      },
      onError: () => setSaveError(true),
    })
  }

  const handleStart = (entry: CalendarEntry) => {
    const startedAt = Date.now()
    createLog({
      text: `[START] ${entry.type}: ${entry.text}`,
      event: 'calendar_start',
      metadata: { entryId: entry.id, date: entry.date, startedAt },
    }, { onSuccess: refresh })
  }

  const handleDone = (entry: CalendarEntry) => {
    const doneAt = Date.now()
    const elapsedMin = entry.startedAt ? Math.round((doneAt - entry.startedAt) / 60000) : undefined
    createLog({
      text: `[DONE] ${entry.type}: ${entry.text}${elapsedMin !== undefined ? ` (${elapsedMin}m)` : ''}`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, doneAt, elapsedMin },
    }, { onSuccess: refresh })
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
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40"
                  />
                  <Button onClick={handleAddEntry}>Add</Button>
                </div>
                {saveError && (
                  <div className="text-acc/60 mt-4">SAVE FAILED // RETRY</div>
                )}
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map((e, i) => (
                  <div key={e.id} className="text-acc/80 mb-1">
                    {e.time && <span className="text-acc/40 mr-8 tabular-nums">{e.time}</span>}
                    {e.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-1">
            {activeAlerts.map(({ entry, stage }) => {
              const mins = minutesUntil(entry, now) ?? 0
              return (
                <div
                  key={entry.id}
                  className={cn(
                    'flex justify-between gap-16 border-l-2 pl-8 uppercase tracking-widest',
                    stage === 'T-15' ? 'border-acc/40 text-acc/60' : 'border-acc text-acc',
                    stage !== 'T-15' && 'animate-pulse'
                  )}
                  role="alert"
                >
                  <span className="whitespace-nowrap">
                    {stage === 'T-0' ? 'NOW' : stage === 'OVERDUE' ? 'OVERDUE' : 'STANDBY'}
                    {' // '}{entry.type}{' // '}{entry.text}
                  </span>
                  <span className="tabular-nums whitespace-nowrap">
                    {entry.time} {formatCountdown(mins)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map(entry => {
              const running = !!entry.startedAt && !entry.doneAt
              return (
                <div
                  key={entry.id}
                  className={cn('flex justify-between gap-16', !!entry.doneAt && 'text-acc/30')}
                >
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="ml-8 tabular-nums">{entry.time}</span>}
                  </span>
                  <span className="text-acc text-right flex gap-8 justify-end">
                    <span className={cn(!!entry.doneAt && 'line-through')}>{entry.text}</span>
                    {running && (
                      <span className="tabular-nums text-acc/60">
                        {formatElapsed(now.getTime() - entry.startedAt!)}
                      </span>
                    )}
                    {entry.doneAt && entry.elapsedMin !== undefined && (
                      <span className="tabular-nums">{entry.elapsedMin}m</span>
                    )}
                    {!entry.doneAt && !running && entry.date <= today && (
                      <button
                        className="text-acc/40 hover:text-acc transition-opacity"
                        onClick={() => handleStart(entry)}
                      >
                        start
                      </button>
                    )}
                    {!entry.doneAt && entry.date <= today && (
                      <button
                        className="text-acc/40 hover:text-acc transition-opacity"
                        onClick={() => handleDone(entry)}
                      >
                        done
                      </button>
                    )}
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
