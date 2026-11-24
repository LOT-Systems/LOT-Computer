/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar Alerts — global scheduler + notification surface.
 *
 * Mounted once at app root (not inside the System tab, which unmounts when
 * inactive) so alerts fire on every route. Each alert is:
 *   1. claimed in localStorage (cross-tab dedupe),
 *   2. written to Log as `calendar_alert` (cross-device dedupe + record),
 *   3. shown as a military-style notice until acknowledged,
 *   4. mirrored to a system Notification when the tab is hidden.
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { atom } from 'nanostores'
import { useStore } from '@nanostores/react'
import { useCalendar, useCreateLog, CALENDAR_QUERY_KEY } from '#client/queries'
import dayjs from '#client/utils/dayjs'
import {
  CalendarAlert,
  TYPE_CODE,
  alertLogText,
  buildEntries,
  dueAlerts,
  formatTMinus,
  leadLabel,
  milTime,
  nextFireAt,
} from '#client/utils/calendar'

const FIRED_STORAGE_KEY = 'lot.calendar.fired.v1'
const SNOOZE_STORAGE_KEY = 'lot.calendar.snooze.v1'
const FIRED_RETENTION_MS = 14 * 24 * 60 * 60 * 1000
const MAX_TICK_MS = 30_000
const MAX_VISIBLE = 3
export const SNOOZE_MIN = 5

/** Alerts currently on screen. */
export const $calendarAlerts = atom<CalendarAlert[]>([])

type Snooze = { alert: CalendarAlert; until: number }

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

/** key → claimed-at epoch ms */
function readFired(): Record<string, number> {
  const map = readJSON<Record<string, number>>(FIRED_STORAGE_KEY, {})
  const cutoff = Date.now() - FIRED_RETENTION_MS
  let pruned = false
  for (const k of Object.keys(map)) {
    if (!(map[k] > cutoff)) {
      delete map[k]
      pruned = true
    }
  }
  if (pruned) writeJSON(FIRED_STORAGE_KEY, map)
  return map
}

function claim(key: string): boolean {
  const map = readFired()
  if (map[key]) return false
  map[key] = Date.now()
  writeJSON(FIRED_STORAGE_KEY, map)
  return true
}

function pushAlert(alert: CalendarAlert) {
  const current = $calendarAlerts.get()
  if (current.some((a) => a.key === alert.key)) return
  $calendarAlerts.set([...current, alert])
}

export function acknowledgeAlert(key: string) {
  $calendarAlerts.set($calendarAlerts.get().filter((a) => a.key !== key))
}

export function snoozeAlert(alert: CalendarAlert) {
  acknowledgeAlert(alert.key)
  const list = readJSON<Snooze[]>(SNOOZE_STORAGE_KEY, []).filter((s) => s.alert.key !== alert.key)
  list.push({ alert, until: Date.now() + SNOOZE_MIN * 60_000 })
  writeJSON(SNOOZE_STORAGE_KEY, list)
}

// ── Signal: two short square-wave pips, quiet ───────────────────────────────
let audioCtx: AudioContext | null = null
function playPips() {
  try {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctor) return
    if (!audioCtx || audioCtx.state === 'closed') audioCtx = new Ctor()
    const ctx = audioCtx
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const t0 = ctx.currentTime + 0.02
    ;[0, 0.18].forEach((offset) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(1046.5, t0 + offset)
      gain.gain.setValueAtTime(0.0001, t0 + offset)
      gain.gain.exponentialRampToValueAtTime(0.04, t0 + offset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + 0.11)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0 + offset)
      osc.stop(t0 + offset + 0.12)
    })
  } catch {}
}

function systemNotify(alert: CalendarAlert) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    if (!document.hidden) return
    const e = alert.entry
    new Notification(`${leadLabel(alert.lead)} · ${TYPE_CODE[e.type]}${e.time ? ` · ${milTime(e.time)}H` : ''}`, {
      body: e.text,
      tag: `lot-cal-${alert.key}`,
      silent: false,
    })
  } catch {}
}

/** Ask for system notification permission. Call only from a user gesture. */
export function requestAlertPermission() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  } catch {}
}

