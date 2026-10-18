// LOT-FM-001 self-test. Run: node --experimental-strip-types scripts/basics-selftest.ts
import assert from 'node:assert/strict'
import { RATION_MANIFEST, loadForIssue, withinEnvelope, marginAt } from '../src/shared/basics/manifest.ts'
import { emptyRecord, transition, nextIssue, validateRoster, STEADY_AFTER } from '../src/shared/basics/state.ts'

const now = new Date('2026-10-18T00:00:00Z')
const roster = { name: 'A', line1: '1 Main', city: 'X', region: 'CA', postal: '90001', country: 'US', size: 'M' as const, cadenceStart: '2026-11-01' }
const ok = (t: any) => { assert.ok(t.ok, t.error); return t.record }

assert.equal(RATION_MANIFEST.length, 23)
assert.equal(new Set(RATION_MANIFEST.map((i) => i.line)).size, 23)
assert.equal(loadForIssue(1).length, 23)
assert.equal(loadForIssue(2).length, 20)
assert.equal(loadForIssue(4).length, 23)
assert.ok(withinEnvelope(40) && !withinEnvelope(40.01) && marginAt(40) === 0.6)

assert.equal(transition(emptyRecord(false), { type: 'UPGRADE', roster }, now).ok, false)
assert.equal(transition(emptyRecord(true), { type: 'UPGRADE', roster: { ...roster, cadenceStart: '2026-09-01' } }, now).ok, false)
assert.ok(validateRoster({ ...roster, city: ' ' }, now).length > 0)

let r = ok(transition(emptyRecord(true), { type: 'UPGRADE', roster }, now))
assert.equal(r.state, 'PENDING')
assert.equal(transition(r, { type: 'DISPATCH', at: 'x' }, now).ok, false)
r = ok(transition(r, { type: 'CONFIRM' }, now))
assert.equal(r.state, 'ON_STRENGTH')
assert.equal(nextIssue(r), '2026-11-01')
for (let i = 0; i < STEADY_AFTER; i++) r = ok(transition(r, { type: 'DISPATCH', at: 'x' }, now))
assert.equal(r.state, 'STEADY_STATE')
assert.equal(nextIssue(r), '2027-02-01')
r = ok(transition(r, { type: 'STAND_DOWN' }, now))
assert.equal(r.state, 'USERSHIP')
assert.equal(r.roster, undefined)
assert.equal(r.issues.length, STEADY_AFTER)
assert.equal(nextIssue(r), null)
console.log('BASICS SELFTEST: GREEN')
