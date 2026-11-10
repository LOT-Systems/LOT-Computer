/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * CalendarAlertHost — mounted once at app root so alerts fire on every tab,
 * not only while the Calendar widget is on screen.
 *
 * Every fired alert is written to the Log (event: calendar_alert) with a
 * deterministic key, so a reload / second device never repeats it.
 */

import * as React from 'react'
import { cn } from '#client/utils'
import { useCalendarActions, useCalendarEntries } from '#client/hooks/useCalendarEntries'
import type { CalendarEntry } from '#client/hooks/useCalendarEntries'
import {
  alertKey,
  alertStage,
  isHoldStage,
  relativeLabel,
  SNOOZE_MIN,
} from '#client/utils/calendarAlerts'
import type { AlertStage } from '#client/utils/calendarAlerts'
import { sysNotify } from '#client/utils/calendarNotify'

const TICK_MS = 15_000
const PRE_DISMISS_MS = 15_000
const LS_KEY = 'lot.calendar.fired.v1'
const LS_MAX = 400

type Toast = { key: string; entryId: string; stage: AlertStage; seq: number; firedAt: number }

function readFired(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch (_) {
    return []
  }
}

function writeFired(keys: string[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(keys.slice(-LS_MAX))) } catch (_) {}
}

function beep(stage: AlertStage) {
  if (stage === 'T-15' || stage === 'TODAY') return
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const pulses = stage === 'OVERDUE' ? 2 : 3
    for (let i = 0; i < pulses; i++) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'square'
      o.frequency.value = stage === 'OVERDUE' ? 440 : 880
      g.gain.value = 0.03
      o.connect(g).connect(ctx.destination)
      const t = ctx.currentTime + i * 0.18
      o.start(t)
      o.stop(t + 0.09)
    }
    setTimeout(() => { try { ctx.close() } catch (_) {} }, 1500)
  } catch (_) {}
}

const pad = (n: number, w = 3) => String(n).padStart(w, '0')
const hhmm = (ms: number) => new Date(ms).toTimeString().slice(0, 5)

export function CalendarAlertHost() {
  const actions = useCalendarActions()
  const { entries, firedKeys, ready } = useCalendarEntries()
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const [, force] = React.useReducer((x: number) => x + 1, 0)

  // Latest values for the interval callback without re-creating the timer.
  const latest = React.useRef({ entries, firedKeys, actions })
  latest.current = { entries, firedKeys, actions }
  const session = React.useRef(new Set<string>())
  const seq = React.useRef(0)

  const byId = React.useMemo(() => new Map(entries.map(e => [e.id, e])), [entries])

  // Drop toasts whose entry was completed / scrubbed / snoozed (here or on another device).
  React.useEffect(() => {
    setToasts(ts => {
      const next = ts.filter(t => {
        const e = byId.get(t.entryId)
        return e && !e.done && alertStage(e, new Date()) !== null && (e.snoozeGen === 0 || t.key.includes(`:s${e.snoozeGen}:`))
      })
      return next.length === ts.length ? ts : next
    })
  }, [byId])

  const dismiss = React.useCallback((key: string) => {
    setToasts(t => t.filter(x => x.key !== key))
  }, [])

  React.useEffect(() => {
    if (!ready) return

    const tick = () => {
      const now = new Date()
      const { entries, firedKeys, actions } = latest.current
      const stored = readFired()
      const fresh: Toast[] = []

      for (const entry of entries) {
        const stage = alertStage(entry, now)
        if (!stage) continue
        const key = alertKey(entry.id, stage, entry.snoozeGen)
        if (session.current.has(key) || firedKeys.has(key) || stored.includes(key)) continue

        // Claim before side effects (also guards a second tab).
        session.current.add(key)
        stored.push(key)
        writeFired(stored)

        actions.alert(entry, stage, key)
        seq.current += 1
        fresh.push({ key, entryId: entry.id, stage, seq: seq.current, firedAt: now.getTime() })
        beep(stage)
        sysNotify(
          `LOT // ${stage}`,
          `${entry.type.toUpperCase()} · ${entry.text}${entry.time ? ' · ' + entry.time : ''}`,
          key
        )
      }

      if (fresh.length) {
        setToasts(prev => [...prev.filter(p => !fresh.some(f => f.entryId === p.entryId)), ...fresh].slice(-4))
        fresh.filter(f => !isHoldStage(f.stage)).forEach(f => {
          setTimeout(() => dismiss(f.key), PRE_DISMISS_MS)
        })
      }
      force()
    }

    tick()
    const id = setInterval(tick, TICK_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [ready, dismiss])

  // ESC acknowledges the most recent alert.
  React.useEffect(() => {
    if (!toasts.length) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') dismiss(toasts[toasts.length - 1].key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toasts, dismiss])

  const visible = toasts
    .map(t => ({ t, e: byId.get(t.entryId) }))
    .filter((x): x is { t: Toast; e: CalendarEntry } => !!x.e)
  if (!visible.length) return null
  const now = new Date()

  return (
    <div
      className="fixed right-16 bottom-16 z-[1000] flex flex-col gap-8 max-w-[340px] w-[calc(100vw-32px)]"
      role="alert"
      aria-live="assertive"
    >
      {visible.map(({ t, e }) => {
        const hot = t.stage === 'OVERDUE'
        const live = t.stage === 'T-0'
        return (
          <div
            key={t.key}
            className={cn(
              'bg-bac border px-16 py-8 font-mono tabular-nums',
              hot || live ? 'border-acc' : 'border-acc/40',
            )}
          >
            <div className="flex justify-between gap-16 text-acc">
              <span className="tracking-wider whitespace-nowrap">
                <span className={cn((hot || live) && 'animate-pulse')}>{hot ? '!!' : live ? '>>' : '//'}</span>
                {' '}CAL · {t.stage}
              </span>
              <span className="text-acc/40 whitespace-nowrap">#{pad(t.seq)} · {hhmm(t.firedAt)}</span>
            </div>
            <div className="text-acc mt-4 break-words">
              <span className="text-acc/50 uppercase tracking-widest">{e.type} </span>
              {e.text}
            </div>
            <div className="text-acc/50 mt-4">
              {e.date} {e.time || 'ALL DAY'} · {relativeLabel(e, now).toUpperCase()}
              {e.snoozeGen > 0 && ` · SNZ ${e.snoozeGen}`}
            </div>
            <div className="flex gap-16 mt-8 text-acc/60 uppercase">
              <button className="hover:text-acc" onClick={() => dismiss(t.key)}>[ack]</button>
              {isHoldStage(t.stage) && (
                <button className="hover:text-acc" onClick={() => { actions.snooze(e); dismiss(t.key) }}>
                  [+{SNOOZE_MIN}m]
                </button>
              )}
              <button className="hover:text-acc" onClick={() => { actions.done(e, t.stage); dismiss(t.key) }}>[done]</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
