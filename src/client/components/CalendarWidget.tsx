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
  buildEntries, pendingStage, dueAt, duplicateOf, formatCountdown, alertLogText, isValidTime,
} from '#client/utils/calendar'
import type { EntryType, CalendarEntry, AlertStage } from '#client/utils/calendar'

const TICK_MS = 15_000
const STAGE_LABEL: Record<AlertStage, string> = {
  'T-15': 'WARNING // T-15',
  'T-0': 'ACTIVE // NOW',
  MISSED: 'MISSED // OVERDUE',
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
  const [now, setNow] = React.useState(() => new Date())
  const [acked, setAcked] = React.useState<Set<string>>(() => new Set())
  const firedRef = React.useRef<Set<string>>(new Set())

  const entries = React.useMemo<CalendarEntry[]>(() => buildEntries(logs as any), [logs])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs(now).format('YYYY-MM-DD')
    return entries
      .filter(e => e.status === 'open' && e.date >= today)
      .slice(0, 10)
  }, [entries, now])

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter(e => e.date === selectedDate)
  }, [entries, selectedDate])

  // Active alert board: open entries currently inside an alert window (survives reload)
  const activeAlerts = React.useMemo(
    () => entries
      .map(e => ({ e, stage: pendingStage({ ...e, alerts: [] }, now) }))
      .filter((x): x is { e: CalendarEntry; stage: AlertStage } => !!x.stage)
      .filter(x => !acked.has(`${x.e.id}:${x.stage}`)),
    [entries, now, acked]
  )

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => { if (e.status !== 'cancelled') set.add(e.date) })
    return set
  }, [entries])

  const today = dayjs(now).format('YYYY-MM-DD')
  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  const writeLog = React.useCallback((text: string, metadata: Record<string, any>) => {
    createLog({ text, event: 'calendar_entry', metadata }, {
      onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
    })
  }, [createLog, queryClient])

  // Alert engine: tick + catch-up on focus/visibility. One log per (entry, stage).
  const entriesRef = React.useRef(entries)
  entriesRef.current = entries
  React.useEffect(() => {
    const run = () => {
      const t = new Date()
      setNow(t)
      for (const e of entriesRef.current) {
        const stage = pendingStage(e, t)
        if (!stage) continue
        const key = `${e.id}:${stage}`
        if (firedRef.current.has(key)) continue
        firedRef.current.add(key)
        writeLog(alertLogText(e, stage), { kind: 'alert', entryId: e.id, stage, date: e.date, time: e.time, entryType: e.type, text: e.text })
        try {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(`LOT // ${STAGE_LABEL[stage]}`, { body: `${e.time || 'ALL-DAY'} ${e.type.toUpperCase()} · ${e.text}`, tag: key })
          }
        } catch (_) {}
      }
    }
    run()
    const id = window.setInterval(run, TICK_MS)
    const onWake = () => { if (document.visibilityState !== 'hidden') run() }
    document.addEventListener('visibilitychange', onWake)
    window.addEventListener('focus', onWake)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onWake)
      window.removeEventListener('focus', onWake)
    }
  }, [writeLog])

  const setStatus = (e: CalendarEntry, status: 'done' | 'cancelled' | 'open') => {
    const label = status === 'done' ? 'DONE' : status === 'cancelled' ? 'CANCELLED' : 'REOPENED'
    writeLog(`[CAL // ${label}] ${e.date} ${e.time || 'ALL-DAY'} ${e.type.toUpperCase()} · ${e.text}`,
      { kind: 'status', entryId: e.id, status })
  }

  const enableAlerts = () => {
    try { if (typeof Notification !== 'undefined') Notification.requestPermission().then(() => setNow(new Date())) } catch (_) {}
  }
  const canAskPermission = typeof Notification !== 'undefined' && Notification.permission === 'default'

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    if (selectedDate === key) {
      setSelectedDate(null)
    } else {
      setSelectedDate(key)
    }
  }

  const handleAddEntry = () => {
    const text = entryText.trim()
    if (!selectedDate || !text) return
    const time = entryTime && isValidTime(entryTime) ? entryTime : null
    if (duplicateOf(entries, { date: selectedDate, time, text, type: entryType })) {
      setEntryText('')
      setIsAddingEntry(false)
      return
    }

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const entryId = `ce_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

    createLog({
      text: `[SCHEDULE] ${entryType}: ${text} (${dateLabel}${time ? ` ${time}` : ''})`,
      event: 'calendar_entry',
      metadata: { kind: 'event', entryId, date: selectedDate, time, text, entryType },
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
          <div className="mb-16 space-y-8">
            {activeAlerts.map(({ e, stage }) => (
              <div
                key={`${e.id}:${stage}`}
                className={cn('border px-8 py-4', stage === 'T-15' ? 'border-acc/30' : 'border-acc')}
              >
                <div className={cn('uppercase tracking-widest tabular-nums', stage === 'T-15' ? 'text-acc/60' : 'text-acc')}>
                  {stage === 'T-15' ? '△' : '▲'} {STAGE_LABEL[stage]} · {formatCountdown(dueAt(e).getTime() - now.getTime())}
                </div>
                <div className="text-acc">
                  {e.time || 'ALL-DAY'} {e.type.toUpperCase()} · {e.text}
                </div>
                <div className="flex gap-16 mt-4">
                  <button className="text-acc/60 hover:text-acc" onClick={() => setAcked(new Set(acked).add(`${e.id}:${stage}`))}>ACK</button>
                  <button className="text-acc/60 hover:text-acc" onClick={() => setStatus(e, 'done')}>DONE</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-16 flex gap-16 items-center">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          {canAskPermission && (
            <button className="text-acc/40 hover:text-acc transition-opacity" onClick={enableAlerts}>
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
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
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
                {entriesOnDate.map(e => (
                  <div key={e.id} className={cn('flex justify-between gap-16 mb-1', e.status === 'open' ? 'text-acc/80' : 'text-acc/30 line-through')}>
                    <span>{e.time ? `${e.time} ` : ''}{e.text}</span>
                    {e.status === 'open' ? (
                      <span className="whitespace-nowrap no-underline">
                        <button className="text-acc/40 hover:text-acc mr-8" onClick={() => setStatus(e, 'done')}>done</button>
                        <button className="text-acc/40 hover:text-acc" onClick={() => setStatus(e, 'cancelled')}>cancel</button>
                      </span>
                    ) : (
                      <button className="text-acc/40 hover:text-acc whitespace-nowrap" onClick={() => setStatus(e, 'open')}>reopen</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map(entry => (
              <div key={entry.id} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time && <span className="text-acc/60 tabular-nums"> {entry.time}</span>}
                </span>
                <span className="text-acc text-right">
                  <span className="text-acc/40 tabular-nums mr-8">
                    {formatCountdown(dueAt(entry).getTime() - now.getTime())}
                  </span>
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
