/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * LOT® Founded 7 April 2016 | Made in the USA
 *
 * LOT-FM-001 / Basics API — mounted at /api/basics behind the user auth hook.
 *
 * MEMBER
 *   GET  /status                 — state + issue log (COGS/margin withheld)
 *   POST /subscribe              — USERSHIP/AI | STAND_DOWN → PENDING (roster intake)
 *   POST /stand-down             — PENDING | ON_STRENGTH | STEADY_STATE → STAND_DOWN
 *   GET  /manifest-card/:issueId — printable manifest card (own issues only)
 *
 * QUARTERMASTER (admin)
 *   GET  /envelope               — 12-issue COGS envelope vs USD 40 ceiling
 *   GET  /roster                 — all subscriptions
 *   POST /dispatch               — issue next ration (margin + quote gate)
 *   POST /issues/:id/advance     — DISPATCHED → IN_TRANSIT → DELIVERED
 */

import { FastifyInstance, FastifyRequest } from 'fastify'
import { RationSubscription } from '#server/models/ration-subscription.js'
import { RationIssue, RationIssueStatus } from '#server/models/ration-issue.js'
import { computeIssueLoad, verifyMarginOrThrow, envelopeReport } from '#server/utils/issue-engine.js'
import { unquotedLines } from '#server/utils/ration-cogs.js'
import { RATION_MANIFEST, firstOfNextMonth } from '#shared/basics'

type SubscribeBody = {
  shippingLine1: string
  shippingLine2?: string | null
  shippingCity: string
  shippingState: string
  shippingZip: string
  clothingSize: string
}

