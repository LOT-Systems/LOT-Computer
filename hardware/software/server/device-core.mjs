/**
 * LOT SYSTEMS CORPORATION — LOT-01 device connector (core logic, zero deps)
 * Made in the USA | brand.lot-systems.com
 *
 * Pure protocol logic for /api/device/*. Storage and Log creation are injected,
 * so the same core runs in the test simulator (in-memory) and in the real
 * Fastify server (Sequelize models). See docs/hardware/LOT-01-06-LOT-API-CONNECTOR.md
 */
import crypto from 'node:crypto'

export const PROTOCOL_VERSION = 1
export const MAX_MESSAGE_CHARS = 64
export const MAX_FRAME_BYTES = 64 * 1024
export const DEFAULT_POLL_S = 300
export const NIGHT_POLL_S = 1800

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex')

/**
 * Compress any notification text to pager length, LOT style:
 * plain text, no emoji, single line, ends with a period.
 */
export function compressMessage(text, max = MAX_MESSAGE_CHARS) {
  let t = String(text ?? '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[‍️]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  t = t.replace(/!+$/, '.')
  if (!t) return ''
  if (t.length > max) {
    const cut = t.slice(0, max - 1)
    const sp = cut.lastIndexOf(' ')
    t = (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:\-–—\s]+$/, '') + '…'
  } else if (!/[.?…]$/.test(t)) {
    t = t + '.'
  }
  return t
}

/** Choose the next poll interval: slow at night, fast when a message is due soon. */
export function nextPollSeconds({ hourLocal, msUntilNextScheduled } = {}) {
  if (typeof msUntilNextScheduled === 'number' && msUntilNextScheduled > 0) {
    const s = Math.ceil(msUntilNextScheduled / 1000) + 5
    if (s < DEFAULT_POLL_S) return Math.max(60, s)
  }
  if (typeof hourLocal === 'number' && (hourLocal >= 23 || hourLocal < 7)) return NIGHT_POLL_S
  return DEFAULT_POLL_S
}

/**
 * @param {object} deps
 * @param {object} deps.store   persistence: see createMemoryStore() for the interface
 * @param {(entry:{userId:string,event:string,text:string,metadata:object})=>Promise<{id:string}>} deps.createLog
 * @param {() => Date} [deps.now]
 */
