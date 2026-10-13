import * as c from '../../src/client/utils/calendar'
import assert from 'node:assert'
const due = c.dueAt('2026-10-13','14:00')!
assert(due)
assert.equal(c.pendingStage(due, due-20*60000, []), null)
assert.equal(c.pendingStage(due, due-14*60000, []), 'T-15')
assert.equal(c.pendingStage(due, due-14*60000, ['T-15']), null)
assert.equal(c.pendingStage(due, due-4*60000, ['T-15']), 'T-05')
assert.equal(c.pendingStage(due, due+1000, []), 'T-00')
assert.equal(c.pendingStage(due, due+11*60000, ['T-00']), 'MISSED')
assert.equal(c.pendingStage(due, due+3*3600000, []), null)
assert.equal(c.formatCountdown(due, due-872000), 'T-00:14:32')
assert.equal(c.formatCountdown(due, due+190000), 'T+00:03:10')
assert.equal(c.normalizeTime('9:05'), '09:05'); assert.equal(c.normalizeTime('25:00'), '')
assert.equal(c.dueAt('2026-10-13'), null)
console.log('calendar engine: all assertions passed')
