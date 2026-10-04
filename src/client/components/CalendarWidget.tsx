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
  alertKey,
  compareEntries,
  dueAlerts,
  entryStartMs,
  formatAlertText,
  formatCountdown,
  isValidDate,
  isValidTime,
  normalizeTime,
  STAGE_LABEL,
} from '#client/utils/calendarEngine'
import type { AlertStage, CalendarEntry, EntryType } from '#client/utils/calendarEngine'

// Alerts older than this are shown in the panel but never re-logged/notified on load.
const CATCHUP_MS = 2 * 60 * 60 * 1000

function playAlertTone(stage: AlertStage) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const beeps = stage === 'T-00' || stage === 'MISS' ? 2 : 1
    for (let i = 0; i < beeps; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t = ctx.currentTime + i * 0.22
      osc.type = 'square'
      osc.frequency.value = stage === 'MISS' ? 440 : 880
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.04, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.16)
    }
    setTimeout(() => ctx.close().catch(() => {}), 1000)
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
  const { data: logs = [], isFetched } = useLogs()
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
  const [notifPerm, setNotifPerm] = React.useState<string>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  )

  // Clock: 1s tick drives countdowns and the alert scheduler.
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: log.id,
        date: log.metadata?.date as string,
        time: isValidTime(log.metadata?.time) ? (log.metadata.time as string) : null,
        text: (log.metadata?.text as string) || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => isValidDate(e.date) && e.text)
      .sort(compareEntries)
  }, [logs])

  // Durable state lives in the log stream itself: acknowledged + already-fired alerts.
  const doneIds = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(l => {
      if (l.event === 'calendar_done' && l.metadata?.entryId) set.add(l.metadata.entryId as string)
    })
    return set
  }, [logs])

  const firedKeys = React.useMemo(() => {
    const set = new Set<string>()
    logs.forEach(l => {
      if (l.event === 'calendar_alert' && l.metadata?.entryId && l.metadata?.stage) {
        set.add(alertKey(l.metadata.entryId as string, l.metadata.stage as AlertStage))
      }
    })
    return set
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const todayKey = dayjs(now).format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= todayKey && !doneIds.has(e.id))
      .slice(0, 10)
  }, [entries, doneIds, now])

  const activeAlerts = React.useMemo(() => {
    const todayKey = dayjs(now).format('YYYY-MM-DD')
    const byId = new Map(entries.map(e => [e.id, e]))
    return dueAlerts(entries, now, new Set(), doneIds)
      .filter(a => a.stage !== 'DAY' || byId.get(a.entryId)?.date === todayKey)
      .map(a => ({ ...a, entry: byId.get(a.entryId)! }))
  }, [entries, doneIds, now])

  // Scheduler: fire each due stage exactly once → Log + tone + system notification.
  React.useEffect(() => {
    if (!isFetched) return // wait for log history so fired state is known
    const fresh = dueAlerts(entries, now, new Set([...firedKeys, ...firedRef.current]), doneIds)
    if (!fresh.length) return
    let logged = false
    for (const a of fresh) {
      const entry = entries.find(e => e.id === a.entryId)
      if (!entry) continue
      firedRef.current.add(alertKey(a.entryId, a.stage))
      if (now - a.at > CATCHUP_MS) continue
      const text = formatAlertText(entry, a.stage)
      logged = true
      createLog({
        text,
        event: 'calendar_alert',
        metadata: { entryId: entry.id, stage: a.stage, date: entry.date, time: entry.time, entryType: entry.type },
      })
      playAlertTone(a.stage)
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`${STAGE_LABEL[a.stage]} · ${entry.type.toUpperCase()}`, {
            body: `${entry.time ? entry.time + ' · ' : ''}${entry.text}`,
            tag: alertKey(entry.id, a.stage),
          })
        }
      } catch (_) {}
    }
    if (logged) setTimeout(() => queryClient.refetchQueries(['/api/logs']), 1500)
  }, [now, entries, firedKeys, doneIds, isFetched])

  const handleAck = (entry: CalendarEntry) => {
    createLog({
      text: `[ACK] ${entry.type.toUpperCase()} · ${entry.time ? entry.time + ' · ' : ''}${entry.text} (${entry.date})`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, time: entry.time, entryType: entry.type },
    }, {
      onSuccess: () => queryClient.refetchQueries(['/api/logs']),
    })
  }

  const handleEnableAlerts = async () => {
    try {
      const perm = await Notification.requestPermission()
      setNotifPerm(perm)
    } catch (_) {}
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
    const time = normalizeTime(entryTime)
    if (entryTime.trim() && !time) return // invalid time: keep form open

    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ', ' + time : ''})`,
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
          <div className="flex gap-8 items-center">
            <Button onClick={handleToggleCalendar}>
              Add date
            </Button>
            {notifPerm === 'default' && (
              <Button onClick={handleEnableAlerts}>
                Enable alerts
              </Button>
            )}
          </div>
        </div>

        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-1">
            {activeAlerts.map(a => (
              <div
                key={alertKey(a.entryId, a.stage)}
                className={cn(
                  'flex justify-between gap-16 text-acc uppercase tracking-widest',
                  (a.stage === 'T-00' || a.stage === 'MISS') && 'animate-pulse'
                )}
              >
                <span className="whitespace-nowrap tabular-nums">
                  {'▲'} {STAGE_LABEL[a.stage]} · {a.entry.type}
                  {a.entry.time ? ` · ${a.entry.time}` : ''}
                </span>
                <span className="flex gap-8 text-right normal-case tracking-normal">
                  <span>{a.entry.text}</span>
                  <button
                    className="text-acc/40 hover:text-acc transition-opacity uppercase tracking-widest"
                    onClick={() => handleAck(a.entry)}
                  >
                    Ack
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
                    type="text"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    maxLength={5}
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5.5em] outline-none tabular-nums',
                      entryTime.trim() && !normalizeTime(entryTime)
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
                  <div key={i} className={cn('mb-1', doneIds.has(e.id) ? 'text-acc/30 line-through' : 'text-acc/80')}>
                    {e.time && <span className="tabular-nums">{e.time} </span>}
                    {e.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry, i) => {
              const start = entryStartMs(entry)
              const soon = entry.time && start - now > 0 && start - now < 24 * 60 * 60 * 1000
              return (
                <div key={entry.id} className="flex justify-between gap-16">
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="tabular-nums"> · {entry.time}</span>}
                    {soon && i === 0 && (
                      <span className="text-acc/40 tabular-nums"> · {formatCountdown(start, now)}</span>
                    )}
                  </span>
                  <span className="text-acc text-right">
                    {entry.text}
                    {entry.date <= today && (
                      <button
                        className="text-acc/30 hover:text-acc transition-opacity ml-8"
                        onClick={() => handleAck(entry)}
                        title="Mark done"
                      >
                        {'✓'}
                      </button>
                    )}
                  </span>
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
