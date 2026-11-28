// LOT DEVICE-01 — protocol simulator (mock server + simulated device).
// Exercises the /api/device/* contract from 06-SOFTWARE-CONNECTOR.md.
// Pure Node (>=18), no dependencies. Exit code 0 = contract OK.
//
//   node docs/hardware/lot-device-01/software/device-sim.mjs

import http from 'node:http'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'

// ─── Mock LOT server ──────────────────────────────────────────────
const db = { codes: new Map(), devices: new Map(), notices: [], logs: [] }
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex')

function deviceAuth(req) {
  const tok = (req.headers.authorization || '').replace(/^Bearer /, '')
  const h = sha(tok)
  for (const d of db.devices.values()) {
    if (d.tokenHash.length === h.length &&
        crypto.timingSafeEqual(Buffer.from(d.tokenHash), Buffer.from(h))) return d
  }
  return null
}

const readBody = (req) => new Promise((res) => {
  let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => res(b ? JSON.parse(b) : {}))
})

function logCopy(device, item) {
  const log = {
    id: crypto.randomUUID(), userId: device.userId, event: 'device_copy', text: item.text,
    metadata: { deviceId: device.id, noticeId: item.id, source: 'LOT-DEVICE-01' },
    context: { temperature: item.env?.t ?? null, humidity: item.env?.rh ?? null },
    createdAt: new Date((item.ts ?? Date.now() / 1000) * 1000).toISOString(),
  }
  db.logs.push(log)
  const n = db.notices.find((x) => x.id === item.id); if (n) n.copiedAt = log.createdAt
  return log.id
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  const send = (code, obj, headers = {}) => {
    res.writeHead(code, { 'content-type': 'application/json', ...headers })
    res.end(obj === undefined ? '' : JSON.stringify(obj))
  }
  const body = req.method === 'POST' ? await readBody(req) : {}

  // Pairing
  if (url.pathname === '/api/public/device/code' && req.method === 'POST') {
    const device_code = crypto.randomBytes(16).toString('hex')
    const user_code = crypto.randomBytes(3).toString('hex').toUpperCase().replace(/(...)/, '$1-')
    db.codes.set(device_code, { user_code, approvedBy: null })
    return send(200, { device_code, user_code, interval: 1, expires_in: 600 })
  }
  if (url.pathname === '/device/approve' && req.method === 'POST') { // stands in for the web UI
    for (const c of db.codes.values()) if (c.user_code === body.user_code) c.approvedBy = body.userId
    return send(200, { ok: true })
  }
  if (url.pathname === '/api/public/device/token' && req.method === 'POST') {
    const c = db.codes.get(body.device_code)
    if (!c) return send(400, { error: 'invalid_code' })
    if (!c.approvedBy) return send(200, { status: 'pending' })
    const token = crypto.randomBytes(32).toString('base64url')
    const id = 'dev_' + crypto.randomBytes(4).toString('hex')
    db.devices.set(id, { id, userId: c.approvedBy, tokenHash: sha(token) })
    db.codes.delete(body.device_code)
    return send(200, { token, device_id: id })
  }

  // Runtime (Bearer)
  if (url.pathname.startsWith('/api/device/')) {
    const device = deviceAuth(req)
    if (!device) return send(401, { error: 'unauthorized' })
    if (url.pathname === '/api/device/notifications') {
      const since = Number(url.searchParams.get('since') || 0)
      const items = db.notices.filter((n) => n.userId === device.userId && n.seq > since)
      const cursor = String(Math.max(since, ...db.notices.map((n) => n.seq)))
      if (!items.length) return send(304)
      return send(200, { cursor, tz: 'America/Los_Angeles', poll: { day: 120, night: 900 },
        items: items.map(({ id, t, k, p, ts, ttl }) => ({ id, t, k, p, ts, ttl })) })
    }
    if (url.pathname === '/api/device/copy') return send(200, { log_id: logCopy(device, body) })
    if (url.pathname === '/api/device/sync') {
      for (const c of body.copies || []) logCopy(device, c)
      return send(200, { ok: true })
    }
    if (url.pathname === '/api/device/session') {
      const d = body
      const text = `DEVICE. ${d.n} notices · ${d.c} copied · ${d.t[0]}–${d.t[1]} °C · IAQ ${d.iaq[2]} · battery ${d.b}%.`
      db.logs.push({ id: crypto.randomUUID(), userId: device.userId, event: 'device_session', text, metadata: d })
      return send(200, { ok: true })
    }
  }
  send(404, { error: 'not_found' })
})

