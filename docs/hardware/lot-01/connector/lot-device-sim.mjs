#!/usr/bin/env node
/**
 * LOT·01 device simulator + mock server. No dependencies (Node 18+).
 *
 *   node lot-device-sim.mjs --serve [--port 8787]      mock /device-api/v1 + /api/devices/claim
 *   node lot-device-sim.mjs --device --base URL         behave like the firmware against any server
 *   node lot-device-sim.mjs --selftest                  start mock, run full loop, assert, exit 0/1
 *
 * The device side mirrors firmware/src/main.cpp: pair → poll inbox → buzz/show → ack → Copy → Log.
 */
import http from 'node:http'
import crypto from 'node:crypto'

const args = process.argv.slice(2)
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d }
const MAX_TEXT = 64

// ----------------------------------------------------------------- mock server
export function createMockServer() {
  const pairings = new Map()   // device_code -> {user_code, serial, user_id}
  const devices = new Map()    // token_hash -> {id, user_id}
  const notifications = []     // {id, user_id, text, kind, ts}
  const logs = []              // what the Log tab would show
  let nid = 0
  const sha = (s) => crypto.createHash('sha256').update(s).digest('hex')

  const routes = {
    'POST /device-api/v1/pair/start': (b) => {
      const device_code = crypto.randomBytes(12).toString('base64url')
      const user_code = 'LOT-' + crypto.randomBytes(2).toString('hex').toUpperCase()
      pairings.set(device_code, { user_code, serial: b.serial, user_id: null })
      return [200, { device_code, user_code, interval: 1 }]
    },
    'POST /device-api/v1/pair/poll': (b) => {
      const p = pairings.get(b.device_code)
      if (!p) return [410, { status: 'expired' }]
      if (!p.user_id) return [200, { status: 'pending' }]
      const token = 'ld1_' + crypto.randomBytes(16).toString('base64url')
      const id = crypto.randomUUID()
      devices.set(sha(token), { id, user_id: p.user_id })
      pairings.delete(b.device_code)
      return [200, { status: 'ok', token, device_id: id }]
    },
    // session-authenticated on the real server; here the user id is in the body
    'POST /api/devices/claim': (b) => {
      for (const p of pairings.values()) if (p.user_code === b.user_code && !p.user_id) { p.user_id = b.user_id; return [200, { ok: true }] }
      return [404, { error: 'code not found or expired' }]
    },
    // test hook standing in for the AI scheduled job
    'POST /mock/notify': (b) => {
      notifications.push({ id: ++nid, user_id: b.user_id, text: String(b.text).slice(0, MAX_TEXT), kind: b.kind || 'nudge', ts: Math.floor(Date.now() / 1000) })
      return [200, { id: nid }]
    },
    'GET /mock/logs': () => [200, { logs }],
  }
  const authed = {
    'GET /device-api/v1/inbox': (d, b, q) => {
      const since = Number(q.get('since')) || 0
      const items = notifications.filter((n) => n.user_id === d.user_id && n.id > since)
        .map((n) => ({ id: String(n.id), t: n.text, k: n.kind, ts: n.ts, ttl: 21600 }))
      return [200, { items, next_poll_s: 900 }]
    },
    'POST /device-api/v1/ack': () => [200, { ok: true }],
    'POST /device-api/v1/copy': (d, b) => {
      const text = String(b.t || '').trim().slice(0, MAX_TEXT)
      if (!text) return [400, { error: 'empty' }]
      const log = { id: crypto.randomUUID(), userId: d.user_id, event: 'note', text,
        metadata: { source: 'lot-01', deviceId: d.id, notificationId: b.id ?? null, env: b.env ?? null } }
      logs.push(log)
      return [200, { ok: true, log_id: log.id }]
    },
    'POST /device-api/v1/telemetry': () => [200, { ok: true }],
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    let raw = ''
    for await (const c of req) raw += c
    const body = raw ? JSON.parse(raw) : {}
    const key = `${req.method} ${url.pathname}`
    let out = [404, { error: 'not found' }]
    if (routes[key]) out = routes[key](body, url.searchParams)
    else if (authed[key]) {
      const h = req.headers.authorization || ''
      const d = h.startsWith('Bearer ld1_') && devices.get(sha(h.slice(7)))
      out = d ? authed[key](d, body, url.searchParams) : [401, { error: 'unauthorized' }]
    }
    const json = JSON.stringify(out[1])
    res.writeHead(out[0], { 'content-type': 'application/json', 'content-length': Buffer.byteLength(json) })
    res.end(json)
  })
  return { server, logs }
}

