/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * LOT Device API connector (LOT-DEVICE-01 "Pager").
 * Spec: docs/hardware/LOT-DEVICE-01-API.md
 *
 * Two surfaces:
 *  1. registerDeviceUserRoutes(fastify) — cookie-authenticated, mounted inside /api.
 *     Pair / list / revoke devices and queue a notification from the site.
 *  2. deviceApiRoutes — bearer-token authenticated, mounted at /api/device/v1.
 *     Used by the firmware: inbox (pager notifications), ack, copy (→ Log tab), telemetry.
 *
 * Storage: user.metadata.devices / deviceInbox / deviceTelemetry (JSONB, no migration).
 * Payloads use short keys to keep each radio session small (see API spec §Compression).
 */

import { FastifyInstance, FastifyRequest } from 'fastify'
import crypto from 'crypto'
import dayjs from '#server/utils/dayjs'

const TOKEN_PREFIX = 'lotd'
const MAX_DEVICES = 4
const MAX_INBOX = 16
const MAX_TEXT = 64 // device screen budget (memory LCD, 2 lines)
const DEFAULT_POLL_S = 900 // 15 min — see power budget in LOT-DEVICE-01-FIRMWARE.md

type DeviceRecord = {
  id: string
  name: string
  tokenHash: string
  createdAt: string
  lastSeenAt?: string
  fw?: string
}

type InboxItem = {
  id: string
  text: string
  source: 'site' | 'auto' | 'ai'
  createdAt: string
}

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

const clip = (s: unknown, n = MAX_TEXT) =>
  String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, n)

function getDevices(meta: Record<string, any> | null | undefined): DeviceRecord[] {
  return Array.isArray(meta?.devices) ? meta!.devices : []
}

function getInbox(meta: Record<string, any> | null | undefined): InboxItem[] {
  return Array.isArray(meta?.deviceInbox) ? meta!.deviceInbox : []
}

/** Autonomous circadian nudge — one per slot per local day. "Coffee time." etc. */
export function autonomousNudge(hour: number): { slot: string; text: string } | null {
  if (hour >= 7 && hour < 10) return { slot: 'morning', text: 'Coffee time.' }
  if (hour >= 12 && hour < 14) return { slot: 'midday', text: 'Lunch. Step away from the screen.' }
  if (hour >= 15 && hour < 17) return { slot: 'afternoon', text: 'Water. Stretch.' }
  if (hour >= 18 && hour < 20) return { slot: 'evening', text: 'Walk outside.' }
  if (hour >= 22 || hour < 1) return { slot: 'night', text: 'Wind down.' }
  return null
}

/** Parse "lotd.<userId>.<deviceId>.<secret>" */
function parseToken(raw: string | undefined) {
  if (!raw) return null
  const token = raw.replace(/^Bearer\s+/i, '').trim()
  const parts = token.split('.')
  if (parts.length !== 4 || parts[0] !== TOKEN_PREFIX) return null
  const [, userId, deviceId, secret] = parts
  if (!userId || !deviceId || !secret) return null
  return { userId, deviceId, secret }
}

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, 'hex')
  const bb = Buffer.from(b, 'hex')
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Site-side routes (cookie session) — mounted inside /api
// ─────────────────────────────────────────────────────────────────────────────
export function registerDeviceUserRoutes(fastify: FastifyInstance) {
  // Pair a new device. Returns the token ONCE; only its hash is stored.
  fastify.post('/device/pair', async (req: FastifyRequest<{ Body: { name?: string } }>, reply) => {
    const user = req.user
    const meta = { ...(user.metadata || {}) }
    const devices = getDevices(meta)
    if (devices.length >= MAX_DEVICES) {
      return reply.status(409).send({ error: `Device limit reached (${MAX_DEVICES}).` })
    }
    const deviceId = crypto.randomBytes(6).toString('hex')
    const secret = crypto.randomBytes(24).toString('base64url').replace(/\./g, '')
    const record: DeviceRecord = {
      id: deviceId,
      name: clip(req.body?.name || 'LOT Device', 32),
      tokenHash: sha256(secret),
      createdAt: new Date().toISOString(),
    }
    meta.devices = [...devices, record]
    await user.set({ metadata: meta }).save()
    return {
      id: deviceId,
      name: record.name,
      token: `${TOKEN_PREFIX}.${user.id}.${deviceId}.${secret}`,
    }
  })

  fastify.get('/device/list', async (req: FastifyRequest) => {
    return getDevices(req.user.metadata).map(({ tokenHash, ...d }) => d)
  })

  fastify.delete('/device/:id', async (req: FastifyRequest<{ Params: { id: string } }>) => {
    const user = req.user
    const meta = { ...(user.metadata || {}) }
    meta.devices = getDevices(meta).filter((d) => d.id !== req.params.id)
    await user.set({ metadata: meta }).save()
    return { ok: true }
  })

  // Queue a pager notification from the site (or from an AI job via the same helper).
  fastify.post('/device/notify', async (req: FastifyRequest<{ Body: { text?: string } }>, reply) => {
    const text = clip(req.body?.text)
    if (!text) return reply.status(400).send({ error: 'text required' })
    const item = await queueDeviceNotification(req.user, text, 'site')
    return item
  })
}

