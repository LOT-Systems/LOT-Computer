/**
 * Calendar alert engine — pure scheduling logic (no React, no network).
 * An entry with a time passes through stages: T-15 WARN, T-5 IMMINENT,
 * T-0 EXECUTE, T+15 OVERDUE. Untimed entries raise a single DAY alert at 08:00.
 */
import dayjs from '#client/utils/dayjs'
import type { Dayjs } from '#client/utils/dayjs'

export type AlertStage = 'warn' | 'imminent' | 'execute' | 'overdue' | 'day'

export const STAGE_CODE: Record<AlertStage, string> = {
  warn: 'T-15',
  imminent: 'T-05',
  execute: 'T-00',
  overdue: 'T+15',
  day: 'TODAY',
}

export const STAGE_LABEL: Record<AlertStage, string> = {
  warn: 'STANDBY',
  imminent: 'IMMINENT',
  execute: 'EXECUTE',
  overdue: 'OVERDUE',
  day: 'SCHEDULED',
}

// Minutes relative to event time at which each stage opens, in order.
const STAGE_OFFSETS: Array<[AlertStage, number]> = [
  ['warn', -15],
  ['imminent', -5],
  ['execute', 0],
  ['overdue', 15],
]

// A stage is only worth announcing while fresh; older ones are skipped
// silently so reopening the app after hours doesn't spam the Log.
const STALE_AFTER_MIN = 60

export const isValidTime = (t?: string | null): t is string =>
  !!t && /^([01]\d|2[0-3]):[0-5]\d$/.test(t)

export function eventMoment(date: string, time?: string | null) {
  return dayjs(`${date}T${isValidTime(time) ? time : '00:00'}:00`)
}

export type AlertCandidate = { key: string; date: string; time?: string | null; done?: boolean }

/**
 * Returns the single most relevant due stage for an entry, or null.
 * `fired` holds `${key}:${stage}` strings already emitted.
 */
export function dueStage(
  c: AlertCandidate,
  now: Dayjs,
  fired: Set<string>
): AlertStage | null {
  if (c.done) return null

  if (!isValidTime(c.time)) {
    const open = eventMoment(c.date).add(8, 'hour')
    if (now.isBefore(open) || now.isAfter(open.add(16, 'hour'))) return null
    return fired.has(`${c.key}:day`) ? null : 'day'
  }

  const at = eventMoment(c.date, c.time)
  const diff = now.diff(at, 'minute', true) // negative = before event
  let latest: AlertStage | null = null
  for (const [stage, off] of STAGE_OFFSETS) {
    if (diff >= off) latest = stage
  }
  if (!latest) return null
  const off = STAGE_OFFSETS.find(([s]) => s === latest)![1]
  if (diff - off > STALE_AFTER_MIN) return null
  return fired.has(`${c.key}:${latest}`) ? null : latest
}

/** Human countdown, e.g. "T-00:12:30" / "T+00:03:10". */
export function countdown(at: Dayjs, now: Dayjs): string {
  const s = at.diff(now, 'second')
  const abs = Math.abs(s)
  const hh = String(Math.floor(abs / 3600)).padStart(2, '0')
  const mm = String(Math.floor((abs % 3600) / 60)).padStart(2, '0')
  const ss = String(abs % 60).padStart(2, '0')
  return `T${s >= 0 ? '-' : '+'}${hh}:${mm}:${ss}`
}
