# 06 · SOFTWARE — LOT API CONNECTOR

```
DOCUMENT  HW-06-SW        ISSUE 2026.11.25      CLASS INTERNAL / BUILD
CODE      hardware/connector/lot-device.mjs (reference client + mock API, selftest passing)
SERVER    PROPOSED. /api/device/* does not exist on lot-systems.com yet
```

## 01 · What exists today in this repository

| Existing piece                         | Where                                     | Use for the TILE |
|----------------------------------------|-------------------------------------------|------------------|
| `POST /api/logs` (session auth)        | `src/server/routes/api.ts` (≈ line 1563)  | Same insert the Copy button needs. Reuse `Log.create` + `getLogContext` |
| `Log` model (`id, userId, text, event, metadata, context`) | `src/server/models/log.ts` | Copy and photo entries are ordinary rows, so they appear in the Log tab |
| `LogEvent` type                        | `src/shared/types/index.ts` (≈ line 111)  | Add `'device_copy' \| 'device_photo'` |
| Weather lookups, weather-mood insights | `src/server/utils/weather`, `/api/os/insights` | TILE readings are real room data, a better input than city weather |
| Memory Engine compression              | `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | Source of the one-line "compressed" notification |

The web app authenticates with a browser session. A TILE has no browser, so it
needs its own **device token**. That is the main server addition.

## 02 · LOT Device API v1 (proposed)

All endpoints are on `https://lot-systems.com/api/device/`. Except `pair`,
every call sends `Authorization: Bearer lotdev_…`.

| Method | Path        | Body / query                                      | Returns                       |
|--------|-------------|---------------------------------------------------|-------------------------------|
| POST   | `/pair`     | `{ code, deviceId, hw, fw }`                      | `{ token, syncSec }`          |
| GET    | `/inbox`    | `?since=<cursor>&fmt=c`                           | compact inbox (§03)           |
| POST   | `/copy`     | `{ id, text, env:{t,rh,p,iaq}, at }`              | `{ logId }`: writes `logs` row, `event = device_copy` |
| POST   | `/telemetry`| session digest (§05)                              | `{ ok }`                      |
| POST   | `/photo`    | raw `image/jpeg` or `image/x-portable-graymap`, ≤ 64 KB | `{ logId }`: `event = device_photo` |
| DELETE | `/self`     | —                                                 | revokes own token             |

Site-side (session auth, for the Settings → Devices page):

| Method | Path                         | Purpose                          |
|--------|------------------------------|----------------------------------|
| POST   | `/api/devices/pair-code`     | Issue a 6-digit code, valid 10 min |
| GET    | `/api/devices`               | List the user's TILEs, battery, last seen |
| DELETE | `/api/devices/:id`           | Revoke                           |
| POST   | `/api/devices/notify`        | Send a line now, or with `fireAt` |

## 03 · Compact inbox format

```json
{ "v": 1, "c": 42, "t": 1764072000, "s": 900,
  "i": [[41, "Coffee time.", 0, 21600, 4],
        [42, "Walk outside for ten minutes, the air is good.", 1764075600, 21600, 4]] }
```

`c` cursor · `t` server time (the TILE sets its clock from it) · `s` next
sync interval · `i` items `[id, text, fireAt, ttl, flags]`. Responses are
deflated when the client sends `Accept-Encoding: deflate`. The selftest measures
134 B JSON / 121 B deflated for two notes.

## 04 · Server implementation sketch (Fastify, matches the existing code style)

New table `devices`:

```sql
CREATE TABLE devices (
  id           UUID PRIMARY KEY,
  "userId"     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "deviceId"   TEXT NOT NULL,          -- e.g. TILE-3F9A21 (from eFuse MAC)
  "tokenHash"  TEXT NOT NULL UNIQUE,   -- sha256(lotdev_...)
  fw           TEXT, hw TEXT,
  battery      SMALLINT,
  "lastSeenAt" TIMESTAMPTZ,
  "createdAt"  TIMESTAMPTZ NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL
);
CREATE TABLE device_notifications (
  id BIGSERIAL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL, "fireAt" TIMESTAMPTZ, ttl INTEGER DEFAULT 21600,
  flags SMALLINT DEFAULT 0, source TEXT,          -- 'manual' | 'scheduled' | 'memory-engine' | 'qie'
  "createdAt" TIMESTAMPTZ NOT NULL
);
```

