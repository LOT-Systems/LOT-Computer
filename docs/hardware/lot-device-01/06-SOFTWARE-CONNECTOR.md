# LOT DEVICE-01 — LOT API Connector (server ↔ firmware)

**Doc:** HW-06-SW · **Rev:** A · **Date:** 2026-11-28
**Server:** this repo (Fastify + Sequelize + Postgres). **Status:** spec plus a working simulator (`software/device-sim.mjs`). **No server code has changed yet.**

## 1. What the server has today (verified in this repo)

- `POST /api/logs` (`src/server/routes/api.ts:1564`) creates a Log with `{text, event, metadata}` and adds `context` from `getLogContext(user)` (`src/server/utils/logs.ts:25`). Auth is the browser **session cookie**, which a device cannot use.
- `GET /api/logs` returns only events on the `displayableEvents` allow-list (`api.ts:1084`).
- `LogEvent` type: `src/shared/types/index.ts:111`. `LogContext` already has `temperature` and `humidity`.
- There is **no** push or notification system, and no device model.

## 2. New pieces to build (Phase 2 of the roadmap)

| Piece | File (proposed) |
|---|---|
| `Device` model + migration (`id, userId, serial, tokenHash, name, fwVersion, lastSeenAt, settings JSONB`) | `src/server/models/device.ts`, `migrations/…-create-devices.js` |
| `DeviceNotice` model (`id, userId, text ≤ 48, kind, priority, ttl, deliveredAt, copiedAt`) | `src/server/models/device-notice.ts` |
| Device routes | `src/server/routes/device-api.ts`, registered at prefix `/api/device` |
| Device auth hook: `Authorization: Bearer <token>`, compared to `tokenHash` (SHA-256, constant-time) | `src/server/utils/device-auth.ts` |
| Notice composer job: AI + memory engine + weather + time → ≤ 48 characters | `src/server/scheduled-jobs.ts` (new job) |
| New Log events: `device_copy`, `device_photo`, `device_session`, `device_paired` | `LogEvent` type + `displayableEvents` list |
| Settings UI: "Devices": pair, rename, unpair, quiet hours | `src/client/…` |

## 3. Endpoints

All responses are JSON. The device sends `User-Agent: LOT-DEVICE-01/<fw>`.

### Pairing (modelled on the OAuth device authorization grant, RFC 8628)

| Method / path | Auth | Body / response |
|---|---|---|
| `POST /api/public/device/code` | none (rate-limited per IP) | → `{device_code, user_code:"K7Q-4MX", interval:5, expires_in:600}` |
| *(user)* opens **lot-systems.com/device**, types `K7Q-4MX` | session cookie | Confirms "Pair this LOT device?" |
| `POST /api/public/device/token` | `device_code` | → `{status:"pending"}` … then `{token, device_id}` (the token is shown once) |

The screen shows `PAIR  K7Q-4MX  lot-systems.com/device` while it waits.

### Runtime

| Method / path | Purpose | Body / response |
|---|---|---|
| `GET /api/device/notifications?since=<cursor>` | Pager feed | → `{cursor, tz, poll:{day:120,night:900}, items:[{id,t,k,p,ts,ttl}]}`, or 304 |
| `POST /api/device/sync` | One batched upload per session (§7 of the firmware doc) | `{copies:[…], dismiss:[…], env:{…}, b:64, fw:"1.0.0"}` → `{ok:true}` |
| `POST /api/device/copy` | Immediate Copy (the same item shape as in sync) | `{id:"n_8f3c", text:"Coffee time!", ts, env:{t:21.4,rh:44,p:1012,iaq:52}}` → `{log_id}` |
| `POST /api/device/photo` | JPEG upload (`image/jpeg`, ≤ 80 KB) | → `{log_id}` |
| `POST /api/device/session` | Daily digest | → `{log_id}` |
| `GET /api/device/firmware?hw=01&cur=1.0.0` | OTA check | → 204, or `{ver, url, sha256, sig}` |

## 4. Copy → Log tab (brief item 16)

What the server does for a `copy`:

```ts
await fastify.models.Log.create({
  userId: device.userId,
  event: 'device_copy',
  text: body.text,                       // "Coffee time!"
  metadata: { deviceId: device.id, noticeId: body.id, source: 'LOT-DEVICE-01' },
  context: {
    ...(await getLogContext(user)),      // city, time zone, astro … (same as web logs)
    temperature: body.env?.t ?? null,    // the DEVICE's own reading wins
    humidity: body.env?.rh ?? null,
  },
})
```

It also sets `DeviceNotice.copiedAt`. That tells the AI composer the notice landed, so it can send more like it.

The Log tab shows: `COPIED. Coffee time! — 21 °C · 44% · from SQUARE`.

## 5. Security

- The token is 32 random bytes, base64url. Only its SHA-256 hash is stored. It is revoked when the user unpairs.
- Every route is rate-limited: notifications 1 per 30 s, copy 30 per minute, photo 10 per hour.
- Photos are stored privately per user and never shown in public profiles. EXIF is stripped on the server.
- No secrets go in this repo; the device signing key is kept offline.

## 6. Simulator (works today)

`software/device-sim.mjs` runs a **mock** of the endpoints above and a simulated device: pairing, polling, a Copy press and the daily digest. Use it to test the protocol before the hardware exists, and later as a contract test for the real routes.

```bash
node docs/hardware/lot-device-01/software/device-sim.mjs
```
