// Run: node --experimental-strip-types scripts/test-calendar-alerts.mts
import assert from 'node:assert/strict'
import { currentStage, dueAlerts, entryDateTime, formatCountdown, isValidTime, normalizeTime } from '../src/client/utils/calendarAlerts.ts'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log('PASS', name) }
const at = (h: number, m: number) => new Date(2026, 10, 3, h, m, 0, 0)
const target = at(14, 30)

t('time validation', () => {
  assert.ok(isValidTime('09:05')); assert.ok(isValidTime('9:05')); assert.ok(!isValidTime('24:00')); assert.ok(!isValidTime('12:60')); assert.ok(!isValidTime(''))
  assert.equal(normalizeTime('9:05'), '09:05')
})
t('entryDateTime rejects bad input', () => {
  assert.equal(entryDateTime('2026-02-31', '10:00'), null)
  assert.equal(entryDateTime('2026-11-03', null), null)
  assert.equal(entryDateTime('garbage', '10:00'), null)
  assert.ok(entryDateTime('2026-11-03', '14:30'))
})
t('stage ladder', () => {
  assert.equal(currentStage(at(14, 14), target), null)
  assert.equal(currentStage(at(14, 15), target), 'T-15')
  assert.equal(currentStage(at(14, 25), target), 'T-05')
  assert.equal(currentStage(at(14, 30), target), 'T-00')
  assert.equal(currentStage(at(14, 39), target), 'T-00')
  assert.equal(currentStage(at(14, 40), target), 'MISSED')
  assert.equal(currentStage(at(16, 30), target), 'MISSED')
  assert.equal(currentStage(at(16, 31), target), null)
})
t('only latest stage fires after a gap', () => {
  const d = dueAlerts(at(14, 31), [{ id: 'a', date: '2026-11-03', time: '14:30' }], new Set())
  assert.equal(d.length, 1); assert.equal(d[0].stage, 'T-00')
})
t('dedupe + no backwards alerts', () => {
  const e = [{ id: 'a', date: '2026-11-03', time: '14:30' }]
  assert.equal(dueAlerts(at(14, 31), e, new Set(['a:T-00'])).length, 0)
  assert.equal(dueAlerts(at(14, 31), e, new Set(['a:MISSED'])).length, 0)
  assert.equal(dueAlerts(at(14, 41), e, new Set(['a:T-00']))[0].stage, 'MISSED')
})
t('done and untimed entries are silent', () => {
  assert.equal(dueAlerts(at(14, 30), [{ id: 'a', date: '2026-11-03', time: '14:30', done: true }], new Set()).length, 0)
  assert.equal(dueAlerts(at(14, 30), [{ id: 'b', date: '2026-11-03' }], new Set()).length, 0)
})
t('countdown format', () => {
  assert.equal(formatCountdown(at(14, 15), target), 'T-15m')
  assert.equal(formatCountdown(at(14, 30), target), 'T-00')
  assert.equal(formatCountdown(at(14, 42), target), 'T+12m')
})
console.log(`\n${n}/${n} PASS`)
