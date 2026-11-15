/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * CalendarAlerts — global alert engine + overlay.
 *
 * Mounted once at the app root (not inside System, which unmounts when its
 * tab is inactive) so alerts fire on every tab. Each trigger is reported once:
 *   in-memory set → localStorage (same browser, all tabs) → server alertedFor
 *   (all devices). ALERT / MISSED stages are written to the Log as
 *   `calendar_alert` events; WARN (T-15) is a soft banner only.
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import {
  useCalendar,
  useCreateLog,
  useUpdateCalendarEntry,
} from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import {
  AlertStage,
  CalendarEntry,
  SNOOZE_MS,
  TYPE_CODE,
  alertedOnServer,
  fireKey,
  formatDTG,
  formatHrs,
  formatTMinus,
  normalizeEntry,
  playAlertTone,
  sortEntries,
  stageAt,
  triggerAt,
} from '#client/utils/calendar'

const FIRED_KEY = 'lot.calendar.fired'
const FIRED_CAP = 300
const CHECK_INTERVAL_MS = 5000

// ─── Shared hooks ────────────────────────────────────────────────────────────

/** Ticking wall clock. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

/** All calendar entries, normalised and sorted by scheduled time. */
export function useCalendarEntries(): {
  entries: CalendarEntry[]
  isLoading: boolean
} {
  const { data, isLoading } = useCalendar()
  const entries = React.useMemo(
    () =>
      sortEntries(
        (data || [])
          .map(normalizeEntry)
          .filter((e): e is CalendarEntry => !!e)
      ),
    [data]
  )
  return { entries, isLoading }
}

/** Invalidate calendar + logs caches after any calendar write. */
export function useRefreshCalendar() {
  const qc = useQueryClient()
  return React.useCallback(() => {
    qc.invalidateQueries(['/api/calendar'])
    qc.invalidateQueries(['/api/logs'])
  }, [qc])
}

// ─── Dedupe store ────────────────────────────────────────────────────────────

const memFired = new Set<string>()

function readFired(): string[] {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch (_) {
    return []
  }
}

function hasFired(key: string): boolean {
  if (memFired.has(key)) return true
  return readFired().includes(key)
}

function markFired(key: string) {
  memFired.add(key)
  try {
    const arr = readFired().filter((k) => k !== key)
    arr.push(key)
    localStorage.setItem(FIRED_KEY, JSON.stringify(arr.slice(-FIRED_CAP)))
  } catch (_) {}
}

// ─── Notifications ───────────────────────────────────────────────────────────

/** Ask for OS notification permission — call from a user gesture. */
export function requestAlertPermission() {
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  } catch (_) {}
}

