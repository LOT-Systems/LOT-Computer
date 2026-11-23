/**
 * LOT·01 device nudges: short AI messages ("Coffee time!") queued for paired devices.
 *
 * Runs from the hourly scheduled-job tick, only when LOT_DEVICES_ENABLED=true.
 * Spec: docs/hardware/lot-01/07-LOT-API-CONNECTOR.md
 */
import type { Sequelize } from 'sequelize'
import dayjs from '#server/utils/dayjs'

export const NUDGE_MAX_CHARS = 64
export const NUDGE_AI_PER_DAY = 4
export const NUDGE_MIN_GAP_HOURS = 3
export const NUDGE_DAY_START = 8 // local hour, inclusive
export const NUDGE_DAY_END = 21 // local hour, exclusive
export const NUDGE_TTL_S = 3 * 3600

const FALLBACKS: Record<string, string[]> = {
  morning: ['Coffee time!', 'Water first.', 'Open a window.', 'One thing today.'],
  midday: ['Stand up. Stretch.', 'Lunch, slowly.', 'Look far away.', 'Breathe out longer.'],
  evening: ['Tea time.', 'Write one line.', 'Screens down soon.', 'Note one good thing.'],
}

/** The device font is printable ASCII only. Strip everything else and cap at 64 chars on a word boundary. */
export function sanitizeNudge(raw: string, max = NUDGE_MAX_CHARS): string {
  let s = String(raw ?? '')
    .normalize('NFKD')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  s = s.replace(/^["'`\s]+|["'`\s]+$/g, '') // models like to wrap answers in quotes
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const sp = cut.lastIndexOf(' ')
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:-]+$/, '')
}

export function isAwakeHour(localHour: number): boolean {
  return localHour >= NUDGE_DAY_START && localHour < NUDGE_DAY_END
}

export function partOfDay(localHour: number): 'morning' | 'midday' | 'evening' {
  return localHour < 12 ? 'morning' : localHour < 17 ? 'midday' : 'evening'
}

export function fallbackNudge(localHour: number, seed = Date.now()): string {
  const list = FALLBACKS[partOfDay(localHour)]
  return list[Math.abs(seed) % list.length]
}

export function buildNudgePrompt(p: { localTime: string; weekday: string; city?: string | null }): string {
  return [
    'You write messages for LOT-01, a tiny pager-like screen from lot-systems.com.',
    'Write ONE calm, kind, practical nudge for the person wearing it.',
    `Their local time is ${p.localTime} on ${p.weekday}${p.city ? ` in ${p.city}` : ''}.`,
    'Rules: at most 40 characters, plain ASCII, no emoji, no hashtags, no quotes.',
    'Examples: Coffee time! / Stand up. Stretch. / Water first. / Tea time.',
    'Reply with the message only.',
  ].join('\n')
}

type Candidate = { user_id: string; time_zone: string | null; city: string | null; sent_today: number; last_at: Date | null }

/**
 * Queue at most one nudge per eligible user. Returns the number queued.
 * Eligible = has an active device, local hour in [8, 21), fewer than 4 AI nudges in the last 24 h,
 * and nothing queued in the last 3 h.
 */
export async function runDeviceNudgeJob(
  sequelize: Sequelize,
  compose: (prompt: string) => Promise<string>,
  now = dayjs()
): Promise<number> {
  const [rows] = await sequelize.query(
    `SELECT u.id AS user_id, u."timeZone" AS time_zone, u.city AS city,
            (SELECT COUNT(*)::int FROM device_notifications n
              WHERE n.user_id = u.id AND n.kind = 'ai' AND n.created_at > now() - interval '24 hours') AS sent_today,
            (SELECT MAX(n.created_at) FROM device_notifications n WHERE n.user_id = u.id) AS last_at
       FROM users u
      WHERE EXISTS (SELECT 1 FROM devices d WHERE d.user_id = u.id AND d.revoked_at IS NULL)`
  )
  let queued = 0
  for (const c of rows as Candidate[]) {
    const local = c.time_zone ? now.tz(c.time_zone) : now
    if (!isAwakeHour(local.hour())) continue
    if (c.sent_today >= NUDGE_AI_PER_DAY) continue
    if (c.last_at && now.diff(dayjs(c.last_at), 'hour', true) < NUDGE_MIN_GAP_HOURS) continue

    let text = ''
    try {
      text = sanitizeNudge(await compose(buildNudgePrompt({ localTime: local.format('HH:mm'), weekday: local.format('dddd'), city: c.city })))
    } catch (e) {
      console.warn('[device-nudges] AI compose failed, using fallback:', (e as Error).message)
    }
    if (text.length < 3) text = fallbackNudge(local.hour())

    await sequelize.query(
      `INSERT INTO device_notifications (user_id, text, kind, ttl_s) VALUES (:u, :t, 'ai', :ttl)`,
      { replacements: { u: c.user_id, t: text, ttl: NUDGE_TTL_S } }
    )
    queued++
  }
  return queued
}