const SIZES = new Set(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'])
const ACTIVE = new Set(['PENDING', 'ON_STRENGTH', 'STEADY_STATE'])
const NEXT_ISSUE_STATUS: Partial<Record<RationIssueStatus, RationIssueStatus>> = {
  SCHEDULED: 'DISPATCHED',
  DISPATCHED: 'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

const clean = (s: unknown, max: number) =>
  typeof s === 'string' ? s.trim().toUpperCase().slice(0, max) : ''

function isEligible(user: any): boolean {
  return (
    user.isAdmin() ||
    (Array.isArray(user.tags) && user.tags.some((t: string) => t.toLowerCase() === 'usership'))
  )
}

export default async (fastify: FastifyInstance) => {
  // ── GET /status ─────────────────────────────────────────────────────────────
  fastify.get('/status', async (req: FastifyRequest, reply) => {
    const eligible = isEligible(req.user)
    const sub = await RationSubscription.findOne({ where: { userId: req.user.id } })

    if (!sub) {
      return reply.send({
        status: 'OPEN_TAB', eligible, billing: 'NONE', issueCount: 0,
        lastIssueDate: null, nextIssueDate: null, subscribedAt: null,
        standDownAt: null, roster: null, issues: [],
      })
    }

    const issues = await RationIssue.findAll({
      where: { subscriptionId: sub.id },
      order: [['issueNumber', 'DESC']],
      limit: 24,
    })

    return reply.send({
      status: sub.status,
      eligible,
      billing: !ACTIVE.has(sub.status) ? 'NONE' : sub.billingRef ? 'ACTIVE' : 'AWAITING_PROVIDER',
      issueCount: sub.issueCount,
      lastIssueDate: sub.lastIssueDate ?? null,
      nextIssueDate: sub.nextIssueDate ?? null,
      subscribedAt: sub.subscribedAt,
      standDownAt: sub.standDownAt,
      roster: {
        shippingLine1: sub.shippingLine1,
        shippingLine2: sub.shippingLine2,
        shippingCity: sub.shippingCity,
        shippingState: sub.shippingState,
        shippingZip: sub.shippingZip,
        clothingSize: sub.clothingSize,
      },
      // COGS + margin withheld from the member view.
      issues: issues.map((i) => ({
        id: i.id,
        no: i.issueNumber,
        date: i.scheduledDate,
        status: i.status,
        items: (i.loadSummary as string[]).length,
        trackingCode: i.trackingCode,
        dispatchedAt: i.dispatchedAt,
      })),
    })
  })

  // ── POST /subscribe ─────────────────────────────────────────────────────────
  fastify.post<{ Body: SubscribeBody }>('/subscribe', async (req, reply) => {
    if (!isEligible(req.user)) {
      return reply.code(403).send({ error: 'NOT_ELIGIBLE', message: 'Upgrade requires Usership (AI plan).' })
    }

    const b = req.body || ({} as SubscribeBody)
    const roster = {
      shippingLine1: clean(b.shippingLine1, 255),
      shippingLine2: clean(b.shippingLine2, 255) || null,
      shippingCity: clean(b.shippingCity, 100),
      shippingState: clean(b.shippingState, 10),
      shippingZip: clean(b.shippingZip, 20),
      clothingSize: clean(b.clothingSize, 10),
    }

    if (!roster.shippingLine1 || !roster.shippingCity || !roster.shippingState || !roster.shippingZip) {
      return reply.code(400).send({ error: 'MISSING_FIELDS', message: 'Shipping address incomplete.' })
    }
    if (!SIZES.has(roster.clothingSize)) {
      return reply.code(400).send({ error: 'BAD_SIZE', message: 'Clothing size not on the chart.' })
    }

    const existing = await RationSubscription.findOne({ where: { userId: req.user.id } })
    if (existing && ACTIVE.has(existing.status)) {
      return reply.code(409).send({ error: 'ALREADY_ON_STRENGTH', message: 'Already on strength.' })
    }

    // Billing: no payment provider is wired in this codebase yet. The roster
    // is recorded with billingRef = null (AWAITING_PROVIDER). Quartermaster
    // must not dispatch until billing is ACTIVE — see /dispatch gate.
    const nextIssueDate = firstOfNextMonth()
    const fields = {
      ...roster,
      status: 'PENDING' as const,
      billingRef: null,
      nextIssueDate,
      subscribedAt: new Date(),
      standDownAt: null,
    }

    if (existing) {
      await existing.update(fields)
    } else {
      await RationSubscription.create({
        ...fields,
        userId: req.user.id,
        issueCount: 0,
        lastIssueDate: null,
      })
    }

    return reply.send({ status: 'PENDING', nextIssueDate })
  })

  // ── POST /stand-down ────────────────────────────────────────────────────────
  fastify.post('/stand-down', async (req: FastifyRequest, reply) => {
    const sub = await RationSubscription.findOne({ where: { userId: req.user.id } })
    if (!sub || !ACTIVE.has(sub.status)) {
      return reply.code(400).send({ error: 'NOT_ON_STRENGTH', message: 'No active ration.' })
    }
    // Ration drops; Usership tag (AI plan) is untouched.
    await sub.update({ status: 'STAND_DOWN', standDownAt: new Date(), nextIssueDate: null, billingRef: null })
    return reply.send({ status: 'STAND_DOWN' })
  })

  // ── GET /manifest-card/:issueId ─────────────────────────────────────────────
  fastify.get<{ Params: { issueId: string } }>('/manifest-card/:issueId', async (req, reply) => {
    const where: any = { id: req.params.issueId }
    if (!req.user.isAdmin()) where.userId = req.user.id
    const issue = await RationIssue.findOne({ where })
    if (!issue) return reply.code(404).send({ error: 'NOT_FOUND' })

    const sub = await RationSubscription.findOne({ where: { id: issue.subscriptionId } })
    const itemNos = issue.loadSummary as string[]
    const items = RATION_MANIFEST.filter((i) => itemNos.includes(i.no))
    const no = String(issue.issueNumber).padStart(3, '0')

    const rows = items
      .map((i) => `<tr><td>${esc(i.no)}</td><td>${esc(i.nomenclature)}</td><td>${esc(i.cadence)}</td><td class="chk">[ ]</td></tr>`)
      .join('\n')

    const shipTo = sub
      ? [sub.shippingLine1, sub.shippingLine2, `${sub.shippingCity}, ${sub.shippingState} ${sub.shippingZip}`]
          .filter(Boolean)
          .map(esc)
          .join('<br>')
      : '—'

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LOT BASICS / MANIFEST CARD / ISSUE ${no}</title>
<style nonce="${reply.cspNonce?.style ?? ''}">
*{margin:0;padding:0;box-sizing:border-box;border-radius:0}
body{font-family:'Liberation Mono','Courier New',monospace;font-weight:700;font-size:11pt;line-height:1.5;color:#000;background:#fff;padding:16pt;text-transform:uppercase}
.card{border:2px solid #000;max-width:80ch}
.inv{background:#000;color:#fff;padding:4pt 1ch;display:flex;justify-content:space-between;gap:2ch}
.row{display:flex;gap:2ch;padding:3pt 1ch;border-bottom:2px solid #000}
.row span:first-child{min-width:20ch}
table{width:100%;border-collapse:collapse}
th{background:#000;color:#fff;text-align:left;padding:3pt 1ch}
td{padding:3pt 1ch;border-bottom:2px solid #000;vertical-align:top}
td.chk,th.chk{text-align:right;width:6ch}
@media print{body{padding:0}}
</style></head><body><div class="card">
<div class="inv"><span>LOT® BASICS / LOT-FM-001 / MANIFEST CARD</span><span>ISSUE ${no}</span></div>
<div class="row"><span>ISSUE DATE</span><span>${esc(issue.scheduledDate)}</span></div>
<div class="row"><span>STATUS</span><span>${esc(issue.status)}</span></div>
${issue.trackingCode ? `<div class="row"><span>TRACKING</span><span>${esc(issue.trackingCode)}</span></div>` : ''}
<div class="row"><span>SHIP TO</span><span>${shipTo}</span></div>
<div class="row"><span>SIZE</span><span>${esc(sub?.clothingSize ?? '—')}</span></div>
<div class="row"><span>LOAD</span><span>${items.length} OF ${RATION_MANIFEST.length}</span></div>
<table><thead><tr><th>NO.</th><th>NOMENCLATURE</th><th>CADENCE</th><th class="chk">CHK</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="inv"><span>LOT ISSUES. LOT DOES NOT SELL. THE MEMBER IS ON STRENGTH.</span></div>
</div></body></html>`

    return reply.type('text/html').send(html)
  })

  // ═════════════════════════ QUARTERMASTER (ADMIN) ═══════════════════════════

  const requireAdmin = async (req: FastifyRequest, reply: any) => {
    if (!req.user.isAdmin()) {
      reply.code(403).send({ error: 'FORBIDDEN' })
      return false
    }
    return true
  }

  fastify.get('/envelope', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    return reply.send({ ...envelopeReport(12), unquoted: unquotedLines() })
  })

  fastify.get('/roster', async (req, reply) => {
    if (!(await requireAdmin(req, reply))) return
    const subs = await RationSubscription.findAll({ order: [['createdAt', 'ASC']] })
    return reply.send(
      subs.map((s) => ({
        userId: s.userId,
        status: s.status,
        issueCount: s.issueCount,
        nextIssueDate: s.nextIssueDate,
        billing: s.billingRef ? 'ACTIVE' : 'AWAITING_PROVIDER',
        clothingSize: s.clothingSize,
        shippingState: s.shippingState,
      }))
    )
  })

  // POST /dispatch { userId, trackingCode?, drill? }
  // drill: true computes the load + margin without writing anything.
  fastify.post<{ Body: { userId: string; trackingCode?: string; drill?: boolean } }>(
    '/dispatch',
    async (req, reply) => {
      if (!(await requireAdmin(req, reply))) return
      const { userId, trackingCode, drill } = req.body || ({} as any)
      if (!userId) return reply.code(400).send({ error: 'USER_ID_REQUIRED' })

      const sub = await RationSubscription.findOne({ where: { userId } })
      if (!sub || !ACTIVE.has(sub.status)) {
        return reply.code(404).send({ error: 'SUBSCRIPTION_NOT_ACTIVE' })
      }

      const issueNumber = sub.issueCount + 1
      const scheduledDate = sub.nextIssueDate ?? firstOfNextMonth()
      const load = computeIssueLoad(issueNumber, scheduledDate)

      try {
        verifyMarginOrThrow(load)
      } catch (err: any) {
        return reply.code(422).send({ error: 'MARGIN_BREACH', message: err.message })
      }

      const summary = {
        issueNumber,
        scheduledDate,
        itemCount: load.items.length,
        cogsTotal: load.cogsTotal,
        marginPct: load.marginPct,
      }

      if (drill) return reply.send({ drill: true, ...summary })

      const unquoted = unquotedLines()
      if (unquoted.length > 0) {
        return reply.code(422).send({
          error: 'QUOTES_UNCONFIRMED',
          message: `${unquoted.length} COGS lines lack a supplier quote. Live dispatch blocked.`,
          unquoted,
        })
      }
      if (!sub.billingRef) {
        return reply.code(422).send({ error: 'BILLING_NOT_ACTIVE', message: 'Member is not billed. Do not ship.' })
      }

      const issue = await RationIssue.create({
        subscriptionId: sub.id,
        userId,
        issueNumber,
        status: 'DISPATCHED',
        scheduledDate,
        dispatchedAt: new Date(),
        trackingCode: trackingCode ? String(trackingCode).slice(0, 255) : null,
        loadSummary: load.itemNos,
        cogsTotal: load.cogsTotal,
        marginPct: load.marginPct,
      })

      const status = issueNumber === 1 ? 'ON_STRENGTH' : 'STEADY_STATE'
      await sub.update({
        status,
        issueCount: issueNumber,
        lastIssueDate: scheduledDate,
        nextIssueDate: firstOfNextMonth(new Date(`${scheduledDate}T00:00:00Z`)),
      })

      fastify.log.info(
        `[basics/dispatch] issue ${issueNumber} user ${userId} cogs $${load.cogsTotal} margin ${(load.marginPct * 100).toFixed(1)}%`
      )
      return reply.send({ issueId: issue.id, status, ...summary })
    }
  )

  fastify.post<{ Params: { id: string }; Body: { trackingCode?: string } }>(
    '/issues/:id/advance',
    async (req, reply) => {
      if (!(await requireAdmin(req, reply))) return
      const issue = await RationIssue.findOne({ where: { id: req.params.id } })
      if (!issue) return reply.code(404).send({ error: 'NOT_FOUND' })
      const next = NEXT_ISSUE_STATUS[issue.status]
      if (!next) return reply.code(409).send({ error: 'ALREADY_DELIVERED' })
      await issue.update({
        status: next,
        ...(req.body?.trackingCode ? { trackingCode: String(req.body.trackingCode).slice(0, 255) } : {}),
      })
      return reply.send({ id: issue.id, status: next })
    }
  )
}
