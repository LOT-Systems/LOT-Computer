# LOT-DEVICE-01 · LOT API Connector

**Doc:** LOT-HW-API · Rev A · 2026-11-20
**Code:** `src/server/routes/device-api.ts` (implemented). Wired in `src/server/server.ts` and `src/server/routes/api.ts`. Rendered in `src/client/components/Logs.tsx`.
**Status:** server build green. Routes tested in-process with Fastify `inject` and a mocked model layer. **Not yet deployed or run against the production DB.**

## 1. Auth model

- Pairing is done by a signed-in user on lot-systems.com (cookie session).
- The server returns a **device token** once: `lotd.<userId>.<deviceId>.<secret>`.
- Only `sha256(secret)` is stored, in `user.metadata.devices[]`. Tokens are compared in constant time.
- The firmware sends `Authorization: Bearer <token>` on every call. Revoking a device on the site makes its token invalid immediately.
- No DB migration is needed. All state lives in the user's `metadata` JSONB: `devices`, `deviceInbox` (≤ 16), `deviceLastNudge`, `deviceTelemetry`.

## 2. Site-side endpoints (cookie session, prefix `/api`)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/device/pair` | `{ name? }` | `{ id, name, token }` (token shown once; max 4 devices) |
| GET | `/api/device/list` | — | `[{ id, name, createdAt, lastSeenAt, fw }]` |
| DELETE | `/api/device/:id` | — | `{ ok }` (revokes) |
| POST | `/api/device/notify` | `{ text }` | queued item (text clipped to 64 chars) |

Server code (AI engines, scheduled jobs) can push a notification with:

```ts
import { queueDeviceNotification } from '#server/routes/device-api'
await queueDeviceNotification(user, 'Coffee time.', 'ai')
```

## 3. Firmware endpoints (bearer token, prefix `/api/device/v1`)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/hello` | `{ fw }` | `{ ts, w, tz }`: server epoch, poll interval s, user TZ |
| GET | `/inbox` | — | `{ n: [{ i, t, s }], w }`: id, text, source `s` site · `n` autonomous nudge · `a` AI |
| POST | `/ack` | `{ i: [ids] }` | `{ ok }`: removes displayed items |
| POST | `/copy` | `{ i?, t, img? }` | `{ ok, id }`: creates a **`device_copy`** log → Log tab |
| POST | `/telemetry` | `{ t, h, p, g, iaq, b }` | `{ ok }`: °C, %RH, hPa, gas kΩ, IAQ, battery mV |

### Autonomous notifications

When the inbox is empty, `/inbox` generates **one nudge per circadian slot per local day**, using the user's `timeZone`:

| Local time | Text |
|---|---|
| 07–10 | Coffee time. |
| 12–14 | Lunch. Step away from the screen. |
| 15–17 | Water. Stretch. |
| 18–20 | Walk outside. |
| 22–01 | Wind down. |

Next step (Roadmap S3): replace the fixed table with QIE / memory-engine output (archetype, weather, self-care state) through `queueDeviceNotification(..., 'ai')`.

### Log tab

`device_copy` is in the `/api/logs` displayable list and renders as:

```
DEVICE [COPY]:
Coffee time.
Pager 001
```

## 4. Compression (item 8): one compact session per wake

- Each wake is a single TLS session with keep-alive: `inbox` → (`ack`) → (`telemetry`) → close. On ESP32-S3 the TLS handshake costs more than the payloads, so all calls are batched into one connection. TLS session tickets are reused across wakes.
- Short JSON keys (`n,i,t,s,w`) keep a typical inbox response under 120 bytes.
- Text is capped at 64 chars, which fits the screen.
- Telemetry stores only the **latest** value per device, so no log spam. Trend storage (if wanted) goes into a daily digest log.
- Future: CBOR (`application/cbor`) behind `Accept` negotiation. Not needed for the pilot.

## 5. Verified behaviour (in-process test, this session)

```
pair      → token with 4 parts, id 12-hex
bad token → 401
hello     → { ts, w: 900, tz: 'UTC' }
notify "Coffee time!" → inbox {"n":[{"i":"…","t":"Coffee time!","s":"s"}],"w":900}
ack       → queue 0
copy      → Log.create(event='device_copy', text='Coffee time!')
telemetry → stored {t:21.4,h:40,p:1012,iaq:55,b:3900}
nudges    → 08 Coffee time. · 13 Lunch… · 16 Water… · 19 Walk outside. · 23 Wind down. · 03 none
```

## 6. Open items

- Rate limiting per device (e.g. 1 request per 10 s) before production.
- Site UI: Settings → Device (pair, list, revoke, send test). Only the API exists so far.
- Photo upload for long-press (`img`): needs object storage. Phase 2.
