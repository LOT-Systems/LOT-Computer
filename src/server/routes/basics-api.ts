/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / Basics API
 *
 * GET  /api/basics/status             — current subscription state + issue log
 * POST /api/basics/subscribe          — OPEN_TAB → PENDING
 * POST /api/basics/stand-down         — ON_STRENGTH | STEADY_STATE → STAND_DOWN
 * POST /api/basics/dispatch           — (admin) schedule + dispatch next issue
 * GET  /api/basics/manifest-card/:id  — printable manifest HTML for an issue
 */

import { FastifyInstance, FastifyRequest } from 'fastify'
import { RationSubscription } from '#server/models/ration-subscription.js'
import { RationIssue } from '#server/models/ration-issue.js'
import { computeIssueLoad, nextScheduledDate, verifyMarginOrThrow, COGS_CEILING_USD } from '#server/utils/issue-engine.js'
import { RATION_MANIFEST } from '#client/components/Basics/rationManifest.js'

type SubscribeBody = {
  shippingLine1: string
  shippingLine2?: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  clothingSize: string
}

function firstOfNextMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10)
}

export default async (fastify: FastifyInstance) => {

  // ── GET /api/basics/status ─────────────────────────────────────────────────
  fastify.get('/status', async (req: FastifyRequest, reply) => {
    const sub = await RationSubscription.findOne({ where: { userId: req.user.id } })

    if (!sub) {
      return reply.send({ status: 'OPEN_TAB', issueCount: 0, nextIssueDate: null, roster: null, issues: [] })
    }

    const issues = await RationIssue.findAll({
      where:   { subscriptionId: sub.id },
      order:   [['issueNumber', 'DESC']],
      limit:   12,
    })

    return reply.send({
      status:        sub.status,
      issueCount:    sub.issueCount,
      lastIssueDate: sub.lastIssueDate ?? null,
      nextIssueDate: sub.nextIssueDate ?? null,
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
      issues: issues.map((i) => ({
        id:          i.id,
        no:          i.issueNumber,
        date:        i.scheduledDate,
        status:      i.status,
        items:       (i.loadSummary as string[]).length,
        cogsTotal:   Number(i.cogsTotal),
        marginPct:   Number(i.marginPct),
        trackingCode: i.trackingCode,
        dispatchedAt: i.dispatchedAt,
      })),
    })
  })

  // ── POST /api/basics/subscribe ─────────────────────────────────────────────
  fastify.post<{ Body: SubscribeBody }>('/subscribe', async (req: FastifyRequest<{ Body: SubscribeBody }>, reply) => {
    const { shippingLine1, shippingLine2, shippingCity, shippingState, shippingZip, clothingSize } = req.body

    if (!shippingLine1 || !shippingCity || !shippingState || !shippingZip || !clothingSize) {
      return reply.code(400).send({ error: 'MISSING_FIELDS', message: 'All shipping fields and clothing size are required.' })
    }

    const existing = await RationSubscription.findOne({ where: { userId: req.user.id } })

    if (existing && (existing.status === 'PENDING' || existing.status === 'ON_STRENGTH' || existing.status === 'STEADY_STATE')) {
      return reply.code(409).send({ error: 'ALREADY_ON_STRENGTH', message: 'Subscription already active.' })
    }

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

    const nextIssue = firstOfNextMonth()

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

  // ── POST /api/basics/stand-down ────────────────────────────────────────────
  fastify.post('/stand-down', async (req: FastifyRequest, reply) => {
    const sub = await RationSubscription.findOne({ where: { userId: req.user.id } })

    if (!sub || sub.status === 'STAND_DOWN') {
      return reply.code(400).send({ error: 'NOT_ON_STRENGTH', message: 'No active ration subscription.' })
    }

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
    return reply.send({ status: 'STAND_DOWN' })
  })

  // ── POST /api/basics/dispatch ──────────────────────────────────────────────
  // Admin-only: schedules and marks a ration issue as dispatched.
  // Validates COGS ceiling before dispatching. Advances subscriber state.
  fastify.post<{ Body: { userId: string; trackingCode?: string } }>(
    '/dispatch',
    async (req: FastifyRequest<{ Body: { userId: string; trackingCode?: string } }>, reply) => {
      if (!req.user.isAdmin()) {
        return reply.code(403).send({ error: 'FORBIDDEN' })
      }

      const { userId, trackingCode } = req.body
      if (!userId) return reply.code(400).send({ error: 'userId required' })

      const sub = await RationSubscription.findOne({ where: { userId } })
      if (!sub || (sub.status !== 'PENDING' && sub.status !== 'ON_STRENGTH' && sub.status !== 'STEADY_STATE')) {
        return reply.code(404).send({ error: 'SUBSCRIPTION_NOT_ACTIVE' })
      }

      const issueNumber  = sub.issueCount + 1
      const scheduledDate = nextScheduledDate()
      const load         = computeIssueLoad(issueNumber, scheduledDate)

      // Hard stop if margin breach
      try {
        verifyMarginOrThrow(load)
      } catch (err: any) {
        fastify.log.error('[basics/dispatch] MARGIN BREACH — dispatch aborted:', err.message)
        return reply.code(422).send({ error: 'MARGIN_BREACH', message: err.message })
      }

      const issue = await RationIssue.create({
        subscriptionId: sub.id,
        userId,
        issueNumber,
        status:        'DISPATCHED',
        scheduledDate: load.scheduledDate,
        dispatchedAt:  new Date(),
        trackingCode:  trackingCode || null,
        loadSummary:   load.itemNos,
        cogsTotal:     load.cogsTotal,
        marginPct:     load.marginPct,
      })

      const newStatus = issueNumber === 1 ? 'ON_STRENGTH' : 'STEADY_STATE'
      await sub.update({
        status:        newStatus,
        issueCount:    issueNumber,
        lastIssueDate: load.scheduledDate,
        nextIssueDate: nextScheduledDate(scheduledDate).toISOString().slice(0, 10),
      })

      fastify.log.info(
        `[basics/dispatch] Issue #${issueNumber} dispatched for user ${userId}. ` +
        `COGS $${load.cogsTotal}, margin ${(load.marginPct * 100).toFixed(1)}%`
      )

      return reply.send({
        issueId:     issue.id,
        issueNumber,
        status:      newStatus,
        cogsTotal:   load.cogsTotal,
        marginPct:   load.marginPct,
        meetsFloor:  load.meetsFloor,
        itemCount:   load.items.length,
        scheduledDate: load.scheduledDate,
      })
    }
  )

  // ── GET /api/basics/manifest-card/:issueId ─────────────────────────────────
  // Returns a printable HTML manifest card for an issue.
  fastify.get<{ Params: { issueId: string } }>(
    '/manifest-card/:issueId',
    async (req: FastifyRequest<{ Params: { issueId: string } }>, reply) => {
      const issue = await RationIssue.findOne({
        where: { id: req.params.issueId, userId: req.user.id },
      })

      if (!issue) return reply.code(404).send({ error: 'NOT_FOUND' })

      const sub = await RationSubscription.findOne({ where: { id: issue.subscriptionId } })
      const itemNos = (issue.loadSummary as string[])
      const items   = RATION_MANIFEST.filter((i) => itemNos.includes(i.no))

      const pad = (n: number) => String(n).padStart(2, '0')
      const d = new Date(issue.scheduledDate)
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

      const itemRows = items.map((item, idx) =>
        `<tr>
          <td>${item.no}</td>
          <td>${item.nomenclature}</td>
          <td>${item.cadence}</td>
        </tr>`
      ).join('\n')

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>LOT BASICS / MANIFEST CARD / ISSUE #${issue.issueNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Liberation Mono', 'Courier New', Courier, monospace;
    font-size: 11pt;
    color: #000;
    background: #fff;
    padding: 24pt;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .header { border: 2px solid #000; padding: 8pt 12pt; margin-bottom: 8pt; display: flex; justify-content: space-between; background: #000; color: #fff; font-weight: bold; }
  .field-row { display: flex; border-bottom: 1px solid #000; padding: 3pt 0; }
  .field-label { width: 160pt; flex-shrink: 0; opacity: 0.6; }
  .field-value { font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
  th { background: #000; color: #fff; padding: 4pt 8pt; text-align: left; font-weight: bold; letter-spacing: 0.06em; }
  td { padding: 3pt 8pt; border-bottom: 1px solid #000; }
  tr:nth-child(even) td { background: #f9f9f9; }
  .footer { border-top: 2px solid #000; padding: 4pt 0; opacity: 0.45; font-size: 9pt; }
  @media print { body { padding: 8pt; } }
</style>
</head>
<body>
<div class="header">
  <span>LOT BASICS / LOT-FM-001 / MANIFEST CARD</span>
  <span>ISSUE #${String(issue.issueNumber).padStart(3, '0')}</span>
</div>

<div style="margin-bottom:8pt;">
  <div class="field-row"><span class="field-label">ISSUE DATE</span><span class="field-value">${dateStr}</span></div>
  <div class="field-row"><span class="field-label">STATUS</span><span class="field-value">${issue.status}</span></div>
  ${issue.trackingCode ? `<div class="field-row"><span class="field-label">TRACKING</span><span class="field-value">${issue.trackingCode}</span></div>` : ''}
  ${sub ? `<div class="field-row"><span class="field-label">SHIP TO</span><span class="field-value">${sub.shippingLine1}${sub.shippingLine2 ? ', ' + sub.shippingLine2 : ''}, ${sub.shippingCity}, ${sub.shippingState} ${sub.shippingZip}</span></div>` : ''}
  <div class="field-row"><span class="field-label">ITEMS IN LOAD</span><span class="field-value">${items.length} OF 23</span></div>
</div>

<table>
  <thead>
    <tr><th>NO.</th><th>NOMENCLATURE</th><th>CADENCE</th></tr>
  </thead>
  <tbody>
    ${itemRows}
  </tbody>
</table>

<div class="footer">
  LOT SYSTEMS CORPORATION — LOT® FOUNDED 7 APRIL 2016 — MADE IN THE USA<br>
  LEDGER IS THE MARKETING. NO LAYER BETWEEN SUBSCRIBER AND MANIFEST.
</div>
</body>
</html>`

      return reply.type('text/html').send(html)
    }
  )
}
