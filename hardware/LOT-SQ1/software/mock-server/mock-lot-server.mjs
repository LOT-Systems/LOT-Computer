#!/usr/bin/env node
// LOT Device API v1 — dependency-free in-memory mock of lot-systems.com for SQ-1 development.
// Usage: node mock-lot-server.mjs [port]      (default 8787)
// Admin helpers (dev only):
//   POST /_mock/pairing-code          -> { code }        (what Settings → Devices would show)
//   POST /_mock/notify {text}         -> queue a pager message
//   GET  /_mock/log                   -> the user's Log tab entries
import http from 'node:http'
import crypto from 'node:crypto'

const PORT = Number(process.argv[2] || process.env.PORT || 8787)
const MAX_TEXT = 48
const USER = { id: 'u_vadik', firstName: 'Vadik' }

const state = { codes: new Map(), devices: new Map(), queue: [], log: [] }
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex')
const clamp = (s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT)

export function circadianFallback(hour) {
  if (hour >= 7 && hour < 10) return 'Coffee time!'
  if (hour >= 12 && hour < 13) return 'Water + 10 slow breaths'
  if (hour >= 15 && hour < 16) return 'Stand up. Look far away.'
  if (hour >= 21 && hour < 22) return 'Screens down. Tea?'
  return null
}
export function sensorTrigger(env) {
  if (!env) return null
  if (env.gas === 'coffee') return "Coffee's brewing. Log the ritual?"
  if (typeof env.iaq === 'number' && env.iaq > 150) return 'Open a window for 3 minutes'
  if (typeof env.h === 'number' && env.h < 25) return 'Dry air. Drink some water.'
  return null
}
export function nextSyncSeconds(hour, battery) {
  let s = hour >= 23 || hour < 7 ? 3600 : hour >= 7 && hour < 10 ? 600 : 900
  if (battery < 20) s *= 2
  return Math.max(60, Math.min(7200, s))
}

function send(res, code, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) })
  res.end(body)
}
function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
  })
}
function auth(req) {
  const h = req.headers.authorization || ''
  const t = h.startsWith('Bearer ') ? h.slice(7) : ''
  return t.startsWith('lotd_') ? state.devices.get(sha(t)) || null : null
}

export function createServer({ clockHour } = {}) {
  const hourNow = () => (typeof clockHour === 'number' ? clockHour : new Date().getHours())
  return http.createServer(async (req, res) => {
    const raw = await readBody(req)
    const isJson = (req.headers['content-type'] || '').includes('json')
    let body = {}
    if (isJson && raw.length) {
      try { body = JSON.parse(raw.toString('utf8')) } catch { return send(res, 400, { error: 'bad_json' }) }
    }
    const url = new URL(req.url, 'http://x')
    const route = `${req.method} ${url.pathname}`

    // ---- dev helpers ----
    if (route === 'POST /_mock/pairing-code') {
      const code = String(crypto.randomInt(0, 1e6)).padStart(6, '0')
      state.codes.set(code, { userId: USER.id, exp: Date.now() + 10 * 60e3 })
      return send(res, 200, { code })
    }
    if (route === 'POST /_mock/notify') {
      const n = { id: 'n_' + (state.queue.length + 1), text: clamp(body.text), buzz: body.buzz ?? 2, delivered: false }
      state.queue.push(n)
      return send(res, 200, n)
    }
    if (route === 'GET /_mock/log') return send(res, 200, state.log)

    // ---- Device API v1 ----
    if (route === 'POST /api/device/v1/pair') {
      const c = state.codes.get(String(body.code))
      if (!/^\d{6}$/.test(String(body.code)) || !c || c.exp < Date.now() || !body.serial) return send(res, 400, { error: 'invalid_code' })
      state.codes.delete(String(body.code))
      const token = 'lotd_' + crypto.randomBytes(32).toString('base64url')
      const dev = { id: crypto.randomUUID(), userId: c.userId, serial: body.serial, fw: body.fw, lastTelemetry: 0 }
      state.devices.set(sha(token), dev)
      return send(res, 200, { device_token: token, device_id: dev.id, name: USER.firstName })
    }
    if (url.pathname.startsWith('/api/device/v1/')) {
      const dev = auth(req)
      if (!dev) return send(res, 401, { error: 'unauthorized' })

      if (route === 'POST /api/device/v1/sync') {
        const hour = hourNow()
        const bat = Number(body.bat ?? 100)
        dev.battery = bat
        dev.lastSeen = new Date().toISOString()
        if (body.env && Date.now() - dev.lastTelemetry > 3600e3) {
          state.log.push({ event: 'device_telemetry', text: '', metadata: { source: 'sq1', deviceId: dev.id, env: body.env, bat } })
          dev.lastTelemetry = Date.now()
        }
        let notification = null
        const q = state.queue.find((n) => !n.delivered)
        if (q) { q.delivered = true; notification = { id: q.id, text: q.text, buzz: q.buzz } }
        if (!notification) {
          const text = sensorTrigger(body.env) || circadianFallback(hour)
          if (text) {
            const id = 'c_' + sha(dev.id + text + new Date().toISOString().slice(0, 13)).slice(0, 10)
            if (!(body.seen || []).includes(id)) notification = { id, text: clamp(text), buzz: 2 }
          }
        }
        return send(res, 200, { notification, next_sync_s: nextSyncSeconds(hour, bat), quiet: hour >= 23 || hour < 7, fw: null })
      }
      if (route === 'POST /api/device/v1/copy') {
        const text = clamp(body.text)
        if (!text) return send(res, 400, { error: 'empty_text' })
        const entry = { id: crypto.randomUUID(), event: 'device_copy', text, metadata: { source: 'sq1', deviceId: dev.id, serial: dev.serial, notificationId: body.notification_id || null, at: body.at || null } }
        state.log.push(entry)
        return send(res, 200, { ok: true, log_id: entry.id })
      }
      if (route === 'POST /api/device/v1/photo') {
        if (raw.length > 200 * 1024) return send(res, 413, { error: 'too_large' })
        if (raw[0] !== 0xff || raw[1] !== 0xd8) return send(res, 400, { error: 'not_jpeg' })
        const entry = { id: crypto.randomUUID(), event: 'device_photo', text: '', metadata: { source: 'sq1', deviceId: dev.id, bytes: raw.length, notificationId: req.headers['x-notification-id'] || null } }
        state.log.push(entry)
        return send(res, 200, { ok: true, log_id: entry.id })
      }
    }
    send(res, 404, { error: 'not_found' })
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().listen(PORT, () => console.log(`[mock-lot] Device API v1 on http://localhost:${PORT}`))
}
