// LOT·01 device API — integration test against a real Postgres and the compiled server code.
//
// Usage (from the repo root, after `yarn server:build`). Add `--serve 4499` to keep the app running instead.
//   DB_HOST=127.0.0.1 DB_PORT=5432 DB_NAME=lot_test DB_USER=postgres DB_PASSWORD=x DB_SSL=false \
//   JWT_SECRET=test LOT_DEVICES_ENABLED=true node docs/hardware/lot-01/connector/device-api.itest.mjs
//
// Runs every migration in /migrations on the target DB, so point it at a throwaway database only.
import path from 'node:path'
import Fastify from 'fastify'
import { Umzug, SequelizeStorage } from 'umzug'
import { sequelize } from '#server/utils/db'
import { models } from '#server/models'
import { deviceApiRoutes, deviceUserRoutes } from '#server/routes/device-api'
import { runDeviceNudgeJob, sanitizeNudge } from '#server/utils/device-nudges'
import dayjs from '#server/utils/dayjs'

if (!/test|tmp|scratch/i.test(process.env.DB_NAME || '')) {
  console.error('Refusing to run: DB_NAME must contain "test", "tmp" or "scratch".')
  process.exit(2)
}

let pass = 0, fail = 0
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? '✅' : '❌'} ${name}${extra ? '  ' + extra : ''}`) }

const umzug = new Umzug({
  migrations: { glob: path.resolve('migrations/*.cjs') },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: undefined,
})
await umzug.up()
check('all migrations apply on Postgres', true, `${(await umzug.executed()).length} executed`)

const user = await models.User.create({ email: `lot01-${Date.now()}@example.test`, timeZone: 'UTC', city: 'Test City' })

const app = Fastify()
app.decorate('models', models)
app.decorate('sequelize', sequelize)
app.register(deviceApiRoutes, { prefix: '/device-api/v1' })
app.register(async (f) => {
  f.addHook('onRequest', async (req) => { req.user = user })
  f.register(deviceUserRoutes, { prefix: '/api' })
})
await app.ready()

// --serve PORT: keep the same app running for the native firmware test (firmware/test/native/run.sh)
const serveIdx = process.argv.indexOf('--serve')
if (serveIdx > 0) {
  const port = Number(process.argv[serveIdx + 1] || 4499)
  await app.listen({ port, host: '127.0.0.1' })
  console.log(`LOT-01 test server on http://127.0.0.1:${port} (user ${user.id})`)
  await new Promise(() => {})
}
const call = async (method, url, body, token) => {
  const r = await app.inject({ method, url, payload: body, headers: token ? { authorization: `Bearer ${token}` } : {} })
  return { code: r.statusCode, json: r.body ? JSON.parse(r.body) : null }
}

// Pairing
let r = await call('POST', '/device-api/v1/pair/start', { serial: 'LOT01-0001', fw: '0.2.0', hw: 'lot-01-evt' })
check('pair/start returns codes', r.code === 200 && /^LOT-[A-Z2-9]{4}$/.test(r.json.user_code), r.json.user_code)
const { device_code, user_code } = r.json
r = await call('POST', '/device-api/v1/pair/poll', { device_code })
check('pair/poll pending before claim', r.json.status === 'pending')
r = await call('POST', '/api/devices/claim', { user_code: user_code.toLowerCase().replace('lot-', '') })
check('claim accepts code without prefix, any case', r.code === 200 && r.json.serial === 'LOT01-0001')
r = await call('POST', '/device-api/v1/pair/poll', { device_code })
check('pair/poll issues token', r.json.status === 'ok' && r.json.token.startsWith('ld1_'))
const token = r.json.token
r = await call('POST', '/device-api/v1/pair/poll', { device_code })
check('device_code is single-use (410)', r.code === 410)

// Auth
check('inbox 401 without token', (await call('GET', '/device-api/v1/inbox')).code === 401)
check('inbox 401 with bad token', (await call('GET', '/device-api/v1/inbox', undefined, 'ld1_nope')).code === 401)

