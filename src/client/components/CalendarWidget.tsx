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
  type EntryType,
  type AlertPhase,
  type CalendarItem,
  PHASE_LABEL,
  countdown,
  dueAlerts,
  itemTimestamp,
  parseTime,
} from '#client/utils/calendarEngine'

type CalendarEntry = CalendarItem

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
  const [now, setNow] = React.useState(() => Date.now())
  const [notifyOn, setNotifyOn] = React.useState(
    () => typeof Notification !== 'undefined' && Notification.permission === 'granted'
  )
  // Alerts already dispatched this session (guards against double-fire while the log round-trips)
  const fired = React.useRef<Set<string>>(new Set())

  // 1s ticker (cheap: only drives countdown + alert evaluation)
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        id: String(log.id),
        time: parseTime(String(log.metadata?.time || '')),
        date: log.metadata?.date as string,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => (a.date + (a.time || '99:99')).localeCompare(b.date + (b.time || '99:99')))
  }, [logs])

  const alertRecords = React.useMemo(
    () =>
      logs
        .filter(l => l.event === 'calendar_alert' && l.metadata?.entryId)
        .map(l => ({ entryId: String(l.metadata!.entryId), phase: l.metadata!.phase as AlertPhase })),
    [logs]
  )

  const logAlert = React.useCallback(
    (item: CalendarEntry, phase: AlertPhase) => {
      const key = `${item.id}:${phase}`
      if (fired.current.has(key)) return
      fired.current.add(key)
      createLog(
        {
          text: `[CAL ${PHASE_LABEL[phase]}] ${item.type.toUpperCase()} ${item.time || ''} — ${item.text}`.replace('  ', ' '),
          event: 'calendar_alert',
          metadata: {
            entryId: item.id,
            phase,
            date: item.date,
            time: item.time,
            entryType: item.type,
            firedAt: new Date().toISOString(),
          },
        },
        { onSuccess: () => queryClient.refetchQueries(['/api/logs']) }
      )
    },
    [createLog, queryClient]
  )

  // Alert engine: fire each phase once per entry, persist to Log
  React.useEffect(() => {
    const due = dueAlerts(entries, alertRecords, now).filter(d => !fired.current.has(`${d.item.id}:${d.phase}`))
    for (const { item, phase } of due) {
      logAlert(item, phase)
      if (notifyOn && typeof Notification !== 'undefined' && phase !== 'missed') {
        try {
          new Notification(`${PHASE_LABEL[phase]} · ${item.time}`, { body: `${item.type.toUpperCase()} — ${item.text}`, tag: `${item.id}:${phase}` })
        } catch (_) {}
      }
      if (phase === 'active') {
        try { navigator.vibrate?.([200, 100, 200]) } catch (_) {}
      }
    }
  }, [now, entries, alertRecords, notifyOn, logAlert])

  // Active banner items: warn/active/missed within last 24h and not confirmed
  const banner = React.useMemo(() => {
    const done = new Set(alertRecords.filter(r => r.phase === 'done').map(r => r.entryId))
    return entries
      .filter(e => e.time && !done.has(e.id))
      .map(e => ({ e, ts: itemTimestamp(e)! }))
      .filter(({ ts }) => ts - now <= 15 * 60_000 && now - ts <= 24 * 3600_000)
  }, [entries, alertRecords, now])

  const handleToggleNotify = async () => {
    if (typeof Notification === 'undefined') return
    if (notifyOn) { setNotifyOn(false); return }
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
    setNotifyOn(perm === 'granted')
  }

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    const done = new Set(alertRecords.filter(r => r.phase === 'done').map(r => r.entryId))
    return entries
      .filter(e => e.date >= today && !done.has(e.id))
      .slice(0, 10)
  }, [entries, alertRecords])

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

    const time = parseTime(entryTime)
    if (entryTime.trim() && !time) return // invalid time: keep form open
    const dateLabel = dayjs(selectedDate).format('dddd, MMMM D, YYYY')

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${time ? ' ' + time : ''})`,
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
        {banner.length > 0 && (
          <div className="mb-16 space-y-1 font-mono uppercase tracking-widest text-acc">
            {banner.map(({ e, ts }) => {
              const diff = ts - now
              const phase = diff > 0 ? 'warn' : -diff <= 5 * 60_000 ? 'active' : 'missed'
              return (
                <div
                  key={e.id}
                  className={cn(
                    'flex justify-between gap-16 border-l-2 pl-8',
                    phase === 'warn' && 'border-acc/40',
                    phase === 'active' && 'border-acc animate-pulse',
                    phase === 'missed' && 'border-acc/20 text-acc/40'
                  )}
                >
                  <span className="whitespace-nowrap tabular-nums">
                    {PHASE_LABEL[phase]} · {countdown(ts, now)}
                  </span>
                  <span className="text-right">
                    {e.time} {e.type} — {e.text}{' '}
                    <button className="text-acc/60 hover:text-acc" onClick={() => logAlert(e, 'done')}>
                      [ACK]
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div className="mb-16 flex gap-16 items-center">
          <Button onClick={handleToggleCalendar}>
            Add date
          </Button>
          {typeof Notification !== 'undefined' && (
            <button
              className="text-acc/40 hover:text-acc transition-opacity uppercase tracking-widest"
              onClick={handleToggleNotify}
            >
              Alerts: {notifyOn ? 'ARMED' : 'OFF'}
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
                    value={entryText}
                    onChange={e => setEntryText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder={`Add ${entryType}...`}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 flex-1 outline-none focus:border-acc/40"
                    autoFocus
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={entryTime}
                    onChange={e => setEntryTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    placeholder="HH:MM"
                    className={cn(
                      'bg-transparent border text-acc px-4 py-2 w-[5.5em] outline-none',
                      entryTime.trim() && !parseTime(entryTime) ? 'border-acc/60' : 'border-acc/20 focus:border-acc/40'
                    )}
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
            {upcomingEntries.map((entry) => (
              <div key={entry.id} className="flex justify-between gap-16">
                <span className="text-acc whitespace-nowrap">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}
                  {entry.time && <span className="text-acc/60 tabular-nums"> {entry.time}</span>}
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
