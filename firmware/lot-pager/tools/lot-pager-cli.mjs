#!/usr/bin/env node
// LOT PAGER — host software that connects the firmware to the LOT site (HW-01)
//
// Zero dependencies (Node >= 18). Commands:
//
//   pair       --base https://lot-systems.com --cookie "<session cookie>" [--name "Desk"]
//              → calls POST /api/devices/pair, prints the device token (shown once)
//
//   provision  --port /dev/ttyACM0 --ssid <wifi> --pass <pw> --token <lotd.…>
//              → writes WIFI / TOKEN lines to the pager over USB-CDC serial
//
//   notify     --base … --cookie … --text "Coffee time!"
//              → queues a site message for the pager (POST /api/devices/notify)
//
//   simulate   --base … --token <lotd.…> [--copy] [--t 22.5 --h 41 --bat 80]
//              → behaves exactly like one firmware wake: telemetry → frame → (copy)
//              Use this to test the server before hardware exists.
//
//   frame-size → prints the byte size of a sample frame (session-compression check)

import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const cmd = args[0]
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`)
  if (i === -1) return d
  const v = args[i + 1]
  return v === undefined || v.startsWith('--') ? true : v
}
const die = (m) => {
  console.error(`error: ${m}`)
  process.exit(1)
}
const base = String(opt('base', 'https://lot-systems.com')).replace(/\/$/, '')

async function req(method, path, { cookie, token, body } = {}) {
  const headers = { accept: 'application/json' }
  if (cookie) headers.cookie = cookie
  if (token) headers.authorization = `Bearer ${token}`
  if (body) headers['content-type'] = 'application/json'
  const r = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const text = await r.text()
  let json
  try { json = JSON.parse(text) } catch { json = text }
  return { status: r.status, json }
}

async function main() {
  switch (cmd) {
    case 'pair': {
      const cookie = opt('cookie') || die('--cookie required (copy your LOT session cookie)')
      const r = await req('POST', '/api/devices/pair', { cookie, body: { name: opt('name', 'LOT Pager') } })
      if (r.status !== 200) die(`pair failed ${r.status} ${JSON.stringify(r.json)}`)
      console.log(`device id : ${r.json.id}\ndevice    : ${r.json.name}\ntoken     : ${r.json.token}\n\n${r.json.note}`)
      break
    }
    case 'provision': {
      const port = opt('port') || die('--port required, e.g. /dev/ttyACM0 or /dev/cu.usbmodem*')
      const ssid = opt('ssid') || die('--ssid required')
      const token = opt('token') || die('--token required')
      if (!String(token).startsWith('lotd.')) die('token must start with lotd.')
      if (String(ssid).includes(' ')) die('SSID with spaces not supported by v0.1 protocol')
      try {
        execFileSync('stty', [process.platform === 'darwin' ? '-f' : '-F', port, '115200', 'raw', '-echo'])
      } catch { /* USB-CDC ignores baud; stty is best-effort */ }
      const lines = [`WIFI ${ssid} ${opt('pass', '')}`, `TOKEN ${token}`, 'INFO', 'SLEEP']
      const fd = fs.openSync(port, 'w')
      for (const l of lines) fs.writeSync(fd, l + '\n')
      fs.closeSync(fd)
      console.log(`provisioned ${port}: WIFI + TOKEN written. Press COPY on the pager within 3 s of power-on if it was asleep.`)
      break
    }
    case 'notify': {
      const cookie = opt('cookie') || die('--cookie required')
      const text = opt('text') || die('--text required')
      const r = await req('POST', '/api/devices/notify', { cookie, body: { text } })
      console.log(r.status, r.json)
      break
    }
    case 'simulate': {
      const token = opt('token') || die('--token required')
      const tel = {}
      for (const k of ['t', 'h', 'p', 'iaq', 'lux', 'bat']) if (opt(k) !== undefined) tel[k] = Number(opt(k))
      if (Object.keys(tel).length) {
        const t = await req('POST', '/api/device/v1/telemetry', { token, body: tel })
        console.log('telemetry', t.status, t.json)
      }
      const q = `?fw=sim-0.1.0${tel.bat !== undefined ? `&bat=${tel.bat}` : ''}`
      const f = await req('GET', `/api/device/v1/frame${q}`, { token })
      console.log('frame', f.status, f.json, `(${JSON.stringify(f.json).length} bytes)`)
      if (f.status === 200) {
        const m = f.json.m ?? '-'
        console.log('\n  ┌' + '─'.repeat(28) + '┐')
        console.log(`  │ LOT${(f.json.q ? '+' + f.json.q : 'NEW').padStart(24)} │`)
        for (const line of (m.match(/.{1,26}(\s|$)|.{26}/g) || ['-']).slice(0, 2)) console.log(`  │ ${line.trim().padEnd(26)} │`)
        console.log('  └' + '─'.repeat(28) + '┘\n')
      }
      if (opt('copy') && f.json?.m) {
        const c = await req('POST', '/api/device/v1/copy', { token, body: { i: f.json.i, m: f.json.m } })
        console.log('copy → Log tab', c.status, c.json)
      }
      break
    }
    case 'frame-size': {
      const sample = { v: 1, i: 'AbC123xYz0', m: 'Coffee time!', s: 'autonomous', ts: 1795435200, n: 900, q: 0 }
      console.log(JSON.stringify(sample), JSON.stringify(sample).length, 'bytes')
      break
    }
    default:
      console.log('usage: lot-pager-cli <pair|provision|notify|simulate|frame-size> [options]  (see header)')
  }
}

main().catch((e) => die(e.message))
