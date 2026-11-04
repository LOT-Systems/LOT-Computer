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
  STAGE_LABEL,
  formatCountdown,
  isValidTime,
  pendingStage,
} from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time?: string
  text: string
  type: EntryType
}

type ActiveAlert = {
  key: string
  stage: AlertStage
  entry: CalendarEntry
}

const FIRED_KEY = 'lot_cal_alerts_fired'
const TICK_MS = 15_000

function readFiredLocal(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(FIRED_KEY) || '[]'))
  } catch (_) {
    return new Set()
  }
}

function writeFiredLocal(set: Set<string>) {
  try {
    // keep the newest 500 keys only
    localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(set).slice(-500)))
  } catch (_) {}
}

function sysNotify(title: string, body: string) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, tag: title + body })
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
  const firedRef = React.useRef<Set<string>>(new Set())
  const entriesRef = React.useRef<CalendarEntry[]>([])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: String(log.id),
        date: log.metadata?.date as string,
        time: isValidTime(log.metadata?.time as string) ? (log.metadata?.time as string) : undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs])

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

  entriesRef.current = entries

  // Hydrate fired-set from server logs (cross-device dedupe) + local storage
  const firedFromLogs = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(l => {
      if (l.event === 'calendar_alert' && l.metadata?.entryId && l.metadata?.stage) {
        set.add(`${l.metadata.entryId}:${l.metadata.stage}`)
      }
    })
    return set
  }, [logs])
  const firedFromLogsRef = React.useRef(firedFromLogs)
  firedFromLogsRef.current = firedFromLogs

  React.useEffect(() => {
    firedRef.current = readFiredLocal()
  }, [])

  const runCheck = React.useCallback(() => {
    const t = dayjs()
    setNow(t)
    const fresh: ActiveAlert[] = []
    for (const e of entriesRef.current) {
      const fired = new Set<AlertStage>()
      ;(['warn', 'due', 'missed'] as AlertStage[]).forEach(st => {
        const k = `${e.id}:${st}`
        if (firedRef.current.has(k) || firedFromLogsRef.current.has(k)) fired.add(st)
      })
      const stage = pendingStage(e, t, fired)
      if (!stage) continue
      const k = `${e.id}:${stage}`
      firedRef.current.add(k)
      fresh.push({ key: k, stage, entry: e })
    }
    if (!fresh.length) return
    writeFiredLocal(firedRef.current)
    setAlerts(prev => [...prev, ...fresh])
    fresh.forEach(a => {
      const when = `${a.entry.date}${a.entry.time ? ' ' + a.entry.time : ''}`
      sysNotify(`${STAGE_LABEL[a.stage]} · ${a.entry.type.toUpperCase()}`, a.entry.text)
      createLog({
        text: `[ALERT] ${STAGE_LABEL[a.stage]} ${a.entry.type}: ${a.entry.text} (${when})`,
        event: 'calendar_alert',
        metadata: {
          entryId: a.entry.id,
          stage: a.stage,
          entryType: a.entry.type,
          date: a.entry.date,
          time: a.entry.time || null,
        },
      })
    })
  }, [createLog])

  React.useEffect(() => {
    runCheck()
    const id = setInterval(runCheck, TICK_MS)
    const onVis = () => { if (document.visibilityState === 'visible') runCheck() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [runCheck, entries.length])

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

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()}${isValidTime(entryTime) ? ' @ ' + entryTime : ''} (${dateLabel})`,
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
          <div className="flex gap-16 items-center">
            <Button onClick={handleToggleCalendar}>
              Add date
            </Button>
            {typeof Notification !== 'undefined' && Notification.permission === 'default' && (
              <button
                className="text-acc/30 hover:text-acc/60 transition-opacity"
                onClick={() => { try { Notification.requestPermission().then(() => setNow(dayjs())) } catch (_) {} }}
              >
                Enable alerts
              </button>
            )}
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mb-16 space-y-1" role="alert" aria-live="assertive">
            {alerts.map(a => (
              <div
                key={a.key}
                className={cn(
                  'flex justify-between gap-16 uppercase tracking-widest border-l-2 pl-8',
                  a.stage === 'warn' ? 'border-acc/40 text-acc/60' : 'border-acc text-acc',
                  a.stage === 'due' && 'animate-pulse'
                )}
              >
                <span>
                  {STAGE_LABEL[a.stage]} · {a.entry.type}
                  {a.entry.time ? ` · ${a.entry.time}` : ''} · {a.entry.text}
                </span>
                <button
                  className="text-acc/40 hover:text-acc whitespace-nowrap"
                  onClick={() => setAlerts(prev => prev.filter(x => x.key !== a.key))}
                >
                  ACK
                </button>
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
                    {e.time ? `${e.time} ` : ''}{e.text}
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
                  {entry.time ? ` · ${entry.time}` : ''}
                  {entry.date === today && (
                    <span className="text-acc/40 tabular-nums"> {formatCountdown(entry, now)}</span>
                  )}
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
