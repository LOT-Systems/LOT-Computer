/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — the simplest member-to-member mail inside LOT Community.
 *
 *   Compose : Log  →  "/email to Hitomi. See you at the cohort walk."
 *   Deliver : Sync →  INBOX block (live via SSE 'lot_email')
 *   Connect : Cohort Dating → "Email" action on a match
 *
 * No SMTP, no external relay. Mail never leaves LOT.
 */

import { FastifyInstance, FastifyRequest } from 'fastify'
import { Op } from 'sequelize'
import { sync } from '../sync.js'
import type { LotEmailSource, PublicLotEmail } from '#shared/types'
import {
  MAX_LOT_EMAIL_LENGTH,
  LOT_EMAIL_HOURLY_LIMIT,
  parseEmailRecipient,
} from '#shared/utils/lot-email'

type MiniUser = { id: string; firstName: string | null; lastName: string | null }

const isSuspended = (tags?: string[] | null) =>
  (tags || []).some((t) => String(t).toLowerCase() === 'suspended')

const mini = (u: any): MiniUser => ({
  id: u.id,
  firstName: u.firstName ?? null,
  lastName: u.lastName ?? null,
})

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => '\\' + c)

const SOURCES: LotEmailSource[] = ['log', 'cohort', 'sync']

export function registerEmailRoutes(fastify: FastifyInstance) {
  /**
   * Resolve "Hitomi" / "Hitomi S." / "Hitomi Sato" to exactly one member.
   * Ambiguity is broken in favour of people you already correspond with;
   * otherwise the caller gets the candidate list back and must narrow it.
   */
  async function resolveRecipient(meId: string, raw: string) {
    const parsed = parseEmailRecipient(raw)
    if (!parsed) return { status: 'none' as const, candidates: [] as MiniUser[] }

    const where: any = {
      id: { [Op.ne]: meId },
      firstName: { [Op.iLike]: escapeLike(parsed.first) },
    }
    if (parsed.last) {
      where.lastName = { [Op.iLike]: escapeLike(parsed.last) + '%' }
    }
    const rows = await fastify.models.User.findAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'tags', 'lastSeenAt'],
      order: [['lastSeenAt', 'DESC NULLS LAST']],
      limit: 10,
    })
    const users = rows.filter((u) => !isSuspended(u.tags))
    if (users.length === 0) return { status: 'none' as const, candidates: [] }
    if (users.length === 1) return { status: 'ok' as const, user: mini(users[0]), candidates: [] }

    // Prefer an existing correspondent
    const ids = users.map((u) => u.id)
    const prior = await fastify.models.LotEmail.findAll({
      where: {
        [Op.or]: [
          { senderId: meId, receiverId: { [Op.in]: ids } },
          { receiverId: meId, senderId: { [Op.in]: ids } },
        ],
      },
      attributes: ['senderId', 'receiverId'],
      limit: 50,
    })
    const known = new Set(prior.map((p) => (p.senderId === meId ? p.receiverId : p.senderId)))
    const knownUsers = users.filter((u) => known.has(u.id))
    if (knownUsers.length === 1) {
      return { status: 'ok' as const, user: mini(knownUsers[0]), candidates: [] }
    }
    return { status: 'ambiguous' as const, candidates: users.map(mini) }
  }

  async function toPublic(rows: any[], meId: string): Promise<PublicLotEmail[]> {
    const ids = new Set<string>()
    rows.forEach((r) => { ids.add(r.senderId); ids.add(r.receiverId) })
    const users = await fastify.models.User.findAll({
      where: { id: { [Op.in]: [...ids] } },
      attributes: ['id', 'firstName', 'lastName'],
    })
    const byId = new Map(users.map((u) => [u.id, mini(u)]))
    const unknown = (id: string): MiniUser => ({ id, firstName: null, lastName: null })
    return rows.map((r) => ({
      id: r.id,
      body: r.body,
      source: r.source,
      isMine: r.senderId === meId,
      readAt: r.readAt ? new Date(r.readAt).toISOString() : null,
      createdAt: new Date(r.createdAt).toISOString(),
      from: byId.get(r.senderId) || unknown(r.senderId),
      to: byId.get(r.receiverId) || unknown(r.receiverId),
    }))
  }

  // Inbox + sent, newest first
  fastify.get('/emails', async (req: FastifyRequest, reply) => {
    try {
      const meId = req.user.id
      const rows = await fastify.models.LotEmail.findAll({
        where: { [Op.or]: [{ receiverId: meId }, { senderId: meId }] },
        order: [['createdAt', 'DESC']],
        limit: 50,
      })
      const unread = await fastify.models.LotEmail.count({
        where: { receiverId: meId, readAt: null },
      })
      return reply.send({ emails: await toPublic(rows, meId), unread })
    } catch (error) {
      console.error('LOT Email: list failed', error)
      return reply.status(500).send({ error: 'Email unavailable' })
    }
  })

  // Preview a recipient before sending (used by the Log EMAIL: block)
  fastify.get('/emails/resolve', async (
    req: FastifyRequest<{ Querystring: { to?: string } }>,
    reply
  ) => {
    const to = String(req.query.to || '').slice(0, 80)
    return reply.send(await resolveRecipient(req.user.id, to))
  })

  // Send
  fastify.post('/emails', async (
    req: FastifyRequest<{
      Body: { to?: string; toUserId?: string; body?: string; source?: LotEmailSource }
    }>,
    reply
  ) => {
    try {
      const me = req.user
      if (isSuspended(me.tags)) {
        return reply.status(403).send({ error: 'Account suspended' })
      }
      const body = String(req.body?.body || '').trim().slice(0, MAX_LOT_EMAIL_LENGTH)
      if (!body) return reply.status(400).send({ error: 'Message is empty' })

      const source: LotEmailSource = SOURCES.includes(req.body?.source as any)
        ? (req.body!.source as LotEmailSource)
        : 'log'

      const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const sentLastHour = await fastify.models.LotEmail.count({
        where: { senderId: me.id, createdAt: { [Op.gte]: hourAgo } },
      })
      if (sentLastHour >= LOT_EMAIL_HOURLY_LIMIT) {
        return reply.status(429).send({ error: 'Hourly email limit reached' })
      }

      let receiver: MiniUser | null = null
      if (req.body?.toUserId) {
        const u = await fastify.models.User.findByPk(req.body.toUserId, {
          attributes: ['id', 'firstName', 'lastName', 'tags'],
        })
        if (u && u.id !== me.id && !isSuspended(u.tags)) receiver = mini(u)
      } else if (req.body?.to) {
        const r = await resolveRecipient(me.id, String(req.body.to).slice(0, 80))
        if (r.status === 'ambiguous') {
          return reply.status(409).send({ error: 'More than one member', candidates: r.candidates })
        }
        if (r.status === 'ok') receiver = r.user
      }
      if (!receiver) {
        return reply.status(404).send({ error: 'No LOT member by that name' })
      }

      const row = await fastify.models.LotEmail.create({
        senderId: me.id,
        receiverId: receiver.id,
        body,
        source,
      })
      const [email] = await toPublic([row], me.id)

      sync.emit('lot_email', { senderId: me.id, receiverId: receiver.id, email })

      return reply.send(email)
    } catch (error) {
      console.error('LOT Email: send failed', error)
      return reply.status(500).send({ error: 'Email unavailable' })
    }
  })

  // Mark inbox read (all, or specific ids)
  fastify.post('/emails/read', async (
    req: FastifyRequest<{ Body: { ids?: string[] } }>,
    reply
  ) => {
    const where: any = { receiverId: req.user.id, readAt: null }
    const ids = Array.isArray(req.body?.ids) ? req.body!.ids.slice(0, 100) : null
    if (ids) where.id = { [Op.in]: ids }
    const [count] = await fastify.models.LotEmail.update({ readAt: new Date() }, { where })
    return reply.send({ marked: count })
  })
}
