/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar Alert Center — mounted once at app level so alerts fire on every
 * tab, not only while the System widget is visible.
 *
 * Flow: tick → dueAlerts() → POST /api/calendar/alerts (idempotent per
 * entry+stage, so a reload / second tab / second device never double-fires)
 * → on `created`, raise the on-screen order, desktop notification and tone.
 * The alert itself is a Log entry, so the Log is the permanent record.
 */

import * as React from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import { fireCalendarAlert, useSetCalendarStatus } from '#client/queries'
import { cn } from '#client/utils'
import {
  useCalendarEntries,
  useNow,
  getDesktopAlertsEnabled,
} from '#client/hooks/useCalendarEntries'
import {
  dueAlerts,
  msUntilNextBoundary,
  entryDateTime,
  militaryDTG,
  militaryClock,
  countdown,
  TYPE_CODE,
} from '#shared/utils/calendar'
import type { AlertStage, CalendarEntry } from '#shared/utils/calendar'

type ActiveAlert = { key: string; stage: AlertStage; entry: CalendarEntry; raisedAt: Date }

export const STAGE_ORDER: Record<AlertStage, string> = {
  'T-15': 'WARNING ORDER',
  'T-0': 'EXECUTE',
  DAY: 'DAY ORDER',
}

const MAX_VISIBLE = 3
const RETRY_MS = 60000

function playTone() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const beep = (freq: number, at: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + at)
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + at + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.12)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + at)
      osc.stop(ctx.currentTime + at + 0.14)
    }
    beep(880, 0)
    beep(1320, 0.18)
    window.setTimeout(() => ctx.close?.(), 800)
  } catch {}
}

function desktopNotify(stage: AlertStage, entry: CalendarEntry) {
  if (!getDesktopAlertsEnabled()) return
  try {
    new Notification(`LOT // ${STAGE_ORDER[stage]} · ${TYPE_CODE[entry.type]} ${militaryClock(entry.time)}`, {
      body: entry.text,
      tag: `lot-cal-${entry.id}-${stage}`,
      silent: true,
    })
  } catch {}
}

export function CalendarAlertCenter() {
  const queryClient = useQueryClient()
  const isSoundOn = useStore(stores.isSoundOn)
  const { entries, fired } = useCalendarEntries()
  const { mutate: setStatus } = useSetCalendarStatus()

  const boundary = React.useMemo(() => msUntilNextBoundary(entries, new Date()), [entries])
  const now = useNow(15000, boundary)

  const [active, setActive] = React.useState<ActiveAlert[]>([])
  const inflight = React.useRef<Map<string, number>>(new Map())

  React.useEffect(() => {
    const due = dueAlerts(entries, now, fired)
    for (const { entry, stage, key } of due) {
      const last = inflight.current.get(key)
      if (last !== undefined && (last === -1 || Date.now() - last < RETRY_MS)) continue
      inflight.current.set(key, Date.now())

      fireCalendarAlert(entry.id, stage)
        .then(({ created }) => {
          inflight.current.set(key, -1) // settled — never retry
          queryClient.invalidateQueries(['/api/calendar'])
          queryClient.invalidateQueries(['/api/logs'])
          if (!created) return
          // A later stage supersedes an earlier toast for the same entry.
          setActive(xs => [...xs.filter(x => x.entry.id !== entry.id), { key, stage, entry, raisedAt: new Date() }])
          desktopNotify(stage, entry)
          if (isSoundOn) playTone()
        })
        .catch(() => {
          // Offline / 5xx: keep timestamp, retry after RETRY_MS.
        })
    }
  }, [entries, fired, now, queryClient, isSoundOn])

  // Drop toasts whose entry got completed/scrubbed elsewhere.
  React.useEffect(() => {
    setActive(xs => xs.filter(x => {
      const e = entries.find(en => en.id === x.entry.id)
      return !e || e.status === 'open'
    }))
  }, [entries])

  const dismiss = (key: string) => setActive(xs => xs.filter(x => x.key !== key))

  const complete = (a: ActiveAlert) => {
    setStatus({ entryId: a.entry.id, status: 'done' }, {
      onSuccess: () => {
        queryClient.invalidateQueries(['/api/calendar'])
        queryClient.invalidateQueries(['/api/logs'])
      },
    })
    dismiss(a.key)
  }

  if (!active.length || typeof document === 'undefined') return null

  const visible = active.slice(-MAX_VISIBLE)
  const hidden = active.length - visible.length

  return createPortal(
    <div
      role="alert"
      aria-live="assertive"
      className="fixed z-50 right-16 bottom-16 left-16 sm:left-auto sm:w-[22rem] flex flex-col gap-8 pointer-events-none"
    >
      {hidden > 0 && (
        <div className="text-acc/40 uppercase tracking-widest text-right pointer-events-auto">
          +{hidden} queued
        </div>
      )}
      {visible.map(a => {
        const at = entryDateTime(a.entry)
        return (
          <div
            key={a.key}
            className={cn(
              'lot-cal-alert pointer-events-auto bg-bac text-acc border px-16 py-8',
              a.stage === 'T-0' ? 'border-acc' : 'border-acc/40'
            )}
          >
            <div className="flex justify-between gap-8 uppercase tracking-widest">
              <span>
                <span className={cn(a.stage === 'T-0' && 'lot-cal-blink')}>■</span>{' '}
                {STAGE_ORDER[a.stage]}
              </span>
              <span className="text-acc/40 tabular-nums">{a.stage}</span>
            </div>
            <div className="uppercase tracking-widest text-acc/60 tabular-nums">
              {TYPE_CODE[a.entry.type]} · {militaryClock(a.entry.time)}J
              {a.entry.time && <> · {countdown(at, now)}</>}
            </div>
            <div className="my-4 break-words">{a.entry.text}</div>
            <div className="flex justify-between items-center gap-8 uppercase tracking-widest">
              <div className="flex gap-16">
                <button className="hover:opacity-60 transition-opacity" onClick={() => dismiss(a.key)}>
                  Ack
                </button>
                {a.entry.type !== 'note' && (
                  <button className="text-acc/60 hover:text-acc transition-opacity" onClick={() => complete(a)}>
                    Complete
                  </button>
                )}
              </div>
              <span className="text-acc/30 tabular-nums">{militaryDTG(a.raisedAt)}</span>
            </div>
          </div>
        )
      })}
    </div>,
    document.body
  )
}

const style = typeof document !== 'undefined' ? document.createElement('style') : null
if (style) {
  style.textContent = `
    @keyframes lotCalIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
    @keyframes lotCalBlink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
    .lot-cal-alert { animation: lotCalIn 180ms ease-out }
    .lot-cal-blink { animation: lotCalBlink 1s steps(1) infinite }
    @media (prefers-reduced-motion: reduce) {
      .lot-cal-alert, .lot-cal-blink { animation: none }
    }
  `
  document.head.appendChild(style)
}
