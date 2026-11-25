/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { createPortal } from 'react-dom'
import { useQueryClient } from 'react-query'
import { Block, Button } from '#client/components/ui'
import { useCalendarLogs, useCreateLog } from '#client/queries'
import type { CalendarLogRecord } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import {
  CalendarAlert,
  CalendarEntry,
  DEFAULT_LEAD_MIN,
  ENTRY_TYPES,
  EntryStatus,
  EntryType,
  LEAD_OPTIONS,
  alertLogText,
  deriveEntries,
  dueAlerts,
  entryMoment,
  firedKeysFromLogs,
  formatCountdown,
  nextAlertAt,
  normalizeTime,
  phaseLabel,
  readLedger,
  readSysNotify,
  writeLedger,
  writeSysNotify,
} from '#client/utils/calendar'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const CAL_KEY = ['/api/calendar']
const MAX_TOASTS = 3

function getMonthWeeks(year: number, month: number): Dayjs[][] {
  const first = dayjs(new Date(year, month, 1))
  const last = first.endOf('month')
  const isoDay = first.day() === 0 ? 6 : first.day() - 1
  let current = first.subtract(isoDay, 'day')

  const weeks: Dayjs[][] = []
  while (!current.isAfter(last, 'day') || weeks.length < 5) {
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

/** Re-render on an interval; used for live countdowns. */
function useNow(intervalMs: number, enabled = true) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, enabled])
  return now
}

function playTone() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    ;[0, 0.18].forEach((t) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.12)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 0.13)
    })
    setTimeout(() => ctx.close?.(), 600)
  } catch {}
}

function systemNotify(a: CalendarAlert) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const e = a.entry
    const n = new Notification(`CAL-ALERT // ${phaseLabel(a.phase)}`, {
      body: `${e.type.toUpperCase()}: ${e.text}${e.time ? ` · ${e.time}` : ''}`,
      tag: a.key,
      silent: true,
    })
    n.onclick = () => { window.focus(); n.close() }
  } catch {}
}

/**
 * Alert engine. Sleeps until the next possible alert (capped at 30s so clock
 * drift, sleep/wake and throttled background tabs are always caught up), and
 * re-checks immediately whenever the tab becomes visible again.
 */
