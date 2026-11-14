/**
 * Calendar core self-test — run: npx tsx scripts/tests/test-calendar.ts
 * Exercises the pure scheduler/fold logic in src/client/utils/calendar.ts.
 */
import assert from 'node:assert/strict'
import dayjs from '../../src/client/utils/dayjs'
import {
  reduceCalendarLogs, computeDueAlerts, firedAlertKeys, isOverdue, nextEntry,
  formatCountdown, formatDtg, normalizeTime, isValidDate, alertKey,
  type CalendarLogRow,
} from '../../src/client/utils/calendar'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log(`  ok  ${name}`) }
const at = (s: string) => dayjs(s) // local time

const rows: CalendarLogRow[] = [
  { id: 'L1', event: 'calendar_entry', text: '[SCHEDULE] note: legacy', metadata: { date: '2026-11-14', text: 'legacy', entryType: 'note' }, createdAt: '2026-11-01T10:00:00Z' },
  { id: 'L2', event: 'calendar_entry', metadata: { entryId: 'E2', date: '2026-11-14', time: '14:30', text: 'Call Dmitri', entryType: 'call' }, createdAt: '2026-11-02T10:00:00Z' },
  { id: 'L3', event: 'calendar_entry', metadata: { entryId: 'E3', date: '2026-11-13', time: '09:00', text: 'Ship report', entryType: 'task' }, createdAt: '2026-11-03T10:00:00Z' },
  { id: 'L4', event: 'calendar_entry', metadata: { entryId: 'E4', date: '2026-11-20', text: 'Dentist', entryType: 'task' }, createdAt: '2026-11-04T10:00:00Z' },
  { id: 'L5', event: 'calendar_entry', metadata: { entryId: 'E5', date: '2026-02-30', text: 'bad date', entryType: 'task' }, createdAt: '2026-11-04T10:00:00Z' },
  { id: 'L6', event: 'calendar_status', metadata: { entryId: 'E4', status: 'cancelled' }, createdAt: '2026-11-05T10:00:00Z' },
  { id: 'L7', event: 'calendar_status', metadata: { entryId: 'E4', status: 'open' }, createdAt: '2026-11-06T10:00:00Z' },
  { id: 'L8', event: 'calendar_alert', metadata: { entryId: 'E2', stage: 'T-15' }, createdAt: '2026-11-14T14:16:00Z' },
]

console.log('calendar core')
const entries = reduceCalendarLogs(rows)

t('fold: valid entries only, sorted by date/time', () => {
  assert.deepEqual(entries.map(e => e.id), ['E3', 'L1', 'E2', 'E4'])
})
t('fold: legacy entry uses log id, all-day', () => {
  const e = entries.find(e => e.id === 'L1')!
  assert.equal(e.time, null); assert.equal(e.type, 'note')
})
t('fold: last status wins (cancel → reopen)', () => {
  assert.equal(entries.find(e => e.id === 'E4')!.status, 'open')
})
t('fold: out-of-order rows still fold by createdAt', () => {
  const r = reduceCalendarLogs([...rows].reverse())
  assert.equal(r.find(e => e.id === 'E4')!.status, 'open')
})
t('validation: time + date', () => {
  assert.equal(normalizeTime('9:05'), '09:05')
  assert.equal(normalizeTime('24:00'), null)
  assert.equal(normalizeTime(''), null)
  assert.equal(isValidDate('2026-02-30'), false)
  assert.equal(isValidDate('2026-02-28'), true)
})

const fired = firedAlertKeys(rows)
t('dedupe: server alert rows become fired keys', () => {
  assert.ok(fired.has(alertKey('E2', 'T-15')))
})
t('due: nothing well before window', () => {
  assert.equal(computeDueAlerts(entries.filter(e => e.id === 'E2'), new Set(), at('2026-11-14T13:00')).length, 0)
})
t('due: T-15 inside lead window', () => {
  const d = computeDueAlerts(entries.filter(e => e.id === 'E2'), new Set(), at('2026-11-14T14:20'))
  assert.deepEqual(d.map(x => x.stage), ['T-15'])
})
t('due: T-15 suppressed when already fired', () => {
  assert.equal(computeDueAlerts(entries.filter(e => e.id === 'E2'), fired, at('2026-11-14T14:20')).length, 0)
})
t('due: T-0 at time and within grace, not after', () => {
  const only = entries.filter(e => e.id === 'E2')
  assert.deepEqual(computeDueAlerts(only, fired, at('2026-11-14T14:30')).map(x => x.stage), ['T-0'])
  assert.deepEqual(computeDueAlerts(only, fired, at('2026-11-14T15:30')).map(x => x.stage), ['T-0'])
  assert.equal(computeDueAlerts(only, fired, at('2026-11-14T15:31')).length, 0)
})
t('due: all-day D-0 from 09:00 through end of day', () => {
  const only = entries.filter(e => e.id === 'L1')
  assert.equal(computeDueAlerts(only, new Set(), at('2026-11-14T08:59')).length, 0)
  assert.deepEqual(computeDueAlerts(only, new Set(), at('2026-11-14T23:59')).map(x => x.stage), ['D-0'])
  assert.equal(computeDueAlerts(only, new Set(), at('2026-11-15T00:01')).length, 0)
})
t('due: closed entries never alert', () => {
  const done = reduceCalendarLogs([...rows, { id: 'L9', event: 'calendar_status', metadata: { entryId: 'E2', status: 'done' }, createdAt: '2026-11-14T14:00:00Z' }])
  assert.equal(computeDueAlerts(done.filter(e => e.id === 'E2'), new Set(), at('2026-11-14T14:30')).length, 0)
})
t('overdue: open task past time; notes never overdue', () => {
  const now = at('2026-11-14T12:00')
  assert.equal(isOverdue(entries.find(e => e.id === 'E3')!, now), true)
  assert.equal(isOverdue(entries.find(e => e.id === 'L1')!, at('2026-11-20T00:00')), false)
})
t('next: timed outranks all-day same day; all-day pending until day ends', () => {
  assert.equal(nextEntry(entries, at('2026-11-14T12:00'))!.id, 'E2')
  assert.equal(nextEntry(entries, at('2026-11-14T15:00'))!.id, 'L1')
  assert.equal(nextEntry(entries, at('2026-11-15T00:01'))!.id, 'E4')
  assert.equal(nextEntry(entries, at('2026-11-21T00:00')), null)
})
t('countdown + DTG formats', () => {
  const e2 = entries.find(e => e.id === 'E2')!
  assert.equal(formatCountdown(e2, at('2026-11-14T12:15')), 'T-02:15')
  assert.equal(formatCountdown(e2, at('2026-11-12T14:00')), 'T-2D 00:30')
  assert.equal(formatCountdown(e2, at('2026-11-14T14:30')), 'NOW')
  assert.equal(formatCountdown(entries.find(e => e.id === 'E4')!, at('2026-11-14T23:00')), 'T-6D')
  assert.equal(formatDtg(e2), 'SAT 14 NOV · 14:30')
})
console.log(`\n${n} passed`)
