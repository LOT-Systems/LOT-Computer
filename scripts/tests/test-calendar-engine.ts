/**
 * Calendar engine self-test — pure logic, no DOM, no DB.
 * Run: yarn test:calendar
 */
import assert from 'node:assert/strict'
import dayjs from '../../src/client/utils/dayjs'
import {
  alertsFor, buildEntries, dueAlerts, eventTime, formatTMinus, getMonthWeeks,
  nextEvent, nextFireAt, parseTimeInput, upcomingEntries, LATE_GRACE_MS,
} from '../../src/client/utils/calendar'

let passed = 0
const t = (name: string, fn: () => void) => { fn(); passed++; console.log(`  ✓ ${name}`) }

const day = dayjs().add(1, 'day').format('YYYY-MM-DD')
const logs = [
  { id: 'a', event: 'calendar_entry', createdAt: '2026-01-01T00:00:00Z', metadata: { date: day, time: '14:30', text: 'Standup', entryType: 'call', leadMin: 15 } },
  { id: 'b', event: 'calendar_entry', createdAt: '2026-01-01T00:00:01Z', metadata: { date: day, text: 'All-day task', entryType: 'task' } },
  { id: 'c', event: 'calendar_entry', createdAt: '2026-01-01T00:00:02Z', metadata: { date: 'bogus', text: 'x' } },
  { id: 'd', event: 'calendar_entry', createdAt: '2026-01-01T00:00:03Z', metadata: { date: day, time: '25:00', text: 'bad time', entryType: 'zzz' } },
  { id: 's1', event: 'calendar_status', createdAt: '2026-01-02T00:00:00Z', metadata: { entryId: 'd', status: 'done' } },
  { id: 's2', event: 'calendar_status', createdAt: '2026-01-03T00:00:00Z', metadata: { entryId: 'd', status: 'dropped' } },
  { id: 's0', event: 'calendar_status', createdAt: '2026-01-01T12:00:00Z', metadata: { entryId: 'd', status: 'active' } },
]

console.log('calendar engine')
const entries = buildEntries(logs)

t('buildEntries drops invalid dates, normalises type/time, latest status wins', () => {
  assert.deepEqual(entries.map(e => e.id), ['b', 'd', 'a'])
  const d = entries.find(e => e.id === 'd')!
  assert.equal(d.time, null); assert.equal(d.type, 'note'); assert.equal(d.status, 'dropped')
})

t('alertsFor: timed → [lead, 0]; all-day → [0 at 09:00]; inactive → []', () => {
  const a = entries.find(e => e.id === 'a')!
  const b = entries.find(e => e.id === 'b')!
  assert.deepEqual(alertsFor(a).map(x => x.lead), [15, 0])
  assert.equal(alertsFor(a)[0].fireAt, eventTime(a) - 15 * 60_000)
  assert.equal(dayjs(alertsFor(b)[0].fireAt).format('HH:mm'), '09:00')
  assert.equal(alertsFor(entries.find(e => e.id === 'd')!).length, 0)
})

t('dueAlerts: fires T-15 inside window, then T-0, never twice', () => {
  const a = entries.filter(e => e.id === 'a')
  const ev = eventTime(a[0])
  assert.equal(dueAlerts(a, ev - 16 * 60_000, new Set()).length, 0)
  const first = dueAlerts(a, ev - 10 * 60_000, new Set())
  assert.equal(first.length, 1); assert.equal(first[0].lead, 15); assert.equal(first[0].late, true)
  assert.equal(dueAlerts(a, ev - 15 * 60_000 + 5000, new Set())[0].late, false)
  const fired = new Set([first[0].key])
  assert.equal(dueAlerts(a, ev - 5 * 60_000, fired).length, 0)
  const second = dueAlerts(a, ev + 1000, fired)
  assert.equal(second.length, 1); assert.equal(second[0].lead, 0)
  fired.add(second[0].key)
  assert.equal(dueAlerts(a, ev + 2000, fired).length, 0)
})

t('dueAlerts: both overdue → only the latest window, flagged LATE', () => {
  const a = entries.filter(e => e.id === 'a')
  const out = dueAlerts(a, eventTime(a[0]) + 30 * 60_000, new Set())
  assert.equal(out.length, 1); assert.equal(out[0].lead, 0); assert.equal(out[0].late, true)
})

t('dueAlerts: beyond grace window → silent', () => {
  const a = entries.filter(e => e.id === 'a')
  assert.equal(dueAlerts(a, eventTime(a[0]) + LATE_GRACE_MS + 1, new Set()).length, 0)
})

t('nextFireAt skips fired keys', () => {
  const a = entries.filter(e => e.id === 'a')
  const ev = eventTime(a[0])
  const now = ev - 60 * 60_000
  assert.equal(nextFireAt(a, now, new Set()), ev - 15 * 60_000)
  assert.equal(nextFireAt(a, now, new Set(['a:15'])), ev)
})

t('upcoming / nextEvent exclude dropped and past', () => {
  const now = Date.now()
  assert.deepEqual(upcomingEntries(entries, now).map(e => e.id), ['b', 'a'])
  assert.equal(nextEvent(entries, now)!.id, 'b')
})

t('nextEvent locks onto the earliest moment, not list order', () => {
  // All-day sorts first in the list but is briefed at 09:00; a 07:00 call is earlier.
  const d = dayjs().add(2, 'day').format('YYYY-MM-DD')
  const es = buildEntries([
    { id: 'x', event: 'calendar_entry', createdAt: '2026-01-01', metadata: { date: d, text: 'all day', entryType: 'task' } },
    { id: 'y', event: 'calendar_entry', createdAt: '2026-01-01', metadata: { date: d, time: '07:00', text: 'early', entryType: 'call' } },
  ])
  assert.equal(es[0].id, 'x')
  assert.equal(nextEvent(es, Date.now())!.id, 'y')
})

t('formatTMinus readouts', () => {
  assert.equal(formatTMinus(14 * 60_000 + 5000), 'T-14:05')
  assert.equal(formatTMinus(2 * 3600_000 + 14 * 60_000 + 5000), 'T-02:14:05')
  assert.equal(formatTMinus(3 * 86400_000 + 4 * 3600_000), 'T-3D 04H')
  assert.equal(formatTMinus(-5 * 60_000), 'T+05:00')
})

t('parseTimeInput', () => {
  assert.equal(parseTimeInput('9:30'), '09:30')
  assert.equal(parseTimeInput('0930'), '09:30')
  assert.equal(parseTimeInput('930'), '09:30')
  assert.equal(parseTimeInput('21'), '21:00')
  assert.equal(parseTimeInput('24:00'), null)
  assert.equal(parseTimeInput('12:61'), null)
  assert.equal(parseTimeInput('abc'), null)
  assert.equal(parseTimeInput(''), null)
})

t('getMonthWeeks: Mon-first, covers month, overflow-safe on the 31st', () => {
  for (const m of ['2026-02-01', '2026-03-01', '2027-02-01', '2026-11-01']) {
    const month = dayjs(m)
    const weeks = getMonthWeeks(month)
    assert.equal(weeks[0][0].day(), 1)
    assert.ok(!weeks[0][0].isAfter(month.startOf('month')))
    assert.ok(!weeks[weeks.length - 1][6].isBefore(month.endOf('month'), 'day'))
    assert.ok(weeks.length >= 4 && weeks.length <= 6)
  }
  // Viewing Feb from Jan 31 must still show February.
  const feb = dayjs('2027-01-31').startOf('month').add(1, 'month')
  assert.equal(feb.format('YYYY-MM'), '2027-02')
})

console.log(`\n${passed} passed`)
