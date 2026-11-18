/**
 * LOT SYSTEMS CORPORATION · COSMO® CIA
 * LOT TILE device API: REFERENCE Fastify plugin (S1 draft, NOT registered).
 *
 * To activate in S2:
 *   1. copy to src/server/routes/device-api.ts
 *   2. apply connector/migration-devices.cjs
 *   3. add 'device_copy' | 'device_telemetry' to LogEvent in src/shared/types/index.ts
 *   4. register OUTSIDE the cookie-session scope in src/server/server.ts:
 *        fastify.register(deviceApiRoutes, { prefix: '/api/device/v1' })
 * Logic mirrors connector/device-core.mjs, which is exercised by device-sim.mjs.
 */
import crypto from 'crypto'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { QueryTypes } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { getLogContext } from '#server/utils/logs'

const MAX_SLEEP_S = 3 * 3600
const LEAD_S = 30
const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

type Device = { id: string; user_id: string; serial: string; mode: string; camera_enabled: boolean }
type DeviceEvent = { seq: number; type: 'copy' | 'dismiss' | 'snap'; notification_id?: string; ts?: string }

declare module 'fastify' {
  interface FastifyRequest { device?: Device }
}

export async function deviceApiRoutes(fastify: FastifyInstance) {
  // ---- auth: Bearer device token (only the SHA-256 hash is stored) ----
  fastify.addHook('preHandler', async (req, reply) => {
    if (req.url.includes('/pair/')) return
    const m = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || '')
    if (!m) return reply.status(401).send({ error: 'unauthorized' })
    const [device] = await sequelize.query<Device>(
      'SELECT id, user_id, serial, mode, camera_enabled FROM devices WHERE token_hash = :h',
      { replacements: { h: sha256(m[1]) }, type: QueryTypes.SELECT }
    )
    if (!device) return reply.status(401).send({ error: 'unauthorized' })
    req.device = device
  })

  async function applyEvents(device: Device, events: DeviceEvent[] = []) {
    let acked = 0
    for (const evt of [...events].sort((a, b) => a.seq - b.seq).slice(0, 32)) {
      acked = Math.max(acked, evt.seq)
      const inserted = await sequelize.query(
        'INSERT INTO device_event_seqs (device_id, seq) VALUES (:d, :s) ON CONFLICT DO NOTHING RETURNING seq',
        { replacements: { d: device.id, s: evt.seq }, type: QueryTypes.SELECT }
      )
      if (inserted.length === 0) continue // already processed: idempotent retry
      if (!evt.notification_id) continue
      const [n] = await sequelize.query<{ id: string; text: string; kind: string }>(
        'SELECT id, text, kind FROM device_notifications WHERE id = :id AND user_id = :u',
        { replacements: { id: evt.notification_id, u: device.user_id }, type: QueryTypes.SELECT }
      )
      if (!n) continue
      if (evt.type === 'copy') {
        const user = await fastify.models.User.findByPk(device.user_id)
        await fastify.models.Log.create({
          userId: device.user_id,
          event: 'device_copy' as any,
          text: n.text,
          metadata: { deviceId: device.id, serial: device.serial, notificationId: n.id,
                      kind: n.kind, pressedAt: evt.ts, source: 'lot-tile' },
          context: user ? await getLogContext(user) : {},
        })
      } else if (evt.type === 'dismiss') {
        await sequelize.query('UPDATE device_notifications SET read_at = NOW() WHERE id = :id',
          { replacements: { id: n.id } })
      }
    }
    return acked
  }

  // ---- POST /sync: one batched call per wake ----
  fastify.post('/sync', async (req: FastifyRequest<{ Body: { events?: DeviceEvent[]; telemetry?: any } }>) => {
    const device = req.device!
    const acked = await applyEvents(device, req.body?.events)
    const now = Date.now()

    const delivered = await sequelize.query<{ id: string; text: string; kind: string; deliver_at: Date }>(
      `UPDATE device_notifications SET delivered_at = NOW(), device_id = :d
       WHERE user_id = :u AND delivered_at IS NULL AND deliver_at <= NOW() + INTERVAL '30 seconds'
       RETURNING id, text, kind, deliver_at`,
      { replacements: { d: device.id, u: device.user_id }, type: QueryTypes.SELECT }
    )
    const [nextRow] = await sequelize.query<{ deliver_at: Date }>(
      `SELECT deliver_at FROM device_notifications WHERE user_id = :u AND delivered_at IS NULL
       AND deliver_at <= NOW() + INTERVAL '6 hours' ORDER BY deliver_at LIMIT 1`,
      { replacements: { u: device.user_id }, type: QueryTypes.SELECT }
    )
    let next = nextRow ? +new Date(nextRow.deliver_at) - LEAD_S * 1000 : now + MAX_SLEEP_S * 1000
    next = Math.min(Math.max(next, now + 60_000), now + MAX_SLEEP_S * 1000)

    if (req.body?.telemetry) {
      // hourly roll-up is S2; store latest reading on the device row for now
      await sequelize.query(
        'UPDATE devices SET last_seen_at = NOW(), battery_pct = :b WHERE id = :d',
        { replacements: { b: req.body.telemetry.batt ?? null, d: device.id } }
      )
    }

    return {
      now: new Date(now).toISOString(),
      notifications: delivered.map((n) => ({ id: n.id, text: n.text, kind: n.kind, at: new Date(n.deliver_at).toISOString() })),
      acked_seq: acked,
      next_wake_at: new Date(next).toISOString(),
      next_wake_epoch: Math.floor(next / 1000),
      cfg: { mode: device.mode, live: device.mode === 'live', camera: device.camera_enabled },
      ota: null,
    }
  })

  // ---- POST /events: Live-mode instant COPY ----
  fastify.post('/events', async (req: FastifyRequest<{ Body: { events?: DeviceEvent[] } }>) => {
    return { acked_seq: await applyEvents(req.device!, req.body?.events) }
  })

  // /pair/start, /pair/claim (site session), /pair/poll, /snap, /ota: S2.
}

export default deviceApiRoutes
