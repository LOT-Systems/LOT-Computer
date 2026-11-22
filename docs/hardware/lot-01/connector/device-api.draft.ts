/**
 * LOT·01 Device API v1 — DRAFT, not registered.
 *
 * To enable in P2:
 *   1. Move to src/server/routes/device-api.ts and run the migration draft.
 *   2. In server.ts, next to publicApiRoutes:
 *        fastify.register(deviceApiRoutes, { prefix: '/device-api/v1' })
 *      (outside the `/api` group, whose onRequest hook requires a session).
 *   3. Register `claimRoute` inside the authenticated `/api` group.
 *
 * Spec: docs/hardware/lot-01/07-LOT-API-CONNECTOR.md
 */
import { FastifyInstance, FastifyRequest } from 'fastify'
import crypto from 'node:crypto'
import { getLogContext } from '#server/utils/logs'

const MAX_TEXT = 64
const PAIR_TTL_MS = 10 * 60 * 1000
const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')
const userCode = () => {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I
  return 'LOT-' + Array.from(crypto.randomBytes(4), (b) => a[b % a.length]).join('')
}

type Device = { id: string; user_id: string }

async function authDevice(fastify: FastifyInstance, req: FastifyRequest): Promise<Device | null> {
  const h = req.headers.authorization || ''
  if (!h.startsWith('Bearer ld1_')) return null
  const [rows] = await fastify.sequelize.query(
    `UPDATE devices SET last_seen_at = now()
       WHERE token_hash = :h AND revoked_at IS NULL
       RETURNING id, user_id`,
    { replacements: { h: sha256(h.slice(7)) } }
  )
  return (rows as Device[])[0] || null
}

