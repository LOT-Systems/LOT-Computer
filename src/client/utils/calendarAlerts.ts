/**
 * LOT SYSTEMS CORPORATION
 * Calendar alert logic — pure functions, no React / network.
 *
 * Stages (minutes relative to start): T-15 → T-05 → T-00 → MISSED (+5).
 * Only the most advanced stage reached is ever fired (a reload after a long
 * absence yields one alert, not a burst). ACK suppresses everything after it.
 */

import dayjs from '#client/utils/dayjs'

export type AlertStage = 'T-15' | 'T-05' | 'T-00' | 'MISSED' | 'ACK'

export type TimedEntry = {
  id: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm (24h), absent = all-day (no alerts)
  text: string
  type: string
}

// Ordered; offset = minutes after start at which the stage opens.
const STAGES: { stage: AlertStage; offset: number }[] = [
  { stage: 'T-15', offset: -15 },
  { stage: 'T-05', offset: -5 },
  { stage: 'T-00', offset: 0 },
  { stage: 'MISSED', offset: 5 },
]

const MISSED_WINDOW_MIN = 12 * 60

export const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidTime(t: unknown): t is string {
  return typeof t === 'string' && TIME_RE.test(t)
}

export function alertKey(entryId: string, stage: AlertStage) {
  return `${entryId}:${stage}`
}

/** Minutes from now until entry start (negative = already started). */
export function minutesUntil(entry: TimedEntry, now = dayjs()): number | null {
  if (!isValidTime(entry.time)) return null
  const start = dayjs(`${entry.date}T${entry.time}`)
  if (!start.isValid()) return null
  return start.diff(now, 'second') / 60
}

/** Highest stage currently open for the entry, or null. */
export function currentStage(entry: TimedEntry, now = dayjs()): AlertStage | null {
  const m = minutesUntil(entry, now)
  if (m === null) return null
  const elapsed = -m // minutes since start (negative before start)
  if (elapsed > MISSED_WINDOW_MIN) return null
  let reached: AlertStage | null = null
  for (const s of STAGES) if (elapsed >= s.offset) reached = s.stage
  return reached
}

/**
 * Stage to fire now, or null if nothing new. `fired` holds alertKey()s and
 * `acked` holds entry ids already acknowledged.
 */
export function nextAlert(
  entry: TimedEntry,
  fired: ReadonlySet<string>,
  acked: ReadonlySet<string>,
  now = dayjs()
): AlertStage | null {
  if (acked.has(entry.id) || fired.has(alertKey(entry.id, 'ACK'))) return null
  const stage = currentStage(entry, now)
  if (!stage) return null
  // Any already-fired stage at or beyond the current one means nothing new.
  const order = STAGES.map(s => s.stage)
  const idx = order.indexOf(stage)
  for (let i = idx; i < order.length; i++) {
    if (fired.has(alertKey(entry.id, order[i]))) return null
  }
  return stage
}

/** 24h compact military time: "0930". */
export function milTime(time: string) {
  return time.replace(':', '')
}

/** "05 OCT" */
export function milDate(date: string) {
  return dayjs(date).format('DD MMM').toUpperCase()
}

export function stageLabel(stage: AlertStage) {
  switch (stage) {
    case 'T-15': return 'T-15 MIN'
    case 'T-05': return 'T-05 MIN'
    case 'T-00': return 'T-00 NOW'
    case 'MISSED': return 'MISSED'
    case 'ACK': return 'ACK'
  }
}

/** Log line, e.g. "[CAL] T-05 MIN · CALL · 0930 05 OCT · Dentist". */
export function alertLogText(entry: TimedEntry, stage: AlertStage) {
  const when = entry.time ? `${milTime(entry.time)} ${milDate(entry.date)}` : milDate(entry.date)
  return `[CAL] ${stageLabel(stage)} · ${entry.type.toUpperCase()} · ${when} · ${entry.text}`
}
