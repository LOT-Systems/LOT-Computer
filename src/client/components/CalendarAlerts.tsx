/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT/CAL — alert engine + event notifications.
 *
 * Mounted once at the app root (not inside the System tab, which unmounts),
 * so alerts fire whichever tab is open. Every 15s it scans open entries and
 * asks the server to *claim* any due STANDBY (T-15) or ALERT (T-00). The
 * server's conditional UPDATE guarantees exactly one claim per due time across
 * tabs/devices; only the winner shows the toast and the ALERT lands in Log.
 *
 * Channels on claim: on-screen bulletin (until ACK), tab-title flag, browser
 * Notification when the tab is hidden (if permitted), and a 3-pip tone when
 * Sound is on.
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import { useCalendar, calendarAction } from '#client/queries'
import * as stores from '#client/stores'
import { cn } from '#client/utils'
import {
  type CalendarEntry,
  pendingAlert,
  dueAt,
  scheduledAt,
  dtg,
  entryDtg,
  tMinus,
  SNOOZE_MINUTES,
} from '#shared/utils/calendar'

type Bulletin = {
  key: string
  kind: 'fire' | 'prealert'
  entry: CalendarEntry
  at: number
}

const TICK_MS = 15 * 1000
const PREALERT_AUTOHIDE_MS = 30 * 1000
const MAX_VISIBLE = 3
const TITLE_FLAG = '▲ ALERT · '

let audioCtx: AudioContext | null = null
function playPips() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    if (!audioCtx || audioCtx.state === 'closed') audioCtx = new Ctx()
    const ctx = audioCtx
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const t0 = ctx.currentTime + 0.02
    // Three short pips — the last one longer and higher (time-signal style).
    ;[0, 0.22, 0.44].forEach((offset, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = i === 2 ? 1320 : 880
      const len = i === 2 ? 0.32 : 0.09
      gain.gain.setValueAtTime(0.0001, t0 + offset)
      gain.gain.exponentialRampToValueAtTime(0.06, t0 + offset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + len)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0 + offset)
      osc.stop(t0 + offset + len + 0.02)
    })
  } catch (_) {}
}

