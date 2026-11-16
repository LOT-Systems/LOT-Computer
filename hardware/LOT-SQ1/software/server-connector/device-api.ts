/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 *
 * LOT Device API v1 — reference connector for the SQ-1 pager.
 * STATUS: REFERENCE ONLY. Not registered in src/server/routes/index.ts.
 * To enable (HW-02, needs approval):
 *   1. copy to src/server/routes/device-api.ts
 *   2. run the SQL in hardware/LOT-SQ1/docs/06-LOT-API-CONNECTOR.md §5 as a migration
 *   3. in registerRoutes(): if (process.env.DEVICE_API_ENABLED === 'true')
 *        await fastify.register(deviceApiRoutes, { prefix: '/api/device/v1' })
 *   The global onRequest session hook leaves req.user empty for devices;
 *   this plugin authenticates with its own bearer token instead.
 */

import crypto from 'node:crypto'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { QueryTypes } from 'sequelize'

const MAX_TEXT = 48
const MIN_SYNC_S = 60
const MAX_SYNC_S = 7200
const TELEMETRY_EVERY_MS = 60 * 60 * 1000

type DeviceRow = { id: string; user_id: string; serial: string; last_telemetry_at?: string | null }

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')
const clampText = (s: string) => (s || '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT)

/** Circadian fallback so a fresh device is useful on day 1. */
export function circadianFallback(hour: number): string | null {
  if (hour >= 7 && hour < 10) return 'Coffee time!'
  if (hour >= 12 && hour < 13) return 'Water + 10 slow breaths'
  if (hour >= 15 && hour < 16) return 'Stand up. Look far away.'
  if (hour >= 21 && hour < 22) return 'Screens down. Tea?'
  return null
}

/** Sensor-triggered moments (BME688 AI gas class + IAQ). */
export function sensorTrigger(env: any): string | null {
  if (!env) return null
  if (env.gas === 'coffee') return "Coffee's brewing. Log the ritual?"
  if (typeof env.iaq === 'number' && env.iaq > 150) return 'Open a window for 3 minutes'
  if (typeof env.h === 'number' && env.h < 25) return 'Dry air. Drink some water.'
  return null
}

/** Server picks next_sync_s: denser in the morning, sparse at night, slow on low battery. */
export function nextSyncSeconds(hour: number, battery: number): number {
  let s = hour >= 23 || hour < 7 ? 3600 : hour >= 7 && hour < 10 ? 600 : 900
  if (battery < 20) s *= 2
  return Math.max(MIN_SYNC_S, Math.min(MAX_SYNC_S, s))
}

export default async function deviceApiRoutes(fastify: FastifyInstance) {
  const db = (fastify as any).sequelize

  async function authDevice(req: FastifyRequest, reply: FastifyReply): Promise<DeviceRow | null> {
    const h = req.headers.authorization || ''
    const token = h.startsWith('Bearer ') ? h.slice(7) : ''
    if (!token.startsWith('lotd_')) {
      reply.code(401).send({ error: 'unauthorized' })
      return null
    }
    const rows: DeviceRow[] = await db.query(
      'SELECT id, user_id, serial, last_telemetry_at FROM devices WHERE token_hash = :h LIMIT 1',
      { replacements: { h: sha256(token) }, type: QueryTypes.SELECT }
    )
    if (!rows.length) {
      reply.code(401).send({ error: 'unauthorized' })
      return null
    }
    return rows[0]
  }

  // POST /pair — exchange a 6-digit code (created from Settings → Devices) for a device token
  fastify.post('/pair', async (req: FastifyRequest<{ Body: { code: string; serial: string; fw?: string } }>, reply) => {
    const { code, serial, fw } = (req.body || {}) as any
    if (!/^\d{6}$/.test(String(code || '')) || !serial) return reply.code(400).send({ error: 'invalid_code' })
    const codes: any[] = await db.query(
      'DELETE FROM device_pairing_codes WHERE code = :code AND expires_at > NOW() RETURNING user_id',
      { replacements: { code }, type: QueryTypes.SELECT }
    )
    if (!codes.length) return reply.code(400).send({ error: 'invalid_code' })
    const userId = codes[0].user_id
    const token = 'lotd_' + crypto.randomBytes(32).toString('base64url')
    const id = crypto.randomUUID()
    await db.query(
      `INSERT INTO devices (id, user_id, serial, token_hash, fw, created_at, updated_at)
       VALUES (:id, :userId, :serial, :hash, :fw, NOW(), NOW())
       ON CONFLICT (serial) DO UPDATE SET user_id = :userId, token_hash = :hash, fw = :fw, updated_at = NOW()`,
      { replacements: { id, userId, serial, hash: sha256(token), fw: fw || null } }
    )
    const user = await fastify.models.User.findByPk(userId)
    return { device_token: token, device_id: id, name: (user as any)?.firstName || '' }
  })

  // POST /sync — the pager heartbeat: telemetry up, one notification down
  fastify.post('/sync', async (req: FastifyRequest<{ Body: any }>, reply) => {
    const dev = await authDevice(req, reply)
    if (!dev) return
    const body = (req.body || {}) as any
    const battery = Number(body.bat ?? 100)
    const now = new Date()
    const hour = now.getHours() // TODO HW-02: use the user's timezone, not the server's

    await db.query('UPDATE devices SET last_seen_at = NOW(), battery = :b, fw = :fw WHERE id = :id', {
      replacements: { b: battery, fw: body.fw || null, id: dev.id },
    })

    // Compressed telemetry: at most one Log row per hour per device
    const lastT = dev.last_telemetry_at ? new Date(dev.last_telemetry_at).getTime() : 0
    if (body.env && now.getTime() - lastT > TELEMETRY_EVERY_MS) {
      await fastify.models.Log.create({
        userId: dev.user_id,
        event: 'device_telemetry',
        text: '',
        metadata: { source: 'sq1', deviceId: dev.id, env: body.env, bat: battery, rssi: body.rssi },
      } as any)
      await db.query('UPDATE devices SET last_telemetry_at = NOW() WHERE id = :id', { replacements: { id: dev.id } })
    }

    // 1) explicit queue (AI engines / admin)
    const queued: any[] = await db.query(
      `UPDATE device_notifications SET delivered_at = NOW()
       WHERE id = (SELECT id FROM device_notifications
                   WHERE user_id = :u AND delivered_at IS NULL AND (not_before IS NULL OR not_before <= NOW())
                   ORDER BY created_at ASC LIMIT 1)
       RETURNING id, text, buzz`,
      { replacements: { u: dev.user_id }, type: QueryTypes.SELECT }
    )
    let notification: any = queued[0] ? { id: queued[0].id, text: clampText(queued[0].text), buzz: queued[0].buzz ?? 2 } : null

    // 2) sensor triggers, 3) circadian fallback — de-duplicated by a deterministic id per hour
    if (!notification) {
      const text = sensorTrigger(body.env) || circadianFallback(hour)
      if (text) {
        const id = 'c_' + sha256(dev.id + text + now.toISOString().slice(0, 13)).slice(0, 10)
        const seen: string[] = Array.isArray(body.seen) ? body.seen : []
        if (!seen.includes(id)) notification = { id, text: clampText(text), buzz: 2 }
      }
    }

    return { notification, next_sync_s: nextSyncSeconds(hour, battery), quiet: hour >= 23 || hour < 7, fw: null }
  })

  // POST /copy — the COPY button → user's Log tab
  fastify.post('/copy', async (req: FastifyRequest<{ Body: any }>, reply) => {
    const dev = await authDevice(req, reply)
    if (!dev) return
    const { notification_id, text, at } = (req.body || {}) as any
    const clean = clampText(text)
    if (!clean) return reply.code(400).send({ error: 'empty_text' })
    const log = await fastify.models.Log.create({
      userId: dev.user_id,
      event: 'device_copy',
      text: clean,
      metadata: { source: 'sq1', deviceId: dev.id, serial: dev.serial, notificationId: notification_id || null, at: at || null },
    } as any)
    return { ok: true, log_id: (log as any).id }
  })

  // POST /photo — long-press capture (raw image/jpeg body)
  fastify.addContentTypeParser('image/jpeg', { parseAs: 'buffer', bodyLimit: 200 * 1024 }, (_req, body, done) => done(null, body))
  fastify.post('/photo', async (req: FastifyRequest, reply) => {
    const dev = await authDevice(req, reply)
    if (!dev) return
    const buf = req.body as Buffer
    if (!Buffer.isBuffer(buf) || buf[0] !== 0xff || buf[1] !== 0xd8) return reply.code(400).send({ error: 'not_jpeg' })
    // TODO HW-02: strip EXIF, upload to object storage, store URL instead of size
    const log = await fastify.models.Log.create({
      userId: dev.user_id,
      event: 'device_photo',
      text: '',
      metadata: { source: 'sq1', deviceId: dev.id, bytes: buf.length, notificationId: req.headers['x-notification-id'] || null },
    } as any)
    return { ok: true, log_id: (log as any).id }
  })
}
