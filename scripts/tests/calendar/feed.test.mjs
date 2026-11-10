// Run: node --experimental-strip-types scripts/tests/calendar/feed.test.mjs
import { deriveCalendar } from '../../../src/client/utils/calendarFeed.ts'
import assert from 'node:assert/strict'
let n = 0
const ok = (a, b, m) => { n++; assert.deepEqual(a, b, m) }
const E = (id, md) => ({ id, event: 'calendar_entry', text: 'x', metadata: { entryType: 'task', text: 't' + id, ...md } })
const logs = [
  E(1, { date: '2026-11-10', time: '09:00' }),
  E(2, { date: '2026-11-10' }),
  E(3, { date: '2026-11-11', time: '07:00' }),
  E(4, { date: 'nope' }),
  E(5, { date: '2026-11-10', time: '99:00', entryType: 'bogus' }),
  E(6, { date: '2026-11-12' }),
  { id: 10, event: 'calendar_done', metadata: { entryId: 1 } },
  { id: 11, event: 'calendar_cancel', metadata: { entryId: '6' } },
  { id: 12, event: 'calendar_alert', metadata: { key: '3:T-15' } },
  { id: 13, event: 'calendar_snooze', metadata: { entryId: '3', until: 1000, gen: 1 } },
  { id: 14, event: 'calendar_snooze', metadata: { entryId: '3', until: 2000, gen: 2 } },
  { id: 15, event: 'calendar_snooze', metadata: { entryId: '2', until: 'garbage', gen: 1 } },
  { id: 16, event: 'calendar_entry', metadata: null },
]
const { entries, firedKeys } = deriveCalendar(logs)
ok(entries.map(e => e.id), ['2', '5', '1', '3'], 'order + invalid date dropped + scrubbed dropped')
ok(entries.find(e => e.id === '1').done, true, 'done applied')
ok(entries.find(e => e.id === '2').snoozeGen, 0, 'bad snooze ignored')
ok([entries.find(e => e.id === '3').snoozeUntil, entries.find(e => e.id === '3').snoozeGen], [2000, 2], 'latest snooze gen wins')
ok(entries.find(e => e.id === '5').time, undefined, 'invalid time stripped')
ok(entries.find(e => e.id === '5').type, 'note', 'invalid type -> note')
ok(firedKeys.has('3:T-15'), true, 'fired key captured')
ok(deriveCalendar([]).entries.length, 0, 'empty ok')
console.log(`ALL PASS (${n} assertions)`)
