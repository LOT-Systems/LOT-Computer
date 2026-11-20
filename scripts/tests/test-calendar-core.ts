/**
 * LOT SYSTEMS CORPORATION
 * Calendar core regression suite — run: npx tsx scripts/tests/test-calendar-core.ts
 * Pure logic only (src/client/utils/calendar.ts): fold, alert windows, dedupe, DTG.
 */

import assert from 'node:assert/strict'
import {
  compareEntries,
  currentStage,
  dueAlerts,
  entryMoment,
  foldCalendar,
  formatClock,
  formatDTG,
  formatTMinus,
  isValidDate,
  nextStageBoundary,
  nextTimedEntry,
  parseTimeInput,
} from '../../src/client/utils/calendar.ts'

let passed = 0
const test = (name: string, fn: () => void) => {
  try {
    fn()
    passed++
    console.log(`  PASS  ${name}`)
  } catch (e) {
    console.error(`  FAIL  ${name}`)
    throw e
  }
}

const at = (date: string, time: string) => entryMoment(date, time)
const MIN = 60_000
let seq = 0
const log = (event: string, metadata: Record<string, any>, createdAt = new Date(2026, 10, 1, 0, 0, seq++).toISOString()) => ({
  id: `log-${seq}`,
  event,
  text: 'x',
  metadata,
  createdAt,
})

console.log('CALENDAR CORE')

test('parseTimeInput accepts operator formats', () => {
  assert.equal(parseTimeInput('1430'), '14:30')
  assert.equal(parseTimeInput('14:30'), '14:30')
  assert.equal(parseTimeInput('930'), '09:30')
  assert.equal(parseTimeInput('9'), '09:00')
  assert.equal(parseTimeInput('2pm'), '14:00')
  assert.equal(parseTimeInput('2:30 PM'), '14:30')
  assert.equal(parseTimeInput('12am'), '00:00')
  assert.equal(parseTimeInput('12pm'), '12:00')
  assert.equal(parseTimeInput(''), null)
  assert.equal(parseTimeInput('  '), null)
  assert.equal(parseTimeInput('2460'), undefined)
  assert.equal(parseTimeInput('25'), undefined)
  assert.equal(parseTimeInput('13pm'), undefined)
  assert.equal(parseTimeInput('noon'), undefined)
})

test('isValidDate rejects impossible dates', () => {
  assert.ok(isValidDate('2026-11-20'))
  assert.ok(!isValidDate('2026-02-30'))
  assert.ok(!isValidDate('2026-1-5'))
  assert.ok(!isValidDate(undefined))
})

test('foldCalendar: legacy entries use log id, status applies, alerts collected', () => {
  const legacy = log('calendar_entry', { date: '2026-11-21', text: 'Legacy', entryType: 'task' })
  const v2 = log('calendar_entry', { id: 'e2', date: '2026-11-20', time: '14:30', text: 'Call K', entryType: 'call' })
  const done = log('calendar_entry_status', { entryId: legacy.id, status: 'done' })
  const alert = log('calendar_alert', { entryId: 'e2', stage: 'PRIORITY' })
  const bad = log('calendar_entry', { id: 'e3', date: 'nope', text: 'Bad' })
  const { entries, firedAlerts } = foldCalendar([alert, done, v2, legacy, bad]) // shuffled order
  assert.equal(entries.length, 2)
  assert.equal(entries[0].id, 'e2')
  assert.equal(entries[1].id, legacy.id)
  assert.equal(entries[1].status, 'done')
  assert.equal(entries[1].time, null)
  assert.equal(entries[0].lead, 15)
  assert.ok(firedAlerts.has('e2:PRIORITY'))
})

test('foldCalendar: duplicate create (double submit) keeps first, restore works', () => {
  const a = log('calendar_entry', { id: 'd1', date: '2026-11-20', text: 'First' })
  const b = log('calendar_entry', { id: 'd1', date: '2026-11-22', text: 'Second' })
  const c = log('calendar_entry_status', { entryId: 'd1', status: 'cancelled' })
  const d = log('calendar_entry_status', { entryId: 'd1', status: 'active' })
  const { entries } = foldCalendar([a, b, c, d])
  assert.equal(entries.length, 1)
  assert.equal(entries[0].text, 'First')
  assert.equal(entries[0].status, 'active')
})

