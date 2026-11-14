/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * CalendarAlerts — app-wide calendar scheduler + notification overlay.
 *
 * Mounted once at the app root (not inside the System tab, which unmounts
 * when inactive) so alerts fire on every tab. Every TICK_MS it folds the
 * calendar log, computes due alerts (T-15 / T-0 / D-0) and for each new one:
 *   1. shows a fixed, minimal "signal" card until acknowledged
 *   2. writes a calendar_alert row to the Log (server-side idempotent)
 *   3. raises a system Notification when the tab is hidden (if permitted)
 *   4. plays a short two-pulse tone (if the audio context is unlocked)
 *
 * Dedupe is layered: server alert rows → localStorage → in-memory set.
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useCalendar, useCalendarAlert, useSetCalendarStatus } from '#client/queries'
import {
  computeDueAlerts,
  firedAlertKeys,
  formatDtg,
  reduceCalendarLogs,
  type DueAlert,
} from '#client/utils/calendar'
import dayjs from '#client/utils/dayjs'

const TICK_MS = 15 * 1000
const MAX_VISIBLE = 3
const LS_KEY = 'lot_calendar_fired_v1'
const LS_MAX = 300

function loadFired(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function saveFired(keys: string[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(keys.slice(-LS_MAX)))
  } catch {}
}

let audioCtx: AudioContext | null = null
function playSignalTone() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    if (!audioCtx || audioCtx.state === 'closed') audioCtx = new Ctx()
    const ctx = audioCtx
    const go = () => {
      const t0 = ctx.currentTime + 0.02
      // Two short square pulses — a restrained "comms" chirp, not a siren.
      ;[0, 0.18].forEach((offset, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(i === 0 ? 880 : 1320, t0 + offset)
        gain.gain.setValueAtTime(0.0001, t0 + offset)
        gain.gain.exponentialRampToValueAtTime(0.05, t0 + offset + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + 0.12)
        osc.connect(gain).connect(ctx.destination)
        osc.start(t0 + offset)
        osc.stop(t0 + offset + 0.14)
      })
    }
    if (ctx.state === 'suspended') ctx.resume().then(go).catch(() => {})
    else go()
  } catch {}
}

function systemNotify(alert: DueAlert) {
  try {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    if (!document.hidden) return // the in-app card is enough when visible
    const n = new Notification(`LOT // ${alert.stage} // ${alert.entry.type.toUpperCase()}`, {
      body: `${alert.entry.text}\n${formatDtg(alert.entry)}`,
      tag: `lot-cal-${alert.key}`,
      silent: false,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {}
}

/** Ask once, from a user gesture (entry creation). No-op if already decided. */
export function requestCalendarNotificationPermission() {
  try {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'default') Notification.requestPermission().catch(() => {})
  } catch {}
}

function stageLabel(stage: DueAlert['stage']): string {
  if (stage === 'T-15') return 'T-15 MIN'
  if (stage === 'T-0') return 'T-0 NOW'
  return 'D-0 TODAY'
}

export function CalendarAlerts() {
  const queryClient = useQueryClient()
  const { data: rows } = useCalendar()
  const { mutate: logAlert } = useCalendarAlert()
  const { mutate: setStatus } = useSetCalendarStatus()

  const [visible, setVisible] = React.useState<(DueAlert & { firedAt: string })[]>([])
  const [tick, setTick] = React.useState(0)
  const firedRef = React.useRef<Set<string>>(new Set(loadFired()))

  React.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), TICK_MS)
    const onVis = () => {
      if (!document.hidden) setTick((t) => t + 1)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  React.useEffect(() => {
    if (!rows) return
    const entries = reduceCalendarLogs(rows)
    const serverFired = firedAlertKeys(rows)
    const fired = new Set<string>([...firedRef.current, ...serverFired])
    const due = computeDueAlerts(entries, fired, dayjs())
    if (!due.length) return

    const now = dayjs().format('HH:mm:ss')
    for (const a of due) {
      firedRef.current.add(a.key)
      logAlert(
        {
          entryId: a.entry.id,
          stage: a.stage,
          date: a.entry.date,
          time: a.entry.time,
          text: a.entry.text,
          entryType: a.entry.type,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(['/api/calendar'])
            queryClient.invalidateQueries(['/api/logs'])
          },
        }
      )
      systemNotify(a)
    }
    saveFired([...firedRef.current])
    playSignalTone()
    setVisible((prev) => {
      // A T-0 supersedes the same entry's T-15 card
      const ids = new Set(due.map((a) => a.entry.id))
      const kept = prev.filter((p) => !ids.has(p.entry.id))
      return [...kept, ...due.map((a) => ({ ...a, firedAt: now }))].slice(-MAX_VISIBLE)
    })
  }, [rows, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = (key: string) => setVisible((prev) => prev.filter((p) => p.key !== key))

  const markDone = (a: DueAlert) => {
    setStatus(
      { entryId: a.entry.id, status: 'done' },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['/api/calendar'])
          queryClient.invalidateQueries(['/api/logs'])
        },
      }
    )
    dismiss(a.key)
  }

  if (!visible.length) return null

  return (
    <div
      className="fixed z-50 bottom-16 left-16 right-16 sm:left-auto sm:w-[22rem] flex flex-col gap-8 pointer-events-none"
      role="status"
      aria-live="assertive"
    >
      {visible.map((a) => (
        <div
          key={a.key}
          className="pointer-events-auto bg-bac text-acc border border-acc/40 px-16 py-12 lot-cal-alert"
        >
          <div className="flex justify-between items-baseline gap-8 uppercase tracking-widest">
            <span className="flex items-baseline gap-8">
              <span className="lot-cal-blink" aria-hidden="true">■</span>
              <span>{stageLabel(a.stage)}</span>
            </span>
            <span className="opacity-40 tabular-nums">{a.firedAt}</span>
          </div>
          <div className="mt-8 opacity-40 uppercase tracking-widest">{a.entry.type}</div>
          <div className="break-words">{a.entry.text}</div>
          <div className="mt-8 opacity-60 tabular-nums">{formatDtg(a.entry)}</div>
          <div className="mt-8 flex gap-16">
            <button className="underline hover:opacity-60" onClick={() => dismiss(a.key)}>
              ACK
            </button>
            {a.entry.type !== 'note' && (
              <button className="opacity-60 hover:opacity-100" onClick={() => markDone(a)}>
                Done
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
