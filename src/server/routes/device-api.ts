/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * LOT PAGER — device connector API (hardware programme HW-01)
 *
 * Two surfaces:
 *  A) USER (cookie session, mounted inside /api):
 *     POST   /api/devices/pair            → issue device token (shown once)
 *     GET    /api/devices                 → list paired devices
 *     DELETE /api/devices/:id             → revoke
 *     POST   /api/devices/notify          → queue a message for the pager
 *
 *  B) DEVICE (Bearer lotd.* token, mounted at /api/device/v1):
 *     GET    /api/device/v1/frame         → one compact frame per wake
 *     POST   /api/device/v1/copy          → "COPY" button → Log tab
 *     POST   /api/device/v1/telemetry     → BME688 / light / battery
 */

import { FastifyInstance, FastifyRequest } from 'fastify'
import dayjs from '#server/utils/dayjs'
import { aiEngineManager } from '#server/utils/ai-engines'
import {
  DEVICES_MAX,
  AUTONOMOUS_MIN_GAP_MIN,
  DeviceRecord,
  DeviceTelemetry,
  autonomousMessage,
  compressForPager,
  enqueue,
  getDevices,
  getPagerState,
  issueDeviceToken,
  nextFrame,
  parseDeviceToken,
  pollIntervalFor,
  verifyDeviceSecret,
} from '#server/utils/device'

const num = (v: unknown, lo: number, hi: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : undefined

/* ------------------------------------------------------------------ */
/* A) USER SURFACE                                                     */
/* ------------------------------------------------------------------ */

export function registerDeviceUserRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/devices/pair',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    async (req: FastifyRequest<{ Body: { name?: string } }>, reply) => {
      const md = req.user.metadata || {}
      const devices = getDevices(md)
      if (devices.length >= DEVICES_MAX) {
        return reply.status(409).send({ error: `Max ${DEVICES_MAX} devices. Revoke one first.` })
      }
      const { token, record } = issueDeviceToken(req.user.id, req.body?.name || 'LOT Pager')
      await req.user.set({ metadata: { ...md, devices: [...devices, record] } }).save()
      return { id: record.id, name: record.name, token, note: 'Token is shown once. Provision it to the device now.' }
    }
  )

  fastify.get('/devices', async (req: FastifyRequest) => {
    return getDevices(req.user.metadata).map(({ tokenHash, ...d }) => d)
  })

  fastify.delete('/devices/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const md = req.user.metadata || {}
    const devices = getDevices(md)
    const next = devices.filter((d) => d.id !== req.params.id)
    if (next.length === devices.length) return reply.status(404).send({ error: 'Not found' })
    await req.user.set({ metadata: { ...md, devices: next } }).save()
    return { ok: true }
  })

  fastify.post(
    '/devices/notify',
    { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async (req: FastifyRequest<{ Body: { text?: string } }>, reply) => {
      const text = String(req.body?.text ?? '').trim()
      if (!text) return reply.status(400).send({ error: 'text required' })
      const md = req.user.metadata || {}
      const pager = getPagerState(md)
      const msg = enqueue(pager, text, 'site')
      await req.user.set({ metadata: { ...md, pager } }).save()
      return msg
    }
  )
}

/* ------------------------------------------------------------------ */
/* B) DEVICE SURFACE                                                   */
/* ------------------------------------------------------------------ */

async function authDevice(fastify: FastifyInstance, req: FastifyRequest) {
  const parsed = parseDeviceToken(req.headers.authorization)
  if (!parsed) return null
  const user = await fastify.models.User.findByPk(parsed.userId)
  if (!user) return null
  const devices = getDevices(user.metadata)
  const device = devices.find((d) => d.id === parsed.deviceId)
  if (!device || !verifyDeviceSecret(device, parsed.secret)) return null
  return { user, device, devices }
}

async function aiRephrase(seed: string, ctx: string): Promise<string> {
  try {
    const engine = aiEngineManager.getEngine('auto')
    const prompt =
      `You write pager notifications for LOT, a calm self-care operating system. ` +
      `Rewrite this nudge in at most 7 words, plain ASCII, no emoji, no quotes, keep the intent. ` +
      `Context: ${ctx}. Nudge: ${seed}\nReply with the nudge only.`
    const out = await Promise.race<string>([
      engine.generateCompletion(prompt, 40),
      new Promise<string>((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000)),
    ])
    const c = compressForPager(out.split('\n')[0] || '')
    return c.length >= 4 ? c : seed
  } catch {
    return seed
  }
}

