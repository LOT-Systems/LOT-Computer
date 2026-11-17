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
import { useCalendarStream, useCreateLog } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import {
  type CalendarAlert,
  type CalendarEntry,
  type EntryStatus,
  type EntryType,
  TYPE_CODE,
  alertLogText,
  dueAlerts,
  entryStart,
  foldCalendar,
  formatCountdown,
  localDateKey,
  normalizeTime,
} from '#client/utils/calendar'
import { CalendarAlertToast } from './CalendarAlertToast'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const UPCOMING_LIMIT = 10
const OVERDUE_DAYS = 7
const FIRED_STORAGE_KEY = 'lot:calendar:fired'
const ALERTS_STORAGE_KEY = 'lot:calendar:alerts'

// ─── local persistence (per-device conveniences; server log is the truth) ───

function readFired(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(FIRED_STORAGE_KEY) || '{}') || {}
  } catch {
    return {}
  }
}

/** Atomic-ish claim so two tabs don't fire the same alert. */
function claimFired(key: string): boolean {
  try {
    const fired = readFired()
    if (fired[key]) return false
    fired[key] = Date.now()
    // Prune claims older than 3 days.
    const cutoff = Date.now() - 3 * 86_400_000
    for (const k of Object.keys(fired)) if (fired[k] < cutoff) delete fired[k]
    localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(fired))
    return true
  } catch {
    return true
  }
}

function readAlertsEnabled(): boolean {
  try {
    return localStorage.getItem(ALERTS_STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

// ─── signal outputs ─────────────────────────────────────────────────────────

/** Two short square-wave pips — a field-radio tone, not a chime. */
function playPips(flash: boolean) {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const pips = flash ? 3 : 2
    for (let i = 0; i < pips; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 880
      gain.gain.value = 0.04
      osc.connect(gain)
      gain.connect(ctx.destination)
      const t = ctx.currentTime + i * 0.18
      osc.start(t)
      osc.stop(t + 0.08)
    }
    setTimeout(() => ctx.close?.(), 1000)
  } catch {
    /* audio blocked until user gesture — silent is fine */
  }
}

function systemNotify(title: string, body: string, tag: string) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    new Notification(title, { body, tag, silent: true })
  } catch {
    /* some mobile browsers only allow SW notifications */
  }
}

// ─── month grid ─────────────────────────────────────────────────────────────

