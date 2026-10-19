/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Calendar alert engine — pure scheduling logic, no React, no network.
// An entry with a time moves through stages as the clock approaches it.

export type AlertStage = 'standby' | 'armed' | 'now' | 'overdue'

export const STAGE_ORDER: AlertStage[] = ['standby', 'armed', 'now', 'overdue']

export const STAGE_LABEL: Record<AlertStage, string> = {
  standby: 'STAND BY',
  armed: 'ARMED',
  now: 'EXECUTE',
  overdue: 'OVERDUE',
}

const STANDBY_MS = 15 * 60_000
const ARMED_MS = 5 * 60_000
const OVERDUE_MS = 60_000 // grace after T-0 before "overdue"
const EXPIRE_MS = 60 * 60_000 // stop alerting an hour after T-0

export const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

/** Normalise "9:5" style input; returns null if not a valid HH:mm. */
export function parseTime(input: string): string | null {
  const m = TIME_RE.exec(input.trim())
  if (!m) return null
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

/** Local-time epoch ms for a YYYY-MM-DD + HH:mm pair. */
export function entryTimestamp(date: string, time: string): number {
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  return new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
}

/** Stage for a given ms-until-event (negative = past). null = outside any window. */
export function stageFor(deltaMs: number): AlertStage | null {
  if (deltaMs > STANDBY_MS) return null
  if (deltaMs > ARMED_MS) return 'standby'
  if (deltaMs > 0) return 'armed'
  if (deltaMs > -OVERDUE_MS) return 'now'
  if (deltaMs > -EXPIRE_MS) return 'overdue'
  return null
}

/** T-minus / T-plus clock, e.g. "T-04:59", "T+00:12", "T-01:05:00". */
export function formatCountdown(deltaMs: number): string {
  const sign = deltaMs > 0 ? '-' : '+'
  const total = Math.floor(Math.abs(deltaMs) / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `T${sign}${h > 0 ? `${pad(h)}:` : ''}${pad(m)}:${pad(s)}`
}

export type TimedEntry = { id: string; date: string; time?: string }

export type ActiveAlert = {
  id: string
  stage: AlertStage
  deltaMs: number
}

/** All timed entries currently inside an alert window, soonest first. */
export function activeAlerts(entries: TimedEntry[], now: number): ActiveAlert[] {
  const out: ActiveAlert[] = []
  for (const e of entries) {
    if (!e.time) continue
    const deltaMs = entryTimestamp(e.date, e.time) - now
    const stage = stageFor(deltaMs)
    if (stage) out.push({ id: e.id, stage, deltaMs })
  }
  return out.sort((a, b) => Math.abs(a.deltaMs) - Math.abs(b.deltaMs))
}

// ── Fired-stage ledger ────────────────────────────────────────────────────
// Remembers which (entry, stage) pairs already fired so reloads and re-renders
// never double-notify. Persisted per-browser; the Log row is the durable record.

const LEDGER_KEY = 'lot:calendar:fired'
const LEDGER_MAX = 200

export function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(LEDGER_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function saveFired(fired: Set<string>) {
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify([...fired].slice(-LEDGER_MAX)))
  } catch {
    /* storage unavailable — in-memory ledger still guards this session */
  }
}

export const firedKey = (id: string, stage: AlertStage) => `${id}:${stage}`

/** Terminal-style alert line, shared by banner, system notification and Log. */
export function alertLine(stage: AlertStage, type: string, time: string, text: string): string {
  return `[CAL] ${STAGE_LABEL[stage]} · ${type.toUpperCase()} ${time} · ${text}`
}

export function canNotify(): boolean {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted'
}

export function notifyDesktop(title: string, body: string, tag: string) {
  if (!canNotify()) return
  try {
    new Notification(title, { body, tag, silent: false })
  } catch {
    /* some mobile browsers only allow ServiceWorker notifications */
  }
}