export async function deviceRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (req, reply) => {
    const auth = await authDevice(fastify, req)
    if (!auth) {
      reply.status(401).send({ error: 'Invalid device token' })
      return reply
    }
    ;(req as any).device = auth
  })

  /** One frame per wake. Autonomous message generated lazily on poll. */
  fastify.get(
    '/frame',
    { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async (req: FastifyRequest<{ Querystring: { fw?: string; bat?: string } }>) => {
      const { user, device, devices } = (req as any).device as {
        user: any
        device: DeviceRecord
        devices: DeviceRecord[]
      }
      const md = user.metadata || {}
      const pager = getPagerState(md)
      const tz = user.timeZone || 'UTC'
      let now = dayjs()
      try {
        now = dayjs().tz(tz)
      } catch {}
      const bat = num(Number(req.query.bat), 0, 100)

      const hasPending = pager.queue.some((m) => !m.servedAt)
      const gapOk =
        !pager.lastAutonomousAt ||
        dayjs().diff(dayjs(pager.lastAutonomousAt), 'minute') >= AUTONOMOUS_MIN_GAP_MIN
      if (!hasPending && gapOk) {
        const seed = autonomousMessage({ now, firstName: user.firstName, telemetry: device.telemetry })
        if (seed) {
          const ctx = `local time ${now.format('HH:mm ddd')}${user.city ? `, ${user.city}` : ''}`
          const text = process.env.LOT_PAGER_AI === '1' ? await aiRephrase(seed, ctx) : seed
          enqueue(pager, text, process.env.LOT_PAGER_AI === '1' ? 'ai' : 'autonomous')
          pager.lastAutonomousAt = new Date().toISOString()
        }
      }

      const frame = nextFrame(pager, pollIntervalFor(now, bat))
      const updated = devices.map((d) =>
        d.id === device.id
          ? {
              ...d,
              lastSeenAt: new Date().toISOString(),
              firmware: req.query.fw ? String(req.query.fw).slice(0, 24) : d.firmware,
            }
          : d
      )
      await user.set({ metadata: { ...md, pager, devices: updated } }).save()
      return frame
    }
  )

  /** COPY button → signal back to the site's Log tab. */
  fastify.post(
    '/copy',
    { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (req: FastifyRequest<{ Body: { i?: string; m?: string } }>, reply) => {
      const { user, device } = (req as any).device as { user: any; device: DeviceRecord }
      const pager = getPagerState(user.metadata)
      const fromQueue = req.body?.i ? pager.queue.find((m) => m.id === req.body.i) : undefined
      const text = compressForPager(fromQueue?.text ?? req.body?.m ?? '')
      if (!text) return reply.status(400).send({ error: 'nothing to copy' })
      const log = await fastify.models.Log.create({
        userId: user.id,
        event: 'device_copy',
        text,
        metadata: {
          deviceId: device.id,
          deviceName: device.name,
          messageId: fromQueue?.id ?? null,
          source: fromQueue?.source ?? 'device',
        },
      })
      return { ok: true, id: log.id }
    }
  )

  /** Environment telemetry — stored as latest snapshot, not spammed into Logs. */
  fastify.post(
    '/telemetry',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req: FastifyRequest<{ Body: Partial<DeviceTelemetry> }>) => {
      const { user, device, devices } = (req as any).device as {
        user: any
        device: DeviceRecord
        devices: DeviceRecord[]
      }
      const b = req.body || {}
      const telemetry: DeviceTelemetry = {
        t: num(b.t, -40, 85),
        h: num(b.h, 0, 100),
        p: num(b.p, 300, 1100),
        iaq: num(b.iaq, 0, 500),
        lux: num(b.lux, 0, 200000),
        bat: num(b.bat, 0, 100),
        at: new Date().toISOString(),
      }
      const md = user.metadata || {}
      const updated = devices.map((d) => (d.id === device.id ? { ...d, telemetry } : d))
      await user.set({ metadata: { ...md, devices: updated } }).save()
      return { ok: true }
    }
  )
}
