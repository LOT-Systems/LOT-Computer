/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * CalendarAlerts — global alert watcher + military-precedence notifications.
 *
 * Mounted once at the app root (not inside System) so alerts fire on every
 * tab. Timing is boundary-driven: the watcher sleeps until the next stage
 * window opens (capped at 60s, and re-checked on focus/visibility), so alerts
 * land on the minute rather than on a coarse polling grid.
 *
 * Reliability layers, in order:
 *   1. Stage windows are disjoint → a late app open fires only the current stage.
 *   2. Session set + localStorage ledger → no re-fire before the server refetch.
 *   3. Server dedupe on POST /logs (calendar_alert) → one Log record per entry+stage
 *      across tabs and devices.
 *   4. Browser Notification uses `tag` = entry+stage → OS collapses duplicates.
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { cn } from '#client/utils'
import { useCalendar } from '#client/hooks/useCalendar'
import {
  type AlertStage,
  type CalendarAlert,
  dueAlerts,
  entryMoment,
  formatClock,
  formatDTG,
  formatTMinus,
  nextStageBoundary,
} from '#client/utils/calendar'

const LEDGER_KEY = 'lot:calendar:fired:v2'
const LEDGER_MAX = 400
const MAX_TICK_MS = 60_000
const ROUTINE_AUTO_DISMISS_MS = 12_000

function readLedger(): Set<string> {
  try {
    const raw = window.localStorage.getItem(LEDGER_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [])
  } catch (_) {
    return new Set()
  }
}

function writeLedger(keys: Set<string>) {
  try {
    const arr = Array.from(keys).slice(-LEDGER_MAX)
    window.localStorage.setItem(LEDGER_KEY, JSON.stringify(arr))
  } catch (_) {}
}

/** Short, quiet, square-wave signal: FLASH = 3 pips, PRIORITY = 2, ROUTINE = 1. */
let audioCtx: AudioContext | null = null
function playSignal(stage: AlertStage) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    if (!audioCtx || audioCtx.state === 'closed') audioCtx = new Ctx()
    const ctx = audioCtx
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const pips = stage === 'FLASH' ? 3 : stage === 'PRIORITY' ? 2 : 1
    const freq = stage === 'FLASH' ? 1040 : 880
    for (let i = 0; i < pips; i++) {
      const t0 = ctx.currentTime + i * 0.18
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(0.06, t0 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0)
      osc.stop(t0 + 0.12)
    }
  } catch (_) {}
}

function systemNotify(alert: CalendarAlert, is12h: boolean) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    if (!document.hidden) return // in-app banner is enough when the operator is looking
    const { entry, stage } = alert
    const clock = entry.time ? formatClock(entry.time, is12h) : 'ALL DAY'
    new Notification(`${stage} · ${entry.type.toUpperCase()} · ${clock}`, {
      body: entry.text,
      tag: `lot-cal-${alert.key}`,
      requireInteraction: stage === 'FLASH',
      silent: false,
    })
  } catch (_) {}
}

/** Ask once, from a user gesture (called by the widget when a timed entry is added). */
export function requestAlertPermission() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  } catch (_) {}
}

type Banner = CalendarAlert & { shownAt: number }