export function createDeviceCore({ store, createLog, now = () => new Date() }) {
  async function authenticate(authHeader) {
    const m = /^Bearer\s+([A-Za-z0-9_-]{20,})$/.exec(authHeader || '')
    if (!m) return null
    const device = await store.findDeviceByTokenHash(sha256(m[1]))
    if (!device || device.revokedAt) return null
    await store.touchDevice(device.id, now())
    return device
  }

  /** Website side: user asks for a pairing code (Settings → Devices → Add). */
  async function createPairingCode(userId) {
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
    await store.savePairingCode({ code, userId, expiresAt: new Date(now().getTime() + 10 * 60_000) })
    return { code, expiresInS: 600 }
  }

  /** Device side: exchange code for a long-lived token. Token is shown once. */
  async function pair({ code, hwId, fw }) {
    if (!/^\d{6}$/.test(String(code || '')) || !hwId) return { status: 400, body: { error: 'code and hw_id required' } }
    const pc = await store.takePairingCode(String(code))
    if (!pc || pc.expiresAt < now()) return { status: 403, body: { error: 'invalid or expired code' } }
    const token = crypto.randomBytes(32).toString('base64url')
    const device = await store.createDevice({
      id: crypto.randomUUID(), userId: pc.userId, hwId: String(hwId).slice(0, 64),
      fw: String(fw || '').slice(0, 32), tokenHash: sha256(token), createdAt: now(),
    })
    return { status: 201, body: { device_id: device.id, token, protocol: PROTOCOL_VERSION } }
  }

  /** Website side: queue a notification for every paired device of a user. */
  async function notify(userId, { text, kind = 'note', buzz = true }) {
    const t = compressMessage(text)
    if (!t) return null
    return store.enqueueMessage({ id: crypto.randomUUID(), userId, text: t, kind, buzz: !!buzz, createdAt: now() })
  }

  async function inbox(device, { since, hourLocal } = {}) {
    const msgs = await store.listMessages(device.userId, { since, deviceId: device.id, limit: 5 })
    return {
      status: 200,
      body: {
        messages: msgs.map((m) => ({ id: m.id, text: m.text, kind: m.kind, buzz: m.buzz, ts: m.createdAt.toISOString() })),
        cursor: msgs.length ? msgs[msgs.length - 1].createdAt.toISOString() : since || null,
        time: now().toISOString(),
        next_poll_s: nextPollSeconds({ hourLocal }),
      },
    }
  }

  async function ack(device, { ids }) {
    if (!Array.isArray(ids)) return { status: 400, body: { error: 'ids[] required' } }
    await store.ackMessages(device.id, ids.slice(0, 20).map(String))
    return { status: 200, body: { ok: true } }
  }

  /** COPY button → a new entry in the user's Log tab on lot-systems.com */
  async function copy(device, { message_id, text, frame_id, readings, ts } = {}) {
    let body = typeof text === 'string' ? text.trim().slice(0, 500) : ''
    if (!body && message_id) {
      const m = await store.getMessage(String(message_id))
      if (m && m.userId === device.userId) body = m.text
    }
    if (!body && !frame_id) return { status: 400, body: { error: 'text, message_id or frame_id required' } }
    const log = await createLog({
      userId: device.userId,
      event: 'device_copy',
      text: body || 'Camera frame.',
      metadata: {
        source: 'LOT-01', deviceId: device.id, messageId: message_id || null,
        frameId: frame_id || null, readings: sanitizeReadings(readings), deviceTs: ts || null,
      },
    })
    return { status: 201, body: { log_id: log.id } }
  }

  async function telemetry(device, payload = {}) {
    const r = sanitizeReadings(payload)
    if (!r) return { status: 400, body: { error: 'no readings' } }
    await store.saveTelemetry({ deviceId: device.id, userId: device.userId, at: now(), ...r })
    return { status: 202, body: { ok: true } }
  }

  async function frame(device, buf, contentType) {
    if (contentType !== 'image/jpeg') return { status: 415, body: { error: 'image/jpeg only' } }
    if (!buf?.length || buf.length > MAX_FRAME_BYTES) return { status: 413, body: { error: `1..${MAX_FRAME_BYTES} bytes` } }
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return { status: 400, body: { error: 'not a JPEG' } }
    const id = crypto.randomUUID()
    await store.saveFrame({ id, deviceId: device.id, userId: device.userId, bytes: buf, at: now() })
    return { status: 201, body: { frame_id: id } }
  }

  return { authenticate, createPairingCode, pair, notify, inbox, ack, copy, telemetry, frame }
}

const NUM_FIELDS = { t_c: [-40, 85], rh: [0, 100], p_hpa: [300, 1100], iaq: [0, 500], battery_pct: [0, 100], rssi: [-120, 0] }
export function sanitizeReadings(r) {
  if (!r || typeof r !== 'object') return null
  const out = {}
  for (const [k, [lo, hi]] of Object.entries(NUM_FIELDS)) {
    const v = Number(r[k])
    if (r[k] !== undefined && Number.isFinite(v) && v >= lo && v <= hi) out[k] = Math.round(v * 100) / 100
  }
  if (typeof r.gas_class === 'string') out.gas_class = r.gas_class.replace(/[^a-z_]/gi, '').slice(0, 24)
  return Object.keys(out).length ? out : null
}

/** In-memory store (simulator / tests). The Sequelize store implements the same methods. */
export function createMemoryStore() {
  const devices = new Map(), codes = new Map(), messages = [], acks = new Map()
  const telemetry = [], frames = new Map()
  return {
    _dump: () => ({ devices: [...devices.values()], messages, telemetry, frames: frames.size }),
    async findDeviceByTokenHash(h) { return [...devices.values()].find((d) => d.tokenHash === h) || null },
    async touchDevice(id, at) { const d = devices.get(id); if (d) d.lastSeenAt = at },
    async savePairingCode(pc) { codes.set(pc.code, pc) },
    async takePairingCode(code) { const pc = codes.get(code); codes.delete(code); return pc || null },
    async createDevice(d) { devices.set(d.id, d); return d },
    async enqueueMessage(m) { messages.push(m); return m },
    async getMessage(id) { return messages.find((m) => m.id === id) || null },
    async listMessages(userId, { since, deviceId, limit }) {
      const acked = acks.get(deviceId) || new Set()
      const s = since ? new Date(since) : null
      return messages.filter((m) => m.userId === userId && !acked.has(m.id) && (!s || m.createdAt > s)).slice(0, limit)
    },
    async ackMessages(deviceId, ids) { const s = acks.get(deviceId) || new Set(); ids.forEach((i) => s.add(i)); acks.set(deviceId, s) },
    async saveTelemetry(t) { telemetry.push(t) },
    async saveFrame(f) { frames.set(f.id, f) },
  }
}
