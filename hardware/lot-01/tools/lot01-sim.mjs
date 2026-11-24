#!/usr/bin/env node
/**
 * LOT-01 SQUARE — LOT API Connector contract simulator (protocol v1, doc 07)
 *
 * Zero dependencies. Starts a mock of /api/public/device/* on a random local port,
 * then drives a simulated LOT-01 through: pair → poll inbox → render → COPY → Log.
 * Exit code 0 = all assertions pass.
 *
 *   node hardware/lot-01/tools/lot01-sim.mjs
 */
import http from 'node:http'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'

const NOTE_MAX = 42

// ───────────────────────── mock server (reference behaviour) ─────────────────────────
const db = {
  users: [{ id: 'u1', name: 'Vadik' }],
  pairCodes: new Map(), // sha256(code) -> { userId, expiresAt }
  devices: new Map(), // did -> { userId, tokenHash, fw, digest, lastSeenAt }
  messages: [], // { id, did, t, k, buzz, ttl, ts, ackedAt }
  logs: [], // mirrors the `logs` table rows created by /copy
}
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex')

function issuePairCode(userId) {
  const code = String(crypto.randomInt(0, 1e6)).padStart(6, '0')
  db.pairCodes.set(sha(code), { userId, expiresAt: Date.now() + 600_000 })
  return code
}

/** Pager Composer: compress a contextual prompt into a ≤42-char pager note. */
function composeNote(prompt) {
  // Real server: LOT AI engine with fixed instruction; here: deterministic fallback.
  let t = (prompt.short || prompt.title || prompt.message).trim()
  if (t.length > NOTE_MAX) t = t.slice(0, NOTE_MAX - 1).trimEnd() + '…'
  return t
}

function enqueue(did, prompt, kind = 'nudge') {
  const msg = {
    id: 'msg_' + crypto.randomBytes(3).toString('hex'),
    did, t: composeNote(prompt), k: kind, buzz: 2, ttl: 3600,
    ts: Math.floor(Date.now() / 1000), ackedAt: null,
  }
  db.messages.push(msg)
  return msg
}

function authDevice(req) {
  const h = req.headers.authorization || ''
  const m = h.match(/^Device ([a-f0-9]{64})$/)
  if (!m) return null
  const hash = sha(m[1])
  for (const [did, d] of db.devices) {
    if (d.tokenHash.length === hash.length &&
        crypto.timingSafeEqual(Buffer.from(d.tokenHash), Buffer.from(hash))) return { did, ...d }
  }
  return null
}

const readJson = (req) => new Promise((resolve, reject) => {
  let b = ''
  req.on('data', (c) => { b += c; if (b.length > 4096) reject(new Error('too large')) })
  req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}) } catch (e) { reject(e) } })
})

