// LOT® Email — end-to-end check against a local Postgres.
// Usage: DB_HOST=... DB_PORT=... DB_NAME=... DB_USER=... DB_PASSWORD=x DB_SSL=false JWT_SECRET=x \
//        node scripts/e2e-lot-email.mjs   (after `yarn server:build`)
import Fastify from 'fastify'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { sequelize } = await import('../dist/server/server/utils/db.js')
const { models } = await import('../dist/server/server/models/index.js')
const { registerEmailRoutes } = await import('../dist/server/server/routes/email-api.js')
const { sync } = await import('../dist/server/server/sync.js')

let pass = 0, fail = 0
const check = (name, cond, extra) => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && extra ? '  ' + JSON.stringify(extra) : ''}`) }

await models.User.sync()
const migration = require('../migrations/20261115120000_add-lot-emails.cjs')
await migration.up({ context: sequelize.getQueryInterface() })
await migration.up({ context: sequelize.getQueryInterface() }) // idempotent

const mk = (firstName, lastName, extra = {}) => models.User.create({ email: `${firstName}.${lastName}@test.local`, firstName, lastName, city: 'Tokyo', tags: [], ...extra })
const vadik = await mk('Vadik', 'M')
const hitomi = await mk('Hitomi', 'T')
const hitomi2 = await mk('Hitomi', 'K')
const sus = await mk('Sus', 'Pect', { tags: ['Suspended'] })

let actor = vadik
const app = Fastify()
app.decorate('models', models)
app.addHook('onRequest', async (req) => { req.user = actor })
app.register(async (f) => registerEmailRoutes(f), { prefix: '/api' })
await app.ready()

const events = []
sync.listen('lot_email', (d) => events.push(d))

let r = await app.inject({ method: 'GET', url: '/api/emails/recipients?q=Hitomi' })
check('resolve "Hitomi" → 2 candidates', r.json().candidates.length === 2, r.json())

r = await app.inject({ method: 'POST', url: '/api/emails', payload: { to: 'Hitomi', body: 'Coffee?' } })
check('ambiguous "to Hitomi" → 409 with candidates', r.statusCode === 409 && r.json().candidates.length === 2, r.json())

r = await app.inject({ method: 'POST', url: '/api/emails', payload: { to: 'Hitomi T', body: 'Coffee tomorrow at 9?' } })
check('"to Hitomi T" → sent', r.statusCode === 200 && r.json().to.id === hitomi.id, r.json())
const letterId = r.json().id
check('SSE lot_email emitted with receiverId', events.length === 1 && events[0].receiverId === hitomi.id)

r = await app.inject({ method: 'POST', url: '/api/emails', payload: { receiverId: hitomi2.id, body: 'Hi from Cohort', source: 'cohort' } })
check('receiverId + source cohort → sent', r.statusCode === 200 && r.json().source === 'cohort', r.json())

r = await app.inject({ method: 'POST', url: '/api/emails', payload: { to: 'Sus', body: 'x' } })
check('suspended recipient → 404', r.statusCode === 404, r.json())
r = await app.inject({ method: 'POST', url: '/api/emails', payload: { to: 'Vadik', body: 'x' } })
check('self → 404', r.statusCode === 404, r.json())
r = await app.inject({ method: 'POST', url: '/api/emails', payload: { to: 'Hitomi T', body: '   ' } })
check('empty body → 400', r.statusCode === 400)
r = await app.inject({ method: 'POST', url: '/api/emails', payload: { to: 'Hitomi T', body: 'x'.repeat(4001) } })
check('over-length → 400', r.statusCode === 400)

actor = hitomi
r = await app.inject({ method: 'GET', url: '/api/emails' })
let j = r.json()
check('Hitomi inbox has 1 unread from Vadik', j.inbox.length === 1 && j.unread === 1 && j.inbox[0].from.id === vadik.id, j)

actor = vadik
r = await app.inject({ method: 'POST', url: `/api/emails/${letterId}/read` })
check('sender cannot mark read', r.json().updated === 0, r.json())

actor = hitomi
r = await app.inject({ method: 'POST', url: `/api/emails/${letterId}/read` })
check('receiver marks read', r.json().updated === 1, r.json())
r = await app.inject({ method: 'GET', url: '/api/emails' })
check('unread → 0', r.json().unread === 0)

r = await app.inject({ method: 'POST', url: '/api/emails', payload: { receiverId: vadik.id, body: 'Yes — 9 works.', source: 'sync' } })
check('reply from Sync → sent', r.statusCode === 200)
actor = vadik
r = await app.inject({ method: 'GET', url: '/api/emails' })
j = r.json()
check('Vadik: inbox 1, sent 2', j.inbox.length === 1 && j.sent.length === 2, { i: j.inbox.length, s: j.sent.length })

actor = sus
r = await app.inject({ method: 'POST', url: '/api/emails', payload: { to: 'Vadik', body: 'x' } })
check('suspended sender → 403', r.statusCode === 403)

console.log(`\n${pass} passed, ${fail} failed`)
await app.close(); await sequelize.close()
process.exit(fail ? 1 : 0)
