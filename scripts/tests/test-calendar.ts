/**
 * Calendar core logic test — run: npx tsx --tsconfig tsconfig.json scripts/tests/test-calendar.ts
 */
import {
  parseEntries, dueAlerts, normalizeTime, getMonthWeeks, formatT, formatTShort,
  nextAlertAt, isValidDate, alertSchedule,
} from '../../src/client/utils/calendar'

let fail = 0
const eq = (name: string, a: unknown, b: unknown) => {
  const ok = JSON.stringify(a) === JSON.stringify(b)
  if (!ok) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  got=${JSON.stringify(a)} want=${JSON.stringify(b)}`}`)
}

// normalizeTime
eq('time 930', normalizeTime('930'), '09:30')
eq('time 9:30', normalizeTime('9:30'), '09:30')
eq('time 21', normalizeTime('21'), '21:00')
eq('time empty', normalizeTime(' '), null)
eq('time 2460 invalid', normalizeTime('2460'), undefined)
eq('time abc invalid', normalizeTime('ab'), undefined)

// dates
eq('valid date', isValidDate('2026-02-28'), true)
eq('invalid Feb 30', isValidDate('2026-02-30'), false)

// month grid — rows always whole weeks, Monday first, contains 1st and last
for (const [y, m] of [[2026, 1], [2026, 10], [2027, 1], [2026, 7]] as const) {
  const w = getMonthWeeks(y, m)
  const flat = w.flat()
  eq(`grid ${y}-${m + 1} monday-first`, flat[0].day(), 1)
  eq(`grid ${y}-${m + 1} has 1st`, flat.some(d => d.month() === m && d.date() === 1), true)
  eq(`grid ${y}-${m + 1} has last`, flat.some(d => d.month() === m && d.date() === flat.find(x => x.month() === m)!.daysInMonth()), true)
  eq(`grid ${y}-${m + 1} rows 5-6`, w.length >= 5 && w.length <= 6, true)
}

// entries + status
const created = new Date(2026, 10, 16, 8, 0).toISOString()
const logs = [
  { id: 'a', event: 'calendar_entry', createdAt: created, metadata: { date: '2026-11-16', time: '14:30', text: 'Call foundry', entryType: 'call' } },
  { id: 'b', event: 'calendar_entry', createdAt: created, metadata: { date: '2026-11-16', text: 'Review', entryType: 'task' } },
  { id: 'c', event: 'calendar_entry', createdAt: created, metadata: { date: '2026-11-17', time: '09:00', text: 'Ship', entryType: 'task' } },
  { id: 'd', event: 'calendar_done', createdAt: created, metadata: { entryId: 'c' } },
  { id: 'e', event: 'calendar_entry', createdAt: created, metadata: { date: 'bad', text: 'x' } },
]
const entries = parseEntries(logs)
eq('parse count', entries.length, 3)
eq('sort all-day first', entries.map(e => e.id), ['b', 'a', 'c'])
eq('done status', entries.find(e => e.id === 'c')!.status, 'done')

const at = (h: number, m: number) => new Date(2026, 10, 16, h, m).getTime()
eq('no alert 14:00', dueAlerts(entries, at(14, 0), new Set()).map(a => a.key), [])
eq('day alert 09:00', dueAlerts(entries, at(9, 0), new Set()).map(a => a.key), ['b:day'])
eq('pre alert 14:15', dueAlerts(entries, at(14, 15), new Set(['b:day'])).map(a => a.key), ['a:pre'])
eq('now alert 14:30', dueAlerts(entries, at(14, 30), new Set(['b:day', 'a:pre'])).map(a => a.key), ['a:now'])
eq('only latest stage (no stack)', dueAlerts(entries, at(14, 31), new Set(['b:day'])).map(a => a.key), ['a:now'])
eq('dedup', dueAlerts(entries, at(14, 31), new Set(['b:day', 'a:now'])).map(a => a.key), [])
eq('grace expired', dueAlerts(entries, at(17, 0), new Set(['b:day'])).map(a => a.key), [])
eq('next alert', nextAlertAt(entries, at(10, 0)), at(14, 15))

// entry created after its moment never fires
const late = parseEntries([{ id: 'z', event: 'calendar_entry', createdAt: new Date(2026, 10, 16, 15, 0).toISOString(), metadata: { date: '2026-11-16', time: '14:30', text: 'late', entryType: 'task' } }])
eq('late-created suppressed', dueAlerts(late, at(15, 1), new Set()).length, 0)
eq('schedule pre is -15m', alertSchedule(entries[1])[0].at, at(14, 15))

// countdown
eq('formatT', formatT(at(14, 30), at(14, 15)), 'T-15:00')
eq('formatT plus', formatT(at(14, 30), at(14, 31)), 'T+01:00')
eq('formatTShort', formatTShort(at(14, 30), at(10, 15)), 'T-4H 15M')

console.log(fail ? `\n${fail} FAILED` : '\nALL PASS')
process.exit(fail ? 1 : 0)
