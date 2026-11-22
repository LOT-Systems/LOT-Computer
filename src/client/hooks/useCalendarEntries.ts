/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useCalendar } from '#client/queries'
import { buildEntries, firedAlertKeys } from '#shared/utils/calendar'
import type { CalendarEntry } from '#shared/utils/calendar'

/** Calendar state derived from the Log (shared by widget, alert center, System). */
export function useCalendarEntries() {
  const query = useCalendar()
  const logs = query.data || []
  const entries = React.useMemo<CalendarEntry[]>(() => buildEntries(logs), [logs])
  const fired = React.useMemo(() => firedAlertKeys(logs), [logs])
  return { entries, fired, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch }
}

/**
 * A ticking clock. Re-renders every `intervalMs`, on tab focus/visibility,
 * and exactly at `nextBoundaryMs` if given — so alerts land on the minute
 * even when the interval would miss it.
 */
export function useNow(intervalMs = 15000, nextBoundaryMs: number | null = null): Date {
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const tick = () => setNow(new Date())
    const id = window.setInterval(tick, intervalMs)
    const onVis = () => { if (!document.hidden) tick() }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', tick)
    }
  }, [intervalMs])

  React.useEffect(() => {
    if (nextBoundaryMs === null || nextBoundaryMs > intervalMs) return
    const id = window.setTimeout(() => setNow(new Date()), nextBoundaryMs + 250)
    return () => window.clearTimeout(id)
  }, [nextBoundaryMs, intervalMs])

  return now
}

const DESKTOP_KEY = 'lot.calendar.desktopAlerts'

export function getDesktopAlertsEnabled(): boolean {
  try {
    return localStorage.getItem(DESKTOP_KEY) === '1' &&
      typeof Notification !== 'undefined' && Notification.permission === 'granted'
  } catch {
    return false
  }
}

export function setDesktopAlertsEnabled(on: boolean) {
  try { localStorage.setItem(DESKTOP_KEY, on ? '1' : '0') } catch {}
}
