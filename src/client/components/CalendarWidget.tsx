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
  entryTimestamp,
  formatCountdown,
  getAlertStage,
  isValidTime,
  STAGE_LABEL,
} from '#client/utils/calendar'
import type { AlertStage } from '#client/utils/calendar'

type EntryType = 'note' | 'task' | 'call'

type CalendarEntry = {
  id: string
  date: string
  time: string | null
  ts: number
  done: boolean
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
  const { data: logsData, isSuccess: logsLoaded } = useLogs()
  const logs = logsData || []
  const { mutate: createLog } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')

  const [entryTime, setEntryTime] = React.useState('')
  const [now, setNow] = React.useState(() => Date.now())
  const firedRef = React.useRef<Set<string>>(new Set())

  // Tick every 15s (1s while an alert is live, see below) so alerts fire on time
  const doneIds = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_done' && log.metadata?.entryId) {
        set.add(log.metadata.entryId as string)
      }
    })
    return set
  }, [logs])

  const alertedKeys = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(log => {
      if (log.event === 'calendar_alert' && log.metadata?.entryId) {
        set.add(`${log.metadata.entryId}:${log.metadata.stage}`)
      }
    })
    return set
  }, [logs])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => {
        const date = log.metadata?.date as string
        const rawTime = log.metadata?.time as string | undefined
        const time = isValidTime(rawTime) ? rawTime : null
        return {
          id: log.id as string,
          date,
          time,
          ts: entryTimestamp(date, time),
          done: doneIds.has(log.id as string),
          text: log.metadata?.text as string || log.text || '',
          type: (log.metadata?.entryType as EntryType) || 'note',
        }
      })
      .filter(e => e.date && e.text)
      .sort((a, b) => a.ts - b.ts || a.date.localeCompare(b.date))
  }, [logs, doneIds])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs(now).format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today && !e.done)
      .slice(0, 10)
  }, [entries, now])

  // Live alerts: armed, not done, highest stage per entry
  const liveAlerts = React.useMemo(() => {
    return entries
      .filter(e => !e.done && e.type !== 'note')
      .map(e => ({ entry: e, stage: getAlertStage(e.ts, now) }))
      .filter((a): a is { entry: CalendarEntry; stage: AlertStage } => a.stage !== null)
  }, [entries, now])

  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), liveAlerts.length ? 1000 : 15000)
    return () => clearInterval(t)
  }, [liveAlerts.length > 0])

  // Log each stage transition to Log exactly once per entry
  React.useEffect(() => {
    if (!logsLoaded) return // never fire before existing alert logs are known
    liveAlerts.forEach(({ entry, stage }) => {
      const key = `${entry.id}:${stage}`
      // Entries added after their time passed get a banner, not a log spam
      if (stage === 'overdue' &&
          !alertedKeys.has(`${entry.id}:standby`) && !alertedKeys.has(`${entry.id}:execute`)) return
      if (alertedKeys.has(key) || firedRef.current.has(key)) return
      firedRef.current.add(key)
      createLog({
        text: `[ALERT] ${STAGE_LABEL[stage]} ${entry.type}: ${entry.text}${entry.time ? ` @ ${entry.time}` : ''} (${entry.date})`,
        event: 'calendar_alert',
        metadata: { entryId: entry.id, stage, date: entry.date, time: entry.time, entryType: entry.type },
      }, {
        onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
        onError: () => { firedRef.current.delete(key) },
      })
    })
  }, [liveAlerts, alertedKeys, logsLoaded])

  const handleDone = (entry: CalendarEntry) => {
    createLog({
      text: `[DONE] ${entry.type}: ${entry.text} (${entry.date})`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, time: entry.time, entryType: entry.type },
    }, {
      onSuccess: () => { queryClient.refetchQueries(['/api/logs']) },
    })
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

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const time = isValidTime(entryTime) ? entryTime : null

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ` ${time}` : ''})`,
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
        <div className="mb-16">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
        </div>

        {liveAlerts.length > 0 && (
          <div className="mb-16 space-y-1 uppercase tracking-widest">
            {liveAlerts.map(({ entry, stage }) => (
              <div
                key={entry.id}
                className={cn(
                  'flex justify-between gap-16 border-l-2 pl-8',
                  stage === 'standby' && 'border-acc/40 text-acc/60',
                  stage === 'execute' && 'border-acc text-acc animate-pulse',
                  stage === 'overdue' && 'border-acc/20 text-acc/40',
                )}
              >
                <span className="whitespace-nowrap tabular-nums">
                  {STAGE_LABEL[stage]} {formatCountdown(entry.ts, now)}
                </span>
                <span className="text-right flex gap-8">
                  <span className="normal-case tracking-normal">
                    {entry.type} · {entry.time ? `${entry.time} ` : ''}{entry.text}
                  </span>
                  <button className="hover:text-acc" onClick={() => handleDone(entry)}>
                    [DONE]
                  </button>
                </span>
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
                {entriesOnDate.map(e => (
                  <div key={e.id} className={cn('text-acc/80 mb-1', e.done && 'line-through text-acc/30')}>
                    {e.time && <span className="text-acc/40 tabular-nums">{e.time} </span>}
                    {e.text}
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
                  {entry.time && <span className="text-acc/40 tabular-nums"> {entry.time}</span>}
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
