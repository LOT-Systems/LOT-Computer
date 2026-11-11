#!/usr/bin/env node
// LOT Pager simulator / companion CLI (no dependencies, Node 18+).
// Behaves exactly like firmware v0.1: poll inbox, show notice, ack, "Copy" on Enter.
//
//   LOT_HOST=https://lot-systems.com LOT_DEVICE_TOKEN=lotd_... node hardware/tools/lot-pager-sim.mjs
//   commands:  <Enter> = COPY current notice to Log tab · s = send sensor reading · q = quit
//
// Get a token: signed in on the site, POST /api/devices {"name":"Pager 001"} (returned once).
import readline from 'node:readline'

const HOST = (process.env.LOT_HOST || 'http://localhost:4400').replace(/\/$/, '')
const TOKEN = process.env.LOT_DEVICE_TOKEN
const FW = 'sim-0.1.0'
if (!TOKEN) { console.error('Set LOT_DEVICE_TOKEN'); process.exit(2) }

const H = { authorization: `Bearer ${TOKEN}`, 'x-lot-fw': FW, 'content-type': 'application/json' }
let current = null
let pollMs = 60_000

async function api(method, path, body) {
  const r = await fetch(HOST + '/api/device' + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${r.status} ${j.message || ''}`)
  return j
}

function screen(text) {
  const w = 24
  const lines = (text.match(new RegExp(`.{1,${w}}(\\s|$)`, 'g')) || [text]).map((l) => l.trim())
  console.log('┌' + '─'.repeat(w + 2) + '┐')
  for (const l of lines.slice(0, 4)) console.log('│ ' + l.padEnd(w) + ' │')
  console.log('└' + '─'.repeat(w + 2) + '┘')
}

async function poll() {
  try {
    const { notices, poll_s } = await api('GET', '/inbox')
    if (poll_s) pollMs = poll_s * 1000
    if (notices.length) {
      current = notices[0]
      process.stdout.write('\x07') // "buzz"
      screen(current.text)
      await api('POST', '/ack', { ids: notices.map((n) => n.id) })
    }
  } catch (e) { console.error('[net]', e.message) }
  setTimeout(poll, pollMs)
}

const rl = readline.createInterface({ input: process.stdin })
rl.on('line', async (line) => {
  const cmd = line.trim()
  try {
    if (cmd === 'q') process.exit(0)
    if (cmd === 's') {
      const r = await api('POST', '/event', { type: 'sensor', t_c: 21.5, rh: 45, hpa: 1012.8, battery: 0.9 })
      return console.log('[sensor]', r.stored ? 'stored' : r.reason)
    }
    if (!current) return console.log('[copy] nothing on screen')
    await api('POST', '/event', { type: 'copy', notice_id: current.id })
    console.log('[copy] sent to Log tab:', current.text)
  } catch (e) { console.error('[err]', e.message) }
})

console.log(`LOT Pager sim ${FW} → ${HOST}`)
poll()
