/**
 * Calendar engine self-check — run: npx tsx scripts/calendar-selfcheck.ts
 * Pure-logic assertions for src/client/utils/calendar.ts (no DB, no browser).
 */
import assert from 'node:assert/strict'
import {
  alertKey, deriveEntries, dueAlerts, firedKeysFromLogs, formatCountdown,
  nextAlertAt, normalizeTime, CalendarLog,
} from '../src/client/utils/calendar'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log(`  ✓ ${name}`) }
const at = (s: string) => new Date(s) // local time

const logs: CalendarLog[] = [
  { id: 'a', event: 'calendar_entry', createdAt: '2026-11-20T10:00:00Z', metadata: { date: '2026-11-25', time: '14:30', text: 'Dentist', entryType: 'call', lead: 10 } },
  { id: 'b', event: 'calendar_entry', createdAt: '2026-11-20T10:01:00Z', metadata: { date: '2026-11-25', text: 'Pay rent', entryType: 'task' } },
  { id: 'c', event: 'calendar_entry', createdAt: '2026-11-20T10:02:00Z', metadata: { date: '2026-11-25', time: '09:00', text: 'Standup', entryType: 'call', lead: 0 } },
  { id: 'd', event: 'calendar_entry', createdAt: '2026-11-20T10:03:00Z', metadata: { date: '2026-11-25', time: '16:00', text: 'Cancelled thing', entryType: 'task' } },
  { id: 's1', event: 'calendar_status', createdAt: '2026-11-21T10:00:00Z', metadata: { entryId: 'd', status: 'done' } },
  { id: 's2', event: 'calendar_status', createdAt: '2026-11-22T10:00:00Z', metadata: { entryId: 'd', status: 'cancelled' } },
  { id: 'x', event: 'calendar_entry', createdAt: '2026-11-20T10:04:00Z', metadata: { date: 'bogus', text: 'bad' } },
  { id: 'y', event: 'calendar_entry', createdAt: '2026-11-20T10:05:00Z', metadata: { date: '2026-11-26', time: '25:00', text: 'bad time → untimed' } },
]

console.log('calendar-selfcheck')
const entries = deriveEntries(logs)

t('derive: invalid dates dropped, invalid time → untimed, legacy lead default', () => {
  assert.equal(entries.length, 5)
  assert.equal(entries.find(e => e.id === 'y')!.time, null)
  assert.equal(entries.find(e => e.id === 'b')!.lead, 10)
})
t('derive: latest status wins', () => assert.equal(entries.find(e => e.id === 'd')!.status, 'cancelled'))
t('derive: order = date, untimed first, then time', () =>
  assert.deepEqual(entries.map(e => e.id), ['b', 'c', 'a', 'd', 'y']))

t('due: nothing for timed entry before lead window', () =>
  assert.equal(dueAlerts(entries, at('2026-11-25T14:19:00'), new Set(['b:day', 'c:zero'])).length, 0))
t('due: lead fires inside window', () => {
  const d = dueAlerts(entries, at('2026-11-25T14:21:00'), new Set(['b:day', 'c:zero']))
  assert.deepEqual(d.map(a => a.key), ['a:lead'])
  assert.equal(d[0].offset, -9)
})
t('due: zero fires at T-0 and suppresses lead when late', () => {
  const d = dueAlerts(entries, at('2026-11-25T14:35:00'), new Set(['b:day', 'c:zero']))
  assert.deepEqual(d.map(a => a.key), ['a:zero'])
  assert.equal(d[0].offset, 5)
})
t('due: no stale alerts beyond grace', () =>
  assert.equal(dueAlerts(entries, at('2026-11-25T15:05:00'), new Set(['b:day', 'c:zero'])).length, 0))
t('due: cancelled entries never alert', () =>
  assert.ok(!dueAlerts(entries, at('2026-11-25T16:00:30'), new Set()).some(a => a.entry.id === 'd')))
t('due: untimed day brief only after 07:00 on the day', () => {
  assert.ok(!dueAlerts(entries, at('2026-11-25T06:59:00'), new Set()).some(a => a.key === 'b:day'))
  assert.ok(dueAlerts(entries, at('2026-11-25T07:00:00'), new Set()).some(a => a.key === 'b:day'))
  assert.ok(!dueAlerts(entries, at('2026-11-24T12:00:00'), new Set()).some(a => a.key === 'b:day'))
})
t('due: lead=0 fires only zero', () => {
  assert.equal(dueAlerts(entries, at('2026-11-25T08:59:00'), new Set(['b:day'])).length, 0)
  assert.deepEqual(dueAlerts(entries, at('2026-11-25T09:00:00'), new Set(['b:day'])).map(a => a.key), ['c:zero'])
})
t('dedupe: fired keys from logs', () => {
  const fired = firedKeysFromLogs([{ id: 'z', event: 'calendar_alert', createdAt: '', metadata: { entryId: 'a', phase: 'lead' } }])
  assert.ok(fired.has(alertKey('a', 'lead')))
  assert.equal(dueAlerts(entries, at('2026-11-25T14:21:00'), new Set([...fired, 'b:day', 'c:zero'])).length, 0)
})
t('next: scheduler wakes exactly at next boundary', () => {
  const next = nextAlertAt(entries, at('2026-11-25T10:00:00'), new Set(['b:day', 'c:zero']))
  assert.equal(next, at('2026-11-25T14:20:00').getTime())
})
t('normalizeTime', () => {
  assert.equal(normalizeTime('9'), '09:00')
  assert.equal(normalizeTime('930'), '09:30')
  assert.equal(normalizeTime('21:05'), '21:05')
  assert.equal(normalizeTime('7.45'), '07:45')
  assert.equal(normalizeTime('21h'), '21:00')
  assert.equal(normalizeTime('24:00'), null)
  assert.equal(normalizeTime('9:7'), null)
  assert.equal(normalizeTime('abc'), null)
})
t('formatCountdown', () => {
  assert.equal(formatCountdown(600_000, 1_000), 'T-09:59')
  assert.equal(formatCountdown(0, 192_000), 'T+03:12')
  assert.equal(formatCountdown(2 * 3600_000 + 5 * 60_000, 0), 'T-02H05')
})
console.log(`  ${n} checks passed`)
