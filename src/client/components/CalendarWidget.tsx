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
  activeAlerts,
  alertLine,
  canNotify,
  entryTimestamp,
  firedKey,
  formatCountdown,
  loadFired,
  notifyDesktop,
  parseTime,
  saveFired,
  STAGE_LABEL,
} from '#client/utils/calendarAlerts'
import type { AlertStage } from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time?: string
  text: string
  type: EntryType
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
      .map(log => ({
        id: log.id as string,
        date: log.metadata?.date as string,
        time: (log.metadata?.time as string | undefined) || undefined,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) =>
        a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '')
      )
  }, [logs])

  // ── Alert engine ────────────────────────────────────────────────────────
  const [now, setNow] = React.useState(() => Date.now())
  const [acked, setAcked] = React.useState<Set<string>>(() => new Set())
  const [entryTime, setEntryTime] = React.useState('')
  const [notifyState, setNotifyState] = React.useState<string>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  )
  const firedRef = React.useRef<Set<string>>(loadFired())

  const alerts = React.useMemo(() => activeAlerts(entries, now), [entries, now])
  const entryById = React.useMemo(() => new Map(entries.map(e => [e.id, e])), [entries])

  // Tick fast (1s) only while something is inside an alert window; otherwise 15s.
  const hasLive = alerts.length > 0
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), hasLive ? 1000 : 15000)
    const onVisible = () => { if (!document.hidden) setNow(Date.now()) }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [hasLive])

  // Fire each (entry, stage) once: Log row + desktop notification.
  // Alerts already logged (other device / earlier session) are marked fired, not repeated.
  React.useEffect(() => {
    if (!alerts.length) return
    const logged = new Set<string>()
    logs.forEach(l => {
      if (l.event === 'calendar_alert' && l.metadata?.entryId) {
        logged.add(firedKey(l.metadata.entryId as string, l.metadata.stage as AlertStage))
      }
    })
    let dirty = false
    for (const a of alerts) {
      const key = firedKey(a.id, a.stage)
      if (firedRef.current.has(key)) continue
      firedRef.current.add(key)
      dirty = true
      if (logged.has(key)) continue
      const e = entryById.get(a.id)
      if (!e || !e.time) continue
      const line = alertLine(a.stage, e.type, e.time, e.text)
      createLog({
        text: line,
        event: 'calendar_alert',
        metadata: { entryId: a.id, stage: a.stage, date: e.date, time: e.time, entryType: e.type },
      })
      notifyDesktop(`LOT · ${STAGE_LABEL[a.stage]}`, `${e.type.toUpperCase()} ${e.time} · ${e.text}`, key)
    }
    if (dirty) saveFired(firedRef.current)
  }, [alerts, logs, entryById, createLog])

  const handleAck = (id: string, stage: AlertStage) => {
    setAcked(prev => new Set(prev).add(id))
    const e = entryById.get(id)
    if (!e) return
    createLog({
      text: `[CAL] ACK · ${e.type.toUpperCase()} ${e.time} · ${e.text}`,
      event: 'calendar_alert',
      metadata: { entryId: id, stage: 'ack', ackedStage: stage, date: e.date, time: e.time, entryType: e.type },
    })
  }

  const handleEnableNotify = async () => {
    if (typeof Notification === 'undefined') return
    try {
      setNotifyState(await Notification.requestPermission())
    } catch (_) {}
  }

  const upcomingEntries = React.useMemo(() => {
    // Timed entries drop off an hour after T-0 (alert window); untimed ones at day end.
    const today = dayjs(now).format('YYYY-MM-DD')
    return entries
      .filter(e => e.time
        ? entryTimestamp(e.date, e.time) > now - 60 * 60_000
        : e.date >= today)
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

    const time = entryTime.trim() ? parseTime(entryTime) : undefined
    if (time === null) return // invalid HH:mm — keep the form open
    if (time && entryTimestamp(selectedDate, time) < Date.now()) return // past

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ` ${time}` : ''})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        ...(time ? { time } : {}),
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
        {alerts.filter(a => !acked.has(a.id)).map(a => {
          const e = entryById.get(a.id)
          if (!e || !e.time) return null
          return (
            <div
              key={a.id}
              className={cn(
                'mb-8 border px-8 py-4 flex justify-between gap-16 items-baseline tabular-nums',
                a.stage === 'standby' && 'border-acc/20 text-acc/60',
                a.stage === 'armed' && 'border-acc/50 text-acc',
                (a.stage === 'now' || a.stage === 'overdue') && 'border-acc text-acc animate-pulse',
              )}
              role="alert"
            >
              <span className="uppercase tracking-widest">
                {STAGE_LABEL[a.stage]} · {e.type} {e.time}
              </span>
              <span className="text-right">{e.text}</span>
              <span>{formatCountdown(a.deltaMs)}</span>
              <button
                className="text-acc/60 hover:text-acc uppercase"
                onClick={() => handleAck(a.id, a.stage)}
              >
                ACK
              </button>
            </div>
          )
        })}

        <div className="mb-16 flex gap-16 items-baseline">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          {notifyState === 'default' && (
            <button
              className="text-acc/40 hover:text-acc transition-opacity"
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
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    maxLength={5}
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5em] outline-none',
                      entryTime && !parseTime(entryTime)
                        ? 'border-acc/60'
                        : 'border-acc/20 focus:border-acc/40'
                    )}
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
              <div key={i} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time && <span className="text-acc/60 tabular-nums"> · {entry.time}</span>}
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