const server = http.createServer(async (req, res) => {
  const send = (code, obj, headers = {}) => {
    const body = obj === undefined ? '' : JSON.stringify(obj)
    res.writeHead(code, { 'content-type': 'application/json', ...headers })
    res.end(body)
  }
  const url = new URL(req.url, 'http://x')
  const path = url.pathname.replace(/^\/api\/public\/device/, '')
  try {
    if (req.method === 'POST' && path === '/claim') {
      const { code, did, fw } = await readJson(req)
      const pc = db.pairCodes.get(sha(String(code)))
      if (!pc || pc.expiresAt < Date.now()) return send(401, { error: 'invalid code' })
      db.pairCodes.delete(sha(String(code))) // single use
      const token = crypto.randomBytes(32).toString('hex')
      db.devices.set(did, { userId: pc.userId, tokenHash: sha(token), fw, digest: '', lastSeenAt: Date.now() })
      const user = db.users.find((u) => u.id === pc.userId)
      return send(200, { token, name: user.name, next_poll_s: 600 })
    }
    const dev = authDevice(req)
    if (!dev) return send(401, { error: 'device auth required' })
    db.devices.get(dev.did).lastSeenAt = Date.now()

    if (req.method === 'GET' && path === '/inbox') {
      const msgs = db.messages
        .filter((m) => m.did === dev.did && !m.ackedAt)
        .map(({ id, t, k, ts, ttl, buzz }) => ({ id, t, k, ts, ttl, buzz }))
      const etag = '"' + sha(JSON.stringify(msgs)).slice(0, 16) + '"'
      if (req.headers['if-none-match'] === etag) return send(304, undefined, { etag })
      return send(200, {
        msgs, cursor: msgs.at(-1)?.id ?? null, next_poll_s: 600, quiet: false,
        face: { state: 'CALM', tc: 21 },
      }, { etag })
    }
    if (req.method === 'POST' && path === '/ack') {
      const { ids = [] } = await readJson(req)
      for (const m of db.messages) if (m.did === dev.did && ids.includes(m.id)) m.ackedAt = Date.now()
      return send(200, { ok: true })
    }
    if (req.method === 'POST' && path === '/copy') {
      const body = await readJson(req)
      if (typeof body.t !== 'string' || body.t.length > 200) return send(400, { error: 'bad text' })
      const dupe = db.logs.find((l) => l.metadata.deviceId === dev.did &&
        l.metadata.messageId === body.m && l.context.capturedAt === body.ts)
      if (dupe) return send(200, { ok: true, logId: dupe.id }) // idempotent
      const s = body.s || {}
      const log = {
        id: crypto.randomUUID(), userId: dev.userId, event: 'device_copy', text: body.t,
        metadata: { source: 'lot-01', deviceId: dev.did, messageId: body.m },
        context: { temperature: s.tc, humidity: s.rh, pressure: s.hp, iaq: s.iaq, battery: body.b, capturedAt: body.ts },
        createdAt: new Date().toISOString(),
      }
      db.logs.push(log)
      // Session compression: rolling ≤280-char digest per device
      const d = db.devices.get(dev.did)
      d.digest = (`${d.digest} ${new Date(body.ts * 1000).toISOString().slice(11, 16)} copied "${body.t}";`).trim().slice(-280)
      return send(200, { ok: true, logId: log.id })
    }
    if (req.method === 'POST' && path === '/telemetry') {
      const t = await readJson(req)
      Object.assign(db.devices.get(dev.did), { fw: t.fw, battery: t.b })
      return send(200, { ok: true })
    }
    return send(404, { error: 'not found' })
  } catch (e) {
    return send(400, { error: String(e.message || e) })
  }
})

