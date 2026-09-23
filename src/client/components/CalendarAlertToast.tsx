/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar Alert Toast
 *
 * Fires a stylish military-grade notification the moment a timed Calendar
 * entry (note/task/call scheduled with an HH:mm) comes due, and writes a
 * `calendar_alert` event to Log so the alert has a permanent record even
 * if the toast itself is missed.
 */

import React from 'react'
import { useLogs, useCreateLog } from '#client/queries'
import { isRouteActive } from '#client/stores/router'
import dayjs from '#client/utils/dayjs'

type EntryType = 'note' | 'task' | 'call'

type TimedEntry = {
  key: string
  date: string
  time: string
  text: string
  entryType: EntryType
}

const FIRED_KEY = 'lot_calendar_alerts_fired'
const FIRED_CAP = 200
const TOAST_WINDOW_MIN = 5 // only surface a toast if the entry came due this recently
const AUTO_HIDE_MS = 8000

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch (_) {
    return new Set()
  }
}

function saveFired(fired: Set<string>) {
  try {
    const arr = Array.from(fired).slice(-FIRED_CAP)
    localStorage.setItem(FIRED_KEY, JSON.stringify(arr))
  } catch (_) {}
}

export function CalendarAlertToast() {
  const { data: logs = [] } = useLogs()
  const { mutate: createLog } = useCreateLog()
  const [activeAlert, setActiveAlert] = React.useState<TimedEntry | null>(null)
  const firedRef = React.useRef<Set<string> | null>(null)

  if (firedRef.current === null) {
    firedRef.current = loadFired()
  }

  const timedEntries = React.useMemo<TimedEntry[]>(() => {
    return logs
      .filter(log => log.event === 'calendar_entry' && log.metadata?.time)
      .map(log => ({
        key: `${log.metadata?.date}T${log.metadata?.time}::${log.metadata?.text}`,
        date: log.metadata?.date as string,
        time: log.metadata?.time as string,
        text: (log.metadata?.text as string) || log.text || '',
        entryType: (log.metadata?.entryType as EntryType) || 'note',
      }))
      .filter(e => e.date && e.time && e.text)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  }, [logs])

  React.useEffect(() => {
    const checkDue = () => {
      if (document.hidden || !isRouteActive('system')) return
      const fired = firedRef.current!
      const now = dayjs()

      // Process one newly-due entry per tick so a long-closed tab doesn't burst-fire.
      const due = timedEntries.find(e => {
        if (fired.has(e.key)) return false
        return dayjs(`${e.date}T${e.time}`).isBefore(now) || dayjs(`${e.date}T${e.time}`).isSame(now, 'minute')
      })

      if (!due) return

      fired.add(due.key)
      saveFired(fired)

      createLog({
        text: `[ALERT] ${due.entryType}: ${due.text} — due ${due.time}`,
        event: 'calendar_alert',
        metadata: {
          date: due.date,
          time: due.time,
          text: due.text,
          entryType: due.entryType,
        },
      })

      const minutesLate = now.diff(dayjs(`${due.date}T${due.time}`), 'minute')
      if (minutesLate <= TOAST_WINDOW_MIN) {
        setActiveAlert(due)
        setTimeout(() => setActiveAlert(null), AUTO_HIDE_MS)
      }
    }

    checkDue()
    const interval = setInterval(checkDue, 20000)

    const onVisible = () => {
      if (document.visibilityState === 'visible') checkDue()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [timedEntries, createLog])

  if (!activeAlert) return null

  return (
    <div
      className="fixed top-16 right-16 z-50 max-w-[20em]
                 px-16 py-8 border border-acc/40 bg-[var(--base-color)]
                 grid-fill-light animate-fade-in-up"
      style={{ animation: 'calendarAlertIn 0.3s ease-out, calendarAlertOut 0.3s ease-in 7.5s forwards' }}
    >
      <div className="text-acc/40 uppercase tracking-widest mb-4">[ALERT] {activeAlert.entryType}</div>
      <div className="flex justify-between gap-16">
        <span className="text-acc tabular-nums">{activeAlert.time}</span>
        <span className="text-acc text-right">{activeAlert.text}</span>
      </div>
    </div>
  )
}

const style = document.createElement('style')
style.textContent = `
  @keyframes calendarAlertIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes calendarAlertOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`

if (typeof document !== 'undefined') {
  document.head.appendChild(style)
}
