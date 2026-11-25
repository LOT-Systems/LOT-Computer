#!/usr/bin/env node
/**
 * LOT SYSTEMS CORPORATION · LOT-HW-01 "TILE"
 * Reference connector for the LOT Device API (spec: hardware/docs/06-SOFTWARE-LOT-API-CONNECTOR.md)
 *
 * One file, no dependencies, Node >= 18.
 *
 *   node lot-device.mjs selftest                       mock server + emulated TILE, end to end
 *   node lot-device.mjs mock [--port 8787]             run only the mock LOT Device API
 *   node lot-device.mjs pair  --base URL --code 123456 pair an emulated TILE, prints token
 *   node lot-device.mjs inbox --base URL --token T     fetch inbox (compact format)
 *   node lot-device.mjs copy  --base URL --token T --id N --text "Coffee time."
 *
 * The firmware (hardware/firmware) speaks exactly the same wire format.
 */

import http from 'node:http'
import crypto from 'node:crypto'
import zlib from 'node:zlib'

// ─── Wire format (shared with firmware) ────────────────────────────────────────
// Compact inbox ("fmt=c"): short keys keep one sync under ~300 bytes before deflate.
//   { v:1, c:<cursor>, t:<server epoch s>, s:<sync interval s>,
//     i:[ [id, text, fireAt|0, ttl s, flags] ... ] }
// flags bit0 = haptic-worthy (unused on v1 hardware), bit1 = pinned, bit2 = AI-generated
export const MAX_TEXT = 64
export const FLAG_AI = 4

export function compressLine(text) {
  // Site-side "compression" of a message into one TILE line (LOT style: no emoji, ends with a period).
  let s = String(text || '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
  s = s.replace(/[!✓]+$/u, '').trim()
  if (s.length > MAX_TEXT) s = s.slice(0, MAX_TEXT - 1).replace(/\s+\S*$/, '') + '…'
  if (s && !/[.?…]$/.test(s)) s += '.'
  return s
}

export function encodeInbox({ cursor, now, syncSec, items }) {
  return {
    v: 1,
    c: cursor,
    t: now,
    s: syncSec,
    i: items.map((n) => [n.id, n.text, n.fireAt || 0, n.ttl || 0, n.flags || 0]),
  }
}

export function decodeInbox(c) {
  return {
    cursor: c.c,
    now: c.t,
    syncSec: c.s,
    items: c.i.map(([id, text, fireAt, ttl, flags]) => ({ id, text, fireAt, ttl, flags })),
  }
}

// Per-session digest: everything one wake session did, folded into one small object.
export function sessionDigest({ sessionId, wakes, copies, batteryPct, env }) {
  const avg = (k) => (env.length ? +(env.reduce((a, r) => a + r[k], 0) / env.length).toFixed(1) : null)
  return { sid: sessionId, w: wakes, cp: copies, b: batteryPct, e: { t: avg('t'), rh: avg('rh'), p: avg('p'), iaq: avg('iaq') } }
}

// ─── Mock LOT Device API (mirrors the proposed server routes) ──────────────────
export function createMockServer() {
  const state = {
    pairCodes: new Map(), // code -> userId
    devices: new Map(), // tokenHash -> { deviceId, userId }
    notifications: [], // { id, userId, text, fireAt, ttl, flags }
    logs: [], // mirrors the `logs` table rows the site's Log tab renders
    telemetry: [],
    nextId: 1,
  }
  const hash = (t) => crypto.createHash('sha256').update(t).digest('hex')

  const api = {
    state,
    issuePairCode(userId) {
      const code = String(crypto.randomInt(0, 1e6)).padStart(6, '0')
      state.pairCodes.set(code, userId)
      return code
    },
    notify(userId, text, { fireAt = 0, ttl = 6 * 3600, flags = FLAG_AI } = {}) {
      const n = { id: state.nextId++, userId, text: compressLine(text), fireAt, ttl, flags }
      state.notifications.push(n)
      return n
    },
  }

  const send = (res, code, body, req) => {
    let buf = Buffer.from(JSON.stringify(body))
    const headers = { 'content-type': 'application/json' }
    if (req && /deflate/.test(req.headers['accept-encoding'] || '')) {
      buf = zlib.deflateSync(buf)
      headers['content-encoding'] = 'deflate'
    }
    res.writeHead(code, headers)
    res.end(buf)
  }

  const readBody = (req) =>
    new Promise((resolve) => {
      const chunks = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', () => resolve(Buffer.concat(chunks)))
    })

  const auth = (req) => {
    const m = /^Bearer (lotdev_[A-Za-z0-9_-]+)$/.exec(req.headers.authorization || '')
    return m ? state.devices.get(hash(m[1])) : null
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    const raw = await readBody(req)
    const json = () => {
      try {
        return JSON.parse(raw.toString() || '{}')
      } catch {
        return null
      }
    }

    if (req.method === 'POST' && url.pathname === '/api/device/pair') {
      const b = json()
      const userId = b && state.pairCodes.get(b.code)
      if (!userId) return send(res, 401, { error: 'invalid_code' })
      state.pairCodes.delete(b.code)
      const token = 'lotdev_' + crypto.randomBytes(24).toString('base64url')
      state.devices.set(hash(token), { deviceId: b.deviceId, userId, fw: b.fw })
      return send(res, 200, { token, syncSec: 900 })
    }

    const dev = auth(req)
    if (!dev) return send(res, 401, { error: 'unauthorized' })

    if (req.method === 'GET' && url.pathname === '/api/device/inbox') {
      const since = Number(url.searchParams.get('since') || 0)
      const now = Math.floor(Date.now() / 1000)
      const items = state.notifications.filter((n) => n.userId === dev.userId && n.id > since)
      const cursor = items.length ? items[items.length - 1].id : since
      return send(res, 200, encodeInbox({ cursor, now, syncSec: 900, items }), req)
    }

    if (req.method === 'POST' && url.pathname === '/api/device/copy') {
      const b = json()
      if (!b || !b.text) return send(res, 400, { error: 'text_required' })
      const log = {
        id: crypto.randomUUID(),
        userId: dev.userId,
        event: 'device_copy',
        text: String(b.text).slice(0, 2000),
        metadata: { source: 'tile', deviceId: dev.deviceId, notificationId: b.id ?? null, env: b.env ?? null, at: b.at ?? null },
        createdAt: new Date().toISOString(),
      }
      state.logs.push(log)
      return send(res, 200, { logId: log.id })
    }

    if (req.method === 'POST' && url.pathname === '/api/device/telemetry') {
      const b = json()
      if (!b) return send(res, 400, { error: 'bad_json' })
      state.telemetry.push({ deviceId: dev.deviceId, ...b })
      return send(res, 200, { ok: true })
    }

    if (req.method === 'POST' && url.pathname === '/api/device/photo') {
      if (raw.length === 0 || raw.length > 64 * 1024) return send(res, 413, { error: 'photo_size' })
      const log = {
        id: crypto.randomUUID(),
        userId: dev.userId,
        event: 'device_photo',
        text: 'Photo from TILE.',
        metadata: { source: 'tile', deviceId: dev.deviceId, bytes: raw.length, type: req.headers['content-type'] },
        createdAt: new Date().toISOString(),
      }
      state.logs.push(log)
      return send(res, 200, { logId: log.id })
    }

    send(res, 404, { error: 'not_found' })
  })

  return { server, api }
}