Copy route (core of requirement 16):

```ts
// src/server/routes/device-api.ts  (proposed; register under /api/device with a deviceAuth preHandler)
fastify.post('/copy', async (req: FastifyRequest<{ Body: { id?: number; text: string; env?: Env; at?: number } }>, reply) => {
  const text = (req.body.text || '').trim().slice(0, MAX_LOG_TEXT_LENGTH)
  if (!text) return reply.throw.badParams('text required')
  const user = req.device.user
  const log = await fastify.models.Log.create({
    userId: user.id,
    text,
    event: 'device_copy',
    metadata: { source: 'tile', deviceId: req.device.deviceId, notificationId: req.body.id ?? null, env: req.body.env ?? null },
    context: await getLogContext(user),
  })
  return { logId: log.id }
})
```

`deviceAuth`: read the bearer token, `sha256`, look up `devices.tokenHash`,
attach `req.device` (with its user), update `lastSeenAt`, rate-limit to 60
requests per hour per device.

Log tab: render `device_copy` like a `note` with a small secondary line
`Copied from TILE · 21°C · 44%` (opacity-60, LOT style guide). Render
`device_photo` as a thumbnail.

## 05 · "Compress the information in each session" (requirement 8)

Compression happens at three levels:

| Level | Where | What |
|-------|-------|------|
| **Meaning** | Site, before sending | The AI (Memory Engine / QIE) folds the user's current context into **one line ≤ 64 characters**, LOT voice, no emoji, ends with a period. A deterministic guard (`compressLine()` in the connector) strips emoji and symbols and enforces the length, so a model mistake cannot reach the screen. |
| **Wire** | Every sync | Compact array format + deflate + cursor (only new items). A typical sync is 100–300 B. |
| **Session** | Every wake session on the TILE | One digest per session instead of raw readings: `{sid, w:wakes, cp:copies, b:battery%, e:{t,rh,p,iaq averages}}`. The server stores the digest and can roll digests into the user's daily weather-mood context. |

Prompt contract for the site's notification generator:

```
You write one line for a 128×128 silver screen.
Max 64 characters. Plain words. No emoji. No exclamation marks. End with a period.
Use the user's local time, weather and recent Log. Suggest one small act of self-care.
Examples: "Coffee time." · "Window open, the air is fresh." · "Stand up and stretch."
```

## 06 · Reference connector

`hardware/connector/lot-device.mjs` contains:

- `compressLine()`: the deterministic one-line guard
- `encodeInbox()` / `decodeInbox()`: wire format
- `sessionDigest()`: session compression
- `createMockServer()`: in-memory implementation of every `/api/device/*` route
- `TileClient`: what the firmware does, in JS (use it to test the real server)

```
$ node hardware/connector/lot-device.mjs selftest
PASS  pair rejects a wrong code
PASS  pair returns a device token
PASS  inbox returns only this user's 2 notifications
PASS  compression: "☕ Coffee time!" → "Coffee time."
PASS  scheduled notification carries fireAt
PASS  cursor: second sync returns nothing new
PASS  Copy creates a Log entry (event device_copy)
PASS  Log entry carries the weather snapshot
PASS  session digest compresses readings (avg t = 21.7)
PASS  Photo creates a Log entry (event device_photo)
INFO  compact inbox wire size: 134 B JSON, 121 B deflated
PASS  unknown token is rejected
```

When the server routes exist, point the client at them:

```
node hardware/connector/lot-device.mjs pair  --base https://lot-systems.com --code 123456
node hardware/connector/lot-device.mjs inbox --base https://lot-systems.com --token lotdev_…
```

## 07 · Server work list

| ID  | Task                                                             | Size |
|-----|------------------------------------------------------------------|------|
| S-1 | Migration: `devices`, `device_notifications`                     | S    |
| S-2 | `deviceAuth` preHandler + `/api/device/*` routes (port from the mock) | M |
| S-3 | `LogEvent` += `device_copy`, `device_photo`; Log tab rendering   | S    |
| S-4 | Settings → Devices page (pair code, list, revoke)               | M    |
| S-5 | Notification generator: scheduled job + Memory Engine prompt (§05) | M  |
| S-6 | Photo storage (S3 / Spaces) + thumbnail in Log                   | M    |
| S-7 | Telemetry digest → weather-mood insights                         | S    |
