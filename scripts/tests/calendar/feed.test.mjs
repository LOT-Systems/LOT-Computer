// Run: node --experimental-strip-types scripts/tests/calendar/feed.test.mjs
import { deriveCalendar, seriesDates } from '../../../src/client/utils/calendarFeed.ts'
import { alertStage, onTimeStats } from '../../../src/client/utils/calendarAlerts.ts'
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

// ── recurrence ──
const NOW = new Date(2026, 10, 11, 12, 0).getTime() // Wed 2026-11-11 12:00 local
const D = (y, m, d) => new Date(y, m - 1, d)
ok(seriesDates('2026-11-09', 'weekdays', D(2026,11,7), D(2026,11,16)), ['2026-11-09','2026-11-10','2026-11-11','2026-11-12','2026-11-13','2026-11-16'], 'weekdays skip Sat/Sun')
ok(seriesDates('2026-11-04', 'weekly', D(2026,11,1), D(2026,11,25)), ['2026-11-04','2026-11-11','2026-11-18','2026-11-25'], 'weekly on base weekday')
ok(seriesDates('2026-11-10', 'daily', D(2026,11,1), D(2026,11,12)), ['2026-11-10','2026-11-11','2026-11-12'], 'never before base date')
ok(seriesDates('2026-01-30', 'daily', D(2026,1,30), D(2026,2,2)), ['2026-01-30','2026-01-31','2026-02-01','2026-02-02'], 'month rollover')
ok(seriesDates('bad', 'daily', D(2026,1,1), D(2026,1,2)), [], 'bad base date')

const R = [
  { id: 20, event: 'calendar_entry', metadata: { date: '2026-11-09', time: '09:00', text: 'Standup', entryType: 'call', repeat: 'daily' } },
  { id: 21, event: 'calendar_done', metadata: { entryId: '20@2026-11-10', at: new Date(2026,10,10,9,2).getTime(), from: 'T-0' } },
  { id: 22, event: 'calendar_cancel', metadata: { entryId: '20@2026-11-12' } },
  { id: 23, event: 'calendar_entry', metadata: { date: '2026-11-09', text: 'Bogus', repeat: 'hourly' } },
]
const r = deriveCalendar(R, { now: NOW, backDays: 8, horizonDays: 4 })
const occ = r.entries.filter(e => e.seriesId === '20')
ok(occ.map(e => e.date), ['2026-11-09','2026-11-10','2026-11-11','2026-11-13','2026-11-14','2026-11-15'], 'daily expanded, skipped occurrence removed')
ok(occ[0].id, '20@2026-11-09', 'occurrence id = series@date')
ok(occ.find(e => e.date === '2026-11-10').done, true, 'done per occurrence')
ok(occ.find(e => e.date === '2026-11-10').doneAt, new Date(2026,10,10,9,2).getTime(), 'doneAt captured')
ok(occ.filter(e => e.lapsed).map(e => e.date), ['2026-11-09','2026-11-10'], 'occurrences before the latest started one lapse')
ok(alertStage(occ[0], new Date(NOW)), null, 'lapsed occurrence never alerts (no burst on late open)')
ok(alertStage(occ[2], new Date(NOW)), 'OVERDUE', 'current occurrence still alerts')
const R2 = [{ id: 20, event: 'calendar_entry', metadata: { date: '2026-11-09', time: '09:00', text: 'Standup', entryType: 'call', repeat: 'daily' } }]
const at = (h, m) => deriveCalendar(R2, { now: new Date(2026, 10, 12, h, m).getTime(), backDays: 2, horizonDays: 1 }).entries.filter(e => e.seriesId === '20')
const live = (h, m) => at(h, m).filter(e => alertStage(e, new Date(2026, 10, 12, h, m))).map(e => e.date)
ok(live(8, 40), ['2026-11-11'], "08:40: yesterday's missed standup still OVERDUE")
ok(live(8, 45), ['2026-11-12'], "08:45: today's T-15 opens, yesterday lapses — one alert per series")
ok(r.entries.find(e => e.text === 'Bogus').repeat, undefined, 'unknown repeat -> one-off')

ok(deriveCalendar([...R, { id: 24, event: 'calendar_cancel', metadata: { entryId: '20' } }], { now: NOW }).entries.some(e => e.seriesId === '20'), false, 'series scrub removes all occurrences')

// ── edit (supersede) ──
const ED = [
  { id: 30, event: 'calendar_entry', metadata: { date: '2026-11-11', time: '15:00', text: 'Call Ann', entryType: 'call' } },
  { id: 31, event: 'calendar_entry', metadata: { date: '2026-11-11', time: '16:00', text: 'Call Ann (moved)', entryType: 'call', replaces: '30' } },
  { id: 32, event: 'calendar_entry', metadata: { date: '2026-11-12', time: '16:00', text: 'Call Ann (moved again)', entryType: 'call', replaces: 31 } },
]
ok(deriveCalendar(ED, { now: NOW }).entries.map(e => e.id + ':' + e.time + ':' + e.date), ['32:16:00:2026-11-12'], 'edit chain: only the latest version survives')
ok(deriveCalendar([{ id: 40, event: 'calendar_entry', metadata: { date: '2026-11-11', text: 'x'.repeat(400) } }]).entries[0].text.length, 280, 'text capped at 280')

// ── on-time stats ──
const st = onTimeStats([
  { type: 'task', date: '2026-11-10', time: '09:00', done: true, doneAt: new Date(2026,10,10,9,3).getTime() },  // on time (grace 5m)
  { type: 'task', date: '2026-11-10', time: '10:00', done: true, doneAt: new Date(2026,10,10,11,0).getTime() }, // late
  { type: 'call', date: '2026-11-11', time: '11:00', done: false },                                              // missed
  { type: 'call', date: '2026-11-11', time: '18:00', done: false },                                              // not due yet
  { type: 'note', date: '2026-11-10', time: '09:00', done: false },                                              // not scored
  { type: 'task', date: '2026-11-01', time: '09:00', done: false },                                              // outside 7d
  { type: 'task', date: '2026-11-11', done: true, doneAt: new Date(2026,10,11,10,0).getTime() },                // untimed, closed today
], new Date(NOW), 7)
ok([st.onTime, st.due], [2, 4], 'on-time 2/4 over 7d')
ok(onTimeStats([], new Date(NOW)).due, 0, 'empty stats')

console.log(`ALL PASS (${n} assertions)`)