// ─── Device-side client (what the firmware does, in JS) ────────────────────────
export class TileClient {
  constructor({ base, token = null, deviceId = 'TILE-' + crypto.randomBytes(3).toString('hex').toUpperCase() }) {
    this.base = base.replace(/\/$/, '')
    this.token = token
    this.deviceId = deviceId
    this.cursor = 0
  }
  async req(method, path, body, headers = {}) {
    const h = { 'accept-encoding': 'deflate', ...headers }
    if (this.token) h.authorization = 'Bearer ' + this.token
    let payload = body
    if (body && !(body instanceof Uint8Array)) {
      h['content-type'] = 'application/json'
      payload = JSON.stringify(body)
    }
    const r = await fetch(this.base + path, { method, headers: h, body: payload })
    // Node's fetch transparently inflates deflate responses.
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${JSON.stringify(data)}`)
    return data
  }
  async pair(code) {
    const r = await this.req('POST', '/api/device/pair', { code, deviceId: this.deviceId, hw: 'LOT-HW-01', fw: '0.1.0' })
    this.token = r.token
    return r
  }
  async inbox() {
    const c = await this.req('GET', `/api/device/inbox?since=${this.cursor}&fmt=c`)
    const d = decodeInbox(c)
    this.cursor = d.cursor
    return d
  }
  copy(n, env) {
    return this.req('POST', '/api/device/copy', { id: n.id, text: n.text, env, at: Math.floor(Date.now() / 1000) })
  }
  telemetry(digest) {
    return this.req('POST', '/api/device/telemetry', digest)
  }
  photo(bytes) {
    return this.req('POST', '/api/device/photo', bytes, { 'content-type': 'image/x-portable-graymap' })
  }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
function arg(name, def) {
  const i = process.argv.indexOf('--' + name)
  return i > 0 ? process.argv[i + 1] : def
}

async function selftest() {
  const { server, api } = createMockServer()
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const base = `http://127.0.0.1:${server.address().port}`
  const check = (ok, msg) => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`)
    if (!ok) process.exitCode = 1
  }
  try {
    const user = 'user-vadik'
    const code = api.issuePairCode(user) // shown on lot-systems.com Settings → Devices
    const tile = new TileClient({ base })

    let rejected = false
    try {
      await tile.pair('000000' === code ? '111111' : '000000')
    } catch {
      rejected = true
    }
    check(rejected, 'pair rejects a wrong code')

    await tile.pair(code)
    check(/^lotdev_/.test(tile.token), 'pair returns a device token')

    api.notify(user, '☕ Coffee time!')
    api.notify(user, 'Walk outside for ten minutes, the air is good', { fireAt: Math.floor(Date.now() / 1000) + 3600 })
    api.notify('someone-else', 'Not for this TILE.')

    const inbox = await tile.inbox()
    check(inbox.items.length === 2, 'inbox returns only this user\'s 2 notifications')
    check(inbox.items[0].text === 'Coffee time.', `compression: "☕ Coffee time!" → "${inbox.items[0].text}"`)
    check(inbox.items[1].fireAt > 0, 'scheduled notification carries fireAt')

    const again = await tile.inbox()
    check(again.items.length === 0, 'cursor: second sync returns nothing new')

    const env = { t: 21.4, rh: 44, p: 1013.2, iaq: 38 }
    const r = await tile.copy(inbox.items[0], env)
    const log = api.state.logs.find((l) => l.id === r.logId)
    check(log && log.event === 'device_copy' && log.text === 'Coffee time.', 'Copy creates a Log entry (event device_copy)')
    check(log && log.metadata.env.t === 21.4, 'Log entry carries the weather snapshot')

    const digest = sessionDigest({ sessionId: 1, wakes: 96, copies: 1, batteryPct: 87, env: [env, { ...env, t: 22.0 }] })
    await tile.telemetry(digest)
    check(api.state.telemetry.length === 1 && api.state.telemetry[0].e.t === 21.7, 'session digest compresses readings (avg t = 21.7)')

    const pgm = new Uint8Array(Buffer.concat([Buffer.from('P5\n4 4\n255\n'), Buffer.alloc(16, 128)]))
    const p = await tile.photo(pgm)
    check(api.state.logs.some((l) => l.id === p.logId && l.event === 'device_photo'), 'Photo creates a Log entry (event device_photo)')

    const wire = Buffer.byteLength(JSON.stringify(encodeInbox({ cursor: 2, now: 0, syncSec: 900, items: inbox.items })))
    const deflated = zlib.deflateSync(JSON.stringify(encodeInbox({ cursor: 2, now: 0, syncSec: 900, items: inbox.items }))).length
    console.log(`INFO  compact inbox wire size: ${wire} B JSON, ${deflated} B deflated`)

    const bad = new TileClient({ base, token: 'lotdev_wrong' })
    let unauth = false
    try {
      await bad.inbox()
    } catch {
      unauth = true
    }
    check(unauth, 'unknown token is rejected')
  } finally {
    server.close()
  }
}

const cmd = process.argv[2]
if (cmd === 'selftest') {
  await selftest()
} else if (cmd === 'mock') {
  const { server, api } = createMockServer()
  const port = Number(arg('port', 8787))
  server.listen(port, () => {
    const code = api.issuePairCode('demo-user')
    api.notify('demo-user', 'Coffee time!')
    console.log(`mock LOT Device API on http://localhost:${port}  pair code: ${code}`)
  })
} else if (cmd === 'pair') {
  const t = new TileClient({ base: arg('base') })
  console.log(await t.pair(arg('code')))
} else if (cmd === 'inbox') {
  const t = new TileClient({ base: arg('base'), token: arg('token') })
  console.log(JSON.stringify(await t.inbox(), null, 2))
} else if (cmd === 'copy') {
  const t = new TileClient({ base: arg('base'), token: arg('token') })
  console.log(await t.copy({ id: Number(arg('id', 0)), text: arg('text') }, null))
} else if (cmd) {
  console.error('unknown command: ' + cmd)
  process.exitCode = 2
} else {
  console.log('usage: node lot-device.mjs selftest | mock | pair | inbox | copy  (see header)')
}
