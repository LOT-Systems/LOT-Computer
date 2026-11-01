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
  time: string | null // HH:mm, optional
  text: string
  type: EntryType
}

type AlertStage = 'T-15' | 'T-0' | 'MISSED'

type ActiveAlert = {
  key: string
  stage: AlertStage
  entry: CalendarEntry
}

const ALERT_STORE = 'lot.calendar.alerts.v1'
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const MISSED_WINDOW_MIN = 120

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(ALERT_STORE)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch (_) {
    return new Set()
  }
}

function saveFired(set: Set<string>) {
  try {
    // keep the store bounded
    localStorage.setItem(ALERT_STORE, JSON.stringify(Array.from(set).slice(-300)))
  } catch (_) {}
}

function entryMoment(e: CalendarEntry): Dayjs | null {
  if (!e.time) return null
  const d = dayjs(`${e.date} ${e.time}`, 'YYYY-MM-DD HH:mm')
  return d.isValid() ? d : null
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `T-${pad(h)}:${pad(m)}:${pad(s)}`
}

const STAGE_LABEL: Record<AlertStage, string> = {
  'T-15': 'STANDBY T-15',
  'T-0': 'EXECUTE T-0',
  MISSED: 'MISSED',
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
  const [alerts, setAlerts] = React.useState<ActiveAlert[]>([])
  const firedRef = React.useRef<Set<string>>(loadFired())

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => {
        const t = log.metadata?.time as string | undefined
        return {
          id: log.id,
          date: log.metadata?.date as string,
          time: t && TIME_RE.test(t) ? t : null,
          text: log.metadata?.text as string || log.text || '',
          type: (log.metadata?.entryType as EntryType) || 'note',
        }
      })
      .filter(e => e.date && e.text)
      .sort((a, b) =>
        a.date.localeCompare(b.date) || (a.time ?? '99:99').localeCompare(b.time ?? '99:99')
      )
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const today = now.format('YYYY-MM-DD')
    return entries
      .filter(e => {
        if (e.date > today) return true
        if (e.date < today) return false
        const m = entryMoment(e)
        return !m || m.isAfter(now.subtract(1, 'minute'))
      })
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

  // Clock tick — 1s while a timed entry is within the next 24h, else 15s
  const hasNearTimed = React.useMemo(() => {
    const limit = now.add(24, 'hour')
    return entries.some(e => {
      const m = entryMoment(e)
      return m && m.isAfter(now.subtract(MISSED_WINDOW_MIN, 'minute')) && m.isBefore(limit)
    })
  }, [entries, now])

  React.useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), hasNearTimed ? 1000 : 15000)
    return () => clearInterval(id)
  }, [hasNearTimed])

  // Alert engine — T-15, T-0, and MISSED (late open, within window). Each fires once.
  React.useEffect(() => {
    const fresh: ActiveAlert[] = []
    for (const e of entries) {
      const m = entryMoment(e)
      if (!m) continue
      const diffMin = m.diff(now, 'minute', true)
      let stage: AlertStage | null = null
      if (diffMin <= 0 && diffMin > -1) stage = 'T-0'
      else if (diffMin <= -1 && diffMin > -MISSED_WINDOW_MIN) stage = 'MISSED'
      else if (diffMin > 0 && diffMin <= 15) stage = 'T-15'
      if (!stage) continue
      const key = `${e.id}:${stage}`
      // MISSED is moot once T-0 has fired live
      if (firedRef.current.has(key)) continue
      if (stage === 'MISSED' && firedRef.current.has(`${e.id}:T-0`)) {
        firedRef.current.add(key)
        continue
      }
      firedRef.current.add(key)
      fresh.push({ key, stage, entry: e })
    }
    if (fresh.length === 0) return
    saveFired(firedRef.current)
    setAlerts(prev => [...fresh, ...prev].slice(0, 5))
    fresh.forEach(a => {
      createLog({
        text: `[ALERT ${a.stage}] ${a.entry.type.toUpperCase()} ${a.entry.time} — ${a.entry.text}`,
        event: 'calendar_alert',
        metadata: {
          stage: a.stage,
          entryId: a.entry.id,
          date: a.entry.date,
          time: a.entry.time,
          entryType: a.entry.type,
          text: a.entry.text,
        },
      }, {
        onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
      })
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${STAGE_LABEL[a.stage]} · ${a.entry.time}`, { body: a.entry.text })
        }
      } catch (_) {}
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, entries])

  const dismissAlert = (key: string) => setAlerts(prev => prev.filter(a => a.key !== key))

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
    const time = TIME_RE.test(entryTime) ? entryTime : null

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

    if (time) {
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission()
        }
      } catch (_) {}
    }

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
        {alerts.length > 0 && (
          <div className="mb-16 space-y-1" role="alert">
            {alerts.map(a => (
              <button
                key={a.key}
                onClick={() => dismissAlert(a.key)}
                className={cn(
                  'flex w-full justify-between gap-16 text-left border-l-2 pl-8 transition-opacity hover:opacity-70',
                  a.stage === 'T-0' ? 'border-acc text-acc animate-pulse' : 'border-acc/40 text-acc/80',
                )}
                title="Acknowledge"
              >
                <span className="whitespace-nowrap tracking-widest uppercase">
                  {STAGE_LABEL[a.stage]} · {a.entry.time}
                </span>
                <span className="text-right">
                  {a.entry.type.toUpperCase()} // {a.entry.text}
                </span>
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
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    aria-label="Time (optional)"
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
                {entriesOnDate.map((e, i) => (
                  <div key={i} className="text-acc/80 mb-1">
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
              <div key={entry.id} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time && <span className="text-acc/60 tabular-nums"> {entry.time}</span>}
                </span>
                <span className="text-acc text-right">
                  {(() => {
                    const m = entryMoment(entry)
                    const ms = m ? m.diff(now) : -1
                    return m && ms > 0 && ms < 24 * 3600 * 1000 ? (
                      <span className="text-acc/50 tabular-nums mr-8">{formatCountdown(ms)}</span>
                    ) : null
                  })()}
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
