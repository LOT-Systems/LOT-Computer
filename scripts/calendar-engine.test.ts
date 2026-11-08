import assert from 'node:assert/strict'
import { parseTime, currentPhase, dueAlerts, countdown, itemTimestamp } from '../src/client/utils/calendarEngine'

const item = (time: string | null, id = 'a') => ({ id, date: '2026-11-08', time, text: 'x', type: 'call' as const })
const at = (hm: string) => itemTimestamp({ date: '2026-11-08', time: hm })!

assert.equal(parseTime('9:05'), '09:05')
assert.equal(parseTime('930'), '09:30')
assert.equal(parseTime('24:00'), null)
assert.equal(parseTime(''), null)
assert.equal(currentPhase(item('12:00'), at('11:00')), 'pending')
assert.equal(currentPhase(item('12:00'), at('11:50')), 'warn')
assert.equal(currentPhase(item('12:00'), at('12:03')), 'active')
assert.equal(currentPhase(item('12:00'), at('12:10')), 'missed')
assert.equal(currentPhase(item(null), at('12:10')), 'pending')
assert.equal(dueAlerts([item('12:00')], [], at('11:50'))[0].phase, 'warn')
assert.equal(dueAlerts([item('12:00')], [{ entryId: 'a', phase: 'warn' }], at('11:50')).length, 0)
assert.equal(dueAlerts([item('12:00')], [{ entryId: 'a', phase: 'warn' }], at('12:01'))[0].phase, 'active')
assert.equal(dueAlerts([item('12:00')], [{ entryId: 'a', phase: 'done' }], at('12:01')).length, 0)
assert.equal(dueAlerts([item('12:00')], [{ entryId: 'a', phase: 'active' }], at('12:01')).length, 0)
assert.equal(countdown(at('12:00'), at('11:57') + 45_000), 'T-00:02:15')
assert.equal(countdown(at('12:00'), at('12:01')), 'T+00:01:00')
console.log('calendarEngine: all assertions passed')