function useCalendarAlerts(
  entries: CalendarEntry[],
  firedFromLogs: Set<string>,
  ready: boolean,
  onFire: (alerts: CalendarAlert[]) => void
) {
  const ledgerRef = React.useRef<Set<string>>(readLedger())
  const onFireRef = React.useRef(onFire)
  onFireRef.current = onFire

  React.useEffect(() => {
    if (!ready) return
    let timer: ReturnType<typeof setTimeout> | undefined

    const fired = () => {
      const s = new Set(ledgerRef.current)
      firedFromLogs.forEach((k) => s.add(k))
      return s
    }

    const tick = () => {
      clearTimeout(timer)
      const now = new Date()
      const due = dueAlerts(entries, now, fired())
      if (due.length) {
        due.forEach((a) => ledgerRef.current.add(a.key))
        writeLedger(ledgerRef.current)
        onFireRef.current(due)
      }
      const next = nextAlertAt(entries, new Date(), fired())
      const delay = next === null ? 30000 : Math.max(500, Math.min(30000, next - Date.now() + 250))
      timer = setTimeout(tick, delay)
    }

    tick()
    const onVisible = () => { if (!document.hidden) tick() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [entries, firedFromLogs, ready])
}

export function CalendarWidget() {
  const queryClient = useQueryClient()
  const { data: calLogs = [], isSuccess } = useCalendarLogs()
  const { mutate: createLog, isLoading: isSaving } = useCreateLog()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs().startOf('month'))
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryLead, setEntryLead] = React.useState(DEFAULT_LEAD_MIN)
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [error, setError] = React.useState<string | null>(null)
  const [toasts, setToasts] = React.useState<CalendarAlert[]>([])
  const [sysNotify, setSysNotify] = React.useState(readSysNotify)

  const entries = React.useMemo(() => deriveEntries(calLogs), [calLogs])
  const firedFromLogs = React.useMemo(() => firedKeysFromLogs(calLogs), [calLogs])

  const now = useNow(1000)
  const today = dayjs(now).format('YYYY-MM-DD')

  /** Append a freshly-created log to the calendar cache so the UI never waits on a refetch. */
  const appendToCache = React.useCallback((log: any) => {
    if (!log?.id) return
    queryClient.setQueryData<CalendarLogRecord[]>(CAL_KEY, (prev = []) =>
      prev.some((l) => l.id === log.id) ? prev : [
        { id: log.id, event: log.event, text: log.text, metadata: log.metadata || {}, createdAt: log.createdAt || new Date().toISOString() },
        ...prev,
      ]
    )
    queryClient.invalidateQueries(['/api/logs'])
  }, [queryClient])

  const writeLog = React.useCallback(
    (payload: { text: string; event: string; metadata: Record<string, any> }, onDone?: () => void) => {
      createLog(payload, {
        onSuccess: (log) => { appendToCache(log); setError(null); onDone?.() },
        onError: () => setError('ERR // NOT LOGGED — RETRY'),
      })
    },
    [createLog, appendToCache]
  )

  const handleFire = React.useCallback((alerts: CalendarAlert[]) => {
    // A newer phase for the same entry supersedes the older toast (EXECUTE replaces STANDBY)
    setToasts((prev) => [...alerts, ...prev.filter((t) => !alerts.some((a) => a.entry.id === t.entry.id))].slice(0, MAX_TOASTS))
    if (readSysNotify()) {
      playTone()
      alerts.forEach(systemNotify)
    }
    alerts.forEach((a) => {
      const e = a.entry
      writeLog({
        text: alertLogText(a),
        event: 'calendar_alert',
        metadata: { entryId: e.id, phase: a.phase, offset: a.offset, date: e.date, time: e.time, text: e.text, entryType: e.type, lead: e.lead },
      })
    })
  }, [writeLog])

  useCalendarAlerts(entries, firedFromLogs, isSuccess, handleFire)

  const setStatus = React.useCallback((e: CalendarEntry, status: EntryStatus) => {
    const verb = status === 'done' ? 'DONE' : status === 'cancelled' ? 'CANCELLED' : 'RESTORED'
    writeLog({
      text: `[SCHEDULE] ${verb} · ${e.type}: ${e.text} (${e.date}${e.time ? ` ${e.time}` : ''})`,
      event: 'calendar_status',
      metadata: { entryId: e.id, status, date: e.date, time: e.time, text: e.text, entryType: e.type },
    })
    if (status !== 'active') setToasts((prev) => prev.filter((t) => t.entry.id !== e.id))
  }, [writeLog])

  const upcomingEntries = React.useMemo(() => {
    const nowMs = now
    return entries
      .filter((e) => e.status === 'active' && e.date >= today)
      // Timed entries today drop off 30 minutes after they start
      .filter((e) => !(e.time && e.date === today && entryMoment(e).valueOf() + 30 * 60000 < nowMs))
      .slice(0, 10)
  }, [entries, today, now])

  const entriesOnDate = React.useMemo(
    () => (selectedDate ? entries.filter((e) => e.date === selectedDate) : []),
    [entries, selectedDate]
  )

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => { if (e.status === 'active') set.add(e.date) })
    return set
  }, [entries])

  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    setSelectedDate(selectedDate === key ? null : key)
    if (selectedDate === key) setIsAddingEntry(false)
    setError(null)
  }

  const handleAddEntry = () => {
    const text = entryText.trim()
    if (!selectedDate || !text || isSaving) return
    const time = entryTime.trim() ? normalizeTime(entryTime) : null
    if (entryTime.trim() && !time) {
      setError('ERR // TIME FORMAT HH:MM')
      return
    }
    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')
    const date = selectedDate

    writeLog({
      text: `[SCHEDULE] ${entryType}: ${text} (${dateLabel}${time ? ` ${time}` : ''})`,
      event: 'calendar_entry',
      metadata: { date, text, entryType, ...(time ? { time, lead: entryLead } : {}) },
    }, () => {
      try { recordCalendarSignal(entryType, date) } catch (_) {}
      setEntryText('')
      setEntryTime('')
      setIsAddingEntry(false)
    })
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) setViewMonth(dayjs().startOf('month'))
    setIsCalendarOpen(!isCalendarOpen)
  }

  const handleToggleSysNotify = async () => {
    const next = !sysNotify
    if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try { await Notification.requestPermission() } catch {}
    }
    writeSysNotify(next)
    setSysNotify(next)
    if (next) playTone()
  }

  const dismissToast = (key: string) => setToasts((prev) => prev.filter((t) => t.key !== key))

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
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
                          hasEntry && isCurrentMonth && !isToday && 'text-acc/80',
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
                  {ENTRY_TYPES.map((t) => (
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
                    onChange={(e) => setEntryTime(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    aria-label="Time (optional)"
                    maxLength={5}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 w-[5.5em] tabular-nums outline-none focus:border-acc/40"
                  />
                  <input
                    type="text"
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-0 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <Button onClick={handleAddEntry} disabled={isSaving || !entryText.trim()}>Add</Button>
                </div>
                {entryTime.trim() && (
                  <div className="flex gap-8 mt-8 text-acc/40 tabular-nums">
                    <span>Alert</span>
                    {LEAD_OPTIONS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setEntryLead(m)}
                        className={cn('transition-opacity', entryLead === m ? 'text-acc' : 'hover:text-acc/60')}
                      >
                        {m === 0 ? 'T-0' : `-${m}m`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && <div className="mt-8 text-acc/60 uppercase tracking-widest">{error}</div>}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map((e) => (
                  <div key={e.id} className="flex justify-between gap-16 mb-1 group">
                    <span className={cn('text-acc/80', e.status !== 'active' && 'line-through text-acc/30')}>
                      {e.time && <span className="tabular-nums mr-8">{e.time}</span>}
                      {e.text}
                    </span>
                    <span className="flex gap-8 text-acc/30 whitespace-nowrap">
                      {e.status === 'active' ? (
                        <>
                          <button className="hover:text-acc transition-opacity" onClick={() => setStatus(e, 'done')}>Done</button>
                          <button className="hover:text-acc transition-opacity" onClick={() => setStatus(e, 'cancelled')}>Cancel</button>
                        </>
                      ) : (
                        <button className="hover:text-acc transition-opacity" onClick={() => setStatus(e, 'active')}>
                          {e.status === 'done' ? 'Done' : 'Cancelled'} · Undo
                        </button>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <button
                className="text-acc/30 hover:text-acc/60 transition-opacity"
                onClick={handleToggleSysNotify}
              >
                System alerts: {sysNotify ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry) => {
              const isToday = entry.date === today
              const t = entry.time ? entryMoment(entry).valueOf() : null
              const live = isToday && t !== null && t - now < 6 * 3600000
              return (
                <div key={entry.id} className="flex justify-between gap-16">
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                    {entry.time && <span className="tabular-nums">{` · ${entry.time}`}</span>}
                  </span>
                  <span className="text-acc text-right">
                    {live && <span className="tabular-nums text-acc/40 mr-8">{formatCountdown(t!, now)}</span>}
                    {entry.text}
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

      {toasts.length > 0 && (
        <CalendarAlertStack
          toasts={toasts}
          now={now}
          onAck={dismissToast}
          onDone={(a) => { setStatus(a.entry, 'done'); dismissToast(a.key) }}
        />
      )}
    </Block>
  )
}

function CalendarAlertStack({
  toasts,
  now,
  onAck,
  onDone,
}: {
  toasts: CalendarAlert[]
  now: number
  onAck: (key: string) => void
  onDone: (a: CalendarAlert) => void
}) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      role="alert"
      aria-live="assertive"
      className="fixed z-50 bottom-16 left-16 right-16 sm:left-auto sm:w-[360px] flex flex-col gap-8"
    >
      {toasts.map((a) => {
        const e = a.entry
        const target = e.time ? entryMoment(e).valueOf() : null
        return (
          <div
            key={a.key}
            className="border border-acc/40 bg-bac text-acc px-16 py-8 tabular-nums"
            style={{ animation: 'lotCalAlertIn 0.25s ease-out' }}
          >
            <div className="flex justify-between text-acc/40 uppercase tracking-widest">
              <span>
                <span className="inline-block w-[0.6em] h-[0.6em] bg-acc mr-8 align-middle" style={{ animation: 'lotCalBlink 1s steps(1) infinite' }} />
                CAL-ALERT // {phaseLabel(a.phase)}
              </span>
              <span>{dayjs(now).format('HH:mm:ss')}</span>
            </div>
            <div className="flex justify-between mt-8 uppercase tracking-widest">
              <span>{e.type}</span>
              <span>{target !== null ? formatCountdown(target, now) : 'DAY-OF'}</span>
            </div>
            <div className="mt-4 break-words">{e.text}</div>
            <div className="mt-4 text-acc/40 uppercase">
              {dayjs(e.date).format('ddd D MMM YYYY')}{e.time ? ` · ${e.time} LCL` : ''}
            </div>
            <div className="flex gap-16 mt-8 uppercase tracking-widest">
              <button className="uppercase tracking-widest text-acc/60 hover:text-acc transition-opacity" onClick={() => onAck(a.key)}>Ack</button>
              {e.type !== 'note' && (
                <button className="uppercase tracking-widest text-acc/60 hover:text-acc transition-opacity" onClick={() => onDone(a)}>Done</button>
              )}
            </div>
          </div>
        )
      })}
    </div>,
    document.body
  )
}

if (typeof document !== 'undefined' && !document.getElementById('lot-cal-alert-style')) {
  const style = document.createElement('style')
  style.id = 'lot-cal-alert-style'
  style.textContent = `
    @keyframes lotCalAlertIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
    @keyframes lotCalBlink { 0% { opacity: 1 } 50% { opacity: 0 } }
    @media (prefers-reduced-motion: reduce) {
      [style*="lotCalAlertIn"], [style*="lotCalBlink"] { animation: none !important }
    }
  `
  document.head.appendChild(style)
}
