/**
 * LOT SYSTEMS CORPORATION
 * Calendar alert engine — pure logic (no React, no dayjs) so it is testable.
 */

export type AlertStage = 'T-15' | 'T-00' | 'OVERDUE'

export type TimedEntry = {
  id: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm (24h) — untimed entries never alert
  text: string
  type: string
}

export type DueAlert = {
  key: string // `${id}:${stage}` — dedupe key
  stage: AlertStage
  entry: TimedEntry
  minutesToGo: number // negative once past
}

export const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
export const LEAD_MINUTES = 15
export const OVERDUE_WINDOW_MINUTES = 120 // stop flagging overdue after 2h

export function parseTime(input: string): string | null {
  const s = input.trim()
  const m = s.match(/^(\d{1,2})(?::?(\d{2}))?$/)
  if (!m) return null
  const t = `${m[1].padStart(2, '0')}:${m[2] ?? '00'}`
  return TIME_RE.test(t) ? t : null
}

export function entryTimestamp(e: TimedEntry): number | null {
  if (!e.time || !TIME_RE.test(e.time)) return null
  const [y, mo, d] = e.date.split('-').map(Number)
  const [h, mi] = e.time.split(':').map(Number)
  if (!y || !mo || !d) return null
  return new Date(y, mo - 1, d, h, mi, 0, 0).getTime()
}

/**
 * Returns the single most relevant un-fired stage per entry.
 * A stage is skipped if already fired (`fired` holds keys), and earlier stages
 * are suppressed once a later one is reached (no T-15 spam after T-00).
 */
export function computeDueAlerts(
  entries: TimedEntry[],
  now: number,
  fired: Set<string>
): DueAlert[] {
  const out: DueAlert[] = []
  for (const entry of entries) {
    const ts = entryTimestamp(entry)
    if (ts === null) continue
    const mins = Math.round((ts - now) / 60000)
    let stage: AlertStage | null = null
    if (mins < -OVERDUE_WINDOW_MINUTES) continue // stale — never alert
    if (mins < 0) stage = 'OVERDUE'
    else if (ts <= now) stage = 'T-00'
    else if (mins <= LEAD_MINUTES) stage = 'T-15'
    if (!stage) continue
    // a later stage already fired means earlier ones are moot
    const order: AlertStage[] = ['T-15', 'T-00', 'OVERDUE']
    const idx = order.indexOf(stage)
    if (order.slice(idx).some(s => fired.has(`${entry.id}:${s}`))) continue
    out.push({ key: `${entry.id}:${stage}`, stage, entry, minutesToGo: mins })
  }
  return out.sort((a, b) => (entryTimestamp(a.entry)! - entryTimestamp(b.entry)!))
}

export function formatCountdown(mins: number): string {
  const a = Math.abs(mins)
  const h = Math.floor(a / 60)
  const m = a % 60
  const body = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return mins < 0 ? `T+${body}` : `T-${body}`
}
