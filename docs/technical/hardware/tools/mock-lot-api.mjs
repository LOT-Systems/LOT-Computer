// Mock of the PROPOSED /api/device/* contract (07-LOT-API-CONNECTOR.md). In-memory, for tests only.
import http from 'node:http'
export function createMock() {
  const state = { notifications: [{ id: 1, text: 'COFFEE TIME.', ttl: 900, priority: 1 }], logs: [], telemetry: [] }
  const TOKEN = 'dev-token-123'
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x')
    const send = (c, o) => { res.writeHead(c, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)) }
    let body = ''
    req.on('data', d => (body += d))
    req.on('end', () => {
      const json = () => { try { return JSON.parse(body || '{}') } catch { return {} } }
      if (req.method === 'POST' && url.pathname === '/api/device/pair') {
        return json().code === '123456' ? send(200, { token: TOKEN }) : send(403, { error: 'bad code' })
      }
      if (req.headers.authorization !== `Bearer ${TOKEN}`) return send(401, { error: 'unauthorized' })
      if (req.method === 'GET' && url.pathname === '/api/device/notifications') {
        const since = Number(url.searchParams.get('since') || 0)
        return send(200, { items: state.notifications.filter(n => n.id > since) })
      }
      if (req.method === 'POST' && url.pathname === '/api/device/event') {
        const b = json()
        if (b.type === 'copy') {
          const n = state.notifications.find(x => x.id === b.notificationId)
          state.logs.push({ event: 'device_copy', text: `COPY · ${n ? n.text : '?'}`, metadata: b })
        }
        return send(200, { ok: true })
      }
      if (req.method === 'POST' && url.pathname === '/api/device/telemetry') { state.telemetry.push(json()); return send(200, { ok: true }) }
      send(404, { error: 'not found' })
    })
  })
  return { server, state }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const { server } = createMock(); server.listen(8787, () => console.log('mock on :8787'))
}
