#!/usr/bin/env node
// LOT-DEVICE-01 host tool — talks to the LOT API connector (docs/hardware/LOT-DEVICE-01-API.md)
//
//   Device side (bearer token):
//     LOT_DEVICE_TOKEN=lotd.… node lot-device.mjs hello | inbox | ack <id…> | copy "<text>" | telemetry
//     LOT_DEVICE_TOKEN=lotd.… node lot-device.mjs simulate      # one full firmware wake cycle
//   Site side (session cookie copied from the browser):
//     LOT_COOKIE='…' node lot-device.mjs pair "Pager 001" | list | notify "Coffee time." | revoke <id>
//
//   LOT_HOST defaults to https://lot-systems.com
const HOST = process.env.LOT_HOST || 'https://lot-systems.com'
const TOKEN = process.env.LOT_DEVICE_TOKEN
const COOKIE = process.env.LOT_COOKIE
const [cmd, ...args] = process.argv.slice(2)

async function call(method, path, body, auth) {
  const headers = { ...auth }
  if (body) headers['content-type'] = 'application/json'
  const res = await fetch(HOST + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const text = await res.text()
  let json; try { json = JSON.parse(text) } catch { json = text }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${typeof json === 'string' ? json : JSON.stringify(json)}`)
  return json
}
const dev = (m, p, b) => {
  if (!TOKEN) throw new Error('Set LOT_DEVICE_TOKEN')
  return call(m, '/api/device/v1' + p, b, { authorization: 'Bearer ' + TOKEN })
}
const site = (m, p, b) => {
  if (!COOKIE) throw new Error('Set LOT_COOKIE')
  return call(m, '/api' + p, b, { cookie: COOKIE })
}

const cmds = {
  hello: () => dev('POST', '/hello', { fw: 'host-0.1.0' }),
  inbox: () => dev('GET', '/inbox'),
  ack: () => dev('POST', '/ack', { i: args }),
  copy: () => dev('POST', '/copy', { t: args.join(' ') }),
  telemetry: () => dev('POST', '/telemetry', { t: 21.0, h: 40, p: 1013, b: 3900 }),
  async simulate() {
    const inbox = await dev('GET', '/inbox')
    const last = inbox.n.at(-1)
    console.log('screen:', last ? last.t : '(no new message)')
    if (inbox.n.length) await dev('POST', '/ack', { i: inbox.n.map((x) => x.i) })
    if (last) console.log('copy →', await dev('POST', '/copy', { i: last.i, t: last.t }))
    await cmds.telemetry()
    return { sleep_s: inbox.w }
  },
  pair: () => site('POST', '/device/pair', { name: args.join(' ') || 'LOT Device' }),
  list: () => site('GET', '/device/list'),
  notify: () => site('POST', '/device/notify', { text: args.join(' ') }),
  revoke: () => site('DELETE', '/device/' + args[0]),
}

if (!cmds[cmd]) {
  console.log('Commands:', Object.keys(cmds).join(', '))
  process.exit(cmd ? 1 : 0)
}
cmds[cmd]().then((r) => r !== undefined && console.log(JSON.stringify(r, null, 2))).catch((e) => {
  console.error(e.message)
  process.exit(1)
})