function getMonthWeeks(year: number, month: number): Dayjs[][] {
  const first = dayjs().year(year).month(month).startOf('month')
  const last = dayjs().year(year).month(month).endOf('month')

  const isoDay = first.day() === 0 ? 6 : first.day() - 1
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

// ─── widget ─────────────────────────────────────────────────────────────────

export function CalendarWidget() {
  const queryClient = useQueryClient()
  const { data: stream = [] } = useCalendarStream()
  const { mutate: createLog, isLoading: isSaving } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [activeEntryId, setActiveEntryId] = React.useState<string | null>(null)
  const [alertsEnabled, setAlertsEnabled] = React.useState(readAlertsEnabled)
  const [alertQueue, setAlertQueue] = React.useState<CalendarAlert[]>([])
  const [now, setNow] = React.useState(() => new Date())
  // Status changes applied locally until the stream refetch confirms them.
  const [pendingStatus, setPendingStatus] = React.useState<Record<string, EntryStatus>>({})
  // Alerts this session already logged (covers the window before refetch).
  const sessionFired = React.useRef<Set<string>>(new Set())

  const folded = React.useMemo(() => foldCalendar(stream as any), [stream])

  const entries = React.useMemo<CalendarEntry[]>(
    () =>
      folded.entries.map(e =>
        pendingStatus[e.id] ? { ...e, status: pendingStatus[e.id] } : e
      ),
    [folded.entries, pendingStatus]
  )

  const refresh = React.useCallback(() => {
    queryClient.refetchQueries(['/api/calendar'])
    queryClient.invalidateQueries(['/api/logs'])
  }, [queryClient])

  // ── clock: 1s when something is inside 24h, otherwise 30s ──
  const hasNearTimed = React.useMemo(() => {
    const t = now.getTime()
    return entries.some(e => {
      if (e.status !== 'open' || !e.time) return false
      const d = entryStart(e).getTime() - t
      return d > -3_600_000 && d < 86_400_000
    })
  }, [entries, now])

  React.useEffect(() => {
    const ms = hasNearTimed ? 1000 : 30_000
    const id = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(id)
  }, [hasNearTimed])

  // Re-sync instantly when the tab wakes (timers are throttled in background).
  React.useEffect(() => {
    const onVis = () => {
      if (!document.hidden) setNow(new Date())
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // ── alert daemon ──
  React.useEffect(() => {
    if (!alertsEnabled) return
    const fired = new Set<string>([...folded.firedAlerts, ...sessionFired.current])
    const { due, suppressed } = dueAlerts(entries, fired, now)
    suppressed.forEach(k => sessionFired.current.add(k))
    if (!due.length) return

    const fresh: CalendarAlert[] = []
    for (const { entry, phase } of due) {
      const key = `${entry.id}:${phase}`
      sessionFired.current.add(key)
      if (!claimFired(key)) continue
      const firedAt = Date.now()
      const text = alertLogText(entry, phase, new Date(firedAt))
      createLog(
        {
          text,
          event: 'calendar_alert',
          metadata: {
            entryId: entry.id,
            phase,
            date: entry.date,
            time: entry.time,
            entryType: entry.type,
            text: entry.text,
            firedAt: new Date(firedAt).toISOString(),
          },
        },
        { onSuccess: refresh }
      )
      fresh.push({ key, entryId: entry.id, phase, entry, firedAt })
    }
    if (!fresh.length) return

    setAlertQueue(q => [...q, ...fresh.filter(f => !q.some(x => x.key === f.key))])
    const flash = fresh.some(f => f.phase === 'T-0' && f.entry.type !== 'note')
    playPips(flash)
    fresh.forEach(f =>
      systemNotify(
        `LOT · ${f.phase === 'DAY' ? 'DAY OF' : f.phase} · ${TYPE_CODE[f.entry.type]}`,
        `${f.entry.text}${f.entry.time ? ` · ${f.entry.time}` : ''}`,
        f.key
      )
    )
  }, [now, entries, folded.firedAlerts, alertsEnabled])

  // Drop pending status overrides once the server stream agrees.
  React.useEffect(() => {
    setPendingStatus(p => {
      const next = { ...p }
      let changed = false
      for (const e of folded.entries) {
        if (next[e.id] && next[e.id] === e.status) {
          delete next[e.id]
          changed = true
        }
      }
      return changed ? next : p
    })
  }, [folded.entries])

  // ── derived lists ──
  const todayKey = localDateKey(now)

  const upcomingEntries = React.useMemo(
    () =>
      entries
        .filter(e => e.status === 'open' && e.date >= todayKey)
        .filter(e => !e.time || e.date > todayKey || entryStart(e).getTime() > now.getTime() - 3_600_000)
        .slice(0, UPCOMING_LIMIT),
    [entries, todayKey, now]
  )

  const overdueEntries = React.useMemo(() => {
    const cutoff = localDateKey(new Date(now.getTime() - OVERDUE_DAYS * 86_400_000))
    return entries.filter(e => {
      if (e.status !== 'open' || e.type === 'note') return false
      if (e.date < cutoff) return false
      if (e.date < todayKey) return true
      return e.date === todayKey && !!e.time && entryStart(e).getTime() <= now.getTime() - 3_600_000
    })
  }, [entries, todayKey, now])

  const entriesOnDate = React.useMemo(
    () => (selectedDate ? entries.filter(e => e.date === selectedDate) : []),
    [entries, selectedDate]
  )

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => e.status !== 'cancelled' && set.add(e.date))
    return set
  }, [entries])

  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  // ── actions ──
  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    setSelectedDate(selectedDate === key ? null : key)
    if (selectedDate === key) setIsAddingEntry(false)
  }

  const parsedTime = entryTime.trim() ? normalizeTime(entryTime) : null
  const timeInvalid = !!entryTime.trim() && !parsedTime

  const handleAddEntry = () => {
    if (!selectedDate || !entryText.trim() || timeInvalid || isSaving) return
    const text = entryText.trim()
    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const date = selectedDate

    createLog(
      {
        text: `[SCHEDULE] ${entryType}: ${text} (${dateLabel}${parsedTime ? ` ${parsedTime}` : ''})`,
        event: 'calendar_entry',
        metadata: {
          date,
          time: parsedTime,
          text,
          entryType,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
      {
        onSuccess: () => {
          refresh()
          try {
            recordCalendarSignal(entryType, date)
          } catch (_) {}
        },
      }
    )

    setEntryText('')
    setEntryTime('')
    setIsAddingEntry(false)
  }

  const setStatus = (entry: CalendarEntry, status: EntryStatus) => {
    setPendingStatus(p => ({ ...p, [entry.id]: status }))
    setActiveEntryId(null)
    setAlertQueue(q => q.filter(a => a.entryId !== entry.id))
    const label = status === 'done' ? 'DONE' : status === 'cancelled' ? 'CANCELLED' : 'REOPENED'
    createLog(
      {
        text: `[CAL] ${label} · ${TYPE_CODE[entry.type]} · ${entry.text} · ${entry.date}${entry.time ? ` ${entry.time}` : ''}`,
        event: 'calendar_status',
        metadata: {
          entryId: entry.id,
          status,
          date: entry.date,
          time: entry.time,
          entryType: entry.type,
          text: entry.text,
        },
      },
      {
        onSuccess: refresh,
        onError: () =>
          setPendingStatus(p => {
            const next = { ...p }
            delete next[entry.id]
            return next
          }),
      }
    )
  }

  const toggleAlerts = () => {
    const next = !alertsEnabled
    setAlertsEnabled(next)
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, next ? 'on' : 'off')
    } catch {}
    if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) setViewMonth(dayjs())
    setIsCalendarOpen(!isCalendarOpen)
  }

  const ack = React.useCallback((key: string) => {
    setAlertQueue(q => q.filter(a => a.key !== key))
  }, [])
  const ackAll = React.useCallback(() => setAlertQueue([]), [])

  // ── render helpers ──
  const renderEntryRow = (entry: CalendarEntry, overdue = false) => {
    const isActive = activeEntryId === entry.id
    const start = entryStart(entry)
    const delta = start.getTime() - now.getTime()
    const showCountdown = !!entry.time && delta < 86_400_000 && delta > -3_600_000
    const d = dayjs(entry.date)
    const isToday = entry.date === todayKey
    const longLabel = isToday ? 'Today' : d.format('dddd, MMMM D, YYYY')
    const shortLabel = isToday
      ? 'Today'
      : d.format(d.year() === now.getFullYear() ? 'ddd, MMM D' : 'ddd, MMM D, YYYY')

    return (
      <div key={entry.id}>
        <div
          className="flex flex-col phone:flex-row phone:justify-between phone:gap-16 cursor-pointer mb-4 phone:mb-0"
          onClick={() => setActiveEntryId(isActive ? null : entry.id)}
        >
          <span className={cn('whitespace-nowrap tabular-nums', overdue ? 'text-acc/40' : 'text-acc')}>
            <span className="hidden tablet:inline">{longLabel}</span>
            <span className="tablet:hidden">{shortLabel}</span>
            {entry.time && <span className="text-acc/40"> {entry.time}</span>}
          </span>
          <span className={cn('phone:text-right break-words min-w-0', overdue ? 'text-acc/40' : 'text-acc')}>
            {entry.text}
            {showCountdown && (
              <span className="text-acc/40 tabular-nums"> {formatCountdown(delta)}</span>
            )}
            {overdue && <span className="text-acc/40 tabular-nums"> OVERDUE</span>}
          </span>
        </div>
        {isActive && (
          <div className="flex gap-16 text-acc/40 mb-8">
            <span>{TYPE_CODE[entry.type]}</span>
            {entry.type !== 'note' && (
              <button className="hover:text-acc" onClick={() => setStatus(entry, 'done')}>
                Done
              </button>
            )}
            <button className="hover:text-acc" onClick={() => setStatus(entry, 'cancelled')}>
              {entry.type === 'note' ? 'Clear' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
    )
  }

  const nextTimed = upcomingEntries.find(
    e => e.time && entryStart(e).getTime() > now.getTime()
  )

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <CalendarAlertToast alerts={alertQueue} onAck={ack} onAckAll={ackAll} />
      <div className="w-full min-w-0">
        <div className="mb-16 flex items-center justify-between gap-16">
          <Button onClick={handleToggleCalendar}>
            {isCalendarOpen ? 'Close' : 'Add date'}
          </Button>
          <button
            className={cn(
              'tabular-nums whitespace-nowrap transition-opacity',
              alertsEnabled ? 'text-acc/40 hover:text-acc' : 'text-acc/20 hover:text-acc/40'
            )}
            onClick={toggleAlerts}
            title="Calendar alerts: T-15, T-0 and day-of"
          >
            {alertsEnabled
              ? nextTimed
                ? `NEXT ${formatCountdown(entryStart(nextTimed).getTime() - now.getTime())}`
                : 'Alerts on'
              : 'Alerts off'}
          </button>
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

            <div className="overflow-x-auto">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex gap-0">
                  {week.map((d, di) => {
                    const key = d.format('YYYY-MM-DD')
                    const isToday = key === todayKey
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
                <div className="flex flex-wrap gap-8 items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddEntry()
                    }}
                    placeholder="HH:MM"
                    aria-label="Time (optional)"
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5.5em] outline-none tabular-nums',
                      timeInvalid ? 'border-acc' : 'border-acc/20 focus:border-acc/40'
                    )}
                  />
                  <input
                    type="text"
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddEntry()
                      if (e.key === 'Escape') setIsAddingEntry(false)
                    }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-[8em] outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <Button onClick={handleAddEntry} disabled={!entryText.trim() || timeInvalid || isSaving}>
                    Add
                  </Button>
                </div>
                {timeInvalid && <div className="text-acc/40 mt-4">Time format: HH:MM</div>}
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">{dayjs(selectedDate).format('dddd, MMMM D')}</div>
                {entriesOnDate.map(e => (
                  <div
                    key={e.id}
                    className={cn(
                      'flex gap-8',
                      e.status === 'open' ? 'text-acc/80' : 'text-acc/30',
                      e.status === 'cancelled' && 'line-through'
                    )}
                  >
                    {e.time && <span className="tabular-nums text-acc/40">{e.time}</span>}
                    <span>{e.text}</span>
                    {e.status === 'done' && <span className="text-acc/40">✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {overdueEntries.length > 0 && (
          <div className="mb-8">{overdueEntries.map(e => renderEntryRow(e, true))}</div>
        )}

        {upcomingEntries.length > 0 && <div>{upcomingEntries.map(e => renderEntryRow(e))}</div>}

        {upcomingEntries.length === 0 && overdueEntries.length === 0 && !isCalendarOpen && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
