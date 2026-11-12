/**
 * LOT SYSTEMS CORPORATION — LOT-01 connector, Fastify integration (REFERENCE)
 * Made in the USA | brand.lot-systems.com
 *
 * NOT registered in src/server/routes/index.ts yet. To go live (roadmap P2):
 *   1. Copy device-core.mjs → src/server/utils/device-core.ts (add types).
 *   2. Add migrations: devices, device_pairing_codes, device_messages,
 *      device_message_acks, device_telemetry, device_frames (HW-06 §5).
 *   3. Implement a Sequelize store with the same methods as createMemoryStore().
 *   4. Add 'device_copy' to LogEvent in src/shared/types and render it in the Log tab.
 *   5. Register: await fastify.register(deviceRoutes, { prefix: '/api/device' })
 *      BEFORE the session-auth hook applies, because devices use Bearer tokens,
 *      not cookies. The website-side pairing route stays under /api (cookie auth).
 */
import { FastifyInstance, FastifyRequest } from 'fastify'
// @ts-ignore — reference import path until step 1 is done
import { createDeviceCore } from './device-core.mjs'

export default async function deviceRoutes(fastify: FastifyInstance, opts: { store: any }) {
  const core = createDeviceCore({
    store: opts.store,
    createLog: (entry: { userId: string; event: string; text: string; metadata: object }) =>
      (fastify as any).models.Log.create(entry),
  })

  fastify.addContentTypeParser('image/jpeg', { parseAs: 'buffer', bodyLimit: 64 * 1024 }, (_req, body, done) => done(null, body))

  const authed = async (req: FastifyRequest, reply: any) => {
    const device = await core.authenticate(req.headers.authorization)
    if (!device) { reply.status(401).send({ error: 'unauthorized' }); return null }
    return device
  }
  const out = (reply: any, r: { status: number; body: unknown }) => reply.status(r.status).send(r.body)

  fastify.post('/pair', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req: any, reply) =>
    out(reply, await core.pair({ code: req.body?.code, hwId: req.body?.hw_id, fw: req.body?.fw })))

  fastify.get('/inbox', async (req: any, reply) => {
    const d = await authed(req, reply); if (!d) return
    return out(reply, await core.inbox(d, { since: req.query?.since, hourLocal: Number(req.query?.h) }))
  })
  fastify.post('/ack', async (req: any, reply) => { const d = await authed(req, reply); if (!d) return; return out(reply, await core.ack(d, req.body || {})) })
  fastify.post('/copy', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req: any, reply) => {
    const d = await authed(req, reply); if (!d) return; return out(reply, await core.copy(d, req.body || {}))
  })
  fastify.post('/telemetry', async (req: any, reply) => { const d = await authed(req, reply); if (!d) return; return out(reply, await core.telemetry(d, req.body || {})) })
  fastify.post('/frame', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req: any, reply) => {
    const d = await authed(req, reply); if (!d) return; return out(reply, await core.frame(d, req.body, req.headers['content-type']))
  })
}

/** Website side (cookie session, mounted under /api): */
export async function devicePairingRoutes(fastify: FastifyInstance, opts: { store: any }) {
  const core = createDeviceCore({ store: opts.store, createLog: async () => ({ id: '' }) })
  fastify.post('/devices/pairing-code', async (req: any) => core.createPairingCode(req.user.id))
}
