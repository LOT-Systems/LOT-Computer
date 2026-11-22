# LOT·01 — LOT API Connector (Device API v1)

The device talks to the LOT server over HTTPS + JSON under a new prefix, **`/device-api/v1`**. It sits *outside* `/api`, because `/api` requires a browser session cookie (`server.ts` → `onRequest` → `req.user`). Device calls carry a bearer token instead.

Reference implementation (draft, not wired in): `connector/device-api.draft.ts` and `connector/migration.draft.sql`. Simulator: `connector/lot-device-sim.mjs`.

## 1. Pairing (device-code flow, like a TV app)

```
device                         server                          user (browser, logged in)
  │ POST /pair/start ─────────► create pairing{device_code, user_code="LOT-7K2Q", exp 10 min}
  │ ◄──────── {device_code, user_code, interval:5}
  │ shows "LOT-7K2Q" on the LCD
  │                                                     Settings → Devices → enter LOT-7K2Q
  │                              POST /api/devices/claim {user_code} (session auth) ◄──┘
  │ POST /pair/poll {device_code} every 5 s
  │ ◄──────── {status:"ok", token:"ld1_…", device_id}    (token shown once; server stores sha256)
```

## 2. Endpoints

All requests after pairing send `Authorization: Bearer ld1_<token>`. Bodies are kept small (≤ 1 KB), which is the "compressed" device protocol.

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/pair/start` | `{serial, fw, hw:"lot-01-evt"}` | `{device_code, user_code, interval}` |
| POST | `/pair/poll` | `{device_code}` | `{status:"pending"}` or `{status:"ok", token, device_id}` |
| GET | `/inbox?since=<id>` | — | `{items:[{id, t, k, ts, ttl}], next_poll_s}` |
| POST | `/ack` | `{id}` | `{ok:true}` (message shown) |
| POST | `/copy` | `{id?, t, ts, env?:{c, rh, hpa, iaq}}` | `{ok:true, log_id}` |
| POST | `/telemetry` | `{bat, mv, rssi, fw, up_s}` | `{ok:true, ota?:{url, sha256, ver}}` |

Short keys: `t` text (≤ 64 chars), `k` kind (`nudge` / `reminder` / `weather` / `system`), `ts` epoch s, `ttl` s, `c` °C, `rh` %, `hpa` hPa, `iaq` BSEC index.

## 3. Copy → Log tab

`POST /copy` creates a row in the existing `logs` table, so it shows up in the Log tab with no client change:

```ts
await fastify.models.Log.create({
  userId: device.userId,
  event: 'note',                       // Log tab renders 'note' rows
  text: `${body.t}`,                   // e.g. "Coffee time!"
  metadata: { source: 'lot-01', deviceId: device.id, notificationId: body.id, env: body.env },
  context: await getLogContext(user),  // same helper the web app uses
})
```

Optional v1.1: a small "◼ LOT·01" chip in `Logs.tsx` when `metadata.source === 'lot-01'`.

## 4. Where messages come from (the AI side)

A scheduled job (next to `scheduled-jobs.ts`) runs every 15 min per paired user:
1. Build context: local time, circadian phase, weather (`/api/weather` data), recent logs, device's last `env`.
2. Ask the AI engine (`ai-engines.ts`) for **one line ≤ 64 chars or nothing**. Hard rules: at most 8 messages per day, none between 22:00 and 07:00 local time, and no repeats within 48 h.
3. Insert into `device_notifications`, then set the device's `next_poll_s` so it wakes near delivery time.

Example output: `"Coffee time!"`, `"Rain at 16:00 — take the umbrella."`, `"Log one thing you noticed today."`

## 5. Security
- Token: 32 random bytes, prefix `ld1_`, stored as sha256. The user can revoke it in Settings.
- Rate limit per device: 120 req/h. `/pair/*` is limited per IP.
- TLS 1.2+, with the server CA bundle pinned in firmware (ISRG Root X1 + backup root).
- The device never receives other users' data; inbox scope is `device.userId`.