/** Helper for server jobs / AI engines to push a pager notification to a user's device(s). */
export async function queueDeviceNotification(
  user: any,
  text: string,
  source: InboxItem['source'] = 'ai'
): Promise<InboxItem> {
  const meta = { ...(user.metadata || {}) }
  const item: InboxItem = {
    id: crypto.randomBytes(4).toString('hex'),
    text: clip(text),
    source,
    createdAt: new Date().toISOString(),
  }
  meta.deviceInbox = [...getInbox(meta), item].slice(-MAX_INBOX)
  await user.set({ metadata: meta }).save()
  return item
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Firmware routes (bearer token) — mounted at /api/device/v1
// ─────────────────────────────────────────────────────────────────────────────
export default async function deviceApiRoutes(fastify: FastifyInstance) {
  fastify.decorateRequest('device', null)

  fastify.addHook('onRequest', async (req: FastifyRequest, reply) => {
    const parsed = parseToken(req.headers.authorization as string | undefined)
    if (!parsed) {
      reply.status(401)
      throw new Error('Device token required')
    }
    const user = await fastify.models.User.findByPk(parsed.userId)
    const device = user ? getDevices(user.metadata).find((d) => d.id === parsed.deviceId) : null
    if (!user || !device || !safeEqualHex(device.tokenHash, sha256(parsed.secret))) {
      reply.status(401)
      throw new Error('Invalid device token')
    }
    ;(req as any).user = user
    ;(req as any).device = device
  })

  const touch = async (req: FastifyRequest, patch: Partial<DeviceRecord> = {}) => {
    const user = (req as any).user
    const device: DeviceRecord = (req as any).device
    const meta = { ...(user.metadata || {}) }
    meta.devices = getDevices(meta).map((d) =>
      d.id === device.id ? { ...d, ...patch, lastSeenAt: new Date().toISOString() } : d
    )
    return meta
  }

  // Hello — first boot / after provisioning. Returns server time + poll interval.
  fastify.post('/hello', async (req: FastifyRequest<{ Body: { fw?: string } }>) => {
    const user = (req as any).user
    const meta = await touch(req, { fw: clip(req.body?.fw, 16) })
    await user.set({ metadata: meta }).save()
    return { ts: Math.floor(Date.now() / 1000), w: DEFAULT_POLL_S, tz: user.timeZone || 'UTC' }
  })

  // Inbox — the pager poll. Compact: { n: [{ i, t, s }], w }
  fastify.get('/inbox', async (req: FastifyRequest) => {
    const user = (req as any).user
    const meta = await touch(req)
    let inbox = getInbox(meta)

    // No queued items → generate one autonomous nudge per circadian slot per local day.
    if (inbox.length === 0) {
      const local = user.timeZone ? dayjs().tz(user.timeZone) : dayjs()
      const nudge = autonomousNudge(local.hour())
      const key = nudge ? `${local.format('YYYY-MM-DD')}:${nudge.slot}` : null
      if (nudge && key !== meta.deviceLastNudge) {
        const item: InboxItem = {
          id: crypto.randomBytes(4).toString('hex'),
          text: nudge.text,
          source: 'auto',
          createdAt: new Date().toISOString(),
        }
        inbox = [item]
        meta.deviceInbox = inbox
        meta.deviceLastNudge = key
      }
    }

    await user.set({ metadata: meta }).save()
    return {
      // s: 's' site · 'n' autonomous nudge · 'a' AI engine
      n: inbox.map((x) => ({ i: x.id, t: x.text, s: x.source === 'auto' ? 'n' : x.source[0] })),
      w: DEFAULT_POLL_S,
    }
  })

  // Ack — device displayed these ids; remove from the queue.
  fastify.post('/ack', async (req: FastifyRequest<{ Body: { i?: string[] } }>) => {
    const user = (req as any).user
    const ids = new Set(Array.isArray(req.body?.i) ? req.body!.i : [])
    const meta = await touch(req)
    meta.deviceInbox = getInbox(meta).filter((x) => !ids.has(x.id))
    await user.set({ metadata: meta }).save()
    return { ok: true }
  })

  // Copy — the hardware button. Writes a `device_copy` event to the Log tab.
  fastify.post(
    '/copy',
    async (req: FastifyRequest<{ Body: { i?: string; t?: string; img?: string } }>, reply) => {
      const user = (req as any).user
      const device: DeviceRecord = (req as any).device
      const text = clip(req.body?.t, 280)
      if (!text) return reply.status(400).send({ error: 't required' })
      const log = await fastify.models.Log.create({
        userId: user.id,
        event: 'device_copy' as any,
        text,
        metadata: {
          text,
          notificationId: clip(req.body?.i, 16) || null,
          deviceId: device.id,
          deviceName: device.name,
        },
      })
      const meta = await touch(req)
      await user.set({ metadata: meta }).save()
      return { ok: true, id: log.id }
    }
  )

  // Telemetry — weather / environment sensor snapshot. Stored as latest value only.
  // Compact keys: t °C, h %RH, p hPa, g gas kΩ (BME688), iaq index, b battery mV
  fastify.post(
    '/telemetry',
    async (req: FastifyRequest<{ Body: Record<string, number> }>) => {
      const user = (req as any).user
      const device: DeviceRecord = (req as any).device
      const body = req.body || {}
      const num = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
      const meta = await touch(req)
      meta.deviceTelemetry = {
        ...(meta.deviceTelemetry || {}),
        [device.id]: {
          t: num(body.t),
          h: num(body.h),
          p: num(body.p),
          g: num(body.g),
          iaq: num(body.iaq),
          b: num(body.b),
          at: new Date().toISOString(),
        },
      }
      await user.set({ metadata: meta }).save()
      return { ok: true }
    }
  )
}
