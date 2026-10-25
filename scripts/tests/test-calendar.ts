import assert from 'node:assert/strict'
import { parseTime, dueStage, formatCountdown, entryStart, type CalendarEntry } from '../../src/client/utils/calendar.ts'

const e = (o: Partial<CalendarEntry>): CalendarEntry =>
  ({ id: '1', date: '2026-10-25', time: '14:00', text: 'x', type: 'task', ...o })
const t = (h: number, m: number) => new Date(2026, 9, 25, h, m).getTime()

assert.equal(parseTime('930'), '09:30'); assert.equal(parseTime('9:30'), '09:30')
assert.equal(parseTime('25:00'), null); assert.equal(parseTime(''), null); assert.equal(parseTime('12:60'), null)
assert.equal(dueStage(e({}), t(13, 30)), null)
assert.equal(dueStage(e({}), t(13, 45)), 't15')
assert.equal(dueStage(e({}), t(14, 0)), 't0')
assert.equal(dueStage(e({}), t(14, 29)), 't0')
assert.equal(dueStage(e({}), t(14, 30)), 'overdue')
assert.equal(dueStage(e({ type: 'note' }), t(14, 30)), null)
assert.equal(dueStage(e({}), t(14, 0) + 25 * 3600e3), null)
assert.equal(dueStage(e({ time: null }), t(8, 50)), null) // all-day: no T-15
assert.equal(dueStage(e({ time: null }), t(9, 0)), 't0')
assert.equal(formatCountdown(t(14, 0) - t(11, 46)), 'T-02:14')
assert.equal(formatCountdown(-42 * 60e3), 'T+00:42')
assert.ok(Number.isNaN(entryStart({ date: 'bad', time: null })))
console.log('calendar: all assertions passed')
