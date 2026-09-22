/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar Event Notification
 *
 * Fires a stark, ops-readout style alert when a scheduled Calendar entry
 * comes due. Entries live entirely in Log (event: 'calendar_entry') —
 * this widget reads the same query the Calendar widget writes to, so
 * there is no separate store to fall out of sync. Firing state is kept
 * in localStorage only to dedupe an already-shown alert across the
 * 20s poll interval within one session; the entry itself is never
 * device-local.
 */

import * as React from 'react'
import { useLogs } from '#client/queries'
import dayjs from '#client/utils/dayjs'
import { isRouteActive } from '#client/stores/router'

type EntryType = 'note' | 'task' | 'call'

type DueEntry = {
  key: string
  date: string
  time: string | null
  text: string
  type: EntryType
}

const FIRED_KEY = 'calendar_fired_notifications'
const FIRED_CAP = 200
const POLL_MS = 20000
const VISIBLE_MS = 8000

function readFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch (_) {
    return new Set()
  }
}

function writeFired(fired: Set<string>) {
  try {
    const arr = Array.from(fired).slice(-FIRED_CAP)
    localStorage.setItem(FIRED_KEY, JSON.stringify(arr))
  } catch (_) {}
}

export function CalendarEventNotification() {
  const { data: logs = [] } = useLogs()
  const [dueEntry, setDueEntry] = React.useState<DueEntry | null>(null)
  const [visible, setVisible] = React.useState(false)
  const firedRef = React.useRef<Set<string> | null>(null)

  if (firedRef.current === null) {
    firedRef.current = readFired()
  }

  React.useEffect(() => {
    const check = () => {
      if (document.hidden || !isRouteActive('system')) return

      const now = dayjs()
      const fired = firedRef.current!

      const entries: DueEntry[] = logs
        .filter(log => log.event === 'calendar_entry' && log.metadata)
        .map(log => {
          const date = log.metadata?.date as string
          const time = (log.metadata?.time as string) || null
          const text = (log.metadata?.text as string) || log.text || ''
          const type = (log.metadata?.entryType as EntryType) || 'note'
          return { key: `${date}|${time || ''}|${type}|${text}`, date, time, text, type }
        })
        .filter(e => e.date && e.text && e.time)

      const due = entries.find(e => {
        if (fired.has(e.key)) return false
        const at = dayjs(`${e.date} ${e.time}`)
        // Due window: fired only once the scheduled minute has arrived,
        // and only while still recent — a stale tab won't dump a backlog.
        return !at.isAfter(now) && now.diff(at, 'minute') < 15
      })

      if (due) {
        fired.add(due.key)
        writeFired(fired)
        setDueEntry(due)
        setVisible(true)
        setTimeout(() => setVisible(false), VISIBLE_MS)
      }
    }

    check()
    const interval = setInterval(check, POLL_MS)
    return () => clearInterval(interval)
  }, [logs])

  if (!visible || !dueEntry) return null

  return (
    <div
      className="fixed top-16 right-16 z-50 w-[280px]
                 border border-acc/20 bg-[var(--base-color)] grid-fill-light
                 px-16 py-12"
      style={{
        animation: 'calFadeIn 0.3s ease-out, calFadeOut 0.3s ease-in 7.5s forwards',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-acc/40 uppercase tracking-wide">SCHEDULE // DUE</span>
        <span className="text-acc/60 uppercase">{dueEntry.type}</span>
      </div>
      <div className="text-acc mb-2">{dueEntry.text}</div>
      <div className="text-acc/40">
        {dayjs(dueEntry.date).format('MMM D')} · {dueEntry.time}
      </div>
    </div>
  )
}

const style = document.createElement('style')
style.textContent = `
  @keyframes calFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes calFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`
if (typeof document !== 'undefined') {
  document.head.appendChild(style)
}
