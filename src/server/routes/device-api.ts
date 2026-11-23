/**
 * LOT·01 Device API v1 — hardware pager for lot-systems.com.
 *
 * Registered only when LOT_DEVICES_ENABLED=true (see config.devices).
 *   deviceApiRoutes  → /device-api/v1/*   bearer-token auth, no session cookie
 *   deviceUserRoutes → /api/devices/*     session auth (inside the /api group)
 *
 * Spec: docs/hardware/lot-01/07-LOT-API-CONNECTOR.md
 */
import { FastifyInstance, FastifyRequest } from 'fastify'
import crypto from 'node:crypto'
import { getLogContext } from '#server/utils/logs'
import { NUDGE_MAX_CHARS, sanitizeNudge } from '#server/utils/device-nudges'

const PAIR_TTL_MS = 10 * 60 * 1000
const TOKEN_PREFIX = 'ld1_'
const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

/** 8-char pairing code without look-alike characters (no 0/O/1/I). */
export function makeUserCode(): string {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'LOT-' + Array.from(crypto.randomBytes(4), (b) => a[b % a.length]).join('')
}

type Device = { id: string; user_id: string }
type DeviceRequest = FastifyRequest & { device?: Device }

async function authDevice(fastify: FastifyInstance, req: FastifyRequest): Promise<Device | null> {
  const h = req.headers.authorization || ''
  if (!h.startsWith('Bearer ' + TOKEN_PREFIX)) return null
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
  fastify.post('/pair/start', async (req: FastifyRequest<{ Body: { serial?: string; fw?: string; hw?: string } }>, reply) => {
    const serial = String(req.body?.serial || '').slice(0, 64)
    if (!serial) return reply.code(400).send({ error: 'serial required' })
    const deviceCode = crypto.randomBytes(24).toString('base64url')
    const code = makeUserCode()
    await fastify.sequelize.query(
      `INSERT INTO device_pairings (device_code, user_code, serial, hw, fw, expires_at)
       VALUES (:d, :u, :s, :hw, :fw, :e)`,
      {
        replacements: {
          d: deviceCode, u: code, s: serial,
          hw: req.body.hw ? String(req.body.hw).slice(0, 32) : null,
          fw: req.body.fw ? String(req.body.fw).slice(0, 32) : null,
          e: new Date(Date.now() + PAIR_TTL_MS),
        },
      }
    )
    return { device_code: deviceCode, user_code: code, interval: 5 }
  })

  fastify.post('/pair/poll', async (req: FastifyRequest<{ Body: { device_code?: string } }>, reply) => {
    const [rows] = await fastify.sequelize.query(
      `SELECT * FROM device_pairings WHERE device_code = :d AND expires_at > now()`,
      { replacements: { d: String(req.body?.device_code || '') } }
    )
    const p = (rows as any[])[0]
    if (!p) return reply.code(410).send({ status: 'expired' })
    if (!p.user_id) return { status: 'pending' }
    const token = TOKEN_PREFIX + crypto.randomBytes(32).toString('base64url')
    const [dev] = await fastify.sequelize.query(
      `INSERT INTO devices (user_id, serial, hw, fw, token_hash)
       VALUES (:u, :s, :hw, :fw, :t) RETURNING id`,
      { replacements: { u: p.user_id, s: p.serial, hw: p.hw ?? 'lot-01', fw: p.fw ?? null, t: sha256(token) } }
    )
    await fastify.sequelize.query(`DELETE FROM device_pairings WHERE device_code = :d`, { replacements: { d: p.device_code } })
    return { status: 'ok', token, device_id: (dev as any[])[0].id }
  })

  // ---------------------------------------------------------- authenticated
  fastify.register(async (f) => {
    f.addHook('onRequest', async (req: DeviceRequest, reply) => {
      const device = await authDevice(fastify, req)
      if (!device) return reply.code(401).send({ error: 'unauthorized' })
      req.device = device
    })

    f.get('/inbox', async (req: FastifyRequest<{ Querystring: { since?: string } }>) => {
      const device = (req as DeviceRequest).device!
      const since = Math.max(0, Number(req.query.since) || 0)
      const [rows] = await fastify.sequelize.query(
        `SELECT id, text, kind, deliver_at, ttl_s FROM device_notifications
          WHERE user_id = :u AND id > :since AND deliver_at <= now()
            AND deliver_at + make_interval(secs => ttl_s) > now()
          ORDER BY id ASC LIMIT 5`,
        { replacements: { u: device.user_id, since } }
      )
      const items = (rows as any[]).map((r) => ({
        id: String(r.id), t: r.text, k: r.kind, ts: Math.floor(new Date(r.deliver_at).getTime() / 1000), ttl: r.ttl_s,
      }))
      const [next] = await fastify.sequelize.query(
        `SELECT EXTRACT(EPOCH FROM (MIN(deliver_at) - now()))::int AS s FROM device_notifications
          WHERE user_id = :u AND deliver_at > now()`,
        { replacements: { u: device.user_id } }
      )
      const s = (next as any[])[0]?.s
      // Wake near the next scheduled message, clamped to 5–60 min.
      const next_poll_s = Math.min(3600, Math.max(300, s ?? 900))
      return { items, next_poll_s }
    })

    f.post('/ack', async (req: FastifyRequest<{ Body: { id?: string } }>) => {
      const device = (req as DeviceRequest).device!
      await fastify.sequelize.query(
        `UPDATE device_notifications SET acked_at = now() WHERE id = :id AND user_id = :u`,
        { replacements: { id: Number(req.body?.id) || 0, u: device.user_id } }
      )
      return { ok: true }
    })

    // Copy key → Log tab (event 'note', so the existing Log UI shows it unchanged)
    f.post('/copy', async (req: FastifyRequest<{ Body: { id?: string; t?: string; env?: Record<string, number> } }>, reply) => {
      const device = (req as DeviceRequest).device!
      const text = sanitizeNudge(String(req.body?.t || ''), NUDGE_MAX_CHARS)
      if (!text) return reply.code(400).send({ error: 'empty' })
      const user = await fastify.models.User.findByPk(device.user_id)
      if (!user) return reply.code(401).send({ error: 'unauthorized' })
      const env = req.body?.env && typeof req.body.env === 'object'
        ? Object.fromEntries(Object.entries(req.body.env).filter(([, v]) => typeof v === 'number').slice(0, 8))
        : null
      const log = await fastify.models.Log.create({
        userId: device.user_id,
        event: 'note',
        text,
        metadata: { source: 'lot-01', deviceId: device.id, notificationId: req.body?.id ?? null, env },
        context: await getLogContext(user),
      })
      return { ok: true, log_id: log.id }
    })

    f.post('/telemetry', async (req: FastifyRequest<{ Body: Record<string, unknown> }>) => {
      const device = (req as DeviceRequest).device!
      const body = req.body && typeof req.body === 'object' ? req.body : {}
      const json = JSON.stringify(body)
      await fastify.sequelize.query(
        `UPDATE devices SET telemetry = CAST(:t AS jsonb), fw = COALESCE(:fw, fw), updated_at = now() WHERE id = :id`,
        {
          replacements: {
            t: json.length <= 1024 ? json : '{}',
            fw: typeof body.fw === 'string' ? body.fw.slice(0, 32) : null,
            id: device.id,
          },
        }
      )
      return { ok: true }
    })
  })
}