export function CalendarAlerts() {
  const { entries, firedAlerts, isLoading, logAlert, setStatus } = useCalendar()
  const is12h = useStore(stores.isTimeFormat12h)
  const isChimeOn = useStore(stores.isTimeChimeEnabled)
  const isSoundOn = useStore(stores.isSoundOn)

  const [banners, setBanners] = React.useState<Banner[]>([])
  const [now, setNow] = React.useState(() => Date.now())
  const sessionFired = React.useRef<Set<string>>(readLedger())

  const audible = isChimeOn || isSoundOn
  const latest = React.useRef({ entries, firedAlerts, audible, is12h, logAlert })
  latest.current = { entries, firedAlerts, audible, is12h, logAlert }

  const check = React.useCallback(() => {
    const t = Date.now()
    setNow(t)
    const { entries, firedAlerts, audible, is12h, logAlert } = latest.current
    const fired = new Set<string>([...firedAlerts, ...sessionFired.current])
    const due = dueAlerts(entries, fired, t)
    if (!due.length) return
    for (const a of due) sessionFired.current.add(a.key)
    writeLedger(sessionFired.current)
    setBanners((prev) => {
      const existing = new Set(prev.map((b) => b.key))
      const fresh = due.filter((a) => !existing.has(a.key)).map((a) => ({ ...a, shownAt: t }))
      // A newer stage for the same entry supersedes the older banner (FLASH replaces PRIORITY).
      const freshEntries = new Set(fresh.map((a) => a.entryId))
      return [...fresh, ...prev.filter((b) => !freshEntries.has(b.entryId))].slice(0, 4)
    })
    if (audible) playSignal(due[0].stage)
    for (const a of due) {
      systemNotify(a, is12h)
      logAlert(a).catch(() => {
        // Server write failed: release the key so the next tick retries the log.
        sessionFired.current.delete(a.key)
        writeLedger(sessionFired.current)
      })
    }
  }, [])

  // Boundary-driven scheduler.
  React.useEffect(() => {
    if (isLoading) return
    let timer: number | undefined
    const schedule = () => {
      check()
      const t = Date.now()
      const boundary = nextStageBoundary(latest.current.entries, t)
      const wait = boundary ? Math.min(Math.max(boundary - t + 250, 1000), MAX_TICK_MS) : MAX_TICK_MS
      timer = window.setTimeout(schedule, wait)
    }
    schedule()
    const onWake = () => {
      if (!document.hidden) {
        window.clearTimeout(timer)
        schedule()
      }
    }
    document.addEventListener('visibilitychange', onWake)
    window.addEventListener('focus', onWake)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onWake)
      window.removeEventListener('focus', onWake)
    }
  }, [isLoading, entries, check])

  // ROUTINE banners self-dismiss; PRIORITY and FLASH require ACK.
  React.useEffect(() => {
    if (!banners.some((b) => b.stage === 'ROUTINE')) return
    const id = window.setTimeout(() => {
      const t = Date.now()
      setBanners((prev) =>
        prev.filter((b) => b.stage !== 'ROUTINE' || t - b.shownAt < ROUTINE_AUTO_DISMISS_MS)
      )
    }, ROUTINE_AUTO_DISMISS_MS)
    return () => window.clearTimeout(id)
  }, [banners])

  // Drop banners whose entry was completed or cancelled elsewhere.
  React.useEffect(() => {
    const active = new Set(entries.filter((e) => e.status === 'active').map((e) => e.id))
    setBanners((prev) => (prev.every((b) => active.has(b.entryId)) ? prev : prev.filter((b) => active.has(b.entryId))))
  }, [entries])

  const ack = (key: string) => setBanners((prev) => prev.filter((b) => b.key !== key))

  if (!banners.length) return null

  return (
    <div
      className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-32px)] max-w-[440px] flex flex-col gap-8"
      role="alert"
      aria-live="assertive"
    >
      {banners.map((b) => {
        const { entry } = b
        const target = entry.time ? entryMoment(entry.date, entry.time) : null
        return (
          <div
            key={b.key}
            className={cn(
              'border bg-[var(--base-color)] px-16 py-8 cal-alert-in',
              b.stage === 'FLASH'
                ? 'border-[rgb(var(--acc-color-default)/0.6)]'
                : 'border-[rgb(var(--acc-color-default)/0.2)]'
            )}
          >
            <div className="flex items-center justify-between gap-8 uppercase tracking-widest tabular-nums">
              <span className="flex items-center gap-8">
                <span
                  className={cn(
                    'inline-block w-[6px] h-[6px] bg-[rgb(var(--acc-color-default))]',
                    b.stage === 'FLASH' && 'animate-pulse',
                    b.stage === 'ROUTINE' && 'opacity-40'
                  )}
                />
                <span>{b.stage}</span>
              </span>
              <span className="opacity-40">{formatDTG(entry.date, entry.time)}</span>
            </div>
            <div className="mt-8 uppercase tracking-widest opacity-60 tabular-nums">
              {entry.type}
              {' · '}
              {entry.time ? formatClock(entry.time, is12h) : 'ALL DAY'}
              {target !== null && <> {' · '}{formatTMinus(target, now)}</>}
            </div>
            <div className="mt-4">{entry.text}</div>
            <div className="mt-8 flex justify-end gap-16 uppercase tracking-widest">
              {entry.type === 'task' && (
                <button
                  className="opacity-40 hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setStatus(entry, 'done').catch(() => {})
                    ack(b.key)
                  }}
                >
                  Done
                </button>
              )}
              <button className="hover:opacity-60 transition-opacity" onClick={() => ack(b.key)}>
                Ack
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
