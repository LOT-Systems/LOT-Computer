/**
 * Calendar Watch E2E — runs the compiled daemon tick against a real Postgres.
 *
 *   yarn build
 *   DB_HOST=localhost DB_PORT=5432 DB_NAME=lot DB_USER=postgres DB_PASSWORD=x \
 *   DB_SSL=false JWT_SECRET=x TEST_USER_ID=<uuid of an existing user> \
 *   CALENDAR_WATCH_TEST=1 node scripts/tests/test-calendar-watch.mjs
 *
 * Writes and then deletes calendar_* logs for TEST_USER_ID. Never point at production.
 */
import assert from 'node:assert/strict'

if (process.env.CALENDAR_WATCH_TEST !== '1') {
  console.error('Refusing to run without CALENDAR_WATCH_TEST=1 (writes to the DB).')
  process.exit(2)
}

const USER = process.env.TEST_USER_ID
const { Log } = await import('../../dist/server/server/models/log.js')
const { runCalendarWatchTick } = await import('../../dist/server/server/calendar-watch.js')
const { wallClock } = await import('../../dist/server/shared/utils/calendar.js')
const { sync } = await import('../../dist/server/server/sync.js')

const TZ = 'America/New_York'
const pad = n => String(n).padStart(2, '0')
const wall = ms => {
  const w = wallClock(ms, TZ)
  return { date: `${w.y}-${pad(w.mo)}-${pad(w.d)}`, time: `${pad(w.h)}:${pad(w.mi)}` }
}
const minute = Math.floor(Date.now() / 60_000) * 60_000
const at = (ms) => new Date(ms)

let pushes = 0
sync.listen('calendar_sync', d => { if (d.userId === USER) pushes++ })

await Log.destroy({ where: { userId: USER, event: ['calendar_entry', 'calendar_status', 'calendar_snooze', 'calendar_alert'] } })

const mk = (event, metadata, createdAt = at(minute - 3600_000)) =>
  Log.create({ userId: USER, event, text: `[TEST] ${event}`, metadata, context: {}, createdAt })

const lead = await mk('calendar_entry', { ...wall(minute + 10 * 60_000), text: 'Lead call', entryType: 'call', tz: TZ })
const start = await mk('calendar_entry', { ...wall(minute - 2 * 60_000), text: 'Start task', entryType: 'task', tz: TZ })
const legacy = await mk('calendar_entry', { ...wall(minute - 1 * 60_000), text: 'Legacy no tz', entryType: 'task' })
const done = await mk('calendar_entry', { ...wall(minute - 1 * 60_000), text: 'Done task', entryType: 'task', tz: TZ })
await mk('calendar_status', { entryId: done.id, status: 'done' })
const snz = await mk('calendar_entry', { ...wall(minute - 30 * 60_000), text: 'Snoozed call', entryType: 'call', tz: TZ })
await mk('calendar_alert', { key: `${snz.id}:T-0`, entryId: snz.id, phase: 'T-0' })
const until = new Date(minute - 60_000).toISOString()
await mk('calendar_snooze', { entryId: snz.id, until, minutes: 5 })

const n1 = await runCalendarWatchTick(Date.now())
const alerts = await Log.findAll({ where: { userId: USER, event: 'calendar_alert' } })
const keys = alerts.map(a => a.metadata.key).sort()
console.log('  tick 1 fired:', n1, keys)

assert.equal(n1, 3)
assert.ok(keys.includes(`${lead.id}:T-15`), 'lead T-15 logged')
assert.ok(keys.includes(`${start.id}:T-0`), 'start T-0 logged')
assert.ok(!keys.includes(`${start.id}:T-15`), 'stale T-15 suppressed')
assert.ok(keys.includes(`${snz.id}:SNZ@${Date.parse(until)}`), 'snooze re-alert logged')
assert.ok(!keys.some(k => k.startsWith(legacy.id)), 'legacy (no tz) skipped')
assert.ok(!keys.some(k => k.startsWith(done.id)), 'done entry skipped')
const t0 = alerts.find(a => a.metadata.key === `${start.id}:T-0`)
assert.equal(t0.metadata.source, 'watch')
assert.equal(t0.metadata.priority, 'FLASH')
assert.match(t0.text, /^\[FLASH\] CAL T-0 · NOW · TSK · Start task · .* · DTG \d{6}L [A-Z]{3} \d{2}$/)
assert.ok(pushes >= 1, 'SSE calendar_sync emitted')

const n2 = await runCalendarWatchTick(Date.now())
assert.equal(n2, 0, 'second tick is idempotent')

await Log.destroy({ where: { userId: USER, event: ['calendar_entry', 'calendar_status', 'calendar_snooze', 'calendar_alert'] } })
console.log('\nCALENDAR WATCH E2E: GREEN')
process.exit(0)