// ── Scheduler ────────────────────────────────────────────────────────────────
function useCalendarScheduler() {
  const queryClient = useQueryClient()
  const { data } = useCalendar()
  const { mutate: createLog } = useCreateLog()

  const entries = React.useMemo(() => buildEntries(data?.records || []), [data])
  const serverFired = React.useMemo(() => new Set(data?.firedKeys || []), [data])

  React.useEffect(() => {
    if (!data) return
    let timer: ReturnType<typeof setTimeout> | null = null
    let disposed = false

    const run = () => {
      if (disposed) return
      const now = Date.now()
      const fired = new Set<string>([...serverFired, ...Object.keys(readFired())])

      for (const alert of dueAlerts(entries, now, fired)) {
        if (!claim(alert.key)) continue
        fired.add(alert.key)
        pushAlert(alert)
        playPips()
        systemNotify(alert)
        createLog(
          {
            text: alertLogText(alert),
            event: 'calendar_alert',
            metadata: {
              entryId: alert.entryId,
              alertKey: alert.key,
              lead: alert.lead,
              late: alert.late,
              date: alert.entry.date,
              time: alert.entry.time,
              entryType: alert.entry.type,
              text: alert.entry.text,
              eventAt: dayjs(alert.eventAt).toISOString(),
            },
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries([CALENDAR_QUERY_KEY])
              queryClient.invalidateQueries(['/api/logs'])
            },
          }
        )
      }

      // Snooze recalls
      const snoozes = readJSON<Snooze[]>(SNOOZE_STORAGE_KEY, [])
      const ready = snoozes.filter((s) => s.until <= now)
      if (ready.length) {
        writeJSON(SNOOZE_STORAGE_KEY, snoozes.filter((s) => s.until > now))
        for (const s of ready) {
          // Skip recall if the entry was completed / scrubbed meanwhile
          const live = entries.find((e) => e.id === s.alert.entryId)
          if (!live || live.status !== 'active') continue
          pushAlert({ ...s.alert, entry: live })
          playPips()
          systemNotify(s.alert)
        }
      }

      const next = nextFireAt(entries, now, fired)
      const nextSnooze = readJSON<Snooze[]>(SNOOZE_STORAGE_KEY, []).reduce<number | null>(
        (m, s) => (m === null || s.until < m ? s.until : m),
        null
      )
      const targets = [next, nextSnooze].filter((x): x is number => x !== null)
      const wait = targets.length ? Math.min(...targets) - now : MAX_TICK_MS
      timer = setTimeout(run, Math.max(250, Math.min(wait + 50, MAX_TICK_MS)))
    }

    run()
    // Background tabs throttle timers — re-check the moment we're visible again.
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (timer) clearTimeout(timer)
      run()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      disposed = true
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [data, entries, serverFired, createLog, queryClient])

  // Drop on-screen alerts for entries completed / scrubbed elsewhere.
  React.useEffect(() => {
    const active = new Set(entries.filter((e) => e.status === 'active').map((e) => e.id))
    const shown = $calendarAlerts.get()
    const kept = shown.filter((a) => active.has(a.entryId))
    if (kept.length !== shown.length) $calendarAlerts.set(kept)
  }, [entries])
}

// ── Notice ───────────────────────────────────────────────────────────────────
function AlertNotice({ alert }: { alert: CalendarAlert }) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const e = alert.entry
  const delta = alert.eventAt - now
  const isLive = delta <= 0

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="cal-alert-in pointer-events-auto w-full max-w-[28rem] border border-acc/40 bg-bac px-16 py-8 tabular-nums"
    >
      <div className="flex items-center justify-between gap-16">
        <span className="flex items-center gap-8 uppercase tracking-widest">
          <span className="cal-alert-beacon inline-block w-[0.5em] h-[0.5em] bg-acc" aria-hidden="true" />
          {alert.late ? 'Late alert' : isLive ? 'Event live' : 'Priority alert'}
        </span>
        <span className="text-acc/40">{dayjs(now).format('HHmm:ss')}</span>
      </div>
      <div className="mt-8 flex items-baseline justify-between gap-16 uppercase tracking-widest">
        <span>
          {TYPE_CODE[e.type]}
          <span className="text-acc/40"> · {e.time ? `${milTime(e.time)}H` : 'ALL DAY'}</span>
        </span>
        <span>{formatTMinus(delta)}</span>
      </div>
      <div className="mt-4 break-words">{e.text}</div>
      <div className="mt-8 flex gap-16">
        <button className="uppercase tracking-widest hover:opacity-60" onClick={() => acknowledgeAlert(alert.key)}>
          Ack
        </button>
        <button className="uppercase tracking-widest text-acc/40 hover:text-acc" onClick={() => snoozeAlert(alert)}>
          Snooze +{SNOOZE_MIN}
        </button>
      </div>
    </div>
  )
}

export function CalendarAlerts() {
  useCalendarScheduler()
  const alerts = useStore($calendarAlerts)
  if (!alerts.length) return null
  const visible = alerts.slice(-MAX_VISIBLE)
  const hidden = alerts.length - visible.length
  return (
    <div className="pointer-events-none fixed top-16 left-16 right-16 z-50 flex flex-col items-end gap-8">
      {hidden > 0 && (
        <div className="pointer-events-auto border border-acc/20 bg-bac px-16 py-4 uppercase tracking-widest text-acc/40">
          +{hidden} queued
        </div>
      )}
      {visible.map((a) => (
        <AlertNotice key={a.key} alert={a} />
      ))}
    </div>
  )
}
