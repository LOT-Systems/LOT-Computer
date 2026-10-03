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
  time: string | null // HH:mm local, null = all-day
  text: string
  type: EntryType
}

type AlertStage = 'T-15' | 'T-0' | 'MISSED'

type ActiveAlert = {
  key: string
  entry: CalendarEntry
  stage: AlertStage
}

const PRE_ALERT_MIN = 15
const MISSED_WINDOW_MIN = 120
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const ACK_STORAGE = 'lot-calendar-fired'

const STAGE_LABEL: Record<AlertStage, string> = {
  'T-15': 'PRE-ALERT T-15',
  'T-0': 'ZERO HOUR',
  'MISSED': 'MISSED',
}

function eventMoment(e: CalendarEntry): Dayjs | null {
  if (!e.time) return null
  const d = dayjs(`${e.date}T${e.time}:00`)
  return d.isValid() ? d : null
}

function formatCountdown(ms: number): string {
  const sign = ms < 0 ? '+' : '-'
  const total = Math.floor(Math.abs(ms) / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (h >= 24) return `T${sign}${Math.floor(h / 24)}D ${pad(h % 24)}H`
  return `T${sign}${pad(h)}:${pad(m)}:${pad(s)}`
}

function readFired(): Set<string> {
  try {
    const raw = localStorage.getItem(ACK_STORAGE)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch (_) {
    return new Set()
  }
}

function writeFired(set: Set<string>) {
  try {
    // keep the most recent 300 keys
    localStorage.setItem(ACK_STORAGE, JSON.stringify(Array.from(set).slice(-300)))
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

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [entryTime, setEntryTime] = React.useState('')
  const [now, setNow] = React.useState(() => Date.now())
  const [alerts, setAlerts] = React.useState<ActiveAlert[]>([])
  const firedRef = React.useRef<Set<string> | null>(null)

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        date: log.metadata?.date as string,
        time: TIME_RE.test(String(log.metadata?.time ?? '')) ? (log.metadata?.time as string) : null,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs])

  // Alerts already recorded in Log (survives reloads and other devices)
  const loggedAlertKeys = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.entryId) {
        set.add(`${log.metadata.entryId}:${log.metadata.stage}`)
      }
    })
    return set
  }, [logs])

  // Clock: 1s when an event is near, otherwise 20s
  const nextTimedMs = React.useMemo(() => {
    for (const e of entries) {
      const m = eventMoment(e)
      if (m && m.valueOf() > now - MISSED_WINDOW_MIN * 60000) return m.valueOf() - now
    }
    return null
  }, [entries, now])
  const tickMs = nextTimedMs !== null && nextTimedMs < 3600000 ? 1000 : 20000
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), tickMs)
    return () => clearInterval(id)
  }, [tickMs])

  // Alert engine: fire each (entry, stage) once, record it in Log
  React.useEffect(() => {
    if (!firedRef.current) firedRef.current = readFired()
    const fired = firedRef.current
    const fresh: ActiveAlert[] = []

    for (const entry of entries) {
      const m = eventMoment(entry)
      if (!m) continue
      const diffMin = (m.valueOf() - now) / 60000
      let stage: AlertStage | null = null
      if (diffMin <= -MISSED_WINDOW_MIN) continue
      if (diffMin <= -1) stage = 'MISSED'
      else if (diffMin <= 0.25) stage = 'T-0'
      else if (diffMin <= PRE_ALERT_MIN) stage = 'T-15'
      if (!stage) continue

      const key = `${entry.id}:${stage}`
      if (fired.has(key) || loggedAlertKeys.has(key)) continue
      fired.add(key)
      // a later stage supersedes earlier ones that were never shown
      if (stage !== 'T-15') fired.add(`${entry.id}:T-15`)
      if (stage === 'MISSED') fired.add(`${entry.id}:T-0`)
      fresh.push({ key, entry, stage })
    }

    if (fresh.length === 0) return
    writeFired(fired)
    setAlerts(prev => [...prev.filter(a => !fresh.some(f => f.entry.id === a.entry.id)), ...fresh])

    fresh.forEach(({ entry, stage }) => {
      createLog({
        text: `[ALERT ${STAGE_LABEL[stage]}] ${entry.type}: ${entry.text} (${entry.date} ${entry.time})`,
        event: 'calendar_alert',
        metadata: {
          entryId: entry.id,
          stage,
          date: entry.date,
          time: entry.time,
          entryType: entry.type,
        },
      }, {
        onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
      })
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${STAGE_LABEL[stage]} · ${entry.time}`, {
            body: `${entry.type.toUpperCase()}: ${entry.text}`,
            tag: `lot-cal-${entry.id}`,
          })
        }
      } catch (_) {}
    })
  }, [entries, now, loggedAlertKeys, createLog, queryClient])

  const dismissAlert = (key: string) => setAlerts(prev => prev.filter(a => a.key !== key))

  const [notifPermission, setNotifPermission] = React.useState<string>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const enableNotifications = () => {
    try {
      Notification.requestPermission().then(p => setNotifPermission(p))
    } catch (_) {}
  }

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today)
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

    const time = TIME_RE.test(entryTime) ? entryTime : null
    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY') + (time ? ` ${time}` : '')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel})`,
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
        {alerts.length > 0 && (
          <div className="mb-16 space-y-4" role="alert" aria-live="assertive">
            {alerts.map(a => (
              <div
                key={a.key}
                className={cn(
                  'flex items-baseline justify-between gap-16 border-l-2 pl-8 uppercase tracking-widest',
                  a.stage === 'MISSED' ? 'border-acc/30 text-acc/50' : 'border-acc text-acc',
                  a.stage === 'T-0' && 'animate-pulse',
                )}
              >
                <span className="min-w-0">
                  <span className="tabular-nums">{a.entry.time}</span>
                  {' // '}{STAGE_LABEL[a.stage]}{' // '}{a.entry.type}{' // '}
                  <span className="normal-case tracking-normal">{a.entry.text}</span>
                </span>
                <button
                  className="text-acc/60 hover:text-acc whitespace-nowrap"
                  onClick={() => dismissAlert(a.key)}
                >
                  ACK
                </button>
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
            {upcomingEntries.map((entry, i) => {
              const m = eventMoment(entry)
              const diff = m ? m.valueOf() - now : null
              const showClock = diff !== null && diff < 24 * 3600000
              return (
                <div key={entry.id || i} className="flex justify-between gap-16">
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="text-acc/60">{' '}{entry.time}</span>}
                  </span>
                  <span className="text-acc text-right">
                    {showClock && diff !== null && (
                      <span className="text-acc/40 tabular-nums mr-8">{formatCountdown(diff)}</span>
                    )}
                    {entry.text}
                  </span>
                </div>
              )
            })}
            {notifPermission === 'default' && (
              <button
                className="text-acc/30 hover:text-acc/60 transition-opacity mt-8"
                onClick={enableNotifications}
              >
                Enable system alerts
              </button>
            )}
          </div>
        )}

        {upcomingEntries.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
