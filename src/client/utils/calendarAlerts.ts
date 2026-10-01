/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar alert engine — pure functions, no React, no network.
 *
 * A timed entry walks a fixed ladder of stages:
 *   T15 (15 min before) → T5 (5 min before) → T0 (start) → MISSED (15 min after, not done)
 * Each stage fires at most once per entry. If the app is opened late, only the
 * latest stage that has passed is surfaced; earlier ones are marked silently.
 */

export type AlertStage = 'T15' | 'T5' | 'T0' | 'MISSED'

export const STAGE_ORDER: AlertStage[] = ['T15', 'T5', 'T0', 'MISSED']

/** Minutes relative to start time at which each stage becomes due. */
export const STAGE_OFFSET_MIN: Record<AlertStage, number> = {
  T15: -15,
  T5: -5,
  T0: 0,
  MISSED: 15,
}

/** Entries older than this are never alerted on (silently marked). */
export const MAX_ALERT_AGE_MS = 24 * 60 * 60 * 1000

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isValidTime(time: unknown): time is string {
  return typeof time === 'string' && TIME_RE.test(time)
}

/** Local-time epoch ms for a YYYY-MM-DD + HH:mm pair, or null if invalid. */
export function entryTimestamp(date: string, time?: string | null): number | null {
  const d = DATE_RE.exec(date)
  if (!d || !isValidTime(time)) return null
  const [h, m] = time.split(':').map(Number)
  const ts = new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]), h, m, 0, 0)
  return Number.isNaN(ts.getTime()) ? null : ts.getTime()
}

export function stageDueAt(startMs: number, stage: AlertStage): number {
  return startMs + STAGE_OFFSET_MIN[stage] * 60_000
}

/** Stages whose due time has passed, in ladder order. */
export function dueStages(startMs: number, nowMs: number): AlertStage[] {
  return STAGE_ORDER.filter(s => nowMs >= stageDueAt(startMs, s))
}

export type StagePlan = {
  /** Stage to surface now (latest due and unfired), or null. */
  fire: AlertStage | null
  /** Due stages to mark as fired without notifying (superseded or stale). */
  silent: AlertStage[]
}

/**
 * Decide what to do for one undone entry.
 * `fired` is the set of stages already handled.
 */
export function planStages(
  startMs: number,
  nowMs: number,
  fired: ReadonlySet<AlertStage>
): StagePlan {
  const pending = dueStages(startMs, nowMs).filter(s => !fired.has(s))
  if (pending.length === 0) return { fire: null, silent: [] }

  const stale = nowMs - startMs > MAX_ALERT_AGE_MS
  if (stale) return { fire: null, silent: pending }

  const fire = pending[pending.length - 1]
  return { fire, silent: pending.slice(0, -1) }
}

export type LiveState = 'ALLDAY' | 'UPCOMING' | 'SOON' | 'NOW' | 'OVERDUE' | 'DONE'

/** Display state of an entry at `nowMs`. */
export function liveState(
  startMs: number | null,
  nowMs: number,
  done: boolean
): LiveState {
  if (done) return 'DONE'
  if (startMs === null) return 'ALLDAY'
  const delta = startMs - nowMs
  if (delta > 15 * 60_000) return 'UPCOMING'
  if (delta > 0) return 'SOON'
  if (delta > -15 * 60_000) return 'NOW'
  return 'OVERDUE'
}

/** Military-style offset: T-00:14 before start, T+00:03 after. Minute resolution. */
export function formatOffset(startMs: number, nowMs: number): string {
  const deltaMin = Math.ceil((startMs - nowMs) / 60_000)
  const sign = deltaMin > 0 ? '-' : '+'
  const abs = Math.abs(deltaMin > 0 ? deltaMin : Math.floor((nowMs - startMs) / 60_000))
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `T${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const STAGE_LABEL: Record<AlertStage, string> = {
  T15: 'T-00:15',
  T5: 'T-00:05',
  T0: 'T-00:00',
  MISSED: 'MISSED',
}

const STAGE_TAG: Record<AlertStage, string> = {
  T15: 'STANDBY',
  T5: 'READY',
  T0: 'EXECUTE',
  MISSED: 'OVERDUE',
}

/** Uppercase two-part alert line used by toast, browser notification and Log. */
export function formatAlert(
  stage: AlertStage,
  type: string,
  text: string,
  time: string
): { head: string; body: string; log: string } {
  const head = `${STAGE_TAG[stage]} // ${STAGE_LABEL[stage]}`
  const body = `${type.toUpperCase()} ${time} — ${text}`
  return { head, body, log: `[ALERT] ${head} · ${body}` }
}

/** Fire-once persistence key. */
export function firedKey(entryId: string, stage: AlertStage): string {
  return `${entryId}:${stage}`
}
