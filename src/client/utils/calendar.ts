/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar core — pure scheduling logic shared by the Calendar widget and the
 * global alert engine (CalendarAlerts). No React, no network.
 *
 * Entries are stored as `calendar_entry` logs. All dates/times are LOCAL wall
 * clock strings ('YYYY-MM-DD', 'HH:mm'), interpreted in the viewer's timezone.
 *
 * Alert stages for one trigger instant (T):
 *   WARN   — T-15 min ≤ now < T          (timed entries only, soft banner)
 *   ALERT  — T ≤ now < T+ALERT_WINDOW    (full alert, logged)
 *   MISSED — T+ALERT_WINDOW ≤ now < T+MISSED_HORIZON (logged once on return)
 */

import dayjs from '#client/utils/dayjs'

export type EntryType = 'note' | 'task' | 'call'
export type EntryStatus = 'open' | 'done' | 'cancelled'
export type AlertStage = 'WARN' | 'ALERT' | 'MISSED'

export type CalendarEntry = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm or null (all-day)
  text: string
  type: EntryType
  status: EntryStatus
  snoozeUntil: string | null // ISO
  alertedFor: string | null // ISO of trigger already alerted (cross-device dedupe)
  createdAt: string
}

export type RawCalendarLog = {
  id: string
  text: string | null
  metadata: Record<string, any> | null
  createdAt: string | Date
}

export const WARN_LEAD_MS = 15 * 60 * 1000
export const ALERT_WINDOW_MS = 30 * 60 * 1000
export const MISSED_HORIZON_MS = 3 * 24 * 60 * 60 * 1000
export const ALL_DAY_MUSTER = '09:00'
export const SNOOZE_MS = 10 * 60 * 1000

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TYPES: EntryType[] = ['note', 'task', 'call']
const STATUSES: EntryStatus[] = ['open', 'done', 'cancelled']

/** Normalise loose user time input ("9", "930", "9:30", "21.05") → "HH:mm" or null. */
export function parseTimeInput(raw: string): string | null {
  const s = (raw || '').trim().replace(/[.\s]/g, ':')
  if (!s) return null
  let h: number
  let m: number
  const colon = s.match(/^(\d{1,2}):(\d{1,2})$/)
  if (colon) {
    h = +colon[1]
    m = +colon[2]
  } else if (/^\d{1,4}$/.test(s)) {
    if (s.length <= 2) {
      h = +s
      m = 0
    } else {
      h = +s.slice(0, s.length - 2)
      m = +s.slice(-2)
    }
  } else {
    return null
  }
  if (h > 23 || m > 59) return null
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function normalizeEntry(log: RawCalendarLog): CalendarEntry | null {
  const md = log.metadata || {}
  const date = typeof md.date === 'string' && DATE_RE.test(md.date) ? md.date : null
  const text = (typeof md.text === 'string' && md.text) || log.text || ''
  if (!date || !text) return null
  return {
    id: log.id,
    date,
    time: typeof md.time === 'string' && TIME_RE.test(md.time) ? md.time : null,
    text,
    type: TYPES.includes(md.entryType) ? md.entryType : 'note',
    status: STATUSES.includes(md.status) ? md.status : 'open',
    snoozeUntil: typeof md.snoozeUntil === 'string' ? md.snoozeUntil : null,
    alertedFor: typeof md.alertedFor === 'string' ? md.alertedFor : null,
    createdAt: new Date(log.createdAt).toISOString(),
  }
}

/** Scheduled instant (ignores snooze). */
export function scheduledAt(e: CalendarEntry): number {
  return dayjs(`${e.date}T${e.time || ALL_DAY_MUSTER}:00`).valueOf()
}

/** Effective trigger instant — snooze pushes it forward. */
export function triggerAt(e: CalendarEntry): number {
  const base = scheduledAt(e)
  if (e.snoozeUntil) {
    const s = Date.parse(e.snoozeUntil)
    if (!isNaN(s) && s > base) return s
  }
  return base
}

export function sortEntries(entries: CalendarEntry[]): CalendarEntry[] {
  return [...entries].sort((a, b) => scheduledAt(a) - scheduledAt(b))
}

/** Which stage (if any) an entry is in right now. */
export function stageAt(e: CalendarEntry, now: number): AlertStage | null {
  if (e.status !== 'open') return null
  const t = triggerAt(e)
  const snoozed = t !== scheduledAt(e)
  // Logged after its own trigger (back-dated, or all-day entry added after
  // muster): nothing to warn about.
  if (!snoozed && Date.parse(e.createdAt) >= t) return null
  if (e.time && !snoozed && now >= t - WARN_LEAD_MS && now < t) return 'WARN'
  if (now >= t && now < t + ALERT_WINDOW_MS) return 'ALERT'
  if (now >= t + ALERT_WINDOW_MS && now < t + MISSED_HORIZON_MS) return 'MISSED'
  return null
}

/** Dedupe key for one stage of one trigger instant. */
export function fireKey(e: CalendarEntry, stage: AlertStage): string {
  // ALERT and MISSED share a key: an entry is reported once per trigger.
  const s = stage === 'WARN' ? 'W' : 'A'
  return `${e.id}:${s}:${triggerAt(e)}`
}

/** Has this trigger already been alerted on any device? */
export function alertedOnServer(e: CalendarEntry): boolean {
  if (!e.alertedFor) return false
  const a = Date.parse(e.alertedFor)
  return !isNaN(a) && a === triggerAt(e)
}

/** "T-02:14:33" / "T-3D 04H" / "T+00:05:10" */
export function formatTMinus(target: number, now: number): string {
  const diff = target - now
  const sign = diff >= 0 ? '-' : '+'
  const abs = Math.abs(diff)
  const totalSec = Math.floor(abs / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const p = (n: number) => String(n).padStart(2, '0')
  if (d > 0) return `T${sign}${d}D ${p(h)}H`
  return `T${sign}${p(h)}:${p(m)}:${p(s)}`
}

/** "0930 HRS" or "ALL DAY" */
export function formatHrs(time: string | null): string {
  return time ? `${time.replace(':', '')} HRS` : 'ALL DAY'
}

/** Military date-time group, local: "151430L NOV 26" */
export function formatDTG(ms: number): string {
  const d = dayjs(ms)
  return `${d.format('DDHHmm')}L ${d.format('MMM YY').toUpperCase()}`
}

export const TYPE_CODE: Record<EntryType, string> = {
  note: 'NOTE',
  task: 'TASK',
  call: 'CALL',
}

/** Short 3-pulse alarm tone. Silent no-op when audio is unavailable. */
let audioCtx: AudioContext | null = null
export function playAlertTone(stage: AlertStage) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    if (!audioCtx || audioCtx.state === 'closed') audioCtx = new Ctx()
    const ctx = audioCtx
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const pulses = stage === 'WARN' ? 1 : 3
    const freq = stage === 'MISSED' ? 520 : 880
    for (let i = 0; i < pulses; i++) {
      const t0 = ctx.currentTime + i * 0.22
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, t0)
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0)
      osc.stop(t0 + 0.16)
    }
  } catch (_) {}
}
