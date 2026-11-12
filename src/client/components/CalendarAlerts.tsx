/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar alert monitor — mounted once at the app root so it keeps watch on
 * every tab (System unmounts when inactive). Fires T-15 and T-0 alerts, logs
 * each into Log as `calendar_alert`, and dedupes across tabs (localStorage)
 * and devices (alert receipts in the calendar feed).
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Button } from '#client/components/ui'
import { cn } from '#client/utils'
import { useCalendar, useNow } from '#client/hooks/useCalendar'
import {
  formatCountdown,
  formatMilTime,
  nextAlertBoundary,
  pendingAlert,
  TYPE_CODE,
  type AlertStage,
  type CalendarEntry,
} from '#client/utils/calendar'

type ActiveAlert = { entryId: string; stage: AlertStage; firedAt: number }

const GUARD_PREFIX = 'lot_cal_alert:'
const GUARD_TTL_MS = 3 * 24 * 60 * 60 * 1000

function claimAlert(entryId: string, stage: AlertStage): boolean {
  const key = `${GUARD_PREFIX}${entryId}:${stage}`
  try {
    if (localStorage.getItem(key)) return false
    localStorage.setItem(key, String(Date.now()))
  } catch {
    // Storage unavailable — fall through; server receipts still dedupe.
  }
  return true
}

function sweepGuards() {
  try {
    const cutoff = Date.now() - GUARD_TTL_MS
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith(GUARD_PREFIX)) continue
      if (Number(localStorage.getItem(k)) < cutoff) localStorage.removeItem(k)
    }
  } catch {}
}

// ── Notification permission ("arming") ───────────────────────────────────────

export type ArmState = 'unsupported' | 'denied' | 'off' | 'armed'

export function getArmState(): ArmState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  if (Notification.permission === 'granted') return 'armed'
  return 'off'
}

export async function armAlerts(): Promise<ArmState> {
  if (getArmState() !== 'off') return getArmState()
  try { await Notification.requestPermission() } catch {}
  return getArmState()
}

// ── Audio cue — two short square-wave pips, only when sound is on ────────────

function playPips(stage: AlertStage) {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx: AudioContext = new Ctx()
    const count = stage === 'T-0' ? 3 : 2
    for (let i = 0; i < count; i++) {
      const t = ctx.currentTime + i * 0.18
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = stage === 'T-0' ? 1320 : 880
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.05, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.12)
    }
    window.setTimeout(() => ctx.close().catch(() => {}), 1200)
  } catch {}
}

function systemNotify(entry: CalendarEntry, stage: AlertStage) {
  if (getArmState() !== 'armed' || !document.hidden) return
  try {
    const n = new Notification(`LOT · ${stage} · ${TYPE_CODE[entry.type]}`, {
      body: `${entry.text}\n${entry.date} ${formatMilTime(entry.time)}`,
      tag: `lot-cal-${entry.id}-${stage}`,
      requireInteraction: stage === 'T-0',
    })
    n.onclick = () => { window.focus(); n.close() }
  } catch {}
}

function formatAlertDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const wd = dt.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const mo = dt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  return `${wd} ${String(d).padStart(2, '0')} ${mo} ${y}`
}

// ── Monitor ──────────────────────────────────────────────────────────────────

export function CalendarAlerts() {
  const isSoundOn = useStore(stores.isSoundOn)
  const { entries, isReady, setStatus, logAlert } = useCalendar()
  const [queue, setQueue] = React.useState<ActiveAlert[]>([])
  // 1s cadence only while an alert is on screen (live countdown); 15s otherwise.
  const now = useNow(queue.length ? 1000 : 15000)
  const [, forceTick] = React.useState(0)

  React.useEffect(() => { sweepGuards() }, [])

  // Precise wake-up at the next alert boundary (covers throttled intervals).
  React.useEffect(() => {
    const ms = nextAlertBoundary(entries, Date.now())
    if (ms === null || ms > 2 ** 31 - 1) return
    const id = window.setTimeout(() => forceTick(t => t + 1), ms + 250)
    return () => window.clearTimeout(id)
  }, [entries])

  // Scan for due alerts. Requires a loaded feed so server receipts can dedupe.
  React.useEffect(() => {
    if (!isReady) return
    const t = Date.now()
    const fresh: ActiveAlert[] = []
    for (const entry of entries) {
      if (entry.id.startsWith('tmp-')) continue
      const stage = pendingAlert(entry, t)
      if (!stage) continue
      if (!claimAlert(entry.id, stage)) continue
      fresh.push({ entryId: entry.id, stage, firedAt: t })
      logAlert(entry, stage)
      systemNotify(entry, stage)
    }
    if (fresh.length) {
      if (isSoundOn) playPips(fresh.some(a => a.stage === 'T-0') ? 'T-0' : 'T-15')
      setQueue(q => {
        // A T-0 supersedes a still-open T-15 for the same entry.
        const ids = new Set(fresh.map(a => a.entryId))
        return [...q.filter(a => !ids.has(a.entryId)), ...fresh]
      })
    }
  }, [now, entries, isReady, isSoundOn, logAlert])

  // Drop alerts whose entry was closed elsewhere.
  const visible = React.useMemo(() => {
    const byId = new Map(entries.map(e => [e.id, e]))
    return queue
      .map(a => ({ alert: a, entry: byId.get(a.entryId) }))
      .filter((x): x is { alert: ActiveAlert; entry: CalendarEntry } =>
        !!x.entry && x.entry.status === 'scheduled')
  }, [queue, entries])

  const dismiss = (entryId: string) => setQueue(q => q.filter(a => a.entryId !== entryId))

  if (!visible.length) return null
  const { alert, entry } = visible[0]
  const isZero = alert.stage === 'T-0'

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'fixed z-[60] top-16 left-16 right-16 sm:left-auto sm:w-[360px]',
        'bg-[var(--base-color)] border text-acc',
        isZero ? 'border-acc/60' : 'border-acc/30',
      )}
    >
      <div className="flex justify-between items-center px-16 py-8 border-b border-acc/20 uppercase tracking-widest text-[0.75em]">
        <span className="flex items-center gap-8">
          <span className={cn('inline-block w-[7px] h-[7px] bg-acc', isZero && 'blink')} />
          {isZero ? 'CAL ALERT · T-0' : 'CAL WARN · T-15'}
        </span>
        <span className="tabular-nums opacity-60">
          {visible.length > 1 ? `1/${visible.length}` : formatMilTime(entry.time)}
        </span>
      </div>
      <div className="px-16 py-8">
        <div className="uppercase tracking-widest text-[0.75em] opacity-40 mb-4">
          {TYPE_CODE[entry.type]} · {formatAlertDate(entry.date)} · {formatMilTime(entry.time)}
        </div>
        <div className="mb-8 break-words">{entry.text}</div>
        <div className="tabular-nums tracking-widest opacity-60 mb-8">
          {formatCountdown(entry.dueAt, now)}
        </div>
        <div className="flex gap-8">
          <Button size="small" onClick={() => dismiss(entry.id)}>ACK</Button>
          <Button
            size="small"
            onClick={() => { setStatus(entry, 'done'); dismiss(entry.id) }}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
