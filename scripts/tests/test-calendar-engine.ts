/**
 * Calendar engine self-test — run: npx tsx scripts/tests/test-calendar-engine.ts
 */
import assert from 'node:assert/strict'
import {
  normalizeTime, foldCalendar, dueAlerts, formatCountdown, formatDTG, alertLogText, entryStart,
} from '../../src/client/utils/calendar'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log(`  ✓ ${name}`) }

t('normalizeTime', () => {
  assert.equal(normalizeTime('9'), '09:00')
  assert.equal(normalizeTime('930'), '09:30')
  assert.equal(normalizeTime('09.30'), '09:30')
  assert.equal(normalizeTime('2145'), '21:45')
  assert.equal(normalizeTime('21h'), '21:00')
  assert.equal(normalizeTime('24:00'), null)
  assert.equal(normalizeTime('12:60'), null)
  assert.equal(normalizeTime('abc'), null)
})

const L = (id: string, event: string, md: any, at: string) => ({ id, event, text: 'x', metadata: md, createdAt: at })
const logs = [
  L('a', 'calendar_entry', { date: '2026-11-17', time: '14:30', text: 'Call ops', entryType: 'call' }, '2026-11-10T10:00:00Z'),
  L('b', 'calendar_entry', { date: '2026-11-17', text: 'All-day note', entryType: 'note' }, '2026-11-10T10:01:00Z'),
  L('c', 'calendar_entry', { date: '2026-11-17', time: '09:00', text: 'Task', entryType: 'task' }, '2026-11-10T10:02:00Z'),
  L('s1', 'calendar_status', { entryId: 'c', status: 'done' }, '2026-11-11T10:00:00Z'),
  L('bad', 'calendar_entry', { date: 'nope', text: 'x' }, '2026-11-10T10:03:00Z'),
  L('al', 'calendar_alert', { entryId: 'b', phase: 'DAY' }, '2026-11-17T08:00:00Z'),
]

t('foldCalendar: ordering, status, invalid drop, fired set', () => {
  const { entries, firedAlerts } = foldCalendar(logs.slice().reverse())
  assert.deepEqual(entries.map(e => e.id), ['b', 'c', 'a'])
  assert.equal(entries.find(e => e.id === 'c')!.status, 'done')
  assert.ok(firedAlerts.has('b:DAY'))
})

t('dueAlerts: T-15 window', () => {
  const { entries, firedAlerts } = foldCalendar(logs)
  const r = dueAlerts(entries, firedAlerts, new Date(2026, 10, 17, 14, 20))
  assert.deepEqual(r.due.map(d => `${d.entry.id}:${d.phase}`), ['a:T-15'])
})

t('dueAlerts: T-0 fires, suppresses unfired T-15', () => {
  const { entries, firedAlerts } = foldCalendar(logs)
  const r = dueAlerts(entries, firedAlerts, new Date(2026, 10, 17, 14, 31))
  assert.deepEqual(r.due.map(d => `${d.entry.id}:${d.phase}`), ['a:T-0'])
  assert.deepEqual(r.suppressed, ['a:T-15'])
})

t('dueAlerts: stale beyond grace does not fire', () => {
  const { entries, firedAlerts } = foldCalendar(logs)
  const r = dueAlerts(entries, firedAlerts, new Date(2026, 10, 17, 16, 0))
  assert.equal(r.due.length, 0)
})

t('dueAlerts: DAY fires after 08:00 once', () => {
  const { entries } = foldCalendar(logs.filter(l => l.id !== 'al'))
  assert.equal(dueAlerts(entries, new Set(), new Date(2026, 10, 17, 7, 59)).due.length, 0)
  const r = dueAlerts(entries, new Set(), new Date(2026, 10, 17, 8, 1))
  assert.deepEqual(r.due.map(d => `${d.entry.id}:${d.phase}`), ['b:DAY'])
  assert.equal(dueAlerts(entries, new Set(['b:DAY']), new Date(2026, 10, 17, 8, 1)).due.length, 0)
})

t('dueAlerts: done/cancelled never alert', () => {
  const { entries, firedAlerts } = foldCalendar(logs)
  const r = dueAlerts(entries, firedAlerts, new Date(2026, 10, 17, 9, 0))
  assert.ok(!r.due.some(d => d.entry.id === 'c'))
})

t('formatCountdown / DTG / log text', () => {
  assert.equal(formatCountdown(3_723_000), 'T-01:02:03')
  assert.equal(formatCountdown(-61_000), 'T+00:01:01')
  assert.equal(formatCountdown(2 * 86_400_000 + 3_600_000 * 5), 'T-2D 05H')
  assert.equal(formatDTG(new Date(2026, 10, 17, 14, 30)), '171430L NOV 26')
  const { entries } = foldCalendar(logs)
  const a = entries.find(e => e.id === 'a')!
  assert.equal(alertLogText(a, 'T-0', new Date(2026, 10, 17, 14, 30)),
    '[FLASH] CAL T-0 · NOW · CLL · Call ops · 2026-11-17 14:30 · DTG 171430L NOV 26')
  assert.equal(entryStart(a).getHours(), 14)
})

console.log(`\nCALENDAR ENGINE: ${n}/${n} GREEN`)
