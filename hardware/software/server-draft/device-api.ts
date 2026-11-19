/**
 * LOT SYSTEMS CORPORATION
 * LOT Pager L-01 — Device API (DRAFT, NOT WIRED IN)
 *
 * Lives under hardware/ on purpose: it is not compiled or registered by the server.
 * To adopt (Phase P1b):
 *   1. Move to src/server/routes/device-api.ts
 *   2. Add Device + DeviceMessage Sequelize models (src/server/models/, same pattern as log.ts;
 *      columns as in device-migration.draft.cjs) and move that migration → migrations/
 *   3. In src/server/server.ts, next to the public API registration:
 *
 *        // Device API — bearer device token, NOT cookie session
 *        fastify.register(deviceApiRoutes, { prefix: '/api/device/v1' })
 *
 *      and inside the existing *User API* plugin (cookie-authenticated):
 *
 *        fastify.register(devicePairingRoutes, { prefix: '/api/device/v1' })
 *
 * Contract: hardware/docs/07-SOFTWARE-CONNECTOR.md. Reference client + mock:
 * hardware/software/connector/lot-device-sim.mjs
 */

import crypto from 'node:crypto'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { Op } from 'sequelize'

const SCREEN_MAX = 80
const PAIR_TTL_MS = 10 * 60 * 1000
const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

// In-memory pairing codes are fine for one server instance; move to Postgres/Redis for >1 instance.
const pairCodes = new Map<string, { userId: string; exp: number }>()

/** Cookie-authenticated: the logged-in user creates a 6-digit code shown on the site. */
export async function devicePairingRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/pair/start',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    async (req: FastifyRequest) => {
      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
      pairCodes.set(code, { userId: req.user.id, exp: Date.now() + PAIR_TTL_MS })
      return { code, expiresAt: new Date(Date.now() + PAIR_TTL_MS).toISOString() }
    }
  )

  fastify.get('/devices', async (req: FastifyRequest) => {
    const devices = await (fastify.models as any).Device.findAll({
      where: { userId: req.user.id, revokedAt: null },
      attributes: ['id', 'hardwareId', 'name', 'fw', 'lastSeenAt', 'battery'],
    })
    return devices
  })

  fastify.delete('/devices/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const d = await (fastify.models as any).Device.findOne({ where: { id: req.params.id, userId: req.user.id } })
    if (!d) return reply.throw.notFound()
    await d.set({ revokedAt: new Date() }).save()
    return { ok: true }
  })
}

/** Bearer-authenticated device routes. */
export async function deviceApiRoutes(fastify: FastifyInstance) {
  const models = fastify.models as any

  // claim is the only unauthenticated device call
  fastify.post(
    '/pair/claim',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req: FastifyRequest<{ Body: { code: string; deviceId: string; hw?: string; fw?: string } }>, reply) => {
      const { code, deviceId, hw, fw } = req.body || ({} as any)
      const pc = pairCodes.get(String(code))
      if (!pc || pc.exp < Date.now()) return reply.status(400).send({ error: 'invalid_or_expired_code' })
      pairCodes.delete(String(code))
      const token = 'lotd_' + crypto.randomBytes(24).toString('base64url')
      await models.Device.create({
        userId: pc.userId,
        hardwareId: String(deviceId).slice(0, 32),
        hw: hw || 'L-01',
        fw: fw || null,
        tokenHash: sha256(token),
      })
      return { deviceToken: token, pollSeconds: 900 }
    }
  )

  fastify.addHook('onRequest', async (req: any, reply) => {
    if (req.routeOptions?.url?.endsWith('/pair/claim')) return
    const m = /^Bearer (lotd_[A-Za-z0-9_-]+)$/.exec(req.headers.authorization || '')
    const device = m ? await models.Device.findOne({ where: { tokenHash: sha256(m[1]), revokedAt: null } }) : null
    if (!device) {
      reply.status(401)
      throw new Error('Access denied')
    }
    req.device = device
    req.user = await models.User.findByPk(device.userId)
    device.set({ lastSeenAt: new Date() }).save().catch(() => {})
  })

  fastify.get('/inbox', async (req: any) => {
    const since = Number(req.query?.since || 0)
    const rows = await models.DeviceMessage.findAll({
      where: { userId: req.device.userId, seq: { [Op.gt]: since } },
      order: [['seq', 'ASC']],
      limit: 10,
    })
    const cursor = rows.length ? rows[rows.length - 1].seq : since
    return {
      cursor,
      messages: rows.map((r: any) => ({ id: r.id, text: r.text.slice(0, SCREEN_MAX), kind: r.kind, buzz: r.buzz, createdAt: r.createdAt })),
      digest: req.device.digest || '',
      pollSeconds: req.device.pollSeconds || 900,
      serverTime: new Date().toISOString(),
    }
  })

  // Requirement 16: Copy button → Log tab
  fastify.post('/copy', async (req: any, reply) => {
    const text = String(req.body?.text || '').trim().slice(0, 500)
    if (!text) return reply.status(400).send({ error: 'text_required' })
    const log = await models.Log.create({
      userId: req.device.userId,
      text,
      event: 'device_copy',
      metadata: { source: 'L-01', deviceId: req.device.id, messageId: req.body?.messageId || null, pressedAt: req.body?.at || null },
      context: {},
    })
    return { logId: log.id }
  })

  fastify.post('/telemetry', async (req: any, reply) => {
    const readings = Array.isArray(req.body?.readings) ? req.body.readings.slice(0, 96) : null
    if (!readings) return reply.status(400).send({ error: 'readings_required' })
    const last = readings[readings.length - 1] || {}
    await req.device.set({ battery: last.batt ?? null, lastReading: last }).save()
    // Compressed storage: one Log row per device-day (metadata.readings appended), not one per reading.
    // See docs/11-SESSION-COMPRESSION.md. Implemented in P1b.
    return reply.status(204).send()
  })

  fastify.delete('/token', async (req: any, reply) => {
    await req.device.set({ revokedAt: new Date() }).save()
    return reply.status(204).send()
  })
}

/**
 * AI notifier (to add to scheduled-jobs.ts in P1b). Runs every 15 min:
 * for each user with an active device, decide whether to send one short nudge.
 *
 *   const engine = aiEngineManager.getEngine('auto')
 *   const prompt = `You write one notification for a small steel pager. Max 60 characters.
 *     Plain words, end with a period, no emoji. Local time ${localTime}, phase ${circadianPhase},
 *     weather ${weatherSummary}, last logs: ${recentLogTitles}. If nothing is worth saying, reply SKIP.`
 *   const text = (await engine.generateCompletion(prompt, 60)).trim()
 *   if (text !== 'SKIP') await DeviceMessage.create({ userId, text: text.slice(0, 80), kind: 'nudge', buzz: 1 })
 *
 * Guardrails: max 6 nudges/day/user, quiet hours 22:00–08:00 local, never repeat within 24 h.
 */
