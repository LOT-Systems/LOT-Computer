#!/usr/bin/env node
/**
 * LOT Pager L-01 — device simulator + mock LOT device API.
 *
 * Runs the exact HTTP flow the firmware runs (see hardware/docs/07-SOFTWARE-CONNECTOR.md)
 * so the server side can be built and tested without hardware.
 *
 *   node lot-device-sim.mjs --mock                 # start mock API, run full flow, exit 0/1
 *   node lot-device-sim.mjs --base https://staging.example/api/device/v1 --code 123456
 *   node lot-device-sim.mjs --base <url> --token <deviceToken>   # skip pairing
 *
 * No dependencies. Node 18+ (global fetch).
 */
import http from 'node:http'
import crypto from 'node:crypto'

const SCREEN_MAX = 80 // chars that fit on the 128x128 memory LCD (16 cols x 5 lines)

// ───────────────────────── mock server ─────────────────────────
function startMock(port = 0) {
  const pairCodes = new Map() // code -> { userId, exp }
  const tokens = new Map() // sha256(token) -> { deviceId, userId }
  const inbox = [] // { id, text, kind, buzz, createdAt, seq }
  const logs = [] // what the Log tab would show
  const telemetry = []
  let seq = 0

  const push = (text, kind = 'nudge') =>
    inbox.push({ id: crypto.randomUUID(), text: text.slice(0, SCREEN_MAX), kind, buzz: 1, createdAt: new Date().toISOString(), seq: ++seq })

  // stand-in for the AI notifier on the real site
  push('Coffee time.')
  push('Rain at 4 pm. Take the coat.', 'weather')

  const sha = (s) => crypto.createHash('sha256').update(s).digest('hex')
  const json = (res, code, body) => {
    res.writeHead(code, { 'content-type': 'application/json' })
    res.end(body === undefined ? '' : JSON.stringify(body))
  }
  const auth = (req) => {
    const m = /^Bearer (.+)$/.exec(req.headers.authorization || '')
    return m ? tokens.get(sha(m[1])) : null
  }

  const server = http.createServer(async (req, res) => {
    let raw = ''
    for await (const c of req) raw += c
    const body = raw ? JSON.parse(raw) : {}
    const url = new URL(req.url, 'http://x')
    const p = url.pathname.replace(/^\/api\/device\/v1/, '')

    // site-side (cookie session on the real server): user asks for a pairing code
    if (req.method === 'POST' && p === '/pair/start') {
      const code = String(crypto.randomInt(0, 1e6)).padStart(6, '0')
      pairCodes.set(code, { userId: 'user-demo', exp: Date.now() + 10 * 60e3 })
      return json(res, 200, { code, expiresAt: new Date(Date.now() + 10 * 60e3).toISOString() })
    }
    if (req.method === 'POST' && p === '/pair/claim') {
      const pc = pairCodes.get(body.code)
      if (!pc || pc.exp < Date.now()) return json(res, 400, { error: 'invalid_or_expired_code' })
      pairCodes.delete(body.code)
      const token = 'lotd_' + crypto.randomBytes(24).toString('base64url')
      tokens.set(sha(token), { deviceId: body.deviceId, userId: pc.userId })
      return json(res, 200, { deviceToken: token, pollSeconds: 900 })
    }

    const dev = auth(req)
    if (!dev) return json(res, 401, { error: 'unauthorized' })

    if (req.method === 'GET' && p === '/inbox') {
      const since = Number(url.searchParams.get('since') || 0)
      const messages = inbox.filter((m) => m.seq > since).map(({ seq: _s, ...m }) => m)
      return json(res, 200, {
        cursor: seq,
        messages,
        digest: 'Calm morning. 3 logs. Air good.',
        pollSeconds: 900,
        serverTime: new Date().toISOString(),
      })
    }
    if (req.method === 'POST' && p === '/copy') {
      const text = String(body.text || '').trim().slice(0, 500)
      if (!text) return json(res, 400, { error: 'text_required' })
      const log = { id: crypto.randomUUID(), event: 'device_copy', text, metadata: { deviceId: dev.deviceId, messageId: body.messageId, source: 'L-01' } }
      logs.push(log)
      return json(res, 200, { logId: log.id })
    }
    if (req.method === 'POST' && p === '/telemetry') {
      if (!Array.isArray(body.readings)) return json(res, 400, { error: 'readings_required' })
      telemetry.push(...body.readings.slice(0, 96))
      return json(res, 204)
    }
    if (req.method === 'DELETE' && p === '/token') {
      for (const [k, v] of tokens) if (v === dev) tokens.delete(k)
      return json(res, 204)
    }
    json(res, 404, { error: 'not_found' })
  })

  return new Promise((resolve) =>
    server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port, state: { logs, telemetry, inbox } }))
  )
}

