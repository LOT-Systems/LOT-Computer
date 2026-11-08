/**
 * LOT SYSTEMS CORPORATION
 * Calendar engine — pure, timezone-local scheduling logic (no React, no I/O).
 * Phases: T-15 (warning) → T-0 (active) → MISSED (grace window passed) | DONE.
 */

export type EntryType = 'note' | 'task' | 'call'
export type AlertPhase = 'warn' | 'active' | 'missed' | 'done'

export type CalendarItem = {
  id: string
  date: string // YYYY-MM-DD
  time: string | null // HH:mm (24h) or null = all-day
  text: string
  type: EntryType
}

export type AlertRecord = { entryId: string; phase: AlertPhase }

export const WARN_MINUTES = 15
export const MISSED_AFTER_MINUTES = 5

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

/** Normalise "9:5" / "930" / "09:30" → "09:30"; returns null if invalid. */
export function parseTime(input: string): string | null {
  const s = input.trim()
  if (!s) return null
  let m = TIME_RE.exec(s)
  if (!m) {
    const digits = /^(\d{1,2})(\d{2})$/.exec(s)
    if (digits) m = TIME_RE.exec(`${digits[1]}:${digits[2]}`)
  }
  if (!m) return null
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

/** Local epoch ms of an item, or null for all-day entries. */
export function itemTimestamp(item: Pick<CalendarItem, 'date' | 'time'>): number | null {
  if (!item.time) return null
  const [y, mo, d] = item.date.split('-').map(Number)
  const [h, mi] = item.time.split(':').map(Number)
  if (!y || !mo || !d) return null
  return new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
}

/** The phase an item should currently be in (ignoring what is already logged). */
export function currentPhase(item: CalendarItem, now: number): 'pending' | 'warn' | 'active' | 'missed' {
  const ts = itemTimestamp(item)
  if (ts === null) return 'pending'
  const diff = ts - now
  if (diff > WARN_MINUTES * 60_000) return 'pending'
  if (diff > 0) return 'warn'
  if (-diff <= MISSED_AFTER_MINUTES * 60_000) return 'active'
  return 'missed'
}

/**
 * Alerts that must fire now: the current phase, unless it (or a later phase,
 * or DONE) has already been logged. Missed items older than 24h are silently
 * ignored so reopening the app never floods the user with ancient alerts.
 */
export function dueAlerts(
  items: CalendarItem[],
  logged: AlertRecord[],
  now: number
): { item: CalendarItem; phase: 'warn' | 'active' | 'missed' }[] {
  const order: Record<string, number> = { warn: 1, active: 2, missed: 3 }
  const byEntry = new Map<string, Set<AlertPhase>>()
  for (const r of logged) {
    if (!byEntry.has(r.entryId)) byEntry.set(r.entryId, new Set())
    byEntry.get(r.entryId)!.add(r.phase)
  }
  const out: { item: CalendarItem; phase: 'warn' | 'active' | 'missed' }[] = []
  for (const item of items) {
    const ts = itemTimestamp(item)
    if (ts === null || now - ts > 24 * 3600_000) continue
    const seen = byEntry.get(item.id)
    if (seen?.has('done')) continue
    const phase = currentPhase(item, now)
    if (phase === 'pending') continue
    if (seen && [...seen].some(p => (order[p] ?? 0) >= order[phase])) continue
    out.push({ item, phase })
  }
  return out
}

/** Countdown label: T-02:14:05 / T+00:03:12 (seconds precision under 1h). */
export function countdown(ts: number, now: number): string {
  const diff = ts - now
  const abs = Math.abs(Math.round(diff / 1000))
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  const p = (n: number) => String(n).padStart(2, '0')
  const body = h >= 24 ? `${Math.floor(h / 24)}D ${p(h % 24)}H` : `${p(h)}:${p(m)}:${p(s)}`
  return `T${diff >= 0 ? '-' : '+'}${body}`
}

export const PHASE_LABEL: Record<AlertPhase, string> = {
  warn: `T-${WARN_MINUTES} WARNING`,
  active: 'T-0 ACTIVE',
  missed: 'MISSED',
  done: 'CONFIRMED',
}