// Notification loop
r = await call('GET', '/device-api/v1/inbox', undefined, token)
check('inbox empty, next_poll_s clamped', r.code === 200 && r.json.items.length === 0 && r.json.next_poll_s >= 300)
r = await call('POST', '/api/devices/test', {})
check('Settings test queues "Coffee time!"', r.json.t === 'Coffee time!')
r = await call('GET', '/device-api/v1/inbox', undefined, token)
const item = r.json.items[0]
check('device receives "Coffee time!"', item?.t === 'Coffee time!' && item.k === 'test')
r = await call('GET', `/device-api/v1/inbox?since=${item.id}`, undefined, token)
check('since-cursor hides delivered items', r.json.items.length === 0)
check('ack', (await call('POST', '/device-api/v1/ack', { id: item.id }, token)).json.ok === true)

// Copy → Log tab
r = await call('POST', '/device-api/v1/copy', { id: item.id, t: item.t, env: { t: 21.4, rh: 40, p: 1012, bad: 'x' } }, token)
check('copy creates log', r.code === 200 && !!r.json.log_id)
const log = await models.Log.findByPk(r.json.log_id)
check('Log row: event=note, source=lot-01, user-scoped', log?.event === 'note' && log.metadata.source === 'lot-01' && log.userId === user.id && log.text === 'Coffee time!')
check('Log env keeps numbers only', log?.metadata.env && !('bad' in log.metadata.env) && log.metadata.env.t === 21.4)
check('copy rejects empty text', (await call('POST', '/device-api/v1/copy', { t: '   ' }, token)).code === 400)

// Telemetry + listing
check('telemetry', (await call('POST', '/device-api/v1/telemetry', { fw: '0.2.1', batt: 87, rssi: -61 }, token)).json.ok === true)
r = await call('GET', '/api/devices')
check('Settings list shows device with telemetry', r.json.devices.length === 1 && r.json.devices[0].fw === '0.2.1' && r.json.devices[0].telemetry.batt === 87)

// AI nudge job (fake engine; respects caps and gap)
const noon = dayjs.utc().hour(12)
await sequelize.query(`DELETE FROM device_notifications WHERE user_id = :u`, { replacements: { u: user.id } })
let n = await runDeviceNudgeJob(sequelize, async () => '"Coffee time! ☕ Take ten minutes, step outside and enjoy it slowly please."', noon)
const [[row]] = await sequelize.query(`SELECT text, kind FROM device_notifications WHERE user_id = :u ORDER BY id DESC LIMIT 1`, { replacements: { u: user.id } })
check('nudge job queues one AI message', n === 1 && row.kind === 'ai', JSON.stringify(row.text))
check('nudge text is ASCII and ≤ 64 chars', row.text.length <= 64 && /^[\x20-\x7E]+$/.test(row.text))
n = await runDeviceNudgeJob(sequelize, async () => 'Again', noon)
check('nudge job respects 3 h gap', n === 0)
const night = dayjs.utc().hour(2)
await sequelize.query(`DELETE FROM device_notifications WHERE user_id = :u`, { replacements: { u: user.id } })
check('nudge job is quiet at night', (await runDeviceNudgeJob(sequelize, async () => 'Hi', night)) === 0)
n = await runDeviceNudgeJob(sequelize, async () => { throw new Error('no engine') }, noon)
const [[fb]] = await sequelize.query(`SELECT text FROM device_notifications WHERE user_id = :u ORDER BY id DESC LIMIT 1`, { replacements: { u: user.id } })
check('nudge job falls back when AI is down', n === 1 && fb.text.length > 0, fb.text)
check('sanitize caps at word boundary', sanitizeNudge('word '.repeat(30)).length <= 64)

// Revoke
const devId = (await call('GET', '/api/devices')).json.devices[0].id
check('revoke', (await call('DELETE', `/api/devices/${devId}`)).json.ok === true)
check('revoked token gets 401', (await call('GET', '/device-api/v1/inbox', undefined, token)).code === 401)

await app.close()
await sequelize.close()
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