// ───────────────────────── simulated LOT-01 device ─────────────────────────
class Lot01 {
  constructor(base) { this.base = base; this.did = 'LOT01-' + crypto.randomBytes(2).toString('hex').toUpperCase(); this.etag = null; this.screen = []; this.outbox = [] }
  async req(method, path, body, extraHeaders = {}) {
    const headers = { 'content-type': 'application/json', ...extraHeaders }
    if (this.token) headers.authorization = `Device ${this.token}`
    const r = await fetch(this.base + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
    const raw = await r.text()
    if (body) assert.ok(JSON.stringify(body).length <= 512, 'payload exceeds 512 B budget')
    return { status: r.status, etag: r.headers.get('etag'), json: raw ? JSON.parse(raw) : null }
  }
  async claim(code) {
    const r = await this.req('POST', '/claim', { code, did: this.did, fw: '0.1.0', hw: 'EVT1' })
    assert.equal(r.status, 200, 'claim failed')
    this.token = r.json.token
    this.render(['', `  HELLO, ${r.json.name.toUpperCase()}`, '', '  PAIRED ✓'])
  }
  async sync() {
    // 1) flush outbox first — a COPY is never lost
    while (this.outbox.length) {
      const r = await this.req('POST', '/copy', this.outbox[0])
      if (r.status !== 200) break
      this.outbox.shift()
      this.lastLogId = r.json.logId
    }
    // 2) poll inbox with ETag
    const r = await this.req('GET', '/inbox', null, this.etag ? { 'if-none-match': this.etag } : {})
    if (r.status === 304) return { changed: false }
    this.etag = r.etag
    const note = r.json.msgs.at(-1)
    if (note) {
      this.current = note
      this.buzz(note.buzz)
      this.render([`LOT`.padEnd(16) + new Date(note.ts * 1000).toISOString().slice(11, 16), '', `  ${note.t}`, '', '  ───────────', '  COPY → LOG'])
    }
    return { changed: true, note }
  }
  buzz(n) { this.buzzes = (this.buzzes || 0) + n }
  pressCopy() {
    assert.ok(this.current, 'nothing on screen to copy')
    this.outbox.push({ m: this.current.id, t: this.current.t, ts: Math.floor(Date.now() / 1000),
      s: { tc: 21.4, rh: 48.1, hp: 1012.6, iaq: 42, gas: 'clean' }, b: 81, fw: '0.1.0' })
    this.render(['', '', '    COPIED ✓', '    → LOG'])
  }
  render(lines) {
    const W = 21
    this.screen = lines
    const top = '┌' + '─'.repeat(W) + '┐', bot = '└' + '─'.repeat(W) + '┘'
    const body = Array.from({ length: 7 }, (_, i) => '│' + (lines[i] || '').slice(0, W).padEnd(W) + '│')
    console.log([top, ...body, bot].join('\n'))
  }
}

// ───────────────────────── scenario ─────────────────────────
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/api/public/device`
const results = []
const step = async (name, fn) => {
  try { await fn(); results.push(['PASS', name]); console.log(`\n✔ ${name}`) }
  catch (e) { results.push(['FAIL', name, e.message]); console.log(`\n✘ ${name}: ${e.message}`) }
}

const dev = new Lot01(base)
let code
await step('web issues 6-digit pair code', async () => { code = issuePairCode('u1'); assert.match(code, /^\d{6}$/) })
await step('device claims token with code', async () => dev.claim(code))
await step('pair code is single-use', async () => {
  const other = new Lot01(base)
  const r = await other.req('POST', '/claim', { code, did: other.did, fw: '0.1.0' })
  assert.equal(r.status, 401)
})
await step('unauthenticated inbox is rejected', async () => {
  const r = await fetch(base + '/inbox'); assert.equal(r.status, 401)
})
await step('Pager Composer queues "Coffee time!"', async () => {
  const m = enqueue(dev.did, { title: 'Morning ritual', short: 'Coffee time!', priority: 7 })
  assert.equal(m.t, 'Coffee time!')
})
await step('long prompt is compressed to ≤42 chars', async () => {
  const m = enqueue(dev.did, { title: "It's 21°C — you tend to feel calm in this weather. How are you now?" })
  assert.ok(m.t.length <= NOTE_MAX, `len ${m.t.length}`)
  db.messages = db.messages.filter((x) => x.id !== m.id)
})
await step('device polls inbox, buzzes, shows note', async () => {
  const r = await dev.sync()
  assert.equal(r.note.t, 'Coffee time!'); assert.equal(dev.buzzes, 2)
})
await step('second poll returns 304 (ETag, zero body)', async () => {
  const r = await dev.sync(); assert.equal(r.changed, false)
})
await step('COPY button → device_copy in Log tab', async () => {
  dev.pressCopy(); await dev.sync()
  const log = db.logs.at(-1)
  assert.equal(log.event, 'device_copy'); assert.equal(log.text, 'Coffee time!')
  assert.equal(log.context.temperature, 21.4); assert.equal(log.userId, 'u1')
})
await step('COPY retry is idempotent', async () => {
  const before = db.logs.length
  const dupe = { m: db.logs.at(-1).metadata.messageId, t: 'Coffee time!', ts: db.logs.at(-1).context.capturedAt, s: {}, b: 80 }
  const r = await dev.req('POST', '/copy', dupe)
  assert.equal(r.status, 200); assert.equal(db.logs.length, before)
})
await step('ack clears note from inbox', async () => {
  await dev.req('POST', '/ack', { ids: [dev.current.id] })
  const r = await dev.req('GET', '/inbox'); assert.equal(r.json.msgs.length, 0)
})
await step('session digest ≤280 chars', async () => {
  const d = db.devices.get(dev.did); assert.ok(d.digest.length > 0 && d.digest.length <= 280); console.log('  digest:', d.digest)
})
await step('telemetry updates battery/fw', async () => {
  await dev.req('POST', '/telemetry', { b: 80, rssi: -61, fw: '0.1.1', up: 3600 })
  assert.equal(db.devices.get(dev.did).fw, '0.1.1')
})

server.close()
const failed = results.filter((r) => r[0] === 'FAIL')
console.log(`\n${results.length - failed.length}/${results.length} PASS`)
process.exit(failed.length ? 1 : 0)
