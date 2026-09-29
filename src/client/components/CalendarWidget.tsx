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
  time: string | null // 'HH:mm' local, null = all-day
  text: string
  type: EntryType
}

// Alert stages, most urgent first. `at` = seconds relative to event start.
type AlertStage = 'T15' | 'T5' | 'T0' | 'MISSED'

const STAGES: { stage: AlertStage; at: number; label: string }[] = [
  { stage: 'MISSED', at: 60, label: 'MISSED' },
  { stage: 'T0', at: 0, label: 'EXECUTE' },
  { stage: 'T5', at: -300, label: 'WARNING' },
  { stage: 'T15', at: -900, label: 'ADVISORY' },
]
const MISSED_WINDOW = 3600 // stop raising alerts for events older than 1h
const TICK_MS = 1000

type ActiveAlert = { key: string; entry: CalendarEntry; stage: AlertStage; label: string }

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function entryStart(e: CalendarEntry): Dayjs | null {
  if (!e.time) return null
  const d = dayjs(`${e.date} ${e.time}`, 'YYYY-MM-DD HH:mm')
  return d.isValid() ? d : null
}

function formatCountdown(sec: number): string {
  const sign = sec < 0 ? '+' : '-'
  const a = Math.abs(sec)
  const h = Math.floor(a / 3600)
  const m = Math.floor((a % 3600) / 60)
  const s = a % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `T${sign}${h > 0 ? pad(h) + ':' : ''}${pad(m)}:${pad(s)}`
}

function currentStage(secToStart: number): typeof STAGES[number] | null {
  // secToStart > 0 = future. elapsed = -secToStart.
  const elapsed = -secToStart
  if (elapsed > MISSED_WINDOW) return null
  return STAGES.find(s => elapsed >= s.at) || null
}

const ACK_STORAGE_KEY = 'lot_calendar_alerts_v1'

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(ACK_STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch (_) {
    return new Set()
  }
}

function saveFired(set: Set<string>) {
  try {
    localStorage.setItem(ACK_STORAGE_KEY, JSON.stringify(Array.from(set).slice(-300)))
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
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs])

  // ── Clock + alert engine ────────────────────────────────────────────
  const [now, setNow] = React.useState(() => dayjs())
  const firedRef = React.useRef<Set<string> | null>(null)
  const [ackd, setAckd] = React.useState<Set<string>>(() => new Set())

  React.useEffect(() => {
    // Wall-clock aligned tick; also re-sync on tab wake so nothing is skipped.
    const tick = () => setNow(dayjs())
    const id = setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  // Keys already logged server-side (survives device/localStorage loss).
  const loggedKeys = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(l => {
      if (l.event === 'calendar_alert' && l.metadata?.key) set.add(String(l.metadata.key))
    })
    return set
  }, [logs])

  const activeAlerts = React.useMemo<ActiveAlert[]>(() => {
    const out: ActiveAlert[] = []
    for (const e of entries) {
      const start = entryStart(e)
      if (!start) continue
      const stage = currentStage(start.diff(now, 'second'))
      if (!stage) continue
      out.push({ key: `${e.id}:${stage.stage}`, entry: e, stage: stage.stage, label: stage.label })
    }
    return out
  }, [entries, now])

  // Log each new alert exactly once.
  React.useEffect(() => {
    if (!firedRef.current) firedRef.current = loadFired()
    const fired = firedRef.current
    let changed = false
    for (const a of activeAlerts) {
      if (fired.has(a.key) || loggedKeys.has(a.key)) continue
      fired.add(a.key)
      changed = true
      const start = entryStart(a.entry)
      createLog({
        text: `[${a.label}] ${a.entry.type}: ${a.entry.text} (${a.entry.date} ${a.entry.time})`,
        event: 'calendar_alert',
        metadata: {
          key: a.key,
          entryId: a.entry.id,
          stage: a.stage,
          entryType: a.entry.type,
          date: a.entry.date,
          time: a.entry.time,
          offsetSec: start ? now.diff(start, 'second') : 0,
        },
      }, {
        onError: () => {
          // Allow retry on next tick if the write failed.
          fired.delete(a.key)
          saveFired(fired)
        },
        onSuccess: () => queryClient.refetchQueries(['/api/logs']),
      })
    }
    if (changed) saveFired(fired)
  }, [activeAlerts, loggedKeys])

  const visibleAlerts = activeAlerts.filter(a => !ackd.has(a.entry.id + ':' + a.stage))
  // Only the most urgent alert per entry is shown (STAGES order).
  const banner = visibleAlerts[0] || null

  const nextTimed = React.useMemo(() => {
    for (const e of entries) {
      const start = entryStart(e)
      if (start && start.isAfter(now)) return { entry: e, sec: start.diff(now, 'second') }
    }
    return null
  }, [entries, now])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today)
      .slice(0, 10)
  }, [entries, now.format('YYYY-MM-DD')])

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
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ' ' + time : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        text: entryText.trim(),
        entryType,
        time,
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
        {banner && (
          <div
            role="alert"
            className={cn(
              'mb-16 border px-8 py-4 flex justify-between gap-16 items-baseline tabular-nums',
              banner.stage === 'T15' && 'border-acc/30 text-acc/70',
              banner.stage === 'T5' && 'border-acc/60 text-acc',
              (banner.stage === 'T0' || banner.stage === 'MISSED') &&
                'border-acc text-acc animate-pulse'
            )}
          >
            <span className="uppercase tracking-widest whitespace-nowrap">
              ▌{banner.label} · {formatCountdown(entryStart(banner.entry)!.diff(now, 'second'))}
            </span>
            <span className="text-right flex-1 truncate">
              {banner.entry.type.toUpperCase()} · {banner.entry.text}
            </span>
            <button
              className="uppercase tracking-widest text-acc/60 hover:text-acc transition-opacity whitespace-nowrap"
              onClick={() =>
                setAckd(prev => new Set(prev).add(banner.entry.id + ':' + banner.stage))
              }
            >
              ACK
            </button>
          </div>
        )}

        <div className="mb-16 flex items-baseline justify-between gap-16">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          <span className="text-acc/40 tabular-nums whitespace-nowrap">
            {now.format('HH:mm:ss')}
            {nextTimed && ` · NEXT ${formatCountdown(nextTimed.sec)}`}
          </span>
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
                  <div key={i} className="text-acc/80 mb-1">
                    {e.time && <span className="text-acc/40 mr-8">{e.time}</span>}
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
                  {entry.time && ` ${entry.time}`}
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
