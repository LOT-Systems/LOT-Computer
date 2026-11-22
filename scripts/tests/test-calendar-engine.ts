/**
 * Calendar engine tests — run: npx tsx scripts/tests/test-calendar-engine.ts
 * Run under several zones: TZ=America/Los_Angeles, TZ=Asia/Kolkata, TZ=UTC
 */
import assert from 'node:assert/strict'
import * as cal from '../../src/shared/utils/calendar'

let passed = 0
const t = (name: string, fn: () => void) => {
  try { fn(); passed++ } catch (e) { console.error(`✗ ${name}`); throw e }
}

const log = (id: string, event: string, metadata: any, createdAt: string) =>
  ({ id, event, text: '', metadata, createdAt })

// ── parseTime ──
t('parseTime canonical', () => {
  assert.equal(cal.parseTime('14:30'), '14:30')
  assert.equal(cal.parseTime('1430'), '14:30')
  assert.equal(cal.parseTime('9:05'), '09:05')
  assert.equal(cal.parseTime('905'), '09:05')
  assert.equal(cal.parseTime('9'), '09:00')
  assert.equal(cal.parseTime('9am'), '09:00')
  assert.equal(cal.parseTime('2:30 pm'), '14:30')
  assert.equal(cal.parseTime('12am'), '00:00')
  assert.equal(cal.parseTime('12pm'), '12:00')
  assert.equal(cal.parseTime(''), null)
  assert.equal(cal.parseTime('  '), null)
  assert.equal(cal.parseTime('25:00'), undefined)
  assert.equal(cal.parseTime('12:60'), undefined)
  assert.equal(cal.parseTime('13pm'), undefined)
  assert.equal(cal.parseTime('abc'), undefined)
})

// ── dates ──
t('isDateKey rejects impossible dates', () => {
  assert.ok(cal.isDateKey('2026-02-28'))
  assert.ok(!cal.isDateKey('2026-02-30'))
  assert.ok(!cal.isDateKey('2026-2-3'))
  assert.ok(!cal.isDateKey(undefined))
})

t('fromDateKey is local, not UTC', () => {
  const d = cal.fromDateKey('2026-11-23')
  assert.equal(d.getDate(), 23)
  assert.equal(d.getHours(), 0)
  assert.equal(cal.toDateKey(d), '2026-11-23')
})

t('month grid: Feb viewed from any day never overflows', () => {
  const g = cal.getMonthGrid(2026, 1) // Feb 2026 starts Sunday
  assert.equal(g[0][6].getDate(), 1)
  assert.equal(g[0][6].getMonth(), 1)
  assert.ok(g.every(w => w.length === 7))
  const all = g.flat().filter(d => d.getMonth() === 1)
  assert.equal(all.length, 28)
  assert.equal(g[0][0].getDay(), 1) // Monday-first
})

t('month grid row count', () => {
  assert.equal(cal.getMonthGrid(2026, 10).length, 6) // Nov 2026: starts Sun, 30 days
  assert.equal(cal.getMonthGrid(2027, 1).length, 4)  // Feb 2027: starts Mon, 28 days
})

// ── derivation ──
const logs = [
  log('a', 'calendar_entry', { date: '2026-11-23', time: '14:30', text: 'Call Dmitri', entryType: 'call' }, '2026-11-20T10:00:00Z'),
  log('b', 'calendar_entry', { date: '2026-11-23', text: 'Ship report', entryType: 'task' }, '2026-11-20T11:00:00Z'),
  log('c', 'calendar_entry', { date: '2026-11-22', time: '09:00', text: 'Old', entryType: 'task' }, '2026-11-19T11:00:00Z'),
  log('bad', 'calendar_entry', { date: '2026-13-01', text: 'x' }, '2026-11-19T11:00:00Z'),
  log('legacy', 'calendar_entry', { date: '2026-11-25', text: 'Legacy entry' }, '2026-11-01T11:00:00Z'),
  log('s1', 'calendar_status', { entryId: 'b', status: 'done' }, '2026-11-21T10:00:00Z'),
  log('s2', 'calendar_status', { entryId: 'b', status: 'open' }, '2026-11-21T11:00:00Z'),
  log('s3', 'calendar_status', { entryId: 'legacy', status: 'cancelled' }, '2026-11-21T11:00:00Z'),
]

t('buildEntries: validation, legacy defaults, latest status wins, ordering', () => {
  const es = cal.buildEntries(logs)
  assert.deepEqual(es.map(e => e.id), ['c', 'b', 'a', 'legacy'])
  assert.equal(es.find(e => e.id === 'b')!.status, 'open')
  assert.equal(es.find(e => e.id === 'legacy')!.status, 'cancelled')
  assert.equal(es.find(e => e.id === 'legacy')!.type, 'note')
  assert.equal(es.find(e => e.id === 'b')!.time, null)
})

