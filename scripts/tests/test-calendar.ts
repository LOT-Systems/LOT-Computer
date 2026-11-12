/**
 * Calendar engine self-test — run: npx esr ./scripts/tests/test-calendar.ts
 * Pure logic only (no DB, no network).
 */
import {
  buildCalendar, normalizeTime, isValidDate, pendingAlert, formatCountdown,
  computeDueAt, upcoming, overdue, nextAlertBoundary, PRE_ALERT_MS, LATE_GRACE_MS,
} from '../../src/client/utils/calendar.ts'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) { pass++; console.log(`  PASS  ${name}`) }
  else { fail++; console.log(`  FAIL  ${name}`, detail ?? '') }
}

console.log('CALENDAR ENGINE · SELF-TEST')

// normalizeTime
check('time 9:05 → 09:05', normalizeTime('9:05') === '09:05')
check('time 1430 → 14:30', normalizeTime('1430') === '14:30')
check('time 7 → 07:00', normalizeTime('7') === '07:00')
check('time 24:00 rejected', normalizeTime('24:00') === null)
check('time 12:60 rejected', normalizeTime('12:60') === null)
check('time empty → null', normalizeTime('') === null)
check('time junk → null', normalizeTime('noon') === null)

// isValidDate
check('date 2026-02-29 rejected', !isValidDate('2026-02-29'))
check('date 2028-02-29 accepted', isValidDate('2028-02-29'))
check('date non-string rejected', !isValidDate(20261112))

// buildCalendar
const logs = [
  { id: 'a', event: 'calendar_entry', createdAt: '2026-11-10T10:00:00Z', metadata: { date: '2026-11-12', time: '14:30', text: 'Briefing', entryType: 'call' } },
  { id: 'b', event: 'calendar_entry', createdAt: '2026-11-10T10:01:00Z', metadata: { date: '2026-11-12', text: 'Legacy note', entryType: 'note' } },
  { id: 'c', event: 'calendar_entry', createdAt: '2026-11-10T10:02:00Z', metadata: { date: '2026-11-01', time: '08:00', text: 'Old task', entryType: 'task' } },
  { id: 'd', event: 'calendar_entry', createdAt: '2026-11-10T10:03:00Z', metadata: { date: 'bad', text: 'x' } },
  { id: 's2', event: 'calendar_status', createdAt: '2026-11-11T11:00:00Z', metadata: { entryId: 'c', status: 'scheduled' } },
  { id: 's1', event: 'calendar_status', createdAt: '2026-11-11T10:00:00Z', metadata: { entryId: 'c', status: 'done' } },
  { id: 'al', event: 'calendar_alert', createdAt: '2026-11-12T14:15:00Z', metadata: { entryId: 'a', stage: 'T-15' } },
  { id: 'n', event: 'note', text: 'hi' },
]
const cal = buildCalendar(logs as any)
check('malformed entry dropped', cal.length === 3, cal.map(e => e.id))
check('all-day sorts before timed same day', cal[1].id === 'b' && cal[2].id === 'a', cal.map(e => e.id))
check('status latest-by-time wins (reopened)', cal.find(e => e.id === 'c')!.status === 'scheduled')
check('alert folded into entry', cal.find(e => e.id === 'a')!.alerts.has('T-15'))

// pendingAlert
const a = cal.find(e => e.id === 'a')!
const due = computeDueAt('2026-11-12', '14:30')
check('dueAt local 14:30', new Date(due).getHours() === 14 && new Date(due).getMinutes() === 30)
check('no alert 20m before', pendingAlert({ ...a, alerts: new Set() }, due - 20 * 60e3) === null)
check('T-15 inside window', pendingAlert({ ...a, alerts: new Set() }, due - 10 * 60e3) === 'T-15')
check('T-15 not repeated', pendingAlert(a, due - 10 * 60e3) === null)
check('T-0 at due', pendingAlert(a, due) === 'T-0')
check('T-0 skips T-15 when late', pendingAlert({ ...a, alerts: new Set() }, due + 60e3) === 'T-0')
check('no alert after grace', pendingAlert({ ...a, alerts: new Set() }, due + LATE_GRACE_MS + 1) === null)
check('closed entry silent', pendingAlert({ ...a, status: 'done', alerts: new Set() }, due) === null)
const b = cal.find(e => e.id === 'b')!
const bDue = computeDueAt('2026-11-12', null)
check('all-day: no T-15', pendingAlert(b, bDue - 5 * 60e3) === null)
check('all-day: T-0 at 09:00', pendingAlert(b, bDue) === 'T-0' && new Date(bDue).getHours() === 9)

// upcoming / overdue
const now = new Date(2026, 10, 12, 12, 0).getTime()
check('upcoming excludes past day', upcoming(cal, now).map(e => e.id).join() === 'b,a')
check('overdue lists reopened past entry', overdue(cal, now).map(e => e.id).join() === 'c')

// boundary
const bnd = nextAlertBoundary(cal, now)
check('next boundary = T-15 of 14:30', bnd === due - PRE_ALERT_MS - now, bnd)

// countdown
check('countdown hh:mm:ss', formatCountdown(1000 * 3725, 0) === 'T-01:02:05')
check('countdown days', formatCountdown(86400e3 * 2 + 3600e3 * 4, 0) === 'T-2D 04H')
check('countdown past', formatCountdown(0, 61e3) === 'T+00:01:01')

console.log(`\n${pass} PASS · ${fail} FAIL`)
if (fail) process.exit(1)
