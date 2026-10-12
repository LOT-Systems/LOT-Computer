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
  AlertStage,
  STAGE_CODE,
  STAGE_LABEL,
  countdown,
  dueStage,
  eventMoment,
  isValidTime,
} from '#client/utils/calendarAlerts'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time: string | null
  done: boolean
  text: string
  type: EntryType
}

type ActiveAlert = { key: string; stage: AlertStage; text: string; time: string | null }

const TICK_MS = 15_000

function beep(stage: AlertStage) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const pulses = stage === 'execute' || stage === 'overdue' ? 3 : stage === 'imminent' ? 2 : 1
    for (let i = 0; i < pulses; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = stage === 'overdue' ? 440 : 880
      gain.gain.value = 0.03
      osc.connect(gain)
      gain.connect(ctx.destination)
      const t = ctx.currentTime + i * 0.2
      osc.start(t)
      osc.stop(t + 0.1)
    }
    setTimeout(() => ctx.close().catch(() => {}), 1500)
  } catch (_) {}
}

function systemNotify(title: string, body: string) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body })
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

  const doneIds = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_done' && log.metadata?.entryId) {
        set.add(log.metadata.entryId as string)
      }
    })
    return set
  }, [logs])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => {
        const time = log.metadata?.time as string | undefined
        return {
          id: log.id,
          date: log.metadata?.date as string,
          time: isValidTime(time) ? time : null,
          done: doneIds.has(log.id),
          text: log.metadata?.text as string || log.text || '',
          type: (log.metadata?.entryType as EntryType) || 'note',
        }
      })
      .filter(e => e.date && e.text)
      .sort((a, b) =>
        a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || '')
      )
  }, [logs, doneIds])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today && !e.done)
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

  // Seed dedupe set from persisted alert logs so reloads never re-fire.
  React.useEffect(() => {
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.entryId && log.metadata?.stage) {
        firedRef.current.add(`${log.metadata.entryId}:${log.metadata.stage}`)
      }
    })
  }, [logs])

  // Clock tick + alert evaluation.
  React.useEffect(() => {
    const tick = () => {
      const t = dayjs()
      setNow(t)
      // Wait for logs so persisted alerts are known before evaluating.
      if (!logs.length) return
      const fresh: ActiveAlert[] = []
      entries.forEach(e => {
        const stage = dueStage(
          { key: e.id, date: e.date, time: e.time, done: e.done },
          t,
          firedRef.current
        )
        if (!stage) return
        firedRef.current.add(`${e.id}:${stage}`)
        fresh.push({ key: e.id, stage, text: e.text, time: e.time })
        createLog({
          text: `[ALERT] ${STAGE_CODE[stage]} ${STAGE_LABEL[stage]}: ${e.text}${e.time ? ` (${e.time})` : ''}`,
          event: 'calendar_alert',
          metadata: { entryId: e.id, stage, date: e.date, time: e.time, text: e.text },
        })
      })
      if (fresh.length) {
        setAlerts(prev => [
          ...prev.filter(a => !fresh.some(f => f.key === a.key)),
          ...fresh,
        ])
        const top = fresh[fresh.length - 1]
        beep(top.stage)
        systemNotify(`${STAGE_CODE[top.stage]} ${STAGE_LABEL[top.stage]}`, top.text)
      }
    }
    tick()
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [entries, logs.length, createLog])

  const dismissAlert = (key: string) => setAlerts(prev => prev.filter(a => a.key !== key))

  const handleDone = (entry: CalendarEntry) => {
    createLog({
      text: `[DONE] ${entry.text}${entry.time ? ` (${entry.time})` : ''}`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, time: entry.time, text: entry.text },
    }, {
      onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
    })
    dismissAlert(entry.id)
  }

  const nextTimed = React.useMemo(() => {
    return entries.find(e => {
      if (e.done || !e.time) return false
      return eventMoment(e.date, e.time).isAfter(now.subtract(15, 'minute'))
    })
  }, [entries, now])

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
    const time = isValidTime(entryTime) ? entryTime : null

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ` ${time}` : ''})`,
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

    if (time && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try { Notification.requestPermission() } catch (_) {}
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
              <div
                key={a.key}
                className={cn(
                  'flex justify-between gap-16 border-l-2 pl-8 uppercase tracking-widest',
                  a.stage === 'overdue' || a.stage === 'execute'
                    ? 'border-acc text-acc animate-pulse'
                    : 'border-acc/40 text-acc/80'
                )}
              >
                <span className="whitespace-nowrap">
                  {STAGE_CODE[a.stage]} {STAGE_LABEL[a.stage]}
                  {a.time ? ` ${a.time}` : ''} — {a.text}
                </span>
                <span className="flex gap-8 whitespace-nowrap">
                  <button className="hover:underline" onClick={() => { const en = entries.find(x => x.id === a.key); if (en) handleDone(en) }}>
                    DONE
                  </button>
                  <button className="text-acc/50 hover:text-acc" onClick={() => dismissAlert(a.key)}>
                    ACK
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}

        {nextTimed && (
          <div className="mb-16 text-acc/60 uppercase tracking-widest tabular-nums">
            NEXT {countdown(eventMoment(nextTimed.date, nextTimed.time), now)} · {nextTimed.time} · {nextTimed.text}
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
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 outline-none focus:border-acc/40"
                    aria-label="Time (optional)"
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
                  <div key={i} className={cn('text-acc/80 mb-1', e.done && 'line-through opacity-50')}>
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
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time ? ` · ${entry.time}` : ''}
                </span>
                <span className="text-acc text-right">
                  {entry.text}{' '}
                  <button
                    className="text-acc/30 hover:text-acc transition-opacity"
                    onClick={() => handleDone(entry)}
                    title="Mark done"
                  >
                    [ ]
                  </button>
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
