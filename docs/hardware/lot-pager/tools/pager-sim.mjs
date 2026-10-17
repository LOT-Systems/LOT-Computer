#!/usr/bin/env node
// LOT PAGER reference device. Usage:
//   LOT_BASE=https://lot-systems.com LOT_TOKEN=<device token> node pager-sim.mjs
// Prints notifications; press <Enter> to "Copy" the latest one to the Log tab.
import readline from 'node:readline'

const BASE = process.env.LOT_BASE || 'http://localhost:3000'
const TOKEN = process.env.LOT_TOKEN
if (!TOKEN) {
  console.error('LOT_TOKEN is required (pair code flow: see 06-API-CONNECTOR.md §2)')
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}
let since = ''
let latest = null

async function poll() {
  for (;;) {
    try {
      const res = await fetch(
        `${BASE}/api/device/notifications?since=${encodeURIComponent(since)}&wait=25`,
        { headers }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { items = [], next } = await res.json()
      for (const n of items) {
        latest = n
        console.log(`\n[PAGER ${n.level}] ${n.text}\n  (Enter = Copy)`)
      }
      if (next) since = next
    } catch (e) {
      console.error('poll error:', e.message)
      await new Promise((r) => setTimeout(r, 5000))
    }
  }
}

async function copy() {
  if (!latest) return console.log('nothing to copy')
  const res = await fetch(`${BASE}/api/logs`, {
    method: 'POST',
    headers: { ...headers, 'X-Idem': `${latest.id}-${Date.now()}` },
    body: JSON.stringify({
      text: latest.text,
      event: 'device.copy',
      metadata: { deviceId: 'sim', notificationId: latest.id, fw: 'sim-0.1', ts: Math.floor(Date.now() / 1000) },
    }),
  })
  console.log(res.ok ? 'Copied -> Log tab' : `Copy failed: HTTP ${res.status}`)
}

readline.createInterface({ input: process.stdin }).on('line', copy)
poll()
