// Run: node --experimental-strip-types scripts/tests/test-calendar.ts
import assert from 'node:assert/strict'
import {
  buildEntries, pendingStage, dueAt, duplicateOf, formatCountdown, isValidTime,
} from '../../src/client/utils/calendar.ts'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log('ok', name) }
const ev = (id: string, ts: string, m: any, text = '') => ({ id, event: 'calendar_entry', text, createdAt: ts, metadata: m })
const at = (s: string) => new Date(s) // local-time ISO without Z

const logs = [
  ev('a', '2026-10-01T10:00:00', { date: '2026-10-14', time: '14:30', text: 'Dentist', entryType: 'call' }),
  ev('b', '2026-10-01T10:01:00', { date: '2026-10-14', text: 'Legacy note' }), // legacy: no time/kind
  ev('c', '2026-10-01T10:02:00', { date: 'bad', text: 'x' }),
  ev('d', '2026-10-01T10:03:00', { date: '2026-10-15', time: '25:99', text: 'Bad time' }),
]

t('builds, validates, sorts', () => {
  const e = buildEntries(logs)
  assert.equal(e.length, 3)
  assert.equal(e[0].id, 'a'); assert.equal(e[0].time, '14:30'); assert.equal(e[0].type, 'call')
  assert.equal(e.find(x => x.id === 'd')!.time, null)
  assert.equal(e.find(x => x.id === 'b')!.type, 'note')
})

t('stage windows', () => {
  const [a] = buildEntries(logs)
  assert.equal(pendingStage(a, at('2026-10-14T14:00:00')), null)
  assert.equal(pendingStage(a, at('2026-10-14T14:15:00')), 'T-15')
  assert.equal(pendingStage(a, at('2026-10-14T14:30:00')), 'T-0')
  assert.equal(pendingStage(a, at('2026-10-14T14:39:59')), 'T-0')
  assert.equal(pendingStage(a, at('2026-10-14T14:40:00')), 'MISSED')
  assert.equal(pendingStage(a, at('2026-10-15T14:30:00')), null) // stale
})

t('dedupe: fired stages and supersession', () => {
  const withAlert = buildEntries([...logs, ev('x', '2026-10-14T14:16:00', { kind: 'alert', entryId: 'a', stage: 'T-15' })])
  const a = withAlert.find(e => e.id === 'a')!
  assert.equal(pendingStage(a, at('2026-10-14T14:20:00')), null)
  assert.equal(pendingStage(a, at('2026-10-14T14:31:00')), 'T-0')
  const t0 = buildEntries([...logs, ev('y', '2026-10-14T14:31:00', { kind: 'alert', entryId: 'a', stage: 'T-0' })]).find(e => e.id === 'a')!
  assert.equal(pendingStage(t0, at('2026-10-14T14:32:00')), null)
  assert.equal(pendingStage(t0, at('2026-10-14T14:45:00')), 'MISSED')
})

t('catch-up fires only highest stage', () => {
  const [a] = buildEntries(logs)
  assert.equal(pendingStage(a, at('2026-10-14T15:30:00')), 'MISSED')
})

t('done/cancel silence alerts; reopen restores', () => {
  const done = buildEntries([...logs, ev('s', '2026-10-14T14:20:00', { kind: 'status', entryId: 'a', status: 'done' })])
  assert.equal(pendingStage(done[0], at('2026-10-14T14:30:00')), null)
  const re = buildEntries([...logs,
    ev('s', '2026-10-14T14:20:00', { kind: 'status', entryId: 'a', status: 'done' }),
    ev('s2', '2026-10-14T14:21:00', { kind: 'status', entryId: 'a', status: 'open' })])
  assert.equal(pendingStage(re[0], at('2026-10-14T14:30:00')), 'T-0')
})

t('all-day due 09:00', () => {
  const b = buildEntries(logs).find(e => e.id === 'b')!
  assert.equal(dueAt(b).getHours(), 9)
  assert.equal(pendingStage(b, at('2026-10-14T08:50:00')), 'T-15')
})

t('duplicates', () => {
  const e = buildEntries(logs)
  assert.ok(duplicateOf(e, { date: '2026-10-14', time: '14:30', text: ' dentist ', type: 'call' }))
  assert.ok(!duplicateOf(e, { date: '2026-10-14', time: '15:30', text: 'Dentist', type: 'call' }))
})

t('helpers', () => {
  assert.equal(formatCountdown(15 * 60_000), 'T-15M')
  assert.equal(formatCountdown(26 * 3_600_000), 'T-1D 2H')
  assert.equal(formatCountdown(-5 * 60_000), '-5M')
  assert.ok(isValidTime('00:00') && !isValidTime('24:00') && !isValidTime('9:00'))
})
console.log(`${n}/${n} passed`)
