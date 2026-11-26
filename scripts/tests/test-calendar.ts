/**
 * Calendar core — deterministic unit checks.
 * Run: npx esr ./scripts/tests/test-calendar.ts
 */
import dayjs from '../../src/client/utils/dayjs'
import {
  alertKey, dueAlerts, entryInstant, foldCalendarLogs, formatCountdown,
  getMonthWeeks, isOverdue, militaryTime, nextEntry, parseTimeInput, upcomingEntries,
} from '../../src/client/utils/calendar'

let pass = 0, fail = 0
function eq(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  ok ? pass++ : fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`)
}

// parseTimeInput
eq('time 1430', parseTimeInput('1430'), '14:30')
eq('time 930', parseTimeInput('930'), '09:30')
eq('time 9:05', parseTimeInput('9:05'), '09:05')
eq('time 14', parseTimeInput('14'), '14:00')
eq('time 9am', parseTimeInput('9am'), '09:00')
eq('time 12am', parseTimeInput('12am'), '00:00')
eq('time 12pm', parseTimeInput('12pm'), '12:00')
eq('time 9:15 PM', parseTimeInput('9:15 PM'), '21:15')
eq('time 1430H', parseTimeInput('1430H'), '14:30')
eq('time empty', parseTimeInput('  '), null)
eq('time 2460 invalid', parseTimeInput('2460'), undefined)
eq('time 25 invalid', parseTimeInput('25'), undefined)
eq('time 13pm invalid', parseTimeInput('13pm'), undefined)
eq('time abc invalid', parseTimeInput('abc'), undefined)
eq('military', militaryTime('07:05'), '0705H')

// countdown
eq('countdown 2h14m5s', formatCountdown((2 * 3600 + 14 * 60 + 5) * 1000), 'T-02:14:05')
eq('countdown 3d4h', formatCountdown((3 * 86400 + 4 * 3600 + 10) * 1000), 'T-3D 04H')
eq('countdown past', formatCountdown(-5 * 60 * 1000), 'T+00:05:00')

// month grid — overflow regression (Jan 31 -> Feb must stay Feb)
const feb = getMonthWeeks(2027, 1)
eq('feb 2027 contains Feb 1', feb.flat().some(d => d.format('YYYY-MM-DD') === '2027-02-01'), true)
eq('feb 2027 starts Monday', feb[0][0].day(), 1)
eq('feb 2027 rows', feb.length, 4)
eq('nov 2026 rows', getMonthWeeks(2026, 10).length, 6)

// fold
const E1 = '00000000-0000-4000-8000-00000000a001'
const E2 = '00000000-0000-4000-8000-00000000a002'
const E3 = '00000000-0000-4000-8000-00000000a003'
const logs = [
  { id: 'x1', event: 'calendar_status', metadata: { entryId: E2, status: 'done' }, createdAt: '2026-11-26T10:00:00Z' },
  { id: 'x0', event: 'calendar_status', metadata: { entryId: E2, status: 'open' }, createdAt: '2026-11-26T09:00:00Z' },
  { id: 'x2', event: 'calendar_alert', metadata: { entryId: E1, phase: 'T-15', alertKey: `${E1}:T-15` }, createdAt: '2026-11-26T09:00:00Z' },
  { id: E1, event: 'calendar_entry', metadata: { date: '2026-11-26', time: '14:30', text: 'Call ops', entryType: 'call' }, createdAt: '2026-11-25T09:00:00Z' },
  { id: E2, event: 'calendar_entry', metadata: { date: '2026-11-26', text: 'Done task', entryType: 'task' }, createdAt: '2026-11-25T09:00:00Z' },
  { id: E3, event: 'calendar_entry', metadata: { date: '2026-11-27', text: 'Untimed', entryType: 'note' }, createdAt: '2026-11-25T09:00:00Z' },
  { id: 'bad', event: 'calendar_entry', metadata: { date: '2026-02-30', text: 'Invalid date' }, createdAt: '2026-11-25T09:00:00Z' },
  { id: 'legacy', event: 'calendar_entry', metadata: { date: '2026-11-28', text: 'Legacy', entryType: 'call', time: 'bogus' }, createdAt: '2026-11-25T09:00:00Z' },
]
const { entries, fired } = foldCalendarLogs(logs)
eq('fold drops invalid date', entries.map(e => e.id), [E2, E1, E3, 'legacy'])
eq('fold latest status wins', entries.find(e => e.id === E2)!.status, 'done')
eq('fold bogus time -> null', entries.find(e => e.id === 'legacy')!.time, null)
eq('fold fired ledger', fired.has(alertKey(E1, 'T-15')), true)

const at = (s: string) => dayjs(s)
// Before window: nothing
eq('due 14:00 nothing', dueAlerts(entries, at('2026-11-26T14:00:00'), new Set()).map(a => a.key), [])
// Pre-alert window
eq('due 14:20 T-15', dueAlerts(entries, at('2026-11-26T14:20:00'), new Set()).map(a => a.phase), ['T-15'])
eq('due 14:20 T-15 already fired', dueAlerts(entries, at('2026-11-26T14:20:00'), fired).map(a => a.phase), [])
// T-0
eq('due 14:30 T-0', dueAlerts(entries, at('2026-11-26T14:30:00'), fired).map(a => a.phase), ['T-0'])
// Grace expired
eq('due 16:31 none', dueAlerts(entries, at('2026-11-26T16:31:00'), fired).map(a => a.phase), [])
// Done entries never alert; untimed DAY alert on its date at/after 09:00
eq('due 27th 08:59 none', dueAlerts(entries, at('2026-11-27T08:59:00'), fired).length, 0)
eq('due 27th 09:00 DAY', dueAlerts(entries, at('2026-11-27T09:00:00'), fired).map(a => `${a.entry.id}:${a.phase}`), [`${E3}:DAY`])

const retro = foldCalendarLogs([
  { id: 'r1', event: 'calendar_entry', metadata: { date: '2026-11-26', time: '10:00', text: 'Retro', entryType: 'task' }, createdAt: dayjs('2026-11-26T10:30:00').toISOString() },
]).entries
eq('retroactive entry no alert', dueAlerts(retro, at('2026-11-26T10:45:00'), new Set()).length, 0)

// overdue / upcoming / next
const now = at('2026-11-26T15:00:00')
eq('overdue timed past', isOverdue(entries.find(e => e.id === E1)!, now), true)
eq('not overdue future', isOverdue(entries.find(e => e.id === E3)!, now), false)
eq('upcoming excludes done', upcomingEntries(entries, now).map(e => e.id), [E1, E3, 'legacy'])
eq('next skips past timed', nextEntry(entries, now)?.id, E3)
eq('instant untimed 09:00', entryInstant({ date: '2026-11-27', time: null }).format('HH:mm'), '09:00')

console.log(`\n${pass} passed, ${fail} failed`)
if (fail) process.exit(1)
