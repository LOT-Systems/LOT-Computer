#!/usr/bin/env node
/**
 * LOT-01 device simulator + end-to-end protocol test.
 * Plays the firmware's role against the connector over real HTTP:
 *   pair → notification arrives → shown + buzz → ack → COPY → Log entry
 *   → telemetry → camera frame → error cases.
 * Run:  node hardware/software/simulator/lot01-sim.mjs
 */
import assert from 'node:assert/strict'
import { createDeviceCore, createMemoryStore, compressMessage } from '../server/device-core.mjs'
import { createDeviceHttpServer } from '../server/http-adapter.mjs'

const logs = []
const store = createMemoryStore()
const core = createDeviceCore({ store, createLog: async (e) => { const l = { id: `log_${logs.length + 1}`, ...e }; logs.push(l); return l } })
const server = createDeviceHttpServer(core)
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/api/device`
const USER = '00000000-0000-4000-8000-000000000001'

let passed = 0
const step = async (name, fn) => { await fn(); passed++; console.log(`  PASS  ${name}`) }
const call = async (method, path, { token, json, body, type } = {}) => {
  const headers = {}
  if (token) headers.authorization = `Bearer ${token}`
  if (json) headers['content-type'] = 'application/json'
  if (type) headers['content-type'] = type
  const res = await fetch(base + path, { method, headers, body: json ? JSON.stringify(json) : body })
  return { status: res.status, body: await res.json() }
}

console.log('LOT-01 SIMULATOR — protocol v1')
let token, msgId

try {
  await step('compressMessage: emoji stripped, "!" → ".", ≤ 64 chars', () => {
    assert.equal(compressMessage('Coffee time! ☕'), 'Coffee time.')
    assert.equal(compressMessage('Rain at 16:00, take the coat'), 'Rain at 16:00, take the coat.')
    const long = compressMessage('Your evening check-in is ready and the memory engine has a new question about your morning routine today')
    assert.ok(long.length <= 64 && long.endsWith('…'), long)
  })

  const { code } = await core.createPairingCode(USER)
  await step('pair with 6-digit code → token', async () => {
    const r = await call('POST', '/pair', { json: { code, hw_id: 'LOT01-EVT-0001', fw: '0.1.0' } })
    assert.equal(r.status, 201); token = r.body.token; assert.ok(token.length >= 40)
  })
  await step('pairing code is single-use', async () => {
    const r = await call('POST', '/pair', { json: { code, hw_id: 'LOT01-EVT-0002' } })
    assert.equal(r.status, 403)
  })
  await step('bad token → 401', async () => {
    assert.equal((await call('GET', '/inbox', { token: 'x'.repeat(43) })).status, 401)
    assert.equal((await call('GET', '/inbox')).status, 401)
  })

  await core.notify(USER, { text: 'Coffee time! ☕', kind: 'routine' })
  await step('inbox delivers "Coffee time." with buzz + next_poll_s', async () => {
    const r = await call('GET', '/inbox?h=9', { token })
    assert.equal(r.status, 200); assert.equal(r.body.messages.length, 1)
    const m = r.body.messages[0]; msgId = m.id
    assert.equal(m.text, 'Coffee time.'); assert.equal(m.buzz, true); assert.equal(r.body.next_poll_s, 300)
    console.log(`        ┌────────────────┐\n        │ ${m.text.padEnd(14)} │  bzz\n        └────────────────┘`)
  })
  await step('night poll slows to 1800 s', async () => {
    assert.equal((await call('GET', '/inbox?h=2', { token })).body.next_poll_s, 1800)
  })
  await step('ack removes message from inbox', async () => {
    assert.equal((await call('POST', '/ack', { token, json: { ids: [msgId] } })).status, 200)
    assert.equal((await call('GET', '/inbox', { token })).body.messages.length, 0)
  })
  await step('COPY → Log entry (event device_copy) for the right user', async () => {
    const r = await call('POST', '/copy', { token, json: { message_id: msgId, readings: { t_c: 21.4, rh: 40, gas_class: 'coffee' }, ts: '2026-11-12T09:41:00Z' } })
    assert.equal(r.status, 201)
    const l = logs.find((x) => x.id === r.body.log_id)
    assert.equal(l.userId, USER); assert.equal(l.event, 'device_copy'); assert.equal(l.text, 'Coffee time.')
    assert.equal(l.metadata.readings.gas_class, 'coffee'); assert.equal(l.metadata.source, 'LOT-01')
  })
  await step('telemetry accepted, out-of-range values dropped', async () => {
    const r = await call('POST', '/telemetry', { token, json: { t_c: 12.3, rh: 55, p_hpa: 1012, iaq: 48, battery_pct: 87, rssi: -61, junk: 1, t_bad: 999 } })
    assert.equal(r.status, 202)
    assert.equal((await call('POST', '/telemetry', { token, json: { t_c: 500 } })).status, 400)
  })
  await step('camera frame: JPEG accepted, non-JPEG and oversize rejected', async () => {
    const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2000), Buffer.from([0xff, 0xd9])])
    const ok = await call('POST', '/frame', { token, body: jpeg, type: 'image/jpeg' })
    assert.equal(ok.status, 201)
    assert.equal((await call('POST', '/frame', { token, body: Buffer.alloc(100), type: 'image/jpeg' })).status, 400)
    assert.equal((await call('POST', '/frame', { token, body: jpeg, type: 'image/png' })).status, 415)
    assert.equal((await call('POST', '/frame', { token, body: Buffer.concat([jpeg, Buffer.alloc(66 * 1024)]), type: 'image/jpeg' })).status, 413)
    const c = await call('POST', '/copy', { token, json: { frame_id: ok.body.frame_id } })
    assert.equal(c.status, 201); assert.equal(logs.at(-1).text, 'Camera frame.')
  })
  await step('COPY with nothing → 400; malformed JSON → 400', async () => {
    assert.equal((await call('POST', '/copy', { token, json: {} })).status, 400)
    assert.equal((await call('POST', '/copy', { token, body: '{bad', type: 'application/json' })).status, 400)
  })
  console.log(`\nRESULT  ${passed}/${passed} PASS — logs written: ${logs.length}`)
} catch (e) {
  console.error(`\n  FAIL  after ${passed} passing steps\n`, e)
  process.exitCode = 1
} finally {
  server.close()
}
