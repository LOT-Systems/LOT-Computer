/**
 * LOT SYSTEMS CORPORATION
 * Calendar engine verification — pure, no DB.
 *
 *   npx esr scripts/verify-calendar.ts
 *   TZ=America/Los_Angeles npx esr scripts/verify-calendar.ts
 *
 * Exits non-zero on any failed check.
 */

import {
  type CalEntry,
  type CalLogLike,
  alertKey,
  alertText,
  closeDelta,
  countdown,
  currentAlertLevel,
  dayDiff,
  deltaLabel,
  deriveEntries,
  firedAlertKeys,
  isOverdue,
  isValidCalDate,
  isValidCalTime,
  pendingAlerts,
  recentAlerts,
  toLocalDate,
  updateText,
} from '../src/shared/utils/calendar.ts'

let failed = 0
let passed = 0
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) { passed++; return }
  failed++
  console.log(`  FAIL  ${name}`, detail !== undefined ? JSON.stringify(detail) : '')
}

const at = (date: string, time = '00:00') => toLocalDate(date, time).getTime()
const MIN = 60_000

function entry(p: Partial<CalEntry> & { date: string }): CalEntry {
  return {
    id: p.id ?? 'e1',
    date: p.date,
    time: p.time ?? null,
    text: p.text ?? 'Brief the board',
    type: p.type ?? 'task',
    status: p.status ?? 'active',
    createdAt: p.createdAt ?? at('2026-11-01'),
    closedAt: null,
    deltaMinutes: null,
  }
}

// ── validation
check('date ok', isValidCalDate('2026-11-19'))
check('date feb 29 leap', isValidCalDate('2028-02-29'))
check('date feb 29 non-leap rejected', !isValidCalDate('2026-02-29'))
check('date garbage rejected', !isValidCalDate('2026-13-01') && !isValidCalDate('19/11/2026') && !isValidCalDate(null))
check('time ok', isValidCalTime('00:00') && isValidCalTime('23:59'))
check('time rejected', !isValidCalTime('24:00') && !isValidCalTime('9:00') && !isValidCalTime('12:60'))

// ── day math across DST (US: 2026-03-08, 2026-11-01)
check('dayDiff across spring DST', dayDiff('2026-03-07', '2026-03-09') === 2)
check('dayDiff across fall DST', dayDiff('2026-10-31', '2026-11-02') === 2)
check('dayDiff negative', dayDiff('2026-11-19', '2026-11-17') === -2)

// ── untimed ladder
{
  const e = entry({ date: '2026-11-20' })
  check('untimed D-2 → none', currentAlertLevel(e, at('2026-11-18', '10:00')) === null)
  check('untimed D-1 → NOTICE', currentAlertLevel(e, at('2026-11-19', '10:00')) === 'NOTICE')
  check('untimed D-0 → ALERT', currentAlertLevel(e, at('2026-11-20', '08:00')) === 'ALERT')
  check('untimed past task → OVERDUE', currentAlertLevel(e, at('2026-11-21', '08:00')) === 'OVERDUE')
  check('untimed past note → none', currentAlertLevel({ ...e, type: 'note' }, at('2026-11-21', '08:00')) === null)
  check('untimed overdue horizon', currentAlertLevel(e, at('2026-11-29', '08:00')) === null)
  check('done → none', currentAlertLevel({ ...e, status: 'done' }, at('2026-11-20', '08:00')) === null)
  check('created today → no ALERT', currentAlertLevel({ ...e, createdAt: at('2026-11-20', '07:00') }, at('2026-11-20', '08:00')) === null)
  check('created D-1 → no NOTICE', currentAlertLevel({ ...e, createdAt: at('2026-11-19', '09:00') }, at('2026-11-19', '10:00')) === null)
}

// ── timed ladder
{
  const e = entry({ date: '2026-11-20', time: '14:00' })
  const T = at('2026-11-20', '14:00')
  check('timed D-1 → NOTICE', currentAlertLevel(e, at('2026-11-19', '09:00')) === 'NOTICE')
  check('timed same day T-3h → none', currentAlertLevel(e, T - 180 * MIN) === null)
  check('timed T-60 → ALERT', currentAlertLevel(e, T - 60 * MIN) === 'ALERT')
  check('timed T-30 → ALERT', currentAlertLevel(e, T - 30 * MIN) === 'ALERT')
  check('timed T-5 → EXECUTE', currentAlertLevel(e, T - 5 * MIN) === 'EXECUTE')
  check('timed T+10 → EXECUTE', currentAlertLevel(e, T + 10 * MIN) === 'EXECUTE')
  check('timed T+15 → OVERDUE', currentAlertLevel(e, T + 15 * MIN) === 'OVERDUE')
  check('timed note T+15 → none', currentAlertLevel({ ...e, type: 'note' }, T + 15 * MIN) === null)
  check('created at T-20 → no ALERT', currentAlertLevel({ ...e, createdAt: T - 20 * MIN }, T - 10 * MIN) === null)
  check('created at T-20 → EXECUTE still fires', currentAlertLevel({ ...e, createdAt: T - 20 * MIN }, T - 2 * MIN) === 'EXECUTE')
  check('isOverdue respects grace', !isOverdue(e, T + 14 * MIN) && isOverdue(e, T + 15 * MIN))
  // midnight-crossing: event 00:30 tomorrow, now 23:45 today → ALERT (not NOTICE)
  const m = entry({ date: '2026-11-20', time: '00:30' })
  check('midnight crossing → ALERT', currentAlertLevel(m, at('2026-11-19', '23:45')) === 'ALERT')
}

