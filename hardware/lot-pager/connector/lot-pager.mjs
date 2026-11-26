#!/usr/bin/env node
// LOT PAGER · host connector / device simulator (Node 18+, zero dependencies)
//
// Emulates the firmware's exact HTTP contract against a LOT server so the
// server side can be tested before any hardware exists, and provisions
// firmware/include/config.h for flashing.
//
//   LOT_HOST=lot-systems.com LOT_AUTH_TOKEN=... node lot-pager.mjs notice
//   LOT_HOST=localhost:3000 LOT_AUTH_TOKEN=... node lot-pager.mjs copy "Coffee time!"
//   node lot-pager.mjs compress "a long line ..."
//   node lot-pager.mjs provision --ssid X --pass Y --token Z --id TILE40-EVT0-002
//
// LOT_AUTH_TOKEN is the auth_token cookie of a DEDICATED TEST ACCOUNT (EVT-0).

import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const NOTIFY_MAX_CHARS = 64
const host = process.env.LOT_HOST || 'lot-systems.com'
const scheme = host.startsWith('localhost') ? 'http' : 'https'
const token = process.env.LOT_AUTH_TOKEN || ''
const headers = { Cookie: `auth_token=${token}`, 'User-Agent': 'LOT-Pager-Sim/0.1.0' }

// Must stay byte-for-byte equivalent to lot::compress() in firmware/src/lot_client.cpp
export function compress(input, max = NOTIFY_MAX_CHARS) {
  let s = ''
  let space = false
  for (const ch of String(input)) {
    if (ch === '\n' || ch === '\t' || ch === ' ') { space = true; continue }
    if (ch.charCodeAt(0) >= 0x80) continue
    if (space && s.length) s += ' '
    space = false
    s += ch
  }
  if (s.length <= max) return s
  const dot = s.indexOf('. ')
  if (dot > 0 && dot < max) return s.slice(0, dot + 1)
  let cut = s.slice(0, max - 1)
  const sp = cut.lastIndexOf(' ')
  if (sp > max / 2) cut = cut.slice(0, sp)
  return cut + '.'
}

async function fetchNotice() {
  const r = await fetch(`${scheme}://${host}/api/contextual-prompts`, { headers })
  if (r.ok) {
    const { prompts = [] } = await r.json()
    const best = [...prompts].sort((a, b) => (b.priority || 0) - (a.priority || 0))[0]
    if (best) return { text: compress(best.message), source: 'prompt', priority: best.priority }
  }
  const l = await fetch(`${scheme}://${host}/api/live-message`, { headers })
  if (l.ok) {
    const { message } = await l.json()
    if (message) return { text: compress(message), source: 'live', priority: 0 }
  }
  return { text: '', source: 'none', priority: -1 }
}

async function copy(text) {
  const r = await fetch(`${scheme}://${host}/api/logs`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: compress(text || 'Copy.'),
      event: 'note',
      metadata: { source: 'lot-pager', action: 'copy', deviceId: 'SIM-0', fw: '0.1.0-sim', noticeSource: 'manual' },
    }),
  })
  return { status: r.status, body: r.ok ? await r.json() : await r.text() }
}

function provision(args) {
  const get = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined }
  const here = dirname(fileURLToPath(import.meta.url))
  const example = readFileSync(join(here, '../firmware/include/config.example.h'), 'utf8')
  const out = example
    .replace(/LOT_WIFI_SSID\s+".*?"/, `LOT_WIFI_SSID      "${get('ssid') ?? ''}"`)
    .replace(/LOT_WIFI_PASS\s+".*?"/, `LOT_WIFI_PASS      "${get('pass') ?? ''}"`)
    .replace(/LOT_AUTH_TOKEN\s+".*?"/, `LOT_AUTH_TOKEN     "${get('token') ?? ''}"`)
    .replace(/LOT_DEVICE_ID\s+".*?"/, `LOT_DEVICE_ID      "${get('id') ?? 'TILE40-EVT0-001'}"`)
    .replace(/LOT_HOST\s+".*?"/, `LOT_HOST           "${get('host') ?? 'lot-systems.com'}"`)
  const target = join(here, '../firmware/include/config.h')
  writeFileSync(target, out)
  return `Wrote ${target} (git-ignored).`
}

const [cmd, ...rest] = process.argv.slice(2)
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    if (cmd === 'notice') console.log(await fetchNotice())
    else if (cmd === 'copy') console.log(await copy(rest.join(' ')))
    else if (cmd === 'compress') console.log(JSON.stringify(compress(rest.join(' '))))
    else if (cmd === 'provision') console.log(provision(rest))
    else console.log('usage: lot-pager.mjs notice | copy <text> | compress <text> | provision --ssid --pass --token --id [--host]')
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  }
}
