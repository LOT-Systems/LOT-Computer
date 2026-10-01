import assert from 'node:assert/strict'
import {
  entryTimestamp, planStages, liveState, formatOffset, formatAlert, isValidTime, dueStages,
} from '../../src/client/utils/calendarAlerts.ts'

const start = entryTimestamp('2026-10-02', '14:30')!
const min = 60_000
assert.ok(start)
assert.equal(entryTimestamp('2026-10-02', null), null)
assert.equal(entryTimestamp('2026-10-02', '25:00'), null)
assert.equal(entryTimestamp('bad', '10:00'), null)
assert.ok(isValidTime('00:00') && !isValidTime('7:5'))

assert.deepEqual(dueStages(start, start - 16 * min), [])
assert.deepEqual(planStages(start, start - 15 * min, new Set()), { fire: 'T15', silent: [] })
assert.deepEqual(planStages(start, start - 4 * min, new Set(['T15'])), { fire: 'T5', silent: [] })
// late open: only latest fires, earlier silent
assert.deepEqual(planStages(start, start + 1 * min, new Set()), { fire: 'T0', silent: ['T15', 'T5'] })
assert.deepEqual(planStages(start, start + 20 * min, new Set(['T15', 'T5', 'T0'])), { fire: 'MISSED', silent: [] })
// fully fired
assert.deepEqual(planStages(start, start + 20 * min, new Set(['T15', 'T5', 'T0', 'MISSED'])), { fire: null, silent: [] })
// stale > 24h silent
assert.deepEqual(planStages(start, start + 25 * 60 * min, new Set()), { fire: null, silent: ['T15', 'T5', 'T0', 'MISSED'] })

assert.equal(liveState(null, start, false), 'ALLDAY')
assert.equal(liveState(start, start - 60 * min, false), 'UPCOMING')
assert.equal(liveState(start, start - 10 * min, false), 'SOON')
assert.equal(liveState(start, start + 1, false), 'NOW')
assert.equal(liveState(start, start + 30 * min, false), 'OVERDUE')
assert.equal(liveState(start, start + 30 * min, true), 'DONE')

assert.equal(formatOffset(start, start - 14 * min - 10_000), 'T-00:15')
assert.equal(formatOffset(start, start - 14 * min), 'T-00:14')
assert.equal(formatOffset(start, start + 3 * min + 5000), 'T+00:03')
assert.equal(formatOffset(start, start - 75 * min), 'T-01:15')
assert.equal(formatAlert('T5', 'call', 'Mom', '14:30').log, '[ALERT] READY // T-00:05 · CALL 14:30 — Mom')
console.log('calendar-alerts: all assertions passed')
