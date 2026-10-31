// Device simulator: behaves like LOT PLATE firmware against /api/device/*.
// Usage: node lot-device-sim.mjs --test   (spins up mock, runs the flow, asserts)
//        node lot-device-sim.mjs --base https://lot-systems.com --code 123456
import { createMock } from './mock-lot-api.mjs'

export async function runDevice(base, code) {
  const j = async (path, opt = {}, token) => {
    const r = await fetch(base + path, { ...opt, headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) } })
    if (!r.ok) throw new Error(`${path} -> ${r.status}`)
    return r.json()
  }
  const { token } = await j('/api/device/pair', { method: 'POST', body: JSON.stringify({ code, hwId: 'SIM-0001', fw: '0.0.1' }) })
  const { items } = await j('/api/device/notifications?since=0', {}, token)
  const shown = items[0]
  console.log(`SCREEN: ${shown.text}`)
  await j('/api/device/event', { method: 'POST', body: JSON.stringify({ type: 'copy', notificationId: shown.id, ts: Date.now() }) }, token)
  await j('/api/device/telemetry', { method: 'POST', body: JSON.stringify({ t: 21.4, h: 45, p: 1013, bat: 87 }) }, token)
  return shown
}

const arg = k => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : undefined }
if (process.argv.includes('--test')) {
  const { server, state } = createMock()
  await new Promise(r => server.listen(0, r))
  const base = `http://127.0.0.1:${server.address().port}`
  let fail = 0
  const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fail++ }
  try { await runDevice(base, '000000') ; ok(false, 'bad pair code rejected') } catch { ok(true, 'bad pair code rejected') }
  const n = await runDevice(base, '123456')
  ok(n.text === 'COFFEE TIME.', 'notification received')
  ok(state.logs.length === 1 && state.logs[0].event === 'device_copy', 'COPY produced device_copy log entry')
  ok(state.logs[0].text.includes('COFFEE TIME.'), 'log text carries notification text')
  ok(state.telemetry.length === 1, 'telemetry stored')
  server.close(); process.exit(fail ? 1 : 0)
} else if (arg('--base')) {
  await runDevice(arg('--base'), arg('--code'))
}
