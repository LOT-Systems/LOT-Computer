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
  done: boolean
}

// Alert stages, in escalation order. Only the latest due stage fires.
type AlertStage = 'T-15' | 'T-00'
type ActiveAlert = { key: string; entryId: string; stage: AlertStage; entry: CalendarEntry }

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const ALL_DAY_ALERT_HOUR = 8 // all-day entries alert at 08:00 local on the day
const ALERT_GRACE_MIN = 360 // stages older than 6h are not fired retroactively
const TICK_MS = 1000

function entryMoment(e: Pick<CalendarEntry, 'date' | 'time'>): Dayjs {
  const [y, mo, d] = e.date.split('-').map(Number)
  const [h, mi] = (e.time || `${String(ALL_DAY_ALERT_HOUR).padStart(2, '0')}:00`).split(':').map(Number)
  return dayjs(new Date(y, (mo || 1) - 1, d || 1, h, mi))
}

function pad(n: number) { return String(Math.floor(n)).padStart(2, '0') }

function formatCountdown(sec: number): string {
  const sign = sec < 0 ? '+' : '-'
  const a = Math.abs(sec)
  const d = Math.floor(a / 86400)
  const h = Math.floor((a % 86400) / 3600)
  const m = Math.floor((a % 3600) / 60)
  const s = Math.floor(a % 60)
  return `T${sign}${d > 0 ? d + 'D ' : ''}${pad(h)}:${pad(m)}:${pad(s)}`
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
  const [dismissed, setDismissed] = React.useState<Set<string>>(() => new Set())
  const firedRef = React.useRef<Set<string>>(new Set())

  // Ledger of already-logged alerts / completions (server logs are source of truth)
  const alertedKeys = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.entryId) {
        set.add(`${log.metadata.entryId}:${log.metadata.stage}`)
      }
    })
    return set
  }, [logs])

  const doneIds = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_done' && log.metadata?.entryId) set.add(String(log.metadata.entryId))
    })
    return set
  }, [logs])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: String(log.id),
        date: log.metadata?.date as string,
        time: TIME_RE.test(String(log.metadata?.time || '')) ? (log.metadata?.time as string) : null,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
        done: doneIds.has(String(log.id)),
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  }, [logs, doneIds])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today && !e.done)
      .slice(0, 10)
  }, [entries])

  // Next timed-or-dated entry still ahead (or just passed and undone today)
  const nextEntry = React.useMemo(() => {
    return entries.find(e => !e.done && entryMoment(e).isAfter(now.subtract(1, 'minute'))) || null
  }, [entries, now])

  // Live clock — paused while tab hidden
  React.useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setNow(dayjs())
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  // Due alerts: latest due stage per entry, not yet logged
  const dueAlerts = React.useMemo<ActiveAlert[]>(() => {
    const out: ActiveAlert[] = []
    entries.forEach(e => {
      if (e.done) return
      const target = entryMoment(e)
      const minsToTarget = target.diff(now, 'minute', true)
      let stage: AlertStage | null = null
      if (minsToTarget <= 0 && minsToTarget > -ALERT_GRACE_MIN) stage = 'T-00'
      else if (e.time && minsToTarget <= 15 && minsToTarget > 0) stage = 'T-15'
      if (!stage) return
      const key = `${e.id}:${stage}`
      out.push({ key, entryId: e.id, stage, entry: e })
    })
    return out
  }, [entries, now])

  // Fire: write to Log once, notify via OS if permitted
  React.useEffect(() => {
    dueAlerts.forEach(a => {
      if (alertedKeys.has(a.key) || firedRef.current.has(a.key)) return
      let seen = false
      try { seen = localStorage.getItem('lot:cal:alert:' + a.key) === '1' } catch (_) {}
      firedRef.current.add(a.key)
      if (seen) return
      try { localStorage.setItem('lot:cal:alert:' + a.key, '1') } catch (_) {}
      const e = a.entry
      const when = e.time ? `${e.date} ${e.time}` : `${e.date} ALL-DAY`
      createLog({
        text: `[ALERT ${a.stage}] ${e.type.toUpperCase()}: ${e.text} (${when})`,
        event: 'calendar_alert',
        metadata: { entryId: a.entryId, stage: a.stage, date: e.date, time: e.time, entryType: e.type, text: e.text },
      }, { onSuccess: () => { queryClient.refetchQueries(['/api/logs']) } })
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`LOT // ${a.stage} // ${e.type.toUpperCase()}`, { body: `${e.time || 'ALL-DAY'} — ${e.text}`, tag: a.key })
        }
      } catch (_) {}
    })
  }, [dueAlerts, alertedKeys, createLog, queryClient])

  const activeAlerts = dueAlerts.filter(a => !dismissed.has(a.key))

  const handleAck = (a: ActiveAlert) => {
    setDismissed(prev => new Set(prev).add(a.key))
  }

  const handleDone = (a: ActiveAlert) => {
    setDismissed(prev => new Set(prev).add(a.key))
    createLog({
      text: `[DONE] ${a.entry.type.toUpperCase()}: ${a.entry.text} (${a.entry.date}${a.entry.time ? ' ' + a.entry.time : ''})`,
      event: 'calendar_done',
      metadata: { entryId: a.entryId, date: a.entry.date, time: a.entry.time },
    }, { onSuccess: () => { queryClient.refetchQueries(['/api/logs']) } })
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

    const time = TIME_RE.test(entryTime) ? entryTime : null
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

    // Timed entries need OS permission for alerts; ask once, on a user gesture
    try {
      if (time && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } catch (_) {}

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
                  'flex flex-wrap items-center justify-between gap-x-16 border-l-2 pl-8 uppercase tracking-widest',
                  a.stage === 'T-00' ? 'border-acc text-acc' : 'border-acc/40 text-acc/70'
                )}
              >
                <span>
                  {a.stage === 'T-00' ? 'EXECUTE' : 'STANDBY'} // {a.stage} // {a.entry.time || 'ALL-DAY'} // {a.entry.type} // {a.entry.text}
                </span>
                <span className="flex gap-8 normal-case tracking-normal">
                  <button className="text-acc/60 hover:text-acc transition-opacity" onClick={() => handleAck(a)}>[ack]</button>
                  <button className="text-acc/60 hover:text-acc transition-opacity" onClick={() => handleDone(a)}>[done]</button>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mb-16 flex items-center gap-16">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          <span className="text-acc/40 tabular-nums whitespace-nowrap">
            {now.format('HH:mm:ss')}
            {nextEntry && ` · ${formatCountdown(entryMoment(nextEntry).diff(now, 'second'))}`}
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
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40 tabular-nums"
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
                  <div key={i} className={cn('text-acc/80 mb-1', e.done && 'line-through opacity-40')}>
                    {e.time && <span className="tabular-nums mr-8">{e.time}</span>}{e.text}
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
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}{entry.time ? ` ${entry.time}` : ''}
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
