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
  time: string | null // 'HH:mm' local, optional
  text: string
  type: EntryType
  done: boolean
}

// Alert ladder — minutes remaining until start → stage code.
// Each stage fires once per entry, is logged to Log, and shown in the widget.
type AlertStage = 'T-15' | 'T-05' | 'T-00' | 'MISSED'

const STAGE_LABEL: Record<AlertStage, string> = {
  'T-15': 'STANDBY',
  'T-05': 'ARMED',
  'T-00': 'EXECUTE',
  MISSED: 'MISSED',
}

const TICK_MS = 15_000
const FIRED_KEY = 'lot_cal_fired_v1'
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function startOf(e: { date: string; time: string | null }): Dayjs | null {
  if (!e.time) return null
  const d = dayjs(`${e.date} ${e.time}`)
  return d.isValid() ? d : null
}

function stageFor(start: Dayjs, now: Dayjs): AlertStage | null {
  const rem = start.diff(now, 'second') / 60
  if (rem <= -1440) return null
  if (rem <= -5) return 'MISSED'
  if (rem <= 0) return 'T-00'
  if (rem <= 5) return 'T-05'
  if (rem <= 15) return 'T-15'
  return null
}

function readFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch (_) {
    return new Set()
  }
}

function writeFired(set: Set<string>) {
  try {
    // keep only the most recent 200 keys
    localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(set).slice(-200)))
  } catch (_) {}
}

function countdown(start: Dayjs, now: Dayjs): string {
  const sec = start.diff(now, 'second')
  const sign = sec < 0 ? '+' : '-'
  const a = Math.abs(sec)
  const h = Math.floor(a / 3600)
  const m = Math.floor((a % 3600) / 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `T${sign}${pad(h)}:${pad(m)}`
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
  const [now, setNow] = React.useState(() => dayjs())
  const [locallyDone, setLocallyDone] = React.useState<Set<string>>(() => new Set())
  const firedRef = React.useRef<Set<string>>(new Set())

  const doneIds = React.useMemo(() => {
    const set = new Set<string>(locallyDone)
    logs.forEach(log => {
      if (log.event === 'calendar_done' && log.metadata?.entryId) {
        set.add(log.metadata.entryId as string)
      }
    })
    return set
  }, [logs, locallyDone])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => {
        const t = log.metadata?.time as string | undefined
        return {
          id: String(log.id),
          date: log.metadata?.date as string,
          time: t && TIME_RE.test(t) ? t : null,
          text: log.metadata?.text as string || log.text || '',
          type: (log.metadata?.entryType as EntryType) || 'note',
          done: doneIds.has(String(log.id)),
        }
      })
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '99:99')).localeCompare(b.date + (b.time || '99:99')))
  }, [logs, doneIds])

  // Heartbeat — drives countdowns and alert ladder
  React.useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), TICK_MS)
    const onVis = () => { if (!document.hidden) setNow(dayjs()) }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // Active alerts: today's open timed entries that have entered the ladder
  const activeAlerts = React.useMemo(() => {
    return entries
      .filter(e => !e.done && e.time)
      .map(e => {
        const start = startOf(e)
        const stage = start ? stageFor(start, now) : null
        return start && stage ? { entry: e, start, stage } : null
      })
      .filter(Boolean) as { entry: CalendarEntry; start: Dayjs; stage: AlertStage }[]
  }, [entries, now])

  // Fire each stage once → Log + (optional) system notification
  React.useEffect(() => {
    if (!firedRef.current.size) firedRef.current = readFired()
    // Already-logged alerts survive reloads / other devices
    logs.forEach(l => {
      if (l.event === 'calendar_alert' && l.metadata?.entryId && l.metadata?.stage) {
        firedRef.current.add(`${l.metadata.entryId}:${l.metadata.stage}`)
      }
    })
    let changed = false
    activeAlerts.forEach(({ entry, stage }) => {
      const key = `${entry.id}:${stage}`
      if (firedRef.current.has(key)) return
      firedRef.current.add(key)
      changed = true
      const label = STAGE_LABEL[stage]
      const when = entry.time as string
      createLog({
        text: `[ALERT] ${stage} ${label} — ${entry.type.toUpperCase()} ${when} ${entry.text}`,
        event: 'calendar_alert',
        metadata: { entryId: entry.id, stage, date: entry.date, time: when, entryType: entry.type, text: entry.text },
      })
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${stage} ${label}`, { body: `${when} · ${entry.text}`, tag: key })
        }
      } catch (_) {}
    })
    if (changed) writeFired(firedRef.current)
  }, [activeAlerts, logs, createLog])

  const upcomingEntries = React.useMemo(() => {
    const todayKey = now.format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= todayKey)
      .slice(0, 10)
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
    const time = TIME_RE.test(entryTime) ? entryTime : null

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}${time ? ' ' + time : ''}: ${entryText.trim()} (${dateLabel})`,
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

    // Timed entries: ask once for system-notification permission (user gesture)
    try {
      if (time && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch (_) {}

    setEntryText('')
    setEntryTime('')
    setIsAddingEntry(false)
  }

  const handleComplete = (entry: CalendarEntry) => {
    if (entry.done) return
    setLocallyDone(prev => new Set(prev).add(entry.id))
    createLog({
      text: `[DONE] ${entry.type.toUpperCase()}${entry.time ? ' ' + entry.time : ''} ${entry.text}`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, time: entry.time, entryType: entry.type, text: entry.text },
    }, {
      onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
    })
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
                  <div key={e.id} className={cn('mb-1', e.done ? 'text-acc/30 line-through' : 'text-acc/80')}>
                    {e.time && <span className="tabular-nums mr-8">{e.time}</span>}
                    {e.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-1" role="status" aria-live="polite">
            {activeAlerts.map(({ entry, start, stage }) => (
              <button
                key={entry.id}
                onClick={() => handleComplete(entry)}
                title="Mark done"
                className={cn(
                  'flex w-full justify-between gap-16 text-left tabular-nums',
                  stage === 'T-00' && 'text-acc animate-pulse',
                  stage === 'T-05' && 'text-acc',
                  stage === 'T-15' && 'text-acc/70',
                  stage === 'MISSED' && 'text-acc/40',
                )}
              >
                <span className="whitespace-nowrap">
                  ▸ {stage} {STAGE_LABEL[stage]} · {countdown(start, now)}
                </span>
                <span className="text-right">
                  {entry.time} {entry.text}
                </span>
              </button>
            ))}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map(entry => (
              <div
                key={entry.id}
                className={cn('flex justify-between gap-16', entry.done && 'text-acc/30 line-through')}
              >
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time && <span className="tabular-nums"> · {entry.time}</span>}
                </span>
                <span className="text-acc text-right">
                  {entry.type !== 'note' && <span className="text-acc/40 mr-8 uppercase">{entry.type}</span>}
                  {!entry.done ? (
                    <button
                      className="hover:opacity-60 transition-opacity text-right"
                      title="Mark done"
                      onClick={() => handleComplete(entry)}
                    >
                      {entry.text}
                    </button>
                  ) : entry.text}
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
