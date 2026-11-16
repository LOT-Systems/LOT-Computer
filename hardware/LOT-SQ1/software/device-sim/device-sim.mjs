#!/usr/bin/env node
// SQ-1 device simulator — mirrors firmware/src/main.cpp wake logic over HTTP.
// Doubles as the Device API v1 contract test.
//   node device-sim.mjs                 -> starts an in-process mock (hour=8) and runs the test
//   node device-sim.mjs http://host:port -> runs against a live mock/staging (needs /_mock helpers)
import assert from 'node:assert/strict'
import { createServer } from '../mock-server/mock-lot-server.mjs'

const MAX_REPLY = 512
let base = process.argv[2]
let server
if (!base) {
  server = createServer({ clockHour: 8 })
  await new Promise((r) => server.listen(0, r))
  base = `http://127.0.0.1:${server.address().port}`
}

const results = []
const step = async (name, fn) => {
  try { await fn(); results.push(['PASS', name]) } catch (e) { results.push(['FAIL', name + ' — ' + e.message]) }
}
async function call(path, { method = 'POST', token, json, raw, headers = {} } = {}) {
  const h = { ...headers }
  if (token) h.authorization = `Bearer ${token}`
  let body
  if (json) { h['content-type'] = 'application/json'; body = JSON.stringify(json) }
  if (raw) { h['content-type'] = 'image/jpeg'; body = raw }
  const r = await fetch(base + path, { method, headers: h, body })
  const text = await r.text()
  return { status: r.status, size: Buffer.byteLength(text), data: text ? JSON.parse(text) : null }
}

const SERIAL = 'SQ1-0042'
let token, lastId
const seen = []
// Simulated "screen" — what the e-paper would hold
let screen = ''

await step('pair rejects bad code', async () => {
  const r = await call('/api/device/v1/pair', { json: { code: '000000', serial: SERIAL } })
  assert.equal(r.status, 400)
})
await step('pair with code from Settings → Devices', async () => {
  const { data: { code } } = await call('/_mock/pairing-code')
  const r = await call('/api/device/v1/pair', { json: { code, serial: SERIAL, fw: '0.1.0' } })
  assert.equal(r.status, 200)
  assert.match(r.data.device_token, /^lotd_/)
  token = r.data.device_token
})
await step('code is single-use', async () => {
  const { data: { code } } = await call('/_mock/pairing-code')
  await call('/api/device/v1/pair', { json: { code, serial: 'SQ1-0043' } })
  const again = await call('/api/device/v1/pair', { json: { code, serial: 'SQ1-0044' } })
  assert.equal(again.status, 400)
})
await step('sync without token → 401', async () => {
  const r = await call('/api/device/v1/sync', { json: {} })
  assert.equal(r.status, 401)
})
await step('timer wake: circadian "Coffee time!" at 08:00, reply ≤512 B', async () => {
  const r = await call('/api/device/v1/sync', { token, json: { fw: '0.1.0', bat: 87, rssi: -61, env: { t: 22.4, h: 41, p: 1012.6, iaq: 38 }, seen, wake: 'timer' } })
  assert.equal(r.status, 200)
  assert.ok(r.size <= MAX_REPLY, `reply ${r.size} B`)
  assert.equal(r.data.notification.text, 'Coffee time!')
  assert.ok(r.data.next_sync_s >= 60 && r.data.next_sync_s <= 7200)
  screen = r.data.notification.text; lastId = r.data.notification.id; seen.push(lastId)
})
await step('same hour, seen → no duplicate (screen untouched)', async () => {
  const r = await call('/api/device/v1/sync', { token, json: { bat: 86, seen } })
  assert.equal(r.data.notification, null)
})
await step('AI-queued message wins over fallback, clamped to 48 chars', async () => {
  await call('/_mock/notify', { json: { text: 'Rain at 16:00 — take the umbrella, and slow down on the way home today' } })
  const r = await call('/api/device/v1/sync', { token, json: { bat: 86, seen } })
  assert.ok(r.data.notification.text.length <= 48)
  screen = r.data.notification.text; lastId = r.data.notification.id
})
await step('BME688 gas class "coffee" → sensor moment', async () => {
  const r = await call('/api/device/v1/sync', { token, json: { bat: 85, seen, env: { gas: 'coffee' } } })
  assert.equal(r.data.notification.text, "Coffee's brewing. Log the ritual?")
})
await step('low battery doubles the sync interval', async () => {
  const hi = await call('/api/device/v1/sync', { token, json: { bat: 80, seen: ['*'] } })
  const lo = await call('/api/device/v1/sync', { token, json: { bat: 10, seen: ['*'] } })
  assert.equal(lo.data.next_sync_s, hi.data.next_sync_s * 2)
})
await step('COPY short-press → device_copy in Log tab', async () => {
  const r = await call('/api/device/v1/copy', { token, json: { notification_id: lastId, text: screen, at: new Date().toISOString() } })
  assert.equal(r.status, 200); assert.ok(r.data.ok)
  const { data: log } = await call('/_mock/log', { method: 'GET' })
  const e = log.find((x) => x.event === 'device_copy')
  assert.equal(e.text, screen); assert.equal(e.metadata.source, 'sq1')
})
await step('COPY with empty text → 400', async () => {
  const r = await call('/api/device/v1/copy', { token, json: { text: '   ' } })
  assert.equal(r.status, 400)
})
await step('long-press photo (JPEG) → device_photo', async () => {
  const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(4096, 1), Buffer.from([0xff, 0xd9])])
  const r = await call('/api/device/v1/photo', { token, raw: jpeg, headers: { 'x-notification-id': lastId } })
  assert.equal(r.status, 200)
})
await step('non-JPEG photo rejected', async () => {
  const r = await call('/api/device/v1/photo', { token, raw: Buffer.from('hello') })
  assert.equal(r.status, 400)
})
await step('telemetry compressed: 1 row/hour', async () => {
  const { data: log } = await call('/_mock/log', { method: 'GET' })
  assert.equal(log.filter((x) => x.event === 'device_telemetry').length, 1)
})

for (const [s, n] of results) console.log(`${s}  ${n}`)
const failed = results.filter(([s]) => s === 'FAIL').length
console.log(`\n${results.length - failed}/${results.length} passed`)
if (server) server.close()
process.exit(failed ? 1 : 0)