// ── fold + dedup + no-downgrade
{
  const logs: CalLogLike[] = [
    { id: 'a', event: 'calendar_entry', metadata: { date: '2026-11-20', time: '14:00', text: 'Call ops', entryType: 'call' }, createdAt: '2026-11-01T00:00:00Z' },
    { id: 'b', event: 'calendar_entry', metadata: { date: '2026-11-20', text: 'Rations', entryType: 'task' }, createdAt: '2026-11-01T00:01:00Z' },
    { id: 'c', event: 'calendar_entry', metadata: { date: 'bogus', text: 'x' }, createdAt: '2026-11-01T00:02:00Z' },
    { id: 'd', event: 'calendar_entry', metadata: { date: '2026-11-21', text: '  ' }, createdAt: '2026-11-01T00:03:00Z' },
    { id: 'u1', event: 'calendar_update', metadata: { entryId: 'b', status: 'done', deltaMinutes: -30 }, createdAt: '2026-11-02T00:00:00Z' },
    { id: 'u2', event: 'calendar_update', metadata: { entryId: 'zzz', status: 'done' }, createdAt: '2026-11-02T00:00:00Z' },
    { id: 'al', event: 'calendar_alert', metadata: { entryId: 'a', level: 'EXECUTE' }, createdAt: '2026-11-20T00:00:00Z' },
  ]
  const entries = deriveEntries(logs)
  check('fold drops invalid', entries.length === 2, entries.map(e => e.id))
  check('fold applies update', entries.find(e => e.id === 'b')?.status === 'done')
  check('fold sort: all-day first', entries[0].id === 'b')
  const fired = firedAlertKeys(logs)
  check('fired keys', fired.has(alertKey('a', 'EXECUTE')))
  const T = at('2026-11-20', '14:00')
  check('no re-fire of same level', pendingAlerts(entries, fired, T).length === 0)
  check('no downgrade to ALERT after EXECUTE', pendingAlerts(entries, fired, T - 30 * MIN).length === 0)
  check('OVERDUE supersedes EXECUTE', pendingAlerts(entries, fired, T + 20 * MIN)[0]?.level === 'OVERDUE')
  // reinstate
  const re = deriveEntries([...logs, { id: 'u3', event: 'calendar_update', metadata: { entryId: 'b', status: 'active' }, createdAt: '2026-11-03T00:00:00Z' }])
  check('reinstate', re.find(e => e.id === 'b')?.status === 'active')
  // out-of-order input still folds by createdAt
  const shuffled = deriveEntries([...logs].reverse())
  check('fold order-independent', shuffled.find(e => e.id === 'b')?.status === 'done')
}

// ── catch-up surfacing (reload between "logged" and "shown")
{
  const t = Date.UTC(2026, 10, 20, 12, 0)
  const logs: CalLogLike[] = [
    { id: 'x1', event: 'calendar_alert', metadata: { entryId: 'a', level: 'EXECUTE', firedAt: t - 2 * MIN }, createdAt: t - 2 * MIN },
    { id: 'x2', event: 'calendar_alert', metadata: { entryId: 'b', level: 'ALERT', firedAt: t - 40 * MIN }, createdAt: t - 40 * MIN },
    { id: 'x3', event: 'calendar_alert', metadata: { entryId: 'c', level: 'BOGUS' }, createdAt: t },
  ]
  const r = recentAlerts(logs, t, 15 * MIN)
  check('recentAlerts window', r.length === 1 && r[0].entryId === 'a' && r[0].level === 'EXECUTE', r)
}

// ── formatting
check('countdown <1d', countdown(83 * MIN + 5000) === 'T-01:23:05', countdown(83 * MIN + 5000))
check('countdown past', countdown(-4 * MIN) === 'T+00:04:00')
check('countdown days', countdown(3 * 1440 * MIN + 4 * 60 * MIN) === 'T-3D 04H')
check('delta M', deltaLabel(12) === '+12M' && deltaLabel(-3) === '-3M')
check('delta H', deltaLabel(125) === '+2H 05M')
check('delta D', deltaLabel(1440 + 180) === '+1D 03H')
{
  const e = entry({ date: '2026-11-20', time: '14:00', text: 'Call ops', type: 'call' })
  const T = at('2026-11-20', '14:00')
  const t = alertText('ALERT', e, T - 45 * MIN)
  check('alert text', t === '[ALERT] CALL · Call ops · 20 NOV 2026 · 14:00 · T-00:45:00', t)
  check('execute NOW', alertText('EXECUTE', e, T + MIN).endsWith('· NOW'))
  check('overdue text', alertText('OVERDUE', e, T + 75 * MIN).endsWith('· +1H 15M'))
  const u = entry({ date: '2026-11-20' })
  check('untimed overdue +2D', alertText('OVERDUE', u, at('2026-11-22', '09:00')).endsWith('· +2D'))
  check('closeDelta late', closeDelta(e, T + 12 * MIN) === 12)
  check('closeDelta untimed same day on time', (closeDelta(u, at('2026-11-20', '18:00')) as number) < 0)
  check('closeDelta note null', closeDelta({ ...e, type: 'note' }, T) === null)
  check('cleared text late', updateText('done', e, 12).endsWith('· +12M LATE'))
  check('cleared text on time', updateText('done', e, -5).endsWith('· ON TIME'))
}

console.log(`calendar engine · TZ=${process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone} · ${passed} passed · ${failed} failed`)
if (failed) process.exit(1)
