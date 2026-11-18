#!/usr/bin/env node
/**
 * LOT TILE simulator: an in-memory mock of /api/device/v1 plus a simulated device.
 * Proves the end-to-end flow before hardware exists:
 *   AI nudge queued → device wakes at next_wake_at → shows "Coffee time!" → COPY →
 *   Log row (event=device_copy) → retry is idempotent → telemetry accepted.
 * Run: node hardware/lot-tile/connector/device-sim.mjs   (exit code 0 = all checks pass)
 */
import http from 'node:http'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { applyEvents, buildSyncResponse, clampText, computeNextWake } from './device-core.mjs'

// ---------- mock server state ----------
const TOKEN = crypto.randomBytes(32).toString('hex')
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex')
const db = {
  devices: [{ id: 'dev-1', userId: 'user-vadik', serial: 'P1-0001', tokenHash: sha(TOKEN), mode: 'calm', cameraEnabled: false }],
  notifications: [],
  logs: [],
  telemetry: [],
  seqs: new Set(),
}
let clock = Date.parse('2026-11-18T09:00:00Z')

const store = {
  seenSeq: async (d, s) => db.seqs.has(`${d}:${s}`),
  markSeq: async (d, s) => db.seqs.add(`${d}:${s}`),
  findNotification: async (id) => db.notifications.find((n) => n.id === id) || null,
  createLog: async (row) => db.logs.push({ id: db.logs.length + 1, createdAt: new Date(clock), ...row }),
  markRead: async (id) => { const n = db.notifications.find((x) => x.id === id); if (n) n.readAt = clock },
}

function auth(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '')
  return m && db.devices.find((d) => d.tokenHash === sha(m[1]))
}

const server = http.createServer(async (req, res) => {
  const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)) }
  let body = ''
  for await (const c of req) body += c
  const device = auth(req)
  if (!device) return send(401, { error: 'unauthorized' })
  const json = body ? JSON.parse(body) : {}

  if (req.method === 'POST' && req.url === '/api/device/v1/sync') {
    const acked = await applyEvents(store, device, json.events)
    if (json.telemetry) db.telemetry.push({ deviceId: device.id, at: clock, ...json.telemetry })
    const mine = db.notifications.filter((n) => n.userId === device.userId)
    const delivered = mine.filter((n) => !n.deliveredAt && n.deliverAt <= clock + 30_000)
    delivered.forEach((n) => (n.deliveredAt = clock))
    const pending = mine.filter((n) => !n.deliveredAt)
    return send(200, buildSyncResponse({ nowMs: clock, delivered, pending, device, acked }))
  }
  if (req.method === 'POST' && req.url === '/api/device/v1/events') {
    return send(200, { acked_seq: await applyEvents(store, device, json.events) })
  }
  send(404, { error: 'not found' })
})

// ---------- simulated device ----------
function makeDevice(base, token) {
  const rtc = { ring: [], seq: 0, current: null, screen: '(blank)' }
  const post = async (path, obj, tok = token) => {
    const r = await fetch(base + path, { method: 'POST', headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json' }, body: JSON.stringify(obj) })
    return { status: r.status, json: await r.json() }
  }
  return {
    rtc, post,
    pressCopy() {
      if (!rtc.current) return
      rtc.ring.push({ seq: ++rtc.seq, type: 'copy', notification_id: rtc.current.id, ts: new Date(clock).toISOString() })
      rtc.screen = '⧉ COPIED'
    },
    async wake({ dropResponse = false } = {}) {
      const tm = { t: 21.4, rh: 48, p: 1013.2, iaq: 42, uv: 2.1, batt: 81, rssi: -61 }
      const { status, json } = await post('/api/device/v1/sync', { events: rtc.ring, telemetry: tm })
      assert.equal(status, 200)
      if (dropResponse) return json // simulate response lost in transit: ring is NOT cleared
      rtc.ring = rtc.ring.filter((e) => e.seq > json.acked_seq)
      const last = json.notifications.at(-1)
      if (last) { rtc.current = last; rtc.screen = last.text }
      return json
    },
  }
}

// ---------- scenario ----------
const results = []
const check = (name, fn) => { fn(); results.push(`  ✔ ${name}`) }

await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`
const dev = makeDevice(base, TOKEN)

try {
  // 1. Site AI queues a nudge for 09:41
  db.notifications.push({ id: 'n_7Qx', userId: 'user-vadik', text: 'Coffee time!', kind: 'nudge', deliverAt: Date.parse('2026-11-18T09:41:00Z') })

  // 2. Device wakes at 09:00: nothing to show yet, told to wake 30 s before 09:41
  let r = await dev.wake()
  check('server schedules wake 30 s before the nudge', () => assert.equal(r.next_wake_at, '2026-11-18T09:40:30.000Z'))
  check('no notification delivered early', () => assert.equal(r.notifications.length, 0))

  // 3. Wake at next_wake_at → notification delivered
  clock = Date.parse(r.next_wake_at)
  r = await dev.wake()
  check('pager shows "Coffee time!"', () => assert.equal(dev.rtc.screen, 'Coffee time!'))
  check('with nothing queued, sleep is capped at 3 h', () => assert.equal(r.next_wake_epoch - clock / 1000, 3 * 3600))

  // 4. User presses COPY; the first sync response is lost; device retries
  clock += 7000
  dev.pressCopy()
  await dev.wake({ dropResponse: true })
  check('event stays queued in RTC ring when the response is lost', () => assert.equal(dev.rtc.ring.length, 1))
  r = await dev.wake()
  check('retry is acked and ring cleared', () => { assert.equal(r.acked_seq, 1); assert.equal(dev.rtc.ring.length, 0) })
  check('exactly ONE Log row (idempotent), event=device_copy', () => {
    assert.equal(db.logs.length, 1)
    assert.equal(db.logs[0].event, 'device_copy')
    assert.equal(db.logs[0].text, 'Coffee time!')
    assert.equal(db.logs[0].userId, 'user-vadik')
    assert.equal(db.logs[0].metadata.serial, 'P1-0001')
  })

  // 5. Telemetry arrived with each sync
  check('telemetry stored (BME688/UV/battery)', () => assert.ok(db.telemetry.length >= 3 && db.telemetry[0].uv === 2.1))

  // 6. Security: bad token rejected; cannot COPY another user's notification
  const bad = await dev.post('/api/device/v1/events', { events: [] }, 'nope')
  check('invalid token → 401', () => assert.equal(bad.status, 401))
  db.notifications.push({ id: 'n_other', userId: 'user-x', text: 'secret', kind: 'nudge', deliverAt: clock })
  await dev.post('/api/device/v1/events', { events: [{ seq: 99, type: 'copy', notification_id: 'n_other', ts: 'x' }] })
  check('cross-account COPY ignored', () => assert.equal(db.logs.length, 1))

  // 7. Pure helpers
  check('96-byte clamp keeps UTF-8 intact', () => {
    const t = clampText('☕'.repeat(60))
    assert.ok(new TextEncoder().encode(t).length <= 96 && t.endsWith('…'))
  })
  check('next wake never in the past', () => assert.ok(computeNextWake(1000, [{ deliverAt: 1001 }]) > 1000))

  console.log('LOT TILE device simulator\n' + results.join('\n') + `\n${results.length}/${results.length} checks passed`)
} catch (e) {
  console.log(results.join('\n'))
  console.error('✘ FAILED:', e.message)
  process.exitCode = 1
} finally {
  server.close()
}