t('buildEntries: order-independent input', () => {
  assert.deepEqual(cal.buildEntries([...logs].reverse()), cal.buildEntries(logs))
})

// ── alerts ──
const entries = cal.buildEntries(logs)
const at = (s: string) => { const [d, hm] = s.split(' '); const x = cal.fromDateKey(d); const [h, m] = hm.split(':').map(Number); x.setHours(h, m, 0, 0); return x }

t('no alert before T-15 window', () => {
  const due = cal.dueAlerts(entries, at('2026-11-23 07:00'), new Set())
  assert.deepEqual(due.map(d => d.key), [])
})

t('DAY order at 08:00 for untimed entry', () => {
  const due = cal.dueAlerts(entries, at('2026-11-23 08:00'), new Set())
  assert.deepEqual(due.map(d => d.key), ['b:DAY'])
})

t('T-15 window', () => {
  const due = cal.dueAlerts(entries, at('2026-11-23 14:15'), new Set(['b:DAY']))
  assert.deepEqual(due.map(d => d.key), ['a:T-15'])
  assert.deepEqual(cal.dueAlerts(entries, at('2026-11-23 14:14'), new Set(['b:DAY'])).map(d => d.key), [])
})

t('T-0 window and grace expiry', () => {
  const fired = new Set(['b:DAY', 'a:T-15'])
  assert.deepEqual(cal.dueAlerts(entries, at('2026-11-23 14:30'), fired).map(d => d.key), ['a:T-0'])
  assert.deepEqual(cal.dueAlerts(entries, at('2026-11-23 15:29'), fired).map(d => d.key), ['a:T-0'])
  assert.deepEqual(cal.dueAlerts(entries, at('2026-11-23 15:30'), fired).map(d => d.key), [])
})

t('fired alerts are not repeated (idempotent from Log)', () => {
  const alertLogs = [log('x', 'calendar_alert', { entryId: 'a', stage: 'T-0' }, '2026-11-23T14:30:00Z')]
  const fired = cal.firedAlertKeys(alertLogs)
  assert.ok(fired.has('a:T-0'))
  assert.deepEqual(cal.dueAlerts(entries, at('2026-11-23 14:40'), fired).map(d => d.key).filter(k => k.startsWith('a')), [])
})

t('closed entries never alert', () => {
  const closed = entries.map(e => ({ ...e, status: 'done' as const }))
  assert.deepEqual(cal.dueAlerts(closed, at('2026-11-23 14:30'), new Set()), [])
})

// ── overdue + agenda ──
t('overdue: past timed task beyond grace; notes never overdue', () => {
  const c = entries.find(e => e.id === 'c')!
  assert.ok(cal.isOverdue(c, at('2026-11-22 10:00')))
  assert.ok(!cal.isOverdue(c, at('2026-11-22 09:59')))
  assert.ok(!cal.isOverdue({ ...c, type: 'note' }, at('2026-11-23 10:00')))
})

t('agenda keeps overdue tasks, drops closed and past notes', () => {
  const ag = cal.agenda(entries, at('2026-11-23 10:00'))
  assert.deepEqual(ag.map(e => e.id), ['c', 'b', 'a'])
})

t('next boundary', () => {
  const ms = cal.msUntilNextBoundary(entries, at('2026-11-23 14:00'))
  assert.equal(ms, 15 * 60000)
})

// ── formatting ──
t('entryDTG is timezone-independent', () => {
  assert.equal(cal.entryDTG({ date: '2026-11-23', time: '14:30' }), '231430J NOV 26')
  assert.equal(cal.entryDTG({ date: '2026-01-05', time: null }), '05----J JAN 26')
})

t('countdown', () => {
  assert.equal(cal.countdown(at('2026-11-23 14:30'), at('2026-11-23 14:15')), 'T-00:15')
  assert.equal(cal.countdown(at('2026-11-23 14:30'), at('2026-11-23 14:35')), 'T+00:05')
  assert.equal(cal.countdown(at('2026-11-26 14:30'), at('2026-11-23 14:30')), 'T-3D')
})

t('log text formats', () => {
  const a = entries.find(e => e.id === 'a')!
  assert.equal(cal.entryLogText(a), '[CAL] SCHEDULED · CALL · 231430J NOV 26 · Call Dmitri')
  assert.equal(cal.alertLogText(a, 'T-15'), '[CAL] ALERT T-15 · CALL · 1430 · Call Dmitri')
  assert.equal(cal.statusLogText(a, 'cancelled'), '[CAL] SCRUBBED · CALL · Call Dmitri')
})

t('zone letter', () => {
  const z = cal.zoneLetter(new Date())
  assert.match(z, /^[A-IK-Z]$|^J$/)
})

console.log(`✓ calendar engine: ${passed} tests passed (TZ=${process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone})`)