// ---------------------------------------------------------------- device side
export class SimDevice {
  constructor(base, log = console.log) { this.base = base.replace(/\/$/, ''); this.token = ''; this.lastId = ''; this.lastText = ''; this.log = log }
  async call(method, path, body) {
    const r = await fetch(this.base + path, { method, headers: { 'content-type': 'application/json', ...(this.token && { authorization: `Bearer ${this.token}` }) }, body: body && JSON.stringify(body) })
    const j = await r.json(); j._status = r.status; return j
  }
  screen(text, footer = '') { this.log(`  ┌${'─'.repeat(22)}┐\n  │ ${text.padEnd(20).slice(0, 20)} │\n  │ ${footer.padEnd(20).slice(0, 20)} │\n  └${'─'.repeat(22)}┘`) }
  async pairStart() { const r = await this.call('POST', '/device-api/v1/pair/start', { serial: 'SIM-0001', fw: '0.1.0', hw: 'lot-01-sim' }); this.screen('Pair at lot-systems', r.user_code); return r }
  async pairWait(deviceCode, tries = 30) {
    for (let i = 0; i < tries; i++) {
      const r = await this.call('POST', '/device-api/v1/pair/poll', { device_code: deviceCode })
      if (r.status === 'ok') { this.token = r.token; this.screen('Paired.', 'LOT-01'); return true }
      if (r.status !== 'pending') return false
      await new Promise((s) => setTimeout(s, 1000))
    }
    return false
  }
  async poll() {
    const r = await this.call('GET', `/device-api/v1/inbox${this.lastId ? `?since=${this.lastId}` : ''}`)
    const item = r.items?.at(-1)
    if (item) { this.lastId = item.id; this.lastText = item.t; this.log('  bzz bzz'); this.screen(item.t, '87%'); await this.call('POST', '/device-api/v1/ack', { id: item.id }) }
    return { item, next: r.next_poll_s }
  }
  async copy(env = { c: 21.4, rh: 44, hpa: 1013.2, iaq: 38 }) {
    const r = await this.call('POST', '/device-api/v1/copy', { id: this.lastId, t: this.lastText, ts: Math.floor(Date.now() / 1000), env })
    this.screen(this.lastText, r.ok ? 'Copied to Log' : 'Copy failed'); return r
  }
}

// -------------------------------------------------------------------- modes
async function selftest() {
  const { server, logs } = createMockServer()
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const base = `http://127.0.0.1:${server.address().port}`
  const userId = 'user-vadik-test'
  const dev = new SimDevice(base)
  const check = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('✓ ' + m) }
  try {
    const p = await dev.pairStart()
    check(/^LOT-/.test(p.user_code), 'pair/start returns a user code')
    const unauth = await dev.call('GET', '/device-api/v1/inbox')
    check(unauth._status === 401, 'inbox rejects unpaired device')
    const claim = await fetch(base + '/api/devices/claim', { method: 'POST', body: JSON.stringify({ user_code: p.user_code, user_id: userId }) }).then((r) => r.json())
    check(claim.ok, 'user claims code in Settings')
    check(await dev.pairWait(p.device_code), 'device receives token')
    check(!(await dev.poll()).item, 'empty inbox → no buzz')
    await fetch(base + '/mock/notify', { method: 'POST', body: JSON.stringify({ user_id: userId, text: 'Coffee time!' }) })
    const { item } = await dev.poll()
    check(item?.t === 'Coffee time!', 'AI notification delivered')
    check(!(await dev.poll()).item, 'since= cursor prevents re-delivery')
    const c = await dev.copy()
    check(c.ok && c.log_id, 'Copy accepted')
    check(logs.length === 1 && logs[0].event === 'note' && logs[0].text === 'Coffee time!' && logs[0].metadata.source === 'lot-01', 'Log tab row created (event=note, source=lot-01)')
    await fetch(base + '/mock/notify', { method: 'POST', body: JSON.stringify({ user_id: userId, text: 'x'.repeat(200) }) })
    check((await dev.poll()).item.t.length === MAX_TEXT, `text capped at ${MAX_TEXT} chars`)
    console.log('\nSELFTEST PASS')
  } catch (e) { console.error(e.message); process.exitCode = 1 } finally { server.close() }
}

if (args.includes('--selftest')) await selftest()
else if (args.includes('--serve')) {
  const { server } = createMockServer(); const port = Number(arg('--port', 8787))
  server.listen(port, () => console.log(`LOT·01 mock device-api on http://localhost:${port}/device-api/v1`))
} else if (args.includes('--device')) {
  const dev = new SimDevice(arg('--base', 'http://localhost:8787'))
  const p = await dev.pairStart()
  console.log(`Claim ${p.user_code} in LOT Settings → Devices (mock: POST /api/devices/claim)`)
  if (await dev.pairWait(p.device_code, 600)) for (;;) { const { next } = await dev.poll(); await new Promise((s) => setTimeout(s, Math.min(next, 30) * 1000)) }
} else console.log('usage: --selftest | --serve [--port N] | --device --base URL')
