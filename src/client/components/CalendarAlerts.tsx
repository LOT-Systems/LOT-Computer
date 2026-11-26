/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar Alerts — app-level alert engine.
 *
 * Mounted once at the App root (not inside System, which unmounts when its
 * tab is inactive) so scheduled alerts fire from any tab. Each alert:
 *   1. is checked against a fired-ledger (server calendar_alert rows +
 *      localStorage) so it fires exactly once, across tabs and devices;
 *   2. is written into Log as a calendar_alert (server-side idempotent);
 *   3. renders as a terminal-grade alert card until acknowledged;
 *   4. raises a system notification when the tab is in the background and
 *      the user has granted permission.
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { CALENDAR_QUERY_KEY, postCalendarAlert, useCalendar, useSetCalendarStatus } from '#client/queries'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import {
  type CalendarAlert,
  alertLogText,
  alertPhaseLabel,
  dueAlerts,
  entryInstant,
  entryRef,
  foldCalendarLogs,
  formatCountdown,
  militaryTime,
} from '#client/utils/calendar'

const LEDGER_KEY = 'lot_calendar_alerts_fired_v1'
const LEDGER_MAX = 400
const TICK_MS = 15_000
const MAX_VISIBLE = 3

function readLedger(): Set<string> {
  try {
    const raw = localStorage.getItem(LEDGER_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

function writeLedger(keys: Set<string>) {
  try {
    const arr = Array.from(keys).slice(-LEDGER_MAX)
    localStorage.setItem(LEDGER_KEY, JSON.stringify(arr))
  } catch {
    /* storage unavailable — server ledger still dedupes */
  }
}

function systemNotify(alert: CalendarAlert) {
  try {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    if (!document.hidden) return
    const { entry, phase } = alert
    const n = new Notification(`LOT · CAL ${phase} · ${entry.type.toUpperCase()}`, {
      body: `${entry.text}\n${militaryTime(entry.time)} · ${dayjs(entry.date).format('ddd D MMM').toUpperCase()}`,
      tag: `lot-cal-${alert.key}`,
      silent: phase === 'DAY',
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {
    /* Notification constructor unsupported (e.g. iOS Safari tab) */
  }
}

/** Ask for system notification permission — call from a user gesture. */
export function requestCalendarNotificationPermission() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  } catch {
    /* ignore */
  }
}

export function CalendarAlerts() {
  const queryClient = useQueryClient()
  const { data: logs } = useCalendar()
  const { mutate: setStatus } = useSetCalendarStatus()
  const [visible, setVisible] = React.useState<CalendarAlert[]>([])
  const [now, setNow] = React.useState(() => Date.now())
  const inflight = React.useRef<Set<string>>(new Set())

  const folded = React.useMemo(() => foldCalendarLogs((logs as any[]) || []), [logs])

  const check = React.useCallback(() => {
    if (!logs) return // wait for the server ledger before firing anything
    const ledger = readLedger()
    const fired = new Set<string>([...folded.fired, ...ledger, ...inflight.current])
    const due = dueAlerts(folded.entries, dayjs(), fired)
    if (!due.length) return

    for (const alert of due) {
      inflight.current.add(alert.key)
      ledger.add(alert.key)
      systemNotify(alert)
      postCalendarAlert({
        entryId: alert.entry.id,
        phase: alert.phase,
        text: alertLogText(alert.entry, alert.phase),
      })
        .then(() => {
          queryClient.invalidateQueries([CALENDAR_QUERY_KEY])
          queryClient.invalidateQueries(['/api/logs'])
        })
        .catch((err) => {
          // 4xx (entry gone / invalid) is final; network or 5xx retries next tick.
          const code = err?.response?.status
          if (code >= 400 && code < 500) return
          inflight.current.delete(alert.key)
          const l = readLedger()
          l.delete(alert.key)
          writeLedger(l)
        })
    }
    writeLedger(ledger)
    setVisible((prev) => {
      const keys = new Set(prev.map((a) => a.key))
      return [...due.filter((a) => !keys.has(a.key)), ...prev]
    })
  }, [logs, folded, queryClient])

  React.useEffect(() => {
    check()
    const id = window.setInterval(check, TICK_MS)
    const onVis = () => {
      if (!document.hidden) check()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [check])

  // 1s clock only while an alert card is on screen (live T± readout).
  React.useEffect(() => {
    if (!visible.length) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [visible.length])

  // Drop cards whose entry was closed elsewhere.
  React.useEffect(() => {
    if (!visible.length) return
    const open = new Set(folded.entries.filter((e) => e.status === 'open').map((e) => e.id))
    setVisible((prev) => {
      const next = prev.filter((a) => open.has(a.entry.id))
      return next.length === prev.length ? prev : next
    })
  }, [folded]) // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = (key: string) => setVisible((prev) => prev.filter((a) => a.key !== key))

  const markDone = (alert: CalendarAlert) => {
    dismiss(alert.key)
    setStatus(
      { entryId: alert.entry.id, status: 'done' },
      {
        onSuccess: () => {
          queryClient.invalidateQueries([CALENDAR_QUERY_KEY])
          queryClient.invalidateQueries(['/api/logs'])
        },
      }
    )
  }

  if (!visible.length) return null
  const shown = visible.slice(0, MAX_VISIBLE)
  const hidden = visible.length - shown.length

  return (
    <div
      className="fixed z-50 top-16 right-16 left-16 phone:left-auto phone:w-[22rem] flex flex-col gap-8 pointer-events-none"
      role="alert"
      aria-live="assertive"
    >
      {shown.map((alert) => {
        const { entry, phase } = alert
        const live = phase === 'T-0'
        const delta = entryInstant(entry).valueOf() - now
        return (
          <div
            key={alert.key}
            className={cn(
              'pointer-events-auto bg-[var(--base-color)] text-acc border px-16 py-8',
              'lot-cal-alert-in',
              live ? 'border-acc/60' : 'border-acc/25'
            )}
          >
            <div className="flex justify-between items-center gap-8 text-acc/50 uppercase tracking-widest text-[0.8em]">
              <span className="flex items-center gap-4">
                <span
                  className={cn('inline-block w-[0.55em] h-[0.55em] bg-acc', live ? 'lot-cal-blink' : 'opacity-40')}
                  aria-hidden
                />
                CAL/ALERT · {alertPhaseLabel(phase)}
              </span>
              <span className="tabular-nums">#{entryRef(entry.id)}</span>
            </div>
            <div className="mt-8 uppercase tracking-widest text-acc/60 text-[0.8em]">{entry.type}</div>
            <div className="text-acc break-words">{entry.text}</div>
            <div className="mt-4 flex justify-between gap-8 text-acc/50 tabular-nums">
              <span>
                {militaryTime(entry.time)} · {dayjs(entry.date).format('ddd D MMM YYYY').toUpperCase()}
              </span>
              {entry.time && <span>{formatCountdown(delta)}</span>}
            </div>
            <div className="mt-8 flex gap-16 uppercase tracking-widest text-[0.8em]">
              <button className="text-acc/60 hover:text-acc transition-opacity" onClick={() => dismiss(alert.key)}>
                [ Ack ]
              </button>
              {entry.type !== 'note' && (
                <button className="text-acc/60 hover:text-acc transition-opacity" onClick={() => markDone(alert)}>
                  [ Done ]
                </button>
              )}
            </div>
          </div>
        )
      })}
      {hidden > 0 && (
        <div className="pointer-events-auto text-right text-acc/40 uppercase tracking-widest text-[0.8em]">
          +{hidden} queued
        </div>
      )}
    </div>
  )
}

// Animations — injected once, respects reduced motion.
if (typeof document !== 'undefined' && !document.getElementById('lot-cal-alert-style')) {
  const style = document.createElement('style')
  style.id = 'lot-cal-alert-style'
  style.textContent = `
    @keyframes lotCalIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
    @keyframes lotCalBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
    .lot-cal-alert-in { animation: lotCalIn 180ms ease-out; }
    .lot-cal-blink { animation: lotCalBlink 1s steps(1, end) infinite; }
    @media (prefers-reduced-motion: reduce) {
      .lot-cal-alert-in, .lot-cal-blink { animation: none; }
    }
  `
  document.head.appendChild(style)
}
