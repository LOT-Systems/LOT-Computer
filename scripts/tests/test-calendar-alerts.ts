import assert from 'node:assert/strict'
import {
  dueAlerts, entryStartMs, formatCountdown, nextTimed, alertKey, isValidTime,
} from '../../src/client/utils/calendarAlerts.ts'

const at = (h: number, m: number) => new Date(2026, 9, 21, h, m, 0).getTime()
const e = { id: 'a', date: '2026-10-21', time: '10:00', text: 'call' }
const none = new Set<string>()

assert.equal(isValidTime('24:00'), false)
assert.equal(isValidTime('09:05'), true)
assert.equal(entryStartMs('2026-10-21', 'bad'), null)
assert.equal(entryStartMs('2026-10-21'), null)
assert.equal(entryStartMs('2026-10-21', '10:00'), at(10, 0))

assert.equal(dueAlerts([e], at(9, 44), none).length, 0)
assert.equal(dueAlerts([e], at(9, 45), none)[0].stage, 'standby')
assert.equal(dueAlerts([e], at(10, 0), none)[0].stage, 'execute')
assert.equal(dueAlerts([e], at(10, 15), none)[0].stage, 'missed')
// outside window: quiet
assert.equal(dueAlerts([e], at(11, 30), none).length, 0)
// away through standby: only execute fires
assert.deepEqual(dueAlerts([e], at(10, 2), none).map(a => a.stage), ['execute'])
// already fired stage does not repeat, nor does an earlier one after a later fired
assert.equal(dueAlerts([e], at(10, 2), new Set([alertKey('a', 'execute')])).length, 0)
assert.equal(dueAlerts([e], at(9, 50), new Set([alertKey('a', 'execute')])).length, 0)
assert.equal(dueAlerts([e], at(10, 20), new Set([alertKey('a', 'execute')]))[0].stage, 'missed')
// done and untimed never alert
assert.equal(dueAlerts([{ ...e, done: true }], at(10, 0), none).length, 0)
assert.equal(dueAlerts([{ ...e, time: undefined }], at(10, 0), none).length, 0)

assert.equal(formatCountdown(at(10, 0), at(9, 45, ) ), 'T-00:15:00')
assert.equal(formatCountdown(at(10, 0), at(10, 3)), 'T+00:03:00')
assert.equal(nextTimed([e], at(10, 20)), null)
assert.equal(nextTimed([e], at(8, 0))?.id, 'a')
console.log('calendar alerts: all assertions passed')
