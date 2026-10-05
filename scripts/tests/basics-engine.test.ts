import assert from 'node:assert/strict'
import {
  applyEvent, emptyRecord, transition, validateRoster, withinEnvelope,
  marginOf, monthlyTotalCents, addMonth, BASIC_PRICE_CENTS, type Roster,
} from '../../src/shared/basics/engine.ts'
import { manifestCard, CARD_COLS } from '../../src/shared/basics/card.ts'
import { RATION_MANIFEST, issueLoad, isIssued } from '../../src/shared/basics/manifest.ts'

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
assert(!applyEvent(r, 'ISSUE_DISPATCHED', { now, hasUsership: true, tracking: 'T1' }).ok) // not due
const due = new Date('2026-11-01T12:00:00Z')
assert(!applyEvent(r, 'ISSUE_DISPATCHED', { now: due, hasUsership: true }).ok) // tracking required
step('ISSUE_DISPATCHED', { now: due, tracking: '9400 1' }); assert.equal(r.state, 'STEADY_STATE')
assert.equal(r.issuesDispatched, 1); assert.equal(r.nextIssue, '2026-12-01'); assert.equal(r.dispatches[0].issue, 1)
assert(!applyEvent(r, 'ISSUE_DISPATCHED', { now: due, hasUsership: true, tracking: 'T2' }).ok) // next not due
step('ISSUE_DISPATCHED', { now: new Date('2026-12-02T00:00:00Z'), tracking: '9400 2' }); assert.equal(r.nextIssue, '2027-01-01')
assert.equal(addMonth('2026-12-01'), '2027-01-01')
// card + load engine
const card = manifestCard({ issue: 1, due: '2026-11-01', roster, next: '2026-12-01' })
assert(card.split('\n').every((l) => l.length <= CARD_COLS), 'card exceeds grid')
assert(card.includes('TOOTHPASTE') && !card.includes('SUNSCREEN'))
assert.equal(issueLoad(1).length, 11); assert(issueLoad(6).some((i) => i.line === '11'))
assert.equal(RATION_MANIFEST.length, 23)
// every line ships at least once in 12 issues
for (const i of RATION_MANIFEST) assert(Array.from({ length: 12 }, (_, k) => k + 1).some((n) => isIssued(i, n)), i.line)
step('STAND_DOWN'); assert.equal(r.state, 'USERSHIP'); assert.equal(r.billing.amountCents, 0)
assert.equal(r.roster, null); assert.equal(r.issueLog.length, 5)

// guards
assert(!applyEvent(emptyRecord('NONE'), 'UPGRADE', { now, hasUsership: false }).ok)
assert(!applyEvent(emptyRecord('USERSHIP'), 'UPGRADE', { now, hasUsership: false }).ok)
assert.equal(transition('USERSHIP', 'STAND_DOWN'), null)
assert.equal(transition('PENDING', 'ISSUE_DISPATCHED'), null)
assert(!applyEvent(emptyRecord('PENDING'), 'ROSTER_COMPLETE', { now, hasUsership: true }).ok)

// envelope
assert(withinEnvelope(4000)); assert(!withinEnvelope(4001)); assert.equal(marginOf(10000, 4000), 0.6)
console.log('basics-engine: ALL PASS')
