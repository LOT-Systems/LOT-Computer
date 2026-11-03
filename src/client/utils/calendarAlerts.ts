/**
 * LOT SYSTEMS CORPORATION
 * Calendar alert engine — pure, dependency-free time logic.
 *
 * Countdown stages (T-minus):
 *   T-15  ARMED     fifteen minutes out
 *   T-05  IMMINENT  five minutes out
 *   T-00  ZERO      scheduled minute reached
 *   T+10  MISSED    ten minutes past, still not acknowledged / done
 *
 * Only the LATEST reached stage is ever raised, so reopening the app after
 * a gap never produces a burst of stale alerts. Stages older than STALE_MIN
 * past the scheduled time are dropped entirely.
 */

export type AlertStage = 'T-15' | 'T-05' | 'T-00' | 'MISSED'

export const STAGES: { stage: AlertStage; offsetMin: number; label: string }[] = [
  { stage: 'T-15', offsetMin: -15, label: 'ARMED' },
  { stage: 'T-05', offsetMin: -5, label: 'IMMINENT' },
  { stage: 'T-00', offsetMin: 0, label: 'ZERO' },
  { stage: 'MISSED', offsetMin: 10, label: 'MISSED' },
]

/** Alerts older than this (minutes past schedule) are considered stale. */
export const STALE_MIN = 120

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isValidTime(t: unknown): t is string {
  return typeof t === 'string' && TIME_RE.test(t)
}

export function normalizeTime(t: string): string {
  const m = TIME_RE.exec(t)
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : ''
}

/** Local-time Date for a YYYY-MM-DD + HH:mm pair; null when invalid. */
export function entryDateTime(date: string, time?: string | null): Date | null {
  const d = DATE_RE.exec(date || '')
  if (!d || !time || !isValidTime(time)) return null
  const [h, m] = normalizeTime(time).split(':').map(Number)
  const dt = new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]), h, m, 0, 0)
  // Reject overflow dates like 2026-02-31
  if (dt.getMonth() !== Number(d[2]) - 1) return null
  return dt
}

/** Minutes from now until target (negative = past). Floored to the minute. */
export function minutesUntil(now: Date, target: Date): number {
  return Math.floor((target.getTime() - now.getTime()) / 60000)
}

/**
 * Latest reached stage for a target at `now`, or null when none reached yet
 * or the event is stale.
 */
export function currentStage(now: Date, target: Date): AlertStage | null {
  const delta = Math.floor((now.getTime() - target.getTime()) / 60000) // minutes past schedule
  if (delta > STALE_MIN) return null
  let reached: AlertStage | null = null
  for (const s of STAGES) {
    if (delta >= s.offsetMin) reached = s.stage
  }
  return reached
}

export function stageLabel(stage: AlertStage): string {
  return STAGES.find(s => s.stage === stage)?.label || stage
}

export function alertKey(entryId: string, stage: AlertStage): string {
  return `${entryId}:${stage}`
}

/** Compact countdown, e.g. "T-14:59"-style short form: "T-15m", "T-00", "T+12m". */
export function formatCountdown(now: Date, target: Date): string {
  const m = minutesUntil(now, target)
  if (m === 0) return 'T-00'
  return m > 0 ? `T-${m}m` : `T+${-m}m`
}

export type AlertCandidate = {
  id: string
  date: string
  time?: string | null
  done?: boolean
}

export type DueAlert = { id: string; stage: AlertStage; target: Date; key: string }

/**
 * Which alerts should be raised right now. `fired` holds keys already raised
 * (any device). A stage is skipped if it, or any LATER stage, has fired —
 * so alerts never run backwards.
 */
export function dueAlerts(
  now: Date,
  entries: AlertCandidate[],
  fired: ReadonlySet<string>
): DueAlert[] {
  const out: DueAlert[] = []
  for (const e of entries) {
    if (e.done) continue
    const target = entryDateTime(e.date, e.time)
    if (!target) continue
    const stage = currentStage(now, target)
    if (!stage) continue
    const idx = STAGES.findIndex(s => s.stage === stage)
    const alreadyAtOrPast = STAGES.slice(idx).some(s => fired.has(alertKey(e.id, s.stage)))
    if (alreadyAtOrPast) continue
    out.push({ id: e.id, stage, target, key: alertKey(e.id, stage) })
  }
  return out
}
