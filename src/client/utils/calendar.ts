/**
 * Calendar alert engine — pure helpers (no React, no network).
 * An entry with a time fires up to three stages: T-15 (warn), NOW (due), MISSED (overdue).
 */

export type EntryType = 'note' | 'task' | 'call'
export type AlertStage = 'T-15' | 'NOW' | 'MISSED'

export type CalendarEntry = {
  key: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm (24h) or null for all-day
  text: string
  type: EntryType
}

export const WARN_MINUTES = 15
export const MISSED_AFTER_MINUTES = 5

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidTime(t: string): boolean {
  return TIME_RE.test(t)
}

/** Accepts "9", "930", "9:30", "0930", "21:05" → "HH:mm" or null. */
export function normalizeTime(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  let h: string, m: string
  const colon = s.match(/^(\d{1,2}):(\d{2})$/)
  if (colon) [, h, m] = colon
  else if (/^\d{1,2}$/.test(s)) { h = s; m = '00' }
  else if (/^\d{3,4}$/.test(s)) { h = s.slice(0, -2); m = s.slice(-2) }
  else return null
  const out = `${h.padStart(2, '0')}:${m}`
  return isValidTime(out) ? out : null
}

export function entryKey(date: string, time: string | null, text: string, type: EntryType): string {
  return `${date}|${time ?? '--:--'}|${type}|${text}`
}

/** Entry start as epoch ms in local time, or null for all-day entries. */
export function entryTimestamp(e: Pick<CalendarEntry, 'date' | 'time'>): number | null {
  if (!e.time) return null
  const [y, mo, d] = e.date.split('-').map(Number)
  const [h, mi] = e.time.split(':').map(Number)
  return new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
}

/** Highest stage reached at `now`, or null if nothing is due yet. */
export function currentStage(e: CalendarEntry, now: number): AlertStage | null {
  const ts = entryTimestamp(e)
  if (ts === null) return null
  const diffMin = (now - ts) / 60000
  if (diffMin >= MISSED_AFTER_MINUTES) return 'MISSED'
  if (diffMin >= 0) return 'NOW'
  if (diffMin >= -WARN_MINUTES) return 'T-15'
  return null
}

export type DueAlert = { entry: CalendarEntry; stage: AlertStage }

/**
 * Alerts that should be raised now. Only the highest reached stage per entry is
 * returned, and nothing is returned for stages already fired or already superseded.
 * MISSED is limited to the last 24h so old history does not flood on load.
 */
export function dueAlerts(
  entries: CalendarEntry[],
  now: number,
  fired: Set<string>,
  done: Set<string>
): DueAlert[] {
  const out: DueAlert[] = []
  for (const entry of entries) {
    if (done.has(entry.key)) continue
    const stage = currentStage(entry, now)
    if (!stage) continue
    const ts = entryTimestamp(entry)!
    if (stage === 'MISSED' && now - ts > 24 * 3600 * 1000) continue
    // any equal-or-later stage already fired supersedes this one
    const order: AlertStage[] = ['T-15', 'NOW', 'MISSED']
    const reached = order.slice(order.indexOf(stage))
    if (reached.some(s => fired.has(`${entry.key}#${s}`))) continue
    out.push({ entry, stage })
  }
  return out.sort((a, b) => entryTimestamp(a.entry)! - entryTimestamp(b.entry)!)
}

export function formatCountdown(ms: number): string {
  const abs = Math.abs(ms)
  const h = Math.floor(abs / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)
  const body = h > 0 ? `${h}H${String(m).padStart(2, '0')}M` : `${m}M`
  return `${ms < 0 ? '+' : 'T-'}${body}`
}
