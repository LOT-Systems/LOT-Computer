<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LD-01 · LOT API Connector (server ⇄ firmware)

**Document:** LD-01-DOC-05 · Rev A · 2026-11-21
**Status:** Specification + reference code. **Not wired into `src/server` yet.** Wiring it in is
roadmap step S-3, after review.

## 1. Where it fits in the codebase

The current server (`src/server/server.ts`) authenticates every request with a JWT **cookie**
(`config.jwt.cookieKey`) and a `Session` row. A device has no browser cookie, so the device API gets
its own route group with **Bearer device-token** auth. It is registered next to `/api/public`:

```ts
// src/server/server.ts  (proposed, inside the outer register block)
fastify.register(deviceApiRoutes, { prefix: '/api/device/v1' })
```

Log entries go into the existing `logs` table (`src/server/models/log.ts`: `userId`, `event`, `text`,
`metadata`, `context`), so they show up in the **Log tab** without client changes. The only addition
is a new `LogEvent` value, `'device_copy'`, in `src/shared/types`.

## 2. New tables (migration `migrations/XXXX-devices.js`)

```sql
CREATE TABLE devices (
  id             UUID PRIMARY KEY,
  "userId"       UUID REFERENCES users(id) ON DELETE CASCADE,
  serial         TEXT UNIQUE NOT NULL,          -- LD01-000123
  "tokenHash"    TEXT NOT NULL,                 -- sha256(device token)
  name           TEXT DEFAULT 'LD-01',
  "firmwareVersion" TEXT,
  "pollInterval" INT  DEFAULT 900,              -- seconds
  "lastSeenAt"   TIMESTAMPTZ,
  "createdAt"    TIMESTAMPTZ, "updatedAt" TIMESTAMPTZ
);

CREATE TABLE device_notifications (
  id          UUID PRIMARY KEY,
  "userId"    UUID REFERENCES users(id) ON DELETE CASCADE,
  text        VARCHAR(60) NOT NULL,             -- "Coffee time."
  source      TEXT DEFAULT 'ai',                -- ai | self-care | system | manual
  status      TEXT DEFAULT 'queued',            -- queued | delivered | copied | expired
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ, "updatedAt" TIMESTAMPTZ
);
```

## 3. Endpoints

All responses use the existing `reply.ok()` envelope. Requests carry
`Authorization: Bearer <deviceToken>` and `X-LOT-Device: <serial>/<fwVersion>`.

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/pair/start` | `{serial}` (no auth) | `{code:"K7Q2XM", expiresIn:600}` (shown on the device screen) |
| POST | `/pair/confirm` (user cookie auth, from the site Settings page) | `{code}` | `{deviceId}` |
| POST | `/pair/claim` | `{serial, code}` (no auth, polled by the device) | `{token}` once confirmed, sent only once |
| GET | `/inbox` | — (`If-None-Match`) | `{notifications:[{id,text,createdAt}], pollInterval}`. Returns 304 if nothing changed |
| POST | `/copy` | `{notificationId?, text, sensors:{t,rh,p,iaq}, at}` | `{logId}` |
| POST | `/capture` | `image/jpeg` ≤ 64 kB, `?notificationId=` | `{logId, caption}` |
| POST | `/telemetry` | `application/cbor` delta batch (doc 04 §4) | `{accepted:n}` |
| GET | `/firmware` | — | `{version, url, sha256}` |

## 4. Where notifications come from ("Coffee time.")

`src/server/scheduled-jobs.ts` already runs proactive AI jobs (self-care, memory, circadian phase).
Add one producer:

1. Each hour, for each user with a paired device, build the context the self-care engine already uses:
   circadian phase, weather from `weather-response`, the latest mood and log activity.
2. Ask the AI engine (`src/server/utils/ai-engines.ts`) for **one** line of ≤ 60 chars in LOT voice,
   or `NONE`. Prompt rule: periods, no emoji, no exclamation spam, and at most 6 per day.
3. Insert the line into `device_notifications` with `expiresAt = now + 3h`.

Examples: `Coffee time.` · `Water. Then one deep breath.` · `Rain at 17:00. Leave early.` ·
`You logged nothing today. One line?`

## 5. Reference implementation (TypeScript, for review)

```ts
// src/server/routes/device-api.ts  — REFERENCE, not yet registered
import { FastifyInstance, FastifyRequest } from 'fastify'
import crypto from 'node:crypto'

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

export default async function deviceApiRoutes(fastify: FastifyInstance) {
  // Bearer device-token auth for everything except pairing
  fastify.addHook('onRequest', async (req: FastifyRequest, reply) => {
    if (req.url.includes('/pair/')) return
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    const device = token
      ? await fastify.models.Device.findOne({ where: { tokenHash: sha256(token) } })
      : null
    if (!device) { reply.status(401); throw new Error('Access denied') }
    ;(req as any).device = device
    device.update({ lastSeenAt: new Date() }).catch(() => {})
  })

  fastify.get('/inbox', async (req, reply) => {
    const device = (req as any).device
    const items = await fastify.models.DeviceNotification.findAll({
      where: { userId: device.userId, status: 'queued' },
      order: [['createdAt', 'ASC']], limit: 5,
    })
    const etag = sha256(items.map((n: any) => n.id).join(','))
    if (req.headers['if-none-match'] === etag) return reply.status(304).send()
    await fastify.models.DeviceNotification.update(
      { status: 'delivered' },
      { where: { id: items.map((n: any) => n.id) } }
    )
    reply.header('ETag', etag)
    return reply.ok({
      notifications: items.map((n: any) => ({ id: n.id, text: n.text, createdAt: n.createdAt })),
      pollInterval: device.pollInterval,
    })
  })

  fastify.post('/copy', async (req: FastifyRequest<{ Body: any }>, reply) => {
    const device = (req as any).device
    const { notificationId, text, sensors, at } = req.body || {}
    const clean = String(text || '').slice(0, 280)
    const log = await fastify.models.Log.create({
      userId: device.userId,
      event: 'device_copy',
      text: clean,
      metadata: { source: 'LD-01', serial: device.serial, notificationId, sensors, at },
      context: {},
    })
    if (notificationId) {
      await fastify.models.DeviceNotification.update(
        { status: 'copied' }, { where: { id: notificationId, userId: device.userId } })
    }
    return reply.ok({ logId: log.id })
  })
}
```

## 6. Site UI changes (small)

- **Settings → Devices:** pairing-code field, device list, poll interval (2 / 15 / 60 min), unpair.
- **Log tab:** render `device_copy` entries with a `LD-01` prefix and the sensor line, in LOT style:
  `Coffee time. · LD-01 · 21° 41%`.

## 7. Privacy

- Camera frames are captioned and then **discarded** by default. Storing them is opt-in per user.
- The device sends no audio. The HM0360 has no microphone path.
- Telemetry stays with its owner. Aggregated weather data is never shared.
