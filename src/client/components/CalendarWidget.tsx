/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useStore } from '@nanostores/react'
import { Block, Button } from '#client/components/ui'
import { useCreateLog, useLogs } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import { isSoundOn } from '#client/stores/state'
import {
  type CalendarAlert,
  type CalendarEntry,
  type EntryStatus,
  type EntryType,
  ENTRY_TYPES,
  alertLogText,
  dueAlerts,
  entryMoment,
  firedFromLogs,
  formatTShort,
  getMonthWeeks,
  loadFired,
  nextAlertAt,
  normalizeTime,
  parseEntries,
  saveFired,
  typeCode,
} from '#client/utils/calendar'
import { CalendarAlertStack, playAlertPips, systemNotify } from './CalendarAlert'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const TICK_MS = 15 * 1000
/** Open tasks/calls stay visible as OVERDUE for this many days. */
const OVERDUE_DAYS = 7

export function CalendarWidget() {
  const queryClient = useQueryClient()
  const { data: logs = [], isFetched } = useLogs()
  const { mutate: createLog } = useCreateLog()
  const soundOn = useStore(isSoundOn)

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [timeError, setTimeError] = React.useState(false)
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [openRow, setOpenRow] = React.useState<string | null>(null)
  const [now, setNow] = React.useState(() => Date.now())
  // Optimistic status until the log refetch lands
  const [statusOverride, setStatusOverride] = React.useState<Record<string, EntryStatus>>({})
  const [activeAlerts, setActiveAlerts] = React.useState<(CalendarAlert & { seq: number })[]>([])
  const seqRef = React.useRef(0)
  const [notifyPerm, setNotifyPerm] = React.useState<NotificationPermission | 'unsupported'>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  )

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return parseEntries(logs as any[]).map(e =>
      statusOverride[e.id] ? { ...e, status: statusOverride[e.id] } : e
    )
  }, [logs, statusOverride])

  const today = dayjs(now).format('YYYY-MM-DD')

  const upcomingEntries = React.useMemo(() => {
    const overdueFloor = dayjs(now).subtract(OVERDUE_DAYS, 'day').format('YYYY-MM-DD')
    return entries
      .filter(e => e.status === 'open')
      .filter(e => {
        if (e.date >= today) return true
        // Past notes simply expire; past tasks/calls stay as OVERDUE
        return e.type !== 'note' && e.date >= overdueFloor
      })
      .slice(0, 10)
  }, [entries, today, now])

  const nextTimed = React.useMemo(() => {
    return upcomingEntries.find(e => e.time && entryMoment(e).valueOf() > now) || null
  }, [upcomingEntries, now])

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter(e => e.date === selectedDate)
  }, [entries, selectedDate])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => e.status === 'open' && set.add(e.date))
    return set
  }, [entries])

  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  // ── Log writers ────────────────────────────────────────────────────────────

  const refetchLogs = React.useCallback(() => {
    queryClient.refetchQueries(['/api/logs'])
  }, [queryClient])

  const closeEntry = React.useCallback(
    (entry: CalendarEntry, status: 'done' | 'cancelled') => {
      setStatusOverride(prev => ({ ...prev, [entry.id]: status }))
      const tag = status === 'done' ? 'DONE' : 'SCRUB'
      createLog(
        {
          text: `[CAL//${tag}] ${typeCode(entry.type)} · ${entry.text} (${entry.date}${entry.time ? ' ' + entry.time : ''})`,
          event: status === 'done' ? 'calendar_done' : 'calendar_cancel',
          metadata: {
            entryId: entry.id,
            date: entry.date,
            time: entry.time,
            text: entry.text,
            entryType: entry.type,
          },
        },
        {
          onSuccess: refetchLogs,
          onError: () =>
            setStatusOverride(prev => {
              const next = { ...prev }
              delete next[entry.id]
              return next
            }),
        }
      )
    },
    [createLog, refetchLogs]
  )

  // ── Alert scheduler ────────────────────────────────────────────────────────

  const entriesRef = React.useRef(entries)
  entriesRef.current = entries
  const logsRef = React.useRef(logs)
  logsRef.current = logs
  const soundRef = React.useRef(soundOn)
  soundRef.current = soundOn

  const runScheduler = React.useCallback(() => {
    const t = Date.now()
    setNow(t)
    const fired = loadFired()
    // Alerts already logged (on any device) count as fired
    firedFromLogs(logsRef.current as any[]).forEach(k => fired.add(k))
    const due = dueAlerts(entriesRef.current, t, fired)
    if (!due.length) return

    due.forEach(a => fired.add(a.key))
    saveFired(fired)

    setActiveAlerts(prev => {
      const known = new Set(prev.map(p => p.key))
      // A newer stage for the same entry replaces the older card
      const ids = new Set(due.map(d => d.entry.id))
      const kept = prev.filter(p => !ids.has(p.entry.id))
      const added = due
        .filter(d => !known.has(d.key))
        .map(d => ({ ...d, seq: ++seqRef.current }))
      return [...kept, ...added]
    })

    const loud = due.some(a => a.stage === 'now')
    if (soundRef.current) playAlertPips(loud)
    due.forEach(a => {
      systemNotify(a)
      // EXECUTE + DAY-OF are recorded in the Log; T-15 pre-alerts are transient
      if (a.stage === 'pre') return
      createLog(
        {
          text: alertLogText(a),
          event: 'calendar_alert',
          metadata: {
            entryId: a.entry.id,
            stage: a.stage,
            date: a.entry.date,
            time: a.entry.time,
            text: a.entry.text,
            entryType: a.entry.type,
            firedAt: new Date(t).toISOString(),
          },
        },
        { onSuccess: refetchLogs }
      )
    })
  }, [createLog, refetchLogs])

  React.useEffect(() => {
    // Wait for the first log load so fired-state from the Log is known
    if (!isFetched) return
    runScheduler()
    const interval = setInterval(runScheduler, TICK_MS)
    const onVis = () => {
      if (!document.hidden) runScheduler()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [isFetched, runScheduler])

  // Precise wake for the next alert so it lands on the second, not the tick
  const nextAt = React.useMemo(() => nextAlertAt(entries, now), [entries, now])
  React.useEffect(() => {
    if (!isFetched || nextAt === null) return
    const delay = nextAt - Date.now()
    if (delay <= 0 || delay > TICK_MS) return
    const t = setTimeout(runScheduler, delay + 50)
    return () => clearTimeout(t)
  }, [isFetched, nextAt, runScheduler])

  // Drop cards whose entry was closed elsewhere
  React.useEffect(() => {
    setActiveAlerts(prev => {
      const next = prev.filter(a => {
        const e = entries.find(x => x.id === a.entry.id)
        return !e || e.status === 'open'
      })
      return next.length === prev.length ? prev : next
    })
  }, [entries])

  const ackAlert = React.useCallback((key: string) => {
    setActiveAlerts(prev => prev.filter(a => a.key !== key))
  }, [])

  const doneFromAlert = React.useCallback(
    (alert: CalendarAlert) => {
      ackAlert(alert.key)
      const e = entriesRef.current.find(x => x.id === alert.entry.id) || alert.entry
      if (e.status === 'open') closeEntry(e, 'done')
    },
    [ackAlert, closeEntry]
  )

  const requestNotify = () => {
    if (typeof Notification === 'undefined') return
    Notification.requestPermission()
      .then(p => setNotifyPerm(p))
      .catch(() => {})
  }

  // ── UI handlers ────────────────────────────────────────────────────────────

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    setIsAddingEntry(false)
    setSelectedDate(selectedDate === key ? null : key)
  }

  const handleAddEntry = () => {
    if (!selectedDate || !entryText.trim()) return
    const time = normalizeTime(entryTime)
    if (time === undefined) {
      setTimeError(true)
      return
    }
    const text = entryText.trim()
    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const date = selectedDate

    createLog(
      {
        text: `[SCHEDULE] ${entryType}: ${text} (${dateLabel}${time ? ' ' + time : ''})`,
        event: 'calendar_entry',
        metadata: { date, time, text, entryType },
      },
      {
        onSuccess: () => {
          refetchLogs()
          try {
            recordCalendarSignal(entryType, date)
          } catch (_) {}
        },
      }
    )

    setEntryText('')
    setEntryTime('')
    setTimeError(false)
    setIsAddingEntry(false)
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) setViewMonth(dayjs())
    setIsCalendarOpen(!isCalendarOpen)
  }

  const renderActions = (e: CalendarEntry) => (
    <span className="flex gap-8 whitespace-nowrap">
      {e.type !== 'note' && (
        <button className="text-acc/40 hover:text-acc" onClick={() => closeEntry(e, 'done')}>
          Done
        </button>
      )}
      <button className="text-acc/40 hover:text-acc" onClick={() => closeEntry(e, 'cancelled')}>
        Cancel
      </button>
    </span>
  )

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <CalendarAlertStack alerts={activeAlerts} onAck={ackAlert} onDone={doneFromAlert} />

      <div className="w-full">
        <div className="mb-16 flex items-baseline justify-between gap-16">
          <Button onClick={handleToggleCalendar}>Add date</Button>
          {nextTimed && (
            <span className="text-acc/40 tabular-nums uppercase tracking-widest whitespace-nowrap">
              Next {nextTimed.time} · {formatTShort(entryMoment(nextTimed).valueOf(), now)}
            </span>
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
              <span className="text-acc">{viewMonth.format('MMMM, YYYY')}</span>
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
                          'transition-opacity whitespace-nowrap',
                          'min-w-[2.5em] text-left',
                          isToday && 'font-bold',
                          isSelected && 'underline',
                          !isCurrentMonth && 'text-acc/20',
                          isCurrentMonth && !isToday && 'text-acc/40',
                          isToday && 'text-acc',
                          hasEntry && isCurrentMonth && !isToday && 'text-acc/80'
                        )}
                      >
                        {DAY_LETTERS[di]}
                        {d.date()}
                        {hasEntry ? '·' : ''}
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
                  {ENTRY_TYPES.map(t => (
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
                    onChange={e => {
                      setEntryTime(e.target.value)
                      setTimeError(false)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddEntry()
                    }}
                    placeholder="HH:MM"
                    aria-label="Time (optional, 24h)"
                    maxLength={5}
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[4.5em] outline-none tabular-nums',
                      timeError ? 'border-acc' : 'border-acc/20 focus:border-acc/40'
                    )}
                  />
                  <input
                    type="text"
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddEntry()
                    }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-0 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <Button onClick={handleAddEntry}>Add</Button>
                </div>
                {timeError && (
                  <div className="mt-4 text-acc/60">Time must be 24h, e.g. 09:30. Leave empty for all day.</div>
                )}
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">{dayjs(selectedDate).format('dddd, MMMM D')}</div>
                {entriesOnDate.map(e => (
                  <div key={e.id} className="flex justify-between gap-16 mb-1">
                    <span
                      className={cn(
                        e.status === 'open' ? 'text-acc/80' : 'text-acc/30',
                        e.status === 'cancelled' && 'line-through'
                      )}
                    >
                      <span className="tabular-nums text-acc/40 mr-8">{e.time || '——:——'}</span>
                      {e.text}
                    </span>
                    {e.status === 'open' ? (
                      renderActions(e)
                    ) : (
                      <span className="text-acc/30 uppercase tracking-widest">
                        {e.status === 'done' ? 'Done' : 'Scrub'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {notifyPerm === 'default' && (
              <div className="mt-8">
                <button className="text-acc/30 hover:text-acc/60" onClick={requestNotify}>
                  Enable system alerts
                </button>
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map(entry => {
              const overdue = entry.date < today
              const isOpen = openRow === entry.id
              return (
                <div key={entry.id} className="flex justify-between gap-16">
                  <span className={cn('whitespace-nowrap', overdue ? 'text-acc/60' : 'text-acc')}>
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="tabular-nums"> {entry.time}</span>}
                    {overdue && <span className="uppercase tracking-widest text-acc/40"> Overdue</span>}
                  </span>
                  {isOpen ? (
                    <span className="flex gap-16 items-baseline">
                      {renderActions(entry)}
                      <button className="text-acc/40 hover:text-acc" onClick={() => setOpenRow(null)}>
                        ×
                      </button>
                    </span>
                  ) : (
                    <button
                      className={cn('text-right', overdue ? 'text-acc/60' : 'text-acc')}
                      onClick={() => setOpenRow(entry.id)}
                    >
                      {entry.text}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {upcomingEntries.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
