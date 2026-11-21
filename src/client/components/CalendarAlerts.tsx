/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar alerts — app-wide watcher + on-screen dispatch panel.
 *
 * Mounted once at the app root so alerts fire on every tab, not only while the
 * System tab (and its Calendar widget) is open. Every alert is also written to
 * the Log as a `calendar_alert` row.
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { cn } from '#client/utils'
import {
  $calendarAlerts,
  dismissCalendarAlert,
  useCalendarAlertWatcher,
  useCalendarData,
  useNow,
  type ActiveAlert,
} from '#client/hooks/useCalendar'
import { formatCountdown, PHASE_LABEL, PRIORITY } from '#client/utils/calendar'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function stamp(date: string, time: string | null): string {
  const [y, m, d] = date.split('-').map(Number)
  const wd = WEEKDAYS[new Date(y, m - 1, d).getDay()]
  return `${wd} ${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}${time ? ` · ${time}` : ' · ALL DAY'}`
}

function clock(now: number): string {
  const d = new Date(now)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}L`
}

/** Two short square-wave pips — a radio-net "attention" tone. Silent unless sound is on. */
function playAlertTone() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const t0 = ctx.currentTime + 0.02
    ;[0, 0.18].forEach((offset, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(i === 0 ? 880 : 1320, t0 + offset)
      gain.gain.setValueAtTime(0.0001, t0 + offset)
      gain.gain.exponentialRampToValueAtTime(0.06, t0 + offset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + 0.12)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0 + offset)
      osc.stop(t0 + offset + 0.14)
    })
    window.setTimeout(() => ctx.close().catch(() => {}), 800)
  } catch (_) {}
}

/** OS-level notification only if the user already granted it — never prompts. */
function systemNotify(a: ActiveAlert) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    if (!document.hidden) return
    new Notification(`CAL · ${PHASE_LABEL[a.phase]}`, {
      body: `${a.entry.type.toUpperCase()} — ${a.entry.text}\n${stamp(a.entry.date, a.entry.time)}`,
      tag: a.key,
    })
  } catch (_) {}
}

const AlertCard: React.FC<{
  alert: ActiveAlert
  now: number
  onDone: () => void
}> = ({ alert, now, onDone }) => {
  const { entry, phase } = alert
  const target = entry.time ? entry.at : entry.at + 24 * 60 * 60 * 1000
  const isLive = phase === 'T-15'

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'pointer-events-auto w-full sm:w-[340px]',
        'border border-acc/40 bg-bac text-acc',
        'px-16 py-8 uppercase tracking-widest tabular-nums',
        'cal-alert-in'
      )}
    >
      <div className="flex justify-between items-baseline gap-8 opacity-60">
        <span className="flex items-center gap-4">
          <span className="cal-alert-pip inline-block w-[0.5em] h-[0.5em] bg-acc" aria-hidden="true" />
          CAL/ALERT · {PRIORITY[entry.type]}
        </span>
        <span>{clock(now)}</span>
      </div>

      <div className="mt-8 flex justify-between items-baseline gap-8">
        <span>{PHASE_LABEL[phase]}</span>
        <span className={cn(isLive ? 'opacity-100' : 'opacity-60')}>
          {entry.time ? formatCountdown(target, now) : 'EOD'}
        </span>
      </div>

      <div className="mt-8 normal-case tracking-normal break-words">
        <span className="uppercase tracking-widest opacity-60">{entry.type}</span>{' '}
        {entry.text}
      </div>

      <div className="mt-4 opacity-40">{stamp(entry.date, entry.time)}</div>

      <div className="mt-8 flex gap-16">
        <button
          className="opacity-60 hover:opacity-100 transition-opacity"
          onClick={() => dismissCalendarAlert(alert.key)}
        >
          [ ACK ]
        </button>
        <button
          className="opacity-60 hover:opacity-100 transition-opacity"
          onClick={onDone}
        >
          [ DONE ]
        </button>
      </div>
    </div>
  )
}

export function CalendarAlerts() {
  const alerts = useStore($calendarAlerts)
  const isSoundOn = useStore(stores.isSoundOn)
  const soundRef = React.useRef(isSoundOn)
  soundRef.current = isSoundOn

  const onFire = React.useCallback((a: ActiveAlert) => {
    if (soundRef.current) playAlertTone()
    systemNotify(a)
  }, [])

  useCalendarAlertWatcher(onFire)

  // Escape acknowledges the newest alert.
  React.useEffect(() => {
    if (!alerts.length) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissCalendarAlert(alerts[alerts.length - 1].key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [alerts])

  if (!alerts.length) return null
  return <AlertStack alerts={alerts} />
}

// Separate component so the 1 Hz clock only runs while alerts are on screen.
const AlertStack: React.FC<{ alerts: ActiveAlert[] }> = ({ alerts }) => {
  const now = useNow(1000)
  const { setStatus } = useCalendarData()
  return (
    <div
      className={cn(
        'fixed z-[60] top-16 left-16 right-16 sm:left-auto',
        'flex flex-col gap-8 pointer-events-none'
      )}
    >
      {alerts.map(a => (
        <AlertCard
          key={a.key}
          alert={a}
          now={now}
          onDone={() => setStatus(a.entry, 'done')}
        />
      ))}
    </div>
  )
}

// Keyframes — injected once.
if (typeof document !== 'undefined' && !document.getElementById('cal-alert-style')) {
  const style = document.createElement('style')
  style.id = 'cal-alert-style'
  style.textContent = `
    @keyframes calAlertIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
    @keyframes calAlertPip { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
    .cal-alert-in { animation: calAlertIn 0.25s ease-out; }
    .cal-alert-pip { animation: calAlertPip 1s steps(1) infinite; }
    @media (prefers-reduced-motion: reduce) {
      .cal-alert-in, .cal-alert-pip { animation: none; }
    }
  `
  document.head.appendChild(style)
}
