/**
 * Calendar engine self-test — run: npx tsx scripts/tests/test-calendar-engine.ts
 */
import assert from 'node:assert/strict'
import {
  normalizeTime, foldCalendar, dueAlerts, formatCountdown, formatDTG, alertLogText, entryStart,
  entryStartMs, wallToEpoch, wallClock, alertKey, loggedAlertKey, alertPriority, alertMetadata, zoneTag,
} from '../../src/shared/utils/calendar'

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

// ─── v3: zones, snooze, keys ───

t('wallToEpoch: zoned wall clock → instant (incl. DST)', () => {
  // 2026-11-17 14:30 in New York (EST, UTC-5) = 19:30Z
  assert.equal(new Date(wallToEpoch({ y: 2026, mo: 11, d: 17, h: 14, mi: 30 }, 'America/New_York')).toISOString(), '2026-11-17T19:30:00.000Z')
  // 2026-07-01 09:00 in New York (EDT, UTC-4) = 13:00Z
  assert.equal(new Date(wallToEpoch({ y: 2026, mo: 7, d: 1, h: 9, mi: 0 }, 'America/New_York')).toISOString(), '2026-07-01T13:00:00.000Z')
  // Tokyo has no DST, UTC+9
  assert.equal(new Date(wallToEpoch({ y: 2026, mo: 11, d: 18, h: 8, mi: 0 }, 'Asia/Tokyo')).toISOString(), '2026-11-17T23:00:00.000Z')
  // round trip
  const w = wallClock(Date.parse('2026-03-29T01:30:00Z'), 'Europe/London')
  assert.deepEqual([w.h, w.mi], [2, 30]) // BST started 01:00Z
})

const Z = [
  L('z', 'calendar_entry', { date: '2026-11-17', time: '14:30', text: 'NY call', entryType: 'call', tz: 'America/New_York' }, '2026-11-10T10:00:00Z'),
  L('zd', 'calendar_entry', { date: '2026-11-18', text: 'Tokyo day', entryType: 'task', tz: 'Asia/Tokyo' }, '2026-11-10T10:00:00Z'),
]

t('dueAlerts: zoned T-15 / T-0 independent of device zone', () => {
  const { entries } = foldCalendar(Z)
  assert.deepEqual(dueAlerts(entries, new Set(), Date.parse('2026-11-17T19:16:00Z')).due.map(d => d.key), ['z:T-15'])
  assert.deepEqual(dueAlerts(entries, new Set(), Date.parse('2026-11-17T19:30:00Z')).due.map(d => d.key), ['z:T-0'])
  assert.equal(dueAlerts(entries, new Set(), Date.parse('2026-11-17T19:14:00Z')).due.length, 0)
})

t('dueAlerts: zoned DAY fires at 08:00 in entry zone', () => {
  const { entries } = foldCalendar(Z)
  // 08:00 Tokyo on the 18th = 23:00Z on the 17th
  assert.equal(dueAlerts(entries, new Set(), Date.parse('2026-11-17T22:59:00Z')).due.filter(d => d.entry.id === 'zd').length, 0)
  assert.deepEqual(dueAlerts(entries, new Set(), Date.parse('2026-11-17T23:00:00Z')).due.filter(d => d.entry.id === 'zd').map(d => d.key), ['zd:DAY'])
})

t('snooze: SNZ fires once at until, FLASH for call, cleared by done', () => {
  const until = '2026-11-17T19:40:00Z'
  const s = [...Z, L('sn', 'calendar_snooze', { entryId: 'z', until, minutes: 5 }, '2026-11-17T19:35:00Z')]
  const { entries } = foldCalendar(s)
  assert.equal(dueAlerts(entries, new Set(['z:T-0']), Date.parse('2026-11-17T19:39:00Z')).due.length, 0)
  const r = dueAlerts(entries, new Set(['z:T-0']), Date.parse('2026-11-17T19:40:01Z'))
  const k = alertKey('z', 'SNZ', Date.parse(until))
  assert.deepEqual(r.due.map(d => d.key), [k])
  assert.equal(alertPriority(r.due[0].entry, 'SNZ'), 'FLASH')
  assert.equal(dueAlerts(entries, new Set(['z:T-0', k]), Date.parse('2026-11-17T19:41:00Z')).due.length, 0)
  const done = foldCalendar([...s, L('d', 'calendar_status', { entryId: 'z', status: 'done' }, '2026-11-17T19:36:00Z')])
  assert.equal(dueAlerts(done.entries, new Set(['z:T-0']), Date.parse('2026-11-17T19:41:00Z')).due.length, 0)
})

t('alert keys: metadata round-trips through fold (new + legacy shape)', () => {
  const { entries } = foldCalendar(Z)
  const due = dueAlerts(entries, new Set(), Date.parse('2026-11-17T19:30:00Z')).due[0]
  const md = alertMetadata(due, Date.parse('2026-11-17T19:30:00Z'), 'watch')
  assert.equal(loggedAlertKey(md), 'z:T-0')
  assert.equal(loggedAlertKey({ entryId: 'z', phase: 'T-15' }), 'z:T-15')
  const f = foldCalendar([...Z, L('al2', 'calendar_alert', md, '2026-11-17T19:30:01Z')])
  assert.ok(f.firedAlerts.has('z:T-0'))
  assert.equal(f.firedAt.get('z:T-0'), Date.parse('2026-11-17T19:30:00Z'))
})

t('zoneTag + DTG in entry zone', () => {
  const { entries } = foldCalendar(Z)
  assert.equal(zoneTag(entries[0], 'America/Los_Angeles'), 'NEW YORK')
  assert.equal(zoneTag(entries[0], 'America/New_York'), null)
  assert.equal(formatDTG(Date.parse('2026-11-17T19:30:00Z'), 'America/New_York'), '171430L NOV 26')
  assert.equal(entryStartMs(entries[0]), Date.parse('2026-11-17T19:30:00Z'))
})

console.log(`\nCALENDAR ENGINE: ${n}/${n} GREEN`)
