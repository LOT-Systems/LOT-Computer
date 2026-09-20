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

type EntryType = 'note' | 'task' | 'call'
type AlertStage = 'pre' | 'due'

type CalendarEntry = {
  date: string
  time?: string
  text: string
  type: EntryType
}

type CalendarAlert = {
  entry: CalendarEntry
  stage: AlertStage
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const PRE_ALERT_MINUTES = 15
const ALERT_STORAGE_KEY = 'calendar_alert_log_v1'
const ALERT_RETENTION_DAYS = 30
const ALERT_AUTO_DISMISS_MS = 12000

function loadFiredAlertKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(ALERT_STORAGE_KEY)
    if (!raw) return new Set()
    const parsed: { key: string; firedAt: string }[] = JSON.parse(raw)
    const cutoff = dayjs().subtract(ALERT_RETENTION_DAYS, 'day')
    return new Set(
      parsed.filter(p => dayjs(p.firedAt).isAfter(cutoff)).map(p => p.key)
    )
  } catch (_) {
    return new Set()
  }
}

function persistFiredAlertKey(key: string) {
  try {
    const raw = localStorage.getItem(ALERT_STORAGE_KEY)
    const parsed: { key: string; firedAt: string }[] = raw ? JSON.parse(raw) : []
    const cutoff = dayjs().subtract(ALERT_RETENTION_DAYS, 'day')
    const pruned = parsed.filter(p => dayjs(p.firedAt).isAfter(cutoff))
    pruned.push({ key, firedAt: dayjs().toISOString() })
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(pruned))
  } catch (_) {}
}

function CalendarAlertToast({ alert, onDismiss }: { alert: CalendarAlert; onDismiss: () => void }) {
  const { entry, stage } = alert
  const dateLabel = dayjs(entry.date).format('MMM D')

  return (
    <div className="fixed bottom-16 right-16 z-50 max-w-[280px] px-16 py-12 border border-acc/30 bg-[var(--base-color)] grid-fill-light">
      <div className="flex items-center justify-between gap-16 mb-4">
        <span className="uppercase tracking-widest text-acc blink">
          [ALERT] {stage === 'pre' ? 'UPCOMING' : 'DUE NOW'}
        </span>
        <button
          className="text-acc/40 hover:text-acc transition-opacity"
          onClick={onDismiss}
        >
          [X]
        </button>
      </div>
      <div className="text-acc/80 uppercase tracking-wide mb-1">
        {entry.type}: {entry.text}
      </div>
      <div className="text-acc/40 tabular-nums">
        {dateLabel}{entry.time ? ` · ${entry.time}` : ''} · SRC: CALENDAR
      </div>
    </div>
  )
}

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

  const [firedAlertKeys, setFiredAlertKeys] = React.useState<Set<string>>(() => loadFiredAlertKeys())
  const [activeAlert, setActiveAlert] = React.useState<CalendarAlert | null>(null)
  const alertQueueRef = React.useRef<CalendarAlert[]>([])

  const entries = React.useMemo<CalendarEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata)
      .map(log => ({
        date: log.metadata?.date as string,
        text: log.metadata?.text as string || log.text || '',
        type: (log.metadata?.entryType as EntryType) || 'note',
        time: log.metadata?.time as string | undefined,
      }))
      .filter(e => e.date && e.text)
      .sort((a, b) => a.date === b.date
        ? (a.time || '').localeCompare(b.time || '')
        : a.date.localeCompare(b.date))
  }, [logs])

  const upcomingEntries = React.useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return entries
      .filter(e => e.date >= today)
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
    const timeSuffix = entryTime ? ` ${entryTime}` : ''

    createLog({
      text: `[SCHEDULE] ${entryType}: ${entryText.trim()} (${dateLabel}${timeSuffix})`,
      event: 'calendar_entry',
      metadata: {
        date: selectedDate,
        text: entryText.trim(),
        entryType,
        time: entryTime || undefined,
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

  const fireAlert = React.useCallback((entry: CalendarEntry, stage: AlertStage, key: string) => {
    setFiredAlertKeys(prev => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
    persistFiredAlertKey(key)
    alertQueueRef.current.push({ entry, stage })

    const dateLabel = dayjs(entry.date).format('MMM D')
    createLog({
      text: `[ALERT] ${stage === 'pre' ? 'UPCOMING' : 'DUE'} ${entry.type}: ${entry.text} (${dateLabel}${entry.time ? ` ${entry.time}` : ''})`,
      event: 'calendar_notification',
      metadata: {
        date: entry.date,
        time: entry.time,
        entryType: entry.type,
        text: entry.text,
        stage,
      },
    })
  }, [createLog])

  const checkAlerts = React.useCallback(() => {
    const now = dayjs()
    entries.forEach(entry => {
      if (!entry.time) return

      const target = dayjs(`${entry.date}T${entry.time}`)
      if (!target.isValid()) return

      const diffMin = target.diff(now, 'minute')
      const preKey = `pre|${entry.date}|${entry.time}|${entry.text}`
      const dueKey = `due|${entry.date}|${entry.time}|${entry.text}`

      if (diffMin > 0 && diffMin <= PRE_ALERT_MINUTES && !firedAlertKeys.has(preKey)) {
        fireAlert(entry, 'pre', preKey)
      }
      if (diffMin <= 0 && diffMin > -PRE_ALERT_MINUTES && !firedAlertKeys.has(dueKey)) {
        fireAlert(entry, 'due', dueKey)
      }
    })
  }, [entries, firedAlertKeys, fireAlert])

  React.useEffect(() => {
    checkAlerts()
    const interval = setInterval(() => {
      if (document.hidden) return
      checkAlerts()
    }, 30000)
    const handleVisibility = () => {
      if (!document.hidden) checkAlerts()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [checkAlerts])

  React.useEffect(() => {
    if (activeAlert || alertQueueRef.current.length === 0) return
    setActiveAlert(alertQueueRef.current.shift()!)
  }, [activeAlert, firedAlertKeys])

  React.useEffect(() => {
    if (!activeAlert) return
    const timer = setTimeout(() => setActiveAlert(null), ALERT_AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [activeAlert])

  return (
    <>
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
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEntry() }}
                    className="bg-transparent border border-acc/20 text-acc px-4 py-2 tabular-nums outline-none focus:border-acc/40"
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
                    {e.time && <span className="tabular-nums text-acc/50 mr-4">{e.time}</span>}
                    {e.text}
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
                <span className="text-acc whitespace-nowrap tabular-nums">
                  {dayjs(entry.date).format('dddd, MMMM D, YYYY')}{entry.time ? ` · ${entry.time}` : ''}
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
    {activeAlert && (
      <CalendarAlertToast
        alert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
      />
    )}
    </>
  )
}
