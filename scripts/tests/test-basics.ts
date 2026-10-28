// LOT-FM-001 BASIC module — pure checks (state machine, roster validation, cadence, margin).
import assert from 'node:assert/strict'
import {
  transition, validateRoster, normalizeRoster, nextIssueDate, daysUntil, marginAt,
  RATION_PRICE_CENTS, COGS_CEILING_CENTS, MARGIN_FLOOR, type Roster,
} from '../../src/shared/basics/roster'
import { RATION_MANIFEST } from '../../src/client/components/basics/doctrine'

const roster: Roster = {
  sizing: 'M', cadenceDay: 5,
  shipping: { name: ' A B ', line1: '1 Main', line2: '', city: 'Austin', region: 'TX', postal: '78701', country: 'us' },
}
let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log('PASS', name) }

t('happy path', () => {
  let s = transition('USERSHIP', 'ENLIST')!; assert.equal(s, 'PENDING')
  s = transition(s, 'CONFIRM')!; assert.equal(s, 'ON_STRENGTH')
  s = transition(s, 'FIRST_ISSUE_DELIVERED')!; assert.equal(s, 'STEADY_STATE')
  assert.equal(transition(s, 'STAND_DOWN'), 'USERSHIP')
})
t('stand down from every non-base state', () => {
  for (const s of ['PENDING', 'ON_STRENGTH', 'STEADY_STATE'] as const) assert.equal(transition(s, 'STAND_DOWN'), 'USERSHIP')
})
t('illegal transitions rejected', () => {
  assert.equal(transition('USERSHIP', 'CONFIRM'), null)
  assert.equal(transition('USERSHIP', 'STAND_DOWN'), null)
  assert.equal(transition('PENDING', 'ENLIST'), null)
  assert.equal(transition('STEADY_STATE', 'CONFIRM'), null)
})
t('roster validation', () => {
  assert.deepEqual(validateRoster(roster), {})
  assert.ok(validateRoster(null).name)
  assert.ok(validateRoster({ ...roster, cadenceDay: 29 }).cadenceDay)
  assert.ok(validateRoster({ ...roster, sizing: 'XS' as any }).sizing)
  assert.ok(validateRoster({ ...roster, shipping: { ...roster.shipping, city: '  ' } }).city)
})
t('normalize', () => {
  const r = normalizeRoster(roster); assert.equal(r.shipping.name, 'A B'); assert.equal(r.shipping.country, 'US')
})
t('next issue date', () => {
  assert.equal(nextIssueDate(5, new Date('2026-11-02T10:00:00Z')).toISOString(), '2026-11-05T00:00:00.000Z')
  assert.equal(nextIssueDate(5, new Date('2026-11-05T10:00:00Z')).toISOString(), '2026-12-05T00:00:00.000Z')
  assert.equal(nextIssueDate(5, new Date('2026-12-20T10:00:00Z')).toISOString(), '2027-01-05T00:00:00.000Z')
  assert.equal(daysUntil('2026-11-05T00:00:00.000Z', new Date('2026-11-02T23:00:00Z')), 3)
})
t('economics envelope', () => {
  assert.ok(marginAt(COGS_CEILING_CENTS) >= MARGIN_FLOOR)
  assert.equal(RATION_PRICE_CENTS, 10000)
})
t('manifest: 23 items, unique lines', () => {
  assert.equal(RATION_MANIFEST.length, 23)
  assert.equal(new Set(RATION_MANIFEST.map((i) => i.line)).size, 23)
})
console.log(`OK ${n}/${n}`)