function osNotify(e: CalendarEntry, stage: AlertStage) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    const head =
      stage === 'WARN' ? 'WARNING ORDER // T-15' : stage === 'MISSED' ? 'MISSED // OVERDUE' : 'ALERT // T-0'
    const n = new Notification(`LOT ${head}`, {
      body: `${TYPE_CODE[e.type]} · ${formatHrs(e.time)}\n${e.text}`,
      tag: `lot-cal-${e.id}`,
      silent: false,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch (_) {}
}

// ─── Engine + overlay ────────────────────────────────────────────────────────

type QueuedAlert = {
  key: string
  entry: CalendarEntry
  stage: AlertStage
  firedAt: number
}

export function CalendarAlerts() {
  const { entries } = useCalendarEntries()
  const isSoundOn = useStore(stores.isSoundOn)
  const { mutate: createLog } = useCreateLog()
  const { mutate: updateEntry } = useUpdateCalendarEntry()
  const refresh = useRefreshCalendar()
  const [queue, setQueue] = React.useState<QueuedAlert[]>([])

  // Keep latest values reachable from the interval without re-subscribing.
  const ref = React.useRef({ entries, isSoundOn, createLog, updateEntry, refresh })
  ref.current = { entries, isSoundOn, createLog, updateEntry, refresh }

  const check = React.useCallback(() => {
    const { entries, isSoundOn, createLog, updateEntry, refresh } = ref.current
    const now = Date.now()
    const fresh: QueuedAlert[] = []

    for (const e of entries) {
      const stage = stageAt(e, now)
      if (!stage) continue
      const key = fireKey(e, stage)
      if (hasFired(key)) continue
      markFired(key)
      if (stage !== 'WARN' && alertedOnServer(e)) continue // handled on another device

      fresh.push({ key, entry: e, stage, firedAt: now })

      if (stage !== 'WARN') {
        const trigger = new Date(triggerAt(e)).toISOString()
        const code = stage === 'MISSED' ? 'MISSED' : 'ALERT'
        createLog(
          {
            text: `[${code}] ${TYPE_CODE[e.type]}: ${e.text} (${dayjs(e.date).format('ddd D MMM')} · ${formatHrs(e.time)})`,
            event: 'calendar_alert',
            metadata: {
              entryId: e.id,
              stage: code,
              date: e.date,
              time: e.time,
              entryType: e.type,
              text: e.text,
              trigger,
              dtg: formatDTG(now),
            },
          },
          { onSuccess: refresh }
        )
        updateEntry({ id: e.id, alertedFor: trigger }, { onSuccess: refresh })
      }

      osNotify(e, stage)
      if (isSoundOn) playAlertTone(stage)
    }

    setQueue((q) => {
      // Drop WARN banners whose entry has reached ALERT, or was closed elsewhere.
      const byId = new Map(entries.map((e) => [e.id, e]))
      const kept = q.filter((a) => {
        const cur = byId.get(a.entry.id)
        if (!cur || cur.status !== 'open') return a.stage !== 'WARN'
        if (a.stage === 'WARN') return stageAt(cur, now) === 'WARN'
        return true
      })
      if (!fresh.length && kept.length === q.length) return q
      const ids = new Set(fresh.map((f) => f.entry.id))
      return [...kept.filter((a) => !ids.has(a.entry.id)), ...fresh]
    })
  }, [])

  React.useEffect(() => {
    check()
    const id = setInterval(check, CHECK_INTERVAL_MS)
    const onVis = () => document.visibilityState === 'visible' && check()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [check])

  // Re-check as soon as data changes (new entry, snooze from another device).
  React.useEffect(() => {
    check()
  }, [entries, check])

  const current = queue[0] || null

  const dismiss = React.useCallback((key: string) => {
    setQueue((q) => q.filter((a) => a.key !== key))
  }, [])

  const handleAck = () => current && dismiss(current.key)

  const handleSnooze = () => {
    if (!current) return
    updateEntry(
      { id: current.entry.id, snoozeUntil: new Date(Date.now() + SNOOZE_MS).toISOString() },
      { onSuccess: refresh }
    )
    dismiss(current.key)
  }

  const handleDone = () => {
    if (!current) return
    const e = current.entry
    updateEntry({ id: e.id, status: 'done' }, { onSuccess: refresh })
    createLog(
      {
        text: `[DONE] ${TYPE_CODE[e.type]}: ${e.text}`,
        event: 'calendar_alert',
        metadata: {
          entryId: e.id,
          stage: 'DONE',
          date: e.date,
          time: e.time,
          entryType: e.type,
          text: e.text,
          dtg: formatDTG(Date.now()),
        },
      },
      { onSuccess: refresh }
    )
    dismiss(current.key)
  }

  // Keyboard: Enter/Escape acknowledge.
  React.useEffect(() => {
    if (!current) return
    const onKey = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (ev.key === 'Escape' || ev.key === 'Enter') {
        ev.preventDefault()
        dismiss(current.key)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, dismiss])

  // Tab title beacon while an ALERT is pending.
  React.useEffect(() => {
    if (!current || current.stage === 'WARN') return
    const original = document.title
    let on = false
    const id = setInterval(() => {
      on = !on
      document.title = on ? `■ ${TYPE_CODE[current.entry.type]} // ${current.stage}` : original
    }, 1000)
    return () => {
      clearInterval(id)
      document.title = original
    }
  }, [current])

  if (!current) return null

  return (
    <AlertPanel
      alert={current}
      pending={queue.length - 1}
      onAck={handleAck}
      onSnooze={handleSnooze}
      onDone={handleDone}
    />
  )
}

function AlertPanel({
  alert,
  pending,
  onAck,
  onSnooze,
  onDone,
}: {
  alert: QueuedAlert
  pending: number
  onAck: () => void
  onSnooze: () => void
  onDone: () => void
}) {
  const now = useNow(1000)
  const { entry: e, stage } = alert
  const trigger = triggerAt(e)
  const isWarn = stage === 'WARN'
  const head = isWarn ? 'WARNING ORDER' : stage === 'MISSED' ? 'MISSED' : 'ALERT'

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-label={`${head}: ${e.text}`}
      className="fixed top-16 left-16 right-16 z-50 flex justify-center pointer-events-none"
    >
      <div
        className={cn(
          'pointer-events-auto w-full max-w-512 bg-bac text-acc border border-acc px-16 py-16',
          'tabular-nums',
          !isWarn && 'lot-cal-alert'
        )}
      >
        <div className="flex justify-between gap-16 mb-8">
          <span className="tracking-widest">
            {!isWarn && <span className="lot-cal-blink">■ </span>}
            {head} // {isWarn ? 'T-15' : stage === 'MISSED' ? 'OVERDUE' : 'T-0'}
          </span>
          <span className="opacity-40 whitespace-nowrap">{formatDTG(now)}</span>
        </div>

        <div className="opacity-40 tracking-widest">
          {TYPE_CODE[e.type]} · {dayjs(e.date).format('ddd D MMM').toUpperCase()} · {formatHrs(e.time)}
        </div>
        <div className="my-8 break-words">{e.text}</div>
        <div className="opacity-60 mb-16">{formatTMinus(trigger, now)}</div>

        <div className="flex gap-16 items-baseline">
          <button className="hover:opacity-60" onClick={onAck} autoFocus>
            [ACK]
          </button>
          {stage !== 'MISSED' && (
            <button className="opacity-60 hover:opacity-100" onClick={onSnooze}>
              [+10 MIN]
            </button>
          )}
          {e.type !== 'note' && (
            <button className="opacity-60 hover:opacity-100" onClick={onDone}>
              [DONE]
            </button>
          )}
          {pending > 0 && (
            <span className="ml-auto opacity-30">+{pending} QUEUED</span>
          )}
        </div>
      </div>
    </div>
  )
}
