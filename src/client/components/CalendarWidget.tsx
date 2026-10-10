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
  time: string | null
  text: string
  type: EntryType
}

type AlertStage = 'PRE' | 'DUE' | 'LATE'

type ActiveAlert = {
  key: string
  stage: AlertStage
  entry: CalendarEntry
}

const STAGE_RANK: Record<AlertStage, number> = { PRE: 1, DUE: 2, LATE: 3 }
const PRE_WINDOW_MIN = 10
const DUE_WINDOW_MIN = 5
const LATE_WINDOW_MIN = 180
const TICK_MS = 15_000
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

// Minutes from now until the entry starts (negative = already started).
function minutesUntil(entry: CalendarEntry, now: Dayjs): number | null {
  if (!entry.time) return null
  return dayjs(`${entry.date}T${entry.time}:00`).diff(now, 'minute', true)
}

function stageFor(diff: number): AlertStage | null {
  if (diff > PRE_WINDOW_MIN) return null
  if (diff > 0) return 'PRE'
  if (diff > -DUE_WINDOW_MIN) return 'DUE'
  if (diff > -LATE_WINDOW_MIN) return 'LATE'
  return null
}

function fmtEntryDate(e: { date: string; time: string | null }) {
  const d = dayjs(e.date).format('dddd, MMMM D, YYYY')
  return e.time ? `${d} · ${e.time}` : d
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
        }
      })
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs])

  // Alert keys already logged (survives reloads, devices)
  const loggedAlerts = React.useMemo(() => {
    const m = new Map<string, number>()
    logs.forEach(log => {
      if (log.event !== 'calendar_alert') return
      const id = log.metadata?.sourceId
      const stage = log.metadata?.stage as AlertStage | undefined
      if (!id || !stage) return
      const k = String(id)
      m.set(k, Math.max(m.get(k) || 0, STAGE_RANK[stage] || 0))
    })
    return m
  }, [logs])

  const firedRef = React.useRef<Map<string, number>>(new Map())
  const [activeAlerts, setActiveAlerts] = React.useState<ActiveAlert[]>([])
  const [entryTime, setEntryTime] = React.useState('')

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

  const today = dayjs().format('YYYY-MM-DD')
  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  const entriesRef = React.useRef(entries)
  entriesRef.current = entries
  const loggedRef = React.useRef(loggedAlerts)
  loggedRef.current = loggedAlerts

  const fireAlert = React.useCallback((entry: CalendarEntry, stage: AlertStage) => {
    const label = stage === 'PRE' ? `T-${PRE_WINDOW_MIN}` : stage
    setActiveAlerts(prev => [
      ...prev.filter(a => a.entry.id !== entry.id),
      { key: `${entry.id}:${stage}`, stage, entry },
    ])
    createLog({
      text: `[ALERT ${label}] ${entry.type}: ${entry.text} (${entry.date} ${entry.time})`,
      event: 'calendar_alert',
      metadata: {
        sourceId: entry.id,
        stage,
        date: entry.date,
        time: entry.time,
        entryType: entry.type,
        text: entry.text,
      },
    }, {
      onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
    })
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(`LOT · ${label} · ${entry.time}`, { body: entry.text, tag: entry.id })
      }
    } catch (_) {}
  }, [createLog, queryClient])

  // Alert engine: runs while the app is open, once per stage per entry
  React.useEffect(() => {
    const tick = () => {
      const now = dayjs()
      const day = now.format('YYYY-MM-DD')
      for (const entry of entriesRef.current) {
        if (!entry.time || entry.date !== day) continue
        const diff = minutesUntil(entry, now)
        if (diff === null) continue
        const stage = stageFor(diff)
        if (!stage) continue
        const rank = STAGE_RANK[stage]
        const seen = Math.max(
          firedRef.current.get(entry.id) || 0,
          loggedRef.current.get(entry.id) || 0,
        )
        if (seen >= rank) continue
        firedRef.current.set(entry.id, rank)
        fireAlert(entry, stage)
      }
    }
    tick()
    const id = window.setInterval(tick, TICK_MS)
    const onVis = () => { if (!document.hidden) tick() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [fireAlert, entries.length])

  const handleArm = () => {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch (_) {}
  }

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
    if (time) handleArm()

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY') + (time ? ` ${time}` : '')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel})`,
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
              <div
                key={a.key}
                className={cn(
                  'flex justify-between gap-16 border border-acc/40 px-8 py-4 uppercase tracking-widest',
                  a.stage === 'PRE' ? 'text-acc/60' : 'text-acc',
                  a.stage === 'DUE' && 'animate-pulse',
                )}
              >
                <span className="whitespace-nowrap tabular-nums">
                  {a.stage === 'PRE' ? `T-${PRE_WINDOW_MIN}` : a.stage} · {a.entry.time} · {a.entry.type}
                </span>
                <span className="text-right normal-case tracking-normal">{a.entry.text}</span>
                <button
                  className="text-acc/40 hover:text-acc whitespace-nowrap"
                  onClick={() => setActiveAlerts(prev => prev.filter(x => x.key !== a.key))}
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
                    {e.time ? `${e.time} · ` : ''}{e.text}
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
                  {fmtEntryDate(entry)}
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
