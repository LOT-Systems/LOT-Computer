/**
 * LOT SYSTEMS CORPORATION
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT Device Connector (hardware pager, HW-0)
 *
 * Two route groups:
 *  1. User routes (cookie session, mounted inside /api):
 *       GET    /api/devices              list paired devices
 *       POST   /api/devices              pair a new device, returns token ONCE
 *       DELETE /api/devices/:id          revoke a device
 *       POST   /api/devices/notice       queue a notice ("Coffee time!") for own devices
 *  2. Device routes (bearer token, mounted at /api/device):
 *       GET    /api/device/inbox         pending notices (max 5, newest first)
 *       POST   /api/device/ack           mark notices delivered
 *       POST   /api/device/event         {type:"copy"} -> Log tab row (event device_copy)
 *                                        {type:"sensor"} -> device_sensor (hidden)
 *
 * Notices live in the existing logs table (event "device_notice", hidden from the
 * Log tab) so no extra table is needed beyond `devices`.
 * Spec: docs/hardware/LOT-HW-03-API-CONNECTOR.md
 */

import crypto from 'crypto'
import { Op } from 'sequelize'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { Device } from '#server/models/device'
import { Log } from '#server/models/log'

export const DEVICE_NOTICE_MAX_CHARS = 80
export const DEVICE_COPY_MAX_CHARS = 280
const MAX_DEVICES_PER_USER = 5
const INBOX_LIMIT = 5
const SENSOR_MIN_INTERVAL_MS = 5 * 60 * 1000
const LAST_SEEN_THROTTLE_MS = 60 * 1000
const TOKEN_PREFIX = 'lotd_'

export function hashDeviceToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex')
}

export function newDeviceToken(): string {
  return TOKEN_PREFIX + crypto.randomBytes(24).toString('hex')
}

/** Normalise notice text for a small screen: single line, printable, ≤ 80 chars. */
export function toPagerText(input: unknown, max = DEVICE_NOTICE_MAX_CHARS): string {
  if (typeof input !== 'string') return ''
  const flat = input.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
  return flat.length > max ? flat.slice(0, max - 1).trimEnd() + '…' : flat
}

function clampNum(v: unknown, min: number, max: number): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN
  if (!Number.isFinite(n)) return null
  return Math.min(max, Math.max(min, Math.round(n * 100) / 100))
}

/**
 * Queue a pager notice for a user. Exported so AI engines / scheduled jobs can
 * send autonomous notices ("Coffee time!") without going through HTTP.
 */
export async function queueDeviceNotice(
  userId: string,
  text: string,
  source: string = 'site'
) {
  const clean = toPagerText(text)
  if (!clean) return null
  return Log.create({
    userId,
    event: 'device_notice',
    text: clean,
    metadata: { status: 'pending', source },
  })
}

// ---------------------------------------------------------------------------
// 1. User routes (registered inside the authenticated /api scope)
// ---------------------------------------------------------------------------
export function registerDeviceUserRoutes(fastify: FastifyInstance) {
  fastify.get('/devices', async (req: FastifyRequest) => {
    const devices = await Device.findAll({
      where: { userId: req.user.id, revokedAt: null },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'name', 'firmware', 'lastSeenAt', 'createdAt'],
    })
    return { devices }
  })

  fastify.post(
    '/devices',
    async (req: FastifyRequest<{ Body: { name?: string } }>, reply) => {
      const count = await Device.count({ where: { userId: req.user.id, revokedAt: null } })
      if (count >= MAX_DEVICES_PER_USER) {
        return reply.status(400).send({ message: `Device limit reached (${MAX_DEVICES_PER_USER})` })
      }
      const name = toPagerText(req.body?.name, 64) || 'LOT Pager'
      const token = newDeviceToken()
      const device = await Device.create({
        userId: req.user.id,
        name,
        tokenHash: hashDeviceToken(token),
      })
      // Token is returned exactly once; only its hash is stored.
      return { id: device.id, name: device.name, token }
    }
  )

  fastify.delete(
    '/devices/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const device = await Device.findOne({
        where: { id: req.params.id, userId: req.user.id, revokedAt: null },
      })
      if (!device) return reply.throw.notFound()
      await device.update({ revokedAt: new Date() })
      return reply.ok()
    }
  )

  fastify.post(
    '/devices/notice',
    async (req: FastifyRequest<{ Body: { text?: string } }>, reply) => {
      const text = toPagerText(req.body?.text)
      if (!text) return reply.status(400).send({ message: 'text is required' })
      const log = await queueDeviceNotice(req.user.id, text, 'user')
      return { id: log?.id, text }
    }
  )
}

