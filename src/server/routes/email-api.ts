/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — the simplest operator-to-operator mail.
 *
 *   Compose  →  Log:   "/email to Hitomi" + message lines → SEND
 *   Receive  →  Sync:  MAIL block above the chat, live via SSE 'lot_email'
 *   Cohort   →  Cohort Connect "Send message" opens a letter to that member
 *
 * Routes (all under /api, authenticated):
 *   GET  /emails                    inbox (50) + sent (20) + unread count
 *   GET  /emails/recipients?q=Name  resolve a name to operators (max 5)
 *   POST /emails                    { to | receiverId, body, source }
 *   POST /emails/:id/read           mark a received letter as read
 */

import { FastifyInstance, FastifyRequest } from 'fastify'
import { Op } from 'sequelize'
import { sync } from '../sync.js'
import { LOT_EMAIL_MAX_LENGTH, LOT_EMAIL_HOURLY_LIMIT } from '#shared/constants'

type Candidate = { id: string; firstName: string | null; lastName: string | null; city: string | null }

const isSuspended = (tags?: string[] | null) =>
  (tags || []).some((t) => String(t).toLowerCase() === 'suspended')

const fullName = (u: { firstName?: string | null; lastName?: string | null }) =>
  `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Operator'

/**
 * Resolve a free-text name ("Hitomi", "Hitomi Tanaka") to operators.
 * Exact full-name matches rank first, then exact first-name, then prefix;
 * ties broken by most recently seen. Suspended operators and self excluded.
 */
async function resolveRecipients(
  fastify: FastifyInstance,
  meId: string,
  rawQuery: string
): Promise<{ candidates: Candidate[]; exact: Candidate[] }> {
  const q = rawQuery.replace(/^@/, '').replace(/\s+/g, ' ').trim()
  if (q.length < 2) return { candidates: [], exact: [] }
  const [first, ...rest] = q.split(' ')
  const last = rest.join(' ')

  const where: any = {
    id: { [Op.ne]: meId },
    [Op.or]: last
      ? [{ firstName: { [Op.iLike]: first }, lastName: { [Op.iLike]: `${last}%` } }]
      : [{ firstName: { [Op.iLike]: `${first}%` } }, { lastName: { [Op.iLike]: first } }],
  }

  const users = await fastify.models.User.findAll({
    where,
    attributes: ['id', 'firstName', 'lastName', 'city', 'tags', 'lastSeenAt'],
    order: [['lastSeenAt', 'DESC NULLS LAST']],
    limit: 20,
  })

  const lc = q.toLowerCase()
  const score = (u: any) => {
    if (fullName(u).toLowerCase() === lc) return 0
    if ((u.firstName || '').toLowerCase() === lc) return 1
    return 2
  }
  const ranked = users
    .filter((u: any) => !isSuspended(u.tags))
    .sort((a: any, b: any) => score(a) - score(b))
  const toCandidate = (u: any): Candidate => ({
    id: u.id, firstName: u.firstName, lastName: u.lastName, city: u.city,
  })
  const best = ranked.length ? score(ranked[0]) : 3
  return {
    candidates: ranked.slice(0, 5).map(toCandidate),
    exact: ranked.filter((u: any) => score(u) === best && best < 2).map(toCandidate),
  }
}

function serialize(e: any, people: Record<string, any>, meId: string) {
  const sender = people[e.senderId]
  const receiver = people[e.receiverId]
  return {
    id: e.id,
    body: e.body,
    source: e.source,
    createdAt: e.createdAt,
    readAt: e.readAt,
    isMine: e.senderId === meId,
    from: sender ? { id: sender.id, firstName: sender.firstName, lastName: sender.lastName } : null,
    to: receiver ? { id: receiver.id, firstName: receiver.firstName, lastName: receiver.lastName } : null,
  }
}

export function registerEmailRoutes(fastify: FastifyInstance) {
  fastify.get('/emails', async (req, reply) => {
    try {
      const meId = req.user.id
      const [inbox, sent, unread] = await Promise.all([
        fastify.models.LotEmail.findAll({ where: { receiverId: meId }, order: [['createdAt', 'DESC']], limit: 50 }),
        fastify.models.LotEmail.findAll({ where: { senderId: meId }, order: [['createdAt', 'DESC']], limit: 20 }),
        fastify.models.LotEmail.count({ where: { receiverId: meId, readAt: null } }),
      ])
      const ids = Array.from(new Set([...inbox, ...sent].flatMap((e) => [e.senderId, e.receiverId])))
      const users = ids.length
        ? await fastify.models.User.findAll({ where: { id: ids }, attributes: ['id', 'firstName', 'lastName', 'tags'] })
        : []
      const people: Record<string, any> = {}
      users.forEach((u: any) => { people[u.id] = u })
      return {
        inbox: inbox
          .filter((e) => !isSuspended(people[e.senderId]?.tags))
          .map((e) => serialize(e, people, meId)),
        sent: sent.map((e) => serialize(e, people, meId)),
        unread,
      }
    } catch (err: any) {
      console.error('LOT Email: inbox failed:', err?.message)
      return { inbox: [], sent: [], unread: 0, error: 'MAIL OFFLINE' }
    }
  })

  fastify.get('/emails/recipients', async (req: FastifyRequest<{ Querystring: { q?: string } }>, reply) => {
    try {
      const { candidates } = await resolveRecipients(fastify, req.user.id, String(req.query.q || ''))
      return { candidates }
    } catch (err: any) {
      console.error('LOT Email: resolve failed:', err?.message)
      return { candidates: [] }
    }
  })

  fastify.post('/emails', async (req: FastifyRequest<{
    Body: { to?: string; receiverId?: string; body?: string; source?: string }
  }>, reply) => {
    if (isSuspended(req.user.tags)) {
      return reply.status(403).send({ error: 'ACCOUNT SUSPENDED' })
    }
    const body = String(req.body?.body || '').trim()
    if (!body) return reply.status(400).send({ error: 'EMPTY LETTER' })
    if (body.length > LOT_EMAIL_MAX_LENGTH) {
      return reply.status(400).send({ error: `LETTER EXCEEDS ${LOT_EMAIL_MAX_LENGTH} CHARACTERS` })
    }
    const source = ['log', 'sync', 'cohort'].includes(String(req.body?.source)) ? String(req.body?.source) : 'log'

    try {
      const sentLastHour = await fastify.models.LotEmail.count({
        where: { senderId: req.user.id, createdAt: { [Op.gte]: new Date(Date.now() - 3600e3) } },
      })
      if (sentLastHour >= LOT_EMAIL_HOURLY_LIMIT) {
        return reply.status(429).send({ error: 'RATE LIMIT — TRY AGAIN WITHIN THE HOUR' })
      }

      let receiver: any = null
      if (req.body?.receiverId) {
        receiver = await fastify.models.User.findByPk(req.body.receiverId, {
          attributes: ['id', 'firstName', 'lastName', 'tags'],
        })
      } else if (req.body?.to) {
        const { candidates, exact } = await resolveRecipients(fastify, req.user.id, req.body.to)
        const pool = exact.length ? exact : candidates
        if (pool.length > 1) {
          return reply.status(409).send({ error: 'MULTIPLE OPERATORS MATCH', candidates: pool.slice(0, 5) })
        }
        if (pool.length === 1) receiver = pool[0]
      }
      if (!receiver || receiver.id === req.user.id || isSuspended(receiver.tags)) {
        return reply.status(404).send({ error: 'NO OPERATOR FOUND' })
      }

      const email = await fastify.models.LotEmail.create({
        senderId: req.user.id,
        receiverId: receiver.id,
        body,
        source,
      } as any)

      const payload = {
        id: email.id,
        body: email.body,
        source: email.source,
        createdAt: email.createdAt,
        readAt: null,
        isMine: false,
        receiverId: receiver.id,
        from: { id: req.user.id, firstName: req.user.firstName, lastName: req.user.lastName },
        to: { id: receiver.id, firstName: receiver.firstName, lastName: receiver.lastName },
      }
      sync.emit('lot_email', payload)

      return { ...payload, isMine: true }
    } catch (err: any) {
      console.error('LOT Email: send failed:', err?.message)
      return reply.status(500).send({ error: 'MAIL OFFLINE' })
    }
  })

  fastify.post('/emails/:id/read', async (req: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const [count] = await fastify.models.LotEmail.update(
        { readAt: new Date() },
        { where: { id: req.params.id, receiverId: req.user.id, readAt: null } }
      )
      return { ok: true, updated: count }
    } catch (err: any) {
      console.error('LOT Email: mark read failed:', err?.message)
      return reply.status(500).send({ error: 'MAIL OFFLINE' })
    }
  })
}