export async function deviceApiRoutes(fastify: FastifyInstance) {
  // ---------------------------------------------------------------- pairing
  fastify.post('/pair/start', async (req: FastifyRequest<{ Body: { serial: string; fw?: string; hw?: string } }>) => {
    const deviceCode = crypto.randomBytes(24).toString('base64url')
    const code = userCode()
    await fastify.sequelize.query(
      `INSERT INTO device_pairings (device_code, user_code, serial, hw, fw, expires_at)
       VALUES (:d, :u, :s, :hw, :fw, :e)`,
      { replacements: { d: deviceCode, u: code, s: String(req.body.serial).slice(0, 64), hw: req.body.hw ?? null, fw: req.body.fw ?? null, e: new Date(Date.now() + PAIR_TTL_MS) } }
    )
    return { device_code: deviceCode, user_code: code, interval: 5 }
  })

  fastify.post('/pair/poll', async (req: FastifyRequest<{ Body: { device_code: string } }>, reply) => {
    const [rows] = await fastify.sequelize.query(
      `SELECT * FROM device_pairings WHERE device_code = :d AND expires_at > now()`,
      { replacements: { d: req.body.device_code } }
    )
    const p = (rows as any[])[0]
    if (!p) return reply.code(410).send({ status: 'expired' })
    if (!p.user_id) return { status: 'pending' }
    const token = 'ld1_' + crypto.randomBytes(32).toString('base64url')
    const [dev] = await fastify.sequelize.query(
      `INSERT INTO devices (user_id, serial, hw, fw, token_hash)
       VALUES (:u, :s, :hw, :fw, :t) RETURNING id`,
      { replacements: { u: p.user_id, s: p.serial, hw: p.hw ?? 'lot-01', fw: p.fw, t: sha256(token) } }
    )
    await fastify.sequelize.query(`DELETE FROM device_pairings WHERE device_code = :d`, { replacements: { d: p.device_code } })
    return { status: 'ok', token, device_id: (dev as any[])[0].id }
  })

  // ---------------------------------------------------------- authenticated
  fastify.register(async (f) => {
    f.addHook('onRequest', async (req, reply) => {
      const device = await authDevice(fastify, req)
      if (!device) return reply.code(401).send({ error: 'unauthorized' })
      ;(req as any).device = device
    })

    f.get('/inbox', async (req: FastifyRequest<{ Querystring: { since?: string } }>) => {
      const device: Device = (req as any).device
      const since = Number(req.query.since) || 0
      const [rows] = await fastify.sequelize.query(
        `SELECT id, text, kind, deliver_at, ttl_s FROM device_notifications
          WHERE user_id = :u AND id > :since AND deliver_at <= now()
            AND deliver_at + (ttl_s || ' seconds')::interval > now()
          ORDER BY id ASC LIMIT 5`,
        { replacements: { u: device.user_id, since } }
      )
      const items = (rows as any[]).map((r) => ({
        id: String(r.id), t: r.text, k: r.kind, ts: Math.floor(new Date(r.deliver_at).getTime() / 1000), ttl: r.ttl_s,
      }))
      // Wake near the next scheduled message, clamped to 5–60 min.
      const [next] = await fastify.sequelize.query(
        `SELECT EXTRACT(EPOCH FROM (MIN(deliver_at) - now()))::int AS s FROM device_notifications
          WHERE user_id = :u AND deliver_at > now()`,
        { replacements: { u: device.user_id } }
      )
      const s = (next as any[])[0]?.s
      const next_poll_s = Math.min(3600, Math.max(300, s ?? 900))
      return { items, next_poll_s }
    })

    f.post('/ack', async (req: FastifyRequest<{ Body: { id: string } }>) => {
      const device: Device = (req as any).device
      await fastify.sequelize.query(
        `UPDATE device_notifications SET acked_at = now() WHERE id = :id AND user_id = :u`,
        { replacements: { id: Number(req.body.id), u: device.user_id } }
      )
      return { ok: true }
    })

    // Copy button → Log tab
    f.post('/copy', async (req: FastifyRequest<{ Body: { id?: string; t: string; ts?: number; env?: Record<string, number> } }>, reply) => {
      const device: Device = (req as any).device
      const text = String(req.body.t || '').trim().slice(0, MAX_TEXT)
      if (!text) return reply.code(400).send({ error: 'empty' })
      const user = await fastify.models.User.findByPk(device.user_id)
      if (!user) return reply.code(401).send({ error: 'unauthorized' })
      const log = await fastify.models.Log.create({
        userId: device.user_id,
        event: 'note',
        text,
        metadata: { source: 'lot-01', deviceId: device.id, notificationId: req.body.id ?? null, env: req.body.env ?? null },
        context: await getLogContext(user as any),
      })
      return { ok: true, log_id: log.id }
    })

    f.post('/telemetry', async (req: FastifyRequest<{ Body: Record<string, unknown> }>) => {
      const device: Device = (req as any).device
      await fastify.sequelize.query(
        `UPDATE devices SET telemetry = :t::jsonb, fw = COALESCE(:fw, fw), updated_at = now() WHERE id = :id`,
        { replacements: { t: JSON.stringify(req.body).slice(0, 1024), fw: (req.body.fw as string) ?? null, id: device.id } }
      )
      return { ok: true }
    })
  })
}

/** Register inside the session-authenticated `/api` group: POST /api/devices/claim */
export async function claimRoute(fastify: FastifyInstance) {
  fastify.post('/devices/claim', async (req: FastifyRequest<{ Body: { user_code: string } }>, reply) => {
    const code = String(req.body.user_code || '').toUpperCase().trim()
    const [rows] = await fastify.sequelize.query(
      `UPDATE device_pairings SET user_id = :u
        WHERE user_code = :c AND user_id IS NULL AND expires_at > now()
        RETURNING serial`,
      { replacements: { u: req.user.id, c: code } }
    )
    if (!(rows as any[]).length) return reply.code(404).send({ error: 'code not found or expired' })
    return { ok: true, serial: (rows as any[])[0].serial }
  })
}
