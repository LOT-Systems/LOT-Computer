/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / Basics API
 * POST /api/basics/subscribe  — OPEN TAB → PENDING
 * POST /api/basics/stand-down — ON_STRENGTH | STEADY_STATE → STAND_DOWN
 * GET  /api/basics/status     — current subscription state + issue log
 */

import { FastifyInstance, FastifyRequest } from 'fastify'
import { RationSubscription, RationStatus } from '#server/models/ration-subscription.js'

type SubscribeBody = {
  shippingLine1: string
  shippingLine2?: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  clothingSize: string
}

function nextFirstOfMonth(): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return d.toISOString().slice(0, 10)
}

function formatDate(d: string | null | undefined): string | null {
  return d ?? null
}

export default async (fastify: FastifyInstance) => {
  // GET /api/basics/status
  fastify.get('/status', async (req: FastifyRequest, reply) => {
    const sub = await RationSubscription.findOne({ where: { userId: req.user.id } })

    if (!sub) {
      return reply.send({ status: 'OPEN_TAB', issueCount: 0, nextIssueDate: null, roster: null })
    }

    return reply.send({
      status:        sub.status,
      issueCount:    sub.issueCount,
      lastIssueDate: formatDate(sub.lastIssueDate),
      nextIssueDate: formatDate(sub.nextIssueDate),
      subscribedAt:  sub.subscribedAt,
      standDownAt:   sub.standDownAt,
      roster: {
        shippingLine1: sub.shippingLine1,
        shippingLine2: sub.shippingLine2,
        shippingCity:  sub.shippingCity,
        shippingState: sub.shippingState,
        shippingZip:   sub.shippingZip,
        clothingSize:  sub.clothingSize,
      },
    })
  })

  // POST /api/basics/subscribe
  fastify.post<{ Body: SubscribeBody }>('/subscribe', async (req: FastifyRequest<{ Body: SubscribeBody }>, reply) => {
    const { shippingLine1, shippingLine2, shippingCity, shippingState, shippingZip, clothingSize } = req.body

    if (!shippingLine1 || !shippingCity || !shippingState || !shippingZip || !clothingSize) {
      return reply.code(400).send({ error: 'MISSING_FIELDS', message: 'All shipping fields and clothing size are required.' })
    }

    const existing = await RationSubscription.findOne({ where: { userId: req.user.id } })

    if (existing && (existing.status === 'PENDING' || existing.status === 'ON_STRENGTH' || existing.status === 'STEADY_STATE')) {
      return reply.code(409).send({ error: 'ALREADY_ON_STRENGTH', message: 'Subscription already active.' })
    }

    // Billing — additive $100/mo to existing Usership AI plan.
    // Real Stripe subscription item creation happens here when STRIPE_SECRET_KEY is set.
    let stripeSubscriptionItemId: string | null = null
    if (process.env.STRIPE_SECRET_KEY && req.user.stripeCustomerId) {
      try {
        const stripe = (await import('stripe')).default
        const client = new stripe(process.env.STRIPE_SECRET_KEY)
        const item = await client.subscriptionItems.create({
          subscription: req.user.stripeCustomerId,
          price_data: {
            currency: 'usd',
            product_data: { name: 'LOT BASICS / Ration Subscription' },
            recurring: { interval: 'month' },
            unit_amount: 10000,
          },
        })
        stripeSubscriptionItemId = item.id
      } catch (err: any) {
        fastify.log.warn('[basics] Stripe billing skipped:', err.message)
      }
    } else {
      fastify.log.info('[basics] STRIPE_SECRET_KEY not set — subscription recorded without billing.')
    }

    const nextIssue = nextFirstOfMonth()

    if (existing) {
      await existing.update({
        status:       'PENDING',
        shippingLine1,
        shippingLine2: shippingLine2 || null,
        shippingCity,
        shippingState,
        shippingZip,
        clothingSize,
        stripeSubscriptionItemId,
        nextIssueDate: nextIssue,
        subscribedAt:  new Date(),
        standDownAt:   null,
      })
    } else {
      await RationSubscription.create({
        userId:        req.user.id,
        status:        'PENDING',
        shippingLine1,
        shippingLine2: shippingLine2 || null,
        shippingCity,
        shippingState,
        shippingZip,
        clothingSize,
        stripeSubscriptionItemId,
        issueCount:    0,
        lastIssueDate: null,
        nextIssueDate: nextIssue,
        subscribedAt:  new Date(),
        standDownAt:   null,
      })
    }

    return reply.send({ status: 'PENDING', nextIssueDate: nextIssue })
  })

  // POST /api/basics/stand-down
  fastify.post('/stand-down', async (req: FastifyRequest, reply) => {
    const sub = await RationSubscription.findOne({ where: { userId: req.user.id } })

    if (!sub || sub.status === 'STAND_DOWN' || sub.status === 'PENDING' && sub.issueCount === 0) {
      return reply.code(400).send({ error: 'NOT_ON_STRENGTH', message: 'No active ration subscription.' })
    }

    // Cancel the Stripe subscription item if present
    if (sub.stripeSubscriptionItemId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = (await import('stripe')).default
        const client = new stripe(process.env.STRIPE_SECRET_KEY)
        await client.subscriptionItems.del(sub.stripeSubscriptionItemId, { proration_behavior: 'none' })
      } catch (err: any) {
        fastify.log.warn('[basics] Stripe cancellation error:', err.message)
      }
    }

    await sub.update({ status: 'STAND_DOWN', standDownAt: new Date(), nextIssueDate: null })

    // AI plan (Usership tag) is explicitly retained — no tag change here.
    return reply.send({ status: 'STAND_DOWN' })
  })
}