// ───────────────────────── device client ─────────────────────────
class LotDevice {
  constructor(base, token) {
    this.base = base.replace(/\/$/, '')
    this.token = token
    this.cursor = 0
    this.deviceId = 'L01-' + crypto.randomBytes(3).toString('hex').toUpperCase()
    this.screen = ''
    this.lastMessageId = null
  }
  async req(method, path, body) {
    const r = await fetch(this.base + path, {
      method,
      headers: { 'content-type': 'application/json', ...(this.token ? { authorization: 'Bearer ' + this.token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    const text = await r.text()
    if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${text}`)
    return text ? JSON.parse(text) : null
  }
  async pair(code) {
    const r = await this.req('POST', '/pair/claim', { code, deviceId: this.deviceId, hw: 'L-01', fw: '0.1.0-sim' })
    this.token = r.deviceToken
    return r
  }
  async wake() {
    const r = await this.req('GET', `/inbox?since=${this.cursor}`)
    this.cursor = r.cursor
    const latest = r.messages.at(-1)
    if (latest) {
      this.screen = latest.text
      this.lastMessageId = latest.id
      console.log(`  [buzz x${latest.buzz}] screen: "${this.screen}"`)
    } else {
      console.log(`  no new messages. digest: "${r.digest}"`)
    }
    return r
  }
  async pressCopy() {
    if (!this.screen) return null
    return this.req('POST', '/copy', { messageId: this.lastMessageId, text: this.screen, at: new Date().toISOString() })
  }
  async sendTelemetry() {
    const reading = { t: new Date().toISOString(), c: 21.4, rh: 41.2, hpa: 1012.6, iaq: 38, gasClass: 'coffee', batt: 87, rssi: -58 }
    return this.req('POST', '/telemetry', { readings: [reading] })
  }
}

// ───────────────────────── main ─────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]?.startsWith('--') ? true : all[i + 1] ?? true]] : acc), [])
)

async function run() {
  let mock
  let base = args.base
  if (args.mock) {
    mock = await startMock()
    base = `http://127.0.0.1:${mock.port}/api/device/v1`
    console.log(`mock LOT device API on ${base}`)
  }
  if (!base) {
    console.error('usage: --mock | --base <url> (--code <6 digits> | --token <token>)')
    process.exit(2)
  }
  const dev = new LotDevice(base, args.token && args.token !== true ? args.token : null)
  const checks = []
  const check = (name, ok) => (checks.push([name, ok]), console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`))

  try {
    if (!dev.token) {
      let code = args.code
      if (args.mock) code = (await (await fetch(base + '/pair/start', { method: 'POST' })).json()).code
      console.log(`1. pairing with code ${code}`)
      await dev.pair(String(code))
      check('pair → device token issued', dev.token?.startsWith('lotd_') || !args.mock)
    }
    console.log('2. wake → inbox')
    const r1 = await dev.wake()
    check('inbox returns messages + cursor', Array.isArray(r1.messages) && typeof r1.cursor === 'number')
    check('screen text fits LCD', dev.screen.length <= SCREEN_MAX)
    console.log('3. press Copy')
    const c = await dev.pressCopy()
    check('copy → Log entry created', !!c?.logId)
    if (mock) check('Log tab has device_copy', mock.state.logs.some((l) => l.event === 'device_copy' && l.text === dev.screen))
    console.log('4. telemetry')
    await dev.sendTelemetry()
    if (mock) check('telemetry stored', mock.state.telemetry.length === 1)
    console.log('5. second wake (cursor) → nothing new')
    const r2 = await dev.wake()
    check('cursor prevents repeats', r2.messages.length === 0)
    if (args.mock) {
      const bad = await fetch(base + '/inbox', { headers: { authorization: 'Bearer nope' } })
      check('bad token rejected (401)', bad.status === 401)
    }
  } catch (e) {
    console.error(e.message)
    checks.push(['exception', false])
  } finally {
    mock?.server.close()
  }
  const failed = checks.filter(([, ok]) => !ok).length
  console.log(`\n${checks.length - failed}/${checks.length} checks passed`)
  process.exit(failed ? 1 : 0)
}

run()