/** Session-authenticated routes for Settings → Devices. Register inside the /api group. */
export async function deviceUserRoutes(fastify: FastifyInstance) {
  fastify.post('/devices/claim', async (req: FastifyRequest<{ Body: { user_code?: string } }>, reply) => {
    const code = String(req.body?.user_code || '').toUpperCase().replace(/\s+/g, '')
    const normalized = code.startsWith('LOT-') ? code : 'LOT-' + code
    const [rows] = await fastify.sequelize.query(
      `UPDATE device_pairings SET user_id = :u
        WHERE user_code = :c AND user_id IS NULL AND expires_at > now()
        RETURNING serial`,
      { replacements: { u: req.user.id, c: normalized } }
    )
    if (!(rows as any[]).length) return reply.code(404).send({ error: 'code not found or expired' })
    return { ok: true, serial: (rows as any[])[0].serial }
  })

  fastify.get('/devices', async (req) => {
    const [rows] = await fastify.sequelize.query(
      `SELECT id, serial, hw, fw, name, last_seen_at, telemetry, created_at FROM devices
        WHERE user_id = :u AND revoked_at IS NULL ORDER BY created_at ASC`,
      { replacements: { u: req.user.id } }
    )
    return { devices: rows }
  })

  fastify.delete('/devices/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const [rows] = await fastify.sequelize.query(
      `UPDATE devices SET revoked_at = now(), token_hash = NULL
        WHERE id = :id AND user_id = :u AND revoked_at IS NULL RETURNING id`,
      { replacements: { id: req.params.id, u: req.user.id } }
    )
    if (!(rows as any[]).length) return reply.code(404).send({ error: 'not found' })
    return { ok: true }
  })

  // "Send test" button in Settings: queue a message right now.
  fastify.post('/devices/test', async (req: FastifyRequest<{ Body: { t?: string } }>) => {
    const text = sanitizeNudge(req.body?.t || 'Coffee time!') || 'Coffee time!'
    const [rows] = await fastify.sequelize.query(
      `INSERT INTO device_notifications (user_id, text, kind) VALUES (:u, :t, 'test') RETURNING id`,
      { replacements: { u: req.user.id, t: text } }
    )
    return { ok: true, id: String((rows as any[])[0].id), t: text }
  })
}
