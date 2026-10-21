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
  STAGE_CODE,
  STAGE_LABEL,
  alertKey,
  dueAlerts,
  formatCountdown,
  isValidTime,
  nextTimed,
} from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time?: string
  text: string
  type: EntryType
  done: boolean
}

type ActiveAlert = {
  entryId: string
  stage: AlertStage
  time?: string
  text: string
}

const FIRED_STORAGE_KEY = 'lot-calendar-fired'
const TICK_MS = 15_000

const loadFired = (): Set<string> => {
  try {
    const raw = localStorage.getItem(FIRED_STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]).slice(-500) : [])
  } catch (_) {
    return new Set()
  }
}

const saveFired = (fired: Set<string>) => {
  try { localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify([...fired].slice(-500))) } catch (_) {}
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
  const [now, setNow] = React.useState(() => Date.now())
  const [activeAlerts, setActiveAlerts] = React.useState<ActiveAlert[]>([])
  const [notifyState, setNotifyState] = React.useState<string>('unsupported')
  const firedRef = React.useRef<Set<string> | null>(null)

  // Alert-log lookups: stages already fired and entries acknowledged, from the Log.
  const alertLogState = React.useMemo(() => {
    const fired = new Set<string>()
    const acked = new Set<string>()
    for (const log of logs) {
      if (log.event !== 'calendar_alert' || !log.metadata) continue
      const id = log.metadata.entryId as string | undefined
      const stage = log.metadata.stage as string | undefined
      if (!id || !stage) continue
      if (stage === 'ack') acked.add(id)
      else fired.add(alertKey(id, stage as AlertStage))
    }
    return { fired, acked }
  }, [logs])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => {
        const time = log.metadata?.time as string | undefined
        return {
          id: log.id as string,
          date: log.metadata?.date as string,
          time: isValidTime(time) ? time : undefined,
          text: log.metadata?.text as string || log.text || '',
          type: (log.metadata?.entryType as EntryType) || 'note',
          done: alertLogState.acked.has(log.id as string),
        }
      })
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs, alertLogState])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today && !e.done)
      .slice(0, 10)
  }, [entries])

  const nextEntry = React.useMemo(() => nextTimed(entries, now), [entries, now])

  // Clock tick — drives countdown and alert evaluation.
  React.useEffect(() => {
    setNow(Date.now())
    if (typeof Notification !== 'undefined') setNotifyState(Notification.permission)
    const t = setInterval(() => setNow(Date.now()), TICK_MS)
    const onVisible = () => { if (!document.hidden) setNow(Date.now()) }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // Evaluate alerts. Each (entry, stage) fires once: logged, bannered, notified.
  React.useEffect(() => {
    if (!firedRef.current) firedRef.current = loadFired()
    const fired = firedRef.current
    alertLogState.fired.forEach(k => fired.add(k))

    const due = dueAlerts(entries, now, fired)
    if (due.length === 0) return

    const fresh: ActiveAlert[] = []
    for (const a of due) {
      fired.add(a.key)
      fresh.push({ entryId: a.entry.id, stage: a.stage, time: a.entry.time, text: a.entry.text })

      createLog({
        text: `[${STAGE_CODE[a.stage]}] ${STAGE_LABEL[a.stage]} ${a.entry.time} — ${a.entry.text}`,
        event: 'calendar_alert',
        metadata: {
          entryId: a.entry.id,
          stage: a.stage,
          date: a.entry.date,
          time: a.entry.time,
          text: a.entry.text,
        },
      })

      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${STAGE_CODE[a.stage]} ${STAGE_LABEL[a.stage]}`, {
            body: `${a.entry.time} ${a.entry.text}`,
            tag: a.key,
          })
        }
      } catch (_) {}
    }
    saveFired(fired)
    setActiveAlerts(prev => [...prev.filter(p => !fresh.some(f => f.entryId === p.entryId)), ...fresh])
  }, [entries, now, alertLogState, createLog])

  const handleAck = (entryId: string) => {
    setActiveAlerts(prev => prev.filter(a => a.entryId !== entryId))
    const entry = entries.find(e => e.id === entryId)
    createLog({
      text: `[ACK] ${entry?.time || ''} ${entry?.text || ''}`.trim(),
      event: 'calendar_alert',
      metadata: { entryId, stage: 'ack', date: entry?.date, time: entry?.time, text: entry?.text },
    }, {
      onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
    })
  }

  const handleEnableNotify = async () => {
    try {
      const result = await Notification.requestPermission()
      setNotifyState(result)
    } catch (_) {}
  }

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

    const time = isValidTime(entryTime) ? entryTime : undefined

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
        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-1" role="alert">
            {activeAlerts.map(a => (
              <div key={a.entryId} className="flex justify-between gap-16 text-acc">
                <span className="whitespace-nowrap tabular-nums">
                  <span className={cn('mr-8', a.stage !== 'standby' && 'animate-pulse')}>
                    {STAGE_CODE[a.stage]}
                  </span>
                  {STAGE_LABEL[a.stage]} {a.time}
                </span>
                <span className="text-right">
                  {a.text}{' '}
                  <button
                    className="text-acc/40 hover:text-acc transition-opacity"
                    onClick={() => handleAck(a.entryId)}
                  >
                    [ACK]
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}

        {nextEntry && (
          <div className="mb-16 flex justify-between gap-16 text-acc/60">
            <span className="tabular-nums whitespace-nowrap">
              {formatCountdown(nextEntry.startMs, now)}
            </span>
            <span className="text-right">{nextEntry.time} {nextEntry.text}</span>
          </div>
        )}

        <div className="mb-16 flex items-center gap-16">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          {notifyState === 'default' && (
            <button
              className="text-acc/30 hover:text-acc/60 transition-opacity"
              onClick={handleEnableNotify}
            >
              Enable alerts
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
                  <div key={i} className={cn('text-acc/80 mb-1', e.done && 'line-through opacity-50')}>
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
            {upcomingEntries.map((entry, i) => (
              <div key={i} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                </span>
                <span className="text-acc text-right">
                  {entry.time && <span className="tabular-nums text-acc/60 mr-8">{entry.time}</span>}
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
