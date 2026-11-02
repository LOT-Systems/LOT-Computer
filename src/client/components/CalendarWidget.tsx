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
  time: string | null // 'HH:mm' 24h, null = all-day
  text: string
  type: EntryType
}

// Alert stages: minutes before the event. Order = escalation.
const ALERT_STAGES = [15, 5, 0] as const
type AlertStage = (typeof ALERT_STAGES)[number]
const ALERT_GRACE_MIN = 30 // still alert up to 30 min after start, then stale
const TICK_MS = 15_000
const FIRED_KEY = 'lot.calendar.fired.v1'

type ActiveAlert = { key: string; entry: CalendarEntry; stage: AlertStage; at: number }

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function entryMoment(e: CalendarEntry): Dayjs | null {
  if (!e.time) return null
  return dayjs(`${e.date}T${e.time}:00`) // no tz suffix = local time
}

function readFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch (_) {
    return new Set()
  }
}

function writeFired(set: Set<string>) {
  try {
    // keep bounded
    localStorage.setItem(FIRED_KEY, JSON.stringify([...set].slice(-300)))
  } catch (_) {}
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
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

function ensureNotificationPermission() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  } catch (_) {}
}

function notifyOs(a: ActiveAlert) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    if (document.visibilityState === 'visible') return // in-widget banner is enough
    const label = a.stage === 0 ? 'T-0' : `T-${a.stage}`
    new Notification(`${label} · ${a.entry.time} · ${a.entry.type.toUpperCase()}`, {
      body: a.entry.text,
      tag: a.key,
    })
  } catch (_) {}
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
  const entriesRef = React.useRef<CalendarEntry[]>([])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: String(log.id),
        date: log.metadata?.date as string,
        time: TIME_RE.test(String(log.metadata?.time || '')) ? (log.metadata?.time as string) : null,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) =>
        a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '')
      )
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const todayKey = dayjs(now).format('YYYY-MM-DD')
    const cutoff = now - ALERT_GRACE_MIN * 60_000
    return entries
      .filter(e => {
        if (e.date > todayKey) return true
        if (e.date < todayKey) return false
        const m = entryMoment(e)
        return !m || m.valueOf() >= cutoff
      })
      .slice(0, 10)
    // minute-resolution refresh is enough
  }, [entries, Math.floor(now / 60_000)])

  const nextTimed = React.useMemo(() => {
    for (const e of entries) {
      const m = entryMoment(e)
      if (m && m.valueOf() > now) return { entry: e, at: m.valueOf() }
    }
    return null
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

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const time = TIME_RE.test(entryTime) ? entryTime : null
    if (time) ensureNotificationPermission()

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ' ' + time : ''})`,
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

  // ── Alert engine ────────────────────────────────────────────────────────
  React.useEffect(() => { entriesRef.current = entries }, [entries])

  React.useEffect(() => {
    if (!firedRef.current) firedRef.current = readFired()
    const tick = () => {
      const t = Date.now()
      setNow(t)
      const fired = firedRef.current!
      const fresh: ActiveAlert[] = []
      for (const e of entriesRef.current) {
        const m = entryMoment(e)
        if (!m) continue
        const start = m.valueOf()
        if (t > start + ALERT_GRACE_MIN * 60_000) continue // stale
        // latest stage whose trigger time has passed
        let due: AlertStage | null = null
        for (const st of ALERT_STAGES) if (t >= start - st * 60_000) due = st
        if (due === null) continue
        const key = `${e.id}:${due}`
        if (fired.has(key)) continue
        // mark this and all earlier stages fired (no catch-up spam)
        for (const st of ALERT_STAGES) {
          fired.add(`${e.id}:${st}`)
          if (st === due) break
        }
        fresh.push({ key, entry: e, stage: due, at: t })
      }
      if (!fresh.length) return
      writeFired(fired)
      setAlerts(prev => [...fresh, ...prev].slice(0, 5))
      fresh.forEach(a => {
        const label = a.stage === 0 ? 'T-0 NOW' : `T-${a.stage} MIN`
        createLog({
          text: `[CAL ALERT] ${label} · ${a.entry.type}: ${a.entry.text} (${a.entry.date} ${a.entry.time})`,
          event: 'calendar_alert',
          metadata: {
            entryId: a.entry.id,
            stage: a.stage,
            date: a.entry.date,
            time: a.entry.time,
            entryType: a.entry.type,
            text: a.entry.text,
          },
        })
        notifyOs(a)
      })
    }
    tick()
    const id = window.setInterval(tick, TICK_MS)
    const onVis = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ackAlert = (key: string) => setAlerts(prev => prev.filter(a => a.key !== key))

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

        {alerts.length > 0 && (
          <div className="mb-16 space-y-1" role="alert" aria-live="assertive">
            {alerts.map(a => (
              <div
                key={a.key}
                className={cn(
                  'flex items-center justify-between gap-16 border px-8 py-4 uppercase tracking-widest tabular-nums',
                  a.stage === 0 ? 'border-acc text-acc animate-pulse' : 'border-acc/40 text-acc/80'
                )}
              >
                <span className="min-w-0 truncate">
                  {a.stage === 0 ? 'T-0' : `T-${String(a.stage).padStart(2, '0')}`}
                  {' · '}{a.entry.time}{' · '}{a.entry.type}{' · '}{a.entry.text}
                </span>
                <button
                  className="text-acc/60 hover:text-acc whitespace-nowrap"
                  onClick={() => ackAlert(a.key)}
                >
                  ACK
                </button>
              </div>
            ))}
          </div>
        )}

        {nextTimed && nextTimed.at - now < 24 * 3600_000 && (
          <div className="mb-16 text-acc/40 uppercase tracking-widest tabular-nums">
            NEXT T-{formatCountdown(nextTimed.at - now)}
            {' · '}{nextTimed.entry.time}{' · '}{nextTimed.entry.text}
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
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    aria-label="Time (optional)"
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40 tabular-nums"
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
                  {entry.time && <span className="tabular-nums"> {entry.time}</span>}
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
