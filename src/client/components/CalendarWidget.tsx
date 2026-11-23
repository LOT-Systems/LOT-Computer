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
import { useCalendarFeed, useCreateLog } from '#client/queries'
import type { CalendarFeedLog } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import {
  AlertPhase,
  CalendarEntry,
  ENTRY_TYPES,
  EntryType,
  alertKey,
  countdown,
  deriveEntries,
  dueAlerts,
  firedAlertKeys,
  getMonthWeeks,
  isOverdue,
  normalizeTime,
  typeCode,
} from '#client/utils/calendar'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const FEED_KEY = ['/api/calendar']
const FIRED_STORAGE_KEY = 'lot:calendar:fired'
const TICK_MS = 15 * 1000
/** How far back open, overdue entries remain visible in the list. */
const OVERDUE_WINDOW_DAYS = 7
const LIST_LIMIT = 10

type ActiveAlert = { key: string; entry: CalendarEntry; phase: AlertPhase }

// ─── Clock ────────────────────────────────────────────────────────────────────
// Ticks every 15s and on tab focus, so countdowns, "today" and alert checks
// never go stale when the widget stays open across midnight.
function useNow(): Dayjs {
  const [now, setNow] = React.useState(() => dayjs())
  React.useEffect(() => {
    const tick = () => setNow(dayjs())
    const id = window.setInterval(tick, TICK_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  return now
}

// ─── Local alert ledger (cross-tab de-duplication) ───────────────────────────
function readFired(): Set<string> {
  try {
    const raw = window.localStorage.getItem(FIRED_STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr : [])
  } catch (_) {
    return new Set()
  }
}

function writeFired(key: string) {
  try {
    const set = readFired()
    set.add(key)
    // Keep the ledger bounded.
    const arr = Array.from(set).slice(-300)
    window.localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(arr))
  } catch (_) {}
}

function releaseFired(key: string) {
  try {
    const set = readFired()
    if (!set.delete(key)) return
    window.localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(Array.from(set)))
  } catch (_) {}
}

function systemNotify(title: string, body: string) {
  try {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    // eslint-disable-next-line no-new
    new Notification(title, { body, tag: title, silent: false })
  } catch (_) {}
}

export function CalendarWidget() {
  const queryClient = useQueryClient()
  const { data: feed = [], isError: feedError, refetch: refetchFeed } = useCalendarFeed()
  // Two mutation channels: entry creation (tracks its own loading state) and
  // system writes (alerts / status). mutateAsync resolves per-call, so
  // concurrent alert writes each land in the cache.
  const { mutate: createEntry, isLoading: isSaving } = useCreateLog()
  const { mutateAsync: postLog } = useCreateLog()
  const now = useNow()

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs().startOf('month'))
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<EntryType>('note')
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [activeAlerts, setActiveAlerts] = React.useState<ActiveAlert[]>([])
  const [armedId, setArmedId] = React.useState<string | null>(null)
  const sessionFired = React.useRef<Set<string>>(new Set())
  // Banners surface once per session per alert, even if the Log write retries.
  const bannerShown = React.useRef<Set<string>>(new Set())

  const entries = React.useMemo(() => deriveEntries(feed), [feed])
  const serverFired = React.useMemo(() => firedAlertKeys(feed), [feed])

  const today = now.format('YYYY-MM-DD')
  const overdueFloor = now.subtract(OVERDUE_WINDOW_DAYS, 'day').format('YYYY-MM-DD')

  const upcomingEntries = React.useMemo(() => {
    return entries
      .filter((e) => e.status === 'open')
      .filter((e) => e.date >= today || (e.date >= overdueFloor && e.type === 'task'))
      .slice(0, LIST_LIMIT)
  }, [entries, today, overdueFloor])

  const entriesOnDate = React.useMemo(() => {
    if (!selectedDate) return []
    return entries.filter((e) => e.date === selectedDate)
  }, [entries, selectedDate])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => { if (e.status !== 'cancelled') set.add(e.date) })
    return set
  }, [entries])

  const weeks = React.useMemo(
    () => getMonthWeeks(viewMonth.year(), viewMonth.month()),
    [viewMonth]
  )

  // Push a freshly created log into the calendar cache and mark the Log stale.
  const ingest = React.useCallback((log: any) => {
    if (log && log.id) {
      const row: CalendarFeedLog = {
        id: log.id,
        event: log.event,
        text: log.text ?? null,
        metadata: log.metadata ?? null,
        createdAt: log.createdAt ?? new Date().toISOString(),
      }
      queryClient.setQueryData<CalendarFeedLog[]>(FEED_KEY, (old = []) =>
        old.some((x) => x.id === row.id) ? old : [row, ...old]
      )
    }
    queryClient.invalidateQueries(['/api/logs'])
  }, [queryClient])

  // ─── Alert engine ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!entries.length) return
    const local = readFired()
    const fired = new Set<string>([...serverFired, ...local, ...sessionFired.current])
    const due = dueAlerts(entries, fired, now)
    if (!due.length) return

    const fresh: ActiveAlert[] = []
    for (const { entry, phase } of due) {
      const key = alertKey(entry.id, phase)
      if (sessionFired.current.has(key)) continue
      sessionFired.current.add(key)
      writeFired(key)
      const firstSighting = !bannerShown.current.has(key)
      if (firstSighting) {
        bannerShown.current.add(key)
        fresh.push({ key, entry, phase })
      }

      const when = entry.time ? `${entry.time}` : 'D-DAY'
      postLog({
        text: `[CAL-ALRT] ${phase} · ${typeCode(entry.type)} · ${entry.ref} · ${entry.text} · ${entry.date} ${when}`,
        event: 'calendar_alert',
        metadata: {
          entryId: entry.id,
          ref: entry.ref,
          phase,
          date: entry.date,
          time: entry.time,
          text: entry.text,
          entryType: entry.type,
          firedAt: new Date().toISOString(),
        },
      }).then(ingest).catch(() => {
        // Server write failed — banner still shows; release the key so the
        // next tick can retry the Log write while the alert is still fresh.
        sessionFired.current.delete(key)
        releaseFired(key)
      })

      if (firstSighting) {
        systemNotify(
          `${entry.ref} · ${phase} · ${typeCode(entry.type)}`,
          `${entry.text}${entry.time ? ` — ${entry.time}` : ''}`
        )
      }
    }
    if (fresh.length) {
      setActiveAlerts((prev) => {
        // A T-0 replaces a pending T-15 banner for the same entry.
        const ids = new Set(fresh.map((a) => a.entry.id))
        return [...prev.filter((a) => !ids.has(a.entry.id)), ...fresh]
      })
    }
  }, [now, entries, serverFired, postLog, ingest])

  // Drop banners for entries that have been closed elsewhere.
  React.useEffect(() => {
    setActiveAlerts((prev) => {
      const next = prev.filter((a) => entries.find((e) => e.id === a.entry.id)?.status === 'open')
      return next.length === prev.length ? prev : next
    })
  }, [entries])

  const acknowledge = (key: string) =>
    setActiveAlerts((prev) => prev.filter((a) => a.key !== key))

  // ─── Actions ───────────────────────────────────────────────────────────────
  const parsedTime = entryTime.trim() ? normalizeTime(entryTime) : null
  const timeInvalid = entryTime.trim().length > 0 && !parsedTime

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    setSelectedDate(selectedDate === key ? null : key)
    if (selectedDate === key) setIsAddingEntry(false)
    if (d.month() !== viewMonth.month()) setViewMonth(d.startOf('month'))
  }

  const handleAddEntry = () => {
    const text = entryText.trim()
    if (!selectedDate || !text || timeInvalid || isSaving) return
    const date = selectedDate
    const time = parsedTime
    const dateLabel = dayjs(date).format('ddd, MMM D, YYYY')
    setSaveError(null)

    createEntry({
      text: `[CAL] ${typeCode(entryType)}: ${text} (${dateLabel}${time ? ` ${time}` : ''})`,
      event: 'calendar_entry',
      metadata: { date, time, text, entryType },
    }, {
      onSuccess: (log) => {
        ingest(log)
        setEntryText('')
        setEntryTime('')
        setIsAddingEntry(false)
        try { recordCalendarSignal(entryType, date) } catch (_) {}
      },
      onError: () => setSaveError('TX FAILED — ENTRY NOT RECORDED. RETRY.'),
    })
  }

  const closeEntry = (entry: CalendarEntry, outcome: 'done' | 'cancel') => {
    setArmedId(null)
    const tag = outcome === 'done' ? 'CAL-CMPL' : 'CAL-SCRB'
    postLog({
      text: `[${tag}] ${typeCode(entry.type)} · ${entry.ref} · ${entry.text} (${entry.date}${entry.time ? ` ${entry.time}` : ''})`,
      event: outcome === 'done' ? 'calendar_done' : 'calendar_cancel',
      metadata: {
        entryId: entry.id,
        ref: entry.ref,
        date: entry.date,
        time: entry.time,
        text: entry.text,
        entryType: entry.type,
        onTime: !isOverdue(entry, dayjs()),
      },
    }).then(ingest).catch(() => setSaveError('TX FAILED — STATUS NOT RECORDED. RETRY.'))
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) {
      setViewMonth(dayjs().startOf('month'))
      if (!selectedDate) setSelectedDate(today)
    } else {
      setIsAddingEntry(false)
    }
    setIsCalendarOpen(!isCalendarOpen)
  }

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        {/* ─── Alert banners ───────────────────────────────────────────── */}
        {activeAlerts.length > 0 && (
          <div className="mb-16 space-y-8" role="alert" aria-live="assertive">
            {activeAlerts.map((a) => (
              <div key={a.key} className="border border-acc/40 px-8 py-8">
                <div className="flex justify-between items-baseline gap-8 uppercase tracking-widest">
                  <span className="flex items-baseline gap-8">
                    <span className={cn('inline-block w-[0.6em] h-[0.6em] bg-acc', a.phase === 'T-0' && 'animate-pulse')} />
                    <span>{a.phase === 'T-0' ? 'ALERT' : 'WARN'}</span>
                    <span className="opacity-40">{a.entry.ref}</span>
                  </span>
                  <span className="tabular-nums">{countdown(a.entry, now)}</span>
                </div>
                <div className="flex justify-between items-baseline gap-16 mt-8">
                  <span>
                    <span className="opacity-40 uppercase">{typeCode(a.entry.type)}{a.entry.time ? ` ${a.entry.time}` : ''} · </span>
                    {a.entry.text}
                  </span>
                  <span className="flex gap-8 whitespace-nowrap uppercase">
                    {a.entry.type !== 'note' && (
                      <button
                        className="opacity-40 hover:opacity-100 transition-opacity"
                        onClick={() => { closeEntry(a.entry, 'done'); acknowledge(a.key) }}
                      >
                        Done
                      </button>
                    )}
                    <button
                      className="opacity-40 hover:opacity-100 transition-opacity"
                      onClick={() => acknowledge(a.key)}
                    >
                      Ack
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-16">
          <Button onClick={handleToggleCalendar}>
            {isCalendarOpen ? 'Close' : 'Add date'}
          </Button>
        </div>

        {isCalendarOpen && (
          <div className="mb-16">
            <div className="flex items-center gap-8 mb-8">
              <button
                className="text-acc/40 hover:text-acc transition-opacity"
                onClick={() => setViewMonth(viewMonth.subtract(1, 'month'))}
                aria-label="Previous month"
              >
                {'<—'}
              </button>
              <span className="text-acc">
                {viewMonth.format('MMMM, YYYY')}
              </span>
              <button
                className="text-acc/40 hover:text-acc transition-opacity"
                onClick={() => setViewMonth(viewMonth.add(1, 'month'))}
                aria-label="Next month"
              >
                {'—>'}
              </button>
              {viewMonth.format('YYYY-MM') !== now.format('YYYY-MM') && (
                <button
                  className="text-acc/30 hover:text-acc/60 transition-opacity"
                  onClick={() => { setViewMonth(now.startOf('month')); setSelectedDate(today) }}
                >
                  Today
                </button>
              )}
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
                          'py-2 px-2 transition-opacity whitespace-nowrap',
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
                <div className="flex gap-8 mb-8 items-baseline">
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
                  <span className="text-acc/30 ml-auto">
                    {dayjs(selectedDate).format('ddd, MMM D')}
                  </span>
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
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[4.5em] outline-none tabular-nums',
                      timeInvalid ? 'border-acc/60' : 'border-acc/20 focus:border-acc/40'
                    )}
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
                  <Button onClick={handleAddEntry}>{isSaving ? '...' : 'Add'}</Button>
                </div>
                {timeInvalid && (
                  <div className="text-acc/40 mt-4 uppercase tracking-widest">Time: invalid — use HH:MM</div>
                )}
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="text-acc/40 mb-4">
                  {dayjs(selectedDate).format('dddd, MMMM D')}
                </div>
                {entriesOnDate.map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      'flex gap-8 mb-1',
                      e.status === 'open' ? 'text-acc/80' : 'text-acc/30',
                      e.status === 'cancelled' && 'line-through'
                    )}
                  >
                    <span className="opacity-60 uppercase tabular-nums whitespace-nowrap">
                      {e.time || '--:--'}
                    </span>
                    <span className="flex-1">{e.text}</span>
                    <span className="opacity-60 uppercase whitespace-nowrap">
                      {e.status === 'done' ? 'CMPL' : e.status === 'cancelled' ? 'SCRB' : typeCode(e.type)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {saveError && (
          <div className="mb-8 uppercase tracking-widest text-acc/60">
            {saveError}
          </div>
        )}

        {feedError && (
          <div className="mb-8 uppercase tracking-widest text-acc/40">
            Feed offline —{' '}
            <button className="underline hover:text-acc transition-opacity" onClick={() => refetchFeed()}>
              retry
            </button>
          </div>
        )}

        {upcomingEntries.length > 0 && (
          <div className="space-y-1">
            {upcomingEntries.map((entry) => {
              const overdue = isOverdue(entry, now)
              const armed = armedId === entry.id
              return (
                <div
                  key={entry.id}
                  className="group flex justify-between items-baseline gap-16 cursor-pointer"
                  onClick={() => setArmedId(armed ? null : entry.id)}
                  title={`${entry.ref} — tap to close`}
                >
                  <span className="text-acc whitespace-nowrap">
                    {dayjs(entry.date).format('ddd, MMM D')}
                    {entry.time && <span className="tabular-nums"> · {entry.time}</span>}
                  </span>
                  <span className="text-acc text-right flex-1">
                    {entry.text}
                  </span>
                  {armed ? (
                    <span className="flex gap-8 whitespace-nowrap uppercase">
                      {entry.type !== 'note' && (
                        <button
                          className="text-acc/60 hover:text-acc transition-opacity"
                          onClick={(ev) => { ev.stopPropagation(); closeEntry(entry, 'done') }}
                        >
                          Done
                        </button>
                      )}
                      <button
                        className="text-acc/60 hover:text-acc transition-opacity"
                        onClick={(ev) => { ev.stopPropagation(); closeEntry(entry, 'cancel') }}
                      >
                        Scrub
                      </button>
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'tabular-nums whitespace-nowrap uppercase transition-opacity',
                        overdue ? 'text-acc' : 'text-acc/40 group-hover:text-acc/60'
                      )}
                    >
                      {countdown(entry, now)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {upcomingEntries.length === 0 && !isCalendarOpen && !feedError && (
          <div className="text-acc/40">No upcoming dates.</div>
        )}
      </div>
    </Block>
  )
}
