/**
 * LOT SYSTEMS CORPORATION
 * LOT-FM-001 / BASIC RATION MODULE — API (registered under /api, auth required)
 *
 *   GET  /basics                    own record + NEXT ISSUE card
 *   POST /basics/upgrade|roster|stand-down
 *   GET  /basics/admin/queue        admin: operators ON STRENGTH, due flag, card
 *   POST /basics/admin/dispatch     admin: { userId, tracking } -> advance NEXT ISSUE
 *   GET  /basics/admin/envelope     admin: COGS envelope (COGS never leaves server otherwise)
 *
 * Record lives in user.metadata.basics. Billing is LEDGERED only: no payment
 * processor is connected, nothing is charged.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify'
import {
  applyEvent, baselineState, normalizeRecord, validateRoster,
  type BasicRecord, type RationEvent,
} from '#shared/basics/engine'
import { manifestCard } from '#shared/basics/card'
import { envelope } from '#server/basics/cogs'

const hasUsership = (req: FastifyRequest) =>
  req.user.tags.some((t) => t.toLowerCase() === 'usership')

const load = (user: FastifyRequest['user']): BasicRecord =>
  normalizeRecord(
    (user.metadata as any)?.basics,
    baselineState(user.tags.some((t) => t.toLowerCase() === 'usership'))
  )

const save = async (user: FastifyRequest['user'], record: BasicRecord) => {
  await user.set({ metadata: { ...(user.metadata || {}), basics: record } }).save()
}

/** Card for the issue that will ship next, or null when nothing is scheduled. */
const nextCard = (r: BasicRecord): string | null =>
  r.roster && r.nextIssue
    ? manifestCard({
        issue: r.issuesDispatched + 1,
        due: r.nextIssue,
        roster: r.roster,
        next: r.nextIssue,
      })
    : null

const view = (r: BasicRecord) => ({ basic: r, card: nextCard(r) })

export default async (fastify: FastifyInstance) => {
  fastify.get('/basics', async (req) => view(load(req.user)))

  const event = (path: string, ev: RationEvent) =>
    fastify.post(`/basics/${path}`, async (req: FastifyRequest<{ Body: any }>, reply) => {
      const rec = load(req.user)
      let roster
      if (ev === 'ROSTER_COMPLETE') {
        const v = validateRoster(req.body ?? {})
        if (!v.ok) return reply.status(400).send({ ok: false, errors: v.errors })
        roster = v.roster
      }
      const r = applyEvent(rec, ev, { now: new Date(), hasUsership: hasUsership(req), roster })
      if (!r.ok) return reply.status(409).send({ ok: false, error: r.error, ...view(rec) })
      await save(req.user, r.record)
      return { ok: true, ...view(r.record) }
    })

  event('upgrade', 'UPGRADE')
  event('roster', 'ROSTER_COMPLETE')
  event('stand-down', 'STAND_DOWN')

  // ── admin: fulfillment ──────────────────────────────────────────────────────
  const adminOnly = async (req: FastifyRequest, reply: any) => {
    if (!req.user.isAdmin()) return reply.status(403).send({ ok: false, error: 'S-2 ONLY' })
  }

  fastify.get('/basics/admin/queue', { preHandler: adminOnly }, async () => {
    const users = await fastify.models.User.findAll()
    const today = new Date().toISOString().slice(0, 10)
    return users
      .map((u: any) => ({ u, r: load(u) }))
      .filter(({ r }) => r.state === 'ON_STRENGTH' || r.state === 'STEADY_STATE')
      .map(({ u, r }) => ({
        userId: u.id,
        issue: r.issuesDispatched + 1,
        nextIssue: r.nextIssue,
        due: !!r.nextIssue && r.nextIssue <= today,
        card: nextCard(r),
      }))
      .sort((a, b) => String(a.nextIssue).localeCompare(String(b.nextIssue)))
  })

  fastify.post<{ Body: { userId?: string; tracking?: string } }>(
    '/basics/admin/dispatch',
    { preHandler: adminOnly },
    async (req, reply) => {
      const { userId, tracking } = req.body ?? {}
      const user = userId ? await fastify.models.User.findByPk(userId) : null
      if (!user) return reply.status(404).send({ ok: false, error: 'OPERATOR NOT FOUND' })
      const rec = load(user as any)
      const r = applyEvent(rec, 'ISSUE_DISPATCHED', {
        now: new Date(), hasUsership: true, tracking,
      })
      if (!r.ok) return reply.status(409).send({ ok: false, error: r.error })
      await save(user as any, r.record)
      return { ok: true, basic: r.record }
    }
  )

  fastify.get('/basics/admin/envelope', { preHandler: adminOnly }, async () => envelope())
}
