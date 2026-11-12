/**
 * LOT-01 connector — minimal node:http adapter around device-core.
 * Used by the simulator; the production server uses fastify-plugin.ts instead.
 */
import http from 'node:http'

const readBody = (req, limit) => new Promise((resolve, reject) => {
  const chunks = []; let n = 0
  req.on('data', (c) => { n += c.length; if (n > limit) { reject(Object.assign(new Error('too large'), { status: 413 })); req.destroy() } else chunks.push(c) })
  req.on('end', () => resolve(Buffer.concat(chunks)))
  req.on('error', reject)
})

export function createDeviceHttpServer(core, { prefix = '/api/device' } = {}) {
  return http.createServer(async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)) }
    try {
      const url = new URL(req.url, 'http://x')
      if (!url.pathname.startsWith(prefix)) return send(404, { error: 'not found' })
      const route = `${req.method} ${url.pathname.slice(prefix.length)}`
      const ct = (req.headers['content-type'] || '').split(';')[0]
      const raw = await readBody(req, 70 * 1024)
      const json = () => (raw.length ? JSON.parse(raw.toString('utf8')) : {})

      if (route === 'POST /pair') { const r = await core.pair({ code: json().code, hwId: json().hw_id, fw: json().fw }); return send(r.status, r.body) }

      const device = await core.authenticate(req.headers.authorization)
      if (!device) return send(401, { error: 'unauthorized' })

      let r
      switch (route) {
        case 'GET /inbox': r = await core.inbox(device, { since: url.searchParams.get('since') || undefined, hourLocal: Number(url.searchParams.get('h') ?? NaN) }); break
        case 'POST /ack': r = await core.ack(device, json()); break
        case 'POST /copy': r = await core.copy(device, json()); break
        case 'POST /telemetry': r = await core.telemetry(device, json()); break
        case 'POST /frame': r = await core.frame(device, raw, ct); break
        default: return send(404, { error: 'not found' })
      }
      return send(r.status, r.body)
    } catch (e) {
      return send(e.status || (e instanceof SyntaxError ? 400 : 500), { error: e.status ? e.message : e instanceof SyntaxError ? 'bad json' : 'server error' })
    }
  })
}
