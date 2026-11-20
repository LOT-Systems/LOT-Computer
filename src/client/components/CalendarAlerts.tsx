/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar Alert Engine + Notification Overlay.
 *
 * Mounted once at the app root (not inside the System tab, which unmounts
 * when inactive) so alerts fire on every tab. Each tick:
 *
 *   1. pendingAlerts(entries, fired, now)   — pure, see #shared/utils/calendar
 *   2. POST /api/calendar/alerts            — idempotent; writes the Log line
 *   3. overlay + optional device notification
 *
 * If the network is down the overlay still shows (marked UNLOGGED) and the
 * Log write retries next tick — the operator is never left un-notified.
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { fireCalendarAlert } from '#client/queries'
import { cn } from '#client/utils'
import { useCalendarActions, useCalendarEntries, useNow } from '#client/hooks/useCalendar'
import {
  dismissCalAlert,
  getCalAlerts,
  useCalAlerts,
  isCalDeviceAlertsOn,
  markShown,
  pushCalAlert,
  wasShown,
  type CalOverlayAlert,
} from '#client/stores/calendar'
import {
  type CalAlertLevel,
  type CalEntry,
  LEVEL_RANK,
  alertKey,
  alertText,
  countdown,
  entryLine,
  entryMoment,
  milStamp,
  pendingAlerts,
  recentAlerts,
} from '#shared/utils/calendar'

const TICK_MS = 15_000
const AUTO_DISMISS: Record<CalAlertLevel, number | null> = {
  NOTICE: 12_000,
  ALERT: 45_000,
  EXECUTE: null, // holds until acknowledged
  OVERDUE: null,
}
/**
 * An alert logged within this window but never shown on THIS device still
 * surfaces: covers another tab/device firing first, and the page unloading
 * (SW update reload, navigation) between "logged" and "shown".
 */
const SURFACE_WINDOW_MS = 15 * 60_000

/** Put an alert on screen once per device; refresh its LOGGED flag if already up. */
function surface(key: string, level: CalAlertLevel, entry: CalEntry, firedAt: number, pending: boolean) {
  if (getCalAlerts().some(a => a.key === key)) {
    pushCalAlert({ key, level, entry, firedAt, pending })
    return
  }
  if (wasShown(key)) return
  markShown(key)
  pushCalAlert({ key, level, entry, firedAt, pending })
  deviceNotify(level, `${entry.type.toUpperCase()} · ${entry.text}`, milStamp(entry), key)
}

function deviceNotify(level: CalAlertLevel, title: string, body: string, tag: string) {
  try {
    if (!isCalDeviceAlertsOn.get()) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    // eslint-disable-next-line no-new
    new Notification(`CAL // ${level}`, {
      body: `${title}\n${body}`,
      tag,
      requireInteraction: level === 'EXECUTE' || level === 'OVERDUE',
    } as NotificationOptions)
  } catch {
    /* device notifications are best-effort */
  }
}

export function CalendarAlertEngine() {
  const queryClient = useQueryClient()
  const { entries, fired, logs, loaded } = useCalendarEntries()
  const now = useNow(TICK_MS)
  const inFlight = React.useRef<Set<string>>(new Set())
  const logged = React.useRef<Set<string>>(new Set())

  React.useEffect(() => {
    if (!loaded) return
    const t = Date.now()

    // 1. Catch-up: logged recently (by any device) but never shown here.
    //    Highest level per entry only; closed entries never resurface.
    const byId = new Map(entries.map(e => [e.id, e]))
    const best = new Map<string, { level: CalAlertLevel; firedAt: number }>()
    for (const a of recentAlerts(logs, t, SURFACE_WINDOW_MS)) {
      const cur = best.get(a.entryId)
      if (!cur || LEVEL_RANK[a.level] > LEVEL_RANK[cur.level]) best.set(a.entryId, a)
    }
    best.forEach((a, entryId) => {
      const entry = byId.get(entryId)
      if (entry && entry.status === 'active') surface(alertKey(entryId, a.level), a.level, entry, a.firedAt, false)
    })

    // 2. Fire what is due now.
    const known = new Set([...fired, ...logged.current])
    const due = pendingAlerts(entries, known, t)
    if (!due.length) return

    let wroteAny = false
    Promise.all(due.map(async ({ entry, level }) => {
      const key = alertKey(entry.id, level)
      if (inFlight.current.has(key)) return
      inFlight.current.add(key)
      try {
        const res = await fireCalendarAlert({ entryId: entry.id, level, text: alertText(level, entry, t) })
        logged.current.add(key)
        if ('skipped' in res) return
        if (res.duplicate) {
          // another tab/device won the race — surface only if still fresh
          const firedAt = Number(res.metadata?.firedAt) || new Date(res.createdAt).getTime()
          if (t - firedAt < SURFACE_WINDOW_MS) surface(key, level, entry, firedAt, false)
          return
        }
        wroteAny = true
        surface(key, level, entry, t, false)
      } catch {
        // offline / server error: notify locally now, retry the Log write next tick
        surface(key, level, entry, t, true)
      } finally {
        inFlight.current.delete(key)
      }
    })).then(() => {
      if (wroteAny) {
        queryClient.invalidateQueries(['/api/calendar'])
        queryClient.invalidateQueries(['/api/logs'])
      }
    })
  }, [entries, fired, logs, loaded, now, queryClient])

  return <CalendarAlertOverlay />
}

