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
  normalizeTime,
  alertLevel,
  alertKey,
  formatCountdown,
  formatDuration,
  loadFired,
  saveFired,
  loadTracker,
  saveTracker,
  playAlertTone,
} from '#client/utils/calendar'
import type { EntryType, AlertLevel, CalendarEntry, ActiveTracker } from '#client/utils/calendar'

type ActiveAlert = { entry: CalendarEntry; level: AlertLevel }

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
  const [now, setNow] = React.useState(() => Date.now())
  const [tracker, setTracker] = React.useState<ActiveTracker | null>(() => loadTracker())
  const [dismissed, setDismissed] = React.useState<Set<string>>(() => new Set())
  const firedRef = React.useRef<Set<string>>(loadFired())

  const entries = React.useMemo<CalendarEntry[]>(() => buildEntries(logs), [logs])

  // Clock tick — 1s while tracking (live timer), 15s otherwise (alert polling)
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), tracker ? 1000 : 15000)
    return () => clearInterval(id)
  }, [tracker])

  // Alert engine — each (entry, level) fires once per browser: tone + Log record
  const activeAlerts = React.useMemo<ActiveAlert[]>(() => {
    const out: ActiveAlert[] = []
    for (const entry of entries) {
      const level = alertLevel(entry, now)
      if (level) out.push({ entry, level })
    }
    return out
  }, [entries, now])

  React.useEffect(() => {
    let changed = false
    for (const { entry, level } of activeAlerts) {
      const key = alertKey(entry, level)
      if (firedRef.current.has(key)) continue
      firedRef.current.add(key)
      changed = true
      playAlertTone(level)
      createLog({
        text: `[ALERT ${level}] ${entry.type}: ${entry.text} (${entry.time})`,
        event: 'calendar_alert',
        metadata: { entryId: entry.id, level, date: entry.date, time: entry.time, entryType: entry.type },
      })
    }
    if (changed) saveFired(firedRef.current)
  }, [activeAlerts])

  const visibleAlerts = activeAlerts.filter(a => !dismissed.has(alertKey(a.entry, a.level)))

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today && !e.done)
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
    if (!selectedDate || !entryText.trim()) return

    const time = entryTime.trim() ? normalizeTime(entryTime) : null
    if (entryTime.trim() && !time) return // invalid HH:mm — keep the form open

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
      onSuccess: () => {
        queryClient.refetchQueries(['/api/logs'])
        try { recordCalendarSignal(entryType, selectedDate!) } catch (_) {}
      },
    })

    setEntryText('')
    setEntryTime('')
    setIsAddingEntry(false)
  }

  const logDone = (entry: CalendarEntry, completed: boolean, trackedMin: number) => {
    createLog({
      text: `[${completed ? 'DONE' : 'TRACKED'}] ${entry.type}: ${entry.text}${trackedMin ? ` (${trackedMin} min)` : ''}`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, completed, trackedMin, date: entry.date, entryType: entry.type },
    }, {
      onSuccess: () => queryClient.refetchQueries(['/api/logs']),
    })
  }

  const handleStartTracking = (entry: CalendarEntry) => {
    const t = { entryId: entry.id, startedAt: Date.now() }
    saveTracker(t)
    setTracker(t)
  }

  const handleStopTracking = () => {
    if (!tracker) return
    const entry = entries.find(e => e.id === tracker.entryId)
    const minutes = Math.round((Date.now() - tracker.startedAt) / 60000)
    saveTracker(null)
    setTracker(null)
    if (entry && minutes > 0) logDone(entry, false, minutes)
  }

  const handleComplete = (entry: CalendarEntry) => {
    // Completing the entry being tracked also banks its running time
    let minutes = 0
    if (tracker?.entryId === entry.id) {
      minutes = Math.round((Date.now() - tracker.startedAt) / 60000)
      saveTracker(null)
      setTracker(null)
    }
    logDone(entry, true, minutes)
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
        {visibleAlerts.length > 0 && (
          <div className="mb-16 space-y-1">
            {visibleAlerts.map(({ entry, level }) => (
              <div
                key={alertKey(entry, level)}
                className={cn(
                  'flex justify-between gap-16 uppercase tracking-widest border-l-2 pl-8',
                  level === 'T-15' ? 'border-acc/40 text-acc/60' : 'border-acc text-acc',
                  level !== 'T-15' && level !== 'T-05' && 'font-bold',
                )}
              >
                <span className="whitespace-nowrap tabular-nums">
                  {level === 'OVERDUE' ? '!!' : '▌'} {formatCountdown(entry, now)} · {entry.type} · {entry.time}
                </span>
                <span className="flex gap-8 items-baseline">
                  <span className="text-right normal-case tracking-normal">{entry.text}</span>
                  <button
                    className="text-acc/40 hover:text-acc transition-opacity"
                    onClick={() => setDismissed(new Set(dismissed).add(alertKey(entry, level)))}
                  >
                    ACK
                  </button>
                </span>
              </div>
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
                    type="text"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    maxLength={5}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 w-[5.5em] outline-none focus:border-acc/40 tabular-nums"
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
                  <div key={e.id || i} className={cn('text-acc/80 mb-1', e.done && 'line-through opacity-50')}>
                    {e.time && <span className="tabular-nums text-acc/40">{e.time} </span>}
                    {e.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry, i) => {
              const isTracking = tracker?.entryId === entry.id
              return (
                <div key={entry.id || i} className="flex justify-between gap-16">
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="tabular-nums"> · {entry.time}</span>}
                  </span>
                  <span className="text-acc text-right">
                    {entry.text}
                    {entry.trackedMin > 0 && (
                      <span className="text-acc/40 tabular-nums"> {entry.trackedMin}m</span>
                    )}
                    <span className="text-acc/40 whitespace-nowrap">
                      {isTracking ? (
                        <button className="ml-8 text-acc hover:text-acc/60 tabular-nums" onClick={handleStopTracking}>
                          ■ {formatDuration((now - tracker!.startedAt) / 1000)}
                        </button>
                      ) : (
                        !tracker && (
                          <button className="ml-8 hover:text-acc transition-opacity" onClick={() => handleStartTracking(entry)}>
                            ▶
                          </button>
                        )
                      )}
                      <button className="ml-8 hover:text-acc transition-opacity" onClick={() => handleComplete(entry)}>
                        ✓
                      </button>
                    </span>
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
