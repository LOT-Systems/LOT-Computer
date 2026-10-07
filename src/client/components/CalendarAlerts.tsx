/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar alerts — global watch.
 *
 * Mounted once at app root so alerts fire on every tab, not only System.
 * Ticks every 15 s and on focus/visibility return (hidden-tab timers are
 * throttled by browsers). Each alert stage fires once per entry, is written to
 * Log (calendar_alert) and shown as a terse STANDBY / EXECUTE / MISSED line.
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useCalendarEvents, useCreateLog } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import {
  STAGE_LABEL,
  alertLogText,
  foldEntries,
  formatCountdown,
  loadFired,
  markFired,
  pendingAlerts,
} from '#client/utils/calendar'
import type { AlertStage, CalendarEntry } from '#client/utils/calendar'

const TICK_MS = 15_000
export const ALERTS_PREF_KEY = 'lot_calendar_alerts_native'

type Banner = { key: string; id: string; stage: AlertStage }

function nativeNotify(entry: CalendarEntry, stage: AlertStage) {
  try {
    if (localStorage.getItem(ALERTS_PREF_KEY) !== '1') return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    new Notification(`${STAGE_LABEL[stage]} · ${entry.type.toUpperCase()}`, {
      body: `${entry.time ?? 'ALL DAY'} · ${entry.text}`,
      tag: `${entry.id}:${stage}`,
    })
    if (stage !== 'warn') navigator.vibrate?.(stage === 'now' ? [120, 60, 120] : [200])
  } catch {
    /* notifications are best-effort */
  }
}

export function CalendarAlerts() {
  const queryClient = useQueryClient()
  const { data: events = [] } = useCalendarEvents()
  const { mutate: createLog } = useCreateLog()
  const [banners, setBanners] = React.useState<Banner[]>([])
  const [, setNow] = React.useState(0)

  const entries = React.useMemo(() => foldEntries(events as any), [events])
  const entriesRef = React.useRef(entries)
  entriesRef.current = entries

  const tick = React.useCallback(() => {
    const now = dayjs()
    setNow(now.valueOf()) // refresh countdowns
    const fired = loadFired()
    const due = pendingAlerts(entriesRef.current, fired, now)
    if (!due.length) return

    due.forEach(({ entry, stage }) => {
      const key = `${entry.id}:${stage}`
      markFired(key) // before the request: multi-tab / double-tick safe
      setBanners(b => (b.some(x => x.key === key) ? b : [...b, { key, id: entry.id, stage }]))
      nativeNotify(entry, stage)
      createLog(
        {
          text: alertLogText(entry, stage),
          event: 'calendar_alert',
          metadata: { entryId: entry.id, stage, date: entry.date, time: entry.time, entryType: entry.type },
        },
        { onSuccess: () => queryClient.invalidateQueries(['/api/calendar']) }
      )
    })
  }, [createLog, queryClient])

  React.useEffect(() => {
    tick()
    const iv = setInterval(tick, TICK_MS)
    const wake = () => { if (!document.hidden) tick() }
    document.addEventListener('visibilitychange', wake)
    window.addEventListener('focus', wake)
    return () => {
      clearInterval(iv)
      document.removeEventListener('visibilitychange', wake)
      window.removeEventListener('focus', wake)
    }
  }, [tick])

  // Re-run once entries arrive/change (initial fetch lands after mount).
  React.useEffect(() => { tick() }, [entries, tick])

  const dismiss = (key: string) => setBanners(b => b.filter(x => x.key !== key))

  const complete = (entry: CalendarEntry) => {
    createLog(
      {
        text: `[SCHEDULE] DONE ${entry.type.toUpperCase()}: ${entry.text} (${entry.date}${entry.time ? ' ' + entry.time : ''})`,
        event: 'calendar_done',
        metadata: { entryId: entry.id, date: entry.date, time: entry.time },
      },
      { onSuccess: () => queryClient.invalidateQueries(['/api/calendar']) }
    )
    setBanners(b => b.filter(x => x.id !== entry.id))
  }

  // Drop banners whose entry is no longer actionable (done/cancelled elsewhere).
  const visible = banners
    .map(b => ({ b, entry: entries.find(e => e.id === b.id) }))
    .filter((x): x is { b: Banner; entry: CalendarEntry } => !!x.entry && x.entry.status === 'open')

  if (!visible.length) return null

  return (
    <div
      className="fixed top-8 right-8 left-8 sm:left-auto sm:w-[22rem] z-50 space-y-4 pointer-events-none"
      role="alert"
      aria-live="assertive"
    >
      {visible.map(({ b, entry }) => (
        <div
          key={b.key}
          className={cn(
            'pointer-events-auto border bg-[var(--base-color)] px-12 py-8 animate-fade-in-up',
            b.stage === 'warn' && 'border-acc/30',
            b.stage === 'now' && 'border-acc animate-pulse',
            b.stage === 'missed' && 'border-acc/60 border-dashed'
          )}
        >
          <div className="flex justify-between gap-16 uppercase tracking-widest text-acc">
            <span>{STAGE_LABEL[b.stage]} // {entry.type}</span>
            <span className="tabular-nums">{formatCountdown(entry)}</span>
          </div>
          <div className="text-acc mt-4">
            {entry.time ?? 'ALL DAY'} — {entry.text}
          </div>
          <div className="flex gap-16 mt-8 text-acc/60">
            <button className="hover:text-acc transition-opacity" onClick={() => dismiss(b.key)}>
              [ACK]
            </button>
            <button className="hover:text-acc transition-opacity" onClick={() => complete(entry)}>
              [DONE]
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
