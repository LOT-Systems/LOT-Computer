/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * LOT PAGER — device connector utilities (hardware programme HW-01).
 *
 * Token format:   lotd.<userId>.<deviceId>.<secret>
 *   - only sha256(secret) is stored, in user.metadata.devices[]
 *   - no DB migration: devices + pager queue live in user.metadata
 *
 * Session compression: every device wake ("session") receives ONE compact
 * frame (< 256 bytes JSON) with short keys, sized for the 160x68 memory LCD.
 */

import crypto from 'crypto'
import type { Dayjs } from '#server/utils/dayjs'

export const PAGER_MAX_CHARS = 52 // 2 lines x 26 chars on LS011B7DH03 @ 6x8 font x1
export const PAGER_QUEUE_MAX = 20
export const DEVICES_MAX = 5
export const AUTONOMOUS_MIN_GAP_MIN = 90

export interface DeviceRecord {
  id: string
  name: string
  tokenHash: string
  createdAt: string
  lastSeenAt: string | null
  firmware: string | null
  telemetry: DeviceTelemetry | null
}

export interface DeviceTelemetry {
  t?: number // °C
  h?: number // %RH
  p?: number // hPa
  iaq?: number // BME688 / BSEC IAQ index 0..500
  lux?: number
  bat?: number // battery %
  at: string
}

export interface PagerMessage {
  id: string
  text: string
  source: 'autonomous' | 'site' | 'ai'
  createdAt: string
  servedAt: string | null
}

export interface PagerState {
  queue: PagerMessage[]
  lastAutonomousAt: string | null
}

/** Compact frame returned to the device on every wake. */
export interface PagerFrame {
  v: 1
  i: string | null // message id
  m: string | null // message text (compressed)
  s: PagerMessage['source'] | null
  ts: number // server unix time (s) — device uses it to set RTC
  n: number // next poll in seconds
  q: number // remaining queued messages
}

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')
const shortId = () => crypto.randomBytes(6).toString('base64url')

export function issueDeviceToken(userId: string, name: string) {
  const deviceId = shortId()
  const secret = crypto.randomBytes(24).toString('base64url')
  const token = `lotd.${userId}.${deviceId}.${secret}`
  const record: DeviceRecord = {
    id: deviceId,
    name: compressForPager(name || 'LOT Pager', 24),
    tokenHash: sha256(secret),
    createdAt: new Date().toISOString(),
    lastSeenAt: null,
    firmware: null,
    telemetry: null,
  }
  return { token, record }
}

export function parseDeviceToken(raw: string | undefined | null) {
  if (!raw) return null
  const token = raw.replace(/^Bearer\s+/i, '').trim()
  const parts = token.split('.')
  if (parts.length !== 4 || parts[0] !== 'lotd') return null
  const [, userId, deviceId, secret] = parts
  if (!userId || !deviceId || !secret) return null
  return { userId, deviceId, secret }
}

export function verifyDeviceSecret(record: DeviceRecord, secret: string) {
  const a = Buffer.from(record.tokenHash, 'hex')
  const b = Buffer.from(sha256(secret), 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/**
 * Compress any text to fit the pager screen: strip markdown / emoji /
 * control chars, collapse whitespace, cut on a word boundary.
 * The memory LCD font is ASCII-only, so non-ASCII is transliterated or dropped.
 */
export function compressForPager(input: string, max = PAGER_MAX_CHARS): string {
  let s = String(input ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // diacritics
    .replace(/[*_`#>~[\]()]/g, '') // markdown
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E]/g, ' ') // ASCII printable only
    .replace(/\s+/g, ' ')
    .trim()
  if (s.length <= max) return s
  const cut = s.slice(0, max - 1)
  const sp = cut.lastIndexOf(' ')
  s = (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s.,;:-]+$/, '')
  return s + '~'
}

export function getDevices(metadata: Record<string, any> | null | undefined): DeviceRecord[] {
  return Array.isArray(metadata?.devices) ? metadata!.devices : []
}

export function getPagerState(metadata: Record<string, any> | null | undefined): PagerState {
  const p = metadata?.pager
  return {
    queue: Array.isArray(p?.queue) ? p.queue : [],
    lastAutonomousAt: p?.lastAutonomousAt ?? null,
  }
}

export function enqueue(
  state: PagerState,
  text: string,
  source: PagerMessage['source']
): PagerMessage {
  const msg: PagerMessage = {
    id: shortId(),
    text: compressForPager(text),
    source,
    createdAt: new Date().toISOString(),
    servedAt: null,
  }
  state.queue.push(msg)
  // keep only the newest N (served + unserved)
  if (state.queue.length > PAGER_QUEUE_MAX) {
    state.queue = state.queue.slice(-PAGER_QUEUE_MAX)
  }
  return msg
}

/**
 * Rule-based autonomous notification — deterministic, zero-cost, works
 * without any AI engine. AI (if available) may rephrase it upstream.
 */
export function autonomousMessage(opts: {
  now: Dayjs
  firstName?: string | null
  telemetry?: DeviceTelemetry | null
}): string | null {
  const { now, telemetry } = opts
  const h = now.hour()
  const dow = now.day()

  // Environment first — the device's own sensors outrank the clock
  if (telemetry) {
    if (typeof telemetry.iaq === 'number' && telemetry.iaq > 150) return 'Air is heavy. Open a window.'
    if (typeof telemetry.h === 'number' && telemetry.h < 30) return 'Dry air. Drink some water.'
    if (typeof telemetry.t === 'number' && telemetry.t > 28) return 'Warm in here. Cool down, hydrate.'
    if (typeof telemetry.t === 'number' && telemetry.t < 16) return 'Cold room. Warm tea time.'
    if (typeof telemetry.bat === 'number' && telemetry.bat < 15) return 'Battery low. Place me on the charger.'
  }

  if (h >= 7 && h < 9) return dow === 0 || dow === 6 ? 'Slow morning. Coffee time!' : 'Coffee time!'
  if (h >= 9 && h < 11) return 'Deep work window. One task.'
  if (h >= 12 && h < 14) return 'Lunch. Step away from the screen.'
  if (h >= 15 && h < 17) return 'Stretch. Two minutes. Now.'
  if (h >= 17 && h < 19) return 'Walk outside. Look far away.'
  if (h >= 21 && h < 23) return 'Wind down. Screens off soon.'
  return null
}

/**
 * Pop the next unserved message. Marks it served (mutates state).
 */
export function nextFrame(state: PagerState, pollSeconds: number): PagerFrame {
  const pending = state.queue.filter((m) => !m.servedAt)
  const msg = pending[0] ?? null
  if (msg) msg.servedAt = new Date().toISOString()
  return {
    v: 1,
    i: msg?.id ?? null,
    m: msg?.text ?? null,
    s: msg?.source ?? null,
    ts: Math.floor(Date.now() / 1000),
    n: pending.length > 1 ? 60 : pollSeconds,
    q: Math.max(0, pending.length - 1),
  }
}

/** Poll interval policy — battery first. Night = 1 h, day = 15 min. */
export function pollIntervalFor(now: Dayjs, battery?: number): number {
  const h = now.hour()
  if (typeof battery === 'number' && battery < 10) return 3600
  if (h >= 0 && h < 7) return 3600
  return 900
}
