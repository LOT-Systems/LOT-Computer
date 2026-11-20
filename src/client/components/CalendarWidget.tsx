/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar widget — live clock, command board (OVERDUE / TODAY / NEXT),
 * date grid with Note / Task / Call entries and optional HH:mm time.
 *
 * State lives in the Log stream (see #shared/utils/calendar); alerts are
 * fired by <CalendarAlertEngine/> at the app root, not here, so they keep
 * working when this tab is closed.
 */

import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'
import { useCalendarActions, useCalendarEntries, useNow } from '#client/hooks/useCalendar'
import { isCalDeviceAlertsOn } from '#client/stores/calendar'
import {
  CAL_ENTRY_TYPES,
  CAL_MAX_TEXT,
  DAY,
  type CalEntry,
  type CalEntryType,
  canGoOverdue,
  countdown,
  dateKey,
  dayDiff,
  deltaLabel,
  entryMoment,
  isOverdue,
  milDate,
  milWeekday,
} from '#shared/utils/calendar'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const NEXT_LIMIT = 7

function getMonthWeeks(year: number, month: number): Dayjs[][] {
  const first = dayjs().year(year).month(month).startOf('month')
  const last = first.endOf('month')
  const isoDay = first.day() === 0 ? 6 : first.day() - 1
  let current = first.subtract(isoDay, 'day')
  const weeks: Dayjs[][] = []
  while ((current.isBefore(last) || current.isSame(last, 'day')) && weeks.length < 6) {
    const week: Dayjs[] = []
    for (let i = 0; i < 7; i++) {
      week.push(current)
      current = current.add(1, 'day')
    }
    weeks.push(week)
  }
  return weeks
}

/** Right-hand status for a board row. */
function rowStatus(e: CalEntry, now: number, today: string): string {
  if (e.status === 'done') return e.deltaMinutes !== null && e.deltaMinutes > 0 ? `CLEARED ${deltaLabel(e.deltaMinutes)}` : 'CLEARED'
  if (e.status === 'scrubbed') return 'SCRUBBED'
  if (e.time) {
    const ms = entryMoment(e) - now
    if (ms < 0 && canGoOverdue(e)) return deltaLabel(-ms / 60_000)
    if (ms < 0) return 'ELAPSED'
    return ms < DAY ? countdown(ms) : `T-${dayDiff(today, e.date)}D`
  }
  const d = dayDiff(today, e.date)
  if (d < 0) return canGoOverdue(e) ? `+${-d}D` : 'ELAPSED'
  if (d === 0) return 'TODAY'
  return `T-${d}D`
}

function EntryRow({
  entry,
  now,
  today,
  showDate,
  onClose,
}: {
  entry: CalEntry
  now: number
  today: string
  showDate?: boolean
  onClose: (e: CalEntry, s: 'done' | 'scrubbed' | 'active') => void
}) {
  const active = entry.status === 'active'
  const imminent = active && !!entry.time && Math.abs(entryMoment(entry) - now) <= 15 * 60_000
  const late = isOverdue(entry, now)
  return (
    <div className="flex items-baseline gap-8 group">
      <span className={cn('opacity-40 tabular-nums shrink-0 whitespace-nowrap', showDate ? 'w-[6.5em]' : 'w-[3em]')}>
        {showDate ? dayjs(entry.date).format('ddd D') : ''}
        {showDate && entry.time ? ' ' : ''}
        {entry.time ?? (showDate ? '' : '—')}
      </span>
      <span className="opacity-40 uppercase shrink-0 w-[1em]">{entry.type[0]}</span>
      {/* text + status share one wrapping cell: on narrow screens the status drops under the text */}
      <span className="flex-1 min-w-0 flex flex-wrap items-baseline justify-between gap-x-8">
        <span
          className={cn(
            'min-w-0 break-words',
            !active && 'opacity-30',
            entry.status === 'scrubbed' && 'line-through'
          )}
        >
          {entry.text}
        </span>
        <span
          className={cn(
            'tabular-nums whitespace-nowrap ml-auto',
            imminent || late ? 'opacity-100' : 'opacity-40',
            !active && 'opacity-30'
          )}
        >
          {rowStatus(entry, now, today)}
        </span>
      </span>
      <span className="shrink-0 flex gap-8 whitespace-nowrap">
        {active ? (
          <>
            {entry.type !== 'note' && (
              <button
                className="opacity-30 hover:opacity-100 transition-opacity"
                title="Clear — mark complete"
                aria-label={`Clear ${entry.text}`}
                onClick={() => onClose(entry, 'done')}
              >
                ✓
              </button>
            )}
            <button
              className="opacity-30 hover:opacity-100 transition-opacity"
              title="Scrub — cancel"
              aria-label={`Scrub ${entry.text}`}
              onClick={() => onClose(entry, 'scrubbed')}
            >
              ×
            </button>
          </>
        ) : (
          <button
            className="opacity-20 hover:opacity-100 transition-opacity"
            title="Reinstate"
            aria-label={`Reinstate ${entry.text}`}
            onClick={() => onClose(entry, 'active')}
          >
            ↺
          </button>
        )}
      </span>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="opacity-30 tracking-widest mb-4">{label}</div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function CalendarWidget() {
  const { entries, isError, loaded } = useCalendarEntries()
  const { schedule, close, isCreating } = useCalendarActions()
  // local mirror — not useStore: must stay correct even if another widget poisons nanostores' notify queue
  const [deviceAlerts, setDeviceAlertsState] = React.useState(() => isCalDeviceAlertsOn.get())
  const setDeviceAlerts = (v: boolean) => { isCalDeviceAlertsOn.set(v); setDeviceAlertsState(v) }
  const now = useNow(1000)

  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => dayjs())
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [isAddingEntry, setIsAddingEntry] = React.useState(false)
  const [entryText, setEntryText] = React.useState('')
  const [entryTime, setEntryTime] = React.useState('')
  const [entryType, setEntryType] = React.useState<CalEntryType>('task')
  const [error, setError] = React.useState<string | null>(null)

  const today = dateKey(new Date(now))
  const minuteKey = Math.floor(now / 60_000) // board re-sorts per minute, not per second

  const board = React.useMemo(() => {
    const t = minuteKey * 60_000
    const active = entries.filter(e => e.status === 'active')
    const overdue = active.filter(e => isOverdue(e, t))
    const overdueIds = new Set(overdue.map(e => e.id))
    const todays = entries.filter(e => e.date === today && !overdueIds.has(e.id) && e.status !== 'scrubbed')
    const next = active.filter(e => e.date > today).slice(0, NEXT_LIMIT)
    return { overdue, todays, next }
  }, [entries, today, minuteKey])

  const nextTimed = React.useMemo(
    () => entries.find(e => e.status === 'active' && e.time && entryMoment(e) > now) ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, minuteKey]
  )

  const stats = React.useMemo(() => {
    const since = now - 7 * DAY
    const closed = entries.filter(e => e.status === 'done' && (e.closedAt ?? 0) >= since)
    const timed = closed.filter(e => e.deltaMinutes !== null)
    const onTime = timed.filter(e => (e.deltaMinutes as number) <= 0).length
    return { cleared: closed.length, onTimePct: timed.length ? Math.round((onTime / timed.length) * 100) : null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, minuteKey])

  const datesWithEntries = React.useMemo(() => {
    const set = new Set<string>()
    entries.forEach(e => { if (e.status === 'active') set.add(e.date) })
    return set
  }, [entries])

  const entriesOnDate = React.useMemo(
    () => (selectedDate ? entries.filter(e => e.date === selectedDate) : []),
    [entries, selectedDate]
  )

  const weeks = React.useMemo(() => getMonthWeeks(viewMonth.year(), viewMonth.month()), [viewMonth])

  const handleDateClick = (d: Dayjs) => {
    const key = d.format('YYYY-MM-DD')
    setSelectedDate(prev => (prev === key ? null : key))
    setIsAddingEntry(false)
    setError(null)
  }

  const handleAddEntry = async () => {
    const text = entryText.trim()
    if (!selectedDate || !text || isCreating) return
    setError(null)
    try {
      await schedule({ date: selectedDate, time: entryTime || null, text, type: entryType })
      setEntryText('')
      setEntryTime('')
      setIsAddingEntry(false)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Not scheduled — retry')
    }
  }

  const handleClose = (e: CalEntry, s: 'done' | 'scrubbed' | 'active') => {
    close(e, s).catch(() => setError('Update failed — retry'))
  }

  const handleToggleCalendar = () => {
    if (!isCalendarOpen) setViewMonth(dayjs())
    setIsCalendarOpen(v => !v)
    setIsAddingEntry(false)
  }

  const notificationsSupported = typeof Notification !== 'undefined'
  const toggleDeviceAlerts = async () => {
    if (deviceAlerts) return setDeviceAlerts(false)
    try {
      const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
      setDeviceAlerts(perm === 'granted')
      if (perm !== 'granted') setError('Device alerts blocked in browser settings')
    } catch {
      setError('Device alerts unavailable')
    }
  }

  const d = new Date(now)
  const clock = d.toTimeString().slice(0, 8)
  const hasBoard = board.overdue.length + board.todays.length + board.next.length > 0
  const rowProps = { now, today, onClose: handleClose }

  return (
    <Block label="Calendar:" blockView onLabelClick={handleToggleCalendar}>
      <div className="w-full">
        {/* Live clock + next timed event */}
        <div className="flex justify-between items-baseline gap-8 mb-16 tabular-nums">
          <span>
            <span className="opacity-40">{milDate(today)} // {milWeekday(today)} // </span>
            {clock}
          </span>
          {nextTimed && (
            <span className="opacity-40 whitespace-nowrap" title={`${nextTimed.type}: ${nextTimed.text}`}>
              {countdown(entryMoment(nextTimed) - now)}
            </span>
          )}
        </div>

        {/* Command board */}
        {hasBoard && (
          <div className="mb-16 space-y-16">
            {board.overdue.length > 0 && (
              <Section label={`OVERDUE [${board.overdue.length}]`}>
                {board.overdue.map(e => <EntryRow key={e.id} entry={e} showDate={e.date !== today} {...rowProps} />)}
              </Section>
            )}
            {board.todays.length > 0 && (
              <Section label="TODAY">
                {board.todays.map(e => <EntryRow key={e.id} entry={e} {...rowProps} />)}
              </Section>
            )}
            {board.next.length > 0 && (
              <Section label="NEXT">
                {board.next.map(e => <EntryRow key={e.id} entry={e} showDate {...rowProps} />)}
              </Section>
            )}
          </div>
        )}

        <div className="mb-16">
          <Button onClick={handleToggleCalendar}>{isCalendarOpen ? 'Close' : 'Add date'}</Button>
        </div>

        {isCalendarOpen && (
          <div className="mb-16">
            <div className="flex items-center gap-8 mb-8">
              <button
                className="opacity-40 hover:opacity-100 transition-opacity"
                aria-label="Previous month"
                onClick={() => setViewMonth(v => v.subtract(1, 'month'))}
              >
                {'<—'}
              </button>
              <span>{viewMonth.format('MMMM, YYYY')}</span>
              <button
                className="opacity-40 hover:opacity-100 transition-opacity"
                aria-label="Next month"
                onClick={() => setViewMonth(v => v.add(1, 'month'))}
              >
                {'—>'}
              </button>
            </div>

            <div className="space-y-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex gap-0">
                  {week.map((day, di) => {
                    const key = day.format('YYYY-MM-DD')
                    const isToday = key === today
                    const isCurrentMonth = day.month() === viewMonth.month()
                    const isSelected = key === selectedDate
                    const hasEntry = datesWithEntries.has(key)
                    return (
                      <button
                        key={key}
                        onClick={() => handleDateClick(day)}
                        aria-pressed={isSelected}
                        className={cn(
                          'py-0.5 px-0.5 transition-opacity whitespace-nowrap min-w-[2.5em] text-left',
                          isSelected && 'underline',
                          !isCurrentMonth && 'opacity-20',
                          isCurrentMonth && !isToday && !hasEntry && 'opacity-40',
                          isCurrentMonth && !isToday && hasEntry && 'opacity-70',
                          isToday && 'font-bold'
                        )}
                      >
                        {DAY_LETTERS[di]}{day.date()}
                        {hasEntry && isCurrentMonth ? '·' : ''}
                      </button>
                    )
                  })}

                  {wi === 0 && selectedDate && !isAddingEntry && (
                    <div className="flex items-center ml-4 whitespace-nowrap">
                      <button
                        className="opacity-30 hover:opacity-60 transition-opacity"
                        onClick={() => setIsAddingEntry(true)}
                      >
                        Note / Task / Call
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isAddingEntry && selectedDate && (
              <div className="mt-8">
                <div className="flex gap-8 mb-8 items-baseline">
                  {CAL_ENTRY_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setEntryType(t)}
                      aria-pressed={entryType === t}
                      className={cn(
                        'transition-opacity capitalize',
                        entryType === t ? 'opacity-100' : 'opacity-40 hover:opacity-60'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                  <span className="opacity-30 ml-auto tabular-nums">
                    {milDate(selectedDate)} // {milWeekday(selectedDate)}
                  </span>
                </div>
                <div className="flex gap-8 items-center">
                  <input
                    type="text"
                    value={entryText}
                    maxLength={CAL_MAX_TEXT}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddEntry()
                      if (e.key === 'Escape') setIsAddingEntry(false)
                    }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 min-w-0 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <input
                    type="time"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    aria-label="Time (optional)"
                    title="Time (optional) — enables T-60 / T-5 alerts"
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 w-[6.5em] outline-none focus:border-acc/40 tabular-nums"
                  />
                  <Button onClick={handleAddEntry} disabled={isCreating}>
                    {isCreating ? '…' : 'Add'}
                  </Button>
                </div>
              </div>
            )}

            {selectedDate && entriesOnDate.length > 0 && (
              <div className="mt-8">
                <div className="opacity-40 mb-4">{dayjs(selectedDate).format('dddd, MMMM D')}</div>
                <div className="space-y-4">
                  {entriesOnDate.map(e => <EntryRow key={e.id} entry={e} {...rowProps} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {error && <div className="opacity-60 mb-8">{error}</div>}

        {loaded && !hasBoard && !isCalendarOpen && <div className="opacity-40">No scheduled events.</div>}
        {isError && !loaded && <div className="opacity-40">Calendar offline — retrying.</div>}

        {/* Footer: 7-day time tracking + device alert arming */}
        {(stats.cleared > 0 || notificationsSupported) && (
          <div className="flex justify-between items-baseline gap-8 mt-16 opacity-30 tabular-nums">
            <span>
              {stats.cleared > 0 &&
                `7D: ${stats.cleared} CLEARED${stats.onTimePct !== null ? ` · ${stats.onTimePct}% ON TIME` : ''}`}
            </span>
            {notificationsSupported && (
              <button className="hover:opacity-100 transition-opacity whitespace-nowrap" onClick={toggleDeviceAlerts}>
                Device alerts: {deviceAlerts ? 'armed' : 'off'}
              </button>
            )}
          </div>
        )}
      </div>
    </Block>
  )
}
