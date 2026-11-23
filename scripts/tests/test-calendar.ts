/**
 * LOT SYSTEMS CORPORATION — Calendar v2 core verification.
 * Run: yarn test:calendar
 */
import dayjs from '#client/utils/dayjs'
import {
  alertKey,
  countdown,
  deriveEntries,
  dueAlerts,
  entryRef,
  firedAlertKeys,
  getMonthWeeks,
  isOverdue,
  isValidDate,
  normalizeTime,
} from '#client/utils/calendar'

let pass = 0
let fail = 0
function eq(label: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (ok) pass++
  else fail++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`)
}

// normalizeTime
eq('time 9 → 09:00', normalizeTime('9'), '09:00')
eq('time 930 → 09:30', normalizeTime('930'), '09:30')
eq('time 1415 → 14:15', normalizeTime('1415'), '14:15')
eq('time 9:05 → 09:05', normalizeTime('9:05'), '09:05')
eq('time 24:00 → null', normalizeTime('24:00'), null)
eq('time 12:60 → null', normalizeTime('12:60'), null)
eq('time abc → null', normalizeTime('abc'), null)
eq('time empty → null', normalizeTime(''), null)

// isValidDate
eq('date 2026-02-30 invalid', isValidDate('2026-02-30'), false)
eq('date 2026-11-23 valid', isValidDate('2026-11-23'), true)

// entryRef
eq('ref', entryRef('5a1c-77ff-0b3e'), 'CAL-0B3E')

// Month grid — regression: dayjs().month(1) on the 31st overflowed into March.
const feb = getMonthWeeks(2026, 1)
eq('feb 2026 starts Mon Jan 26', feb[0][0].format('YYYY-MM-DD'), '2026-01-26')
eq('feb 2026 includes Feb 28', feb.flat().some((d) => d.format('YYYY-MM-DD') === '2026-02-28'), true)
eq('feb 2026 has no March 8', feb.flat().some((d) => d.format('YYYY-MM-DD') === '2026-03-08'), false)
eq('nov 2026 = 6 weeks', getMonthWeeks(2026, 10).length, 6)
eq('every week has 7 days', getMonthWeeks(2026, 10).every((w) => w.length === 7), true)

// deriveEntries + status folding
const logs = [
  { id: 'a1', event: 'calendar_entry', createdAt: '2026-11-20T10:00:00Z', metadata: { date: '2026-11-23', time: '14:00', text: 'Sync', entryType: 'call' } },
  { id: 'a2', event: 'calendar_entry', createdAt: '2026-11-20T10:01:00Z', metadata: { date: '2026-11-23', text: 'Ship', entryType: 'task' } },
  { id: 'a3', event: 'calendar_entry', createdAt: '2026-11-20T10:02:00Z', metadata: { date: '2026-11-23', time: '09:00', text: 'Brief', entryType: 'note' } },
  { id: 'a4', event: 'calendar_entry', createdAt: '2026-11-20T10:03:00Z', metadata: { date: 'bad', text: 'x' } },
  { id: 's1', event: 'calendar_done', createdAt: '2026-11-21T10:00:00Z', metadata: { entryId: 'a2' } },
  { id: 'al', event: 'calendar_alert', createdAt: '2026-11-23T13:45:00Z', metadata: { entryId: 'a1', phase: 'T-15' } },
]
const entries = deriveEntries(logs)
eq('invalid date dropped', entries.length, 3)
eq('order: timed first by time, then untimed', entries.map((e) => e.id), ['a3', 'a1', 'a2'])
eq('done status folded', entries.find((e) => e.id === 'a2')!.status, 'done')
eq('fired keys', Array.from(firedAlertKeys(logs)), [alertKey('a1', 'T-15')])

// countdown
const now = dayjs('2026-11-23T11:48:30')
eq('countdown timed same day', countdown({ date: '2026-11-23', time: '14:00' }, now), 'T-02:11')
eq('countdown overdue', countdown({ date: '2026-11-23', time: '09:00' }, now), 'T+02:48')
eq('countdown days out', countdown({ date: '2026-11-25', time: '14:00' }, now), 'T-2D 02H')
eq('countdown untimed today', countdown({ date: '2026-11-23', time: null }, now), 'D-DAY')
eq('countdown untimed future', countdown({ date: '2026-11-26', time: null }, now), 'T-3D')
eq('countdown untimed past', countdown({ date: '2026-11-21', time: null }, now), 'T+2D')
eq('isOverdue timed past', isOverdue(entries.find((e) => e.id === 'a3')!, now), true)

// dueAlerts
const fired = firedAlertKeys(logs)
const at1350 = dayjs('2026-11-23T13:50:00')
eq('T-15 already fired → nothing at 13:50', dueAlerts(entries, fired, at1350).map((a) => a.phase), [])
const at1400 = dayjs('2026-11-23T14:00:10')
eq('T-0 fires at 14:00', dueAlerts(entries, fired, at1400).map((a) => `${a.entry.id}:${a.phase}`), ['a1:T-0'])
eq('done entries never alert', dueAlerts(entries, new Set(), dayjs('2026-11-23T09:05:00')).some((a) => a.entry.id === 'a2'), false)
eq('stale alerts suppressed (+2h)', dueAlerts(entries, new Set(), dayjs('2026-11-23T16:30:00')).length, 0)
eq('both phases due → only T-0', dueAlerts(entries, new Set(), dayjs('2026-11-23T14:01:00')).filter((a) => a.entry.id === 'a1').map((a) => a.phase), ['T-0'])
const untimed = deriveEntries([{ id: 'u1', event: 'calendar_entry', createdAt: 'x', metadata: { date: '2026-11-24', text: 'Board', entryType: 'task' } }])
eq('untimed alerts at 09:00', dueAlerts(untimed, new Set(), dayjs('2026-11-24T09:00:05')).map((a) => a.phase), ['T-0'])
eq('untimed silent at 08:59', dueAlerts(untimed, new Set(), dayjs('2026-11-24T08:59:00')).length, 0)

console.log(`\n${pass} passed · ${fail} failed`)
if (fail) process.exit(1)
