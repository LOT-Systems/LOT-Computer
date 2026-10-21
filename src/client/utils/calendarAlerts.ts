/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Calendar alert engine — pure functions, no React, no network.
// An entry with a time passes through four stages:
//   T-15  STANDBY   fifteen minutes out
//   T-0   EXECUTE   start time reached
//   T+15  MISSED    still unacknowledged fifteen minutes after start
// Each (entry, stage) pair fires once. The key is stable across reloads.

export type AlertStage = 'standby' | 'execute' | 'missed'

export const STAGE_OFFSET_MIN: Record<AlertStage, number> = {
  standby: -15,
  execute: 0,
  missed: 15,
}

export const STAGE_CODE: Record<AlertStage, string> = {
  standby: 'T-15',
  execute: 'T-0',
  missed: 'T+15',
}

export const STAGE_LABEL: Record<AlertStage, string> = {
  standby: 'STANDBY',
  execute: 'EXECUTE',
  missed: 'MISSED',
}

// Alerts older than this are history, not news. Never fire for them.
export const ALERT_WINDOW_MIN = 60

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export const isValidTime = (t: unknown): t is string =>
  typeof t === 'string' && TIME_RE.test(t)

/** Local-time epoch ms for a YYYY-MM-DD + HH:MM pair, or null if malformed. */
export function entryStartMs(date: string, time?: string | null): number | null {
  if (!time || !isValidTime(time)) return null
  const d = DATE_RE.exec(date)
  if (!d) return null
  const [h, m] = time.split(':').map(Number)
  const ms = new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]), h, m, 0, 0).getTime()
  return Number.isNaN(ms) ? null : ms
}

export const alertKey = (entryId: string, stage: AlertStage) => `${entryId}:${stage}`

/** Stable id for an entry; log id when available, else content hash. */
export function entryId(parts: { logId?: string; date: string; time?: string; text: string }): string {
  if (parts.logId) return parts.logId
  return `${parts.date}T${parts.time || '--:--'}#${parts.text.slice(0, 40)}`
}

export type AlertCandidate = {
  id: string
  date: string
  time?: string
  text: string
  done?: boolean
}

export type DueAlert = {
  entry: AlertCandidate
  stage: AlertStage
  key: string
  startMs: number
}

/**
 * Alerts that are due at `nowMs` and have not fired yet.
 * A stage is due once now >= start + offset, and only while it is within
 * ALERT_WINDOW_MIN of that moment (so opening the app a day later is quiet).
 * When several stages are due for one entry, only the latest fires: if you
 * were away through T-15, you get EXECUTE, not both.
 * Done entries never alert.
 */
export function dueAlerts(
  entries: AlertCandidate[],
  nowMs: number,
  fired: ReadonlySet<string>
): DueAlert[] {
  const out: DueAlert[] = []
  const order: AlertStage[] = ['standby', 'execute', 'missed']

  for (const entry of entries) {
    if (entry.done) continue
    const startMs = entryStartMs(entry.date, entry.time)
    if (startMs === null) continue

    let latest: AlertStage | null = null
    for (const stage of order) {
      const at = startMs + STAGE_OFFSET_MIN[stage] * 60_000
      if (nowMs >= at && nowMs - at <= ALERT_WINDOW_MIN * 60_000) latest = stage
    }
    if (!latest) continue

    // If any stage at or after `latest` already fired, stay quiet.
    const idx = order.indexOf(latest)
    const alreadyCovered = order.slice(idx).some(s => fired.has(alertKey(entry.id, s)))
    if (alreadyCovered) continue

    out.push({ entry, stage: latest, key: alertKey(entry.id, latest), startMs })
  }

  return out.sort((a, b) => a.startMs - b.startMs)
}

/** T-minus string: "T-00:14:32" before start, "T+00:03:10" after. */
export function formatCountdown(startMs: number, nowMs: number): string {
  const diff = startMs - nowMs
  const abs = Math.abs(diff)
  const s = Math.floor(abs / 1000)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `T${diff >= 0 ? '-' : '+'}${hh}:${mm}:${ss}`
}

/** Next not-done timed entry that has not yet passed its MISSED window. */
export function nextTimed(entries: AlertCandidate[], nowMs: number): (AlertCandidate & { startMs: number }) | null {
  let best: (AlertCandidate & { startMs: number }) | null = null
  for (const e of entries) {
    if (e.done) continue
    const startMs = entryStartMs(e.date, e.time)
    if (startMs === null) continue
    if (startMs + STAGE_OFFSET_MIN.missed * 60_000 < nowMs) continue
    if (!best || startMs < best.startMs) best = { ...e, startMs }
  }
  return best
}
