/**
 * LOT/CAL core — deterministic checks for src/shared/utils/calendar.ts
 * Run: npx tsx scripts/tests/test-calendar-core.ts
 */
import assert from 'node:assert/strict'
import {
  pendingAlert, dueAt, scheduledAt, isOverdue, tMinus, dtg, entryDtg, milTime,
  entryFromLog, compareEntries, isValidDate, isValidTime, alertLogText,
  type CalendarEntry,
} from '../../src/shared/utils/calendar'

let n = 0
const t = (name: string, fn: () => void) => { fn(); n++; console.log('  ✓', name) }

const base: CalendarEntry = {
  id: 'a', date: '2026-11-13', time: '14:30', text: 'Dentist', entryType: 'call',
  status: 'open', firedAt: null, prealertAt: null, snoozeUntil: null, createdAt: '2026-11-01T00:00:00.000Z',
}
const at = (h: number, m: number, d = 13) => new Date(2026, 10, d, h, m, 0, 0)

t('validators', () => {
  assert.ok(isValidDate('2026-11-13')); assert.ok(!isValidDate('2026-02-30')); assert.ok(!isValidDate('13/11/2026'))
  assert.ok(isValidTime('00:00')); assert.ok(isValidTime('23:59')); assert.ok(!isValidTime('24:00')); assert.ok(!isValidTime('9:00'))
})
t('scheduledAt timed / all-day 09:00', () => {
  assert.equal(scheduledAt(base).getTime(), at(14, 30).getTime())
  assert.equal(scheduledAt({ ...base, time: null }).getTime(), at(9, 0).getTime())
})
t('no alert before T-15', () => assert.equal(pendingAlert(base, at(14, 14)), null))
t('prealert inside T-15', () => assert.equal(pendingAlert(base, at(14, 15)), 'prealert'))
t('prealert only once', () => assert.equal(pendingAlert({ ...base, prealertAt: 'x' }, at(14, 20)), null))
t('fire at T-00', () => assert.equal(pendingAlert(base, at(14, 30)), 'fire'))
t('fire only once', () => assert.equal(pendingAlert({ ...base, firedAt: 'x' }, at(14, 31)), null))
t('late fire within 24h', () => assert.equal(pendingAlert(base, at(13, 0, 14)), 'fire'))
t('lapsed after 24h — no toast storm', () => assert.equal(pendingAlert(base, at(15, 0, 14)), null))
t('closed entries never alert', () => {
  assert.equal(pendingAlert({ ...base, status: 'done' }, at(14, 30)), null)
  assert.equal(pendingAlert({ ...base, status: 'void' }, at(14, 30)), null)
})
t('all-day: no prealert, fires 09:00', () => {
  const e = { ...base, time: null }
  assert.equal(pendingAlert(e, at(8, 50)), null)
  assert.equal(pendingAlert(e, at(9, 0)), 'fire')
})
t('snooze re-arms and overrides schedule', () => {
  const e = { ...base, firedAt: null, snoozeUntil: at(14, 40).toISOString() }
  assert.equal(dueAt(e).getTime(), at(14, 40).getTime())
  assert.equal(pendingAlert(e, at(14, 35)), null) // no prealert during snooze
  assert.equal(pendingAlert(e, at(14, 40)), 'fire')
})
t('overdue rules', () => {
  assert.ok(!isOverdue(base, at(14, 29))); assert.ok(isOverdue(base, at(14, 30)))
  const allDay = { ...base, time: null }
  assert.ok(!isOverdue(allDay, at(23, 59))); assert.ok(isOverdue(allDay, at(0, 1, 14)))
  assert.ok(!isOverdue({ ...base, status: 'done' }, at(20, 0)))
})
t('tMinus', () => {
  assert.equal(tMinus(at(14, 30), at(12, 16)), 'T-02:14')
  assert.equal(tMinus(at(14, 30), at(14, 29, 13)), 'T-00:01')
  assert.equal(tMinus(at(14, 30), at(14, 33)), 'T+00:03')
  assert.equal(tMinus(at(14, 30, 20), at(14, 30, 13)), 'T-7D')
})
t('military formats', () => {
  assert.equal(milTime(at(9, 5)), '0905')
  assert.equal(dtg(at(14, 30)), '131430J NOV 26')
  assert.equal(entryDtg(base), '131430J NOV 26')
  assert.equal(entryDtg({ ...base, time: null }), '13 NOV 26 ALL-DAY')
  assert.equal(alertLogText('ALERT', base), '[CAL/ALERT] 131430J NOV 26 · CALL · Dentist')
})
t('entryFromLog: legacy rows default to open / note, malformed rejected', () => {
  const e = entryFromLog({ id: 'x', text: '[SCHEDULE] …', metadata: { date: '2026-11-13', text: 'Old', entryType: 'bogus' }, createdAt: '2026-01-01' })!
  assert.equal(e.status, 'open'); assert.equal(e.entryType, 'note'); assert.equal(e.time, null)
  assert.equal(entryFromLog({ id: 'y', metadata: { date: 'nope', text: 'x' }, createdAt: '2026-01-01' }), null)
  assert.equal(entryFromLog({ id: 'z', metadata: { date: '2026-11-13' }, createdAt: '2026-01-01' }), null)
  assert.equal(entryFromLog({ id: 'w', metadata: { date: '2026-11-13', text: 'x', time: '25:00' }, createdAt: '2026-01-01' })!.time, null)
})
t('compareEntries: date, then all-day before timed, then time', () => {
  const xs = [
    { ...base, id: '3', time: '18:00' },
    { ...base, id: '1', time: null },
    { ...base, id: '0', date: '2026-11-12' },
    { ...base, id: '2', time: '08:00' },
  ].sort(compareEntries).map(e => e.id)
  assert.deepEqual(xs, ['0', '1', '2', '3'])
})
console.log(`\nLOT/CAL core: ${n}/${n} GREEN`)
