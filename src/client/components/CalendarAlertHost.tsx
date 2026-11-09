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
import { useQueryClient } from 'react-query'
import { useCreateLog } from '#client/queries'
import { cn } from '#client/utils'
import { useCalendarEntries } from '#client/hooks/useCalendarEntries'
import type { CalendarEntry } from '#client/hooks/useCalendarEntries'
import {
  alertKey,
  alertStage,
  relativeLabel,
} from '#client/utils/calendarAlerts'
import type { AlertStage } from '#client/utils/calendarAlerts'

const TICK_MS = 15_000
const LS_KEY = 'lot.calendar.fired.v1'
const LS_MAX = 300

type Toast = { key: string; entry: CalendarEntry; stage: AlertStage }

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

export function CalendarAlertHost() {
  const queryClient = useQueryClient()
  const { mutate: createLog } = useCreateLog()
  const { entries, firedKeys, ready } = useCalendarEntries()
  const [toasts, setToasts] = React.useState<Toast[]>([])

  // Latest values for the interval callback without re-creating the timer.
  const latest = React.useRef({ entries, firedKeys })
  latest.current = { entries, firedKeys }
  const session = React.useRef(new Set<string>())

  const dismiss = React.useCallback((key: string) => {
    setToasts(t => t.filter(x => x.key !== key))
  }, [])

  const markDone = React.useCallback((entry: CalendarEntry, key: string) => {
    createLog({
      text: `[DONE] ${entry.type}: ${entry.text}`,
      event: 'calendar_done',
      metadata: { entryId: entry.id, date: entry.date, time: entry.time, text: entry.text, stage: 'DONE' },
    }, { onSuccess: () => queryClient.refetchQueries(['/api/logs']) })
    dismiss(key)
  }, [createLog, dismiss, queryClient])

  React.useEffect(() => {
    if (!ready) return

    const tick = () => {
      const now = new Date()
      const { entries, firedKeys } = latest.current
      const stored = readFired()
      const fresh: Toast[] = []

      for (const entry of entries) {
        const stage = alertStage(entry, now)
        if (!stage) continue
        const key = alertKey(entry.id, stage)
        if (session.current.has(key) || firedKeys.has(key) || stored.includes(key)) continue

        // Claim before side effects (also guards a second tab).
        session.current.add(key)
        stored.push(key)
        writeFired(stored)

        const stamp = `${entry.date}${entry.time ? ' ' + entry.time : ''}`
        createLog({
          text: `[ALERT ${stage}] ${entry.type}: ${entry.text} (${stamp})`,
          event: 'calendar_alert',
          metadata: { key, entryId: entry.id, stage, date: entry.date, time: entry.time, text: entry.text, entryType: entry.type },
        }, { onSuccess: () => queryClient.refetchQueries(['/api/logs']) })

        fresh.push({ key, entry, stage })
        beep(stage)
      }

      if (fresh.length) {
        setToasts(prev => [...prev.filter(p => !fresh.some(f => f.entry.id === p.entry.id)), ...fresh].slice(-4))
        // Pre-alerts fade on their own; T-0 / OVERDUE / TODAY wait for ACK.
        fresh.filter(f => f.stage === 'T-15').forEach(f => {
          setTimeout(() => dismiss(f.key), 15_000)
        })
      }
    }

    tick()
    const id = setInterval(tick, TICK_MS)
    const onVisible = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [ready, createLog, dismiss, queryClient])

  if (!toasts.length) return null
  const now = new Date()

  return (
    <div
      className="fixed right-16 bottom-16 z-[1000] flex flex-col gap-8 max-w-[340px] w-[calc(100vw-32px)]"
      role="alert"
      aria-live="assertive"
    >
      {toasts.map(({ key, entry, stage }) => (
        <div
          key={key}
          className={cn(
            'bg-[var(--bg,#000)] border px-12 py-8 font-mono',
            stage === 'OVERDUE' ? 'border-acc' : 'border-acc/40',
          )}
        >
          <div className="flex justify-between gap-16 text-acc tabular-nums">
            <span className="tracking-widest">
              {stage === 'OVERDUE' ? '!! ' : '// '}{stage}
            </span>
            <span className="text-acc/60">
              {entry.time || 'ALL DAY'} · {relativeLabel(entry, now)}
            </span>
          </div>
          <div className="text-acc mt-4 break-words">
            <span className="text-acc/60 uppercase">{entry.type} </span>
            {entry.text}
          </div>
          <div className="flex gap-16 mt-8 text-acc/60">
            <button className="hover:text-acc" onClick={() => dismiss(key)}>[ack]</button>
            <button className="hover:text-acc" onClick={() => markDone(entry, key)}>[done]</button>
          </div>
        </div>
      ))}
    </div>
  )
}
