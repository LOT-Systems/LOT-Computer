/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { atom } from 'nanostores'
import { useQueryClient } from 'react-query'
import { useCalendar, useCreateLog } from '#client/queries'
import { recordCalendarSignal } from '#client/stores/intentionEngine'
import {
  buildEntries,
  describeEntry,
  dueAlerts,
  firedAlertKeys,
  nextAlertAt,
  type AlertPhase,
  type CalendarEntry,
  type EntryStatus,
  type EntryType,
} from '#client/utils/calendar'

export type ActiveAlert = {
  key: string
  phase: AlertPhase
  entry: CalendarEntry
  firedAt: number
}

/** Alerts currently on screen (newest last). Shared by the watcher and the widget. */
export const $calendarAlerts = atom<ActiveAlert[]>([])

const FIRED_STORAGE_KEY = 'lot.calendar.firedAlerts'
const MAX_STORED_KEYS = 500
const MAX_VISIBLE_ALERTS = 3

// In-memory copy survives a storage failure (private mode, blocked site data).
const firedInMemory = new Set<string>()

function readFiredLocal(): Set<string> {
  try {
    const raw = window.localStorage.getItem(FIRED_STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) arr.forEach(k => typeof k === 'string' && firedInMemory.add(k))
    }
  } catch (_) {}
  return firedInMemory
}

function markFiredLocal(key: string) {
  firedInMemory.add(key)
  try {
    const arr = Array.from(firedInMemory).slice(-MAX_STORED_KEYS)
    window.localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(arr))
  } catch (_) {}
}

export function dismissCalendarAlert(key: string) {
  $calendarAlerts.set($calendarAlerts.get().filter(a => a.key !== key))
}

/** 1 Hz clock while the page is visible; frozen while hidden. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const tick = () => {
      if (!document.hidden) setNow(Date.now())
    }
    const id = window.setInterval(tick, intervalMs)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [intervalMs])
  return now
}

/** Entries + mutations. All writes go to the Log so every action is recorded. */
export function useCalendarData() {
  const queryClient = useQueryClient()
  const { data: rows = [], isLoading, isError } = useCalendar()
  const { mutate: createLog, isLoading: isSaving } = useCreateLog()

  const entries = React.useMemo(() => buildEntries(rows), [rows])
  const fired = React.useMemo(() => firedAlertKeys(rows), [rows])

  const refresh = React.useCallback(() => {
    queryClient.invalidateQueries(['/api/calendar'])
    queryClient.invalidateQueries(['/api/logs'])
  }, [queryClient])

  const addEntry = React.useCallback(
    (input: { date: string; time: string | null; text: string; type: EntryType }, onDone?: () => void) => {
      const text = input.text.trim()
      if (!text) return
      const timeLabel = input.time ? ` ${input.time}` : ''
      createLog(
        {
          text: `[SCHEDULE] ${input.type}: ${text} (${input.date}${timeLabel})`,
          event: 'calendar_entry',
          metadata: {
            date: input.date,
            ...(input.time ? { time: input.time } : {}),
            text,
            entryType: input.type,
          },
        },
        {
          onSuccess: () => {
            refresh()
            try { recordCalendarSignal(input.type, input.date) } catch (_) {}
            onDone?.()
          },
        }
      )
    },
    [createLog, refresh]
  )

  const setStatus = React.useCallback(
    (entry: CalendarEntry, status: EntryStatus) => {
      const verb = status === 'done' ? 'DONE' : status === 'cancelled' ? 'CANCELLED' : 'REOPENED'
      createLog(
        {
          text: `[SCHEDULE] ${verb} — ${describeEntry(entry)} (${entry.date})`,
          event: 'calendar_status',
          metadata: {
            refId: entry.id,
            status,
            date: entry.date,
            ...(entry.time ? { time: entry.time } : {}),
            text: entry.text,
            entryType: entry.type,
          },
        },
        { onSuccess: refresh }
      )
      // Clear any alert on screen for this entry.
      $calendarAlerts.set($calendarAlerts.get().filter(a => a.entry.id !== entry.id))
    },
    [createLog, refresh]
  )

  const recordAlert = React.useCallback(
    (entry: CalendarEntry, phase: AlertPhase) => {
      createLog(
        {
          text: `[ALERT ${phase}] ${describeEntry(entry)} (${entry.date})`,
          event: 'calendar_alert',
          metadata: {
            refId: entry.id,
            phase,
            date: entry.date,
            ...(entry.time ? { time: entry.time } : {}),
            text: entry.text,
            entryType: entry.type,
          },
        },
        { onSuccess: refresh }
      )
    },
    [createLog, refresh]
  )

  return { rows, entries, fired, isLoading, isError, isSaving, addEntry, setStatus, recordAlert }
}

/**
 * App-wide alert watcher. Mount once. Checks every 15 s and exactly when the
 * next alert window opens, and again whenever the tab becomes visible, so a
 * sleeping laptop catches up on wake (within each window's grace period).
 */
export function useCalendarAlertWatcher(onFire?: (a: ActiveAlert) => void) {
  const { entries, fired, recordAlert, rows } = useCalendarData()
  const onFireRef = React.useRef(onFire)
  onFireRef.current = onFire
  const hasData = rows.length > 0

  React.useEffect(() => {
    if (!hasData) return
    let timeout: number | undefined

    const check = () => {
      const now = Date.now()
      const known = new Set<string>([...readFiredLocal(), ...fired])
      const due = dueAlerts(entries, now, known)
      for (const d of due) {
        markFiredLocal(d.key)
        recordAlert(d.entry, d.phase)
        const alert: ActiveAlert = { key: d.key, phase: d.phase, entry: d.entry, firedAt: now }
        const current = $calendarAlerts.get().filter(a => a.entry.id !== d.entry.id)
        $calendarAlerts.set([...current, alert].slice(-MAX_VISIBLE_ALERTS))
        try { onFireRef.current?.(alert) } catch (_) {}
      }
      // Precise wake-up for the next window, in addition to the 15 s poll.
      const next = nextAlertAt(entries, now)
      window.clearTimeout(timeout)
      if (next !== null && next - now < 15_000) {
        timeout = window.setTimeout(check, Math.max(0, next - now) + 50)
      }
    }

    check()
    const interval = window.setInterval(check, 15_000)
    const onVisible = () => { if (!document.hidden) check() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [entries, fired, recordAlert, hasData])

  // Drop on-screen alerts for entries closed elsewhere (other device / widget).
  React.useEffect(() => {
    const open = new Set(entries.filter(e => e.status === 'open').map(e => e.id))
    const current = $calendarAlerts.get()
    const kept = current.filter(a => open.has(a.entry.id))
    if (kept.length !== current.length) $calendarAlerts.set(kept)
  }, [entries])
}
