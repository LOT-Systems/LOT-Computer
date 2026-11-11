// LOT pager connector end-to-end test (real Postgres, Fastify inject).
// Usage: npm run server:build && \
//   DB_HOST=127.0.0.1 DB_PORT=5432 DB_NAME=lot_test DB_USER=postgres DB_PASSWORD=x DB_SSL=false JWT_SECRET=test \
//   node hardware/tools/device-api-e2e.mjs
// WARNING: drops and recreates users/logs/devices tables. Use a throwaway database only.
if (!/test/.test(process.env.DB_NAME || '')) { console.error('Refusing: DB_NAME must contain "test"'); process.exit(2) }
import Fastify from 'fastify'
const { models } = await import('../../dist/server/server/models/index.js')
const { sequelize } = await import('../../dist/server/server/utils/db.js')
const { okReplyDecorator, throwReplyDecorator } = await import('../../dist/server/server/utils/index.js')
const apiRoutes = (await import('../../dist/server/server/routes/api.js')).default
const deviceApiRoutes = (await import('../../dist/server/server/routes/device-api.js')).default
const mig = (await import('../../migrations/20261111120000_create-devices.cjs')).default
const assert = (c, m) => { if (!c) { console.error('FAIL', m); process.exit(1) } else console.log('ok  ', m) }

await models.User.sync({ force: true }); await models.Log.sync({ force: true })
await sequelize.getQueryInterface().dropTable('devices').catch(()=>{})
await mig.up({ context: sequelize.getQueryInterface() })
const user = await models.User.create({ email: 'pager-test@example.com' })
const other = await models.User.create({ email: 'other@example.com' })

let current = user
const app = Fastify()
app.register(async (f) => {
  f.decorate('models', models); f.decorate('sequelize', sequelize)
  f.decorateReply('ok', okReplyDecorator); f.decorateReply('throw', throwReplyDecorator)
  f.register(async (f) => {
    f.addHook('onRequest', async (req) => { req.user = current })
    f.register(apiRoutes, { prefix: '/api' })
  })
  f.register(deviceApiRoutes, { prefix: '/api/device' })
})
await app.ready()
const call = (method, url, body, headers={}) => app.inject({ method, url, payload: body, headers }).then(r => ({ s: r.statusCode, j: (()=>{try{return r.json()}catch{return r.body}})() }))

let r = await call('POST', '/api/devices', { name: 'Pager 001' }); assert(r.s===200 && r.j.token.startsWith('lotd_'), 'pair returns token once')
const token = r.j.token, devId = r.j.id
const H = { authorization: 'Bearer ' + token, 'x-lot-fw': '0.1.0' }
r = await call('GET', '/api/device/inbox'); assert(r.s===401, 'inbox without token -> 401')
r = await call('GET', '/api/device/inbox', null, { authorization: 'Bearer lotd_bad' }); assert(r.s===401, 'bad token -> 401')
r = await call('POST', '/api/devices/notice', { text: 'Coffee time!' }); assert(r.s===200, 'queue notice')
r = await call('POST', '/api/devices/notice', { text: 'x'.repeat(200) }); assert(r.j.text.length===80, 'notice clamped to 80 chars')
r = await call('GET', '/api/device/inbox', null, H); assert(r.s===200 && r.j.notices.length===2, 'inbox has 2 notices')
const coffee = r.j.notices.find(n => n.text==='Coffee time!'); assert(!!coffee, 'Coffee time! in inbox')
r = await call('POST', '/api/device/ack', { ids: [coffee.id] }, H); assert(r.j.acked===1, 'ack 1')
r = await call('GET', '/api/device/inbox', null, H); assert(r.j.notices.length===1, 'acked notice leaves inbox')
r = await call('POST', '/api/device/event', { type: 'copy', notice_id: coffee.id }, H); assert(r.s===200, 'copy event')
r = await call('POST', '/api/device/event', { type: 'sensor', t_c: 21.4, rh: 44, hpa: 1013.2, battery: 3 }, H); assert(r.j.stored===true, 'sensor stored')
r = await call('POST', '/api/device/event', { type: 'sensor', t_c: 22 }, H); assert(r.j.stored===false, 'sensor rate-limited')
r = await call('POST', '/api/device/event', { type: 'nope' }, H); assert(r.s===400, 'unknown event 400')
const sensor = await models.Log.findOne({ where: { event: 'device_sensor' } }); assert(sensor.metadata.battery===1, 'sensor values clamped')
r = await call('GET', '/api/logs'); assert(r.s===200, 'GET /api/logs ok')
const logs = Array.isArray(r.j) ? r.j : (r.j.logs || [])
const copyRow = logs.find(l => l.event==='device_copy')
assert(copyRow && copyRow.text==='Coffee time!', 'device_copy appears in Log tab feed')
assert(!logs.some(l => l.event==='device_notice' || l.event==='device_sensor'), 'notice/sensor rows hidden from Log tab')
current = other
r = await call('DELETE', '/api/devices/' + devId); assert(r.s===404, 'other user cannot revoke')
const foreign = await models.Log.create({ userId: other.id, event: 'device_notice', text: 'secret of other user', metadata: { status: 'pending' } })
r = await call('POST', '/api/device/event', { type: 'copy', notice_id: foreign.id }, H); assert(r.s===400, "device cannot copy another user's notice")
current = user
r = await call('GET', '/api/devices'); assert(r.j.devices.length===1 && r.j.devices[0].firmware==='0.1.0', 'device list + firmware tracked')
r = await call('DELETE', '/api/devices/' + devId); assert(r.s===200, 'revoke')
r = await call('GET', '/api/device/inbox', null, H); assert(r.s===401, 'revoked token -> 401')
const dev = await models.Device.findByPk(devId); assert(!JSON.stringify(dev.toJSON()).includes(token), 'raw token not stored')
console.log('ALL PASS'); process.exit(0)