// ---------------------------------------------------------------------------
// 2. Device routes (bearer token). Register with prefix '/api/device'.
// ---------------------------------------------------------------------------
// Device resolved by the bearer hook, keyed by request object.
const deviceByRequest = new WeakMap<FastifyRequest, Device>()
function requireDevice(req: FastifyRequest): Device {
  const d = deviceByRequest.get(req)
  if (!d) throw new Error('Device not resolved')
  return d
}

export default async function deviceApiRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (req: FastifyRequest, reply) => {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
    if (!token.startsWith(TOKEN_PREFIX)) {
      return reply.status(401).send({ message: 'Device token required' })
    }
    const device = await Device.findOne({
      where: { tokenHash: hashDeviceToken(token), revokedAt: null },
    })
    if (!device) {
      return reply.status(401).send({ message: 'Unknown or revoked device' })
    }
    const fw = typeof req.headers['x-lot-fw'] === 'string' ? req.headers['x-lot-fw'].slice(0, 32) : null
    const now = Date.now()
    const stale = !device.lastSeenAt || now - device.lastSeenAt.getTime() > LAST_SEEN_THROTTLE_MS
    if (stale || (fw && fw !== device.firmware)) {
      await device.update({ lastSeenAt: new Date(now), ...(fw ? { firmware: fw } : {}) })
    }
    deviceByRequest.set(req, device)
  })

  fastify.get('/inbox', async (req: FastifyRequest) => {
    const device = requireDevice(req)
    const notices = await fastify.models.Log.findAll({
      where: {
        userId: device.userId,
        event: 'device_notice',
        createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        metadata: { status: 'pending' },
      } as any,
      order: [['createdAt', 'DESC']],
      limit: INBOX_LIMIT,
      attributes: ['id', 'text', 'createdAt'],
    })
    return {
      notices: notices.map((n) => ({
        id: n.id,
        text: n.text,
        ts: Math.floor(new Date(n.createdAt).getTime() / 1000),
      })),
      poll_s: 60,
    }
  })

  fastify.post(
    '/ack',
    async (req: FastifyRequest<{ Body: { ids?: string[] } }>, reply) => {
      const device = requireDevice(req)
      const ids = Array.isArray(req.body?.ids)
        ? req.body!.ids.filter((x) => typeof x === 'string').slice(0, 20)
        : []
      if (!ids.length) return reply.status(400).send({ message: 'ids required' })
      const logs = await fastify.models.Log.findAll({
        where: { id: { [Op.in]: ids }, userId: device.userId, event: 'device_notice' },
      })
      await Promise.all(
        logs.map((l) =>
          l.update({
            metadata: {
              ...(l.metadata || {}),
              status: 'delivered',
              deliveredTo: device.id,
              deliveredAt: new Date().toISOString(),
            },
          })
        )
      )
      return { acked: logs.length }
    }
  )

  fastify.post(
    '/event',
    async (req: FastifyRequest<{ Body: Record<string, unknown> }>, reply) => {
      const device = requireDevice(req)
      const body = req.body || {}
      const type = body.type

      if (type === 'copy') {
        // "Copy" button: echo the on-screen notice into the user's Log tab.
        let text = ''
        let noticeId: string | null = null
        if (typeof body.notice_id === 'string') {
          const notice = await fastify.models.Log.findOne({
            where: { id: body.notice_id, userId: device.userId, event: 'device_notice' },
          })
          if (notice) {
            text = notice.text || ''
            noticeId = notice.id
          }
        }
        if (!text) text = toPagerText(body.text, DEVICE_COPY_MAX_CHARS)
        if (!text) return reply.status(400).send({ message: 'Nothing to copy' })
        const log = await fastify.models.Log.create({
          userId: device.userId,
          event: 'device_copy',
          text,
          metadata: { deviceId: device.id, deviceName: device.name, noticeId, fw: device.firmware },
        })
        return { id: log.id }
      }

      if (type === 'sensor') {
        const last = await fastify.models.Log.findOne({
          where: { userId: device.userId, event: 'device_sensor' },
          order: [['createdAt', 'DESC']],
          attributes: ['createdAt'],
        })
        if (last && Date.now() - new Date(last.createdAt).getTime() < SENSOR_MIN_INTERVAL_MS) {
          return { stored: false, reason: 'rate_limited' }
        }
        const reading = {
          t_c: clampNum(body.t_c, -40, 85),
          rh: clampNum(body.rh, 0, 100),
          hpa: clampNum(body.hpa, 300, 1100),
          iaq: clampNum(body.iaq, 0, 500),
          lux: clampNum(body.lux, 0, 120000),
          battery: clampNum(body.battery, 0, 1),
        }
        await fastify.models.Log.create({
          userId: device.userId,
          event: 'device_sensor',
          text: '',
          metadata: { deviceId: device.id, ...reading },
        })
        return { stored: true }
      }

      return reply.status(400).send({ message: 'Unknown event type' })
    }
  )
}
