import assert from 'node:assert/strict'
import {
  applyEvent, emptyRecord, transition, validateRoster, withinEnvelope,
  marginOf, monthlyTotalCents, BASIC_PRICE_CENTS, type Roster,
} from '../../src/shared/basics/engine.ts'

const now = new Date('2026-10-03T00:00:00Z')
const good = validateRoster({
  shipping: { name: 'A B', line1: '1 Main', city: 'Austin', region: 'tx', postal: '78701' },
  holds: ['05', '05', 'xx'], cadenceStart: '2026-11-01',
}, now)
assert(good.ok); const roster = (good as any).roster as Roster
assert.deepEqual(roster.holds, ['05']); assert.equal(roster.shipping.region, 'TX')
assert(!validateRoster({ shipping: {}, cadenceStart: '2026-10-01' }, now).ok)
assert(!validateRoster({ shipping: roster.shipping, cadenceStart: '2026-10-01' }, now).ok) // not future

// full path: USERSHIP -> PENDING -> ON_STRENGTH -> STEADY -> STAND DOWN -> USERSHIP
let r = emptyRecord('USERSHIP')
const step = (e: any, ctx: any = {}) => {
  const x = applyEvent(r, e, { now, hasUsership: true, ...ctx }); assert(x.ok, JSON.stringify(x)); r = (x as any).record
}
step('UPGRADE'); assert.equal(r.state, 'PENDING'); assert.equal(r.billing.amountCents, 0)
step('ROSTER_COMPLETE', { roster }); assert.equal(r.state, 'ON_STRENGTH')
assert.equal(r.billing.amountCents, BASIC_PRICE_CENTS); assert.equal(r.nextIssue, '2026-11-01')
assert.equal(monthlyTotalCents(r, 2000), 12000) // additive
step('ISSUE_DISPATCHED'); assert.equal(r.state, 'STEADY_STATE')
step('STAND_DOWN'); assert.equal(r.state, 'USERSHIP'); assert.equal(r.billing.amountCents, 0)
assert.equal(r.roster, null); assert.equal(r.issueLog.length, 4)

// guards
assert(!applyEvent(emptyRecord('NONE'), 'UPGRADE', { now, hasUsership: false }).ok)
assert(!applyEvent(emptyRecord('USERSHIP'), 'UPGRADE', { now, hasUsership: false }).ok)
assert.equal(transition('USERSHIP', 'STAND_DOWN'), null)
assert.equal(transition('PENDING', 'ISSUE_DISPATCHED'), null)
assert(!applyEvent(emptyRecord('PENDING'), 'ROSTER_COMPLETE', { now, hasUsership: true }).ok)

// envelope
assert(withinEnvelope(4000)); assert(!withinEnvelope(4001)); assert.equal(marginOf(10000, 4000), 0.6)
console.log('basics-engine: ALL PASS')