// AI composer stand-in: compress context into a notice of at most 48 characters
let seq = 0
function composeNotice(userId, text, kind = 'care') {
  assert.ok(text.length <= 48, 'notice exceeds 48 chars')
  db.notices.push({ seq: ++seq, id: 'n_' + crypto.randomBytes(2).toString('hex'), userId,
    t: text, k: kind, p: 1, ts: Math.floor(Date.now() / 1000), ttl: 5400 })
}

// ─── Simulated device ─────────────────────────────────────────────
async function run(base) {
  const j = async (path, opts = {}) => {
    const r = await fetch(base + path, { ...opts, headers: { 'content-type': 'application/json',
      'user-agent': 'LOT-DEVICE-01/0.0.1-sim', ...(opts.headers || {}) } })
    return { status: r.status, json: r.status === 304 ? null : await r.json() }
  }
  const post = (path, body, token) => j(path, { method: 'POST', body: JSON.stringify(body),
    headers: token ? { authorization: 'Bearer ' + token } : {} })

  // 1. Pair
  const code = (await post('/api/public/device/code', {})).json
  console.log(`[screen] PAIR  ${code.user_code}  lot-systems.com/device`)
  assert.equal((await post('/api/public/device/token', { device_code: code.device_code })).json.status, 'pending')
  await post('/device/approve', { user_code: code.user_code, userId: 'user_S2' })
  const { token, device_id } = (await post('/api/public/device/token', { device_code: code.device_code })).json
  assert.ok(token && device_id); console.log(`[pair]   paired as ${device_id}`)

  // 2. Unauthorized is rejected
  assert.equal((await j('/api/device/notifications', { headers: { authorization: 'Bearer nope' } })).status, 401)

  // 3. Poll: nothing yet → 304
  const auth = { headers: { authorization: 'Bearer ' + token } }
  assert.equal((await j('/api/device/notifications?since=0', auth)).status, 304)

  // 4. AI sends a notice → device receives it
  composeNotice('user_S2', 'Coffee time!')
  const feed = (await j('/api/device/notifications?since=0', auth)).json
  assert.equal(feed.items[0].t, 'Coffee time!')
  console.log(`[screen] ${feed.items[0].t}   (haptic ×1)`)

  // 5. Copy button → Log
  const env = { t: 21.4, rh: 44, p: 1012, iaq: 52 }
  const copy = (await post('/api/device/copy', { id: feed.items[0].id, text: feed.items[0].t,
    ts: Math.floor(Date.now() / 1000), env }, token)).json
  const log = db.logs.find((l) => l.id === copy.log_id)
  assert.equal(log.event, 'device_copy'); assert.equal(log.context.temperature, 21.4)
  console.log(`[log]    COPIED. ${log.text} — ${env.t} °C · ${env.rh}%`)

  // 6. Cursor advances → 304 again
  assert.equal((await j(`/api/device/notifications?since=${feed.cursor}`, auth)).status, 304)

  // 7. Daily session digest (compression)
  await post('/api/device/session', { d: '2026-11-28', n: 14, c: 3, ph: 1,
    t: [18.2, 23.4, 21.0], rh: [38, 51, 44], iaq: [25, 96, 52], b: 64 }, token)
  console.log(`[log]    ${db.logs.at(-1).text}`)

  console.log('\nCONTRACT OK — pairing · auth · poll/304 · notice · copy→Log · digest')
}

server.listen(0, '127.0.0.1', async () => {
  const { port } = server.address()
  try { await run(`http://127.0.0.1:${port}`); process.exitCode = 0 }
  catch (e) { console.error('CONTRACT FAIL:', e); process.exitCode = 1 }
  finally { server.close() }
})
