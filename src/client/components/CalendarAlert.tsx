/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar alert stack — terminal-grade event notifications.
 *
 *   CAL//ALERT ······················ T-14:59
 *   EXECUTE · TSK · 14:30L
 *   Call with the foundry
 *   161430L NOV 26 · SEQ 003
 *   [ ACK ]  [ DONE ]
 *
 * Fixed top-right, stacks newest on top, max 3 visible. No auto-dismiss
 * for EXECUTE alerts — they hold until acknowledged.
 */

import * as React from 'react'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import {
  type CalendarAlert,
  dtg,
  entryMoment,
  formatT,
  stageLabel,
  typeCode,
} from '#client/utils/calendar'

type Props = {
  alerts: (CalendarAlert & { seq: number })[]
  onAck: (key: string) => void
  onDone: (alert: CalendarAlert) => void
}

const AUTO_DISMISS_MS = 60 * 1000

let stylesInjected = false
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return
  stylesInjected = true
  const el = document.createElement('style')
  el.textContent = `
@keyframes lotCalIn { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
@keyframes lotCalBlink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0.15 } }
.lot-cal-in { animation: lotCalIn 0.28s ease-out both }
.lot-cal-blink { animation: lotCalBlink 1s steps(1) infinite }
@media (prefers-reduced-motion: reduce) { .lot-cal-in, .lot-cal-blink { animation: none } }
`
  document.head.appendChild(el)
}

function AlertCard({
  alert,
  now,
  onAck,
  onDone,
}: {
  alert: CalendarAlert & { seq: number }
  now: number
  onAck: Props['onAck']
  onDone: Props['onDone']
}) {
  const e = alert.entry
  const target = entryMoment(e)
  const isExecute = alert.stage === 'now'

  // Pre / day-of alerts self-clear after a minute; EXECUTE holds.
  React.useEffect(() => {
    if (isExecute) return
    const t = setTimeout(() => onAck(alert.key), AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [alert.key, isExecute, onAck])

  const tTarget = e.time ? target.valueOf() : target.endOf('day').valueOf()

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'lot-cal-in pointer-events-auto w-[22em] max-w-[calc(100vw-32px)]',
        'border bg-[var(--base-color)] px-16 py-8 text-acc',
        isExecute ? 'border-acc/60' : 'border-acc/20'
      )}
    >
      <div className="flex items-baseline justify-between gap-8 uppercase tracking-widest">
        <span className="flex items-baseline gap-4">
          <span className={cn(isExecute && 'lot-cal-blink')}>■</span>
          <span>CAL//ALERT</span>
        </span>
        <span className="tabular-nums opacity-60">{formatT(tTarget, now)}</span>
      </div>

      <div className="mt-4 uppercase tracking-widest opacity-60">
        {stageLabel(alert.stage)} · {typeCode(e.type)} · {e.time ? `${e.time}L` : 'ALL DAY'}
      </div>

      <div className="mt-8 break-words">{e.text}</div>

      <div className="mt-8 flex items-baseline justify-between gap-8 tabular-nums opacity-30 uppercase tracking-widest">
        <span>{dtg(e.time ? target : dayjs(alert.at))}</span>
        <span>SEQ {String(alert.seq).padStart(3, '0')}</span>
      </div>

      <div className="mt-8 flex gap-16 uppercase tracking-widest">
        <button className="opacity-60 hover:opacity-100" onClick={() => onAck(alert.key)}>
          [ ACK ]
        </button>
        {e.type !== 'note' && (
          <button className="opacity-60 hover:opacity-100" onClick={() => onDone(alert)}>
            [ DONE ]
          </button>
        )}
      </div>
    </div>
  )
}

export function CalendarAlertStack({ alerts, onAck, onDone }: Props) {
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    injectStyles()
  }, [])

  React.useEffect(() => {
    if (!alerts.length) return
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [alerts.length])

  if (!alerts.length) return null

  const visible = alerts.slice(-3).reverse()
  const hidden = alerts.length - visible.length

  return (
    <div className="pointer-events-none fixed right-16 top-16 z-50 flex flex-col items-end gap-8">
      {visible.map(a => (
        <AlertCard key={a.key} alert={a} now={now} onAck={onAck} onDone={onDone} />
      ))}
      {hidden > 0 && (
        <div className="pointer-events-auto uppercase tracking-widest text-acc/40">
          +{hidden} QUEUED
        </div>
      )}
    </div>
  )
}

// ── Audio: two short square pips, only when LOT sound is on ─────────────────

let audioCtx: AudioContext | null = null

export function playAlertPips(execute: boolean) {
  try {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctor) return
    if (!audioCtx || audioCtx.state === 'closed') audioCtx = new Ctor()
    const ctx = audioCtx
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const count = execute ? 3 : 2
    for (let i = 0; i < count; i++) {
      const t0 = ctx.currentTime + i * 0.16
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = execute ? 1320 : 880
      gain.gain.setValueAtTime(0, t0)
      gain.gain.linearRampToValueAtTime(0.06, t0 + 0.005)
      gain.gain.linearRampToValueAtTime(0, t0 + 0.08)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0)
      osc.stop(t0 + 0.09)
    }
  } catch {
    /* audio unavailable */
  }
}

// ── Browser notification (only if the operator already granted it) ──────────

export function systemNotify(alert: CalendarAlert) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const e = alert.entry
    new Notification(`CAL//ALERT · ${stageLabel(alert.stage)}`, {
      body: `${typeCode(e.type)} · ${e.time ? `${e.time}L` : 'ALL DAY'} — ${e.text}`,
      tag: alert.key,
      silent: true,
    })
  } catch {
    /* notifications unavailable */
  }
}