// ─── Overlay ────────────────────────────────────────────────────────────────

function CalendarAlertOverlay() {
  const queue = useCalAlerts()
  const top = queue[0]
  if (!top) return null
  return <AlertCard key={top.key} alert={top} remaining={queue.length - 1} />
}

function AlertCard({ alert, remaining }: { alert: CalOverlayAlert; remaining: number }) {
  const now = useNow(1000)
  const { close } = useCalendarActions()
  const [busy, setBusy] = React.useState(false)
  const { entry, level } = alert
  const critical = level === 'EXECUTE' || level === 'OVERDUE'

  React.useEffect(() => {
    const ms = AUTO_DISMISS[level]
    if (!ms) return
    const id = setTimeout(() => dismissCalAlert(alert.key), ms)
    return () => clearTimeout(id)
  }, [alert.key, level])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismissCalAlert(alert.key) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [alert.key])

  const clock = new Date(now).toTimeString().slice(0, 8)
  const status = entry.time
    ? countdown(entryMoment(entry) - now)
    : level === 'OVERDUE' ? 'PAST DUE' : level === 'NOTICE' ? 'T-1D' : 'TODAY'

  const handleClear = async () => {
    if (busy) return
    setBusy(true)
    try { await close(entry, 'done') } catch { setBusy(false) }
  }

  return (
    <div
      role="alert"
      aria-live={critical ? 'assertive' : 'polite'}
      className={cn(
        'fixed z-50 top-16 left-16 right-16 phone:left-auto phone:w-[360px]',
        'bg-bac text-acc border px-16 py-16',
        'lot-cal-alert-in',
        critical ? 'border-acc' : 'border-acc/40'
      )}
    >
      <div className="flex justify-between items-baseline mb-8 tabular-nums">
        <span className="tracking-widest">
          <span className={cn('inline-block mr-8', critical && 'lot-cal-blink')}>■</span>
          CAL // {level}
        </span>
        <span className="opacity-40">{clock}</span>
      </div>
      <div className="mb-4 break-words">
        <span className="opacity-40 mr-8 uppercase">{entry.type}</span>
        {entry.text}
      </div>
      <div className="flex justify-between items-baseline opacity-60 tabular-nums mb-16">
        <span>{milStamp(entry)}</span>
        <span className={cn(critical && 'opacity-100')}>{status}</span>
      </div>
      <div className="flex justify-between items-baseline">
        <div className="flex gap-16">
          {entry.type !== 'note' && (
            <button className="hover:opacity-60 transition-opacity" onClick={handleClear} disabled={busy}>
              {busy ? 'Clearing…' : 'Clear'}
            </button>
          )}
          <button className="opacity-60 hover:opacity-100 transition-opacity" onClick={() => dismissCalAlert(alert.key)}>
            Ack
          </button>
        </div>
        <span className="opacity-30 tabular-nums">
          {alert.pending ? 'UNLOGGED · RETRY' : 'LOGGED'}
          {remaining > 0 && ` · +${remaining}`}
        </span>
      </div>
      <span className="sr-only">{entryLine(entry)}</span>
    </div>
  )
}