function systemNotify(b: Bulletin) {
  try {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted' || !document.hidden) return
    const head = b.kind === 'fire' ? 'LOT/CAL · ALERT' : 'LOT/CAL · STANDBY T-15'
    const n = new Notification(head, {
      body: `${b.entry.entryType.toUpperCase()} · ${b.entry.text}\n${entryDtg(b.entry)}`,
      tag: `lot-cal-${b.key}`,
      silent: false,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch (_) {}
}

export function CalendarAlerts() {
  const queryClient = useQueryClient()
  const { data: entries } = useCalendar()
  const isSoundOn = useStore(stores.isSoundOn)
  const [bulletins, setBulletins] = React.useState<Bulletin[]>([])
  const [now, setNow] = React.useState(() => Date.now())
  const inFlight = React.useRef(new Set<string>())
  const soundRef = React.useRef(isSoundOn)
  soundRef.current = isSoundOn

  const entriesRef = React.useRef<CalendarEntry[]>([])
  entriesRef.current = entries || []

  const refresh = React.useCallback(
    (withLogs: boolean) => {
      queryClient.invalidateQueries(['/api/calendar'])
      if (withLogs) queryClient.invalidateQueries(['/api/logs'])
    },
    [queryClient]
  )

  const scan = React.useCallback(() => {
    const t = new Date()
    setNow(t.getTime())
    for (const entry of entriesRef.current) {
      const kind = pendingAlert(entry, t)
      if (!kind) continue
      const key = `${entry.id}:${kind}:${dueAt(entry).getTime()}`
      if (inFlight.current.has(key)) continue
      inFlight.current.add(key)
      const lateMin = kind === 'fire' ? Math.floor((t.getTime() - dueAt(entry).getTime()) / 60000) : undefined
      calendarAction(entry.id, kind, lateMin !== undefined ? { lateMin } : {})
        .then((res) => {
          if (!res?.claimed) return
          const b: Bulletin = { key, kind, entry: res.entry || entry, at: Date.now() }
          setBulletins((prev) => [b, ...prev.filter((x) => x.entry.id !== entry.id)])
          systemNotify(b)
          if (soundRef.current) playPips()
          refresh(kind === 'fire')
        })
        .catch(() => {
          // Network hiccup — allow the next tick to retry.
          inFlight.current.delete(key)
        })
    }
  }, [refresh])

  // Scan when data changes and on a steady tick (also after waking a hidden tab).
  React.useEffect(() => {
    scan()
  }, [entries, scan])

  React.useEffect(() => {
    const id = setInterval(scan, TICK_MS)
    const onVis = () => {
      if (!document.hidden) {
        refresh(false)
        scan()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [scan, refresh])

  // STANDBY bulletins self-clear; ALERTs persist until ACK.
  React.useEffect(() => {
    if (!bulletins.some((b) => b.kind === 'prealert')) return
    const id = setTimeout(() => {
      setBulletins((prev) => prev.filter((b) => b.kind !== 'prealert' || Date.now() - b.at < PREALERT_AUTOHIDE_MS))
    }, 1000)
    return () => clearTimeout(id)
  }, [bulletins, now])

  // Tab-title flag while any ALERT is unacknowledged.
  const hasAlert = bulletins.some((b) => b.kind === 'fire')
  React.useEffect(() => {
    if (!hasAlert) return
    const base = document.title.startsWith(TITLE_FLAG) ? document.title.slice(TITLE_FLAG.length) : document.title
    document.title = TITLE_FLAG + base
    return () => {
      if (document.title.startsWith(TITLE_FLAG)) document.title = document.title.slice(TITLE_FLAG.length)
    }
  }, [hasAlert])

  const dismiss = React.useCallback((key: string) => {
    setBulletins((prev) => prev.filter((b) => b.key !== key))
  }, [])

  const act = React.useCallback(
    (b: Bulletin, action: 'done' | 'snooze') => {
      dismiss(b.key)
      calendarAction(b.entry.id, action, action === 'snooze' ? { minutes: SNOOZE_MINUTES } : {})
        .then(() => refresh(true))
        .catch(() => refresh(false))
    },
    [dismiss, refresh]
  )

  // ESC acknowledges the top bulletin.
  React.useEffect(() => {
    if (!bulletins.length) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const top = bulletins.find((b) => b.kind === 'fire') || bulletins[0]
      dismiss(top.key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bulletins, dismiss])

  if (!bulletins.length) return null
  // ALERTs outrank STANDBYs; newest first within a rank.
  const ranked = bulletins
    .slice()
    .sort((a, b) => (a.kind === b.kind ? b.at - a.at : a.kind === 'fire' ? -1 : 1))
  const visible = ranked.slice(0, MAX_VISIBLE)
  const hidden = bulletins.length - visible.length
  const nowDate = new Date(now)

  return (
    <div
      className="fixed z-50 bottom-16 left-16 right-16 sm:left-auto sm:w-[22rem] flex flex-col gap-8 pointer-events-none"
      role="alert"
      aria-live="assertive"
    >
      {visible.map((b) => {
        const isFire = b.kind === 'fire'
        const sched = scheduledAt(b.entry)
        return (
          <div
            key={b.key}
            className={cn(
              'pointer-events-auto bg-[var(--base-color)] text-acc',
              'border px-16 py-8 uppercase tracking-wider leading-snug',
              'lot-cal-bulletin',
              isFire ? 'border-acc' : 'border-acc/30'
            )}
          >
            <div className="flex justify-between gap-8 text-acc/60">
              <span className="flex items-center gap-8">
                <span className={cn('inline-block w-[0.5em] h-[0.5em] bg-acc', isFire && 'lot-cal-blink')} />
                LOT/CAL · {isFire ? 'ALERT' : 'STANDBY'}
              </span>
              <span className="tabular-nums">{tMinus(dueAt(b.entry), nowDate)}</span>
            </div>
            <div className="mt-4 normal-case tracking-normal text-acc break-words">
              <span className="text-acc/60 uppercase tracking-wider">{b.entry.entryType} · </span>
              {b.entry.text}
            </div>
            <div className="mt-4 text-acc/40 tabular-nums">
              DTG {b.entry.time ? dtg(sched) : entryDtg(b.entry)}
            </div>
            <div className="mt-8 flex gap-16">
              <button className="text-acc hover:opacity-60" onClick={() => dismiss(b.key)}>
                ACK
              </button>
              <button className="text-acc/60 hover:text-acc" onClick={() => act(b, 'done')}>
                DONE
              </button>
              {isFire && (
                <button className="text-acc/60 hover:text-acc" onClick={() => act(b, 'snooze')}>
                  +{SNOOZE_MINUTES}M
                </button>
              )}
            </div>
          </div>
        )
      })}
      {hidden > 0 && (
        <div className="pointer-events-auto text-acc/40 uppercase tracking-wider text-right">
          +{hidden} QUEUED
        </div>
      )}
    </div>
  )
}

if (typeof document !== 'undefined' && !document.getElementById('lot-cal-style')) {
  const style = document.createElement('style')
  style.id = 'lot-cal-style'
  style.textContent = `
    @keyframes lotCalIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
    @keyframes lotCalBlink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
    .lot-cal-bulletin { animation: lotCalIn 0.25s ease-out; }
    .lot-cal-blink { animation: lotCalBlink 1s steps(1, end) infinite; }
    @media (prefers-reduced-motion: reduce) {
      .lot-cal-bulletin, .lot-cal-blink { animation: none; }
    }
  `
  document.head.appendChild(style)
}
