/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Calendar core — pure helpers (no React, no network) for entries, alerts and time tracking.

export type EntryType = 'note' | 'task' | 'call'

export type AlertLevel = 'T-15' | 'T-05' | 'T-00' | 'OVERDUE'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm (24h) or null for all-day
  text: string
  type: EntryType
  done: boolean
  trackedMin: number
}

type LogLike = {
  id: string
  text?: string | null
  event?: string | null
  metadata?: Record<string, any> | null
}

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

export function normalizeTime(raw: string): string | null {
  const m = raw.trim().match(TIME_RE)
  if (!m) return null
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

/** Local-time epoch ms for an entry; all-day entries resolve to end of that day. */
export function entryTimestamp(e: Pick<CalendarEntry, 'date' | 'time'>): number {
  const [y, mo, d] = e.date.split('-').map(Number)
  if (!y || !mo || !d) return NaN
  if (!e.time) return new Date(y, mo - 1, d, 23, 59, 59).getTime()
  const [h, mi] = e.time.split(':').map(Number)
  return new Date(y, mo - 1, d, h, mi, 0).getTime()
}

/**
 * Fold the calendar_entry / calendar_done logs into one entry list.
 * A calendar_done log references its entry via metadata.entryId and may carry trackedMin.
 */
export function buildEntries(logs: LogLike[]): CalendarEntry[] {
  const done = new Map<string, number>()
  const tracked = new Map<string, number>()
  for (const log of logs) {
    if (log.event !== 'calendar_done' || !log.metadata?.entryId) continue
    const id = String(log.metadata.entryId)
    if (log.metadata.completed) done.set(id, 1)
    const min = Number(log.metadata.trackedMin) || 0
    if (min > 0) tracked.set(id, (tracked.get(id) || 0) + min)
  }

  return logs
    .filter(log => log.event === 'calendar_entry' && log.metadata)
    .map(log => {
      const time = typeof log.metadata!.time === 'string' ? normalizeTime(log.metadata!.time) : null
      return {
        id: log.id,
        date: log.metadata!.date as string,
        time,
        text: (log.metadata!.text as string) || log.text || '',
        type: ((log.metadata!.entryType as EntryType) || 'note'),
        done: done.has(log.id),
        trackedMin: tracked.get(log.id) || 0,
      }
    })
    .filter(e => e.date && e.text)
    .sort((a, b) => entryTimestamp(a) - entryTimestamp(b))
}

/** Overdue alert window: entries missed by more than this are not re-announced. */
const OVERDUE_WINDOW_MIN = 60

/**
 * Current alert level of a timed entry, or null if none applies.
 * Returns the most urgent level reached (a late page load never replays T-15 after T-05).
 */
export function alertLevel(e: CalendarEntry, now: number): AlertLevel | null {
  if (!e.time || e.done) return null
  const diffMin = (entryTimestamp(e) - now) / 60000
  if (diffMin < -OVERDUE_WINDOW_MIN) return null
  if (diffMin < 0) return 'OVERDUE'
  if (diffMin < 1) return 'T-00'
  if (diffMin <= 5) return 'T-05'
  if (diffMin <= 15) return 'T-15'
  return null
}

export function alertKey(e: CalendarEntry, level: AlertLevel): string {
  return `${e.id}:${level}`
}

/** "T-05 MIN", "T-00", "OVERDUE 12 MIN" */
export function formatCountdown(e: CalendarEntry, now: number): string {
  const diff = Math.round((entryTimestamp(e) - now) / 60000)
  if (diff > 0) return `T-${String(diff).padStart(2, '0')} MIN`
  if (diff === 0) return 'T-00'
  return `OVERDUE ${-diff} MIN`
}

export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

// ── Persistence (per-browser, best-effort) ───────────────────────────────

const FIRED_KEY = 'lot-calendar-fired'
const TRACKER_KEY = 'lot-calendar-tracker'

export type ActiveTracker = { entryId: string; startedAt: number }

export function loadFired(): Set<string> {
  try {
    const arr = JSON.parse(localStorage.getItem(FIRED_KEY) || '[]')
    return new Set(Array.isArray(arr) ? arr : [])
  } catch (_) {
    return new Set()
  }
}

export function saveFired(set: Set<string>) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(set).slice(-200)))
  } catch (_) {}
}

export function loadTracker(): ActiveTracker | null {
  try {
    const t = JSON.parse(localStorage.getItem(TRACKER_KEY) || 'null')
    return t && t.entryId && Number.isFinite(t.startedAt) ? t : null
  } catch (_) {
    return null
  }
}

export function saveTracker(t: ActiveTracker | null) {
  try {
    if (t) localStorage.setItem(TRACKER_KEY, JSON.stringify(t))
    else localStorage.removeItem(TRACKER_KEY)
  } catch (_) {}
}

// ── Alert tone ───────────────────────────────────────────────────────────

/** Short square-wave pips: 1 for T-15, 2 for T-05, 3 for T-00/OVERDUE. Silent if audio is unavailable. */
export function playAlertTone(level: AlertLevel) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const pips = level === 'T-15' ? 1 : level === 'T-05' ? 2 : 3
    for (let i = 0; i < pips; i++) {
      const t = ctx.currentTime + i * 0.18
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = level === 'T-15' ? 660 : 880
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.06, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.14)
    }
    setTimeout(() => ctx.close().catch(() => {}), pips * 180 + 300)
  } catch (_) {}
}