const timed = { id: 't1', date: '2026-11-20', time: '14:30', text: 'Brief', type: 'call' as const, lead: 15, status: 'active' as const, createdAt: '' }
const allDay = { ...timed, id: 'a1', time: null, type: 'note' as const }

test('currentStage: disjoint windows for timed entry', () => {
  const t = at('2026-11-20', '14:30')
  assert.equal(currentStage(timed, t - 16 * MIN), null)
  assert.equal(currentStage(timed, t - 15 * MIN)?.stage, 'PRIORITY')
  assert.equal(currentStage(timed, t - 1)?.stage, 'PRIORITY')
  assert.equal(currentStage(timed, t)?.stage, 'FLASH')
  assert.equal(currentStage(timed, t + 29 * MIN)?.stage, 'FLASH')
  assert.equal(currentStage(timed, t + 30 * MIN), null)
  assert.equal(currentStage({ ...timed, status: 'done' }, t), null)
  assert.equal(currentStage({ ...timed, lead: 0 }, t - MIN), null)
})

test('currentStage: ROUTINE briefing 0800–2400 on the day', () => {
  assert.equal(currentStage(allDay, at('2026-11-20', '07:59')), null)
  assert.equal(currentStage(allDay, at('2026-11-20', '08:00'))?.stage, 'ROUTINE')
  assert.equal(currentStage(allDay, at('2026-11-20', '23:59'))?.stage, 'ROUTINE')
  assert.equal(currentStage(allDay, at('2026-11-21', '00:00')), null)
})

test('dueAlerts: dedupe by fired set, late open fires only current stage, FLASH first', () => {
  const t = at('2026-11-20', '14:30')
  const due = dueAlerts([allDay, timed], new Set(), t + 5 * MIN)
  assert.deepEqual(due.map(d => d.key), ['t1:FLASH', 'a1:ROUTINE'])
  const after = dueAlerts([allDay, timed], new Set(['t1:FLASH', 'a1:ROUTINE']), t + 5 * MIN)
  assert.equal(after.length, 0)
  // PRIORITY not yet fired but window passed: must NOT fire retroactively
  assert.ok(!due.some(d => d.key === 't1:PRIORITY'))
})

test('nextStageBoundary + nextTimedEntry', () => {
  const t = at('2026-11-20', '14:30')
  assert.equal(nextStageBoundary([timed], t - 60 * MIN), t - 15 * MIN)
  assert.equal(nextStageBoundary([timed], t - 10 * MIN), t)
  assert.equal(nextStageBoundary([timed], t + MIN), null)
  assert.equal(nextTimedEntry([allDay, timed], t - MIN)?.id, 't1')
  assert.equal(nextTimedEntry([allDay, timed], t + MIN), null)
})

test('compareEntries: all-day before timed within a day', () => {
  const sorted = [timed, allDay, { ...timed, id: 't0', time: '09:00' }].sort(compareEntries)
  assert.deepEqual(sorted.map(e => e.id), ['a1', 't0', 't1'])
})

test('formatting: DTG, T-minus, clock', () => {
  assert.equal(formatDTG('2026-11-20', '14:30'), '201430L NOV 26')
  assert.equal(formatDTG('2026-01-05', null), '05----L JAN 26')
  const t = at('2026-11-20', '14:30')
  assert.equal(formatTMinus(t, t - 134 * MIN), 'T-02H14M')
  assert.equal(formatTMinus(t, t - 45 * MIN), 'T-45M')
  assert.equal(formatTMinus(t, t + 12 * MIN), 'T+12M')
  assert.equal(formatTMinus(t, t - 3 * 1440 * MIN - 120 * MIN), 'T-3D02H')
  assert.equal(formatClock('14:30', true), '2:30 PM')
  assert.equal(formatClock('00:05', true), '12:05 AM')
  assert.equal(formatClock('14:30', false), '14:30')
})

console.log(`\n${passed} passed`)
